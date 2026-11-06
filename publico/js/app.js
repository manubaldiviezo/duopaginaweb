/* DÚO · comportamiento de la portada.
 * Módulo: se ejecuta cuando el HTML ya está armado. Nada de lo que hay acá es
 * imprescindible para leer la página; sí para el formulario. */

import {
  OPCIONES, validarEnvio, mensajeWhatsApp, enlaceWhatsApp, leerCampana,
} from './cotizacion.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const leerJson = (id) => { try { return JSON.parse($(`#${id}`)?.textContent || '{}'); } catch { return {}; } };
const sinMovimiento = matchMedia('(prefers-reduced-motion: reduce)').matches;

const CFG = leerJson('cfg');
const PAGINA = leerJson('datos-pagina');
const WHATSAPP = String(CFG.whatsapp || PAGINA.whatsapp || '').replace(/\D/g, '');

/* ─── Píxel de Meta ────────────────────────────────────────────────────────
 * Solo señales de comportamiento. El contacto (Lead) lo manda el servidor
 * después de guardarlo: el navegador no avisa conversiones. */
function cargarPixel(id) {
  /* eslint-disable */
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', id);
  window.fbq('track', 'PageView');
}
const pixelId = String(CFG.pixelId || '').replace(/\D/g, '');
if (pixelId) cargarPixel(pixelId);
function senal(evento, params, personalizado = false) {
  if (!window.fbq) return;
  try { window.fbq(personalizado ? 'trackCustom' : 'track', evento, params || {}); } catch { /* el píxel nunca rompe la página */ }
}

/* ─── WhatsApp ─────────────────────────────────────────────────────────── */
if (WHATSAPP) {
  $$('.wa-enlace').forEach((a) => { a.href = enlaceWhatsApp(WHATSAPP, a.dataset.wa || 'Hola DÚO'); });
}
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href*="wa.me/"]');
  if (a) senal('Contact');
});

$$('[data-anio]').forEach((el) => { el.textContent = String(new Date().getFullYear()); });

/* ─── Barra superior y barra móvil ─────────────────────────────────────── */
const barra = $('#barra');
const barraMovil = $('#barra-movil');
const accionesHero = $('.hero-acciones');
let cotizarVisible = false;
function alDesplazar() {
  barra?.classList.toggle('con-fondo', scrollY > 12);
  if (barraMovil && accionesHero) {
    const pasoHero = accionesHero.getBoundingClientRect().bottom < 0;
    barraMovil.classList.toggle('visible', pasoHero && !cotizarVisible);
    // El botón flotante de WhatsApp (escritorio) aparece pasado el hero.
    $('.wa-flotante')?.classList.toggle('visible', pasoHero);
  }
}
addEventListener('scroll', alDesplazar, { passive: true });
const seccionCotizar = $('#cotizar');
if (seccionCotizar) {
  new IntersectionObserver(([e]) => { cotizarVisible = e.isIntersecting; alDesplazar(); }, { threshold: 0.05 }).observe(seccionCotizar);
}
alDesplazar();

/* ViewContent: quien bajó a la mitad de la página. Una sola vez. */
let vioMitad = false;
addEventListener('scroll', () => {
  if (vioMitad) return;
  if (scrollY + innerHeight >= document.documentElement.scrollHeight * 0.5) { vioMitad = true; senal('ViewContent', { content_name: 'Portada' }); }
}, { passive: true });

