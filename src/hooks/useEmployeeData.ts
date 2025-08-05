import { useState, useCallback, useEffect } from 'react';
import { Employee, AbsenceRecord, AbsenceType } from '../types';
import { isWeekend, formatDate } from '../utils/dateUtils';

// Dados iniciais de demonstração
const initialEmployees: Employee[] = [
  // Plantão A
  { id: '1', name: 'João Silva', team: 'A', role: 'AGSE', workSchedule: 'Plantão 12x36', career: 'AGSE - Efetivo' },
  { id: '2', name: 'Maria Santos', team: 'A', role: 'AGSE', workSchedule: 'Plantão 12x36', career: 'AGSE - Efetivo' },
  { id: '3', name: 'Pedro Costa', team: 'A', role: 'Supervisão de Segurança', workSchedule: 'Plantão 12x36', career: 'AGSE - Efetivo' },
  
  // Plantão B
  { id: '4', name: 'Ana Oliveira', team: 'B', role: 'AGSE', workSchedule: 'Plantão 12x36', career: 'AGSE - Contratado' },
  { id: '5', name: 'Carlos Ferreira', team: 'B', role: 'AGSE', workSchedule: 'Plantão 12x36', career: 'AGSE - Efetivo' },
  { id: '6', name: 'Lucia Mendes', team: 'B', role: 'Coordenação de Segurança', workSchedule: 'Plantão 12x36', career: 'AGSE - Efetivo' },
  
  // Plantão C
  { id: '7', name: 'Roberto Lima', team: 'C', role: 'AGSE', workSchedule: 'Plantão 12x36', career: 'AGSE - Efetivo' },
  { id: '8', name: 'Fernanda Rocha', team: 'C', role: 'AGSE', workSchedule: 'Plantão 12x36', career: 'AGSE - Contratado' },
  
  // Plantão D
  { id: '9', name: 'Marcos Alves', team: 'D', role: 'AGSE', workSchedule: 'Plantão 12x36', career: 'AGSE - Efetivo' },
  { id: '10', name: 'Patricia Souza', team: 'D', role: 'AGSE', workSchedule: 'Plantão 12x36', career: 'AGSE - Contratado' },
  
  // Plantão Diurno
  { id: '11', name: 'Ricardo Barbosa', team: 'E', role: 'AGSE', workSchedule: 'Plantão 24x72', career: 'AGSE - Efetivo' },
  { id: '12', name: 'Juliana Campos', team: 'E', role: 'AGSE', workSchedule: 'Plantão 24x72', career: 'AGSE - Efetivo' },
  
  // Atendimento
  { id: '13', name: 'Dr. Eduardo Martins', team: 'F', role: 'Analista Técnico', workSchedule: 'Administrativo', career: 'ANEDS - Psicologia' },
  { id: '14', name: 'Dra. Carla Nunes', team: 'F', role: 'Analista Técnico', workSchedule: 'Administrativo', career: 'ANEDS - Enfermagem' },
  { id: '15', name: 'Enfª. Sandra Dias', team: 'F', role: 'Assistente Técnico', workSchedule: 'Administrativo', career: 'ASEDS - Técnico de Enfermagem' },
  
  // Administrativo
  { id: '16', name: 'José Pereira', team: 'G', role: 'Assistente Administrativo', workSchedule: 'Administrativo', career: 'ASEDS - Auxiliar Administrativo' },
  { id: '17', name: 'Mariana Gomes', team: 'G', role: 'Analista Técnico Administrativo', workSchedule: 'Administrativo', career: 'Auxiliar Executivo de Defesa Social' },
  
  // Auxiliares Educacionais
  { id: '18', name: 'Cristina Moreira', team: 'H', role: 'ASEDS - Auxiliar Educacional', workSchedule: 'Administrativo', career: 'ASEDS - Auxiliar Educacional' },
  { id: '19', name: 'Paulo Ribeiro', team: 'H', role: 'ASEDS - Auxiliar Educacional', workSchedule: 'Administrativo', career: 'ASEDS - Auxiliar Educacional' },
  
  // Direção
  { id: '20', name: 'Diretor Geral', team: 'I', role: 'Direção Geral', workSchedule: 'Administrativo', career: 'Recrutamento Amplo' },
  { id: '21', name: 'Diretor de Segurança', team: 'I', role: 'Direção de Segurança', workSchedule: 'Administrativo', career: 'AGSE - Efetivo' },
];

