# Instrucciones para Claude Code

Este archivo lo lee Claude automáticamente al abrir el proyecto. Contiene
lo que hay que saber antes de tocar nada.

---

## Qué es esto

Visor web del Camino de Santiago para un viaje familiar. El grupo se llama
**las Lolitas**: doce personas de todas las edades, once desde el jueves 20
de agosto por la tarde. La guía con horarios, alojamientos y puntos de
interés la preparó **la tita Lucila**; cuando en el código o en la interfaz
se habla de "la guía", es la suya.

Seis etapas, del 18 al 23 de agosto de 2026, de Sarria a Santiago.

---

## Reglas que no se negocian

**1. Nunca push directo a `main`.** Está protegida. Rama nueva → commit →
push → Pull Request. Siempre.

**2. Validar la sintaxis antes de terminar.** El JavaScript vive dentro del
HTML, así que `node --check` no sirve directo:

```bash
python3 -c "
import re
h = open('index.html', encoding='utf-8').read()
for i, b in enumerate(re.findall(r'<script>(.*?)</script>', h, re.S)):
    open(f'_v{i}.js','w',encoding='utf-8').write(b)
"
for f in _v*.js; do node --check "$f" || echo "FALLO en $f"; done
node --check sw.js
rm -f _v*.js
```

**3. Contar los pasos que se van dando.** No entregar un cambio grande sin
explicar qué se tocó y por qué.

**4. Antes un "no he podido verificar esto" que un dato inventado.** Si dos
fuentes discrepan, se muestran las dos con su procedencia. Nunca se elige
una en silencio. Esto vale para el código igual que para los datos: si algo
no se ha probado, decirlo.

**5. Nada de symbol layers de MapLibre para texto.** Dependen de una fuente
de glyphs externa que puede no cargar, y entonces los textos desaparecen sin
dar ningún error. Todos los marcadores son `maplibregl.Marker` con un `div`
HTML. Esto ya nos ha mordido antes.

---

## Trampas conocidas

Errores que ya se cometieron en este proyecto. No repetirlos:

**`history.replaceState` revienta con `file://`.** Algunos navegadores lo
rechazan cuando la página se abre por doble clic en vez de por http. Sin
try/catch, la excepción corta la ejecución y **deja de funcionar la
navegación entera**: se ven las pestañas pero no responden. Ya está
protegido; no quitar el try/catch.

**Los datos están duplicados.** `datos.js` y `trazas.js` existen sueltos
para poder editarlos y revisarlos, pero **la web carga su copia incrustada
en `index.html`**. Si editas el archivo suelto y no reincrustas, no cambia
nada y parece que el cambio no ha funcionado. El comando está en el README.

**El service worker no puede ir dentro del HTML.** El navegador exige un
`.js` servido desde el mismo origen. Por eso `sw.js` va suelto. Y solo
funciona publicado en Pages, no abriendo el archivo local.

**Si cambias `index.html`, sube `VERSION` en `sw.js`.** De `camino-v1` a
`camino-v2`, etc. Si no, los móviles que ya tengan la web cacheada seguirán
viendo la versión vieja indefinidamente.

**`const` no es accesible desde fuera en las pruebas.** Si escribes un test
con jsdom, `window.ETAPAS` da `undefined`. Hay que usar
`window.eval('ETAPAS')`.

---

## Cómo probar sin navegador

Las pruebas se hacen con jsdom, simulando MapLibre. El patrón que funciona:

