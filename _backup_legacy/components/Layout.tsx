import React from 'react';
import { LucideIcon } from 'lucide-react';

export interface MenuItem {
  id: string;
  label: string;
  icon: LucideIcon;
}

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  onTabChange: (tab: string) => void;
  primaryColor: string;
  menuItems: MenuItem[];
}

export const Layout: React.FC<LayoutProps> = ({ children, activeTab, onTabChange, primaryColor, menuItems }) => {
  // Efeito de brilho na aba ativa
  const getActiveStyle = (isActive: boolean) => {
    if (!isActive) return { color: '#71717a' }; // zinc-500
    return { 
      color: primaryColor,
      textShadow: `0 0 10px ${primaryColor}40` // Brilho suave
    };
  };

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-white overflow-hidden font-sans selection:bg-white/20">
      {/* Área Principal de Conteúdo */}
      <main className="flex-1 overflow-y-auto pb-24 no-scrollbar relative">
        {/* Elemento de fundo decorativo (Glow) */}
        <div 
          className="fixed top-[-10%] left-[-10%] w-[50%] h-[30%] rounded-full blur-[120px] pointer-events-none opacity-20"
          style={{ backgroundColor: primaryColor }}
        />
        <div className="relative z-10 h-full">
          {children}
        </div>
      </main>

      {/* Barra de Navegação Inferior (Glassmorphism) Dinâmica */}
      <nav className="fixed bottom-4 left-4 right-4 h-16 rounded-2xl glass border border-white/10 shadow-2xl flex justify-around items-center z-50">
        {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            
            return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}
                  style={getActiveStyle(isActive)}
                >
                  <Icon size={isActive ? 24 : 22} strokeWidth={isActive ? 2.5 : 2} />
                  {isActive && <span className="text-[10px] font-medium animate-in fade-in slide-in-from-bottom-1 duration-200">{item.label}</span>}
                </button>
            );
        })}
      </nav>
    </div>
  );
};
