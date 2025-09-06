import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Plus,
  Edit,
  Trash2,
  Settings,
  Search,
  ChevronUp,
  ChevronDown,
  GripVertical,
  Eye,
  EyeOff,
  FileText,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { documentTypeService } from '@/services/documentType.service';
import {
  DocumentTypeDto,
  CreateDocumentTypeDto,
  UpdateDocumentTypeDto,
  DocumentTypeFieldDto,
  CreateDocumentTypeFieldDto,
  UpdateDocumentTypeFieldDto,
  DocumentFieldType,
} from '@/types/api';

interface DocumentTypeManagementProps {
  className?: string;
}

const FIELD_TYPE_OPTIONS: { value: DocumentFieldType; label: string; description: string }[] = [
  { value: 'TEXT', label: 'Texto', description: 'Campo de texto simples' },
  { value: 'TEXTAREA', label: 'Texto Longo', description: 'Campo de texto com múltiplas linhas' },
  { value: 'NUMBER', label: 'Número', description: 'Campo numérico' },
  { value: 'CURRENCY', label: 'Moeda', description: 'Valor monetário' },
  { value: 'PERCENTAGE', label: 'Porcentagem', description: 'Valor percentual' },
  { value: 'DATE', label: 'Data', description: 'Campo de data' },
  { value: 'EMAIL', label: 'E-mail', description: 'Endereço de e-mail' },
  { value: 'URL', label: 'URL', description: 'Endereço web' },
  { value: 'PHONE', label: 'Telefone', description: 'Número de telefone' },
  { value: 'CNPJ', label: 'CNPJ', description: 'CNPJ brasileiro' },
  { value: 'CPF', label: 'CPF', description: 'CPF brasileiro' },
  { value: 'BOOLEAN', label: 'Sim/Não', description: 'Campo verdadeiro/falso' },
  { value: 'SELECT', label: 'Seleção', description: 'Lista de opções (uma escolha)' },
  { value: 'MULTISELECT', label: 'Múltipla Seleção', description: 'Lista de opções (múltiplas escolhas)' },
];

import { DocumentTypeTemplateManagement } from '@/components/DocumentTypeTemplateManagement';

