
import React, { useState, useEffect } from 'react';
import { UserProfile, Student, Conversation, UserRole } from './types';
import { Layout } from './components/Layout';
import { LoginScreen } from './components/LoginScreen';
import { StudentsView } from './components/StudentsView';
import { StudentDetail } from './components/StudentDetail';
import { TrainerTrackingView } from './components/TrainerTrackingView';
import { ChatListScreen } from './components/ChatListScreen';
import { ChatScreen } from './components/ChatScreen';
import { WorkoutTemplatesView } from './components/WorkoutTemplatesView';
import { ScheduleView } from './components/ScheduleView';
import { StudentDashboard } from './components/StudentDashboard';
import { StudentProfile } from './components/StudentProfile';
import { StudentWorkoutView } from './components/StudentWorkoutView';
import { StudentEvolution } from './components/StudentEvolution';
import { ConfigMensagensScreen } from './components/ConfigMensagensScreen';
import { AcademyPersonalsManagementScreen } from './components/AcademyPersonalsManagementScreen';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { ActivationScreen } from './components/ActivationScreen';
import { Users, LayoutDashboard, MessageSquare, Dumbbell, Calendar, Settings, LogOut, Shield, User, CreditCard, Loader2, Trash2 } from 'lucide-react';
import { db } from './services/supabaseService';

