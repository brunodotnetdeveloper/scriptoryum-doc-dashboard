import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Eye, EyeOff, CheckCircle, XCircle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface RegisterFormData {
  userName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface PasswordValidation {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasNumber: boolean;
  passwordsMatch: boolean;
}

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    userName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const validatePassword = (password: string, confirmPassword: string): PasswordValidation => {
    return {
      minLength: password.length >= 6,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /\d/.test(password),
      passwordsMatch: password === confirmPassword && password.length > 0
    };
  };

  const validation = validatePassword(formData.password, formData.confirmPassword);
  const isFormValid = Object.values(validation).every(Boolean) && 
                     formData.userName.trim().length > 0 && 
                     formData.email.trim().length > 0;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast.error('Por favor, preencha todos os campos corretamente.');
      return;
    }

    setIsLoading(true);
    
    try {
      await register({
        userName: formData.userName,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      
      toast.success('Conta criada com sucesso! Redirecionando...');
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error: any) {
      console.error('Erro no registro:', error);
      toast.error(error.message || 'Erro ao criar conta. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationItem: React.FC<{ isValid: boolean; text: string }> = ({ isValid, text }) => (
    <div className={`flex items-center space-x-2 text-xs transition-colors duration-200 ${
      isValid ? 'text-success' : 'text-muted-foreground'
    }`}>
      {isValid ? (
        <CheckCircle className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      <span>{text}</span>
    </div>
  );

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
              Criar sua conta
            </CardTitle>
            <CardDescription className="text-center text-muted-foreground">
              Preencha os dados abaixo para criar sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="userName" className="text-foreground font-medium">
                  Nome de usuário
                </Label>
                <Input
                  id="userName"
                  name="userName"
                  type="text"
                  value={formData.userName}
                  onChange={handleChange}
                  required
                  maxLength={50}
                  className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 focus:ring-2 transition-all duration-200"
                  placeholder="Seu nome de usuário"
                />
              </div>
              
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
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    maxLength={100}
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 focus:ring-2 transition-all duration-200 pr-10"
                    placeholder="Sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Validação da senha */}
                {formData.password && (
                  <div className="space-y-1 p-3 bg-muted/30 rounded-lg border border-border/50">
                    <ValidationItem isValid={validation.minLength} text="Mínimo 6 caracteres" />
                    <ValidationItem isValid={validation.hasUppercase} text="Uma letra maiúscula" />
                    <ValidationItem isValid={validation.hasLowercase} text="Uma letra minúscula" />
                    <ValidationItem isValid={validation.hasNumber} text="Um número" />
                  </div>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-foreground font-medium">
                  Confirmar senha
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="bg-input border-border text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary/20 focus:ring-2 transition-all duration-200 pr-10"
                    placeholder="Confirme sua senha"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                
                {/* Validação da confirmação de senha */}
                {formData.confirmPassword && (
                  <div className="p-2">
                    <ValidationItem isValid={validation.passwordsMatch} text="Senhas coincidem" />
                  </div>
                )}
              </div>
              
              <Button
                type="submit"
                disabled={isLoading || !isFormValid}
                className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Criando conta...
                  </>
                ) : (
                  'Criar conta'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-muted-foreground text-sm">
            Já tem uma conta?{' '}
            <Link to="/login" className="text-primary hover:text-accent font-medium hover:underline transition-colors duration-200">
              Fazer login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;