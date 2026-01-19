
import { useState, useEffect } from 'react';
import { db } from '../services/supabaseService';
import { AutoMessageConfig } from '../types';
import { DEFAULT_MESSAGE_CONFIG } from '../services/mockData';

export const useConfigMensagens = () => {
  const [config, setConfig] = useState<AutoMessageConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const data = await db.getMessageConfig();
      setConfig(data);
    } catch (err) {
      setError('Erro ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  };

  const updateConfigField = (field: keyof AutoMessageConfig, value: any) => {
    if (!config) return;
    setConfig({ ...config, [field]: value });
  };

  const saveConfig = async () => {
    if (!config) return;
    
    // Validação básica
    if (config.reminder_24h_active && !config.reminder_24h_text.trim()) {
        alert("O texto do lembrete de 24h não pode estar vazio.");
        return;
    }

    try {
      setSaving(true);
      await db.updateMessageConfig(config);
    } catch (err) {
      alert("Erro ao salvar configurações");
    } finally {
      setSaving(false);
    }
  };

  const restoreDefaults = async () => {
    if (!window.confirm("Tem certeza? Todas as personalizações serão perdidas.")) return;
    try {
        setLoading(true);
        const newConfig = await db.resetMessageConfig();
        setConfig(newConfig);
    } finally {
        setLoading(false);
    }
  };

  return {
    config,
    loading,
    saving,
    error,
    updateConfigField,
    saveConfig,
    restoreDefaults
  };
};
