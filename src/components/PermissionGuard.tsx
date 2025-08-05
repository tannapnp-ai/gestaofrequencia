import React from 'react';
import { Shield, AlertTriangle } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { AccessLevel } from '../types';

interface PermissionGuardProps {
  requiredLevel: AccessLevel;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const PermissionGuard: React.FC<PermissionGuardProps> = ({
  requiredLevel,
  children,
  fallback
}) => {
  const { hasPermission, profile } = useAuth();

  if (!hasPermission(requiredLevel)) {
    if (fallback) {
      return <>{fallback}</>;
    }

    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
        <AlertTriangle className="mx-auto text-yellow-600 mb-4" size={48} />
        <h3 className="text-lg font-medium text-yellow-800 mb-2">
          Acesso Restrito
        </h3>
        <p className="text-yellow-700 mb-4">
          Você não tem permissão para acessar esta funcionalidade.
        </p>
        <div className="flex items-center justify-center space-x-2 text-sm text-yellow-600">
          <Shield size={16} />
          <span>
            Nível atual: {profile?.access_level || 'Não definido'} | 
            Nível necessário: {requiredLevel}
          </span>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};