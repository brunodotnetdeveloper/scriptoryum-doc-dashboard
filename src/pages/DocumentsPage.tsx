
import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { accountService, documentsService } from '@/services';
import { toast } from '@/hooks/use-toast';
import { File, Search, Download, Eye, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { Document } from '@/types/api';
import { DocumentDetailsModal } from '@/components/DocumentDetailsModal';



export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<number | null>(null);

  useEffect(() => {
    loadDocuments();
  }, []);

  useEffect(() => {
    // Filtrar documentos baseado no termo de busca
    const filtered = documents.filter(doc =>
      doc.originalFileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.description && doc.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
    setFilteredDocuments(filtered);
  }, [documents, searchTerm]);

  const loadDocuments = async () => {
    try {
      setIsLoading(true);
      const data = await accountService.getUserDocuments();
      
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Processed: {
        label: 'Processado',
        className: 'bg-green-100 text-green-800 hover:bg-green-200',
      },
      Processing: {
        label: 'Processando',
        className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200',
      },
      Uploaded: {
        label: 'Carregado',
        className: 'bg-blue-100 text-blue-800 hover:bg-blue-200',
      },
      Queued: {
        label: 'Na Fila',
        className: 'bg-purple-100 text-purple-800 hover:bg-purple-200',
      },
      ExtractingText: {
        label: 'Extraindo Texto',
        className: 'bg-orange-100 text-orange-800 hover:bg-orange-200',
      },
      AnalyzingContent: {
        label: 'Analisando Conteúdo',
        className: 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200',
      },
      Failed: {
        label: 'Falha',
        className: 'bg-red-100 text-red-800 hover:bg-red-200',
      },
      TextExtractionFailed: {
        label: 'Falha Extração Texto',
        className: 'bg-red-200 text-red-800 hover:bg-red-300',
      },
      ContentAnalysisFailed: {
        label: 'Falha Análise Conteúdo',
        className: 'bg-red-300 text-red-800 hover:bg-red-400',
      },
      Cancelled: {
        label: 'Cancelado',
        className: 'bg-gray-100 text-gray-800 hover:bg-gray-200',
      },
      PartiallyProcessed: {
        label: 'Parcialmente Processado',
        className: 'bg-yellow-200 text-yellow-900 hover:bg-yellow-300',
      },
      EntitiesExtractionFailed: {
        label: 'Falha Extração Entidades',
        className: 'bg-red-200 text-red-800 hover:bg-red-300',
      },
      RisksAnalysisFailed: {
        label: 'Falha Análise Riscos',
        className: 'bg-red-200 text-red-800 hover:bg-red-300',
      },
      InsightsGenerationFailed: {
        label: 'Falha Geração Insights',
        className: 'bg-red-200 text-red-800 hover:bg-red-300',
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];

    if (!config) {
      console.warn(`Unknown document status: ${status}`);
      return (
        <Badge className="bg-gray-500 text-white hover:bg-gray-600">
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

  const handleViewDocument = (document: Document) => {
    setSelectedDocumentId(document.id);
    setIsModalOpen(true);
  };

  const handleDownloadDocument = async (document: any) => {
    try {
      const url = await documentsService.getDocumentDownloadUrl(document.id);
      const link = window.document.createElement('a');
      link.href = url;
      link.download = document.originalFileName || document.fileName || 'documento';
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-scriptoryum-soft-white">Documentos</h1>
          <p className="text-scriptoryum-soft-white/70 mt-1">
            Gerencie seus documentos enviados para análise
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-scriptoryum-soft-white font-medium">
              {filteredDocuments.length} documento{filteredDocuments.length !== 1 ? 's' : ''}
            </p>
            <p className="text-sm text-scriptoryum-soft-white/50">
              {documents.filter(d => d.status === 'Processed').length} processado{documents.filter(d => d.status === 'Processed').length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={loadDocuments}
            className="text-scriptoryum-soft-white/70 hover:text-scriptoryum-soft-blue hover:bg-scriptoryum-soft-blue/10"
            title="Recarregar"
            aria-label="Recarregar documentos"
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Barra de Busca */}
      <Card className="bg-scriptoryum-dark-gray border-scriptoryum-medium-gray">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-scriptoryum-soft-white/50" />
            <Input
              placeholder="Buscar documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-scriptoryum-medium-gray/20 border-scriptoryum-medium-gray text-scriptoryum-soft-white placeholder:text-scriptoryum-soft-white/50 focus:border-scriptoryum-soft-blue"
            />
          </div>
        </CardContent>
      </Card>

      {/* Lista de Documentos */}
      <Card className="bg-scriptoryum-dark-gray border-scriptoryum-medium-gray">
        <CardHeader>
          <CardTitle className="text-scriptoryum-soft-white">Seus Documentos</CardTitle>
          <CardDescription className="text-scriptoryum-soft-white/70">
            Lista de todos os documentos enviados
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-scriptoryum-soft-blue" />
            </div>
          ) : filteredDocuments.length > 0 ? (
            <div className="space-y-4">
              {filteredDocuments.map((document) => (
                <div
                  key={document.id}
                  className="flex items-center space-x-4 p-4 bg-scriptoryum-medium-gray/10 rounded-lg hover:bg-scriptoryum-medium-gray/20 transition-colors"
                >
                  {/* Ícone do arquivo */}
                  <div className="flex-shrink-0">
                    <File className="h-8 w-8 text-scriptoryum-soft-blue" />
                  </div>

                  {/* Informações do documento */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-sm font-medium text-scriptoryum-soft-white truncate">
                        {document.originalFileName}
                      </h3>
                      {getStatusBadge(document.status)}
                    </div>
                    
                    {document.description && (
                      <p className="text-xs text-scriptoryum-soft-white/70 truncate">
                        {document.description}
                      </p>
                    )}

              <DocumentDetailsModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                documentId={selectedDocumentId}
                fetchDetails={fetchDocumentDetails}
                onDownloadDocument={handleDownloadDocument}
              />
                    
                    <div className="flex items-center space-x-4 text-xs text-scriptoryum-soft-white/50">
                      <span>{formatFileSize(document.fileSize)}</span>
                      <span>•</span>
                      <span>{formatDate(document.uploadedAt)}</span>
                      {document.id && (
                        <>
                          <span>•</span>
                          <span>ID: {document.id}</span>
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
                      className="text-scriptoryum-soft-white/70 hover:text-scriptoryum-soft-blue hover:bg-scriptoryum-soft-blue/10"
                      title="Visualizar"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDownloadDocument(document)}
                      className="text-scriptoryum-soft-white/70 hover:text-scriptoryum-soft-blue hover:bg-scriptoryum-soft-blue/10"
                      title="Download"
                      disabled={document.status !== 'Processed'}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(document)}
                      className="text-scriptoryum-soft-white/70 hover:text-scriptoryum-soft-red hover:bg-scriptoryum-soft-red/10"
                      title="Excluir"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <File className="h-16 w-16 text-scriptoryum-medium-gray mx-auto mb-4" />
              <h3 className="text-lg font-medium text-scriptoryum-soft-white mb-2">
                {searchTerm ? 'Nenhum documento encontrado' : 'Nenhum documento'}
              </h3>
              <p className="text-scriptoryum-soft-white/70 mb-4">
                {searchTerm 
                  ? 'Tente buscar com outros termos.'
                  : 'Você ainda não enviou nenhum documento.'
                }
              </p>
              {!searchTerm && (
                <Button 
                  onClick={() => window.location.href = '/upload'}
                  className="bg-scriptoryum-soft-blue hover:bg-scriptoryum-soft-blue/90 text-white"
                >
                  Fazer Upload
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
