/* Prueba el video del hero: arranca mudo y en bucle, «Activar sonido» lo
 * reinicia con sonido, «Silenciar» lo mutea sin reiniciar, el muro se queda
 * quieto mientras suena, y con «reducir movimiento» no hay autoplay.
 *   node scripts/probar-visor.mjs [url] */
import { createRequire } from 'node:module';
const { chromium } = createRequire('C:/Users/Windows/OneDrive/Desktop/DUO Agencia de Marketing/Agente DUO/clientes/hellohome-granada/landing/package.json')('playwright');

const url = process.argv[2] || 'http://localhost:8788/';
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
const out = {};
const estado = (p) => p.evaluate(() => {
  const v = document.getElementById('video-hero');
  const muro = [...document.querySelectorAll('.muro-tira video')].filter((x) => !x.paused).length;
  return { src: !!v.src, pausado: v.paused, mudo: v.muted, bucle: v.loop, t: +v.currentTime.toFixed(1), boton: document.querySelector('.sonido-txt').textContent, presionado: document.getElementById('boton-sonido').getAttribute('aria-pressed'), muroSonando: muro };
});

let p = await b.newPage({ viewport: { width: 1440, height: 900 } });
const errores = [];
p.on('pageerror', (e) => errores.push(String(e)));
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(3500);
out.alCargar = await estado(p);
await p.click('#boton-sonido');
await p.waitForTimeout(800);
out.conSonido = await estado(p);
// Scroll corto: sigue sonando.
await p.evaluate(() => scrollTo(0, 500));
await p.waitForTimeout(700);
out.scrollCorto = await estado(p);
// Lejos: se pausa.
await p.evaluate(() => document.getElementById('videos').scrollIntoView());
await p.waitForTimeout(1500);
out.lejos = await estado(p);
await p.evaluate(() => scrollTo(0, 0));
await p.waitForTimeout(1200);
out.alVolver = await estado(p);
await p.screenshot({ path: 'capturas/v3-sonido-activo-1440.png' });
await p.click('#boton-sonido');
await p.waitForTimeout(500);
out.silenciado = await estado(p);
// Tocar el teléfono hace lo mismo que el botón.
await p.click('#telefono', { position: { x: 60, y: 120 } });
await p.waitForTimeout(600);
out.toqueTelefono = await estado(p);
await p.click('#boton-sonido');
// «Ver un ejemplo» sube al hero y activa el sonido.
await p.evaluate(() => document.getElementById('servicios').scrollIntoView());
await p.waitForTimeout(400);
await p.click('.serv-ejemplo');
await p.waitForTimeout(1500);
out.verUnEjemplo = { ...(await estado(p)), scrollY: await p.evaluate(() => Math.round(scrollY)) };
out.errores = errores;
await p.close();

p = await b.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
await p.goto(url, { waitUntil: 'load' });
await p.waitForTimeout(1500);
out.reducido = await estado(p);
await p.click('#boton-sonido');
await p.waitForTimeout(800);
out.reducidoTrasTocar = await estado(p);
await p.close();
await b.close();
console.log(JSON.stringify(out));
