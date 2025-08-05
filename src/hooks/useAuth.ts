import { useState, useEffect, useCallback } from 'react';
import { AuthUser, UserProfile, AccessLevel } from '../types';

// Sistema de autenticação local sem Supabase
export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  // Verificar sessão local ao inicializar
  useEffect(() => {
    const savedUser = localStorage.getItem('auth_user');
    const savedProfile = localStorage.getItem('auth_profile');
    
    if (savedUser && savedProfile) {
      setUser(JSON.parse(savedUser));
      setProfile(JSON.parse(savedProfile));
    }
    
    setLoading(false);
  }, []);

  // Determinar nível de acesso baseado no email
  const getAccessLevel = (email: string): AccessLevel => {
    if (email.toLowerCase() === 'tannapnp@gmail.com') {
      return 'super_admin';
    }
    if (email.toLowerCase().includes('@admin.') || email.toLowerCase() === 'admin@sistema.com') {
      return 'admin';
    }
    return 'user';
  };

  // Login local
  const signIn = useCallback(async (email: string, password: string) => {
    // Simular delay de autenticação
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    const userId = crypto.randomUUID();
    const accessLevel = getAccessLevel(email);
    
    const newUser: AuthUser = {
      id: userId,
      email,
    };

    const newProfile: UserProfile = {
      id: crypto.randomUUID(),
      user_id: userId,
      email,
      full_name: email.split('@')[0],
      access_level: accessLevel,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    newUser.profile = newProfile;

    // Salvar no localStorage
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    localStorage.setItem('auth_profile', JSON.stringify(newProfile));

    setUser(newUser);
    setProfile(newProfile);

    return { user: newUser };
  }, []);

  // Registro local
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    // Simular delay de registro
    await new Promise(resolve => setTimeout(resolve, 500));
    
    if (password.length < 6) {
      throw new Error('Senha deve ter pelo menos 6 caracteres');
    }

    const userId = crypto.randomUUID();
    const accessLevel = getAccessLevel(email);
    
    const newUser: AuthUser = {
      id: userId,
      email,
    };

    const newProfile: UserProfile = {
      id: crypto.randomUUID(),
      user_id: userId,
      email,
      full_name: fullName,
      access_level: accessLevel,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    newUser.profile = newProfile;

    // Salvar no localStorage
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    localStorage.setItem('auth_profile', JSON.stringify(newProfile));

    setUser(newUser);
    setProfile(newProfile);

    return { user: newUser };
  }, []);

  // Logout
  const signOut = useCallback(async () => {
    localStorage.removeItem('auth_user');
    localStorage.removeItem('auth_profile');
    setUser(null);
    setProfile(null);
  }, []);

  // Verificar permissões
  const hasPermission = useCallback((requiredLevel: AccessLevel): boolean => {
    if (!profile) return false;

    const levels: Record<AccessLevel, number> = {
      user: 1,
      admin: 2,
      super_admin: 3,
    };

    return levels[profile.access_level] >= levels[requiredLevel];
  }, [profile]);

  // Verificar se é admin ou super admin
  const isAdmin = useCallback((): boolean => {
    return hasPermission('admin');
  }, [hasPermission]);

  // Verificar se é super admin
  const isSuperAdmin = useCallback((): boolean => {
    return hasPermission('super_admin');
  }, [hasPermission]);

  // Verificar se é o usuário tannapnp@gmail.com
  const isTannapnp = useCallback((): boolean => {
    return user?.email?.toLowerCase() === 'tannapnp@gmail.com';
  }, [user]);

  return {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    hasPermission,
    isAdmin,
    isSuperAdmin,
    isTannapnp,
  };
};