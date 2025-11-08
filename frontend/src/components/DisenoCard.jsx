import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Download } from 'lucide-react';
import { Card, CardHeader, CardContent, CardFooter, CardTitle } from './ui/card';
import { formatCurrencyPEN } from '../utils/currency';
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
    <Card className="flex h-full flex-col transition-shadow hover:shadow-md">
      {/* Imagen con overlay de precio */}
      <Link to={`/diseno/${diseno.id}`} className="block">
        <div className="relative">
          <img
            src={imageSrc}
            onError={onErrorSetSrc(FALLBACK_CARD_IMAGE)}
            loading="lazy"
            alt={diseno.nombre}
            className="w-full aspect-[4/3] object-cover rounded-t-lg"
          />
          <div className="absolute right-2 top-2 rounded-md bg-white/90 px-2 py-1 text-sm font-semibold text-slate-900 shadow">
            {isGratis ? 'Gratis' : formatCurrencyPEN(diseno.precio || 0)}
          </div>
        </div>
      </Link>

      <CardContent className="py-3">
        <div className="mb-2 flex items-center gap-2">
          {popular && <Badge variant="secondary">Popular</Badge>}
          {diseno?.nombreCategoria && (
            <Badge variant="outline">{diseno.nombreCategoria}</Badge>
          )}
        </div>
        <CardTitle className="text-base">
          <Link to={`/diseno/${diseno.id}`} className="hover:underline">
            {diseno.nombre}
          </Link>
        </CardTitle>
      </CardContent>

      <CardFooter className="mt-auto flex items-center justify-between">
        <div className="flex items-center">
          <Avatar className="mr-2" src={avatarSrc} alt={proveedor.nombre}>
            {proveedor?.nombre?.[0] ?? 'P'}
          </Avatar>
          <Link to={`/store/${proveedor.id}`} className="text-sm text-slate-700 hover:underline">
            {proveedor.nombre}
          </Link>
        </div>
        <div className="flex items-center gap-3 text-slate-600">
          <div className="flex items-center gap-1">
            <Heart size={16} className="text-slate-500" />
            <span className="text-sm">{diseno.likesCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <Download size={16} className="text-slate-500" />
            <span className="text-sm">{diseno.descargasCount}</span>
          </div>
          <Button as={Link} to={`/diseno/${diseno.id}`} variant="outline" size="sm">
            Ver diseño
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default DisenoCard;