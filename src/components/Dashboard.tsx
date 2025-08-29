import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Euro, 
  Calendar,
  MapPin,
  Building,
  PieChart,
  Activity
} from 'lucide-react';
import type { 
  Subvencion, 
  Estadisticas, 
  CategoriaAnalysis, 
  TemporalAnalysis, 
  ComunidadAnalysis, 
  ComplejidadAnalysis, 
  FinanciacionAnalysis, 
  RequisitoAnalysis 
} from '@/types';

interface DashboardProps {
  subvenciones: Subvencion[];
  isLoading?: boolean;
  stats?: Estadisticas; // Opcional para compatibilidad
}

const Dashboard: React.FC<DashboardProps> = ({ subvenciones, isLoading = false }) => {
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'categories' | 'temporal' | 'regions'>('overview');

  // Calcular estadísticas a partir de las subvenciones
  useEffect(() => {
    if (subvenciones.length === 0) {
      setEstadisticas(null);
      return;
    }

    const totalSubvenciones = subvenciones.length;
    const subvencionesAbiertas = subvenciones.filter(s => s.estado === 'abierto').length;
    const subvencionesCerradas = subvenciones.filter(s => s.estado === 'cerrado').length;
    const subvencionesProximas = subvenciones.filter(s => s.estado === 'proximo').length;

    const totalFinanciacion = subvenciones.reduce((sum, s) => sum + (s.cuantia || 0), 0);
    const financiacionMedia = totalFinanciacion / totalSubvenciones;

    // Análisis por categorías
    const categoriasMap = new Map<string, { count: number; financiacion: number }>();
    subvenciones.forEach(s => {
      s.categorias?.forEach(cat => {
        const current = categoriasMap.get(cat) || { count: 0, financiacion: 0 };
        categoriasMap.set(cat, {
          count: current.count + 1,
          financiacion: current.financiacion + (s.cuantia || 0)
        });
      });
    });

    const analisisPorCategoria: CategoriaAnalysis[] = Array.from(categoriasMap.entries())
      .map(([categoria, data]) => ({
        categoria,
        totalSubvenciones: data.count,
        financiacionTotal: data.financiacion,
        financiacionPromedio: data.financiacion / data.count,
        subvencionesAbiertas: subvenciones.filter(s => 
          s.categorias?.includes(categoria) && s.estado === 'abierto'
        ).length,
        porcentajeDelTotal: (data.count / totalSubvenciones) * 100
      }))
      .sort((a, b) => b.totalSubvenciones - a.totalSubvenciones)
      .slice(0, 10);

    // Análisis por comunidad
    const comunidadesMap = new Map<string, { count: number; financiacion: number; organismos: Set<string> }>();
    subvenciones.forEach(s => {
      const current = comunidadesMap.get(s.comunidadAutonoma) || { 
        count: 0, 
        financiacion: 0, 
        organismos: new Set() 
      };
      current.count += 1;
      current.financiacion += s.cuantia || 0;
      current.organismos.add(s.organismo);
      comunidadesMap.set(s.comunidadAutonoma, current);
    });

    const analisisPorComunidad: ComunidadAnalysis[] = Array.from(comunidadesMap.entries())
      .map(([comunidad, data]) => ({
        comunidad,
        totalSubvenciones: data.count,
        financiacionTotal: data.financiacion,
        subvencionesAbiertas: subvenciones.filter(s => 
          s.comunidadAutonoma === comunidad && s.estado === 'abierto'
        ).length,
        organismosUnicos: data.organismos.size,
        categoriasPopulares: [] // Simplificado para este ejemplo
      }))
      .sort((a, b) => b.totalSubvenciones - a.totalSubvenciones);

    // Análisis de complejidad - simplificado
    const analisisComplejidad: ComplejidadAnalysis[] = ['baja', 'media', 'alta'].map(nivel => {
      const subvencionesNivel = subvenciones.filter(s => {
        const comp = s.complejidadAdministrativa === nivel ? nivel : 'media';
        return comp === nivel;
      });
      
      return {
        nivel: nivel as any,
        totalSubvenciones: subvencionesNivel.length,
        financiacionPromedio: subvencionesNivel.length > 0 
          ? subvencionesNivel.reduce((sum, s) => sum + (s.cuantia || 0), 0) / subvencionesNivel.length 
          : 0,
        tasaExito: 75, // Valor mock
        tiempoPromedioTramitacion: 45 // Valor mock en días
      };
    });

    // Mock data para otros análisis
    const analisisFinanciacion: FinanciacionAnalysis[] = [];
    const analisisRequisitos: RequisitoAnalysis[] = [];
    const tendenciasTempo: TemporalAnalysis[] = [];

    const stats: Estadisticas = {
      totalSubvenciones,
      subvencionesAbiertas,
      subvencionesCerradas,
      subvencionesProximas,
      totalFinanciacion,
      financiacionMedia,
      financiacionMediana: financiacionMedia, // Simplificado
      // Propiedades adicionales para compatibilidad
      totalPresupuesto: totalFinanciacion,
      proximosCierres: 0, // Se calculará después
      tasaExito: 75, // Mock value
      tendencias: [], // Se completará después
      categoriasMasPopulares: analisisPorCategoria.slice(0, 5).map(c => ({ 
        categoria: c.categoria, 
        count: c.totalSubvenciones 
      })),
      organismosMasActivos: [], // Simplificado
      comunidadesMasActivas: analisisPorComunidad.slice(0, 5).map(c => ({ 
        comunidad: c.comunidad, 
        count: c.totalSubvenciones 
      })),
      tendenciasTempo,
      analisisPorCategoria,
      analisisPorComunidad,
      analisisComplejidad,
      analisisFinanciacion,
      analisisRequisitos
    };

    setEstadisticas(stats);
  }, [subvenciones]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Cargando dashboard...</span>
      </div>
    );
  }

  if (!estadisticas) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <p className="text-gray-600">No hay datos para mostrar</p>
        <p className="text-sm text-gray-500 mt-2">Realiza una búsqueda para ver las estadísticas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Total Subvenciones</p>
              <p className="text-2xl font-bold text-blue-900">
                {formatNumber(estadisticas.totalSubvenciones)}
              </p>
              <p className="text-blue-600 text-xs">
                {estadisticas.subvencionesAbiertas} abiertas
              </p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Financiación Total</p>
              <p className="text-2xl font-bold text-green-900">
                {formatCurrency(estadisticas.totalFinanciacion)}
              </p>
              <p className="text-green-600 text-xs">
                Media: {formatCurrency(estadisticas.financiacionMedia)}
              </p>
            </div>
            <Euro className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Abiertas</p>
              <p className="text-2xl font-bold text-purple-900">
                {formatNumber(estadisticas.subvencionesAbiertas)}
              </p>
              <p className="text-purple-600 text-xs">
                {Math.round((estadisticas.subvencionesAbiertas / estadisticas.totalSubvenciones) * 100)}% del total
              </p>
            </div>
            <Activity className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Comunidades</p>
              <p className="text-2xl font-bold text-orange-900">
                {estadisticas.analisisPorComunidad.length}
              </p>
              <p className="text-orange-600 text-xs">
                Con subvenciones activas
              </p>
            </div>
            <MapPin className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        {[
          { id: 'overview', label: 'Resumen', icon: BarChart3 },
          { id: 'categories', label: 'Categorías', icon: PieChart },
          { id: 'temporal', label: 'Temporal', icon: Calendar },
          { id: 'regions', label: 'Regiones', icon: MapPin }
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
      <div className="bg-white rounded-xl shadow-sm">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Top Categorías */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Categorías Principales
                </h3>
                <div className="space-y-3">
                  {estadisticas.categoriasMasPopulares.slice(0, 5).map((categoria, index) => (
                    <div key={categoria.categoria} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 bg-blue-100 text-blue-600 text-xs font-medium rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-gray-900">{categoria.categoria}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {formatNumber(categoria.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top Comunidades */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2" />
                  Comunidades Más Activas
                </h3>
                <div className="space-y-3">
                  {estadisticas.comunidadesMasActivas.slice(0, 5).map((comunidad, index) => (
                    <div key={comunidad.comunidad} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 bg-green-100 text-green-600 text-xs font-medium rounded-full flex items-center justify-center">
                          {index + 1}
                        </span>
                        <span className="text-gray-900">{comunidad.comunidad}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-600">
                        {formatNumber(comunidad.count)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Análisis por Categorías</h3>
            <div className="space-y-4">
              {estadisticas.analisisPorCategoria.slice(0, 10).map(categoria => (
                <div key={categoria.categoria} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900">{categoria.categoria}</h4>
                    <span className="text-sm text-gray-600">
                      {categoria.porcentajeDelTotal.toFixed(1)}% del total
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total:</span>
                      <span className="ml-2 font-medium">{categoria.totalSubvenciones}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Abiertas:</span>
                      <span className="ml-2 font-medium text-green-600">{categoria.subvencionesAbiertas}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Financiación Media:</span>
                      <span className="ml-2 font-medium">{formatCurrency(categoria.financiacionPromedio)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Regions Tab */}
        {activeTab === 'regions' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Análisis por Regiones</h3>
            <div className="grid gap-6">
              {estadisticas.analisisPorComunidad.map(comunidad => (
                <div key={comunidad.comunidad} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-gray-900 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                      {comunidad.comunidad}
                    </h4>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Total Subvenciones:</span>
                      <div className="font-semibold text-lg">{comunidad.totalSubvenciones}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Abiertas:</span>
                      <div className="font-semibold text-lg text-green-600">{comunidad.subvencionesAbiertas}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Financiación Total:</span>
                      <div className="font-semibold text-lg">{formatCurrency(comunidad.financiacionTotal)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">Organismos Únicos:</span>
                      <div className="font-semibold text-lg">{comunidad.organismosUnicos}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Temporal Tab - Placeholder */}
        {activeTab === 'temporal' && (
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">Análisis Temporal</h3>
            <div className="text-center py-12 text-gray-500">
              <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>Análisis temporal no disponible</p>
              <p className="text-sm">Esta funcionalidad estará disponible próximamente</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
