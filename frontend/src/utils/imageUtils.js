// Utilidades para resolver URLs de imágenes y manejar fallbacks

export const BACKEND_BASE_URL = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:8080';

export const FALLBACK_IMAGE = 'https://placehold.co/600x400?text=Imagen+no+disponible';
export const FALLBACK_CARD_IMAGE = 'https://placehold.co/300x200?text=Sin+Imagen';
export const FALLBACK_AVATAR = 'https://placehold.co/150x150?text=User';

// Normaliza URLs que vienen relativas desde el backend (p.ej., "/uploads/...")
export function resolveImageUrl(url) {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('/uploads')) {
    return `${BACKEND_BASE_URL}${trimmed}`;
  }
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('data:')) {
    return trimmed;
  }
  // Cualquier otra ruta se devuelve tal cual
  return trimmed;
}

// Handler para asignar un fallback cuando la imagen falla
export function onErrorSetSrc(fallbackUrl) {
  return (e) => {
    try {
      if (e && e.target) {
        e.target.src = fallbackUrl;
      }
    } catch (_) {
      // no-op
    }
  };
}

// Genera un avatar por iniciales usando el servicio gratuito UI Avatars
// Docs: https://ui-avatars.com/ (sin registro, caché CDN)
export function buildUiAvatar(name = 'Usuario', size = 64, opts = {}) {
  const params = new URLSearchParams({
    name: name || 'Usuario',
    size: String(size),
    background: opts.background || 'random',
    rounded: (opts.rounded ?? true) ? 'true' : 'false',
    bold: (opts.bold ?? false) ? 'true' : 'false'
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

// Resuelve URL de avatar; si no hay, usa iniciales del nombre con UI Avatars
export function resolveAvatarUrl(avatarUrl, name, size = 64, opts = {}) {
  const resolved = resolveImageUrl(avatarUrl);
  if (resolved) return resolved;
  return buildUiAvatar(name, size, opts);
}