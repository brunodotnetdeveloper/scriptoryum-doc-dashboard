import React from 'react';
import { WorkspaceManagement } from '@/components/WorkspaceManagement';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Settings } from 'lucide-react';

const WorkspacesPage: React.FC = () => {
  const { user, currentWorkspace, userWorkspaces } = useAuth();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Workspaces</h1>
          <p className="text-muted-foreground">
            Gerencie seus workspaces e configurações organizacionais
          </p>
        </div>
        {userWorkspaces.length > 1 && (
          <WorkspaceSelector className="ml-auto" />
        )}
      </div>

      {/* Current Workspace Info */}
      {currentWorkspace && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Workspace Atual
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentWorkspace.name}</div>              
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Workspaces
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userWorkspaces.length}</div>
              <p className="text-xs text-muted-foreground">
                Workspaces associados
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Status
              </CardTitle>
              <Settings className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${currentWorkspace.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                {currentWorkspace.status === 'Active' ? 'Ativo' : 'Inativo'}
              </div>
              <p className="text-xs text-muted-foreground">
                Estado atual
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Workspace Management */}
      <WorkspaceManagement />

      {/* Empty State */}
      {userWorkspaces.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Nenhum workspace encontrado</CardTitle>
            <CardDescription className="text-center">
              Você ainda não está associado a nenhum workspace. Crie um novo workspace para começar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="text-center space-y-4">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground max-w-sm">
                Os workspaces permitem organizar usuários, documentos e configurações de IA de forma isolada.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default WorkspacesPage;