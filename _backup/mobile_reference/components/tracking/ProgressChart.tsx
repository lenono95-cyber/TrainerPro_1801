"use client";

import React from "react";

interface Measurement {
    date: string | Date;
    weight: number | null;
    body_fat: number | null;
}

interface ProgressChartProps {
    data: Measurement[];
}

export function ProgressChart({ data }: ProgressChartProps) {
    if (!data || data.length === 0) {
        return <div className="text-center text-zinc-500 py-10">Sem dados para exibir.</div>;
    }

    return (
        <div className="w-full bg-zinc-900/40 rounded-3xl p-6 border border-white/5">
            <h3 className="text-white font-bold mb-4">Evolução Peso & Gordura</h3>
            <div className="text-zinc-400 text-sm mb-4">
                Gráfico visual será implementado em breve. Por enquanto, veja os dados na tabela abaixo.
            </div>
        </div>
    );
}
