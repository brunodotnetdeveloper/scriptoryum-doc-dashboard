import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { documentsService, documentTypeService } from '@/services';
import { toast } from '@/hooks/use-toast';
import { DocumentTypeDto, Document, DocumentFieldValueDto } from '@/types/api';
import { Loader2, AlertTriangle, CheckCircle, FileType, ArrowRight } from 'lucide-react';

interface DocumentTypeChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  document: Document;
  onDocumentUpdated?: () => void;
}

interface FieldMigrationInfo {
  fieldName: string;
  currentValue?: string;
  willBeLost: boolean;
  canMigrate: boolean;
  targetFieldName?: string;
}

export const DocumentTypeChangeDialog: React.FC<DocumentTypeChangeDialogProps> = ({
  open,
  onOpenChange,
  document,
  onDocumentUpdated
}) => {
  const [documentTypes, setDocumentTypes] = useState<DocumentTypeDto[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<number>(0);
  const [currentFieldValues, setCurrentFieldValues] = useState<DocumentFieldValueDto[]>([]);
  const [currentType, setCurrentType] = useState<DocumentTypeDto | null>(null);
  const [migrationInfo, setMigrationInfo] = useState<FieldMigrationInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [loadingTypes, setLoadingTypes] = useState(false);

  // Carregar tipos de documentos disponíveis
  useEffect(() => {
    if (open) {
      loadDocumentTypes();
      loadCurrentFieldValues();
      loadCurrentDocumentType();
    }
  }, [open, document.id]);

  // Analisar migração quando tipo é selecionado
  useEffect(() => {
    if (selectedTypeId && currentFieldValues.length > 0 && currentType) {
      analyzeMigration();
    }
  }, [selectedTypeId, currentFieldValues, currentType]);

  const loadDocumentTypes = async () => {
    try {
      setLoadingTypes(true);
      const types = await documentTypeService.getDocumentTypes();
      // Filtrar o tipo atual do documento
      const availableTypes = types.filter(type => type.id !== document.documentTypeId);
      setDocumentTypes(availableTypes);
    } catch (error) {
      console.error('Erro ao carregar tipos de documentos:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar os tipos de documentos.',
        variant: 'destructive',
      });
    } finally {
      setLoadingTypes(false);
    }
  };

  const loadCurrentDocumentType = async () => {
    if (document.documentTypeId) {
      try {
        const type = await documentTypeService.getDocumentType(document.documentTypeId);
        setCurrentType(type);
      } catch (error) {
        console.error('Erro ao carregar tipo atual do documento:', error);
      }
    }
  };

  const loadCurrentFieldValues = async () => {
    try {
      const fieldValues = await documentsService.getDocumentFieldValues(document.id);
      setCurrentFieldValues(fieldValues);
    } catch (error) {
      console.error('Erro ao carregar valores dos campos:', error);
    }
  };

  const analyzeMigration = async () => {
    try {
      setAnalyzing(true);
      const selectedType = documentTypes.find(type => type.id === selectedTypeId);
      if (!selectedType) return;

      const migration: FieldMigrationInfo[] = [];

      // Analisar cada campo atual
      for (const fieldValue of currentFieldValues) {
        // Buscar o campo correspondente no tipo atual do documento
        const currentField = currentType?.fields?.find(f => f.fieldName === fieldValue.fieldName);
        if (!currentField) continue;

        // Procurar campo compatível no novo tipo
        const compatibleField = selectedType.fields?.find(field => 
          field.fieldName.toLowerCase() === currentField.fieldName.toLowerCase() &&
          field.fieldType === currentField.fieldType
        );

        migration.push({
          fieldName: currentField.fieldName,
          currentValue: fieldValue.finalValue || fieldValue.correctedValue || fieldValue.extractedValue,
          willBeLost: !compatibleField,
          canMigrate: !!compatibleField,
          targetFieldName: compatibleField?.fieldName
        });
      }

      setMigrationInfo(migration);
    } catch (error) {
      console.error('Erro ao analisar migração:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleChangeDocumentType = async () => {
    if (!selectedTypeId) return;

    try {
      setLoading(true);

      // Primeiro, dissociar o tipo atual
      if (document.documentTypeId) {
        await documentsService.dissociateDocumentType(document.id);
      }

      // Associar o novo tipo
      await documentsService.associateDocumentType(document.id, {
          documentId: document.id,
          documentTypeId: selectedTypeId
        });

      // Migrar campos compatíveis
      const compatibleMigrations = migrationInfo.filter(info => info.canMigrate && info.currentValue);
      for (const migration of compatibleMigrations) {
        if (migration.targetFieldName && migration.currentValue) {
          try {
            await documentsService.validateDocumentField(document.id, {
              documentId: document.id,
              fieldName: migration.targetFieldName,
              value: migration.currentValue
            });
          } catch (error) {
            console.warn(`Erro ao migrar campo ${migration.fieldName}:`, error);
          }
        }
      }

      toast({
        title: 'Sucesso',
        description: `Tipo de documento alterado com sucesso. ${compatibleMigrations.length} campos foram migrados.`,
      });

      onDocumentUpdated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Erro ao alterar tipo do documento:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível alterar o tipo do documento.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const selectedType = documentTypes.find(type => type.id === selectedTypeId);
  const fieldsWillBeLost = migrationInfo.filter(info => info.willBeLost && info.currentValue);
  const fieldsWillMigrate = migrationInfo.filter(info => info.canMigrate && info.currentValue);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileType className="h-5 w-5" />
            Alterar Tipo de Documento
          </DialogTitle>
          <DialogDescription>
            Altere o tipo do documento "{document.originalFileName}". 
            Os campos serão analisados para migração automática.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Seleção do novo tipo */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Novo Tipo de Documento</label>
            <Select value={selectedTypeId.toString()} onValueChange={(value) => setSelectedTypeId(parseInt(value))} disabled={loadingTypes}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um tipo de documento" />
              </SelectTrigger>
              <SelectContent>
                {documentTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{type.name}</span>
                      <Badge variant="outline" className="ml-2">
                        {type.fields?.length || 0} campos
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Análise de migração */}
          {selectedTypeId && (
            <div className="space-y-4">
              <Separator />
              
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Análise de Migração</h3>
                {analyzing && <Loader2 className="h-4 w-4 animate-spin" />}
              </div>

              {selectedType && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base flex items-center gap-2">
                      <ArrowRight className="h-4 w-4" />
                      {selectedType.name}
                    </CardTitle>
                    <CardDescription>
                      {selectedType.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Campos que serão migrados */}
                    {fieldsWillMigrate.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <CheckCircle className="h-4 w-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            Campos que serão migrados ({fieldsWillMigrate.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {fieldsWillMigrate.map((info, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded">
                              <span className="text-sm font-medium">{info.fieldName}</span>
                              <span className="text-xs text-muted-foreground truncate max-w-32">
                                {info.currentValue}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Campos que serão perdidos */}
                    {fieldsWillBeLost.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          <span className="text-sm font-medium text-amber-600">
                            Campos que serão perdidos ({fieldsWillBeLost.length})
                          </span>
                        </div>
                        <div className="space-y-2">
                          {fieldsWillBeLost.map((info, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-amber-50 rounded">
                              <span className="text-sm font-medium">{info.fieldName}</span>
                              <span className="text-xs text-muted-foreground truncate max-w-32">
                                {info.currentValue}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {migrationInfo.length === 0 && !analyzing && (
                      <div className="text-center py-4 text-muted-foreground">
                        <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-600" />
                        <p>Nenhum campo atual será afetado pela mudança.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Aviso sobre perda de dados */}
              {fieldsWillBeLost.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Atenção:</strong> {fieldsWillBeLost.length} campo(s) com dados serão perdidos 
                    pois não existem campos compatíveis no novo tipo de documento.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleChangeDocumentType} 
            disabled={!selectedTypeId || loading || analyzing}
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Alterar Tipo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};