import { UserInfoDto, UpdateProfileDto, ChangePasswordDto } from '@/types/api';
import { API_BASE_URL, BaseService } from './base.service';
import { UserDocumentsResponse } from '@/types/api';

class AccountService extends BaseService {

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

  async getUserDocuments(): Promise<UserDocumentsResponse> {
    const response = await fetch(`${API_BASE_URL}/api/Account/documents`, {
      method: 'GET',
      headers: this.getAuthHeaders(),
    });
    
    return this.handleResponse<UserDocumentsResponse>(response);
  }
}

export const accountService = new AccountService();