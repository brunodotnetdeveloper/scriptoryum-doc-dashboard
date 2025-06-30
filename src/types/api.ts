
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

export type DocumentStatus = 'Uploaded' | 'Queued' | 'ExtractingText' | 'AnalyzingContent' | 'Processed' | 'Failed' | 'TextExtractionFailed' | 'ContentAnalysisFailed' | 'Cancelled' | 'Processing';

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
