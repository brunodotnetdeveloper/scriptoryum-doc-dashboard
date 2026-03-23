import { UploadDocumentResponseDto, Document, DocumentDetails, AssociateDocumentTypeDto, DocumentTypeOperationResponseDto, DocumentFieldValueDto, ValidateFieldValueDto, ValidationResult } from '@/types/api';
import { API_BASE_URL, BaseService } from './base.service';

// URL da API de análise de documentos
// const ANALYSIS_API_BASE_URL = 'http://localhost:8000';
const ANALYSIS_API_BASE_URL = 'https://analysis-api.scriptoryum.cloud';

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

    // Alias method for compatibility
    async getDownloadUrl(id: number): Promise<string> {
        return this.getDocumentDownloadUrl(id);
    }

    async uploadDocument(file: File, description?: string, workspaceId?: number): Promise<UploadDocumentResponseDto> {
        const formData = new FormData();
        formData.append('File', file);
        if (description) {
            formData.append('Description', description);
        }
        if (workspaceId) {
            formData.append('WorkspaceId', workspaceId.toString());
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

    async getWorkspaceDocuments(workspaceId: number): Promise<any> {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/workspace/${workspaceId}/documents`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });
        return this.handleResponse<any>(response);
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

    async getDocuments(page: number = 1, pageSize: number = 10, searchTerm?: string, workspaceId?: number): Promise<{
        documents: Document[];
        totalCount: number;
        currentPage: number;
        totalPages: number;
    }> {
        const params = new URLSearchParams({
            page: page.toString(),
            pageSize: pageSize.toString(),
        });

        if (searchTerm) {
            params.append('searchTerm', searchTerm);
        }

        if (workspaceId) {
            params.append('workspaceId', workspaceId.toString());
        }

        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/account/documents?${params.toString()}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        return this.handleResponse<{
            documents: Document[];
            totalCount: number;
            currentPage: number;
            totalPages: number;
        }>(response);
    }

    // Document Type Association Methods
    async associateDocumentType(documentId: number, dto: AssociateDocumentTypeDto): Promise<DocumentTypeOperationResponseDto> {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/associate-type`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify(dto),
        });

        return this.handleResponse<DocumentTypeOperationResponseDto>(response);
    }

    async dissociateDocumentType(documentId: number): Promise<DocumentTypeOperationResponseDto> {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/dissociate-type`, {
            method: 'DELETE',
            headers: {
                'Accept': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        return this.handleResponse<DocumentTypeOperationResponseDto>(response);
    }

    async extractDocumentFields(documentId: number): Promise<DocumentTypeOperationResponseDto> {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/extract-fields`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify({}),
        });

        return this.handleResponse<DocumentTypeOperationResponseDto>(response);
    }

    async getDocumentFieldValues(documentId: number): Promise<DocumentFieldValueDto[]> {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/field-values`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
        });

        return this.handleResponse<DocumentFieldValueDto[]>(response);
    }

    async validateDocumentField(documentId: number, dto: ValidateFieldValueDto): Promise<ValidationResult> {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${API_BASE_URL}/api/documents/${documentId}/validate-field`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` }),
            },
            body: JSON.stringify(dto),
        });

        return this.handleResponse<ValidationResult>(response);
    }
}

export const documentsService = new DocumentsService();