
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { db } from '../services/supabaseService';
import { ScheduleSlot, UserProfile, UserRole, Student } from '../types';
import { Calendar as CalendarIcon, Clock, Lock, User, AlertCircle, CheckCircle2, ChevronRight, Ban, Bell, Plus, ChevronLeft, Trash2, X, MapPin, MoreVertical, Edit2, Repeat, CalendarRange, ListPlus } from 'lucide-react';
import { NotificationCenter } from './NotificationCenter';

interface ScheduleViewProps {
  user: UserProfile;
  primaryColor: string;
}

type ViewMode = 'day' | 'week' | 'month';
type CreationMode = 'single' | 'bulk';

export const ScheduleView: React.FC<ScheduleViewProps> = ({ user, primaryColor }) => {
  const [slots, setSlots] = useState<ScheduleSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  
  // Modals & Sheets
  const [isCreatingEvent, setIsCreatingEvent] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState<ScheduleSlot | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Creation Mode State
  const [creationMode, setCreationMode] = useState<CreationMode>('single');

  // Form State (Single)
  const [eventForm, setEventForm] = useState<Partial<ScheduleSlot>>({
      date: new Date().toISOString().split('T')[0],
      time: '08:00',
      type: 'class',
      title: '',
      status: 'available',
      notes: ''
  });

  // Form State (Bulk)
  const [bulkForm, setBulkForm] = useState({
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
      selectedWeekDays: [] as number[], // 0-6 (Sun-Sat)
      selectedTimes: [] as string[], // Array of time strings "08:00"
      newTimeInput: '08:00',
      type: 'class' as any,
      status: 'available' as any,
      title: ''
  });

  const [formLoading, setFormLoading] = useState(false);
  
  // Data for Selects
  const [students, setStudents] = useState<Student[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [scheduleData, studentsData, notifs] = await Promise.all([
        db.getSchedule(),
        db.getStudents(),
        db.getNotifications(user.id)
    ]);
    setSlots(scheduleData);
    setStudents(studentsData);
    setUnreadCount(notifs.filter(n => !n.read).length);
    setLoading(false);
  };

  // --- CALENDAR LOGIC ---

  const getStartOfWeek = (date: Date) => {
      const d = new Date(date);
      const day = d.getDay();
      const diff = d.getDate() - day + (day === 0 ? -6 : 1); 
      // Adjusting to Sunday start for standard view
      const sunday = d.getDate() - day;
      return new Date(d.setDate(sunday));
  };

  const addDays = (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
  };

  const isSameDay = (d1: Date, d2: Date) => {
      return d1.toISOString().split('T')[0] === d2.toISOString().split('T')[0];
  };

  const getEventsForDay = (date: Date) => {
      const dateStr = date.toISOString().split('T')[0];
      return slots.filter(s => s.date === dateStr).sort((a,b) => a.time.localeCompare(b.time));
  };

  // --- HANDLERS ---

  const handlePrev = () => {
      const newDate = new Date(currentDate);
      if (viewMode === 'day') newDate.setDate(newDate.getDate() - 1);
      if (viewMode === 'week') newDate.setDate(newDate.getDate() - 7);
      if (viewMode === 'month') newDate.setMonth(newDate.getMonth() - 1);
      setCurrentDate(newDate);
  };

  const handleNext = () => {
      const newDate = new Date(currentDate);
      if (viewMode === 'day') newDate.setDate(newDate.getDate() + 1);
      if (viewMode === 'week') newDate.setDate(newDate.getDate() + 7);
      if (viewMode === 'month') newDate.setMonth(newDate.getMonth() + 1);
      setCurrentDate(newDate);
  };

  const openCreateModal = () => {
      setSelectedSlot(null);
      setCreationMode('single'); // Reset to single by default
      const todayStr = currentDate.toISOString().split('T')[0];
      
      // Reset Single Form
      setEventForm({
          date: todayStr,
          time: '09:00',
          type: 'class',
          title: '',
          status: 'available',
          notes: ''
      });

      // Reset Bulk Form
      setBulkForm({
          startDate: todayStr,
          endDate: new Date(new Date(currentDate).setDate(currentDate.getDate() + 30)).toISOString().split('T')[0],
          selectedWeekDays: [1, 3, 5], // Default Mon, Wed, Fri
          selectedTimes: ['09:00'],
          newTimeInput: '10:00',
          type: 'class',
          status: 'available',
          title: ''
      });

      setIsCreatingEvent(true);
  };

  // --- BULK LOGIC HELPER ---
  const generateBulkSlots = () => {
      const generated: Omit<ScheduleSlot, 'id' | 'tenant_id'>[] = [];
      const start = new Date(bulkForm.startDate + 'T00:00:00');
      const end = new Date(bulkForm.endDate + 'T00:00:00');
      
      // Safety check
      if (start > end) return [];
      if (bulkForm.selectedTimes.length === 0) return [];
      if (bulkForm.selectedWeekDays.length === 0) return [];

      let curr = new Date(start);
      // Loop dias
      while (curr <= end) {
          const dayOfWeek = curr.getDay(); // 0-6
          if (bulkForm.selectedWeekDays.includes(dayOfWeek)) {
              const dateStr = curr.toISOString().split('T')[0];
              // Loop Times
              bulkForm.selectedTimes.forEach(time => {
                  generated.push({
                      date: dateStr,
                      time: time,
                      type: bulkForm.type,
                      status: bulkForm.status,
                      title: bulkForm.title,
                      notes: ''
                  });
              });
          }
          curr.setDate(curr.getDate() + 1);
      }
      return generated;
  };

  const handleAddBulkTime = () => {
      if (!bulkForm.newTimeInput) return;
      if (!bulkForm.selectedTimes.includes(bulkForm.newTimeInput)) {
          setBulkForm(prev => ({
              ...prev,
              selectedTimes: [...prev.selectedTimes, prev.newTimeInput].sort()
          }));
      }
  };

  const handleRemoveBulkTime = (t: string) => {
      setBulkForm(prev => ({
          ...prev,
          selectedTimes: prev.selectedTimes.filter(time => time !== t)
      }));
  };

  const toggleWeekDay = (dayIndex: number) => {
      setBulkForm(prev => {
          const exists = prev.selectedWeekDays.includes(dayIndex);
          return {
              ...prev,
              selectedWeekDays: exists 
                  ? prev.selectedWeekDays.filter(d => d !== dayIndex)
                  : [...prev.selectedWeekDays, dayIndex]
          };
      });
  };

  const handleSaveEvent = async () => {
      setFormLoading(true);

      if (creationMode === 'single') {
          if (!eventForm.date || !eventForm.time) {
              setFormLoading(false);
              return alert("Data e Hora são obrigatórios");
          }

          const payload = {
              ...eventForm,
              student_name: eventForm.student_id ? students.find(s => s.id === eventForm.student_id)?.full_name : undefined
          };

          if (selectedSlot) {
              await db.updateScheduleSlot(selectedSlot.id, payload);
          } else {
              await db.createScheduleSlot(payload as any);
          }
      } else {
          // BULK CREATE
          const slotsToCreate = generateBulkSlots();
          if (slotsToCreate.length === 0) {
              setFormLoading(false);
              return alert("Nenhum horário gerado. Verifique o intervalo e os dias selecionados.");
          }
          if (confirm(`Confirmar criação de ${slotsToCreate.length} novos horários na agenda?`)) {
              await db.createScheduleSlotsBatch(slotsToCreate);
          } else {
              setFormLoading(false);
              return;
          }
      }

      await loadData(); // Refresh
      setFormLoading(false);
      setIsCreatingEvent(false);
      setSelectedSlot(null);
  };

  const handleDeleteEvent = async () => {
      if (!selectedSlot) return;
      if (!confirm("Tem certeza que deseja excluir este evento?")) return;
      
      setFormLoading(true);
      await db.deleteScheduleSlot(selectedSlot.id);
      await loadData();
      setFormLoading(false);
      setSelectedSlot(null);
  };

  const openEventDetail = (slot: ScheduleSlot) => {
      setSelectedSlot(slot);
      setEventForm({ ...slot });
      setCreationMode('single'); // Editing is always single mode
      setIsCreatingEvent(true);
  };

  // --- RENDERERS ---

  const renderMonthView = () => {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const firstDayOfMonth = new Date(year, month, 1);
      const startingDay = firstDayOfMonth.getDay(); // 0 (Sun) to 6 (Sat)
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      const blanks = Array.from({ length: startingDay });
      const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

      return (
          <div className="grid grid-cols-7 gap-1 text-center">
              {['D', 'S', 'T', 'Q', 'Q', 'S', 'S'].map(d => (
                  <div key={d} className="text-[10px] text-zinc-500 font-bold py-2">{d}</div>
              ))}
              {blanks.map((_, i) => <div key={`blank-${i}`} className="h-14" />)}
              {days.map(d => {
                  const date = new Date(year, month, d);
                  const isToday = isSameDay(date, new Date());
                  const isSelected = isSameDay(date, currentDate);
                  const dayEvents = getEventsForDay(date);
                  const hasEvents = dayEvents.length > 0;

                  return (
                      <button 
                        key={d} 
                        onClick={() => {
                            setCurrentDate(date);
                            setViewMode('day'); // Drill down
                        }}
                        className={`h-14 rounded-xl flex flex-col items-center justify-start pt-2 relative transition-all ${
                            isSelected ? 'bg-zinc-800 border border-white/20' : 'hover:bg-zinc-800/50'
                        }`}
                      >
                          <span className={`text-xs font-medium ${isToday ? 'text-blue-400 font-bold' : 'text-zinc-300'}`}>{d}</span>
                          {hasEvents && (
                              <div className="mt-1 flex gap-0.5">
                                  {dayEvents.slice(0, 3).map((ev, i) => (
                                      <div key={i} className={`w-1 h-1 rounded-full ${ev.status === 'booked' ? 'bg-green-500' : 'bg-zinc-600'}`} />
                                  ))}
                              </div>
                          )}
                      </button>
                  );
              })}
          </div>
      );
  };

  const renderWeekView = () => {
      const start = getStartOfWeek(currentDate);
      const weekDays = Array.from({ length: 7 }, (_, i) => addDays(start, i));

      return (
          <div className="space-y-4">
              {/* Horizontal Days Strip */}
              <div className="flex justify-between bg-zinc-900/50 p-2 rounded-2xl overflow-x-auto">
                  {weekDays.map((date, i) => {
                      const isSelected = isSameDay(date, currentDate);
                      const hasEvents = getEventsForDay(date).length > 0;
                      return (
                          <button
                            key={i}
                            onClick={() => setCurrentDate(date)}
                            className={`flex flex-col items-center justify-center w-12 h-16 rounded-xl transition-all ${
                                isSelected ? 'bg-zinc-700 shadow-md' : 'hover:bg-zinc-800'
                            }`}
                            style={isSelected ? { borderBottom: `3px solid ${primaryColor}` } : {}}
                          >
                              <span className="text-[10px] text-zinc-500 uppercase">{date.toLocaleDateString('pt-BR', {weekday: 'short'}).slice(0,3)}</span>
                              <span className={`text-lg font-bold ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{date.getDate()}</span>
                              {hasEvents && <div className="w-1 h-1 rounded-full bg-white mt-1" />}
                          </button>
                      );
                  })}
              </div>

              {/* List for Selected Day in Week View */}
              <div className="space-y-2">
                  <h3 className="text-sm font-bold text-zinc-400 px-2">{currentDate.toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric', month: 'long'})}</h3>
                  {renderDayEventsList(currentDate)}
              </div>
          </div>
      );
  };

  const renderDayEventsList = (date: Date) => {
      const events = getEventsForDay(date);
      
      if (events.length === 0) {
          return (
              <div className="flex flex-col items-center justify-center py-10 text-zinc-500 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20">
                  <CalendarIcon size={32} className="mb-2 opacity-20" />
                  <p className="text-xs">Sem eventos para este dia</p>
                  {user.role === UserRole.TRAINER && (
                      <button onClick={openCreateModal} className="mt-3 text-xs font-bold text-blue-400 hover:underline">
                          + Adicionar Evento
                      </button>
                  )}
              </div>
          );
      }

      return events.map(slot => (
          <button 
            key={slot.id}
            onClick={() => user.role === UserRole.TRAINER ? openEventDetail(slot) : null}
            className={`w-full text-left p-4 rounded-2xl border flex items-center gap-4 transition-all active:scale-[0.99] ${
                slot.status === 'booked' ? 'bg-zinc-800 border-zinc-700' : 
                slot.status === 'blocked' ? 'bg-zinc-900/50 border-red-900/20 opacity-70' :
                'bg-[#18181b] border-white/5'
            }`}
          >
              <div className="flex flex-col items-center justify-center min-w-[50px] border-r border-white/5 pr-4">
                  <span className="text-sm font-bold text-white">{slot.time}</span>
                  <span className="text-[10px] text-zinc-500">
                      {slot.end_time || (parseInt(slot.time.split(':')[0]) + 1) + ':' + slot.time.split(':')[1]}
                  </span>
              </div>
              
              <div className="flex-1">
                  <div className="flex justify-between items-start">
                      <h4 className="font-bold text-white text-sm">{slot.title || slot.student_name || 'Disponível'}</h4>
                      {getStatusBadge(slot.status)}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-1">
                      {slot.type === 'workout' && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-1.5 py-0.5 rounded">Treino</span>}
                      {slot.type === 'assessment' && <span className="text-[10px] bg-purple-500/20 text-purple-400 px-1.5 py-0.5 rounded">Avaliação</span>}
                      {slot.notes && <span className="text-[10px] text-zinc-500 truncate max-w-[150px]">{slot.notes}</span>}
                  </div>
              </div>
              
              {user.role === UserRole.TRAINER && <ChevronRight size={16} className="text-zinc-600" />}
          </button>
      ));
  };

  const getStatusBadge = (status: string) => {
      switch(status) {
          case 'booked': return <span className="text-[10px] font-bold text-green-500 flex items-center gap-1"><CheckCircle2 size={10}/> Confirmado</span>;
          case 'blocked': return <span className="text-[10px] font-bold text-red-500 flex items-center gap-1"><Ban size={10}/> Bloqueado</span>;
          case 'completed': return <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">Concluído</span>;
          default: return <span className="text-[10px] font-bold text-blue-400 flex items-center gap-1">Livre</span>;
      }
  };

  const weekDayLabels = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <>
    <div className="p-5 space-y-6 pb-24 min-h-screen bg-[#09090b]">
        {/* Header Principal */}
        <header className="flex justify-between items-center mt-2 sticky top-0 bg-[#09090b] z-20 py-2">
            <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                    Agenda
                    {user.role === UserRole.TRAINER && <span className="text-[10px] bg-zinc-800 px-2 py-0.5 rounded text-zinc-400 font-normal">Personal</span>}
                </h1>
            </div>
            <div className="flex gap-2">
                <button 
                    onClick={() => {
                        setShowNotifications(true);
                        setUnreadCount(0); 
                    }}
                    className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center border border-white/5 relative"
                >
                    <Bell size={20} className="text-white" />
                    {unreadCount > 0 && <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#18181b]" />}
                </button>
                {user.role === UserRole.TRAINER && (
                    <button 
                        onClick={openCreateModal}
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-lg active:scale-95"
                        style={{ backgroundColor: primaryColor }}
                    >
                        <Plus size={24} />
                    </button>
                )}
            </div>
        </header>

        {/* Date Navigator & View Switcher */}
        <div className="bg-[#18181b] p-1 rounded-2xl border border-white/5 flex flex-col gap-3">
            <div className="flex justify-between items-center px-2 pt-2">
                <div className="flex items-center gap-2">
                    <button onClick={handlePrev} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"><ChevronLeft size={20}/></button>
                    <span className="font-bold text-white text-lg">
                        {currentDate.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
                    </span>
                    <button onClick={handleNext} className="p-1 hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"><ChevronRight size={20}/></button>
                </div>
                
                {/* View Switcher Pills */}
                <div className="flex bg-zinc-900 p-1 rounded-lg">
                    {(['day', 'week', 'month'] as const).map(mode => (
                        <button
                            key={mode}
                            onClick={() => setViewMode(mode)}
                            className={`px-3 py-1 text-[10px] font-bold uppercase rounded-md transition-all ${
                                viewMode === mode ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                        >
                            {mode === 'day' ? 'Dia' : mode === 'week' ? 'Sem' : 'Mês'}
                        </button>
                    ))}
                </div>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="animate-in fade-in duration-300">
            {loading ? (
                <div className="py-20 text-center text-zinc-500">Carregando agenda...</div>
            ) : (
                <>
                    {viewMode === 'month' && renderMonthView()}
                    {viewMode === 'week' && renderWeekView()}
                    {viewMode === 'day' && (
                        <div className="space-y-3">
                            <div className="flex justify-between items-center px-1 mb-2">
                                <span className="text-zinc-400 text-sm font-bold">{currentDate.toLocaleDateString('pt-BR', {weekday: 'long', day: 'numeric'})}</span>
                                {isSameDay(currentDate, new Date()) && <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full font-bold">Hoje</span>}
                            </div>
                            {renderDayEventsList(currentDate)}
                        </div>
                    )}
                </>
            )}
        </div>
    </div>

    {/* --- CREATE / EDIT EVENT MODAL --- */}
    {/* FIX: Usando PORTAL para garantir z-index acima de tudo (inclusive Nav Bar e Layout) */}
    {isCreatingEvent && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center sm:p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#18181b] w-full max-w-md sm:rounded-3xl rounded-t-3xl border border-white/10 shadow-2xl animate-in slide-in-from-bottom duration-300 max-h-[85dvh] flex flex-col overflow-hidden relative">
                
                {/* Header with Mode Switcher */}
                <div className="p-4 border-b border-white/5 bg-[#18181b]">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-xl font-bold text-white">{selectedSlot ? 'Editar Evento' : 'Novo Evento'}</h3>
                        <button onClick={() => { setIsCreatingEvent(false); setSelectedSlot(null); }} className="p-2 bg-zinc-800 rounded-full text-zinc-400 hover:text-white">
                            <X size={20} />
                        </button>
                    </div>
                    
                    {!selectedSlot && (
                        <div className="flex p-1 bg-zinc-900 rounded-xl">
                            <button 
                                onClick={() => setCreationMode('single')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${creationMode === 'single' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500'}`}
                            >
                                Data Única
                            </button>
                            <button 
                                onClick={() => setCreationMode('bulk')}
                                className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1 ${creationMode === 'bulk' ? 'bg-zinc-700 text-white shadow' : 'text-zinc-500'}`}
                            >
                                <Repeat size={12} /> Múltiplas Datas
                            </button>
                        </div>
                    )}
                </div>

                {/* Scrollable Content */}
                <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                    
                    {/* --- SINGLE MODE FORM --- */}
                    {creationMode === 'single' && (
                        <div className="space-y-4">
                            {/* Date & Time Row */}
                            <div className="grid grid-cols-2 gap-3">
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block">Data</label>
                                    <div className="relative">
                                        <input 
                                            type="date"
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                                            value={eventForm.date}
                                            onChange={e => setEventForm({...eventForm, date: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block">Horário</label>
                                    <div className="relative">
                                        <input 
                                            type="time"
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                                            value={eventForm.time}
                                            onChange={e => setEventForm({...eventForm, time: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Type Selector */}
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block">Tipo de Evento</label>
                                <div className="flex bg-zinc-900 p-1.5 rounded-xl gap-1">
                                    {(['class', 'workout', 'assessment', 'other'] as const).map(t => (
                                        <button
                                            type="button" 
                                            key={t}
                                            onClick={(e) => {
                                                e.preventDefault();
                                                setEventForm(prev => ({...prev, type: t}));
                                            }}
                                            className={`flex-1 py-3 rounded-lg text-xs font-bold capitalize transition-all duration-200 cursor-pointer ${
                                                eventForm.type === t 
                                                ? 'bg-zinc-700 text-white shadow-md ring-1 ring-white/10' 
                                                : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'
                                            }`}
                                        >
                                            {t === 'class' ? 'Aula' : t === 'workout' ? 'Treino' : t === 'assessment' ? 'Aval.' : 'Outro'}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Student Select (Optional) */}
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block">Aluno (Opcional)</label>
                                <select 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500 appearance-none"
                                    value={eventForm.student_id || ''}
                                    onChange={e => setEventForm({...eventForm, student_id: e.target.value, status: e.target.value ? 'booked' : 'available'})}
                                >
                                    <option value="">-- Selecione --</option>
                                    {students.map(s => (
                                        <option key={s.id} value={s.id}>{s.full_name}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Title */}
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block">Título / Descrição</label>
                                <input 
                                    type="text"
                                    placeholder={eventForm.student_id ? "Ex: Treino de Perna" : "Ex: Horário Livre"}
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500"
                                    value={eventForm.title || ''}
                                    onChange={e => setEventForm({...eventForm, title: e.target.value})}
                                />
                            </div>

                            {/* Status */}
                            <div className="pb-4">
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-1.5 block">Status</label>
                                <select 
                                    className="w-full bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none focus:border-blue-500 appearance-none"
                                    value={eventForm.status}
                                    onChange={e => setEventForm({...eventForm, status: e.target.value as any})}
                                >
                                    <option value="available">Disponível (Livre)</option>
                                    <option value="booked">Agendado (Ocupado)</option>
                                    <option value="blocked">Bloqueado</option>
                                    <option value="completed">Concluído</option>
                                </select>
                            </div>
                        </div>
                    )}

                    {/* --- BULK MODE FORM --- */}
                    {creationMode === 'bulk' && (
                        <div className="space-y-6">
                            {/* Date Range */}
                            <div className="bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                                <h4 className="text-xs font-bold text-zinc-400 uppercase mb-3 flex items-center gap-2">
                                    <CalendarRange size={14} /> Intervalo de Datas
                                </h4>
                                <div className="grid grid-cols-2 gap-3">
                                    <div>
                                        <label className="text-[10px] text-zinc-500 mb-1 block">Início</label>
                                        <input 
                                            type="date"
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-xs focus:outline-none"
                                            value={bulkForm.startDate}
                                            onChange={e => setBulkForm({...bulkForm, startDate: e.target.value})}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-zinc-500 mb-1 block">Fim</label>
                                        <input 
                                            type="date"
                                            className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-2 text-white text-xs focus:outline-none"
                                            value={bulkForm.endDate}
                                            onChange={e => setBulkForm({...bulkForm, endDate: e.target.value})}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Days of Week */}
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block">Dias da Semana</label>
                                <div className="flex justify-between gap-1">
                                    {weekDayLabels.map((label, index) => {
                                        const isSelected = bulkForm.selectedWeekDays.includes(index);
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => toggleWeekDay(index)}
                                                className={`w-10 h-10 rounded-full text-xs font-bold transition-all ${
                                                    isSelected 
                                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                                                    : 'bg-zinc-900 text-zinc-500 hover:bg-zinc-800'
                                                }`}
                                            >
                                                {label.charAt(0)}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Times */}
                            <div>
                                <label className="text-[10px] uppercase font-bold text-zinc-500 mb-2 block flex items-center justify-between">
                                    <span>Horários por Dia</span>
                                    <span className="text-[10px] text-zinc-600">{bulkForm.selectedTimes.length} horários</span>
                                </label>
                                
                                <div className="flex gap-2 mb-3">
                                    <input 
                                        type="time" 
                                        className="flex-1 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-white text-sm focus:outline-none"
                                        value={bulkForm.newTimeInput}
                                        onChange={e => setBulkForm({...bulkForm, newTimeInput: e.target.value})}
                                    />
                                    <button 
                                        onClick={handleAddBulkTime}
                                        className="px-4 bg-zinc-800 hover:bg-zinc-700 rounded-xl text-white font-bold transition-colors"
                                    >
                                        <Plus size={20} />
                                    </button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    {bulkForm.selectedTimes.map(time => (
                                        <div key={time} className="bg-zinc-800 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-white/5">
                                            <span className="text-white text-xs font-mono">{time}</span>
                                            <button onClick={() => handleRemoveBulkTime(time)} className="text-zinc-500 hover:text-red-400">
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                    {bulkForm.selectedTimes.length === 0 && (
                                        <span className="text-xs text-zinc-600 italic py-2">Adicione horários acima (ex: 08:00, 09:00)</span>
                                    )}
                                </div>
                            </div>

                            {/* Preview Stats */}
                            <div className="bg-blue-500/10 border border-blue-500/20 p-4 rounded-xl flex items-center gap-3">
                                <div className="bg-blue-500/20 p-2 rounded-full text-blue-400">
                                    <ListPlus size={20} />
                                </div>
                                <div>
                                    <span className="block text-sm font-bold text-white">
                                        {generateBulkSlots().length} Horários
                                    </span>
                                    <span className="text-[10px] text-blue-300">
                                        Serão gerados com as configurações acima.
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Sticky Footer Actions - Fixed for Mobile */}
                <div className="p-6 border-t border-white/5 bg-[#18181b] sm:rounded-b-3xl pb-10 sm:pb-6 z-20">
                    <div className="flex gap-3">
                        {selectedSlot && (
                            <button 
                                onClick={handleDeleteEvent}
                                disabled={formLoading}
                                className="p-3.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition-colors"
                            >
                                <Trash2 size={20} />
                            </button>
                        )}
                        <button 
                            onClick={handleSaveEvent}
                            disabled={formLoading}
                            className="flex-1 py-3.5 rounded-xl font-bold text-black shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2"
                            style={{ backgroundColor: primaryColor }}
                        >
                            {formLoading ? 'Salvando...' : selectedSlot ? 'Atualizar Evento' : creationMode === 'bulk' ? 'Gerar Horários' : 'Criar Evento'}
                        </button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    )}

    <NotificationCenter 
        user={user} 
        isOpen={showNotifications} 
        onClose={() => setShowNotifications(false)}
        primaryColor={primaryColor}
    />
    </>
  );
};