/* ─── Contadores ───────────────────────────────────────────────────────── */
function formatear(n, decimales) {
  const [ent, dec] = n.toFixed(decimales).split('.');
  const conPuntos = ent.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return dec ? `${conPuntos},${dec}` : conPuntos;
}
export function partirCifra(texto) {
  const m = /^(\D*?)(\d[\d.]*(?:,\d+)?)(.*)$/.exec(texto);
  if (!m) return null;
  const [, antes, numero, despues] = m;
  const decimales = numero.includes(',') ? numero.split(',')[1].length : 0;
  return { antes, despues, valor: Number(numero.replace(/\./g, '').replace(',', '.')), decimales };
}
function contar(el, texto = el.textContent) {
  el.textContent = texto;
  if (sinMovimiento) return;
  const p = partirCifra(texto.trim());
  if (!p || !Number.isFinite(p.valor) || p.valor < 2) return; // «+US$1 millón» no se cuenta desde cero
  const dur = 900;
  const t0 = performance.now();
  const paso = (t) => {
    const k = Math.min(1, (t - t0) / dur);
    const e = 1 - Math.pow(1 - k, 3);
    el.textContent = `${p.antes}${formatear(p.valor * e, p.decimales)}${p.despues}`;
    if (k < 1) requestAnimationFrame(paso); else el.textContent = texto;
  };
  requestAnimationFrame(paso);
}

/* ─── Hero: entrada orquestada y contadores ────────────────────────────── */
const hero = $('#inicio');
requestAnimationFrame(() => {
  hero?.classList.add('listo');
  [['.dato-1', 500], ['.dato-2', 580], ['.dato-3', 660]].forEach(([s, ms]) => {
    setTimeout(() => { const el = $(`${s} [data-contar]`); if (el) contar(el); }, sinMovimiento ? 0 : ms);
  });
});

function reproducir(v) {
  if (!v.src && v.dataset.src) { v.src = v.dataset.src; v.load(); }
  const p = v.play();
  if (p) p.catch(() => { /* rechazado (pestaña de fondo, ahorro de datos): queda el póster */ });
}

/* ─── Video del método en el teléfono ───────────────────────────────────
 * Corre completo, mudo y en bucle mientras el hero está a la vista.
 * «Activar sonido» (o tocar el teléfono) lo reinicia desde el principio con
 * sonido; «Silenciar» lo vuelve a mutear sin reiniciarlo. Con sonido no se
 * corta por un scroll corto: se pausa recién cuando la persona se alejó y
 * se reanuda al volver. Mientras suena, el muro de TikTok se queda quieto.
 * Con «reducir movimiento» no hay reproducción automática: queda el póster. */
const videoHero = $('#video-hero');
let conSonido = false;
const heroSuena = () => conSonido && !!videoHero && !videoHero.muted && !videoHero.paused;

(function videoDelHero() {
  const v = videoHero;
  const boton = $('#boton-sonido');
  if (!v || !boton) return;
  const texto = $('.sonido-txt', boton);
  let enVista = false; // la pantalla del teléfono se ve
  let cerca = false;   // el hero está a menos de ~una pantalla
  const avisar = () => document.dispatchEvent(new Event('sonido'));

  function pintar() {
    const activo = conSonido && !v.muted;
    boton.setAttribute('aria-pressed', String(activo));
    boton.classList.toggle('activo', activo);
    texto.textContent = activo ? 'Silenciar' : (sinMovimiento ? 'Reproducir con sonido' : 'Activar sonido');
  }

  function decidir() {
    if (document.hidden) { if (!v.paused) v.pause(); return; }
    if (conSonido && !v.muted) { if (cerca || enVista) reproducir(v); else if (!v.paused) v.pause(); return; }
    if (!sinMovimiento && enVista) reproducir(v); else if (!v.paused) v.pause();
  }

  function activar() {
    if (!v.src) { v.src = v.dataset.src; v.load(); }
    try { v.currentTime = 0; } catch { /* sin metadatos todavía: arranca de cero igual */ }
    v.muted = false;
    conSonido = true;
    const p = v.play(); // dentro del toque: el navegador lo permite con sonido
    pintar(); avisar();
    if (p) {
      p.then(() => senal('VerVideo', { content_name: 'Método DÚO3X' }, true))
        .catch((err) => {
          // Solo un rechazo del navegador al sonido lo devuelve a mudo. Un
          // AbortError (un pause() que llegó antes, por ejemplo al hacer
          // scroll) no es un rechazo: el sonido queda pedido.
          if (err?.name === 'NotAllowedError') { v.muted = true; conSonido = false; pintar(); avisar(); }
          decidir();
        });
    }
  }

  function silenciar() {
    v.muted = true;
    conSonido = false;
    pintar(); avisar(); decidir();
  }

  $$('[data-sonido]').forEach((el) => el.addEventListener('click', (e) => {
    if (el.tagName === 'A') { if (!(conSonido && !v.muted)) activar(); return; } // «Ver un ejemplo»: sube al hero y suena
    e.preventDefault();
    if (conSonido && !v.muted) silenciar(); else activar();
  }));
  v.addEventListener('playing', () => v.classList.add('activo'), { once: true });
  v.addEventListener('pause', avisar);
  v.addEventListener('play', avisar);

  new IntersectionObserver(([e]) => { enVista = e.isIntersecting; decidir(); }, { threshold: 0.2 }).observe(v);
  new IntersectionObserver(([e]) => { cerca = e.isIntersecting; decidir(); }, { rootMargin: '100% 0px' }).observe(v);
  document.addEventListener('visibilitychange', decidir);
  pintar();
})();

