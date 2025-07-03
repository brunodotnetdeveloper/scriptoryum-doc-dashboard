import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { DocumentDetails } from '@/types/api';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Loader2, Brain, Trash2, RefreshCcw } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';

interface DocumentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  documentId: number | null;
  fetchDetails: (id: number) => Promise<DocumentDetails | null>;
}

export const DocumentDetailsModal: React.FC<DocumentDetailsModalProps> = ({
  isOpen, onClose, documentId, fetchDetails
}) => {
  const [details, setDetails] = React.useState<DocumentDetails | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (isOpen && documentId) {
      setIsLoading(true);
      setError(null);
      fetchDetails(documentId)
        .then(data => {
          if (data) {
            setDetails(data);
          } else {
            setError('Detalhes do documento não encontrados.');
          }
        })
        .catch(err => {
          console.error('Erro ao buscar detalhes do documento:', err);
          setError('Erro ao carregar detalhes do documento.');
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else if (!isOpen) {
      setDetails(null); // Clear details when modal closes
    }
  }, [isOpen, documentId, fetchDetails]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-screen h-screen max-w-[95vw] max-h-[95vh] flex flex-col bg-scriptoryum-dark-gray text-scriptoryum-soft-white border-scriptoryum-medium-gray">
        <DialogHeader>
          <DialogTitle className="text-scriptoryum-soft-white">
            Detalhes do Documento: {details?.originalFileName || 'Carregando...'}
          </DialogTitle>
          <DialogDescription className="text-scriptoryum-soft-white/70">
            Informações detalhadas sobre o documento e sua análise.
          </DialogDescription>
          <div className="flex flex-row gap-2 mt-4">
            {details?.status === 'Processed' && !isLoading && (
              <Button
                variant="secondary"
                className="bg-scriptoryum-soft-blue text-scriptoryum-dark-gray hover:bg-scriptoryum-soft-blue/80"
                onClick={() => console.log('Analyze Document')}
              >
                <Brain className="mr-2 h-4 w-4" /> Analisar com Escriba
              </Button>
            )}
            {(details?.status === 'Processed' || details?.status === 'ContentAnalysisFailed' || details?.status === 'PartiallyProcessed' || details?.status === 'EntitiesExtractionFailed' || details?.status === 'RisksAnalysisFailed' || details?.status === 'InsightsGenerationFailed') && !isLoading && (
              <Button
                variant="outline"
                className="border-scriptoryum-medium-gray text-scriptoryum-soft-white hover:bg-scriptoryum-medium-gray"
                onClick={() => console.log('Re-analyze Document')}
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Reanalisar
              </Button>
            )}
            {details?.status === 'TextExtractionFailed' && !isLoading && (
              <Button
                variant="outline"
                className="border-scriptoryum-medium-gray text-scriptoryum-soft-white hover:bg-scriptoryum-medium-gray"
                onClick={() => console.log('Retry Text Extraction')}
              >
                <RefreshCcw className="mr-2 h-4 w-4" /> Tentar Novamente Extração
              </Button>
            )}
            {(details?.status === 'Queued' || details?.status === 'ExtractingText' || details?.status === 'AnalyzingContent') && !isLoading && (
              <Button
                variant="outline"
                className="border-scriptoryum-medium-gray text-scriptoryum-soft-white hover:bg-scriptoryum-medium-gray"
                onClick={() => console.log('Cancel Processing')}
              >
                Cancelar Processamento
              </Button>
            )}
            {details?.status !== 'Queued' && details?.status !== 'Processing' && details?.status !== 'ExtractingText' && details?.status !== 'AnalyzingContent' && !isLoading && (
              <Button
                variant="destructive"
                onClick={() => console.log('Delete Document')}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Excluir
              </Button>
            )}
          </div>
        </DialogHeader>
        <div className="flex-1 overflow-hidden py-4">
          {isLoading ? (
            <div className="flex justify-center items-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-scriptoryum-soft-blue" />
            </div>
          ) : error ? (
            <div className="text-center text-red-500">{error}</div>
          ) : details ? (
            <Tabs defaultValue="extractedText" className="flex flex-col h-full">
              <TabsList className="grid w-full grid-cols-5 bg-scriptoryum-medium-gray/20 text-scriptoryum-soft-white">
                <TabsTrigger value="extractedText">Texto Extraído</TabsTrigger>
                <TabsTrigger value="entities">Entidades</TabsTrigger>
                <TabsTrigger value="risks">Riscos</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
                <TabsTrigger value="timeline">Linha do Tempo</TabsTrigger>
              </TabsList>
              <div className="flex-1 overflow-hidden pt-4">
                <TabsContent value="extractedText" className="h-full overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-250px)]">
                    <div className="pr-4">
                      <h3 className="text-lg font-semibold mb-2">Texto Extraído</h3>
                      <p className="text-sm text-scriptoryum-soft-white/80 whitespace-pre-wrap">{details.textExtracted || 'Nenhum texto extraído.'}</p>
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="entities" className="h-full overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-250px)]">
                    <div className="pr-4">
                      <h3 className="text-lg font-semibold mb-2">Entidades Extraídas</h3>
                      {details.extractedEntities && details.extractedEntities.length > 0 ? (
                        <div className="flex flex-wrap gap-2">
                          {details.extractedEntities.map((entity, index) => (
                            <Badge key={index} variant="secondary" className="bg-scriptoryum-medium-gray text-scriptoryum-soft-white">
                              {entity.value} (Tipo: {entity.entityTypeText}, Score: {(entity.confidenceScore * 100).toFixed(2)}%)
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-scriptoryum-soft-white/70">Nenhuma entidade extraída.</p>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="risks" className="h-full overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-250px)]">
                    <div className="pr-4">
                      <h3 className="text-lg font-semibold mb-2">Riscos Detectados</h3>
                      {details.risksDetected && details.risksDetected.length > 0 ? (
                        <div className="space-y-2">
                          {details.risksDetected.map((risk, index) => (
                            <div key={index} className="p-3 rounded-md bg-red-900/20 border border-red-800/50">
                              <p className="font-medium text-red-400">{risk.description}</p>
                              <p className="text-xs text-red-500">Severidade: {risk.severity} (Nível: {risk.riskLevel})</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-scriptoryum-soft-white/70">Nenhum risco detectado.</p>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="insights" className="h-full overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-250px)]">
                    <div className="pr-4">
                      <h3 className="text-lg font-semibold mb-2">Insights</h3>
                      {details.insights && details.insights.length > 0 ? (
                        <div className="space-y-2">
                          {details.insights.map((insight, index) => (
                            <div key={index} className="p-3 rounded-md bg-blue-900/20 border border-blue-800/50">
                              <p className="font-medium text-blue-400">{insight.title} (Categoria: {insight.categoryText})</p>
                              <p className="text-sm text-blue-500">{insight.description}</p>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-scriptoryum-soft-white/70">Nenhum insight gerado.</p>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="timeline" className="h-full overflow-hidden">
                  <ScrollArea className="h-[calc(100vh-250px)]">
                    <div className="pr-4">
                      <h3 className="text-lg font-semibold mb-2">Eventos da Linha do Tempo</h3>
                      {details.timelineEvents && details.timelineEvents.length > 0 ? (
                        <ol className="relative border-l border-scriptoryum-medium-gray ml-4">
                          {details.timelineEvents.map((event, index) => (
                            <li key={index} className="mb-6 ml-6">
                              <span className="absolute flex items-center justify-center w-3 h-3 bg-scriptoryum-soft-blue rounded-full -left-1.5 ring-8 ring-scriptoryum-dark-gray"></span>
                              <h4 className="font-semibold text-scriptoryum-soft-white">{event.title}</h4>
                              <time className="block mb-2 text-xs font-normal leading-none text-scriptoryum-soft-white/50">{new Date(event.timestamp).toLocaleString('pt-BR')}</time>
                              <p className="text-sm text-scriptoryum-soft-white/70">{event.description}</p>
                            </li>
                          ))}
                        </ol>
                      ) : (
                        <p className="text-sm text-scriptoryum-soft-white/70">Nenhum evento na linha do tempo.</p>
                      )}
                    </div>
                  </ScrollArea>
                </TabsContent>
              </div>
            </Tabs>
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
};