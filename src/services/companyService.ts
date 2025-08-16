import { 
  CompanyDto, 
  CreateCompanyDto, 
  UpdateCompanyDto,
  CompanyUserDto,
  AddUserToCompanyDto,
  UpdateCompanyUserDto,
  CompanyAIProviderConfigDto,
  CreateCompanyAIProviderConfigDto,
  UpdateCompanyAIProviderConfigDto,
  TestCompanyAIProviderConfigDto
} from '../types/api';
import { BaseService, API_BASE_URL } from './base.service';

class CompanyService extends BaseService {

  // Company Management
  async getAllCompanies(): Promise<CompanyDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/company`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<CompanyDto[]>(response);
  }

  async getCompanyById(id: number): Promise<CompanyDto> {
    const response = await fetch(`${API_BASE_URL}/api/company/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<CompanyDto>(response);
  }

  async createCompany(company: CreateCompanyDto): Promise<CompanyDto> {
    const response = await fetch(`${API_BASE_URL}/api/company`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(company)
    });
    return this.handleResponse<CompanyDto>(response);
  }

  async updateCompany(id: number, company: UpdateCompanyDto): Promise<CompanyDto> {
    const response = await fetch(`${API_BASE_URL}/api/company/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(company)
    });
    return this.handleResponse<CompanyDto>(response);
  }

  async deleteCompany(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/company/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    await this.handleResponse<void>(response);
  }

  async getMyCompanies(): Promise<CompanyDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/company/my-companies`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<CompanyDto[]>(response);
  }

  // Company Users Management
  async getCompanyUsers(companyId: number): Promise<CompanyUserDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/company/${companyId}/users`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<CompanyUserDto[]>(response);
  }

  async addUserToCompany(companyId: number, userDto: Omit<AddUserToCompanyDto, 'companyId'>): Promise<CompanyUserDto> {
    const response = await fetch(`${API_BASE_URL}/api/company/${companyId}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ ...userDto, companyId })
    });
    return this.handleResponse<CompanyUserDto>(response);
  }

  async updateCompanyUser(companyId: number, userId: string, updateDto: UpdateCompanyUserDto): Promise<CompanyUserDto> {
    const response = await fetch(`${API_BASE_URL}/api/company/${companyId}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateDto)
    });
    return this.handleResponse<CompanyUserDto>(response);
  }

  async removeUserFromCompany(companyId: number, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/company/${companyId}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    await this.handleResponse<void>(response);
  }

  // Company AI Provider Configurations (placeholder for future implementation)
  async getCompanyAIConfigs(companyId: number): Promise<CompanyAIProviderConfigDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/company/${companyId}/ai-configs`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<CompanyAIProviderConfigDto[]>(response);
  }

  async createCompanyAIConfig(config: CreateCompanyAIProviderConfigDto): Promise<CompanyAIProviderConfigDto> {
    const response = await fetch(`${API_BASE_URL}/api/company/${config.companyId}/ai-configs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config)
    });
    return this.handleResponse<CompanyAIProviderConfigDto>(response);
  }

  async updateCompanyAIConfig(companyId: number, configId: number, config: UpdateCompanyAIProviderConfigDto): Promise<CompanyAIProviderConfigDto> {
    const response = await fetch(`${API_BASE_URL}/api/company/${companyId}/ai-configs/${configId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config)
    });
    return this.handleResponse<CompanyAIProviderConfigDto>(response);
  }

  async deleteCompanyAIConfig(companyId: number, configId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/company/${companyId}/ai-configs/${configId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    await this.handleResponse<void>(response);
  }

  async testCompanyAIConfig(config: TestCompanyAIProviderConfigDto): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/company/${config.companyId}/ai-configs/test`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config)
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }
}

export const companyService = new CompanyService();
export default companyService;