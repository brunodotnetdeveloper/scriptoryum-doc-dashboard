import { AIConfiguration, AIConfigurationResponse, AIModel, AIProvider, AIProviderConfig } from '@/types/api';

// Mock data for AI models
export const AI_MODELS: Record<AIProvider, AIModel[]> = {
  openai: [
    {
      id: 'gpt-4o',
      name: 'GPT-4o',
      description: 'Modelo mais avançado da OpenAI com capacidades multimodais',
      maxTokens: 128000,
      costPer1kTokens: 0.005
    },
    {
      id: 'gpt-4o-mini',
      name: 'GPT-4o Mini',
      description: 'Versão mais rápida e econômica do GPT-4o',
      maxTokens: 128000,
      costPer1kTokens: 0.00015
    },
    {
      id: 'gpt-4-turbo',
      name: 'GPT-4 Turbo',
      description: 'Modelo GPT-4 otimizado para velocidade',
      maxTokens: 128000,
      costPer1kTokens: 0.01
    },
    {
      id: 'gpt-3.5-turbo',
      name: 'GPT-3.5 Turbo',
      description: 'Modelo rápido e econômico para tarefas gerais',
      maxTokens: 16385,
      costPer1kTokens: 0.0005
    }
  ],
  claude: [
    {
      id: 'claude-3-5-sonnet-20241022',
      name: 'Claude 3.5 Sonnet',
      description: 'Modelo mais avançado da Anthropic com excelente raciocínio',
      maxTokens: 200000,
      costPer1kTokens: 0.003
    },
    {
      id: 'claude-3-5-haiku-20241022',
      name: 'Claude 3.5 Haiku',
      description: 'Modelo rápido e econômico da Anthropic',
      maxTokens: 200000,
      costPer1kTokens: 0.00025
    },
    {
      id: 'claude-3-opus-20240229',
      name: 'Claude 3 Opus',
      description: 'Modelo premium da Anthropic para tarefas complexas',
      maxTokens: 200000,
      costPer1kTokens: 0.015
    }
  ],
  gemini: [
    {
      id: 'gemini-1.5-pro',
      name: 'Gemini 1.5 Pro',
      description: 'Modelo avançado do Google com grande contexto',
      maxTokens: 2000000,
      costPer1kTokens: 0.00125
    },
    {
      id: 'gemini-1.5-flash',
      name: 'Gemini 1.5 Flash',
      description: 'Modelo rápido e eficiente do Google',
      maxTokens: 1000000,
      costPer1kTokens: 0.000075
    },
    {
      id: 'gemini-1.0-pro',
      name: 'Gemini 1.0 Pro',
      description: 'Modelo base do Google Gemini',
      maxTokens: 32768,
      costPer1kTokens: 0.0005
    }
  ]
};

// Mock storage key
const AI_CONFIG_STORAGE_KEY = 'scriptoryum_ai_config';

class AIConfigService {
  // Get current AI configuration
  async getConfiguration(): Promise<AIConfigurationResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const stored = localStorage.getItem(AI_CONFIG_STORAGE_KEY);
      
      if (stored) {
        const configuration = JSON.parse(stored) as AIConfiguration;
        return {
          success: true,
          configuration
        };
      }
      
      // Return default configuration if none exists
      const defaultConfig: AIConfiguration = {
        id: 'default-config',
        userId: 'current-user',
        providers: [
          {
            provider: 'openai',
            apiKey: '',
            selectedModel: 'gpt-4o-mini',
            isEnabled: false
          },
          {
            provider: 'claude',
            apiKey: '',
            selectedModel: 'claude-3-5-haiku-20241022',
            isEnabled: false
          },
          {
            provider: 'gemini',
            apiKey: '',
            selectedModel: 'gemini-1.5-flash',
            isEnabled: false
          }
        ],
        defaultProvider: 'openai',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      return {
        success: true,
        configuration: defaultConfig
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao carregar configuração de IA',
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      };
    }
  }
  
  // Update AI configuration
  async updateConfiguration(config: AIConfiguration): Promise<AIConfigurationResponse> {
    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const updatedConfig = {
        ...config,
        updatedAt: new Date().toISOString()
      };
      
      localStorage.setItem(AI_CONFIG_STORAGE_KEY, JSON.stringify(updatedConfig));
      
      return {
        success: true,
        configuration: updatedConfig,
        message: 'Configuração salva com sucesso!'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao salvar configuração',
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      };
    }
  }
  
  // Get available models for a provider
  getModelsForProvider(provider: AIProvider): AIModel[] {
    return AI_MODELS[provider] || [];
  }
  
  // Validate API key format (mock validation)
  validateApiKey(provider: AIProvider, apiKey: string): boolean {
    if (!apiKey || apiKey.trim().length === 0) {
      return false;
    }
    
    switch (provider) {
      case 'openai':
        return apiKey.startsWith('sk-') && apiKey.length > 20;
      case 'claude':
        return apiKey.startsWith('sk-ant-') && apiKey.length > 20;
      case 'gemini':
        return apiKey.length > 20; // Gemini keys don't have a specific prefix
      default:
        return false;
    }
  }
  
  // Test API key (mock test)
  async testApiKey(provider: AIProvider, apiKey: string): Promise<{ success: boolean; message: string }> {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (!this.validateApiKey(provider, apiKey)) {
      return {
        success: false,
        message: 'Formato de API key inválido'
      };
    }
    
    // Mock success/failure (80% success rate)
    const isSuccess = Math.random() > 0.2;
    
    if (isSuccess) {
      return {
        success: true,
        message: 'API key válida e funcionando!'
      };
    } else {
      return {
        success: false,
        message: 'API key inválida ou sem permissões adequadas'
      };
    }
  }
}

export const aiConfigService = new AIConfigService();