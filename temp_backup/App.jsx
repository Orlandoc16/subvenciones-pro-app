import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, Filter, Download, Bell, TrendingUp, Calendar, Euro, 
  MapPin, Building, Users, FileText, AlertCircle, CheckCircle,
  Clock, Archive, Settings, BarChart, PieChart, Activity,
  Bookmark, Share2, ChevronDown, X, Plus, Minus, Eye
} from 'lucide-react';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import toast, { Toaster } from 'react-hot-toast';
import SubvencionesService from './services/SubvencionesService';
import AdvancedFilters from './components/AdvancedFilters';
import SubvencionCard from './components/SubvencionCard';
import Dashboard from './components/Dashboard';
import ExportModal from './components/ExportModal';
import AlertsConfig from './components/AlertsConfig';
import './App.css';

function App() {
  // Estados principales
  const [subvenciones, setSubvenciones] = useState([]);
  const [filteredSubvenciones, setFilteredSubvenciones] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedView, setSelectedView] = useState('grid'); // grid, list, dashboard
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showAlertsModal, setShowAlertsModal] = useState(false);
  const [savedSearches, setSavedSearches] = useState([]);
  const [bookmarkedItems, setBookmarkedItems] = useState(new Set());
  
  // Filtros principales
  const [filters, setFilters] = useState({
    // Filtros básicos
    estado: 'todos', // todos, abierto, cerrado, próximo
    categoria: [],
    comunidadAutonoma: [],
    cuantiaMin: '',
    cuantiaMax: '',
    fechaInicioDesde: '',
    fechaInicioHasta: '',
    fechaFinDesde: '',
    fechaFinHasta: '',
    
    // Filtros avanzados profesionales
    tipoEntidad: [], // pyme, autonomo, universidad, ong, startup, granEmpresa
    sectorEconomico: [], // tecnologia, industria, servicios, agricultura, turismo
    nivelTRL: [], // Para I+D: TRL 1-9
    impactoAmbiental: false,
    igualdadGenero: false,
    transformacionDigital: false,
    economiaCircular: false,
    empleoJoven: false,
    zonaRural: false,
    innovacionSocial: false,
    
    // Filtros de gestión
    tipoFinanciacion: [], // subvencion, prestamo, mixto, avales
    intensidadAyuda: '', // Porcentaje máximo de financiación
    garantiasRequeridas: 'cualquiera', // sin_garantias, con_garantias, cualquiera
    anticipoDisponible: false,
    compatibleOtrasAyudas: 'cualquiera',
    
    // Filtros de documentación
    complejidadAdministrativa: 'cualquiera', // baja, media, alta
    idiomaDocumentacion: [], // castellano, catalan, euskera, gallego, ingles
    certificacionesRequeridas: [], // ISO, EMAS, etc.
    
    // Filtros temporales avanzados
    diasHastacierre: '',
    plazoEjecucion: '', // meses
    periodoConcesion: '', // días estimados hasta resolución
    
    // Filtros de scoring/prioridad
    probabilidadConcesion: '', // Basado en históricos
    competitividad: '', // baja, media, alta
    presupuestoTotal: '',
    numerobeneficiarios: '',
    
    // Filtros de seguimiento
    requiereSeguimiento: false,
    requiereAuditoría: false,
    pagosIntermedios: false,
    
    // Ordenamiento
    ordenarPor: 'relevancia' // relevancia, fecha, cuantia, cierre, probabilidad
  });

  // Estadísticas
  const [stats, setStats] = useState({
    totalSubvenciones: 0,
    totalPresupuesto: 0,
    proximosCierres: 0,
    tasaExito: 0,
    tendencias: []
  });

  // Cargar datos iniciales
  useEffect(() => {
    loadSubvenciones();
    loadSavedSearches();
    loadBookmarks();
  }, []);

  // Aplicar filtros cuando cambien
  useEffect(() => {
    applyFilters();
  }, [filters, searchTerm, subvenciones]);

  const loadSubvenciones = async () => {
    setLoading(true);
    try {
      const data = await SubvencionesService.fetchSubvenciones();
      setSubvenciones(data);
      calculateStats(data);
      toast.success(`${data.length} subvenciones cargadas`);
    } catch (error) {
      toast.error('Error al cargar subvenciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedSearches = () => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  };

  const loadBookmarks = () => {
    const saved = localStorage.getItem('bookmarkedSubvenciones');
    if (saved) {
      setBookmarkedItems(new Set(JSON.parse(saved)));
    }
  };

  const applyFilters = () => {
    let filtered = [...subvenciones];

    // Búsqueda por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.titulo?.toLowerCase().includes(term) ||
        sub.descripcion?.toLowerCase().includes(term) ||
        sub.organismo?.toLowerCase().includes(term) ||
        sub.beneficiarios?.some(b => b.toLowerCase().includes(term))
      );
    }

    // Filtro por estado
    if (filters.estado !== 'todos') {
      const today = new Date();
      filtered = filtered.filter(sub => {
        const fechaFin = sub.fechaFin ? parseISO(sub.fechaFin) : null;
        const fechaInicio = sub.fechaInicio ? parseISO(sub.fechaInicio) : null;
        
        switch(filters.estado) {
          case 'abierto':
            return fechaFin && fechaFin > today && fechaInicio && fechaInicio <= today;
          case 'cerrado':
            return fechaFin && fechaFin < today;
          case 'proximo':
            return fechaInicio && fechaInicio > today;
          default:
            return true;
        }
      });
    }

    // Filtros por categoría
    if (filters.categoria.length > 0) {
      filtered = filtered.filter(sub => 
        filters.categoria.some(cat => sub.categorias?.includes(cat))
      );
    }

    // Filtros por comunidad autónoma
    if (filters.comunidadAutonoma.length > 0) {
      filtered = filtered.filter(sub => 
        filters.comunidadAutonoma.includes(sub.comunidadAutonoma)
      );
    }

    // Filtros por cuantía
    if (filters.cuantiaMin) {
      filtered = filtered.filter(sub => 
        parseFloat(sub.cuantia) >= parseFloat(filters.cuantiaMin)
      );
    }
    if (filters.cuantiaMax) {
      filtered = filtered.filter(sub => 
        parseFloat(sub.cuantia) <= parseFloat(filters.cuantiaMax)
      );
    }

    // Filtros por tipo de entidad
    if (filters.tipoEntidad.length > 0) {
      filtered = filtered.filter(sub => 
        filters.tipoEntidad.some(tipo => sub.tiposEntidad?.includes(tipo))
      );
    }

    // Filtros por sector económico
    if (filters.sectorEconomico.length > 0) {
      filtered = filtered.filter(sub => 
        filters.sectorEconomico.some(sector => sub.sectores?.includes(sector))
      );
    }

    // Filtros booleanos avanzados
    if (filters.impactoAmbiental) {
      filtered = filtered.filter(sub => sub.requisitoAmbiental);
    }
    if (filters.igualdadGenero) {
      filtered = filtered.filter(sub => sub.requisitoIgualdad);
    }
    if (filters.transformacionDigital) {
      filtered = filtered.filter(sub => sub.esDigital);
    }
    if (filters.economiaCircular) {
      filtered = filtered.filter(sub => sub.esCircular);
    }
    if (filters.empleoJoven) {
      filtered = filtered.filter(sub => sub.paraJovenes);
    }
    if (filters.zonaRural) {
      filtered = filtered.filter(sub => sub.zonaRural);
    }

    // Filtro por días hasta cierre
    if (filters.diasHastacierre) {
      const maxDias = parseInt(filters.diasHastacierre);
      const today = new Date();
      filtered = filtered.filter(sub => {
        if (!sub.fechaFin) return false;
        const diasRestantes = differenceInDays(parseISO(sub.fechaFin), today);
        return diasRestantes <= maxDias && diasRestantes >= 0;
      });
    }

    // Ordenamiento
    filtered = sortSubvenciones(filtered, filters.ordenarPor);

    setFilteredSubvenciones(filtered);
  };

  const sortSubvenciones = (data, criterio) => {
    const sorted = [...data];
    
    switch(criterio) {
      case 'fecha':
        return sorted.sort((a, b) => {
          const fechaA = a.fechaFin ? parseISO(a.fechaFin) : new Date(9999, 0);
          const fechaB = b.fechaFin ? parseISO(b.fechaFin) : new Date(9999, 0);
          return fechaA - fechaB;
        });
      
      case 'cuantia':
        return sorted.sort((a, b) => 
          parseFloat(b.cuantia || 0) - parseFloat(a.cuantia || 0)
        );
      
      case 'cierre':
        const today = new Date();
        return sorted.sort((a, b) => {
          const diasA = a.fechaFin ? differenceInDays(parseISO(a.fechaFin), today) : 9999;
          const diasB = b.fechaFin ? differenceInDays(parseISO(b.fechaFin), today) : 9999;
          return diasA - diasB;
        });
      
      case 'probabilidad':
        return sorted.sort((a, b) => 
          (b.probabilidadConcesion || 0) - (a.probabilidadConcesion || 0)
        );
      
      case 'relevancia':
      default:
        // Algoritmo de relevancia basado en múltiples factores
        return sorted.sort((a, b) => {
          const scoreA = calculateRelevanceScore(a);
          const scoreB = calculateRelevanceScore(b);
          return scoreB - scoreA;
        });
    }
  };

  const calculateRelevanceScore = (subvencion) => {
    let score = 0;
    const today = new Date();
    
    // Peso por estado abierto
    if (subvencion.fechaFin && parseISO(subvencion.fechaFin) > today) {
      score += 50;
    }
    
    // Peso por cuantía
    const cuantia = parseFloat(subvencion.cuantia || 0);
    score += Math.min(cuantia / 10000, 30);
    
    // Peso por días hasta cierre (más urgente = más relevante)
    if (subvencion.fechaFin) {
      const diasRestantes = differenceInDays(parseISO(subvencion.fechaFin), today);
      if (diasRestantes > 0 && diasRestantes < 30) {
        score += (30 - diasRestantes);
      }
    }
    
    // Peso por probabilidad de concesión
    score += (subvencion.probabilidadConcesion || 0) * 0.2;
    
    // Peso por bookmarks
    if (bookmarkedItems.has(subvencion.id)) {
      score += 10;
    }
    
    return score;
  };

  const calculateStats = (data) => {
    const today = new Date();
    const proximos7Dias = addDays(today, 7);
    
    const stats = {
      totalSubvenciones: data.length,
      totalPresupuesto: data.reduce((sum, sub) => 
        sum + parseFloat(sub.cuantia || 0), 0
      ),
      proximosCierres: data.filter(sub => {
        if (!sub.fechaFin) return false;
        const fechaFin = parseISO(sub.fechaFin);
        return fechaFin > today && fechaFin <= proximos7Dias;
      }).length,
      tasaExito: data.filter(sub => sub.probabilidadConcesion > 70).length / data.length * 100,
      tendencias: analyzeTrends(data)
    };
    
    setStats(stats);
  };

  const analyzeTrends = (data) => {
    const categoryCounts = {};
    data.forEach(sub => {
      sub.categorias?.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });
    
    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([categoria, count]) => ({ categoria, count }));
  };

  const handleSaveSearch = () => {
    const searchConfig = {
      id: Date.now(),
      name: `Búsqueda ${format(new Date(), 'dd/MM HH:mm')}`,
      filters: { ...filters },
      searchTerm,
      date: new Date().toISOString()
    };
    
    const newSavedSearches = [...savedSearches, searchConfig];
    setSavedSearches(newSavedSearches);
    localStorage.setItem('savedSearches', JSON.stringify(newSavedSearches));
    toast.success('Búsqueda guardada');
  };

  const handleLoadSearch = (search) => {
    setFilters(search.filters);
    setSearchTerm(search.searchTerm);
    toast.success('Búsqueda cargada');
  };

  const handleToggleBookmark = (id) => {
    const newBookmarks = new Set(bookmarkedItems);
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id);
      toast.success('Eliminado de favoritos');
    } else {
      newBookmarks.add(id);
      toast.success('Añadido a favoritos');
    }
    setBookmarkedItems(newBookmarks);
    localStorage.setItem('bookmarkedSubvenciones', JSON.stringify([...newBookmarks]));
  };

  const handleExport = (format, selectedIds) => {
    const dataToExport = selectedIds.length > 0 
      ? filteredSubvenciones.filter(sub => selectedIds.includes(sub.id))
      : filteredSubvenciones;
    
    SubvencionesService.exportData(dataToExport, format);
    toast.success(`Exportado en formato ${format.toUpperCase()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Euro className="w-6 h-6 text-blue-600" />
                SubvencionesPro
              </h1>
              <span className="ml-4 px-3 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                {stats.totalSubvenciones} subvenciones disponibles
              </span>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Vista selector */}
              <div className="flex bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setSelectedView('grid')}
                  className={`px-3 py-1 rounded ${selectedView === 'grid' ? 'bg-white shadow-sm' : ''}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <rect x="3" y="3" width="7" height="7" />
                    <rect x="14" y="3" width="7" height="7" />
                    <rect x="3" y="14" width="7" height="7" />
                    <rect x="14" y="14" width="7" height="7" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedView('list')}
                  className={`px-3 py-1 rounded ${selectedView === 'list' ? 'bg-white shadow-sm' : ''}`}
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
                <button
                  onClick={() => setSelectedView('dashboard')}
                  className={`px-3 py-1 rounded ${selectedView === 'dashboard' ? 'bg-white shadow-sm' : ''}`}
                >
                  <BarChart className="w-4 h-4" />
                </button>
              </div>
              
              {/* Acciones rápidas */}
              <button
                onClick={() => setShowAlertsModal(true)}
                className="p-2 text-gray-600 hover:text-gray-900 relative"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              <button
                onClick={() => setShowExportModal(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Barra de búsqueda y filtros rápidos */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Búsqueda */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por título, organismo, sector, beneficiarios..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2"
                >
                  <X className="w-4 h-4 text-gray-400" />
                </button>
              )}
            </div>
            
            {/* Filtros rápidos */}
            <div className="flex gap-2">
              <select
                value={filters.estado}
                onChange={(e) => setFilters({...filters, estado: e.target.value})}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="todos">Todos los estados</option>
                <option value="abierto">✅ Abiertas</option>
                <option value="cerrado">🔒 Cerradas</option>
                <option value="proximo">🔜 Próximas</option>
              </select>
              
              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className={`px-4 py-2 border rounded-lg flex items-center gap-2 ${
                  showAdvancedFilters ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filtros avanzados
                {Object.keys(filters).filter(key => {
                  const value = filters[key];
                  return value && value !== 'todos' && value !== 'cualquiera' && 
                         (Array.isArray(value) ? value.length > 0 : true);
                }).length > 0 && (
                  <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    {Object.keys(filters).filter(key => {
                      const value = filters[key];
                      return value && value !== 'todos' && value !== 'cualquiera' && 
                             (Array.isArray(value) ? value.length > 0 : true);
                    }).length}
                  </span>
                )}
                <ChevronDown className={`w-4 h-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </button>
              
              <button
                onClick={handleSaveSearch}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Bookmark className="w-4 h-4" />
              </button>
            </div>
          </div>
          
          {/* Búsquedas guardadas */}
          {savedSearches.length > 0 && (
            <div className="mt-3 flex items-center gap-2">
              <span className="text-sm text-gray-500">Búsquedas guardadas:</span>
              <div className="flex gap-2 flex-wrap">
                {savedSearches.slice(-3).map(search => (
                  <button
                    key={search.id}
                    onClick={() => handleLoadSearch(search)}
                    className="px-3 py-1 bg-gray-100 text-sm rounded-full hover:bg-gray-200"
                  >
                    {search.name}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Filtros avanzados */}
      {showAdvancedFilters && (
        <AdvancedFilters 
          filters={filters} 
          setFilters={setFilters}
          onClose={() => setShowAdvancedFilters(false)}
        />
      )}

      {/* Estadísticas rápidas */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Presupuesto total</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Intl.NumberFormat('es-ES', { 
                    style: 'currency', 
                    currency: 'EUR',
                    notation: 'compact',
                    maximumFractionDigits: 1
                  }).format(stats.totalPresupuesto)}
                </p>
              </div>
              <Euro className="w-8 h-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Cierran en 7 días</p>
                <p className="text-2xl font-bold text-orange-600">{stats.proximosCierres}</p>
              </div>
              <Clock className="w-8 h-8 text-orange-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Tasa de éxito</p>
                <p className="text-2xl font-bold text-gray-900">{stats.tasaExito.toFixed(1)}%</p>
              </div>
              <TrendingUp className="w-8 h-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white rounded-lg p-4 border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Resultados</p>
                <p className="text-2xl font-bold text-gray-900">{filteredSubvenciones.length}</p>
              </div>
              <Activity className="w-8 h-8 text-purple-500" />
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {selectedView === 'dashboard' ? (
          <Dashboard 
            subvenciones={filteredSubvenciones}
            stats={stats}
          />
        ) : (
          <div className={`
            ${selectedView === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' : 'space-y-4'}
          `}>
            {loading ? (
              <div className="col-span-full flex justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            ) : filteredSubvenciones.length > 0 ? (
              filteredSubvenciones.map(subvencion => (
                <SubvencionCard
                  key={subvencion.id}
                  subvencion={subvencion}
                  view={selectedView}
                  isBookmarked={bookmarkedItems.has(subvencion.id)}
                  onToggleBookmark={() => handleToggleBookmark(subvencion.id)}
                />
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron subvenciones con los filtros aplicados</p>
                <button
                  onClick={() => {
                    setFilters({
                      estado: 'todos',
                      categoria: [],
                      comunidadAutonoma: [],
                      cuantiaMin: '',
                      cuantiaMax: '',
                      fechaInicioDesde: '',
                      fechaInicioHasta: '',
                      fechaFinDesde: '',
                      fechaFinHasta: '',
                      tipoEntidad: [],
                      sectorEconomico: [],
                      nivelTRL: [],
                      impactoAmbiental: false,
                      igualdadGenero: false,
                      transformacionDigital: false,
                      economiaCircular: false,
                      empleoJoven: false,
                      zonaRural: false,
                      innovacionSocial: false,
                      tipoFinanciacion: [],
                      intensidadAyuda: '',
                      garantiasRequeridas: 'cualquiera',
                      anticipoDisponible: false,
                      compatibleOtrasAyudas: 'cualquiera',
                      complejidadAdministrativa: 'cualquiera',
                      idiomaDocumentacion: [],
                      certificacionesRequeridas: [],
                      diasHastacierre: '',
                      plazoEjecucion: '',
                      periodoConcesion: '',
                      probabilidadConcesion: '',
                      competitividad: '',
                      presupuestoTotal: '',
                      numerobeneficiarios: '',
                      requiereSeguimiento: false,
                      requiereAuditoría: false,
                      pagosIntermedios: false,
                      ordenarPor: 'relevancia'
                    });
                    setSearchTerm('');
                  }}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Limpiar filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modales */}
      {showExportModal && (
        <ExportModal
          data={filteredSubvenciones}
          onExport={handleExport}
          onClose={() => setShowExportModal(false)}
        />
      )}
      
      {showAlertsModal && (
        <AlertsConfig
          filters={filters}
          onClose={() => setShowAlertsModal(false)}
        />
      )}
    </div>
  );
}

export default App;
