/* Lógica del formulario de cotización.
 *
 * La importan el navegador (js/app.js) y el Worker (_worker.js). Que sea el
 * mismo archivo es lo que garantiza que el segmento que ve la persona y el
 * evento que recibe Meta no puedan divergir. Sin DOM, sin red: solo datos.
 */

export const OPCIONES = {
  necesita: {
    campanas: 'Publicidad en Facebook e Instagram',
    contenido: 'Contenido y videos para redes',
    animado: 'Videos animados',
    web: 'Sitio web o landing',
    todo: 'Todo el sistema: estrategia, contenido y publicidad',
    aprender: 'Aprender a hacerlo yo (consultoría)',
  },
  inversion: {
    nada: 'Todavía no invierto',
    bajo: 'Menos de Bs 2.000 al mes',
    medio: 'Entre Bs 2.000 y Bs 10.000 al mes',
    alto: 'Más de Bs 10.000 al mes',
  },
  plazo: {
    este_mes: 'Este mes',
    proximo_mes: 'El próximo mes',
    averiguando: 'Solo estoy averiguando',
  },
  pais: {
    bo: { nombre: 'Bolivia', prefijo: '591', digitos: [8, 8] },
    cl: { nombre: 'Chile', prefijo: '56', digitos: [9, 9] },
    ec: { nombre: 'Ecuador', prefijo: '593', digitos: [9, 9] },
    pe: { nombre: 'Perú', prefijo: '51', digitos: [9, 9] },
    ar: { nombre: 'Argentina', prefijo: '54', digitos: [10, 11] },
    mx: { nombre: 'México', prefijo: '52', digitos: [10, 10] },
    co: { nombre: 'Colombia', prefijo: '57', digitos: [10, 10] },
    py: { nombre: 'Paraguay', prefijo: '595', digitos: [9, 9] },
  },
};

/* CALIENTE es el único que dispara `Lead`: es quien puede contratar el
 * servicio de agencia ahora. Si Meta optimiza hacia todos los envíos, aprende
 * a traer a quien está averiguando, que es más barato y no compra. */
export const SEGMENTOS = {
  CALIENTE: { evento: 'Lead', etiqueta: 'Listo para empezar' },
  TIBIO: { evento: 'LeadSecundario', etiqueta: 'Averiguando' },
  CONSULTORIA: { evento: 'LeadSecundario', etiqueta: 'Quiere aprender' },
};

const SERVICIOS_AGENCIA = ['campanas', 'contenido', 'animado', 'web', 'todo'];

/** Lista de claves válidas de «¿Qué necesitas?», sin repetir y en el orden de OPCIONES. */
export function limpiarNecesita(valor) {
  const lista = Array.isArray(valor) ? valor : String(valor || '').split(',');
  const pedidas = new Set(lista.map((v) => String(v).trim()));
  return Object.keys(OPCIONES.necesita).filter((k) => pedidas.has(k));
}

export function segmentar({ necesita, inversion, plazo }) {
  const lista = limpiarNecesita(necesita);
  const quiereAgencia = lista.some((k) => SERVICIOS_AGENCIA.includes(k));
  if (!quiereAgencia && lista.includes('aprender')) return 'CONSULTORIA';
  const invierte = inversion === 'medio' || inversion === 'alto';
  const pronto = plazo === 'este_mes' || plazo === 'proximo_mes';
  return quiereAgencia && invierte && pronto ? 'CALIENTE' : 'TIBIO';
}

/** Nombre sin espacios dobles ni caracteres de control, hasta 60 caracteres. */
export function limpiarNombre(nombre) {
  return String(nombre || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, 60);
}

