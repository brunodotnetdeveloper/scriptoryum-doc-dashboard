import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  Download, 
  ExternalLink, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Loader2,
  Plus
} from 'lucide-react';

interface BillingInfo {
  currentPlan: {
    name: string;
    price: number;
    currency: string;
    interval: string;
    features: string[];
  };
  usage: {
    tokensUsed: number;
    tokensLimit: number;
    documentsProcessed: number;
    documentsLimit: number;
  };
  nextBilling: string;
  paymentMethod: {
    type: string;
    last4: string;
    brand: string;
  } | null;
}

interface Invoice {
  id: string;
  date: string;
  amount: number;
  currency: string;
  status: 'paid' | 'pending' | 'failed';
  downloadUrl?: string;
}

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    price: 29.90,
    currency: 'BRL',
    interval: 'mês',
    tokensLimit: 100000,
    documentsLimit: 50,
    features: [
      '100.000 tokens por mês',
      '50 documentos processados',
      'Suporte por email',
      'Análise básica de documentos'
    ]
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 79.90,
    currency: 'BRL',
    interval: 'mês',
    tokensLimit: 500000,
    documentsLimit: 200,
    features: [
      '500.000 tokens por mês',
      '200 documentos processados',
      'Suporte prioritário',
      'Análise avançada de documentos',
      'Relatórios personalizados',
      'API access'
    ]
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 199.90,
    currency: 'BRL',
    interval: 'mês',
    tokensLimit: -1, // Unlimited
    documentsLimit: -1, // Unlimited
    features: [
      'Tokens ilimitados',
      'Documentos ilimitados',
      'Suporte 24/7',
      'Análise premium de documentos',
      'Relatórios avançados',
      'API completa',
      'Integração personalizada',
      'Gerente de conta dedicado'
    ]
  }
];

