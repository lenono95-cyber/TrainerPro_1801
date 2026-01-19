
interface VariableMap {
  nome?: string;
  horario?: string;
  dia?: string;
  treino?: string;
  sequencia?: number;
  personal?: string;
}

export const replaceVariables = (template: string, variables: VariableMap): string => {
  let result = template;
  
  const map: Record<string, string> = {
    '{nome}': variables.nome || 'Aluno',
    '{horario}': variables.horario || '--:--',
    '{dia}': variables.dia || 'hoje',
    '{treino}': variables.treino || 'Treino',
    '{sequencia}': variables.sequencia?.toString() || '0',
    '{personal}': variables.personal || 'Personal',
  };

  Object.keys(map).forEach(key => {
    // Replace all occurrences
    result = result.split(key).join(map[key]);
  });

  return result;
};

export const getVariablesDescription = () => [
  { key: '{nome}', desc: 'Nome do aluno' },
  { key: '{horario}', desc: 'Horário do agendamento' },
  { key: '{dia}', desc: 'Dia da semana' },
  { key: '{treino}', desc: 'Nome do treino' },
  { key: '{sequencia}', desc: 'Dias seguidos (streak)' },
  { key: '{personal}', desc: 'Seu nome' },
];
