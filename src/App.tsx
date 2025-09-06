
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import { Login } from "@/pages/Login";
import Register from "@/pages/Register";
import { UploadPage } from "@/pages/UploadPage";
import DocumentsPage from "@/pages/DocumentsPage";
import { EscribaPage } from "@/pages/EscribaPage";
import { AIConfigPage } from "@/pages/AIConfigPage";
import { SettingsPage } from "@/pages/SettingsPage";
import ServiceApiKeysPage from "@/pages/ServiceApiKeysPage";
import WorkspacesPage from "@/pages/WorkspacesPage";
import UserManagementPage from "@/pages/UserManagementPage";
import DocumentTypesPage from "@/pages/DocumentTypesPage";
import DocumentAssociationPage from "@/pages/DocumentAssociationPage";
import NotFound from "./pages/NotFound";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { CreateWorkspaceModal } from "@/components/CreateWorkspaceModal";
import { Loader2 } from "lucide-react";
import Dashboard from "./pages/Dashboard";

const queryClient = new QueryClient();

// Componente para proteger rotas que requerem autenticação
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading, needsWorkspace, refreshWorkspaces } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const handleWorkspaceCreated = async () => {
    await refreshWorkspaces();
  };

  return (
    <>
      <Layout>{children}</Layout>
      <FloatingChatWidget 
        position="bottom-right"
        variant="dialog"
        size="md"
        showBadge={true}
        badgeText="Escriba AI"
      />
      <CreateWorkspaceModal 
        isOpen={needsWorkspace}
        onWorkspaceCreated={handleWorkspaceCreated}
      />
    </>
  );
};

// Componente para redirecionar usuários autenticados para o dashboard
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Rotas públicas - Login e Registro */}
      <Route 
        path="/login" 
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        } 
      />
      <Route 
        path="/register" 
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        } 
      />
      
      {/* Redirect da raiz para dashboard ou login */}
      <Route 
        path="/" 
        element={<Navigate to="/dashboard" replace />} 
      />
      
      {/* Rotas protegidas */}
      <Route 
        path="/dashboard" 
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/upload" 
        element={
          <ProtectedRoute>
            <UploadPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/documents" 
        element={
          <ProtectedRoute>
            <DocumentsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/escriba" 
        element={
          <ProtectedRoute>
            <EscribaPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/ai-config" 
        element={
          <ProtectedRoute>
            <AIConfigPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/service-api-keys" 
        element={
          <ProtectedRoute>
            <ServiceApiKeysPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/workspaces" 
        element={
          <ProtectedRoute>
            <WorkspacesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/users" 
        element={
          <ProtectedRoute>
            <UserManagementPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/document-types" 
        element={
          <ProtectedRoute>
            <DocumentTypesPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/documents/:documentId/association" 
        element={
          <ProtectedRoute>
            <DocumentAssociationPage />
          </ProtectedRoute>
        } 
      />
      
      {/* Rota 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
