import React, { useState } from 'react';
import { Bell, Plus, Edit, Trash2, ToggleLeft, Mail, Smartphone, Globe } from 'lucide-react';
import type { 
  Filtros, 
  AlertaConfig, 
  AlertFrequency, 
  NotificationChannels, 
  AlertConditions 
} from '@/types';

interface AlertsConfigProps {
  alertas?: AlertaConfig[];
  filters?: Filtros; // Para compatibilidad con App.tsx
  onClose: () => void;
  onCreateAlert?: (alerta: Omit<AlertaConfig, 'id' | 'fechaCreacion'>) => void;
  onUpdateAlert?: (id: string, alerta: Partial<AlertaConfig>) => void;
  onDeleteAlert?: (id: string) => void;
}

const AlertsConfig: React.FC<AlertsConfigProps> = ({
  alertas = [],
  filters, // No se usa en este ejemplo, pero está disponible
  onClose,
  onCreateAlert,
  onUpdateAlert,
  onDeleteAlert
}) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertaConfig | null>(null);

  // Mock data para demostración
  const mockAlertas: AlertaConfig[] = [
    {
      id: '1',
      nombre: 'Subvenciones Tecnológicas',
      descripcion: 'Alertas para nuevas subvenciones de tecnología e innovación',
      filtros: {
        categoria: ['Tecnología', 'Innovación'],
        cuantiaMinima: 10000,
        estado: 'abierto'
      },
      condiciones: {
        nuevasSubvenciones: true,
        cambiosEnSubvenciones: false,
        proximoVencimiento: true,
        diasAntes: 15,
        cuantiaMinima: 10000
      },
      frecuencia: 'semanal',
      canales: ['email', 'push'],
      activa: true,
      fechaCreacion: new Date('2024-01-15'),
      proximaEjecucion: new Date('2024-02-01')
    },
    {
      id: '2',
      nombre: 'Andalucía PYME',
      descripcion: 'Seguimiento de ayudas para PYMEs en Andalucía',
      filtros: {
        comunidadAutonoma: 'Andalucía',
        tipoEntidad: ['pyme']
      },
      condiciones: {
        nuevasSubvenciones: true,
        cambiosEnSubvenciones: true,
        proximoVencimiento: true,
        diasAntes: 7
      },
      frecuencia: 'diaria',
      canales: ['email'],
      activa: true,
      fechaCreacion: new Date('2024-01-20'),
      ultimaEjecucion: new Date('2024-01-25')
    }
  ];

  const alertasToShow = alertas.length > 0 ? alertas : mockAlertas;

  const getFrequencyLabel = (frequency: AlertFrequency) => {
    const labels: Record<AlertFrequency, string> = {
      inmediata: 'Inmediata',
      diaria: 'Diaria',
      semanal: 'Semanal',
      mensual: 'Mensual'
    };
    return labels[frequency];
  };

  const getChannelIcon = (channel: NotificationChannels) => {
    switch (channel) {
      case 'email': return <Mail className="w-4 h-4" />;
      case 'sms': return <Smartphone className="w-4 h-4" />;
      case 'push': return <Bell className="w-4 h-4" />;
      case 'webhook': return <Globe className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getChannelLabel = (channel: NotificationChannels) => {
    const labels: Record<NotificationChannels, string> = {
      email: 'Email',
      sms: 'SMS',
      push: 'Push',
      webhook: 'Webhook',
      telegram: 'Telegram'
    };
    return labels[channel];
  };

  const handleToggleAlert = (id: string, activa: boolean) => {
    if (onUpdateAlert) {
      onUpdateAlert(id, { activa });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Bell className="w-8 h-8 mr-3 text-blue-600" />
            Configuración de Alertas
          </h2>
          <p className="text-gray-600 mt-1">
            Configura alertas automáticas para mantenerte informado de nuevas subvenciones
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Nueva Alerta</span>
        </button>
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Alertas Activas</p>
              <p className="text-2xl font-bold text-blue-900">
                {alertasToShow.filter(a => a.activa).length}
              </p>
            </div>
            <Bell className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Total Alertas</p>
              <p className="text-2xl font-bold text-green-900">{alertasToShow.length}</p>
            </div>
            <ToggleLeft className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Ejecutadas Hoy</p>
              <p className="text-2xl font-bold text-purple-900">
                {alertasToShow.filter(a => 
                  a.ultimaEjecucion && 
                  new Date(a.ultimaEjecucion).toDateString() === new Date().toDateString()
                ).length}
              </p>
            </div>
            <Mail className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Lista de alertas */}
      <div className="bg-white rounded-xl shadow-sm">
        {alertasToShow.length === 0 ? (
          <div className="text-center py-12">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No tienes alertas configuradas</p>
            <p className="text-gray-500 text-sm mt-2">
              Crea tu primera alerta para recibir notificaciones automáticas
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Primera Alerta
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {alertasToShow.map(alerta => (
              <div key={alerta.id} className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header de la alerta */}
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {alerta.nombre}
                      </h3>
                      <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                        alerta.activa 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        <ToggleLeft className="w-3 h-3" />
                        <span>{alerta.activa ? 'Activa' : 'Inactiva'}</span>
                      </div>
                    </div>

                    {/* Descripción */}
                    {alerta.descripcion && (
                      <p className="text-gray-600 text-sm mb-3">{alerta.descripcion}</p>
                    )}

                    {/* Detalles de configuración */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Frecuencia:</span>
                        <span className="ml-2 text-gray-600">{getFrequencyLabel(alerta.frecuencia)}</span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Canales:</span>
                        <div className="flex items-center space-x-2 ml-2">
                          {alerta.canales.map(canal => (
                            <div key={canal} className="flex items-center space-x-1 text-gray-600">
                              {getChannelIcon(canal)}
                              <span className="text-xs">{getChannelLabel(canal)}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Condiciones:</span>
                        <div className="ml-2 text-gray-600">
                          {[
                            alerta.condiciones.nuevasSubvenciones && 'Nuevas',
                            alerta.condiciones.cambiosEnSubvenciones && 'Cambios',
                            alerta.condiciones.proximoVencimiento && `Vencen en ${alerta.condiciones.diasAntes || 7}d`
                          ].filter(Boolean).join(', ')}
                        </div>
                      </div>
                    </div>

                    {/* Filtros aplicados */}
                    <div className="mt-3">
                      <span className="font-medium text-gray-700 text-sm">Filtros:</span>
                      <div className="flex flex-wrap gap-2 mt-1">
                        {Object.entries(alerta.filtros).map(([key, value]) => {
                          if (!value) return null;
                          const displayValue = Array.isArray(value) ? value.join(', ') : String(value);
                          return (
                            <span 
                              key={key}
                              className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                            >
                              {key}: {displayValue}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Información de ejecución */}
                    <div className="mt-3 text-xs text-gray-500">
                      {alerta.ultimaEjecucion && (
                        <span>Última ejecución: {new Date(alerta.ultimaEjecucion).toLocaleString('es-ES')}</span>
                      )}
                      {alerta.proximaEjecucion && (
                        <span className="ml-4">
                          Próxima: {new Date(alerta.proximaEjecucion).toLocaleString('es-ES')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => handleToggleAlert(alerta.id, !alerta.activa)}
                      className={`p-2 rounded-lg transition-colors ${
                        alerta.activa
                          ? 'text-green-600 bg-green-50 hover:bg-green-100'
                          : 'text-gray-400 bg-gray-50 hover:bg-gray-100'
                      }`}
                      title={alerta.activa ? 'Desactivar alerta' : 'Activar alerta'}
                    >
                      <ToggleLeft className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => setEditingAlert(alerta)}
                      className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                      title="Editar alerta"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    
                    <button
                      onClick={() => onDeleteAlert?.(alerta.id)}
                      className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                      title="Eliminar alerta"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de crear/editar alerta (placeholder) */}
      {(showCreateModal || editingAlert) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {editingAlert ? 'Editar Alerta' : 'Nueva Alerta'}
              </h3>
              
              <div className="text-center py-12 text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p>Formulario de configuración de alertas</p>
                <p className="text-sm">Esta funcionalidad estará disponible próximamente</p>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingAlert(null);
                  }}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  {editingAlert ? 'Guardar Cambios' : 'Crear Alerta'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlertsConfig;
