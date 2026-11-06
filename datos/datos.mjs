/* ═══════════════════════════════════════════════════════════════════════
   DATOS DEL SITIO — la única fuente de cifras, casos, marcas y contactos.

   Todo número o afirmación que ve un cliente sale de este archivo: el build
   (scripts/build.mjs) los escribe en el HTML. Nada se inventa en la plantilla.
   Las cifras de casos vienen de la verificación del 06/11/2026 contra Meta e
   Instagram. Lo marcado // VERIFICAR es una decisión o un dato que todavía
   tiene que confirmar Emanuel: al confirmarlo se corrige acá, se borra la
   marca y se vuelve a correr `npm run build`.

   🔴 Acá NO van precios, honorarios ni ingresos de DÚO.
   🔴 DÚO ya no graba el contenido de los clientes (09/10/2026): planifica,
      escribe guiones y escenas, el equipo del cliente graba con esas pautas,
      la edición es opcional y DÚO maneja la publicidad. Ningún texto dice
      «grabamos», «vamos a tu local» ni «equipo propio».
   🔴 Toda cifra lleva su período. Nunca un total de vistas sumado.
   ═══════════════════════════════════════════════════════════════════════ */

export const CONTACTO = {
  // VERIFICAR — 59175175144 es el MISMO número que usa el Restobar Alameda.
  // En producción se toma de la variable WHATSAPP_NUMBER del proyecto de Pages.
  whatsapp: '59175175144',
  ciudad: 'Yacuiba, Tarija · Bolivia',
};

export const REDES = [
  { red: 'Instagram', usuario: '@duo_agenciamkt', url: 'https://www.instagram.com/duo_agenciamkt' },
  { red: 'TikTok', usuario: '@duo_marketingdigital', url: 'https://www.tiktok.com/@duo_marketingdigital' }, // VERIFICAR
  { red: 'Facebook', usuario: 'DÚO Marketing Digital', url: 'https://www.facebook.com/61565101730927' }, // VERIFICAR
];

/* Comunidad gratuita de DÚO: el grupo de WhatsApp. */
export const COMUNIDAD = {
  url: 'https://chat.whatsapp.com/J9AZ2CWy0FE3xkOhp43wpx',
  nombre: 'Traffickers del mundo',
};

/* Una sola formulación de alcance en todo el sitio. */
export const PAISES = 'Bolivia, Chile, Ecuador y España';

/* Cifras del tablero del hero, en este orden.
   femmeninas.cl verificado en Meta (cuenta 609065404340814) por el coordinador:
   solo campañas con «WEB» en el nombre, 01/10/2025–31/10/2026 → retorno 10,44x,
   18.910 compras, 1.005.683.286 CLP en ventas, 96,3 M CLP invertidos en web
   (103,3 M CLP en toda la cuenta). Con cualquier tipo de cambio de 2026
   (889–964 CLP/USD) se sostienen «+US$1 millón» y «+US$100 mil». Las campañas
   de WhatsApp no cuentan. */
export const TABLERO = [
  { valor: '+US$1 millón', etiqueta: 'en ventas web con +US$100 mil invertidos · 13 meses', marca: 'femmeninas.cl', logo: '/logos/clientes/femmeninas.webp' },
  { valor: '10,4x', etiqueta: 'de retorno en las campañas a la web', marca: 'femmeninas.cl', logo: '/logos/clientes/femmeninas.webp' },
  { valor: '+34.000', etiqueta: 'conversaciones por WhatsApp en 12 meses', marca: 'ProGaming EC', logo: '/logos/clientes/progaming.webp' },
];

/* Casos de publicidad en Meta. `captura` es una captura real del Administrador
   de anuncios. Primero el proceso, el número al final. */
