import React from 'react';
import { MapPin, Calendar, Building, Euro, ExternalLink, Clock, CheckCircle, AlertTriangle, XCircle } from 'lucide-react';
import type { Subvencion } from '@/types';

interface SubvencionCardProps {
  subvencion: Subvencion;
  onSelect?: (subvencion: Subvencion) => void;
  selected?: boolean;
  view?: 'grid' | 'list'; // Para compatibilidad con App.tsx
  isBookmarked?: boolean;
  onToggleBookmark?: () => void;
}

const SubvencionCard: React.FC<SubvencionCardProps> = ({ 
  subvencion, 
  onSelect, 
  selected = false 
}) => {
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'abierto': return 'bg-green-100 text-green-800 border-green-200';
      case 'proximo': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cerrado': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'abierto': return <CheckCircle className="w-4 h-4" />;
      case 'proximo': return <Clock className="w-4 h-4" />;
      case 'cerrado': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'No especificada';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm border transition-all duration-200 hover:shadow-md ${
        selected ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
      }`}
      onClick={() => onSelect?.(subvencion)}
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
              {subvencion.titulo}
            </h3>
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Building className="w-4 h-4" />
                <span>{subvencion.organismo}</span>
              </div>
              <div className="flex items-center space-x-1">
                <MapPin className="w-4 h-4" />
                <span>{subvencion.comunidadAutonoma}</span>
              </div>
            </div>
          </div>
          
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium border ${getEstadoColor(subvencion.estado)}`}>
            {getEstadoIcon(subvencion.estado)}
            <span className="capitalize">{subvencion.estado}</span>
          </div>
        </div>

        {/* Descripción */}
        <p className="text-gray-700 text-sm mb-4 line-clamp-3">
          {subvencion.descripcion}
        </p>

        {/* Detalles principales */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="flex items-center space-x-2">
            <Euro className="w-4 h-4 text-green-600" />
            <div>
              <div className="text-xs text-gray-500">Cuantía</div>
              <div className="font-semibold text-green-700">
                {subvencion.cuantia > 0 ? formatCurrency(subvencion.cuantia) : 'No especificada'}
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <div>
              <div className="text-xs text-gray-500">Fecha límite</div>
              <div className="font-semibold text-blue-700">
                {formatDate(subvencion.fechaFin)}
              </div>
            </div>
          </div>
        </div>

        {/* Categorías y sectores */}
        <div className="mb-4">
          {subvencion.categorias && subvencion.categorias.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {subvencion.categorias.slice(0, 3).map((categoria, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                >
                  {categoria}
                </span>
              ))}
              {subvencion.categorias.length > 3 && (
                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                  +{subvencion.categorias.length - 3} más
                </span>
              )}
            </div>
          )}
        </div>

        {/* Información adicional */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center space-x-4 text-gray-600">
            <span>Tipo: {subvencion.tipoFinanciacion}</span>
            <span>Intensidad: {subvencion.intensidadAyuda}%</span>
          </div>
          
          {subvencion.url && (
            <a
              href={subvencion.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-1 text-blue-600 hover:text-blue-800"
              onClick={(e) => e.stopPropagation()}
            >
              <span>Ver más</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Indicators */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center space-x-4 text-xs">
            {subvencion.esDigital && (
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full">
                Digital
              </span>
            )}
            {subvencion.paraJovenes && (
              <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full">
                Jóvenes
              </span>
            )}
            {subvencion.requisitoAmbiental && (
              <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full">
                Ambiental
              </span>
            )}
            {subvencion.anticipoDisponible && (
              <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full">
                Anticipo
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SubvencionCard;
