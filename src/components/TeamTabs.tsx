import React, { useState } from 'react';
import { ChevronDown, Edit2, Trash2, Check, X } from 'lucide-react';

interface TeamTabsProps {
  activeTeam: string;
  onTeamChange: (team: string) => void;
  teams: Array<{ id: string; name: string }>;
  getEmployeesByTeam: (teamId: string) => Array<{ id: string; name: string; team: string }>;
  onEditTeam?: (teamId: string, newName: string) => void;
  onDeleteTeam?: (teamId: string) => void;
  onEditTeam: (teamId: string, newName: string) => void;
  onDeleteTeam: (teamId: string) => void;
  onReorderTeams: (newTeamsOrder: Array<{ id: string; name: string }>) => void;
}

export const TeamTabs: React.FC<TeamTabsProps> = ({ 
  activeTeam, 
  onTeamChange, 
  teams,
  getEmployeesByTeam,
  onEditTeam,
  onDeleteTeam,
  onReorderTeams
}) => {
  const [editingTeamId, setEditingTeamId] = useState<string | null>(null);
  const [editingTeamName, setEditingTeamName] = useState('');
  const [draggedTeamId, setDraggedTeamId] = useState<string | null>(null);
  const [dragOverTeamId, setDragOverTeamId] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    isVisible: boolean;
    position: { x: number; y: number };
    teamId: string;
  }>({
    isVisible: false,
    position: { x: 0, y: 0 },
    teamId: '',
  });

  const handleTeamDoubleClick = (teamId: string, currentName: string) => {
    setEditingTeamId(teamId);
    setEditingTeamName(currentName);
  };

  const handleConfirmEdit = () => {
    if (editingTeamId && editingTeamName.trim() && onEditTeam) {
      onEditTeam(editingTeamId, editingTeamName.trim());
      setEditingTeamId(null);
      setEditingTeamName('');
    }
  };

  const handleCancelEdit = () => {
    setEditingTeamId(null);
    setEditingTeamName('');
  };

  const handleRightClick = (event: React.MouseEvent, teamId: string) => {
    event.preventDefault();
    setContextMenu({
      isVisible: true,
      position: { x: event.clientX, y: event.clientY },
      teamId,
    });
  };

  const handleDragStart = (event: React.DragEvent, teamId: string) => {
    setDraggedTeamId(teamId);
    event.dataTransfer.effectAllowed = 'move';
    event.dataTransfer.setData('text/html', teamId);
    
    // Adicionar estilo visual ao elemento sendo arrastado
    const target = event.target as HTMLElement;
    target.style.opacity = '0.5';
  };

  const handleDragEnd = (event: React.DragEvent) => {
    const target = event.target as HTMLElement;
    target.style.opacity = '1';
    setDraggedTeamId(null);
    setDragOverTeamId(null);
  };

  const handleDragOver = (event: React.DragEvent, teamId: string) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setDragOverTeamId(teamId);
  };

  const handleDragLeave = () => {
    setDragOverTeamId(null);
  };

  const handleDrop = (event: React.DragEvent, targetTeamId: string) => {
    event.preventDefault();
    
    if (!draggedTeamId || draggedTeamId === targetTeamId) {
      setDragOverTeamId(null);
      return;
    }

    const draggedIndex = teams.findIndex(team => team.id === draggedTeamId);
    const targetIndex = teams.findIndex(team => team.id === targetTeamId);

    if (draggedIndex === -1 || targetIndex === -1) {
      setDragOverTeamId(null);
      return;
    }

    // Criar nova ordem das equipes
    const newTeams = [...teams];
    const [draggedTeam] = newTeams.splice(draggedIndex, 1);
    newTeams.splice(targetIndex, 0, draggedTeam);

    onReorderTeams(newTeams);
    setDragOverTeamId(null);
  };
  const handleDeleteTeam = (teamId: string) => {
    const teamEmployees = getEmployeesByTeam(teamId);
    if (teamEmployees.length > 0) {
      alert(`❌ NÃO É POSSÍVEL EXCLUIR A EQUIPE!\n\nA equipe "${teams.find(t => t.id === teamId)?.name}" possui ${teamEmployees.length} funcionário(s).\n\n💡 Mova todos os funcionários para outras equipes antes de excluir.`);
      return;
    }
    
    const team = teams.find(t => t.id === teamId);
    if (team && onDeleteTeam && window.confirm(`Tem certeza que deseja excluir a equipe "${team.name}"?\n\nEsta ação não pode ser desfeita.`)) {
      onDeleteTeam(teamId);
    }
    setContextMenu(prev => ({ ...prev, isVisible: false }));
  };

  return (
    <>
      <div className="mb-6">
      <div className="flex flex-wrap border-b border-gray-200">
        {teams.map((team) => (
          <div
            key={team.id}
            className="relative"
          >
            {editingTeamId === team.id ? (
              <div className="flex items-center space-x-2 px-4 py-3 border-b-2 border-blue-500 bg-blue-50">
                <input
                  type="text"
                  value={editingTeamName}
                  onChange={(e) => setEditingTeamName(e.target.value)}
                  className="px-2 py-1 text-sm border border-blue-300 rounded focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleConfirmEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                  onBlur={handleConfirmEdit}
                  autoFocus
                />
                <button
                  onClick={handleConfirmEdit}
                  className="p-1 text-green-600 hover:bg-green-100 rounded"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="p-1 text-red-600 hover:bg-red-100 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <button
                draggable={true}
                onDragStart={(e) => handleDragStart(e, team.id)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, team.id)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, team.id)}
                onClick={() => onTeamChange(team.id)}
                onDoubleClick={() => handleTeamDoubleClick(team.id, team.name)}
                onContextMenu={(e) => handleRightClick(e, team.id)}
                className={`px-4 sm:px-6 py-3 font-medium text-sm border-b-2 transition-colors cursor-move select-none ${
                  activeTeam === team.id
                    ? 'border-blue-500 text-blue-600 bg-blue-50'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } ${
                  dragOverTeamId === team.id && draggedTeamId !== team.id
                    ? 'border-l-4 border-l-blue-400 bg-blue-50'
                    : ''
                } ${
                  draggedTeamId === team.id
                    ? 'opacity-50'
                    : ''
                }`}
              >
                {team.name}
              </button>
            )}
          </div>
        ))}
      </div>
      </div>

      {/* Context Menu */}
      {contextMenu.isVisible && (
        <>
          <div
            className="fixed inset-0 z-30"
            onClick={() => setContextMenu(prev => ({ ...prev, isVisible: false }))}
          />
          <div
            className="absolute z-40 bg-white border border-gray-200 rounded-lg shadow-xl py-2 min-w-48"
            style={{
              left: contextMenu.position.x,
              top: contextMenu.position.y,
            }}
          >
            <button
              onClick={() => {
                const team = teams.find(t => t.id === contextMenu.teamId);
                if (team && onEditTeam) {
                  handleTeamDoubleClick(contextMenu.teamId, team.name);
                }
                setContextMenu(prev => ({ ...prev, isVisible: false }));
              }}
              className="w-full px-4 py-2 text-left hover:bg-blue-50 flex items-center space-x-3 text-sm text-blue-600"
            >
              <Edit2 size={16} />
              <span>Editar Nome</span>
            </button>
            <button
              onClick={() => handleDeleteTeam(contextMenu.teamId)}
              className="w-full px-4 py-2 text-left hover:bg-red-50 flex items-center space-x-3 text-sm text-red-600"
            >
              <Trash2 size={16} />
              <span>Excluir Equipe</span>
            </button>
          </div>
        </>
      )}
    </>
  );
};