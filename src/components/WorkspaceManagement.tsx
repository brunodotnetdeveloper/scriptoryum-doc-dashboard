import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Plus, Edit, Trash2, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { workspaceService } from '@/services/workspaceService';
import { toast } from '@/hooks/use-toast';
import {
  WorkspaceDto,
  CreateWorkspaceDto,
  UpdateWorkspaceDto,
  WorkspaceStatus,
  WorkspaceUserDto,
} from '@/types/api';

interface WorkspaceManagementProps {
  className?: string;
}

export const WorkspaceManagement: React.FC<WorkspaceManagementProps> = ({ className }) => {
  const { user, userWorkspaces, refreshWorkspaces } = useAuth();
  const [workspaces, setWorkspaces] = useState<WorkspaceDto[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<WorkspaceDto | null>(null);
  const [workspaceUsers, setWorkspaceUsers] = useState<WorkspaceUserDto[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateWorkspaceDto>({
    name: '',
    description: '',
    status: 'Active',
    cnpj: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });

  useEffect(() => {
    setWorkspaces(userWorkspaces);
  }, [userWorkspaces]);

  const handleCreateWorkspace = async () => {
    try {
      setIsLoading(true);
      await workspaceService.createWorkspace(formData);
      await refreshWorkspaces();
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', status: 'Active', cnpj: '', contactEmail: '', contactPhone: '', address: '' });
      toast({
        title: 'Workspace criado',
        description: 'O workspace foi criado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar workspace',
        description: 'Não foi possível criar o workspace. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateWorkspace = async () => {
    if (!selectedWorkspace) return;

    try {
      setIsLoading(true);
      const updateData: UpdateWorkspaceDto = {
        name: formData.name,
        description: formData.description,
        status: formData.status as WorkspaceStatus,
        cnpj: formData.cnpj,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: formData.address,
      };
      await workspaceService.updateWorkspace(selectedWorkspace.id, updateData);
      await refreshWorkspaces();
      setIsEditDialogOpen(false);
      setSelectedWorkspace(null);
      toast({
        title: 'Workspace atualizado',
        description: 'O workspace foi atualizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar workspace',
        description: 'Não foi possível atualizar o workspace. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteWorkspace = async (workspaceId: number) => {
    if (!confirm('Tem certeza que deseja excluir este workspace?')) return;

    try {
      setIsLoading(true);
      await workspaceService.deleteWorkspace(workspaceId);
      await refreshWorkspaces();
      toast({
        title: 'Workspace excluído',
        description: 'O workspace foi excluído com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir workspace',
        description: 'Não foi possível excluir o workspace. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUsers = async (workspace: WorkspaceDto) => {
    try {
      setIsLoading(true);
      const users = await workspaceService.getWorkspaceUsers(workspace.id);
      setWorkspaceUsers(users);
      setSelectedWorkspace(workspace);
      setIsUsersDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Erro ao carregar usuários',
        description: 'Não foi possível carregar os usuários do workspace.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (workspace: WorkspaceDto) => {
    setSelectedWorkspace(workspace);
    setFormData({
      name: workspace.name,
      description: workspace.description || '',
      status: workspace.status,
      cnpj: workspace.cnpj || '',
      contactEmail: workspace.contactEmail || '',
      contactPhone: workspace.contactPhone || '',
      address: workspace.address || '',
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: WorkspaceStatus) => {
    const variants = {
      Active: 'default',
      Inactive: 'secondary',
      Suspended: 'destructive',
    } as const;

    const labels = {
      Active: 'Ativo',
      Inactive: 'Inativo',
      Suspended: 'Suspenso',
    };

    return (
      <Badge variant={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const labels = {
      Owner: 'Proprietário',
      Admin: 'Administrador',
      Member: 'Membro',
    } as const;

    return (
      <Badge variant="outline">
        {labels[role as keyof typeof labels] || role}
      </Badge>
    );
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Building2 className="h-5 w-5" />
                <span>Gerenciar Workspaces</span>
              </CardTitle>
              <CardDescription>
                Gerencie seus workspaces e configurações
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Novo Workspace</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para criar um novo workspace.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome do Workspace</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Digite o nome do workspace"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setIsCreateDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button onClick={handleCreateWorkspace} disabled={isLoading}>
                    {isLoading ? 'Criando...' : 'Criar Workspace'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Criado em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workspaces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum workspace encontrado. Crie um novo workspace para começar.
                  </TableCell>
                </TableRow>
              ) : (
                workspaces.map((workspace) => (
                  <TableRow key={workspace.id}>
                    <TableCell className="font-medium">{workspace.name}</TableCell>
                    <TableCell>{workspace.description || '-'}</TableCell>
                    <TableCell>{getStatusBadge(workspace.status)}</TableCell>
                    <TableCell>
                      {new Date(workspace.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUsers(workspace)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(workspace)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteWorkspace(workspace.id)}
                          disabled={isLoading}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Workspace</DialogTitle>
            <DialogDescription>
              Atualize os dados do workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome do Workspace</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            
            <div>
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value as WorkspaceStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Ativo</SelectItem>
                  <SelectItem value="Inactive">Inativo</SelectItem>
                  <SelectItem value="Suspended">Suspenso</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEditDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button onClick={handleUpdateWorkspace} disabled={isLoading}>
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Users Dialog */}
      <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Usuários do Workspace: {selectedWorkspace?.name}</DialogTitle>
            <DialogDescription>
              Gerencie os usuários deste workspace.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-96 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Adicionado em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workspaceUsers.map((workspaceUser) => (
                  <TableRow key={workspaceUser.id}>
                    <TableCell>{workspaceUser.user?.userName || workspaceUser.userName}</TableCell>
                    <TableCell>{workspaceUser.user?.email || workspaceUser.userEmail}</TableCell>
                    <TableCell>{getRoleBadge(workspaceUser.role)}</TableCell>
                    <TableCell>
                      <Badge variant={workspaceUser.status === 'Active' ? 'default' : 'secondary'}>
                        {workspaceUser.status === 'Active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(workspaceUser.joinedAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <DialogFooter>
            <Button onClick={() => setIsUsersDialogOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkspaceManagement;