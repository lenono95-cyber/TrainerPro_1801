
import React, { useEffect, useState } from 'react';
import { db } from '../services/supabaseService';
import { Notification, UserProfile } from '../types';
import { X, Bell, Calendar, Info, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';

interface NotificationCenterProps {
  user: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  primaryColor: string;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ user, isOpen, onClose, primaryColor }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  
  useEffect(() => {
    if (isOpen) {
      loadNotifications();
    }
  }, [isOpen]);

  const loadNotifications = async () => {
    const data = await db.getNotifications(user.id);
    setNotifications(data);
    // Marcar como lidas após carregar
    setTimeout(async () => {
        await db.markNotificationsAsRead(user.id);
    }, 1000);
  };

  const getIcon = (type: Notification['type']) => {
      switch(type) {
          case 'booking': return <CheckCircle2 size={18} className="text-green-500" />;
          case 'cancellation': return <AlertTriangle size={18} className="text-red-500" />;
          case 'reminder': return <Clock size={18} className="text-yellow-500" />;
          default: return <Info size={18} className="text-blue-500" />;
      }
  };

  const getTimeAgo = (dateStr: string) => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.round(diffMs / 60000);
      
      if (diffMins < 60) return `${diffMins}m atrás`;
      const diffHours = Math.round(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h atrás`;
      return `${Math.round(diffHours / 24)}d atrás`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      
      {/* Drawer */}
      <div className="relative w-full max-w-sm bg-[#18181b] h-full shadow-2xl border-l border-white/5 flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-5 border-b border-white/5 flex justify-between items-center bg-[#18181b]/80 backdrop-blur-xl">
           <div className="flex items-center gap-3">
              <div className="bg-zinc-800 p-2 rounded-xl">
                  <Bell size={20} className="text-white" />
              </div>
              <h2 className="text-lg font-bold text-white">Notificações</h2>
           </div>
           <button onClick={onClose} aria-label="Fechar notificações" className="p-2 hover:bg-zinc-800 rounded-full text-zinc-400 hover:text-white transition-colors">
              <X size={20} />
           </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
            {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-500">
                    <Bell size={40} className="mb-4 opacity-20" />
                    <p>Nenhuma notificação recente.</p>
                </div>
            ) : (
                notifications.map(notif => (
                    <div key={notif.id} className={`p-4 rounded-2xl border ${notif.read ? 'bg-zinc-900/50 border-white/5' : 'bg-zinc-800 border-white/10'}`}>
                        <div className="flex gap-3">
                            <div className="mt-1 p-1.5 bg-black/40 rounded-lg h-fit">
                                {getIcon(notif.type)}
                            </div>
                            <div className="flex-1">
                                <h4 className={`text-sm font-bold ${notif.read ? 'text-zinc-300' : 'text-white'}`}>{notif.title}</h4>
                                <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{notif.message}</p>
                                <span className="text-[10px] text-zinc-600 mt-2 block">{getTimeAgo(notif.created_at)}</span>
                            </div>
                            {!notif.read && (
                                <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: primaryColor }} />
                            )}
                        </div>
                    </div>
                ))
            )}
        </div>
      </div>
    </div>
  );
};
