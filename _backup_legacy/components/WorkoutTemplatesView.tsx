import React, { useEffect, useState } from 'react';
import { db } from '../services/supabaseService';
import { WorkoutRoutine } from '../types';
import { Plus, Dumbbell, ChevronRight, Copy, Loader2 } from 'lucide-react';
import { WorkoutBuilder } from './WorkoutBuilder';

interface WorkoutTemplatesViewProps {
  primaryColor: string;
}

export const WorkoutTemplatesView: React.FC<WorkoutTemplatesViewProps> = ({ primaryColor }) => {
  const [templates, setTemplates] = useState<WorkoutRoutine[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<WorkoutRoutine | undefined>(undefined);

  useEffect(() => {
    loadTemplates();
  }, [isCreating, editingTemplate]); // Recarrega ao fechar o builder

  const loadTemplates = async () => {
    setLoading(true);
    const data = await db.getWorkoutTemplates();
    setTemplates(data);
    setLoading(false);
  };

  if (isCreating || editingTemplate) {
    return (
      <WorkoutBuilder 
        primaryColor={primaryColor} 
        existingWorkout={editingTemplate}
        onBack={() => {
          setIsCreating(false);
          setEditingTemplate(undefined);
        }} 
      />
    );
  }

  return (
    <div className="p-5 space-y-6">
      <header className="mt-2 flex justify-between items-center">
        <div>
           <p className="text-zinc-400 text-sm font-medium">Biblioteca</p>
           <h1 className="text-3xl font-bold text-white mt-1">
             Templates
           </h1>
        </div>
        <button 
          onClick={() => setIsCreating(true)}
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-all active:scale-95 hover:brightness-110"
          style={{ 
            backgroundColor: primaryColor,
            boxShadow: `0 8px 20px -6px ${primaryColor}80` 
          }}
        >
          <Plus size={24} />
        </button>
      </header>

      {/* Intro Box */}
      <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5 flex items-start gap-3">
         <div className="bg-zinc-800 p-2 rounded-lg text-zinc-400">
            <Copy size={20} />
         </div>
         <div>
            <h3 className="text-white font-semibold text-sm">Sistema de Templates</h3>
            <p className="text-zinc-500 text-xs mt-1 leading-relaxed">
              Crie treinos padrão aqui para aplicar rapidamente a qualquer aluno depois.
            </p>
         </div>
      </div>

      <div className="space-y-4 pb-20">
        {loading ? (
           <div className="flex justify-center py-12 text-zinc-500">
             <Loader2 className="animate-spin mr-2" /> Carregando...
           </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-12 text-zinc-600 bg-[#18181b] rounded-3xl border border-dashed border-zinc-800">
             <Dumbbell size={32} className="mx-auto mb-3 opacity-20" />
             <p>Nenhum template criado.</p>
          </div>
        ) : (
          templates.map(template => (
            <div 
              key={template.id} 
              onClick={() => setEditingTemplate(template)}
              className="group bg-[#18181b] hover:bg-[#27272a] p-5 rounded-3xl border border-white/5 flex items-center justify-between active:scale-[0.98] transition-all cursor-pointer shadow-sm relative overflow-hidden"
            >
              <div 
                className="absolute left-0 top-0 bottom-0 w-1 opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ backgroundColor: primaryColor }}
              />

              <div>
                 <h3 className="font-bold text-lg text-white group-hover:text-white/90">{template.name}</h3>
                 <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{template.description || 'Sem descrição'}</p>
                 <div className="flex gap-2 mt-3">
                    <span className="text-[10px] font-bold bg-zinc-800 px-2 py-1 rounded text-zinc-400 uppercase tracking-wide">
                        {template.exercises.length} Exercícios
                    </span>
                 </div>
              </div>
              
              <ChevronRight className="text-zinc-600 group-hover:text-white transition-colors" size={20} />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
