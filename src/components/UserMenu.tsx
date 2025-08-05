import React, { useState } from 'react';
import { User, LogOut, Shield, Settings, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const UserMenu: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, profile, signOut } = useAuth();

  if (!user || !profile) return null;

  const getAccessLevelLabel = (level: string) => {
    switch (level) {
      case 'super_admin':
        return 'Super Administrador';
      case 'admin':
        return 'Administrador';
      case 'user':
        return 'Usuário';
      default:
        return 'Usuário';
    }
  };

  const getAccessLevelColor = (level: string) => {
    switch (level) {
      case 'super_admin':
        return 'text-red-600 bg-red-100';
      case 'admin':
        return 'text-blue-600 bg-blue-100';
      case 'user':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 px-4 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <User className="text-white" size={16} />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-sm font-medium text-gray-900">
            {profile.full_name}
          </div>
          <div className="text-xs text-gray-500">
            {user.email}
          </div>
        </div>
        <ChevronDown className="text-gray-400" size={16} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-gray-200 rounded-lg shadow-xl z-20">
            <div className="p-4 border-b border-gray-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                  <User className="text-white" size={20} />
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-900">
                    {profile.full_name}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user.email}
                  </div>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getAccessLevelColor(profile.access_level)}`}>
                      <Shield size={12} className="mr-1" />
                      {getAccessLevelLabel(profile.access_level)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-2">
              <button
                onClick={() => {
                  setIsOpen(false);
                  // Aqui você pode adicionar lógica para abrir configurações
                }}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Settings className="text-gray-400" size={16} />
                <span className="text-sm text-gray-700">Configurações</span>
              </button>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center space-x-3 px-3 py-2 text-left hover:bg-gray-50 rounded-lg transition-colors text-red-600"
              >
                <LogOut className="text-red-500" size={16} />
                <span className="text-sm">Sair</span>
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};