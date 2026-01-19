
import React, { useState, useEffect, useRef } from 'react';
import { Conversation, Message, UserProfile } from '../types';
import { db } from '../services/supabaseService';
import { ArrowLeft, Send, Image as ImageIcon, MoreVertical, Loader2, Check, CheckCheck } from 'lucide-react';

interface ChatScreenProps {
  user: UserProfile;
  conversation: Conversation;
  primaryColor: string;
  onBack: () => void;
}

export const ChatScreen: React.FC<ChatScreenProps> = ({ user, conversation, primaryColor, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Identificar ID correto para envio (se for aluno, usa o u_student ou o user.id real)
  // No mock, user.id é 'u_student' ou 'u_trainer'.
  const currentUserId = user.id; 

  useEffect(() => {
    loadMessages();
    // Polling simples para simular realtime no mock
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [conversation.id]);

  const loadMessages = async () => {
    const data = await db.getMessages(conversation.id);
    setMessages(data); // Já vem ordenado desc
    setLoading(false);
  };

  const handleSend = async () => {
      if (!inputText.trim()) return;
      setSending(true);
      
      try {
        await db.sendMessage(conversation.id, currentUserId, inputText);
        setInputText('');
        loadMessages(); // Refresh imediato
      } finally {
        setSending(false);
      }
  };

  const formatTime = (dateStr: string) => {
      return new Date(dateStr).toLocaleTimeString('pt-BR', {hour:'2-digit', minute:'2-digit'});
  };

  const groupMessagesByDate = () => {
      const groups: { [key: string]: Message[] } = {};
      // Inverter para agrupar cronologicamente (mensagens vêm DESC)
      [...messages].reverse().forEach(msg => {
          const date = new Date(msg.created_at).toLocaleDateString();
          if (!groups[date]) groups[date] = [];
          groups[date].push(msg);
      });
      return groups;
  };

  const grouped = groupMessagesByDate();

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="bg-[#18181b] p-3 pt-safe border-b border-white/5 flex items-center justify-between shadow-md z-10">
         <div className="flex items-center gap-3">
             <button onClick={onBack} aria-label="Voltar" className="p-2 -ml-2 rounded-full hover:bg-white/5 text-zinc-300">
                 <ArrowLeft size={22} />
             </button>
             <img 
                src={conversation.participant_avatar} 
                alt={`Avatar de ${conversation.participant_name}`}
                className="w-10 h-10 rounded-full bg-zinc-800 object-cover"
             />
             <div>
                 <h3 className="font-bold text-white leading-tight">{conversation.participant_name}</h3>
                 <span className="text-xs text-green-500 font-medium">Online</span>
             </div>
         </div>
         {/* Actions Menu - Calls Removed */}
         <div className="flex items-center gap-4 text-zinc-400 pr-2">
             <button aria-label="Mais opções" className="p-2 rounded-full hover:bg-white/5 text-zinc-400">
                <MoreVertical size={20} />
             </button>
         </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-black/40" style={{ backgroundImage: 'radial-gradient(circle at center, #18181b 1px, transparent 1px)', backgroundSize: '20px 20px' }}>
          {loading ? (
              <div className="flex justify-center pt-20">
                  <Loader2 className="animate-spin text-zinc-500" />
              </div>
          ) : (
             Object.entries(grouped).map(([date, msgs]) => (
                 <div key={date} className="mb-6">
                     <div className="flex justify-center mb-4">
                         <span className="bg-zinc-800 text-zinc-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                             {date === new Date().toLocaleDateString() ? 'Hoje' : date}
                         </span>
                     </div>
                     <div className="space-y-1">
                         {msgs.map((msg, idx) => {
                             const isMe = msg.sender_id === currentUserId;
                             const isConsecutive = idx > 0 && msgs[idx-1].sender_id === msg.sender_id;
                             
                             return (
                                 <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                                     <div 
                                        className={`max-w-[75%] px-3 py-2 rounded-2xl shadow-sm text-sm relative group ${
                                            isMe 
                                                ? 'bg-emerald-600 text-white rounded-tr-sm' 
                                                : 'bg-[#27272a] text-zinc-100 rounded-tl-sm'
                                        } ${isConsecutive ? 'mt-0.5' : 'mt-2'}`}
                                     >
                                         <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                         <div className="flex justify-end items-center gap-1 mt-1 opacity-70">
                                             <span className="text-[10px]">{formatTime(msg.created_at)}</span>
                                             {isMe && (
                                                 msg.read ? <CheckCheck size={12} /> : <Check size={12} />
                                             )}
                                         </div>
                                     </div>
                                 </div>
                             );
                         })}
                     </div>
                 </div>
             ))
          )}
          <div ref={scrollRef} />
      </div>

      {/* Input Area */}
      <div className="p-3 pb-safe bg-[#18181b] border-t border-white/5 flex items-end gap-2">
          <button aria-label="Enviar imagem" className="p-3 text-zinc-400 hover:text-zinc-200 bg-zinc-800/50 rounded-xl">
              <ImageIcon size={22} />
          </button>
          
          <div className="flex-1 bg-zinc-900 rounded-2xl border border-white/5 flex items-center px-4 py-2">
              <textarea 
                  rows={1}
                  placeholder="Digite uma mensagem..."
                  aria-label="Digite sua mensagem"
                  className="w-full bg-transparent text-white placeholder-zinc-500 focus:outline-none resize-none max-h-24 custom-scrollbar"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                      if(e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSend();
                      }
                  }}
              />
          </div>

          <button 
            onClick={handleSend}
            disabled={!inputText.trim() || sending}
            aria-label="Enviar mensagem"
            className="p-3 rounded-xl flex items-center justify-center transition-all disabled:opacity-50 disabled:grayscale"
            style={{ backgroundColor: primaryColor }}
          >
              {sending ? <Loader2 size={22} className="animate-spin text-black" /> : <Send size={22} className="text-black ml-0.5" />}
          </button>
      </div>
    </div>
  );
};
