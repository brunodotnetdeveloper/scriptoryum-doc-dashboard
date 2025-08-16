
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserInfoDto, LoginDto, RegisterDto, CompanyDto } from '@/types/api';
import { authService } from '@/services';
import { companyService } from '@/services/companyService';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserInfoDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentCompany: CompanyDto | null;
  userCompanies: CompanyDto[];
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchCompany: (companyId: number) => Promise<void>;
  refreshCompanies: () => Promise<void>;
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
  const [currentCompany, setCurrentCompany] = useState<CompanyDto | null>(null);
  const [userCompanies, setUserCompanies] = useState<CompanyDto[]>([]);

  const isAuthenticated = !!user;

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const isValid = await authService.validateToken();
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

  // Load companies when user is authenticated
  useEffect(() => {
    if (user && isAuthenticated) {
      refreshCompanies();
    }
  }, [user, isAuthenticated]);

  const login = async (credentials: LoginDto) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success && response.user) {
        setUser(response.user);
        // Load user companies after successful login
        await refreshCompanies();
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
      const response = await authService.register(userData);
      
      if (response.success && response.user) {
        setUser(response.user);
        // Load user companies after successful registration
        await refreshCompanies();
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
    authService.logout();
    setUser(null);
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado com sucesso.",
    });
  };

  const refreshUser = async () => {
    try {
      const userData = await authService.getMe();
      setUser(userData);
      localStorage.setItem('user', JSON.stringify(userData));
      
      // Load user companies
      await refreshCompanies();
    } catch (error) {
      console.error('Error refreshing user:', error);
      logout();
    }
  };

  const refreshCompanies = async () => {
    try {
      const companies = await companyService.getMyCompanies();
      setUserCompanies(companies);
      
      // Set current company based on user's currentCompanyId or first available
      if (user?.currentCompanyId) {
        const current = companies.find(c => c.id === user.currentCompanyId);
        setCurrentCompany(current || companies[0] || null);
      } else {
        setCurrentCompany(companies[0] || null);
      }
      
      localStorage.setItem('userCompanies', JSON.stringify(companies));
    } catch (error) {
      console.error('Error refreshing companies:', error);
      setUserCompanies([]);
      setCurrentCompany(null);
    }
  };

  const switchCompany = async (companyId: number) => {
    try {
      const company = userCompanies.find(c => c.id === companyId);
      if (company) {
        setCurrentCompany(company);
        localStorage.setItem('currentCompanyId', companyId.toString());
        
        toast({
          title: "Empresa alterada",
          description: `Agora você está trabalhando na empresa: ${company.name}`,
        });
      }
    } catch (error) {
      console.error('Error switching company:', error);
      toast({
        title: "Erro ao trocar empresa",
        description: "Não foi possível trocar de empresa. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    currentCompany,
    userCompanies,
    login,
    register,
    logout,
    refreshUser,
    switchCompany,
    refreshCompanies,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
