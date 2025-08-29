import React, { useState, useEffect } from 'react';
import {
  Activity,
  Server,
  Clock,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Database,
  Globe2,
  RefreshCw,
  BarChart3,
  TrendingUp,
  Zap
} from 'lucide-react';

interface APIHealthStatus {
  id: string;
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy' | 'unknown';
  region?: string;
  responseTime: number;
  availability: number;
  lastCheck: Date;
  error?: string;
  requestsToday: number;
  successRate: number;
}

interface SystemOverview {
  totalAPIs: number;
  healthyAPIs: number;
  degradedAPIs: number;
  unhealthyAPIs: number;
  avgResponseTime: number;
  totalRequests: number;
  overallAvailability: number;
  cacheHitRate: number;
}

const APIMonitoringDashboard: React.FC = () => {
  const [healthStatuses, setHealthStatuses] = useState<APIHealthStatus[]>([]);
  const [systemOverview, setSystemOverview] = useState<SystemOverview | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Mock data para demostración
  const mockData: APIHealthStatus[] = [
    {
      id: 'snpsap-rest',
      name: 'SNPSAP REST API',
      status: 'healthy',
      region: 'Nacional',
      responseTime: 850,
      availability: 99.2,
      lastCheck: new Date(),
      requestsToday: 1247,
      successRate: 98.5
    },
    {
      id: 'bdns',
      name: 'BDNS',
      status: 'healthy',
      region: 'Nacional',
      responseTime: 1200,
      availability: 98.8,
      lastCheck: new Date(),
      requestsToday: 892,
      successRate: 97.8
    },
    {
      id: 'datos-gob',
      name: 'Datos.gob.es',
      status: 'degraded',
      region: 'Nacional',
      responseTime: 2400,
      availability: 94.5,
      lastCheck: new Date(),
      requestsToday: 623,
      successRate: 94.2,
      error: 'Respuesta lenta detectada'
    },
    {
      id: 'andalucia',
      name: 'Junta de Andalucía',
      status: 'healthy',
      region: 'Andalucía',
      responseTime: 1450,
      availability: 96.7,
      lastCheck: new Date(),
      requestsToday: 324,
      successRate: 96.1
    },
    {
      id: 'madrid',
      name: 'Comunidad de Madrid',
      status: 'unhealthy',
      region: 'Madrid',
      responseTime: 0,
      availability: 0,
      lastCheck: new Date(),
      requestsToday: 0,
      successRate: 0,
      error: 'API no responde'
    }
  ];

  useEffect(() => {
    // Cargar datos iniciales
    loadHealthStatuses();

    // Auto-refresh cada 30 segundos si está habilitado
    const interval = autoRefresh ? setInterval(() => {
      loadHealthStatuses();
    }, 30000) : null;

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  const loadHealthStatuses = async () => {
    setIsRefreshing(true);
    
    // Simular carga de datos
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setHealthStatuses(mockData);
    
    // Calcular overview del sistema
    const overview: SystemOverview = {
      totalAPIs: mockData.length,
      healthyAPIs: mockData.filter(api => api.status === 'healthy').length,
      degradedAPIs: mockData.filter(api => api.status === 'degraded').length,
      unhealthyAPIs: mockData.filter(api => api.status === 'unhealthy').length,
      avgResponseTime: mockData.reduce((sum, api) => sum + api.responseTime, 0) / mockData.length,
      totalRequests: mockData.reduce((sum, api) => sum + api.requestsToday, 0),
      overallAvailability: mockData.reduce((sum, api) => sum + api.availability, 0) / mockData.length,
      cacheHitRate: 68.4 // Mock value
    };
    
    setSystemOverview(overview);
    setLastUpdate(new Date());
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-700 bg-green-100 border-green-200';
      case 'degraded': return 'text-yellow-700 bg-yellow-100 border-yellow-200';
      case 'unhealthy': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-700 bg-gray-100 border-gray-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5" />;
      case 'unhealthy': return <XCircle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const formatResponseTime = (ms: number): string => {
    if (ms === 0) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getResponseTimeColor = (responseTime: number): string => {
    if (responseTime === 0) return 'text-gray-600';
    if (responseTime < 1000) return 'text-green-600';
    if (responseTime < 2000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Activity className="w-8 h-8 mr-3 text-blue-600" />
            Monitoreo de APIs
          </h2>
          <p className="text-gray-600">
            Estado en tiempo real de todas las fuentes de datos
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <div className="text-sm text-gray-600">Última actualización</div>
            <div className="text-sm font-medium text-gray-900">
              {lastUpdate.toLocaleTimeString()}
            </div>
          </div>
          
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              autoRefresh
                ? 'bg-blue-100 text-blue-700 border border-blue-200'
                : 'bg-gray-100 text-gray-700 border border-gray-200'
            }`}
          >
            Auto-refresh {autoRefresh ? 'ON' : 'OFF'}
          </button>
          
          <button
            onClick={loadHealthStatuses}
            disabled={isRefreshing}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>
      </div>

      {/* System Overview */}
      {systemOverview && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">APIs Saludables</p>
                <p className="text-2xl font-bold text-green-900">
                  {systemOverview.healthyAPIs}/{systemOverview.totalAPIs}
                </p>
                <p className="text-green-600 text-xs">
                  {Math.round((systemOverview.healthyAPIs / systemOverview.totalAPIs) * 100)}% operativas
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Tiempo Respuesta</p>
                <p className="text-2xl font-bold text-blue-900">
                  {formatResponseTime(systemOverview.avgResponseTime)}
                </p>
                <p className="text-blue-600 text-xs">Promedio general</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Disponibilidad</p>
                <p className="text-2xl font-bold text-purple-900">
                  {systemOverview.overallAvailability.toFixed(1)}%
                </p>
                <p className="text-purple-600 text-xs">Promedio último mes</p>
              </div>
              <Server className="w-8 h-8 text-purple-600" />
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-600 text-sm font-medium">Requests Hoy</p>
                <p className="text-2xl font-bold text-orange-900">
                  {formatNumber(systemOverview.totalRequests)}
                </p>
                <p className="text-orange-600 text-xs">Todas las fuentes</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </div>
        </div>
      )}

      {/* APIs Status Cards */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Estado Detallado por API</h3>
        
        <div className="grid gap-4">
          {healthStatuses.map(api => (
            <div key={api.id} className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`flex items-center space-x-2 px-3 py-1.5 rounded-full text-sm font-medium border ${getStatusColor(api.status)}`}>
                    {getStatusIcon(api.status)}
                    <span className="capitalize">{api.status}</span>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900">{api.name}</h4>
                    {api.region && (
                      <span className="text-sm text-gray-600">{api.region}</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {api.region === 'Nacional' ? (
                    <Globe2 className="w-5 h-5 text-blue-600" />
                  ) : (
                    <Database className="w-5 h-5 text-purple-600" />
                  )}
                </div>
              </div>

              {api.error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <XCircle className="w-4 h-4 text-red-600" />
                    <span className="text-red-800 text-sm font-medium">{api.error}</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {api.availability.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Disponibilidad</div>
                </div>
                
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getResponseTimeColor(api.responseTime)}`}>
                    {formatResponseTime(api.responseTime)}
                  </div>
                  <div className="text-sm text-gray-600">Tiempo Respuesta</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatNumber(api.requestsToday)}
                  </div>
                  <div className="text-sm text-gray-600">Requests Hoy</div>
                </div>
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-900">
                    {api.successRate.toFixed(1)}%
                  </div>
                  <div className="text-sm text-gray-600">Tasa Éxito</div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Último check: {api.lastCheck.toLocaleTimeString()}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  {api.status === 'healthy' && (
                    <div className="flex items-center space-x-1 text-green-600">
                      <TrendingUp className="w-4 h-4" />
                      <span className="text-sm">Estable</span>
                    </div>
                  )}
                  
                  {api.status === 'degraded' && (
                    <div className="flex items-center space-x-1 text-yellow-600">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="text-sm">Monitoreo</span>
                    </div>
                  )}
                  
                  {api.status === 'unhealthy' && (
                    <div className="flex items-center space-x-1 text-red-600">
                      <XCircle className="w-4 h-4" />
                      <span className="text-sm">Crítico</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cache & Performance Metrics */}
      <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Zap className="w-5 h-5 mr-2 text-blue-600" />
          Métricas de Performance
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {systemOverview?.cacheHitRate.toFixed(1)}%
            </div>
            <div className="text-sm text-gray-600">Cache Hit Rate</div>
            <div className="text-xs text-gray-500 mt-1">
              Mejora el rendimiento general
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">
              {systemOverview ? formatResponseTime(systemOverview.avgResponseTime) : 'N/A'}
            </div>
            <div className="text-sm text-gray-600">Tiempo Promedio</div>
            <div className="text-xs text-gray-500 mt-1">
              Todas las fuentes agregadas
            </div>
          </div>
          
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">
              {systemOverview ? formatNumber(systemOverview.totalRequests) : '0'}
            </div>
            <div className="text-sm text-gray-600">Total Requests</div>
            <div className="text-xs text-gray-500 mt-1">
              Últimas 24 horas
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIMonitoringDashboard;
