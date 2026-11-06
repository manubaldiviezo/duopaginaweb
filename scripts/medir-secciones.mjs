/* Alto de cada sección a un ancho dado: node scripts/medir-secciones.mjs [url] [ancho] */
import { createRequire } from 'node:module';
const req = createRequire('C:/Users/Windows/OneDrive/Desktop/DUO Agencia de Marketing/Agente DUO/clientes/hellohome-granada/landing/package.json');
const { chromium } = req('playwright');
const url = process.argv[2] || 'http://localhost:8788/';
const ancho = Number(process.argv[3] || 390);
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: ancho, height: 844 } });
await p.goto(url, { waitUntil: 'networkidle' });
const r = await p.evaluate(() => [...document.querySelectorAll('main > section, main > div, footer')].map((s) => {
  const palabras = s.innerText.split(/\s+/).filter(Boolean).length;
  return `${(s.id || s.className).padEnd(14)} ${String(Math.round(s.getBoundingClientRect().height)).padStart(5)} px  ${palabras} palabras`;
}));
console.log(r.join('\n'));
await b.close();
