import React, { useEffect, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import adminUsuariosService from '../services/adminUsuariosService';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select } from '../components/ui/select';
import { Dialog, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Search, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminUsuariosPage = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [filteredUsuarios, setFilteredUsuarios] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // Estados para modal crear/editar
  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState(null); // null = creando
  const [form, setForm] = useState({
    nombre: '',
    email: '',
    password: '',
    rol: 'CLIENTE',
    estado: 'ACTIVO',
  });

  const cargarUsuarios = () => {
    setLoading(true);
    setError('');
    adminUsuariosService.listarUsuarios()
      .then(res => {
        setUsuarios(res.data);
        setFilteredUsuarios(res.data);
      })
      .catch((err) => {
        const status = err.response?.status;
        const msg = err.response?.data?.message || `Error al cargar usuarios${status ? ` (Código: ${status})` : ''}.`;
        setError(msg);
        toast.error(msg);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargarUsuarios();
  }, []);

  // Filtrado local
  useEffect(() => {
    const term = searchTerm.toLowerCase();
    const filtrados = usuarios.filter(u =>
      (u.nombre || '').toLowerCase().includes(term) ||
      (u.email || '').toLowerCase().includes(term)
    );
    setFilteredUsuarios(filtrados);
  }, [searchTerm, usuarios]);

  const handleToggleEstado = (usuario) => {
    setUpdatingId(usuario.id);
    const nuevoEstado = usuario.estado === 'ACTIVO' ? 'BLOQUEADO' : 'ACTIVO';
    adminUsuariosService.actualizarEstado(usuario.id, nuevoEstado)
      .then(() => {
        toast.success(`Usuario ${nuevoEstado === 'ACTIVO' ? 'activado' : 'bloqueado'} correctamente`);
        cargarUsuarios();
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'No se pudo actualizar el estado del usuario';
        toast.error(msg);
      })
      .finally(() => setUpdatingId(null));
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(null);

  const solicitarEliminar = (usuario) => {
    setUsuarioSeleccionado(usuario);
    setConfirmOpen(true);
  };

  const confirmarEliminar = () => {
    if (!usuarioSeleccionado) return;
    setDeletingId(usuarioSeleccionado.id);
    adminUsuariosService.eliminarUsuario(usuarioSeleccionado.id)
      .then(() => {
        toast.success(`Usuario ${usuarioSeleccionado.email} eliminado`);
        cargarUsuarios();
      })
      .catch((err) => {
        const msg = err.response?.data?.message || 'No se pudo eliminar el usuario';
        toast.error(msg);
      })
      .finally(() => {
        setDeletingId(null);
        setConfirmOpen(false);
        setUsuarioSeleccionado(null);
      });
  };

  const abrirCrear = () => {
    setEditando(null);
    setForm({ nombre: '', email: '', password: '', rol: 'CLIENTE', estado: 'ACTIVO' });
    setModalOpen(true);
  };

  const abrirEditar = (u) => {
    setEditando(u);
    setForm({
      nombre: u.nombre || '',
      email: u.email || '',
      password: '',          // no se edita password, queda vacío
      rol: u.rol || 'CLIENTE',
      estado: u.estado || 'ACTIVO',
    });
    setModalOpen(true);
  };

  const handleChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editando) {
        // actualizar: sólo nombre/email/estado
        await adminUsuariosService.actualizarUsuario(editando.id, {
          nombre: form.nombre,
          email: form.email,
          estado: form.estado,
        });
        toast.success('Usuario actualizado correctamente');
      } else {
        // crear: usar DTO de registro
        await adminUsuariosService.crearUsuario({
          nombre: form.nombre,
          email: form.email,
          password: form.password || 'password123',
          rol: form.rol,
        });
        toast.success('Usuario creado correctamente');
      }
      setModalOpen(false);
      cargarUsuarios();
    } catch (err) {
      toast.error('No se pudo guardar el usuario');
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="text-muted-foreground">Cargando usuarios...</span>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (error && usuarios.length === 0) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="p-6 bg-white rounded-xl border border-red-200 shadow-sm">
          <div className="flex flex-col items-center justify-center py-8 gap-4">
            <p className="text-red-700 font-medium">No se pudieron cargar los usuarios</p>
            <p className="text-sm text-red-600">{error}</p>
            <Button variant="outline" onClick={cargarUsuarios} className="border-red-200 text-red-700 hover:bg-red-100">
              Reintentar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="p-6 bg-white rounded-xl border border-border shadow-sm">
        {/* Header con botón crear */}
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-2xl font-semibold text-foreground">Gestionar Usuarios</h1>
          <Button onClick={abrirCrear}>Crear usuario</Button>
        </div>

        {/* Barra de búsqueda */}
        <div className="mb-4 flex items-center max-w-sm gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Error banner (if error but we have users loaded) */}
        {error && usuarios.length > 0 && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700 flex items-center justify-between">
            <span>{error}</span>
            <Button variant="link" size="sm" onClick={cargarUsuarios} className="text-red-700">
              Reintentar
            </Button>
          </div>
        )}

        <div className="overflow-x-auto hide-scrollbar border rounded-lg">
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
              {filteredUsuarios.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-3 py-8 text-center text-muted-foreground">
                    {searchTerm ? 'No se encontraron usuarios con ese criterio.' : 'No hay usuarios registrados.'}
                  </td>
                </tr>
              ) : (
                filteredUsuarios.map((u) => (
                  <tr key={u.id} className="border-t hover:bg-slate-50">
                    <td className="px-3 py-2">{u.id}</td>
                    <td className="px-3 py-2 font-medium">{u.nombre}</td>
                    <td className="px-3 py-2">{u.email}</td>
                    <td className="px-3 py-2">
                      <span className="px-2 py-1 rounded-full bg-slate-100 text-xs font-medium border border-slate-200">
                        {u.rol}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${u.estado === 'ACTIVO'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-red-50 text-red-700 border-red-200'
                        }`}>
                        {u.estado}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => abrirEditar(u)}
                        >
                          Editar
                        </Button>
                        <Button
                          variant={u.estado === 'ACTIVO' ? 'outline' : 'default'}
                          size="sm"
                          onClick={() => handleToggleEstado(u)}
                          disabled={updatingId === u.id}
                        >
                          {updatingId === u.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Actualizando...
                            </>
                          ) : (
                            u.estado === 'ACTIVO' ? 'Bloquear' : 'Activar'
                          )}
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => solicitarEliminar(u)}
                          disabled={deletingId === u.id || updatingId === u.id}
                        >
                          {deletingId === u.id ? (
                            <>
                              <Loader2 className="h-3 w-3 animate-spin mr-1" />
                              Eliminando...
                            </>
                          ) : (
                            'Eliminar'
                          )}
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Confirmación de eliminación */}
        <ConfirmDialog
          open={confirmOpen}
          title="Confirmar eliminación"
          message={usuarioSeleccionado
            ? `¿Seguro que deseas eliminar al usuario ${usuarioSeleccionado.nombre} (${usuarioSeleccionado.email})? Esta acción no se puede deshacer.`
            : ''
          }
          confirmText={deletingId ? 'Eliminando...' : 'Eliminar'}
          cancelText="Cancelar"
          onConfirm={confirmarEliminar}
          onCancel={() => { setConfirmOpen(false); setUsuarioSeleccionado(null); }}
        />

        {/* Modal Crear/Editar Usuario */}
        <Dialog open={modalOpen} onClose={() => setModalOpen(false)}>
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar usuario' : 'Crear usuario'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 px-6 py-4">
            <div>
              <label className="text-sm font-medium">Nombre</label>
              <Input
                value={form.nombre}
                onChange={(e) => handleChange('nombre', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                required
              />
            </div>

            {!editando && (
              <div>
                <label className="text-sm font-medium">Contraseña inicial</label>
                <Input
                  type="password"
                  placeholder="password123 (por defecto si lo dejas vacío)"
                  value={form.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                />
              </div>
            )}

            <div className="flex gap-4">
              <div className="flex-1">
                <label className="text-sm font-medium">Rol</label>
                <Select
                  value={form.rol}
                  onChange={(e) => handleChange('rol', e.target.value)}
                  disabled={!!editando}
                >
                  <option value="CLIENTE">CLIENTE</option>
                  <option value="PROVEEDOR">PROVEEDOR</option>
                </Select>
              </div>

              <div className="flex-1">
                <label className="text-sm font-medium">Estado</label>
                <Select
                  value={form.estado}
                  onChange={(e) => handleChange('estado', e.target.value)}
                >
                  <option value="ACTIVO">ACTIVO</option>
                  <option value="BLOQUEADO">BLOQUEADO</option>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">
                {editando ? 'Guardar cambios' : 'Crear usuario'}
              </Button>
            </DialogFooter>
          </form>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminUsuariosPage;