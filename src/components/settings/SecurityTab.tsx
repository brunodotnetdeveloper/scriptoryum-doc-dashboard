import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  Shield, 
  Key, 
  Smartphone, 
  Eye, 
  EyeOff, 
  Save, 
  Loader2,
  CheckCircle,
  AlertTriangle,
  Clock,
  MapPin,
  Monitor,
  Trash2,
  Download,
  Lock
} from 'lucide-react';

interface SecuritySettings {
  twoFactorAuth: {
    enabled: boolean;
    method: 'app' | 'sms' | 'email';
    backupCodes: string[];
  };
  loginNotifications: boolean;
  sessionTimeout: number; // in minutes
  ipWhitelist: {
    enabled: boolean;
    addresses: string[];
  };
  dataRetention: {
    enabled: boolean;
    days: number;
  };
}

interface LoginSession {
  id: string;
  device: string;
  location: string;
  ipAddress: string;
  lastActive: string;
  current: boolean;
}

interface LoginActivity {
  id: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  success: boolean;
}

const TIMEOUT_OPTIONS = [
  { value: 15, label: '15 minutos' },
  { value: 30, label: '30 minutos' },
  { value: 60, label: '1 hora' },
  { value: 120, label: '2 horas' },
  { value: 240, label: '4 horas' },
  { value: 480, label: '8 horas' },
  { value: 1440, label: '24 horas' }
];

