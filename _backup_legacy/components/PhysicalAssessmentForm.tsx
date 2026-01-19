
import React, { useState } from 'react';
import { Student, Assessment } from '../types';
import { db } from '../services/supabaseService';
import { calculateBMI, calculateBodyFatNavy, calculateRCQ, getBMIClassification, getBodyFatClassification } from '../utils/assessmentUtils';
import { ArrowLeft, Save, Loader2, Activity, Ruler, Camera, Calculator, Upload, X } from 'lucide-react';

interface PhysicalAssessmentFormProps {
  student: Student;
  primaryColor: string;
  onBack: () => void;
}

export const PhysicalAssessmentForm: React.FC<PhysicalAssessmentFormProps> = ({ student, primaryColor, onBack }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<Assessment>>({
    student_id: student.id,
    date: new Date().toISOString().split('T')[0],
    weight: student.weight,
    height: student.height,
    age_at_assessment: student.age,
    // Inicializar campos opcionais
    neck_cm: undefined,
    waist_cm: undefined,
    hips_cm: undefined,
    photo_front_url: '',
    photo_back_url: '',
    photo_side_url: '',
  });

  // State para Preview de Cálculos
  const [previewStats, setPreviewStats] = useState<{bmi: number, bf?: number, rcq?: number}>({ bmi: 0 });

  const updateField = (field: keyof Assessment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const calculatePreview = () => {
     const weight = Number(formData.weight) || 0;
     const height = Number(formData.height) || 0;
     const waist = Number(formData.waist_cm) || 0;
     const neck = Number(formData.neck_cm) || 0;
     const hips = Number(formData.hips_cm) || 0;

     const bmi = calculateBMI(weight, height);
     const bf = calculateBodyFatNavy(student.gender, height, waist, neck, hips);
     const rcq = calculateRCQ(waist, hips);

     setPreviewStats({ bmi, bf, rcq });
  };

  const handleMockUpload = (field: 'photo_front_url' | 'photo_back_url' | 'photo_side_url') => {
      // Simula upload com imagens aleatórias de fitness
      const randomId = Math.floor(Math.random() * 1000);
      const url = `https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80&rand=${randomId}`;
      updateField(field, url);
  };

  const handleSave = async () => {
      setLoading(true);
      try {
          const payload = { ...formData };
          // Conversão rápida de strings numéricas se houver
          const numericKeys = ['weight', 'height', 'neck_cm', 'chest_cm', 'waist_cm', 'abdomen_cm', 'hips_cm', 'age_at_assessment'];
          
          Object.keys(payload).forEach(key => {
             if (numericKeys.includes(key) && (payload as any)[key]) {
                 (payload as any)[key] = Number((payload as any)[key]);
             }
          });

          await db.saveAssessment(payload as Assessment);
          onBack();
      } catch (e) {
          alert("Erro ao salvar avaliação");
      } finally {
          setLoading(false);
      }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#09090b] flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="bg-[#18181b] p-4 pt-safe border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-2 -ml-2 text-zinc-400 hover:text-white">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h2 className="font-bold text-lg text-white">Nova Avaliação</h2>
                    <p className="text-xs text-zinc-500">{student.full_name}</p>
                </div>
            </div>
            <button 
                onClick={handleSave}
                disabled={loading}
                className="px-4 py-2 rounded-xl text-black font-bold text-sm active:scale-95 transition-all flex items-center gap-2"
                style={{ backgroundColor: primaryColor }}
            >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Salvar
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 pb-32">
            
            {/* Calculadora em Tempo Real (Preview) */}
            <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 p-4 rounded-3xl border border-white/10 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10">
                    <Activity size={80} />
                </div>
                <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Calculator size={14} /> Prévia de Resultados
                </h3>
                <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-black/20 p-2 rounded-xl">
                        <span className="block text-xl font-bold text-white">{previewStats.bmi > 0 ? previewStats.bmi : '--'}</span>
                        <span className="text-[10px] text-zinc-500">IMC</span>
                    </div>
                    <div className="bg-black/20 p-2 rounded-xl">
                        <span className="block text-xl font-bold text-white">{previewStats.bf ? previewStats.bf + '%' : '--'}</span>
                        <span className="text-[10px] text-zinc-500">% Gordura</span>
                    </div>
                    <div className="bg-black/20 p-2 rounded-xl">
                        <span className="block text-xl font-bold text-white">{previewStats.rcq || '--'}</span>
                        <span className="text-[10px] text-zinc-500">RCQ</span>
                    </div>
                </div>
                <button 
                    onClick={calculatePreview}
                    className="w-full mt-3 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-medium text-zinc-300 transition-colors"
                >
                    Atualizar Cálculos
                </button>
            </div>

            <div className="space-y-8">
                {/* Seção 1: Dados Básicos */}
                <section>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center text-xs">1</div>
                        Dados Básicos
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Data</label>
                            <input 
                                type="date" 
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none"
                                value={formData.date}
                                onChange={e => updateField('date', e.target.value)}
                            />
                        </div>
                        <div>
                             <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Idade</label>
                             <input 
                                type="number" 
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none"
                                value={formData.age_at_assessment}
                                onChange={e => updateField('age_at_assessment', e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Peso (kg)</label>
                            <input 
                                type="number" 
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                                value={formData.weight}
                                onChange={e => updateField('weight', e.target.value)}
                                onBlur={calculatePreview}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Altura (cm)</label>
                            <input 
                                type="number" 
                                className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                                value={formData.height}
                                onChange={e => updateField('height', e.target.value)}
                                onBlur={calculatePreview}
                            />
                        </div>
                    </div>
                </section>

                {/* Seção 2: Perímetros */}
                <section>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">2</div>
                        Perímetros (cm)
                    </h3>
                    <div className="bg-[#18181b] p-4 rounded-2xl border border-white/5 space-y-4">
                         {/* Essenciais para BF */}
                         <div className="grid grid-cols-3 gap-3 pb-4 border-b border-white/5">
                             <div>
                                <label className="text-[10px] uppercase font-bold text-emerald-500 mb-1 block">Pescoço *</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                                    value={formData.neck_cm || ''}
                                    onChange={e => updateField('neck_cm', e.target.value)}
                                    onBlur={calculatePreview}
                                />
                             </div>
                             <div>
                                <label className="text-[10px] uppercase font-bold text-emerald-500 mb-1 block">Cintura *</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                                    value={formData.waist_cm || ''}
                                    onChange={e => updateField('waist_cm', e.target.value)}
                                    onBlur={calculatePreview}
                                />
                             </div>
                             <div>
                                <label className="text-[10px] uppercase font-bold text-emerald-500 mb-1 block">Quadril {student.gender === 'F' && '*'}</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-emerald-500"
                                    value={formData.hips_cm || ''}
                                    onChange={e => updateField('hips_cm', e.target.value)}
                                    onBlur={calculatePreview}
                                />
                             </div>
                         </div>
                         
                         {/* Outros */}
                         <div className="grid grid-cols-3 gap-3">
                             <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Tórax</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none"
                                    value={formData.chest_cm || ''}
                                    onChange={e => updateField('chest_cm', e.target.value)}
                                />
                             </div>
                             <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Abdômen</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none"
                                    value={formData.abdomen_cm || ''}
                                    onChange={e => updateField('abdomen_cm', e.target.value)}
                                />
                             </div>
                             <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Braço D</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none"
                                    value={formData.arm_right_cm || ''}
                                    onChange={e => updateField('arm_right_cm', e.target.value)}
                                />
                             </div>
                             <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Coxa D</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none"
                                    value={formData.thigh_right_cm || ''}
                                    onChange={e => updateField('thigh_right_cm', e.target.value)}
                                />
                             </div>
                             <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1 block">Panturrilha</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none"
                                    value={formData.calf_cm || ''}
                                    onChange={e => updateField('calf_cm', e.target.value)}
                                />
                             </div>
                         </div>
                    </div>
                </section>

                {/* Seção 3: Fotos */}
                <section>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center text-xs">3</div>
                        Fotos do Físico (Opcional)
                    </h3>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: 'Frente', key: 'photo_front_url' as const },
                            { label: 'Costas', key: 'photo_back_url' as const },
                            { label: 'Perfil', key: 'photo_side_url' as const }
                        ].map((item) => (
                            <div key={item.key} className="relative group">
                                <div 
                                    onClick={() => !formData[item.key] && handleMockUpload(item.key)}
                                    className={`aspect-[3/4] rounded-xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all overflow-hidden ${
                                        formData[item.key] 
                                        ? 'border-transparent' 
                                        : 'border-zinc-700 hover:border-zinc-500 bg-zinc-900/50'
                                    }`}
                                >
                                    {formData[item.key] ? (
                                        <>
                                            <img src={formData[item.key]} alt={item.label} className="w-full h-full object-cover" />
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); updateField(item.key, ''); }}
                                                className="absolute top-1 right-1 bg-black/60 rounded-full p-1 text-white hover:bg-red-500"
                                            >
                                                <X size={12} />
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <Camera size={24} className="text-zinc-500 mb-2" />
                                            <span className="text-[10px] text-zinc-500 uppercase font-bold">{item.label}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Seção 4: Observações */}
                <section>
                    <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-zinc-700 text-zinc-300 flex items-center justify-center text-xs">4</div>
                        Observações
                    </h3>
                    <textarea 
                        rows={3}
                        className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none resize-none"
                        placeholder="Comentários sobre a avaliação..."
                        value={formData.notes || ''}
                        onChange={e => updateField('notes', e.target.value)}
                    />
                </section>
            </div>
        </div>
    </div>
  );
};
