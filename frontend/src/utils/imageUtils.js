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

export function categoryPlaceholderImage(nombreCategoria) {
  const key = String(nombreCategoria || '').toLowerCase();
  const map = {
    // Microcontroladores y desarrollo
    'microcontroladores': 'https://images.unsplash.com/photo-1553406830-ef2513450d76?q=80&w=1200&auto=format&fit=crop',
    'microcontrolador': 'https://images.unsplash.com/photo-1553406830-ef2513450d76?q=80&w=1200&auto=format&fit=crop',

    // Sensores
    'sensores': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    'sensor': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',

    // IoT y Hogar Inteligente
    'iot': 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=1200&auto=format&fit=crop',
    'hogar inteligente': 'https://images.unsplash.com/photo-1558002038-109155714d97?q=80&w=1200&auto=format&fit=crop',
    'domótica': 'https://images.unsplash.com/photo-1558002038-109155714d97?q=80&w=1200&auto=format&fit=crop',

    // Audio y Sonido
    'audio': 'https://images.unsplash.com/photo-1519671482749-f3b1c73c7343?q=80&w=1200&auto=format&fit=crop',
    'sonido': 'https://images.unsplash.com/photo-1519671482749-f3b1c73c7343?q=80&w=1200&auto=format&fit=crop',
    'altavoces': 'https://images.unsplash.com/photo-1545454675-3531b543be5d?q=80&w=1200&auto=format&fit=crop',
    'amplificadores': 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=1200&auto=format&fit=crop',

    // Fuentes y energía
    'fuentes de poder': 'https://images.unsplash.com/photo-1617759825696-2753c4782382?q=80&w=1200&auto=format&fit=crop',
    'alimentación': 'https://images.unsplash.com/photo-1617759825696-2753c4782382?q=80&w=1200&auto=format&fit=crop',
    'baterías': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?q=80&w=1200&auto=format&fit=crop',

    // Robots y automatización
    'robots': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop',
    'robótica': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop',
    'automatización': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop',

    // Robots y Drones combinado
    'robots y drones': 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=1200&auto=format&fit=crop',

    // Drones
    'drones': 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1200&auto=format&fit=crop',
    'drone': 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=1200&auto=format&fit=crop',

    // Instrumentación
    'instrumentación': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
    'instrumentos': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
    'medición': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',

    // Comunicaciones
    'comunicaciones': 'https://images.unsplash.com/photo-1512446816042-444d641267d4?q=80&w=1200&auto=format&fit=crop',
    'comunicación': 'https://images.unsplash.com/photo-1512446816042-444d641267d4?q=80&w=1200&auto=format&fit=crop',
    'wireless': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop',

    // Iluminación LED
    'iluminación': 'https://images.unsplash.com/photo-1565814629029-57953324ca85?q=80&w=1200&auto=format&fit=crop',
    'iluminación led': 'https://images.unsplash.com/photo-1565814629029-57953324ca85?q=80&w=1200&auto=format&fit=crop',
    'led': 'https://images.unsplash.com/photo-1565814629029-57953324ca85?q=80&w=1200&auto=format&fit=crop',
    'leds': 'https://images.unsplash.com/photo-1565814629029-57953324ca85?q=80&w=1200&auto=format&fit=crop',

    // Proyectos educativos
    'educativos': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
    'proyectos educativos': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
    'educación': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',
    'didácticos': 'https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=1200&auto=format&fit=crop',

    // Electrónica DIY
    'electrónica diy': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
    'electronica diy': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
    'diy': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',
    'makers': 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?q=80&w=1200&auto=format&fit=crop',

    // Impresión 3D
    'impresión 3d': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop',
    '3d printing': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop',
    'impresoras 3d': 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?q=80&w=1200&auto=format&fit=crop',

    // Componentes generales
    'componentes': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    'electrónica': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    'electronica': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
    'circuitos': 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
  };
  const matchedKey = Object.keys(map).find(k => key.includes(k));
  const url = matchedKey ? map[matchedKey] : null;
  return url || makeImagePlaceholder(300, 200, nombreCategoria ? nombreCategoria : 'Diseño');
}

/**
 * Decide la mejor imagen para un diseño.
 * Prioridad:
 * 1) imagen subida en `imagenesUrls` o `imagenUrl`
 * 2) coincidencia por keywords en nombre/descripcion
 * 3) placeholder por categoría
 * 4) FALLBACK_CARD_IMAGE
 */