/* ─── Resultados: pestañas ─────────────────────────────────────────────── */
(function pestanas() {
  const tabs = $$('.pestana');
  if (!tabs.length) return;
  function elegir(tab, enfocar = false) {
    tabs.forEach((t) => {
      const activa = t === tab;
      t.setAttribute('aria-selected', String(activa));
      t.tabIndex = activa ? 0 : -1;
      const panel = document.getElementById(t.getAttribute('aria-controls'));
      if (!panel) return;
      if (activa && panel.hidden) { panel.hidden = false; panel.classList.remove('entrando'); void panel.offsetWidth; panel.classList.add('entrando'); }
      if (!activa) panel.hidden = true;
    });
    if (enfocar) tab.focus();
  }
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => elegir(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) { e.preventDefault(); elegir(tabs[(i + d + tabs.length) % tabs.length], true); }
    });
  });
})();

/* ─── Muro de videos: la cinta la mueve el CSS; acá solo se decide cuál
 * se reproduce. Como mucho los que están a la vista, y ninguno fuera. ──── */
(function muro() {
  const tira = $('.muro-tira');
  if (!tira) return;
  const videos = $$('video', tira);
  function repartir() {
    const r = tira.getBoundingClientRect();
    const aLaVista = !document.hidden && !heroSuena() && r.bottom > -200 && r.top < innerHeight + 200;
    videos.forEach((v) => {
      if (!aLaVista || sinMovimiento) { if (!v.paused) v.pause(); return; }
      const b = v.getBoundingClientRect();
      const dentro = b.right > r.left - 200 && b.left < r.right + 200;
      if (dentro) { if (v.paused) reproducir(v); } else if (!v.paused) v.pause();
    });
  }
  let reloj = null;
  new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { repartir(); reloj ??= setInterval(repartir, 600); }
    else { clearInterval(reloj); reloj = null; repartir(); }
  }, { rootMargin: '200px 0px' }).observe(tira);
  document.addEventListener('visibilitychange', repartir);
  document.addEventListener('sonido', repartir);
})();

/* ─── Cómo trabajamos: la línea se dibuja una vez al entrar ────────────── */
(function linea() {
  const pasos = $('#pasos');
  if (!pasos || sinMovimiento) return;
  if (pasos.getBoundingClientRect().top < innerHeight) return; // ya a la vista: se queda dibujada
  pasos.classList.add('por-dibujar');
  new IntersectionObserver(([e], obs) => {
    if (!e.isIntersecting) return;
    obs.disconnect();
    pasos.classList.add('dibujada');
  }, { threshold: 0.35 }).observe(pasos);
})();

