import React, { useState } from 'react';
import { FileText, Download, Calendar } from 'lucide-react';
import { Employee, AbsenceRecord } from '../types';
import { getDaysInMonth, formatDate, getDayName, isWeekend } from '../utils/dateUtils';
import { getAbsenceTypeInfo } from '../data/absenceTypes';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

interface MonthlyPDFGeneratorProps {
  employees: Employee[];
  absenceRecords: AbsenceRecord[];
  currentDate: Date;
  activeTeam: string;
  getAbsence: (employeeId: string, date: string) => any;
  isSpecialDay: (date: string, type?: 'F' | 'PF') => boolean;
}

export const MonthlyPDFGenerator: React.FC<MonthlyPDFGeneratorProps> = ({
  employees,
  absenceRecords,
  currentDate,
  activeTeam,
  getAbsence,
  isSpecialDay,
}) => {
  const [isGenerating, setIsGenerating] = useState(false);

  const getTeamName = (teamId: string) => {
    switch (teamId) {
      case 'A': return 'Plantão A';
      case 'B': return 'Plantão B';
      case 'C': return 'Plantão C';
      case 'D': return 'Plantão D';
      case 'E': return 'Plantão Diurno';
      case 'F': return 'Atendimento';
      case 'G': return 'Administrativo';
      case 'H': return 'Auxiliares Educacionais';
      case 'I': return 'Direção';
      default: return `Equipe ${teamId}`;
    }
  };

  const generateMonthlyPDF = async () => {
    setIsGenerating(true);
    
    try {
      const days = getDaysInMonth(currentDate.getFullYear(), currentDate.getMonth());
      const monthNames = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
      ];

      const doc = new jsPDF('portrait', 'mm', 'a4');
      
      // Configurações da página
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();
      const margin = 10;
      const usableWidth = pageWidth - (margin * 2);
      
      // Título
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      const title = `Controle de Frequência - ${getTeamName(activeTeam)}`;
      doc.text(title, pageWidth / 2, 20, { align: 'center' });
      
      // Subtítulo
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      const subtitle = `${monthNames[currentDate.getMonth()]} de ${currentDate.getFullYear()}`;
      doc.text(subtitle, pageWidth / 2, 28, { align: 'center' });

      // Preparar dados da tabela
      const headers = ['Servidor'];
      const dayHeaders: string[] = [];
      
      // Adicionar cabeçalhos dos dias
      days.forEach(day => {
        const dayNum = String(day.getDate()).padStart(2, '0');
        const dayName = getDayName(day).substring(0, 1); // Primeira letra do dia
        dayHeaders.push(`${dayNum}\n${dayName}`);
      });
      
      headers.push(...dayHeaders);
      headers.push('Total');

      // Preparar dados dos funcionários
      const tableData: any[] = [];
      
      employees.forEach(employee => {
        const row = [employee.name];
        let totalAbsences = 0;
        
        // Adicionar dados de cada dia
        days.forEach(day => {
          const dateStr = formatDate(day);
          const absence = getAbsence(employee.id, dateStr);
          
          if (absence) {
            const absenceInfo = getAbsenceTypeInfo(absence.type);
            row.push(absenceInfo?.code || absence.type);
            totalAbsences++;
          } else {
            // Verificar se é fim de semana ou feriado
            const isWeekendDay = isWeekend(day);
            const isHolidayDay = isSpecialDay(dateStr, 'F');
            const isFacultativeDay = isSpecialDay(dateStr, 'PF');
            
            if (isWeekendDay) {
              row.push(''); // Vazio para fins de semana
            } else if (isHolidayDay) {
              row.push('F');
            } else if (isFacultativeDay) {
              row.push('PF');
            } else {
              row.push(''); // Dia normal sem ausência
            }
          }
        });
        
        row.push(totalAbsences.toString());
        tableData.push(row);
      });

      // Calcular larguras das colunas
      const nameColumnWidth = 40;
      const totalColumnWidth = 15;
      const dayColumnWidth = (usableWidth - nameColumnWidth - totalColumnWidth) / days.length;
      
      const columnWidths = [nameColumnWidth];
      for (let i = 0; i < days.length; i++) {
        columnWidths.push(dayColumnWidth);
      }
      columnWidths.push(totalColumnWidth);

      // Criar tabela
      (doc as any).autoTable({
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
            0: { cellWidth: nameColumnWidth, halign: 'left' }, // Nome
          };
          
          // Colunas dos dias
          for (let i = 1; i <= days.length; i++) {
            styles[i] = { 
              cellWidth: dayColumnWidth, 
              halign: 'center',
              fontSize: 5
            };
          }
          
          // Coluna total
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
        tableWidth: usableWidth,
        // Callback para colorir fins de semana
        didParseCell: function(data: any) {
          if (data.row.section === 'head' && data.column.index > 0 && data.column.index <= days.length) {
            const dayIndex = data.column.index - 1;
            const day = days[dayIndex];
            const isWeekendDay = isWeekend(day);
            const dateStr = formatDate(day);
            const isHolidayDay = isSpecialDay(dateStr, 'F');
            const isFacultativeDay = isSpecialDay(dateStr, 'PF');
            
            if (isWeekendDay) {
              data.cell.styles.fillColor = [239, 68, 68]; // Vermelho para fins de semana
              data.cell.styles.textColor = [255, 255, 255];
            } else if (isHolidayDay) {
              data.cell.styles.fillColor = [147, 51, 234]; // Roxo para feriados
              data.cell.styles.textColor = [255, 255, 255];
            } else if (isFacultativeDay) {
              data.cell.styles.fillColor = [245, 158, 11]; // Amarelo para ponto facultativo
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
        const columnWidth = usableWidth / 2;
        
        legendItems.forEach((item, index) => {
          const column = Math.floor(index / itemsPerColumn);
          const row = index % itemsPerColumn;
          const x = margin + (column * columnWidth);
          const y = legendY + (row * 4);
          
          doc.text(item, x, y);
        });
      }

      // Rodapé
      const pageCount = doc.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
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
      const fileName = `planilha-${getTeamName(activeTeam).toLowerCase().replace(/\s+/g, '-')}-${monthNames[currentDate.getMonth()].toLowerCase()}-${currentDate.getFullYear()}.pdf`;
      doc.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar o PDF da planilha. Tente novamente.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <button
      onClick={generateMonthlyPDF}
      disabled={isGenerating}
      className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
    >
      {isGenerating ? (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
      ) : (
        <FileText size={16} />
      )}
      <span>{isGenerating ? 'Gerando...' : 'Gerar PDF Mensal'}</span>
    </button>
  );
};