export const BillingTab: React.FC = () => {
  const { toast } = useToast();
  const [billingInfo, setBillingInfo] = useState<BillingInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  useEffect(() => {
    loadBillingInfo();
    loadInvoices();
  }, []);

  const loadBillingInfo = async () => {
    try {
      // Simulated API call - replace with actual billing service
      const mockBillingInfo: BillingInfo = {
        currentPlan: {
          name: 'Professional',
          price: 79.90,
          currency: 'BRL',
          interval: 'mês',
          features: PLANS.find(p => p.id === 'professional')?.features || []
        },
        usage: {
          tokensUsed: 245000,
          tokensLimit: 500000,
          documentsProcessed: 87,
          documentsLimit: 200
        },
        nextBilling: '2024-02-15',
        paymentMethod: {
          type: 'credit_card',
          last4: '4532',
          brand: 'Visa'
        }
      };
      setBillingInfo(mockBillingInfo);
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar informações de faturamento',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      // Simulated API call - replace with actual billing service
      const mockInvoices: Invoice[] = [
        {
          id: 'inv_001',
          date: '2024-01-15',
          amount: 79.90,
          currency: 'BRL',
          status: 'paid',
          downloadUrl: '#'
        },
        {
          id: 'inv_002',
          date: '2023-12-15',
          amount: 79.90,
          currency: 'BRL',
          status: 'paid',
          downloadUrl: '#'
        },
        {
          id: 'inv_003',
          date: '2023-11-15',
          amount: 29.90,
          currency: 'BRL',
          status: 'paid',
          downloadUrl: '#'
        }
      ];
      setInvoices(mockInvoices);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const handleUpgradePlan = async (planId: string) => {
    setIsProcessingPayment(true);
    try {
      // Integration with ABACATEPAY
      const plan = PLANS.find(p => p.id === planId);
      if (!plan) throw new Error('Plano não encontrado');

      // Create payment with ABACATEPAY
      const paymentData = {
        amount: plan.price,
        currency: plan.currency,
        description: `Assinatura ${plan.name} - Scriptoryum`,
        customer: {
          email: 'user@example.com', // Get from user context
          name: 'Nome do Usuário' // Get from user context
        },
        metadata: {
          planId: plan.id,
          userId: 'user_id' // Get from user context
        }
      };

      // Simulate ABACATEPAY integration
      const response = await fetch('/api/billing/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(paymentData)
      });

      if (!response.ok) {
        throw new Error('Erro ao processar pagamento');
      }

      const { paymentUrl } = await response.json();
      
      // Redirect to ABACATEPAY payment page
      window.open(paymentUrl, '_blank');
      
      toast({
        title: 'Redirecionando para pagamento',
        description: 'Você será redirecionado para completar o pagamento com ABACATEPAY'
      });
    } catch (error) {
      toast({
        title: 'Erro',
        description: error instanceof Error ? error.message : 'Erro ao processar pagamento',
        variant: 'destructive'
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const getUsagePercentage = (used: number, limit: number) => {
    if (limit === -1) return 0; // Unlimited
    return Math.min((used / limit) * 100, 100);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Carregando informações de faturamento...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-primary" />
          Faturamento e Pagamento
        </h2>
        <p className="text-muted-foreground mt-1">
          Gerencie sua assinatura, métodos de pagamento e histórico de faturas
        </p>
      </div>

      {/* Current Plan & Usage */}
      {billingInfo && (
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Plano Atual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{billingInfo.currentPlan.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(billingInfo.currentPlan.price, billingInfo.currentPlan.currency)}/{billingInfo.currentPlan.interval}
                  </p>
                </div>
                <Badge variant="default">Ativo</Badge>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4" />
                  <span>Próxima cobrança: {formatDate(billingInfo.nextBilling)}</span>
                </div>
                {billingInfo.paymentMethod && (
                  <div className="flex items-center gap-2 text-sm">
                    <CreditCard className="h-4 w-4" />
                    <span>{billingInfo.paymentMethod.brand} •••• {billingInfo.paymentMethod.last4}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Uso do Plano
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Tokens utilizados</span>
                    <span>
                      {billingInfo.usage.tokensUsed.toLocaleString('pt-BR')} / {' '}
                      {billingInfo.usage.tokensLimit === -1 ? 'Ilimitado' : billingInfo.usage.tokensLimit.toLocaleString('pt-BR')}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${getUsagePercentage(billingInfo.usage.tokensUsed, billingInfo.usage.tokensLimit)}%` }}
                    />
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span>Documentos processados</span>
                    <span>
                      {billingInfo.usage.documentsProcessed} / {' '}
                      {billingInfo.usage.documentsLimit === -1 ? 'Ilimitado' : billingInfo.usage.documentsLimit}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all" 
                      style={{ width: `${getUsagePercentage(billingInfo.usage.documentsProcessed, billingInfo.usage.documentsLimit)}%` }}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Available Plans */}
      <Card>
        <CardHeader>
          <CardTitle>Planos Disponíveis</CardTitle>
          <CardDescription>
            Escolha o plano que melhor se adequa às suas necessidades
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => {
              const isCurrentPlan = billingInfo?.currentPlan.name === plan.name;
              
              return (
                <Card key={plan.id} className={`relative ${isCurrentPlan ? 'border-primary' : ''}`}>
                  {isCurrentPlan && (
                    <Badge className="absolute -top-2 left-4" variant="default">
                      Plano Atual
                    </Badge>
                  )}
                  <CardHeader>
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                    <div className="text-2xl font-bold">
                      {formatCurrency(plan.price, plan.currency)}
                      <span className="text-sm font-normal text-muted-foreground">/{plan.interval}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <ul className="space-y-2 text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-center gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Button 
                      className="w-full" 
                      variant={isCurrentPlan ? "outline" : "default"}
                      disabled={isCurrentPlan || isProcessingPayment}
                      onClick={() => handleUpgradePlan(plan.id)}
                    >
                      {isProcessingPayment ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : isCurrentPlan ? (
                        'Plano Atual'
                      ) : (
                        <>Escolher Plano</>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Invoice History */}
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Faturas</CardTitle>
          <CardDescription>
            Visualize e baixe suas faturas anteriores
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(invoice.status)}
                  <div>
                    <p className="font-medium">{formatDate(invoice.date)}</p>
                    <p className="text-sm text-muted-foreground">
                      Fatura #{invoice.id}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className="font-medium">
                    {formatCurrency(invoice.amount, invoice.currency)}
                  </span>
                  {invoice.downloadUrl && (
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};