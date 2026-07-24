#!/usr/bin/env node
/* Genera la vista previa de WhatsApp por etapa:
     - og/etapaN.png : tarjeta 1200x630 con etapa, origen→destino, km y desnivel.
     - etapaN.html   : página mínima con las etiquetas Open Graph propias que
                       redirige al visor (index.html?etapa=N).
   GitHub Pages es estático y los rastreadores de WhatsApp no ejecutan JS, así
   que las etiquetas OG deben estar servidas ya hechas: por eso una página por
   etapa. Y WhatsApp no acepta SVG en og:image, por eso se convierte a PNG.

   Los km y el desnivel salen de las MISMAS funciones del visor (cargando
   index.html con jsdom), para que la tarjeta no invente cifras distintas.

   Uso: npm run og      (tras cambiar una traza, una etapa, o el diseño).
   ============================================================ */
const fs = require('fs');
const path = require('path');
const {JSDOM, VirtualConsole} = require('jsdom');
const {Resvg} = require('@resvg/resvg-js');

const raiz = path.join(__dirname, '..');

/* ── LO ÚNICO QUE HAY QUE TOCAR SI CAMBIA LA URL DE PUBLICACIÓN ──
   Sin barra final. Debe ser la raíz real del sitio en GitHub Pages,
   porque og:image y og:url exigen URL absoluta. */
const BASE = 'https://thorito27.github.io/Camino-de-Santiago';

/* ── Paleta (la del visor) ── */
const C = {
  tinta:'#1B2A23', pizarra:'#2E4038', piedra:'#B5AE9E', hueso:'#EDE8DC',
  concha:'#D8A33C', sube:'#C46A4F', baja:'#7FA98A'
};
const SERIF = "Georgia, 'Times New Roman', serif";
const SANS  = "Helvetica, Arial, sans-serif";
const MONO  = "Menlo, 'Courier New', monospace";

