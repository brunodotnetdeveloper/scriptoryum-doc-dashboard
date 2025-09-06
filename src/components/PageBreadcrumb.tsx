import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Home,
  FileText,
  Upload,
  Brain,
  Settings,
  Cog,
  Building2,
  Briefcase,
  Users,
  FileType,
  LucideIcon,
} from 'lucide-react';

interface PageConfig {
  title: string;
  icon: LucideIcon;
  description?: string;
}

const pageConfigs: Record<string, PageConfig> = {
  '/dashboard': {
    title: 'Dashboard',
    icon: Home,
    description: 'Visão geral do sistema',
  },
  '/documents': {
    title: 'Documentos',
    icon: FileText,
    description: 'Gerencie seus documentos enviados para análise',
  },
  '/upload': {
    title: 'Upload',
    icon: Upload,
    description: 'Envie novos documentos',
  },
  '/escriba': {
    title: 'Escriba AI',
    icon: Brain,
    description: 'Assistente de IA para análise de documentos',
  },
  '/settings': {
    title: 'Configurações',
    icon: Settings,
    description: 'Configurações da conta',
  },
  '/ai-config': {
    title: 'Configuração IA',
    icon: Cog,
    description: 'Configurações de inteligência artificial',
  },  
  '/workspaces': {
    title: 'Workspaces',
    icon: Briefcase,
    description: 'Gerencie seus workspaces e projetos',
  },
  '/users': {
    title: 'Usuários',
    icon: Users,
    description: 'Gerencie usuários do workspace atual',
  },
  '/document-types': {
    title: 'Tipos de Documentos',
    icon: FileType,
    description: 'Configure tipos de documentos e campos dinâmicos',
  },
};

interface PageBreadcrumbProps {
  customTitle?: string;
  customIcon?: LucideIcon;
  showDescription?: boolean;
  className?: string;
}

export const PageBreadcrumb: React.FC<PageBreadcrumbProps> = ({
  customTitle,
  customIcon,
  showDescription = true,
  className = '',
}) => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const config = pageConfigs[currentPath];
  const title = customTitle || config?.title || 'Página';
  const IconComponent = customIcon || config?.icon || Home;

  return (
    <div className={`space-y-2 ${className}`}>
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link 
                to="/dashboard" 
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
              >
                <Home className="h-4 w-4" />
                Início
              </Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          
          {currentPath !== '/dashboard' && (
            <>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage className="flex items-center gap-2 font-semibold">
                  <IconComponent className="h-4 w-4 text-primary" />
                  {title}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </>
          )}
        </BreadcrumbList>
      </Breadcrumb>      
    </div>
  );
};

export default PageBreadcrumb;