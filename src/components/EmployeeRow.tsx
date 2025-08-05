import React, { useState } from 'react';
import { Employee, AbsenceType } from '../types';
import { getDaysInMonth, formatDate, getDayName, isWeekend } from '../utils/dateUtils';
import { getAbsenceTypeInfo } from '../data/absenceTypes';
import { AbsenceSelector } from './AbsenceSelector';
import { EmployeeContextMenu } from './EmployeeContextMenu';

interface EmployeeRowProps {
  employee: Employee;
  currentDate: Date;
  isReadOnly?: boolean;
  getAbsence: (employeeId: string, date: string) => any;
  onAbsenceChange: (employeeId: string, date: string, type: AbsenceType | null) => void;
  onTeamChange: (employeeId: string, newTeam: string) => void;
  onLTSRegister: (employeeId: string, startDate: string, days: number) => void;
 onEmployeeUpdate: (employeeId: string, updates: Partial<Employee>) => void;
  isSpecialDay: (date: string, type?: 'F' | 'PF') => boolean;
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

export const EmployeeRow: React.FC<EmployeeRowProps> = ({
  employee,
  currentDate,
  isReadOnly = false,
  getAbsence,
  onAbsenceChange,
  onTeamChange,
  onLTSRegister,
 onEmployeeUpdate,
  isSpecialDay,
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
  const [selectorState, setSelectorState] = useState<{
    isOpen: boolean;
    position: { x: number; y: number };
    employeeId: string;
    date: string;
  }>({
    isOpen: false,
    position: { x: 0, y: 0 },
    employeeId: '',
    date: '',
  });

  const [contextMenuState, setContextMenuState] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
  });


  const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());

  // Verificar se é coordenador ou supervisor
  const isLeadership = employee.role === 'Coordenação de Segurança' || employee.role === 'Supervisão de Segurança';

  const handleCellClick = (event: React.MouseEvent, employeeId: string, date: string) => {
    if (isReadOnly) return;
    
    const rect = event.currentTarget.getBoundingClientRect();
    setSelectorState({
      isOpen: true,
      position: { x: rect.left, y: rect.bottom + 5 },
      employeeId,
      date,
    });
  };

  const handleAbsenceSelect = (type: AbsenceType | null) => {
    if (type === null) {
      onAbsenceChange(selectorState.employeeId, selectorState.date, null);
    } else {
      onAbsenceChange(selectorState.employeeId, selectorState.date, type);
    }
    setSelectorState(prev => ({ ...prev, isOpen: false }));
  };

  const handleEmployeeClick = (event: React.MouseEvent) => {
    if (isReadOnly) return;
    
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setContextMenuState({
      isVisible: true,
      position: { x: rect.right + 10, y: rect.top },
    });
  };


  const handleMenuClose = () => {
    setContextMenuState(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <>
      <tr className="hover:bg-gray-50">
        <td className={`px-2 sm:px-3 py-2 border-r border-gray-200 bg-gray-50 font-medium sticky left-0 z-10 text-xs sm:text-sm ${
          isLeadership ? 'text-black font-bold' : 'text-gray-900'
        }`}>
          <div 
            className={`cursor-pointer transition-colors ${
              contextMenuState.isVisible ? 'text-blue-600' : 'hover:text-blue-600'
            }`}
            onClick={handleEmployeeClick}
          >
            <span>{employee.name}</span>
            {isLeadership && (
              <div className={`text-xs font-normal ${
                contextMenuState.isVisible ? 'text-blue-600' : 'text-gray-600'
              }`}>
                {employee.role === 'Coordenação de Segurança' ? 'Coordenador' : 'Supervisor'}
              </div>
            )}
          </div>
        </td>
        {days.map((day) => {
          const dateStr = formatDate(day);
          const absence = getAbsence(employee.id, dateStr);
          const absenceInfo = absence ? getAbsenceTypeInfo(absence.type) : null;
          const isWeekendDay = isWeekend(day);
          const isHolidayDay = isSpecialDay(dateStr, 'F');

          return (
            <td
              key={dateStr}
              className={`px-1 py-1 sm:py-2 border-r border-gray-200 text-center cursor-pointer hover:bg-blue-50 text-xs ${
                isWeekendDay || isHolidayDay ? 'bg-gray-100' : 'bg-white'
              } ${
                isReadOnly ? 'cursor-not-allowed opacity-75' : ''
              }`}
              onClick={(e) => handleCellClick(e, employee.id, dateStr)}
            >
              {absenceInfo ? (
                <span
                  className="px-1 py-0.5 sm:py-1 rounded text-xs font-medium"
                  style={{
                    color: absenceInfo.color,
                    backgroundColor: absenceInfo.bgColor,
                  }}
                >
                  {absenceInfo.code}
                </span>
              ) : null}
            </td>
          );
        })}
      </tr>
      
      <AbsenceSelector
        isOpen={selectorState.isOpen}
        onClose={() => setSelectorState(prev => ({ ...prev, isOpen: false }))}
        onSelect={handleAbsenceSelect}
        position={selectorState.position}
      />
      
      <EmployeeContextMenu
        employee={employee}
        isVisible={contextMenuState.isVisible}
        position={contextMenuState.position}
        onClose={handleMenuClose}
        onTeamChange={onTeamChange}
        getLTSPeriods={getLTSPeriods}
        onCancelLTSPeriod={onCancelLTSPeriod}
        onLTSRegister={onLTSRegister}
       onEmployeeUpdate={onEmployeeUpdate}
        registerVacationFE={registerVacationFE}
        registerVacationFEWithDates={registerVacationFEWithDates}
        registerVacationFP={registerVacationFP}
        registerVacationFPWithDates={registerVacationFPWithDates}
        getVacationPeriods={getVacationPeriods}
        cancelVacationPeriod={cancelVacationPeriod}
        onDeleteEmployee={onDeleteEmployee}
      />
    </>
  );
};