# DÚO Marketing Digital — Web

Sitio de la agencia DÚO. **Proyecto independiente** de la landing personal de Manu (`manubaldiviezo.lat`), que queda intacta.

## Stack
Sitio **estático**: un único `index.html` con CSS y JS embebidos (mismo enfoque que la landing personal, para reutilizar la animación de canvas sin build). No requiere Node ni compilación. Deploy directo en **Vercel** (framework: "Other" / static).

## Estructura
```
duo-marketing-web/
├── index.html        ← todo el sitio (13 secciones, CSS + JS inline)
├── vercel.json       ← cleanUrls + headers + cache de assets
├── .gitattributes
├── README.md
├── /images/          ← fotos por sección (ver nombres abajo)
├── /logos/           ← logos de clientes (monocromo) + duo-icon.png
└── /reels/           ← clips .mp4 del muro de trabajos
```

## Reutilizado de la landing personal (copiado, sin modificar el original)
- **Animación del isotipo Ü**: el sistema de píxeles que se ensamblan hacia los 4 cuadros y la U, adaptado a la paleta naranja/ámbar de DÚO (bloque al final de `index.html`).
- **Datos de casos** (array `CASOS`): Femmeninas 10.55x, Vision Arq, ProGaming, Ñañitos, Climere — cifras exactas.

## Identidad
Naranja `#EC6730` · Ámbar `#F9B233` · Negro carbón `#1D1D1B`. **Sin verde lima** (ese es de la marca personal). Montserrat (fallback de Gotham) + Inter + Caveat (acentos tipo Live Wire).

---

## ⚠️ PENDIENTES — requieren datos del dueño
Buscá estos marcadores en el código:

| Pendiente | Dónde | Marcador |
|---|---|---|
| **Número de WhatsApp de DÚO** | `index.html` JS | `const WHATSAPP = "59100000000"` |
| **VSL (video 3 min)** | `index.html` JS | `const VSL_URL = ""` |
| **Duración soporte asesoría** | Puerta 1 | (dejado en "1 mes" — confirmar) |
| **Precio eventos sociales (bodas/cumpleaños)** | S8 | "A definir" |
| **Logos de clientes** | `/logos/` | placeholders de texto en la cinta |
| **Clips de reels + métricas + URLs reales** | array `REELS` en JS | `videoSrc / poster / urlReal` vacíos |
| **Fotos** | `/images/` | placeholders con nombre |

### Imágenes esperadas en `/images/`
`hero-set-produccion.png` · `feed-interrupcion.png` · `metodo-direccion.png` · `servicio-celular.png` · `servicio-sony.png` · `servicio-diseno.png` · `equipo-produccion.png` · `cta-energia.png` · `ebook-estrategia.png` · `ebook-formula.png`

Mientras no existan, se muestran placeholders oscuros con el nombre del archivo.

## Deploy en Vercel
1. Importar el repo `duo-marketing-web`.
2. Framework Preset: **Other** (static). Sin build command, output = raíz.
3. Deploy.
