
import React, { useEffect, useState } from 'react';
import { db } from '../services/supabaseService';
import { Conversation, UserProfile, UserRole } from '../types';
import { Search, ChevronRight, MessageSquare, Loader2 } from 'lucide-react';

interface ChatListScreenProps {
  user: UserProfile;
  primaryColor: string;
  onSelectConversation: (conv: Conversation) => void;
}

export const ChatListScreen: React.FC<ChatListScreenProps> = ({ user, primaryColor, onSelectConversation }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    setLoading(true);
    const data = await db.getConversations(user.id, user.role);
    setConversations(data);
    setLoading(false);
  };

  const filteredConvs = conversations.filter(c => 
    c.participant_name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth();
    
    if (isToday) {
        return date.toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    }
    return date.toLocaleDateString('pt-BR', {day:'2-digit', month:'2-digit'});
  };

  return (
    <div className="p-5 space-y-6 pb-24">
      <header className="mt-2 flex justify-between items-center">
        <div>
           <p className="text-zinc-400 text-sm font-medium">Comunicação</p>
           <h1 className="text-3xl font-bold text-white mt-1">
             Mensagens
           </h1>
        </div>
      </header>

      {/* Busca */}
      <div className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="text-zinc-500 group-focus-within:text-white transition-colors" size={20} />
        </div>
        <input 
          type="text" 
          aria-label="Buscar conversa"
          placeholder="Buscar conversa..." 
          className="w-full pl-12 pr-4 py-4 bg-[#18181b] border border-white/5 rounded-2xl text-white placeholder-zinc-500 focus:outline-none focus:ring-1 transition-all shadow-sm"
          style={{ '--tw-ring-color': primaryColor } as React.CSSProperties}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-3">
        {loading ? (
             <div className="flex justify-center py-10 text-zinc-500">
                 <Loader2 className="animate-spin" />
             </div>
        ) : filteredConvs.length === 0 ? (
             <div className="text-center py-20 bg-[#18181b] rounded-3xl border border-dashed border-zinc-800">
                 <MessageSquare size={40} className="mx-auto mb-4 text-zinc-600" />
                 <p className="text-zinc-500">Nenhuma conversa iniciada.</p>
             </div>
        ) : (
            filteredConvs.map(conv => (
                <button 
                    key={conv.id}
                    onClick={() => onSelectConversation(conv)}
                    className="w-full text-left bg-[#18181b] p-4 rounded-2xl border border-white/5 flex items-center gap-4 active:scale-[0.98] transition-all cursor-pointer hover:bg-[#27272a]"
                >
                    <div className="relative">
                        <img 
                            src={conv.participant_avatar || `https://ui-avatars.com/api/?name=${conv.participant_name}&background=random`} 
                            className="w-14 h-14 rounded-full object-cover border-2 border-[#18181b]"
                            alt={`Avatar de ${conv.participant_name}`}
                        />
                        {/* Status Indicator (Mockado como online sempre) */}
                        <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-[#18181b]"></div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline mb-1">
                            <h3 className="font-bold text-white text-base truncate pr-2">{conv.participant_name}</h3>
                            <span className="text-[10px] text-zinc-500 whitespace-nowrap">{getTimeAgo(conv.last_message_at)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <p className="text-sm text-zinc-400 truncate pr-4">
                                {conv.last_message}
                            </p>
                            {conv.unread_count > 0 && (
                                <span 
                                    className="min-w-[20px] h-5 px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold text-black"
                                    style={{ backgroundColor: primaryColor }}
                                >
                                    {conv.unread_count}
                                </span>
                            )}
                        </div>
                    </div>
                </button>
            ))
        )}
      </div>
    </div>
  );
};