function xml(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function attr(s){ return xml(s).replace(/"/g,'&quot;'); }

/* ── Cargar el visor en jsdom para usar sus funciones reales ── */
const stub = `window.maplibregl={
  Map:function(){this._h={};this.addControl=()=>{};this.on=(e,f)=>{this._h[e]=f};
    this.loaded=()=>true;this.setTerrain=()=>{};this.fitBounds=()=>{};this.flyTo=()=>{};
    this.resize=()=>{};this.addSource=()=>{};this.addLayer=()=>{};this.getSource=()=>null;
    this.getLayer=()=>null;this.removeLayer=()=>{};this.removeSource=()=>{};
    this._fire=e=>{if(this._h[e])this._h[e]()};window.__m=this},
  Marker:function(){this.setLngLat=function(){return this};this.addTo=function(){return this};
    this.remove=()=>{}},
  NavigationControl:function(){},ScaleControl:function(){},
  LngLatBounds:function(){this.extend=function(){return this}}};
window.fetch=()=>Promise.reject(new Error('sin red'));`;

const html = fs.readFileSync(path.join(raiz,'index.html'),'utf8')
  .replace(/<script src="https:\/\/unpkg[^"]*"><\/script>/, `<script>${stub}</script>`);

const errs = [];
const dom = new JSDOM(html, {
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://ejemplo.org/',
  virtualConsole: new VirtualConsole().on('jsdomError', e => errs.push(e.message))
});
const w = dom.window;
if(w.__m) w.__m._fire('load');
if(errs.length){ console.error('Errores al cargar index.html:\n  '+errs.join('\n  ')); process.exit(1); }

const ETAPAS   = w.eval('ETAPAS');
const COLORES  = w.eval('COLORES_ETAPA');

/* ── Tarjeta SVG de una etapa ── */
function tarjeta(n){
  const et = ETAPAS[n-1];
  const perfil = w.perfilEtapa(n);
  const km   = (perfil && perfil.esGpx ? perfil.km.toFixed(1) : String(et.km.guia)).replace('.', ',');
  const dPos = perfil && perfil.dPos != null ? perfil.dPos : '—';
  const dNeg = perfil && perfil.dNeg != null ? perfil.dNeg : '—';
  const dia  = parseInt(et.fecha.slice(8), 10);
  const color = COLORES[n-1];
  const eyebrow = ('Etapa ' + n + ' · ' + et.diaSemana + ' ' + dia + ' de agosto').toUpperCase();

  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="${C.tinta}"/>
  <rect width="1200" height="12" fill="${color}"/>
  <rect x="80" y="96" width="54" height="4" fill="${C.concha}"/>
  <text x="80" y="150" font-family="${MONO}" font-size="27" letter-spacing="3"
        fill="${C.concha}">${xml(eyebrow)}</text>
  <text x="80" y="292" font-family="${SERIF}" font-size="74" font-weight="bold"
        fill="${C.hueso}">${xml(et.origen)}</text>
  <text x="80" y="378" font-family="${SERIF}" font-size="74" font-weight="bold"
        fill="${color}">→ ${xml(et.destino)}</text>
  <g font-family="${MONO}">
    <text x="80"  y="500" font-size="62" font-weight="bold" fill="${C.hueso}">${xml(km)}</text>
    <text x="80"  y="536" font-size="23" letter-spacing="2" fill="${C.piedra}">KM</text>
    <text x="420" y="500" font-size="62" font-weight="bold" fill="${C.sube}">+${xml(dPos)}</text>
    <text x="420" y="536" font-size="23" letter-spacing="2" fill="${C.piedra}">M DE SUBIDA</text>
    <text x="760" y="500" font-size="62" font-weight="bold" fill="${C.baja}">−${xml(dNeg)}</text>
    <text x="760" y="536" font-size="23" letter-spacing="2" fill="${C.piedra}">M DE BAJADA</text>
  </g>
  <line x1="80" y1="576" x2="1120" y2="576" stroke="${C.pizarra}" stroke-width="1"/>
  <text x="80" y="606" font-family="${MONO}" font-size="24" letter-spacing="3"
        fill="${C.piedra}">LAS LOLITAS AL CAMINO · SARRIA → SANTIAGO 2026</text>
</svg>`;
}

/* ── Página redirectora con las etiquetas OG ── */
function pagina(n){
  const et = ETAPAS[n-1];
  const perfil = w.perfilEtapa(n);
  const km   = (perfil && perfil.esGpx ? perfil.km.toFixed(1) : String(et.km.guia)).replace('.', ',');
  const dPos = perfil && perfil.dPos != null ? perfil.dPos : '—';
  const dNeg = perfil && perfil.dNeg != null ? perfil.dNeg : '—';
  const dia  = parseInt(et.fecha.slice(8), 10);
  const titulo = 'Etapa ' + n + ': ' + et.origen + ' → ' + et.destino;
  const desc = km + ' km · +' + dPos + ' / −' + dNeg + ' m de desnivel · '
    + et.diaSemana + ' ' + dia + ' de agosto de 2026. Las Lolitas al Camino.';
  const destino = 'index.html?etapa=' + n;
  const imagen = BASE + '/og/etapa' + n + '.png';

  return `<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${xml(titulo)} · Las Lolitas al Camino</title>
<meta property="og:type" content="website">
<meta property="og:title" content="${attr(titulo)}">
<meta property="og:description" content="${attr(desc)}">
<meta property="og:image" content="${attr(imagen)}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="${attr(titulo)}">
<meta property="og:url" content="${attr(BASE + '/etapa' + n + '.html')}">
<meta property="og:locale" content="es_ES">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#1B2A23">
<meta http-equiv="refresh" content="0; url=${destino}">
<link rel="canonical" href="${destino}">
<script>location.replace(${JSON.stringify(destino)});</script>
<style>html,body{height:100%}body{margin:0;display:flex;align-items:center;justify-content:center;
  font-family:system-ui,-apple-system,sans-serif;background:#1B2A23;color:#EDE8DC;text-align:center;
  padding:2rem;line-height:1.6}a{color:#D8A33C}</style>
</head>
<body>
<p>Abriendo el visor…<br><a href="${destino}">${xml(titulo)}</a></p>
</body>
</html>
`;
}

/* ── Generar ── */
const dirOg = path.join(raiz, 'og');
fs.mkdirSync(dirOg, {recursive:true});

for(let n=1; n<=6; n++){
  const svg = tarjeta(n);
  const png = new Resvg(svg, {fitTo:{mode:'width', value:1200}}).render().asPng();
  fs.writeFileSync(path.join(dirOg, `etapa${n}.png`), png);
  fs.writeFileSync(path.join(raiz, `etapa${n}.html`), pagina(n));
  const et = ETAPAS[n-1];
  console.log(`  etapa ${n}: ${et.origen} → ${et.destino}  (${(png.length/1024).toFixed(0)} KB PNG)`);
}

console.log(`\nGeneradas 6 tarjetas en og/ y 6 páginas etapaN.html.`);
console.log(`URL base usada para og:image: ${BASE}`);
console.log(`Si la publicación real está en otra URL, cambia BASE en herramientas/og.js y repite.`);
