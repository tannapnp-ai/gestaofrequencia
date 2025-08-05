import React, { useState } from 'react';
import { Plus, Users, UserPlus, Edit2, Check, X } from 'lucide-react';
import { getFunctionsByTeam, getCareersByTeam } from '../utils/employeeDataUtils';

interface TeamManagementProps {
  teams: Array<{ id: string; name: string }>;
  onAddEmployee: (name: string, team: string, role?: string, workSchedule?: string, career?: string) => void;
  onAddTeam: (teamName: string) => void;
}

export const TeamManagement: React.FC<TeamManagementProps> = ({ 
  teams, 
  onAddEmployee, 
  onAddTeam
}) => {
  const [isAddingEmployee, setIsAddingEmployee] = useState(false);
  const [isAddingTeam, setIsAddingTeam] = useState(false);
  const [newEmployeeName, setNewEmployeeName] = useState('');
  const [newEmployeeRole, setNewEmployeeRole] = useState('');
  const [newEmployeeSchedule, setNewEmployeeSchedule] = useState('');
  const [newEmployeeCareer, setNewEmployeeCareer] = useState('');
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<string>(teams[0]?.id || 'A');

  const handleAddEmployee = () => {
    if (newEmployeeName.trim()) {
      onAddEmployee(
        newEmployeeName.trim(), 
        selectedTeam, 
        newEmployeeRole.trim() || undefined, 
        newEmployeeSchedule.trim() || undefined,
        newEmployeeCareer.trim() || undefined
      );
      setNewEmployeeName('');
      setNewEmployeeRole('');
      setNewEmployeeSchedule('');
      setNewEmployeeCareer('');
      setIsAddingEmployee(false);
    }
  };

  const handleAddTeam = () => {
    if (newTeamName.trim()) {
      onAddTeam(newTeamName.trim());
      setNewTeamName('');
      setIsAddingTeam(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Users className="text-blue-600" size={20} />
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Gerenciar Equipes</h3>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <button
            onClick={() => setIsAddingEmployee(!isAddingEmployee)}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <UserPlus size={16} />
            <span className="hidden sm:inline">Adicionar Servidor</span>
            <span className="sm:hidden">Servidor</span>
          </button>
          
          <button
            onClick={() => setIsAddingTeam(!isAddingTeam)}
            className="flex items-center justify-center space-x-2 px-3 sm:px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Adicionar Equipe</span>
            <span className="sm:hidden">Equipe</span>
          </button>
        </div>
      </div>

      {/* Adicionar Nova Equipe */}
      {isAddingTeam && (
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome da Nova Equipe
              </label>
              <input
                type="text"
                value={newTeamName}
                onChange={(e) => setNewTeamName(e.target.value)}
                placeholder="Digite o nome da equipe..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTeam()}
              />
            </div>
            
            <div className="flex items-end space-x-2">
              <button
                onClick={handleAddTeam}
                disabled={!newTeamName.trim()}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Adicionar Equipe
              </button>
              <button
                onClick={() => {
                  setIsAddingTeam(false);
                  setNewTeamName('');
                }}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Adicionar Novo Servidor */}
      {isAddingEmployee && (
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nome
              </label>
              <input
                type="text"
                value={newEmployeeName}
                onChange={(e) => setNewEmployeeName(e.target.value)}
                placeholder="Digite o nome..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === 'Enter' && handleAddEmployee()}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Equipe
              </label>
              <select
                value={selectedTeam}
                onChange={(e) => setSelectedTeam(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Carreira
              </label>
              <select
                value={newEmployeeCareer}
                onChange={(e) => setNewEmployeeCareer(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma carreira...</option>
                {getCareersByTeam(selectedTeam).map(career => (
                  <option key={career} value={career}>{career}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Função
              </label>
              <select
                value={newEmployeeRole}
                onChange={(e) => setNewEmployeeRole(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma função...</option>
                {getFunctionsByTeam(selectedTeam).map(func => (
                  <option key={func} value={func}>{func}</option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Escala de Trabalho
              </label>
              <select
                value={newEmployeeSchedule}
                onChange={(e) => setNewEmployeeSchedule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecione uma escala...</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Escala 4x1">Escala 4x1</option>
                <option value="Plantão 12x36">Plantão 12x36</option>
                <option value="Plantão 24x72">Plantão 24x72</option>
              </select>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-end space-y-2 sm:space-y-0 sm:space-x-2 mt-4">
            <button
              onClick={handleAddEmployee}
              disabled={!newEmployeeName.trim()}
              className="w-full sm:flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors text-sm"
            >
              Adicionar
            </button>
            <button
              onClick={() => {
                setIsAddingEmployee(false);
                setNewEmployeeName('');
                setNewEmployeeRole('');
                setNewEmployeeSchedule('');
                setNewEmployeeCareer('');
              }}
              className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};