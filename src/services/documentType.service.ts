import { API_BASE_URL, BaseService } from './base.service';
import {
  DocumentTypeDto,
  CreateDocumentTypeDto,
  UpdateDocumentTypeDto,
  DocumentTypeFieldDto,
  CreateDocumentTypeFieldDto,
  UpdateDocumentTypeFieldDto,
  DocumentTypeTemplateDto,
  CreateDocumentTypeTemplateDto,
  ApplyTemplateDto,
  AssociateDocumentTypeDto,
  DocumentFieldValueDto,
  ValidateFieldValueDto,
  DocumentTypeOperationResponseDto,
  ValidationResult,
  mapDocumentTypeFromApi
} from '@/types/api';

class DocumentTypeService extends BaseService {
  // CRUD de Tipos de Documentos
  async getDocumentTypes(): Promise<DocumentTypeDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype?includeInactive=true`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const data = await this.handleResponse<any[]>(response);
    return data.map(mapDocumentTypeFromApi);
  }

  async getDocumentType(id: number): Promise<DocumentTypeDto> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const data = await this.handleResponse<any>(response);
    return mapDocumentTypeFromApi(data);
  }

  async createDocumentType(dto: CreateDocumentTypeDto): Promise<DocumentTypeDto> {
    // Convert isActive boolean to status string for API
    const apiDto = {
      ...dto,
      status: dto.isActive !== false ? 'Active' : 'Inactive'
    };
    // Remove isActive from the payload since API expects status
    delete (apiDto as any).isActive;
    
    const response = await fetch(`${API_BASE_URL}/api/documenttype`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(apiDto),
    });
    const data = await this.handleResponse<any>(response);
    return mapDocumentTypeFromApi(data);
  }

  async updateDocumentType(id: number, dto: UpdateDocumentTypeDto): Promise<DocumentTypeDto> {
    // Convert isActive boolean to status string for API
    const apiDto = {
      ...dto,
      status: dto.isActive ? 'Active' : 'Inactive'
    };
    // Remove isActive from the payload since API expects status
    delete (apiDto as any).isActive;
    
    const response = await fetch(`${API_BASE_URL}/api/documenttype/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(apiDto),
    });
    const data = await this.handleResponse<any>(response);
    return mapDocumentTypeFromApi(data);
  }

  async deleteDocumentType(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse<void>(response);
  }

  async canDeleteDocumentType(id: number): Promise<{ canDelete: boolean; reason?: string }> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/${id}/can-delete`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<{ canDelete: boolean; reason?: string }>(response);
  }

  // Gestão de Campos
  async addField(documentTypeId: number, dto: CreateDocumentTypeFieldDto): Promise<DocumentTypeFieldDto> {
    // Convert frontend format to API format
    const apiDto = {
      ...dto,
      fieldOrder: dto.displayOrder, // Frontend usa displayOrder, API espera fieldOrder
      status: dto.isActive !== false ? 'Active' : 'Inactive' // Frontend usa isActive, API espera status
    };
    // Remove frontend-specific fields
    delete (apiDto as any).displayOrder;
    delete (apiDto as any).isActive;
    
    const response = await fetch(`${API_BASE_URL}/api/documenttype/${documentTypeId}/fields`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(apiDto),
    });
    const data = await this.handleResponse<any>(response);
    // Map response back to frontend format
    return {
      ...data,
      displayOrder: data.fieldOrder,
      isActive: data.status === 'Active'
    };
  }

  async updateField(documentTypeId: number, fieldId: number, dto: UpdateDocumentTypeFieldDto): Promise<DocumentTypeFieldDto> {
    // Convert frontend format to API format
    const apiDto = {
      ...dto,
      fieldOrder: dto.displayOrder, // Frontend usa displayOrder, API espera fieldOrder
      status: dto.isActive !== false ? 'Active' : 'Inactive' // Frontend usa isActive, API espera status
    };
    // Remove frontend-specific fields
    delete (apiDto as any).displayOrder;
    delete (apiDto as any).isActive;
    
    const response = await fetch(`${API_BASE_URL}/api/documenttype/${documentTypeId}/fields/${fieldId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(apiDto),
    });
    const data = await this.handleResponse<any>(response);
    // Map response back to frontend format
    return {
      ...data,
      displayOrder: data.fieldOrder,
      isActive: data.status === 'Active'
    };
  }

  async removeField(documentTypeId: number, fieldId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/${documentTypeId}/fields/${fieldId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse<void>(response);
  }

  async reorderFields(documentTypeId: number, fieldOrders: { fieldId: number; displayOrder: number }[]): Promise<void> {
    // Convert frontend format to API format
    const apiFieldOrders = fieldOrders.map(order => ({
      fieldId: order.fieldId,
      fieldOrder: order.displayOrder // Frontend usa displayOrder, API espera fieldOrder
    }));
    
    const response = await fetch(`${API_BASE_URL}/api/documenttype/${documentTypeId}/fields/reorder`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(apiFieldOrders),
    });
    await this.handleResponse<void>(response);
  }

  // Associação de Documentos
  async associateDocument(dto: AssociateDocumentTypeDto): Promise<DocumentTypeOperationResponseDto> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/associate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    return this.handleResponse<DocumentTypeOperationResponseDto>(response);
  }

  async changeDocumentType(documentId: number, newDocumentTypeId: number): Promise<DocumentTypeOperationResponseDto> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/change`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ documentId, newDocumentTypeId }),
    });
    return this.handleResponse<DocumentTypeOperationResponseDto>(response);
  }

  async removeDocumentAssociation(documentId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/remove-association/${documentId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse<void>(response);
  }

  // Extração e Validação de Campos
  async getDocumentFieldValues(documentId: number): Promise<DocumentFieldValueDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/documents/${documentId}/field-values`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DocumentFieldValueDto[]>(response);
  }

  async triggerFieldExtraction(documentId: number): Promise<DocumentTypeOperationResponseDto> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/documents/${documentId}/extract-fields`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DocumentTypeOperationResponseDto>(response);
  }

  async validateFieldValue(dto: ValidateFieldValueDto): Promise<ValidationResult> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/validate-field`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    return this.handleResponse<ValidationResult>(response);
  }

  async validateAllFieldValues(documentId: number): Promise<ValidationResult[]> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/documents/${documentId}/validate-all`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<ValidationResult[]>(response);
  }

  // Consultas e Relatórios
  async searchDocumentTypes(searchTerm: string): Promise<DocumentTypeDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const data = await this.handleResponse<any[]>(response);
    return data.map(mapDocumentTypeFromApi);
  }

  async getDocumentTypeStatistics(id: number): Promise<Record<string, any>> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/${id}/statistics`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Record<string, any>>(response);
  }

  async getMostUsedDocumentTypes(limit: number = 10): Promise<DocumentTypeDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/documenttype/most-used?limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    const data = await this.handleResponse<any[]>(response);
    return data.map(mapDocumentTypeFromApi);
  }
}

