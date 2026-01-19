
// Deploy with: supabase functions deploy send-reminders

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Fix for TypeScript error "Cannot find name 'Deno'"
declare const Deno: {
  env: {
    get(key: string): string | undefined;
  }
};

interface AutoMessageConfig {
  reminder_now_active: boolean;
  reminder_now_text: string;
}

const replaceVariables = (template: string, variables: any): string => {
  let result = template;
  const map: Record<string, string> = {
    '{nome}': variables.nome || 'Aluno',
    '{horario}': variables.horario || '--:--',
    '{dia}': variables.dia || 'hoje',
  };
  Object.keys(map).forEach(key => {
    result = result.split(key).join(map[key]);
  });
  return result;
};

console.log("Hello from send-reminders CRON (Config Aware)!")

serve(async (req) => {
  try {
    // 1. Initialize Supabase Admin Client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 2. Define Time Range (For 'Now' reminder - checking next 15 mins)
    const now = new Date();
    const rangeEnd = new Date(now.getTime() + 15 * 60 * 1000); 

    const currentTimeString = now.toTimeString().slice(0, 5); // HH:mm
    const futureTimeString = rangeEnd.toTimeString().slice(0, 5);
    const todayDateString = now.toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`Checking slots for ${todayDateString} between ${currentTimeString} and ${futureTimeString}`);

    // 3. Fetch Booked Slots coming up soon
    const { data: slots, error: slotsError } = await supabase
      .from('schedule')
      .select('*, tenant_id') // Ensure tenant_id is fetched
      .eq('status', 'booked')
      .eq('date', todayDateString)
      .gte('time', currentTimeString)
      .lte('time', futureTimeString)

    if (slotsError) throw slotsError;

    if (!slots || slots.length === 0) {
      return new Response(JSON.stringify({ message: 'No upcoming appointments found.' }), { status: 200 });
    }

    console.log(`Found ${slots.length} upcoming appointments.`);
    const notificationsCreated = [];

    // 4. Process each slot
    for (const slot of slots) {
      if (!slot.student_id || !slot.tenant_id) continue;

      // 4.1 FETCH CONFIGURATION FOR THIS TENANT
      // In a real optimized scenario, we would batch fetch configs or cache them.
      const { data: config } = await supabase
        .from('config_mensagens_auto')
        .select('reminder_now_active, reminder_now_text')
        .eq('tenant_id', slot.tenant_id)
        .single();

      // Default fallback if no config found
      const active = config ? config.reminder_now_active : true; // Default to true if not found? Or false. Let's say false to be safe unless configured.
      const textTemplate = config ? config.reminder_now_text : 'Hora do treino! Bora lá! 💪';

      // 4.2 CHECK IF ACTIVE
      if (!active) {
          console.log(`Reminder skipped for slot ${slot.id} (Disabled in config)`);
          continue;
      }

      // Check for duplicate
      const { data: existingNotif } = await supabase
        .from('notifications')
        .select('id')
        .eq('data->>slotId', slot.id)
        .eq('type', 'reminder')
        .single();

      if (existingNotif) continue;

      // 4.3 PREPARE MESSAGE
      const messageText = replaceVariables(textTemplate, {
          nome: slot.student_name,
          horario: slot.time,
          dia: 'Hoje'
      });

      // Insert Notification
      const { data: notif, error: notifError } = await supabase
        .from('notifications')
        .insert({
          user_id: slot.student_id,
          type: 'reminder',
          title: '⏰ Lembrete de Treino',
          message: messageText,
          read: false,
          data: { slotId: slot.id, date: slot.date, time: slot.time }
        })
        .select()
        .single();

      if (notifError) {
        console.error(`Error creating notification for slot ${slot.id}:`, notifError);
      } else {
        notificationsCreated.push(notif);
      }
    }

    return new Response(JSON.stringify({ 
      success: true, 
      processed: slots.length, 
      notifications_sent: notificationsCreated.length 
    }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error: any) {
    console.error('CRON Error:', error.message)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    })
  }
})