/* ─── Formulario de cotización ─────────────────────────────────────────── */
(function cotizar() {
  const form = $('#form-cotizar');
  if (!form) return;
  const campos = $$('.campo', form);
  const TOTAL = campos.length;
  const barras = $$('.form-progreso i', form);
  const rotulo = $('#form-paso');
  const atras = $('#form-atras');
  const seguir = $('#form-seguir');
  const falla = $('#form-falla');
  const gracias = $('#gracias');
  let paso = 1;
  let empezo = false;
  let enviando = false;

  const valor = (n) => form.elements[n]?.value ?? '';
  function datos() {
    return {
      necesita: $$('input[name="necesita"]:checked', form).map((i) => i.value),
      rubro: valor('rubro'),
      ciudad: valor('ciudad'),
      inversion: form.querySelector('input[name="inversion"]:checked')?.value || '',
      plazo: form.querySelector('input[name="plazo"]:checked')?.value || '',
      nombre: valor('nombre'),
      pais: valor('pais'),
      telefono: valor('telefono'),
    };
  }
  const CAMPOS_POR_PASO = { 1: ['necesita'], 2: ['rubro'], 3: ['inversion'], 4: ['plazo'], 5: ['nombre', 'telefono'] };

  function mostrarErrores(errores, soloPaso) {
    const visibles = soloPaso ? CAMPOS_POR_PASO[soloPaso] : Object.keys(errores);
    $$('[data-error]', form).forEach((p) => {
      const clave = p.dataset.error;
      const msg = visibles.includes(clave) ? (errores[clave] || '') : '';
      p.textContent = msg;
      const entrada = form.elements[clave];
      if (entrada && entrada.setAttribute && !(entrada instanceof RadioNodeList)) entrada.setAttribute('aria-invalid', msg ? 'true' : 'false');
    });
  }

  function pintar() {
    campos.forEach((c) => { c.hidden = Number(c.dataset.paso) !== paso; });
    barras.forEach((b, i) => b.classList.toggle('hecho', i < paso));
    rotulo.textContent = `Paso ${paso} de ${TOTAL}`;
    atras.hidden = paso === 1;
    seguir.textContent = paso === TOTAL ? 'Pedir mi cotización' : 'Continuar';
    const telefono = form.elements.telefono;
    if (telefono) {
      const p = OPCIONES.pais[valor('pais')];
      telefono.placeholder = p ? `${p.digitos[0]} dígitos` : '';
    }
  }

  function enfocarPaso() {
    const campo = campos[paso - 1];
    const primero = campo.querySelector('input:not([type="hidden"]), select');
    if (primero) primero.focus({ preventScroll: true });
    const caja = form.getBoundingClientRect();
    if (caja.top < 70 || caja.top > innerHeight * 0.5) form.scrollIntoView({ behavior: sinMovimiento ? 'auto' : 'smooth', block: 'start' });
  }

  function avanzar() {
    const { errores } = validarEnvio(datos());
    const propios = CAMPOS_POR_PASO[paso].filter((k) => errores[k]);
    mostrarErrores(errores, paso);
    if (propios.length) { form.elements[propios[0]]?.focus?.(); return false; }
    if (paso < TOTAL) { paso++; pintar(); enfocarPaso(); }
    return true;
  }

  form.addEventListener('input', () => {
    if (!empezo) { empezo = true; senal('FormStart', {}, true); }
    falla.hidden = true;
  });
  form.addEventListener('focusin', () => { if (!empezo) { empezo = true; senal('FormStart', {}, true); } });

  /* Una respuesta de un toque avanza sola. */
  form.addEventListener('change', (e) => {
    if (e.target.type === 'radio') setTimeout(() => { if (!enviando) avanzar(); }, 220);
    if (e.target.name === 'pais') pintar();
  });
  atras.addEventListener('click', () => { if (paso > 1) { paso--; pintar(); mostrarErrores({}, paso); enfocarPaso(); } });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (enviando) return;
    if (paso < TOTAL) { avanzar(); return; }
    const d = datos();
    const { ok, errores } = validarEnvio(d);
    if (!ok) {
      const primero = Number(Object.entries(CAMPOS_POR_PASO).find(([, cs]) => cs.some((c) => errores[c]))?.[0] || TOTAL);
      if (primero !== paso) { paso = primero; pintar(); }
      mostrarErrores(errores, paso);
      return;
    }
    enviando = true;
    seguir.disabled = true;
    seguir.textContent = 'Enviando…';

    const eventId = crypto.randomUUID ? crypto.randomUUID() : `c${Date.now()}${Math.random().toString(16).slice(2, 10)}`;
    let guardada = false;
    try {
      const control = new AbortController();
      const reloj = setTimeout(() => control.abort(), 12000);
      const r = await fetch('/api/cotizacion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...d, ref_interna: valor('ref_interna'), eventId, url: location.href, campana: leerCampana(new URLSearchParams(location.search)) }),
        signal: control.signal,
      });
      clearTimeout(reloj);
      const cuerpo = await r.json().catch(() => ({}));
      if (r.status === 400 && cuerpo.errores) {
        enviando = false; seguir.disabled = false; pintar();
        mostrarErrores(cuerpo.errores, paso);
        return;
      }
      guardada = r.ok && cuerpo.ok === true;
    } catch {
      guardada = false;
    }
    terminar(d, guardada);
  });

  function terminar(d, guardada) {
    const enlace = enlaceWhatsApp(WHATSAPP, mensajeWhatsApp(d));
    $('#gracias-wa').href = enlace;
    if (!guardada) {
      $('#gracias-titulo').textContent = 'No pudimos guardar tu pedido.';
      $('#gracias-texto').textContent = 'Escríbenos por WhatsApp y te atendemos igual: el mensaje ya va armado con lo que nos contaste.';
    }
    form.hidden = true;
    gracias.hidden = false;
    gracias.focus({ preventScroll: true });
    gracias.scrollIntoView({ behavior: sinMovimiento ? 'auto' : 'smooth', block: 'center' });
  }

  pintar();
})();

