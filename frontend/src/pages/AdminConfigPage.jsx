import React, { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminConfigPage = () => {
  const [configs, setConfigs] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [error, setError] = useState('');

  const cargarConfigs = () => {
    setLoading(true);
    setError('');
    adminService.getConfiguraciones()
      .then(res => {
        const list = res.data || [];
        setConfigs(list);
        const map = {};
        list.forEach(c => { map[c.clave] = c.valor; });
        setValues(map);
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'Error al cargar configuraciones';
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarConfigs();
  }, []);

  const handleChange = (clave, nuevoValor) => {
    setValues(prev => ({ ...prev, [clave]: nuevoValor }));
  };

  const handleGuardar = (clave) => {
    const valor = values[clave];

    // Validate based on key
    if (clave === 'TASA_COMISION') {
      const num = parseFloat(valor);
      if (isNaN(num) || num < 0 || num > 1) {
        toast.error('La tasa de comisión debe ser un número entre 0 y 1 (por ejemplo, 0.15 para 15%)');
        return;
      }
    }

    setSavingKey(clave);
    setError('');
    adminService.actualizarConfiguracion(clave, valor)
      .then(() => {
        toast.success(`Configuración '${clave}' actualizada correctamente`);
        setSavingKey('');
        cargarConfigs();
      })
      .catch((err) => {
        const msg = err.response?.data?.message || `No se pudo actualizar la configuración '${clave}'`;
        setError(msg);
        toast.error(msg);
        setSavingKey('');
      });
  };

  // Helper to get description for each config key
  const getConfigDescription = (clave) => {
    const descriptions = {
      'TASA_COMISION': 'Porcentaje de comisión que retiene la plataforma en cada venta (valor decimal entre 0 y 1, ej: 0.15 = 15%)',
      // Add more descriptions as needed
    };
    return descriptions[clave] || 'Configuración del sistema';
  };

  // Validate if a value is valid for save
  const isValueValid = (clave, valor) => {
    if (clave === 'TASA_COMISION') {
      const num = parseFloat(valor);
      return !isNaN(num) && num >= 0 && num <= 1;
    }
    // For other configs, just check it's not empty
    return valor !== null && valor !== undefined && valor.toString().trim() !== '';
  };

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card className="p-6">
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Cargando configuración...</span>
          </div>
        </Card>
      </div>
    );
  }

  // Error state with retry
  if (error && configs.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <Card className="p-6 border-red-200">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <p className="text-red-700 font-medium">No se pudo cargar la configuración</p>
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" onClick={cargarConfigs} className="border-red-200 text-red-700 hover:bg-red-100">
              Reintentar
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <Card className="p-6">
        <CardHeader className="pb-4 px-0">
          <CardTitle>Configuración de la Plataforma</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Gestiona los parámetros principales del sistema
          </p>
        </CardHeader>

        {/* Error banner (if error but we have configs loaded) */}
        {error && configs.length > 0 && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <Button variant="link" size="sm" onClick={cargarConfigs} className="text-red-700">
              Reintentar
            </Button>
          </div>
        )}

        {configs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No hay configuraciones registradas.
          </div>
        ) : (
          <CardContent className="p-0">
            <div className="space-y-6">
              {configs.map(conf => {
                const currentValue = values[conf.clave] ?? '';
                const isValid = isValueValid(conf.clave, currentValue);

                return (
                  <div key={conf.id || conf.clave} className="rounded-lg border border-border bg-white p-4">
                    <div className="mb-2">
                      <div className="text-sm font-semibold text-foreground">{conf.clave}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {getConfigDescription(conf.clave)}
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <Input
                          type={conf.clave === 'TASA_COMISION' ? 'number' : 'text'}
                          step={conf.clave === 'TASA_COMISION' ? '0.01' : undefined}
                          min={conf.clave === 'TASA_COMISION' ? '0' : undefined}
                          max={conf.clave === 'TASA_COMISION' ? '1' : undefined}
                          value={currentValue}
                          onChange={(e) => handleChange(conf.clave, e.target.value)}
                          className={!isValid ? 'border-red-300 focus:border-red-500' : ''}
                        />
                        {conf.clave === 'TASA_COMISION' && !isValid && currentValue !== '' && (
                          <p className="text-xs text-red-600 mt-1">
                            Debe ser un valor entre 0 y 1
                          </p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleGuardar(conf.clave)}
                        disabled={savingKey === conf.clave || !isValid}
                      >
                        {savingKey === conf.clave ? (
                          <>
                            <Loader2 className="h-3 w-3 animate-spin mr-2" />
                            Guardando...
                          </>
                        ) : (
                          'Guardar'
                        )}
                      </Button>
                    </div>

                    {/* Show current value as percentage if TASA_COMISION */}
                    {conf.clave === 'TASA_COMISION' && isValid && currentValue !== '' && (
                      <p className="text-xs text-muted-foreground mt-2">
                        Equivale a: {(parseFloat(currentValue) * 100).toFixed(2)}%
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default AdminConfigPage;