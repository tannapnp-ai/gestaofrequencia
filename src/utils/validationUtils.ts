import { AbsenceRecord, VacationValidation } from '../types';
import { getBusinessDays, getCalendarDays } from './dateUtils';

export const validateVacation = (
  employeeId: string,
  startDate: Date,
  endDate: Date,
  type: 'FE' | 'FP',
  existingRecords: AbsenceRecord[]
): VacationValidation => {
  if (type === 'FE') {
    // Férias Regulamentares: 10-25 dias úteis
    const businessDays = getBusinessDays(startDate, endDate);
    const validDays = [10, 11, 12, 13, 14, 15, 25];
    
    if (!validDays.includes(businessDays)) {
      return {
        type: 'FE',
        isValid: false,
        message: 'Férias regulamentares devem ter 10, 11, 12, 13, 14, 15 ou 25 dias úteis.'
      };
    }
    
    // Verificar limite anual de 25 dias úteis
    const currentYear = startDate.getFullYear();
    const yearRecords = existingRecords.filter(record => {
      const recordDate = new Date(record.date);
      return record.employeeId === employeeId && 
             record.type === 'FE' && 
             recordDate.getFullYear() === currentYear;
    });
    
    // Calcular dias já utilizados (simplificado - assumindo períodos contínuos)
    const usedDays = yearRecords.length;
    if (usedDays + businessDays > 25) {
      return {
        type: 'FE',
        isValid: false,
        message: 'Limite anual de 25 dias úteis de férias regulamentares excedido.'
      };
    }
  }
  
  if (type === 'FP') {
    // Férias Prêmio: 15 ou 1 mês
    const calendarDays = getCalendarDays(startDate, endDate);
    
    if (calendarDays !== 15 && calendarDays !== 30) {
      return {
        type: 'FP',
        isValid: false,
        message: 'Férias prêmio devem ter 15 ou 30 dias corridos.'
      };
    }
  }
  
  return {
    type,
    isValid: true
  };
};