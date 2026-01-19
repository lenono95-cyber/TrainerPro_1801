import { ChatWindow } from "@/components/chat/ChatWindow";
import { ConversationList } from "@/components/chat/ConversationList";
import { getConversations, getMessages } from "@/actions/chat";
import { getSession } from "@/lib/session";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma"; // Need direct access to get other user name

export default async function ChatDetailPage({ params }: { params: { id: string } }) {
    const session = await getSession();
    if (!session) redirect("/login");

    const conversations = await getConversations();

    // Find name of current chat user
    // In a bigger app we would have a dedicated getProfile action
    const otherUser = await prisma.user.findUnique({
        where: { id: params.id },
        select: { name: true, email: true }
    });

    if (!otherUser) return <div>User not found</div>;

    return (
        <div className="flex h-screen overflow-hidden">
            {/* Sidebar List - Hidden on mobile when chat is open */}
            <div className="hidden md:flex w-80 border-r border-white/5 bg-zinc-950/50 p-4 flex-col">
                <h1 className="text-2xl font-bold text-white mb-6 px-2">Mensagens</h1>
                <div className="flex-1 overflow-y-auto no-scrollbar">
                    <ConversationList users={conversations} />
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 p-4 h-[calc(100vh-80px)] md:h-screen">
                <ChatWindow
                    currentUserId={session.user.id}
                    otherUserId={params.id}
                    otherUserName={otherUser.name || otherUser.email}
                />
            </div>
        </div>
    );
}
