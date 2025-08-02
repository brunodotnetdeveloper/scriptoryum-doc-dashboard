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
import { Brain, Key, TestTube, Save, CheckCircle, XCircle, Loader2, ExternalLink } from 'lucide-react';

const PROVIDER_INFO = {
  openai: {
    name: 'OpenAI',
    description: 'GPT-4, GPT-3.5 e outros modelos da OpenAI',
    icon: '🤖',
    color: 'bg-green-500',
    website: 'https://platform.openai.com/api-keys'
  },
  claude: {
    name: 'Anthropic Claude',
    description: 'Claude 3.5 Sonnet, Haiku e outros modelos da Anthropic',
    icon: '🧠',
    color: 'bg-gold-scriptoryum',
    website: 'https://console.anthropic.com/'
  },
  gemini: {
    name: 'Google Gemini',
    description: 'Gemini 1.5 Pro, Flash e outros modelos do Google',
    icon: '💎',
    color: 'bg-blue-scriptoryum',
    website: 'https://aistudio.google.com/app/apikey'
  }
};

export const AIConfigTab: React.FC = () => {
  const { toast } = useToast();
  const [configuration, setConfiguration] = useState<AIConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [testingKeys, setTestingKeys] = useState<Record<AIProvider, boolean>>({
    openai: false,
    claude: false,
    gemini: false
  });
  const [keyValidation, setKeyValidation] = useState<Record<AIProvider, { isValid: boolean; message: string } | null>>({
    openai: null,
    claude: null,
    gemini: null
  });

  useEffect(() => {
    loadConfiguration();
  }, []);

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
      const result = await aiConfigService.testApiKey(provider, providerConfig.apiKey);
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
    return aiConfigService.getModelsForProvider(provider);
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
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Brain className="h-6 w-6 text-primary" />
            Configurações de IA
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure suas API keys e modelos de IA para análise de documentos
          </p>
        </div>
        <Button 
          onClick={saveConfiguration} 
          disabled={isSaving}
          className="bg-primary hover:bg-primary/90"
        >
          {isSaving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Salvar Configurações
        </Button>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-6">
        {configuration.providers.map((providerConfig) => {
          const info = PROVIDER_INFO[providerConfig.provider];
          const validation = keyValidation[providerConfig.provider];
          const isTesting = testingKeys[providerConfig.provider];
          const models = getModelsForProvider(providerConfig.provider);

          return (
            <Card key={providerConfig.provider} className="border-2 hover:border-primary/20 transition-colors">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg ${info.color} flex items-center justify-center text-white text-lg`}>
                      {info.icon}
                    </div>
                    <div>
                      <CardTitle className="text-xl">{info.name}</CardTitle>
                      <CardDescription>{info.description}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={providerConfig.enabled}
                      onCheckedChange={(enabled) => updateProviderConfig(providerConfig.provider, { enabled })}
                    />
                    <Label className="text-sm font-medium">
                      {providerConfig.enabled ? 'Ativo' : 'Inativo'}
                    </Label>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                {/* API Key Section */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`${providerConfig.provider}-key`} className="text-sm font-medium flex items-center gap-2">
                      <Key className="h-4 w-4" />
                      API Key
                    </Label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => window.open(info.website, '_blank')}
                      className="text-xs"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Obter Key
                    </Button>
                  </div>
                  
                  <div className="flex gap-2">
                    <Input
                      id={`${providerConfig.provider}-key`}
                      type="password"
                      placeholder="Insira sua API key..."
                      value={providerConfig.apiKey || ''}
                      onChange={(e) => updateProviderConfig(providerConfig.provider, { apiKey: e.target.value })}
                      className="flex-1"
                    />
                    <Button
                      variant="outline"
                      onClick={() => testApiKey(providerConfig.provider)}
                      disabled={!providerConfig.apiKey || isTesting}
                      className="px-3"
                    >
                      {isTesting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <TestTube className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                  
                  {validation && (
                    <div className={`flex items-center gap-2 text-sm ${
                      validation.isValid ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {validation.isValid ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <XCircle className="h-4 w-4" />
                      )}
                      {validation.message}
                    </div>
                  )}
                </div>

                <Separator />

                {/* Model Selection */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Modelo Padrão</Label>
                  <Select
                    value={providerConfig.defaultModel}
                    onValueChange={(model) => updateProviderConfig(providerConfig.provider, { defaultModel: model })}
                    disabled={!providerConfig.enabled}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {models.map((model) => (
                        <SelectItem key={model.id} value={model.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{model.name}</span>
                            <div className="flex gap-2 ml-4">
                              <Badge variant="outline" className="text-xs">
                                {formatCost(model.inputCost)}/1K tokens
                              </Badge>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Advanced Settings */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Temperatura</Label>
                    <Input
                      type="number"
                      min="0"
                      max="2"
                      step="0.1"
                      value={providerConfig.temperature}
                      onChange={(e) => updateProviderConfig(providerConfig.provider, { temperature: parseFloat(e.target.value) })}
                      disabled={!providerConfig.enabled}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Max Tokens</Label>
                    <Input
                      type="number"
                      min="1"
                      max="32000"
                      value={providerConfig.maxTokens}
                      onChange={(e) => updateProviderConfig(providerConfig.provider, { maxTokens: parseInt(e.target.value) })}
                      disabled={!providerConfig.enabled}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};