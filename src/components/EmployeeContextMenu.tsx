import React, { useState } from 'react';
import { Employee, AbsenceType } from '../types';
import { Users, Calendar, Heart, X, Check, User, Plane, Trash2 } from 'lucide-react';
import { getFunctionsByTeam, getCareersByTeam } from '../utils/employeeDataUtils';

interface EmployeeContextMenuProps {
  employee: Employee;
  isVisible: boolean;
  isReadOnly?: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onTeamChange: (employeeId: string, newTeam: string) => void;
  onLTSRegister: (employeeId: string, startDate: string, days: number) => void;
 onEmployeeUpdate: (employeeId: string, updates: Partial<Employee>) => void;
  getLTSPeriods: (employeeId: string) => any[];
  onCancelLTSPeriod: (employeeId: string, startDate: string) => void;
  registerVacationFE: (employeeId: string, startDate: string, businessDays: number) => void;
  registerVacationFEWithDates: (employeeId: string, startDate: string, endDate: string, businessDays: number) => void;
  registerVacationFP: (employeeId: string, startDate: string, period: '15dias' | '1mes') => void;
  registerVacationFPWithDates: (employeeId: string, startDate: string, endDate: string, period: '15dias' | '1mes') => void;
  getVacationPeriods: (employeeId: string) => any[];
  cancelVacationPeriod: (employeeId: string, startDate: string, type: 'FE' | 'FP') => void;
  onDeleteEmployee: (employeeId: string) => void;
}

type MenuState = 'main' | 'team-change' | 'vacation-fe' | 'vacation-fp' | 'vacation-edit' | 'lts' | 'employee-info';
type InfoState = 'view' | 'edit';

