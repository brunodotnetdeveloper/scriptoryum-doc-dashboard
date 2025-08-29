import React, { useState, useEffect } from 'react';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserCheck, UserX, Clock } from 'lucide-react';
import UserManagement from '@/components/UserManagement';
import { workspaceService } from '@/services/workspaceService';
import { WorkspaceUserDto, WorkspaceUserStatus } from '@/types/api';
import { toast } from '@/hooks/use-toast';

const UserManagementPage: React.FC = () => {
  const { user, currentWorkspace, userWorkspaces } = useAuth();
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUserDto[]>([]);
  const [isLoadingStats, setIsLoadingStats] = useState(false);

  // Carregar usuários do workspace atual
  useEffect(() => {
    if (currentWorkspace) {
      loadWorkspaceUsers();
    } else {
      setWorkspaceUsers([]);
    }
  }, [currentWorkspace]);

  const loadWorkspaceUsers = async () => {
    if (!currentWorkspace) return;

    try {
      setIsLoadingStats(true);
      const users = await workspaceService.getWorkspaceUsers(currentWorkspace.id);
      setWorkspaceUsers(users);
    } catch (error) {
      console.error('Erro ao carregar usuários do workspace:', error);
      toast({
        title: 'Erro ao carregar estatísticas',
        description: 'Não foi possível carregar as estatísticas dos usuários.',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingStats(false);
    }
  };

  // Calcular estatísticas dos usuários baseado nos dados carregados
  const userStats = React.useMemo(() => {
    const stats = {
      total: workspaceUsers.length,
      active: 0,
      inactive: 0,
      pending: 0
    };

    workspaceUsers.forEach(user => {
      switch (user.status) {
        case 'Active':
          stats.active++;
          break;
        case 'Inactive':
        case 'Suspended':
        case 'Removed':
          stats.inactive++;
          break;
        case 'PendingInvitation':
          stats.pending++;
          break;
        default:
          stats.inactive++;
      }
    });

    return stats;
  }, [workspaceUsers]);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Usuários</h1>
          <p className="text-muted-foreground">
            Gerencie usuários e permissões do workspace atual
          </p>
        </div>
        {userWorkspaces.length > 1 && (
          <WorkspaceSelector className="ml-auto" />
        )}
      </div>

      {/* Current Workspace Info */}
      {currentWorkspace ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Usuários
                </CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {isLoadingStats ? '...' : userStats.total}
                </div>
                <p className="text-xs text-muted-foreground">
                  Usuários no workspace
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuários Ativos
                </CardTitle>
                <UserCheck className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {isLoadingStats ? '...' : userStats.active}
                </div>
                <p className="text-xs text-muted-foreground">
                  Com acesso ativo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Usuários Inativos
                </CardTitle>
                <UserX className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {isLoadingStats ? '...' : userStats.inactive}
                </div>
                <p className="text-xs text-muted-foreground">
                  Sem acesso ativo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Convites Pendentes
                </CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {isLoadingStats ? '...' : userStats.pending}
                </div>
                <p className="text-xs text-muted-foreground">
                  Aguardando confirmação
                </p>
              </CardContent>
            </Card>
          </div>

          {/* User Management Component */}
          <UserManagement onUsersChange={loadWorkspaceUsers} />
        </>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Nenhum workspace selecionado</CardTitle>
            <CardDescription className="text-center">
              Selecione um workspace para gerenciar seus usuários.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="text-center space-y-4">
              <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground max-w-sm">
                O gerenciamento de usuários é específico para cada workspace.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagementPage;