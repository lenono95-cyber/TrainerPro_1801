"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, Mail, Lock, ArrowRight, AlertTriangle, Loader2 } from "lucide-react";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const res = await signIn("credentials", {
                email,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Credenciais inválidas. Tente novamente.");
                setLoading(false);
            } else {
                // Redirect to admin dashboard
                router.push("/admin/dashboard");
                router.refresh();
            }
        } catch {
            setError("Erro ao conectar. Tente mais tarde.");
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#09090b] flex flex-col justify-center items-center p-6 relative overflow-hidden font-sans">
            {/* Background decoration */}
            <div className="absolute top-[-20%] right-[-20%] w-[80%] h-[50%] bg-[#ef4444] rounded-full blur-[150px] opacity-20 pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[40%] bg-[#ef4444] rounded-full blur-[120px] opacity-10 pointer-events-none" />

            <div className="w-full max-w-sm z-10 transition-all duration-300 flex flex-col items-center">

                {/* Logo Section */}
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-[#ef4444] to-red-700 rounded-3xl flex items-center justify-center shadow-2xl shadow-red-500/20">
                        <Dumbbell size={40} className="text-white" />
                    </div>
                </div>

                <div className="animate-in fade-in slide-in-from-bottom-8 duration-500 w-full">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">TrainerPro</h1>
                        <p className="text-zinc-500 text-sm">Painel Super Admin</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Mail size={18} className="text-zinc-500" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="Seu e-mail de acesso"
                                    className="w-full bg-[#18181b] border border-zinc-800 focus:border-[#ef4444] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-[#ef4444]"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>

                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Lock size={18} className="text-zinc-500" />
                                </div>
                                <input
                                    type="password"
                                    placeholder="Sua senha"
                                    className="w-full bg-[#18181b] border border-zinc-800 focus:border-[#ef4444] rounded-2xl py-4 pl-12 pr-4 text-white placeholder-zinc-600 outline-none transition-all focus:ring-1 focus:ring-[#ef4444]"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-xs p-3 rounded-xl text-center flex items-center justify-center gap-2 animate-in zoom-in duration-300">
                                <AlertTriangle size={16} />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-white text-black font-bold py-4 rounded-2xl hover:bg-zinc-200 transition-all active:scale-[0.98] flex items-center justify-center space-x-2 shadow-lg shadow-white/10"
                        >
                            {loading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Entrando...</span>
                                </>
                            ) : (
                                <>
                                    <span>Acessar Plataforma</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
