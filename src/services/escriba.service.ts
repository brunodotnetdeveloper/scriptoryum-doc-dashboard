import { API_BASE_URL, BaseService } from './base.service';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  documentId?: number;
  documentName?: string;
}

export interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SendMessageRequest {
  message: string;
  sessionId?: string;
  documentId?: number;
  context?: string;
}

export interface SendMessageResponse {
  sessionId: string;
  messageId: string;
  response: string;
  suggestions?: string[];
}

export interface DocumentContext {
  id: number;
  name: string;
  content: string;
  entities?: any[];
  insights?: any[];
  risks?: any[];
}

class EscribaService extends BaseService {
  // Gerenciamento de sessões de chat
  async getChatSessions(): Promise<ChatSession[]> {
    const response = await fetch(`${API_BASE_URL}/api/escriba/sessions`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ChatSession[]>(response);
  }

  async createChatSession(title?: string): Promise<ChatSession> {
    const response = await fetch(`${API_BASE_URL}/api/escriba/sessions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ title: title || 'Nova Conversa' }),
    });
    return this.handleResponse<ChatSession>(response);
  }

  async getChatSession(sessionId: string): Promise<ChatSession> {
    const response = await fetch(`${API_BASE_URL}/api/escriba/sessions/${sessionId}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ChatSession>(response);
  }

  async deleteChatSession(sessionId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/escriba/sessions/${sessionId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse<void>(response);
  }

  async updateChatSessionTitle(sessionId: string, title: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/escriba/sessions/${sessionId}`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ title }),
    });
    await this.handleResponse<void>(response);
  }

  // Envio de mensagens
  async sendMessage(request: SendMessageRequest): Promise<SendMessageResponse> {
    const response = await fetch(`${API_BASE_URL}/api/escriba/chat`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });
    return this.handleResponse<SendMessageResponse>(response);
  }

  // Streaming de mensagens (para respostas em tempo real)
  async sendMessageStream(request: SendMessageRequest): Promise<ReadableStream<Uint8Array>> {
    const response = await fetch(`${API_BASE_URL}/api/escriba/chat/stream`, {
      method: 'POST',
      headers: {
        ...this.getAuthHeaders(),
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    return response.body!;
  }

  // Contexto de documentos
  async getDocumentContext(documentId: number): Promise<DocumentContext> {
    const response = await fetch(`${API_BASE_URL}/api/escriba/documents/${documentId}/context`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DocumentContext>(response);
  }

  async getDocumentSummary(documentId: number): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/escriba/documents/${documentId}/summary`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const data = await this.handleResponse<{ summary: string }>(response);
    return data.summary;
  }

  // Sugestões e comandos rápidos
  async getSuggestions(context?: string): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/api/escriba/suggestions`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ context }),
    });
    const data = await this.handleResponse<{ suggestions: string[] }>(response);
    return data.suggestions;
  }

  // Análise de documentos via chat
  async analyzeDocument(documentId: number, analysisType: string): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/escriba/analyze`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ documentId, analysisType }),
    });
    const data = await this.handleResponse<{ analysis: string }>(response);
    return data.analysis;
  }

  // Comparação de documentos
  async compareDocuments(documentIds: number[]): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/escriba/compare`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ documentIds }),
    });
    const data = await this.handleResponse<{ comparison: string }>(response);
    return data.comparison;
  }

  // Busca semântica em documentos
  async searchDocuments(query: string, documentIds?: number[]): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/escriba/search`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ query, documentIds }),
    });
    const data = await this.handleResponse<{ results: any[] }>(response);
    return data.results;
  }
}

export const escribaService = new EscribaService();