
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from '@/components/ui/pagination';
import { accountService, documentsService } from '@/services';
import { toast } from '@/hooks/use-toast';
import { File, Search, Download, Eye, Trash2, Loader2, RefreshCw, Brain, ArrowLeft, Filter, FileText, FileImage, FileSpreadsheet, FileVideo, FileAudio, Archive, Building2, Settings } from 'lucide-react';
import { Document, DocumentDetails } from '@/types/api';
import { DocumentDetailsView } from '@/components/DocumentDetailsView';
import { PageBreadcrumb } from '@/components/PageBreadcrumb';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { useAuth } from '@/contexts/AuthContext';

const DocumentsPage: React.FC = () => {
  const { currentWorkspace } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentDetails, setDocumentDetails] = useState<DocumentDetails | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [analyzingDocuments, setAnalyzingDocuments] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (currentWorkspace) {
      loadDocuments();
    }
  }, [currentWorkspace]);

  useEffect(() => {
    // Filtrar documentos baseado no termo de busca e status
    let filtered = documents.filter(doc =>
      doc.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Aplicar filtro por status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(doc => doc.status === statusFilter);
    }

    setFilteredDocuments(filtered);
    setCurrentPage(1); // Reset para primeira página quando filtros mudarem
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
    
    // Documentos de texto
    if (['pdf'].includes(extension) || type.includes('pdf')) {
      return <File className="h-8 w-8 text-red-500" />;
    }
    if (['doc', 'docx', 'txt', 'rtf'].includes(extension) || type.includes('document') || type.includes('text')) {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
    
    // Planilhas
    if (['xls', 'xlsx', 'csv'].includes(extension) || type.includes('spreadsheet')) {
      return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    }
    
    // Imagens
    if (['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'].includes(extension) || type.includes('image')) {
      return <FileImage className="h-8 w-8 text-purple-500" />;
    }
    
    // Vídeos
    if (['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'].includes(extension) || type.includes('video')) {
      return <FileVideo className="h-8 w-8 text-orange-500" />;
    }
    
    // Áudios
    if (['mp3', 'wav', 'flac', 'aac', 'ogg'].includes(extension) || type.includes('audio')) {
      return <FileAudio className="h-8 w-8 text-pink-500" />;
    }
    
    // Arquivos compactados
    if (['zip', 'rar', '7z', 'tar', 'gz'].includes(extension) || type.includes('archive')) {
      return <Archive className="h-8 w-8 text-yellow-500" />;
    }
    
    // Padrão
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
      Processing: undefined,
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
      console.warn(`Unknown document status: ${status}`);
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

  const fetchDocumentDetails = async (id: number) => {
    try {
      const response = await documentsService.getDocumentDetails(id);
      return response;
    } catch (error) {
      console.error('Error fetching document details:', error);
      toast({
        title: "Erro ao carregar detalhes",
        description: "Não foi possível carregar os detalhes do documento.",
        variant: "destructive",
      });
      return null;
    }
  };

  const handleViewDocument = async (document: Document) => {
    setSelectedDocument(document);
    setIsLoadingDetails(true);
    setShowDetails(true);
    
    try {
      const details = await fetchDocumentDetails(document.id);
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

  const handleDeleteDocument = (document: Document) => {
    // Placeholder para exclusão de documento
    toast({
      title: "Documento excluído",
      description: `${document.originalFileName} foi removido.`
    });
    
    // Remover da lista local
    setDocuments(prev => prev.filter(d => d.id !== document.id));
  };

  const handleAnalyzeDocument = async (document: Document) => {
    try {
      // Adicionar documento ao conjunto de documentos em análise
      setAnalyzingDocuments(prev => new Set(prev).add(document.id));

      // Iniciar análise
      const response = await documentsService.startDocumentAnalysis(document.id);
      
      toast({
        title: "Análise iniciada",
        description: `A análise do documento ${document.originalFileName} foi iniciada com sucesso.`,
      });

      // Atualizar o status do documento na lista local
      setDocuments(prev => prev.map(d => 
        d.id === document.id 
          ? { ...d, status: response.status || 'AnalyzingContent' }
          : d
      ));

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('already analyzed') || errorMessage.includes('já analisado')) {
        toast({
          title: "Documento já analisado",
          description: `${document.originalFileName} já foi analisado. Abra os detalhes para reanalisar.`,
          variant: "destructive",
        });
      } else if (errorMessage.includes('already in progress') || errorMessage.includes('em andamento')) {
        toast({
          title: "Análise em andamento",
          description: `A análise de ${document.originalFileName} já está em progresso.`,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Erro ao iniciar análise",
          description: errorMessage,
          variant: "destructive",
        });
      }
    } finally {
      // Remover documento do conjunto de documentos em análise
      setAnalyzingDocuments(prev => {
        const newSet = new Set(prev);
        newSet.delete(document.id);
        return newSet;
      });
    }
  };

  const canAnalyzeDocument = (document: Document): boolean => {
    // Documento pode ser analisado se:
    // 1. Está processado (texto extraído)
    // 2. Não está sendo analisado atualmente
    // 3. Não está em um estado de análise já
    const analyzableStatuses = ['Processed', 'Analyzed'];
    const nonAnalyzableStatuses = ['AnalyzingContent', 'ContentAnalysisFailed'];
    
    return analyzableStatuses.includes(document.status) && 
           !nonAnalyzableStatuses.includes(document.status) &&
           !analyzingDocuments.has(document.id);
  };

  // Funções de paginação
  const totalPages = Math.ceil(filteredDocuments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDocuments = filteredDocuments.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Obter lista única de status para o filtro
  const availableStatuses = Array.from(new Set(documents.map(doc => doc.status))).sort();

  // Renderização condicional baseada no estado showDetails
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
              Voltar para Lista
            </Button>
            {/* <h1 className="text-3xl font-bold text-foreground">
              {selectedDocument.originalFileName}
            </h1>
            <p className="text-muted-foreground">
              Detalhes e análise do documento
            </p> */}
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

  // Se não há workspace selecionado, mostrar mensagem
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
              Selecione um workspace para visualizar os documentos compartilhados.
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
        <PageBreadcrumb />
        <div className="flex items-center space-x-4">
          <WorkspaceSelector />
          <div className="text-right">
            <p className="text-foreground font-medium">
              {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-muted-foreground">
              {documents.filter(d => d.status === 'Processed' || d.status === 'Analyzed').length} processado{documents.filter(d => d.status === 'Processed' || d.status === 'Analyzed').length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadDocuments}
            className="text-muted-foreground hover:text-primary hover:bg-primary/10"
            title="Recarregar"
            aria-label="Recarregar documentos"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <Card className="bg-card border-border">
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Barra de Busca */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar documentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>
            
            {/* Filtro por Status */}
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
            Lista de todos os documentos enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : currentDocuments.length > 0 ? (
            <div className="space-y-4">
              {currentDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center space-x-4 p-4 bg-muted/50 rounded-lg hover:bg-accent/50 transition-colors border border-border/50"
                >
                  {/* Ícone do arquivo */}
                  <div className="flex-shrink-0">
                    {getFileTypeIcon(document.originalFileName, document.fileType)}
                  </div>

                  {/* Informações do documento */}
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
                      {document.id && (
                        <>
                          <span>•</span>
                          <span className="font-mono">ID: {document.id}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Ações */}
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
                    
                    {canAnalyzeDocument(document) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleAnalyzeDocument(document)}
                        className="text-muted-foreground hover:text-purple-600 hover:bg-purple-600/10"
                        title="Analisar com IA"
                        disabled={analyzingDocuments.has(document.id)}
                      >
                        {analyzingDocuments.has(document.id) ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Brain className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadDocument(document)}
                      className="text-muted-foreground hover:text-info hover:bg-info/10"
                      title="Download"
                      disabled={document.status !== 'Processed' && document.status !== 'Analyzed'}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(`/documents/${document.id}/association`, '_blank')}
                      className="text-muted-foreground hover:text-orange-600 hover:bg-orange-600/10"
                      title="Gerenciar Tipo"
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(document)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              {/* Paginação */}
              {totalPages > 1 && (
                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                          className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                      
                      {/* Páginas */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                          pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                          pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNumber = totalPages - 4 + i;
                        } else {
                          pageNumber = currentPage - 2 + i;
                        }
                        
                        return (
                          <PaginationItem key={pageNumber}>
                            <PaginationLink
                              onClick={() => handlePageChange(pageNumber)}
                              isActive={currentPage === pageNumber}
                              className="cursor-pointer"
                            >
                              {pageNumber}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      {totalPages > 5 && currentPage < totalPages - 2 && (
                        <PaginationItem>
                          <PaginationEllipsis />
                        </PaginationItem>
                      )}
                      
                      <PaginationItem>
                        <PaginationNext 
                          onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                          className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <File className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">
                {searchTerm || statusFilter !== 'all' ? 'Nenhum documento encontrado' : 'Nenhum documento'}
              </h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || statusFilter !== 'all'
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Você ainda não enviou nenhum documento.'
                }
              </p>
              {!searchTerm && statusFilter === 'all' && (
                <Button 
                  onClick={() => window.location.href = '/upload'}
                  className="bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Fazer Upload
                </Button>
              )}
            </div>
          )}
          
          {/* Informações de paginação */}
          {filteredDocuments.length > 0 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Mostrando {startIndex + 1} a {Math.min(endIndex, filteredDocuments.length)} de {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentsPage;
