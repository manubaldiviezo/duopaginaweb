import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  segmentar, validarEnvio, mensajeWhatsApp, normalizarTelefono, telefonoInternacional, limpiarNecesita, SEGMENTOS,
} from '../publico/js/cotizacion.js';

const BASE = { necesita: ['campanas'], rubro: 'Ropa de mujer', ciudad: 'Santa Cruz', inversion: 'medio', plazo: 'este_mes', nombre: 'Ana Pérez', pais: 'bo', telefono: '71234567' };

test('CALIENTE: servicio de agencia, invierte desde Bs 2.000 y empieza pronto', () => {
  assert.equal(segmentar(BASE), 'CALIENTE');
  assert.equal(segmentar({ ...BASE, inversion: 'alto', plazo: 'proximo_mes' }), 'CALIENTE');
  assert.equal(SEGMENTOS.CALIENTE.evento, 'Lead');
});

test('TIBIO: invierte poco, no invierte o solo averigua', () => {
  assert.equal(segmentar({ ...BASE, inversion: 'bajo' }), 'TIBIO');
  assert.equal(segmentar({ ...BASE, inversion: 'nada' }), 'TIBIO');
  assert.equal(segmentar({ ...BASE, plazo: 'averiguando' }), 'TIBIO');
  assert.equal(SEGMENTOS.TIBIO.evento, 'LeadSecundario');
});

test('CONSULTORIA solo si lo único que quiere es aprender', () => {
  assert.equal(segmentar({ ...BASE, necesita: ['aprender'] }), 'CONSULTORIA');
  assert.equal(segmentar({ ...BASE, necesita: ['aprender', 'campanas'] }), 'CALIENTE');
  assert.equal(SEGMENTOS.CONSULTORIA.evento, 'LeadSecundario');
});

test('ningún segmento distinto de CALIENTE dispara Lead', () => {
  for (const [nombre, s] of Object.entries(SEGMENTOS)) {
    if (nombre !== 'CALIENTE') assert.notEqual(s.evento, 'Lead');
  }
});

test('necesita ignora claves inventadas y repetidas', () => {
  assert.deepEqual(limpiarNecesita(['web', 'hackeo', 'web', 'campanas']), ['campanas', 'web']);
  assert.deepEqual(limpiarNecesita('todo,aprender'), ['todo', 'aprender']);
});

test('valida un envío completo', () => {
  assert.deepEqual(validarEnvio(BASE), { ok: true, errores: {} });
});

test('mensajes de error específicos', () => {
  const { errores } = validarEnvio({ ...BASE, necesita: [], rubro: '', inversion: 'x', plazo: '', nombre: '', telefono: '7123' });
  assert.equal(errores.necesita, 'Elige al menos una opción.');
  assert.equal(errores.rubro, 'Cuéntanos qué vende tu negocio.');
  assert.ok(errores.inversion && errores.plazo && errores.nombre);
  assert.match(errores.telefono, /^Faltan dígitos: un número de Bolivia tiene 8\.$/);
  assert.match(validarEnvio({ ...BASE, telefono: '712345678' }).errores.telefono, /^Sobran dígitos/);
  assert.equal(validarEnvio({ ...BASE, nombre: '12345' }).errores.nombre, 'Escribe tu nombre con letras.');
});

test('teléfonos: quita el prefijo si lo escribieron y arma el internacional', () => {
  assert.equal(normalizarTelefono('+591 712 34 567', 'bo'), '71234567');
  assert.equal(normalizarTelefono('71234567', 'bo'), '71234567');
  assert.equal(telefonoInternacional('71234567', 'bo'), '59171234567');
  assert.equal(telefonoInternacional('+56 9 1234 5678', 'cl'), '56912345678');
  assert.equal(validarEnvio({ ...BASE, pais: 'cl', telefono: '912345678' }).ok, true);
});

test('el mensaje de WhatsApp lleva nombre, pedido y negocio, en primera persona', () => {
  const m = mensajeWhatsApp(BASE);
  assert.match(m, /^Hola DÚO, soy Ana Pérez\. Les pedí una cotización desde la web\./);
  assert.match(m, /Necesito: publicidad en Facebook e Instagram\./);
  assert.match(mensajeWhatsApp({ ...BASE, necesita: ['animado', 'web'], inversion: 'alto' }), /videos animados; sitio web o landing\.[\s\S]*más de Bs 10\.000 al mes/);
  assert.match(m, /Mi negocio: Ropa de mujer \(Santa Cruz\)\./);
  assert.match(m, /Quiero empezar: este mes\./);
});
