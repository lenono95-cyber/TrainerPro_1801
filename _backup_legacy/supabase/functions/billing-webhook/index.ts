
// Deploy with: supabase functions deploy billing-webhook --no-verify-jwt

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

const endpointSecret = Deno.env.get('STRIPE_WEBHOOK_SIGNING_SECRET') as string;

// Initialize Supabase Admin Client (SERVICE_ROLE is required for billing writes)
// NEVER expose this client to the frontend.
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

console.log("Billing Webhook Function Started")

serve(async (req) => {
  // 1. Signature Verification
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('No signature provided', { status: 400 });
  }

  let event;
  try {
    const body = await req.arrayBuffer();
    // Verify that the event is actually from Stripe
    event = stripe.webhooks.constructEvent(
      new Uint8Array(body),
      signature,
      endpointSecret
    );
  } catch (err: any) {
    console.error(`⚠️  Webhook signature verification failed.`, err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 2. Event Handling
  try {
    console.log(`Processing event: ${event.type}`);

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      
      case 'invoice.payment_succeeded':
        await handleInvoiceSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handleInvoiceFailed(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (err: any) {
    console.error(`Processing Error: ${err.message}`);
    // Return 500 so Stripe retries later (unless it's a logic error we caught)
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
})

// --- HANDLERS ---

async function handleCheckoutCompleted(session: any) {
  // Metadata was injected in billing-create-checkout
  const tenantId = session.metadata?.tenant_id;
  
  if (!tenantId) {
    throw new Error('Tenant ID missing in session metadata');
  }

  const subscriptionId = session.subscription;
  
  // Fetch full subscription details to get dates and plan
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);
  const priceId = subscription.items.data[0].price.id;
  
  // Map Stripe Price ID to Internal Plan Enum
  // In a real app, you might query a 'plans' table. Here we infer or map.
  const planName = mapPriceToPlan(priceId, session.amount_total);

  // 1. Update Subscription in DB
  const { error: subError } = await supabase
    .from('subscriptions')
    .upsert({
      id: subscription.id, // Use Stripe ID as PK or map it
      tenant_id: tenantId,
      status: subscription.status, // active, trialing
      plan: planName,
      price: subscription.items.data[0].price.unit_amount! / 100,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      created_at: new Date(subscription.created * 1000).toISOString()
    }, { onConflict: 'tenant_id' }); // Ensure 1 sub per tenant

  if (subError) throw subError;

  // 2. Update Tenant Status
  await supabase
    .from('tenants')
    .update({ 
        status: 'active', 
        plan: planName 
    })
    .eq('id', tenantId);

  // 3. Log Audit
  await createAuditLog(
    'system', 
    'subscription_created', 
    `Tenant ${tenantId}`, 
    `Assinatura criada via Checkout. Plan: ${planName}`
  );
}

async function handleInvoiceSucceeded(invoice: any) {
  if (!invoice.subscription) return;

  // 1. Sync Subscription Status (Renewals)
  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  
  // Ideally, tenant_id is in subscription metadata. 
  // If not, we query our DB to find the tenant associated with this stripe_sub_id
  let tenantId = subscription.metadata.tenant_id;

  if (!tenantId) {
      // Fallback: Find tenant by subscription ID in our DB
      const { data: localSub } = await supabase
        .from('subscriptions')
        .select('tenant_id')
        .eq('id', subscription.id)
        .single();
      
      if (localSub) tenantId = localSub.tenant_id;
  }

  if (tenantId) {
      // Update DB Subscription
      await supabase
        .from('subscriptions')
        .update({
            status: subscription.status,
            current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
        })
        .eq('tenant_id', tenantId);

      // Create Invoice Record
      await supabase
        .from('invoices')
        .insert({
            id: invoice.id,
            tenant_id: tenantId,
            amount: invoice.amount_paid / 100,
            status: 'paid',
            method: 'credit_card', // Simplification
            date: new Date(invoice.created * 1000).toISOString(),
            invoice_url: invoice.hosted_invoice_url
        });
        
      await createAuditLog('system', 'invoice_paid', `Tenant ${tenantId}`, `Invoice ${invoice.id} pago.`);
  }
}

async function handleInvoiceFailed(invoice: any) {
  if (!invoice.subscription) return;

  const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
  let tenantId = subscription.metadata.tenant_id;

  if (!tenantId) {
      const { data: localSub } = await supabase.from('subscriptions').select('tenant_id').eq('id', subscription.id).single();
      if (localSub) tenantId = localSub.tenant_id;
  }

  if (tenantId) {
      // Update Subscription to Past Due (if Stripe hasn't canceled it yet)
      await supabase
        .from('subscriptions')
        .update({ status: 'past_due' })
        .eq('tenant_id', tenantId);

      // Log Failed Invoice
      await supabase
        .from('invoices')
        .insert({
            id: invoice.id,
            tenant_id: tenantId,
            amount: invoice.amount_due / 100,
            status: 'uncollectible', // or open/void
            method: 'credit_card',
            date: new Date(invoice.created * 1000).toISOString()
        });

      await createAuditLog('system', 'payment_failed', `Tenant ${tenantId}`, `Falha no pagamento do invoice ${invoice.id}`);
  }
}

async function handleSubscriptionDeleted(subscription: any) {
  let tenantId = subscription.metadata.tenant_id;

  if (!tenantId) {
      const { data: localSub } = await supabase.from('subscriptions').select('tenant_id').eq('id', subscription.id).single();
      if (localSub) tenantId = localSub.tenant_id;
  }

  if (tenantId) {
      // Mark as Canceled
      await supabase
        .from('subscriptions')
        .update({ status: 'canceled' })
        .eq('tenant_id', tenantId);

      // Optionally suspend tenant access
      await supabase
        .from('tenants')
        .update({ status: 'suspended' })
        .eq('id', tenantId);

      await createAuditLog('system', 'subscription_canceled', `Tenant ${tenantId}`, 'Assinatura cancelada no Stripe.');
  }
}

// --- UTILS ---

async function createAuditLog(actorId: string, action: string, target: string, details: string) {
    await supabase.from('audit_logs').insert({
        actor_id: actorId, // 'system' in this context
        actor_email: 'billing-webhook@system',
        action: action,
        target_resource: target,
        details: details,
        ip_address: '0.0.0.0'
    });
}

function mapPriceToPlan(priceId: string, amount: number): 'starter' | 'pro' | 'enterprise' {
    // In a real scenario, compare priceId with env vars or DB
    // Simple heuristic based on amount (cents)
    if (amount >= 49900) return 'enterprise';
    if (amount >= 19900) return 'pro';
    return 'starter';
}
