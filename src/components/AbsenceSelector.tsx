import React from 'react';
import { AbsenceType } from '../types';
import { absenceTypes } from '../data/absenceTypes';

interface AbsenceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (type: AbsenceType | null) => void;
  position: { x: number; y: number };
}

export const AbsenceSelector: React.FC<AbsenceSelectorProps> = ({
  isOpen,
  onClose,
  onSelect,
  position,
}) => {
  if (!isOpen) return null;

 // Filtrar opções que devem ser registradas apenas pelo menu do servidor
 const filteredAbsenceTypes = absenceTypes.filter(type => 
   !['FE', 'FP', 'L'].includes(type.code)
 );
  return (
    <>
      <div
        className="fixed inset-0 z-10"
        onClick={onClose}
      />
      <div
        className="absolute z-20 bg-white border border-gray-200 rounded-lg shadow-lg py-2 min-w-48"
        style={{
          left: position.x,
          top: position.y,
        }}
      >
        <div className="px-3 py-2 text-xs font-medium text-gray-500 border-b border-gray-100">
          Selecionar Ausência
        </div>
        {filteredAbsenceTypes.map((absenceType) => (
          <button
            key={absenceType.code}
            onClick={() => {
              onSelect(absenceType.code);
              onClose();
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 flex items-center space-x-3"
          >
            <span
              className="px-2 py-1 rounded text-xs font-medium"
              style={{
                color: absenceType.color,
                backgroundColor: absenceType.bgColor,
              }}
            >
              {absenceType.code}
            </span>
            <span className="text-sm text-gray-700">{absenceType.name}</span>
          </button>
        ))}
        <div className="border-t border-gray-100 mt-2 pt-2">
          <button
            onClick={() => {
              onSelect(null);
              onClose();
            }}
            className="w-full px-3 py-2 text-left hover:bg-gray-50 text-sm text-red-600"
          >
            Remover Ausência
          </button>
        </div>
      </div>
    </>
  );
};