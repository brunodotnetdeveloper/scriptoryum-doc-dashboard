
export interface UserInfoDto {
  id?: string;
  userName?: string;
  email?: string;
  emailConfirmed: boolean;
  roles?: string[];
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
  fileType: number;
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
export type AIProvider = 'openai' | 'claude' | 'gemini';

export interface AIModel {
  id: string;
  name: string;
  description: string;
  maxTokens: number;
  costPer1kTokens: number;
}

export interface AIProviderConfig {
  provider: AIProvider;
  apiKey: string;
  selectedModel: string;
  isEnabled: boolean;
}

export interface AIConfiguration {
  id: string;
  userId: string;
  providers: AIProviderConfig[];
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
