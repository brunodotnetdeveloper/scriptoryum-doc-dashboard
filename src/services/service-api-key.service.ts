import { API_BASE_URL, BaseService } from './base.service';

export interface ServiceApiKey {
  id: string;
  serviceName: string;
  description?: string;
  keyPrefix: string;
  keySuffix: string;
  status: 'Active' | 'Inactive' | 'Revoked' | 'Expired' | 'Suspended';
  expiresAt?: string;
  lastUsedAt?: string;
  usageCount: number;
  monthlyUsageLimit?: number;
  currentMonthUsage: number;
  currentMonthYear: string;
  permissions?: string;
  allowedIPs?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateApiKeyRequest {
  serviceName: string;
  description?: string;
  expiresAt?: string;
  monthlyUsageLimit?: number;
  permissions?: string;
  allowedIPs?: string;
}

export interface CreateApiKeyResponse {
  id: string;
  serviceName: string;
  description?: string;
  apiKey: string; // Retornado apenas na criação
  keyPrefix: string;
  keySuffix: string;
  status: string;
  expiresAt?: string;
  monthlyUsageLimit?: number;
  permissions?: string;
  allowedIPs?: string;
  createdAt: string;
}

export interface UpdateApiKeyRequest {
  serviceName?: string;
  description?: string;
  expiresAt?: string;
  monthlyUsageLimit?: number;
  permissions?: string;
  allowedIPs?: string;
  status: 'Active' | 'Inactive' | 'Revoked' | 'Expired' | 'Suspended';
}

export interface ApiKeyUsageStats {
  totalKeys: number;
  activeKeys: number;
  totalUsageThisMonth: number;
  keysNearLimit: number;
}

class ServiceApiKeyService extends BaseService {
  private readonly baseUrl = `${API_BASE_URL}/api/ServiceApiKey`;

  async createApiKey(request: CreateApiKeyRequest): Promise<CreateApiKeyResponse> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<CreateApiKeyResponse>(response);
  }

  async getApiKeys(): Promise<ServiceApiKey[]> {
    const response = await fetch(this.baseUrl, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ServiceApiKey[]>(response);
  }

  async getApiKey(id: string): Promise<ServiceApiKey> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });

    return this.handleResponse<ServiceApiKey>(response);
  }

  async updateApiKey(id: string, request: UpdateApiKeyRequest): Promise<ServiceApiKey> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(request),
    });

    return this.handleResponse<ServiceApiKey>(response);
  }

  async revokeApiKey(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}/revoke`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
  }

  async getUsageStats(): Promise<ApiKeyUsageStats> {
    const keys = await this.getApiKeys();
    
    const totalKeys = keys.length;
    const activeKeys = keys.filter(k => k.status === 'Active').length;
    const totalUsageThisMonth = keys.reduce((sum, k) => sum + k.currentMonthUsage, 0);
    const keysNearLimit = keys.filter(k => 
      k.monthlyUsageLimit && 
      k.currentMonthUsage >= k.monthlyUsageLimit * 0.8
    ).length;

    return {
      totalKeys,
      activeKeys,
      totalUsageThisMonth,
      keysNearLimit
    };
  }

  // Utilitários
  formatPermissions(permissions?: string): string[] {
    if (!permissions) return [];
    return permissions.split(',').map(p => p.trim());
  }

  formatAllowedIPs(allowedIPs?: string): string[] {
    if (!allowedIPs) return [];
    return allowedIPs.split(',').map(ip => ip.trim());
  }

  getStatusColor(status: string): string {
    switch (status) {
      case 'Active': return 'text-green-600 bg-green-100';
      case 'Inactive': return 'text-gray-600 bg-gray-100';
      case 'Revoked': return 'text-red-600 bg-red-100';
      case 'Expired': return 'text-orange-600 bg-orange-100';
      case 'Suspended': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'Active': return 'Ativa';
      case 'Inactive': return 'Inativa';
      case 'Revoked': return 'Revogada';
      case 'Expired': return 'Expirada';
      case 'Suspended': return 'Suspensa';
      default: return status;
    }
  }

  formatUsagePercentage(current: number, limit?: number): string {
    if (!limit) return 'Sem limite';
    const percentage = (current / limit) * 100;
    return `${percentage.toFixed(1)}%`;
  }

  isNearLimit(current: number, limit?: number): boolean {
    if (!limit) return false;
    return current >= limit * 0.8;
  }
}

export const serviceApiKeyService = new ServiceApiKeyService();