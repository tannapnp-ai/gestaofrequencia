import React, { useState } from 'react';
import { Info } from 'lucide-react';
import { absenceTypes } from '../data/absenceTypes';

export const LegendTooltip: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className="relative">
      <button
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Ver legenda de ausências"
      >
        <Info size={20} />
      </button>
      
      {isVisible && (
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50">
          <div className="bg-white border border-gray-200 rounded-lg shadow-xl p-4 min-w-80">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Legenda de Ausências</h3>
            <div className="grid grid-cols-1 gap-2">
              {absenceTypes.map((type) => (
                <div key={type.code} className="flex items-center space-x-3">
                  <span
                    className="px-2 py-1 rounded text-xs font-medium min-w-12 text-center"
                    style={{
                      color: type.color,
                      backgroundColor: type.bgColor,
                    }}
                  >
                    {type.code}
                  </span>
                  <span className="text-sm text-gray-700">{type.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-white"></div>
        </div>
      )}
    </div>
  );
};