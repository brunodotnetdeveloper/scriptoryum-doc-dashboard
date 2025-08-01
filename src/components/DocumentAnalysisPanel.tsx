import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  FileText, 
  Brain, 
  Search, 
  AlertTriangle, 
  Lightbulb, 
  Calendar,
  Users,
  MapPin,
  DollarSign,
  Clock,
  RefreshCw,
  X,
  Building2
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { escribaService } from '@/services';
import { DocumentContext } from '@/services/escriba.service';

interface DocumentAnalysisPanelProps {
  documentContext: DocumentContext | null;
  onClose: () => void;
  onAskQuestion: (question: string) => void;
}

export const DocumentAnalysisPanel: React.FC<DocumentAnalysisPanelProps> = ({
  documentContext,
  onClose,
  onAskQuestion,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisType, setAnalysisType] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);

  if (!documentContext) return null;

  const quickAnalysisOptions = [
    {
      id: 'summary',
      title: 'Resumo Executivo',
      description: 'Gerar um resumo conciso do documento',
      icon: FileText,
      color: 'text-blue-scriptoryum',
    },
    {
      id: 'entities',
      title: 'Entidades Principais',
      description: 'Identificar pessoas, organizações e locais',
      icon: Users,
      color: 'text-green-500',
    },
    {
      id: 'risks',
      title: 'Análise de Riscos',
      description: 'Identificar potenciais riscos e problemas',
      icon: AlertTriangle,
      color: 'text-red-500',
    },
    {
      id: 'insights',
      title: 'Insights Estratégicos',
      description: 'Extrair insights e recomendações',
      icon: Lightbulb,
      color: 'text-gold-scriptoryum',
    },
    {
      id: 'timeline',
      title: 'Linha do Tempo',
      description: 'Extrair datas e eventos importantes',
      icon: Calendar,
      color: 'text-purple-500',
    },
    {
      id: 'financial',
      title: 'Informações Financeiras',
      description: 'Identificar valores e dados financeiros',
      icon: DollarSign,
      color: 'text-emerald-500',
    },
  ];

  const handleQuickAnalysis = async (type: string) => {
    setIsAnalyzing(true);
    setAnalysisType(type);
    setAnalysisResult(null);

    try {
      const result = await escribaService.analyzeDocument(documentContext.id, type);
      setAnalysisResult(result);
    } catch (error) {
      console.error('Erro na análise:', error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível realizar a análise solicitada.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const quickQuestions = [
    "Qual é o objetivo principal deste documento?",
    "Quais são os pontos mais importantes?",
    "Existem riscos ou problemas mencionados?",
    "Quais são as datas importantes?",
    "Quem são as pessoas ou organizações envolvidas?",
    "Há informações financeiras relevantes?",
  ];

  const getEntityIcon = (entityType: string) => {
    switch (entityType.toLowerCase()) {
      case 'person':
      case 'pessoa':
        return Users;
      case 'organization':
      case 'organizacao':
        return Building2;
      case 'location':
      case 'local':
        return MapPin;
      case 'date':
      case 'data':
        return Calendar;
      case 'money':
      case 'dinheiro':
        return DollarSign;
      default:
        return FileText;
    }
  };

  return (
    <Card className="w-96 h-full flex flex-col">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Brain className="h-5 w-5 text-primary" />
            Análise do Documento
          </CardTitle>
          <Button
            onClick={onClose}
            size="sm"
            variant="ghost"
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0">
        <ScrollArea className="h-full">
          <div className="p-4 space-y-6">
            {/* Informações do Documento */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Informações Básicas</h3>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{documentContext.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    {documentContext.content.length} caracteres
                  </span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Análise Rápida */}
            <div>
              <h3 className="font-semibold text-sm mb-3">Análise Rápida</h3>
              <div className="grid grid-cols-1 gap-2">
                {quickAnalysisOptions.map((option) => {
                  const Icon = option.icon;
                  return (
                    <Button
                      key={option.id}
                      onClick={() => handleQuickAnalysis(option.id)}
                      disabled={isAnalyzing}
                      variant="outline"
                      className="h-auto p-3 justify-start"
                    >
                      <div className="flex items-start gap-3 w-full">
                        <Icon className={`h-4 w-4 mt-0.5 ${option.color}`} />
                        <div className="text-left">
                          <div className="font-medium text-sm">{option.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {option.description}
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Resultado da Análise */}
            {(isAnalyzing || analysisResult) && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm mb-3">
                    {isAnalyzing ? 'Analisando...' : 'Resultado da Análise'}
                  </h3>
                  {isAnalyzing ? (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      Processando análise...
                    </div>
                  ) : (
                    <div className="bg-muted/50 rounded-lg p-3">
                      <div className="text-sm whitespace-pre-wrap">
                        {analysisResult}
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Entidades Extraídas */}
            {documentContext.entities && documentContext.entities.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm mb-3">Entidades Identificadas</h3>
                  <div className="space-y-2">
                    {documentContext.entities.slice(0, 10).map((entity: any, index) => {
                      const Icon = getEntityIcon(entity.entityTypeText);
                      return (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 rounded-md bg-muted/30"
                        >
                          <Icon className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm font-medium">{entity.value}</span>
                          <Badge variant="secondary" className="text-xs ml-auto">
                            {entity.entityTypeText}
                          </Badge>
                        </div>
                      );
                    })}
                    {documentContext.entities.length > 10 && (
                      <p className="text-xs text-muted-foreground text-center">
                        +{documentContext.entities.length - 10} entidades adicionais
                      </p>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Insights */}
            {documentContext.insights && documentContext.insights.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm mb-3">Insights Disponíveis</h3>
                  <div className="space-y-2">
                    {documentContext.insights.slice(0, 5).map((insight: any, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-md bg-muted/30 border-l-2 border-primary"
                      >
                        <div className="font-medium text-sm">{insight.title}</div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {insight.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Riscos */}
            {documentContext.risks && documentContext.risks.length > 0 && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold text-sm mb-3">Riscos Identificados</h3>
                  <div className="space-y-2">
                    {documentContext.risks.slice(0, 5).map((risk: any, index) => (
                      <div
                        key={index}
                        className="p-3 rounded-md bg-red-50 border-l-2 border-red-500"
                      >
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="font-medium text-sm">{risk.type}</span>
                          <Badge 
                            variant={risk.severity === 'High' ? 'destructive' : 'secondary'}
                            className="text-xs ml-auto"
                          >
                            {risk.severity}
                          </Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {risk.description}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Perguntas Rápidas */}
            <Separator />
            <div>
              <h3 className="font-semibold text-sm mb-3">Perguntas Sugeridas</h3>
              <div className="space-y-2">
                {quickQuestions.map((question, index) => (
                  <Button
                    key={index}
                    onClick={() => onAskQuestion(question)}
                    variant="ghost"
                    size="sm"
                    className="h-auto p-2 justify-start text-left w-full"
                  >
                    <Search className="h-3 w-3 mr-2 text-muted-foreground" />
                    <span className="text-xs">{question}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};