import React, { useMemo } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  Treemap, AreaChart, Area
} from 'recharts';
import { 
  TrendingUp, Euro, Calendar, Users, Building, MapPin,
  Award, AlertCircle, Activity, Target, Zap, Clock
} from 'lucide-react';
import { format, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const Dashboard = ({ subvenciones, stats }) => {
  // Colores para gráficos
  const COLORS = [
    '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ];
  
  // Análisis por categorías
  const categoriaAnalysis = useMemo(() => {
    const analysis = {};
    subvenciones.forEach(sub => {
      sub.categorias?.forEach(cat => {
        if (!analysis[cat]) {
          analysis[cat] = { count: 0, total: 0, abiertos: 0 };
        }
        analysis[cat].count++;
        analysis[cat].total += parseFloat(sub.cuantia || 0);
        if (sub.estado === 'abierto') analysis[cat].abiertos++;
      });
    });
    
    return Object.entries(analysis)
      .map(([name, data]) => ({
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        fullName: name,
        cantidad: data.count,
        presupuesto: data.total,
        abiertos: data.abiertos
      }))
      .sort((a, b) => b.presupuesto - a.presupuesto)
      .slice(0, 10);
  }, [subvenciones]);
  
  // Análisis temporal
  const temporalAnalysis = useMemo(() => {
    const monthlyData = {};
    const today = new Date();
    
    // Crear estructura de los próximos 6 meses
    for (let i = 0; i < 6; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
      const key = format(date, 'MMM yyyy', { locale: es });
      monthlyData[key] = { 
        mes: key, 
        aperturas: 0, 
        cierres: 0,
        presupuesto: 0
      };
    }
    
    // Llenar con datos
    subvenciones.forEach(sub => {
      if (sub.fechaInicio) {
        const fecha = parseISO(sub.fechaInicio);
        if (fecha >= today) {
          const key = format(fecha, 'MMM yyyy', { locale: es });
          if (monthlyData[key]) {
            monthlyData[key].aperturas++;
            monthlyData[key].presupuesto += parseFloat(sub.cuantia || 0);
          }
        }
      }
      
      if (sub.fechaFin) {
        const fecha = parseISO(sub.fechaFin);
        if (fecha >= today) {
          const key = format(fecha, 'MMM yyyy', { locale: es });
          if (monthlyData[key]) {
            monthlyData[key].cierres++;
          }
        }
      }
    });
    
    return Object.values(monthlyData);
  }, [subvenciones]);
  
  // Análisis por comunidad autónoma
  const comunidadAnalysis = useMemo(() => {
    const analysis = {};
    subvenciones.forEach(sub => {
      const ca = sub.comunidadAutonoma || 'Nacional';
      if (!analysis[ca]) {
        analysis[ca] = { count: 0, total: 0 };
      }
      analysis[ca].count++;
      analysis[ca].total += parseFloat(sub.cuantia || 0);
    });
    
    return Object.entries(analysis)
      .map(([name, data]) => ({
        name,
        subvenciones: data.count,
        presupuesto: data.total,
        media: data.total / data.count
      }))
      .sort((a, b) => b.presupuesto - a.presupuesto)
      .slice(0, 8);
  }, [subvenciones]);
  
  // Análisis de probabilidad de éxito
  const probabilidadAnalysis = useMemo(() => {
    const ranges = {
      'Muy Alta (>80%)': 0,
      'Alta (60-80%)': 0,
      'Media (40-60%)': 0,
      'Baja (20-40%)': 0,
      'Muy Baja (<20%)': 0
    };
    
    subvenciones.forEach(sub => {
      const prob = sub.probabilidadConcesion || 0;
      if (prob > 80) ranges['Muy Alta (>80%)']++;
      else if (prob > 60) ranges['Alta (60-80%)']++;
      else if (prob > 40) ranges['Media (40-60%)']++;
      else if (prob > 20) ranges['Baja (20-40%)']++;
      else ranges['Muy Baja (<20%)']++;
    });
    
    return Object.entries(ranges).map(([name, value]) => ({
      name,
      value,
      percentage: (value / subvenciones.length * 100).toFixed(1)
    }));
  }, [subvenciones]);
  
  // Análisis de complejidad
  const complejidadAnalysis = useMemo(() => {
    const data = {
      baja: { count: 0, prob: 0 },
      media: { count: 0, prob: 0 },
      alta: { count: 0, prob: 0 }
    };
    
    subvenciones.forEach(sub => {
      const comp = sub.complejidadAdministrativa || 'media';
      if (data[comp]) {
        data[comp].count++;
        data[comp].prob += sub.probabilidadConcesion || 0;
      }
    });
    
    return Object.entries(data).map(([nivel, info]) => ({
      complejidad: nivel.charAt(0).toUpperCase() + nivel.slice(1),
      cantidad: info.count,
      probabilidadMedia: info.count > 0 ? (info.prob / info.count).toFixed(1) : 0
    }));
  }, [subvenciones]);
  
  // Análisis de tipos de financiación
  const financiacionAnalysis = useMemo(() => {
    const tipos = {};
    subvenciones.forEach(sub => {
      const tipo = sub.tipoFinanciacion || 'subvencion';
      tipos[tipo] = (tipos[tipo] || 0) + 1;
    });
    
    return Object.entries(tipos).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      percentage: (value / subvenciones.length * 100).toFixed(1)
    }));
  }, [subvenciones]);
  
  // Top subvenciones por cuantía
  const topSubvenciones = useMemo(() => {
    return [...subvenciones]
      .sort((a, b) => parseFloat(b.cuantia || 0) - parseFloat(a.cuantia || 0))
      .slice(0, 5);
  }, [subvenciones]);
  
  // Análisis de requisitos especiales
  const requisitosAnalysis = useMemo(() => {
    return [
      { 
        requisito: 'Impacto Ambiental',
        cantidad: subvenciones.filter(s => s.requisitoAmbiental).length,
        icon: '🌱'
      },
      { 
        requisito: 'Igualdad de Género',
        cantidad: subvenciones.filter(s => s.requisitoIgualdad).length,
        icon: '⚖️'
      },
      { 
        requisito: 'Transformación Digital',
        cantidad: subvenciones.filter(s => s.esDigital).length,
        icon: '💻'
      },
      { 
        requisito: 'Economía Circular',
        cantidad: subvenciones.filter(s => s.esCircular).length,
        icon: '♻️'
      },
      { 
        requisito: 'Empleo Joven',
        cantidad: subvenciones.filter(s => s.paraJovenes).length,
        icon: '👥'
      },
      { 
        requisito: 'Zona Rural',
        cantidad: subvenciones.filter(s => s.zonaRural).length,
        icon: '🌾'
      }
    ];
  }, [subvenciones]);
  
  // Custom tooltip para gráficos
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' 
                ? entry.value.toLocaleString('es-ES')
                : entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };
  
  return (
    <div className="space-y-6">
      {/* KPIs principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{subvenciones.filter(s => s.estado === 'abierto').length}</span>
          </div>
          <h3 className="font-semibold">Subvenciones Activas</h3>
          <p className="text-sm opacity-90 mt-1">Disponibles para solicitar</p>
        </div>
        
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Euro className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">
              {new Intl.NumberFormat('es-ES', { 
                notation: 'compact',
                maximumFractionDigits: 1
              }).format(stats.totalPresupuesto)}€
            </span>
          </div>
          <h3 className="font-semibold">Presupuesto Total</h3>
          <p className="text-sm opacity-90 mt-1">Fondos disponibles</p>
        </div>
        
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Clock className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.proximosCierres}</span>
          </div>
          <h3 className="font-semibold">Cierres Próximos</h3>
          <p className="text-sm opacity-90 mt-1">En los próximos 7 días</p>
        </div>
        
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Target className="w-8 h-8 opacity-80" />
            <span className="text-2xl font-bold">{stats.tasaExito.toFixed(0)}%</span>
          </div>
          <h3 className="font-semibold">Tasa de Éxito</h3>
          <p className="text-sm opacity-90 mt-1">Probabilidad promedio</p>
        </div>
      </div>
      
      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolución temporal */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-600" />
            Calendario de Convocatorias
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={temporalAnalysis}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="aperturas" 
                stackId="1"
                stroke="#10B981" 
                fill="#10B981"
                fillOpacity={0.6}
                name="Aperturas"
              />
              <Area 
                type="monotone" 
                dataKey="cierres" 
                stackId="1"
                stroke="#EF4444" 
                fill="#EF4444"
                fillOpacity={0.6}
                name="Cierres"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        
        {/* Distribución por categorías */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart className="w-5 h-5 text-green-600" />
            Top Categorías por Presupuesto
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={categoriaAnalysis} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" tickFormatter={(value) => 
                new Intl.NumberFormat('es-ES', { 
                  notation: 'compact',
                  maximumFractionDigits: 1
                }).format(value) + '€'
              } />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                content={<CustomTooltip />}
                formatter={(value) => 
                  new Intl.NumberFormat('es-ES', { 
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(value)
                }
              />
              <Bar dataKey="presupuesto" fill="#3B82F6" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
      
      {/* Segunda fila de gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Distribución geográfica */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-purple-600" />
            Distribución Geográfica
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={comunidadAnalysis.slice(0, 6)}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                fill="#8884d8"
                paddingAngle={2}
                dataKey="presupuesto"
              >
                {comunidadAnalysis.slice(0, 6).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                formatter={(value) => 
                  new Intl.NumberFormat('es-ES', { 
                    style: 'currency',
                    currency: 'EUR',
                    maximumFractionDigits: 0
                  }).format(value)
                }
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-4 space-y-2">
            {comunidadAnalysis.slice(0, 4).map((ca, idx) => (
              <div key={idx} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx] }}
                  />
                  <span className="text-gray-600">{ca.name}</span>
                </div>
                <span className="font-medium">
                  {new Intl.NumberFormat('es-ES', { 
                    notation: 'compact',
                    maximumFractionDigits: 1
                  }).format(ca.presupuesto)}€
                </span>
              </div>
            ))}
          </div>
        </div>
        
        {/* Probabilidad de éxito */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Análisis de Probabilidad
          </h3>
          <ResponsiveContainer width="100%" height={250}>
            <RadarChart data={complejidadAnalysis}>
              <PolarGrid />
              <PolarAngleAxis dataKey="complejidad" />
              <PolarRadiusAxis angle={90} domain={[0, 100]} />
              <Radar 
                name="Probabilidad Media (%)" 
                dataKey="probabilidadMedia" 
                stroke="#10B981" 
                fill="#10B981" 
                fillOpacity={0.6} 
              />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
          <div className="mt-4 p-3 bg-green-50 rounded-lg">
            <p className="text-sm text-green-800">
              <strong>Recomendación:</strong> Las subvenciones de baja complejidad tienen 
              una probabilidad de éxito significativamente mayor.
            </p>
          </div>
        </div>
        
        {/* Tipos de financiación */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Euro className="w-5 h-5 text-orange-600" />
            Tipos de Financiación
          </h3>
          <div className="space-y-3">
            {financiacionAnalysis.map((tipo, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{tipo.name}</span>
                  <span className="text-sm text-gray-600">
                    {tipo.value} ({tipo.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${tipo.percentage}%`,
                      backgroundColor: COLORS[idx]
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-semibold mb-2">Condiciones destacadas</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Con anticipo</span>
                <span className="font-medium text-green-600">
                  {subvenciones.filter(s => s.anticipoDisponible).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Sin garantías</span>
                <span className="font-medium text-green-600">
                  {subvenciones.filter(s => !s.garantiasRequeridas).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Compatible con otras</span>
                <span className="font-medium text-green-600">
                  {subvenciones.filter(s => s.compatibleOtrasAyudas).length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Requisitos especiales y Top subvenciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Requisitos especiales */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-indigo-600" />
            Criterios de Impacto Social
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {requisitosAnalysis.map((req, idx) => (
              <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{req.icon}</span>
                  <span className="text-2xl font-bold text-gray-900">{req.cantidad}</span>
                </div>
                <p className="text-sm text-gray-600">{req.requisito}</p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="h-1.5 rounded-full bg-indigo-600"
                    style={{ width: `${(req.cantidad / subvenciones.length * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Top 5 subvenciones */}
        <div className="bg-white rounded-xl p-6 border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Zap className="w-5 h-5 text-yellow-600" />
            Top 5 Subvenciones por Cuantía
          </h3>
          <div className="space-y-3">
            {topSubvenciones.map((sub, idx) => (
              <div key={idx} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`
                      px-2 py-1 rounded-full text-xs font-bold
                      ${idx === 0 ? 'bg-yellow-400 text-yellow-900' : 
                        idx === 1 ? 'bg-gray-300 text-gray-700' :
                        idx === 2 ? 'bg-orange-400 text-orange-900' :
                        'bg-gray-200 text-gray-600'}
                    `}>
                      #{idx + 1}
                    </span>
                    <span className="text-sm font-medium text-gray-900 line-clamp-1">
                      {sub.titulo}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span>{sub.organismo}</span>
                    <span>•</span>
                    <span>{sub.comunidadAutonoma}</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-lg text-gray-900">
                    {new Intl.NumberFormat('es-ES', { 
                      style: 'currency',
                      currency: 'EUR',
                      maximumFractionDigits: 0,
                      notation: 'compact'
                    }).format(sub.cuantia)}
                  </p>
                  {sub.estado === 'abierto' && (
                    <span className="text-xs text-green-600 font-medium">Abierta</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Insights y recomendaciones */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-6 h-6 text-blue-600 mt-1" />
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Insights y Recomendaciones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <p>
                  <strong>{stats.proximosCierres}</strong> subvenciones cierran en los próximos 7 días.
                  Prioriza aquellas con mayor probabilidad de éxito.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <p>
                  Las categorías de <strong>{categoriaAnalysis[0]?.fullName}</strong> y 
                  <strong> {categoriaAnalysis[1]?.fullName}</strong> concentran el mayor presupuesto disponible.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <p>
                  <strong>{((subvenciones.filter(s => s.anticipoDisponible).length / subvenciones.length) * 100).toFixed(0)}%</strong> de 
                  las subvenciones ofrecen anticipo, lo que mejora el flujo de caja.
                </p>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <p>
                  Las subvenciones con requisitos de <strong>sostenibilidad</strong> han aumentado un 
                  <strong> {((subvenciones.filter(s => s.requisitoAmbiental).length / subvenciones.length) * 100).toFixed(0)}%</strong>.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
