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
  Link,
  Unlink,
  Download,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  Eye,
  Edit,
  Save,
  X,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { documentsService } from '@/services/documents.service';
import { documentTypeService } from '@/services/documentType.service';
import {
  Document,
  DocumentTypeDto,
  DocumentFieldValueDto,
  ValidateFieldValueDto,
  ValidationStatus,
  DocumentFieldType,
} from '@/types/api';

interface DocumentTypeAssociationProps {
  document: Document;
  onDocumentUpdated?: () => void;
}

const getValidationStatusColor = (status: ValidationStatus) => {
  switch (status) {
    case 'Valid':
      return 'bg-green-100 text-green-800';
    case 'Invalid':
      return 'bg-red-100 text-red-800';
    case 'Pending':
    default:
      return 'bg-yellow-100 text-yellow-800';
  }
};

const getValidationStatusIcon = (status: ValidationStatus) => {
  switch (status) {
    case 'Valid':
      return <CheckCircle className="h-4 w-4" />;
    case 'Invalid':
      return <XCircle className="h-4 w-4" />;
    case 'Pending':
    default:
      return <AlertTriangle className="h-4 w-4" />;
  }
};

export const DocumentTypeAssociation: React.FC<DocumentTypeAssociationProps> = ({
  document,
  onDocumentUpdated,
}) => {
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [fieldValues, setFieldValues] = useState<DocumentFieldValueDto[]>([]);
  const [selectedDocumentTypeId, setSelectedDocumentTypeId] = useState<number | null>(document.documentTypeId || null);
  const [isAssociating, setIsAssociating] = useState(false);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isLoadingFieldValues, setIsLoadingFieldValues] = useState(false);
  const [editingFieldId, setEditingFieldId] = useState<number | null>(null);
  const [editingValue, setEditingValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [isAssociationDialogOpen, setIsAssociationDialogOpen] = useState(false);

  useEffect(() => {
    loadDocumentTypes();
    if (document.documentTypeId) {
      loadFieldValues();
    }
  }, [document.id, document.documentTypeId]);

  const loadDocumentTypes = async () => {
    try {
      const types = await documentTypeService.getDocumentTypes();
      setDocumentTypes(types);
    } catch (error) {
      console.error('Erro ao carregar tipos de documentos:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar tipos de documentos',
        variant: 'destructive',
      });
    }
  };

  const loadFieldValues = async () => {
    if (!document.id) return;
    
    setIsLoadingFieldValues(true);
    try {
      const values = await documentsService.getDocumentFieldValues(document.id);
      setFieldValues(values);
    } catch (error) {
      console.error('Erro ao carregar valores dos campos:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar valores dos campos',
        variant: 'destructive',
      });
    } finally {
      setIsLoadingFieldValues(false);
    }
  };

  const handleAssociateType = async () => {
    if (!selectedDocumentTypeId) return;

    setIsAssociating(true);
    try {
      const result = await documentsService.associateDocumentType(document.id, {
        documentId: document.id,
        documentTypeId: selectedDocumentTypeId,
      });

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Documento associado ao tipo com sucesso',
        });
        setIsAssociationDialogOpen(false);
        onDocumentUpdated?.();
        loadFieldValues();
      } else {
        toast({
          title: 'Erro',
          description: result.message || 'Falha ao associar documento ao tipo',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao associar tipo:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao associar documento ao tipo',
        variant: 'destructive',
      });
    } finally {
      setIsAssociating(false);
    }
  };

  const handleDissociateType = async () => {
    setIsAssociating(true);
    try {
      const result = await documentsService.dissociateDocumentType(document.id);

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Associação removida com sucesso',
        });
        setSelectedDocumentTypeId(null);
        setFieldValues([]);
        onDocumentUpdated?.();
      } else {
        toast({
          title: 'Erro',
          description: result.message || 'Falha ao remover associação',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao remover associação:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao remover associação',
        variant: 'destructive',
      });
    } finally {
      setIsAssociating(false);
    }
  };

  const handleExtractFields = async () => {
    setIsExtracting(true);
    try {
      const result = await documentsService.extractDocumentFields(document.id);

      if (result.success) {
        toast({
          title: 'Sucesso',
          description: 'Campos extraídos com sucesso',
        });
        loadFieldValues();
      } else {
        toast({
          title: 'Erro',
          description: result.message || 'Falha ao extrair campos',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao extrair campos:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao extrair campos',
        variant: 'destructive',
      });
    } finally {
      setIsExtracting(false);
    }
  };

  const handleValidateField = async (fieldValueId: number, correctedValue?: string) => {
    setIsValidating(true);
    try {
      const fieldValue = fieldValues.find(fv => fv.id === fieldValueId);
      if (!fieldValue) {
        throw new Error('Campo não encontrado');
      }

      const dto: ValidateFieldValueDto = {
        documentId: document.id,
        fieldName: fieldValue.fieldName,
        value: correctedValue || fieldValue.correctedValue || fieldValue.extractedValue || '',
      };

      const result = await documentsService.validateDocumentField(document.id, dto);

      if (result.isValid) {
        toast({
          title: 'Sucesso',
          description: 'Campo validado com sucesso',
        });
        loadFieldValues();
        setEditingFieldId(null);
        setEditingValue('');
      } else {
        toast({
          title: 'Validação',
          description: result.message || 'Campo não passou na validação',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Erro ao validar campo:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao validar campo',
        variant: 'destructive',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const startEditing = (fieldValue: DocumentFieldValueDto) => {
    setEditingFieldId(fieldValue.id);
    setEditingValue(fieldValue.correctedValue || fieldValue.extractedValue || '');
  };

  const cancelEditing = () => {
    setEditingFieldId(null);
    setEditingValue('');
  };

  const saveEdit = (fieldValueId: number) => {
    handleValidateField(fieldValueId, editingValue);
  };

  const currentDocumentType = documentTypes.find(dt => dt.id === (document.documentTypeId || selectedDocumentTypeId));

  return (
    <div className="space-y-6">
      {/* Seção de Associação de Tipo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Tipo de Documento
          </CardTitle>
          <CardDescription>
            Associe este documento a um tipo para extrair campos automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {document.documentTypeId ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="secondary">
                  {currentDocumentType?.name || 'Tipo Desconhecido'}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {currentDocumentType?.description}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExtractFields}
                  disabled={isExtracting}
                >
                  {isExtracting ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Download className="mr-2 h-4 w-4" />
                  )}
                  Extrair Campos
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="outline" size="sm" disabled={isAssociating}>
                      <Unlink className="mr-2 h-4 w-4" />
                      Remover Associação
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remover Associação</AlertDialogTitle>
                      <AlertDialogDescription>
                        Tem certeza que deseja remover a associação deste documento com o tipo?
                        Os valores dos campos extraídos serão mantidos.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancelar</AlertDialogCancel>
                      <AlertDialogAction onClick={handleDissociateType}>
                        {isAssociating ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : null}
                        Remover
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                Este documento não está associado a nenhum tipo
              </span>
              <Dialog open={isAssociationDialogOpen} onOpenChange={setIsAssociationDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Link className="mr-2 h-4 w-4" />
                    Associar Tipo
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Associar Tipo de Documento</DialogTitle>
                    <DialogDescription>
                      Selecione um tipo de documento para associar a este documento
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="documentType">Tipo de Documento</Label>
                      <Select
                        value={selectedDocumentTypeId?.toString() || ''}
                        onValueChange={(value) => setSelectedDocumentTypeId(Number(value))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {documentTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id.toString()}>
                              <div>
                                <div className="font-medium">{type.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {type.description}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      variant="outline"
                      onClick={() => setIsAssociationDialogOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button
                      onClick={handleAssociateType}
                      disabled={!selectedDocumentTypeId || isAssociating}
                    >
                      {isAssociating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : null}
                      Associar
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Seção de Valores dos Campos */}
      {document.documentTypeId && (
        <Card>
          <CardHeader>
            <CardTitle>Valores dos Campos</CardTitle>
            <CardDescription>
              Valores extraídos e validados dos campos do documento
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingFieldValues ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="ml-2">Carregando valores dos campos...</span>
              </div>
            ) : fieldValues.length === 0 ? (
              <div className="text-center py-8">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum campo extraído</h3>
                <p className="text-muted-foreground mb-4">
                  Clique em "Extrair Campos" para extrair automaticamente os valores
                </p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campo</TableHead>
                    <TableHead>Valor Extraído</TableHead>
                    <TableHead>Valor Corrigido</TableHead>
                    <TableHead>Confiança</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {fieldValues.map((fieldValue) => (
                    <TableRow key={fieldValue.id}>
                      <TableCell className="font-medium">
                        {fieldValue.fieldName}
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={fieldValue.extractedValue || 'N/A'}>
                          {fieldValue.extractedValue || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        {editingFieldId === fieldValue.id ? (
                          <div className="flex items-center gap-2">
                            <Input
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="w-32"
                            />
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => saveEdit(fieldValue.id)}
                              disabled={isValidating}
                            >
                              {isValidating ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Save className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={cancelEditing}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="max-w-xs truncate" title={fieldValue.correctedValue || 'N/A'}>
                            {fieldValue.correctedValue || 'N/A'}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {Math.round((fieldValue.confidenceScore || 0) * 100)}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getValidationStatusColor(fieldValue.validationStatus)}>
                          <div className="flex items-center gap-1">
                            {getValidationStatusIcon(fieldValue.validationStatus)}
                            {fieldValue.validationStatus}
                          </div>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {editingFieldId !== fieldValue.id && (
                            <>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => startEditing(fieldValue)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleValidateField(fieldValue.id)}
                                disabled={isValidating}
                              >
                                {isValidating ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <CheckCircle className="h-4 w-4" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentTypeAssociation;