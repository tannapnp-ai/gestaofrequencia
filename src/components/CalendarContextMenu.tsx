import React from 'react';
import { Calendar, Flag } from 'lucide-react';

interface CalendarContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  date: string;
  isSpecialDay: (date: string, type?: 'F' | 'PF') => boolean;
  onClose: () => void;
  onSpecialDayAction: (date: string, type: 'F' | 'PF') => void;
}

export const CalendarContextMenu: React.FC<CalendarContextMenuProps> = ({
  isVisible,
  position,
  date,
  isSpecialDay,
  onClose,
  onSpecialDayAction,
}) => {
  if (!isVisible) return null;

  const isHoliday = isSpecialDay(date, 'F');
  const isFacultative = isSpecialDay(date, 'PF');
  const hasSpecialDay = isHoliday || isFacultative;

  return (
    <>
      <div
        className="fixed inset-0 z-30"
        onClick={onClose}
      />
      <div
        className="absolute z-40 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-48"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="px-4 py-2 text-sm font-medium text-gray-900 border-b border-gray-100">
          {new Date(date).toLocaleDateString('pt-BR')}
        </div>
        
        {hasSpecialDay ? (
          <button
            onClick={() => {
              // Remove o dia especial existente
              onClose();
              // Simula remoção (será implementado no hook)
              if (isHoliday) {
                onSpecialDayAction(date, 'F');
              } else {
                onSpecialDayAction(date, 'PF');
              }
            }}
            className="w-full px-4 py-3 text-left hover:bg-red-50 flex items-center space-x-3 text-sm text-red-600"
          >
            <Calendar size={16} />
            <span>
              Remover {isHoliday ? 'Feriado' : 'Ponto Facultativo'}
            </span>
          </button>
        ) : (
          <>
            <button
              onClick={() => onSpecialDayAction(date, 'F')}
              className="w-full px-4 py-3 text-left hover:bg-purple-50 flex items-center space-x-3 text-sm text-purple-600"
            >
              <Flag size={16} />
              <span>Marcar como Feriado</span>
            </button>
            
            <button
              onClick={() => onSpecialDayAction(date, 'PF')}
              className="w-full px-4 py-3 text-left hover:bg-yellow-50 flex items-center space-x-3 text-sm text-yellow-600"
            >
              <Calendar size={16} />
              <span>Marcar como Ponto Facultativo</span>
            </button>
          </>
        )}
      </div>
    </>
  );
};