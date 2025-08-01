import React from 'react';
import { DocumentDetails, Document } from '@/types/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Trash2, RefreshCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { documentsService } from '@/services';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface DocumentDetailsViewProps {
  document: Document;
  details: DocumentDetails;
  onDownloadDocument: (document: Document) => void;
}

const getFileTypeText = (fileType: number): string => {
  const fileTypes: { [key: number]: string } = {
    1: 'PDF',
    2: 'Word Document',
    3: 'Excel Spreadsheet',
    4: 'PowerPoint Presentation',
    5: 'Text File',
    6: 'Image',
    7: 'Other'
  };
  return fileTypes[fileType] || 'Unknown';
};

export const DocumentDetailsView: React.FC<DocumentDetailsViewProps> = ({
  document,
  details,
  onDownloadDocument
}) => {
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);

  const handleAnalyzeDocument = async (force: boolean = false) => {
    if (!details || !document.id) return;

    setIsAnalyzing(true);
    try {
      await documentsService.startDocumentAnalysis(document.id, force);
      toast.success('Análise iniciada com sucesso!');
    } catch (error) {
      console.error('Erro ao iniciar análise:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      if (errorMessage.includes('already in progress') || errorMessage.includes('em andamento')) {
        toast.error('Análise já está em andamento. Aguarde a conclusão.', {
          duration: 5000,
        });
      } else {
        toast.error(`Erro ao iniciar análise: ${errorMessage}`);
      }
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleAnalyzeClick = () => {
    handleAnalyzeDocument(true);
  };

  const handleForceAnalyzeClick = () => {
    handleAnalyzeDocument(true);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Uploaded': { label: 'Enviado', variant: 'secondary' as const },
      'Processing': { label: 'Processando', variant: 'default' as const },
      'Processed': { label: 'Processado', variant: 'default' as const },
      'Failed': { label: 'Falhou', variant: 'destructive' as const },
      'AnalyzingContent': { label: 'Analisando', variant: 'default' as const },
      'ContentAnalyzed': { label: 'Analisado', variant: 'default' as const },
      'ContentAnalysisFailed': { label: 'Análise Falhou', variant: 'destructive' as const },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || 
                   { label: status, variant: 'outline' as const };

    return (
      <Badge variant={config.variant} className="text-xs">
        {config.label}
      </Badge>
    );
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="space-y-6">
      {/* Informações Básicas */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-card-foreground">Informações do Documento</CardTitle>
            <div className="flex items-center space-x-2">
              {getStatusBadge(details.status)}
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDownloadDocument(document)}
                className="text-muted-foreground hover:text-info hover:bg-info/10"
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-foreground">Nome do Arquivo</p>
              <p className="text-sm text-muted-foreground">{details.originalFileName}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Tamanho</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(details.fileSize)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">Data de Upload</p>
              <p className="text-sm text-muted-foreground">{formatDate(details.uploadedAt)}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-foreground">ID do Documento</p>
              <p className="text-sm text-muted-foreground font-mono">{details.id}</p>
            </div>
          </div>
          {details.description && (
            <div>
              <p className="text-sm font-medium text-foreground">Descrição</p>
              <p className="text-sm text-muted-foreground">{details.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ações de Análise */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground flex items-center">
            <Brain className="h-5 w-5 mr-2 text-purple-600" />
            Análise com IA
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleAnalyzeClick}
              disabled={isAnalyzing || details.status === 'AnalyzingContent'}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
              {isAnalyzing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Brain className="h-4 w-4 mr-2" />
              )}
              {details.status === 'AnalyzingContent' ? 'Analisando...' : 'Analisar Documento'}
            </Button>
            
            {details.status === 'ContentAnalyzed' && (
              <Button
                onClick={handleForceAnalyzeClick}
                disabled={isAnalyzing}
                variant="outline"
                className="border-purple-600 text-purple-600 hover:bg-purple-600 hover:text-white"
              >
                {isAnalyzing ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCcw className="h-4 w-4 mr-2" />
                )}
                Reanalisar
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Conteúdo do Documento */}
      <Tabs defaultValue="content" className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-muted">
          <TabsTrigger value="content" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
            Conteúdo
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
            Análise
          </TabsTrigger>
          <TabsTrigger value="metadata" className="data-[state=active]:bg-background data-[state=active]:text-foreground">
            Metadados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Texto Extraído</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96 w-full rounded-md border border-border p-4">
                <div className="whitespace-pre-wrap text-sm text-foreground">
                  {details.textExtracted || 'Nenhum texto extraído disponível.'}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Resultado da Análise</CardTitle>
            </CardHeader>
            <CardContent>
              {details.insights && details.insights.length > 0 ? (
                <ScrollArea className="h-96 w-full rounded-md border border-border p-4">
                  <div className="space-y-4">
                    {details.insights.map((insight, index) => (
                      <div key={index} className="border-b border-border pb-2 last:border-b-0">
                        <h4 className="font-medium text-foreground">{insight.title}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{insight.description}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {details.status === 'AnalyzingContent' 
                      ? 'Análise em andamento...' 
                      : 'Nenhuma análise disponível. Clique em "Analisar Documento" para começar.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metadata" className="mt-4">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-card-foreground">Metadados do Arquivo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-foreground">Tipo MIME</p>
                    <p className="text-sm text-muted-foreground">{getFileTypeText(details.fileType) || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Extensão</p>
                    <p className="text-sm text-muted-foreground">
                      {details.originalFileName.split('.').pop()?.toUpperCase() || 'N/A'}
                    </p>
                  </div>
                </div>
                
                {details.extractedEntities && details.extractedEntities.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-foreground mb-2">Entidades Extraídas</p>
                    <ScrollArea className="h-32 w-full rounded-md border border-border p-4">
                      <div className="space-y-2">
                        {details.extractedEntities.map((entity, index) => (
                          <div key={index} className="flex justify-between items-center">
                            <span className="text-sm text-foreground">{entity.value}</span>
                            <span className="text-xs text-muted-foreground">{entity.entityTypeText}</span>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};