
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserInfoDto, LoginDto, RegisterDto } from '@/types/api';
import { apiService } from '@/services/api';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserInfoDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserInfoDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const isValid = await apiService.validateToken();
          if (isValid) {
            setUser(JSON.parse(savedUser));
          } else {
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Error validating token:', error);
          localStorage.removeItem('authToken');
          localStorage.removeItem('user');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: LoginDto) => {
    try {
      setIsLoading(true);
      const response = await apiService.login(credentials);
      
      if (response.success && response.user) {
        setUser(response.user);
        toast({
          title: "Login realizado com sucesso!",
          description: `Bem-vindo(a), ${response.user.userName}!`,
        });
      } else {
        throw new Error(response.message || 'Erro no login');
      }
    } catch (error) {
      toast({
        title: "Erro no login",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterDto) => {
    try {
      setIsLoading(true);
      const response = await apiService.register(userData);
      
      if (response.success && response.user) {
        setUser(response.user);
        toast({
          title: "Conta criada com sucesso!",
          description: `Bem-vindo(a) ao Scriptoryum, ${response.user.userName}!`,
        });
      } else {
        throw new Error(response.message || 'Erro no registro');
      }
    } catch (error) {
      toast({
        title: "Erro no registro",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    apiService.logout();
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const refreshUser = async () => {
    try {
      const userData = await apiService.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
    } catch (error) {
      console.error('Error refreshing user:', error);
      logout();
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
