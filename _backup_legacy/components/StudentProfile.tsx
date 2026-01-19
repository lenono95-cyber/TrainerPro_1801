
import React, { useEffect, useState, useRef } from 'react';
import { db } from '../services/supabaseService';
import { Student, UserRole, UserProfile } from '../types';
import { Camera, Scale, Ruler, Activity, Edit2, AlertTriangle, Lock, History, Save, X, LogOut, Info, Key, Loader2, Upload, Trash2 } from 'lucide-react';
import { ChangePasswordModal } from './ChangePasswordModal';

interface StudentProfileProps {
  user: UserProfile;
  primaryColor: string;
  onLogout: () => void;
}

export const StudentProfile: React.FC<StudentProfileProps> = ({ user, primaryColor, onLogout }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditingWeight, setIsEditingWeight] = useState(false);
  const [newWeight, setNewWeight] = useState('');
  const [isEditingBio, setIsEditingBio] = useState(false);
  const [bioForm, setBioForm] = useState({ height: 0, injuries: '' });
  const [warning, setWarning] = useState('');
  
  // Photo Upload State
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Password Modal State
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Account Deletion State
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    loadProfile();
  }, [user]);

  const loadProfile = async () => {
      // Mock: Recuperar student linkado
      const studentId = user.student_id_link || 's1';
      const data = await db.getStudentDetails(studentId);
      if (data) {
          setStudent(data);
          setBioForm({ height: data.height, injuries: data.injuries || '' });
          setNewWeight(data.weight.toString());
      }
      setLoading(false);
  };

  const handleWeightSave = async () => {
      if (!student) return;
      const weightVal = parseFloat(newWeight);
      if (!weightVal || weightVal <= 0) return alert("Peso inválido");
      
      await db.updateStudentProfile(student.id, { weight: weightVal }, UserRole.STUDENT);
      
      setIsEditingWeight(false);
      loadProfile();
  };

  const handleBioSave = async () => {
      if (!student) return;
      
      // Validação Inteligente: Mudança brusca de altura
      if (Math.abs(bioForm.height - student.height) > 5 && !warning) {
          setWarning(`Atenção: Você alterou sua altura em ${Math.abs(bioForm.height - student.height)}cm. Confirma que o valor anterior estava errado?`);
          return;
      }

      await db.updateStudentProfile(student.id, { 
          height: bioForm.height,
          // Goal é removido da edição do aluno
          injuries: bioForm.injuries
      }, UserRole.STUDENT);
      
      setWarning('');
      setIsEditingBio(false);
      loadProfile();
  };

  // --- PHOTO UPLOAD LOGIC ---
  const triggerFileInput = () => {
      if (fileInputRef.current && !isUploadingPhoto) {
          fileInputRef.current.click();
      }
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file || !student) return;

      // Reset input value to allow selecting the same file again if needed
      e.target.value = '';

      setIsUploadingPhoto(true);

      try {
          // 1. Upload
          const result = await db.uploadProfilePhoto(file);
          
          if (!result.success || !result.url) {
              alert(result.error || 'Erro ao enviar foto.');
              return;
          }

          // 2. Update Student Profile
          await db.updateStudentProfile(student.id, { avatar_url: result.url }, UserRole.STUDENT);
          
          // 3. Refresh Local State
          // (Mock: como updateStudentProfile atualiza o array global mockado, o reload vai pegar o novo dado)
          await loadProfile();

      } catch (err) {
          alert('Ocorreu um erro ao atualizar a foto.');
      } finally {
          setIsUploadingPhoto(false);
      }
  };

  // --- COMPLIANCE: DELETE ACCOUNT ---
  const handleDeleteAccount = async () => {
      if (!confirm("⚠️ ATENÇÃO: Esta ação é irreversível.\n\nDeseja excluir sua conta e todos os dados associados permanentemente?")) return;
      
      setIsDeleting(true);
      const result = await db.deleteCurrentUser(user.id);
      
      if (result.success) {
          alert("Sua conta foi excluída com sucesso.");
          onLogout(); // Redireciona para login
      } else {
          alert("Erro ao excluir conta: " + (result.error || "Tente novamente."));
          setIsDeleting(false);
      }
  };

  if (loading) return <div className="p-10 text-center text-zinc-500">Carregando perfil...</div>;
  if (!student) return <div className="p-10 text-center text-zinc-500">Erro ao carregar perfil.</div>;

  return (
    <div className="p-5 pb-24 space-y-6">
      <header className="mt-2 mb-6">
        <h1 className="text-3xl font-bold text-white">Meu Perfil</h1>
      </header>

      {/* Card Principal: Foto e Nome */}
      <div className="bg-[#18181b] p-6 rounded-3xl border border-white/5 relative overflow-hidden flex flex-col items-center">
        
        {/* AVATAR SECTION */}
        <div className="relative mb-4 group cursor-pointer" onClick={triggerFileInput}>
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-[#18181b] shadow-2xl relative bg-zinc-800">
                <img 
                    src={student.avatar_url || `https://ui-avatars.com/api/?name=${student.full_name}&background=random`} 
                    alt="Profile" 
                    className={`w-full h-full object-cover transition-opacity ${isUploadingPhoto ? 'opacity-50' : 'opacity-100'}`}
                />
                
                {/* Loading Overlay */}
                {isUploadingPhoto && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                        <Loader2 className="animate-spin text-white" size={24} />
                    </div>
                )}
            </div>
            
            {/* Camera Icon Overlay */}
            <div className={`absolute bottom-0 right-0 p-2 rounded-full border-2 border-[#18181b] text-white transition-colors ${isUploadingPhoto ? 'bg-zinc-600' : 'bg-zinc-800 hover:bg-blue-600'}`}>
                <Camera size={16} />
            </div>

            {/* Hidden Input */}
            <input 
                type="file" 
                ref={fileInputRef}
                className="hidden"
                accept="image/png, image/jpeg, image/webp"
                onChange={handlePhotoUpload}
            />
        </div>

        <h2 className="text-xl font-bold text-white">{student.full_name}</h2>
        <p className="text-zinc-500 text-sm mt-1">{student.email || user.email}</p>
        
        {/* Badge Nível (Read Only) */}
        <div className="mt-4 flex items-center gap-2 bg-zinc-900/50 px-3 py-1.5 rounded-full border border-white/5">
            <Lock size={12} className="text-zinc-600" />
            <span className="text-xs text-zinc-400 font-medium uppercase tracking-wide">Nível: <span className="text-white font-bold">{student.level}</span></span>
        </div>
      </div>

      {/* Grid Dados Físicos */}
      <div className="grid grid-cols-2 gap-4">
        {/* Peso (Editável) */}
        <button 
            onClick={() => setIsEditingWeight(true)}
            className="text-left bg-[#18181b] p-5 rounded-3xl border border-white/5 relative active:scale-95 transition-all cursor-pointer group"
        >
             <div className="absolute top-4 right-4 text-zinc-600 group-hover:text-white transition-colors" aria-label="Editar peso">
                <Edit2 size={16} />
             </div>
             <div className="mb-3 p-2 w-fit rounded-xl bg-zinc-800/50 text-blue-400">
                <Scale size={20} />
             </div>
             <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Peso</span>
             <p className="text-2xl font-bold text-white mt-1">{student.weight} <span className="text-sm font-normal text-zinc-500">kg</span></p>
        </button>

        {/* Altura (Editável) */}
        <button 
             onClick={() => {
                 setBioForm({ ...bioForm, height: student.height });
                 setIsEditingBio(true);
             }}
            className="text-left bg-[#18181b] p-5 rounded-3xl border border-white/5 relative active:scale-95 transition-all cursor-pointer group"
        >
             <div className="absolute top-4 right-4 text-zinc-600 group-hover:text-white transition-colors" aria-label="Editar altura">
                <Edit2 size={16} />
             </div>
             <div className="mb-3 p-2 w-fit rounded-xl bg-zinc-800/50 text-emerald-400">
                <Ruler size={20} />
             </div>
             <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">Altura</span>
             <p className="text-2xl font-bold text-white mt-1">{student.height} <span className="text-sm font-normal text-zinc-500">cm</span></p>
        </button>
      </div>

      {/* Objetivo e Histórico */}
      <div className="bg-[#18181b] p-6 rounded-3xl border border-white/5 space-y-6">
         <div className="flex justify-between items-center">
            <h3 className="font-bold text-white">Dados de Treino</h3>
            <button 
                onClick={() => setIsEditingBio(true)}
                className="text-xs text-zinc-400 flex items-center gap-1 hover:text-white"
            >
                <Edit2 size={12} /> Editar
            </button>
         </div>

         <div className="space-y-4">
             <div>
                 <div className="flex justify-between items-center mb-1">
                     <label className="text-xs text-zinc-500 uppercase font-bold">Objetivo Atual</label>
                     <div title="Apenas Personal pode alterar">
                        <Lock size={12} className="text-zinc-700"/>
                     </div>
                 </div>
                 <p className="text-white font-medium bg-zinc-900/50 p-3 rounded-xl border border-white/5 text-sm">{student.goal}</p>
             </div>
             
             <div className="pt-4 border-t border-white/5">
                 <label className="text-xs text-zinc-500 uppercase font-bold flex items-center gap-2">
                    Histórico de Saúde <Activity size={12} />
                 </label>
                 {student.injuries ? (
                     <div className="mt-2 bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-sm text-red-300">
                        {student.injuries}
                     </div>
                 ) : (
                     <p className="text-zinc-600 text-sm mt-1 italic">Nenhuma lesão registrada.</p>
                 )}
             </div>
         </div>
      </div>

      {/* Security Actions */}
      <div className="space-y-3">
          <button 
            onClick={() => setShowPasswordModal(true)}
            className="w-full py-4 rounded-2xl bg-zinc-800 border border-white/5 text-zinc-300 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-zinc-700 hover:text-white"
          >
            <Key size={18} />
            Alterar Senha
          </button>

          <button 
            onClick={onLogout}
            className="w-full py-4 rounded-2xl border border-red-500/20 bg-red-500/5 text-red-500 font-bold flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-red-500/10"
          >
            <LogOut size={20} />
            Sair do App
          </button>
      </div>

      {/* DELETE ACCOUNT (DANGER ZONE) */}
      <div className="pt-8 mt-8 border-t border-white/5 text-center">
          <button 
            onClick={handleDeleteAccount}
            disabled={isDeleting}
            className="text-xs text-zinc-600 hover:text-red-500 underline flex items-center justify-center gap-2 w-full py-2 transition-colors"
          >
              {isDeleting ? <Loader2 className="animate-spin" size={12}/> : <Trash2 size={12} />}
              {isDeleting ? 'Excluindo...' : 'Excluir minha conta permanentemente'}
          </button>
          <p className="text-[10px] text-zinc-700 mt-2">
              Ao excluir, todos os seus dados serão apagados conforme a LGPD/GDPR.
          </p>
      </div>

      {/* MODAL: EDITAR PESO */}
      {isEditingWeight && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-[#18181b] w-full max-w-xs rounded-3xl p-6 border border-white/10 shadow-2xl">
                  <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400">
                          <Scale size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-white">Atualizar Peso</h3>
                      <p className="text-xs text-zinc-500 mt-2">Seu personal será notificado automaticamente da sua evolução.</p>
                  </div>

                  <div className="space-y-4">
                      <div className="relative">
                          <input 
                            type="number" 
                            autoFocus
                            aria-label="Novo peso em kg"
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-2xl py-4 text-center text-3xl font-bold text-white focus:outline-none focus:border-blue-500 transition-colors"
                            value={newWeight}
                            onChange={(e) => setNewWeight(e.target.value)}
                          />
                          <span className="absolute right-8 top-1/2 -translate-y-1/2 text-zinc-500 font-medium">kg</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => setIsEditingWeight(false)}
                            className="py-3 rounded-xl font-medium text-zinc-400 hover:bg-zinc-800 transition-colors"
                          >
                            Cancelar
                          </button>
                          <button 
                            onClick={handleWeightSave}
                            className="py-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors shadow-lg shadow-blue-500/20"
                          >
                            Salvar
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: EDITAR BIO (ALTURA APENAS) */}
      {isEditingBio && (
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
              <div className="bg-[#18181b] w-full max-w-md sm:rounded-3xl rounded-t-3xl p-6 border border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-300">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="text-xl font-bold text-white">Editar Dados</h3>
                      <button onClick={() => { setIsEditingBio(false); setWarning(''); }} className="p-2 bg-zinc-800 rounded-full text-zinc-400">
                          <X size={20} />
                      </button>
                  </div>

                  <div className="space-y-4">
                      <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Altura (cm)</label>
                          <input 
                            type="number" 
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500"
                            value={bioForm.height}
                            onChange={(e) => setBioForm({...bioForm, height: parseInt(e.target.value)})}
                          />
                      </div>

                      {/* Objetivo é somente leitura para o aluno */}
                      <div>
                           <div className="flex gap-2 items-center mb-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase block">Objetivo</label>
                                <span className="text-[10px] bg-zinc-800 px-2 rounded text-zinc-400">Fale com seu Personal</span>
                           </div>
                           <div className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-4 text-zinc-400 flex justify-between items-center">
                               {student.goal}
                               <Lock size={16} />
                           </div>
                      </div>

                      <div>
                          <label className="text-xs font-bold text-zinc-500 uppercase mb-2 block">Histórico de Lesões</label>
                          <textarea 
                            rows={3}
                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-4 text-white focus:outline-none focus:border-emerald-500 resize-none"
                            placeholder="Descreva cirurgias ou dores crônicas..."
                            value={bioForm.injuries}
                            onChange={(e) => setBioForm({...bioForm, injuries: e.target.value})}
                          />
                      </div>

                      {warning && (
                          <div className="bg-yellow-500/10 border border-yellow-500/20 p-4 rounded-xl flex gap-3">
                              <AlertTriangle className="text-yellow-500 shrink-0" size={20} />
                              <p className="text-sm text-yellow-200">{warning}</p>
                          </div>
                      )}

                      <button 
                        onClick={handleBioSave}
                        className="w-full py-4 rounded-xl font-bold text-black mt-4 active:scale-[0.98] transition-all"
                        style={{ backgroundColor: primaryColor }}
                      >
                        {warning ? 'Confirmar Alteração' : 'Salvar Alterações'}
                      </button>
                  </div>
              </div>
          </div>
      )}

      {/* MODAL: CHANGE PASSWORD */}
      <ChangePasswordModal 
        isOpen={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
        user={user}
        onSuccess={() => {
            alert('Senha alterada com sucesso!'); // Simple feedback
        }}
      />

    </div>
  );
};
