import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function NotFound() {
    return (
        <div className="flex h-screen flex-col items-center justify-center bg-[#09090b] text-white p-4">
            <h2 className="text-4xl font-bold mb-2 text-[#ef4444]">404</h2>
            <p className="text-zinc-400 mb-8">Página não encontrada.</p>
            <Link
                href="/dashboard"
                className="text-white border border-white/10 py-3 px-6 rounded-xl hover:bg-white/5 transition-colors flex items-center gap-2"
            >
                <ArrowLeft size={18} />
                Voltar ao Início
            </Link>
        </div>
    );
}
