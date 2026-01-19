
import { Student } from '../types';

export interface AssessmentInput {
  weight: number;
  height: number; // cm
  age: number;
  gender: 'M' | 'F';
  waist?: number;
  neck?: number;
  hip?: number; // Obrigatório para mulheres (Navy)
}

// --- IMC ---
export const calculateBMI = (weightKg: number, heightCm: number): number => {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  return Number((weightKg / (heightM * heightM)).toFixed(2));
};

export const getBMIClassification = (bmi: number): { label: string; color: string } => {
  if (bmi < 18.5) return { label: 'Abaixo do peso', color: '#3b82f6' }; // Blue
  if (bmi < 24.9) return { label: 'Peso Normal', color: '#22c55e' }; // Green
  if (bmi < 29.9) return { label: 'Sobrepeso', color: '#eab308' }; // Yellow
  if (bmi < 34.9) return { label: 'Obesidade Grau I', color: '#f97316' }; // Orange
  if (bmi < 39.9) return { label: 'Obesidade Grau II', color: '#ef4444' }; // Red
  return { label: 'Obesidade Grau III', color: '#7f1d1d' }; // Dark Red
};

// --- PERCENTUAL DE GORDURA (MÉTODO DA MARINHA DOS EUA) ---
// Referência: https://www.bizcalcs.com/body-fat-navy/
export const calculateBodyFatNavy = (
  gender: 'M' | 'F',
  heightCm: number,
  waistCm: number,
  neckCm: number,
  hipCm?: number
): number | undefined => {
  if (!heightCm || !waistCm || !neckCm) return undefined;
  if (gender === 'F' && !hipCm) return undefined;

  let bodyFat = 0;

  if (gender === 'M') {
    // BF = 86.010 * log10(abdomen - neck) - 70.041 * log10(height) + 36.76
    bodyFat = 
      86.010 * Math.log10(waistCm - neckCm) - 
      70.041 * Math.log10(heightCm) + 
      36.76;
  } else {
    // BF = 163.205 * log10(waist + hip - neck) - 97.684 * log10(height) - 78.387
    // Nota: A fórmula original usa cintura + quadril - pescoço
    if (hipCm) {
        bodyFat = 
        163.205 * Math.log10(waistCm + hipCm - neckCm) - 
        97.684 * Math.log10(heightCm) - 
        78.387;
    }
  }

  return Number(bodyFat.toFixed(2));
};

export const getBodyFatClassification = (bf: number, gender: 'M' | 'F', age: number): { label: string; color: string } => {
    // Tabelas simplificadas de classificação (Pollock/ACE)
    if (gender === 'F') {
        if (bf < 10) return { label: 'Risco (Baixo)', color: '#ef4444' };
        if (bf < 14) return { label: 'Atleta', color: '#22c55e' };
        if (bf < 21) return { label: 'Fitness', color: '#22c55e' };
        if (bf < 25) return { label: 'Aceitável', color: '#eab308' };
        return { label: 'Obeso', color: '#ef4444' };
    } else {
        if (bf < 2) return { label: 'Risco (Baixo)', color: '#ef4444' };
        if (bf < 6) return { label: 'Atleta', color: '#22c55e' };
        if (bf < 14) return { label: 'Fitness', color: '#22c55e' };
        if (bf < 18) return { label: 'Aceitável', color: '#eab308' };
        return { label: 'Obeso', color: '#ef4444' };
    }
};

// --- RCQ (RELAÇÃO CINTURA QUADRIL) ---
export const calculateRCQ = (waist: number, hip: number): number => {
    if (!waist || !hip) return 0;
    return Number((waist / hip).toFixed(2));
};

export const getRCQClassification = (rcq: number, gender: 'M' | 'F'): { label: string; color: string } => {
    if (gender === 'M') {
        if (rcq < 0.90) return { label: 'Baixo Risco', color: '#22c55e' };
        if (rcq < 1.00) return { label: 'Risco Moderado', color: '#eab308' };
        return { label: 'Alto Risco', color: '#ef4444' };
    } else {
        if (rcq < 0.80) return { label: 'Baixo Risco', color: '#22c55e' };
        if (rcq < 0.85) return { label: 'Risco Moderado', color: '#eab308' };
        return { label: 'Alto Risco', color: '#ef4444' };
    }
};

// --- PESO IDEAL (Fórmula de Robinson) ---
export const calculateIdealWeight = (heightCm: number, gender: 'M' | 'F'): { min: number, ideal: number, max: number } => {
    // Altura base 152.4 cm (5 feet)
    const baseHeight = 152.4;
    const heightDiff = heightCm - baseHeight;
    
    // Fator por polegada (2.54cm)
    const factorM = 1.9;
    const factorF = 1.7;
    
    const baseWeightM = 52;
    const baseWeightF = 49;
    
    let ideal = 0;
    
    // Se altura menor que 1.52, a fórmula não se aplica bem, retornamos aproximado pelo IMC 22
    if (heightCm < baseHeight) {
        ideal = 22 * ((heightCm/100) ** 2);
    } else {
        if (gender === 'M') {
            ideal = baseWeightM + (factorM * (heightDiff / 2.54));
        } else {
            ideal = baseWeightF + (factorF * (heightDiff / 2.54));
        }
    }
    
    return {
        ideal: Number(ideal.toFixed(1)),
        min: Number((ideal * 0.9).toFixed(1)), // -10%
        max: Number((ideal * 1.1).toFixed(1))  // +10%
    };
};
