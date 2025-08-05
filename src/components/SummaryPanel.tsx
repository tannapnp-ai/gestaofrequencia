import React from 'react';
import { Employee, AbsenceRecord } from '../types';
import { absenceTypes } from '../data/absenceTypes';

interface SummaryPanelProps {
  employees: Employee[];
  absenceRecords: AbsenceRecord[];
  currentDate: Date;
  activeTeam: string;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  employees,
  absenceRecords,
  currentDate,
  activeTeam,
}) => {
  const getEmployeeSummary = (employee: Employee) => {
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    const employeeRecords = absenceRecords.filter(record => {
      const recordDate = new Date(record.date);
      return record.employeeId === employee.id &&
             recordDate.getMonth() === currentMonth &&
             recordDate.getFullYear() === currentYear;
    });

    const summary: Record<string, number> = {};
    absenceTypes.forEach(type => {
      summary[type.code] = employeeRecords.filter(record => record.type === type.code).length;
    });

    const totalAbsences = Object.values(summary).reduce((sum, count) => sum + count, 0);
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const activeDays = daysInMonth - totalAbsences;

    return { summary, activeDays, totalAbsences };
  };

  const teamEmployees = employees.filter(emp => emp.team === activeTeam);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        Resumo Mensal - {activeTeam === 'A' ? 'Plantão D' :
                         activeTeam === 'B' ? 'Plantão A' :
                         activeTeam === 'C' ? 'Plantão B' :
                         activeTeam === 'D' ? 'Plantão C' :
                         activeTeam === 'E' ? 'Plantão Diurno' :
                         activeTeam === 'F' ? 'Atendimento' :
                         activeTeam === 'G' ? 'Administrativo' :
                         activeTeam === 'H' ? 'Auxiliares Educacionais' :
                         activeTeam === 'I' ? 'Direção' : `Equipe ${activeTeam}`}
      </h3>
      
      <div className="overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-4 py-3 text-left font-medium text-gray-900">Servidor</th>
              {absenceTypes.map(type => (
                <th key={type.code} className="px-3 py-3 text-center font-medium text-gray-900">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium"
                    style={{
                      color: type.color,
                      backgroundColor: type.bgColor,
                    }}
                  >
                    {type.code}
                  </span>
                </th>
              ))}
              <th className="px-3 py-3 text-center font-medium text-gray-900">Dias Ativos</th>
            </tr>
          </thead>
          <tbody>
            {teamEmployees.map(employee => {
              const { summary, activeDays } = getEmployeeSummary(employee);
              return (
                <tr key={employee.id} className="border-t border-gray-200">
                  <td className="px-4 py-3 font-medium text-gray-900">{employee.name}</td>
                  {absenceTypes.map(type => (
                    <td key={type.code} className="px-3 py-3 text-center text-gray-700">
                      {summary[type.code] || 0}
                    </td>
                  ))}
                  <td className="px-3 py-3 text-center font-medium text-green-600">
                    {activeDays}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};