
// ... existing imports ...
import { createClient } from '@supabase/supabase-js';
import { 
  MOCK_USERS, 
  MOCK_STUDENTS, 
  MOCK_TENANTS, 
  MOCK_WORKOUTS, 
  MOCK_ASSESSMENTS, 
  MOCK_SCHEDULE, 
  MOCK_NOTIFICATIONS, 
  MOCK_WORKOUT_LOGS, 
  MOCK_PHOTOS, 
  MOCK_CONVERSATIONS, 
  MOCK_MESSAGES, 
  DEFAULT_MESSAGE_CONFIG,
  MOCK_INVOICES,
  MOCK_AUDIT_LOGS,
  MOCK_SUBSCRIPTIONS
} from './mockData';
import { 
  UserProfile, 
  Student, 
  Tenant, 
  WorkoutRoutine, 
  Assessment, 
  ScheduleSlot, 
  Notification, 
  WorkoutLog, 
  ProgressPhoto, 
  Conversation, 
  Message, 
  AutoMessageConfig, 
  UserRole,
  DashboardKPIs,
  TenantListDTO,
  InvoiceListDTO,
  AuditLogDTO
} from '../types';

// Supabase configuration (Mocked or Real)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseKey = process.env.REACT_APP_SUPABASE_ANON_KEY || 'placeholder';
export const supabase = createClient(supabaseUrl, supabaseKey);

class MockSupabaseService {
  public currentTenantId: string = 'tenant_1'; // Default context
  private delay = 600; // Simulated latency

  // --- HELPERS ---
  private async simulateDelay() {
    return new Promise(resolve => setTimeout(resolve, this.delay));
  }

  getCurrentTenant(): Tenant | undefined {
    return MOCK_TENANTS.find(t => t.id === this.currentTenantId);
  }

  // --- AUTHENTICATION ---

  async login(email: string): Promise<{ user?: UserProfile; error?: string }> {
    await this.simulateDelay();
    // Simples mock login: busca por email no MOCK_USERS
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (user) {
      this.currentTenantId = user.tenant_id;
      return { user };
    }
    
    // Fallback para login "mágico" de demonstração se não encontrar no mock
    if (email.includes('admin')) {
        return { user: MOCK_USERS.find(u => u.role === UserRole.ADMIN) };
    }
    
    return { error: 'Usuário não encontrado ou senha incorreta.' };
  }

  async register(data: any): Promise<{ user?: UserProfile; error?: string }> {
      await this.simulateDelay();
      return { 
          user: {
              id: `u_${Date.now()}`,
              full_name: data.name,
              email: data.email,
              role: data.type === 'academy' ? UserRole.ADMIN : UserRole.TRAINER,
              tenant_id: 'tenant_new',
              is_super_admin: false,
              status: 'active'
          }
      };
  }

  async resetPassword(email: string): Promise<{ success: boolean; token?: string }> {
      await this.simulateDelay();
      return { success: true, token: 'mock_reset_token_123' };
  }

  async completePasswordReset(token: string, newPass: string): Promise<{ success: boolean; error?: string }> {
      await this.simulateDelay();
      if (token === 'invalid') return { success: false, error: 'Token inválido' };
      return { success: true };
  }

  async changePassword(userId: string, current: string, newPass: string): Promise<{ success: boolean; error?: string }> {
      await this.simulateDelay();
      return { success: true };
  }

  async deleteCurrentUser(userId: string): Promise<{ success: boolean; error?: string }> {
      await this.simulateDelay();
      return { success: true };
  }

  // --- STUDENTS ---

  async getStudents(): Promise<Student[]> {
    await this.simulateDelay();
    return MOCK_STUDENTS.filter(s => s.tenant_id === this.currentTenantId && !s.deleted_at);
  }

  async getStudentDetails(studentId: string): Promise<Student | undefined> {
    await this.simulateDelay();
    return MOCK_STUDENTS.find(s => s.id === studentId);
  }