export const useEmployeeData = () => {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [absenceRecords, setAbsenceRecords] = useState<AbsenceRecord[]>([]);
  const [specialDays, setSpecialDays] = useState<{date: string, type: 'F' | 'PF'}[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionHistory, setActionHistory] = useState<{
    type: 'add' | 'remove' | 'move' | 'bulk_add' | 'special_day';
    data: any;
    description: string;
    timestamp: number;
  }[]>([]);
  const [vacationRecords, setVacationRecords] = useState<{
    employeeId: string;
    type: 'FE' | 'FP';
    startDate: string;
    days: number;
    businessDays?: number;
  }[]>([]);

  // Carregar dados do localStorage ou usar dados iniciais
  useEffect(() => {
    const loadLocalData = () => {
      try {
        const savedEmployees = localStorage.getItem('employees_data');
        const savedAbsences = localStorage.getItem('absence_records');
        const savedSpecialDays = localStorage.getItem('special_days');
        const savedVacations = localStorage.getItem('vacation_records');
        
        if (savedEmployees) {
          setEmployees(JSON.parse(savedEmployees));
        } else {
          setEmployees(initialEmployees);
          localStorage.setItem('employees_data', JSON.stringify(initialEmployees));
        }
        
        if (savedAbsences) {
          setAbsenceRecords(JSON.parse(savedAbsences));
        }
        
        if (savedSpecialDays) {
          setSpecialDays(JSON.parse(savedSpecialDays));
        }
        
        if (savedVacations) {
          setVacationRecords(JSON.parse(savedVacations));
        }
        
      } catch (error) {
        console.error('Erro ao carregar dados locais:', error);
        setEmployees(initialEmployees);
      } finally {
        setLoading(false);
      }
    };
    
    loadLocalData();
  }, []);

  // Salvar dados no localStorage sempre que houver mudanças
  useEffect(() => {
    if (!loading) {
      localStorage.setItem('employees_data', JSON.stringify(employees));
    }
  }, [employees, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('absence_records', JSON.stringify(absenceRecords));
    }
  }, [absenceRecords, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('special_days', JSON.stringify(specialDays));
    }
  }, [specialDays, loading]);

  useEffect(() => {
    if (!loading) {
      localStorage.setItem('vacation_records', JSON.stringify(vacationRecords));
    }
  }, [vacationRecords, loading]);

  // Função para adicionar ação ao histórico
  const addToHistory = useCallback((type: 'add' | 'remove' | 'move' | 'bulk_add' | 'special_day', data: any, description: string) => {
    setActionHistory(prev => [...prev.slice(-49), { type, data, description, timestamp: Date.now() }]);
  }, []);

  const undoAction = useCallback((index: number) => {
    if (index < 0 || index >= actionHistory.length) return;

    const action = actionHistory[index];
    
    switch (action.type) {
      case 'add':
        setAbsenceRecords(prev => prev.filter(record => 
          !(record.employeeId === action.data.employeeId && 
            record.date === action.data.date)
        ));
        break;
      case 'remove':
        setAbsenceRecords(prev => [...prev, action.data]);
        break;
      case 'move':
        setEmployees(prev => prev.map(emp => 
          emp.id === action.data.employeeId 
            ? { ...emp, team: action.data.oldTeam }
            : emp
        ));
        break;
      case 'bulk_add':
        const datesToRemove = action.data.dates;
        setAbsenceRecords(prev => prev.filter(record => 
          !(record.employeeId === action.data.employeeId && 
            datesToRemove.includes(record.date))
        ));
        break;
      case 'bulk_remove':
        const datesToAdd = action.data.dates;
        const recordsToAdd = datesToAdd.map((date: string) => ({
          employeeId: action.data.employeeId,
          date,
          type: action.data.type
        }));
        setAbsenceRecords(prev => [...prev, ...recordsToAdd]);
        break;
      case 'special_day':
        if (action.data.action === 'add') {
          setSpecialDays(prev => prev.filter(day => 
            !(day.date === action.data.date && day.type === action.data.type)
          ));
        } else {
          setSpecialDays(prev => [...prev, { date: action.data.date, type: action.data.type }]);
        }
        break;
    }
  }, [actionHistory]);

  const undoLastAction = useCallback(() => {
    if (actionHistory.length > 0) {
      undoAction(actionHistory.length - 1);
      setActionHistory(prev => prev.slice(0, -1));
    }
  }, [actionHistory, undoAction]);

  const isSpecialDay = useCallback((date: string, type: 'F' | 'PF'): boolean => {
    return specialDays.some(day => day.date === date && day.type === type);
  }, [specialDays]);

  const addSpecialDay = useCallback((date: string, type: 'F' | 'PF') => {
    const existing = specialDays.find(day => day.date === date && day.type === type);
    if (!existing) {
      setSpecialDays(prev => [...prev, { date, type }]);
      addToHistory('special_day', { date, type, action: 'add' }, `Adicionou ${type === 'F' ? 'Feriado' : 'Ponto Facultativo'} em ${date}`);
    }
  }, [specialDays, addToHistory]);

  const removeSpecialDay = useCallback((date: string, type: 'F' | 'PF') => {
    const existing = specialDays.find(day => day.date === date && day.type === type);
    if (existing) {
      setSpecialDays(prev => prev.filter(day => !(day.date === date && day.type === type)));
      addToHistory('special_day', { date, type, action: 'remove' }, `Removeu ${type === 'F' ? 'Feriado' : 'Ponto Facultativo'} em ${date}`);
    }
  }, [specialDays, addToHistory]);


  const getLTSPeriods = useCallback((employeeId: string) => {
    const ltsRecords = absenceRecords.filter(record => 
      record.employeeId === employeeId && record.type === 'L'
    );
    
    // Agrupar por períodos consecutivos
    const periods: { startDate: string, days: number }[] = [];
    const sortedRecords = ltsRecords.sort((a, b) => a.date.localeCompare(b.date));
    
    let currentPeriod: { startDate: string, dates: string[] } | null = null;
    
    for (const record of sortedRecords) {
      const recordDate = new Date(record.date);
      
      if (!currentPeriod) {
        currentPeriod = {
          startDate: record.date,
          dates: [record.date]
        };
      } else {
        const lastDate = new Date(currentPeriod.dates[currentPeriod.dates.length - 1]);
        const nextDay = new Date(lastDate);
        nextDay.setDate(nextDay.getDate() + 1);
        
        if (recordDate.getTime() === nextDay.getTime()) {
          // Período consecutivo
          currentPeriod.dates.push(record.date);
        } else {
          // Novo período
          periods.push({
            startDate: currentPeriod.startDate,
            days: currentPeriod.dates.length
          });
          currentPeriod = {
            startDate: record.date,
            dates: [record.date]
          };
        }
      }
    }
    
    if (currentPeriod) {
      periods.push({
        startDate: currentPeriod.startDate,
        days: currentPeriod.dates.length
      });
    }
    
    return periods;
  }, [absenceRecords]);

  const cancelLTSPeriod = useCallback((employeeId: string, startDate: string) => {
    const recordsToRemove = absenceRecords.filter(record => 
      record.employeeId === employeeId && 
      record.type === 'L' &&
      record.date >= startDate
    );
    
    if (recordsToRemove.length > 0) {
      const dates = recordsToRemove.map(r => r.date);
      setAbsenceRecords(prev => prev.filter(record => 
        !(record.employeeId === employeeId && 
          record.type === 'L' && 
          dates.includes(record.date))
      ));
      
      const employee = employees.find(emp => emp.id === employeeId);
      const employeeName = employee?.name || 'Funcionário';
      addToHistory('bulk_remove', { employeeId, dates, type: 'L' }, `Cancelou LTS de ${employeeName} (${dates.length} dias)`);
    }
  }, [absenceRecords, employees, addToHistory]);


  const moveEmployeeToTeam = useCallback((employeeId: string, newTeam: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (employee) {
      addToHistory('move', { employeeId, oldTeam: employee.team, newTeam }, `Moveu ${employee.name} para ${newTeam}`);
    }
    
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId ? { ...emp, team: newTeam } : emp
    ));
  }, [employees, addToHistory]);

  const addAbsence = useCallback((employeeId: string, date: string, type: AbsenceType) => {
    // Verificar se já existe uma ausência nesta data
    const existingRecord = absenceRecords.find(record => 
      record.employeeId === employeeId && record.date === date
    );
    
    if (existingRecord) {
      alert(`❌ JÁ EXISTE UMA AUSÊNCIA REGISTRADA NESTA DATA!\n\n📅 Data: ${date}\n🔴 Tipo: ${existingRecord.type}\n\n⚠️ Não é possível sobrepor ausências.`);
      return;
    }
    
    const employee = employees.find(emp => emp.id === employeeId);
    const employeeName = employee?.name || 'Funcionário';
    
    setAbsenceRecords(prev => {
      const newRecord = { employeeId, date, type };
      addToHistory('add', newRecord, `Adicionou ${type} para ${employeeName} em ${date}`);
      return [...prev, newRecord];
    });
  }, [absenceRecords, employees, addToHistory]);

  const removeAbsence = useCallback((employeeId: string, date: string) => {
    const existingRecord = absenceRecords.find(record => 
      record.employeeId === employeeId && record.date === date
    );
    
    if (existingRecord) {
      const employee = employees.find(emp => emp.id === employeeId);
      const employeeName = employee?.name || 'Funcionário';
      addToHistory('remove', existingRecord, `Removeu ${existingRecord.type} de ${employeeName} em ${date}`);
      
      setAbsenceRecords(prev => prev.filter(record => 
        !(record.employeeId === employeeId && record.date === date)
      ));
    }
  }, [absenceRecords, employees, addToHistory]);

  const getAbsence = useCallback((employeeId: string, date: string): AbsenceRecord | undefined => {
    return absenceRecords.find(record => 
      record.employeeId === employeeId && record.date === date
    );
  }, [absenceRecords]);

  const getEmployeesByTeam = useCallback((team: string): Employee[] => {
    return employees.filter(emp => emp.team === team);
  }, [employees]);

  const getActiveEmployeesCount = useCallback((team: string, date: string): number => {
    const teamEmployees = getEmployeesByTeam(team);
    
    const dateObj = new Date(date + 'T12:00:00');
    const dayOfWeek = dateObj.getDay(); // 0 = domingo, 1 = segunda, ..., 6 = sábado
    
    let isActiveDay = false;
    
    if (['A', 'B', 'C', 'D'].includes(team)) {
      // Lógica de plantão: Plantão A ativo no dia 4 de agosto de 2024
      // Calcular quantos dias se passaram desde 4 de agosto de 2024
      const baseDate = new Date('2024-08-04T00:00:00'); // Plantão A no dia 4 de agosto
      const currentDate = new Date(date + 'T00:00:00');
      
      // Calcular diferença em dias de forma mais precisa
      const timeDiff = currentDate.getTime() - baseDate.getTime();
      const daysDifference = Math.round(timeDiff / (1000 * 60 * 60 * 24));
      
      // Calcular qual plantão deve estar ativo neste dia
      const cyclePosition = daysDifference % 4;
      const teamOffset = team === 'A' ? 0 : team === 'B' ? 1 : team === 'C' ? 2 : 3;
      
      // Verificar se é o dia do plantão específico
      if (cyclePosition === teamOffset) {
        isActiveDay = true;
      }
    } else {
      // Para outras equipes (E, F, G, H, I): apenas segunda a sexta
      isActiveDay = dayOfWeek >= 1 && dayOfWeek <= 5; // 1 = segunda, 5 = sexta
    }
    
    // Se não é um dia ativo para a equipe, retornar vazio (não mostrar número)
    if (!isActiveDay) {
      return -1; // Valor especial para indicar que não deve mostrar contagem
    }
    
    const absentEmployees = absenceRecords.filter(record => record.date === date);
    
    return teamEmployees.length - absentEmployees.filter(record => 
      teamEmployees.some(emp => emp.id === record.employeeId)
    ).length;
  }, [employees, absenceRecords, getEmployeesByTeam]);

  const isFacultativePoint = (date: Date): boolean => {
    return specialDays.some(day => 
      day.date === date.toISOString().split('T')[0] && day.type === 'PF'
    );
  };


  const registerLTS = useCallback((employeeId: string, startDate: string, days: number) => {
    const start = new Date(startDate + 'T12:00:00');
    const dates: string[] = [];
    
    for (let i = 0; i < days; i++) {
      const current = new Date(start);
      current.setDate(start.getDate() + i);
      dates.push(current.toISOString().split('T')[0]);
    }
    
    const overlappingRecords = absenceRecords.filter(record => 
      record.employeeId === employeeId && 
      dates.includes(record.date) &&
      ['FE', 'FP', 'L'].includes(record.type)
    );
    
    if (overlappingRecords.length > 0) {
      const overlappingDates = overlappingRecords.map(r => r.date).sort();
      const firstDate = overlappingDates[0];
      const lastDate = overlappingDates[overlappingDates.length - 1];
      
      const shouldContinue = window.confirm(
        `⚠️ SOBREPOSIÇÃO DE PERÍODOS DETECTADA!\n\n` +
        `📅 O período de LTS solicitado (${startDate} - ${days} dias) se sobrepõe a ausências já registradas:\n\n` +
        `🔴 Período conflitante: ${firstDate} até ${lastDate}\n` +
        `📊 Total de dias em conflito: ${overlappingRecords.length}\n\n` +
        `❌ Não é possível registrar períodos sobrepostos.\n\n` +
        `Deseja continuar mesmo assim? (NÃO RECOMENDADO)`
      );
      
      if (!shouldContinue) {
        return;
      }
    }
    
    // Remover registros existentes nas datas
    setAbsenceRecords(prev => {
      const filtered = prev.filter(record => 
        !(record.employeeId === employeeId && dates.includes(record.date))
      );
      
      const newRecords = dates.map(date => ({
        employeeId,
        date,
        type: 'L' as AbsenceType
      }));
      
      return [...filtered, ...newRecords];
    });
    
    addToHistory('bulk_add', { employeeId, dates, type: 'L' }, `Registrou LTS para ${employeeId}`);
  }, [absenceRecords, addToHistory]);

  const addEmployee = useCallback((name: string, team: string, role?: string, workSchedule?: string, career?: string) => {
    const newEmployee: Employee = {
      id: crypto.randomUUID(),
      name,
      team,
      role: role || undefined,
      workSchedule: workSchedule || undefined,
      career: career || undefined,
    };
    
    setEmployees(prev => [...prev, newEmployee]);
  }, []);

  const updateEmployee = useCallback((employeeId: string, updates: Partial<Employee>) => {
    setEmployees(prev => prev.map(emp => 
      emp.id === employeeId ? { ...emp, ...updates } : emp
    ));
  }, []);

  const deleteEmployee = useCallback((employeeId: string) => {
    const employee = employees.find(emp => emp.id === employeeId);
    if (!employee) return;

    // Remover funcionário
    setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    
    // Remover todos os registros de ausência do funcionário
    setAbsenceRecords(prev => prev.filter(record => record.employeeId !== employeeId));
    
    // Remover registros de férias do funcionário
    setVacationRecords(prev => prev.filter(record => record.employeeId !== employeeId));
    
    addToHistory('delete_employee', { employee }, `Excluiu servidor ${employee.name}`);
  }, [employees, addToHistory]);

  // Função para verificar se uma data é dia útil
  const isBusinessDay = useCallback((date: Date): boolean => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return false; // Fim de semana
    
    const dateStr = formatDate(date);
    return !isSpecialDay(dateStr, 'F'); // Não é feriado
  }, [isSpecialDay]);

  // Função para calcular dias úteis entre duas datas
  const getBusinessDaysBetween = useCallback((startDate: Date, endDate: Date): number => {
    let count = 0;
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (isBusinessDay(current)) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }
    
    return count;
  }, [isBusinessDay]);

  // Função para encontrar a data final baseada em dias úteis
  const findEndDateByBusinessDays = useCallback((startDate: Date, businessDays: number): Date => {
    let count = 0;
    const current = new Date(startDate);
    
    while (count < businessDays) {
      if (isBusinessDay(current)) {
        count++;
      }
      if (count < businessDays) {
        current.setDate(current.getDate() + 1);
      }
    }
    
    return current;
  }, [isBusinessDay]);

  // Função para registrar férias regulamentares
  const registerVacationFE = useCallback((employeeId: string, startDate: string, businessDays: number) => {
    throw new Error('Use registerVacationFEWithDates instead');
  }, []);

  // Nova função para registrar férias regulamentares com datas específicas
  const registerVacationFEWithDates = useCallback((employeeId: string, startDate: string, endDate: string, businessDays: number) => {
    const start = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');
    
    // Verificar se a data de fim é posterior à data de início
    if (end <= start) {
      throw new Error('A data de fim deve ser posterior à data de início.');
    }
    
    // Gerar todas as datas do período
    const dates: string[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(formatDate(current));
      current.setDate(current.getDate() + 1);
    }
    
    // Verificar se o número de dias úteis no período corresponde ao selecionado
    const actualBusinessDays = dates.filter(date => isBusinessDay(new Date(date))).length;
    if (actualBusinessDays !== businessDays) {
      throw new Error(`O período selecionado contém ${actualBusinessDays} dias úteis, mas você escolheu ${businessDays} dias úteis. Ajuste as datas.`);
    }
    
    // Verificar sobreposições
    const overlappingRecords = absenceRecords.filter(record => 
      record.employeeId === employeeId && 
      dates.includes(record.date)
    );
    
    if (overlappingRecords.length > 0) {
      throw new Error('Já existem registros de ausência nas datas selecionadas.');
    }
    
    // Verificar limite anual de 25 dias úteis
    const currentYear = start.getFullYear();
    const yearVacationRecords = vacationRecords.filter(record => 
      record.employeeId === employeeId && 
      record.type === 'FE' && 
      new Date(record.startDate).getFullYear() === currentYear
    );
    
    // Verificar se já existe um período de férias regulamentares no ano
    if (yearVacationRecords.length > 0) {
      const existingPeriod = yearVacationRecords[0];
      if (existingPeriod.businessDays === 25) {
        throw new Error('Já existe um período de 25 dias de férias regulamentares registrado neste ano.');
      } else {
        // Verificar se já completou os períodos divididos
        const totalBusinessDays = yearVacationRecords.reduce((sum, record) => sum + (record.businessDays || 0), 0);
        if (totalBusinessDays + businessDays > 25) {
          throw new Error('Já existe um período de férias regulamentares dividido registrado neste ano.');
        }
      }
    }
    
    // Para períodos divididos, verificar se é uma combinação válida
    if (yearVacationRecords.length === 1) {
      const existingDays = yearVacationRecords[0].businessDays || 0;
      const validCombinations = [
        [10, 15], [15, 10],
        [11, 14], [14, 11],
        [12, 13], [13, 12]
      ];
      
      const isValidCombination = validCombinations.some(([first, second]) => 
        (existingDays === first && businessDays === second) ||
        (existingDays === second && businessDays === first)
      );
      
      if (!isValidCombination) {
        throw new Error(`Combinação inválida de períodos. Período existente: ${existingDays} dias, tentando adicionar: ${businessDays} dias.`);
      }
    }
    
    // Registrar no calendário
    const newRecords = dates.map(date => ({
      employeeId,
      date,
      type: 'FE' as AbsenceType
    }));
    
    setAbsenceRecords(prev => [...prev, ...newRecords]);
    
    // Registrar no histórico de férias
    const vacationRecord = {
      employeeId,
      type: 'FE' as const,
      startDate,
      endDate,
      days: dates.length,
      businessDays
    };
    
    setVacationRecords(prev => [...prev, vacationRecord]);
    
    const employee = employees.find(emp => emp.id === employeeId);
    addToHistory('bulk_add', { employeeId, dates, type: 'FE' }, 
      `Registrou Férias Regulamentares para ${employee?.name} (${businessDays} dias úteis)`);
    
  }, [vacationRecords, absenceRecords, employees, isBusinessDay, addToHistory]);

  // Função para registrar férias prêmio
  const registerVacationFP = useCallback((employeeId: string, startDate: string, period: '15dias' | '1mes') => {
    throw new Error('Use registerVacationFPWithDates instead');
  }, []);

  // Nova função para registrar férias prêmio com datas específicas
  const registerVacationFPWithDates = useCallback((employeeId: string, startDate: string, endDate: string, period: '15dias' | '1mes') => {
    const start = new Date(startDate + 'T12:00:00');
    const end = new Date(endDate + 'T12:00:00');
    
    // Verificar se a data de fim é posterior à data de início
    if (end <= start) {
      throw new Error('A data de fim deve ser posterior à data de início.');
    }
    
    // Gerar todas as datas do período
    const dates: string[] = [];
    const current = new Date(start);
    
    while (current <= end) {
      dates.push(formatDate(current));
      current.setDate(current.getDate() + 1);
    }
    
    // Validar o período baseado na opção selecionada
    if (period === '15dias' && dates.length !== 15) {
      throw new Error(`Para 15 dias corridos, o período deve ter exatamente 15 dias. Período selecionado: ${dates.length} dias.`);
    }
    
    // Para 1 mês, aceitar variação de 28-32 dias
    if (period === '1mes' && (dates.length < 28 || dates.length > 32)) {
      throw new Error(`Para 1 mês corrido, o período deve ter entre 28 e 32 dias. Período selecionado: ${dates.length} dias.`);
    }
    
    // Verificar sobreposições
    const overlappingRecords = absenceRecords.filter(record => 
      record.employeeId === employeeId && 
      dates.includes(record.date)
    );
    
    if (overlappingRecords.length > 0) {
      throw new Error('Já existem registros de ausência nas datas selecionadas.');
    }
    
    // Registrar no calendário
    const newRecords = dates.map(date => ({
      employeeId,
      date,
      type: 'FP' as AbsenceType
    }));
    
    setAbsenceRecords(prev => [...prev, ...newRecords]);
    
    // Registrar no histórico de férias
    const vacationRecord = {
      employeeId,
      type: 'FP' as const,
      startDate,
      endDate,
      days: dates.length,
      period
    };
    
    setVacationRecords(prev => [...prev, vacationRecord]);
    
    const employee = employees.find(emp => emp.id === employeeId);
    const periodText = period === '15dias' ? '15 dias corridos' : '1 mês corrido';
    addToHistory('bulk_add', { employeeId, dates, type: 'FP' }, 
      `Registrou Férias Prêmio para ${employee?.name} (${periodText})`);
    
  }, [absenceRecords, employees, addToHistory]);

  // Função para obter períodos de férias de um funcionário
  const getVacationPeriods = useCallback((employeeId: string) => {
    return vacationRecords.filter(record => record.employeeId === employeeId);
  }, [vacationRecords]);

  // Função para cancelar período de férias
  const cancelVacationPeriod = useCallback((employeeId: string, startDate: string, type: 'FE' | 'FP') => {
    const vacationRecord = vacationRecords.find(record => 
      record.employeeId === employeeId && 
      record.startDate === startDate && 
      record.type === type
    );
    
    if (!vacationRecord) return;
    
    // Remover registros do calendário
    const recordsToRemove = absenceRecords.filter(record => 
      record.employeeId === employeeId && 
      record.type === type &&
      record.date >= startDate
    );
    
    const datesToRemove = recordsToRemove.map(r => r.date);
    
    setAbsenceRecords(prev => prev.filter(record => 
      !(record.employeeId === employeeId && 
        record.type === type && 
        datesToRemove.includes(record.date))
    ));
    
    // Remover do histórico de férias
    setVacationRecords(prev => prev.filter(record => 
      !(record.employeeId === employeeId && 
        record.startDate === startDate && 
        record.type === type)
    ));
    
    const employee = employees.find(emp => emp.id === employeeId);
    const typeText = type === 'FE' ? 'Férias Regulamentares' : 'Férias Prêmio';
    addToHistory('bulk_remove', { employeeId, dates: datesToRemove, type }, 
      `Cancelou ${typeText} de ${employee?.name}`);
    
  }, [vacationRecords, absenceRecords, employees, addToHistory]);

  return {
    employees,
    absenceRecords,
    loading,
    actionHistory,
    undoLastAction,
    moveEmployeeToTeam,
    addAbsence,
    removeAbsence,
    getAbsence,
    getEmployeesByTeam,
    getActiveEmployeesCount,
    registerLTS,
    addEmployee,
    updateEmployee,
    specialDays,
    isSpecialDay,
    addSpecialDay,
    removeSpecialDay,
    getLTSPeriods,
    cancelLTSPeriod,
    registerVacationFE,
    registerVacationFEWithDates,
    registerVacationFP,
    registerVacationFPWithDates,
    getVacationPeriods,
    cancelVacationPeriod,
    isBusinessDay,
    deleteEmployee,
  };
};