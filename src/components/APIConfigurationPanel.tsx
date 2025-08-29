import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Save, 
  RefreshCw, 
  Database, 
  Globe, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Eye,
  EyeOff,
  Clock,
  Zap
} from 'lucide-react';

interface APISource {
  id: string;
  name: string;
  description?: string;
  url: string;
  type: string;
  priority: 'MAXIMA' | 'ALTA' | 'MEDIA' | 'BAJA';
  status: 'ACTIVO' | 'INACTIVO' | 'ERROR' | 'MANTENIMIENTO';
  region?: string;
  enabled: boolean;
  timeout: number;
  retryCount: number;
}

interface APIConfiguration {
  sources: APISource[];
  defaults: {
    timeout: number;
    retryCount: number;
    cacheTimeout: number;
    maxParallelRequests: number;
    enableAggregation: boolean;
    enableDeduplication: boolean;
    enableRegionalAPIs: boolean;
  };
  monitoring: {
    enableHealthChecks: boolean;
    healthCheckInterval: number;
    enableMetrics: boolean;
    alertThresholds: {
      errorRate: number;
      responseTime: number;
      availability: number;
    };
  };
  cache: {
    enabled: boolean;
    provider: 'memory' | 'redis' | 'disk';
    ttlNacional: number;
    ttlRegional: number;
    maxSize: number;
    compression: boolean;
  };
}

const APIConfigurationPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'sources' | 'defaults' | 'monitoring' | 'cache'>('sources');
  const [configuration, setConfiguration] = useState<APIConfiguration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Mock data - en implementación real vendría del servicio
  useEffect(() => {
    setTimeout(() => {
      setConfiguration({
        sources: [
          {
            id: 'snpsap-rest',
            name: 'SNPSAP REST API',
            description: 'Nueva API REST oficial del SNPSAP',
            url: '/api/snpsap-rest',
            type: 'API_REST',
            priority: 'MAXIMA',
            status: 'ACTIVO',
            region: 'Nacional',
            enabled: true,
            timeout: 30000,
            retryCount: 3
          },
          {
            id: 'bdns',
            name: 'BDNS',
            description: 'Base de Datos Nacional de Subvenciones',
            url: '/api/bdns',
            type: 'API_REST',
            priority: 'MAXIMA',
            status: 'ACTIVO',
            region: 'Nacional',
            enabled: true,
            timeout: 25000,
            retryCount: 3
          },
          {
            id: 'andalucia',
            name: 'Junta de Andalucía',
            description: 'API regional de Andalucía',
            url: '/api/regional/andalucia',
            type: 'API_REST',
            priority: 'ALTA',
            status: 'ACTIVO',
            region: 'Andalucía',
            enabled: true,
            timeout: 15000,
            retryCount: 2
          }
        ],
        defaults: {
          timeout: 30000,
          retryCount: 3,
          cacheTimeout: 600000,
          maxParallelRequests: 5,
          enableAggregation: true,
          enableDeduplication: true,
          enableRegionalAPIs: true
        },
        monitoring: {
          enableHealthChecks: true,
          healthCheckInterval: 300000,
          enableMetrics: true,
          alertThresholds: {
            errorRate: 20,
            responseTime: 10000,
            availability: 95
          }
        },
        cache: {
          enabled: true,
          provider: 'memory',
          ttlNacional: 300000,
          ttlRegional: 600000,
          maxSize: 1000,
          compression: false
        }
      });
      setIsLoading(false);
    }, 1000);
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    // Simular guardado
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setHasChanges(false);
  };

  const handleSourceToggle = (sourceId: string) => {
    if (!configuration) return;
    
    setConfiguration({
      ...configuration,
      sources: configuration.sources.map(source => 
        source.id === sourceId 
          ? { ...source, enabled: !source.enabled }
          : source
      )
    });
    setHasChanges(true);
  };

  const getStatusColor = (status: string, enabled: boolean) => {
    if (!enabled) return 'text-gray-400 bg-gray-100';
    switch (status) {
      case 'ACTIVO': return 'text-green-700 bg-green-100';
      case 'ERROR': return 'text-red-700 bg-red-100';
      case 'MANTENIMIENTO': return 'text-yellow-700 bg-yellow-100';
      default: return 'text-gray-700 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string, enabled: boolean) => {
    if (!enabled) return <EyeOff className="w-4 h-4" />;
    switch (status) {
      case 'ACTIVO': return <CheckCircle className="w-4 h-4" />;
      case 'ERROR': return <XCircle className="w-4 h-4" />;
      case 'MANTENIMIENTO': return <AlertTriangle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'MAXIMA': return 'text-red-600 bg-red-50 border-red-200';
      case 'ALTA': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'MEDIA': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'BAJA': return 'text-gray-600 bg-gray-50 border-gray-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  if (isLoading || !configuration) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-lg text-gray-600">Cargando configuración...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Settings className="w-8 h-8 mr-3 text-blue-600" />
            Configuración de APIs
          </h2>
          <p className="text-gray-600">
            Gestiona las fuentes de datos y configuración del sistema
          </p>
        </div>
        
        {hasChanges && (
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'sources', label: 'Fuentes de Datos', icon: Database },
          { id: 'defaults', label: 'Configuración General', icon: Settings },
          { id: 'monitoring', label: 'Monitoreo', icon: Globe },
          { id: 'cache', label: 'Cache', icon: Zap }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl shadow-soft p-6">
        {/* Sources Tab */}
        {activeTab === 'sources' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Fuentes de Datos Configuradas ({configuration.sources.length})
            </h3>
            
            <div className="space-y-4">
              {configuration.sources.map(source => (
                <div key={source.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleSourceToggle(source.id)}
                        className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                          source.enabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {source.enabled ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        <span>{source.enabled ? 'Habilitado' : 'Deshabilitado'}</span>
                      </button>
                      
                      <div>
                        <h4 className="font-semibold text-gray-900">{source.name}</h4>
                        <p className="text-sm text-gray-600">{source.description}</p>
                        <p className="text-xs text-gray-500">{source.url}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(source.priority)}`}>
                        {source.priority}
                      </span>
                      
                      <span className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(source.status, source.enabled)}`}>
                        {getStatusIcon(source.status, source.enabled)}
                        <span>{source.enabled ? source.status : 'DESHABILITADO'}</span>
                      </span>
                      
                      {source.region && (
                        <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                          {source.region}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-gray-100 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Timeout:</span>
                      <span className="ml-2 font-medium">{source.timeout / 1000}s</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Reintentos:</span>
                      <span className="ml-2 font-medium">{source.retryCount}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Defaults Tab */}
        {activeTab === 'defaults' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Configuración General</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Timeout por Defecto (ms)
                  </label>
                  <input
                    type="number"
                    value={configuration.defaults.timeout}
                    onChange={(e) => {
                      setConfiguration({
                        ...configuration,
                        defaults: { ...configuration.defaults, timeout: parseInt(e.target.value) }
                      });
                      setHasChanges(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reintentos por Defecto
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={configuration.defaults.retryCount}
                    onChange={(e) => {
                      setConfiguration({
                        ...configuration,
                        defaults: { ...configuration.defaults, retryCount: parseInt(e.target.value) }
                      });
                      setHasChanges(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Requests Paralelos Máximos
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={configuration.defaults.maxParallelRequests}
                    onChange={(e) => {
                      setConfiguration({
                        ...configuration,
                        defaults: { ...configuration.defaults, maxParallelRequests: parseInt(e.target.value) }
                      });
                      setHasChanges(true);
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Opciones Avanzadas</h4>
                
                {[
                  { key: 'enableAggregation', label: 'Habilitar Agregación', description: 'Combina resultados de múltiples fuentes' },
                  { key: 'enableDeduplication', label: 'Habilitar Deduplicación', description: 'Elimina duplicados automáticamente' },
                  { key: 'enableRegionalAPIs', label: 'Habilitar APIs Regionales', description: 'Include APIs de comunidades autónomas' }
                ].map(option => (
                  <div key={option.key} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{option.label}</div>
                      <div className="text-sm text-gray-600">{option.description}</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={(configuration.defaults as any)[option.key]}
                        onChange={(e) => {
                          setConfiguration({
                            ...configuration,
                            defaults: { 
                              ...configuration.defaults, 
                              [option.key]: e.target.checked 
                            }
                          });
                          setHasChanges(true);
                        }}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Monitoring Tab */}
        {activeTab === 'monitoring' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Configuración de Monitoreo</h3>
            <p className="text-gray-600">Configura el sistema de monitoreo y alertas para las APIs</p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Globe className="w-5 h-5 text-blue-600 mr-2" />
                <span className="font-medium text-blue-900">
                  Monitoreo automático habilitado
                </span>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                El sistema está monitoreando {configuration.sources.filter(s => s.enabled).length} APIs activas
              </p>
            </div>
          </div>
        )}

        {/* Cache Tab */}
        {activeTab === 'cache' && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">Configuración de Cache</h3>
            <p className="text-gray-600">Optimiza el rendimiento mediante el sistema de cache</p>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center">
                <Zap className="w-5 h-5 text-green-600 mr-2" />
                <span className="font-medium text-green-900">
                  Cache habilitado - Proveedor: {configuration.cache.provider}
                </span>
              </div>
              <p className="text-sm text-green-700 mt-1">
                TTL Nacional: {configuration.cache.ttlNacional / 1000}s | TTL Regional: {configuration.cache.ttlRegional / 1000}s
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default APIConfigurationPanel;
