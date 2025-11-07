import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Download } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { Button } from './ui/button';
import { resolveImageUrl, resolveAvatarUrl, FALLBACK_CARD_IMAGE, FALLBACK_AVATAR, onErrorSetSrc } from '../utils/imageUtils';

const DisenoCard = ({ diseno }) => {
  // Fallback por si la API aún no envía el objeto proveedor
  const proveedor = diseno.proveedor || { nombre: 'N/A', avatarUrl: '' };
  const avatarSrc = resolveAvatarUrl(proveedor.avatarUrl, proveedor.nombre, 32, { rounded: true });
  const imageSrc = resolveImageUrl(diseno.imagenUrl) || FALLBACK_CARD_IMAGE;
  const isGratis = Boolean(diseno.gratuito) || Number(diseno.precio || 0) === 0;
  const popular = Number(diseno.descargasCount || 0) >= 25; // umbral simple
  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="flex items-center gap-2 py-3">
        <Avatar src={avatarSrc} alt={proveedor.nombre}>
          {proveedor?.nombre?.[0] ?? 'P'}
        </Avatar>
        <div className="flex-1 text-sm text-slate-600">{proveedor.nombre}</div>
        {popular && <Badge variant="secondary">Popular</Badge>}
      </CardHeader>

      <Link to={`/diseno/${diseno.id}`} className="block">
        <img
          src={imageSrc}
          onError={onErrorSetSrc(FALLBACK_CARD_IMAGE)}
          loading="lazy"
          alt={diseno.nombre}
          className="h-56 w-full object-cover"
        />
        <CardContent className="py-3">
          <CardTitle className="text-base">{diseno.nombre}</CardTitle>
          {diseno?.nombreCategoria && (
            <p className="text-xs text-slate-500">{diseno.nombreCategoria}</p>
          )}
        </CardContent>
      </Link>

      <CardFooter className="mt-auto flex items-center justify-between">
        <div className="flex items-center gap-3 text-slate-600">
          <div className="flex items-center gap-1">
            <Heart size={16} className="text-slate-500" />
            <span className="text-sm">{diseno.likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={16} className="text-slate-500" />
            <span className="text-sm">{diseno.descargasCount}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={isGratis ? 'text-green-600 font-semibold' : 'text-sky-600 font-semibold'}>
            {isGratis ? 'Gratis' : `$${Number(diseno.precio || 0).toFixed(2)}`}
          </span>
          <Button as={Link} to={`/diseno/${diseno.id}`} variant="outline" size="sm">
            Ver más
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DisenoCard;