export const DocumentTypeManagement: React.FC<DocumentTypeManagementProps> = ({ className }) => {
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [selectedDocumentType, setSelectedDocumentType] = useState<DocumentTypeDto | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isFieldDialogOpen, setIsFieldDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingField, setEditingField] = useState<DocumentTypeFieldDto | null>(null);

  const [formData, setFormData] = useState<CreateDocumentTypeDto>({
    name: '',
    description: '',
    isActive: true,
  });

  const [fieldFormData, setFieldFormData] = useState<CreateDocumentTypeFieldDto>({
    fieldName: '',
    fieldType: 'TEXT',
    isRequired: false,
    displayOrder: 0,
    validationRegex: '',
    validationMessage: '',
    defaultValue: '',
    selectOptions: [],
    helpText: '',
    isActive: true,
  });

  useEffect(() => {
    loadDocumentTypes();
  }, []);

  const loadDocumentTypes = async () => {
    try {
      setIsLoading(true);
      const types = await documentTypeService.getDocumentTypes();
      setDocumentTypes(types);
    } catch (error) {
      toast({
        title: 'Erro ao carregar tipos de documentos',
        description: 'Não foi possível carregar os tipos de documentos.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateDocumentType = async () => {
    try {
      setIsLoading(true);
      await documentTypeService.createDocumentType(formData);
      await loadDocumentTypes();
      setIsCreateDialogOpen(false);
      setFormData({ name: '', description: '', isActive: true });
      toast({
        title: 'Tipo de documento criado',
        description: 'O tipo de documento foi criado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar tipo de documento',
        description: 'Não foi possível criar o tipo de documento.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateDocumentType = async () => {
    if (!selectedDocumentType) return;

    try {
      setIsLoading(true);
      const updateData: UpdateDocumentTypeDto = {
        name: formData.name,
        description: formData.description,
        isActive: formData.isActive ?? true,
      };
      await documentTypeService.updateDocumentType(selectedDocumentType.id, updateData);
      await loadDocumentTypes();
      setIsEditDialogOpen(false);
      setSelectedDocumentType(null);
      toast({
        title: 'Tipo de documento atualizado',
        description: 'O tipo de documento foi atualizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar tipo de documento',
        description: 'Não foi possível atualizar o tipo de documento.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteDocumentType = async (id: number) => {
    try {
      const canDelete = await documentTypeService.canDeleteDocumentType(id);
      if (!canDelete.canDelete) {
        toast({
          title: 'Não é possível excluir',
          description: canDelete.reason || 'Este tipo de documento não pode ser excluído.',
          variant: 'destructive',
        });
        return;
      }

      await documentTypeService.deleteDocumentType(id);
      await loadDocumentTypes();
      toast({
        title: 'Tipo de documento excluído',
        description: 'O tipo de documento foi excluído com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir tipo de documento',
        description: 'Não foi possível excluir o tipo de documento.',
        variant: 'destructive',
      });
    }
  };

  const handleAddField = async () => {
    if (!selectedDocumentType) return;

    try {
      setIsLoading(true);
      const newFieldData = {
        ...fieldFormData,
        displayOrder: selectedDocumentType.fields.length + 1,
      };
      await documentTypeService.addField(selectedDocumentType.id, newFieldData);
      
      // Recarregar o tipo de documento selecionado
      const updatedType = await documentTypeService.getDocumentType(selectedDocumentType.id);
      setSelectedDocumentType(updatedType);
      
      await loadDocumentTypes();
      setIsFieldDialogOpen(false);
      resetFieldForm();
      toast({
        title: 'Campo adicionado',
        description: 'O campo foi adicionado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao adicionar campo',
        description: 'Não foi possível adicionar o campo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateField = async () => {
    if (!selectedDocumentType || !editingField) return;

    try {
      setIsLoading(true);
      const updateData: UpdateDocumentTypeFieldDto = {
        fieldName: fieldFormData.fieldName,
        fieldType: fieldFormData.fieldType,
        isRequired: fieldFormData.isRequired ?? false,
        displayOrder: fieldFormData.displayOrder ?? 0,
        validationRegex: fieldFormData.validationRegex,
        validationMessage: fieldFormData.validationMessage,
        defaultValue: fieldFormData.defaultValue,
        selectOptions: fieldFormData.selectOptions,
        helpText: fieldFormData.helpText,
        isActive: fieldFormData.isActive ?? true,
      };
      
      await documentTypeService.updateField(selectedDocumentType.id, editingField.id, updateData);
      
      // Recarregar o tipo de documento selecionado
      const updatedType = await documentTypeService.getDocumentType(selectedDocumentType.id);
      setSelectedDocumentType(updatedType);
      
      await loadDocumentTypes();
      setIsFieldDialogOpen(false);
      setEditingField(null);
      resetFieldForm();
      toast({
        title: 'Campo atualizado',
        description: 'O campo foi atualizado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao atualizar campo',
        description: 'Não foi possível atualizar o campo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveField = async (fieldId: number) => {
    if (!selectedDocumentType) return;

    try {
      await documentTypeService.removeField(selectedDocumentType.id, fieldId);
      
      // Recarregar o tipo de documento selecionado
      const updatedType = await documentTypeService.getDocumentType(selectedDocumentType.id);
      setSelectedDocumentType(updatedType);
      
      await loadDocumentTypes();
      toast({
        title: 'Campo removido',
        description: 'O campo foi removido com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao remover campo',
        description: 'Não foi possível remover o campo.',
        variant: 'destructive',
      });
    }
  };

  const resetFieldForm = () => {
    setFieldFormData({
      fieldName: '',
      fieldType: 'TEXT',
      isRequired: false,
      displayOrder: 0,
      validationRegex: '',
      validationMessage: '',
      defaultValue: '',
      selectOptions: [],
      helpText: '',
      isActive: true,
    });
  };

  const openEditDialog = (documentType: DocumentTypeDto) => {
    setSelectedDocumentType(documentType);
    setFormData({
      name: documentType.name,
      description: documentType.description || '',
      isActive: documentType.isActive,
    });
    setIsEditDialogOpen(true);
  };

  const openFieldDialog = (field?: DocumentTypeFieldDto) => {
    if (field) {
      setEditingField(field);
      setFieldFormData({
        fieldName: field.fieldName,
        fieldType: field.fieldType,
        isRequired: field.isRequired,
        displayOrder: field.displayOrder,
        validationRegex: field.validationRegex || '',
        validationMessage: field.validationMessage || '',
        defaultValue: field.defaultValue || '',
        selectOptions: field.selectOptions || [],
        helpText: field.helpText || '',
        isActive: field.isActive,
      });
    } else {
      setEditingField(null);
      resetFieldForm();
    }
    setIsFieldDialogOpen(true);
  };

  const filteredDocumentTypes = documentTypes.filter(type =>
    type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (type.description && type.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className={className}>
      <Tabs defaultValue="types" className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Gestão de Tipos de Documentos</h2>
            <p className="text-muted-foreground">
              Configure tipos de documentos, campos dinâmicos e templates reutilizáveis
            </p>
          </div>
        </div>

        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-flex">
          <TabsTrigger value="types" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Tipos de Documentos</span>
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            <span>Templates</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="types" className="space-y-6">
          <div className="flex items-center justify-between">
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Tipo
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Tipo de Documento</DialogTitle>
                <DialogDescription>
                  Defina um novo tipo de documento para categorizar seus arquivos.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Contrato de Prestação de Serviços"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="description">Descrição</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o tipo de documento..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Ativo</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleCreateDocumentType}
                  disabled={isLoading || !formData.name.trim()}
                >
                  {isLoading ? 'Criando...' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar tipos de documentos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="grid gap-4">
          {filteredDocumentTypes.map((documentType) => (
            <Card key={documentType.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {documentType.name}
                      {!documentType.isActive && (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </CardTitle>
                    {documentType.description && (
                      <CardDescription>{documentType.description}</CardDescription>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline">
                      {documentType.fields.length} campos
                    </Badge>
                    {documentType.documentsCount !== undefined && (
                      <Badge variant="outline">
                        {documentType.documentsCount} documentos
                      </Badge>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedDocumentType(documentType);
                      }}
                    >
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(documentType)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                          <AlertDialogDescription>
                            Tem certeza que deseja excluir o tipo de documento "{documentType.name}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteDocumentType(documentType.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardHeader>
              
              {selectedDocumentType?.id === documentType.id && (
                <CardContent>
                  <Tabs defaultValue="fields" className="w-full">
                    <TabsList>
                      <TabsTrigger value="fields">Campos</TabsTrigger>
                      <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="fields" className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium">Campos do Documento</h4>
                        <Button
                          size="sm"
                          onClick={() => openFieldDialog()}
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Adicionar Campo
                        </Button>
                      </div>
                      
                      {documentType.fields.length === 0 ? (
                        <div className="text-center py-8 text-muted-foreground">
                          <FileText className="mx-auto h-12 w-12 mb-4 opacity-50" />
                          <p>Nenhum campo configurado</p>
                          <p className="text-sm">Adicione campos para estruturar a extração de dados</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {documentType.fields
                            .sort((a, b) => a.displayOrder - b.displayOrder)
                            .map((field) => (
                            <div
                              key={field.id}
                              className="flex items-center justify-between p-3 border rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <GripVertical className="h-4 w-4 text-muted-foreground" />
                                <div>
                                  <div className="flex items-center space-x-2">
                                    <span className="font-medium">{field.fieldName}</span>
                                    <Badge variant="secondary" className="text-xs">
                                      {FIELD_TYPE_OPTIONS.find(opt => opt.value === field.fieldType)?.label || field.fieldType}
                                    </Badge>
                                    {field.isRequired && (
                                      <Badge variant="destructive" className="text-xs">
                                        Obrigatório
                                      </Badge>
                                    )}
                                    {!field.isActive && (
                                      <Badge variant="outline" className="text-xs">
                                        Inativo
                                      </Badge>
                                    )}
                                  </div>
                                  {field.helpText && (
                                    <p className="text-sm text-muted-foreground">{field.helpText}</p>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openFieldDialog(field)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button variant="ghost" size="sm">
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Confirmar remoção</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Tem certeza que deseja remover o campo "{field.fieldName}"?
                                        Esta ação não pode ser desfeita.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleRemoveField(field.id)}
                                      >
                                        Remover
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </TabsContent>
                    
                    <TabsContent value="statistics">
                      <div className="text-center py-8 text-muted-foreground">
                        <p>Estatísticas em desenvolvimento</p>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              )}
            </Card>
          ))}
        </div>

        {filteredDocumentTypes.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum tipo de documento encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm ? 'Tente ajustar sua busca' : 'Comece criando seu primeiro tipo de documento'}
            </p>
            {!searchTerm && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Tipo
              </Button>
            )}
          </div>
        )}
        </TabsContent>

        <TabsContent value="templates">
          <DocumentTypeTemplateManagement 
            onTemplateApplied={loadDocumentTypes}
          />
        </TabsContent>
      </Tabs>

      {/* Dialog de Edição de Tipo de Documento */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Editar Tipo de Documento</DialogTitle>
            <DialogDescription>
              Atualize as informações do tipo de documento.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Descrição</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="edit-isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
              <Label htmlFor="edit-isActive">Ativo</Label>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleUpdateDocumentType}
              disabled={isLoading || !formData.name.trim()}
            >
              {isLoading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog de Campo */}
      <Dialog open={isFieldDialogOpen} onOpenChange={setIsFieldDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingField ? 'Editar Campo' : 'Adicionar Campo'}
            </DialogTitle>
            <DialogDescription>
              {editingField ? 'Atualize as configurações do campo.' : 'Configure um novo campo para extração de dados.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="field-name">Nome do Campo</Label>
                <Input
                  id="field-name"
                  value={fieldFormData.fieldName}
                  onChange={(e) => setFieldFormData({ ...fieldFormData, fieldName: e.target.value })}
                  placeholder="Ex: Valor do Contrato"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="field-type">Tipo do Campo</Label>
                <Select
                  value={fieldFormData.fieldType}
                  onValueChange={(value: DocumentFieldType) => 
                    setFieldFormData({ ...fieldFormData, fieldType: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-xs text-muted-foreground">{option.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="field-help">Texto de Ajuda</Label>
              <Input
                id="field-help"
                value={fieldFormData.helpText}
                onChange={(e) => setFieldFormData({ ...fieldFormData, helpText: e.target.value })}
                placeholder="Descrição para ajudar na extração..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="field-default">Valor Padrão</Label>
                <Input
                  id="field-default"
                  value={fieldFormData.defaultValue}
                  onChange={(e) => setFieldFormData({ ...fieldFormData, defaultValue: e.target.value })}
                  placeholder="Valor padrão (opcional)"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="field-order">Ordem de Exibição</Label>
                <Input
                  id="field-order"
                  type="number"
                  value={fieldFormData.displayOrder}
                  onChange={(e) => setFieldFormData({ ...fieldFormData, displayOrder: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            {(fieldFormData.fieldType === 'SELECT' || fieldFormData.fieldType === 'MULTISELECT') && (
              <div className="grid gap-2">
                <Label htmlFor="field-options">Opções (uma por linha)</Label>
                <Textarea
                  id="field-options"
                  value={fieldFormData.selectOptions?.join('\n') || ''}
                  onChange={(e) => setFieldFormData({ 
                    ...fieldFormData, 
                    selectOptions: e.target.value.split('\n').filter(opt => opt.trim()) 
                  })}
                  placeholder="Opção 1\nOpção 2\nOpção 3"
                  rows={4}
                />
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="field-regex">Regex de Validação (opcional)</Label>
              <Input
                id="field-regex"
                value={fieldFormData.validationRegex}
                onChange={(e) => setFieldFormData({ ...fieldFormData, validationRegex: e.target.value })}
                placeholder="Ex: ^\d{2}\.\d{3}\.\d{3}/\d{4}-\d{2}$ (para CNPJ)"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="field-validation-message">Mensagem de Validação</Label>
              <Input
                id="field-validation-message"
                value={fieldFormData.validationMessage}
                onChange={(e) => setFieldFormData({ ...fieldFormData, validationMessage: e.target.value })}
                placeholder="Mensagem exibida quando a validação falha"
              />
            </div>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="field-required"
                  checked={fieldFormData.isRequired}
                  onCheckedChange={(checked) => setFieldFormData({ ...fieldFormData, isRequired: checked })}
                />
                <Label htmlFor="field-required">Campo Obrigatório</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="field-active"
                  checked={fieldFormData.isActive}
                  onCheckedChange={(checked) => setFieldFormData({ ...fieldFormData, isActive: checked })}
                />
                <Label htmlFor="field-active">Campo Ativo</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={editingField ? handleUpdateField : handleAddField}
              disabled={isLoading || !fieldFormData.fieldName.trim()}
            >
              {isLoading ? 'Salvando...' : (editingField ? 'Atualizar' : 'Adicionar')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentTypeManagement;