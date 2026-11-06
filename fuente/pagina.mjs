/* Plantilla de la portada. Recibe los datos de datos/datos.mjs y devuelve el
 * HTML completo. Ninguna cifra vive acá: si hace falta un número, se agrega a
 * datos.mjs y se pasa por parámetro. */

import { OPCIONES } from '../publico/js/cotizacion.js';

export const esc = (t) => String(t ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const ICONOS = {
  estrategia: '<path d="M4 19V9"/><path d="M10 19V5"/><path d="M16 19v-7"/><path d="M3 21h18"/><circle cx="19" cy="6" r="2"/>',
  campanas: '<path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1z"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/>',
  guiones: '<path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/><path d="M9 13h6"/><path d="M9 17h4"/>',
  animado: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m10 9 5 3-5 3z"/><path d="M7 2v3M17 2v3"/>',
  web: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18"/><path d="M8 14h5"/>',
  escudo: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/>',
  whatsapp: null,
};

const icono = (nombre, clase = 'ico') => `<svg class="${clase}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[nombre]}</svg>`;

const WA_SVG = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.15-1.77-.87-2.04-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.46-2.4-1.48-.89-.79-1.49-1.77-1.66-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51l-.57-.01c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48 0 1.46 1.06 2.87 1.21 3.07.15.2 2.09 3.2 5.07 4.49.71.31 1.26.49 1.69.62.71.23 1.36.2 1.87.12.57-.08 1.77-.72 2.02-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35zM12.04 21.5h-.01a9.45 9.45 0 01-4.82-1.32l-.35-.2-3.58.94.96-3.49-.23-.36a9.42 9.42 0 01-1.45-5.03c0-5.21 4.25-9.45 9.47-9.45 2.53 0 4.9.99 6.69 2.77a9.4 9.4 0 012.77 6.69c0 5.21-4.25 9.45-9.46 9.45z"/></svg>';

const FLECHA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>';

function waEnlace(numero, texto) {
  return `https://wa.me/${numero}?text=${encodeURIComponent(texto)}`;
}

/* ─── Bloques ─────────────────────────────────────────────────────────────── */

function cabecera() {
  return `
<header class="barra" id="barra">
  <div class="contenedor barra-in">
    <a href="#inicio" class="marca" aria-label="DÚO Marketing Digital, inicio">
      <img src="/logos/duo-wordmark-white.png" alt="DÚO Marketing Digital" width="908" height="678" class="marca-logo">
    </a>
    <nav class="barra-nav" aria-label="Secciones">
      <a href="#resultados">Resultados</a>
      <a href="#videos">Videos</a>
      <a href="#servicios">Servicios</a>
      <a href="#como">Cómo trabajamos</a>
    </nav>
    <a href="#cotizar" class="boton boton-chico">Cotizar</a>
  </div>
</header>`;
}

const PARLANTE = '<svg class="ico-con" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="M15.5 8.5a5 5 0 0 1 0 7"/><path d="M18.5 5.5a9 9 0 0 1 0 13"/></svg><svg class="ico-sin" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M11 5 6 9H3v6h3l5 4z" fill="currentColor"/><path d="m16 9 5 6M21 9l-5 6"/></svg>';

function hero({ TABLERO, VIDEO_HERO: V, PAISES }) {
  const tarjeta = (t, i) => `
        <div class="dato dato-${i + 1}">
          <img src="${t.logo}" alt="" width="220" height="220" class="dato-logo">
          <div class="dato-txt">
            <b class="dato-valor" data-contar>${esc(t.valor)}</b>
            <span class="dato-etq">${esc(t.etiqueta)}</span>
            <span class="dato-marca">${esc(t.marca)}</span>
          </div>
        </div>`;
  return `
<section class="hero" id="inicio">
  <canvas class="cosmos" aria-hidden="true"></canvas>
  <div class="contenedor hero-in">
    <div class="hero-txt">
      <div class="hero-u"><canvas id="duo-canvas" role="img" aria-label="La U de DÚO atrayendo píxeles naranjas y ámbar"></canvas></div>
      <h1>No salgas a perseguir clientes. <span class="h1-acento">Haz que te busquen.</span></h1>
      <p class="hero-sub">Armamos la estrategia, escribimos los guiones y manejamos tu publicidad en Facebook e Instagram. Y lo medimos con lo que importa: lo que vendes.</p>
      <div class="hero-acciones">
        <a href="#cotizar" class="boton" data-origen="hero">Cotizar mi proyecto ${FLECHA}</a>
        <a href="#resultados" class="boton boton-linea">Ver resultados</a>
      </div>
      <p class="hero-paises">Trabajamos con marcas de ${esc(PAISES)}.</p>
    </div>

    <div class="escena">
      <div class="telefono-pie">
        <!-- El teléfono responde al toque igual que el botón de sonido; el
             botón es el control accesible, el teléfono solo un atajo. -->
        <div class="telefono" id="telefono" data-sonido>
          <span class="telefono-pantalla">
            <img class="tel-poster" src="${V.poster}" alt="" width="540" height="960" fetchpriority="high">
            <video class="tel-video" id="video-hero" muted loop playsinline preload="none" data-src="${V.src}" aria-label="Video animado del método DÚO3X, ${esc(V.duracion)}"></video>
            <span class="tel-red">${V.etiqueta.split(' · ').map((t, i) => (i ? `<span class="tel-red-extra"> · ${esc(t)}</span>` : esc(t))).join('')}</span>
          </span>
        </div>
        <button type="button" class="sonido" id="boton-sonido" data-sonido aria-pressed="false"><span class="sonido-ico">${PARLANTE}</span><span class="sonido-txt">Activar sonido</span></button>
      </div>
      <div class="datos-hero">
        ${TABLERO.map(tarjeta).join('')}
      </div>
    </div>
  </div>
</section>`;
}

function cintaMarcas(MARCAS_CINTA) {
  const item = (m) => `<span class="cinta-item"><img src="${m.logo}" alt="${esc(m.marca)}" width="220" height="220" loading="lazy" decoding="async"></span>`;
  return `
<div class="cinta" aria-label="Marcas con las que trabajamos">
  <p class="cinta-titulo">Marcas con las que trabajamos</p>
  <div class="cinta-mascara"><div class="cinta-pista">${MARCAS_CINTA.map(item).join('')}${MARCAS_CINTA.map(item).join('').replace(/alt="[^"]*"/g, 'alt="" aria-hidden="true"')}</div></div>
</div>`;
}

function resultados(CASOS) {
  const tab = (c, i) => `<button type="button" role="tab" class="pestana" id="tab-${c.id}" aria-controls="caso-${c.id}" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}"><img src="${c.logo}" alt="" width="220" height="220">${esc(c.marca)}</button>`;
  const panel = (c, i) => `
    <article class="caso" role="tabpanel" id="caso-${c.id}" aria-labelledby="tab-${c.id}" ${i === 0 ? '' : 'hidden'}>
      <a class="caso-captura" href="${c.captura}" target="_blank" rel="noopener" aria-label="Ver la captura completa de ${esc(c.marca)}">
        <img src="${c.captura}" alt="${esc(c.capturaAlt)}" width="${c.capturaAncho ?? 1800}" height="${c.capturaAlto ?? 840}" loading="lazy" decoding="async">
        <span class="caso-pie">Captura del Administrador de anuncios de Meta · ampliar</span>
      </a>
      <div class="caso-cuerpo">
        <p class="caso-meta">${esc(c.rubro)} · ${esc(c.pais)} · ${esc(c.periodo)}</p>
        <h3>${esc(c.titular)}</h3>
        <dl class="caso-pasos">
          ${c.pasos.map(([t, d]) => `<div><dt>${esc(t)}</dt><dd>${esc(d)}</dd></div>`).join('\n          ')}
        </dl>
        <ul class="caso-cifras">
          ${c.cifras.map(([v, e]) => `<li><b>${esc(v)}</b><span>${esc(e)}</span></li>`).join('\n          ')}
        </ul>
        <p class="caso-periodo">Período: ${esc(c.periodo)}.${c.perfil ? ` <a href="${c.perfil.url}" target="_blank" rel="noopener">${esc(c.perfil.usuario)}</a>, ${esc(c.perfil.seguidores)} seguidores en Instagram.` : ''}</p>
      </div>
    </article>`;
  return `
<section class="resultados" id="resultados">
  <div class="contenedor">
    <div class="titulo-sec">
      <h2>Cualquier campaña puede tener un buen mes.</h2>
      <p class="titulo-destacado">Lo nuestro es sostener las ventas un año completo, sin apagar las campañas.</p>
      <p>Dos cuentas que manejamos hoy. Cada número lleva su período y la captura real del Administrador de anuncios.</p>
    </div>
    <div class="pestanas" role="tablist" aria-label="Casos">
      ${CASOS.map(tab).join('\n      ')}
    </div>
    ${CASOS.map(panel).join('')}
  </div>
</section>`;
}

function videos(VIDEOS) {
  const tarjeta = (v) => `
      <${v.url ? `a href="${v.url}" target="_blank" rel="noopener"` : 'div'} class="clip">
        <img class="clip-poster" src="${v.poster}" alt="" width="480" height="854" loading="lazy" decoding="async">
        <video muted loop playsinline preload="none" data-src="${v.video}" aria-hidden="true"></video>
        ${v.vistas ? `<span class="clip-vistas"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>${esc(v.vistas)}</span>` : ''}
        <span class="clip-pie"><b>${esc(v.marca)}</b><i>${esc(v.rubro)}</i></span>
      </${v.url ? 'a' : 'div'}>`;
  const logo = (v) => `<span class="muro-logo"><img src="${v.logo}" alt="" width="220" height="220" loading="lazy" decoding="async"></span>`;
  return `
<section class="videos" id="videos">
  <div class="contenedor">
    <div class="titulo-sec">
      <h2>Videos que la gente eligió ver.</h2>
      <p>Vistas orgánicas en TikTok de marcas con las que trabajamos. Cada uno salió de un guion: un gancho, una estructura y un objetivo.</p>
    </div>
  </div>
  <div class="muro" aria-label="Videos de clientes en TikTok">
    <div class="muro-logos" aria-hidden="true"><div class="muro-pista">${VIDEOS.map(logo).join('')}${VIDEOS.map(logo).join('')}</div></div>
    <div class="muro-tira"><div class="muro-pista" id="muro-videos">${VIDEOS.map(tarjeta).join('')}${VIDEOS.map(tarjeta).join('').replace(/class="clip"/g, 'class="clip" aria-hidden="true" tabindex="-1"')}</div></div>
  </div>
</section>`;
}

const SERVICIOS = [
  ['estrategia', 'Estrategia y plan', 'Qué vender, a quién y con qué mensaje, y cuánto puedes pagar por cada cliente antes de invertir.'],
  ['campanas', 'Publicidad en Facebook e Instagram', 'Campañas según el objetivo de tu negocio. Ampliamos lo que vende y apagamos lo que no.'],
  ['guiones', 'Guiones y dirección de contenido', 'Guiones y escenas para que tu equipo grabe con nuestras pautas. Si lo necesitas, editamos.'],
  ['animado', 'Video animado con IA', 'Guion, voz y animación hechos con inteligencia artificial, con tu marca y tus clips reales.'],
  ['web', 'Sitio web y landing', 'Páginas que reciben a quien hace clic en tu anuncio y guardan cada contacto.'],
];

function servicios() {
  return `
<section class="servicios" id="servicios">
  <div class="contenedor">
    <div class="titulo-sec">
      <h2>Tu departamento de marketing, sin armarlo dentro de tu empresa.</h2>
      <p>Un especialista para cada parte. Eliges lo que necesitas, o armamos el sistema completo.</p>
    </div>
    <ul class="serv-lista">
      ${SERVICIOS.map(([ic, t, d]) => `<li class="serv">${icono(ic)}<h3>${esc(t)}</h3><p>${esc(d)}${ic === 'animado' ? ' <a href="#inicio" class="serv-ejemplo" data-sonido>Ver un ejemplo</a>' : ''}</p></li>`).join('\n      ')}
      <li class="serv serv-cta">
        <p>Cada propuesta se arma a tu medida, según lo que vendes y hasta dónde quieres llegar.</p>
        <a href="#cotizar" class="boton" data-origen="servicios">Cotizar mi proyecto ${FLECHA}</a>
      </li>
    </ul>
  </div>
</section>`;
}

const PASOS = [
  ['Diagnóstico', 'Estudiamos tu negocio, tus números y tu competencia, y cuánto puedes pagar por un cliente sin perder plata.'],
  ['Planificación', 'El objetivo, los mensajes para cada tipo de cliente y el contenido de cada campaña.'],
  ['Creación', 'Escribimos los guiones, tu equipo graba con nuestras pautas y lanzamos las campañas.'],
  ['Optimización', 'Medimos con los datos de tu negocio, no solo con los de Meta. Cada semana: qué ampliar y qué apagar.'],
];

function como(GARANTIA) {
  return `
<section class="como" id="como">
  <div class="contenedor">
    <div class="titulo-sec">
      <h2>Sistemas de venta que se miden, no se prometen.</h2>
    </div>
    <ol class="pasos" id="pasos">
      ${PASOS.map(([t, d], i) => `<li class="paso"><span class="paso-n">${i + 1}</span><h3>${esc(t)}</h3><p>${esc(d)}</p></li>`).join('\n      ')}
    </ol>
    <div class="garantia">
      ${icono('escudo', 'garantia-ico')}
      <div>
        <h3>${esc(GARANTIA.titular)}</h3>
        <p>${esc(GARANTIA.detalle)}</p>
      </div>
    </div>
  </div>
</section>`;
}

function equipo(EQUIPO, PAISES) {
  return `
<section class="equipo" id="equipo">
  <div class="contenedor equipo-in">
    <div class="equipo-txt">
      <h2>Un equipo chico que conoce cada cuenta por dentro.</h2>
      <p>Somos ${EQUIPO.personas === 5 ? 'cinco' : EQUIPO.personas}. Nacimos en Yacuiba y trabajamos en línea con marcas de ${esc(PAISES)}. Usamos inteligencia artificial para leer los números de cada cuenta y decidir más rápido.</p>
    </div>
    <div class="caras">
      ${EQUIPO.retratos.map((p) => `<figure class="cara"><span class="cara-foto"><img src="${p.foto}" alt="${esc(p.nombre)}, ${esc(p.rol.toLowerCase())} de DÚO" width="620" height="620" loading="lazy" decoding="async"></span><figcaption><b>${esc(p.nombre)}</b><span>${esc(p.rol)}</span></figcaption></figure>`).join('\n      ')}
    </div>
  </div>
</section>`;
}

function formulario(CONTACTO) {
  const pildora = (grupo, clave, texto, tipo) => `<label class="pildora"><input type="${tipo}" name="${grupo}" value="${clave}"${tipo === 'radio' ? ' required' : ''}><span>${esc(texto)}</span></label>`;
  const paises = Object.entries(OPCIONES.pais).map(([k, p]) => `<option value="${k}"${k === 'bo' ? ' selected' : ''}>${esc(p.nombre)} +${p.prefijo}</option>`).join('');
  const waDirecto = waEnlace(CONTACTO.whatsapp, 'Hola DÚO, quiero una cotización.');
  return `
<section class="cotizar" id="cotizar">
  <div class="contenedor cotizar-in">
    <div class="cotizar-txt">
      <h2>Cuéntanos tu proyecto. Te enviamos la cotización.</h2>
      <p>Cinco preguntas, menos de un minuto. Después te escribimos por WhatsApp para coordinar una reunión corta y enviarte la propuesta.</p>
      <p class="cotizar-directo">¿Prefieres escribirnos ya? <a href="${waDirecto}" class="wa-enlace" data-wa="Hola DÚO, quiero una cotización." target="_blank" rel="noopener">Escríbenos por WhatsApp</a></p>
    </div>

    <form class="form" id="form-cotizar" novalidate>
      <div class="form-progreso" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <p class="form-paso" id="form-paso" aria-live="polite">Paso 1 de 5</p>

      <fieldset class="campo" data-paso="1">
        <legend>¿Qué necesitas?</legend>
        <p class="campo-ayuda">Puedes elegir más de una.</p>
        <div class="pildoras">
          ${Object.entries(OPCIONES.necesita).map(([k, t]) => pildora('necesita', k, t, 'checkbox')).join('\n          ')}
        </div>
        <p class="campo-error" data-error="necesita"></p>
      </fieldset>

      <fieldset class="campo" data-paso="2" hidden>
        <legend>Tu negocio</legend>
        <label class="entrada"><span>¿Qué vende tu negocio?</span><input type="text" name="rubro" maxlength="80" autocomplete="organization" placeholder="Ej.: ropa de mujer, clínica estética, pizzería"></label>
        <p class="campo-error" data-error="rubro"></p>
        <label class="entrada"><span>¿En qué ciudad? <i>(opcional)</i></span><input type="text" name="ciudad" maxlength="60" autocomplete="address-level2" placeholder="Ej.: Santa Cruz"></label>
      </fieldset>

      <fieldset class="campo" data-paso="3" hidden>
        <legend>¿Cuánto inviertes hoy en publicidad al mes?</legend>
        <div class="pildoras">
          ${Object.entries(OPCIONES.inversion).map(([k, t]) => pildora('inversion', k, t, 'radio')).join('\n          ')}
        </div>
        <p class="campo-error" data-error="inversion"></p>
      </fieldset>

      <fieldset class="campo" data-paso="4" hidden>
        <legend>¿Cuándo quieres empezar?</legend>
        <div class="pildoras">
          ${Object.entries(OPCIONES.plazo).map(([k, t]) => pildora('plazo', k, t, 'radio')).join('\n          ')}
        </div>
        <p class="campo-error" data-error="plazo"></p>
      </fieldset>

      <fieldset class="campo" data-paso="5" hidden>
        <legend>¿A quién le escribimos?</legend>
        <label class="entrada"><span>Tu nombre</span><input type="text" name="nombre" maxlength="60" autocomplete="name" placeholder="Nombre y apellido"></label>
        <p class="campo-error" data-error="nombre"></p>
        <div class="entrada"><span id="tel-etq">Tu WhatsApp</span>
          <div class="telefono-campo">
            <select name="pais" aria-label="País del número">${paises}</select>
            <input type="tel" name="telefono" inputmode="numeric" autocomplete="tel-national" maxlength="16" placeholder="7XXXXXXX" aria-labelledby="tel-etq">
          </div>
        </div>
        <p class="campo-error" data-error="telefono"></p>
        <p class="form-legal">Usamos estos datos solo para responderte. <a href="/privacidad/">Privacidad</a>.</p>
      </fieldset>

      <label class="trampa" aria-hidden="true">Referencia interna <input type="text" name="ref_interna" tabindex="-1" autocomplete="off"></label>

      <div class="form-acciones">
        <button type="button" class="boton boton-linea" id="form-atras" hidden>Atrás</button>
        <button type="submit" class="boton" id="form-seguir">Continuar</button>
      </div>
      <p class="form-falla" id="form-falla" role="alert" hidden></p>
    </form>

    <div class="gracias" id="gracias" hidden tabindex="-1">
      <h3 id="gracias-titulo">Cotización pedida.</h3>
      <p id="gracias-texto">Te escribimos por WhatsApp para coordinar la reunión. Si quieres adelantarte, escríbenos ahora: el mensaje ya va armado.</p>
      <a class="boton boton-wa" id="gracias-wa" href="${waDirecto}">${WA_SVG} Escribir por WhatsApp</a>
    </div>
  </div>
</section>`;
}

const PREGUNTAS = [
  ['¿Cuánto cuesta trabajar con ustedes?', 'Depende de lo que necesites: qué servicios, cuántas campañas y cuánto contenido por mes. Por eso cotizamos cada proyecto: completas el formulario, nos reunimos y te enviamos una propuesta con lo que haríamos y lo que cuesta.'],
  ['¿Ustedes graban el contenido?', 'Escribimos los guiones y las escenas, y tu equipo graba con esas pautas. Si lo necesitas, editamos lo que grabaste. Los videos animados con IA los hacemos completos.'],
  ['¿Trabajan con negocios de otras ciudades o países?', null],
  ['¿La inversión en anuncios está incluida?', 'No. Lo que inviertes en Meta va aparte de nuestro trabajo. En la propuesta te decimos cuánto conviene invertir según tu objetivo.'],
  ['¿En cuánto tiempo se ven resultados?', 'Los primeros datos llegan en las primeras semanas de campaña, y con ellos decidimos qué ampliar y qué apagar. No prometemos ventas: dependen también de tu producto, tu precio y tu mercado.'],
];

function preguntas(PAISES) {
  const respuesta = (r) => r ?? `Sí. Trabajamos en línea con marcas de ${esc(PAISES)}.`;
  return `
<section class="preguntas" id="preguntas">
  <div class="contenedor preguntas-in">
    <h2>Preguntas frecuentes</h2>
    <div class="lista-preguntas">
      ${PREGUNTAS.map(([p, r]) => `<details><summary>${esc(p)}</summary><p>${respuesta(r)}</p></details>`).join('\n      ')}
    </div>
  </div>
</section>`;
}

export function pie({ CONTACTO, REDES }) {
  return `
<footer class="pie">
  <div class="contenedor pie-in">
    <div class="pie-marca">
      <img src="/logos/duo-wordmark-white.png" alt="DÚO Marketing Digital" width="908" height="678" loading="lazy">
      <p>Agencia de marketing digital estratégico.<br>${esc(CONTACTO.ciudad)}</p>
    </div>
    <nav class="pie-col" aria-label="Redes">
      ${REDES.map((r) => `<a href="${r.url}" target="_blank" rel="noopener">${esc(r.red)} · ${esc(r.usuario)}</a>`).join('\n      ')}
    </nav>
    <nav class="pie-col" aria-label="Contacto">
      <a href="${waEnlace(CONTACTO.whatsapp, 'Hola DÚO, quiero una cotización.')}" class="wa-enlace" data-wa="Hola DÚO, quiero una cotización." target="_blank" rel="noopener">WhatsApp</a>
      <a href="#cotizar">Cotizar un proyecto</a>
      <a href="/privacidad/">Privacidad</a>
    </nav>
  </div>
  <div class="contenedor pie-base"><span>© <span data-anio>2026</span> DÚO Marketing Digital</span></div>
</footer>`;
}

function flotantes(CONTACTO) {
  const wa = waEnlace(CONTACTO.whatsapp, 'Hola DÚO, quiero una cotización.');
  return `
<div class="barra-movil" id="barra-movil">
  <a href="#cotizar" class="boton" data-origen="barra-movil">Cotizar mi proyecto</a>
  <a href="${wa}" class="barra-movil-wa wa-enlace" data-wa="Hola DÚO, quiero una cotización." target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">${WA_SVG}</a>
</div>
<a href="${wa}" class="wa-flotante wa-enlace" data-wa="Hola DÚO, quiero una cotización." target="_blank" rel="noopener" aria-label="Escribir por WhatsApp">${WA_SVG}</a>`;
}

/* ─── Documento ───────────────────────────────────────────────────────────── */

export function cabezaHtml({ titulo, descripcion, url = 'https://duomarketingdigital.com/', extra = '' }) {
  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="theme-color" content="#121210">
<title>${esc(titulo)}</title>
<meta name="description" content="${esc(descripcion)}">
<link rel="canonical" href="${url}">
<meta property="og:type" content="website">
<meta property="og:url" content="${url}">
<meta property="og:title" content="${esc(titulo)}">
<meta property="og:description" content="${esc(descripcion)}">
<meta property="og:image" content="https://duomarketingdigital.com/images/og-duo.jpg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:site_name" content="DÚO Marketing Digital">
<meta property="og:locale" content="es_BO">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" type="image/png" href="/logos/duo-icon.png">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@700;800;900&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/estilos.css">
${extra}
</head>`;
}

export function portada(D) {
  const descripcion = 'Agencia de marketing digital en Bolivia. Estrategia, guiones y publicidad en Facebook e Instagram medidos con tus ventas: +US$1 millón vendido en 13 meses para una tienda online. Pide tu cotización.';
  const jsonld = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: 'DÚO Marketing Digital',
    url: 'https://duomarketingdigital.com/',
    image: 'https://duomarketingdigital.com/images/og-duo.jpg',
    description: descripcion,
    address: { '@type': 'PostalAddress', addressLocality: 'Yacuiba', addressRegion: 'Tarija', addressCountry: 'BO' },
    sameAs: D.REDES.map((r) => r.url),
  };
  const datosPagina = {
    whatsapp: D.CONTACTO.whatsapp,
  };
  // La entrada del hero arranca oculta solo si hay JS; si el módulo no llega a
  // correr, a los 2,5 s se muestra igual.
  const precarga = `<script>document.documentElement.classList.add('js');setTimeout(function(){var h=document.getElementById('inicio');if(h)h.classList.add('listo')},2500)</script>
<link rel="preload" as="image" href="${D.VIDEO_HERO.poster}" fetchpriority="high">
<script type="application/ld+json">${JSON.stringify(jsonld).replace(/</g, '\\u003c')}</script>`;
  return `${cabezaHtml({ titulo: 'DÚO — Agencia de marketing digital en Bolivia', descripcion, extra: precarga })}
<body>
<a class="saltar" href="#cotizar">Ir al formulario de cotización</a>
${cabecera()}
<main>
${hero(D)}
${cintaMarcas(D.MARCAS_CINTA)}
${resultados(D.CASOS)}
${videos(D.VIDEOS)}
${servicios()}
${como(D.GARANTIA)}
${equipo(D.EQUIPO, D.PAISES)}
${formulario(D.CONTACTO)}
${preguntas(D.PAISES)}
</main>
${pie(D)}
${flotantes(D.CONTACTO)}
<script id="cfg" type="application/json">{}</script>
<script id="datos-pagina" type="application/json">${JSON.stringify(datosPagina).replace(/</g, '\\u003c')}</script>
<script type="module" src="/js/app.js"></script>
</body>
</html>
`;
}
