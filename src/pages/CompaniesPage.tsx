import React from 'react';
import { CompanyManagement } from '@/components/CompanyManagement';
import { CompanySelector } from '@/components/CompanySelector';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Users, Settings } from 'lucide-react';

const CompaniesPage: React.FC = () => {
  const { user, currentCompany, userCompanies } = useAuth();

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Empresas</h1>
          <p className="text-muted-foreground">
            Gerencie suas empresas e configurações organizacionais
          </p>
        </div>
        {userCompanies.length > 1 && (
          <CompanySelector className="ml-auto" />
        )}
      </div>

      {/* Current Company Info */}
      {currentCompany && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Empresa Atual
              </CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{currentCompany.name}</div>              
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Empresas
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{userCompanies.length}</div>
              <p className="text-xs text-muted-foreground">
                Empresas associadas
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
              <div className={`text-2xl font-bold ${currentCompany.status === 'Active' ? 'text-green-600' : 'text-red-600'}`}>
                {currentCompany.status === 'Active' ? 'Ativa' : 'Inativa'}
              </div>
              <p className="text-xs text-muted-foreground">
                Estado atual
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Company Management */}
      <CompanyManagement />

      {/* Empty State */}
      {userCompanies.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Nenhuma empresa encontrada</CardTitle>
            <CardDescription className="text-center">
              Você ainda não está associado a nenhuma empresa. Crie uma nova empresa para começar.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center">
            <div className="text-center space-y-4">
              <Building2 className="h-12 w-12 text-muted-foreground mx-auto" />
              <p className="text-sm text-muted-foreground max-w-sm">
                As empresas permitem organizar usuários, documentos e configurações de IA de forma isolada.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CompaniesPage;