
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading) {
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else {
        navigate('/login', { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center font-sans">
      <div className="text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-foreground mb-2">Scriptoryum</h1>
          <p className="text-muted-foreground">Análise Inteligente de Documentos com IA</p>
        </div>
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="text-muted-foreground mt-4">Carregando...</p>
      </div>
    </div>
  );
};

export default Index;
