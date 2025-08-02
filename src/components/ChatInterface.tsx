import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Bot, 
  User, 
  FileText, 
  Copy,
  RefreshCw,
  Sparkles,
  X
} from 'lucide-react';
import { useChatLogic } from '@/hooks/useChatLogic';

interface ChatInterfaceProps {
  isCompact?: boolean;
  onClose?: () => void;
  showHeader?: boolean;
  maxHeight?: string;
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ 
  isCompact = false, 
  onClose,
  showHeader = true,
  maxHeight = '500px'
}) => {
  const {
    user,
    currentSession,
    messages,
    inputMessage,
    isLoading,
    isSending,
    selectedDocument,
    suggestions,
    messagesEndRef,
    inputRef,
    setInputMessage,
    sendMessage,
    handleKeyPress,
    useSuggestion,
    copyMessage,
    formatTime
  } = useChatLogic();

  return (
    <Card className="flex flex-col h-full">
      {/* Header */}
      {showHeader && (
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground">
                  <Bot className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">
                  {currentSession?.title || 'Escriba'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Assistente de Análise de Documentos
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {selectedDocument && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <FileText className="h-3 w-3" />
                  {selectedDocument.originalFileName}
                </Badge>
              )}
              {onClose && (
                <Button
                  onClick={onClose}
                  size="sm"
                  variant="ghost"
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
      )}

      {/* Área de Mensagens */}
      <CardContent className="flex-1 p-0 flex flex-col">
        <ScrollArea className={`flex-1 p-4`} style={{ maxHeight }}>
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
            <div className="space-y-4">
              {Array.isArray(messages) && messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${
                    message.role === 0 ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {message.role === 1 && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-primary text-primary-foreground">
                        <Bot className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 1
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">
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
                        className="h-6 w-6 p-0 opacity-70 hover:opacity-100"
                      >
                        <Copy className="h-3 w-3" />
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
                  
                  {message.role === 0 && (
                    <Avatar className="h-8 w-8 mt-1">
                      <AvatarFallback className="bg-secondary">
                        <User className="h-4 w-4" />
                      </AvatarFallback>
                    </Avatar>
                  )}
                </div>
              ))}
              
              {isSending && (
                <div className="flex gap-3 justify-start">
                  <Avatar className="h-8 w-8 mt-1">
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Escriba está pensando...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </ScrollArea>

        {/* Sugestões */}
        {Array.isArray(suggestions) && suggestions.length > 0 && Array.isArray(messages) && messages.length === 0 && (
          <div className="border-t p-4">
            <p className="text-sm text-muted-foreground mb-3">
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
        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={"Digite sua mensagem..."}
              className={`resize-none ${
                isCompact ? 'min-h-[40px] max-h-[80px]' : 'min-h-[60px] max-h-[120px]'
              }`}
              disabled={isSending}
            />
            <Button
              onClick={sendMessage}
              disabled={!inputMessage.trim() || isSending || !currentSession}
              size="sm"
              className={isCompact ? 'h-[40px] px-3' : 'h-[60px] px-4'}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};