```javascript
const fs = require('fs');
const {JSDOM, VirtualConsole} = require('jsdom');

const stub = `window.maplibregl={
  Map:function(){this._h={};this._s={};this._l={};
    this.addControl=()=>{};this.on=(e,f)=>{this._h[e]=f};this.loaded=()=>true;
    this.setTerrain=()=>{};this.fitBounds=()=>{};this.flyTo=()=>{};this.resize=()=>{};
    this.addSource=(i,d)=>{this._s[i]=d};this.addLayer=l=>{this._l[l.id]=l};
    this.getSource=i=>this._s[i];this.getLayer=i=>this._l[i];
    this.removeLayer=i=>{delete this._l[i]};this.removeSource=i=>{delete this._s[i]};
    this._fire=e=>{if(this._h[e])this._h[e]()};window.__m=this},
  Marker:function(){this.setLngLat=function(){return this};
    this.addTo=function(){return this};this.remove=()=>{}},
  NavigationControl:function(){},ScaleControl:function(){},
  LngLatBounds:function(){this.extend=function(){return this}}};
window.fetch=()=>Promise.reject(new Error('sin red'));`;

let html = fs.readFileSync('index.html','utf8')
  .replace(/<script src="https:\/\/unpkg[^"]*"><\/script>/, `<script>${stub}</script>`);

const errs = [];
const dom = new JSDOM(html, {
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://x.org/',
  virtualConsole: new VirtualConsole().on('jsdomError', e => errs.push(e.message))
});
const w = dom.window, d = w.document;
if(w.__m) w.__m._fire('load');   // dispara el evento load del mapa

// Ahora: w.irA(3), w.irASeccion('perfil'), w.eval('Sellos'), etc.
```

Hace falta `npm install jsdom` la primera vez.

**Comprobar siempre las 37 vistas**: el índice más 6 etapas × 6 secciones.
Un cambio en el enrutado puede dejar una en blanco sin que salte ningún
error.

---

## Estructura del código

Todo está en `index.html`, en tres bloques `<script>`:

1. **`TRAZAS`** — las seis rutas GPX simplificadas. Cada punto es
   `[lon, lat, altitud, km_acumulado]`.
2. **`ETAPAS`, `CONFIG_MARCHA`, `COLORES_ETAPA`, `GRUPO`** — los datos del
   viaje.
3. **La lógica** — `Marcha`, `Meteo`, `Geo`, `Sellos`, el mapa y el panel.

El orden importa: `TRAZAS` antes que `ETAPAS`, y ambos antes que la lógica.

### Módulos principales

- **`Marcha`** — Naismith-Langmuir. `perfil()`, `horarios()`, `enKm()`,
  `coordEnKm()`, `tramo()`. `Geo` depende de `tramo()`, ojo al tocarla.
- **`Meteo`** — Open-Meteo, sin clave. Solo consulta si la etapa está a 9
  días o menos; si no, dice que no hay previsión en vez de inventarla.
- **`Geo`** — geolocalización proyectada sobre la traza.
- **`Sellos`** — checklist en localStorage. Es el único sitio donde se usa.
- **`perfilEtapa(n)`** — combina la traza GPX con los hitos de la guía.
  Usar esta, no `Marcha.perfil()` directamente.

### Navegación

`vistaEtapa` (0 = índice, 1-6 = etapa) y `seccionActual` (`ruta`, `perfil`,
`paradas`, `sellos`, `tiempo`, `dia`). Las funciones son `irA(n)` e
`irASeccion(id)`.

---

## Estado actual

Funciona: navegación completa, mapa con las trazas reales, perfil
interactivo, geolocalización, previsión meteorológica, sellos, teléfonos,
modo sin cobertura y compartir.

**Pendiente del viaje** (no del código):

- Villa Xardín, 22 de agosto: 10 plazas para 11 personas.
- La cena de Cerceda sigue sin confirmar.
- Casa Nené: dos reservas de 8 + 4 cuando ya sois 11.
- El 23: la misa de 19:30 y la cena de 20:30 no caben las dos.
- Antes del 12 de agosto: comunicar el menú a Mesón A Lareira.

**Ideas que quedaron sin hacer:**

- Imagen de vista previa propia por etapa para WhatsApp.
- Aviso de calor derivado, no solo la temperatura.
- Alertas por fecha que aparezcan y desaparezcan solas.
- Selector de tamaño de letra.
