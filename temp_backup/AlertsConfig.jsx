import React, { useState } from 'react';
import { 
  X, Bell, BellOff, Plus, Trash2, Save, 
  Clock, Calendar, Euro, MapPin, Tag,
  Mail, MessageSquare, Smartphone, CheckCircle
} from 'lucide-react';

const AlertsConfig = ({ filters, onClose }) => {
  const [alerts, setAlerts] = useState(() => {
    const saved = localStorage.getItem('subvencionAlerts');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [newAlert, setNewAlert] = useState({
    name: '',
    active: true,
    filters: { ...filters },
    notifications: {
      email: true,
      push: false,
      sms: false
    },
    frequency: 'daily',
    conditions: {
      newSubvenciones: true,
      proximoCierre: true,
      diasAntesCierre: 7,
      cuantiaMinima: '',
      probabilidadMinima: ''
    }
  });
  
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const frequencyOptions = [
    { value: 'instant', label: 'Instantánea', description: 'Notificar inmediatamente' },
    { value: 'daily', label: 'Diaria', description: 'Resumen diario a las 9:00' },
    { value: 'weekly', label: 'Semanal', description: 'Resumen los lunes' },
    { value: 'biweekly', label: 'Quincenal', description: 'Cada 15 días' }
  ];
  
  const handleSaveAlert = () => {
    if (!newAlert.name) {
      alert('Por favor, ingresa un nombre para la alerta');
      return;
    }
    
    const alertToSave = {
      ...newAlert,
      id: editingId || Date.now(),
      createdAt: editingId ? 
        alerts.find(a => a.id === editingId)?.createdAt : 
        new Date().toISOString()
    };
    
    let updatedAlerts;
    if (editingId) {
      updatedAlerts = alerts.map(a => a.id === editingId ? alertToSave : a);
      setEditingId(null);
    } else {
      updatedAlerts = [...alerts, alertToSave];
    }
    
    setAlerts(updatedAlerts);
    localStorage.setItem('subvencionAlerts', JSON.stringify(updatedAlerts));
    
    // Reset form
    setNewAlert({
      name: '',
      active: true,
      filters: { ...filters },
      notifications: {
        email: true,
        push: false,
        sms: false
      },
      frequency: 'daily',
      conditions: {
        newSubvenciones: true,
        proximoCierre: true,
        diasAntesCierre: 7,
        cuantiaMinima: '',
        probabilidadMinima: ''
      }
    });
    setIsCreating(false);
  };
  
  const handleEditAlert = (alert) => {
    setNewAlert(alert);
    setEditingId(alert.id);
    setIsCreating(true);
  };
  
  const handleDeleteAlert = (id) => {
    const updatedAlerts = alerts.filter(a => a.id !== id);
    setAlerts(updatedAlerts);
    localStorage.setItem('subvencionAlerts', JSON.stringify(updatedAlerts));
  };
  
  const handleToggleAlert = (id) => {
    const updatedAlerts = alerts.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    );
    setAlerts(updatedAlerts);
    localStorage.setItem('subvencionAlerts', JSON.stringify(updatedAlerts));
  };
  
  const getActiveFiltersCount = (alertFilters) => {
    let count = 0;
    Object.entries(alertFilters).forEach(([key, value]) => {
      if (value && value !== 'todos' && value !== 'cualquiera' && value !== '') {
        if (Array.isArray(value) && value.length > 0) count++;
        else if (!Array.isArray(value)) count++;
      }
    });
    return count;
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Configurar Alertas</h2>
            <p className="text-sm text-gray-500 mt-1">
              Recibe notificaciones cuando aparezcan nuevas subvenciones
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {!isCreating ? (
            <>
              {/* Lista de alertas */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Alertas configuradas ({alerts.length})
                  </h3>
                  <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    Nueva alerta
                  </button>
                </div>
                
                {alerts.length > 0 ? (
                  <div className="space-y-3">
                    {alerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`
                          p-4 rounded-lg border transition-all
                          ${alert.active 
                            ? 'bg-white border-gray-200' 
                            : 'bg-gray-50 border-gray-200 opacity-60'}
                        `}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <button
                                onClick={() => handleToggleAlert(alert.id)}
                                className={`
                                  p-1.5 rounded-lg transition-colors
                                  ${alert.active 
                                    ? 'bg-blue-100 text-blue-600' 
                                    : 'bg-gray-100 text-gray-400'}
                                `}
                              >
                                {alert.active ? (
                                  <Bell className="w-4 h-4" />
                                ) : (
                                  <BellOff className="w-4 h-4" />
                                )}
                              </button>
                              <h4 className="font-medium text-gray-900">
                                {alert.name}
                              </h4>
                              <span className={`
                                px-2 py-0.5 rounded-full text-xs font-medium
                                ${alert.active 
                                  ? 'bg-green-100 text-green-700' 
                                  : 'bg-gray-100 text-gray-600'}
                              `}>
                                {alert.active ? 'Activa' : 'Pausada'}
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {frequencyOptions.find(f => f.value === alert.frequency)?.label}
                              </span>
                              <span className="flex items-center gap-1">
                                <Tag className="w-3 h-3" />
                                {getActiveFiltersCount(alert.filters)} filtros
                              </span>
                              <span className="flex items-center gap-1">
                                <Bell className="w-3 h-3" />
                                {Object.values(alert.notifications).filter(Boolean).length} canales
                              </span>
                            </div>
                            
                            {/* Condiciones */}
                            <div className="flex flex-wrap gap-2">
                              {alert.conditions.newSubvenciones && (
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded">
                                  Nuevas subvenciones
                                </span>
                              )}
                              {alert.conditions.proximoCierre && (
                                <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs rounded">
                                  Próximos cierres ({alert.conditions.diasAntesCierre} días)
                                </span>
                              )}
                              {alert.conditions.cuantiaMinima && (
                                <span className="px-2 py-1 bg-green-50 text-green-700 text-xs rounded">
                                  Cuantía &gt; {new Intl.NumberFormat('es-ES', { 
                                    style: 'currency',
                                    currency: 'EUR',
                                    maximumFractionDigits: 0
                                  }).format(alert.conditions.cuantiaMinima)}
                                </span>
                              )}
                              {alert.conditions.probabilidadMinima && (
                                <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs rounded">
                                  Probabilidad &gt; {alert.conditions.probabilidadMinima}%
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            <button
                              onClick={() => handleEditAlert(alert)}
                              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDeleteAlert(alert.id)}
                              className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">No tienes alertas configuradas</p>
                    <button
                      onClick={() => setIsCreating(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      Crear primera alerta
                    </button>
                  </div>
                )}
              </div>
              
              {/* Información adicional */}
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-semibold text-blue-900 mb-2">
                  ¿Cómo funcionan las alertas?
                </h4>
                <ul className="space-y-1 text-sm text-blue-800">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                    <span>Las alertas te notifican cuando aparecen nuevas subvenciones que coinciden con tus criterios</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                    <span>Puedes configurar múltiples alertas con diferentes filtros y frecuencias</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                    <span>Recibe notificaciones por email, notificaciones push o SMS</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 mt-0.5" />
                    <span>Las alertas de cierre próximo te ayudan a no perder oportunidades importantes</span>
                  </li>
                </ul>
              </div>
            </>
          ) : (
            /* Formulario de creación/edición */
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">
                  {editingId ? 'Editar alerta' : 'Nueva alerta'}
                </h3>
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                  }}
                  className="text-gray-600 hover:text-gray-900"
                >
                  Cancelar
                </button>
              </div>
              
              {/* Nombre de la alerta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de la alerta
                </label>
                <input
                  type="text"
                  value={newAlert.name}
                  onChange={(e) => setNewAlert({...newAlert, name: e.target.value})}
                  placeholder="Ej: Subvenciones I+D+i para PYMES"
                  className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Frecuencia */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Frecuencia de notificación
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {frequencyOptions.map(option => (
                    <label
                      key={option.value}
                      className={`
                        p-3 rounded-lg border cursor-pointer transition-all
                        ${newAlert.frequency === option.value
                          ? 'bg-blue-50 border-blue-500'
                          : 'bg-white border-gray-200 hover:border-gray-300'}
                      `}
                    >
                      <input
                        type="radio"
                        name="frequency"
                        value={option.value}
                        checked={newAlert.frequency === option.value}
                        onChange={(e) => setNewAlert({...newAlert, frequency: e.target.value})}
                        className="sr-only"
                      />
                      <div>
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className="text-xs text-gray-600">{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
              
              {/* Canales de notificación */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Canales de notificación
                </label>
                <div className="space-y-2">
                  <label className="flex items-center p-3 bg-white border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={newAlert.notifications.email}
                      onChange={(e) => setNewAlert({
                        ...newAlert,
                        notifications: {
                          ...newAlert.notifications,
                          email: e.target.checked
                        }
                      })}
                      className="mr-3"
                    />
                    <Mail className="w-4 h-4 mr-2 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Email</p>
                      <p className="text-xs text-gray-600">Recibe alertas en tu correo electrónico</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 bg-white border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={newAlert.notifications.push}
                      onChange={(e) => setNewAlert({
                        ...newAlert,
                        notifications: {
                          ...newAlert.notifications,
                          push: e.target.checked
                        }
                      })}
                      className="mr-3"
                    />
                    <MessageSquare className="w-4 h-4 mr-2 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">Notificaciones Push</p>
                      <p className="text-xs text-gray-600">Notificaciones en tu navegador o app móvil</p>
                    </div>
                  </label>
                  
                  <label className="flex items-center p-3 bg-white border rounded-lg cursor-pointer hover:bg-gray-50">
                    <input
                      type="checkbox"
                      checked={newAlert.notifications.sms}
                      onChange={(e) => setNewAlert({
                        ...newAlert,
                        notifications: {
                          ...newAlert.notifications,
                          sms: e.target.checked
                        }
                      })}
                      className="mr-3"
                    />
                    <Smartphone className="w-4 h-4 mr-2 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium text-sm">SMS</p>
                      <p className="text-xs text-gray-600">Mensajes de texto para alertas urgentes</p>
                    </div>
                  </label>
                </div>
              </div>
              
              {/* Condiciones de alerta */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condiciones de activación
                </label>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newAlert.conditions.newSubvenciones}
                      onChange={(e) => setNewAlert({
                        ...newAlert,
                        conditions: {
                          ...newAlert.conditions,
                          newSubvenciones: e.target.checked
                        }
                      })}
                      className="mr-3"
                    />
                    <span className="text-sm">Notificar cuando aparezcan nuevas subvenciones</span>
                  </label>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={newAlert.conditions.proximoCierre}
                      onChange={(e) => setNewAlert({
                        ...newAlert,
                        conditions: {
                          ...newAlert.conditions,
                          proximoCierre: e.target.checked
                        }
                      })}
                      className="mr-3"
                    />
                    <span className="text-sm mr-3">Alertar cuando falten</span>
                    <input
                      type="number"
                      value={newAlert.conditions.diasAntesCierre}
                      onChange={(e) => setNewAlert({
                        ...newAlert,
                        conditions: {
                          ...newAlert.conditions,
                          diasAntesCierre: e.target.value
                        }
                      })}
                      className="w-16 px-2 py-1 border rounded text-sm"
                      min="1"
                      max="30"
                    />
                    <span className="text-sm ml-2">días para el cierre</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm mr-3">Solo si la cuantía es mayor a</span>
                    <input
                      type="number"
                      value={newAlert.conditions.cuantiaMinima}
                      onChange={(e) => setNewAlert({
                        ...newAlert,
                        conditions: {
                          ...newAlert.conditions,
                          cuantiaMinima: e.target.value
                        }
                      })}
                      placeholder="0"
                      className="w-32 px-2 py-1 border rounded text-sm"
                    />
                    <span className="text-sm ml-2">€</span>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm mr-3">Solo si la probabilidad es mayor a</span>
                    <input
                      type="number"
                      value={newAlert.conditions.probabilidadMinima}
                      onChange={(e) => setNewAlert({
                        ...newAlert,
                        conditions: {
                          ...newAlert.conditions,
                          probabilidadMinima: e.target.value
                        }
                      })}
                      placeholder="0"
                      className="w-20 px-2 py-1 border rounded text-sm"
                      min="0"
                      max="100"
                    />
                    <span className="text-sm ml-2">%</span>
                  </div>
                </div>
              </div>
              
              {/* Resumen de filtros */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">
                  Filtros aplicados desde la búsqueda actual
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  Esta alerta utilizará los {getActiveFiltersCount(newAlert.filters)} filtros que tienes activos actualmente
                </p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(newAlert.filters).map(([key, value]) => {
                    if (value && value !== 'todos' && value !== 'cualquiera' && value !== '') {
                      if (Array.isArray(value) && value.length > 0) {
                        return value.map((v, idx) => (
                          <span key={`${key}-${idx}`} className="px-2 py-1 bg-white border rounded text-xs">
                            {v}
                          </span>
                        ));
                      } else if (!Array.isArray(value) && typeof value === 'boolean' && value) {
                        return (
                          <span key={key} className="px-2 py-1 bg-white border rounded text-xs">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </span>
                        );
                      }
                    }
                    return null;
                  })}
                </div>
              </div>
              
              {/* Botones de acción */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  onClick={() => {
                    setIsCreating(false);
                    setEditingId(null);
                  }}
                  className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSaveAlert}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {editingId ? 'Guardar cambios' : 'Crear alerta'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AlertsConfig;
