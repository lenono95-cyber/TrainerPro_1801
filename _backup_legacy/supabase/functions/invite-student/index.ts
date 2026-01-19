
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

declare const Deno: {
  env: {
    get(key: string): string | undefined;
  }
};

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const APP_URL = Deno.env.get('APP_BASE_URL') || 'http://localhost:5173'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    // 1. Auth Check (Apenas Trainers/Admins)
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    )
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) throw new Error('Unauthorized')

    // 2. Parse Full Payload
    const { 
        full_name, email, cpf, age, gender, weight, height, goal, level, 
        tenant_id, trainer_name 
    } = await req.json()

    // 3. Admin Client
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Check existing (pelo email neste tenant)
    const { data: existing } = await supabaseAdmin
      .from('students')
      .select('id, enrollment_status')
      .eq('email', email)
      .eq('tenant_id', tenant_id)
      .maybeSingle()

    if (existing && existing.enrollment_status === 'active') {
      return new Response(JSON.stringify({ error: 'Aluno já possui conta ativa neste tenant.' }), { status: 409, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    let studentId = existing?.id

    // 5. Create/Update Student Record
    const studentData = {
        tenant_id,
        full_name,
        email,
        cpf,
        age: Number(age),
        gender,
        weight: Number(weight),
        height: Number(height),
        goal,
        level,
        enrollment_status: 'pending_activation'
    };

    if (!studentId) {
        const { data: newStudent, error: createError } = await supabaseAdmin
            .from('students')
            .insert(studentData)
            .select()
            .single()
        
        if (createError) throw createError
        studentId = newStudent.id
    } else {
        // Atualiza dados se já existia pendente
        await supabaseAdmin.from('students').update(studentData).eq('id', studentId);
    }

    // 6. Generate Token
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
    const { data: tokenData, error: tokenError } = await supabaseAdmin
      .from('student_activation_tokens')
      .insert({
        student_id: studentId,
        expires_at: expiresAt
      })
      .select('token')
      .single()

    if (tokenError) throw tokenError

    // 7. Send Email
    const activationLink = `${APP_URL}/activate?token=${tokenData.token}`
    
    const emailHtml = `
      <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
        <div style="background-color: #ef4444; padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Bem-vindo ao TrainerPro</h1>
        </div>
        <div style="padding: 30px;">
            <p style="font-size: 16px;">Olá, <strong>${full_name}</strong>!</p>
            <p style="font-size: 16px;">Seu personal <strong>${trainer_name}</strong> criou seu plano de treinos.</p>
            <p style="font-size: 16px;">Para acessar o app e ver seus treinos, clique no botão abaixo para criar sua senha:</p>
            
            <div style="text-align: center; margin: 40px 0;">
            <a href="${activationLink}" style="background-color: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px; display: inline-block;">
                Ativar Minha Conta
            </a>
            </div>
            
            <p style="font-size: 14px; color: #666;">Se o botão não funcionar, copie este link:<br/>
            <a href="${activationLink}" style="color: #ef4444;">${activationLink}</a></p>
        </div>
        <div style="background-color: #f9fafb; padding: 15px; text-align: center; font-size: 12px; color: #9ca3af;">
            Este convite expira em 24 horas.
        </div>
      </div>
    `

    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'TrainerPro <noreply@seuapp.com>',
        to: email,
        subject: 'Convite para Treinar - Ative sua conta',
        html: emailHtml
      })
    })

    if (!res.ok) {
        console.error('Resend Error:', await res.json())
        throw new Error('Falha ao enviar e-mail')
    }

    return new Response(JSON.stringify({ success: true, message: 'Convite enviado' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
