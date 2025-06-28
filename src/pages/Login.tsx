
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
    <div className="min-h-screen bg-scriptoryum-dark-gray flex items-center justify-center p-4 font-inter">
      <div className="w-full max-w-md space-y-6">
        {/* Logo e título */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-scriptoryum-soft-white">Scriptoryum</h1>
          <p className="text-scriptoryum-soft-white/70">Análise Inteligente de Documentos com IA</p>
        </div>

        <Card className="bg-scriptoryum-dark-gray border-scriptoryum-medium-gray shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center text-scriptoryum-soft-white">
              Entrar na sua conta
            </CardTitle>
            <CardDescription className="text-center text-scriptoryum-soft-white/70">
              Digite seu email e senha para acessar o painel
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-scriptoryum-soft-white">
                  Email
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="bg-scriptoryum-medium-gray/20 border-scriptoryum-medium-gray text-scriptoryum-soft-white placeholder:text-scriptoryum-soft-white/50 focus:border-scriptoryum-soft-blue"
                  placeholder="seu@email.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-scriptoryum-soft-white">
                  Senha
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="bg-scriptoryum-medium-gray/20 border-scriptoryum-medium-gray text-scriptoryum-soft-white placeholder:text-scriptoryum-soft-white/50 focus:border-scriptoryum-soft-blue"
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
                  className="rounded border-scriptoryum-medium-gray bg-scriptoryum-medium-gray/20 text-scriptoryum-soft-blue focus:ring-scriptoryum-soft-blue"
                />
                <Label htmlFor="rememberMe" className="text-sm text-scriptoryum-soft-white/70">
                  Lembrar de mim
                </Label>
              </div>
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-scriptoryum-soft-blue hover:bg-scriptoryum-soft-blue/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
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
          <p className="text-scriptoryum-soft-white/70 text-sm">
            Não tem uma conta?{' '}
            <a href="/register" className="text-scriptoryum-soft-blue hover:underline">
              Criar conta
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
