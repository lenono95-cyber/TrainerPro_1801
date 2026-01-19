
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Declare Deno namespace for TS environment
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  }
};

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { token, password } = await req.json()

    // 1. Admin Client (Necessário para criar usuários Auth e atualizar tabelas restritas)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Validar Token
    const { data: tokenRecord, error: tokenError } = await supabaseAdmin
      .from('student_activation_tokens')
      .select('*, students(id, email, full_name, tenant_id)')
      .eq('token', token)
      .single()

    if (tokenError || !tokenRecord) throw new Error('Token inválido.')
    if (tokenRecord.used_at) throw new Error('Este convite já foi utilizado.')
    if (new Date(tokenRecord.expires_at) < new Date()) throw new Error('O convite expirou.')

    const student = tokenRecord.students

    // 3. Criar Usuário no Supabase Auth (Confirmado automaticamente)
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: student.email,
      password: password,
      email_confirm: true,
      user_metadata: {
        full_name: student.full_name,
        role: 'student',
        tenant_id: student.tenant_id,
        student_id_link: student.id // Link lógico no metadata
      }
    })

    if (authError) throw authError

    // 4. Atualizar Registro do Aluno e Token
    // Transação (simulada via chamadas sequenciais)
    
    // Linkar Auth ID no Student e ativar
    const { error: updateError } = await supabaseAdmin
      .from('students')
      .update({ 
        auth_user_id: authUser.user.id,
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', student.id)

    if (updateError) throw updateError

    // Marcar token como usado
    await supabaseAdmin
      .from('student_activation_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', tokenRecord.id)

    // 5. Retornar Sucesso (Frontend deve fazer login automático ou pedir login)
    return new Response(JSON.stringify({ 
      success: true, 
      email: student.email,
      message: 'Conta ativada com sucesso.' 
    }), {
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
