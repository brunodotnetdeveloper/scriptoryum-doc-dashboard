import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Settings, Brain, CreditCard, User, Bell, Shield, Save } from 'lucide-react';
import { AIConfigTab } from '@/components/settings/AIConfigTab';
import { BillingTab } from '@/components/settings/BillingTab';
import { NotificationsTab } from '@/components/settings/NotificationsTab';
import { ProfileTab } from '@/components/settings/ProfileTab';
import { SecurityTab } from '@/components/settings/SecurityTab';
import { PageBreadcrumb } from '@/components/PageBreadcrumb';

export const SettingsPage: React.FC = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('ia');

  return (
    <div className="container mx-auto px-4 py-6 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <PageBreadcrumb 
          customTitle="Configurações"
        />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-flex">
          <TabsTrigger value="ia" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">IA</span>
          </TabsTrigger>
          <TabsTrigger value="faturamento" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Faturamento</span>
          </TabsTrigger>
          <TabsTrigger value="perfil" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="notificacoes" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notificações</span>
          </TabsTrigger>
          <TabsTrigger value="seguranca" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ia">
          <AIConfigTab />
        </TabsContent>

        <TabsContent value="faturamento">
          <BillingTab />
        </TabsContent>

        <TabsContent value="perfil">
          <ProfileTab />
        </TabsContent>

        <TabsContent value="notificacoes">
          <NotificationsTab />
        </TabsContent>

        <TabsContent value="seguranca">
          <SecurityTab />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;