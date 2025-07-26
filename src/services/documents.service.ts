import { UploadDocumentResponseDto } from '@/types/api';
import { API_BASE_URL, BaseService } from './base.service';

// URL da API de análise de documentos
// const ANALYSIS_API_BASE_URL = 'http://localhost:8000';
const ANALYSIS_API_BASE_URL = 'https://analysis-api.scriptoryum.com.br';

class DocumentsService extends BaseService {
    async getDocumentDetails(id: number): Promise<any> {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/documents/${id}/details`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });
        return this.handleResponse<any>(response);
    }

    async getDocumentDownloadUrl(id: number): Promise<string> {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/documents/${id}/download-url`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });
        const data = await this.handleResponse<any>(response);
        return data.url;
    }

    async uploadDocument(file: File, description?: string): Promise<UploadDocumentResponseDto> {
        const formData = new FormData();
        formData.append('File', file);
        if (description) {
            formData.append('Description', description);
        }

        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/documents/upload`, {
            method: 'POST',
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: formData,
        });

        return this.handleResponse<UploadDocumentResponseDto>(response);
    }

    // Métodos para análise de documentos
    async startDocumentAnalysis(documentId: number, force: boolean = false): Promise<any> {
        const response = await fetch(`${ANALYSIS_API_BASE_URL}/analyze/${documentId}?force=${force}`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ detail: 'Erro desconhecido' }));
            
            if (response.status === 409) {
                // Handle 409 Conflict specifically
                throw new Error(errorData.detail || 'Conflito na análise do documento');
            }
            
            throw new Error(errorData.detail || errorData.message || `HTTP ${response.status}`);
        }

        return response.json();
    }

    async getAnalysisStatus(documentId: number): Promise<any> {
        const response = await fetch(`${ANALYSIS_API_BASE_URL}/status/${documentId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        return this.handleResponse<any>(response);
    }

    async getAnalysisResults(documentId: number): Promise<any> {
        const response = await fetch(`${ANALYSIS_API_BASE_URL}/results/${documentId}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        return this.handleResponse<any>(response);
    }
}

export const documentsService = new DocumentsService();