class DocumentTypeTemplateService extends BaseService {
  // CRUD de Templates
  async getTemplates(includePublic: boolean = true): Promise<DocumentTypeTemplateDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate?includePublic=${includePublic}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DocumentTypeTemplateDto[]>(response);
  }

  async getTemplate(id: number): Promise<DocumentTypeTemplateDto> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DocumentTypeTemplateDto>(response);
  }

  async createTemplate(dto: CreateDocumentTypeTemplateDto): Promise<DocumentTypeTemplateDto> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    return this.handleResponse<DocumentTypeTemplateDto>(response);
  }

  async updateTemplate(id: number, dto: CreateDocumentTypeTemplateDto): Promise<DocumentTypeTemplateDto> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    return this.handleResponse<DocumentTypeTemplateDto>(response);
  }

  async deleteTemplate(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse<void>(response);
  }

  // Aplicação de Templates
  async applyTemplate(id: number, dto: ApplyTemplateDto): Promise<DocumentTypeDto> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/${id}/apply`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(dto),
    });
    const data = await this.handleResponse<any>(response);
    return mapDocumentTypeFromApi(data);
  }

  async createTemplateFromDocumentType(
    documentTypeId: number,
    templateName: string,
    templateDescription?: string,
    category?: string,
    isPublic: boolean = false
  ): Promise<DocumentTypeTemplateDto> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/from-document-type/${documentTypeId}`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        templateName,
        templateDescription,
        category,
        isPublic,
      }),
    });
    return this.handleResponse<DocumentTypeTemplateDto>(response);
  }

  // Gestão de Templates Públicos/Privados
  async getPublicTemplates(): Promise<DocumentTypeTemplateDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/public`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DocumentTypeTemplateDto[]>(response);
  }

  async makeTemplatePublic(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/${id}/make-public`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse<void>(response);
  }

  async makeTemplatePrivate(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/${id}/make-private`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });
    await this.handleResponse<void>(response);
  }

  async duplicateTemplate(id: number, newName: string): Promise<DocumentTypeTemplateDto> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/${id}/duplicate`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ newName }),
    });
    return this.handleResponse<DocumentTypeTemplateDto>(response);
  }

  // Consultas e Relatórios
  async getTemplatesByCategory(category: string): Promise<DocumentTypeTemplateDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/category/${encodeURIComponent(category)}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DocumentTypeTemplateDto[]>(response);
  }

  async getCategories(): Promise<string[]> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/categories`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<string[]>(response);
  }

  async searchTemplates(searchTerm: string): Promise<DocumentTypeTemplateDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/search?searchTerm=${encodeURIComponent(searchTerm)}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DocumentTypeTemplateDto[]>(response);
  }

  async getTemplateStatistics(id: number): Promise<Record<string, any>> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/${id}/statistics`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<Record<string, any>>(response);
  }

  async getMostUsedTemplates(limit: number = 10): Promise<DocumentTypeTemplateDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/documenttypetemplate/most-used?limit=${limit}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    return this.handleResponse<DocumentTypeTemplateDto[]>(response);
  }
}

export const documentTypeService = new DocumentTypeService();
export const documentTypeTemplateService = new DocumentTypeTemplateService();