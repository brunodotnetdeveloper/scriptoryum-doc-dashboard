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
  FileText,
  Plus,
  Edit,
  Trash2,
  Copy,
  Search,
  Eye,
  EyeOff,
  Download,
  Upload,
  Globe,
  Lock,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { documentTypeTemplateService } from '@/services/documentType.service';
import {
  DocumentTypeTemplateDto,
  CreateDocumentTypeTemplateDto,
  ApplyTemplateDto,
  DocumentTypeDto,
} from '@/types/api';

interface DocumentTypeTemplateManagementProps {
  className?: string;
  onTemplateApplied?: (newDocumentType: DocumentTypeDto) => void;
}

export const DocumentTypeTemplateManagement: React.FC<DocumentTypeTemplateManagementProps> = ({ 
  className,
  onTemplateApplied 
}) => {
  const [templates, setTemplates] = useState<DocumentTypeTemplateDto[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DocumentTypeTemplateDto | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [categories, setCategories] = useState<string[]>([]);

  const [formData, setFormData] = useState<CreateDocumentTypeTemplateDto>({
    name: '',
    description: '',
    category: '',
    isPublic: false,
    templateData: {
      name: '',
      description: '',
      fields: [],
    },
  });

  const [applyFormData, setApplyFormData] = useState<ApplyTemplateDto>({
    templateId: 0,
    documentTypeName: '',
    fieldCustomizations: {},
  });

  useEffect(() => {
    loadTemplates();
    loadCategories();
  }, []);

  const loadTemplates = async () => {
    try {
      setIsLoading(true);
      const templatesData = await documentTypeTemplateService.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      toast({
        title: 'Erro ao carregar templates',
        description: 'Não foi possível carregar os templates.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const categoriesData = await documentTypeTemplateService.getCategories();
      setCategories(categoriesData);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    }
  };

  const handleCreateTemplate = async () => {
    try {
      setIsLoading(true);
      await documentTypeTemplateService.createTemplate(formData);
      await loadTemplates();
      setIsCreateDialogOpen(false);
      resetForm();
      toast({
        title: 'Template criado',
        description: 'O template foi criado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao criar template',
        description: 'Não foi possível criar o template.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplate) return;

    try {
      setIsLoading(true);
      const applyData = {
        ...applyFormData,
        templateId: selectedTemplate.id,
      };
      const newDocumentType = await documentTypeTemplateService.applyTemplate(applyData.templateId, applyData);
      
      setIsApplyDialogOpen(false);
      setSelectedTemplate(null);
      setApplyFormData({
        templateId: 0,
        documentTypeName: '',
        fieldCustomizations: {},
      });
      
      toast({
        title: 'Template aplicado',
        description: 'O tipo de documento foi criado a partir do template.',
      });

      if (onTemplateApplied) {
        onTemplateApplied(newDocumentType);
      }
    } catch (error) {
      toast({
        title: 'Erro ao aplicar template',
        description: 'Não foi possível aplicar o template.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: number) => {
    try {
      await documentTypeTemplateService.deleteTemplate(id);
      await loadTemplates();
      toast({
        title: 'Template excluído',
        description: 'O template foi excluído com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao excluir template',
        description: 'Não foi possível excluir o template.',
        variant: 'destructive',
      });
    }
  };

  const handleDuplicateTemplate = async (template: DocumentTypeTemplateDto) => {
    try {
      await documentTypeTemplateService.duplicateTemplate(template.id, template.templateData.name);
      await loadTemplates();
      toast({
        title: 'Template duplicado',
        description: 'O template foi duplicado com sucesso.',
      });
    } catch (error) {
      toast({
        title: 'Erro ao duplicar template',
        description: 'Não foi possível duplicar o template.',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      isPublic: false,
      templateData: {
        name: '',
        description: '',
        fields: [],
      },
    });
  };

  const openApplyDialog = (template: DocumentTypeTemplateDto) => {
    setSelectedTemplate(template);
    setApplyFormData({
      templateId: template.id,
      documentTypeName: template.templateData.name,
      fieldCustomizations: {},
    });
    setIsApplyDialogOpen(true);
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (template.description && template.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <div className={className}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Templates de Tipos de Documentos</h2>
            <p className="text-muted-foreground">
              Gerencie templates reutilizáveis para criação rápida de tipos de documentos
            </p>
          </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Novo Template
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Criar Novo Template</DialogTitle>
                <DialogDescription>
                  Crie um template reutilizável para tipos de documentos.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="template-name">Nome do Template</Label>
                  <Input
                    id="template-name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Contrato Padrão"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template-description">Descrição</Label>
                  <Textarea
                    id="template-description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Descreva o template..."
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="template-category">Categoria</Label>
                  <Input
                    id="template-category"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ex: Contratos, Faturas, RH"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="document-type-name">Nome do Tipo de Documento</Label>
                  <Input
                    id="document-type-name"
                    value={formData.templateData.name}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      templateData: { ...formData.templateData, name: e.target.value }
                    })}
                    placeholder="Nome do tipo de documento que será criado"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="template-public"
                    checked={formData.isPublic}
                    onCheckedChange={(checked) => setFormData({ ...formData, isPublic: checked })}
                  />
                  <Label htmlFor="template-public">Template Público</Label>
                </div>
              </div>
              <DialogFooter>
                <Button
                  type="submit"
                  onClick={handleCreateTemplate}
                  disabled={isLoading || !formData.name.trim()}
                >
                  {isLoading ? 'Criando...' : 'Criar'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredTemplates.map((template) => (
            <Card key={template.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      {template.name}
                      {template.isPublic ? (
                        <Globe className="h-4 w-4 text-green-600" />
                      ) : (
                        <Lock className="h-4 w-4 text-gray-600" />
                      )}
                    </CardTitle>
                    {template.description && (
                      <CardDescription>{template.description}</CardDescription>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {template.category && (
                    <Badge variant="secondary">{template.category}</Badge>
                  )}
                  <Badge variant="outline">
                    {template.templateData.fields?.length || 0} campos
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Criado em {new Date(template.createdAt).toLocaleDateString('pt-BR')}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openApplyDialog(template)}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDuplicateTemplate(template)}
                    >
                      <Copy className="h-4 w-4" />
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
                            Tem certeza que deseja excluir o template "{template.name}"?
                            Esta ação não pode ser desfeita.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDeleteTemplate(template.id)}
                          >
                            Excluir
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">Nenhum template encontrado</h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Tente ajustar sua busca ou filtros' 
                : 'Comece criando seu primeiro template'}
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Criar Primeiro Template
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Dialog de Aplicar Template */}
      <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Aplicar Template</DialogTitle>
            <DialogDescription>
              Crie um novo tipo de documento a partir do template "{selectedTemplate?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="new-document-type-name">Nome do Novo Tipo de Documento</Label>
              <Input
                id="new-document-type-name"
                value={applyFormData.documentTypeName}
                onChange={(e) => setApplyFormData({ 
                  ...applyFormData, 
                  documentTypeName: e.target.value 
                })}
                placeholder="Nome do tipo de documento"
              />
            </div>
            {selectedTemplate && (
              <div className="space-y-2">
                <Label>Campos que serão criados:</Label>
                <div className="text-sm text-muted-foreground space-y-1">
                  {selectedTemplate.templateData.fields?.map((field, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {field.fieldName}
                      </Badge>
                      <span className="text-xs">{field.fieldType}</span>
                    </div>
                  )) || <span>Nenhum campo configurado</span>}
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="submit"
              onClick={handleApplyTemplate}
              disabled={isLoading || !applyFormData.documentTypeName.trim()}
            >
              {isLoading ? 'Aplicando...' : 'Aplicar Template'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentTypeTemplateManagement;