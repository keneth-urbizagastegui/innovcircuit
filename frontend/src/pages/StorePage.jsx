import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import proveedorService from '../services/proveedorService';
import disenoService from '../services/disenoService';
import { Avatar } from '../components/ui/avatar';
import { Loader2, ExternalLink } from 'lucide-react';
import { buildUiAvatar, resolveImageUrl, FALLBACK_IMAGE, onErrorSetSrc } from '../utils/imageUtils';
import DisenoCard from '../components/DisenoCard';

const StorePage = () => {
  const { id } = useParams();
  const [proveedor, setProveedor] = useState(null);
  const [disenos, setDisenos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    setError('');

    const loadData = async () => {
      try {
        const provRes = await proveedorService.getProveedorById(id);
        setProveedor(provRes.data);
        const disenosRes = await disenoService.listarDisenosAprobados('');
        const misDisenos = (disenosRes.data || []).filter((d) => d.proveedor?.id == id);
        setDisenos(misDisenos);
      } catch (_) {
        setError('Error al cargar la tienda del proveedor.');
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Cargando tienda...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-600">{error}</div>;
  }

  if (!proveedor) {
    return <div>Proveedor no encontrado.</div>;
  }

  const avatarSrc = proveedor.avatarUrl
    ? resolveImageUrl(proveedor.avatarUrl)
    : buildUiAvatar(proveedor.nombre, 96, { rounded: true });
  const bannerSrc = resolveImageUrl(proveedor.bannerUrl) || FALLBACK_IMAGE;

  return (
    <div className="space-y-6">
      <div className="relative">
        <img
          src={bannerSrc}
          onError={onErrorSetSrc(FALLBACK_IMAGE)}
          alt="Banner de tienda"
          className="h-48 w-full rounded-lg object-cover"
        />
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-4 -mt-16 z-10 relative px-4">
        <Avatar src={avatarSrc} alt={proveedor.nombre} className="h-32 w-32 border-4 border-white shadow-lg" />
        <div className="pt-16 sm:pt-0 text-center sm:text-left">
          <h1 className="text-3xl font-bold">{proveedor.nombre}</h1>
          {proveedor.sitioWebUrl && (
            <a
              href={proveedor.sitioWebUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary hover:underline flex items-center justify-center sm:justify-start gap-1"
            >
              {proveedor.sitioWebUrl} <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <h2 className="text-xl font-semibold mb-2">Sobre {proveedor.nombre}</h2>
          <p className="text-sm text-gray-700 whitespace-pre-wrap">
            {proveedor.descripcionTienda || 'Este proveedor aún no ha añadido una descripción.'}
          </p>
        </div>
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-2">Diseños de {proveedor.nombre}</h2>
          {disenos.length === 0 ? (
            <p className="text-gray-600">Este proveedor no tiene diseños aprobados.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {disenos.map((d) => (
                <DisenoCard key={d.id} diseno={d} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StorePage;