import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Key, 
  Eye, 
  EyeOff, 
  Copy, 
  Edit, 
  Trash2, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Activity,
  Shield,
  Globe
} from 'lucide-react';
import { 
  serviceApiKeyService, 
  ServiceApiKey, 
  CreateApiKeyRequest, 
  CreateApiKeyResponse,
  UpdateApiKeyRequest,
  ApiKeyUsageStats
} from '../services/service-api-key.service';

const ServiceApiKeysPage: React.FC = () => {
  const [apiKeys, setApiKeys] = useState<ServiceApiKey[]>([]);
  const [stats, setStats] = useState<ApiKeyUsageStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedKey, setSelectedKey] = useState<ServiceApiKey | null>(null);
  const [newApiKey, setNewApiKey] = useState<CreateApiKeyResponse | null>(null);
  const [showNewApiKey, setShowNewApiKey] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [keysData, statsData] = await Promise.all([
        serviceApiKeyService.getApiKeys(),
        serviceApiKeyService.getUsageStats()
      ]);
      setApiKeys(keysData);
      setStats(statsData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateApiKey = async (request: CreateApiKeyRequest) => {
    try {
      const response = await serviceApiKeyService.createApiKey(request);
      setNewApiKey(response);
      setShowNewApiKey(true);
      setShowCreateModal(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar API key');
    }
  };

  const handleUpdateApiKey = async (id: string, request: UpdateApiKeyRequest) => {
    try {
      await serviceApiKeyService.updateApiKey(id, request);
      setShowEditModal(false);
      setSelectedKey(null);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar API key');
    }
  };

  const handleRevokeApiKey = async (id: string) => {
    if (!confirm('Tem certeza que deseja revogar esta API key? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      await serviceApiKeyService.revokeApiKey(id);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao revogar API key');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    // Aqui você pode adicionar uma notificação de sucesso
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gerenciamento de API Keys</h1>
        <p className="text-gray-600">Gerencie as chaves de API para serviços externos</p>
      </div>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <XCircle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Key className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total de Chaves</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalKeys}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Chaves Ativas</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeKeys}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Uso Este Mês</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsageThisMonth.toLocaleString()}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <AlertTriangle className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Próximas do Limite</p>
                <p className="text-2xl font-bold text-gray-900">{stats.keysNearLimit}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botão Criar Nova API Key */}
      <div className="mb-6">
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nova API Key
        </button>
      </div>

      {/* Lista de API Keys */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serviço
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Chave
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Uso Mensal
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Último Uso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {apiKeys.map((key) => (
                <tr key={key.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{key.serviceName}</div>
                      {key.description && (
                        <div className="text-sm text-gray-500">{key.description}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <code className="text-sm bg-gray-100 px-2 py-1 rounded">
                        {key.keyPrefix}...{key.keySuffix}
                      </code>
                      <button
                        onClick={() => copyToClipboard(`${key.keyPrefix}...${key.keySuffix}`)}
                        className="ml-2 text-gray-400 hover:text-gray-600"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${serviceApiKeyService.getStatusColor(key.status)}`}>
                      {serviceApiKeyService.getStatusText(key.status)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div>
                      {key.currentMonthUsage.toLocaleString()}
                      {key.monthlyUsageLimit && (
                        <span className="text-gray-500">
                          /{key.monthlyUsageLimit.toLocaleString()}
                        </span>
                      )}
                    </div>
                    {key.monthlyUsageLimit && (
                      <div className={`text-xs ${serviceApiKeyService.isNearLimit(key.currentMonthUsage, key.monthlyUsageLimit) ? 'text-orange-600' : 'text-gray-500'}`}>
                        {serviceApiKeyService.formatUsagePercentage(key.currentMonthUsage, key.monthlyUsageLimit)}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {key.lastUsedAt ? formatDate(key.lastUsedAt) : 'Nunca'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedKey(key);
                          setShowEditModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleRevokeApiKey(key.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={key.status === 'Revoked'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal para mostrar nova API key */}
      {showNewApiKey && newApiKey && (
        <NewApiKeyModal
          apiKey={newApiKey}
          onClose={() => {
            setShowNewApiKey(false);
            setNewApiKey(null);
          }}
        />
      )}

      {/* Modal de criação */}
      {showCreateModal && (
        <CreateApiKeyModal
          onClose={() => setShowCreateModal(false)}
          onSubmit={handleCreateApiKey}
        />
      )}

      {/* Modal de edição */}
      {showEditModal && selectedKey && (
        <EditApiKeyModal
          apiKey={selectedKey}
          onClose={() => {
            setShowEditModal(false);
            setSelectedKey(null);
          }}
          onSubmit={(request) => handleUpdateApiKey(selectedKey.id, request)}
        />
      )}
    </div>
  );
};

// Componente para mostrar a nova API key criada
const NewApiKeyModal: React.FC<{
  apiKey: CreateApiKeyResponse;
  onClose: () => void;
}> = ({ apiKey, onClose }) => {
  const [showKey, setShowKey] = useState(false);

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">API Key Criada com Sucesso!</h3>
          </div>
          
          <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
            <div className="flex">
              <AlertTriangle className="h-5 w-5 text-yellow-400" />
              <div className="ml-3">
                <p className="text-sm text-yellow-800">
                  <strong>Importante:</strong> Esta é a única vez que você verá a chave completa. 
                  Copie e armazene-a em um local seguro.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key:
            </label>
            <div className="flex items-center">
              <input
                type={showKey ? 'text' : 'password'}
                value={apiKey.apiKey}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm font-mono"
              />
              <button
                onClick={() => setShowKey(!showKey)}
                className="ml-2 p-2 text-gray-400 hover:text-gray-600"
              >
                {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(apiKey.apiKey)}
                className="ml-2 p-2 text-gray-400 hover:text-gray-600"
              >
                <Copy className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
            >
              Entendi
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Componente para criar nova API key
const CreateApiKeyModal: React.FC<{
  onClose: () => void;
  onSubmit: (request: CreateApiKeyRequest) => void;
}> = ({ onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateApiKeyRequest>({
    serviceName: '',
    description: '',
    expiresAt: '',
    monthlyUsageLimit: undefined,
    permissions: '',
    allowedIPs: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      expiresAt: formData.expiresAt || undefined,
      monthlyUsageLimit: formData.monthlyUsageLimit || undefined,
      permissions: formData.permissions || undefined,
      allowedIPs: formData.allowedIPs || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Criar Nova API Key</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Serviço *
            </label>
            <input
              type="text"
              required
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: Worker Service"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Descrição opcional do serviço"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Expiração
            </label>
            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite Mensal de Uso
            </label>
            <input
              type="number"
              value={formData.monthlyUsageLimit || ''}
              onChange={(e) => setFormData({ ...formData, monthlyUsageLimit: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 10000"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissões
            </label>
            <input
              type="text"
              value={formData.permissions}
              onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: documents:read,documents:write,notifications:create"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IPs Permitidos
            </label>
            <input
              type="text"
              value={formData.allowedIPs}
              onChange={(e) => setFormData({ ...formData, allowedIPs: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Ex: 192.168.1.100,10.0.0.50"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Criar API Key
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Componente para editar API key
const EditApiKeyModal: React.FC<{
  apiKey: ServiceApiKey;
  onClose: () => void;
  onSubmit: (request: UpdateApiKeyRequest) => void;
}> = ({ apiKey, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<UpdateApiKeyRequest>({
    serviceName: apiKey.serviceName,
    description: apiKey.description || '',
    expiresAt: apiKey.expiresAt ? new Date(apiKey.expiresAt).toISOString().slice(0, 16) : '',
    monthlyUsageLimit: apiKey.monthlyUsageLimit,
    permissions: apiKey.permissions || '',
    allowedIPs: apiKey.allowedIPs || '',
    status: apiKey.status
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      expiresAt: formData.expiresAt || undefined,
      monthlyUsageLimit: formData.monthlyUsageLimit || undefined,
      permissions: formData.permissions || undefined,
      allowedIPs: formData.allowedIPs || undefined
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <form onSubmit={handleSubmit}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Editar API Key</h3>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nome do Serviço *
            </label>
            <input
              type="text"
              required
              value={formData.serviceName}
              onChange={(e) => setFormData({ ...formData, serviceName: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Active">Ativa</option>
              <option value="Inactive">Inativa</option>
              <option value="Suspended">Suspensa</option>
            </select>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Descrição
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data de Expiração
            </label>
            <input
              type="datetime-local"
              value={formData.expiresAt}
              onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Limite Mensal de Uso
            </label>
            <input
              type="number"
              value={formData.monthlyUsageLimit || ''}
              onChange={(e) => setFormData({ ...formData, monthlyUsageLimit: e.target.value ? parseInt(e.target.value) : undefined })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Permissões
            </label>
            <input
              type="text"
              value={formData.permissions}
              onChange={(e) => setFormData({ ...formData, permissions: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              IPs Permitidos
            </label>
            <input
              type="text"
              value={formData.allowedIPs}
              onChange={(e) => setFormData({ ...formData, allowedIPs: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
            >
              Salvar Alterações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ServiceApiKeysPage;