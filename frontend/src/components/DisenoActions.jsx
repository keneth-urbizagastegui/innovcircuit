import React, { useState, useEffect } from 'react';
import { Heart, Download } from 'lucide-react';
import disenoService from '../services/disenoService';
import { useAuth } from '../context/AuthContext';
import { toast } from 'sonner';

const DisenoActions = ({ disenoId, initialLikes, initialDownloads, size = 12 }) => {
  const { isAuthenticated, user } = useAuth();
  const [likes, setLikes] = useState(initialLikes);
  const [downloads, setDownloads] = useState(initialDownloads);
  const [isLiked, setIsLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Verificar si el usuario ya dio like (simulado con localStorage por ahora)
  useEffect(() => {
    if (isAuthenticated()) {
      const likedDesigns = JSON.parse(localStorage.getItem('likedDesigns') || '[]');
      setIsLiked(likedDesigns.includes(disenoId));
    }
  }, [disenoId, isAuthenticated]);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated()) {
      toast.error('Debes iniciar sesión para dar me gusta');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      await disenoService.darLike(disenoId);
      
      // Actualizar estado local
      const newLikedState = !isLiked;
      setLikes(prev => newLikedState ? prev + 1 : prev - 1);
      setIsLiked(newLikedState);
      
      // Guardar en localStorage
      const likedDesigns = JSON.parse(localStorage.getItem('likedDesigns') || '[]');
      if (newLikedState) {
        likedDesigns.push(disenoId);
      } else {
        const index = likedDesigns.indexOf(disenoId);
        if (index > -1) likedDesigns.splice(index, 1);
      }
      localStorage.setItem('likedDesigns', JSON.stringify(likedDesigns));
      
      toast.success(newLikedState ? '¡Me gusta agregado!' : 'Me gusta eliminado');
    } catch (error) {
      toast.error('No se pudo dar me gusta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated()) {
      toast.error('Debes iniciar sesión para descargar');
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    try {
      // Llamar al servicio de descarga
      const response = await disenoService.descargar(disenoId);
      
      // Incrementar contador local
      setDownloads(prev => prev + 1);
      
      // Simular descarga del archivo (en producción esto vendría del backend)
      // Por ahora, mostramos un mensaje de éxito
      toast.success('¡Descarga completada!');
      
      // En un caso real, aquí procesarías el archivo:
      // const blob = new Blob([response.data]);
      // const url = window.URL.createObjectURL(blob);
      // const link = document.createElement('a');
      // link.href = url;
      // link.download = `diseno_${disenoId}.zip`;
      // link.click();
      // window.URL.revokeObjectURL(url);
      
    } catch (error) {
      toast.error('No se pudo completar la descarga');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-3 text-slate-500">
      {/* Botón de Me Gusta */}
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center gap-1.5 transition-all duration-200 hover:scale-110 rounded-full px-2 py-1 ${
          isLiked 
            ? 'text-red-500 bg-red-50 hover:bg-red-100' 
            : 'hover:text-red-500 hover:bg-red-50'
        } ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        title={isLiked ? 'Quitar me gusta' : 'Dar me gusta'}
      >
        <Heart 
          size={size} 
          className={`transition-all ${isLiked ? 'fill-current' : ''} ${
            isLoading && !isLiked ? 'animate-pulse' : ''
          }`}
        />
        <span className="text-xs font-bold">{likes}</span>
      </button>

      {/* Botón de Descargar */}
      <button
        onClick={handleDownload}
        disabled={isLoading}
        className={`flex items-center gap-1.5 transition-all duration-200 hover:scale-110 rounded-full px-2 py-1 hover:text-blue-500 hover:bg-blue-50 ${
          isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        }`}
        title="Descargar diseño"
      >
        <Download 
          size={size} 
          className={`transition-all ${
            isLoading ? 'animate-pulse' : ''
          }`}
        />
        <span className="text-xs font-bold">{downloads}</span>
      </button>
    </div>
  );
};

export default DisenoActions;