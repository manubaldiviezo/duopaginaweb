-- Pedidos de cotización de duomarketingdigital.com (Cloudflare D1: duo-web).
--
-- telefono        internacional sin «+»: 591XXXXXXXX
-- pais            bo · cl · ec · pe · ar · mx · co · py
-- necesita        claves separadas por coma: campanas,contenido,animado,web,todo,aprender
-- inversion       nada · bajo · medio · alto      plazo  este_mes · proximo_mes · averiguando
-- segmento        CALIENTE (dispara Lead) · TIBIO · CONSULTORIA (LeadSecundario)
-- pagina          origen + ruta, sin parámetros
-- capi_estado     ok · sin_pixel · sin_token · sin_registro · error:<estado> · pendiente
-- webhook_estado  ok · sin_url · error:<estado> · pendiente

CREATE TABLE IF NOT EXISTS cotizaciones (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  creado TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%SZ','now')),
  event_id TEXT,
  nombre TEXT NOT NULL,
  telefono TEXT NOT NULL,
  pais TEXT,
  necesita TEXT,
  rubro TEXT,
  ciudad TEXT,
  inversion TEXT,
  plazo TEXT,
  segmento TEXT,
  evento TEXT,
  utm_source TEXT, utm_medium TEXT, utm_campaign TEXT, utm_content TEXT, utm_term TEXT, fbclid TEXT,
  pagina TEXT,
  user_agent TEXT,
  capi_estado TEXT,
  webhook_estado TEXT
);

CREATE INDEX IF NOT EXISTS idx_cotizaciones_creado ON cotizaciones(creado);
