
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
  summary: string | null;
  fileType: string;
  fileName: string;
  storagePath: string;
  fileSize: number;
  status: DocumentStatus;
  uploadedAt: string;
  uploadedByUserId: string;
  documentTypeId?: number;
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

// Document Type Management DTOs
export type DocumentFieldType = 
  | 'TEXT' 
  | 'NUMBER' 
  | 'DATE' 
  | 'BOOLEAN' 
  | 'EMAIL' 
  | 'URL' 
  | 'PHONE' 
  | 'CNPJ' 
  | 'CPF' 
  | 'CURRENCY' 
  | 'PERCENTAGE' 
  | 'TEXTAREA' 
  | 'SELECT' 
  | 'MULTISELECT';

export type ValidationStatus = 'Pending' | 'Valid' | 'Invalid';

export interface DocumentTypeDto {
  id: number;
  name: string;
  description?: string;
  organizationId: number;
  organizationName?: string;
  isSystemDefault?: boolean;
  status: string; // 'Active' | 'Inactive'
  createdAt: string;
  updatedAt: string;
  fields: DocumentTypeFieldDto[];
  documentCount?: number;
  // Computed properties for backward compatibility
  isActive?: boolean;
  documentsCount?: number;
}

// Utility function to map API response to frontend format
export function mapDocumentTypeFromApi(apiData: any): DocumentTypeDto {
  return {
    ...apiData,
    isActive: apiData.status === 'Active',
    documentsCount: apiData.documentCount,
    fields: apiData.fields?.map((field: any) => ({
      id: field.id,
      documentTypeId: field.documentTypeId,
      fieldName: field.fieldName,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      displayOrder: field.fieldOrder, // API usa fieldOrder, frontend espera displayOrder
      validationRegex: field.validationRegex,
      validationMessage: field.validationMessage,
      defaultValue: field.defaultValue,
      selectOptions: field.selectOptions,
      helpText: field.helpText,
      isActive: field.status === 'Active', // API usa status, frontend espera isActive
      createdAt: field.createdAt,
      updatedAt: field.updatedAt
    })) || []
  };
}

export interface CreateDocumentTypeDto {
  name: string;
  description?: string;
  isActive?: boolean;
  fields?: CreateDocumentTypeFieldDto[];
}

export interface UpdateDocumentTypeDto {
  name: string;
  description?: string;
  isActive: boolean;
}

export interface DocumentTypeFieldDto {
  id: number;
  documentTypeId: number;
  fieldName: string;
  fieldType: DocumentFieldType;
  isRequired: boolean;
  displayOrder: number;
  validationRegex?: string;
  validationMessage?: string;
  defaultValue?: string;
  selectOptions?: string[];
  helpText?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateDocumentTypeFieldDto {
  fieldName: string;
  fieldType: DocumentFieldType;
  isRequired?: boolean;
  displayOrder?: number;
  validationRegex?: string;
  validationMessage?: string;
  defaultValue?: string;
  selectOptions?: string[];
  helpText?: string;
  isActive?: boolean;
}

export interface UpdateDocumentTypeFieldDto {
  fieldName: string;
  fieldType: DocumentFieldType;
  isRequired: boolean;
  displayOrder: number;
  validationRegex?: string;
  validationMessage?: string;
  defaultValue?: string;
  selectOptions?: string[];
  helpText?: string;
  isActive: boolean;
}

export interface DocumentTypeTemplateDto {
  id: number;
  name: string;
  description?: string;
  category?: string;
  isPublic: boolean;
  organizationId?: number;
  createdAt: string;
  updatedAt: string;
  createdByUserId: string;
  templateData: DocumentTypeTemplateDataDto;
  usageCount?: number;
}

export interface DocumentTypeTemplateDataDto {
  name: string;
  description?: string;
  category?: string;
  fields: DocumentTypeFieldTemplateDto[];
}

export interface DocumentTypeFieldTemplateDto {
  fieldName: string;
  fieldType: DocumentFieldType;
  isRequired: boolean;
  displayOrder: number;
  validationRegex?: string;
  validationMessage?: string;
  defaultValue?: string;
  selectOptions?: string[];
  helpText?: string;
}

export interface CreateDocumentTypeTemplateDto {
  name: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
  templateData: DocumentTypeTemplateDataDto;
}

export interface ApplyTemplateDto {
  templateId: number;
  documentTypeName: string;
  documentTypeDescription?: string;
  customizeFields?: boolean;
  fieldCustomizations?: { [fieldName: string]: Partial<CreateDocumentTypeFieldDto> };
}

export interface AssociateDocumentTypeDto {
  documentId: number;
  documentTypeId: number;
}

export interface DocumentFieldValueDto {
  id: number;
  documentId: number;
  documentTypeFieldId: number;
  fieldName: string;
  fieldType: DocumentFieldType;
  extractedValue?: string;
  correctedValue?: string;
  finalValue?: string;
  confidenceScore?: number;
  validationStatus: ValidationStatus;
  validationMessage?: string;
  extractedAt?: string;
  correctedAt?: string;
  correctedByUserId?: string;
  extractionMetadata?: any;
}

export interface ValidateFieldValueDto {
  documentId: number;
  fieldName: string;
  value: string;
}

export interface DocumentTypeOperationResponseDto {
  success: boolean;
  message?: string;
  data?: any;
  errors?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  message?: string;
  suggestedValue?: string;
}

export interface DocumentFieldValueHistoryDto {
  id: number;
  documentFieldValueId: number;
  oldValue?: string;
  newValue?: string;
  changeType: string;
  changedAt: string;
  changedByUserId?: string;
  changeReason?: string;
  metadata?: any;
}