/* ══════════════════════════════════════════════════════════════════════
   La U de DÚO atrayendo píxeles — la misma animación del sitio anterior.
   ══════════════════════════════════════════════════════════════════════ */
(function isotipo() {
  const canvas = $('#duo-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = 180, H = 210, PAD = 80, VW = W + PAD * 2;
  const AMBER = '#F9B233', ORANGE = '#EC6730', WHITE = '#FAF7F1';
  let raf = null, running = false, time = 0, scrollEnergy = 0, lastScrollY = scrollY || 0;
  const particles = [], impacts = [], TOTAL = 24;
  const squares = [
    { x: 43, y: 43, s: 15, color: AMBER }, { x: 96, y: 43, s: 15, color: AMBER },
    { x: 58, y: 68, s: 15, color: ORANGE }, { x: 107, y: 68, s: 15, color: ORANGE },
  ];
  const squarePulse = [0, 0, 0, 0];
  function resize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    const sx = canvas.width / VW;
    ctx.setTransform(sx, 0, 0, canvas.height / H, PAD * sx, 0);
  }
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function bezier(p0, p1, p2, p3, t) {
    const u = 1 - t, tt = t * t, uu = u * u;
    return { x: uu * u * p0.x + 3 * uu * t * p1.x + 3 * u * tt * p2.x + tt * t * p3.x, y: uu * u * p0.y + 3 * uu * t * p1.y + 3 * u * tt * p2.y + tt * t * p3.y };
  }
  function squareTarget(i) {
    const q = squares[i], side = Math.floor(Math.random() * 3), u = Math.random() * q.s;
    if (side === 0) return { x: q.x + u, y: q.y - 2.4 };
    if (side === 1) return { x: q.x - 2.4, y: q.y + u };
    return { x: q.x + q.s + 2.4, y: q.y + u };
  }
  function createParticle(i) {
    const route = i % 5, targetIndex = Math.floor(Math.random() * squares.length), target = squareTarget(targetIndex);
    let start;
    if (route === 0) start = { x: -(34 + Math.random() * 40), y: 24 + Math.random() * 64 };
    else if (route === 1) start = { x: W + 34 + Math.random() * 40, y: 24 + Math.random() * 64 };
    else if (route === 2) start = { x: 28 + Math.random() * 124, y: 5 + Math.random() * 12 };
    else if (route === 3) start = { x: -(26 + Math.random() * 34), y: 8 + Math.random() * 44 };
    else start = { x: W + 26 + Math.random() * 34, y: 8 + Math.random() * 44 };
    return { start, target, targetIndex, progress: Math.random(), speed: 0.0028 + Math.random() * 0.0025, size: 2.4 + Math.random() * 3.6, alpha: 0.62 + Math.random() * 0.38, jitter: Math.random() * Math.PI * 2, hold: 0, color: targetIndex < 2 ? AMBER : ORANGE };
  }
  function resetParticle(p) { Object.assign(p, createParticle(Math.floor(Math.random() * 9999))); p.progress = 0; }
  function particlePath(p, t) {
    const e = ease(t), mx = 82 + Math.sin(p.jitter) * 28, my = 48 + Math.cos(p.jitter) * 18;
    return bezier(p.start, { x: p.start.x * 0.62 + mx * 0.38, y: p.start.y * 0.72 + my * 0.28 }, { x: mx, y: my }, p.target, e);
  }
  function drawPixel(x, y, size, color, alpha) {
    const ps = Math.max(2, Math.round(size));
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color; ctx.shadowColor = color; ctx.shadowBlur = 7;
    ctx.fillRect(Math.round(x - size / 2), Math.round(y - size / 2), ps, ps); ctx.restore();
  }
  function withBoost(boost, fn) { ctx.save(); ctx.translate(W / 2, H / 2); ctx.scale(1 + boost, 1 + boost); ctx.translate(-W / 2, -H / 2); fn(); ctx.restore(); }
  function drawParticle(p, boost) {
    const progress = Math.min(1, p.progress), pos = particlePath(p, progress);
    const alpha = Math.max(0, Math.min(Math.min(1, progress * 5), Math.min(1, (1 - progress) * 7))) * p.alpha;
    const x = pos.x + Math.sin(time * 0.08 + p.jitter) * 1.15, y = pos.y + Math.cos(time * 0.07 + p.jitter);
    withBoost(boost, () => {
      ctx.globalAlpha = alpha * 0.28; ctx.strokeStyle = p.color; ctx.lineWidth = 1.25; ctx.lineCap = 'round';
      ctx.beginPath();
      for (let i = 8; i >= 0; i--) {
        const tr = particlePath(p, Math.max(0, progress - i * 0.023));
        if (i === 8) ctx.moveTo(tr.x, tr.y); else ctx.lineTo(tr.x, tr.y);
      }
      ctx.stroke();
      drawPixel(x, y, p.size, p.color, alpha);
    });
  }
  function drawSquare(sq, pulse) {
    const cx = sq.x + sq.s / 2, cy = sq.y + sq.s / 2, r = 24 + pulse * 8;
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    const rgb = sq.color === AMBER ? '249,178,51' : '236,103,48';
    g.addColorStop(0, `rgba(${rgb},${0.16 + pulse * 0.16})`); g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.save(); ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    ctx.shadowColor = sq.color; ctx.shadowBlur = 12 + pulse * 14; ctx.fillStyle = sq.color; ctx.fillRect(sq.x, sq.y, sq.s, sq.s); ctx.restore();
  }
  function drawU(boost) {
    const pulse = 0.5 + Math.sin(time * 0.045) * 0.5;
    withBoost(boost, () => {
      ctx.fillStyle = WHITE; ctx.beginPath();
      ctx.moveTo(57, 88); ctx.lineTo(74, 88); ctx.lineTo(74, 126); ctx.bezierCurveTo(74, 146, 106, 146, 106, 126); ctx.lineTo(106, 88); ctx.lineTo(123, 88); ctx.lineTo(123, 127); ctx.bezierCurveTo(123, 166, 57, 166, 57, 127); ctx.closePath(); ctx.fill();
      squares.forEach((sq, i) => drawSquare(sq, pulse * 0.24 + squarePulse[i]));
    });
  }
  function update() {
    time++; scrollEnergy *= 0.9;
    for (let i = 0; i < 4; i++) squarePulse[i] *= 0.91;
    for (let i = impacts.length - 1; i >= 0; i--) { impacts[i].life *= 0.9; if (impacts[i].life < 0.05) impacts.splice(i, 1); }
    particles.forEach((p) => {
      if (p.hold > 0) { p.hold--; if (p.hold <= 0) resetParticle(p); return; }
      p.progress += p.speed + scrollEnergy * 0.00055;
      if (p.progress >= 1) {
        squarePulse[p.targetIndex] = Math.min(1, squarePulse[p.targetIndex] + 0.5);
        impacts.push({ x: p.target.x, y: p.target.y, size: Math.max(2.5, p.size * 0.82), color: p.color, life: 1 });
        if (impacts.length > 14) impacts.shift();
        p.hold = 8 + Math.floor(Math.random() * 14);
      }
    });
  }
  function render() {
    ctx.clearRect(-PAD, -4, VW + 8, H + 8);
    const boost = Math.min(0.14, scrollEnergy * 0.014);
    ctx.save(); ctx.translate(Math.sin(time * 0.014) * 2.2, Math.sin(time * 0.022) * 6);
    particles.forEach((p) => { if (p.hold <= 0) drawParticle(p, boost); });
    withBoost(boost, () => impacts.forEach((m) => drawPixel(m.x, m.y, m.size, m.color, Math.min(0.85, m.life))));
    drawU(boost);
    ctx.restore();
  }
  function tick() { update(); render(); raf = requestAnimationFrame(tick); }
  function start() {
    if (running) return; running = true; resize();
    if (!particles.length) { for (let i = 0; i < TOTAL; i++) particles.push(createParticle(i)); for (let i = 0; i < 130; i++) update(); }
    if (sinMovimiento) { render(); running = false; return; }
    tick();
  }
  function stop() { running = false; cancelAnimationFrame(raf); }
  addEventListener('resize', () => { if (running) resize(); });
  addEventListener('scroll', () => { const y = scrollY || 0; scrollEnergy = Math.min(10, scrollEnergy + Math.abs(y - lastScrollY) * 0.04); lastScrollY = y; }, { passive: true });
  new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); else stop(); }, { threshold: 0.05 }).observe(canvas);
})();

