import React from 'react'
import { Link } from 'react-router-dom'
import { Heart, Download } from 'lucide-react'
import { Button } from './ui/button'
import { Avatar } from './ui/avatar'
import { Badge } from './ui/badge'
import { getDesignImage, FALLBACK_CARD_IMAGE, onErrorSetSrc } from '../utils/imageUtils'

function DesignCard({ design }) {
  const getProveedorName = () => {
    if (design?.proveedor?.nombre) return design.proveedor.nombre
    return 'Proveedor Desconocido'
  }

  const precio = design?.precio ?? design?.price
  const proveedorInicial = getProveedorName().charAt(0).toUpperCase()

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-lg border bg-card text-card-foreground shadow-sm">
      {/* Imagen del diseño */}
      <div className="relative h-48 w-full overflow-hidden bg-muted">
        <img
          src={getDesignImage(design)}
          alt={design?.nombre || 'Diseño'}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
          onError={onErrorSetSrc(FALLBACK_CARD_IMAGE)}
        />

        {/* Precio flotante */}
        {precio != null && (
          <div className="absolute right-2 top-2 rounded-md bg-primary px-2 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
            {precio}
          </div>
        )}
      </div>

      {/* Contenido de la tarjeta */}
      <div className="flex flex-1 flex-col p-4">
        {/* Etiquetas de popularidad y categoría */}
        <div className="mb-2 flex flex-wrap gap-1">
          <Badge variant="secondary">Popular</Badge>
          {design?.categoria?.nombre && (
            <Badge variant="outline">{design.categoria.nombre}</Badge>
          )}
        </div>

        {/* Nombre del diseño */}
        <h3 className="mb-2 text-lg font-bold leading-tight text-foreground line-clamp-2">
          {design?.nombre || 'Diseño sin nombre'}
        </h3>

        {/* Descripción (truncada) */}
        <p className="mb-3 flex-grow text-sm text-muted-foreground line-clamp-3">
          {design?.descripcion || 'Sin descripción disponible.'}
        </p>

        {/* Información del proveedor */}
        <div className="mb-3 flex items-center gap-2 text-sm text-muted-foreground">
          <Avatar className="h-6 w-6" src={design?.proveedor?.avatarUrl} alt={getProveedorName()}>
            <span className="font-medium">{proveedorInicial}</span>
          </Avatar>
          <span>Proveedor {getProveedorName()}</span>
        </div>

        {/* Estadísticas (Likes y Descargas) */}
        <div className="mb-4 flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart className="h-4 w-4" />
            <span>{design?.likesCount ?? 0}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download className="h-4 w-4" />
            <span>{design?.descargasCount ?? design?.downloadsCount ?? 0}</span>
          </div>
        </div>

        {/* Botón Ver Diseño */}
        <Button as={Link} to={design?.id ? `/diseno/${design.id}` : '#'} className="w-full">
          Ver diseño
        </Button>
      </div>
    </div>
  )
}

export default DesignCard