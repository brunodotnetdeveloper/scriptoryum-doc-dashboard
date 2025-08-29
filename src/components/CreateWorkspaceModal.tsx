import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Building2 } from 'lucide-react';
import { createOrganizationWithWorkspace } from '../services/organizationService';
import { toast } from '@/hooks/use-toast';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onWorkspaceCreated: () => void;
}

export const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onWorkspaceCreated,
}) => {
  const [organizationName, setOrganizationName] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [description, setDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizationName.trim()) {
      toast({
        title: "Nome da organização obrigatório",
        description: "Por favor, insira um nome para sua organização.",
        variant: "destructive",
      });
      return;
    }

    if (!workspaceName.trim()) {
      toast({
        title: "Nome do workspace obrigatório",
        description: "Por favor, insira um nome para seu workspace.",
        variant: "destructive",
      });
      return;
    }

    if (!contactEmail.trim()) {
      toast({
        title: "Email de contato obrigatório",
        description: "Por favor, insira um email de contato.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsCreating(true);
      await createOrganizationWithWorkspace(
        {
          name: organizationName.trim(),
          description: description.trim() || undefined,
          contactEmail: contactEmail.trim(),
        },
        workspaceName.trim()
      );
      
      toast({
        title: "Organização e workspace criados!",
        description: `Sua organização "${organizationName.trim()}" e workspace "${workspaceName.trim()}" foram criados com sucesso.`,
      });
      
      setOrganizationName('');
      setWorkspaceName('');
      setContactEmail('');
      setDescription('');
      onWorkspaceCreated();
    } catch (error) {
      console.error('Error creating organization and workspace:', error);
      toast({
        title: "Erro ao criar organização e workspace",
        description: "Não foi possível criar sua organização e workspace. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-semibold">
            Crie sua primeira organização
          </DialogTitle>
          <DialogDescription className="text-center text-muted-foreground">
            Para começar a usar o Scriptoryum, você precisa criar uma organização.
            Escolha um nome que represente sua empresa ou projeto.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="organization-name">Nome da organização</Label>
            <Input
              id="organization-name"
              type="text"
              placeholder="Ex: Minha Empresa, Projeto ABC..."
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
              disabled={isCreating}
              maxLength={100}
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="workspace-name">Nome do workspace</Label>
            <Input
              id="workspace-name"
              type="text"
              placeholder="Ex: Desenvolvimento, Produção..."
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              disabled={isCreating}
              maxLength={100}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact-email">Email de contato</Label>
            <Input
              id="contact-email"
              type="email"
              placeholder="contato@empresa.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              disabled={isCreating}
              maxLength={255}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Input
              id="description"
              type="text"
              placeholder="Descrição da organização..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={isCreating}
              maxLength={500}
            />
          </div>
          
          <Button 
            type="submit" 
            className="w-full" 
            disabled={isCreating || !organizationName.trim() || !workspaceName.trim() || !contactEmail.trim()}
          >
            {isCreating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Criando organização e workspace...
              </>
            ) : (
              'Criar organização e workspace'
            )}
          </Button>
        </form>
        
        <div className="text-center text-xs text-muted-foreground">
          Você poderá alterar o nome da organização posteriormente nas configurações.
        </div>
      </DialogContent>
    </Dialog>
  );
};