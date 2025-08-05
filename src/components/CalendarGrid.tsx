import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { Employee, AbsenceType } from '../types';
import { getDaysInMonth, formatDate, getDayName, isWeekend } from '../utils/dateUtils';
import { EmployeeRow } from './EmployeeRow';

interface CalendarGridProps {
  employees: Employee[];
  currentDate: Date;
  onMonthChange?: (date: Date) => void;
  activeTeam: string;
  activeTeamName: string;
  getAbsence: (employeeId: string, date: string) => any;
  getActiveEmployeesCount: (team: string, date: string) => number;
  onAbsenceChange: (employeeId: string, date: string, type: AbsenceType | null) => void;
  onTeamChange: (employeeId: string, newTeam: string) => void;
  onLTSRegister: (employeeId: string, startDate: string, days: number) => void;
 onEmployeeUpdate: (employeeId: string, updates: Partial<Employee>) => void;
  isSpecialDay: (date: string, type?: 'F' | 'PF') => boolean;
  getLTSPeriods: (employeeId: string) => any[];
  onCancelLTSPeriod: (employeeId: string, startDate: string) => void;
  addSpecialDay: (date: string, type: 'F' | 'PF') => void;
  removeSpecialDay: (date: string) => void;
  registerVacationFE: (employeeId: string, startDate: string, businessDays: number) => void;
  registerVacationFEWithDates: (employeeId: string, startDate: string, endDate: string, businessDays: number) => void;
  registerVacationFP: (employeeId: string, startDate: string, period: '15dias' | '1mes') => void;
  registerVacationFPWithDates: (employeeId: string, startDate: string, endDate: string, period: '15dias' | '1mes') => void;
  getVacationPeriods: (employeeId: string) => any[];
  cancelVacationPeriod: (employeeId: string, startDate: string, type: 'FE' | 'FP') => void;
  onDeleteEmployee: (employeeId: string) => void;
}

export const CalendarGrid: React.FC<CalendarGridProps> = ({
  employees,
  currentDate,
  onMonthChange,
  activeTeam,
  activeTeamName,
  getAbsence,
  getActiveEmployeesCount,
  onAbsenceChange,
  onTeamChange,
  onLTSRegister,
 onEmployeeUpdate,
  isSpecialDay,
  getLTSPeriods,
  onCancelLTSPeriod,
  addSpecialDay,
  removeSpecialDay,
  registerVacationFE,
  registerVacationFEWithDates,
  registerVacationFP,
  registerVacationFPWithDates,
  getVacationPeriods,
  cancelVacationPeriod,
  onDeleteEmployee,
}) => {
  const { isAdmin } = useAuth();
  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const handleHeaderRightClick = (event: React.MouseEvent, date: string) => {
    if (!isAdmin()) return;
    
    event.preventDefault();
    setContextMenu({
      isVisible: true,
      position: { x: event.clientX, y: event.clientY },
      date,
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu(prev => ({ ...prev, isVisible: false }));
  };

  const handleSpecialDayAction = (date: string, type: 'F' | 'PF') => {
    const existing = isSpecialDay(date);
    if (existing) {
      removeSpecialDay(date);
    } else {
      addSpecialDay(date, type);
    }
    handleContextMenuClose();
  };

  return (
    <>
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-3 sm:px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-900">
            {activeTeamName}
          </h3>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => {
                const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
                // Precisamos passar essa função via props
                if (onMonthChange) onMonthChange(newDate);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Mês anterior"
            >
              ←
            </button>
            <span className="text-lg font-medium text-gray-700 min-w-40 text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </span>
            <button
              onClick={() => {
                const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
                if (onMonthChange) onMonthChange(newDate);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Próximo mês"
            >
              →
            </button>
          </div>
        </div>
      </div>
      <div className="overflow-x-auto min-w-full">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-2 py-2 text-left font-medium text-gray-900 border-r border-gray-200 sticky left-0 bg-gray-50 z-20 min-w-32 sm:min-w-36 text-xs sm:text-sm">
                Servidor
              </th>
              {days.map((day) => {
                const isWeekendDay = isWeekend(day);
                const isHolidayDay = isSpecialDay(formatDate(day), 'F');
                const isFacultativeDay = isSpecialDay(formatDate(day), 'PF');
                return (
                  <th
                    key={formatDate(day)}
                    className={`px-1 py-1 text-center font-medium border-r border-gray-200 min-w-8 sm:min-w-10 text-xs ${
                      isWeekendDay ? 'bg-red-100 text-red-700' : 
                      isHolidayDay ? 'bg-purple-100 text-purple-700' :
                      isFacultativeDay ? 'bg-yellow-100 text-yellow-700' : 'text-gray-900'
                    }`}
                  >
                    <div className="text-xs font-bold">
                      {String(day.getDate()).padStart(2, '0')}
                    </div>
                    <div className="text-xs text-gray-500 hidden sm:block">
                      {getDayName(day)}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {employees.map((employee) => (
              <EmployeeRow
                key={employee.id}
                employee={employee}
                currentDate={currentDate}
                getAbsence={getAbsence}
                onAbsenceChange={onAbsenceChange}
                onTeamChange={onTeamChange}
                onLTSRegister={onLTSRegister}
               onEmployeeUpdate={onEmployeeUpdate}
                isSpecialDay={isSpecialDay}
               getLTSPeriods={getLTSPeriods}
               onCancelLTSPeriod={onCancelLTSPeriod}
                isReadOnly={!isAdmin()}
                registerVacationFE={registerVacationFE}
                registerVacationFEWithDates={registerVacationFEWithDates}
                registerVacationFP={registerVacationFP}
                registerVacationFPWithDates={registerVacationFPWithDates}
                getVacationPeriods={getVacationPeriods}
                cancelVacationPeriod={cancelVacationPeriod}
               onDeleteEmployee={onDeleteEmployee}
              />
            ))}
            <tr className="bg-blue-50 border-t-2 border-blue-200">
              <td className="px-2 py-2 font-medium text-blue-900 border-r border-gray-200 sticky left-0 bg-blue-50 z-10 text-xs sm:text-sm">
                Servidores Ativos
              </td>
              {days.map((day) => {
                const dateStr = formatDate(day);
                const activeCount = getActiveEmployeesCount(activeTeam, dateStr);
                return (
                  <td
                    key={dateStr}
                    className="px-1 py-1 text-center font-bold text-blue-900 border-r border-gray-200 text-xs sm:text-sm"
                  >
                    {activeCount === -1 ? '' : activeCount}
                  </td>
                );
              })}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
};