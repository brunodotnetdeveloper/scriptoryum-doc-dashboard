import { useState, useEffect, useRef } from 'react';
import { toast } from '@/hooks/use-toast';
import { escribaService, accountService } from '@/services';
import { ChatMessage, ChatSession, DocumentContext } from '@/services/escriba.service';
import { Document } from '@/types/api';
import { useAuth } from '@/contexts/AuthContext';

export const useChatLogic = () => {
  const { user } = useAuth();
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
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    loadInitialData();
  }, []);

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
    try {
      setIsLoadingSessions(true);
      const [sessionsData, documentsData] = await Promise.all([
        escribaService.getChatSessions().catch(() => []),
        accountService.getUserDocuments().catch(() => ({ documents: [] }))
      ]);
      
      const validSessions = Array.isArray(sessionsData) ? sessionsData : [];
      setSessions(validSessions);
      setDocuments(documentsData.documents || []);
      
      if (validSessions.length === 0) {
        await createNewSession();
      } else {
        const firstSession = validSessions[0];
        setCurrentSession(firstSession);
        setMessages(firstSession?.messages || []);
      }
      
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

  const deleteSession = async (sessionId: string) => {
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
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
      documentId: selectedDocument?.id,
      documentName: selectedDocument?.originalFileName,
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
        role: 'assistant',
        content: response.response,
        timestamp: new Date(),
      };

      setMessages(prev => Array.isArray(prev) ? [...prev, assistantMessage] : [assistantMessage]);
      
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

  return {
    // State
    user,
    sessions,
    currentSession,
    messages,
    inputMessage,
    isLoading,
    isSending,
    documents,
    selectedDocument,
    documentContext,
    suggestions,
    isLoadingSessions,
    messagesEndRef,
    inputRef,
    
    // Actions
    setInputMessage,
    setSelectedDocument,
    createNewSession,
    selectSession,
    deleteSession,
    sendMessage,
    handleKeyPress,
    useSuggestion,
    copyMessage,
    formatTime,
    loadInitialData
  };
};