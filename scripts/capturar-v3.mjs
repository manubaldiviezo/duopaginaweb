/* Pliegue y sección de Resultados a 390 y 1440.
 *   node scripts/capturar-v3.mjs [url] [prefijo] */
import { createRequire } from 'node:module';
const { chromium } = createRequire('C:/Users/Windows/OneDrive/Desktop/DUO Agencia de Marketing/Agente DUO/clientes/hellohome-granada/landing/package.json')('playwright');

const url = process.argv[2] || 'http://localhost:8788/';
const prefijo = process.argv[3] || 'v3';
const b = await chromium.launch();
const informe = {};
for (const [w, h] of [[390, 844], [1440, 900]]) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  await p.goto(url, { waitUntil: 'load' });
  await p.waitForTimeout(2500);
  await p.screenshot({ path: `capturas/${prefijo}-${w}-pliegue.png` });
  // ¿Algún valor del tablero se corta o se parte en dos líneas?
  informe[w] = await p.evaluate(() => ({
    valores: [...document.querySelectorAll('.dato-valor')].map((el) => ({ texto: el.textContent, lineas: Math.round(el.getBoundingClientRect().height / parseFloat(getComputedStyle(el).lineHeight)), cortado: el.scrollWidth > el.clientWidth + 1 })),
    // La etiqueta de cada cifra tiene que tener aire (≥ 90 px de ancho) y no salirse de la tarjeta.
    cifrasCaso: [...document.querySelectorAll('#caso-femmeninas .caso-cifras li')].map((li) => {
      const b = li.querySelector('b').getBoundingClientRect();
      const s = li.querySelector('span').getBoundingClientRect();
      const caja = li.getBoundingClientRect();
      return { texto: li.querySelector('b').textContent, anchoEtiqueta: Math.round(s.width), cortado: b.right > caja.right + 1 || s.right > caja.right + 1 || s.width < 90 };
    }),
    botonSonido: (() => { const r = document.getElementById('boton-sonido').getBoundingClientRect(); return { visible: r.width > 0 && r.bottom > 0, abajo: Math.round(r.bottom) }; })(),
    pantallas: +(document.documentElement.scrollHeight / innerHeight).toFixed(1),
  }));
  // Lo fijo (barra, WhatsApp) se repetiría en medio de la captura larga.
  await p.addStyleTag({ content: '.barra, .barra-movil, .wa-flotante { display: none !important; }' });
  const res = await p.$('#resultados');
  await res.scrollIntoViewIfNeeded();
  await p.waitForTimeout(800);
  await res.screenshot({ path: `capturas/${prefijo}-${w}-resultados.png` });
  await p.close();
}
await b.close();
console.log(JSON.stringify(informe, null, 1));
