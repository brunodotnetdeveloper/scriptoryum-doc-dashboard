import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { documentsService } from '@/services';
import { toast } from '@/hooks/use-toast';
import { 
  File, 
  Search, 
  Download, 
  Eye, 
  Loader2, 
  RefreshCw, 
  Brain, 
  Filter, 
  FileText, 
  FileImage, 
  FileSpreadsheet, 
  FileVideo, 
  FileAudio, 
  Archive, 
  Building2,
  BarChart3,
  TrendingUp,
  Clock,
  CheckCircle2,
  ArrowLeft
} from 'lucide-react';
import { Document, DocumentDetails } from '@/types/api';
import { DocumentDetailsView } from '@/components/DocumentDetailsView';
import { PageBreadcrumb } from '@/components/PageBreadcrumb';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { useAuth } from '@/contexts/AuthContext';

const Dashboard: React.FC = () => {
  const { currentWorkspace, user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentDetails, setDocumentDetails] = useState<DocumentDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);

  // Carregar documentos quando o workspace mudar
  useEffect(() => {
    if (currentWorkspace) {
      loadDocuments();
    }
  }, [currentWorkspace]);

  // Filtrar documentos baseado no termo de busca e status
  useEffect(() => {
    let filtered = documents.filter(doc =>
      doc.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    setFilteredDocuments(filtered);
  }, [documents, searchTerm, statusFilter]);

  const loadDocuments = async () => {
    if (!currentWorkspace) {
      setDocuments([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const data = await documentsService.getWorkspaceDocuments(currentWorkspace.id);
      
      const processedDocuments: Document[] = data.documents.map((doc: any) => ({
        id: doc.id,
        originalFileName: doc.originalFileName,
        description: doc.description,
        fileType: doc.fileType,
        fileName: doc.fileName,
        storagePath: doc.storagePath,
        fileSize: doc.fileSize,
        status: doc.status,
        uploadedAt: doc.uploadedAt,
        uploadedByUserId: doc.uploadedByUserId,
      }));
      
      setDocuments(processedDocuments);
    } catch (error) {
      toast({
        title: "Erro ao carregar documentos",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getFileTypeIcon = (fileName: string, fileType?: string | number) => {
    const extension = fileName.toLowerCase().split('.').pop() || '';
    const type = typeof fileType === 'string' ? fileType.toLowerCase() : '';
    
    if (['pdf'].includes(extension) || type.includes('pdf')) {
      return <File className="h-8 w-8 text-red-500" />;
    }
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension) || type.includes('document') || type.includes('text')) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
    if (['xls', 'xlsx', 'csv'].includes(extension) || type.includes('spreadsheet')) {
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    }
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension) || type.includes('image')) {
      return <FileImage className="h-8 w-8 text-purple-500" />;
    }
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension) || type.includes('video')) {
      return <FileVideo className="h-8 w-8 text-orange-500" />;
    }
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension) || type.includes('audio')) {
      return <FileAudio className="h-8 w-8 text-pink-500" />;
    }
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension) || type.includes('archive')) {
      return <Archive className="h-8 w-8 text-yellow-500" />;
    }
    
    return <File className="h-8 w-8 text-primary" />;
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Processed: {
        label: 'Texto extraído',
        className: 'bg-emerald-100 text-emerald-700 border-emerald-200',
      },
      Analyzed: {
        label: 'Analisado',
        className: 'bg-blue-100 text-blue-700 border-blue-200',
      },
      Uploaded: {
        label: 'Carregado',
        className: 'bg-slate-100 text-slate-600 border-slate-200',
      },
      Queued: {
        label: 'Na Fila',
        className: 'bg-indigo-100 text-indigo-600 border-indigo-200',
      },
      ExtractingText: {
        label: 'Extraindo Texto',
        className: 'bg-amber-100 text-amber-700 border-amber-200',
      },
      AnalyzingContent: {
        label: 'Analisando Conteúdo',
        className: 'bg-purple-100 text-purple-700 border-purple-200',
      },
      Failed: {
        label: 'Falha',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
      },
      TextExtractionFailed: {
        label: 'Falha Extração Texto',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
      },
      ContentAnalysisFailed: {
        label: 'Falha Análise Conteúdo',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
      },
      Cancelled: {
        label: 'Cancelado',
        className: 'bg-gray-100 text-gray-500 border-gray-200',
      },
      PartiallyProcessed: {
        label: 'Parcialmente Processado',
        className: 'bg-orange-100 text-orange-700 border-orange-200',
      },
      EntitiesExtractionFailed: {
        label: 'Falha Extração Entidades',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
      },
      RisksAnalysisFailed: {
        label: 'Falha Análise Riscos',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
      },
      InsightsGenerationFailed: {
        label: 'Falha Geração Insights',
        className: 'bg-destructive/10 text-destructive border-destructive/20',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    if (!config) {
      return (
        <Badge className="bg-muted text-muted-foreground border-border">
          Status Desconhecido
        </Badge>
      );
    }

    return (
      <Badge className={config.className}>
        {config.label}
      </Badge>
    );
  };

  const handleViewDocument = async (document: Document) => {
    setSelectedDocument(document);
    setIsLoadingDetails(true);
    setShowDetails(true);
    
    try {
      const details = await documentsService.getDocumentDetails(document.id);
      setDocumentDetails(details);
    } catch (error) {
      console.error('Error loading document details:', error);
      toast({
        title: "Erro ao carregar detalhes",
        description: "Não foi possível carregar os detalhes do documento.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleBackToList = () => {
    setShowDetails(false);
    setSelectedDocument(null);
    setDocumentDetails(null);
  };

  const handleDownloadDocument = async (document: any) => {
    try {
      const url = await documentsService.getDocumentDownloadUrl(document.id);
      window.open(url, '_blank');
      toast({
        title: "Download iniciado",
        description: `Baixando ${document.originalFileName}...`,
      });
    } catch (error) {
      toast({
        title: "Erro ao baixar documento",
        description: error instanceof Error ? error.message : 'Erro desconhecido',
        variant: "destructive",
      });
    }
  };

  // Calcular estatísticas
  const totalDocuments = documents.length;
  const processedDocuments = documents.filter(d => d.status === 'Processed' || d.status === 'Analyzed').length;
  const failedDocuments = documents.filter(d => d.status.includes('Failed')).length;
  const recentDocuments = documents.filter(d => {
    const uploadDate = new Date(d.uploadedAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return uploadDate >= weekAgo;
  }).length;

  // Status únicos disponíveis para filtro
  const availableStatuses = [...new Set(documents.map(d => d.status))];

  // Se está mostrando detalhes de um documento
  if (showDetails && selectedDocument) {
    return (
      <div className="space-y-6">
        {/* Header dos Detalhes */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackToList}
              className="text-muted-foreground hover:text-primary hover:bg-primary/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Dashboard
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {selectedDocument.originalFileName}
              </h1>
              <p className="text-muted-foreground">
                Detalhes do documento
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusBadge(selectedDocument.status)}
          </div>
        </div>

        {/* Conteúdo dos Detalhes */}
        {isLoadingDetails ? (
          <Card className="bg-card border-border">
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : documentDetails ? (
          <DocumentDetailsView
            document={selectedDocument}
            details={documentDetails}
            onDownloadDocument={handleDownloadDocument}
          />
        ) : (
          <Card className="bg-card border-border">
            <CardContent className="text-center py-12">
              <p className="text-muted-foreground">Erro ao carregar detalhes do documento.</p>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Se não há workspace selecionado
  if (!currentWorkspace) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <PageBreadcrumb />
          <WorkspaceSelector />
        </div>
        <Card className="bg-card border-border">
          <CardContent className="text-center py-12">
            <Building2 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Nenhum workspace selecionado
            </h3>
            <p className="text-muted-foreground">
              Selecione um workspace para visualizar o dashboard com seus documentos.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <PageBreadcrumb />
          <div className="mt-2">
            <h1 className="text-2xl font-bold text-foreground">
              Bem-vindo, {user?.userName}!
            </h1>
            <p className="text-muted-foreground">
              Workspace: {currentWorkspace.name}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <WorkspaceSelector />
          <Button
            variant="ghost"
            size="sm"
            onClick={loadDocuments}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
            title="Recarregar"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Documentos
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{totalDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {filteredDocuments.length} visíveis com filtros
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Processados
            </CardTitle>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{processedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              {totalDocuments > 0 ? Math.round((processedDocuments / totalDocuments) * 100) : 0}% do total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Com Falhas
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{failedDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Recentes (7 dias)
            </CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{recentDocuments}</div>
            <p className="text-xs text-muted-foreground">
              Enviados recentemente
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Busca e Filtros */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>
            
            <div className="flex items-center space-x-2 min-w-[200px]">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-input border-border text-foreground">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  {availableStatuses.map((status) => {
                    const statusConfig = {
                      Processed: 'Texto extraído',
                      Analyzed: 'Analisado',
                      Uploaded: 'Carregado',
                      Queued: 'Na Fila',
                      ExtractingText: 'Extraindo Texto',
                      AnalyzingContent: 'Analisando Conteúdo',
                      Failed: 'Falha',
                      TextExtractionFailed: 'Falha Extração Texto',
                      ContentAnalysisFailed: 'Falha Análise Conteúdo',
                      Cancelled: 'Cancelado',
                      PartiallyProcessed: 'Parcialmente Processado',
                      EntitiesExtractionFailed: 'Falha Extração Entidades',
                      RisksAnalysisFailed: 'Falha Análise Riscos',
                      InsightsGenerationFailed: 'Falha Geração Insights',
                    };
                    return (
                      <SelectItem key={status} value={status}>
                        {statusConfig[status as keyof typeof statusConfig] || status}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Seus Documentos</CardTitle>
          <CardDescription className="text-muted-foreground">
            {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''} encontrado{filteredDocuments.length !== 1 ? 's' : ''}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="space-y-4">
              {filteredDocuments.slice(0, 10).map((document) => (
                <div
                  key={document.id}
                  className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg hover:bg-accent/50 transition-colors border border-border/50"
                >
                  <div className="flex-shrink-0">
                    {getFileTypeIcon(document.originalFileName, document.fileType)}
                  </div>

                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-foreground truncate">
                        {document.originalFileName}
                      </h3>
                      {getStatusBadge(document.status)}
                    </div>
                    
                    {document.description && (
                      <p className="text-xs text-muted-foreground truncate">
                        {document.description}
                      </p>
                    )}
                    
                    <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                      <span>{formatFileSize(document.fileSize)}</span>
                      <span>•</span>
                      <span>{document.fileType || 'Tipo desconhecido'}</span>
                      <span>•</span>
                      <span>{formatDate(document.uploadedAt)}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDocument(document)}
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadDocument(document)}
                      className="text-muted-foreground hover:text-primary hover:bg-primary/10"
                      title="Baixar"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {filteredDocuments.length > 10 && (
                <div className="text-center pt-4">
                  <p className="text-sm text-muted-foreground">
                    Mostrando 10 de {filteredDocuments.length} documentos.
                    <br />
                    <Button 
                      variant="link" 
                      className="text-primary p-0 h-auto"
                      onClick={() => window.location.href = '/documents'}
                    >
                      Ver todos os documentos
                    </Button>
                  </p>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || statusFilter !== 'all' ? 'Nenhum documento encontrado' : 'Nenhum documento ainda'}
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || statusFilter !== 'all' 
                  ? 'Tente ajustar os filtros de busca.' 
                  : 'Faça upload de documentos para começar a análise.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;