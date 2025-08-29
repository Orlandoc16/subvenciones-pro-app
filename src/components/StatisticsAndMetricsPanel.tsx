import React, { useState, useEffect } from 'react';
import { 
  BarChart3,
  TrendingUp,
  Database,
  Users,
  Download,
  Search,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar,
  MapPin,
  Building
} from 'lucide-react';

interface APIMetrics {
  sourceId: string;
  sourceName: string;
  requests: {
    total: number;
    successful: number;
    failed: number;
    cached: number;
  };
  performance: {
    avgResponseTime: number;
    medianResponseTime: number;
    p95ResponseTime: number;
    availability: number;
  };
  period: string;
}

interface UsageStatistics {
  totalSearches: number;
  totalExports: number;
  totalSubventions: number;
  activeUsers: number;
  topSearchTerms: Array<{ term: string; count: number }>;
  topRegions: Array<{ region: string; count: number }>;
  topOrganisms: Array<{ organism: string; count: number }>;
  searchesByPeriod: Array<{ date: string; count: number }>;
  exportsByFormat: Array<{ format: string; count: number }>;
}

interface SystemHealth {
  overallHealth: 'healthy' | 'degraded' | 'unhealthy';
  apiHealth: {
    national: number; // percentage
    regional: number; // percentage
  };
  cacheEfficiency: number; // percentage
  errorRate: number; // percentage
  avgResponseTime: number; // milliseconds
  uptime: number; // percentage
}