export const CASOS = [
  {
    id: 'femmeninas',
    marca: 'femmeninas.cl',
    logo: '/logos/clientes/femmeninas.webp',
    rubro: 'Tienda online de moda',
    pais: 'Chile',
    periodo: 'oct 2025 – oct 2026 · solo campañas a la web',
    // Captura del 06/11/2026: filtro «Nombre de la campaña contiene web», 1 oct 2025 – 31 oct 2026.
    // Totales: $96.300.460 invertidos · $1.005.683.287 en ventas · ROAS 10,44. Nombres difuminados.
    captura: '/images/casos/01-femmeninas-web-oct25-oct26.webp',
    capturaAncho: 1488,
    capturaAlto: 722,
    capturaAlt: 'Administrador de anuncios de Meta con el retorno de las campañas de femmeninas.cl',
    titular: 'Más de un millón de dólares en ventas para una tienda online de Chile.',
    grafico: 'ventas-mensuales', // gráfico animado con VENTAS_MENSUALES_FEMMENINAS
    cifras: [
      ['+US$1 millón', 'en ventas desde la web'],
      ['10,4x', 'de retorno: cada dólar invertido volvió diez veces'],
      ['+18.900', 'compras en la web'],
      ['+US$100 mil', 'invertidos en publicidad'],
    ],
    perfil: { url: 'https://www.instagram.com/femmeninas.cl/', usuario: '@femmeninas.cl', seguidores: '989 mil' },
  },
  {
    id: 'progaming',
    marca: 'ProGaming EC',
    logo: '/logos/clientes/progaming.webp',
    rubro: 'Tienda gamer',
    pais: 'Ecuador',
    periodo: '12 meses',
    captura: '/images/casos/05-progaming-ads-manager-whatsapp.webp',
    capturaAlt: 'Administrador de anuncios de Meta con las conversaciones de ProGaming EC',
    titular: 'Treinta y cuatro mil conversaciones por WhatsApp, a quince centavos de dólar cada una.',
    cifras: [
      ['+34.000', 'conversaciones por WhatsApp'],
      ['US$ 0,15', 'por conversación'],
      ['+530 mil', 'personas alcanzadas'],
    ],
  },
];

/* Ventas mensuales de femmeninas.cl, solo campañas a la web, en millones de
   CLP. Verificado en Meta (cuenta 609065404340814) por el coordinador.
   Totales: 96,30 invertidos · 1.005,7 en ventas → 10,44x. Retorno mensual
   entre 8,7x (ene 2026) y 12,7x (dic 2025). */
export const VENTAS_MENSUALES_FEMMENINAS = [
  { mes: '2025-10', inversion: 7.23, ventas: 88.4 },
  { mes: '2025-11', inversion: 6.48, ventas: 70.0 },
  { mes: '2025-12', inversion: 6.81, ventas: 86.3 },
  { mes: '2026-01', inversion: 6.79, ventas: 59.1 },
  { mes: '2026-02', inversion: 7.26, ventas: 73.2 },
  { mes: '2026-03', inversion: 7.76, ventas: 79.5 },
  { mes: '2026-04', inversion: 6.90, ventas: 61.7 },
  { mes: '2026-05', inversion: 7.13, ventas: 85.5 },
  { mes: '2026-06', inversion: 5.99, ventas: 71.2 },
  { mes: '2026-07', inversion: 5.91, ventas: 60.7 },
  { mes: '2026-08', inversion: 7.75, ventas: 75.5 },
  { mes: '2026-09', inversion: 9.40, ventas: 87.7 },
  { mes: '2026-10', inversion: 10.90, ventas: 107.1 },
];

/* Videos orgánicos en TikTok de marcas con las que trabajamos. Cada fila es
   un cliente: su logo viaja encima de su video. Vistas del 06/11/2026.
   Pastela va sin cifra: no hay enlace al video para respaldarla. */
