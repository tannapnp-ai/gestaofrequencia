import React, { useState } from 'react';
import { FileText, Download, Calendar, Users, X, Check } from 'lucide-react';
import { Employee, AbsenceRecord } from '../types';
import { getDaysInMonth, formatDate, getDayName, isWeekend } from '../utils/dateUtils';
import { getAbsenceTypeInfo } from '../data/absenceTypes';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

interface PDFReportsMenuProps {
  employees: Employee[];
  absenceRecords: AbsenceRecord[];
  teams: Array<{ id: string; name: string }>;
  getAbsence: (employeeId: string, date: string) => any;
  isSpecialDay: (date: string, type?: 'F' | 'PF') => boolean;
  getVacationPeriods: (employeeId: string) => any[];
}

type ReportType = 'monthly' | 'vacation';

export const PDFReportsMenu: React.FC<PDFReportsMenuProps> = ({
  employees,
  absenceRecords,
  teams,
  getAbsence,
  isSpecialDay,
  getVacationPeriods,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [reportType, setReportType] = useState<ReportType>('monthly');
  const [selectedMonth, setSelectedMonth] = useState<string>(
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`
  );
  const [selectedTeams, setSelectedTeams] = useState<string[]>([]);
  const [vacationTypes, setVacationTypes] = useState<string[]>(['FE', 'FP']);
  const [sortBy, setSortBy] = useState<'name' | 'date'>('name');
  const [isGenerating, setIsGenerating] = useState(false);

  const getTeamName = (teamId: string) => {
    const team = teams.find(t => t.id === teamId);
    return team ? team.name : `Equipe ${teamId}`;
  };

  const handleTeamToggle = (teamId: string) => {
    setSelectedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const handleVacationTypeToggle = (type: string) => {
    setVacationTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const generateMonthlyPDF = async () => {
    if (selectedTeams.length === 0) {
      alert('Selecione pelo menos uma equipe.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const [year, month] = selectedMonth.split('-').map(Number);
      const days = getDaysInMonth(year, month - 1);
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      const doc = new jsPDF('landscape', 'mm', 'a4');
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;

      for (let teamIndex = 0; teamIndex < selectedTeams.length; teamIndex++) {
        const teamId = selectedTeams[teamIndex];
        const teamEmployees = employees.filter(emp => emp.team === teamId);
        
        if (teamEmployees.length === 0) continue;

        if (teamIndex > 0) {
          doc.addPage();
        }

        // Título
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        const title = `Planilha Mensal - ${getTeamName(teamId)}`;
        doc.text(title, pageWidth / 2, 20, { align: 'center' });
        
        // Subtítulo
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        const subtitle = `${monthNames[month - 1]} de ${year}`;
        doc.text(subtitle, pageWidth / 2, 28, { align: 'center' });

        // Preparar dados da tabela
        const headers = ['Servidor'];
        days.forEach(day => {
          const dayNum = String(day.getDate()).padStart(2, '0');
          const dayName = getDayName(day).substring(0, 1);
          headers.push(`${dayNum}\n${dayName}`);
        });
        headers.push('Total');

        const tableData: any[] = [];
        
        teamEmployees.forEach(employee => {
          const row = [employee.name];
          let totalAbsences = 0;
          
          days.forEach(day => {
            const dateStr = formatDate(day);
            const absence = getAbsence(employee.id, dateStr);
            
            if (absence) {
              const absenceInfo = getAbsenceTypeInfo(absence.type);
              row.push(absenceInfo?.code || absence.type);
              totalAbsences++;
            } else {
              const isWeekendDay = isWeekend(day);
              const isHolidayDay = isSpecialDay(dateStr, 'F');
              const isFacultativeDay = isSpecialDay(dateStr, 'PF');
              
              if (isWeekendDay || isHolidayDay || isFacultativeDay) {
                row.push('');
              } else {
                row.push('');
              }
            }
          });
          
          row.push(totalAbsences.toString());
          tableData.push(row);
        });

        // Calcular larguras das colunas
        const nameColumnWidth = 50;
        const totalColumnWidth = 15;
        const dayColumnWidth = (pageWidth - margin * 2 - nameColumnWidth - totalColumnWidth) / days.length;
        
        const columnWidths = [nameColumnWidth];
        for (let i = 0; i < days.length; i++) {
          columnWidths.push(dayColumnWidth);
        }
        columnWidths.push(totalColumnWidth);

        // Criar tabela
        doc.autoTable({
          head: [headers],
          body: tableData,
          startY: 35,
          styles: {
            fontSize: 6,
            cellPadding: 1,
            lineColor: [0, 0, 0],
            lineWidth: 0.1,
          },
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold',
            fontSize: 6,
            cellPadding: 1,
          },
          columnStyles: (() => {
            const styles: any = {
              0: { cellWidth: nameColumnWidth, halign: 'left' },
            };
            
            for (let i = 1; i <= days.length; i++) {
              styles[i] = { 
                cellWidth: dayColumnWidth, 
                halign: 'center',
                fontSize: 5
              };
            }
            
            styles[days.length + 1] = { 
              cellWidth: totalColumnWidth, 
              halign: 'center',
              fontStyle: 'bold'
            };
            
            return styles;
          })(),
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
          margin: { left: margin, right: margin },
          didParseCell: function(data: any) {
            if (data.row.section === 'head' && data.column.index > 0 && data.column.index <= days.length) {
              const dayIndex = data.column.index - 1;
              const day = days[dayIndex];
              const isWeekendDay = isWeekend(day);
              const dateStr = formatDate(day);
              const isHolidayDay = isSpecialDay(dateStr, 'F');
              const isFacultativeDay = isSpecialDay(dateStr, 'PF');
              
              if (isWeekendDay) {
                data.cell.styles.fillColor = [239, 68, 68];
                data.cell.styles.textColor = [255, 255, 255];
              } else if (isHolidayDay) {
                data.cell.styles.fillColor = [147, 51, 234];
                data.cell.styles.textColor = [255, 255, 255];
              } else if (isFacultativeDay) {
                data.cell.styles.fillColor = [245, 158, 11];
                data.cell.styles.textColor = [255, 255, 255];
              }
            }
          }
        });

        // Legenda
        const finalY = (doc as any).lastAutoTable.finalY + 10;
        
        if (finalY < pageHeight - 40) {
          doc.setFontSize(8);
          doc.setFont('helvetica', 'bold');
          doc.text('Legenda:', margin, finalY);
          
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7);
          
          const legendItems = [
            'FE - Férias Regulamentares',
            'FP - Férias Prêmio',
            'BH - Banco de Horas',
            'L - Licença para Tratamento de Saúde',
            'FO - Folga 4x1',
            'OA - Outros Afastamentos',
            'AI - Ausência Injustificada',
            'S - Suspensão',
            'F - Feriado',
            'PF - Ponto Facultativo'
          ];
          
          let legendY = finalY + 5;
          const itemsPerColumn = 5;
          const columnWidth = (pageWidth - margin * 2) / 2;
          
          legendItems.forEach((item, index) => {
            const column = Math.floor(index / itemsPerColumn);
            const row = index % itemsPerColumn;
            const x = margin + (column * columnWidth);
            const y = legendY + (row * 4);
            
            doc.text(item, x, y);
          });
        }

        // Rodapé
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
      }

      // Salvar PDF
      const fileName = `planilha-mensal-${selectedMonth}-${selectedTeams.join('-')}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF da planilha mensal. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateVacationPDF = async () => {
    if (selectedTeams.length === 0) {
      alert('Selecione pelo menos uma equipe.');
      return;
    }

    if (vacationTypes.length === 0) {
      alert('Selecione pelo menos um tipo de férias.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;

      // Título
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const title = 'Relatório de Férias por Equipe';
      doc.text(title, pageWidth / 2, 20, { align: 'center' });

      let currentY = 35;

      for (const teamId of selectedTeams) {
        const teamEmployees = employees.filter(emp => emp.team === teamId);
        
        if (teamEmployees.length === 0) continue;

        // Verificar se precisa de nova página
        if (currentY > pageHeight - 60) {
          doc.addPage();
          currentY = 20;
        }

        // Título da equipe
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(getTeamName(teamId), margin, currentY);
        currentY += 10;

        // Coletar dados de férias
        const vacationData: any[] = [];
        
        teamEmployees.forEach(employee => {
          const periods = getVacationPeriods(employee.id);
          
          periods.forEach(period => {
            if (vacationTypes.includes(period.type)) {
              const startDate = new Date(period.startDate + 'T12:00:00');
              const endDate = period.endDate ? new Date(period.endDate + 'T12:00:00') : null;
              
              vacationData.push({
                name: employee.name,
                type: period.type === 'FE' ? 'Férias Regulamentares' : 'Férias Prêmio',
                startDate: startDate.toLocaleDateString('pt-BR'),
                endDate: endDate ? endDate.toLocaleDateString('pt-BR') : '',
                days: period.type === 'FE' 
                  ? `${period.businessDays || 0} dias úteis`
                  : period.period === '15dias' 
                    ? '15 dias corridos'
                    : '1 mês corrido',
                sortDate: startDate
              });
            }
          });
        });

        if (vacationData.length === 0) {
          doc.setFontSize(10);
          doc.setFont('helvetica', 'italic');
          doc.text('Nenhum registro de férias encontrado.', margin, currentY);
          currentY += 15;
          continue;
        }

        // Ordenar dados
        vacationData.sort((a, b) => {
          if (sortBy === 'name') {
            return a.name.localeCompare(b.name);
          } else {
            return a.sortDate.getTime() - b.sortDate.getTime();
          }
        });

        // Preparar dados da tabela
        const tableData = vacationData.map(item => [
          item.name,
          item.type,
          item.startDate,
          item.endDate,
          item.days
        ]);

        // Criar tabela
        doc.autoTable({
          head: [['Servidor', 'Tipo', 'Data Início', 'Data Fim', 'Duração']],
          body: tableData,
          startY: currentY,
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          headStyles: {
            fillColor: [59, 130, 246],
            textColor: 255,
            fontStyle: 'bold',
          },
          columnStyles: {
            0: { cellWidth: 50 },
            1: { cellWidth: 45 },
            2: { cellWidth: 30 },
            3: { cellWidth: 30 },
            4: { cellWidth: 35 },
          },
          alternateRowStyles: {
            fillColor: [248, 250, 252],
          },
          margin: { left: margin, right: margin },
        });

        currentY = (doc as any).lastAutoTable.finalY + 15;
      }

      // Verificar se há dados
      const hasData = selectedTeams.some(teamId => {
        const teamEmployees = employees.filter(emp => emp.team === teamId);
        return teamEmployees.some(employee => {
          const periods = getVacationPeriods(employee.id);
          return periods.some(period => vacationTypes.includes(period.type));
        });
      });

      if (!hasData) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text('Nenhum dado encontrado para os filtros selecionados.', pageWidth / 2, 60, { align: 'center' });
      }

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'normal');
        doc.text(
          `Gerado em ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')}`,
          pageWidth / 2,
          pageHeight - 10,
          { align: 'center' }
        );
        doc.text(`Página ${i} de ${pageCount}`, pageWidth - margin, pageHeight - 10, { align: 'right' });
      }

      // Salvar PDF
      const fileName = `relatorio-ferias-${vacationTypes.join('-')}-${selectedTeams.join('-')}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF de férias. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerate = () => {
    if (reportType === 'monthly') {
      generateMonthlyPDF();
    } else {
      generateVacationPDF();
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center space-x-2 px-4 py-2 rounded-lg border transition-colors ${
          isOpen
            ? 'bg-purple-50 border-purple-200 text-purple-700'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
        }`}
      >
        <FileText size={16} />
        <span>📂 Gerar PDF</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-xl z-40 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Gerar Relatório PDF</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={20} />
              </button>
            </div>

            {/* Tipo de Relatório */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tipo de Relatório
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="monthly"
                    checked={reportType === 'monthly'}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                    className="mr-2"
                  />
                  <span className="text-sm">🔹 Planilha Mensal (por Equipe)</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    value="vacation"
                    checked={reportType === 'vacation'}
                    onChange={(e) => setReportType(e.target.value as ReportType)}
                    className="mr-2"
                  />
                  <span className="text-sm">🔹 Lista de Férias (por Equipe)</span>
                </label>
              </div>
            </div>

            {/* Filtros para Planilha Mensal */}
            {reportType === 'monthly' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mês e Ano
                </label>
                <input
                  type="month"
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            )}

            {/* Filtros para Lista de Férias */}
            {reportType === 'vacation' && (
              <>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipos de Férias
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={vacationTypes.includes('FE')}
                        onChange={() => handleVacationTypeToggle('FE')}
                        className="mr-2"
                      />
                      <span className="text-sm">FE - Férias Regulamentares</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={vacationTypes.includes('FP')}
                        onChange={() => handleVacationTypeToggle('FP')}
                        className="mr-2"
                      />
                      <span className="text-sm">FP - Férias Prêmio</span>
                    </label>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as 'name' | 'date')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="name">Nome do Servidor</option>
                    <option value="date">Data de Início</option>
                  </select>
                </div>
              </>
            )}

            {/* Seleção de Equipes */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipes
              </label>
              <div className="max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {teams.map(team => (
                  <label key={team.id} className="flex items-center py-1">
                    <input
                      type="checkbox"
                      checked={selectedTeams.includes(team.id)}
                      onChange={() => handleTeamToggle(team.id)}
                      className="mr-2"
                    />
                    <span className="text-sm">{team.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Botão Gerar */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || selectedTeams.length === 0}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Download size={16} />
              )}
              <span>{isGenerating ? 'Gerando...' : 'Gerar PDF'}</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
};