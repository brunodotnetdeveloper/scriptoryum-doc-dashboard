import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  ArrowLeft,
  FileText,
  Calendar,
  User,
  HardDrive,
  Download,
  Loader2,
  Settings,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { documentsService } from '@/services/documents.service';
import { DocumentTypeAssociation } from '@/components/DocumentTypeAssociation';
import { DocumentTypeChangeDialog } from '@/components/DocumentTypeChangeDialog';
import { Document } from '@/types/api';
import { formatFileSize } from '@/lib/utils';

const DocumentAssociationPage: React.FC = () => {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const [document, setDocument] = useState<Document | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showChangeTypeDialog, setShowChangeTypeDialog] = useState(false);

  useEffect(() => {
    if (documentId) {
      loadDocument();
    }
  }, [documentId]);

  const loadDocument = async () => {
    if (!documentId) return;

    setIsLoading(true);
    try {
      const doc = await documentsService.getDocumentDetails(Number(documentId));
      setDocument(doc);
    } catch (error) {
      console.error('Erro ao carregar documento:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao carregar detalhes do documento',
        variant: 'destructive',
      });
      navigate('/documents');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!document) return;

    setIsDownloading(true);
    try {
      const downloadUrl = await documentsService.getDownloadUrl(document.id);
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Erro ao baixar documento:', error);
      toast({
        title: 'Erro',
        description: 'Falha ao baixar documento',
        variant: 'destructive',
      });
    } finally {
      setIsDownloading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'uploaded':
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span>Carregando documento...</span>
        </div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">Documento não encontrado</h3>
          <p className="text-muted-foreground mb-4">
            O documento solicitado não foi encontrado ou você não tem permissão para acessá-lo.
          </p>
          <Button onClick={() => navigate('/documents')}>Voltar aos Documentos</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate('/documents')}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{document.originalFileName}</h1>
            <p className="text-muted-foreground">
              Gerenciar associação de tipo e campos do documento
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowChangeTypeDialog(true)}
          >
            <Settings className="mr-2 h-4 w-4" />
            Alterar Tipo
          </Button>
          <Button
            onClick={handleDownload}
            disabled={isDownloading}
          >
            {isDownloading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
            Baixar
          </Button>
        </div>
      </div>

      {/* Informações do Documento */}
      <Card>
        <CardHeader>
          <CardTitle>Informações do Documento</CardTitle>
          <CardDescription>
            Detalhes básicos sobre o documento
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                Nome do Arquivo
              </div>
              <div className="font-medium">{document.originalFileName}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <HardDrive className="h-4 w-4" />
                Tamanho
              </div>
              <div className="font-medium">{formatFileSize(document.fileSize)}</div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                Data de Upload
              </div>
              <div className="font-medium">
                {new Date(document.uploadedAt).toLocaleDateString('pt-BR')}
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                Status
              </div>
              <Badge className={getStatusColor(document.status)}>
                {document.status}
              </Badge>
            </div>
          </div>
          
          {document.summary && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Resumo</div>
                <div className="text-sm">{document.summary}</div>
              </div>
            </>
          )}
          
          {document.description && (
            <>
              <Separator className="my-4" />
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Descrição</div>
                <div className="text-sm">{document.description}</div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Componente de Associação de Tipo */}
      <DocumentTypeAssociation
        document={document}
        onDocumentUpdated={loadDocument}
      />

      {/* Diálogo de Alteração de Tipo */}
      {document && (
        <DocumentTypeChangeDialog
          open={showChangeTypeDialog}
          onOpenChange={setShowChangeTypeDialog}
          document={document}
          onDocumentUpdated={loadDocument}
        />
      )}
    </div>
  );
};

export default DocumentAssociationPage;