/* Servidor local para mirar el sitio sin Cloudflare (`wrangler dev` no arranca
 * en esta computadora: workerd muere con 0xc0000005).
 *
 *   node scripts/servidor-local.mjs [puerto]
 *
 * Sirve publico/ tal cual (ignora ?v=) y pasa POST /api/cotizacion por el
 * Worker real con una base en memoria, sin píxel ni aviso. No inyecta la
 * configuración (HTMLRewriter no existe en Node): la página usa los datos del
 * build. El camino completo se prueba en la vista previa de Pages. */

import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import worker from '../publico/_worker.js';

const PUBLICO = join(dirname(fileURLToPath(import.meta.url)), '..', 'publico');
const PUERTO = Number(process.argv[2] || 8788);
const TIPOS = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.webp': 'image/webp', '.jpg': 'image/jpeg', '.png': 'image/png', '.svg': 'image/svg+xml', '.mp4': 'video/mp4', '.txt': 'text/plain', '.xml': 'application/xml' };

export const filas = [];
const DB = {
  prepare(sql) {
    return {
      bind(...valores) {
        return {
          async run() {
            if (sql.startsWith('INSERT')) { filas.push(valores); return { meta: { last_row_id: filas.length } }; }
            return { meta: {} };
          },
        };
      },
    };
  },
};

async function archivo(ruta) {
  let f = normalize(join(PUBLICO, decodeURIComponent(ruta)));
  if (!f.startsWith(PUBLICO)) return null;
  try { if ((await stat(f)).isDirectory()) f = join(f, 'index.html'); } catch { return null; }
  try { return { cuerpo: await readFile(f), tipo: TIPOS[extname(f)] || 'application/octet-stream' }; } catch { return null; }
}

createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PUERTO}`);
  if (url.pathname === '/api/cotizacion') {
    const trozos = [];
    for await (const t of req) trozos.push(t);
    const r = await worker.fetch(new Request(url, { method: req.method, headers: req.headers, body: req.method === 'POST' ? Buffer.concat(trozos) : undefined }), { DB }, { waitUntil() {} });
    res.writeHead(r.status, Object.fromEntries(r.headers));
    res.end(Buffer.from(await r.arrayBuffer()));
    console.log('[local] cotización →', r.status, filas.at(-1)?.slice(1, 4));
    return;
  }
  if (/^\/servicios(\.html|\/)?$/.test(url.pathname)) { res.writeHead(301, { Location: '/#servicios' }); res.end(); return; }
  const a = await archivo(url.pathname === '/' ? '/index.html' : url.pathname) || await archivo(`${url.pathname}.html`);
  if (!a) { const n = await archivo('/404.html'); res.writeHead(404, { 'Content-Type': TIPOS['.html'] }); res.end(n?.cuerpo); return; }
  const rango = req.headers.range && /bytes=(\d*)-(\d*)/.exec(req.headers.range);
  if (rango && a.tipo === 'video/mp4') {
    const ini = Number(rango[1] || 0), fin = rango[2] ? Number(rango[2]) : a.cuerpo.length - 1;
    res.writeHead(206, { 'Content-Type': a.tipo, 'Content-Range': `bytes ${ini}-${fin}/${a.cuerpo.length}`, 'Accept-Ranges': 'bytes', 'Content-Length': fin - ini + 1 });
    res.end(a.cuerpo.subarray(ini, fin + 1));
    return;
  }
  res.writeHead(200, { 'Content-Type': a.tipo, 'Cache-Control': 'no-store', 'Accept-Ranges': 'bytes' });
  res.end(a.cuerpo);
}).listen(PUERTO, () => console.log(`http://localhost:${PUERTO}`));
