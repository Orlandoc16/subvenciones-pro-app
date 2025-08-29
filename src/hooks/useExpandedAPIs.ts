// hooks/useExpandedAPIs.ts
// Hook personalizado para el servicio expandido con agregación de múltiples APIs

import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { useState, useCallback, useMemo } from 'react';
import SubvencionesServiceExpanded from '@/services/SubvencionesServiceExpanded';
import type { Subvencion, EstadoSubvencion } from '@/types';
import type {
  AggregatedResult,
  APIResponse,
  AggregationStatistics,
  CacheStatus,
  APIConfiguration,
  APISource,
  APIError,
  SearchFilters,
  UseExpandedAPIsOptions,
  UseExpandedAPIsParams,
  UseExpandedAPIsReturn,
  EstadoSubvencionExtended
} from '@/types/expanded';

/**
 * 🎣 Hook para usar el servicio expandido de SubvencionesPro v2.0
 * 
 * Características:
 * - ✅ Agregación automática de múltiples APIs
 * - ✅ Deduplicación inteligente de resultados
 * - ✅ Cache multi-nivel con TanStack Query
 * - ✅ Estados de loading, error y éxito
 * - ✅ Configuración flexible por hook
 * - ✅ Estadísticas y métricas en tiempo real
 */
const useExpandedAPIs = (
  params: UseExpandedAPIsParams = {},
  options: UseExpandedAPIsOptions = {}
): UseExpandedAPIsReturn => {
  
  // ==========================================
  // ESTADO Y CONFIGURACIÓN
  // ==========================================
  
  const [configuration, setConfiguration] = useState<APIConfiguration>(
    SubvencionesServiceExpanded.getConfiguration()
  );

  // Configuración del hook con defaults
  const hookOptions = useMemo(() => ({
    enableAggregation: options.enableAggregation ?? configuration.defaults.enableAggregation,
    enableDeduplication: options.enableDeduplication ?? configuration.defaults.enableDeduplication,
    enableRegionalAPIs: options.enableRegionalAPIs ?? configuration.defaults.enableRegionalAPIs,
    enableCache: options.enableCache ?? configuration.cache.enabled,
    maxParallelRequests: options.maxParallelRequests ?? configuration.defaults.maxParallelRequests,
    timeout: options.timeout ?? configuration.defaults.timeout,
    retryCount: options.retryCount ?? configuration.defaults.retryCount,
    cacheTimeout: options.cacheTimeout ?? configuration.cache.ttlNacional,
    onError: options.onError,
    onSuccess: options.onSuccess,
    onSourceError: options.onSourceError
  }), [options, configuration]);

  // Parámetros de búsqueda con defaults
  const searchParams = useMemo(() => ({
    query: params.query || '',
    filters: params.filters || {},
    pagination: {
      page: 1,
      limit: 50,
      ...params.pagination
    },
    sorting: {
      field: 'relevancia' as const,
      order: 'desc' as const,
      ...params.sorting
    },
    options: {
      enableAggregation: hookOptions.enableAggregation,
      enableDeduplication: hookOptions.enableDeduplication,
      enableRegionalAPIs: hookOptions.enableRegionalAPIs,
      enableCache: hookOptions.enableCache,
      maxParallelRequests: hookOptions.maxParallelRequests,
      timeout: hookOptions.timeout,
      includeExpired: false,
      includeHistorical: false,
      fuzzySearch: false,
      highlightTerms: false,
      includeStatistics: true,
      ...params.options
    }
  }), [params, hookOptions]);

  // ==========================================
  // REACT QUERY SETUP
  // ==========================================

  const queryKey = useMemo(() => [
    'expanded-subvenciones',
    searchParams.query,
    searchParams.filters,
    searchParams.pagination,
    searchParams.sorting,
    searchParams.options
  ], [searchParams]);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch: queryRefetch,
    isRefetching
  }: UseQueryResult<AggregatedResult, APIError> = useQuery({
    queryKey,
    queryFn: async (): Promise<AggregatedResult> => {
      console.log('🚀 Executing expanded search with params:', searchParams);
      
      try {
        const result = await SubvencionesServiceExpanded.searchSubvenciones(
          searchParams.query,
          searchParams.filters,
          {
            enableAggregation: searchParams.options.enableAggregation,
            enableDeduplication: searchParams.options.enableDeduplication,
            maxSources: searchParams.options.maxParallelRequests,
            timeout: searchParams.options.timeout
          }
        );

        // Callbacks de éxito
        if (hookOptions.onSuccess) {
          hookOptions.onSuccess(result);
        }

        return result;
        
      } catch (err) {
        const apiError = err as APIError;
        
        // Callbacks de error
        if (hookOptions.onError) {
          hookOptions.onError(apiError);
        }
        
        throw apiError;
      }
    },
    enabled: true,
    staleTime: hookOptions.cacheTimeout,
    gcTime: hookOptions.cacheTimeout * 2, // gcTime reemplaza a cacheTime en TanStack Query v5
    retry: (failureCount, error) => {
      return failureCount < (hookOptions.retryCount || 3) && (error as APIError)?.retryable !== false;
    },
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    refetchOnWindowFocus: false,
    refetchOnMount: 'always'
  });

  // ==========================================
  // PROCESAMIENTO DE DATOS
  // ==========================================

  const processedData = useMemo(() => {
    if (!data) {
      return {
        subvenciones: [],
        sources: [],
        statistics: null,
        cacheStatus: null,
        totalResults: 0,
        deduplicatedCount: 0,
        responseTime: 0,
        cacheHitRate: 0
      };
    }

    return {
      subvenciones: data.subvenciones || [],
      sources: data.sources || [],
      statistics: data.statistics,
      cacheStatus: data.cacheStatus,
      totalResults: data.totalResults || 0,
      deduplicatedCount: data.deduplicatedCount || 0,
      responseTime: data.responseTime || 0,
      cacheHitRate: data.cacheHitRate || 0
    };
  }, [data]);

  // ==========================================
  // MÉTODOS Y UTILIDADES
  // ==========================================

  const refetch = useCallback(async (): Promise<AggregatedResult> => {
    console.log('🔄 Manual refetch triggered');
    const result = await queryRefetch();
    return result.data as AggregatedResult;
  }, [queryRefetch]);

  const cancelRequests = useCallback(() => {
    console.log('🛑 Canceling requests (not implemented yet)');
    // En una implementación real, cancelaríamos las requests pendientes
  }, []);

  const clearCache = useCallback(() => {
    SubvencionesServiceExpanded.clearCache();
    console.log('🧹 Cache cleared via hook');
  }, []);

  const updateConfiguration = useCallback((newConfig: Partial<APIConfiguration>) => {
    SubvencionesServiceExpanded.updateConfiguration(newConfig);
    setConfiguration(prev => ({ ...prev, ...newConfig }));
    console.log('⚙️ Configuration updated via hook:', newConfig);
  }, []);

  const getSourceById = useCallback((id: string): APISource | undefined => {
    return SubvencionesServiceExpanded.getAPISources().find(source => source.id === id);
  }, []);

  const getHealthStatus = useCallback(async () => {
    console.log('🏥 Health status check (not implemented yet)');
    return []; // En implementación real retornaría health checks
  }, []);

  const getMetrics = useCallback(async (period: '1h' | '24h' | '7d' | '30d') => {
    console.log(`📊 Getting metrics for period: ${period} (not implemented yet)`);
    return []; // En implementación real retornaría métricas
  }, []);

  // ==========================================
  // SORTING PERSONALIZADO
  // ==========================================

  const sortedSubvenciones = useMemo(() => {
    if (!processedData.subvenciones.length) return [];

    const sorted = [...processedData.subvenciones].sort((a, b) => {
      const { field, order } = searchParams.sorting;
      const direction = order === 'desc' ? -1 : 1;

      if (field === 'relevancia') {
        // Prioridad por estado con tipos correctos
        const estadoPriority: Record<EstadoSubvencion, number> = {
          'abierto': 3,
          'proximo': 2,
          'cerrado': 1
        };
        
        const estadoA = estadoPriority[a.estado] || 0;
        const estadoB = estadoPriority[b.estado] || 0;
        const estadoDiff = estadoB - estadoA;
        
        if (estadoDiff !== 0) return estadoDiff;
        return (b.cuantia - a.cuantia) * direction;
      }

      if (field === 'cuantia') return (b.cuantia - a.cuantia) * direction;
      if (field === 'titulo') return a.titulo.localeCompare(b.titulo) * direction;
      if (field === 'organismo') return a.organismo.localeCompare(b.organismo) * direction;
      if (field === 'fechaPublicacion') {
        return (new Date(b.fechaInicio).getTime() - new Date(a.fechaInicio).getTime()) * direction;
      }

      return 0;
    });

    return sorted;
  }, [processedData.subvenciones, searchParams.sorting]);

  // ==========================================
  // RETURN DEL HOOK
  // ==========================================

  return {
    // Datos procesados
    subvenciones: sortedSubvenciones,
    sources: processedData.sources,
    
    // Estadísticas
    statistics: processedData.statistics,
    cacheStatus: processedData.cacheStatus,
    totalResults: processedData.totalResults,
    deduplicatedCount: processedData.deduplicatedCount,
    responseTime: processedData.responseTime,
    cacheHitRate: processedData.cacheHitRate,
    
    // Estados de la query
    isLoading,
    isRefetching,
    isError,
    error: error as APIError | null,
    
    // Configuración
    configuration,
    apiSources: SubvencionesServiceExpanded.getAPISources(),
    
    // Acciones
    refetch,
    cancelRequests,
    clearCache,
    updateConfiguration,
    
    // Utilidades
    getSourceById,
    getHealthStatus,
    getMetrics
  };
};

export default useExpandedAPIs;
