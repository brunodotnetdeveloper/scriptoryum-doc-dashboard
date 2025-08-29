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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  MoreHorizontal, 
  Search, 
  Filter,
  UserPlus,
  Mail,
  Calendar,
  Shield,
  Download,
  History,
  FileText,
  FileSpreadsheet
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { workspaceService } from '@/services/workspaceService';
import { toast } from '@/hooks/use-toast';
import {
  WorkspaceUserDto,
  AddUserToWorkspaceDto,
  UpdateWorkspaceUserDto,
  WorkspaceUserRole,
  WorkspaceUserStatus,
} from '@/types/api';

interface UserManagementProps {
  className?: string;
  onUsersChange?: () => void;
}

interface UserFormData {
  userEmail: string;
  role: string;
}

interface UserUpdateData {
  role: string;
  status: WorkspaceUserStatus;
}

// Tipo para histórico de alterações
interface UserHistoryEntry {
  id: string;
  action: 'added' | 'updated' | 'removed' | 'role_changed' | 'status_changed';
  timestamp: Date;
  performedBy: string;
  details: string;
  oldValue?: string;
  newValue?: string;
}

export const UserManagement: React.FC<UserManagementProps> = ({ className, onUsersChange }) => {
  const { currentWorkspace, user } = useAuth();
  
  // Obter role do usuário no workspace atual
  const getCurrentUserRole = (): string | null => {
    if (!user || !currentWorkspace) return null;
    const userInWorkspace = currentWorkspace.users?.find(u => u.userId === user.id);
    return userInWorkspace?.role || null;
  };

  const currentUserRole = getCurrentUserRole();

  // Verificar permissões do usuário atual
  const canManageUsers = user && currentWorkspace && currentUserRole && 
    (currentUserRole === 'Admin');
  const canEditUsers = user && currentWorkspace && currentUserRole && 
    (currentUserRole === 'Admin');
  const canViewUsers = user && currentWorkspace;
  
  // Verificar se pode editar usuário específico
  const canEditSpecificUser = (targetUser: WorkspaceUserDto) => {
    if (!user || !currentWorkspace || !currentUserRole) return false;
    
    // Admin pode editar qualquer usuário
    if (currentUserRole === 'Admin') return true;
    
    // Usuário pode editar apenas a si mesmo (perfil básico)
    if (user.id === targetUser.userId) return true;
    
    return false;
  };
  
  // Verificar se pode remover usuário específico
  const canRemoveSpecificUser = (targetUser: WorkspaceUserDto) => {
    if (!user || !currentWorkspace || !currentUserRole) return false;
    
    // Não pode remover a si mesmo
    if (user.id === targetUser.userId) return false;
    
    // Admin pode remover qualquer usuário
    if (currentUserRole === "Admin") return true;
    
    return false;
  };
  const [users, setUsers] = useState<WorkspaceUserDto[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<WorkspaceUserDto[]>([]);
  const [selectedUser, setSelectedUser] = useState<WorkspaceUserDto | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'role' | 'joinedAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [showHistoryDialog, setShowHistoryDialog] = useState(false);
  const [selectedUserHistory, setSelectedUserHistory] = useState<WorkspaceUserDto | null>(null);
  const [userHistory, setUserHistory] = useState<UserHistoryEntry[]>([]);
  
  const [addUserForm, setAddUserForm] = useState<UserFormData>({
    userEmail: '',
    role: 'Member'
  });
  
  const [editUserForm, setEditUserForm] = useState<UserUpdateData>({
    role: 'Member',
    status: 'Active',
  });

  // Carregar usuários do workspace
  useEffect(() => {
    if (currentWorkspace) {
      loadUsers();
    }
  }, [currentWorkspace]);

  // Filtrar e ordenar usuários
  useEffect(() => {
    let filtered = users;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userEmail.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Filtro por role
    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Ordenação
    filtered.sort((a, b) => {
      let aValue: string | Date;
      let bValue: string | Date;
      
      switch (sortBy) {
        case 'name':
          aValue = a.userName.toLowerCase();
          bValue = b.userName.toLowerCase();
          break;
        case 'email':
          aValue = a.userEmail.toLowerCase();
          bValue = b.userEmail.toLowerCase();
          break;
        case 'role':
          aValue = a.role;
          bValue = b.role; 
          break;
        case 'joinedAt':
          aValue = new Date(a.joinedAt);
          bValue = new Date(b.joinedAt);
          break;
        default:
          return 0;
      }
      
      if (aValue < bValue) return sortOrder === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });

    setFilteredUsers(filtered);
  }, [users, searchTerm, statusFilter, roleFilter, sortBy, sortOrder]);

  const loadUsers = async () => {
    if (!currentWorkspace) return;

    try {
      setIsLoading(true);
      const workspaceUsers = await workspaceService.getWorkspaceUsers(currentWorkspace.id);
      setUsers(workspaceUsers);
    } catch (error) {
      toast({
        title: 'Erro ao carregar usuários',
        description: 'Não foi possível carregar a lista de usuários.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!currentWorkspace) return;

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(addUserForm.userEmail.trim())) {
      toast({
        title: 'Email inválido',
        description: 'Por favor, insira um endereço de email válido.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      
      const addUserData = {
        userEmail: addUserForm.userEmail.trim(),
        role: addUserForm.role,
      };
      
      await workspaceService.addUserToWorkspace(currentWorkspace.id, addUserData);
      await loadUsers();
      onUsersChange?.(); // Notificar o componente pai sobre a mudança
      setIsAddDialogOpen(false);
      setAddUserForm({ userEmail: '', role: 'Member' });
      
      toast({
        title: 'Usuário adicionado',
        description: `${addUserForm.userEmail} foi adicionado ao workspace com sucesso. Se uma nova conta foi criada, o usuário receberá um email com as credenciais de acesso.`,
      });
    } catch (error: any) {
      let errorMessage = 'Não foi possível adicionar o usuário.';
      
      if (error?.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error?.message) {
        errorMessage = error.message;
      }
      
      // Melhorar mensagem para usuário não encontrado
      if (errorMessage.includes('não encontrado') || errorMessage.includes('not found')) {
        errorMessage = 'Usuário não encontrado. O sistema criará automaticamente uma conta para este email e enviará um convite.';
      }
      
      toast({
        title: 'Erro ao adicionar usuário',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!currentWorkspace || !selectedUser) return;

    try {
      setIsLoading(true);
      
      const updateData = {
        role: editUserForm.role,
        status: editUserForm.status
      };
      
      await workspaceService.updateWorkspaceUser(
        currentWorkspace.id,
        selectedUser.userId,
        updateData
      );
      await loadUsers();
      onUsersChange?.(); // Notificar o componente pai sobre a mudança
      setIsEditDialogOpen(false);
      setSelectedUser(null);
      
      toast({
        title: 'Usuário atualizado',
        description: 'As informações do usuário foram atualizadas com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar usuário',
        description: 'Não foi possível atualizar as informações do usuário.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveUser = async () => {
    if (!currentWorkspace || !selectedUser) return;

    try {
      setIsLoading(true);
      await workspaceService.removeUserFromWorkspace(currentWorkspace.id, selectedUser.userId);
      await loadUsers();
      onUsersChange?.(); // Notificar o componente pai sobre a mudança
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      
      toast({
        title: 'Usuário removido',
        description: 'O usuário foi removido do workspace com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao remover usuário',
        description: 'Não foi possível remover o usuário do workspace.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (user: WorkspaceUserDto) => {
    setSelectedUser(user);
    setEditUserForm({
      role: user.role,
      status: user.status,
    });
    setIsEditDialogOpen(true);
  };

  const openDeleteDialog = (user: WorkspaceUserDto) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const getStatusBadge = (status: WorkspaceUserStatus) => {
    const statusConfig = {
      Active: { label: 'Ativo', variant: 'default' as const, className: 'bg-green-100 text-green-800' },
      Inactive: { label: 'Inativo', variant: 'secondary' as const, className: 'bg-gray-100 text-gray-800' },
      Suspended: { label: 'Suspenso', variant: 'destructive' as const, className: 'bg-red-100 text-red-800' },
      Removed: { label: 'Removido', variant: 'outline' as const, className: 'bg-red-50 text-red-600' },
      PendingInvitation: { label: 'Pendente', variant: 'outline' as const, className: 'bg-yellow-100 text-yellow-800' },
    };

    const config = statusConfig[status] || statusConfig.Inactive;
    return (
      <Badge variant={config.variant} className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      'Admin': { label: 'Administrador', className: 'bg-blue-100 text-blue-800' },
      'Member': { label: 'Membro', className: 'bg-indigo-100 text-indigo-800' },
      'Viewer': { label: 'Visualizador', className: 'bg-gray-100 text-gray-800' },
    };

    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig['Member'];
    return (
      <Badge variant="outline" className={config.className}>
        {config.label}
      </Badge>
    );
  };

  // Exportar dados para CSV
  const exportToCSV = () => {
    const csvContent = [
      ['Nome', 'Email', 'Função', 'Status', 'Data de Ingresso'].join(','),
      ...filteredUsers.map(user => [
        user.userName,
        user.userEmail,
        user.role,
        user.status,
        new Date(user.joinedAt).toLocaleDateString('pt-BR')
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${currentWorkspace?.name}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Exportação concluída',
      description: 'Os dados dos usuários foram exportados com sucesso.'
    });
  };
  
  // Exportar dados para JSON
  const exportToJSON = () => {
    const jsonData = filteredUsers.map(user => ({
      id: user.id,
      userId: user.userId,
      workspaceId: user.workspaceId,
      name: user.userName,
      email: user.userEmail,
      role: user.role,
      status: user.status,
      joinedAt: user.joinedAt
    }));
    
    const jsonContent = JSON.stringify({
      workspace: currentWorkspace?.name,
      exportDate: new Date().toISOString(),
      totalUsers: jsonData.length,
      users: jsonData
    }, null, 2);
    
    const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `usuarios_${currentWorkspace?.name}_${new Date().toISOString().split('T')[0]}.json`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: 'Exportação concluída',
      description: 'Os dados dos usuários foram exportados em formato JSON.'
    });
  };
  
  // Carregar histórico de um usuário
  const loadUserHistory = async (user: WorkspaceUserDto) => {
    try {
      setSelectedUserHistory(user);
      // Simulação de histórico - em produção, isso viria da API
      const mockHistory: UserHistoryEntry[] = [
        {
          id: '1',
          action: 'added',
          timestamp: new Date(user.joinedAt),
          performedBy: 'Sistema',
          details: `Usuário adicionado ao workspace como ${user.role}`
        },
        {
          id: '2',
          action: 'role_changed',
          timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
          performedBy: 'Admin',
          details: 'Função alterada',
          oldValue: 'Member',
          newValue: WorkspaceUserRole[user.role]
        }
      ];
      setUserHistory(mockHistory);
      setShowHistoryDialog(true);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar o histórico do usuário.',
        variant: 'destructive'
      });
    }
  };

  if (!currentWorkspace) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Nenhum workspace selecionado</CardTitle>
          <CardDescription>
            Selecione um workspace para gerenciar usuários.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }
  
  if (!canViewUsers) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium mb-2">Acesso Negado</h3>
            <p>Você não tem permissão para visualizar usuários neste workspace.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Usuários do Workspace
              </CardTitle>
              <CardDescription>
                Gerencie usuários e suas permissões no workspace {currentWorkspace.name}
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Formato de Exportação</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={exportToCSV}>
                    <FileSpreadsheet className="h-4 w-4 mr-2" />
                    CSV (Excel)
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={exportToJSON}>
                    <FileText className="h-4 w-4 mr-2" />
                    JSON (Dados Completos)
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              {canManageUsers && (
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <UserPlus className="h-4 w-4 mr-2" />
                      Adicionar Usuário
                    </Button>
                  </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                  <DialogTitle>Adicionar Usuário ao Workspace</DialogTitle>
                  <DialogDescription>
                    Adicione um novo usuário ao workspace {currentWorkspace.name}. Se o usuário não existir, uma conta será criada automaticamente e ele receberá um convite por email com suas credenciais temporárias.
                  </DialogDescription>
                </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="userEmail">Email do Usuário</Label>
                      <Input
                        id="userEmail"
                        type="email"
                        placeholder="usuario@exemplo.com"
                        value={addUserForm.userEmail}
                        onChange={(e) => setAddUserForm({ ...addUserForm, userEmail: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="role">Função</Label>
                      <Select
                        value={addUserForm.role}
                        onValueChange={(value: string) => setAddUserForm({ ...addUserForm, role: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Viewer">Visualizador</SelectItem>
                          <SelectItem value="Member">Membro</SelectItem>
                          <SelectItem value="Admin">Administrador</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleAddUser} disabled={isLoading || !addUserForm.userEmail}>
                      {isLoading ? 'Adicionando...' : 'Adicionar Usuário'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtros e Busca */}
          <div className="flex flex-col gap-4 mb-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar por nome ou email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos Status</SelectItem>
                    <SelectItem value="Active">Ativo</SelectItem>
                    <SelectItem value="Inactive">Inativo</SelectItem>
                    <SelectItem value="Suspended">Suspenso</SelectItem>
                    <SelectItem value="PendingInvitation">Pendente</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={roleFilter} onValueChange={setRoleFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Shield className="h-4 w-4 mr-2" />
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas Funções</SelectItem>
                    <SelectItem value="Admin">Administrador</SelectItem>
                    <SelectItem value="Member">Membro</SelectItem>
                    <SelectItem value="Viewer">Visualizador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Controles de Ordenação */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Ordenar por:</span>
              <Select value={sortBy} onValueChange={(value: 'name' | 'email' | 'role' | 'joinedAt') => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Nome</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="role">Função</SelectItem>
                  <SelectItem value="joinedAt">Data de Entrada</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2"
              >
                {sortOrder === 'asc' ? '↑' : '↓'}
                {sortOrder === 'asc' ? 'Crescente' : 'Decrescente'}
              </Button>
            </div>
          </div>

          {/* Tabela de Usuários */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data de Ingresso</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      Carregando usuários...
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-2">
                        <Users className="h-8 w-8 text-muted-foreground" />
                        <p className="text-muted-foreground">
                          {users.length === 0 ? 'Nenhum usuário encontrado' : 'Nenhum usuário corresponde aos filtros'}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((workspaceUser) => (
                    <TableRow key={workspaceUser.id}>
                      <TableCell className="font-medium">
                        {workspaceUser.userName}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Mail className="h-4 w-4 text-muted-foreground" />
                          {workspaceUser.userEmail}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getRoleBadge(workspaceUser.role)}
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(workspaceUser.status)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          {new Date(workspaceUser.joinedAt).toLocaleDateString('pt-BR')}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {(canEditSpecificUser(workspaceUser) || canRemoveSpecificUser(workspaceUser)) ? (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Ações</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => loadUserHistory(workspaceUser)}>
                                <History className="h-4 w-4 mr-2" />
                                Ver Histórico
                              </DropdownMenuItem>
                              {canEditSpecificUser(workspaceUser) && (
                                <DropdownMenuItem onClick={() => openEditDialog(workspaceUser)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Editar
                                </DropdownMenuItem>
                              )}
                              {canRemoveSpecificUser(workspaceUser) && (
                                <DropdownMenuItem onClick={() => openDeleteDialog(workspaceUser)}>
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Remover
                                </DropdownMenuItem>
                              )}
                            </DropdownMenuContent>
                          </DropdownMenu>
                        ) : (
                          <span className="text-xs text-muted-foreground px-2 py-1">
                            Sem permissões
                          </span>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Dialog de Edição */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>
              Altere as informações do usuário {selectedUser?.userName}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editRole">Função</Label>
              <Select
                value={editUserForm.role}
                onValueChange={(value: string) => setEditUserForm({ ...editUserForm, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Viewer">Visualizador</SelectItem>
                  <SelectItem value="Member">Membro</SelectItem>
                  <SelectItem value="Admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="editStatus">Status</Label>
              <Select
                value={editUserForm.status}
                onValueChange={(value: WorkspaceUserStatus) => setEditUserForm({ ...editUserForm, status: value })}
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
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateUser} disabled={isLoading}>
              {isLoading ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Remoção */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o usuário <strong>{selectedUser?.userName}</strong> do workspace?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRemoveUser} disabled={isLoading}>
              {isLoading ? 'Removendo...' : 'Remover Usuário'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog de Histórico do Usuário */}
      <Dialog open={showHistoryDialog} onOpenChange={setShowHistoryDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Histórico de {selectedUserHistory?.userName}
            </DialogTitle>
            <DialogDescription>
              Visualize todas as alterações realizadas neste usuário
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-96">
            <div className="space-y-4">
              {userHistory.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <History className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Nenhum histórico encontrado</p>
                </div>
              ) : (
                userHistory.map((entry) => (
                  <div key={entry.id} className="border rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {entry.action === 'added' && 'Adicionado'}
                          {entry.action === 'updated' && 'Atualizado'}
                          {entry.action === 'removed' && 'Removido'}
                          {entry.action === 'role_changed' && 'Função Alterada'}
                          {entry.action === 'status_changed' && 'Status Alterado'}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          por {entry.performedBy}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {entry.timestamp.toLocaleString('pt-BR')}
                      </span>
                    </div>
                    <p className="text-sm mb-2">{entry.details}</p>
                    {entry.oldValue && entry.newValue && (
                      <div className="text-xs text-muted-foreground">
                        <span className="line-through">{entry.oldValue}</span>
                        {' → '}
                        <span className="font-medium">{entry.newValue}</span>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowHistoryDialog(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;