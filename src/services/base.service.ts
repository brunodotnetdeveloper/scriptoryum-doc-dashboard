export const API_BASE_URL = 'https://api.scriptoryum.com.br';
// export const API_BASE_URL = 'https://localhost:7020';

export abstract class BaseService {
  protected getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  protected async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Erro desconhecido' }));
      throw new Error(errorData.message || `HTTP ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    
    return response.text() as unknown as T;
  }
}