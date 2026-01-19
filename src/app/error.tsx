"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error(error);
    }, [error]);

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-[#09090b] text-white p-4">
            <div className="bg-red-500/10 border border-red-500/20 p-8 rounded-3xl text-center max-w-md">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6 text-red-500">
                    <AlertTriangle size={32} />
                </div>
                <h2 className="text-2xl font-bold mb-2">Algo deu errado!</h2>
                <p className="text-zinc-400 mb-6 text-sm">
                    Um erro inesperado ocorreu. Tente recarregar a página.
                </p>
                <button
                    onClick={() => reset()}
                    className="bg-white text-black font-bold py-3 px-6 rounded-xl hover:bg-zinc-200 transition-colors flex items-center gap-2 mx-auto"
                >
                    <RefreshCcw size={18} />
                    Tentar Novamente
                </button>
            </div>
        </div>
    );
}