const StatisticsAndMetricsPanel: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'apis' | 'usage' | 'health'>('overview');
  const [timeRange, setTimeRange] = useState<'1h' | '24h' | '7d' | '30d'>('24h');
  
  // Mock data - en implementación real vendría de la API
  const [apiMetrics] = useState<APIMetrics[]>([
    {
      sourceId: 'snpsap-rest',
      sourceName: 'SNPSAP REST API',
      requests: { total: 1250, successful: 1198, failed: 52, cached: 847 },
      performance: { avgResponseTime: 850, medianResponseTime: 720, p95ResponseTime: 1800, availability: 95.8 },
      period: timeRange
    },
    {
      sourceId: 'bdns',
      sourceName: 'BDNS',
      requests: { total: 890, successful: 856, failed: 34, cached: 623 },
      performance: { avgResponseTime: 1200, medianResponseTime: 950, p95ResponseTime: 2500, availability: 96.2 },
      period: timeRange
    },
    {
      sourceId: 'datos-gob',
      sourceName: 'Datos.gob.es',
      requests: { total: 645, successful: 612, failed: 33, cached: 398 },
      performance: { avgResponseTime: 980, medianResponseTime: 800, p95ResponseTime: 2100, availability: 94.9 },
      period: timeRange
    },
    {
      sourceId: 'andalucia',
      sourceName: 'Junta de Andalucía',
      requests: { total: 432, successful: 401, failed: 31, cached: 287 },
      performance: { avgResponseTime: 1450, medianResponseTime: 1200, p95ResponseTime: 3200, availability: 92.8 },
      period: timeRange
    }
  ]);

  const [usageStats] = useState<UsageStatistics>({
    totalSearches: 15420,
    totalExports: 892,
    totalSubventions: 52840,
    activeUsers: 1247,
    topSearchTerms: [
      { term: 'digitalización', count: 3420 },
      { term: 'innovación', count: 2890 },
      { term: 'empleo', count: 2340 },
      { term: 'sostenibilidad', count: 1980 },
      { term: 'formación', count: 1750 }
    ],
    topRegions: [
      { region: 'Andalucía', count: 4230 },
      { region: 'Madrid', count: 3890 },
      { region: 'Cataluña', count: 3450 },
      { region: 'Valencia', count: 2780 },
      { region: 'País Vasco', count: 2340 }
    ],
    topOrganisms: [
      { organism: 'Ministerio de Industria', count: 2890 },
      { organism: 'Junta de Andalucía', count: 2340 },
      { organism: 'Comunidad de Madrid', count: 1980 },
      { organism: 'CDTI', count: 1750 },
      { organism: 'SEPE', count: 1420 }
    ],
    searchesByPeriod: [
      { date: '2024-01-01', count: 1240 },
      { date: '2024-01-02', count: 1380 },
      { date: '2024-01-03', count: 1520 },
      { date: '2024-01-04', count: 1650 },
      { date: '2024-01-05', count: 1780 }
    ],
    exportsByFormat: [
      { format: 'Excel', count: 456 },
      { format: 'PDF', count: 289 },
      { format: 'CSV', count: 147 }
    ]
  });

  const [systemHealth] = useState<SystemHealth>({
    overallHealth: 'healthy',
    apiHealth: { national: 95.2, regional: 92.8 },
    cacheEfficiency: 68.4,
    errorRate: 3.8,
    avgResponseTime: 1050,
    uptime: 99.2
  });

  useEffect(() => {
    // Simular carga de datos cuando cambia el timeRange
    console.log('Time range changed to:', timeRange);
  }, [timeRange]);

  const getHealthColor = (health: string) => {
    switch (health) {
      case 'healthy': return 'text-green-600 bg-green-50 border-green-200';
      case 'degraded': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'unhealthy': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getHealthIcon = (health: string) => {
    switch (health) {
      case 'healthy': return <CheckCircle className="w-5 h-5" />;
      case 'degraded': return <AlertTriangle className="w-5 h-5" />;
      case 'unhealthy': return <AlertTriangle className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const tabs = [
    { id: 'overview', label: 'Resumen General', icon: BarChart3 },
    { id: 'apis', label: 'Métricas de APIs', icon: Database },
    { id: 'usage', label: 'Uso del Sistema', icon: Users },
    { id: 'health', label: 'Salud del Sistema', icon: Activity }
  ];

  return (
    <div className="space-y-6">
      {/* Header con controles */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Estadísticas y Métricas
          </h2>
          <p className="text-gray-600">
            Análisis detallado del rendimiento y uso del sistema
          </p>
        </div>
        
        {/* Time range selector */}
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium text-gray-700">Período:</label>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="1h">Última hora</option>
            <option value="24h">Últimas 24 horas</option>
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
          </select>
        </div>
      </div>

      {/* Health Status Bar */}
      <div className={`p-4 rounded-xl border ${getHealthColor(systemHealth.overallHealth)}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getHealthIcon(systemHealth.overallHealth)}
            <div>
              <h3 className="font-semibold">
                Estado del Sistema: {systemHealth.overallHealth === 'healthy' ? 'Saludable' : 
                                   systemHealth.overallHealth === 'degraded' ? 'Degradado' : 'No Saludable'}
              </h3>
              <p className="text-sm opacity-80">
                Uptime: {systemHealth.uptime}% • Tiempo respuesta promedio: {systemHealth.avgResponseTime}ms
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-6 text-sm">
            <div>
              <span className="text-xs opacity-75">APIs Nacionales</span>
              <div className="font-semibold">{systemHealth.apiHealth.national}%</div>
            </div>
            <div>
              <span className="text-xs opacity-75">APIs Regionales</span>
              <div className="font-semibold">{systemHealth.apiHealth.regional}%</div>
            </div>
            <div>
              <span className="text-xs opacity-75">Cache Hit</span>
              <div className="font-semibold">{systemHealth.cacheEfficiency}%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-gray-50 rounded-t-lg">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 bg-white'
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
      <div className="bg-white rounded-b-xl shadow-soft">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            {/* KPIs principales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-600 text-sm font-medium">Búsquedas Totales</p>
                    <p className="text-2xl font-bold text-blue-900">{formatNumber(usageStats.totalSearches)}</p>
                    <p className="text-blue-600 text-xs">+12% vs período anterior</p>
                  </div>
                  <Search className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-600 text-sm font-medium">Subvenciones</p>
                    <p className="text-2xl font-bold text-green-900">{formatNumber(usageStats.totalSubventions)}</p>
                    <p className="text-green-600 text-xs">+8% vs período anterior</p>
                  </div>
                  <Database className="w-8 h-8 text-green-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-600 text-sm font-medium">Usuarios Activos</p>
                    <p className="text-2xl font-bold text-purple-900">{formatNumber(usageStats.activeUsers)}</p>
                    <p className="text-purple-600 text-xs">+15% vs período anterior</p>
                  </div>
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-600 text-sm font-medium">Exportaciones</p>
                    <p className="text-2xl font-bold text-orange-900">{formatNumber(usageStats.totalExports)}</p>
                    <p className="text-orange-600 text-xs">+22% vs período anterior</p>
                  </div>
                  <Download className="w-8 h-8 text-orange-600" />
                </div>
              </div>
            </div>

            {/* Top performers */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Términos más buscados */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2" />
                  Términos Más Buscados
                </h3>
                <div className="space-y-3">
                  {usageStats.topSearchTerms.map((term, index) => (
                    <div key={term.term} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 text-xs font-medium rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-gray-900">{term.term}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {formatNumber(term.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Regiones más activas */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Regiones Más Activas
                </h3>
                <div className="space-y-3">
                  {usageStats.topRegions.map((region, index) => (
                    <div key={region.region} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 bg-green-100 text-green-600 text-xs font-medium rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-gray-900">{region.region}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {formatNumber(region.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Organismos más consultados */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Building className="w-5 h-5 mr-2" />
                  Organismos Populares
                </h3>
                <div className="space-y-3">
                  {usageStats.topOrganisms.map((organism, index) => (
                    <div key={organism.organism} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 bg-purple-100 text-purple-600 text-xs font-medium rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-gray-900 text-sm">{organism.organism}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {formatNumber(organism.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* APIs Tab */}
        {activeTab === 'apis' && (
          <div className="p-6">
            <div className="space-y-6">
              {apiMetrics.map(api => (
                <div key={api.sourceId} className="border border-gray-200 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900">{api.sourceName}</h3>
                    <span className={`px-3 py-1 text-sm font-medium rounded-full ${
                      api.performance.availability > 95 
                        ? 'bg-green-100 text-green-800'
                        : api.performance.availability > 90
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {api.performance.availability}% disponibilidad
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-blue-50 rounded-lg p-4">
                      <div className="text-blue-600 text-sm font-medium">Peticiones Totales</div>
                      <div className="text-xl font-bold text-blue-900">{formatNumber(api.requests.total)}</div>
                      <div className="text-blue-600 text-xs">
                        Éxito: {Math.round((api.requests.successful / api.requests.total) * 100)}%
                      </div>
                    </div>
                    
                    <div className="bg-green-50 rounded-lg p-4">
                      <div className="text-green-600 text-sm font-medium">Cache Hit</div>
                      <div className="text-xl font-bold text-green-900">
                        {Math.round((api.requests.cached / api.requests.total) * 100)}%
                      </div>
                      <div className="text-green-600 text-xs">
                        {formatNumber(api.requests.cached)} peticiones
                      </div>
                    </div>
                    
                    <div className="bg-purple-50 rounded-lg p-4">
                      <div className="text-purple-600 text-sm font-medium">Tiempo Promedio</div>
                      <div className="text-xl font-bold text-purple-900">{api.performance.avgResponseTime}ms</div>
                      <div className="text-purple-600 text-xs">
                        P95: {api.performance.p95ResponseTime}ms
                      </div>
                    </div>
                    
                    <div className="bg-red-50 rounded-lg p-4">
                      <div className="text-red-600 text-sm font-medium">Errores</div>
                      <div className="text-xl font-bold text-red-900">{formatNumber(api.requests.failed)}</div>
                      <div className="text-red-600 text-xs">
                        {Math.round((api.requests.failed / api.requests.total) * 100)}% tasa de error
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Búsquedas por período */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Búsquedas por Día
                </h3>
                <div className="space-y-3">
                  {usageStats.searchesByPeriod.map(day => (
                    <div key={day.date} className="flex items-center justify-between">
                      <span className="text-gray-600">{new Date(day.date).toLocaleDateString()}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(day.count / Math.max(...usageStats.searchesByPeriod.map(d => d.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-900">{formatNumber(day.count)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Exportaciones por formato */}
              <div className="border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Download className="w-5 h-5 mr-2" />
                  Exportaciones por Formato
                </h3>
                <div className="space-y-4">
                  {usageStats.exportsByFormat.map(format => (
                    <div key={format.format} className="flex items-center justify-between">
                      <span className="text-gray-900 font-medium">{format.format}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-3">
                          <div 
                            className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full"
                            style={{ width: `${(format.count / Math.max(...usageStats.exportsByFormat.map(f => f.count))) * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-bold text-gray-900">{formatNumber(format.count)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Total exportaciones:</span>
                    <span className="font-semibold text-gray-900">
                      {formatNumber(usageStats.exportsByFormat.reduce((sum, f) => sum + f.count, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Health Tab */}
        {activeTab === 'health' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Métricas de salud general */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Métricas de Salud</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Uptime del Sistema</span>
                    <span className="font-bold text-green-600">{systemHealth.uptime}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Tiempo Respuesta Promedio</span>
                    <span className="font-bold text-blue-600">{systemHealth.avgResponseTime}ms</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Tasa de Error</span>
                    <span className="font-bold text-red-600">{systemHealth.errorRate}%</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-700">Eficiencia de Cache</span>
                    <span className="font-bold text-purple-600">{systemHealth.cacheEfficiency}%</span>
                  </div>
                </div>
              </div>
              
              {/* Estado de APIs por categoría */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Estado por Categoría</h3>
                
                <div className="space-y-4">
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">APIs Nacionales</span>
                      <span className="text-green-600 font-bold">{systemHealth.apiHealth.national}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full"
                        style={{ width: `${systemHealth.apiHealth.national}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">APIs Regionales</span>
                      <span className="text-yellow-600 font-bold">{systemHealth.apiHealth.regional}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-600 h-2 rounded-full"
                        style={{ width: `${systemHealth.apiHealth.regional}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatisticsAndMetricsPanel;
