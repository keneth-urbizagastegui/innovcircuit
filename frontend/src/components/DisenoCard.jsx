import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Download } from 'lucide-react';
import { Card, CardContent, CardFooter, CardTitle } from './ui/card';
import { formatCurrencyPEN } from '../utils/currency';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { resolveImageUrl, resolveAvatarUrl, FALLBACK_CARD_IMAGE, onErrorSetSrc } from '../utils/imageUtils';

const DisenoCard = ({ diseno }) => {
  const proveedor = diseno.proveedor || { id: 0, nombre: 'N/A', avatarUrl: '' };
  const avatarSrc = resolveAvatarUrl(proveedor.avatarUrl, proveedor.nombre, 32, { rounded: true });
  const imageSrc = resolveImageUrl(diseno.imagenUrl) || FALLBACK_CARD_IMAGE;
  const isGratis = Boolean(diseno.gratuito) || Number(diseno.precio || 0) === 0;
  const popular = Number(diseno.descargasCount || 0) >= 25;

  return (
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      {/* Imagen y Precio */}
      <Link to={`/diseno/${diseno.id}`} className="block relative">
        <img
          src={imageSrc}
          alt={diseno.nombre}
          loading="lazy"
          className="w-full aspect-[4/3] object-cover rounded-t-lg"
          onError={onErrorSetSrc(FALLBACK_CARD_IMAGE)}
        />
        <div className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-sm font-semibold text-slate-900 shadow">
          {isGratis ? 'Gratis' : formatCurrencyPEN(diseno.precio || 0)}
        </div>
      </Link>

      {/* Contenido de texto */}
      <CardContent className="flex-grow p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {popular && <Badge variant="secondary">Popular</Badge>}
          {diseno?.nombreCategoria && (
            <Badge variant="outline">{diseno.nombreCategoria}</Badge>
          )}
        </div>
        <CardTitle className="text-base font-bold">
          <Link to={`/diseno/${diseno.id}`} className="hover:underline line-clamp-2">
            {diseno.nombre}
          </Link>
        </CardTitle>
      </CardContent>

      {/* Footer de la tarjeta */}
      <CardFooter className="flex items-center justify-between p-4 pt-0">
        {/* Proveedor */}
        <Link to={`/store/${proveedor.id}`} className="flex items-center gap-2 group">
          <Avatar className="h-6 w-6" src={avatarSrc} alt={proveedor.nombre}>
            {proveedor?.nombre?.[0] ?? 'P'}
          </Avatar>
          <span className="text-sm text-muted-foreground group-hover:underline line-clamp-1">
            {proveedor.nombre}
          </span>
        </Link>
        {/* Estadísticas */}
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="flex items-center gap-1">
            <Heart size={16} />
            <span className="text-sm font-medium">{diseno.likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={16} />
            <span className="text-sm font-medium">{diseno.descargasCount}</span>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DisenoCard;