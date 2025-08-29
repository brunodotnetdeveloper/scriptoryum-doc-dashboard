import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { BookmarkPlus, Quote, Copy, X, FileText, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { THEME_SIZES, THEME_SPACING, THEME_TEXT, THEME_VARIANTS } from '@/constants/theme';

export interface DocumentReference {
  id: string;
  documentName: string;
  documentId: string;
  selectedText: string;
  context?: string;
  pageNumber?: number;
  position?: {
    start: number;
    end: number;
  };
  note?: string;
  timestamp: Date;
}

interface DocumentMarkerProps {
  selectedText: string;
  documentName: string;
  documentId: string;
  pageNumber?: number;
  position?: { start: number; end: number };
  onCreateReference: (reference: DocumentReference) => void;
  onCancel: () => void;
  className?: string;
}

export const DocumentMarker: React.FC<DocumentMarkerProps> = ({
  selectedText,
  documentName,
  documentId,
  pageNumber,
  position,
  onCreateReference,
  onCancel,
  className
}) => {
  const [note, setNote] = useState('');
  const [context, setContext] = useState('');

  const handleCreateReference = () => {
    const reference: DocumentReference = {
      id: `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      documentName,
      documentId,
      selectedText,
      context: context.trim() || undefined,
      pageNumber,
      position,
      note: note.trim() || undefined,
      timestamp: new Date()
    };

    onCreateReference(reference);
  };

  const copySelectedText = () => {
    navigator.clipboard.writeText(selectedText);
  };

  return (
    <Card className={cn('p-4 space-y-4 border-primary/20 bg-primary/5', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookmarkPlus className="h-4 w-4 text-primary" />
          <span className="font-medium text-sm">Criar Marcador de Referência</span>
        </div>
        <Button
          onClick={onCancel}
          size="sm"
          variant="ghost"
          className="h-6 w-6 p-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>

      {/* Documento e Localização */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-3 w-3" />
          <span className="font-medium">{documentName}</span>
          {pageNumber && (
            <Badge variant="outline" className="text-xs">
              Página {pageNumber}
            </Badge>
          )}
        </div>
      </div>

      {/* Texto Selecionado */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Texto Selecionado:</label>
          <Button
            onClick={copySelectedText}
            size="sm"
            variant="ghost"
            className="h-6 w-6 p-0"
          >
            <Copy className="h-3 w-3" />
          </Button>
        </div>
        <div className="p-3 bg-muted/50 rounded-md border-l-4 border-primary">
          <Quote className="h-4 w-4 text-muted-foreground mb-2" />
          <p className="text-sm italic text-muted-foreground leading-relaxed">
            "{selectedText}"
          </p>
        </div>
      </div>

      {/* Contexto Adicional */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Contexto (opcional):</label>
        <Textarea
          value={context}
          onChange={(e) => setContext(e.target.value)}
          placeholder="Adicione contexto sobre este trecho..."
          className="min-h-[60px] resize-none"
        />
      </div>

      {/* Nota Pessoal */}
      <div className="space-y-2">
        <label className="text-sm font-medium">Nota pessoal (opcional):</label>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Sua anotação sobre este trecho..."
        />
      </div>

      {/* Ações */}
      <div className="flex gap-2 pt-2">
        <Button
          onClick={handleCreateReference}
          size="sm"
          className="flex-1"
        >
          <Hash className="h-3 w-3 mr-1" />
          Criar Marcador
        </Button>
        <Button
          onClick={onCancel}
          size="sm"
          variant="outline"
        >
          Cancelar
        </Button>
      </div>
    </Card>
  );
};

// Componente para exibir referências criadas
interface DocumentReferenceDisplayProps {
  reference: DocumentReference;
  onQuote: (text: string, documentName: string) => void;
  onRemove?: (referenceId: string) => void;
  className?: string;
}

export const DocumentReferenceDisplay: React.FC<DocumentReferenceDisplayProps> = ({
  reference,
  onQuote,
  onRemove,
  className
}) => {
  const handleQuote = () => {
    const quotedText = reference.selectedText;
    onQuote(quotedText, reference.documentName);
  };

  const copyReference = () => {
    const referenceText = `📄 **${reference.documentName}**${reference.pageNumber ? ` (Página ${reference.pageNumber})` : ''}\n> "${reference.selectedText}"${reference.note ? `\n\n*Nota: ${reference.note}*` : ''}`;
    navigator.clipboard.writeText(referenceText);
  };

  return (
    <Card className={cn('border-l-4 border-primary bg-primary/5', THEME_SPACING.card.padding, THEME_SPACING.space.sm, className)}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <Hash className={`${THEME_SIZES.icon.xs} text-primary flex-shrink-0`} />
          <span className={`${THEME_TEXT.body.xs} font-medium text-muted-foreground truncate`}>
            {reference.documentName}
            {reference.pageNumber && ` • Página ${reference.pageNumber}`}
          </span>
        </div>
        <div className="flex gap-1 flex-shrink-0">
          <Button
            onClick={handleQuote}
            size="sm"
            variant="ghost"
            className={THEME_SIZES.button.iconSm}
            title="Citar no chat"
          >
            <Quote className={THEME_SIZES.icon.xs} />
          </Button>
          <Button
            onClick={copyReference}
            size="sm"
            variant="ghost"
            className={THEME_SIZES.button.iconSm}
            title="Copiar referência"
          >
            <Copy className={THEME_SIZES.icon.xs} />
          </Button>
          {onRemove && (
            <Button
              onClick={() => onRemove(reference.id)}
              size="sm"
              variant="ghost"
              className={`${THEME_SIZES.button.iconSm} text-destructive hover:text-destructive`}
              title="Remover marcador"
            >
              <X className={THEME_SIZES.icon.xs} />
            </Button>
          )}
        </div>
      </div>

      <div className={THEME_SPACING.space.sm}>
        <p className={`${THEME_TEXT.body.xs} italic text-muted-foreground leading-relaxed break-words`}>
          "{reference.selectedText}"
        </p>
        
        {reference.context && (
          <div className={`${THEME_TEXT.body.xs} text-muted-foreground`}>
            <strong>Contexto:</strong> {reference.context}
          </div>
        )}
        
        {reference.note && (
          <div className={`${THEME_TEXT.body.xs} text-muted-foreground`}>
            <strong>Nota:</strong> {reference.note}
          </div>
        )}
        
        <div className={`${THEME_TEXT.body.xs} text-muted-foreground`}>
          {reference.timestamp.toLocaleString('pt-BR')}
        </div>
      </div>
    </Card>
  );
};