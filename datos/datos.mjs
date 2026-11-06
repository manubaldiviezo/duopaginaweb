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
    pasos: [
      ['Lo que encontramos', 'Quince campañas compitiendo entre sí por el mismo presupuesto.'],
      ['Lo que hicimos', 'Ordenamos la cuenta en una sola estructura pensada para vender. Desde entonces, cada semana ampliamos lo que vende y cortamos lo que no.'],
      ['Dónde está hoy', 'Octubre de 2026 fue el mejor mes de la cuenta desde que existe.'],
    ],
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
    pasos: [
      ['El objetivo', 'Que cada anuncio termine en una conversación con alguien que quiere comprar.'],
      ['Lo que hicimos', 'Campañas pensadas para abrir conversaciones, con el costo de cada una a la vista todas las semanas.'],
    ],
    cifras: [
      ['+34.000', 'conversaciones por WhatsApp'],
      ['US$ 0,15', 'por conversación'],
      ['+530 mil', 'personas alcanzadas'],
    ],
  },
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

/* El teléfono del hero: el video animado del método, hecho con IA. En la
   portada no van los TikTok de clientes (pedido de Emanuel, 06/11/2026).
   Corre completo, mudo y en bucle; el botón «Activar sonido» lo reinicia
   con sonido. */
export const VIDEO_HERO = {
  src: '/video/duo-metodo-completo-540.mp4',
  poster: '/video/duo-metodo-loop-poster.webp',
  etiqueta: 'Hecho con IA · Método DÚO3X',
  duracion: '1:18',
};

/* Cinta de marcas bajo el hero: las cuentas de pauta y las del muro, sin repetir. */
export const MARCAS_CINTA = [
  { marca: 'femmeninas.cl', logo: '/logos/clientes/femmeninas.webp' },
  { marca: 'ProGaming EC', logo: '/logos/clientes/progaming.webp' },
  ...VIDEOS.map(({ marca, logo }) => ({ marca, logo })),
];

export const EQUIPO = {
  personas: 5, // Emanuel, Valeria, Nilverth, Leonardo y Oscar (memoria duo-como-explicar-la-agencia)
  retratos: [
    { nombre: 'Manu Baldiviezo', rol: 'Estratega digital', foto: '/images/equipo/manu-retrato-v2.webp' },
    // VERIFICAR — la web anterior dice «Directora creativa»; la memoria de la agencia dice PM
    { nombre: 'Valeria', rol: 'Directora creativa', foto: '/images/equipo/valeria-retrato-v2.webp' },
  ],
};

export const GARANTIA = {
  // VERIFICAR — texto exacto de la garantía: es una decisión de plata de Emanuel
  titular: 'Si el primer mes no entregamos lo acordado, te devolvemos el mes.',
  detalle: 'Garantizamos nuestro trabajo: lo que firmamos en cantidad, calidad y plazos. Las ventas dependen también de tu producto, tu precio y tu mercado, y eso no lo prometemos.',
};
