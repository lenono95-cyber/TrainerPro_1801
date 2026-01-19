
// Deploy with: supabase functions deploy admin-read-only --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import * as postgres from 'https://deno.land/x/postgres@v0.17.0/mod.ts'

// Type definition for Deno environment
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  }
};

const databaseUrl = Deno.env.get('SUPABASE_DB_URL')!
// Connection pool for efficiency
const pool = new postgres.Pool(databaseUrl, 3, true)

console.log("Admin Read-Only Service Started")

serve(async (req) => {
  // 1. CORS Headers
  if (req.method === 'OPTIONS') {
    return new Response('ok', {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
      },
    })
  }

  try {
    // 2. Authentication & Authorization (Application Level)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    // 3. Database Security Check (is_super_admin flag)
    const connection = await pool.connect()
    try {
      const result = await connection.queryObject`
        SELECT is_super_admin FROM users WHERE id = ${user.id}
      `
      const userRecord = result.rows[0] as { is_super_admin: boolean } | undefined

      if (!userRecord || !userRecord.is_super_admin) {
        return new Response(JSON.stringify({ error: 'Forbidden: Super Admin access required' }), { status: 403 })
      }

      // 4. Request Routing
      const requestData = await req.json().catch(() => ({}))
      const route = requestData.route || 'dashboard'
      let responseData: any = {}

      // --- ENDPOINT: DASHBOARD KPIS ---
      if (route === 'dashboard') {
        const query = `
          WITH subscription_metrics AS (
            SELECT
              COALESCE(SUM(p.price_cents) FILTER (WHERE s.status = 'active'), 0) AS mrr_cents,
              COUNT(DISTINCT s.tenant_id) FILTER (WHERE s.status = 'active') AS active_subscribers,
              COUNT(DISTINCT s.tenant_id) FILTER (WHERE s.status = 'trialing') AS trialing_subscribers,
              COUNT(DISTINCT s.tenant_id) FILTER (WHERE s.status = 'canceled') AS total_canceled
            FROM subscriptions s
            JOIN plans p ON p.id = s.plan_id
          ),
          invoice_metrics AS (
            SELECT
              COALESCE(SUM(amount_paid_cents), 0) AS total_revenue_cents
            FROM invoices
            WHERE status = 'paid'
          )
          SELECT
            mrr_cents / 100.0 AS mrr,
            active_subscribers,
            trialing_subscribers,
            total_canceled,
            CASE
              WHEN (active_subscribers + total_canceled) > 0
              THEN ROUND(
                (total_canceled::numeric / (active_subscribers + total_canceled)) * 100,
                2
              )
              ELSE 0
            END AS churn_rate_percent,
            CASE
              WHEN (active_subscribers + total_canceled) > 0
              THEN ROUND(
                (total_revenue_cents::numeric / (active_subscribers + total_canceled)) / 100.0,
                2
              )
              ELSE 0
            END AS ltv_estimated,
            total_revenue_cents / 100.0 AS total_revenue
          FROM subscription_metrics, invoice_metrics;
        `
        const dbResult = await connection.queryObject(query)
        responseData = dbResult.rows[0] || {
            mrr: 0, active_subscribers: 0, trialing_subscribers: 0, 
            total_canceled: 0, churn_rate_percent: 0, ltv_estimated: 0, total_revenue: 0
        }
      }

      // --- ENDPOINT: TENANTS LIST ---
      else if (route === 'tenants') {
        const type = (requestData.type === 'academy' ? 'ACADEMY' : 'PERSONAL')
        const limit = requestData.limit || 50
        const offset = requestData.offset || 0

        const query = `
          SELECT
            t.id,
            t.name,
            u.email AS owner_email,
            s.status AS subscription_status,
            s.current_period_end,
            (
              SELECT COUNT(*)
              FROM students st
              WHERE st.tenant_id = t.id
                AND st.deleted_at IS NULL
            ) AS active_students_count,
            t.created_at,
            t.type,
            t.plan
          FROM tenants t
          JOIN tenant_memberships tm
            ON tm.tenant_id = t.id
            AND tm.role = 'OWNER'
          JOIN users u
            ON u.id = tm.user_id
          LEFT JOIN subscriptions s
            ON s.tenant_id = t.id
          WHERE t.type = $1
          ORDER BY t.created_at DESC
          LIMIT $2 OFFSET $3;
        `
        const dbResult = await connection.queryObject(query, [type, limit, offset])
        
        // Map to UI DTO
        responseData = dbResult.rows.map((row: any) => ({
            ...row,
            primaryColor: row.type === 'PERSONAL' ? '#3b82f6' : '#ef4444',
            owner_email: row.owner_email || 'N/A'
        }))
      }

      // --- ENDPOINT: FINANCE INVOICES ---
      else if (route === 'invoices') {
        const limit = requestData.limit || 50
        const offset = requestData.offset || 0

        const query = `
          SELECT
            i.id,
            i.amount_paid_cents / 100.0 AS amount,
            i.status,
            i.paid_at,
            t.name AS tenant_name,
            i.method
          FROM invoices i
          JOIN tenants t ON t.id = i.tenant_id
          ORDER BY i.paid_at DESC
          LIMIT $1 OFFSET $2;
        `
        const dbResult = await connection.queryObject(query, [limit, offset])
        responseData = dbResult.rows
      }

      // --- ENDPOINT: AUDIT LOGS ---
      else if (route === 'audit') {
        const limit = 50
        const query = `
          SELECT
            a.id,
            a.action,
            a.target_resource,
            a.details,
            a.ip_address,
            a.created_at,
            u.email AS actor_email
          FROM audit_logs a
          LEFT JOIN users u ON u.id = a.actor_id
          ORDER BY a.created_at DESC
          LIMIT $1;
        `
        const dbResult = await connection.queryObject(query, [limit])
        responseData = dbResult.rows
      }

      return new Response(JSON.stringify(responseData), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      })

    } finally {
      connection.release()
    }

  } catch (error: any) {
    console.error('Admin API Error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
    