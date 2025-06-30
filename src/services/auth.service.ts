import { AuthResponseDto, LoginDto, RegisterDto, UserInfoDto } from '@/types/api';
import { API_BASE_URL, BaseService } from './base.service';

class AuthService extends BaseService {

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

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
  }
}

export const authService = new AuthService();