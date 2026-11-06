# DÚO Marketing Digital — Web (v2, Cloudflare Pages)

Sitio de la agencia. Una sola página con resultados, videos, servicios **sin precios**
y un formulario de cotización que guarda cada pedido en D1.

## Estructura

```
datos/datos.mjs       ← ÚNICA fuente de cifras, casos, marcas y contactos (// VERIFICAR = falta confirmar)
fuente/pagina.mjs     ← plantilla de la portada (sin cifras propias)
scripts/build.mjs     ← escribe publico/*.html y versiona cada archivo con ?v=<huella>
publico/              ← lo que se publica en Cloudflare Pages
  _worker.js          ← API /api/cotizacion, 301 de /servicios, video por rangos, cabeceras
  js/cotizacion.js    ← validación y segmentos: lo usan el navegador y el Worker
  js/app.js           ← hero, pestañas, muro de videos, formulario, píxel
  css/estilos.css
migrations/           ← esquema de la tabla `cotizaciones` (D1 «duo-web»)
tests/                ← node --test
scripts/servidor-local.mjs · capturar.mjs · probar-formulario.mjs · medir-secciones.mjs
```

## Comandos

```
npm run build      # genera las páginas
npm test           # pruebas
npm run deploy     # build + pruebas + despliegue a Cloudflare Pages (proyecto duo-web)
node scripts/servidor-local.mjs   # mirar en http://localhost:8788 (wrangler dev no arranca acá)
```

## Medición

- El navegador manda solo `PageView`, `ViewContent`, `FormStart`, `Contact` y `VerVideo`.
- La conversión la manda **solo la CAPI desde el Worker, después del INSERT**:
  `Lead` para el segmento CALIENTE (servicio de agencia + invierte desde Bs 2.000 + empieza
  este mes o el próximo) y `LeadSecundario` para TIBIO y CONSULTORIA.
- Sin `PIXEL_ID` no se carga el píxel y la CAPI queda como `sin_pixel`.

## Variables y secretos (Pages → duo-web → Settings)

| Nombre | Dónde | Qué |
|---|---|---|
| `WHATSAPP_NUMBER` | wrangler.jsonc | VERIFICAR: hoy es el mismo número del Restobar Alameda |
| `PIXEL_ID` | wrangler.jsonc | vacío hasta que Emanuel elija el píxel |
| `META_CAPI_TOKEN` | secreto | `npx wrangler pages secret put META_CAPI_TOKEN --project-name duo-web` |
| `AVISO_WEBHOOK_URL` | secreto, opcional | aviso de cada pedido (Apps Script, etc.) |

## Mover el dominio

El Worker ya está listo para el dominio real: `*.pages.dev` lleva `X-Robots-Tag: noindex`
y `duomarketingdigital.com` se indexa normal; `www.duomarketingdigital.com` redirige 301 al
dominio sin www, con la misma ruta y consulta. Falta conectar los dos dominios al proyecto
`duo-web` en Cloudflare (y los DNS), que no se hace desde este repo.

🔴 Repo público: acá no van precios, tokens ni datos de clientes que no estén ya en la web.
