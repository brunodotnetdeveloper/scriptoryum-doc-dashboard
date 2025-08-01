
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { LoginDto } from '@/types/api';
import { Loader2 } from 'lucide-react';

export const Login: React.FC = () => {
  const { login, isLoading } = useAuth();
  const [formData, setFormData] = useState<LoginDto>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (error) {
      // Error handling is done in the AuthContext
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md space-y-6">
        {/* Logo e título */}
        <div className="text-center space-y-3">         
          <h1 className="text-2xl font-bold font-sans">
            <span style={{color: '#D4AF37'}}>Script</span>
            <span style={{color: '#0F4C81'}}>oryum</span>
          </h1>
          <p className="text-muted-foreground font-medium">Análise Inteligente de Documentos com IA</p>
        </div>

        <Card className="bg-card/95 backdrop-blur-sm border-border/50 shadow-2xl shadow-primary/5">
          <CardHeader className="space-y-2 pb-6">
            <CardTitle className="text-2xl text-center text-card-foreground font-semibold">
              Entrar na sua conta
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Digite seu email e senha para acessar o painel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-foreground font-medium">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 focus:ring-2 transition-all duration-200"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-foreground font-medium">
                  Senha
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 focus:ring-2 transition-all duration-200"
                  placeholder="Sua senha"
                />
              </div>
              <div className="flex items-center space-x-2">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  className="rounded border-border bg-input text-primary focus:ring-primary/20 focus:ring-2 transition-all duration-200"
                />
                <Label htmlFor="rememberMe" className="text-sm text-muted-foreground">
                  Lembrar de mim
                </Label>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Entrando...
                  </>
                ) : (
                  'Entrar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Não tem uma conta?{' '}
            <a href="/register" className="text-primary hover:text-accent font-medium hover:underline transition-colors duration-200">
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
