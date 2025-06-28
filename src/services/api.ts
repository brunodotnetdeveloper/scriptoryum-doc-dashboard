
import { 
  AuthResponseDto, 
  LoginDto, 
  RegisterDto, 
  UserInfoDto, 
  UpdateProfileDto, 
  ChangePasswordDto,
  UploadDocumentResponseDto 
} from '@/types/api';

const API_BASE_URL = 'https://api.scriptoryum.com'; // Substitua pela URL real da API

class ApiService {
  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('authToken');
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
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

  // Auth endpoints
  async login(credentials: LoginDto): Promise<AuthResponseDto> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    
    const result = await this.handleResponse<AuthResponseDto>(response);
    
    if (result.success && result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    
    return result;
  }

  async register(userData: RegisterDto): Promise<AuthResponseDto> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    
    const result = await this.handleResponse<AuthResponseDto>(response);
    
    if (result.success && result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('user', JSON.stringify(result.user));
    }
    
    return result;
  }

  async refreshToken(token: string): Promise<AuthResponseDto> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/refresh-token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(token),
    });
    
    return this.handleResponse<AuthResponseDto>(response);
  }

  async getMe(): Promise<UserInfoDto> {
    const response = await fetch(`${API_BASE_URL}/api/Auth/me`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<UserInfoDto>(response);
  }

  async validateToken(): Promise<boolean> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/Auth/validate-token`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return response.ok;
    } catch {
      return false;
    }
  }

  // Account endpoints
  async getProfile(): Promise<UserInfoDto> {
    const response = await fetch(`${API_BASE_URL}/api/Account/profile`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<UserInfoDto>(response);
  }

  async updateProfile(profileData: UpdateProfileDto): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Account/profile`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(profileData),
    });
    
    await this.handleResponse<void>(response);
  }

  async changePassword(passwordData: ChangePasswordDto): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Account/change-password`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(passwordData),
    });
    
    await this.handleResponse<void>(response);
  }

  async deleteAccount(password: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/Account/delete-account`, {
      method: 'DELETE',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(password),
    });
    
    await this.handleResponse<void>(response);
  }

  async getUserDocuments(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/api/Account/documents`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<any[]>(response);
  }

  // Documents endpoints
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

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

export const apiService = new ApiService();
