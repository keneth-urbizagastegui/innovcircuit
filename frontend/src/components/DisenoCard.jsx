import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardTitle } from './ui/card';
import { formatCurrencyPEN } from '../utils/currency';
import { Badge } from './ui/badge';
import { Avatar } from './ui/avatar';
import { getDesignImage, FALLBACK_CARD_IMAGE, onErrorSetSrc, resolveAvatarUrl } from '../utils/imageUtils';
import DisenoActions from './DisenoActions';

const DisenoCard = ({ diseno }) => {
  const proveedor = diseno.proveedor || { id: 0, nombre: 'N/A', avatarUrl: '' };
  const avatarSrc = resolveAvatarUrl(proveedor.avatarUrl, proveedor.nombre, 32, { rounded: true });
  const imageSrc = getDesignImage(diseno);
  const isGratis = Boolean(diseno.gratuito) || Number(diseno.precio || 0) === 0;
  const popular = Number(diseno.descargasCount || 0) >= 25;

  return (
    <Card className="flex h-full flex-col transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group">
      {/* Imagen y Precio */}
      <Link to={`/diseno/${diseno.id}`} className="block relative overflow-hidden rounded-t-lg">
        <img
          src={imageSrc}
          alt={diseno.nombre}
          loading="lazy"
          className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105"
          onError={onErrorSetSrc(FALLBACK_CARD_IMAGE)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute right-2 top-2 rounded-lg bg-white/95 backdrop-blur-sm px-2 py-1 text-xs font-bold text-slate-900 shadow-md">
          {isGratis ? 'Gratis' : formatCurrencyPEN(diseno.precio || 0)}
        </div>
        {popular && (
          <div className="absolute left-2 top-2 rounded-lg bg-gradient-to-r from-amber-400 to-orange-500 px-2 py-1 text-xs font-bold text-white shadow-md">
            Popular
          </div>
        )}
      </Link>

      {/* Contenido de texto */}
      <CardContent className="flex-grow p-4">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          {diseno?.nombreCategoria && (
            <Badge variant="outline" className="rounded-full px-2 py-0.5 text-xs border-slate-200 text-slate-600">
              {diseno.nombreCategoria}
            </Badge>
          )}
        </div>
        <CardTitle className="text-base font-bold text-slate-800 leading-tight">
          <Link to={`/diseno/${diseno.id}`} className="hover:text-teal-600 transition-colors line-clamp-2">
            {diseno.nombre}
          </Link>
        </CardTitle>
      </CardContent>

      {/* Footer de la tarjeta */}
      <CardFooter className="p-4 pt-0">
        <div className="flex items-center justify-between w-full min-w-0 gap-2">
          {/* Proveedor */}
          <Link to={`/store/${proveedor.id}`} className="flex items-center gap-2 group/proveedor min-w-0 flex-1">
            <Avatar className="h-6 w-6 ring-2 ring-white shadow-sm flex-shrink-0" src={avatarSrc} alt={proveedor.nombre}>
              {proveedor?.nombre?.[0] ?? 'P'}
            </Avatar>
            <span className="text-sm text-slate-600 group-hover/proveedor:text-teal-600 group-hover/proveedor:underline transition-colors truncate font-medium">
              {proveedor.nombre}
            </span>
          </Link>
          {/* Acciones interactivas */}
          <DisenoActions
            disenoId={diseno.id}
            initialLikes={diseno.likesCount}
            initialDownloads={diseno.descargasCount}
            size={12}
          />
        </div>
      </CardFooter>
    </Card>
  );
};

export default DisenoCard;
