'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body className="bg-zinc-950 text-white flex items-center justify-center h-screen flex-col p-4">
                <h2 className="text-2xl font-bold mb-4">Algo crítico aconteceu! (Global Error)</h2>
                <pre className="bg-red-900/20 p-4 rounded text-xs mb-4 text-red-200 border border-red-500/20 overflow-auto max-w-full">
                    {error.message}
                </pre>
                <button
                    onClick={() => reset()}
                    className="bg-white text-black font-bold py-2 px-6 rounded hover:bg-zinc-200"
                >
                    Tentar de Novo
                </button>
            </body>
        </html>
    );
}
