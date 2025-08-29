import React, { useState } from 'react';
import { Download, X, FileText, FileSpreadsheet, FileImage, Code } from 'lucide-react';
import type { 
  Subvencion, 
  ExportFormat, 
  ExportOptions, 
  FormatOption 
} from '@/types';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  subvenciones?: Subvencion[]; // Opcional
  data?: Subvencion[]; // Alias para compatibilidad
  onExport: (options: ExportOptions | ExportFormat, selectedIds?: string[]) => Promise<void>;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  subvenciones,
  data, // Alias para compatibilidad
  onExport
}) => {
  const subvencionesToUse = subvenciones || data || [];
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    formato: 'excel',
    incluirDetalles: true,
    incluirEstadisticas: false,
    incluirGraficos: false,
    campos: undefined
  });

  const [isExporting, setIsExporting] = useState(false);

  const formatOptions: FormatOption[] = [
    {
      value: 'excel',
      label: 'Excel (XLSX)',
      description: 'Hoja de cálculo con filtros y formato',
      icon: 'FileSpreadsheet',
      available: true
    },
    {
      value: 'csv',
      label: 'CSV',
      description: 'Valores separados por comas',
      icon: 'FileText',
      available: true
    },
    {
      value: 'pdf',
      label: 'PDF',
      description: 'Documento con formato para impresión',
      icon: 'FileImage',
      available: true
    },
    {
      value: 'json',
      label: 'JSON',
      description: 'Formato de datos estructurados',
      icon: 'Code',
      available: true
    }
  ];

  const getFormatIcon = (iconName: string) => {
    switch (iconName) {
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-6 h-6" />;
      case 'FileText': return <FileText className="w-6 h-6" />;
      case 'FileImage': return <FileImage className="w-6 h-6" />;
      case 'Code': return <Code className="w-6 h-6" />;
      default: return <FileText className="w-6 h-6" />;
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await onExport(exportOptions);
      onClose();
    } catch (error) {
      console.error('Error al exportar:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const updateExportOptions = (updates: Partial<ExportOptions>) => {
    setExportOptions((prev: ExportOptions) => ({ ...prev, ...updates }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Exportar Subvenciones</h2>
            <p className="text-sm text-gray-600 mt-1">
              {subvencionesToUse.length} subvenciones seleccionadas para exportar
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            disabled={isExporting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Formato de exportación */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Formato de exportación</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {formatOptions.map(format => (
                <div
                  key={format.value}
                  className={`border rounded-lg p-4 cursor-pointer transition-all ${
                    exportOptions.formato === format.value
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  } ${!format.available ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => format.available && updateExportOptions({ formato: format.value })}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`${
                      exportOptions.formato === format.value ? 'text-blue-600' : 'text-gray-400'
                    }`}>
                      {getFormatIcon(format.icon)}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{format.label}</div>
                      <div className="text-sm text-gray-600">{format.description}</div>
                    </div>
                    {exportOptions.formato === format.value && (
                      <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Opciones de contenido */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Contenido a incluir</h3>
            <div className="space-y-3">
              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.incluirDetalles}
                  onChange={(e) => updateExportOptions({ incluirDetalles: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Detalles completos</div>
                  <div className="text-sm text-gray-600">
                    Incluir todos los campos de las subvenciones
                  </div>
                </div>
              </label>

              <label className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  checked={exportOptions.incluirEstadisticas}
                  onChange={(e) => updateExportOptions({ incluirEstadisticas: e.target.checked })}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <div>
                  <div className="font-medium text-gray-900">Estadísticas</div>
                  <div className="text-sm text-gray-600">
                    Resumen estadístico de los datos exportados
                  </div>
                </div>
              </label>

              {(exportOptions.formato === 'pdf' || exportOptions.formato === 'excel') && (
                <label className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    checked={exportOptions.incluirGraficos}
                    onChange={(e) => updateExportOptions({ incluirGraficos: e.target.checked })}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium text-gray-900">Gráficos</div>
                    <div className="text-sm text-gray-600">
                      Incluir gráficos y visualizaciones de datos
                    </div>
                  </div>
                </label>
              )}
            </div>
          </div>

          {/* Nombre del archivo */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-3">Nombre del archivo</h3>
            <input
              type="text"
              value={exportOptions.nombreArchivo || ''}
              onChange={(e) => updateExportOptions({ nombreArchivo: e.target.value })}
              placeholder={`subvenciones_${new Date().toISOString().split('T')[0]}`}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-sm text-gray-600 mt-1">
              Si se deja en blanco, se generará automáticamente con la fecha actual
            </p>
          </div>

          {/* Información del archivo */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-2">Información del archivo</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Subvenciones:</span>
                <span className="ml-2 font-medium">{subvencionesToUse.length}</span>
              </div>
              <div>
                <span className="text-gray-600">Formato:</span>
                <span className="ml-2 font-medium uppercase">{exportOptions.formato}</span>
              </div>
              <div>
                <span className="text-gray-600">Tamaño estimado:</span>
                <span className="ml-2 font-medium">
                  {exportOptions.formato === 'pdf' ? '~500KB' : '~100KB'}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Tiempo estimado:</span>
                <span className="ml-2 font-medium">
                  {subvencionesToUse.length > 1000 ? '~30s' : '~5s'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleExport}
            disabled={isExporting}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isExporting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                <span>Exportando...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Exportar</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
