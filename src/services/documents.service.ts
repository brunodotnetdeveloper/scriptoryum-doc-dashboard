import { UploadDocumentResponseDto } from '@/types/api';
import { API_BASE_URL, BaseService } from './base.service';

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
}

export const documentsService = new DocumentsService();