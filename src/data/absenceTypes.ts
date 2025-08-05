import { AbsenceTypeInfo } from '../types';

export const absenceTypes: AbsenceTypeInfo[] = [
  {
    code: 'FE',
    name: 'Férias Regulamentares',
    color: '#059669',
    bgColor: '#d1fae5'
  },
  {
    code: 'FP',
    name: 'Férias Prêmio',
    color: '#7C3AED',
    bgColor: '#ede9fe'
  },
  {
    code: 'BH',
    name: 'Banco de Horas',
    color: '#2563EB',
    bgColor: '#dbeafe'
  },
  {
    code: 'L',
    name: 'Licença para Tratamento de Saúde',
    color: '#DC2626',
    bgColor: '#fee2e2'
  },
  {
    code: 'FO',
    name: 'Folga 4x1',
    color: '#EA580C',
    bgColor: '#fed7aa'
  },
  {
    code: 'OA',
    name: 'Outros Afastamentos',
    color: '#0891B2',
    bgColor: '#cffafe'
  },
  {
    code: 'AI',
    name: 'Ausência Injustificada',
    color: '#991B1B',
    bgColor: '#fecaca'
  },
  {
    code: 'S',
    name: 'Suspensão',
    color: '#991B1B',
    bgColor: '#fecaca'
  },
  {
    code: 'F',
    name: 'Feriado',
    color: '#6B7280',
    bgColor: '#f3f4f6'
  },
  {
    code: 'PF',
    name: 'Ponto Facultativo',
    color: '#6B7280',
    bgColor: '#f3f4f6'
  }
];

export const getAbsenceTypeInfo = (code: string): AbsenceTypeInfo | undefined => {
  return absenceTypes.find(type => type.code === code);
};