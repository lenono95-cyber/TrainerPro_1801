
import React from 'react';
import { Assessment, Student } from '../types';
import { getBMIClassification, getBodyFatClassification, getRCQClassification, calculateIdealWeight } from '../utils/assessmentUtils';
import { ArrowLeft, Scale, Ruler, Activity, Info, Calendar, User, TrendingUp, TrendingDown, Camera } from 'lucide-react';

interface PhysicalAssessmentDetailProps {
  assessment: Assessment;
  student: Student;
  previousAssessment?: Assessment; // Para comparativo
  primaryColor: string;
  onBack: () => void;
}

export const PhysicalAssessmentDetail: React.FC<PhysicalAssessmentDetailProps> = ({ assessment, student, previousAssessment, primaryColor, onBack }) => {
  
  // Helpers para classificação
  const bmiClass = getBMIClassification(assessment.bmi);
  const bfClass = assessment.body_fat_percentage 
        ? getBodyFatClassification(assessment.body_fat_percentage, student.gender, assessment.age_at_assessment) 
        : null;
  const rcqClass = assessment.waist_hip_ratio
        ? getRCQClassification(assessment.waist_hip_ratio, student.gender)
        : null;
  
  const idealWeight = calculateIdealWeight(assessment.height, student.gender);

  // Helper para renderizar diff
  const renderDiff = (current: number, prev?: number, inverseGood = false, unit = '') => {
      if (!prev) return null;
      const diff = current - prev;
      if (diff === 0) return <span className="text-xs text-zinc-500">-</span>;
      
      const isGood = inverseGood ? diff < 0 : diff > 0;
      const ColorIcon = isGood ? TrendingUp : TrendingDown; // Ícone genérico, cor importa mais
      const colorClass = isGood ? 'text-green-500' : 'text-red-500';

      return (
          <div className={`flex items-center gap-1 text-xs font-bold ${colorClass}`}>
             {diff > 0 ? '+' : ''}{diff.toFixed(1)}{unit}
          </div>
      );
  };

  const hasPhotos = assessment.photo_front_url || assessment.photo_back_url || assessment.photo_side_url;

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-[#18181b] p-4 pt-safe border-b border-white/5 flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="font-bold text-lg text-white">Resultados</h2>
                    <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Calendar size={10} /> {new Date(assessment.date).toLocaleDateString('pt-BR')}
                    </p>
                </div>
            </div>
            {/* IMC Badge no Header */}
            <div className="bg-zinc-800 px-3 py-1 rounded-full border border-white/5">
                <span className="text-xs font-bold text-white">IMC {assessment.bmi}</span>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-safe space-y-6">
            
            {/* 1. Visão Geral (Cards) */}
            <div className="grid grid-cols-2 gap-4">
                {/* PESO */}
                <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5 relative overflow-hidden">
                    <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-blue-500/10 text-blue-500 rounded-xl">
                            <Scale size={20} />
                        </div>
                        {renderDiff(assessment.weight, previousAssessment?.weight, true, 'kg')}
                    </div>
                    <span className="text-xs font-bold text-zinc-500 uppercase">Peso Atual</span>
                    <p className="text-3xl font-bold text-white mt-1">{assessment.weight} <span className="text-sm font-normal text-zinc-500">kg</span></p>
                    <p className="text-[10px] text-zinc-600 mt-2">Ideal: {idealWeight.min}-{idealWeight.max} kg</p>
                </div>

                {/* GORDURA (BF) */}
                <div className="bg-[#18181b] p-5 rounded-3xl border border-white/5 relative overflow-hidden">
                     <div className="flex justify-between items-start mb-2">
                        <div className="p-2 bg-yellow-500/10 text-yellow-500 rounded-xl">
                            <Activity size={20} />
                        </div>
                        {renderDiff(assessment.body_fat_percentage || 0, previousAssessment?.body_fat_percentage, true, '%')}
                    </div>
                    <span className="text-xs font-bold text-zinc-500 uppercase">% Gordura</span>
                    <p className="text-3xl font-bold text-white mt-1">{assessment.body_fat_percentage || '--'} <span className="text-sm font-normal text-zinc-500">%</span></p>
                    {bfClass && (
                        <span className="inline-block mt-2 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800" style={{ color: bfClass.color }}>
                            {bfClass.label}
                        </span>
                    )}
                </div>
            </div>

            {/* 2. Composição Corporal (Barra) */}
            {assessment.lean_mass_kg && assessment.fat_mass_kg && (
                <div className="bg-[#18181b] p-6 rounded-3xl border border-white/5">
                    <h3 className="text-sm font-bold text-white mb-4">Composição Corporal</h3>
                    
                    {/* Barra Visual */}
                    <div className="flex h-4 rounded-full overflow-hidden mb-4">
                        <div 
                            className="bg-emerald-500 h-full" 
                            style={{ width: `${100 - (assessment.body_fat_percentage || 0)}%` }}
                        />
                        <div 
                            className="bg-yellow-500 h-full" 
                            style={{ width: `${assessment.body_fat_percentage || 0}%` }}
                        />
                    </div>

                    <div className="flex justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                                <span className="text-xs text-zinc-400">Massa Magra</span>
                            </div>
                            <p className="text-xl font-bold text-white">{assessment.lean_mass_kg} kg</p>
                            {renderDiff(assessment.lean_mass_kg, previousAssessment?.lean_mass_kg, false, 'kg')}
                        </div>
                        <div className="text-right">
                             <div className="flex items-center justify-end gap-2 mb-1">
                                <span className="text-xs text-zinc-400">Massa Gorda</span>
                                <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            </div>
                            <p className="text-xl font-bold text-white">{assessment.fat_mass_kg} kg</p>
                            <div className="flex justify-end">
                                {renderDiff(assessment.fat_mass_kg, previousAssessment?.fat_mass_kg, true, 'kg')}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* 3. Indicadores de Saúde */}
            <div className="space-y-3">
                <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wide">Indicadores de Saúde</h3>
                
                {/* IMC Detail */}
                <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                    <div>
                        <span className="text-xs text-zinc-400 font-bold block">IMC (Índice de Massa Corporal)</span>
                        <span className="text-sm text-zinc-500">Classificação</span>
                    </div>
                    <div className="text-right">
                         <span className="block font-bold text-white text-lg">{assessment.bmi}</span>
                         <span className="text-xs font-bold" style={{ color: bmiClass.color }}>{bmiClass.label}</span>
                    </div>
                </div>

                {/* RCQ Detail */}
                {assessment.waist_hip_ratio && (
                    <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5 flex justify-between items-center">
                        <div>
                            <span className="text-xs text-zinc-400 font-bold block">RCQ (Cintura/Quadril)</span>
                            <span className="text-sm text-zinc-500">Risco Cardíaco</span>
                        </div>
                        <div className="text-right">
                            <span className="block font-bold text-white text-lg">{assessment.waist_hip_ratio}</span>
                            <span className="text-xs font-bold" style={{ color: rcqClass?.color }}>{rcqClass?.label}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. Medidas Corporais (Tabela Simples) */}
            <div className="bg-[#18181b] rounded-3xl border border-white/5 overflow-hidden">
                <div className="p-4 bg-zinc-900 border-b border-white/5">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Ruler size={16} /> Medidas Corporais (cm)
                    </h3>
                </div>
                <div className="p-4 space-y-4">
                    <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm">
                        <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-zinc-400">Tórax</span>
                            <span className="font-bold text-white">{assessment.chest_cm || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-zinc-400">Cintura</span>
                            <span className="font-bold text-white">{assessment.waist_cm || '-'}</span>
                        </div>
                         <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-zinc-400">Abdômen</span>
                            <span className="font-bold text-white">{assessment.abdomen_cm || '-'}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-zinc-400">Quadril</span>
                            <span className="font-bold text-white">{assessment.hips_cm || '-'}</span>
                        </div>
                         <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-zinc-400">Braço D</span>
                            <span className="font-bold text-white">{assessment.arm_right_cm || '-'}</span>
                        </div>
                         <div className="flex justify-between border-b border-white/5 pb-1">
                            <span className="text-zinc-400">Coxa D</span>
                            <span className="font-bold text-white">{assessment.thigh_right_cm || '-'}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Registros Fotográficos (Se houver) */}
            {hasPhotos && (
                <div className="space-y-3">
                    <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wide flex items-center gap-2">
                        <Camera size={14} /> Registros Fotográficos
                    </h3>
                    <div className="grid grid-cols-3 gap-2">
                        {assessment.photo_front_url && (
                            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10 relative group">
                                <img src={assessment.photo_front_url} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-center">
                                    <span className="text-[10px] text-white">Frente</span>
                                </div>
                            </div>
                        )}
                        {assessment.photo_back_url && (
                            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10 relative group">
                                <img src={assessment.photo_back_url} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-center">
                                    <span className="text-[10px] text-white">Costas</span>
                                </div>
                            </div>
                        )}
                        {assessment.photo_side_url && (
                            <div className="aspect-[3/4] rounded-xl overflow-hidden border border-white/10 relative group">
                                <img src={assessment.photo_side_url} className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-black/60 p-1 text-center">
                                    <span className="text-[10px] text-white">Perfil</span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 6. Observações */}
            {assessment.notes && (
                <div className="bg-zinc-900 p-4 rounded-2xl border border-white/5">
                    <p className="text-xs text-zinc-500 uppercase font-bold mb-2 flex items-center gap-2">
                        <Info size={14} /> Observações do Personal
                    </p>
                    <p className="text-zinc-300 text-sm italic">"{assessment.notes}"</p>
                </div>
            )}
        </div>
    </div>
  );
};
