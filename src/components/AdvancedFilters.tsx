import React from 'react';
import { X, Info, RotateCcw } from 'lucide-react';
import type { Filtros, TipoEntidad, NivelComplejidad, NivelCompetitividad } from '@/types';
import { 
  CATEGORIAS_SUBVENCIONES, 
  COMUNIDADES_AUTONOMAS_SIMPLE, 
  SECTORES_ECONOMICOS_SIMPLE,
  CERTIFICACIONES,
  IDIOMAS_DOCUMENTACION
} from '@/utils/constants';

interface AdvancedFiltersProps {
  filters: Filtros;
  setFilters: (filters: Filtros) => void;
  onFiltersChange?: (filters: Partial<Filtros>) => void; // Para compatibilidad con nueva API
  onReset?: () => void; // Para compatibilidad con nueva API
  onClose: () => void;
}

interface TipoEntidadOption {
  value: string;
  label: string;
  description: string;
}

interface NivelTRLOption {
  value: string;
  label: string;
  description: string;
}

interface TipoFinanciacionOption {
  value: string;
  label: string;
  description: string;
}

const AdvancedFilters: React.FC<AdvancedFiltersProps> = ({ 
  filters, 
  setFilters, 
  onFiltersChange,
  onReset,
  onClose 
}) => {
  const categorias = Array.from(CATEGORIAS_SUBVENCIONES);
  const comunidadesAutonomas = COMUNIDADES_AUTONOMAS_SIMPLE;
  const sectoresEconomicos = SECTORES_ECONOMICOS_SIMPLE;
  const certificaciones = Array.from(CERTIFICACIONES);
  const idiomas = Array.from(IDIOMAS_DOCUMENTACION);

  const tiposEntidad: TipoEntidadOption[] = [
    { value: 'pyme', label: 'PYME', description: 'Pequeña y mediana empresa' },
    { value: 'autonomo', label: 'Autónomo', description: 'Trabajador por cuenta propia' },
    { value: 'universidad', label: 'Universidad', description: 'Instituciones académicas' },
    { value: 'ong', label: 'ONG', description: 'Organizaciones sin ánimo de lucro' },
    { value: 'startup', label: 'Startup', description: 'Empresas emergentes' },
    { value: 'granEmpresa', label: 'Gran Empresa', description: 'Más de 250 empleados' }
  ];

  const nivelesTRL: NivelTRLOption[] = [
    { value: 'TRL1-3', label: 'TRL 1-3', description: 'Investigación básica' },
    { value: 'TRL4-6', label: 'TRL 4-6', description: 'Desarrollo tecnológico' },
    { value: 'TRL7-9', label: 'TRL 7-9', description: 'Demostración y producción' }
  ];

  const tiposFinanciacion: TipoFinanciacionOption[] = [
    { value: 'subvencion', label: 'Subvención', description: 'A fondo perdido' },
    { value: 'prestamo', label: 'Préstamo', description: 'Reembolsable' },
    { value: 'mixto', label: 'Mixto', description: 'Parte subvención, parte préstamo' },
    { value: 'avales', label: 'Avales', description: 'Garantías financieras' }
  ];

  const handleReset = (): void => {
    const resetFilters: Filtros = {
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
      competitividad: undefined,
      presupuestoTotal: '',
      numerobeneficiarios: '',
      requiereSeguimiento: false,
      requiereAuditoría: false,
      pagosIntermedios: false,
      ordenarPor: 'relevancia'
    };
    
    setFilters(resetFilters);
    
    // Compatibilidad con nueva API
    if (onReset) {
      onReset();
    }
  };

  const handleArrayFilter = (filterName: keyof Filtros, value: string): void => {
    const currentValues = filters[filterName] as string[];
    const newValues = currentValues.includes(value)
      ? currentValues.filter(v => v !== value)
      : [...currentValues, value];
    
    const newFilters = { ...filters, [filterName]: newValues };
    setFilters(newFilters);
    
    // Compatibilidad con nueva API
    if (onFiltersChange) {
      onFiltersChange({ [filterName]: newValues });
    }
  };

  const handleInputChange = (filterName: keyof Filtros, value: any): void => {
    const newFilters = { ...filters, [filterName]: value };
    setFilters(newFilters);
    
    // Compatibilidad con nueva API  
    if (onFiltersChange) {
      onFiltersChange({ [filterName]: value });
    }
  };

  const getActiveFiltersCount = (): number => {
    return Object.keys(filters).filter(key => {
      const value = filters[key as keyof Filtros];
      return value && value !== 'todos' && value !== 'cualquiera' && 
             (Array.isArray(value) ? value.length > 0 : true);
    }).length;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen px-4 py-8">
        <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-2xl">
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between rounded-t-xl">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Filtros Avanzados</h2>
              <p className="text-sm text-gray-500 mt-1">Refina tu búsqueda con criterios profesionales</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-900 flex items-center gap-2 transition-colors"
                aria-label="Restablecer filtros"
              >
                <RotateCcw className="w-4 h-4" />
                Restablecer
              </button>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                aria-label="Cerrar filtros"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6 space-y-8">
            {/* Sección 1: Filtros Básicos */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Filtros Básicos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Categorías */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categorías
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                    {categorias.map(cat => (
                      <label key={cat} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.categoria?.includes(cat) || false}
                          onChange={() => handleArrayFilter('categoria', cat)}
                          className="mr-2 rounded text-blue-600"
                        />
                        <span className="text-sm">{cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Comunidades Autónomas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ámbito Territorial
                  </label>
                  <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                    {comunidadesAutonomas.map(ca => (
                      <label key={ca} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={Array.isArray(filters.comunidadAutonoma) && filters.comunidadAutonoma.includes(ca)}
                          onChange={() => handleArrayFilter('comunidadAutonoma', ca)}
                          className="mr-2 rounded text-blue-600"
                        />
                        <span className="text-sm">{ca}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Rango de Cuantía */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Rango de Cuantía (€)
                  </label>
                  <div className="space-y-2">
                    <input
                      type="number"
                      placeholder="Mínimo"
                      value={filters.cuantiaMin}
                      onChange={(e) => handleInputChange('cuantiaMin', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      placeholder="Máximo"
                      value={filters.cuantiaMax}
                      onChange={(e) => handleInputChange('cuantiaMax', e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Sección 2: Tipo de Beneficiario */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Tipo de Beneficiario</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {tiposEntidad.map(tipo => (
                  <label
                    key={tipo.value}
                    className={`
                      relative flex items-center p-3 border rounded-lg cursor-pointer transition-colors
                      ${filters.tipoEntidad?.includes(tipo.value as TipoEntidad)
                        ? 'bg-blue-50 border-blue-500' 
                        : 'bg-white border-gray-300 hover:bg-gray-50'}
                    `}
                  >
                    <input
                      type="checkbox"
                      checked={filters.tipoEntidad?.includes(tipo.value as TipoEntidad) || false}
                      onChange={() => handleArrayFilter('tipoEntidad', tipo.value)}
                      className="mr-3"
                    />
                    <div>
                      <p className="font-medium text-sm">{tipo.label}</p>
                      <p className="text-xs text-gray-500">{tipo.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Sección 3: Sectores Económicos */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Sectores Económicos</h3>
              <div className="flex flex-wrap gap-2">
                {sectoresEconomicos.map(sector => (
                  <button
                    key={sector}
                    onClick={() => handleArrayFilter('sectorEconomico', sector)}
                    className={`
                      px-3 py-1 rounded-full text-sm transition-colors
                      ${filters.sectorEconomico?.includes(sector)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}
                    `}
                  >
                    {sector}
                  </button>
                ))}
              </div>
            </div>

            {/* Sección 4: Criterios de Sostenibilidad e Impacto */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Criterios de Impacto</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.impactoAmbiental}
                    onChange={(e) => handleInputChange('impactoAmbiental', e.target.checked)}
                    className="rounded text-green-600"
                  />
                  <span className="text-sm">🌱 Impacto Ambiental</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.igualdadGenero}
                    onChange={(e) => handleInputChange('igualdadGenero', e.target.checked)}
                    className="rounded text-purple-600"
                  />
                  <span className="text-sm">⚖️ Igualdad de Género</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.transformacionDigital}
                    onChange={(e) => handleInputChange('transformacionDigital', e.target.checked)}
                    className="rounded text-blue-600"
                  />
                  <span className="text-sm">💻 Transformación Digital</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.economiaCircular}
                    onChange={(e) => handleInputChange('economiaCircular', e.target.checked)}
                    className="rounded text-green-600"
                  />
                  <span className="text-sm">♻️ Economía Circular</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.empleoJoven}
                    onChange={(e) => handleInputChange('empleoJoven', e.target.checked)}
                    className="rounded text-orange-600"
                  />
                  <span className="text-sm">👥 Empleo Joven</span>
                </label>
                
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={filters.zonaRural}
                    onChange={(e) => handleInputChange('zonaRural', e.target.checked)}
                    className="rounded text-yellow-600"
                  />
                  <span className="text-sm">🌾 Zona Rural</span>
                </label>
              </div>
            </div>

            {/* Sección 5: Condiciones Financieras */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Condiciones Financieras</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Tipo de Financiación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Financiación
                  </label>
                  <div className="space-y-2">
                    {tiposFinanciacion.map(tipo => (
                      <label key={tipo.value} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.tipoFinanciacion?.includes(tipo.value as any) || false}
                          onChange={() => handleArrayFilter('tipoFinanciacion', tipo.value)}
                          className="mr-2"
                        />
                        <div>
                          <span className="text-sm font-medium">{tipo.label}</span>
                          <span className="text-xs text-gray-500 ml-1">({tipo.description})</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Intensidad de Ayuda */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Intensidad de Ayuda (%)
                    <Info className="inline w-3 h-3 ml-1 text-gray-400" />
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Mínimo %"
                    value={filters.intensidadAyuda}
                    onChange={(e) => handleInputChange('intensidadAyuda', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                {/* Garantías */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Garantías Requeridas
                  </label>
                  <select
                    value={filters.garantiasRequeridas || 'cualquiera'}
                    onChange={(e) => handleInputChange('garantiasRequeridas', e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cualquiera">Cualquiera</option>
                    <option value="sin_garantias">Sin garantías</option>
                    <option value="con_garantias">Con garantías</option>
                  </select>
                </div>

                {/* Anticipo */}
                <div>
                  <label className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      checked={filters.anticipoDisponible}
                      onChange={(e) => handleInputChange('anticipoDisponible', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Anticipo disponible</span>
                  </label>
                </div>

                {/* Compatible con otras ayudas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Compatible con otras ayudas
                  </label>
                  <select
                    value={filters.compatibleOtrasAyudas || 'cualquiera'}
                    onChange={(e) => handleInputChange('compatibleOtrasAyudas', e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cualquiera">Cualquiera</option>
                    <option value="si">Sí</option>
                    <option value="no">No</option>
                  </select>
                </div>

                {/* Pagos intermedios */}
                <div>
                  <label className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      checked={filters.pagosIntermedios}
                      onChange={(e) => handleInputChange('pagosIntermedios', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Pagos intermedios</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sección 6: Gestión y Documentación */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Gestión y Documentación</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Complejidad Administrativa */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Complejidad Administrativa
                  </label>
                  <select
                    value={filters.complejidadAdministrativa}
                    onChange={(e) => handleInputChange('complejidadAdministrativa', e.target.value as NivelComplejidad)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="cualquiera">Cualquiera</option>
                    <option value="baja">🟢 Baja</option>
                    <option value="media">🟡 Media</option>
                    <option value="alta">🔴 Alta</option>
                  </select>
                </div>

                {/* Idioma de Documentación */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Idioma de Documentación
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                    {idiomas.map(idioma => (
                      <label key={idioma} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.idiomaDocumentacion?.includes(idioma) || false}
                          onChange={() => handleArrayFilter('idiomaDocumentacion', idioma)}
                          className="mr-2"
                        />
                        <span className="text-sm">{idioma}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Certificaciones Requeridas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Certificaciones Requeridas
                  </label>
                  <div className="space-y-2 max-h-32 overflow-y-auto border rounded-lg p-3">
                    {certificaciones.map(cert => (
                      <label key={cert} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.certificacionesRequeridas?.includes(cert) || false}
                          onChange={() => handleArrayFilter('certificacionesRequeridas', cert)}
                          className="mr-2"
                        />
                        <span className="text-sm">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Requiere Seguimiento */}
                <div>
                  <label className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      checked={filters.requiereSeguimiento}
                      onChange={(e) => handleInputChange('requiereSeguimiento', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Requiere seguimiento</span>
                  </label>
                </div>

                {/* Requiere Auditoría */}
                <div>
                  <label className="flex items-center space-x-2 mt-6">
                    <input
                      type="checkbox"
                      checked={filters.requiereAuditoría}
                      onChange={(e) => handleInputChange('requiereAuditoría', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm font-medium">Requiere auditoría</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Sección 7: Filtros Temporales */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Filtros Temporales</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Días hasta cierre (máx.)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 30"
                    value={filters.diasHastacierre}
                    onChange={(e) => handleInputChange('diasHastacierre', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Plazo ejecución (meses)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 12"
                    value={filters.plazoEjecucion}
                    onChange={(e) => handleInputChange('plazoEjecucion', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Periodo concesión (días)
                  </label>
                  <input
                    type="number"
                    placeholder="Ej: 90"
                    value={filters.periodoConcesion}
                    onChange={(e) => handleInputChange('periodoConcesion', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha inicio desde
                  </label>
                  <input
                    type="date"
                    value={filters.fechaInicioDesde}
                    onChange={(e) => handleInputChange('fechaInicioDesde', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Sección 8: Análisis y Scoring */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-gray-900">Análisis y Probabilidad</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Probabilidad de concesión (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    placeholder="Mínimo %"
                    value={filters.probabilidadConcesion}
                    onChange={(e) => handleInputChange('probabilidadConcesion', e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel de competitividad
                  </label>
                  <select
                    value={filters.competitividad}
                    onChange={(e) => handleInputChange('competitividad', e.target.value as NivelCompetitividad)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Cualquiera</option>
                    <option value="baja">🟢 Baja competencia</option>
                    <option value="media">🟡 Media competencia</option>
                    <option value="alta">🔴 Alta competencia</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ordenar por
                  </label>
                  <select
                    value={filters.ordenarPor}
                    onChange={(e) => handleInputChange('ordenarPor', e.target.value as any)}
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="relevancia">Relevancia</option>
                    <option value="fecha">Fecha de cierre</option>
                    <option value="cuantia">Cuantía</option>
                    <option value="probabilidad">Probabilidad de éxito</option>
                    <option value="cierre">Urgencia (cierre próximo)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Sección 9: I+D+i específico */}
            {(filters.categoria?.includes('I+D+i') || filters.sectorEconomico?.includes('Tecnología')) && (
              <div>
                <h3 className="text-lg font-semibold mb-4 text-gray-900">Filtros específicos I+D+i</h3>
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nivel TRL (Technology Readiness Level)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {nivelesTRL.map(nivel => (
                      <label
                        key={nivel.value}
                        className={`
                          flex items-center px-3 py-2 border rounded-lg cursor-pointer transition-colors
                          ${filters.nivelTRL?.includes(nivel.value)
                            ? 'bg-blue-50 border-blue-500'
                            : 'bg-white border-gray-300 hover:bg-gray-50'}
                        `}
                      >
                        <input
                          type="checkbox"
                          checked={filters.nivelTRL?.includes(nivel.value) || false}
                          onChange={() => handleArrayFilter('nivelTRL', nivel.value)}
                          className="mr-2"
                        />
                        <div>
                          <span className="font-medium text-sm">{nivel.label}</span>
                          <span className="text-xs text-gray-500 ml-1">- {nivel.description}</span>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-gray-50 px-6 py-4 border-t flex justify-between items-center rounded-b-xl">
            <div className="text-sm text-gray-500">
              {getActiveFiltersCount()} filtros aplicados
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdvancedFilters;