/* Palabras visibles en la portada (main, sin lo oculto ni duplicados aria-hidden,
 * sin el formulario ni respuestas plegadas). node scripts/contar-palabras.mjs [url] */
import { createRequire } from 'node:module';
const { chromium } = createRequire('C:/Users/Windows/OneDrive/Desktop/DUO Agencia de Marketing/Agente DUO/clientes/hellohome-granada/landing/package.json')('playwright');
const url = process.argv[2] || 'http://localhost:8788/';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 1440, height: 900 } });
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(1500);
const r = await p.evaluate(() => {
  const hojas = [...document.querySelectorAll('main *')].filter((el) =>
    [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) &&
    el.getClientRects().length && !el.closest('[aria-hidden="true"], form, .gracias, .sr-only, details:not([open]) > p'));
  const texto = hojas.map((el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ')).join(' ');
  const total = texto.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  const porSeccion = {};
  for (const s of document.querySelectorAll('main > section, main > div')) {
    const t = [...s.querySelectorAll('*')].filter((el) => hojas.includes(el)).map((el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join(' ')).join(' ');
    porSeccion[s.id || s.className] = t.split(/\s+/).filter((w) => /[\p{L}\p{N}]/u.test(w)).length;
  }
  return { total, porSeccion };
});
console.log(JSON.stringify(r));
await b.close();