export function limpiarTexto(texto, max = 80) {
  return String(texto || '').replace(/[\u0000-\u001f<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, max);
}

/** Solo dígitos, sin el prefijo del país si la persona lo escribió. */
export function normalizarTelefono(telefono, pais = 'bo') {
  let d = String(telefono || '').replace(/\D/g, '');
  const prefijo = OPCIONES.pais[pais]?.prefijo || '';
  if (prefijo && d.startsWith(prefijo) && d.length > (OPCIONES.pais[pais].digitos[1])) d = d.slice(prefijo.length);
  if (pais === 'ar' && d.startsWith('9') && d.length === 11) return d; // móviles con 9 delante
  return d.replace(/^0+/, '');
}

/** Teléfono internacional sin «+»: 591XXXXXXXX. */
export function telefonoInternacional(telefono, pais = 'bo') {
  const p = OPCIONES.pais[pais];
  return p ? p.prefijo + normalizarTelefono(telefono, pais) : '';
}

/**
 * Valida el envío completo. Devuelve { ok, errores } con un mensaje por campo,
 * escrito para la persona (no «campo inválido»).
 */
export function validarEnvio(d = {}) {
  const errores = {};
  if (!limpiarNecesita(d.necesita).length) errores.necesita = 'Elige al menos una opción.';
  if (limpiarTexto(d.rubro).length < 2) errores.rubro = 'Cuéntanos qué vende tu negocio.';
  if (!(d.inversion in OPCIONES.inversion)) errores.inversion = 'Elige cuánto inviertes hoy.';
  if (!(d.plazo in OPCIONES.plazo)) errores.plazo = 'Elige cuándo quieres empezar.';
  const nombre = limpiarNombre(d.nombre);
  if (nombre.length < 2) errores.nombre = 'Escribe tu nombre.';
  else if (!/\p{L}/u.test(nombre)) errores.nombre = 'Escribe tu nombre con letras.';
  const pais = OPCIONES.pais[d.pais];
  if (!pais) errores.telefono = 'Elige el país de tu número.';
  else {
    const n = normalizarTelefono(d.telefono, d.pais).length;
    if (n === 0) errores.telefono = 'Escribe tu número de WhatsApp.';
    else if (n < pais.digitos[0]) errores.telefono = `Faltan dígitos: un número de ${pais.nombre} tiene ${pais.digitos[0]}.`;
    else if (n > pais.digitos[1]) errores.telefono = `Sobran dígitos: un número de ${pais.nombre} tiene ${pais.digitos[1]}.`;
  }
  return { ok: Object.keys(errores).length === 0, errores };
}

/* Solo la primera letra en minúscula: «Facebook», «IA» y «Bs» se quedan como están. */
const enMinuscula = (t) => t.charAt(0).toLowerCase() + t.slice(1);

/** El mensaje de WhatsApp precargado, en primera persona de quien escribe. */
export function mensajeWhatsApp(d = {}) {
  const nombre = limpiarNombre(d.nombre);
  const lineas = [nombre ? `Hola DÚO, soy ${nombre}. Les pedí una cotización desde la web.` : 'Hola DÚO, les pedí una cotización desde la web.'];
  const lista = limpiarNecesita(d.necesita).map((k) => enMinuscula(OPCIONES.necesita[k]));
  if (lista.length) lineas.push(`Necesito: ${lista.join('; ')}.`);
  const rubro = limpiarTexto(d.rubro);
  const ciudad = limpiarTexto(d.ciudad, 60);
  if (rubro) lineas.push(`Mi negocio: ${rubro}${ciudad ? ` (${ciudad})` : ''}.`);
  if (OPCIONES.inversion[d.inversion]) lineas.push(`Inversión en publicidad: ${enMinuscula(OPCIONES.inversion[d.inversion])}.`);
  if (OPCIONES.plazo[d.plazo]) lineas.push(`Quiero empezar: ${enMinuscula(OPCIONES.plazo[d.plazo])}.`);
  return lineas.join('\n');
}

export function enlaceWhatsApp(numero, texto) {
  return `https://wa.me/${String(numero).replace(/\D/g, '')}?text=${encodeURIComponent(texto)}`;
}

const CLAVES_CAMPANA = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid'];

/** Parámetros de campaña, recortados. Acepta un objeto o URLSearchParams. */
export function leerCampana(origen = {}) {
  const leer = (k) => (typeof origen.get === 'function' ? origen.get(k) : origen[k]);
  const salida = {};
  for (const k of CLAVES_CAMPANA) {
    const v = leer(k);
    if (v) salida[k] = String(v).slice(0, 200);
  }
  return salida;
}