export const SecurityTab: React.FC = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<SecuritySettings | null>(null);
  const [sessions, setSessions] = useState<LoginSession[]>([]);
  const [activities, setActivities] = useState<LoginActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [newIpAddress, setNewIpAddress] = useState('');

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      // Simulated API calls - replace with actual security service
      const mockSettings: SecuritySettings = {
        twoFactorAuth: {
          enabled: true,
          method: 'app',
          backupCodes: ['ABC123', 'DEF456', 'GHI789', 'JKL012']
        },
        loginNotifications: true,
        sessionTimeout: 60,
        ipWhitelist: {
          enabled: false,
          addresses: ['192.168.1.100', '10.0.0.50']
        },
        dataRetention: {
          enabled: true,
          days: 90
        }
      };

      const mockSessions: LoginSession[] = [
        {
          id: '1',
          device: 'Chrome - Windows 11',
          location: 'São Paulo, Brasil',
          ipAddress: '192.168.1.100',
          lastActive: '2024-01-15T10:30:00Z',
          current: true
        },
        {
          id: '2',
          device: 'Safari - iPhone 15',
          location: 'São Paulo, Brasil',
          ipAddress: '192.168.1.101',
          lastActive: '2024-01-14T18:45:00Z',
          current: false
        }
      ];

      const mockActivities: LoginActivity[] = [
        {
          id: '1',
          timestamp: '2024-01-15T10:30:00Z',
          ipAddress: '192.168.1.100',
          location: 'São Paulo, Brasil',
          device: 'Chrome - Windows 11',
          success: true
        },
        {
          id: '2',
          timestamp: '2024-01-14T18:45:00Z',
          ipAddress: '192.168.1.101',
          location: 'São Paulo, Brasil',
          device: 'Safari - iPhone 15',
          success: true
        },
        {
          id: '3',
          timestamp: '2024-01-13T22:15:00Z',
          ipAddress: '203.0.113.1',
          location: 'Rio de Janeiro, Brasil',
          device: 'Chrome - Unknown',
          success: false
        }
      ];

      setSettings(mockSettings);
      setSessions(mockSessions);
      setActivities(mockActivities);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar dados de segurança',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateSetting = (key: keyof SecuritySettings, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      [key]: value
    });
  };

  const updateTwoFactorAuth = (key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      twoFactorAuth: {
        ...settings.twoFactorAuth,
        [key]: value
      }
    });
  };

  const updateIpWhitelist = (key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      ipWhitelist: {
        ...settings.ipWhitelist,
        [key]: value
      }
    });
  };

  const updateDataRetention = (key: string, value: any) => {
    if (!settings) return;
    
    setSettings({
      ...settings,
      dataRetention: {
        ...settings.dataRetention,
        [key]: value
      }
    });
  };

  const saveSettings = async () => {
    if (!settings) return;

    setIsSaving(true);
    try {
      const response = await fetch('/api/user/security', {
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
        description: 'Configurações de segurança atualizadas!'
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

  const changePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: 'Erro',
        description: 'As senhas não coincidem',
        variant: 'destructive'
      });
      return;
    }

    if (passwordForm.newPassword.length < 8) {
      toast({
        title: 'Erro',
        description: 'A senha deve ter pelo menos 8 caracteres',
        variant: 'destructive'
      });
      return;
    }

    try {
      const response = await fetch('/api/user/change-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao alterar senha');
      }

      toast({
        title: 'Sucesso',
        description: 'Senha alterada com sucesso!'
      });

      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao alterar senha',
        variant: 'destructive'
      });
    }
  };

  const terminateSession = async (sessionId: string) => {
    try {
      await fetch(`/api/user/sessions/${sessionId}`, {
        method: 'DELETE'
      });

      setSessions(sessions.filter(s => s.id !== sessionId));
      
      toast({
        title: 'Sucesso',
        description: 'Sessão encerrada com sucesso'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao encerrar sessão',
        variant: 'destructive'
      });
    }
  };

  const addIpAddress = () => {
    if (!newIpAddress || !settings) return;
    
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    
    if (!ipRegex.test(newIpAddress)) {
      toast({
        title: 'Erro',
        description: 'Endereço IP inválido',
        variant: 'destructive'
      });
      return;
    }

    updateIpWhitelist('addresses', [...settings.ipWhitelist.addresses, newIpAddress]);
    setNewIpAddress('');
  };

  const removeIpAddress = (ip: string) => {
    if (!settings) return;
    
    updateIpWhitelist('addresses', settings.ipWhitelist.addresses.filter(addr => addr !== ip));
  };

  const downloadBackupCodes = () => {
    if (!settings) return;
    
    const codes = settings.twoFactorAuth.backupCodes.join('\n');
    const blob = new Blob([codes], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
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
            <Shield className="h-6 w-6 text-primary" />
            Segurança
          </h2>
          <p className="text-muted-foreground mt-1">
            Gerencie suas configurações de segurança e privacidade
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

      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Mantenha sua conta segura com uma senha forte
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-1 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  placeholder="Digite sua senha atual"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.newPassword}
                onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                placeholder="Digite sua nova senha"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
              <Input
                id="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                value={passwordForm.confirmPassword}
                onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                placeholder="Confirme sua nova senha"
              />
            </div>
            
            <Button 
              onClick={changePassword}
              disabled={!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword}
              className="w-full"
            >
              <Lock className="mr-2 h-4 w-4" />
              Alterar Senha
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Autenticação de Dois Fatores
          </CardTitle>
          <CardDescription>
            Adicione uma camada extra de segurança à sua conta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Ativar 2FA</Label>
              <p className="text-sm text-muted-foreground">
                Requer um código adicional para fazer login
              </p>
            </div>
            <Switch
              checked={settings.twoFactorAuth.enabled}
              onCheckedChange={(checked) => updateTwoFactorAuth('enabled', checked)}
            />
          </div>
          
          {settings.twoFactorAuth.enabled && (
            <div className="space-y-4 pl-6">
              <div className="space-y-2">
                <Label>Método de autenticação</Label>
                <div className="flex gap-2">
                  <Button
                    variant={settings.twoFactorAuth.method === 'app' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateTwoFactorAuth('method', 'app')}
                  >
                    App Autenticador
                  </Button>
                  <Button
                    variant={settings.twoFactorAuth.method === 'sms' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateTwoFactorAuth('method', 'sms')}
                  >
                    SMS
                  </Button>
                  <Button
                    variant={settings.twoFactorAuth.method === 'email' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateTwoFactorAuth('method', 'email')}
                  >
                    Email
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Códigos de backup</Label>
                <p className="text-sm text-muted-foreground">
                  Use estes códigos se não conseguir acessar seu dispositivo de autenticação
                </p>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={downloadBackupCodes}>
                    <Download className="mr-2 h-4 w-4" />
                    Baixar Códigos
                  </Button>
                  <Badge variant="secondary">
                    {settings.twoFactorAuth.backupCodes.length} códigos disponíveis
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Session Management */}
      <Card>
        <CardHeader>
          <CardTitle>Sessões Ativas</CardTitle>
          <CardDescription>
            Gerencie onde você está logado
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sessions.map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Monitor className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{session.device}</p>
                      {session.current && (
                        <Badge variant="default" className="text-xs">
                          Atual
                        </Badge>
                      )}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {session.location} • {session.ipAddress}
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Último acesso: {formatDate(session.lastActive)}
                      </p>
                    </div>
                  </div>
                </div>
                {!session.current && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => terminateSession(session.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Configurações de Segurança</CardTitle>
          <CardDescription>
            Configure opções avançadas de segurança
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Notificações de login</Label>
              <p className="text-sm text-muted-foreground">
                Receba notificações quando alguém fizer login na sua conta
              </p>
            </div>
            <Switch
              checked={settings.loginNotifications}
              onCheckedChange={(checked) => updateSetting('loginNotifications', checked)}
            />
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Timeout de sessão</Label>
              <p className="text-sm text-muted-foreground">
                Tempo de inatividade antes de ser desconectado automaticamente
              </p>
              <div className="flex gap-2 flex-wrap">
                {TIMEOUT_OPTIONS.map((option) => (
                  <Button
                    key={option.value}
                    variant={settings.sessionTimeout === option.value ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => updateSetting('sessionTimeout', option.value)}
                  >
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Lista de IPs permitidos</Label>
                <p className="text-sm text-muted-foreground">
                  Restrinja o acesso apenas aos endereços IP especificados
                </p>
              </div>
              <Switch
                checked={settings.ipWhitelist.enabled}
                onCheckedChange={(checked) => updateIpWhitelist('enabled', checked)}
              />
            </div>
            
            {settings.ipWhitelist.enabled && (
              <div className="space-y-4 pl-6">
                <div className="flex gap-2">
                  <Input
                    placeholder="192.168.1.100"
                    value={newIpAddress}
                    onChange={(e) => setNewIpAddress(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={addIpAddress} disabled={!newIpAddress}>
                    Adicionar
                  </Button>
                </div>
                
                <div className="space-y-2">
                  {settings.ipWhitelist.addresses.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-2 border rounded">
                      <span className="font-mono text-sm">{ip}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeIpAddress(ip)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Retenção de dados</Label>
                <p className="text-sm text-muted-foreground">
                  Exclua automaticamente dados antigos após o período especificado
                </p>
              </div>
              <Switch
                checked={settings.dataRetention.enabled}
                onCheckedChange={(checked) => updateDataRetention('enabled', checked)}
              />
            </div>
            
            {settings.dataRetention.enabled && (
              <div className="pl-6">
                <div className="space-y-2">
                  <Label>Período de retenção (dias)</Label>
                  <Input
                    type="number"
                    min="1"
                    max="365"
                    value={settings.dataRetention.days}
                    onChange={(e) => updateDataRetention('days', parseInt(e.target.value))}
                    className="w-32"
                  />
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Login Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Atividade de Login</CardTitle>
          <CardDescription>
            Histórico recente de tentativas de login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {activity.success ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <AlertTriangle className="h-5 w-5 text-red-500" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{activity.device}</p>
                      <Badge variant={activity.success ? 'default' : 'destructive'} className="text-xs">
                        {activity.success ? 'Sucesso' : 'Falhou'}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <p className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {activity.location} • {activity.ipAddress}
                      </p>
                      <p className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatDate(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};