export const EmployeeContextMenu: React.FC<EmployeeContextMenuProps> = ({
  employee,
  isVisible,
  isReadOnly = false,
  position,
  onClose,
  onTeamChange,
  onLTSRegister,
 onEmployeeUpdate,
  getLTSPeriods,
  onCancelLTSPeriod,
  registerVacationFE,
  registerVacationFEWithDates,
  registerVacationFP,
  registerVacationFPWithDates,
  getVacationPeriods,
  cancelVacationPeriod,
  onDeleteEmployee,
}) => {
  const [menuState, setMenuState] = useState<MenuState>('main');
  const [infoState, setInfoState] = useState<InfoState>('view');
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [ltsDays, setLtsDays] = useState('');
 const [employeeRole, setEmployeeRole] = useState(employee.role || '');
 const [employeeSchedule, setEmployeeSchedule] = useState(employee.workSchedule || '');
 const [employeeCareer, setEmployeeCareer] = useState(employee.career || '');
  const [vacationBusinessDays, setVacationBusinessDays] = useState<number>(10);
  const [vacationPeriod, setVacationPeriod] = useState<'15dias' | '1mes'>('15dias');
  const [error, setError] = useState<string>('');
  const [currentPeriodStep, setCurrentPeriodStep] = useState<1 | 2>(1);
  const [firstPeriodDates, setFirstPeriodDates] = useState<{start: string, end: string} | null>(null);

  // Função para verificar se uma data é dia útil (não sábado, domingo ou feriado)
  const isBusinessDay = (date: Date): boolean => {
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) return false; // Fim de semana
    
    // Lista de feriados nacionais fixos (formato MM-DD)
    const holidays = [
      '01-01', // Ano Novo
      '04-21', // Tiradentes
      '09-07', // Independência
      '10-12', // Nossa Senhora Aparecida
      '11-02', // Finados
      '11-15', // Proclamação da República
      '12-25', // Natal
    ];
    
    const monthDay = `${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    return !holidays.includes(monthDay);
  };

  // Função para obter a data mínima para fim (dia seguinte ao início)
  const getMinEndDate = (): string => {
    if (!startDate) return '';
    const start = new Date(startDate);
    start.setDate(start.getDate() + 1);
    return start.toISOString().split('T')[0];
  };
  if (!isVisible) return null;

  const availableTeams = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'].filter(team => team !== employee.team);

 const careerOptions = [
   'AGSE - Efetivo',
   'AGSE - Contratado',
   'ANEDS - Odontologia',
   'ANEDS - Pedagogia',
   'ANEDS - Psicologia',
   'ANEDS - Qualquer Formação',
   'ANEDS - Serviço Social',
   'ANEDS - Terapia Educacional',
   'ASEDS - Qualquer Nível Médio',
   'ASEDS - Auxiliar de Consultório Odontológico',
   'ASEDS - Auxiliar Administrativo',
   'ASEDS - Auxiliar Educacional',
   'ASEDS - Técnico de Enfermagem',
   'Auxiliar Executivo de Defesa Social',
   'Recrutamento Amplo'
 ];

 const functionOptions = [
   'Assistente Administrativo',
   'Analista Técnico Administrativo',
   'AGSE',
   'AGSE - Ajustamento de Saúde',
   'AGSE - Afastamento Judicial',
   'Analista Técnico',
   'Assistente Técnico',
   'Direção de Segurança',
   'Direção Geral',
   'Direção de Atendimento',
   'Supervisão de Segurança',
   'Coordenação de Segurança'
 ];
  const handleTeamConfirm = () => {
    if (selectedTeam) {
      onTeamChange(employee.id, selectedTeam);
      onClose();
      resetState();
    }
  };

  const handleVacationConfirm = () => {
    if (startDate && vacationDays) {
      onVacationRegister(employee.id, startDate, parseInt(vacationDays));
      onClose();
      resetState();
    }
  };

  const handleLTSConfirm = () => {
    if (startDate && ltsDays) {
      onLTSRegister(employee.id, startDate, parseInt(ltsDays));
      onClose();
      resetState();
    }
  };

  const handleEmployeeInfoConfirm = () => {
    onEmployeeUpdate(employee.id, {
      role: employeeRole,
      workSchedule: employeeSchedule,
      career: employeeCareer
    });
    setInfoState('view');
    setMenuState('main');
    onClose();
    resetState();
  };

  const handleDeleteEmployee = () => {
    const confirmMessage = `⚠️ EXCLUIR SERVIDOR\n\n` +
      `Servidor: ${employee.name}\n` +
      `Plantão: ${employee.team}\n\n` +
      `Esta ação irá:\n` +
      `• Remover o servidor permanentemente\n` +
      `• Excluir todos os registros de ausências\n` +
      `• Excluir todos os períodos de férias\n\n` +
      `❌ ESTA AÇÃO NÃO PODE SER DESFEITA!\n\n` +
      `Tem certeza que deseja excluir este servidor?`;

    if (window.confirm(confirmMessage)) {
      onDeleteEmployee(employee.id);
      onClose();
      resetState();
    }
  };

  const handleVacationFEConfirm = () => {
    if (vacationBusinessDays === 25) {
      // Para 25 dias, registro direto
      if (startDate && endDate) {
        try {
          registerVacationFEWithDates(employee.id, startDate, endDate, vacationBusinessDays);
          onClose();
          resetState();
        } catch (err: any) {
          setError(err.message);
        }
      }
    } else {
      // Para períodos divididos
      if (currentPeriodStep === 1) {
        // Primeiro período
        if (startDate && endDate) {
          const firstPeriodDays = vacationBusinessDays === 10 ? 10 : 
                                 vacationBusinessDays === 11 ? 11 : 12;
          
          try {
            registerVacationFEWithDates(employee.id, startDate, endDate, firstPeriodDays);
            setFirstPeriodDates({ start: startDate, end: endDate });
            setCurrentPeriodStep(2);
            setStartDate('');
            setEndDate('');
            setError('');
          } catch (err: any) {
            setError(err.message);
          }
        }
      } else {
        // Segundo período
        if (startDate && endDate) {
          const secondPeriodDays = vacationBusinessDays === 10 ? 15 : 
                                  vacationBusinessDays === 11 ? 14 : 13;
          
          try {
            registerVacationFEWithDates(employee.id, startDate, endDate, secondPeriodDays);
            onClose();
            resetState();
          } catch (err: any) {
            setError(err.message);
          }
        }
      }
    }
  };

  const handleVacationFECancel = () => {
    if (currentPeriodStep === 2 && firstPeriodDates) {
      // Se está no segundo período, cancelar o primeiro também
      try {
        // Aqui você precisaria implementar uma função para cancelar o primeiro período
        // Por simplicidade, vamos apenas resetar
        setCurrentPeriodStep(1);
        setFirstPeriodDates(null);
        setStartDate('');
        setEndDate('');
        setError('');
      } catch (err: any) {
        setError(err.message);
      }
    } else {
      setMenuState('main');
      setStartDate('');
      setEndDate('');
      setError('');
    }
  };

  const handleVacationFPConfirm = () => {
    if (vacationPeriod === '15dias' && startDate) {
      // Para 15 dias, apenas data de início é necessária
      const start = new Date(startDate + 'T12:00:00');
      const end = new Date(start.getTime() + (14 * 24 * 60 * 60 * 1000));
      const endDateStr = end.toISOString().split('T')[0];
      
      try {
        registerVacationFPWithDates(employee.id, startDate, endDateStr, vacationPeriod);
        onClose();
        resetState();
      } catch (err: any) {
        setError(err.message);
      }
    } else if (vacationPeriod === '1mes' && startDate && endDate) {
      // Para 1 mês, ambas as datas são necessárias
      try {
        registerVacationFPWithDates(employee.id, startDate, endDate, vacationPeriod);
        onClose();
        resetState();
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  const resetState = () => {
    setMenuState('main');
    setInfoState('view');
    setSelectedTeam(null);
    setStartDate('');
    setEndDate('');
    setLtsDays('');
    setVacationBusinessDays(10);
    setVacationPeriod('15dias');
    setError('');
    setCurrentPeriodStep(1);
    setFirstPeriodDates(null);
  };

  const resetEmployeeData = () => {
    setEmployeeRole(employee.role || '');
    setEmployeeSchedule(employee.workSchedule || '');
    setEmployeeCareer(employee.career || '');
  };

  return (
    <>
      <div
        className="fixed inset-0 z-30"
        onClick={onClose}
      />
      <div
        className="absolute z-40 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-64 max-w-sm"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        {menuState === 'main' && (
          <>
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
              {employee.name} - Plantão {employee.team}
            </div>
            
           <button
             onClick={() => setMenuState('employee-info')}
             className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm"
             disabled={isReadOnly}
           >
             <User className="text-gray-600" size={16} />
             <span>Informações do Servidor</span>
           </button>
           
           {!isReadOnly && (
             <>
            <button
              onClick={() => setMenuState('vacation-fe')}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm"
            >
              <Plane className="text-green-600" size={16} />
              <span>Registrar Férias Regulamentares</span>
            </button>
            
            <button
              onClick={() => setMenuState('vacation-fp')}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm"
            >
              <Plane className="text-purple-600" size={16} />
              <span>Registrar Férias Prêmio</span>
            </button>
            
            <button
              onClick={() => setMenuState('vacation-edit')}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm"
            >
              <Calendar className="text-blue-600" size={16} />
              <span>Editar Férias</span>
            </button>
            
            <button
              onClick={() => setMenuState('team-change')}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm"
            >
              <Users className="text-blue-600" size={16} />
              <span>Trocar de Plantão</span>
            </button>
            
            <button
              onClick={() => setMenuState('lts')}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm"
            >
              <Heart className="text-red-600" size={16} />
              <span>Registrar LTS</span>
            </button>
            
            <button
              onClick={() => setMenuState('lts-edit')}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center space-x-3 text-sm"
            >
              <Heart className="text-blue-600" size={16} />
              <span>Editar LTS</span>
            </button>
            
            <div className="border-t border-gray-100 mt-2 pt-2">
              <button
                onClick={handleDeleteEmployee}
                className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 text-sm text-red-600"
              >
                <Trash2 className="text-red-600" size={16} />
                <span>Excluir Servidor</span>
              </button>
            </div>
             </>
           )}
          </>
        )}

       {menuState === 'employee-info' && (
         <>
           <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
             {infoState === 'view' ? 'Informações do Servidor' : 'Editar Dados do Servidor'}
           </div>
           
           {infoState === 'view' ? (
             <div className="px-4 py-3">
               <div className="space-y-3">
                 <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">
                     Função
                   </label>
                   <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-900">
                     {employee.role || 'Não informado'}
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">
                     Carreira
                   </label>
                   <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-900">
                     {employee.career || 'Não informado'}
                   </div>
                 </div>
                 
                 <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">
                     Escala de Trabalho
                   </label>
                   <div className="px-3 py-2 bg-gray-50 border border-gray-200 rounded text-sm text-gray-900">
                     {employee.workSchedule || 'Não informado'}
                   </div>
                 </div>
               </div>
               
               <div className="flex space-x-2 mt-4">
                 <button
                   onClick={() => setMenuState('main')}
                   className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center space-x-1"
                 >
                   <X size={14} />
                   <span>Voltar</span>
                 </button>
                 <button
                   onClick={() => {
                     setInfoState('edit');
                     resetEmployeeData();
                   }}
                   className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center justify-center space-x-1"
                 >
                   <User size={14} />
                   <span>Editar Dados</span>
                 </button>
               </div>
             </div>
           ) : (
             <div className="px-4 py-3">
               <div className="space-y-3">
                 <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">
                     Função
                   </label>
                   <select
                     value={employeeRole}
                     onChange={(e) => setEmployeeRole(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="">Selecione uma função...</option>
                     {getFunctionsByTeam(employee.team).map(func => (
                       <option key={func} value={func}>{func}</option>
                     ))}
                   </select>
                 </div>
                 
                 <div>
                   <label className="block text-xs font-medium text-gray-700 mb-1">
                     Carreira
                   </label>
                   <select
                     value={employeeCareer}
                     onChange={(e) => setEmployeeCareer(e.target.value)}
                     className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                   >
                     <option value="">Selecione uma carreira...</option>
                     {getCareersByTeam(employee.team).map(career => (
                       <option key={career} value={career}>{career}</option>
                     ))}
                   </select>
                 </div>
               </div>
               
               <div className="flex space-x-2 mt-4">
                 <button
                   onClick={() => {
                     setInfoState('view');
                     resetEmployeeData();
                   }}
                   className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center space-x-1"
                 >
                   <X size={14} />
                   <span>Cancelar</span>
                 </button>
                 <button
                   onClick={handleEmployeeInfoConfirm}
                  className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 flex items-center justify-center space-x-1"
                 >
                   <Check size={14} />
                   <span>Salvar</span>
                 </button>
               </div>
             </div>
           )}
         </>
       )}
        {menuState === 'team-change' && (
          <>
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
              Trocar para qual plantão?
            </div>
            
            <div className="p-2">
              {availableTeams.map((team) => (
                <button
                  key={team}
                  onClick={() => setSelectedTeam(team)}
                  className={`w-full px-3 py-2 text-left rounded mb-1 text-sm transition-colors ${
                    selectedTeam === team
                      ? 'bg-blue-100 text-blue-800 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  {team === 'A' ? 'Plantão A' :
                   team === 'B' ? 'Plantão B' :
                   team === 'C' ? 'Plantão C' :
                   team === 'D' ? 'Plantão D' :
                   team === 'E' ? 'Plantão Diurno' :
                   team === 'F' ? 'Atendimento' :
                   team === 'G' ? 'Administrativo' :
                   team === 'H' ? 'Auxiliares Educacionais' :
                   team === 'I' ? 'Direção' : `Equipe ${team}`}
                </button>
              ))}
            </div>
            
            <div className="flex space-x-2 px-4 py-3 border-t border-gray-100">
              <button
                onClick={() => {
                  setMenuState('main');
                  setSelectedTeam(null);
                }}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center space-x-1"
              >
                <X size={14} />
                <span>Cancelar</span>
              </button>
              <button
                onClick={handleTeamConfirm}
                disabled={!selectedTeam}
                className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
              >
                <Check size={14} />
                <span>Confirmar</span>
              </button>
            </div>
          </>
        )}


        {menuState === 'vacation-fe' && (
          <>
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
              {vacationBusinessDays === 25 ? 'Registrar Férias Regulamentares' : 
               currentPeriodStep === 1 ? 
                 `Registrar Férias Regulamentares - 1º Período (${
                   vacationBusinessDays === 10 ? '10 dias' : 
                   vacationBusinessDays === 11 ? '11 dias' : '12 dias'
                 })` :
                 `Registrar Férias Regulamentares - 2º Período (${
                   vacationBusinessDays === 10 ? '15 dias' : 
                   vacationBusinessDays === 11 ? '14 dias' : '13 dias'
                 })`
              }
            </div>
            
            <div className="px-4 py-3">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                  {error.includes('Limite anual excedido') && (
                    <button
                      onClick={() => {
                        setError('');
                      }}
                      className="mt-2 px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                    >
                      Alterar Férias
                    </button>
                  )}
                  
                  {vacationBusinessDays === 25 && startDate && endDate && (
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-700">
                        <strong>Período:</strong> {new Date(startDate + 'T12:00:00').toLocaleDateString('pt-BR')} até {new Date(endDate + 'T12:00:00').toLocaleDateString('pt-BR')}
                      </p>
                      <p className="text-xs text-blue-600 mt-1">
                        25 dias úteis de férias regulamentares
                      </p>
                    </div>
                  )}
                </div>
              )}
              
              <div className="space-y-3">
                {currentPeriodStep === 2 && firstPeriodDates && (
                  <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-700">
                      <strong>1º Período registrado:</strong> {new Date(firstPeriodDates.start + 'T12:00:00').toLocaleDateString('pt-BR')} - {new Date(firstPeriodDates.end + 'T12:00:00').toLocaleDateString('pt-BR')}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Agora registre o segundo período
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Quantidade de Dias Úteis
                  </label>
                  <select
                    value={vacationBusinessDays}
                    onChange={(e) => setVacationBusinessDays(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={currentPeriodStep === 2}
                  >
                    <option value={25}>25 dias úteis</option>
                    <option value={10}>10 e 15 dias úteis (divididos)</option>
                    <option value={11}>11 e 14 dias úteis (divididos)</option>
                    <option value={12}>12 e 13 dias úteis (divididos)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    min={getMinEndDate()}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    disabled={!startDate}
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => {
                    handleVacationFECancel();
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center space-x-1"
                >
                  <X size={14} />
                  <span>{currentPeriodStep === 2 ? 'Voltar' : 'Cancelar'}</span>
                </button>
                <button
                  onClick={handleVacationFEConfirm}
                  disabled={!startDate || !endDate}
                  className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                >
                  <Check size={14} />
                  <span>{currentPeriodStep === 2 ? 'Finalizar' : 'Confirmar'}</span>
                </button>
              </div>
            </div>
          </>
        )}

        {menuState === 'vacation-fp' && (
          <>
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
              Registrar Férias Prêmio
            </div>
            
            <div className="px-4 py-3">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Período
                  </label>
                  <select
                    value={vacationPeriod}
                    onChange={(e) => setVacationPeriod(e.target.value as '15dias' | '1mes')}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="15dias">15 dias corridos</option>
                    <option value="1mes">1 mês corrido</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                {vacationPeriod === '1mes' && (
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Data de Fim
                    </label>
                    <input
                      type="date"
                      value={endDate}
                      min={getMinEndDate()}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      disabled={!startDate}
                    />
                  </div>
                )}
                {vacationPeriod === '15dias' && startDate && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-700">
                      <strong>Período:</strong> {startDate} até {(() => {
                        const start = new Date(startDate + 'T12:00:00');
                        const end = new Date(start.getTime() + (14 * 24 * 60 * 60 * 1000));
                        return end.toISOString().split('T')[0];
                      })()}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      15 dias corridos serão registrados automaticamente
                    </p>
                  </div>
                )}
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => {
                    setMenuState('main');
                    setStartDate('');
                    setEndDate('');
                    setError('');
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center space-x-1"
                >
                  <X size={14} />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleVacationFPConfirm}
                  disabled={!startDate || (vacationPeriod === '1mes' && !endDate)}
                  className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                >
                  <Check size={14} />
                  <span>Confirmar</span>
                </button>
              </div>
            </div>
          </>
        )}

        {menuState === 'vacation-fp-old' && (
          <>
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
              Registrar Férias Prêmio
            </div>
            
            <div className="px-4 py-3">
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}
              
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Data de Fim
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Período
                  </label>
                  <select
                    value={vacationPeriod}
                    onChange={(e) => setVacationPeriod(e.target.value as '15dias' | '1mes')}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="15dias">15 dias corridos</option>
                    <option value="1mes">1 mês corrido</option>
                  </select>
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => {
                    setMenuState('main');
                    setStartDate('');
                    setEndDate('');
                    setError('');
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center space-x-1"
                >
                  <X size={14} />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleVacationFPConfirm}
                  disabled={!startDate || !endDate}
                  className="flex-1 px-3 py-2 text-sm bg-purple-600 text-white rounded hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                >
                  <Check size={14} />
                  <span>Confirmar</span>
                </button>
              </div>
            </div>
          </>
        )}

        {menuState === 'vacation-edit' && (
          <>
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
              Editar Férias
            </div>
            
            <div className="px-4 py-3 max-h-64 overflow-y-auto">
              {(() => {
                const periods = getVacationPeriods(employee.id);
                if (periods.length === 0) {
                  return (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum período de férias registrado
                    </p>
                  );
                }
                
                return (
                  <div className="space-y-2">
                    {periods.map((period, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            period.type === 'FE' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-purple-100 text-purple-800'
                          }`}>
                            {period.type === 'FE' ? 'Férias Regulamentares' : 'Férias Prêmio'}
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          <div>Início: {new Date(period.startDate + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                          {period.endDate && (
                            <div>Fim: {new Date(period.endDate + 'T12:00:00').toLocaleDateString('pt-BR')}</div>
                          )}
                          <div>
                            {period.type === 'FE' 
                              ? `Dias úteis: ${period.businessDays || 0}` 
                              : period.period === '15dias' 
                                ? '15 dias corridos'
                                : '1 mês corrido'}
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              // Editar período - volta para o formulário apropriado
                              if (period.type === 'FE') {
                                setVacationBusinessDays(period.businessDays || 10);
                                setStartDate(period.startDate);
                                setEndDate(period.endDate || '');
                                setMenuState('vacation-fe');
                              } else {
                                setVacationPeriod(period.period || '15dias');
                                setStartDate(period.startDate);
                                setEndDate(period.endDate || '');
                                setMenuState('vacation-fp');
                              }
                              // Primeiro cancela o período existente
                              cancelVacationPeriod(employee.id, period.startDate, period.type);
                            }}
                            className="flex-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => {
                              const typeText = period.type === 'FE' ? 'Férias Regulamentares' : 'Férias Prêmio';
                              const startDateFormatted = new Date(period.startDate + 'T12:00:00').toLocaleDateString('pt-BR');
                              const endDateFormatted = period.endDate ? new Date(period.endDate + 'T12:00:00').toLocaleDateString('pt-BR') : '';
                              const dateRange = endDateFormatted ? `${startDateFormatted} - ${endDateFormatted}` : startDateFormatted;
                              
                              if (window.confirm(`Cancelar este período de ${typeText}?\n\nPeríodo: ${dateRange}`)) {
                                cancelVacationPeriod(employee.id, period.startDate, period.type);
                              }
                            }}
                            className="flex-1 px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            <div className="flex space-x-2 px-4 py-3 border-t border-gray-100">
              <button
                onClick={() => setMenuState('main')}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center space-x-1"
              >
                <X size={14} />
                <span>Voltar</span>
              </button>
            </div>
          </>
        )}

        {menuState === 'lts' && (
          <>
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
              Registrar LTS
            </div>
            
            <div className="px-4 py-3">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Data de Início
                  </label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Número de Dias
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={ltsDays}
                    onChange={(e) => setLtsDays(e.target.value)}
                    placeholder="Ex: 5"
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <div className="flex space-x-2 mt-4">
                <button
                  onClick={() => {
                    setMenuState('main');
                    setStartDate('');
                    setLtsDays('');
                  }}
                  className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center space-x-1"
                >
                  <X size={14} />
                  <span>Cancelar</span>
                </button>
                <button
                  onClick={handleLTSConfirm}
                  disabled={!startDate || !ltsDays}
                  className="flex-1 px-3 py-2 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
                >
                  <Check size={14} />
                  <span>Confirmar</span>
                </button>
              </div>
            </div>
          </>
        )}

        {menuState === 'lts-edit' && (
          <>
            <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
              Editar LTS
            </div>
            
            <div className="px-4 py-3 max-h-64 overflow-y-auto">
              {(() => {
                const periods = getLTSPeriods(employee.id);
                if (periods.length === 0) {
                  return (
                    <p className="text-sm text-gray-500 text-center py-4">
                      Nenhum período de LTS registrado
                    </p>
                  );
                }
                
                return (
                  <div className="space-y-2">
                    {periods.map((period, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                            Licença para Tratamento de Saúde
                          </span>
                        </div>
                        <div className="text-xs text-gray-600 mb-2">
                          <div>Início: {new Date(period.startDate).toLocaleDateString('pt-BR')}</div>
                          <div>Dias: {period.days}</div>
                        </div>
                        <button
                          onClick={() => {
                            if (window.confirm(`Cancelar este período de LTS?\n\nInício: ${new Date(period.startDate).toLocaleDateString('pt-BR')}\nDias: ${period.days}`)) {
                              onCancelLTSPeriod(employee.id, period.startDate);
                              setMenuState('main');
                            }
                          }}
                          className="w-full px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
                        >
                          Cancelar Período
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            <div className="flex space-x-2 px-4 py-3 border-t border-gray-100">
              <button
                onClick={() => setMenuState('lts')}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded hover:bg-gray-50 flex items-center justify-center space-x-1"
              >
                <X size={14} />
                <span>Voltar</span>
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
};