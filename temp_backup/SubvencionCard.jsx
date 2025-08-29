import React from 'react';
import { 
  Calendar, Euro, MapPin, Building, Users, Clock, 
  TrendingUp, Award, Bookmark, Share2, ExternalLink,
  AlertCircle, CheckCircle, Info, ChevronRight, Tag
} from 'lucide-react';
import { format, parseISO, differenceInDays } from 'date-fns';
import { es } from 'date-fns/locale';

const SubvencionCard = ({ subvencion, view, isBookmarked, onToggleBookmark }) => {
  const today = new Date();
  const fechaFin = subvencion.fechaFin ? parseISO(subvencion.fechaFin) : null;
  const diasRestantes = fechaFin ? differenceInDays(fechaFin, today) : null;
  
  // Determinar el estado visual
  const getEstadoColor = () => {
    if (subvencion.estado === 'cerrado') return 'bg-gray-100 text-gray-600';
    if (subvencion.estado === 'proximo') return 'bg-blue-100 text-blue-700';
    if (diasRestantes && diasRestantes < 7) return 'bg-red-100 text-red-700';
    if (diasRestantes && diasRestantes < 30) return 'bg-orange-100 text-orange-700';
    return 'bg-green-100 text-green-700';
  };
  
  const getEstadoTexto = () => {
    if (subvencion.estado === 'cerrado') return 'Cerrada';
    if (subvencion.estado === 'proximo') return 'Próximamente';
    if (diasRestantes) {
      if (diasRestantes === 0) return 'Cierra hoy';
      if (diasRestantes === 1) return 'Cierra mañana';
      return `${diasRestantes} días restantes`;
    }
    return 'Abierta';
  };
  
  // Formatear cuantía
  const formatCuantia = (amount) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0,
      notation: amount > 1000000 ? 'compact' : 'standard'
    }).format(amount);
  };
  
  // Calcular indicadores de calidad
  const getQualityIndicators = () => {
    const indicators = [];
    
    if (subvencion.probabilidadConcesion > 70) {
      indicators.push({ icon: TrendingUp, color: 'text-green-600', label: 'Alta probabilidad' });
    }
    if (subvencion.complejidadAdministrativa === 'baja') {
      indicators.push({ icon: CheckCircle, color: 'text-blue-600', label: 'Trámite sencillo' });
    }
    if (subvencion.anticipoDisponible) {
      indicators.push({ icon: Euro, color: 'text-purple-600', label: 'Anticipo disponible' });
    }
    if (subvencion.competitividad === 'baja') {
      indicators.push({ icon: Users, color: 'text-indigo-600', label: 'Baja competencia' });
    }
    
    return indicators;
  };
  
  const qualityIndicators = getQualityIndicators();
  
  // Vista de tarjeta (grid)
  if (view === 'grid') {
    return (
      <div className="bg-white rounded-lg border hover:shadow-lg transition-all duration-200 overflow-hidden group">
        {/* Header con estado */}
        <div className="relative">
          <div className={`px-4 py-2 ${getEstadoColor()} flex items-center justify-between`}>
            <span className="text-sm font-medium flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {getEstadoTexto()}
            </span>
            <div className="flex items-center gap-2">
              {subvencion.probabilidadConcesion > 0 && (
                <span className="text-xs font-medium">
                  {subvencion.probabilidadConcesion}% éxito
                </span>
              )}
            </div>
          </div>
          
          {/* Etiquetas flotantes */}
          {subvencion.etiquetas && subvencion.etiquetas.length > 0 && (
            <div className="absolute top-12 right-2 flex flex-col gap-1">
              {subvencion.etiquetas.slice(0, 2).map((etiqueta, idx) => (
                <span
                  key={idx}
                  className={`
                    px-2 py-1 text-xs rounded-full font-medium
                    ${etiqueta.tipo === 'urgente' ? 'bg-red-500 text-white' : ''}
                    ${etiqueta.tipo === 'exito' ? 'bg-green-500 text-white' : ''}
                    ${etiqueta.tipo === 'destacado' ? 'bg-yellow-500 text-white' : ''}
                    ${etiqueta.tipo === 'verde' ? 'bg-emerald-500 text-white' : ''}
                    ${etiqueta.tipo === 'tech' ? 'bg-blue-500 text-white' : ''}
                  `}
                >
                  {etiqueta.texto}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Contenido principal */}
        <div className="p-4">
          {/* Título */}
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
            {subvencion.titulo}
          </h3>
          
          {/* Organismo */}
          <div className="flex items-start gap-2 text-sm text-gray-600 mb-3">
            <Building className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span className="line-clamp-1">{subvencion.organismo}</span>
          </div>
          
          {/* Cuantía */}
          <div className="flex items-center gap-2 mb-3">
            <Euro className="w-5 h-5 text-green-600" />
            <span className="text-xl font-bold text-gray-900">
              {formatCuantia(subvencion.cuantia)}
            </span>
          </div>
          
          {/* Información adicional */}
          <div className="space-y-2 text-sm">
            {/* Beneficiarios */}
            {subvencion.beneficiarios && subvencion.beneficiarios.length > 0 && (
              <div className="flex items-start gap-2">
                <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {subvencion.beneficiarios.slice(0, 3).map((ben, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      {ben}
                    </span>
                  ))}
                  {subvencion.beneficiarios.length > 3 && (
                    <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                      +{subvencion.beneficiarios.length - 3}
                    </span>
                  )}
                </div>
              </div>
            )}
            
            {/* Ubicación */}
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <span className="text-sm">{subvencion.comunidadAutonoma}</span>
            </div>
            
            {/* Fechas */}
            {subvencion.fechaFin && (
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="w-4 h-4" />
                <span className="text-sm">
                  Cierra: {format(parseISO(subvencion.fechaFin), 'dd MMM yyyy', { locale: es })}
                </span>
              </div>
            )}
          </div>
          
          {/* Indicadores de calidad */}
          {qualityIndicators.length > 0 && (
            <div className="mt-3 pt-3 border-t flex items-center gap-3">
              {qualityIndicators.map((indicator, idx) => {
                const Icon = indicator.icon;
                return (
                  <div key={idx} className="group/tooltip relative">
                    <Icon className={`w-4 h-4 ${indicator.color}`} />
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover/tooltip:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                      {indicator.label}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          
          {/* Categorías */}
          {subvencion.categorias && subvencion.categorias.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {subvencion.categorias.slice(0, 3).map((cat, idx) => (
                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                  {cat}
                </span>
              ))}
            </div>
          )}
        </div>
        
        {/* Footer con acciones */}
        <div className="px-4 py-3 bg-gray-50 border-t flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onToggleBookmark();
              }}
              className={`p-2 rounded-lg transition-colors ${
                isBookmarked 
                  ? 'bg-yellow-100 text-yellow-600' 
                  : 'hover:bg-gray-200 text-gray-600'
              }`}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
            
            <button className="p-2 hover:bg-gray-200 rounded-lg text-gray-600 transition-colors">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
          
          <a
            href={subvencion.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            Ver detalles
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    );
  }
  
  // Vista de lista
  return (
    <div className="bg-white rounded-lg border hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="flex">
        {/* Indicador lateral de estado */}
        <div className={`w-1 ${
          subvencion.estado === 'cerrado' ? 'bg-gray-400' :
          subvencion.estado === 'proximo' ? 'bg-blue-500' :
          diasRestantes && diasRestantes < 7 ? 'bg-red-500' :
          diasRestantes && diasRestantes < 30 ? 'bg-orange-500' :
          'bg-green-500'
        }`} />
        
        {/* Contenido */}
        <div className="flex-1 p-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-start gap-4">
                {/* Información principal */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                      {subvencion.titulo}
                    </h3>
                    <div className="flex items-center gap-2 ml-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getEstadoColor()}`}>
                        {getEstadoTexto()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <div className="flex items-center gap-1">
                      <Building className="w-4 h-4" />
                      <span>{subvencion.organismo}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      <span>{subvencion.comunidadAutonoma}</span>
                    </div>
                    {subvencion.fechaFin && (
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>Cierra: {format(parseISO(subvencion.fechaFin), 'dd/MM/yyyy')}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Descripción breve */}
                  {subvencion.descripcion && (
                    <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                      {subvencion.descripcion}
                    </p>
                  )}
                  
                  {/* Tags y metadatos */}
                  <div className="flex items-center gap-4">
                    {/* Beneficiarios */}
                    {subvencion.beneficiarios && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-400" />
                        <div className="flex gap-1">
                          {subvencion.beneficiarios.slice(0, 2).map((ben, idx) => (
                            <span key={idx} className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                              {ben}
                            </span>
                          ))}
                          {subvencion.beneficiarios.length > 2 && (
                            <span className="text-xs text-gray-500">
                              +{subvencion.beneficiarios.length - 2}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {/* Categorías */}
                    {subvencion.categorias && (
                      <div className="flex gap-1">
                        {subvencion.categorias.slice(0, 2).map((cat, idx) => (
                          <span key={idx} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded">
                            {cat}
                          </span>
                        ))}
                      </div>
                    )}
                    
                    {/* Indicadores */}
                    {qualityIndicators.length > 0 && (
                      <div className="flex items-center gap-2 border-l pl-4">
                        {qualityIndicators.slice(0, 3).map((indicator, idx) => {
                          const Icon = indicator.icon;
                          return <Icon key={idx} className={`w-4 h-4 ${indicator.color}`} />;
                        })}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Panel lateral con cuantía y acciones */}
                <div className="flex flex-col items-end justify-between h-full min-w-[150px]">
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">
                      {formatCuantia(subvencion.cuantia)}
                    </p>
                    {subvencion.intensidadAyuda && (
                      <p className="text-sm text-gray-600">
                        Hasta {subvencion.intensidadAyuda}% financiado
                      </p>
                    )}
                    {subvencion.probabilidadConcesion > 0 && (
                      <div className="mt-2">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">
                            {subvencion.probabilidadConcesion}% éxito
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleBookmark();
                      }}
                      className={`p-2 rounded-lg transition-colors ${
                        isBookmarked 
                          ? 'bg-yellow-100 text-yellow-600' 
                          : 'hover:bg-gray-100 text-gray-600'
                      }`}
                    >
                      <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
                    </button>
                    
                    <a
                      href={subvencion.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                    >
                      Ver detalles
                      <ChevronRight className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Barra de información adicional */}
      {(subvencion.requisitoAmbiental || subvencion.requisitoIgualdad || 
        subvencion.esDigital || subvencion.zonaRural) && (
        <div className="px-4 py-2 bg-gray-50 border-t flex items-center gap-4 text-xs">
          {subvencion.requisitoAmbiental && (
            <span className="flex items-center gap-1 text-green-600">
              <Tag className="w-3 h-3" />
              Sostenible
            </span>
          )}
          {subvencion.requisitoIgualdad && (
            <span className="flex items-center gap-1 text-purple-600">
              <Tag className="w-3 h-3" />
              Igualdad
            </span>
          )}
          {subvencion.esDigital && (
            <span className="flex items-center gap-1 text-blue-600">
              <Tag className="w-3 h-3" />
              Digital
            </span>
          )}
          {subvencion.zonaRural && (
            <span className="flex items-center gap-1 text-yellow-600">
              <Tag className="w-3 h-3" />
              Rural
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default SubvencionCard;
