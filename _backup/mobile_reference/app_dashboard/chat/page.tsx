import { ConversationList } from "@/components/chat/ConversationList";
import { getConversations } from "@/actions/chat";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { MessageSquare } from "lucide-react";

export default async function ChatPage() {
    const session = await getSession();
    if (!session) redirect("/login");

    const conversations = await getConversations();

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar List */}
            <div className="w-full md:w-80 border-r border-white/5 bg-zinc-950/50 p-4 flex flex-col md:flex">
                <h1 className="text-2xl font-bold text-white mb-6 px-2">Mensagens</h1>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <ConversationList users={conversations} />
                </div>
            </div>

            {/* Empty State for Desktop (Conversation not selected) */}
            <div className="hidden md:flex flex-1 items-center justify-center bg-zinc-950/20 p-8">
                <div className="text-center opacity-40">
                    <MessageSquare size={64} className="mx-auto mb-4" />
                    <h2 className="text-xl font-bold mb-2">Selecione uma conversa</h2>
                    <p className="max-w-xs mx-auto">Escolha um contato à esquerda para ver o histórico e enviar mensagens.</p>
                </div>
            </div>
        </div>
    );
}
