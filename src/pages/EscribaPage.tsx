import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  MessageSquare,
  Sparkles,
  Brain,
  Search,
  Copy,
  Download,
  RefreshCw,
  Hash
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { escribaService, documentsService, accountService } from '@/services';
import { ChatMessage, ChatSession, DocumentContext } from '@/services/escriba.service';
import { Document } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';
import { DocumentAnalysisPanel } from '@/components/DocumentAnalysisPanel';
import { WorkspaceSelector } from '@/components/WorkspaceSelector';
import { InlineDocumentViewer } from '@/components/InlineDocumentViewer';
import { DocumentReference, DocumentReferenceDisplay } from '@/components/DocumentMarker';

export const EscribaPage: React.FC = () => {
  const { user, currentWorkspace } = useAuth();
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSession, setCurrentSession] = useState<ChatSession | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [documents, setDocuments] = useState<Document[]>([]);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [documentContext, setDocumentContext] = useState<DocumentContext | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);
  const [showAnalysisPanel, setShowAnalysisPanel] = useState(false);
  const [showInlineViewer, setShowInlineViewer] = useState(false);
  const [inlineViewerDocument, setInlineViewerDocument] = useState<Document | null>(null);
  const [documentReferences, setDocumentReferences] = useState<DocumentReference[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadInitialData();
  }, [currentWorkspace]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (selectedDocument) {
      loadDocumentContext(selectedDocument.id);
    } else {
      setDocumentContext(null);
    }
  }, [selectedDocument]);

  const loadInitialData = async () => {
    if (!currentWorkspace) {
      setSessions([]);
      setDocuments([]);
      setCurrentSession(null);
      setMessages([]);
      setIsLoadingSessions(false);
      return;
    }

    try {
      setIsLoadingSessions(true);
      const [sessionsData, documentsData] = await Promise.all([
        escribaService.getChatSessions().catch(() => []),
        documentsService.getWorkspaceDocuments(currentWorkspace.id).catch(() => [])
      ]);
      
      // Garantir que sessionsData é um array
      const validSessions = Array.isArray(sessionsData) ? sessionsData : [];
      setSessions(validSessions);
      setDocuments(Array.isArray(documentsData) ? documentsData : []);
      
      // Se não há sessões, criar uma nova
      if (validSessions.length === 0) {
        await createNewSession();
      } else {
        // Carregar a sessão mais recente
        const firstSession = validSessions[0];
        setCurrentSession(firstSession);
        setMessages(firstSession?.messages || []);
      }
      
      // Carregar sugestões iniciais
      loadSuggestions();
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar as informações iniciais.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingSessions(false);
    }
  };

  const loadDocumentContext = async (documentId: number) => {
    try {
      const context = await escribaService.getDocumentContext(documentId);
      setDocumentContext(context);
    } catch (error) {
      console.error('Erro ao carregar contexto do documento:', error);
    }
  };

  const loadSuggestions = async (context?: string) => {
    try {
      const suggestionsData = await escribaService.getSuggestions(context);
      setSuggestions(Array.isArray(suggestionsData) ? suggestionsData : []);
    } catch (error) {
      console.error('Erro ao carregar sugestões:', error);
      setSuggestions([]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const createNewSession = async () => {
    try {
      const newSession = await escribaService.createChatSession();
      setSessions(prev => Array.isArray(prev) ? [newSession, ...prev] : [newSession]);
      setCurrentSession(newSession);
      setMessages([]);
      setSelectedDocument(null);
      loadSuggestions();
    } catch (error) {
      console.error('Erro ao criar nova sessão:', error);
      toast({
        title: "Erro ao criar sessão",
        description: "Não foi possível criar uma nova conversa.",
        variant: "destructive",
      });
    }
  };

  const selectSession = async (session: ChatSession) => {
    try {
      setIsLoading(true);
      const sessionData = await escribaService.getChatSession(session.id);
      setCurrentSession(sessionData);
      setMessages(Array.isArray(sessionData?.messages) ? sessionData.messages : []);
    } catch (error) {
      console.error('Erro ao carregar sessão:', error);
      toast({
        title: "Erro ao carregar conversa",
        description: "Não foi possível carregar a conversa selecionada.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const deleteSession = async (sessionId: number) => {
    try {
      await escribaService.deleteChatSession(sessionId);
      setSessions(prev => Array.isArray(prev) ? prev.filter(s => s.id !== sessionId) : []);
      
      if (currentSession?.id === sessionId) {
        const remainingSessions = Array.isArray(sessions) ? sessions.filter(s => s.id !== sessionId) : [];
        if (remainingSessions.length > 0) {
          selectSession(remainingSessions[0]);
        } else {
          createNewSession();
        }
      }
      
      toast({
        title: "Conversa excluída",
        description: "A conversa foi excluída com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao excluir sessão:', error);
      toast({
        title: "Erro ao excluir conversa",
        description: "Não foi possível excluir a conversa.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isSending || !currentSession) return;

    const userMessage: ChatMessage = {
      role: 'User',
      content: inputMessage.trim(),      
      documentId: selectedDocument?.id,
      documentName: selectedDocument?.originalFileName,
      chatSessionId: currentSession.id
    };

    setMessages(prev => Array.isArray(prev) ? [...prev, userMessage] : [userMessage]);
    setInputMessage('');
    setIsSending(true);

    try {
      const response = await escribaService.sendMessage({
        message: userMessage.content,
        sessionId: currentSession.id,
        documentId: selectedDocument?.id,
        context: documentContext?.content,
      });

      const assistantMessage: ChatMessage = {
        id: response.messageId,
        role: 'Assistant',
        content: response.response,
        chatSessionId: 0,
        documentId: 0,
        documentName: '',
        tokenCount: 0,
        cost: 0,
        modelUsed: '',
        responseTimeMs: 0
      };

      setMessages(prev => Array.isArray(prev) ? [...prev, assistantMessage] : [assistantMessage]);
      
      // Atualizar sugestões se fornecidas
      if (response.suggestions && Array.isArray(response.suggestions)) {
        setSuggestions(response.suggestions);
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Não foi possível enviar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const useSuggestion = (suggestion: string) => {
    setInputMessage(suggestion);
    inputRef.current?.focus();
  };

  const handleAnalysisPanelQuestion = (question: string) => {
    setInputMessage(question);
    setShowAnalysisPanel(false);
    inputRef.current?.focus();
  };

  const handleQuoteText = (text: string, documentName: string) => {
    const quotedText = `📄 **${documentName}**\n> "${text}"\n\n`;
    setInputMessage(prev => prev + quotedText);
    inputRef.current?.focus();
  };

  const openInlineViewer = (document: Document) => {
    setInlineViewerDocument(document);
    setShowInlineViewer(true);
  };

  const closeInlineViewer = () => {
    setShowInlineViewer(false);
    setInlineViewerDocument(null);
  };

  const handleCreateReference = (reference: DocumentReference) => {
    setDocumentReferences(prev => [...prev, reference]);
    toast({
      title: "Marcador criado",
      description: `Referência adicionada para "${reference.documentName}"`
    });
  };

  const handleRemoveReference = (referenceId: string) => {
    setDocumentReferences(prev => prev.filter(ref => ref.id !== referenceId));
  };

  const copyMessage = (content: string) => {
    navigator.clipboard.writeText(content);
    toast({
      title: "Copiado!",
      description: "Mensagem copiada para a área de transferência.",
    });
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="h-full flex flex-col lg:flex-row gap-3 md:gap-6">
      {/* Sidebar - Sessões de Chat */}
      <div className="w-full lg:w-80 flex flex-col gap-3 md:gap-4">
        {/* Header da Sidebar */}
        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle className="text-base md:text-lg flex items-center gap-2">
                <Bot className="h-5 w-5 text-primary" />
                Escriba
              </CardTitle>
              <Button
                onClick={createNewSession}
                size="sm"
                className="h-8 w-8 p-0 flex-shrink-0"
                disabled={!currentWorkspace}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="mt-3">
              <WorkspaceSelector />
            </div>
          </CardHeader>
        </Card>

        {/* Lista de Sessões */}
        <Card className="flex-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-muted-foreground">
              Conversas Recentes
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[250px] md:h-[300px]">
              {isLoadingSessions ? (
                <div className="p-3 md:p-4 text-center text-muted-foreground">
                  <RefreshCw className="h-4 w-4 animate-spin mx-auto mb-2" />
                  <span className="text-xs md:text-sm">Carregando conversas...</span>
                </div>
              ) : !Array.isArray(sessions) || sessions.length === 0 ? (
                <div className="p-3 md:p-4 text-center text-muted-foreground">
                  <MessageSquare className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs md:text-sm">Nenhuma conversa ainda</p>
                  <p className="text-xs">Inicie uma nova conversa!</p>
                </div>
              ) : (
                <div className="space-y-1 p-2">
                  {Array.isArray(sessions) && sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${
                        currentSession?.id === session.id
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => selectSession(session)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="text-xs md:text-sm font-medium truncate">
                          {session.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(session.updatedAt).toLocaleDateString('pt-BR')}
                        </p>
                      </div>
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteSession(session.id);
                        }}
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Seleção de Documento */}
        <Card>
          <CardHeader className="pb-2 md:pb-3">
            <CardTitle className="text-xs md:text-sm text-muted-foreground flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Documentos da Workspace
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 md:space-y-3 p-3 md:p-6">
            {!currentWorkspace ? (
              <div className="text-center py-3 md:py-4 text-muted-foreground">
                <FileText className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs md:text-sm">Selecione uma workspace</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-3 md:py-4 text-muted-foreground">
                <FileText className="h-6 w-6 md:h-8 md:w-8 mx-auto mb-2 opacity-50" />
                <p className="text-xs md:text-sm">Nenhum documento na workspace</p>
              </div>
            ) : (
              <>
                <select
                  value={selectedDocument?.id || ''}
                  onChange={(e) => {
                    const docId = parseInt(e.target.value);
                    const doc = documents.find(d => d.id === docId);
                    setSelectedDocument(doc || null);
                  }}
                  className="w-full p-2 text-xs md:text-sm border rounded-md bg-background"
                >
                  <option value="">Selecionar documento...</option>
                  {documents.map((doc) => (
                    <option key={doc.id} value={doc.id}>
                      {doc.originalFileName}
                    </option>
                  ))}
                </select>
                
                {selectedDocument && (
                   <div className="p-2 md:p-3 bg-muted/50 rounded-lg space-y-2">
                     <div className="flex items-center justify-between gap-2">
                       <div className="flex items-center gap-2 flex-1 min-w-0">
                         <FileText className="h-4 w-4 text-primary flex-shrink-0" />
                         <span className="text-xs md:text-sm font-medium truncate">
                           {selectedDocument.originalFileName}
                         </span>
                       </div>
                       <Button
                         onClick={() => openInlineViewer(selectedDocument)}
                         size="sm"
                         variant="ghost"
                         className="h-6 w-6 p-0 flex-shrink-0"
                       >
                         <Search className="h-3 w-3" />
                       </Button>
                     </div>
                     <div className="text-xs text-muted-foreground space-y-1">
                       <p><strong>Status:</strong> {selectedDocument.status}</p>
                       <p><strong>Tamanho:</strong> {(selectedDocument.fileSize / 1024).toFixed(1)} KB</p>
                       {documentContext && (
                         <p className="text-green-600"><strong>✓ Contexto carregado</strong></p>
                       )}
                     </div>
                   </div>
                 )}

                 {/* Marcadores de Referência */}
                 {documentReferences.length > 0 && (
                   <div className="space-y-2">
                       <div className="flex items-center gap-2">
                         <Hash className="h-4 w-4 text-primary" />
                         <span className="text-xs md:text-sm font-medium">Marcadores ({documentReferences.length})</span>
                       </div>
                       <div className="space-y-2 max-h-32 md:max-h-48 overflow-y-auto">
                       {documentReferences.map((reference) => (
                         <DocumentReferenceDisplay
                           key={reference.id}
                           reference={reference}
                           onQuote={handleQuoteText}
                           onRemove={handleRemoveReference}
                         />
                       ))}
                     </div>
                   </div>
                 )}
               </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Área Principal do Chat */}
      <div className="flex-1 flex flex-col gap-3 md:gap-4">
        {/* Visualizador Inline de Documento */}
        {showInlineViewer && inlineViewerDocument && (
          <InlineDocumentViewer
             document={inlineViewerDocument}
             onClose={closeInlineViewer}
             onQuoteText={handleQuoteText}
             onCreateReference={handleCreateReference}
             className="max-h-96"
           />
        )}
        
        <Card className="flex-1 flex flex-col">
          {/* Header do Chat */}
          <CardHeader className="border-b p-3 md:p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-6 w-6 md:h-8 md:w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-3 w-3 md:h-4 md:w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <h3 className="text-sm md:text-base font-semibold truncate">
                    {currentSession?.title || 'Nova Conversa'}
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Assistente de Análise de Documentos
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                {selectedDocument && (
                  <Button
                    onClick={() => setShowAnalysisPanel(!showAnalysisPanel)}
                    size="sm"
                    variant="outline"
                    className="flex items-center gap-1 flex-1 sm:flex-none"
                  >
                    <Brain className="h-3 w-3" />
                    <span className="hidden sm:inline">Análise</span>
                  </Button>
                )}
                {selectedDocument && (
                  <Badge variant="secondary" className="flex items-center gap-1 text-xs truncate max-w-32 sm:max-w-none">
                    <FileText className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{selectedDocument.originalFileName}</span>
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>

          {/* Área de Mensagens */}
          <CardContent className="flex-1 p-0">
            <ScrollArea className="h-[400px] md:h-[500px] p-3 md:p-4">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : !Array.isArray(messages) || messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <div className="p-4 rounded-full bg-primary/10">
                    <Sparkles className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Olá, {user?.userName}!</h3>
                    <p className="text-muted-foreground">
                      Sou o Escriba, seu assistente de análise de documentos.
                    </p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Como posso ajudá-lo hoje?
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 md:space-y-4">
                  {Array.isArray(messages) && messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex gap-2 md:gap-3 ${
                        message.role === 'User' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {message.role === 'Assistant' && (
                        <Avatar className="h-6 w-6 md:h-8 md:w-8 mt-1 flex-shrink-0">
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Bot className="h-3 w-3 md:h-4 md:w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                      
                      <div
                        className={`max-w-[85%] md:max-w-[80%] rounded-lg p-2 md:p-3 ${
                          message.role === 'User'  
                            ? 'bg-primary text-primary-foreground'
                            : 'bg-muted'
                        }`}
                      >
                        <div className="whitespace-pre-wrap text-xs md:text-sm break-words">
                          {message.content}
                        </div>
                        
                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/20">
                          <span className="text-xs opacity-70">
                            {formatTime(new Date(message.createdAt))}
                          </span>
                          <Button
                            onClick={() => copyMessage(message.content)}
                            size="sm"
                            variant="ghost"
                            className="h-5 w-5 md:h-6 md:w-6 p-0 opacity-70 hover:opacity-100"
                          >
                            <Copy className="h-2 w-2 md:h-3 md:w-3" />
                          </Button>
                        </div>
                        
                        {message.documentName && (
                          <div className="mt-2 pt-2 border-t border-border/20">
                            <Badge variant="outline" className="text-xs">
                              <FileText className="h-3 w-3 mr-1" />
                              {message.documentName}
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {message.role === 'User' && (
                        <Avatar className="h-6 w-6 md:h-8 md:w-8 mt-1 flex-shrink-0">
                          <AvatarFallback className="bg-secondary">
                            <User className="h-3 w-3 md:h-4 md:w-4" />
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  ))}
                  
                  {isSending && (
                    <div className="flex gap-2 md:gap-3 justify-start">
                      <Avatar className="h-6 w-6 md:h-8 md:w-8 mt-1 flex-shrink-0">
                        <AvatarFallback className="bg-primary text-primary-foreground">
                          <Bot className="h-3 w-3 md:h-4 md:w-4" />
                        </AvatarFallback>
                      </Avatar>
                      <div className="bg-muted rounded-lg p-2 md:p-3">
                        <div className="flex items-center gap-2 text-xs md:text-sm text-muted-foreground">
                          <RefreshCw className="h-3 w-3 md:h-4 md:w-4 animate-spin" />
                          Escriba está pensando...
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div ref={messagesEndRef} />
                </div>
              )}
            </ScrollArea>
          </CardContent>

          {/* Sugestões */}
          {Array.isArray(suggestions) && suggestions.length > 0 && Array.isArray(messages) && messages.length === 0 && (
            <div className="border-t p-3 md:p-4">
              <p className="text-xs md:text-sm text-muted-foreground mb-2 md:mb-3">
                Sugestões para começar:
              </p>
              <div className="flex flex-wrap gap-2">
                {Array.isArray(suggestions) && suggestions.map((suggestion, index) => (
                  <Button
                    key={index}
                    onClick={() => useSuggestion(suggestion)}
                    size="sm"
                    variant="outline"
                    className="text-xs h-8"
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          )}

          {/* Input de Mensagem */}
          <div className="border-t p-3 md:p-4">
            <div className="flex gap-2">
              <Textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder={
                  selectedDocument
                    ? `Pergunte algo sobre ${selectedDocument.originalFileName}...`
                    : "Digite sua mensagem..."
                }
                className="min-h-[50px] md:min-h-[60px] max-h-[100px] md:max-h-[120px] resize-none text-sm"
                disabled={isSending}
              />
              <Button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isSending || !currentSession}
                size="sm"
                className="h-[50px] md:h-[60px] px-3 md:px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Painel de Análise de Documento */}
      {showAnalysisPanel && selectedDocument && documentContext && (
        <DocumentAnalysisPanel
          documentContext={documentContext}
          onClose={() => setShowAnalysisPanel(false)}
          onAskQuestion={handleAnalysisPanelQuestion}
        />
      )}
    </div>
  );
};