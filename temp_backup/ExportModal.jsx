import React, { useState } from 'react';
import { 
  X, Download, FileText, FileSpreadsheet, FileJson,
  Check, AlertCircle, Loader
} from 'lucide-react';

const ExportModal = ({ data, onExport, onClose }) => {
  const [selectedFormat, setSelectedFormat] = useState('excel');
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [exportOptions, setExportOptions] = useState({
    includeDescriptions: true,
    includeMetadata: true,
    includeFinancialDetails: true,
    includeRequirements: false,
    includeDates: true,
    includeContacts: false
  });
  
  const formats = [
    {
      id: 'excel',
      name: 'Excel',
      description: 'Formato ideal para análisis y filtrado',
      icon: FileSpreadsheet,
      extension: '.xlsx',
      color: 'text-green-600'
    },
    {
      id: 'pdf',
      name: 'PDF',
      description: 'Formato para presentaciones e informes',
      icon: FileText,
      extension: '.pdf',
      color: 'text-red-600'
    },
    {
      id: 'csv',
      name: 'CSV',
      description: 'Compatible con cualquier hoja de cálculo',
      icon: FileSpreadsheet,
      extension: '.csv',
      color: 'text-blue-600'
    },
    {
      id: 'json',
      name: 'JSON',
      description: 'Para integración con otros sistemas',
      icon: FileJson,
      extension: '.json',
      color: 'text-purple-600'
    }
  ];
  
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(data.map(item => item.id));
    }
    setSelectAll(!selectAll);
  };
  
  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(item => item !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };
  
  const handleExport = async () => {
    setIsExporting(true);
    
    // Simular proceso de exportación
    setTimeout(() => {
      onExport(selectedFormat, selectedItems);
      setIsExporting(false);
      onClose();
    }, 1500);
  };
  
  const getExportSummary = () => {
    const itemsToExport = selectedItems.length > 0 ? selectedItems.length : data.length;
    const totalAmount = data
      .filter(item => selectedItems.length === 0 || selectedItems.includes(item.id))
      .reduce((sum, item) => sum + parseFloat(item.cuantia || 0), 0);
    
    return {
      items: itemsToExport,
      amount: totalAmount
    };
  };
  
  const summary = getExportSummary();
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Exportar Subvenciones</h2>
            <p className="text-sm text-gray-500 mt-1">
              Selecciona el formato y las subvenciones a exportar
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
        <div className="flex h-[500px]">
          {/* Sidebar - Formato y opciones */}
          <div className="w-1/3 p-6 border-r bg-gray-50">
            <h3 className="font-semibold text-gray-900 mb-4">Formato de exportación</h3>
            <div className="space-y-2 mb-6">
              {formats.map(format => (
                <label
                  key={format.id}
                  className={`
                    flex items-start p-3 rounded-lg cursor-pointer transition-all
                    ${selectedFormat === format.id 
                      ? 'bg-white border-2 border-blue-500 shadow-sm' 
                      : 'bg-white border-2 border-gray-200 hover:border-gray-300'}
                  `}
                >
                  <input
                    type="radio"
                    name="format"
                    value={format.id}
                    checked={selectedFormat === format.id}
                    onChange={() => setSelectedFormat(format.id)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <format.icon className={`w-4 h-4 ${format.color}`} />
                      <span className="font-medium">{format.name}</span>
                      <span className="text-xs text-gray-400">{format.extension}</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{format.description}</p>
                  </div>
                </label>
              ))}
            </div>
            
            {/* Opciones de exportación */}
            <h3 className="font-semibold text-gray-900 mb-3">Incluir en la exportación</h3>
            <div className="space-y-2">
              {Object.entries({
                includeDescriptions: 'Descripciones completas',
                includeMetadata: 'Metadatos y categorías',
                includeFinancialDetails: 'Detalles financieros',
                includeRequirements: 'Requisitos especiales',
                includeDates: 'Fechas y plazos',
                includeContacts: 'Información de contacto'
              }).map(([key, label]) => (
                <label key={key} className="flex items-center text-sm">
                  <input
                    type="checkbox"
                    checked={exportOptions[key]}
                    onChange={(e) => setExportOptions({
                      ...exportOptions,
                      [key]: e.target.checked
                    })}
                    className="mr-2 rounded text-blue-600"
                  />
                  <span className="text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
          
          {/* Main content - Lista de subvenciones */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">
                Seleccionar subvenciones ({selectedItems.length} de {data.length})
              </h3>
              <button
                onClick={handleSelectAll}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                {selectAll ? 'Deseleccionar todo' : 'Seleccionar todo'}
              </button>
            </div>
            
            <div className="space-y-2">
              {data.map(item => (
                <label
                  key={item.id}
                  className={`
                    flex items-start p-3 rounded-lg cursor-pointer transition-all
                    ${selectedItems.includes(item.id) 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'bg-white border border-gray-200 hover:bg-gray-50'}
                  `}
                >
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                    className="mt-1 mr-3"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 line-clamp-1">
                      {item.titulo}
                    </p>
                    <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                      <span>{item.organismo}</span>
                      <span>•</span>
                      <span className="font-medium">
                        {new Intl.NumberFormat('es-ES', { 
                          style: 'currency',
                          currency: 'EUR',
                          maximumFractionDigits: 0
                        }).format(item.cuantia)}
                      </span>
                      <span>•</span>
                      <span className={`
                        px-2 py-0.5 rounded text-xs font-medium
                        ${item.estado === 'abierto' ? 'bg-green-100 text-green-700' :
                          item.estado === 'proximo' ? 'bg-blue-100 text-blue-700' :
                          'bg-gray-100 text-gray-700'}
                      `}>
                        {item.estado}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            {/* Resumen */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">
                  <strong>{summary.items}</strong> subvenciones seleccionadas
                </span>
              </div>
              <div className="text-sm text-gray-600">
                Total: <strong>
                  {new Intl.NumberFormat('es-ES', { 
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(summary.amount)}
                </strong>
              </div>
            </div>
            
            {/* Botones */}
            <div className="flex items-center gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:text-gray-900 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleExport}
                disabled={isExporting || (selectedItems.length === 0 && data.length === 0)}
                className={`
                  px-6 py-2 rounded-lg font-medium flex items-center gap-2
                  ${isExporting || (selectedItems.length === 0 && data.length === 0)
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-600 text-white hover:bg-blue-700'}
                `}
              >
                {isExporting ? (
                  <>
                    <Loader className="w-4 h-4 animate-spin" />
                    Exportando...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Exportar {selectedFormat.toUpperCase()}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;
