
export interface UserInfoDto {
  id?: string;
  userName?: string;
  email?: string;
  emailConfirmed: boolean;
  roles?: string[];
  workspaces?: WorkspaceUserDto[];
  currentWorkspaceId?: number;
  currentWorkspaceName?: string;
  // Organization properties (now directly in user)
  organizationId?: number;
  organizationName?: string;
  organizationRole?: OrganizationRole;
  organizationStatus?: OrganizationUserStatus;
  joinedAt?: string;
  removedAt?: string;
}

export interface AuthResponseDto {
  success: boolean;
  message?: string;
  token?: string;
  tokenExpiration?: string;
  user?: UserInfoDto;
  errors?: string[];
}

export interface LoginDto {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterDto {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface UpdateProfileDto {
  userName: string;
  email: string;
}

export interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export interface UploadDocumentResponseDto {
  documentId?: number;
  message?: string;
  success: boolean;
}

// Add other API related types here

export type DocumentStatus =
  | 'Uploaded'
  | 'Queued'
  | 'ExtractingText'
  | 'AnalyzingContent'
  | 'Processed'
  | 'Analyzed'
  | 'TextExtractionFailed'
  | 'ContentAnalysisFailed'
  | 'Failed'
  | 'Cancelled'
  | 'PartiallyProcessed'
  | 'EntitiesExtractionFailed'
  | 'RisksAnalysisFailed'
  | 'InsightsGenerationFailed';

export interface Document {
  id: number;
  originalFileName: string;
  description: string | null;
  fileType: string;
  fileName: string;
  storagePath: string;
  fileSize: number;
  status: DocumentStatus;
  uploadedAt: string;
  uploadedByUserId: string;
}

export interface UserDocumentsResponse {
  documents: Document[];
  count: number;
}

export interface DocumentDetails {
  id: number;
  originalFileName: string;
  description: string | null;
  fileType: number;
  fileName: string;
  storagePath: string;
  fileSize: number;
  status: string;
  uploadedAt: string;
  uploadedByUserId: string;
  textExtracted: string;
  extractedEntities: ExtractedEntity[];
  risksDetected: RiskDetected[];
  insights: Insight[];
  timelineEvents: TimelineEvent[];
}

export interface ExtractedEntity {
  id: number;
  value: string;
  entityType: number;
  entityTypeText: string;
  confidenceScore: number;
}

export interface RiskDetected {
  id: number;
  type: string;
  description: string;
  severity: string;
  riskLevel: number;
}

export interface Insight {
  id: number;
  title: string;
  description: string;
  category: number;
  categoryText: string;
}

export interface TimelineEvent {
  title: string;
  timestamp: string;
  description: string;
}

// AI Configuration Types
export type AIProvider = 'OpenAI' | 'Claude' | 'Gemini';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  costPer1kTokens: number;
}

export interface AIProviderConfig {
  id?: number;
  provider: AIProvider;
  apiKey: string;
  selectedModel: string;
  isEnabled: boolean;
  lastTestResult?: boolean | null;
  lastTestMessage?: string;
  lastTestedAt?: string | null;
}

export interface AIConfiguration {
  id: number;
  userId: string;
  providers: string[];
  defaultProvider: AIProvider;
  createdAt: string;
  updatedAt: string;
}

export interface AIConfigurationResponse {
  success: boolean;
  configuration?: AIConfiguration;
  message?: string;
  errors?: string[];
}

export interface UpdateAIConfigurationDto {
  defaultProvider: AIProvider;
  providers: AIProviderConfig[];
}

export interface TestApiKeyDto {
  provider: AIProvider;
  apiKey: string;
}

export interface TestApiKeyResponse {
  success: boolean;
  message: string;
  errors?: string[];
}

// Workspace Management Types
export type WorkspaceStatus = 'Active' | 'Inactive' | 'Suspended' | 'Cancelled';
export enum WorkspaceUserRole {
  Viewer = 0,
  Member = 1,
  Admin = 2
}
export type WorkspaceUserStatus = 'Active' | 'Inactive' | 'Suspended' | 'Removed' | 'PendingInvitation';

export interface WorkspaceDto {
  id: number;
  name: string;
  description?: string;
  cnpj?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  status: WorkspaceStatus;
  createdAt: string;
  users?: WorkspaceUserDto[];
  aiProviderConfigs?: WorkspaceAIProviderConfigDto[];
}

export interface CreateWorkspaceDto {
  name: string;
  status?: string;
  description?: string;
  cnpj?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
}

export interface UpdateWorkspaceDto {
  name: string;
  cnpj?: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  status: WorkspaceStatus;
}

export interface WorkspaceUserDto {
  user: UserInfoDto;
  id: number;
  workspaceId: number;
  workspaceName: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: string;
  status: WorkspaceUserStatus;
  joinedAt: string;
  removedAt?: string;
}

export interface AddUserToWorkspaceDto {
  workspaceId: number;
  userEmail: string;
  role: string;
}

export interface UpdateWorkspaceUserDto {
  role: string;
  status: WorkspaceUserStatus;
}

export interface UserWorkspacesDto {
  workspaces: WorkspaceUserDto[];
}

export interface WorkspaceAIProviderConfigDto {
  id: number;
  workspaceId: number;
  provider: AIProvider;
  selectedModel: string;
  isEnabled: boolean;
  lastTestResult?: boolean;
  lastTestMessage?: string;
  lastTestedAt?: string;
  monthlyTokenLimit?: number;
  tokensUsedThisMonth?: number;
  tokenCounterResetAt?: string;
}

export interface CreateWorkspaceAIProviderConfigDto {
  workspaceId: number;
  provider: AIProvider;
  selectedModel: string;
  isEnabled: boolean;
  monthlyTokenLimit?: number;
}

export interface UpdateWorkspaceAIProviderConfigDto {
  selectedModel: string;
  isEnabled: boolean;
  monthlyTokenLimit?: number;
}

export interface TestWorkspaceAIProviderConfigDto {
  workspaceId: number;
  provider: AIProvider;
}

// Organization Management Types
export type OrganizationStatus = 'Active' | 'Inactive' | 'Suspended' | 'Cancelled';
export type OrganizationRole = 'Owner' | 'Admin' | 'Member';
export type OrganizationUserStatus = 'Active' | 'Inactive' | 'Pending' | 'Removed';

export interface OrganizationDto {
  id: number;
  name: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  status: OrganizationStatus;
  createdAt: string;
  users?: OrganizationUserDto[];
  workspaces?: WorkspaceDto[];
}

export interface OrganizationUserDto {  
  id: number;
  organizationId: number;
  organizationName: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: OrganizationRole;
  status: OrganizationUserStatus;
  joinedAt: string;
  removedAt?: string;
}

export interface CreateOrganizationDto {
  name: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
}

export interface UpdateOrganizationDto {
  name: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  status?: OrganizationStatus;
}

export interface AddUserToOrganizationDto {
  userEmail: string;
  role: OrganizationRole;
}

export interface UpdateOrganizationUserDto {
  role: OrganizationRole;
  status: OrganizationUserStatus;
}
