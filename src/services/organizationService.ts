import { API_BASE_URL, BaseService } from './base.service';
import {
  OrganizationDto,
  OrganizationUserDto,
  CreateOrganizationDto,
  UpdateOrganizationDto,
  AddUserToOrganizationDto,
  UpdateOrganizationUserDto,
  WorkspaceDto
} from '@/types/api';

// Type aliases for backward compatibility
export type Organization = OrganizationDto;
export type OrganizationUser = OrganizationUserDto;
export type Workspace = WorkspaceDto;

class OrganizationService extends BaseService {
  // Organization API functions
  async getAllOrganizations(): Promise<Organization[]> {
    const response = await fetch(`${API_BASE_URL}/api/organization`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<Organization[]>(response);
  }

  async getOrganizationById(id: number): Promise<Organization> {
    const response = await fetch(`${API_BASE_URL}/api/organization/${id}`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<Organization>(response);
  }

  async getMyOrganizations(): Promise<Organization[]> {
    const response = await fetch(`${API_BASE_URL}/api/organization/my`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<Organization[]>(response);
  }

  async createOrganization(organizationData: CreateOrganizationDto): Promise<Organization> {
    const response = await fetch(`${API_BASE_URL}/api/organization`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(organizationData)
    });
    return this.handleResponse<Organization>(response);
  }

  async updateOrganization(id: number, organizationData: UpdateOrganizationDto): Promise<Organization> {
    const response = await fetch(`${API_BASE_URL}/api/organization/${id}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(organizationData)
    });
    return this.handleResponse<Organization>(response);
  }

  async deleteOrganization(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/organization/${id}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    await this.handleResponse<void>(response);
  }

  // Organization Users API functions
  async getOrganizationUsers(organizationId: number): Promise<OrganizationUser[]> {
    const response = await fetch(`${API_BASE_URL}/api/organization/${organizationId}/users`, {
      headers: this.getAuthHeaders()
    });
    return this.handleResponse<OrganizationUser[]>(response);
  }

  async addUserToOrganization(organizationId: number, userData: AddUserToOrganizationDto): Promise<OrganizationUser> {
    const response = await fetch(`${API_BASE_URL}/api/organization/${organizationId}/users`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<OrganizationUser>(response);
  }

  async updateOrganizationUser(organizationId: number, userId: string, userData: UpdateOrganizationUserDto): Promise<OrganizationUser> {
    const response = await fetch(`${API_BASE_URL}/api/organization/${organizationId}/users/${userId}`, {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(userData)
    });
    return this.handleResponse<OrganizationUser>(response);
  }

  async removeUserFromOrganization(organizationId: number, userId: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/organization/${organizationId}/users/${userId}`, {
      method: 'DELETE',
      headers: this.getAuthHeaders()
    });
    await this.handleResponse<void>(response);
  }

  // Helper function to create organization with workspace
  async createOrganizationWithWorkspace(organizationData: CreateOrganizationDto, workspaceName: string): Promise<{ organization: Organization; workspace: Workspace }> {
    // First create the organization
    const organization = await this.createOrganization(organizationData);
    
    // Then create a workspace for the organization
    const workspaceResponse = await fetch(`${API_BASE_URL}/api/workspace`, {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({
        name: workspaceName,
        description: `Workspace principal para ${organization.name}`,
        organizationId: organization.id
      })
    });
    
    const workspace = await this.handleResponse<Workspace>(workspaceResponse);
    
    return {
      organization,
      workspace
    };
  }
}

// Export singleton instance
export const organizationService = new OrganizationService();

// Export individual functions for backward compatibility
export const getAllOrganizations = () => organizationService.getAllOrganizations();
export const getOrganizationById = (id: number) => organizationService.getOrganizationById(id);
export const getMyOrganizations = () => organizationService.getMyOrganizations();
export const createOrganization = (data: CreateOrganizationDto) => organizationService.createOrganization(data);
export const updateOrganization = (id: number, data: UpdateOrganizationDto) => organizationService.updateOrganization(id, data);
export const deleteOrganization = (id: number) => organizationService.deleteOrganization(id);
export const getOrganizationUsers = (organizationId: number) => organizationService.getOrganizationUsers(organizationId);
export const addUserToOrganization = (organizationId: number, userData: AddUserToOrganizationDto) => organizationService.addUserToOrganization(organizationId, userData);
export const updateOrganizationUser = (organizationId: number, userId: string, userData: UpdateOrganizationUserDto) => organizationService.updateOrganizationUser(organizationId, userId, userData);
export const removeUserFromOrganization = (organizationId: number, userId: string) => organizationService.removeUserFromOrganization(organizationId, userId);
export const createOrganizationWithWorkspace = (organizationData: CreateOrganizationDto, workspaceName: string) => organizationService.createOrganizationWithWorkspace(organizationData, workspaceName);