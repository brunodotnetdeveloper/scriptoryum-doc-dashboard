
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { accountService, documentsService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { File, Upload, User, FileText } from 'lucide-react';
import { Document, UserDocumentsResponse } from '@/types/api';

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
  const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const { documents }: UserDocumentsResponse = await accountService.getUserDocuments();
        
        // Simular estatísticas baseadas nos documentos (já que a API não retorna essas informações)
        const totalDocuments = documents.length;
        const currentMonth = new Date().getMonth();
        const documentsThisMonth = documents.filter((doc: any) => {
          const docDate = new Date(doc.uploadedAt || Date.now());
          return docDate.getMonth() === currentMonth;
        }).length;
        
        const processingDocuments = documents.filter(doc => doc.status === 'ExtractingText').length;
        const completedDocuments = documents.filter(doc => doc.status === 'Processed' || doc.status === 'Analyzed').length;

        setStats({
          totalDocuments,
          documentsThisMonth,
          processingDocuments,
          completedDocuments,
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

  const getStatusText = (status: string) => {
    switch (status) {
      case 'Processed':
        return 'Texto Extraído';
      case 'Analyzed':
        return 'Analisado';
      case 'Uploaded':
        return 'Carregado';
      case 'Queued':
        return 'Na Fila';
      case 'ExtractingText':
        return 'Extraindo Texto';
      case 'AnalyzingContent':
        return 'Analisando Conteúdo';
      case 'Failed':
        return 'Falha';
      case 'TextExtractionFailed':
        return 'Falha Extração Texto';
      case 'ContentAnalysisFailed':
        return 'Falha Análise Conteúdo';
      case 'Cancelled':
        return 'Cancelado';
      case 'PartiallyProcessed':
        return 'Parcialmente Analizado';
      case 'EntitiesExtractionFailed':
        return 'Falha Extração Entidades';
      case 'RisksAnalysisFailed':
        return 'Falha Análise Riscos';
      case 'InsightsGenerationFailed':
        return 'Falha Geração Insights';
      default:
        return 'Desconhecido';
    }
  };
  return (
    <div className="space-y-6">
      {/* Header do Dashboard */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Bem-vindo de volta, {user?.userName}!
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">
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
        <Card className="bg-card border-border hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Documentos
            </CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {isLoading ? '...' : stats.totalDocuments}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Documentos Este Mês
            </CardTitle>
            <Upload className="h-4 w-4 text-info" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {isLoading ? '...' : stats.documentsThisMonth}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Em Processamento
            </CardTitle>
            <div className="h-4 w-4 bg-warning rounded-full animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {isLoading ? '...' : stats.processingDocuments}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border hover:shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completos
            </CardTitle>
            <div className="h-4 w-4 bg-success rounded-full" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-card-foreground">
              {isLoading ? '...' : stats.completedDocuments}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid de Conteúdo */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Documentos Recentes */}
        <Card className="bg-card border-border hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-card-foreground">Documentos Recentes</CardTitle>
            <CardDescription className="text-muted-foreground">
              Seus últimos documentos enviados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-muted/50 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recentDocuments.length > 0 ? (
              <div className="space-y-3">
                {recentDocuments.map((doc, index) => (
                  <div key={index} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent/50 transition-colors border border-border/50">
                    <File className="h-4 w-4 text-primary" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-card-foreground truncate">
                        {doc.originalFileName || `Documento ${doc.id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {doc.uploadedAt ? formatDate(doc.uploadedAt) : 'Data não disponível'}
                      </p>
                    </div>
                    <div className="flex-shrink-0">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        doc.status === 'Processed'
                          ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                          : doc.status === 'Analyzed'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : doc.status === 'ExtractingText'
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : doc.status === 'AnalyzingContent'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : doc.status === 'Queued'
                          ? 'bg-indigo-100 text-indigo-600 border border-indigo-200'
                          : doc.status === 'Uploaded'
                          ? 'bg-slate-100 text-slate-600 border border-slate-200'
                          : doc.status === 'PartiallyProcessed'
                          ? 'bg-orange-100 text-orange-700 border border-orange-200'
                          : doc.status === 'Cancelled'
                          ? 'bg-gray-100 text-gray-500 border border-gray-200'
                          : 'bg-destructive/10 text-destructive border border-destructive/20'
                      }`}>
                        {getStatusText(doc.status)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <File className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Nenhum documento encontrado</p>
                <p className="text-sm text-muted-foreground/70 mt-1">
                  Faça upload do seu primeiro documento!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informações do Perfil */}
        <Card className="bg-card border-border hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="text-card-foreground">Informações da Conta</CardTitle>
            <CardDescription className="text-muted-foreground">
              Detalhes do seu perfil
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/20 border border-border/50">
              <User className="h-5 w-5 text-primary" />
              <div>
                <p className="text-sm font-medium text-card-foreground">Nome de usuário</p>
                <p className="text-sm text-muted-foreground">{user?.userName}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/20 border border-border/50">
              <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs text-primary-foreground font-mono">@</span>
              </div>
              <div>
                <p className="text-sm font-medium text-card-foreground">Email</p>
                <p className="text-sm text-muted-foreground font-mono">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-accent/20 border border-border/50">
              <div className={`h-3 w-3 rounded-full ${user?.emailConfirmed ? 'bg-success' : 'bg-warning'}`} />
              <div>
                <p className="text-sm font-medium text-card-foreground">Status do Email</p>
                <p className={`text-sm font-medium ${
                  user?.emailConfirmed ? 'text-success' : 'text-warning'
                }`}>
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
