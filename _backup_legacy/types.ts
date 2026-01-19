
// ... existing types ...

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  TRAINER = 'trainer',
  STUDENT = 'student',
}

// ... existing Tenant, UserProfile ...

export interface Student {
  id: string;
  tenant_id: string;
  full_name: string;
  email: string; // Tornado obrigatório para o fluxo de convite
  cpf?: string;
  enrollment_status: 'active' | 'inactive' | 'suspended' | 'pending_activation'; 
  auth_user_id?: string;
  age: number;
  gender: 'M' | 'F';
  weight: number;
  height: number;
  goal: 'Hipertrofia' | 'Emagrecimento' | 'Resistência' | 'Força';
  level: 'Iniciante' | 'Intermediário' | 'Avançado';
  injuries?: string;
  last_checkin?: string;
  avatar_url?: string;
  deleted_at?: string;
}

// ... rest of the file (Exercise, WorkoutRoutine, etc) ...
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: string;
  weight: number;
  rest_seconds: number;
  rpe?: number;
  video_url?: string;
  video_type?: 'upload' | 'youtube';
  video_thumbnail?: string;
  notes?: string;
}

export interface WorkoutRoutine {
  id: string;
  tenant_id: string;
  student_id?: string;
  is_template: boolean;
  name: string;
  description?: string;
  day_of_week?: string;
  exercises: Exercise[];
  deleted_at?: string;
}

export interface Assessment {
  id: string;
  tenant_id: string;
  student_id: string;
  date: string;
  weight: number;
  height: number;
  age_at_assessment: number;
  neck_cm?: number;
  chest_cm?: number;
  waist_cm?: number;
  abdomen_cm?: number;
  hips_cm?: number;
  arm_right_cm?: number;
  arm_left_cm?: number;
  thigh_right_cm?: number;
  thigh_left_cm?: number;
  calf_cm?: number;
  skinfold_triceps?: number;
  skinfold_subscapular?: number;
  skinfold_chest?: number;
  skinfold_midaxillary?: number;
  skinfold_suprailiac?: number;
  skinfold_abdominal?: number;
  skinfold_thigh?: number;
  bmi: number;
  body_fat_percentage?: number;
  waist_hip_ratio?: number;
  lean_mass_kg?: number;
  fat_mass_kg?: number;
  photo_front_url?: string;
  photo_back_url?: string;
  photo_side_url?: string;
  notes?: string;
  deleted_at?: string;
}

export interface ScheduleSlot {
  id: string;
  tenant_id: string;
  date: string;
  time: string;
  end_time?: string;
  status: 'available' | 'booked' | 'blocked' | 'completed';
  student_id?: string;
  student_name?: string;
  type?: 'class' | 'workout' | 'assessment' | 'other';
  title?: string;
  notes?: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: 'booking' | 'cancellation' | 'reminder' | 'info' | 'message';
  title: string;
  message: string;
  read: boolean;
  created_at: string;
  data?: any;
}

export interface StudentUpdateLog {
  id: string;
  student_id: string;
  updated_by_role: UserRole;
  field: string;
  old_value: any;
  new_value: any;
  timestamp: string;
}

export interface WorkoutLog {
  id: string;
  tenant_id: string;
  student_id: string;
  workout_name: string;
  date: string;
  duration_minutes: number;
  calories_burned?: number;
  rating: 1 | 2 | 3 | 4 | 5;
  feedback?: string;
  exercises_done: {
    name: string;
    sets_done: number;
    weight_used: number;
    difficulty?: 'Easy' | 'Normal' | 'Hard';
  }[];
  synced?: boolean;
  deleted_at?: string;
}

export interface ProgressPhoto {
  id: string;
  tenant_id: string;
  student_id: string;
  date: string;
  url: string;
  weight_at_time?: number;
  notes?: string;
  deleted_at?: string;
}

