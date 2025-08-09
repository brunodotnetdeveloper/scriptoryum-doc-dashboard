import { 
  AIConfiguration, 
  AIConfigurationResponse, 
  AIModel, 
  AIProvider, 
  UpdateAIConfigurationDto,
  TestApiKeyDto,
  TestApiKeyResponse
} from '@/types/api';
import { API_BASE_URL, BaseService } from './base.service';

class AIConfigService extends BaseService {
  // Get current AI configuration
  async getConfiguration(): Promise<AIConfigurationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-config`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<AIConfigurationResponse>(response);
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao carregar configuração de IA',
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      };
    }
  }
  
  // Update AI configuration
  async updateConfiguration(updateDto: UpdateAIConfigurationDto): Promise<AIConfigurationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-config`, {
        method: 'PUT',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(updateDto),
      });
      
      return this.handleResponse<AIConfigurationResponse>(response);
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao salvar configuração',
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      };
    }
  }
  
  // Get available models for a provider
  async getModelsForProvider(provider: AIProvider): Promise<AIModel[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-config/models/${provider}`, {
        method: 'GET',
        headers: this.getAuthHeaders(),
      });
      
      return this.handleResponse<AIModel[]>(response);
    } catch (error) {
      console.error('Erro ao carregar modelos:', error);
      return [];
    }
  }
  
  // Test API key
  async testApiKey(testDto: TestApiKeyDto): Promise<TestApiKeyResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/ai-config/test-key`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(testDto),
      });
      
      return this.handleResponse<TestApiKeyResponse>(response);
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao testar API key',
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      };
    }
  }
  
  // Validate API key format (client-side validation)
  validateApiKey(provider: AIProvider, apiKey: string): boolean {
    if (!apiKey || apiKey.trim().length === 0) {
      return false;
    }
    
    switch (provider) {
      case 'OpenAI':
        return apiKey.startsWith('sk-') && apiKey.length > 20;
      case 'Claude':
        return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
      case 'Gemini':
        return apiKey.length > 20; // Gemini keys don't have a specific prefix
      default:
        return false;
    }
  }
}

export const aiConfigService = new AIConfigService();