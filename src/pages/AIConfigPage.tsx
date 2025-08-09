import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { aiConfigService } from '@/services';
import { AIConfiguration, AIProvider, AIProviderConfig, AIModel } from '@/types/api';
import { Settings, Brain, Key, TestTube, Save, CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { PageBreadcrumb } from '@/components/PageBreadcrumb';

const PROVIDER_INFO = {
  OpenAI: {
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 e outros modelos da OpenAI',
    icon: '🤖',
    color: 'bg-green-500',
    website: 'https://platform.openai.com/api-keys'
  },
  Claude: {
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet, Haiku e outros modelos da Anthropic',
    icon: '🧠',
    color: 'bg-gold-scriptoryum',
    website: 'https://console.anthropic.com/'
  },
  Gemini: {
    name: 'Google Gemini',
    description: 'Gemini 1.5 Pro, Flash e outros modelos do Google',
    icon: '💎',
    color: 'bg-blue-scriptoryum',
    website: 'https://aistudio.google.com/app/apikey'
  }
};

export const AIConfigPage: React.FC = () => {
  const { toast } = useToast();
  const [configuration, setConfiguration] = useState<AIConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [models, setModels] = useState<Record<AIProvider, AIModel[]>>({
    OpenAI: [],
    Claude: [],
    Gemini: []
  });
  const [testingKeys, setTestingKeys] = useState<Record<AIProvider, boolean>>({
    OpenAI: false,
    Claude: false,
    Gemini: false
  });
  const [keyValidation, setKeyValidation] = useState<Record<AIProvider, { isValid: boolean; message: string } | null>>({
    OpenAI: null,
    Claude: null,
    Gemini: null
  });

  useEffect(() => {
    loadConfiguration();
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      const providers: AIProvider[] = ['OpenAI', 'Claude', 'Gemini'];
      const modelsData: Record<AIProvider, AIModel[]> = {
        OpenAI: [],
        Claude: [],
        Gemini: []
      };

      for (const provider of providers) {
        modelsData[provider] = await aiConfigService.getModelsForProvider(provider);
      }

      setModels(modelsData);
    } catch (error) {
      console.error('Error loading models:', error);
    }
  };

  const loadConfiguration = async () => {
    try {
      const response = await aiConfigService.getConfiguration();
      if (response.success && response.configuration) {
        setConfiguration(response.configuration);
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as configurações',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateProviderConfig = (provider: AIProvider, updates: Partial<AIProviderConfig>) => {
    if (!configuration) return;

    const updatedProviders = configuration.providers.map(p =>
      p.provider === provider ? { ...p, ...updates } : p
    );

    setConfiguration({
      ...configuration,
      providers: updatedProviders
    });

    // Clear validation when API key changes
    if (updates.apiKey !== undefined) {
      setKeyValidation(prev => ({ ...prev, [provider]: null }));
    }
  };

  const testApiKey = async (provider: AIProvider) => {
    const providerConfig = configuration?.providers.find(p => p.provider === provider);
    if (!providerConfig?.apiKey) {
      toast({
        title: 'Erro',
        description: 'Insira uma API key antes de testar',
        variant: 'destructive'
      });
      return;
    }

    setTestingKeys(prev => ({ ...prev, [provider]: true }));

    try {
      const result = await aiConfigService.testApiKey({ provider, apiKey: providerConfig.apiKey });
      setKeyValidation(prev => ({
        ...prev,
        [provider]: { isValid: result.success, message: result.message }
      }));

      toast({
        title: result.success ? 'Sucesso' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
    } catch (error) {
      setKeyValidation(prev => ({
        ...prev,
        [provider]: { isValid: false, message: 'Erro ao testar API key' }
      }));
    } finally {
      setTestingKeys(prev => ({ ...prev, [provider]: false }));
    }
  };

  const saveConfiguration = async () => {
    if (!configuration) return;

    setIsSaving(true);
    try {
      const response = await aiConfigService.updateConfiguration(configuration);
      if (response.success) {
        toast({
          title: 'Sucesso',
          description: response.message || 'Configurações salvas com sucesso!',
        });
      } else {
        throw new Error(response.message || 'Erro ao salvar configurações');
      }
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao salvar configurações',
        variant: 'destructive'
      });
    } finally {
      setIsSaving(false);
    }
  };

  const getModelsForProvider = (provider: AIProvider): AIModel[] => {
    return models[provider] || [];
  };

  const formatCost = (cost: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 5
    }).format(cost);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando configurações...</p>
        </div>
      </div>
    );
  }

  if (!configuration) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Erro ao carregar configurações</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <PageBreadcrumb customTitle="Configurações de IA" />
        <Button 
          onClick={saveConfiguration} 
          disabled={isSaving}
          className="flex items-center gap-2"
        >
          {isSaving ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {isSaving ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>

      {/* Info Card */}
      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-800 dark:text-blue-200 flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Como funciona o Scriptoryum
          </CardTitle>
        </CardHeader>
        <CardContent className="text-blue-700 dark:text-blue-300">
          <p>
            O Scriptoryum permite que você use suas próprias API keys dos provedores de IA, 
            garantindo controle total sobre seus custos e dados. Configure suas chaves abaixo 
            e escolha qual provedor usar como padrão para análise de documentos.
          </p>
        </CardContent>
      </Card>

      {/* Default Provider Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Provedor Padrão</CardTitle>
          <CardDescription>
            Selecione qual provedor de IA será usado por padrão para análise de documentos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={configuration.defaultProvider}
            onValueChange={(value: AIProvider) => 
              setConfiguration({ ...configuration, defaultProvider: value })
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {configuration.providers.filter(p => p.isEnabled).map(provider => (
                <SelectItem key={provider.provider} value={provider.provider}>
                  <div className="flex items-center gap-2">
                    <span>{PROVIDER_INFO[provider.provider].icon}</span>
                    {PROVIDER_INFO[provider.provider].name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Provider Configurations */}
      <div className="grid gap-6">
        {configuration.providers.map((providerConfig) => {
          const info = PROVIDER_INFO[providerConfig.provider];
          const models = getModelsForProvider(providerConfig.provider);
          const selectedModel = models.find(m => m.id === providerConfig.selectedModel);
          const validation = keyValidation[providerConfig.provider];
          const isTesting = testingKeys[providerConfig.provider];

          return (
            <Card key={providerConfig.provider} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${info.color}`} />
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <span>{info.icon}</span>
                        {info.name}
                        {providerConfig.isEnabled && (
                          <Badge variant="secondary" className="text-xs">
                            Ativo
                          </Badge>
                        )}
                      </CardTitle>
                      <CardDescription>{info.description}</CardDescription>
                    </div>
                  </div>
                  <Switch
                    checked={providerConfig.isEnabled}
                    onCheckedChange={(checked) =>
                      updateProviderConfig(providerConfig.provider, { isEnabled: checked })
                    }
                  />
                </div>
              </CardHeader>

              {providerConfig.isEnabled && (
                <CardContent className="space-y-4">
                  {/* API Key */}
                  <div className="space-y-2">
                    <Label htmlFor={`${providerConfig.provider}-key`} className="flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      API Key
                    </Label>
                    <div className="flex gap-2">
                      <Input
                        id={`${providerConfig.provider}-key`}
                        type="password"
                        placeholder="Insira sua API key..."
                        value={providerConfig.apiKey}
                        onChange={(e) =>
                          updateProviderConfig(providerConfig.provider, { apiKey: e.target.value })
                        }
                        className={validation ? (validation.isValid ? 'border-green-500' : 'border-red-500') : ''}
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => testApiKey(providerConfig.provider)}
                        disabled={!providerConfig.apiKey || isTesting}
                        className="flex items-center gap-2 whitespace-nowrap"
                      >
                        {isTesting ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                        Testar
                      </Button>
                    </div>
                    
                    {validation && (
                      <div className={`flex items-center gap-2 text-sm ${validation.isValid ? 'text-green-600' : 'text-red-600'}`}>
                        {validation.isValid ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : (
                          <XCircle className="h-4 w-4" />
                        )}
                        {validation.message}
                      </div>
                    )}
                    
                    <p className="text-xs text-muted-foreground">
                      Obtenha sua API key em:{' '}
                      <a 
                        href={info.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {info.website}
                      </a>
                    </p>
                  </div>

                  <Separator />

                  {/* Model Selection */}
                  <div className="space-y-2">
                    <Label>Modelo</Label>
                    <Select
                      value={providerConfig.selectedModel}
                      onValueChange={(value) =>
                        updateProviderConfig(providerConfig.provider, { selectedModel: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {models.map((model) => (
                          <SelectItem key={model.id} value={model.id}>
                            <div className="flex flex-col">
                              <span className="font-medium">{model.name}</span>
                              <span className="text-xs text-muted-foreground">
                                {formatCost(model.costPer1kTokens)}/1k tokens • {model.maxTokens.toLocaleString()} tokens max
                              </span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    {selectedModel && (
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm font-medium">{selectedModel.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {selectedModel.description}
                        </p>
                        <div className="flex gap-4 mt-2 text-xs">
                          <span>
                            <strong>Custo:</strong> {formatCost(selectedModel.costPer1kTokens)}/1k tokens
                          </span>
                          <span>
                            <strong>Max tokens:</strong> {selectedModel.maxTokens.toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Cost Information */}
      <Card className="bg-yellow-50 border-yellow-200 dark:bg-yellow-950 dark:border-yellow-800">
        <CardHeader>
          <CardTitle className="text-yellow-800 dark:text-yellow-200">
            💰 Informações sobre Custos
          </CardTitle>
        </CardHeader>
        <CardContent className="text-yellow-700 dark:text-yellow-300 space-y-2">
          <p>
            • Os custos são cobrados diretamente pelos provedores de IA (OpenAI, Anthropic, Google)
          </p>
          <p>
            • O Scriptoryum não adiciona nenhuma taxa adicional aos custos dos provedores
          </p>
          <p>
            • Você tem controle total sobre qual modelo usar e pode monitorar seus gastos diretamente nas plataformas dos provedores
          </p>
          <p>
            • Recomendamos começar com modelos mais econômicos como GPT-4o Mini ou Claude 3.5 Haiku
          </p>
        </CardContent>
      </Card>
    </div>
  );
};