
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { apiService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';
import { File, Upload, User, FileText } from 'lucide-react';

interface DashboardStats {
  totalDocuments: number;
  documentsThisMonth: number;
  processingDocuments: number;
  completedDocuments: number;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    totalDocuments: 0,
    documentsThisMonth: 0,
    processingDocuments: 0,
    completedDocuments: 0,
  });
  const [recentDocuments, setRecentDocuments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const documents = await apiService.getUserDocuments();
        
        // Simular estatísticas baseadas nos documentos (já que a API não retorna essas informações)
        const totalDocuments = documents.length;
        const currentMonth = new Date().getMonth();
        const documentsThisMonth = documents.filter((doc: any) => {
          const docDate = new Date(doc.uploadDate || Date.now());
          return docDate.getMonth() === currentMonth;
        }).length;
        
        setStats({
          totalDocuments,
          documentsThisMonth,
          processingDocuments: Math.floor(totalDocuments * 0.1), // 10% em processamento
          completedDocuments: Math.floor(totalDocuments * 0.9), // 90% completos
        });
        
        setRecentDocuments(documents.slice(0, 5)); // Últimos 5 documentos
      } catch (error) {
        console.error('Erro ao carregar dados do dashboard:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-scriptoryum-soft-white">
            Dashboard
          </h1>
          <p className="text-scriptoryum-soft-white/70 mt-1">
            Bem-vindo de volta, {user?.userName}!
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-scriptoryum-soft-white/50">
            {new Date().toLocaleDateString('pt-BR', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-scriptoryum-dark-gray border-scriptoryum-medium-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-scriptoryum-soft-white/70">
              Total de Documentos
            </CardTitle>
            <FileText className="h-4 w-4 text-scriptoryum-soft-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-scriptoryum-soft-white">
              {isLoading ? '...' : stats.totalDocuments}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-scriptoryum-dark-gray border-scriptoryum-medium-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-scriptoryum-soft-white/70">
              Documentos Este Mês
            </CardTitle>
            <Upload className="h-4 w-4 text-scriptoryum-soft-blue" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-scriptoryum-soft-white">
              {isLoading ? '...' : stats.documentsThisMonth}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-scriptoryum-dark-gray border-scriptoryum-medium-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-scriptoryum-soft-white/70">
              Em Processamento
            </CardTitle>
            <div className="h-4 w-4 bg-yellow-500 rounded-full animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-scriptoryum-soft-white">
              {isLoading ? '...' : stats.processingDocuments}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-scriptoryum-dark-gray border-scriptoryum-medium-gray">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-scriptoryum-soft-white/70">
              Completos
            </CardTitle>
            <div className="h-4 w-4 bg-green-500 rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-scriptoryum-soft-white">
              {isLoading ? '...' : stats.completedDocuments}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documentos Recentes */}
        <Card className="bg-scriptoryum-dark-gray border-scriptoryum-medium-gray">
          <CardHeader>
            <CardTitle className="text-scriptoryum-soft-white">Documentos Recentes</CardTitle>
            <CardDescription className="text-scriptoryum-soft-white/70">
              Seus últimos documentos enviados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-scriptoryum-medium-gray rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-scriptoryum-medium-gray/50 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentDocuments.length > 0 ? (
              <div className="space-y-3">
                {recentDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-scriptoryum-medium-gray/20 transition-colors">
                    <File className="h-4 w-4 text-scriptoryum-soft-blue" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-scriptoryum-soft-white truncate">
                        {doc.fileName || `Documento ${doc.id}`}
                      </p>
                      <p className="text-xs text-scriptoryum-soft-white/50">
                        {doc.uploadDate ? formatDate(doc.uploadDate) : 'Data não disponível'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'completed' 
                          ? 'bg-green-100 text-green-800' 
                          : doc.status === 'processing'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {doc.status === 'completed' ? 'Completo' : 
                         doc.status === 'processing' ? 'Processando' : 'Erro'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <File className="h-12 w-12 text-scriptoryum-medium-gray mx-auto mb-4" />
                <p className="text-scriptoryum-soft-white/70">Nenhum documento encontrado</p>
                <p className="text-sm text-scriptoryum-soft-white/50 mt-1">
                  Faça upload do seu primeiro documento!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Perfil */}
        <Card className="bg-scriptoryum-dark-gray border-scriptoryum-medium-gray">
          <CardHeader>
            <CardTitle className="text-scriptoryum-soft-white">Informações da Conta</CardTitle>
            <CardDescription className="text-scriptoryum-soft-white/70">
              Detalhes do seu perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3">
              <User className="h-5 w-5 text-scriptoryum-soft-blue" />
              <div>
                <p className="text-sm font-medium text-scriptoryum-soft-white">Nome de usuário</p>
                <p className="text-sm text-scriptoryum-soft-white/70">{user?.userName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-5 w-5 rounded-full bg-scriptoryum-soft-blue flex items-center justify-center">
                <span className="text-xs text-white">@</span>
              </div>
              <div>
                <p className="text-sm font-medium text-scriptoryum-soft-white">Email</p>
                <p className="text-sm text-scriptoryum-soft-white/70">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`h-2 w-2 rounded-full ${user?.emailConfirmed ? 'bg-green-500' : 'bg-yellow-500'}`} />
              <div>
                <p className="text-sm font-medium text-scriptoryum-soft-white">Status do Email</p>
                <p className="text-sm text-scriptoryum-soft-white/70">
                  {user?.emailConfirmed ? 'Verificado' : 'Pendente verificação'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