/* Píxeles que suben despacio detrás del hero. */
(function cosmos() {
  const cv = $('canvas.cosmos');
  if (!cv || sinMovimiento) return;
  const ctx = cv.getContext('2d');
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const COLORES = ['#FAF7F1', '#F9B233', '#EC6730'];
  let w = 0, h = 0, estrellas = [], raf = null, t = 0;
  const nueva = (cualquiera) => {
    const prof = Math.random(), r = Math.random();
    return { x: Math.random() * w, y: cualquiera ? Math.random() * h : h + 8 * dpr, s: (prof < 0.82 ? 1 + Math.random() * 1.5 : 2 + Math.random() * 2.6) * dpr, v: (0.05 + prof * 0.24) * dpr, a: 0.12 + prof * 0.5, tw: Math.random() * 6.28, c: COLORES[r < 0.06 ? 2 : r < 0.14 ? 1 : 0] };
  };
  function medir() {
    const r = cv.getBoundingClientRect();
    w = cv.width = Math.round(r.width * dpr); h = cv.height = Math.round(r.height * dpr);
    estrellas = Array.from({ length: Math.min(120, Math.max(40, Math.round((r.width * r.height) / 9000))) }, () => nueva(true));
  }
  function cuadro() {
    t++; ctx.clearRect(0, 0, w, h);
    for (const e of estrellas) {
      e.y -= e.v; if (e.y < -8) Object.assign(e, nueva(false));
      ctx.globalAlpha = e.a * (0.7 + Math.sin(t * 0.02 + e.tw) * 0.3); ctx.fillStyle = e.c;
      const s = Math.max(1, Math.round(e.s)); ctx.fillRect(Math.round(e.x), Math.round(e.y), s, s);
    }
    raf = requestAnimationFrame(cuadro);
  }
  new IntersectionObserver(([e]) => { cancelAnimationFrame(raf); if (e.isIntersecting) { if (!w) medir(); cuadro(); } }, { threshold: 0.02 }).observe(cv);
  addEventListener('resize', () => { if (w) medir(); });
})();
