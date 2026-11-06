/* Recorre el formulario de cotización de punta a punta en un navegador real.
 *   node scripts/probar-formulario.mjs [url]
 * Usa el nombre «Prueba Agente» para poder borrar la fila después. */
import { createRequire } from 'node:module';
const { chromium } = createRequire('C:/Users/Windows/OneDrive/Desktop/DUO Agencia de Marketing/Agente DUO/clientes/hellohome-granada/landing/package.json')('playwright');

const url = process.argv[2] || 'http://localhost:8788/';
const b = await chromium.launch();
const p = await b.newPage({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const errores = [];
p.on('pageerror', (e) => errores.push(String(e)));
let respuesta = null;
p.on('response', async (r) => { if (r.url().includes('/api/cotizacion')) respuesta = { estado: r.status(), cuerpo: await r.json().catch(() => null) }; });

await p.goto(`${url}?utm_source=prueba&utm_campaign=agente#cotizar`, { waitUntil: 'networkidle' });
const pasoTexto = () => p.textContent('#form-paso');

// Paso 1: sin elegir nada, el error tiene que aparecer.
await p.click('#form-seguir');
const error1 = await p.textContent('[data-error="necesita"]');
await p.click('label.pildora:has(input[value="campanas"])');
await p.click('label.pildora:has(input[value="animado"])');
await p.click('#form-seguir');
const paso2 = await pasoTexto();
await p.fill('input[name="rubro"]', 'Tienda de prueba');
await p.fill('input[name="ciudad"]', 'Tarija');
await p.click('#form-seguir');
await p.click('label.pildora:has(input[value="alto"])');
await p.waitForTimeout(450);
const paso4 = await pasoTexto();
await p.click('label.pildora:has(input[value="este_mes"])');
await p.waitForTimeout(450);
const paso5 = await pasoTexto();
await p.fill('input[name="nombre"]', 'Prueba Agente');
await p.fill('input[name="telefono"]', '7123');
await p.click('#form-seguir');
const errorTel = await p.textContent('[data-error="telefono"]');
await p.fill('input[name="telefono"]', '71234567');
const botonFinal = await p.textContent('#form-seguir');
await p.click('#form-seguir');
await p.waitForSelector('#gracias:not([hidden])', { timeout: 15000 });
const titulo = await p.textContent('#gracias-titulo');
const enlace = await p.getAttribute('#gracias-wa', 'href');
await p.screenshot({ path: 'capturas/formulario-gracias-390.png' });
console.log(JSON.stringify({ error1, paso2, paso4, paso5, errorTel, botonFinal, respuesta, titulo, enlace: decodeURIComponent(enlace), errores }, null, 2));
await b.close();