export const App = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('students');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isConfiguringMessages, setIsConfiguringMessages] = useState(false);
  const [isManagingTeam, setIsManagingTeam] = useState(false);
  
  // Billing Portal State
  const [isBillingLoading, setIsBillingLoading] = useState(false);
  
  // Account Deletion State (Trainer)
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Activation Token Logic
  const [activationToken, setActivationToken] = useState<string | null>(null);

  useEffect(() => {
     // Check for token in URL parameters on load
     const params = new URLSearchParams(window.location.search);
     const token = params.get('token');
     if (token) {
         setActivationToken(token);
         // Clean URL
         window.history.replaceState({}, document.title, window.location.pathname);
     }

     if (user) {
         if (user.role === UserRole.SUPER_ADMIN) {
             // Super Admin não usa layout padrão com abas
         } else if (user.role === UserRole.STUDENT) {
             setActiveTab('home');
         } else {
             setActiveTab('students');
         }
     }
  }, [user]);

  const handleLogout = () => {
      setUser(null);
      setSelectedStudent(null);
      setActiveConversation(null);
      setIsConfiguringMessages(false);
      setIsManagingTeam(false);
  };

  const handleManageBilling = async () => {
      setIsBillingLoading(true);
      const result = await db.manageSubscription();
      setIsBillingLoading(false);
      
      if (result?.url) {
          window.location.href = result.url;
      }
  };

  const handleDeleteAccount = async () => {
      if(!user) return;
      if (!confirm("⚠️ ATENÇÃO: Esta ação é irreversível.\n\nSua conta, seus alunos e todos os dados serão apagados permanentemente. Se você tiver uma assinatura ativa, ela deve ser cancelada antes no portal.\n\nDeseja continuar?")) return;
      
      setIsDeletingAccount(true);
      const result = await db.deleteCurrentUser(user.id);
      
      if (result.success) {
          alert("Conta excluída com sucesso.");
          handleLogout();
      } else {
          alert("Erro ao excluir: " + (result.error || "Tente novamente."));
          setIsDeletingAccount(false);
      }
  };

  // --- RENDER ACTIVATION SCREEN IF TOKEN EXISTS ---
  if (activationToken) {
      return (
          <ActivationScreen 
            token={activationToken} 
            onSuccess={() => setActivationToken(null)} 
          />
      );
  }

  if (!user) {
    return <LoginScreen onLoginSuccess={setUser} />;
  }

  // --- SUPER ADMIN VIEW ---
  if (user.role === UserRole.SUPER_ADMIN) {
      return <SuperAdminDashboard user={user} onLogout={handleLogout} />;
  }

  // Determine Primary Color based on Tenant (or fallback)
  const currentTenant = db.getCurrentTenant();
  const safePrimaryColor = currentTenant?.primaryColor || '#ef4444';

  // --- TRAINER VIEWS ---
  if (user.role === UserRole.TRAINER || user.role === UserRole.ADMIN) {
      
      // Full Screen Overlays (No Layout)
      if (activeConversation) {
          return (
              <ChatScreen 
                user={user}
                conversation={activeConversation}
                primaryColor={safePrimaryColor}
                onBack={() => setActiveConversation(null)}
              />
          );
      }

      if (selectedStudent) {
          return (
              <StudentDetail 
                student={selectedStudent} 
                primaryColor={safePrimaryColor} 
                onBack={() => setSelectedStudent(null)} 
              />
          );
      }

      if (isConfiguringMessages) {
          return (
              <ConfigMensagensScreen 
                primaryColor={safePrimaryColor}
                onBack={() => setIsConfiguringMessages(false)}
              />
          );
      }

      if (isManagingTeam) {
          return (
              <AcademyPersonalsManagementScreen
                primaryColor={safePrimaryColor}
                onBack={() => setIsManagingTeam(false)}
              />
          );
      }

      // Main Menu Items
      const menuItems = [
          { id: 'students', label: 'Alunos', icon: Users },
          { id: 'tracking', label: 'Tracking', icon: LayoutDashboard },
          { id: 'chat', label: 'Chat', icon: MessageSquare },
          { id: 'workouts', label: 'Treinos', icon: Dumbbell },
          { id: 'schedule', label: 'Agenda', icon: Calendar },
          { id: 'settings', label: 'Ajustes', icon: Settings },
      ];

      const renderContent = () => {
          switch (activeTab) {
            case 'students':
                return <StudentsView user={user} primaryColor={safePrimaryColor} onSelectStudent={setSelectedStudent} />;
            case 'tracking':
                return <TrainerTrackingView primaryColor={safePrimaryColor} />;
            case 'chat':
                return <ChatListScreen user={user} primaryColor={safePrimaryColor} onSelectConversation={setActiveConversation} />;
            case 'workouts':
                return <WorkoutTemplatesView primaryColor={safePrimaryColor} />;
            case 'schedule':
                return <ScheduleView user={user} primaryColor={safePrimaryColor} />;
            case 'settings':
                return (
                    <div className="p-5 pb-24 space-y-6">
                        <header className="mt-2 mb-6">
                             <h1 className="text-3xl font-bold text-white">Configurações</h1>
                        </header>
                        
                        <div className="space-y-3">
                            {/* Billing Portal Link (Apenas para donos/admins) */}
                            {/* Em um cenário real, checaríamos 'is_owner'. Aqui, user.role 'ADMIN' é considerado dono. */}
                            {(user.role === UserRole.ADMIN) && (
                                <button 
                                    onClick={handleManageBilling}
                                    disabled={isBillingLoading}
                                    className="w-full bg-[#18181b] p-5 rounded-3xl border border-white/5 flex items-center gap-4 hover:bg-[#27272a] transition-all"
                                >
                                    <div className="bg-emerald-500/10 p-3 rounded-2xl text-emerald-500">
                                        {isBillingLoading ? <Loader2 size={24} className="animate-spin" /> : <CreditCard size={24} />}
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-white">Gerenciar Assinatura</h3>
                                        <p className="text-xs text-zinc-500">Faturas, cartão e plano</p>
                                    </div>
                                </button>
                            )}

                            <button 
                                onClick={() => setIsConfiguringMessages(true)}
                                className="w-full bg-[#18181b] p-5 rounded-3xl border border-white/5 flex items-center gap-4 hover:bg-[#27272a] transition-all"
                            >
                                <div className="bg-blue-500/10 p-3 rounded-2xl text-blue-500">
                                    <MessageSquare size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white">Mensagens Automáticas</h3>
                                    <p className="text-xs text-zinc-500">Configurar lembretes e boas-vindas</p>
                                </div>
                            </button>

                            {user.role === UserRole.ADMIN && (
                                <button 
                                    onClick={() => setIsManagingTeam(true)}
                                    className="w-full bg-[#18181b] p-5 rounded-3xl border border-white/5 flex items-center gap-4 hover:bg-[#27272a] transition-all"
                                >
                                    <div className="bg-purple-500/10 p-3 rounded-2xl text-purple-500">
                                        <Shield size={24} />
                                    </div>
                                    <div className="text-left">
                                        <h3 className="font-bold text-white">Gestão da Academia</h3>
                                        <p className="text-xs text-zinc-500">Gerenciar equipe de personals</p>
                                    </div>
                                </button>
                            )}
                            
                            <button 
                                onClick={handleLogout}
                                className="w-full bg-zinc-800 p-5 rounded-3xl border border-white/5 flex items-center gap-4 hover:bg-zinc-700 transition-all mt-8"
                            >
                                <div className="bg-zinc-900 p-3 rounded-2xl text-zinc-400">
                                    <LogOut size={24} />
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-white">Sair da Conta</h3>
                                    <p className="text-xs text-zinc-500">Encerrar sessão atual</p>
                                </div>
                            </button>

                            <button 
                                onClick={handleDeleteAccount}
                                disabled={isDeletingAccount}
                                className="w-full bg-red-500/5 p-5 rounded-3xl border border-red-500/20 flex items-center gap-4 hover:bg-red-500/10 transition-all"
                            >
                                <div className="bg-red-500/10 p-3 rounded-2xl text-red-500">
                                    {isDeletingAccount ? <Loader2 size={24} className="animate-spin" /> : <Trash2 size={24} />}
                                </div>
                                <div className="text-left">
                                    <h3 className="font-bold text-red-500">Excluir Minha Conta</h3>
                                    <p className="text-xs text-red-400/70">Ação irreversível</p>
                                </div>
                            </button>
                        </div>
                    </div>
                );
            default:
                return <StudentsView user={user} primaryColor={safePrimaryColor} onSelectStudent={setSelectedStudent} />;
          }
      };

      return (
        <Layout 
          activeTab={activeTab} 
          onTabChange={setActiveTab} 
          primaryColor={safePrimaryColor}
          menuItems={menuItems}
        >
          {renderContent()}
        </Layout>
      );
  }

  // --- STUDENT VIEWS ---
  
  // Full Screen Overlays (Chat)
  if (activeConversation) {
      return (
          <ChatScreen 
            user={user}
            conversation={activeConversation}
            primaryColor={safePrimaryColor}
            onBack={() => setActiveConversation(null)}
          />
      );
  }

  const studentMenuItems = [
      { id: 'home', label: 'Início', icon: LayoutDashboard },
      { id: 'workouts', label: 'Treinar', icon: Dumbbell },
      { id: 'evolution', label: 'Evolução', icon: Users },
      { id: 'schedule', label: 'Agenda', icon: Calendar },
      { id: 'chat', label: 'Chat', icon: MessageSquare },
      { id: 'profile', label: 'Perfil', icon: User },
  ];

  const renderStudentContent = () => {
      switch (activeTab) {
          case 'home':
              return <StudentDashboard user={user} primaryColor={safePrimaryColor} onNavigate={setActiveTab} />;
          case 'workouts':
              return <StudentDataWrapper user={user} primaryColor={safePrimaryColor} Component={StudentWorkoutView} />;
          case 'evolution':
              return <StudentDataWrapper user={user} primaryColor={safePrimaryColor} Component={StudentEvolution} />;
          case 'schedule':
              return <ScheduleView user={user} primaryColor={safePrimaryColor} />;
          case 'chat':
              return <ChatListScreen user={user} primaryColor={safePrimaryColor} onSelectConversation={setActiveConversation} />;
          case 'profile':
              return <StudentProfile user={user} primaryColor={safePrimaryColor} onLogout={handleLogout} />;
          default:
              return <StudentDashboard user={user} primaryColor={safePrimaryColor} onNavigate={setActiveTab} />;
      }
  };

  return (
    <Layout 
      activeTab={activeTab} 
      onTabChange={setActiveTab} 
      primaryColor={safePrimaryColor}
      menuItems={studentMenuItems}
    >
      {renderStudentContent()}
    </Layout>
  );
};

// Helper Wrapper to fetch Student Data for Student Views
const StudentDataWrapper = ({ user, primaryColor, Component }: { user: UserProfile, primaryColor: string, Component: any }) => {
    const [student, setStudent] = useState<Student | null>(null);

    useEffect(() => {
        const load = async () => {
            if(user.student_id_link) {
                const s = await db.getStudentDetails(user.student_id_link);
                setStudent(s || null);
            }
        };
        load();
    }, [user]);

    if (!student) return <div className="p-10 text-center text-zinc-500">Carregando dados do aluno...</div>;

    return <Component student={student} primaryColor={primaryColor} />;
};
