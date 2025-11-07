import React, { useEffect, useState } from 'react';
import adminService from '../services/adminService';
import { Card, CardHeader, CardTitle, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const AdminConfigPage = () => {
  const [configs, setConfigs] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

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
      .catch(() => setError('Error al cargar configuraciones'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarConfigs();
  }, []);

  const handleChange = (clave, nuevoValor) => {
    setValues(prev => ({ ...prev, [clave]: nuevoValor }));
    setSuccess('');
    setError('');
  };

  const handleGuardar = (clave) => {
    const valor = values[clave];
    setSavingKey(clave);
    setError('');
    setSuccess('');
    adminService.actualizarConfiguracion(clave, valor)
      .then(() => {
        setSuccess(`Configuración '${clave}' actualizada correctamente.`);
        setSavingKey('');
        cargarConfigs();
      })
      .catch(() => {
        setError(`No se pudo actualizar la configuración '${clave}'.`);
        setSavingKey('');
      });
  };

  if (loading) return (
    <div className="flex justify-center mt-4">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-sky-500" />
    </div>
  );

  return (
    <Card className="p-4">
      <CardHeader className="pb-2">
        <CardTitle>Configuración (Admin)</CardTitle>
      </CardHeader>
      {error && (
        <div className="mb-2 rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="mb-2 rounded-md border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {success}
        </div>
      )}
      {configs.length === 0 ? (
        <div className="text-slate-700">No hay configuraciones registradas.</div>
      ) : (
        <CardContent className="p-0">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {configs.map(conf => (
              <div key={conf.id || conf.clave} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="mb-2 text-sm font-medium text-slate-800">{conf.clave}</div>
                <div className="flex items-center gap-2">
                  <Input
                    value={values[conf.clave] ?? ''}
                    onChange={(e) => handleChange(conf.clave, e.target.value)}
                  />
                  <Button onClick={() => handleGuardar(conf.clave)} disabled={savingKey === conf.clave}>
                    {savingKey === conf.clave ? 'Guardando...' : 'Guardar'}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AdminConfigPage;