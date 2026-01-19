
// Deploy with: supabase functions deploy billing-create-checkout --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

// Fix for TypeScript error "Cannot find name 'Deno'"
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  }
};

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Billing Create Checkout Function Started")

serve(async (req) => {
  // 1. CORS Handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // 2. Auth Validation (JWT)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    // 3. Parse & Validate Payload
    const { tenant_id, plan_external_id } = await req.json()

    if (!tenant_id || !plan_external_id) {
      return new Response(JSON.stringify({ error: 'Missing tenant_id or plan_external_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 4. Security Check: Validate User is OWNER of the Tenant
    // Consultando a tabela de membros para garantir permissão administrativa crítica
    const { data: membership, error: memberError } = await supabaseClient
      .from('tenant_memberships')
      .select('role, tenant_id')
      .eq('user_id', user.id)
      .eq('tenant_id', tenant_id)
      .eq('role', 'OWNER') // Regra estrita: Apenas OWNER pode gerenciar faturamento
      .single()

    if (memberError || !membership) {
      return new Response(JSON.stringify({ error: 'Forbidden: You must be the OWNER of this tenant.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // 5. Security Check: Validate Active Subscription
    // Bloquear nova assinatura se já existir uma ativa ou em trial
    const { data: activeSub } = await supabaseClient
      .from('subscriptions')
      .select('status')
      .eq('tenant_id', tenant_id)
      .in('status', ['active', 'trialing'])
      .maybeSingle()

    if (activeSub) {
      return new Response(JSON.stringify({ error: 'Tenant already has an active subscription.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 409, // Conflict
      })
    }

    // 6. Fetch Tenant Details for Stripe Customer
    const { data: tenant } = await supabaseClient
      .from('tenants')
      .select('name, owner_email')
      .eq('id', tenant_id)
      .single()

    if (!tenant) {
      return new Response(JSON.stringify({ error: 'Tenant not found.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    // 7. Stripe Customer Resolution (Idempotency)
    // Como não podemos escrever o stripe_customer_id no banco agora, buscamos no Stripe
    // usando o tenant_id como chave de metadado.
    let customerId: string;
    
    const searchResult = await stripe.customers.search({
      query: `metadata['supabase_tenant_id']:'${tenant_id}'`,
    });

    if (searchResult.data.length > 0) {
      customerId = searchResult.data[0].id;
      console.log(`Customer found in Stripe: ${customerId}`);
    } else {
      // Criar novo customer se não existir
      const newCustomer = await stripe.customers.create({
        email: tenant.owner_email,
        name: tenant.name,
        metadata: {
          supabase_tenant_id: tenant_id, // Link crítico para o Webhook futuro
        },
      });
      customerId = newCustomer.id;
      console.log(`New Customer created in Stripe: ${customerId}`);
    }

    // 8. Create Checkout Session
    // URL de retorno (Frontend URL deve ser configurada nas env vars em produção)
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [
        {
          price: plan_external_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard?session_id={CHECKOUT_SESSION_ID}&status=success`,
      cancel_url: `${origin}/dashboard?status=cancelled`,
      metadata: {
        tenant_id: tenant_id, // Identificador para o Webhook processar a assinatura
        user_id: user.id
      },
      subscription_data: {
        metadata: {
            tenant_id: tenant_id // Persistir no objeto Subscription também
        }
      }
    })

    console.log(`Checkout Session created: ${session.id}`);

    // 9. Return URL (No DB Writes)
    return new Response(JSON.stringify({ checkout_url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Billing Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
