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
import { companyService } from '@/services/companyService';
import { toast } from '@/hooks/use-toast';
import {
  CompanyDto,
  CreateCompanyDto,
  UpdateCompanyDto,
  CompanyStatus,
  CompanyUserDto,
} from '@/types/api';

interface CompanyManagementProps {
  className?: string;
}

export const CompanyManagement: React.FC<CompanyManagementProps> = ({ className }) => {
  const { user, userCompanies, refreshCompanies } = useAuth();
  const [companies, setCompanies] = useState<CompanyDto[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<CompanyDto | null>(null);
  const [companyUsers, setCompanyUsers] = useState<CompanyUserDto[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isUsersDialogOpen, setIsUsersDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<CreateCompanyDto>({
    name: '',
    description: '',
    status: 'Active',
    cnpj: '',
    contactEmail: '',
    contactPhone: '',
    address: '',
  });

  useEffect(() => {
    setCompanies(userCompanies);
  }, [userCompanies]);

  const handleCreateCompany = async () => {
    try {
      setIsLoading(true);
      await companyService.createCompany(formData);
      await refreshCompanies();
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', status: 'Active', cnpj: '', contactEmail: '', contactPhone: '', address: '' });
      toast({
        title: 'Empresa criada',
        description: 'A empresa foi criada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar empresa',
        description: 'Não foi possível criar a empresa. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCompany = async () => {
    if (!selectedCompany) return;

    try {
      setIsLoading(true);
      const updateData: UpdateCompanyDto = {
        name: formData.name,
        description: formData.description,
        status: formData.status as CompanyStatus,
        cnpj: formData.cnpj,
        contactEmail: formData.contactEmail,
        contactPhone: formData.contactPhone,
        address: formData.address,
      };
      await companyService.updateCompany(selectedCompany.id, updateData);
      await refreshCompanies();
      setIsEditDialogOpen(false);
      setSelectedCompany(null);
      toast({
        title: 'Empresa atualizada',
        description: 'A empresa foi atualizada com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar empresa',
        description: 'Não foi possível atualizar a empresa. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteCompany = async (companyId: number) => {
    if (!confirm('Tem certeza que deseja excluir esta empresa?')) return;

    try {
      setIsLoading(true);
      await companyService.deleteCompany(companyId);
      await refreshCompanies();
      toast({
        title: 'Empresa excluída',
        description: 'A empresa foi excluída com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir empresa',
        description: 'Não foi possível excluir a empresa. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewUsers = async (company: CompanyDto) => {
    try {
      setIsLoading(true);
      const users = await companyService.getCompanyUsers(company.id);
      setCompanyUsers(users);
      setSelectedCompany(company);
      setIsUsersDialogOpen(true);
    } catch (error) {
      toast({
        title: 'Erro ao carregar usuários',
        description: 'Não foi possível carregar os usuários da empresa.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const openEditDialog = (company: CompanyDto) => {
    setSelectedCompany(company);
    setFormData({
      name: company.name,
      description: company.description || '',
      status: company.status,
      cnpj: company.cnpj || '',
      contactEmail: company.contactEmail || '',
      contactPhone: company.contactPhone || '',
      address: company.address || '',
    });
    setIsEditDialogOpen(true);
  };

  const getStatusBadge = (status: CompanyStatus) => {
    const variants = {
      Active: 'default',
      Inactive: 'secondary',
      Suspended: 'destructive',
    } as const;

    const labels = {
      Active: 'Ativa',
      Inactive: 'Inativa',
      Suspended: 'Suspensa',
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
                <span>Gerenciar Empresas</span>
              </CardTitle>
              <CardDescription>
                Gerencie suas empresas e configurações
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Empresa
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Criar Nova Empresa</DialogTitle>
                  <DialogDescription>
                    Preencha os dados para criar uma nova empresa.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome da Empresa</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Digite o nome da empresa"
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
                  <Button onClick={handleCreateCompany} disabled={isLoading}>
                    {isLoading ? 'Criando...' : 'Criar Empresa'}
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
                <TableHead>Criada em</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companies.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhuma empresa encontrada. Crie uma nova empresa para começar.
                  </TableCell>
                </TableRow>
              ) : (
                companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="font-medium">{company.name}</TableCell>
                    <TableCell>{company.description || '-'}</TableCell>
                    <TableCell>{getStatusBadge(company.status)}</TableCell>
                    <TableCell>
                      {new Date(company.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewUsers(company)}
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openEditDialog(company)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCompany(company.id)}
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
            <DialogTitle>Editar Empresa</DialogTitle>
            <DialogDescription>
              Atualize os dados da empresa.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-name">Nome da Empresa</Label>
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
                onValueChange={(value) => setFormData({ ...formData, status: value as CompanyStatus })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Ativa</SelectItem>
                  <SelectItem value="Inactive">Inativa</SelectItem>
                  <SelectItem value="Suspended">Suspensa</SelectItem>
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
            <Button onClick={handleUpdateCompany} disabled={isLoading}>
              {isLoading ? 'Atualizando...' : 'Atualizar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Users Dialog */}
      <Dialog open={isUsersDialogOpen} onOpenChange={setIsUsersDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Usuários da Empresa: {selectedCompany?.name}</DialogTitle>
            <DialogDescription>
              Gerencie os usuários desta empresa.
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
                {companyUsers.map((companyUser) => (
                  <TableRow key={companyUser.id}>
                    <TableCell>{companyUser.user?.userName || companyUser.userName}</TableCell>
                    <TableCell>{companyUser.user?.email || companyUser.userEmail}</TableCell>
                    <TableCell>{getRoleBadge(companyUser.role)}</TableCell>
                    <TableCell>
                      <Badge variant={companyUser.status === 'Active' ? 'default' : 'secondary'}>
                        {companyUser.status === 'Active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(companyUser.joinedAt).toLocaleDateString('pt-BR')}
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

export default CompanyManagement;