
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { documentsService } from '@/services';
import { toast } from '@/hooks/use-toast';
import { Upload, File, X, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

interface UploadedFile {
  file: File;
  status: 'uploading' | 'success' | 'error';
  documentId?: number;
  error?: string;
}

export const UploadPage: React.FC = () => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [description, setDescription] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const acceptedFormats = ['pdf', 'docx', 'doc', 'txt', 'rtf', 'odt', 'html', 'xml'];
  const maxFileSize = 10 * 1024 * 1024; // 10MB

  const validateFile = (file: File): string | null => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    
    if (!extension || !acceptedFormats.includes(extension)) {
      return `Formato não suportado. Formatos aceitos: ${acceptedFormats.join(', ').toUpperCase()}`;
    }
    
    if (file.size > maxFileSize) {
      return 'Arquivo muito grande. Tamanho máximo: 10MB';
    }
    
    return null;
  };

  const handleFileSelect = (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const newFiles: UploadedFile[] = [];
    
    Array.from(selectedFiles).forEach(file => {
      const error = validateFile(file);
      if (error) {
        toast({
          title: "Erro no arquivo",
          description: `${file.name}: ${error}`,
          variant: "destructive",
        });
        return;
      }
      
      newFiles.push({
        file,
        status: 'uploading',
      });
    });

    setFiles(prev => [...prev, ...newFiles]);
    
    // Upload cada arquivo
    newFiles.forEach((uploadFile, index) => {
      uploadDocument(uploadFile, files.length + index);
    });
  };

  const uploadDocument = async (uploadFile: UploadedFile, index: number) => {
    try {
      const response = await documentsService.uploadDocument(uploadFile.file, description);
      
      if (response.success) {
        setFiles(prev => prev.map((f, i) => 
          i === index 
            ? { ...f, status: 'success' as const, documentId: response.documentId }
            : f
        ));
        
        toast({
          title: "Upload realizado com sucesso!",
          description: `${uploadFile.file.name} foi enviado com sucesso.`,
        });
      } else {
        throw new Error(response.message || 'Erro no upload');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      
      setFiles(prev => prev.map((f, i) => 
        i === index 
          ? { ...f, status: 'error' as const, error: errorMessage }
          : f
      ));
      
      toast({
        title: "Erro no upload",
        description: `${uploadFile.file.name}: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload de Documentos</h1>
        <p className="text-muted-foreground mt-1">
          Envie documentos para análise inteligente com IA
        </p>
      </div>

      {/* Upload Area */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-card-foreground">Selecionar Documentos</CardTitle>
          <CardDescription className="text-muted-foreground">
            Formatos suportados: {acceptedFormats.join(', ').toUpperCase()} (máx. 10MB cada)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Descrição */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground">
              Descrição (opcional)
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Adicione uma descrição para os documentos..."
              className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              rows={3}
            />
          </div>

          {/* Área de Drop */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors cursor-pointer ${
              isDragOver
                ? 'border-primary bg-primary/10'
                : 'border-border hover:border-primary/50 hover:bg-accent/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">
              Arraste arquivos aqui ou clique para selecionar
            </h3>
            <p className="text-muted-foreground">
              Você pode selecionar múltiplos arquivos de uma vez
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.doc,.txt,.rtf,.odt,.html,.xml"
            onChange={(e) => handleFileSelect(e.target.files)}
            className="hidden"
          />

          <Button
            onClick={() => fileInputRef.current?.click()}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            <Upload className="mr-2 h-4 w-4" />
            Selecionar Arquivos
          </Button>
        </CardContent>
      </Card>

      {/* Lista de Arquivos */}
      {files.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-card-foreground">Arquivos Selecionados</CardTitle>
            <CardDescription className="text-muted-foreground">
              {files.length} arquivo{files.length > 1 ? 's' : ''} selecionado{files.length > 1 ? 's' : ''}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {files.map((uploadFile, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border/50"
                >
                  <File className="h-5 w-5 text-primary flex-shrink-0" />
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {uploadFile.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(uploadFile.file.size)}
                    </p>
                    {uploadFile.error && (
                      <p className="text-xs text-destructive mt-1">
                        {uploadFile.error}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 flex-shrink-0">
                    {uploadFile.status === 'uploading' && (
                      <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    )}
                    {uploadFile.status === 'success' && (
                      <CheckCircle className="h-4 w-4 text-success" />
                    )}
                    {uploadFile.status === 'error' && (
                      <AlertCircle className="h-4 w-4 text-destructive" />
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
