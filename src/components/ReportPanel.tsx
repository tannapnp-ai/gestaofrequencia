import React, { useState } from 'react';
import { FileText, Download, Filter, Calendar } from 'lucide-react';
import { Employee, AbsenceRecord } from '../types';
import { absenceTypes } from '../data/absenceTypes';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface ReportPanelProps {
  employees: Employee[];
  absenceRecords: AbsenceRecord[];
  teams: Array<{ id: string; name: string }>;
  currentDate: Date;
}

export const ReportPanel: React.FC<ReportPanelProps> = ({
  employees,
  absenceRecords,
  teams,
  currentDate,
}) => {
  const [selectedTeam, setSelectedTeam] = useState<string>('');
  const [selectedAbsenceType, setSelectedAbsenceType] = useState<string>('');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`
  );
  const [isGenerating, setIsGenerating] = useState(false);

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : `Equipe ${teamId}`;
  };

  const getAbsenceTypeName = (code: string) => {
    const type = absenceTypes.find(t => t.code === code);
    return type ? type.name : code;
  };

  const getFilteredData = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    
    let filteredEmployees = employees;
    if (selectedTeam) {
      filteredEmployees = employees.filter(emp => emp.team === selectedTeam);
    }

    const filteredRecords = absenceRecords.filter(record => {
      const recordDate = new Date(record.date);
      const matchesMonth = recordDate.getFullYear() === year && recordDate.getMonth() === month - 1;
      const matchesEmployee = filteredEmployees.some(emp => emp.id === record.employeeId);
      const matchesType = !selectedAbsenceType || record.type === selectedAbsenceType;
      
      return matchesMonth && matchesEmployee && matchesType;
    });

    return { filteredEmployees, filteredRecords };
  };

  const generatePDF = async () => {
    setIsGenerating(true);
    
    try {
      const { filteredEmployees, filteredRecords } = getFilteredData();
      const [year, month] = selectedMonth.split('-').map(Number);
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      const doc = new jsPDF();
      
      // Título
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Relatório de Ausências', 105, 20, { align: 'center' });
      
      // Subtítulo com filtros
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      let subtitle = `${monthNames[month - 1]} de ${year}`;
      if (selectedTeam) {
        subtitle += ` - ${getTeamName(selectedTeam)}`;
      }
      if (selectedAbsenceType) {
        subtitle += ` - ${getAbsenceTypeName(selectedAbsenceType)}`;
      }
      doc.text(subtitle, 105, 30, { align: 'center' });

      // Agrupar ausências por funcionário e tipo
      const tableData: any[] = [];
      
      filteredEmployees.forEach(employee => {
        const employeeRecords = filteredRecords.filter(record => record.employeeId === employee.id);
        
        if (employeeRecords.length > 0 || !selectedAbsenceType) {
          // Agrupar por tipo de ausência e criar períodos
          const absencesByType: Record<string, { dates: string[], periods: any[] }> = {};
          
          employeeRecords.forEach(record => {
            if (!absencesByType[record.type]) {
              absencesByType[record.type] = { dates: [], periods: [] };
            }
            absencesByType[record.type].dates.push(record.date);
          });

          // Processar períodos para cada tipo
          Object.keys(absencesByType).forEach(type => {
            const dates = absencesByType[type].dates.sort();
            
            if (['L'].includes(type)) {
              // Agrupar em períodos consecutivos
              let currentPeriod: string[] = [];
              
              dates.forEach((date, index) => {
                if (currentPeriod.length === 0) {
                  currentPeriod = [date];
                } else {
                  const lastDate = new Date(currentPeriod[currentPeriod.length - 1]);
                  const currentDate = new Date(date);
                  const nextDay = new Date(lastDate);
                  nextDay.setDate(nextDay.getDate() + 1);
                  
                  if (currentDate.getTime() === nextDay.getTime()) {
                    currentPeriod.push(date);
                  } else {
                    // Finalizar período anterior
                    absencesByType[type].periods.push([...currentPeriod]);
                    currentPeriod = [date];
                  }
                }
                
                // Se é o último item, finalizar período
                if (index === dates.length - 1) {
                  absencesByType[type].periods.push([...currentPeriod]);
                }
              });
            } else {
              // Para outros tipos, cada data é um período individual
              absencesByType[type].periods = dates.map(date => [date]);
            }
          });

          if (Object.keys(absencesByType).length > 0) {
            Object.entries(absencesByType).forEach(([type, data]) => {
              data.periods.forEach(period => {
                const startDate = new Date(period[0]).toLocaleDateString('pt-BR');
                const endDate = new Date(period[period.length - 1]).toLocaleDateString('pt-BR');
                const dateRange = startDate === endDate ? startDate : `${startDate} - ${endDate}`;
                
                let details = '';
                if (type === 'L') {
                  // Para LTS, mostrar quantidade de dias
                  details = `${period.length} dias`;
                } else {
                  // Para outros tipos, mostrar quantidade de dias
                  details = `${period.length} dias`;
                }
                
                tableData.push([
                  employee.name,
                  getAbsenceTypeName(type),
                  dateRange,
                  details
                ]);
              });
            });
          } else if (!selectedAbsenceType) {
            // Mostrar funcionário sem ausências
            tableData.push([
              employee.name,
              'Nenhuma ausência',
              '-',
              '-'
            ]);
          }
        }
      });

      // Criar tabela
      (doc as any).autoTable({
        head: [['Servidor', 'Tipo de Ausência', 'Período', 'Detalhes']],
        body: tableData,
        startY: 40,
        styles: {
          fontSize: 8,
          cellPadding: 2,
        },
        headStyles: {
          fillColor: [59, 130, 246],
          textColor: 255,
          fontStyle: 'bold',
        },
        alternateRowStyles: {
          fillColor: [248, 250, 252],
        },
        columnStyles: {
          0: { cellWidth: 50 }, // Servidor
          1: { cellWidth: 45 }, // Tipo
          2: { cellWidth: 50 }, // Período
          3: { cellWidth: 35 }, // Detalhes
        },
        margin: { left: 10, right: 10 },
      });

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
          105,
          290,
          { align: 'center' }
        );
        doc.text(`Página ${i} de ${pageCount}`, 190, 290, { align: 'right' });
      }

      // Salvar PDF
      const fileName = `relatorio-ausencias-${selectedMonth}${selectedTeam ? `-${selectedTeam}` : ''}${selectedAbsenceType ? `-${selectedAbsenceType}` : ''}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o relatório PDF. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const { filteredEmployees, filteredRecords } = getFilteredData();

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <FileText className="text-blue-600" size={20} />
          <h3 className="text-lg font-medium text-gray-900">Relatórios</h3>
        </div>
      </div>

      {/* Filtros */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Mês/Ano
          </label>
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Equipe
          </label>
          <select
            value={selectedTeam}
            onChange={(e) => setSelectedTeam(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todas as equipes</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>{team.name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tipo de Ausência
          </label>
          <select
            value={selectedAbsenceType}
            onChange={(e) => setSelectedAbsenceType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Todos os tipos</option>
            {absenceTypes.map(type => (
              <option key={type.code} value={type.code}>{type.name}</option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            onClick={generatePDF}
            disabled={isGenerating}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
          >
            {isGenerating ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Download size={16} />
            )}
            <span>{isGenerating ? 'Gerando...' : 'Gerar PDF'}</span>
          </button>
        </div>
      </div>

      {/* Preview dos dados */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-900">
              Preview dos Dados
            </h4>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{filteredEmployees.length} funcionários</span>
              <span>{filteredRecords.length} registros</span>
            </div>
          </div>
        </div>
        
        <div className="max-h-64 overflow-y-auto">
          <table className="w-full">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Servidor
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                  Ausências
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredEmployees.slice(0, 10).map(employee => {
                const employeeRecords = filteredRecords.filter(record => record.employeeId === employee.id);
                const absencesByType: Record<string, number> = {};
                
                employeeRecords.forEach(record => {
                  absencesByType[record.type] = (absencesByType[record.type] || 0) + 1;
                });

                return (
                  <tr key={employee.id} className="hover:bg-gray-50">
                    <td className="px-4 py-2 text-sm text-gray-900">
                      {employee.name}
                    </td>
                    <td className="px-4 py-2 text-sm text-gray-600">
                      {Object.keys(absencesByType).length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {Object.entries(absencesByType).map(([type, count]) => (
                            <span
                              key={type}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {type}: {count}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-400">Nenhuma ausência</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          
          {filteredEmployees.length > 10 && (
            <div className="px-4 py-3 bg-gray-50 text-center text-sm text-gray-600">
              ... e mais {filteredEmployees.length - 10} funcionários
            </div>
          )}
        </div>
      </div>
    </div>
  );
};