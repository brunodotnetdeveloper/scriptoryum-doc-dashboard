
export interface UserInfoDto {
  id?: string;
  userName?: string;
  email?: string;
  emailConfirmed: boolean;
  roles?: string[];
  companies?: CompanyUserDto[];
  currentCompanyId?: number;
  currentCompanyName?: string;
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

// Company Management Types
export type CompanyStatus = 'Active' | 'Inactive' | 'Suspended' | 'Cancelled';
export type CompanyUserRole = 'User' | 'Admin' | 'Owner' | 'Manager';
export type CompanyUserStatus = 'Active' | 'Inactive' | 'Suspended' | 'Removed' | 'PendingInvitation';

export interface CompanyDto {
  id: number;
  name: string;
  description?: string;
  cnpj?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  status: CompanyStatus;
  createdAt: string;
  users?: CompanyUserDto[];
  aiProviderConfigs?: CompanyAIProviderConfigDto[];
}

export interface CreateCompanyDto {
  name: string;
  status?: string;
  description?: string;
  cnpj?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
}

export interface UpdateCompanyDto {
  name: string;
  cnpj?: string;
  description?: string;
  contactEmail: string;
  contactPhone?: string;
  address?: string;
  status: CompanyStatus;
}

export interface CompanyUserDto {
  user: UserInfoDto;
  id: number;
  companyId: number;
  companyName: string;
  userId: string;
  userName: string;
  userEmail: string;
  role: CompanyUserRole;
  status: CompanyUserStatus;
  joinedAt: string;
  removedAt?: string;
}

export interface AddUserToCompanyDto {
  companyId: number;
  userEmail: string;
  role: CompanyUserRole;
}

export interface UpdateCompanyUserDto {
  role: CompanyUserRole;
  status: CompanyUserStatus;
}

export interface UserCompaniesDto {
  companies: CompanyUserDto[];
}

export interface CompanyAIProviderConfigDto {
  id: number;
  companyId: number;
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

export interface CreateCompanyAIProviderConfigDto {
  companyId: number;
  provider: AIProvider;
  selectedModel: string;
  isEnabled: boolean;
  monthlyTokenLimit?: number;
}

export interface UpdateCompanyAIProviderConfigDto {
  selectedModel: string;
  isEnabled: boolean;
  monthlyTokenLimit?: number;
}

export interface TestCompanyAIProviderConfigDto {
  companyId: number;
  provider: AIProvider;
}
