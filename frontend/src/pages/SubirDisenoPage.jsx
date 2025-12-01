import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import categoriaService from '../services/categoriaService';
import apiClient from '../services/api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Select } from '../components/ui/select';

const SubirDisenoPage = () => {
  const { user } = useAuth();
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [precio, setPrecio] = useState(0.0);
  const [gratuito, setGratuito] = useState(false);
  const [categoriaId, setCategoriaId] = useState('');
  const [imagenFile, setImagenFile] = useState(null);
  const [esquematicoFile, setEsquematicoFile] = useState(null);
  const [imagenesFiles, setImagenesFiles] = useState([]);

  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  // Cargar categorías para el dropdown
  useEffect(() => {
    categoriaService
      .listarCategorias()
      .then((response) => setCategorias(response.data))
      .catch(() => setError('No se pudieron cargar las categorías.'));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    if (!imagenFile || !esquematicoFile) {
      setError('Debes subir ambos archivos (imagen y esquemático).');
      setLoading(false);
      return;
    }

    // 1. Crear el DTO (JSON como string)
    const disenoDTO = JSON.stringify({
      nombre,
      descripcion,
      precio: gratuito ? 0 : precio,
      gratuito,
      categoriaId,
    });

    // 2. Crear el FormData
    const formData = new FormData();
    formData.append('disenoDTO', disenoDTO);
    formData.append('imagenFile', imagenFile);
    formData.append('esquematicoFile', esquematicoFile);
    if (imagenesFiles && imagenesFiles.length) {
      Array.from(imagenesFiles).forEach((f) => {
        formData.append('imagenesFiles', f);
      });
    }

    try {
      // 3. Enviar con apiClient (el interceptor añade el token)
      // Importante: NO establecer manualmente Content-Type para FormData, axios lo gestiona con boundary
      const response = await apiClient.post('/disenos', formData);

      setSuccess(`¡Diseño '${response.data.nombre}' subido! Estado: ${response.data.estado}.`);
      toast.success(`Diseño '${response.data.nombre}' subido`);
      setLoading(false);
      setTimeout(() => navigate('/'), 2000);
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Error al subir el diseño.';
      setError(msg);
      toast.error(msg);
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <form onSubmit={handleSubmit} className="max-w-[600px] mx-auto p-6 bg-white rounded-xl border border-border shadow-sm space-y-4">
      <h1 className="text-2xl font-semibold">Subir Nuevo Diseño</h1>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>
      )}
      {success && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">{success}</div>
      )}

      <div>
        <label className="block text-sm font-medium mb-1">Nombre del Diseño</label>
        <Input value={nombre} onChange={(e) => setNombre(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Descripción</label>
        <Textarea rows={8} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} required />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Precio</label>
        <Input type="number" value={precio} onChange={(e) => setPrecio(parseFloat(e.target.value))} required disabled={gratuito} />
      </div>

      <div className="flex items-center gap-2">
        <input
          id="gratuito"
          type="checkbox"
          checked={gratuito}
          onChange={(e) => {
            const isFree = e.target.checked;
            setGratuito(isFree);
            if (isFree) setPrecio(0);
          }}
          className="h-4 w-4 rounded border-slate-300"
        />
        <label htmlFor="gratuito" className="text-sm">Es gratuito (precio será 0)</label>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Categoría</label>
        <Select value={categoriaId} onChange={(e) => setCategoriaId(e.target.value)} required>
          <option value="" disabled>Seleccione una categoría</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nombre}</option>
          ))}
        </Select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Imagen Principal (PNG/JPG)</label>
        <div className="flex items-center gap-2">
          <Button as="label" variant="outline" className="cursor-pointer">
            {imagenFile ? `Imagen: ${imagenFile.name}` : 'Seleccionar archivo'}
            <input type="file" accept="image/*" hidden onChange={(e) => setImagenFile(e.target.files[0])} />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Galería de Imágenes (opcional, múltiples)</label>
        <div className="flex items-center gap-2">
          <Button as="label" variant="outline" className="cursor-pointer">
            {imagenesFiles && imagenesFiles.length ? `${imagenesFiles.length} imágenes seleccionadas` : 'Seleccionar imágenes'}
            <input type="file" accept="image/*" multiple hidden onChange={(e) => setImagenesFiles(e.target.files)} />
          </Button>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Archivo de Diseño (ZIP/RAR)</label>
        <div className="flex items-center gap-2">
          <Button as="label" variant="outline" className="cursor-pointer">
            {esquematicoFile ? `Esquemático: ${esquematicoFile.name}` : 'Seleccionar archivo'}
            <input type="file" accept=".zip,.rar" hidden onChange={(e) => setEsquematicoFile(e.target.files[0])} />
          </Button>
        </div>
      </div>

      <div className="pt-2">
        <Button type="submit" className="w-full" loading={loading}>
          Subir Diseño
        </Button>
      </div>
      </form>
    </div>
  );
};

export default SubirDisenoPage;
