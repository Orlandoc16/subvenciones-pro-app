import React, { useState, useEffect, useCallback } from 'react';
import { 
  Search, Filter, Download, Bell, TrendingUp, Euro, 
  AlertCircle, Clock, BarChart, Activity,
  Bookmark, ChevronDown, X
} from 'lucide-react';
import { format, parseISO, differenceInDays, addDays } from 'date-fns';

import toast, { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import clsx from 'clsx';

// Import services
import SubvencionesService from '@/services/SubvencionesService';

// Import components
import AdvancedFilters from '@/components/AdvancedFilters';
import SubvencionCard from '@/components/SubvencionCard';
import Dashboard from '@/components/Dashboard';
import ExportModal from '@/components/ExportModal';
import AlertsConfig from '@/components/AlertsConfig';

// Import types
import type { 
  Subvencion, 
  Filtros, 
  Estadisticas, 
  SavedSearch,
  ExportFormat,
  Tendencia
} from '@/types';

// Import styles
import './App.css';

// Create QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 3,
      refetchOnWindowFocus: false,
    },
  },
});

function App(): React.JSX.Element {
  // Estados principales con tipos
  const [subvenciones, setSubvenciones] = useState<Subvencion[]>([]);
  const [filteredSubvenciones, setFilteredSubvenciones] = useState<Subvencion[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedView, setSelectedView] = useState<'grid' | 'list' | 'dashboard'>('grid');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState<boolean>(false);
  const [showExportModal, setShowExportModal] = useState<boolean>(false);
  const [showAlertsModal, setShowAlertsModal] = useState<boolean>(false);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [bookmarkedItems, setBookmarkedItems] = useState<Set<string>>(new Set());
  
  // Filtros principales con tipos
  const [filters, setFilters] = useState<Filtros>({
    // Filtros básicos
    estado: 'abierto',
    categoria: [],
    comunidadAutonoma: [],
    cuantiaMin: '',
    cuantiaMax: '',
    fechaInicioDesde: '',
    fechaInicioHasta: '',
    fechaFinDesde: '',
    fechaFinHasta: '',
    
    // Filtros avanzados profesionales
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
    
    // Filtros de gestión
    tipoFinanciacion: [],
    intensidadAyuda: '',
    garantiasRequeridas: 'cualquiera',
    anticipoDisponible: false,
    compatibleOtrasAyudas: 'si',
    
    // Filtros de documentación
    complejidadAdministrativa: 'baja',
    idiomaDocumentacion: [],
    certificacionesRequeridas: [],
    
    // Filtros temporales avanzados
    diasHastacierre: '',
    plazoEjecucion: '',
    periodoConcesion: '',
    
    // Filtros de scoring/prioridad
    probabilidadConcesion: '',
    competitividad: undefined,
    presupuestoTotal: '',
    numerobeneficiarios: '',
    
    // Filtros de seguimiento
    requiereSeguimiento: false,
    requiereAuditoría: false,
    pagosIntermedios: false,
    
    // Ordenamiento
    ordenarPor: 'relevancia'
  });

  // Estadísticas con tipos
  const [stats, setStats] = useState<Estadisticas>({
    totalSubvenciones: 0,
    subvencionesAbiertas: 0,
    subvencionesCerradas: 0,
    subvencionesProximas: 0,
    totalFinanciacion: 0,
    financiacionMedia: 0,
    financiacionMediana: 0,
    totalPresupuesto: 0,
    proximosCierres: 0,
    tasaExito: 0,
    tendencias: [],
    categoriasMasPopulares: [],
    organismosMasActivos: [],
    comunidadesMasActivas: [],
    tendenciasTempo: [],
    analisisPorCategoria: [],
    analisisPorComunidad: [],
    analisisComplejidad: [],
    analisisFinanciacion: [],
    analisisRequisitos: []
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

  const loadSubvenciones = async (): Promise<void> => {
    setLoading(true);
    try {
      // Datos de ejemplo directos para demostración
      const data: Subvencion[] = [
        {
          id: '1',
          bdns: '123456',
          titulo: 'Programa Kit Digital PYME 2025 - Transformación Digital',
          descripcion: 'Subvenciones para la digitalización de pequeñas y medianas empresas mediante la implementación de soluciones tecnológicas avanzadas.',
          organismo: 'Ministerio de Asuntos Económicos y Transformación Digital',
          cuantia: 125000,
          fechaInicio: '2025-01-15',
          fechaFin: '2025-03-31',
          beneficiarios: ['PYMES', 'Autónomos', 'Microempresas'],
          categorias: ['Digitalización', 'Innovación', 'Empresa'],
          sectores: ['Tecnología e Informática', 'Servicios Profesionales'],
          comunidadAutonoma: 'Nacional',
          url: 'https://www.acelerapyme.gob.es/kit-digital',
          boletin: 'BOE',
          estado: 'abierto',
          tiposEntidad: ['pyme', 'autonomo'],
          requisitoAmbiental: false,
          requisitoIgualdad: true,
          esDigital: true,
          esCircular: false,
          paraJovenes: false,
          zonaRural: false,
          tipoFinanciacion: 'subvencion',
          intensidadAyuda: 80,
          garantiasRequeridas: false,
          anticipoDisponible: true,
          compatibleOtrasAyudas: true,
          complejidadAdministrativa: 'baja',
          probabilidadConcesion: 75,
          competitividad: 'media',
          requiereSeguimiento: true,
          requiereAuditoria: false,
          pagosIntermedios: true,
          etiquetas: [
            { id: '1', nombre: 'Digital', color: '#3B82F6', categoria: 'requisito' },
            { id: '2', nombre: 'PYME', color: '#10B981', categoria: 'beneficiario' }
          ],
          diasRestantes: 45
        },
        {
          id: '2',
          bdns: '789012',
          titulo: 'Ayudas para Proyectos de I+D+i en Biotecnología Médica',
          descripcion: 'Financiación para proyectos de investigación, desarrollo e innovación en el sector de la biotecnología aplicada a la salud.',
          organismo: 'Ministerio de Ciencia e Innovación - CDTI',
          cuantia: 2500000,
          fechaInicio: '2024-11-15',
          fechaFin: '2025-01-30',
          beneficiarios: ['Centros de investigación', 'Universidades', 'Empresas biotecnológicas'],
          categorias: ['I+D+i', 'Salud', 'Biotecnología'],
          sectores: ['Salud y Biotecnología', 'Educación y Formación'],
          comunidadAutonoma: 'Nacional',
          url: 'https://www.cdti.es',
          boletin: 'BOE',
          estado: 'cerrado',
          tiposEntidad: ['universidad', 'centro_investigacion', 'gran_empresa'],
          requisitoAmbiental: true,
          requisitoIgualdad: true,
          esDigital: false,
          esCircular: false,
          paraJovenes: true,
          zonaRural: false,
          tipoFinanciacion: 'prestamo',
          intensidadAyuda: 75,
          garantiasRequeridas: true,
          anticipoDisponible: false,
          compatibleOtrasAyudas: false,
          complejidadAdministrativa: 'alta',
          probabilidadConcesion: 45,
          competitividad: 'alta',
          requiereSeguimiento: true,
          requiereAuditoria: true,
          pagosIntermedios: false,
          etiquetas: [
            { id: '4', nombre: 'I+D+i', color: '#8B5CF6', categoria: 'sector' },
            { id: '5', nombre: 'Biotecnología', color: '#EC4899', categoria: 'sector' }
          ],
          diasRestantes: -15
        },
        {
          id: '3',
          bdns: '345678',
          titulo: 'Subvenciones para Emprendimiento Femenino en Zonas Rurales',
          descripcion: 'Programa de apoyo al emprendimiento de mujeres en municipios de menos de 10.000 habitantes.',
          organismo: 'Instituto de la Mujer y para la Igualdad de Oportunidades',
          cuantia: 45000,
          fechaInicio: '2025-03-01',
          fechaFin: '2025-06-15',
          beneficiarios: ['Mujeres emprendedoras', 'Startups rurales', 'Cooperativas'],
          categorias: ['Empleo', 'Igualdad', 'Emprendimiento'],
          sectores: ['Agricultura y Alimentación', 'Servicios Profesionales'],
          comunidadAutonoma: 'Castilla-La Mancha',
          url: 'https://www.inmujeres.gob.es',
          boletin: 'DOCM',
          estado: 'proximo',
          tiposEntidad: ['startup', 'cooperativa', 'persona_fisica'],
          requisitoAmbiental: false,
          requisitoIgualdad: true,
          esDigital: false,
          esCircular: false,
          paraJovenes: true,
          zonaRural: true,
          tipoFinanciacion: 'subvencion',
          intensidadAyuda: 85,
          garantiasRequeridas: false,
          anticipoDisponible: true,
          compatibleOtrasAyudas: true,
          complejidadAdministrativa: 'baja',
          probabilidadConcesion: 65,
          competitividad: 'baja',
          requiereSeguimiento: false,
          requiereAuditoria: false,
          pagosIntermedios: true,
          etiquetas: [
            { id: '7', nombre: 'Igualdad', color: '#EC4899', categoria: 'requisito' },
            { id: '8', nombre: 'Rural', color: '#84CC16', categoria: 'requisito' }
          ],
          diasRestantes: 120
        },
        {
          id: '4',
          bdns: '567890',
          titulo: 'Incentivos para la Industria 4.0 y Fabricación Avanzada',
          descripcion: 'Ayudas para la modernización de procesos industriales mediante tecnologías 4.0: IoT, IA, robótica colaborativa.',
          organismo: 'Ministerio de Industria, Comercio y Turismo',
          cuantia: 750000,
          fechaInicio: '2025-01-20',
          fechaFin: '2025-04-30',
          beneficiarios: ['Empresas industriales', 'Fabricantes', 'Proveedores tecnológicos'],
          categorias: ['Industria 4.0', 'Innovación', 'Digitalización'],
          sectores: ['Industria y Manufactura', 'Tecnología e Informática'],
          comunidadAutonoma: 'País Vasco',
          url: 'https://www.mincotur.gob.es',
          boletin: 'BOPV',
          estado: 'abierto',
          tiposEntidad: ['pyme', 'gran_empresa'],
          requisitoAmbiental: true,
          requisitoIgualdad: false,
          esDigital: true,
          esCircular: true,
          paraJovenes: false,
          zonaRural: false,
          tipoFinanciacion: 'mixto',
          intensidadAyuda: 70,
          garantiasRequeridas: true,
          anticipoDisponible: false,
          compatibleOtrasAyudas: false,
          complejidadAdministrativa: 'alta',
          probabilidadConcesion: 55,
          competitividad: 'alta',
          requiereSeguimiento: true,
          requiereAuditoria: true,
          pagosIntermedios: true,
          etiquetas: [
            { id: '10', nombre: 'Industria 4.0', color: '#7C3AED', categoria: 'sector' },
            { id: '11', nombre: 'Sostenible', color: '#10B981', categoria: 'requisito' }
          ],
          diasRestantes: 85
        },
        {
          id: '5',
          bdns: '901234',
          titulo: 'Programa de Transición Energética para Comercio Local',
          descripcion: 'Subvenciones para la instalación de sistemas de energías renovables en comercios locales.',
          organismo: 'Instituto para la Diversificación y Ahorro de la Energía (IDAE)',
          cuantia: 35000,
          fechaInicio: '2025-02-01',
          fechaFin: '2025-05-15',
          beneficiarios: ['Comercios locales', 'Autónomos del comercio', 'Pequeñas empresas'],
          categorias: ['Energía', 'Sostenibilidad', 'Comercio'],
          sectores: ['Comercio y Distribución', 'Energía y Utilities'],
          comunidadAutonoma: 'Comunidad Valenciana',
          url: 'https://www.idae.es',
          boletin: 'DOGV',
          estado: 'abierto',
          tiposEntidad: ['autonomo', 'pyme'],
          requisitoAmbiental: true,
          requisitoIgualdad: false,
          esDigital: false,
          esCircular: true,
          paraJovenes: false,
          zonaRural: false,
          tipoFinanciacion: 'subvencion',
          intensidadAyuda: 90,
          garantiasRequeridas: false,
          anticipoDisponible: true,
          compatibleOtrasAyudas: true,
          complejidadAdministrativa: 'media',
          probabilidadConcesion: 80,
          competitividad: 'baja',
          requiereSeguimiento: true,
          requiereAuditoria: false,
          pagosIntermedios: false,
          etiquetas: [
            { id: '13', nombre: 'Energía Verde', color: '#10B981', categoria: 'sector' },
            { id: '14', nombre: 'Comercio Local', color: '#F59E0B', categoria: 'beneficiario' }
          ],
          diasRestantes: 75
        },
        {
          id: '6',
          bdns: '456789',
          titulo: 'Ayudas para Cooperativas de Economía Social y Solidaria',
          descripcion: 'Financiación para cooperativas que desarrollen proyectos de impacto social positivo.',
          organismo: 'Ministerio de Trabajo y Economía Social',
          cuantia: 85000,
          fechaInicio: '2025-01-10',
          fechaFin: '2025-03-20',
          beneficiarios: ['Cooperativas', 'Empresas de inserción', 'ONGs'],
          categorias: ['Economía Social', 'Empleo', 'Innovación Social'],
          sectores: ['Servicios Profesionales'],
          comunidadAutonoma: 'Andalucía',
          url: 'https://www.mites.gob.es',
          boletin: 'BOJA',
          estado: 'abierto',
          tiposEntidad: ['cooperativa', 'ong'],
          requisitoAmbiental: false,
          requisitoIgualdad: true,
          esDigital: false,
          esCircular: false,
          paraJovenes: true,
          zonaRural: true,
          tipoFinanciacion: 'avales',
          intensidadAyuda: 95,
          garantiasRequeridas: false,
          anticipoDisponible: false,
          compatibleOtrasAyudas: true,
          complejidadAdministrativa: 'media',
          probabilidadConcesion: 70,
          competitividad: 'media',
          requiereSeguimiento: false,
          requiereAuditoria: false,
          pagosIntermedios: true,
          etiquetas: [
            { id: '16', nombre: 'Economía Social', color: '#EC4899', categoria: 'sector' },
            { id: '17', nombre: 'Cooperativas', color: '#06B6D4', categoria: 'beneficiario' }
          ],
          diasRestantes: 52
        }
      ];
      
      setSubvenciones(data);
      calculateStats(data);
      toast.success(`${data.length} subvenciones cargadas correctamente`);
    } catch (error) {
      toast.error('Error al cargar subvenciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadSavedSearches = (): void => {
    const saved = localStorage.getItem('savedSearches');
    if (saved) {
      setSavedSearches(JSON.parse(saved));
    }
  };

  const loadBookmarks = (): void => {
    const saved = localStorage.getItem('bookmarkedSubvenciones');
    if (saved) {
      setBookmarkedItems(new Set(JSON.parse(saved)));
    }
  };

  const applyFilters = useCallback((): void => {
    let filtered = [...subvenciones];

    // Búsqueda por texto
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sub => 
        sub.titulo?.toLowerCase().includes(term) ||
        sub.descripcion?.toLowerCase().includes(term) ||
        sub.organismo?.toLowerCase().includes(term) ||
        sub.beneficiarios?.some((b: string) => b.toLowerCase().includes(term))
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
    if (filters.categoria && filters.categoria.length > 0) {
      filtered = filtered.filter(sub => 
        filters.categoria!.some((cat: string) => sub.categorias?.includes(cat))
      );
    }

    // Filtros por comunidad autónoma
    if (filters.comunidadAutonoma && Array.isArray(filters.comunidadAutonoma) && filters.comunidadAutonoma.length > 0) {
      filtered = filtered.filter(sub => 
        (filters.comunidadAutonoma as string[]).includes(sub.comunidadAutonoma)
      );
    } else if (filters.comunidadAutonoma && typeof filters.comunidadAutonoma === 'string') {
      filtered = filtered.filter(sub => 
        sub.comunidadAutonoma === filters.comunidadAutonoma
      );
    }

    // Filtros por cuantía
    if (filters.cuantiaMin && filters.cuantiaMin.trim()) {
      filtered = filtered.filter(sub => 
        sub.cuantia >= parseFloat(filters.cuantiaMin!)
      );
    }
    if (filters.cuantiaMax && filters.cuantiaMax.trim()) {
      filtered = filtered.filter(sub => 
        sub.cuantia <= parseFloat(filters.cuantiaMax!)
      );
    }

    // Filtros por tipo de entidad
    if (filters.tipoEntidad && filters.tipoEntidad.length > 0) {
      filtered = filtered.filter(sub => 
        filters.tipoEntidad!.some((tipo: string) => sub.tiposEntidad?.includes(tipo))
      );
    }

    // Filtros por sector económico
    if (filters.sectorEconomico && filters.sectorEconomico.length > 0) {
      filtered = filtered.filter(sub => 
        filters.sectorEconomico!.some((sector: string) => sub.sectores?.includes(sector))
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
    filtered = sortSubvenciones(filtered, filters.ordenarPor || 'relevancia');

    setFilteredSubvenciones(filtered);
  }, [subvenciones, searchTerm, filters]);

  const sortSubvenciones = (data: Subvencion[], criterio: string): Subvencion[] => {
    const sorted = [...data];
    
    switch(criterio) {
      case 'fecha':
        return sorted.sort((a, b) => {
          const fechaA = a.fechaFin ? parseISO(a.fechaFin) : new Date(9999, 0);
          const fechaB = b.fechaFin ? parseISO(b.fechaFin) : new Date(9999, 0);
          return fechaA.getTime() - fechaB.getTime();
        });
      
      case 'cuantia':
        return sorted.sort((a, b) => b.cuantia - a.cuantia);
      
      case 'cierre':
        const today = new Date();
        return sorted.sort((a, b) => {
          const diasA = a.fechaFin ? differenceInDays(parseISO(a.fechaFin), today) : 9999;
          const diasB = b.fechaFin ? differenceInDays(parseISO(b.fechaFin), today) : 9999;
          return diasA - diasB;
        });
      
      case 'probabilidad':
        return sorted.sort((a, b) => b.probabilidadConcesion - a.probabilidadConcesion);
      
      case 'relevancia':
      default:
        return sorted.sort((a, b) => {
          const scoreA = calculateRelevanceScore(a);
          const scoreB = calculateRelevanceScore(b);
          return scoreB - scoreA;
        });
    }
  };

  const calculateRelevanceScore = (subvencion: Subvencion): number => {
    let score = 0;
    const today = new Date();
    
    // Peso por estado abierto
    if (subvencion.fechaFin && parseISO(subvencion.fechaFin) > today) {
      score += 50;
    }
    
    // Peso por cuantía
    score += Math.min(subvencion.cuantia / 10000, 30);
    
    // Peso por días hasta cierre
    if (subvencion.fechaFin) {
      const diasRestantes = differenceInDays(parseISO(subvencion.fechaFin), today);
      if (diasRestantes > 0 && diasRestantes < 30) {
        score += (30 - diasRestantes);
      }
    }
    
    // Peso por probabilidad de concesión
    score += subvencion.probabilidadConcesion * 0.2;
    
    // Peso por bookmarks
    if (bookmarkedItems.has(subvencion.id)) {
      score += 10;
    }
    
    return score;
  };

  const calculateStats = (data: Subvencion[]): void => {
    const today = new Date();
    const proximos7Dias = addDays(today, 7);
    
    const stats: Estadisticas = {
      totalSubvenciones: data.length,
      subvencionesAbiertas: data.filter(s => s.estado === 'abierto').length,
      subvencionesCerradas: data.filter(s => s.estado === 'cerrado').length,
      subvencionesProximas: data.filter(s => s.estado === 'proximo').length,
      totalFinanciacion: data.reduce((sum, sub) => sum + sub.cuantia, 0),
      financiacionMedia: data.length > 0 ? data.reduce((sum, sub) => sum + sub.cuantia, 0) / data.length : 0,
      financiacionMediana: data.length > 0 ? data.reduce((sum, sub) => sum + sub.cuantia, 0) / data.length : 0,
      totalPresupuesto: data.reduce((sum, sub) => sum + sub.cuantia, 0),
      proximosCierres: data.filter(sub => {
        if (!sub.fechaFin) return false;
        const fechaFin = parseISO(sub.fechaFin);
        return fechaFin > today && fechaFin <= proximos7Dias;
      }).length,
      tasaExito: data.length > 0 ? data.filter(sub => sub.probabilidadConcesion > 70).length / data.length * 100 : 0,
      tendencias: analyzeTrends(data),
      categoriasMasPopulares: [],
      organismosMasActivos: [],
      comunidadesMasActivas: [],
      tendenciasTempo: [],
      analisisPorCategoria: [],
      analisisPorComunidad: [],
      analisisComplejidad: [],
      analisisFinanciacion: [],
      analisisRequisitos: []
    };
    
    setStats(stats);
  };

  const analyzeTrends = (data: Subvencion[]): Tendencia[] => {
    const categoryCounts: Record<string, number> = {};
    data.forEach(sub => {
      sub.categorias?.forEach(cat => {
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
      });
    });
    
    return Object.entries(categoryCounts)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 5)
      .map(([categoria, count]): Tendencia => ({ 
        categoria, 
        valor: count,
        cambio: 0, // Mock value
        porcentajeCambio: 0, // Mock value 
        tendencia: 'estable' as const
      }));
  };

  const handleSaveSearch = (): void => {
    const searchConfig: SavedSearch = {
      id: Date.now().toString(),
      nombre: `Búsqueda ${format(new Date(), 'dd/MM HH:mm')}`,
      name: `Búsqueda ${format(new Date(), 'dd/MM HH:mm')}`,
      filtros: filters,
      filters: filters,
      searchTerm: searchTerm,
      fechaCreacion: new Date(),
      activa: true,
      alertas: false
    };
    
    const updated = [...savedSearches, searchConfig];
    setSavedSearches(updated);
    localStorage.setItem('savedSearches', JSON.stringify(updated));
    toast.success('Búsqueda guardada');
  };

  const handleLoadSearch = (search: SavedSearch): void => {
    setFilters(search.filters);
    setSearchTerm(search.searchTerm || '');
    toast.success(`Búsqueda "${search.name}" cargada`);
  };

  const handleToggleBookmark = (id: string): void => {
    const newBookmarks = new Set(bookmarkedItems);
    if (newBookmarks.has(id)) {
      newBookmarks.delete(id);
      toast.success('Subvención eliminada de guardados');
    } else {
      newBookmarks.add(id);
      toast.success('Subvención guardada');
    }
    setBookmarkedItems(newBookmarks);
    localStorage.setItem('bookmarkedSubvenciones', JSON.stringify(Array.from(newBookmarks)));
  };

  const handleExport = async (options: ExportFormat | any): Promise<void> => {
    try {
      // Si es solo el formato (compatibilidad), crear options completo
      if (typeof options === 'string') {
        const exportOptions = {
          formato: options as ExportFormat,
          incluirDetalles: true,
          incluirEstadisticas: false,
          incluirGraficos: false
        };
        await SubvencionesService.exportData(filteredSubvenciones, exportOptions.formato);
      } else {
        // Si es objeto completo ExportOptions
        await SubvencionesService.exportData(filteredSubvenciones, options.formato);
      }
      toast.success('Archivo exportado correctamente');
    } catch (error) {
      toast.error('Error al exportar el archivo');
      console.error(error);
    }
  };

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <Toaster position="top-right" />
        
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <h1 className="text-2xl font-bold text-gray-900">SubvencionesPro</h1>
                <span className="ml-3 px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  v2.0
                </span>
              </div>
              
              <div className="flex items-center gap-4">
                {/* Selector de vista */}
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedView('grid')}
                    className={clsx(
                      'px-3 py-1 rounded transition-colors',
                      selectedView === 'grid' ? 'bg-white shadow-sm' : ''
                    )}
                    aria-label="Vista de cuadrícula"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 3h7v7H3V3zm11 0h7v7h-7V3zM3 14h7v7H3v-7zm11 0h7v7h-7v-7z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedView('list')}
                    className={clsx(
                      'px-3 py-1 rounded transition-colors',
                      selectedView === 'list' ? 'bg-white shadow-sm' : ''
                    )}
                    aria-label="Vista de lista"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M3 13h2v-2H3v2zm0 4h2v-2H3v2zm0-8h2V7H3v2zm4 4h14v-2H7v2zm0 4h14v-2H7v2zM7 7v2h14V7H7z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedView('dashboard')}
                    className={clsx(
                      'px-3 py-1 rounded transition-colors',
                      selectedView === 'dashboard' ? 'bg-white shadow-sm' : ''
                    )}
                    aria-label="Vista de dashboard"
                  >
                    <BarChart className="w-4 h-4" />
                  </button>
                </div>
                
                {/* Acciones rápidas */}
                <button
                  onClick={() => setShowAlertsModal(true)}
                  className="p-2 text-gray-600 hover:text-gray-900 relative"
                  aria-label="Configurar alertas"
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
                    aria-label="Limpiar búsqueda"
                  >
                    <X className="w-4 h-4 text-gray-400" />
                  </button>
                )}
              </div>
              
              {/* Filtros rápidos */}
              <div className="flex gap-2">
                <select
                  value={filters.estado}
                  onChange={(e) => setFilters({...filters, estado: e.target.value as any})}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="todos">Todos los estados</option>
                  <option value="abierto">✅ Abiertas</option>
                  <option value="cerrado">🔒 Cerradas</option>
                  <option value="proximo">🔜 Próximas</option>
                </select>
                
                <button
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className={clsx(
                    'px-4 py-2 border rounded-lg flex items-center gap-2 transition-colors',
                    showAdvancedFilters ? 'bg-blue-50 border-blue-500 text-blue-700' : 'border-gray-300'
                  )}
                >
                  <Filter className="w-4 h-4" />
                  Filtros avanzados
                  <ChevronDown className={clsx(
                    'w-4 h-4 transition-transform',
                    showAdvancedFilters ? 'rotate-180' : ''
                  )} />
                </button>
                
                <button
                  onClick={handleSaveSearch}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  aria-label="Guardar búsqueda"
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
            onFiltersChange={(newFilters) => setFilters({...filters, ...newFilters})}
            onReset={() => setFilters({
              estado: 'abierto',
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
              compatibleOtrasAyudas: 'si',
              complejidadAdministrativa: 'baja',
              idiomaDocumentacion: [],
              certificacionesRequeridas: [],
              diasHastacierre: '',
              plazoEjecucion: '',
              periodoConcesion: '',
              probabilidadConcesion: '',
              competitividad: undefined,
              presupuestoTotal: '',
              numerobeneficiarios: '',
              requiereSeguimiento: false,
              requiereAuditoría: false,
              pagosIntermedios: false,
              ordenarPor: 'relevancia'
            })}
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
            <div className={clsx(
              selectedView === 'grid' 
                ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' 
                : 'space-y-4'
            )}>
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
                        estado: 'abierto',
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
                        compatibleOtrasAyudas: 'si',
                        complejidadAdministrativa: 'baja',
                        idiomaDocumentacion: [],
                        certificacionesRequeridas: [],
                        diasHastacierre: '',
                        plazoEjecucion: '',
                        periodoConcesion: '',
                        probabilidadConcesion: '',
                        competitividad: undefined,
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
            isOpen={showExportModal}
          />
        )}
        
        {showAlertsModal && (
          <AlertsConfig
            filters={filters}
            onClose={() => setShowAlertsModal(false)}
          />
        )}
      </div>
    </QueryClientProvider>
  );
}

export default App;