  async inviteStudent(data: Omit<Student, 'id' | 'tenant_id' | 'enrollment_status' | 'auth_user_id' | 'created_at'>): Promise<{ success: boolean; error?: string }> {
      try {
          if (supabaseUrl.includes('placeholder')) {
              // Mock behavior
              await this.simulateDelay();
              console.log(`[MOCK INVITE] Enviando convite para ${data.email}`, data);
              
              const newStudent: Student = {
                  id: `s_${Date.now()}`,
                  tenant_id: this.currentTenantId,
                  enrollment_status: 'pending_activation',
                  ...data
              };
              
              MOCK_STUDENTS.push(newStudent);
              return { success: true };
          }

          const { data: response, error } = await supabase.functions.invoke('invite-student', {
              body: { 
                  ...data,
                  tenant_id: this.currentTenantId,
                  trainer_name: this.getCurrentTenant()?.owner_name || 'Seu Personal'
              }
          });

          if (error) throw error;
          if (response?.error) throw new Error(response.error);

          return { success: true };
      } catch (err: any) {
          console.error("Invite error:", err);
          return { success: false, error: err.message };
      }
  }

  async activateAccount(token: string, password: string): Promise<{ success: boolean; error?: string; email?: string }> {
      try {
          if (supabaseUrl.includes('placeholder')) {
              // Mock behavior
              await this.simulateDelay();
              if (token === 'invalid') return { success: false, error: 'Token inválido' };
              
              // Find pending student (mock logic not implemented fully for finding by token, assume success)
              return { success: true, email: 'mock@student.com' };
          }

          const { data, error } = await supabase.functions.invoke('activate-account', {
              body: { token, password }
          });

          if (error) throw error;
          if (data?.error) throw new Error(data.error);

          return data;
      } catch (err: any) {
          return { success: false, error: err.message };
      }
  }

  async updateStudentProfile(studentId: string, data: Partial<Student>, role: UserRole): Promise<void> {
      await this.simulateDelay();
      const index = MOCK_STUDENTS.findIndex(s => s.id === studentId);
      if (index !== -1) {
          MOCK_STUDENTS[index] = { ...MOCK_STUDENTS[index], ...data };
      }
  }

  async deleteStudent(studentId: string): Promise<void> {
      await this.simulateDelay();
      const index = MOCK_STUDENTS.findIndex(s => s.id === studentId);
      if (index !== -1) {
          MOCK_STUDENTS[index].deleted_at = new Date().toISOString();
      }
  }

  async uploadProfilePhoto(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
      await this.simulateDelay();
      return { success: true, url: URL.createObjectURL(file) };
  }

  // --- WORKOUTS ---

  async getWorkouts(studentId: string): Promise<WorkoutRoutine[]> {
    await this.simulateDelay();
    return MOCK_WORKOUTS.filter(w => w.student_id === studentId && !w.deleted_at);
  }

  async getWorkoutTemplates(): Promise<WorkoutRoutine[]> {
      await this.simulateDelay();
      return MOCK_WORKOUTS.filter(w => w.tenant_id === this.currentTenantId && w.is_template && !w.deleted_at);
  }

  async saveWorkout(workout: WorkoutRoutine): Promise<void> {
      await this.simulateDelay();
      const index = MOCK_WORKOUTS.findIndex(w => w.id === workout.id);
      if (index !== -1) {
          MOCK_WORKOUTS[index] = workout;
      } else {
          MOCK_WORKOUTS.push(workout);
      }
  }

  async uploadExerciseVideo(file: File): Promise<{ success: boolean; url?: string; error?: string }> {
      await this.simulateDelay();
      return { success: true, url: URL.createObjectURL(file) };
  }

  async getWorkoutLogs(studentId: string): Promise<WorkoutLog[]> {
      await this.simulateDelay();
      return MOCK_WORKOUT_LOGS.filter(l => l.student_id === studentId && !l.deleted_at);
  }

  async saveWorkoutLog(log: Partial<WorkoutLog>): Promise<{ success: boolean; offline?: boolean }> {
      await this.simulateDelay();
      MOCK_WORKOUT_LOGS.push({
          id: `wl_${Date.now()}`,
          tenant_id: this.currentTenantId,
          ...log
      } as WorkoutLog);
      return { success: true };
  }