export interface Conversation {
  id: string;
  tenant_id: string;
  student_id: string;
  personal_id: string;
  last_message: string;
  last_message_at: string;
  unread_count: number;
  participant_name: string;
  participant_avatar?: string;
  deleted_at?: string;
}

export interface Message {
  id: string;
  tenant_id: string;
  conversation_id: string;
  sender_id: string;
  type: 'text' | 'image';
  content: string;
  read: boolean;
  created_at: string;
  deleted_at?: string;
}

export interface AutoMessageConfig {
  id: string;
  tenant_id: string;
  reminder_24h_active: boolean;
  reminder_24h_time: string;
  reminder_24h_text: string;
  reminder_2h_active: boolean;
  reminder_2h_text: string;
  reminder_now_active: boolean;
  reminder_now_text: string;
  alert_missed_student_active: boolean;
  alert_missed_student_text: string;
  alert_missed_trainer_active: boolean;
  alert_missed_critical_active: boolean;
  alert_missed_critical_text: string;
  assessment_reminder_active: boolean;
  assessment_reminder_days: number;
  assessment_reminder_text: string;
  photo_reminder_active: boolean;
  photo_reminder_days: number;
  photo_reminder_text: string;
  motivational_workout_active: boolean;
  motivational_workout_text: string;
  motivational_streak_active: boolean;
  motivational_streak_days: number;
  motivational_streak_text: string;
  motivational_record_active: boolean;
  motivational_record_text: string;
  welcome_active: boolean;
  welcome_text: string;
}

export interface DashboardKPIs {
  mrr: number;
  active_subscribers: number;
  trialing_subscribers: number;
  total_canceled: number;
  churn_rate_percent: number;
  ltv_estimated: number;
  total_revenue: number;
}

export interface TenantListDTO {
  id: string;
  name: string;
  owner_email: string;
  subscription_status: string;
  current_period_end?: string;
  active_students_count: number;
  created_at: string;
  type?: 'academy' | 'personal';
  primaryColor?: string;
  plan?: string;
}

export interface InvoiceListDTO {
  id: string;
  amount: number;
  status: string;
  paid_at: string;
  tenant_name: string;
  method?: string;
}

export interface AuditLogDTO {
  id: string;
  action: string;
  target_resource: string;
  details?: string;
  ip_address: string;
  created_at: string;
  actor_email: string;
}

// ... existing exports ...
export interface Subscription {
  id: string;
  tenant_id: string;
  tenant_name: string;
  plan: 'starter' | 'pro' | 'enterprise';
  status: 'active' | 'past_due' | 'canceled' | 'trialing' | 'incomplete';
  price: number;
  created_at: string;
  current_period_end: string;
}

export interface Invoice {
  id: string;
  tenant_id: string;
  tenant_name: string;
  amount: number;
  status: 'paid' | 'open' | 'void' | 'uncollectible'; 
  method: 'credit_card' | 'pix' | 'boleto';
  date: string; 
  invoice_url?: string;
}

export interface AuditLog {
  id: string;
  actor_id: string;
  actor_email: string;
  action: string;
  target_resource: string;
  details?: string;
  ip_address: string;
  created_at: string;
}

export interface Plan {
  id: string;
  name: string;
  slug: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: string[];
  active: boolean;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  type?: 'academy' | 'personal';
  primaryColor: string;
  logoUrl: string;
  appName?: string;
  status?: 'active' | 'suspended';
  plan?: 'starter' | 'pro' | 'enterprise';
  owner_name?: string;
  owner_email?: string;
  created_at?: string;
}

export interface UserProfile {
  id: string;
  tenant_id: string;
  role: UserRole;
  is_super_admin?: boolean;
  full_name: string;
  email: string;
  avatar_url?: string;
  status?: 'active' | 'suspended';
  last_login?: string;
  student_id_link?: string;
  must_change_password?: boolean;
  is_temporary_password?: boolean;
  password_changed_at?: string;
  password_reset_token?: string;
  password_reset_expires?: string;
}
