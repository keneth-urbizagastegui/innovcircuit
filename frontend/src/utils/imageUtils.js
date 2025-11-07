// Utilidades para resolver URLs de imágenes y manejar fallbacks

export const BACKEND_BASE_URL = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:8080';

// Generadores de placeholders locales (SVG en data URI) para evitar depender de servicios externos
function svgDataUri(svg) {
  const encoded = encodeURIComponent(svg)
    .replace(/'/g, '%27')
    .replace(/\(/g, '%28')
    .replace(/\)/g, '%29');
  return `data:image/svg+xml;utf8,${encoded}`;
}

function makeImagePlaceholder(width = 600, height = 400, text = 'Imagen no disponible') {
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#f3f4f6"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#374151" font-family="sans-serif" font-size="${Math.max(14, Math.floor(Math.min(width, height) / 16))}">${text}</text>
  </svg>`;
  return svgDataUri(svg);
}

function makeAvatarPlaceholder(size = 150, text = 'U') {
  const radius = Math.floor(size / 2);
  const fontSize = Math.max(12, Math.floor(size / 2.5));
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}">
    <circle cx="${radius}" cy="${radius}" r="${radius}" fill="#e5e7eb" />
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="#111827" font-family="sans-serif" font-size="${fontSize}" font-weight="bold">${text}</text>
  </svg>`;
  return svgDataUri(svg);
}

export const FALLBACK_IMAGE = makeImagePlaceholder(600, 400, 'Imagen no disponible');
export const FALLBACK_CARD_IMAGE = makeImagePlaceholder(300, 200, 'Sin Imagen');
export const FALLBACK_AVATAR = makeAvatarPlaceholder(150, 'U');

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
    background: opts.background || 'e5e7eb', // gris claro minimalista
    color: opts.color || '111827', // texto gris oscuro
    rounded: (opts.rounded ?? true) ? 'true' : 'false',
    bold: (opts.bold ?? false) ? 'true' : 'false',
    format: opts.format || 'svg',
  });
  return `https://ui-avatars.com/api/?${params.toString()}`;
}

// Resuelve URL de avatar; si no hay, usa iniciales del nombre con UI Avatars
export function resolveAvatarUrl(avatarUrl, name, size = 64, opts = {}) {
  const resolved = resolveImageUrl(avatarUrl);
  if (resolved) return resolved;
  return buildUiAvatar(name, size, { rounded: true, background: 'e5e7eb', color: '111827', format: 'svg', ...opts });
}