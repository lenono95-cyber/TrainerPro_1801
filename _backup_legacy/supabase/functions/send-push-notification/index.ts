
// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
//
// Deploy with: supabase functions deploy send-push-notification

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Fix for TypeScript error "Cannot find name 'Deno'"
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  }
};

interface NotificationPayload {
  record: {
    user_id: string;
    title: string;
    message: string;
    data?: any;
  }
}

console.log("Hello from send-push-notification!")

serve(async (req) => {
  // CORS headers for local testing
  if (req.method === 'OPTIONS') {
    return new Response('ok', { 
      headers: { 
        'Access-Control-Allow-Origin': '*', 
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type' 
      } 
    })
  }

  try {
    // 1. Initialize Supabase Admin Client
    // SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are automatically injected by Supabase
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Parse the Webhook Payload
    const { record }: NotificationPayload = await req.json()

    if (!record || !record.user_id) {
      throw new Error('Invalid payload: missing record or user_id')
    }

    console.log(`Processing notification for user: ${record.user_id}`)

    // 3. Fetch User's Expo Push Token
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('push_token')
      .eq('id', record.user_id)
      .single()

    if (userError) {
      console.error('Error fetching user:', userError)
      return new Response(JSON.stringify({ error: 'User not found' }), { status: 404 })
    }

    if (!user?.push_token) {
      console.log('User has no push token registered.')
      return new Response(JSON.stringify({ message: 'No push token for user' }), { status: 200 })
    }

    // 4. Validate Expo Token
    if (!user.push_token.startsWith('ExponentPushToken[') && !user.push_token.startsWith('ExpoPushToken[')) {
        console.log('Invalid Expo Token format')
        return new Response(JSON.stringify({ message: 'Invalid token format' }), { status: 400 })
    }

    // 5. Send to Expo Push API
    const message = {
      to: user.push_token,
      sound: 'default',
      title: record.title,
      body: record.message,
      data: record.data,
      badge: 1, // Optional: Increment app badge
    }

    const expoResponse = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message),
    })

    const expoResult = await expoResponse.json()
    console.log('Expo Response:', expoResult)

    return new Response(JSON.stringify(expoResult), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('Function Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