export const VIDEOS = [
  { marca: 'Abbanissi', rubro: 'Juguetería', vistas: '668 mil', logo: '/logos/clientes/abbanissi.webp', video: '/reels/01-abbanissi.mp4', poster: '/reels/posters/01-abbanissi.jpg', url: 'https://www.tiktok.com/@jugueteriaabbanissi/video/7481773766524013830' },
  { marca: 'Climere', rubro: 'Estética', vistas: '295,9 mil', logo: '/logos/clientes/climere.webp', video: '/reels/02-climere.mp4', poster: '/reels/posters/02-climere.jpg', url: 'https://www.tiktok.com/@estetica_climere/video/7440293894295784759' },
  { marca: 'Ñañitos', rubro: 'Juguetería', vistas: '244,8 mil', logo: '/logos/clientes/nanitos.webp', video: '/reels/03-nanitos.mp4', poster: '/reels/posters/03-nanitos.jpg', url: 'https://www.tiktok.com/@jugueteria.nanitos/video/7528796945821879558' },
  { marca: 'Marena', rubro: 'Moda', vistas: '198,3 mil', logo: '/logos/clientes/marena.webp', video: '/reels/04-marena.mp4', poster: '/reels/posters/04-marena.jpg', url: 'https://www.tiktok.com/@marena.yba/video/7636902240296406279' },
  { marca: 'Pastela', rubro: 'Pastelería', vistas: '', logo: '/logos/clientes/pastela.webp', video: '/reels/05-pastela.mp4', poster: '/reels/posters/05-pastela.jpg', url: '' },
  { marca: 'Gloria', rubro: 'Calzado', vistas: '168,3 mil', logo: '/logos/clientes/gloria.webp', video: '/reels/06-gloria.mp4', poster: '/reels/posters/06-gloria.jpg', url: 'https://www.tiktok.com/@gloriabolivia/video/7524066637134302470' },
  { marca: 'El Clásico', rubro: 'Pizzería', vistas: '81,9 mil', logo: '/logos/clientes/elclasico.webp', video: '/reels/07-elclasico.mp4', poster: '/reels/posters/07-elclasico.jpg', url: 'https://www.tiktok.com/@elclasico_pizzeria/video/7517805002396650757' },
  { marca: 'Milena Solórzano', rubro: 'Maquillaje', vistas: '85,8 mil', logo: '/logos/clientes/milena.webp', video: '/reels/08-milena.mp4', poster: '/reels/posters/08-milena.jpg', url: 'https://www.tiktok.com/@milenasolorzanomakeup/video/7675009735778733313' },
  { marca: 'Abigail Zegarra', rubro: 'Pastelería', vistas: '47,9 mil', logo: '/logos/clientes/abigail.webp', video: '/reels/10-abigail.mp4', poster: '/reels/posters/10-abigail.jpg', url: 'https://www.tiktok.com/@abigailzegarrapasteleria/video/7522470708639730950' },
  { marca: 'Yummy', rubro: 'Café', vistas: '40,5 mil', logo: '/logos/clientes/yummy.webp', video: '/reels/12-yummy.mp4', poster: '/reels/posters/12-yummy.jpg', url: 'https://www.tiktok.com/@yummy.cafebistro/video/7501116547402878214' },
];

/* El teléfono del hero: el video animado del método. En la portada no van
   los TikTok de clientes (pedido de Emanuel, 06/11/2026). Corre completo,
   mudo y en bucle; el botón «Activar sonido» lo reinicia con sonido.
   🔴 Emanuel (07/11/2026): no se dice en ningún lado cómo se hizo el video. */
export const VIDEO_HERO = {
  src: '/video/duo-metodo-completo-540.mp4',
  poster: '/video/duo-metodo-loop-poster.webp',
  etiqueta: 'Método DÚO3X',
  duracion: '1:18',
};

/* Cinta de marcas bajo el hero: las cuentas de pauta y las del muro, sin repetir. */
export const MARCAS_CINTA = [
  { marca: 'femmeninas.cl', logo: '/logos/clientes/femmeninas.webp' },
  { marca: 'ProGaming EC', logo: '/logos/clientes/progaming.webp' },
  ...VIDEOS.map(({ marca, logo }) => ({ marca, logo })),
];

/* Somos dos personas y un agente propio (Emanuel, 07/11/2026). */
export const EQUIPO = {
  personas: 2,
  miembros: [
    { nombre: 'Emanuel Baldiviezo', rol: 'Ingeniero comercial', foto: '/images/equipo/manu-retrato-v2.webp' },
    { nombre: 'Valeria', rol: 'Técnica superior en marketing digital', foto: '/images/equipo/valeria-retrato-v2.webp' },
    { nombre: 'Agente DÚO', rol: 'Inteligencia artificial propia', agente: true },
  ],
};

export const GARANTIA = {
  // VERIFICAR — texto exacto de la garantía: es una decisión de plata de Emanuel
  titular: 'Si el primer mes no entregamos lo acordado, te devolvemos el mes.',
  detalle: 'Garantizamos lo que firmamos: cantidad, calidad y plazos.',
};
