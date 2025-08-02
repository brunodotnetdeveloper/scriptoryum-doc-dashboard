import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Monitor, 
  Save, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  Info,
  MessageSquare
} from 'lucide-react';

interface NotificationSettings {
  email: {
    documentProcessed: boolean;
    documentFailed: boolean;
    weeklyReport: boolean;
    billingUpdates: boolean;
    securityAlerts: boolean;
    productUpdates: boolean;
    marketingEmails: boolean;
  };
  push: {
    documentProcessed: boolean;
    documentFailed: boolean;
    systemMaintenance: boolean;
    securityAlerts: boolean;
  };
  inApp: {
    documentProcessed: boolean;
    documentFailed: boolean;
    systemUpdates: boolean;
    tips: boolean;
  };
  preferences: {
    emailFrequency: 'immediate' | 'daily' | 'weekly' | 'never';
    quietHours: {
      enabled: boolean;
      start: string;
      end: string;
    };
    timezone: string;
  };
}

const TIMEZONES = [
  { value: 'America/Sao_Paulo', label: 'Brasília (UTC-3)' },
  { value: 'America/New_York', label: 'Nova York (UTC-5)' },
  { value: 'Europe/London', label: 'Londres (UTC+0)' },
  { value: 'Europe/Paris', label: 'Paris (UTC+1)' },
  { value: 'Asia/Tokyo', label: 'Tóquio (UTC+9)' }
];

const EMAIL_FREQUENCIES = [
  { value: 'immediate', label: 'Imediato' },
  { value: 'daily', label: 'Diário' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'never', label: 'Nunca' }
];

