import React, { useEffect, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import adminUsuariosService from '../services/adminUsuariosService';
import { Button } from '../components/ui/button';

const AdminUsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const cargarUsuarios = () => {
    setLoading(true);
    setError('');
    adminUsuariosService.listarUsuarios()
      .then(res => setUsuarios(res.data))
      .catch(() => setError('Error al cargar usuarios'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const handleToggleEstado = (usuario) => {
    const nuevoEstado = usuario.estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';
    adminUsuariosService.actualizarEstado(usuario.id, nuevoEstado)
      .then(() => cargarUsuarios())
      .catch(() => setError('No se pudo actualizar el estado del usuario'));
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const solicitarEliminar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setConfirmOpen(true);
  };

  const confirmarEliminar = () => {
    if (!usuarioSeleccionado) return;
    adminUsuariosService.eliminarUsuario(usuarioSeleccionado.id)
      .then(() => cargarUsuarios())
      .catch(() => setError('No se pudo eliminar el usuario'))
      .finally(() => { setConfirmOpen(false); setUsuarioSeleccionado(null); });
  };

  if (loading) return (
    <div className="flex items-center justify-center mt-8">
      <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Cargando" />
    </div>
  );

  return (
    <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
      <h1 className="text-2xl font-semibold text-foreground mb-4">Gestionar Usuarios</h1>
      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted">
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">ID</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Nombre</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Email</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Rol</th>
              <th className="px-3 py-2 text-left font-medium text-muted-foreground">Estado</th>
              <th className="px-3 py-2 text-right font-medium text-muted-foreground">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.map((u) => (
              <tr key={u.id} className="border-t">
                <td className="px-3 py-2">{u.id}</td>
                <td className="px-3 py-2">{u.nombre}</td>
                <td className="px-3 py-2">{u.email}</td>
                <td className="px-3 py-2">{u.rol}</td>
                <td className="px-3 py-2">{u.estado}</td>
                <td className="px-3 py-2 text-right">
                  <Button
                    variant={u.estado === 'ACTIVO' ? 'secondary' : 'default'}
                    className="mr-2"
                    onClick={() => handleToggleEstado(u)}
                  >
                    {u.estado === 'ACTIVO' ? 'Bloquear' : 'Activar'}
                  </Button>
                  <Button variant="destructive" onClick={() => solicitarEliminar(u)}>
                    Eliminar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Confirmación de eliminación */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar eliminación"
        message={usuarioSeleccionado ? `¿Eliminar usuario ${usuarioSeleccionado.nombre} (${usuarioSeleccionado.email})?` : ''}
        confirmText="Eliminar"
        cancelText="Cancelar"
        onConfirm={confirmarEliminar}
        onCancel={() => { setConfirmOpen(false); setUsuarioSeleccionado(null); }}
      />
    </div>
  );
};

export default AdminUsuariosPage;