  // --- ASSESSMENTS ---

  async getAssessments(studentId: string): Promise<Assessment[]> {
    await this.simulateDelay();
    return MOCK_ASSESSMENTS.filter(a => a.student_id === studentId && !a.deleted_at).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async saveAssessment(assessment: Assessment): Promise<void> {
      await this.simulateDelay();
      if (!assessment.id) assessment.id = `a_${Date.now()}`;
      MOCK_ASSESSMENTS.push(assessment);
  }

  async getProgressPhotos(studentId: string): Promise<ProgressPhoto[]> {
      await this.simulateDelay();
      return MOCK_PHOTOS.filter(p => p.student_id === studentId && !p.deleted_at).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async addProgressPhoto(data: Partial<ProgressPhoto>): Promise<void> {
      await this.simulateDelay();
      MOCK_PHOTOS.push({
          id: `p_${Date.now()}`,
          tenant_id: this.currentTenantId,
          deleted_at: undefined,
          ...data
      } as ProgressPhoto);
  }

  async deleteProgressPhoto(photoId: string): Promise<void> {
      await this.simulateDelay();
      const index = MOCK_PHOTOS.findIndex(p => p.id === photoId);
      if (index !== -1) {
          MOCK_PHOTOS[index].deleted_at = new Date().toISOString();
      }
  }

  // --- SCHEDULE ---

  async getSchedule(): Promise<ScheduleSlot[]> {
      await this.simulateDelay();
      // Retorna todos para simplificar a visualização no mock
      return MOCK_SCHEDULE.filter(s => s.tenant_id === this.currentTenantId);
  }

  async createScheduleSlot(data: Partial<ScheduleSlot>): Promise<void> {
      await this.simulateDelay();
      MOCK_SCHEDULE.push({
          id: `sch_${Date.now()}`,
          tenant_id: this.currentTenantId,
          ...data
      } as ScheduleSlot);
  }

  async updateScheduleSlot(id: string, data: Partial<ScheduleSlot>): Promise<void> {
      await this.simulateDelay();
      const idx = MOCK_SCHEDULE.findIndex(s => s.id === id);
      if (idx !== -1) {
          MOCK_SCHEDULE[idx] = { ...MOCK_SCHEDULE[idx], ...data };
      }
  }

  async createScheduleSlotsBatch(slots: Partial<ScheduleSlot>[]): Promise<void> {
      await this.simulateDelay();
      slots.forEach((s, i) => {
          MOCK_SCHEDULE.push({
              id: `sch_${Date.now()}_${i}`,
              tenant_id: this.currentTenantId,
              ...s
          } as ScheduleSlot);
      });
  }

  async deleteScheduleSlot(id: string): Promise<void> {
      await this.simulateDelay();
      const idx = MOCK_SCHEDULE.findIndex(s => s.id === id);
      if (idx !== -1) {
          MOCK_SCHEDULE.splice(idx, 1);
      }
  }

  // --- MESSAGING ---

  async getConversations(userId: string, role: UserRole): Promise<Conversation[]> {
      await this.simulateDelay();
      return MOCK_CONVERSATIONS.filter(c => c.tenant_id === this.currentTenantId);
  }

  async getMessages(conversationId: string): Promise<Message[]> {
      await this.simulateDelay();
      return MOCK_MESSAGES.filter(m => m.conversation_id === conversationId).sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }

  async sendMessage(conversationId: string, senderId: string, content: string): Promise<void> {
      await this.simulateDelay();
      MOCK_MESSAGES.unshift({
          id: `m_${Date.now()}`,
          tenant_id: this.currentTenantId,
          conversation_id: conversationId,
          sender_id: senderId,
          type: 'text',
          content,
          read: false,
          created_at: new Date().toISOString()
      });
  }

  async getMessageConfig(): Promise<AutoMessageConfig> {
      await this.simulateDelay();
      return DEFAULT_MESSAGE_CONFIG;
  }

  async updateMessageConfig(config: AutoMessageConfig): Promise<void> {
      await this.simulateDelay();
      // No mock, apenas simula sucesso
  }

  async resetMessageConfig(): Promise<AutoMessageConfig> {
      await this.simulateDelay();
      return DEFAULT_MESSAGE_CONFIG;
  }

  async getNotifications(userId: string): Promise<Notification[]> {
      await this.simulateDelay();
      return MOCK_NOTIFICATIONS.filter(n => n.user_id === userId);
  }

  async markNotificationsAsRead(userId: string): Promise<void> {
      // Local update mock
      MOCK_NOTIFICATIONS.forEach(n => {
          if (n.user_id === userId) n.read = true;
      });
  }

  // --- ACADEMY MANAGEMENT ---

  async getAcademyPersonalsByTenant(): Promise<UserProfile[]> {
      await this.simulateDelay();
      return MOCK_USERS.filter(u => u.tenant_id === this.currentTenantId && u.role === UserRole.TRAINER);
  }

  async inviteAcademyPersonal(name: string, email: string): Promise<{ success: boolean; error?: string }> {
      await this.simulateDelay();
      MOCK_USERS.push({
          id: `u_${Date.now()}`,
          tenant_id: this.currentTenantId,
          role: UserRole.TRAINER,
          full_name: name,
          email: email,
          status: 'active',
          must_change_password: true
      });
      return { success: true };
  }

  async manageSubscription(): Promise<{ url: string }> {
      await this.simulateDelay();
      return { url: 'https://billing.stripe.com/p/login/test' };
  }

  // --- SUPER ADMIN ---

  async getDashboardKPIs(): Promise<DashboardKPIs> {
      await this.simulateDelay();
      return {
          mrr: 15400,
          active_subscribers: 142,
          trialing_subscribers: 15,
          total_canceled: 8,
          churn_rate_percent: 1.2,
          ltv_estimated: 850,
          total_revenue: 158000
      };
  }

  async getBackofficeTenants(type: 'academy' | 'personal'): Promise<TenantListDTO[]> {
      await this.simulateDelay();
      return MOCK_TENANTS.filter(t => t.type === type).map(t => ({
          id: t.id,
          name: t.name,
          owner_email: t.owner_email || '',
          subscription_status: t.status || 'active',
          active_students_count: Math.floor(Math.random() * 50) + 5,
          created_at: t.created_at || new Date().toISOString(),
          type: t.type,
          plan: t.plan,
          primaryColor: t.primaryColor
      }));
  }

  async getBackofficeInvoices(): Promise<InvoiceListDTO[]> {
      await this.simulateDelay();
      return MOCK_INVOICES.map(i => ({
          id: i.id,
          amount: i.amount,
          status: i.status,
          paid_at: i.date,
          tenant_name: i.tenant_name,
          method: i.method
      }));
  }

  async getBackofficeAuditLogs(): Promise<AuditLogDTO[]> {
      await this.simulateDelay();
      return MOCK_AUDIT_LOGS.map(l => ({
          id: l.id,
          action: l.action,
          target_resource: l.target_resource,
          details: l.details,
          ip_address: l.ip_address,
          created_at: l.created_at,
          actor_email: l.actor_email
      }));
  }

  async getAllGlobalStudents(): Promise<Student[]> {
      await this.simulateDelay();
      return MOCK_STUDENTS;
  }

  async adminImpersonate(tenantId: string): Promise<void> {
      await this.simulateDelay();
      this.currentTenantId = tenantId;
  }

  async adminToggleTenantStatus(tenantId: string): Promise<void> {
      await this.simulateDelay();
      const t = MOCK_TENANTS.find(t => t.id === tenantId);
      if (t) t.status = t.status === 'active' ? 'suspended' : 'active';
  }

  async adminHardDeleteStudent(studentId: string): Promise<void> {
      await this.simulateDelay();
      const idx = MOCK_STUDENTS.findIndex(s => s.id === studentId);
      if (idx !== -1) MOCK_STUDENTS.splice(idx, 1);
  }
}

export const db = new MockSupabaseService();