export const NotificationsTab: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<NotificationSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      // Simulated API call - replace with actual notification service
      const mockSettings: NotificationSettings = {
        email: {
          documentProcessed: true,
          documentFailed: true,
          weeklyReport: true,
          billingUpdates: true,
          securityAlerts: true,
          productUpdates: false,
          marketingEmails: false
        },
        push: {
          documentProcessed: true,
          documentFailed: true,
          systemMaintenance: true,
          securityAlerts: true
        },
        inApp: {
          documentProcessed: true,
          documentFailed: true,
          systemUpdates: true,
          tips: true
        },
        preferences: {
          emailFrequency: 'immediate',
          quietHours: {
            enabled: true,
            start: '22:00',
            end: '08:00'
          },
          timezone: 'America/Sao_Paulo'
        }
      };
      setSettings(mockSettings);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar configurações de notificação',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (category: keyof NotificationSettings, key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [category]: {
        ...settings[category],
        [key]: value
      }
    });
  };

  const updatePreference = (key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        [key]: value
      }
    });
  };

  const updateQuietHours = (key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      preferences: {
        ...settings.preferences,
        quietHours: {
          ...settings.preferences.quietHours,
          [key]: value
        }
      }
    });
  };

  const saveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error('Erro ao salvar configurações');
      }

      toast({
        title: 'Sucesso',
        description: 'Configurações de notificação atualizadas!'
      });
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

  const testNotification = async (type: 'email' | 'push' | 'inApp') => {
    try {
      await fetch('/api/notifications/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type })
      });

      toast({
        title: 'Notificação de teste enviada',
        description: `Verifique sua ${type === 'email' ? 'caixa de email' : type === 'push' ? 'notificações push' : 'notificações no app'}`
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível enviar notificação de teste',
        variant: 'destructive'
      });
    }
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

  if (!settings) {
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
            <Bell className="h-6 w-6 text-primary" />
            Notificações
          </h2>
          <p className="text-muted-foreground mt-1">
            Configure como e quando você deseja receber notificações
          </p>
        </div>
        <Button 
          onClick={saveSettings} 
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

      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Notificações por Email
          </CardTitle>
          <CardDescription>
            Configure quais eventos devem gerar notificações por email
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Documento processado</Label>
                <p className="text-sm text-muted-foreground">
                  Receba um email quando um documento for processado com sucesso
                </p>
              </div>
              <Switch
                checked={settings.email.documentProcessed}
                onCheckedChange={(checked) => updateSetting('email', 'documentProcessed', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Falha no processamento</Label>
                <p className="text-sm text-muted-foreground">
                  Receba um email quando houver erro no processamento de documentos
                </p>
              </div>
              <Switch
                checked={settings.email.documentFailed}
                onCheckedChange={(checked) => updateSetting('email', 'documentFailed', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Relatório semanal</Label>
                <p className="text-sm text-muted-foreground">
                  Receba um resumo semanal das suas atividades
                </p>
              </div>
              <Switch
                checked={settings.email.weeklyReport}
                onCheckedChange={(checked) => updateSetting('email', 'weeklyReport', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Atualizações de faturamento</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações sobre cobranças e alterações no plano
                </p>
              </div>
              <Switch
                checked={settings.email.billingUpdates}
                onCheckedChange={(checked) => updateSetting('email', 'billingUpdates', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Alertas de segurança</Label>
                <p className="text-sm text-muted-foreground">
                  Receba notificações sobre atividades suspeitas na conta
                </p>
              </div>
              <Switch
                checked={settings.email.securityAlerts}
                onCheckedChange={(checked) => updateSetting('email', 'securityAlerts', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Atualizações do produto</Label>
                <p className="text-sm text-muted-foreground">
                  Receba informações sobre novas funcionalidades e melhorias
                </p>
              </div>
              <Switch
                checked={settings.email.productUpdates}
                onCheckedChange={(checked) => updateSetting('email', 'productUpdates', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Emails de marketing</Label>
                <p className="text-sm text-muted-foreground">
                  Receba dicas, tutoriais e ofertas especiais
                </p>
              </div>
              <Switch
                checked={settings.email.marketingEmails}
                onCheckedChange={(checked) => updateSetting('email', 'marketingEmails', checked)}
              />
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => testNotification('email')}
              className="w-full sm:w-auto"
            >
              <Mail className="mr-2 h-4 w-4" />
              Enviar Email de Teste
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Notificações Push
          </CardTitle>
          <CardDescription>
            Configure notificações push para seu dispositivo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Documento processado</Label>
                <p className="text-sm text-muted-foreground">
                  Notificação push quando um documento for processado
                </p>
              </div>
              <Switch
                checked={settings.push.documentProcessed}
                onCheckedChange={(checked) => updateSetting('push', 'documentProcessed', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Falha no processamento</Label>
                <p className="text-sm text-muted-foreground">
                  Notificação push quando houver erro no processamento
                </p>
              </div>
              <Switch
                checked={settings.push.documentFailed}
                onCheckedChange={(checked) => updateSetting('push', 'documentFailed', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Manutenção do sistema</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações sobre manutenções programadas
                </p>
              </div>
              <Switch
                checked={settings.push.systemMaintenance}
                onCheckedChange={(checked) => updateSetting('push', 'systemMaintenance', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Alertas de segurança</Label>
                <p className="text-sm text-muted-foreground">
                  Notificações push sobre atividades suspeitas
                </p>
              </div>
              <Switch
                checked={settings.push.securityAlerts}
                onCheckedChange={(checked) => updateSetting('push', 'securityAlerts', checked)}
              />
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => testNotification('push')}
              className="w-full sm:w-auto"
            >
              <Smartphone className="mr-2 h-4 w-4" />
              Enviar Push de Teste
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* In-App Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Notificações no App
          </CardTitle>
          <CardDescription>
            Configure notificações que aparecem dentro do aplicativo
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Documento processado</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar notificação no app quando documento for processado
                </p>
              </div>
              <Switch
                checked={settings.inApp.documentProcessed}
                onCheckedChange={(checked) => updateSetting('inApp', 'documentProcessed', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Falha no processamento</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar notificação no app quando houver erro
                </p>
              </div>
              <Switch
                checked={settings.inApp.documentFailed}
                onCheckedChange={(checked) => updateSetting('inApp', 'documentFailed', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Atualizações do sistema</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar notificações sobre atualizações e melhorias
                </p>
              </div>
              <Switch
                checked={settings.inApp.systemUpdates}
                onCheckedChange={(checked) => updateSetting('inApp', 'systemUpdates', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Dicas e tutoriais</Label>
                <p className="text-sm text-muted-foreground">
                  Mostrar dicas para melhor uso da plataforma
                </p>
              </div>
              <Switch
                checked={settings.inApp.tips}
                onCheckedChange={(checked) => updateSetting('inApp', 'tips', checked)}
              />
            </div>
          </div>
          
          <div className="pt-4 border-t">
            <Button 
              variant="outline" 
              onClick={() => testNotification('inApp')}
              className="w-full sm:w-auto"
            >
              <Monitor className="mr-2 h-4 w-4" />
              Mostrar Notificação de Teste
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle>Preferências</CardTitle>
          <CardDescription>
            Configure suas preferências gerais de notificação
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Frequência de emails</Label>
              <Select 
                value={settings.preferences.emailFrequency} 
                onValueChange={(value) => updatePreference('emailFrequency', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {EMAIL_FREQUENCIES.map((freq) => (
                    <SelectItem key={freq.value} value={freq.value}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Fuso horário</Label>
              <Select 
                value={settings.preferences.timezone} 
                onValueChange={(value) => updatePreference('timezone', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONES.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Horário silencioso</Label>
                <p className="text-sm text-muted-foreground">
                  Não receber notificações durante determinado período
                </p>
              </div>
              <Switch
                checked={settings.preferences.quietHours.enabled}
                onCheckedChange={(checked) => updateQuietHours('enabled', checked)}
              />
            </div>
            
            {settings.preferences.quietHours.enabled && (
              <div className="grid gap-4 md:grid-cols-2 pl-6">
                <div className="space-y-2">
                  <Label>Início</Label>
                  <input
                    type="time"
                    value={settings.preferences.quietHours.start}
                    onChange={(e) => updateQuietHours('start', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Fim</Label>
                  <input
                    type="time"
                    value={settings.preferences.quietHours.end}
                    onChange={(e) => updateQuietHours('end', e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};