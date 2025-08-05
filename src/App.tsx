import React, { useState } from 'react';
import { Calendar, Users, BarChart3 } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useEmployeeData } from './hooks/useEmployeeData';
import { AbsenceType } from './types';
import { LoginForm } from './components/LoginForm';
import { UserMenu } from './components/UserMenu';
import { PermissionGuard } from './components/PermissionGuard';
import { TeamTabs } from './components/TeamTabs';
import { CalendarGrid } from './components/CalendarGrid';
import { LegendTooltip } from './components/LegendTooltip';
import { SummaryPanel } from './components/SummaryPanel';
import { TeamManagement } from './components/TeamManagement';
import { ReportPanel } from './components/ReportPanel';
import { PDFReportsMenu } from './components/PDFReportsMenu';
import { FileText } from 'lucide-react';

function App() {
  const { user, loading: authLoading } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTeam, setActiveTeam] = useState<string>('A');
  const [showSummary, setShowSummary] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [teams, setTeams] = useState([
    { id: 'A', name: 'Plantão D' },
    { id: 'B', name: 'Plantão A' },
    { id: 'C', name: 'Plantão B' },
    { id: 'D', name: 'Plantão C' },
    { id: 'E', name: 'Plantão Diurno' },
    { id: 'F', name: 'Atendimento' },
    { id: 'G', name: 'Administrativo' },
    { id: 'H', name: 'Auxiliares Educacionais' },
    { id: 'I', name: 'Direção' },
  ]);

  const {
    employees,
    absenceRecords,
    specialDays,
    actionHistory,
    loading,
    undoLastAction,
    moveEmployeeToTeam,
    addAbsence,
    removeAbsence,
    getAbsence,
    getEmployeesByTeam,
    getActiveEmployeesCount,
    getVacationPeriods,
    cancelVacationPeriod,
    getLTSPeriods,
    deleteEmployee,
    cancelLTSPeriod,
    registerVacationFE,
    registerVacationFP,
    registerVacationFEWithDates,
    registerVacationFPWithDates,
    registerVacationFP15Days,
    registerLTS,
    addEmployee,
    updateEmployee,
    addSpecialDay,
    removeSpecialDay,
    isSpecialDay,
  } = useEmployeeData();

  // Implementar Ctrl+Z para desfazer ações
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === 'z' && actionHistory.length > 0) {
        event.preventDefault();
        
        const lastAction = actionHistory[actionHistory.length - 1];
        const shouldUndo = window.confirm(
          `🔄 DESFAZER AÇÃO\n\n` +
          `📝 Ação: ${lastAction.description}\n` +
          `⏰ Horário: ${new Date(lastAction.timestamp).toLocaleString('pt-BR')}\n\n` +
          `Deseja desfazer esta ação?`
        );
        
        if (shouldUndo) {
          undoLastAction();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [actionHistory, undoLastAction]);

  // Mostrar tela de login se não estiver autenticado
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <LoginForm />;
  }

  const handleAbsenceChange = (employeeId: string, date: string, type: AbsenceType | null) => {
    if (type) {
      addAbsence(employeeId, date, type);
    } else {
      removeAbsence(employeeId, date);
    }
  };

  const handleEmployeeDrop = (employeeId: string, newTeam: string) => {
    moveEmployeeToTeam(employeeId, newTeam);
  };


  const handleLTSRegister = (employeeId: string, startDate: string, days: number) => {
    registerLTS(employeeId, startDate, days);
  };

  const handleAddEmployee = (name: string, team: string, role?: string, workSchedule?: string, career?: string) => {
    addEmployee(name, team, role, workSchedule, career);
  };

 const handleEmployeeUpdate = (employeeId: string, updates: Partial<Employee>) => {
   updateEmployee(employeeId, updates);
 };
  const handleAddTeam = (teamName: string) => {
    const newTeamId = String.fromCharCode(65 + teams.length); // A, B, C, D, E, F...
    setTeams(prev => [...prev, { id: newTeamId, name: teamName, coordinator: '', reference: '' }]);
  };

  const handleEditTeam = (teamId: string, newName: string) => {
    setTeams(prev => prev.map(team => 
      team.id === teamId ? { ...team, name: newName } : team
    ));
  };

  const handleDeleteTeam = (teamId: string) => {
    // Verificar se há funcionários na equipe
    const teamEmployees = getEmployeesByTeam(teamId);
    if (teamEmployees.length > 0) {
      alert(`❌ NÃO É POSSÍVEL EXCLUIR A EQUIPE!\n\nA equipe "${teams.find(t => t.id === teamId)?.name}" possui ${teamEmployees.length} funcionário(s).\n\n💡 Mova todos os funcionários para outras equipes antes de excluir.`);
      return;
    }
    
    setTeams(prev => prev.filter(team => team.id !== teamId));
    
    // Se a equipe ativa foi excluída, mudar para a primeira disponível
    if (activeTeam === teamId) {
      const remainingTeams = teams.filter(team => team.id !== teamId);
      if (remainingTeams.length > 0) {
        setActiveTeam(remainingTeams[0].id);
      }
    }
  };

  const handleReorderTeams = (newTeamsOrder: Array<{ id: string; name: string }>) => {
    setTeams(newTeamsOrder);
  };
  // Filter employees based on search term and absence filter
  const filteredEmployees = getEmployeesByTeam(activeTeam);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados do sistema...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Calendar className="text-blue-600" size={24} />
              <h1 className="text-xl font-semibold text-gray-900">
                Controle de Férias e Folgas
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowSummary(!showSummary)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showSummary
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <BarChart3 size={16} />
                <span>Resumo</span>
              </button>
              
              <button
                onClick={() => setShowReports(!showReports)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
                  showReports
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText size={16} />
                <span>Relatórios</span>
              </button>
              
              <LegendTooltip />
              
              <PDFReportsMenu
                employees={employees}
                absenceRecords={absenceRecords}
                teams={teams}
                getAbsence={getAbsence}
                isSpecialDay={isSpecialDay}
                getVacationPeriods={getVacationPeriods}
              />
              
              <UserMenu />
              
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <Users size={16} />
                <span>{employees.length} funcionários</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        <div className="space-y-6">
          <PermissionGuard requiredLevel="admin">
            <TeamManagement
              teams={teams}
              onAddEmployee={handleAddEmployee}
              onAddTeam={handleAddTeam}
            />
          </PermissionGuard>

          <TeamTabs
            activeTeam={activeTeam}
            onTeamChange={setActiveTeam}
            teams={teams}
            getEmployeesByTeam={getEmployeesByTeam}
            onEditTeam={handleEditTeam}
            onDeleteTeam={handleDeleteTeam}
            onReorderTeams={handleReorderTeams}
          />


          <div className="overflow-x-auto">
            <CalendarGrid
              employees={filteredEmployees}
              currentDate={currentDate}
              onMonthChange={setCurrentDate}
              activeTeam={activeTeam}
              activeTeamName={teams.find(t => t.id === activeTeam)?.name || `Equipe ${activeTeam}`}
              getAbsence={getAbsence}
              getActiveEmployeesCount={getActiveEmployeesCount}
              onAbsenceChange={handleAbsenceChange}
              onTeamChange={moveEmployeeToTeam}
              onLTSRegister={registerLTS}
              onEmployeeUpdate={updateEmployee}
              isSpecialDay={isSpecialDay}
              getLTSPeriods={getLTSPeriods}
              onCancelLTSPeriod={cancelLTSPeriod}
              addSpecialDay={addSpecialDay}
              removeSpecialDay={removeSpecialDay}
              registerVacationFE={registerVacationFE}
              registerVacationFP={registerVacationFP}
              registerVacationFEWithDates={registerVacationFEWithDates}
              registerVacationFPWithDates={registerVacationFPWithDates}
              getVacationPeriods={getVacationPeriods}
              cancelVacationPeriod={cancelVacationPeriod}
             onDeleteEmployee={deleteEmployee}
            />
          </div>

          {showSummary && (
            <SummaryPanel
              employees={employees}
              absenceRecords={absenceRecords}
              currentDate={currentDate}
              activeTeam={activeTeam}
            />
          )}

          {showReports && (
            <ReportPanel
              employees={employees}
              absenceRecords={absenceRecords}
              teams={teams}
              currentDate={currentDate}
            />
          )}
        </div>
      </div>

      {/* Rodapé com Direitos Intelectuais */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <div className="text-sm text-gray-600 mb-2">
              <strong>Sistema de Gestão de Frequência por Plantão</strong>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>© 2025 - Todos os direitos reservados</p>
              <p>
                <strong>Desenvolvimento e Propriedade Intelectual:</strong> Tanna Paula Novais Pereira
              </p>
              <p>
                Este software é propriedade intelectual exclusiva de Tanna Paula Novais Pereira.
                Reprodução, distribuição ou uso não autorizado é estritamente proibido.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;