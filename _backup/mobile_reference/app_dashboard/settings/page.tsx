import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Settings, User, Bell, Lock, Palette } from "lucide-react";

export default async function SettingsPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    return (
        <div className="p-8 max-w-4xl mx-auto">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-white mb-2">Configurações</h1>
                <p className="text-zinc-400">Gerencie suas preferências e configurações da conta.</p>
            </header>

            <div className="space-y-6">
                {/* Perfil */}
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <User className="text-[#ef4444]" size={24} />
                        <h2 className="text-xl font-bold text-white">Perfil</h2>
                    </div>
                    <div className="space-y-3 text-sm">
                        <div>
                            <p className="text-zinc-500 font-bold uppercase tracking-wider mb-1">Nome</p>
                            <p className="text-white">{session.user.name}</p>
                        </div>
                        <div>
                            <p className="text-zinc-500 font-bold uppercase tracking-wider mb-1">Email</p>
                            <p className="text-white">{session.user.email}</p>
                        </div>
                        <div>
                            <p className="text-zinc-500 font-bold uppercase tracking-wider mb-1">Função</p>
                            <p className="text-white">{session.user.role}</p>
                        </div>
                    </div>
                </div>

                {/* Notificações */}
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Bell className="text-[#ef4444]" size={24} />
                        <h2 className="text-xl font-bold text-white">Notificações</h2>
                    </div>
                    <p className="text-zinc-400 text-sm">
                        Configurações de notificações serão implementadas em breve.
                    </p>
                </div>

                {/* Segurança */}
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Lock className="text-[#ef4444]" size={24} />
                        <h2 className="text-xl font-bold text-white">Segurança</h2>
                    </div>
                    <p className="text-zinc-400 text-sm">
                        Opções de alteração de senha e autenticação em duas etapas serão adicionadas.
                    </p>
                </div>

                {/* Aparência */}
                <div className="bg-zinc-900/40 border border-white/5 p-6 rounded-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <Palette className="text-[#ef4444]" size={24} />
                        <h2 className="text-xl font-bold text-white">Aparência</h2>
                    </div>
                    <p className="text-zinc-400 text-sm">
                        Tema atual: <span className="text-white font-semibold">Dark Mode</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