export function getDesignImage(diseno) {
  // 1) Obtener la primera imagen válida del diseño
  let rawUrl = null;
  if (Array.isArray(diseno?.imagenesUrls) && diseno.imagenesUrls.length > 0) {
    rawUrl = diseno.imagenesUrls[0];
  } else if (diseno?.imagenUrl) {
    rawUrl = diseno.imagenUrl;
  }

  const resolvedUrl = resolveImageUrl(rawUrl);
  if (resolvedUrl) {
    return resolvedUrl;
  }

  // 2) Si no hay imagen, buscar por keywords en nombre/descripcion/categoria
  const haystack = `${diseno?.nombre || ''} ${diseno?.descripcion || ''} ${diseno?.nombreCategoria || ''}`.toLowerCase();

  // Reglas de keyword -> URL de imagen de stock
  const keywordRules = [
    // Arduino y placas de desarrollo
    { regex: /arduino|nano|uno|mega|atmega|avr/, url: 'https://images.unsplash.com/photo-1553406830-ef2513450d76?q=80&w=600&auto=format&fit=crop' },

    // ESP32/ESP8266 y WiFi/BLE
    { regex: /esp32|esp8266|wifi|ble|bluetooth|wemos|nodemcu/, url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?q=80&w=600&auto=format&fit=crop' },

    // Raspberry Pi
    { regex: /raspberry|pi\s*\d|rpi|raspbian/, url: 'https://images.unsplash.com/photo-1629292605813-a21ff7fc5a3a?q=80&w=600&auto=format&fit=crop' },

    // Sensores
    { regex: /sensor|temperatura|humedad|gas|ultraso|pir|movimiento|proximity/, url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop' },

    // Audio y amplificadores
    { regex: /amplificador|audio|voz|sintetizador|hi-?fi|speaker|altavoz|sonido/, url: 'https://images.unsplash.com/photo-1519671482749-f3b1c73c7343?q=80&w=600&auto=format&fit=crop' },

    // LEDs y iluminación
    { regex: /led|neopixel|ws2812|matriz|iluminaci[oó]n|rgb|tira/, url: 'https://images.unsplash.com/photo-1565814629029-57953324ca85?q=80&w=600&auto=format&fit=crop' },

    // Fuentes de poder
    { regex: /fuente|power\s*supply|conmutada|regulador|voltaje|corriente|cargador/, url: 'https://images.unsplash.com/photo-1617759825696-2753c4782382?q=80&w=600&auto=format&fit=crop' },

    // Robots y servos
    { regex: /robot|servo|motor|stepper|actuador|brazo|mec[aá]nico/, url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?q=80&w=600&auto=format&fit=crop' },

    // Drones y cuadricópteros
    { regex: /drone|cuadric[oó]ptero|quadcopter|vuelo|propela|h[eé]lice/, url: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=600&auto=format&fit=crop' },

    // IoT y domótica
    { regex: /iot|hogar\s*inteligente|dom[oó]tica|smart\s*home|automatizaci[oó]n/, url: 'https://images.unsplash.com/photo-1558002038-109155714d97?q=80&w=600&auto=format&fit=crop' },

    // Comunicaciones RF
    { regex: /rf|radio|lora|zigbee|nrf|transmisor|receptor|antena/, url: 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=600&auto=format&fit=crop' },

    // Displays y pantallas
    { regex: /display|lcd|oled|tft|pantalla|screen|monitor/, url: 'https://images.unsplash.com/photo-1531746790731-6c087fecd65a?q=80&w=600&auto=format&fit=crop' },

    // PCB y diseño de circuitos
    { regex: /pcb|circuito|placa|board|smd|solder|esquem[aá]tico/, url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop' },
  ];

  for (const rule of keywordRules) {
    if (rule.regex.test(haystack)) {
      return rule.url;
    }
  }

  // 3) Si no hay match por keywords, usar placeholder por categoría
  const categoryImage = categoryPlaceholderImage(diseno?.nombreCategoria);
  if (categoryImage && !categoryImage.startsWith('data:')) {
    return categoryImage;
  }

  // 4) Fallback final
  return FALLBACK_CARD_IMAGE;
}
