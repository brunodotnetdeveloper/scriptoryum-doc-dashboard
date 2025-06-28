
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

export interface Document {
  id: number;
  fileName: string;
  description?: string;
  uploadDate: string;
  size: number;
  status: 'processing' | 'completed' | 'error';
}
