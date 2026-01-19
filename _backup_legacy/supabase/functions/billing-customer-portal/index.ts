
// Deploy with: supabase functions deploy billing-customer-portal --no-verify-jwt

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

// Fix for TypeScript error
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

console.log("Billing Customer Portal Function Started")

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

    // 3. Parse Payload
    const { tenant_id } = await req.json()

    if (!tenant_id) {
      return new Response(JSON.stringify({ error: 'Missing tenant_id' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      })
    }

    // 4. Security Check: Validate User is OWNER
    // Apenas donos podem acessar dados sensíveis de faturamento e cancelar planos
    const { data: membership, error: memberError } = await supabaseClient
      .from('tenant_memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('tenant_id', tenant_id)
      .eq('role', 'OWNER')
      .single()

    if (memberError || !membership) {
      return new Response(JSON.stringify({ error: 'Forbidden: Only the Tenant OWNER can manage billing.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 403,
      })
    }

    // 5. Retrieve Stripe Customer ID
    // Buscamos o Customer no Stripe usando o tenant_id como chave de metadado (padrão definido no create-checkout)
    const searchResult = await stripe.customers.search({
      query: `metadata['supabase_tenant_id']:'${tenant_id}'`,
    });

    if (searchResult.data.length === 0) {
      return new Response(JSON.stringify({ error: 'No billing account found for this tenant.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 404,
      })
    }

    const customerId = searchResult.data[0].id;

    // 6. Create Portal Session
    // Define a URL de retorno para onde o usuário será enviado após sair do portal
    // Usa a header 'origin' para suportar dev (localhost) e prod dinamicamente
    const origin = req.headers.get('origin') || 'http://localhost:5173';
    
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${origin}/dashboard`,
    });

    // 7. Return URL
    return new Response(JSON.stringify({ portal_url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Portal Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
