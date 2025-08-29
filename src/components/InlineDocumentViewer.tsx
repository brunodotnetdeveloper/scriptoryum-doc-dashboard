import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  X, 
  Download, 
  Search, 
  ChevronDown, 
  ChevronUp,
  Quote,
  Copy,
  Eye,
  Maximize2,
  Minimize2,
  BookmarkPlus
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { documentsService } from '@/services';
import { Document } from '@/types/api';
import { DocumentMarker, DocumentReference } from './DocumentMarker';
import { THEME_SIZES, THEME_SPACING, THEME_TEXT, THEME_BREAKPOINTS } from '@/constants/theme';

interface InlineDocumentViewerProps {
  document: Document;
  onClose: () => void;
  onQuoteText?: (text: string, documentName: string) => void;
  onCreateReference?: (reference: DocumentReference) => void;
  className?: string;
}

interface DocumentContent {
  content: string;
  extractedText?: string;
  metadata?: {
    pageCount?: number;
    wordCount?: number;
    language?: string;
  };
}

export const InlineDocumentViewer: React.FC<InlineDocumentViewerProps> = ({
  document,
  onClose,
  onQuoteText,
  onCreateReference,
  className = ''
}) => {
  const [content, setContent] = useState<DocumentContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedText, setSelectedText] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showMarkerCreator, setShowMarkerCreator] = useState(false);
  const [markerSelection, setMarkerSelection] = useState<{
    text: string;
    start: number;
    end: number;
  } | null>(null);

  useEffect(() => {
    loadDocumentContent();
  }, [document.id]);

  const loadDocumentContent = async () => {
    try {
      setIsLoading(true);
      // Simular carregamento de conteúdo do documento
      // Em uma implementação real, você faria uma chamada para a API
      const mockContent: DocumentContent = {
        content: `Conteúdo do documento: ${document.originalFileName}\n\nEste é um exemplo de conteúdo de documento que seria extraído do arquivo real. O conteúdo incluiria todo o texto extraído do documento original.\n\nSeção 1: Introdução\nEste documento contém informações importantes sobre...\n\nSeção 2: Desenvolvimento\nAqui encontramos os detalhes principais...\n\nSeção 3: Conclusão\nPara finalizar, podemos concluir que...`,
        extractedText: `Texto extraído completo do documento ${document.originalFileName}`,
        metadata: {
          pageCount: 5,
          wordCount: 1250,
          language: 'pt-BR'
        }
      };
      
      setContent(mockContent);
    } catch (error) {
      console.error('Erro ao carregar conteúdo do documento:', error);
      toast({
        title: "Erro ao carregar documento",
        description: "Não foi possível carregar o conteúdo do documento.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      const text = selection.toString().trim();
      setSelectedText(text);
      
      // Capturar posição da seleção para marcadores
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        setMarkerSelection({
          text,
          start: range.startOffset,
          end: range.endOffset
        });
      }
    }
  };

  const handleQuoteText = () => {
    if (selectedText && onQuoteText) {
      onQuoteText(selectedText, document.originalFileName);
      toast({
        title: "Texto referenciado",
        description: "O trecho selecionado foi adicionado ao chat.",
      });
      setSelectedText('');
      setMarkerSelection(null);
      window.getSelection()?.removeAllRanges();
    }
  };

  const handleCreateMarker = () => {
    if (selectedText && markerSelection) {
      setShowMarkerCreator(true);
    }
  };

  const handleMarkerCreated = (reference: DocumentReference) => {
    if (onCreateReference) {
      onCreateReference(reference);
    }
    setShowMarkerCreator(false);
    setSelectedText('');
    setMarkerSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleCancelMarker = () => {
    setShowMarkerCreator(false);
    setSelectedText('');
    setMarkerSelection(null);
    window.getSelection()?.removeAllRanges();
  };

  const handleCopyText = () => {
    if (selectedText) {
      navigator.clipboard.writeText(selectedText);
      toast({
        title: "Texto copiado",
        description: "O trecho selecionado foi copiado para a área de transferência.",
      });
    }
  };

  const highlightSearchTerm = (text: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark class="bg-yellow-200 text-yellow-900">$1</mark>');
  };

  const downloadDocument = async () => {
    try {
      const downloadUrl = await documentsService.getDocumentDownloadUrl(document.id);
      const link = window.document.createElement('a');
      link.href = downloadUrl;
      link.download = document.originalFileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } catch (error) {
      toast({
        title: "Erro no download",
        description: "Não foi possível baixar o documento.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className={`${className} ${isFullscreen ? 'fixed inset-2 md:inset-4 z-50' : ''} transition-all duration-200`}>
      <CardHeader className={`pb-3 ${THEME_SPACING.card.padding}`}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <FileText className={`${THEME_SIZES.icon.md} text-primary flex-shrink-0`} />
            <div className="min-w-0">
              <CardTitle className={`${THEME_TEXT.title.md} truncate`}>{document.originalFileName}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className={THEME_TEXT.body.xs}>
                  {document.status}
                </Badge>
                {content?.metadata && (
                  <span className={`${THEME_TEXT.body.xs} text-muted-foreground`}>
                    {content.metadata.pageCount} páginas • {content.metadata.wordCount} palavras
                  </span>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              onClick={() => setIsFullscreen(!isFullscreen)}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 flex-1 sm:flex-none"
            >
              {isFullscreen ? (
                <><Minimize2 className={THEME_SIZES.icon.sm} /> <span className="hidden sm:inline">Janela</span></>
              ) : (
                <><Maximize2 className={THEME_SIZES.icon.sm} /> <span className="hidden sm:inline">Tela Cheia</span></>
              )}
            </Button>
            <Button
              onClick={downloadDocument}
              size="sm"
              variant="outline"
              className="flex items-center gap-2 flex-1 sm:flex-none"
            >
              <Download className={THEME_SIZES.icon.sm} />
              <span className="hidden sm:inline">Download</span>
            </Button>
            <Button
              onClick={onClose}
              size="sm"
              variant="ghost"
              className={`${THEME_SIZES.avatar.md} p-0 flex-shrink-0`}
            >
              <X className={THEME_SIZES.icon.sm} />
            </Button>
          </div>
        </div>
        
        {/* Barra de pesquisa */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-3">
          <div className="relative flex-1">
            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${THEME_SIZES.icon.sm} text-muted-foreground`} />
            <input
              type="text"
              placeholder="Pesquisar no documento..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`w-full pl-10 pr-4 py-2 border rounded-md bg-background ${THEME_TEXT.body.sm}`}
            />
          </div>
          <Button
            onClick={() => setIsExpanded(!isExpanded)}
            size="sm"
            variant="outline"
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            {isExpanded ? 'Recolher' : 'Expandir'}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        
        {/* Ações para texto selecionado */}
        {selectedText && !showMarkerCreator && (
          <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-2 mt-2 p-2 bg-muted/50 rounded-lg ${THEME_SPACING.space.sm}`}>
            <span className={`${THEME_TEXT.body.sm} text-muted-foreground`}>Texto selecionado:</span>
            <span className={`${THEME_TEXT.body.sm} font-medium break-words flex-1`}>
              "{selectedText.substring(0, 50)}{selectedText.length > 50 ? '...' : ''}"
            </span>
            <div className="flex flex-wrap gap-2">
              <Button
                onClick={handleQuoteText}
                size="sm"
                variant="outline"
                className={`h-7 px-2 ${THEME_TEXT.body.xs}`}
              >
                <Quote className={`${THEME_SIZES.icon.xs} mr-1`} />
                Referenciar
              </Button>
              <Button
                onClick={handleCopyText}
                size="sm"
                variant="outline"
                className={`h-7 px-2 ${THEME_TEXT.body.xs}`}
              >
                <Copy className={`${THEME_SIZES.icon.xs} mr-1`} />
                Copiar
              </Button>
              {onCreateReference && (
                <Button
                  onClick={handleCreateMarker}
                  size="sm"
                  className={`h-7 px-2 ${THEME_TEXT.body.xs}`}
                >
                  <BookmarkPlus className={`${THEME_SIZES.icon.xs} mr-1`} />
                  Marcar
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Criador de Marcador */}
        {showMarkerCreator && markerSelection && (
          <div className="mt-2 p-2 bg-muted/50 rounded-lg">
            <DocumentMarker
              selectedText={markerSelection.text}
              documentName={document.originalFileName}
              documentId={document.id.toString()}
              position={{
                start: markerSelection.start,
                end: markerSelection.end
              }}
              onCreateReference={handleMarkerCreated}
              onCancel={handleCancelMarker}
            />
          </div>
        )}
      </CardHeader>
      
      <Separator />
      
      <CardContent className="p-0">
        <ScrollArea className={`${isExpanded || isFullscreen ? 'h-96' : 'h-48'} p-4`}>
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2 animate-pulse" />
                <p className="text-sm text-muted-foreground">Carregando documento...</p>
              </div>
            </div>
          ) : content ? (
            <div 
              className="prose prose-sm max-w-none text-sm leading-relaxed"
              onMouseUp={handleTextSelection}
              dangerouslySetInnerHTML={{
                __html: highlightSearchTerm(content.content.replace(/\n/g, '<br>'))
              }}
            />
          ) : (
            <div className="text-center py-8">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Não foi possível carregar o conteúdo</p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
};