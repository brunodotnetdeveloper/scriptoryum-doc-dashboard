import { 
  WorkspaceDto, 
  CreateWorkspaceDto, 
  UpdateWorkspaceDto,
  WorkspaceUserDto,
  AddUserToWorkspaceDto,
  UpdateWorkspaceUserDto,
  WorkspaceAIProviderConfigDto,
  CreateWorkspaceAIProviderConfigDto,
  UpdateWorkspaceAIProviderConfigDto,
  TestWorkspaceAIProviderConfigDto
} from '../types/api';
import { BaseService, API_BASE_URL } from './base.service';

class WorkspaceService extends BaseService {

  // Workspace Management
  async getAllWorkspaces(): Promise<WorkspaceDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/workspace`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<WorkspaceDto[]>(response);
  }

  async getWorkspaceById(id: number): Promise<WorkspaceDto> {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<WorkspaceDto>(response);
  }

  async createWorkspace(workspace: CreateWorkspaceDto): Promise<WorkspaceDto> {
    const response = await fetch(`${API_BASE_URL}/api/workspace`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(workspace)
    });
    return this.handleResponse<WorkspaceDto>(response);
  }

  async updateWorkspace(id: number, workspace: UpdateWorkspaceDto): Promise<WorkspaceDto> {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(workspace)
    });
    return this.handleResponse<WorkspaceDto>(response);
  }

  async deleteWorkspace(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    await this.handleResponse<void>(response);
  }

  async getMyWorkspaces(): Promise<WorkspaceDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/workspace/my-workspaces`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<WorkspaceDto[]>(response);
  }

  // Workspace Users Management
  async getWorkspaceUsers(workspaceId: number): Promise<WorkspaceUserDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${workspaceId}/users`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<WorkspaceUserDto[]>(response);
  }

  async addUserToWorkspace(workspaceId: number, userDto: Omit<AddUserToWorkspaceDto, 'workspaceId'>): Promise<WorkspaceUserDto> {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${workspaceId}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ ...userDto, workspaceId })
    });
    return this.handleResponse<WorkspaceUserDto>(response);
  }

  async updateWorkspaceUser(workspaceId: number, userId: string, updateDto: UpdateWorkspaceUserDto): Promise<WorkspaceUserDto> {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${workspaceId}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(updateDto)
    });
    return this.handleResponse<WorkspaceUserDto>(response);
  }

  async removeUserFromWorkspace(workspaceId: number, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${workspaceId}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    await this.handleResponse<void>(response);
  }

  // Workspace AI Provider Configurations
  async getWorkspaceAIConfigs(workspaceId: number): Promise<WorkspaceAIProviderConfigDto[]> {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${workspaceId}/ai-configs`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<WorkspaceAIProviderConfigDto[]>(response);
  }

  async createWorkspaceAIConfig(config: CreateWorkspaceAIProviderConfigDto): Promise<WorkspaceAIProviderConfigDto> {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${config.workspaceId}/ai-configs`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config)
    });
    return this.handleResponse<WorkspaceAIProviderConfigDto>(response);
  }

  async updateWorkspaceAIConfig(workspaceId: number, configId: number, config: UpdateWorkspaceAIProviderConfigDto): Promise<WorkspaceAIProviderConfigDto> {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${workspaceId}/ai-configs/${configId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config)
    });
    return this.handleResponse<WorkspaceAIProviderConfigDto>(response);
  }

  async deleteWorkspaceAIConfig(workspaceId: number, configId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${workspaceId}/ai-configs/${configId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    await this.handleResponse<void>(response);
  }

  async testWorkspaceAIConfig(config: TestWorkspaceAIProviderConfigDto): Promise<{ success: boolean; message: string }> {
    const response = await fetch(`${API_BASE_URL}/api/workspace/${config.workspaceId}/ai-configs/test`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(config)
    });
    return this.handleResponse<{ success: boolean; message: string }>(response);
  }
}

export const workspaceService = new WorkspaceService();
export default workspaceService;