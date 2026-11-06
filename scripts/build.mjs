/* Build del sitio: escribe las páginas HTML en publico/ a partir de los datos
 * y le pone a cada archivo estático referenciado una huella ?v=<8 hex> del
 * contenido. El Worker sirve lo versionado con caché de un año y lo demás se
 * revalida: así nadie se queda viendo una imagen vieja después de un cambio.
 *
 *   npm run build
 */

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as D from '../datos/datos.mjs';
import { portada, cabezaHtml, pie, esc } from '../fuente/pagina.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLICO = join(RAIZ, 'publico');

/* Referencias a archivos propios: /carpeta/archivo.ext con o sin ?v= previo. */
const REF = /(["'(\s])(\/(?:images|logos|reels|video|css|js)\/[\w./-]+\.(?:webp|jpg|jpeg|png|svg|mp4|css|js|woff2))(?:\?v=[0-9a-f]{8})?/g;

const huellas = new Map();
async function huella(ruta) {
  if (!huellas.has(ruta)) {
    const contenido = await readFile(join(PUBLICO, ruta));
    huellas.set(ruta, createHash('sha256').update(contenido).digest('hex').slice(0, 8));
  }
  return huellas.get(ruta);
}

export async function versionar(texto) {
  const faltan = [];
  const partes = [];
  let ultimo = 0;
  for (const m of texto.matchAll(REF)) {
    const [entero, antes, ruta] = m;
    partes.push(texto.slice(ultimo, m.index));
    try {
      partes.push(`${antes}${ruta}?v=${await huella(ruta)}`);
    } catch {
      faltan.push(ruta);
      partes.push(entero);
    }
    ultimo = m.index + entero.length;
  }
  partes.push(texto.slice(ultimo));
  if (faltan.length) throw new Error(`Archivos referenciados que no existen:\n  ${[...new Set(faltan)].join('\n  ')}`);
  return partes.join('');
}

function pagina404() {
  return `${cabezaHtml({ titulo: 'Esta página no existe — DÚO', descripcion: 'La dirección no existe. Vuelve al inicio de DÚO Marketing Digital.', extra: '<meta name="robots" content="noindex">' })}
<body class="simple">
<main class="contenedor simple-in">
  <a href="/" class="simple-logo"><img src="/logos/duo-wordmark-white.png" alt="DÚO Marketing Digital" width="908" height="678"></a>
  <h1>Esta página no existe.</h1>
  <p>Puede que el enlace esté mal escrito o que la página se haya movido.</p>
  <p><a href="/" class="boton">Ir al inicio</a> <a href="/#cotizar" class="boton boton-linea">Cotizar un proyecto</a></p>
</main>
</body>
</html>
`;
}

function paginaPrivacidad() {
  return `${cabezaHtml({ titulo: 'Privacidad — DÚO Marketing Digital', descripcion: 'Qué datos guarda DÚO Marketing Digital cuando pides una cotización y para qué los usa.', url: 'https://duomarketingdigital.com/privacidad/' })}
<body class="simple">
<main class="contenedor simple-in texto-legal">
  <a href="/" class="simple-logo"><img src="/logos/duo-wordmark-white.png" alt="DÚO Marketing Digital" width="908" height="678"></a>
  <h1>Privacidad</h1>
  <p>Esta página explica qué datos guardamos cuando pides una cotización en duomarketingdigital.com y para qué los usamos.</p>
  <h2>Qué datos guardamos</h2>
  <p>Lo que escribes en el formulario: tu nombre, tu número de WhatsApp, qué vende tu negocio, tu ciudad, qué servicios te interesan, cuánto inviertes en publicidad y cuándo quieres empezar. También la página desde la que llegaste y, si viniste desde un anuncio, los datos de esa campaña.</p>
  <h2>Para qué los usamos</h2>
  <p>Para escribirte, coordinar una reunión y enviarte la propuesta. No vendemos ni compartimos tus datos con otras empresas para que te ofrezcan cosas.</p>
  <h2>Medición de anuncios</h2>
  <p>Usamos el píxel de Meta y su API de conversiones para saber qué anuncios traen pedidos de cotización. A Meta le enviamos tu número y tu nombre cifrados, de forma que no se pueden leer, junto con la dirección de tu conexión y tu navegador.</p>
  <h2>Cuánto tiempo los guardamos y cómo pedir que los borremos</h2>
  <p>Los guardamos mientras haya una conversación o un trabajo en curso con tu negocio. Puedes pedir que los borremos o corrijamos cuando quieras escribiéndonos por WhatsApp.</p>
  <p><a href="/" class="boton boton-linea">Volver al inicio</a></p>
</main>
${pie(D)}
</body>
</html>
`;
}

const SITEMAP = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://duomarketingdigital.com/</loc><lastmod>${new Date().toISOString().slice(0, 10)}</lastmod><priority>1.0</priority></url>
  <url><loc>https://duomarketingdigital.com/privacidad/</loc><priority>0.2</priority></url>
</urlset>
`;

export async function construir() {
  // Primero los JS y CSS (sus propias referencias), después el HTML que los referencia.
  for (const archivo of ['css/estilos.css']) {
    const ruta = join(PUBLICO, archivo);
    await writeFile(ruta, await versionar(await readFile(ruta, 'utf8')));
  }
  const paginas = {
    'index.html': portada(D),
    '404.html': pagina404(),
    'privacidad/index.html': paginaPrivacidad(),
  };
  for (const [destino, html] of Object.entries(paginas)) {
    const ruta = join(PUBLICO, destino);
    await mkdir(dirname(ruta), { recursive: true });
    await writeFile(ruta, await versionar(html));
  }
  await writeFile(join(PUBLICO, 'sitemap.xml'), SITEMAP);
  return Object.keys(paginas);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const hechas = await construir();
  console.log(`Listo: ${hechas.join(', ')}`);
}

export { esc };
