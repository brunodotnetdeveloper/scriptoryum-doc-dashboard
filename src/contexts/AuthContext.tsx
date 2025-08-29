
import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserInfoDto, LoginDto, RegisterDto, WorkspaceDto, OrganizationDto } from '@/types/api';
import { authService } from '@/services';
import { workspaceService } from '@/services/workspaceService';
import { organizationService } from '@/services/organizationService';
import { toast } from '@/hooks/use-toast';

interface AuthContextType {
  user: UserInfoDto | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  currentWorkspace: WorkspaceDto | null;
  userWorkspaces: WorkspaceDto[];
  currentOrganization: OrganizationDto | null;
  needsWorkspace: boolean;
  login: (credentials: LoginDto) => Promise<void>;
  register: (userData: RegisterDto) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  switchWorkspace: (workspaceId: number) => Promise<void>;
  refreshWorkspaces: () => Promise<void>;
  refreshOrganization: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserInfoDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentWorkspace, setCurrentWorkspace] = useState<WorkspaceDto | null>(null);
  const [userWorkspaces, setUserWorkspaces] = useState<WorkspaceDto[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationDto | null>(null);
  const [needsWorkspace, setNeedsWorkspace] = useState(false);

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

  // Load workspaces and organization when user is authenticated
  useEffect(() => {
    if (user && isAuthenticated) {
      refreshWorkspaces();
      refreshOrganization();
    }
  }, [user, isAuthenticated]);

  const login = async (credentials: LoginDto) => {
    try {
      setIsLoading(true);
      const response = await authService.login(credentials);
      
      if (response.success && response.user) {
        setUser(response.user);
        // Load user workspaces and organization after successful login
        await refreshWorkspaces();
        await refreshOrganization();
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
        // Load user workspaces and organization after successful registration
        await refreshWorkspaces();
        await refreshOrganization();
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
      
      await refreshWorkspaces();
    } catch (error) {
      console.error('Error refreshing user:', error);
      logout();
    }
  };

  const refreshWorkspaces = async () => {
    try {
      const workspaces = await workspaceService.getMyWorkspaces();
      setUserWorkspaces(workspaces);
      
      // Check if user needs to create a workspace
      const hasWorkspaces = workspaces.length > 0;
      setNeedsWorkspace(!hasWorkspaces);
      
      // Set current workspace based on user's currentWorkspaceId or first available
      if (hasWorkspaces) {
        if (user?.currentWorkspaceId) {
          const current = workspaces.find(w => w.id === user.currentWorkspaceId);
          setCurrentWorkspace(current || workspaces[0]);
        } else {
          setCurrentWorkspace(workspaces[0]);
        }
      } else {
        setCurrentWorkspace(null);
      }
      
      localStorage.setItem('userWorkspaces', JSON.stringify(workspaces));
    } catch (error) {
      console.error('Error refreshing workspaces:', error);
      setUserWorkspaces([]);
      setCurrentWorkspace(null);
      setNeedsWorkspace(true);
    }
  };

  const switchWorkspace = async (workspaceId: number) => {
    try {
      const workspace = userWorkspaces.find(w => w.id === workspaceId);
      if (workspace) {
        setCurrentWorkspace(workspace);
        localStorage.setItem('currentWorkspaceId', workspaceId.toString());
        
        toast({
          title: "Workspace alterado",
          description: `Agora você está trabalhando no workspace: ${workspace.name}`,
        });
      }
    } catch (error) {
      console.error('Error switching workspace:', error);
      toast({
        title: "Erro ao trocar workspace",
        description: "Não foi possível trocar de workspace. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const refreshOrganization = async () => {
    try {
      // Get organization from user's organizationId
      if (user?.organizationId) {
        const organization = await organizationService.getOrganizationById(user.organizationId);
        setCurrentOrganization(organization);
      } else {
        setCurrentOrganization(null);
      }
    } catch (error) {
      console.error('Error refreshing organization:', error);
      setCurrentOrganization(null);
    }
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    currentWorkspace,
    userWorkspaces,
    currentOrganization,
    needsWorkspace,
    login,
    register,
    logout,
    refreshUser,
    switchWorkspace,
    refreshWorkspaces,
    refreshOrganization,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
