# Instrucciones para Claude Code

Este archivo lo lee Claude automáticamente al abrir el proyecto. Contiene
lo que hay que saber antes de tocar nada.

**Existe un diario de sesiones en `PROJECT_STATE.md`.** Léelo al empezar (al
menos las 2-3 entradas más recientes) para saber en qué punto está el
proyecto, y actualízalo al final de cada sesión con lo que hayas hecho. Este
archivo (CLAUDE.md) son las reglas fijas; `PROJECT_STATE.md` es el registro
cronológico de cambios.

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

**Si añades o cambias una capa de mapa, actualiza `esTile` en `sw.js`.** La
detección de teselas va por nombre de dominio (ahora: arcgisonline,
elevation-tiles-prod, amazonaws, **ign.es**). Si el dominio
nuevo no está ahí, sus teselas no se cachean y el modo sin cobertura se rompe en
silencio. Y recuerda que la descarga son ~510 fragmentos y unos 8,4 MB: si subes zooms o
añades capas, recalcula y revisa `MAX_TILES`.

**El service worker no puede ir dentro del HTML.** El navegador exige un
`.js` servido desde el mismo origen. Por eso `sw.js` va suelto. Y solo
funciona publicado en Pages, no abriendo el archivo local.

**Si cambias `index.html`, sube `VERSION` en `sw.js`.** De `camino-v1` a
`camino-v2`, etc. Si no, los móviles que ya tengan la web cacheada seguirán
viendo la versión vieja indefinidamente.

**Las pruebas con jsdom deben cerrar la ventana.** La página deja algún
`setInterval` vivo (la cuenta atrás), y sin `dom.window.close()` al final el
proceso de node no termina nunca y `npm test` se queda colgado. `probar.js` ya
lo hace; si escribes otra prueba, ciérrala tú también.

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
- **`Sellos`** — checklist en localStorage (`lolitas2026-sellos`).
- **`Persona`** — quién juega, en localStorage (`lolitas2026-persona`). Lista
  fija en `PERSONAS` (datos.js), sin contraseña. Sin persona elegida, Retos no
  deja jugar; la portada saluda por el nombre si está puesto.
- **`Retos`** — cuestionario en localStorage (`lolitas2026-retos`). **Guarda un
  registro por respuesta**: `{id, opcion, acierto, ts}`, más `v` (versión de
  formato) y `persona`. Está pensado así a propósito: si algún día se
  sincroniza con un servidor, se enviarían esos mismos registros (añadido, no
  reescritura). **No hay sincronización.** Reglas: **una sola oportunidad** por
  pregunta (`Retos.responder` ignora la segunda), y una respondida no se
  vuelve a ofrecer, se muestra con lo que marcaste y la correcta. Las tandas de
  etapa se abren con `retoDesbloqueado(fecha)`: el día de la etapa a partir de
  las 16:00; bloqueadas muestran las `pista`, **nunca** las preguntas. No hay
  reinicio general, solo un «empezar de cero» con confirmación.
  El ranking **no es automático**: se comparte por WhatsApp con
  `compartirTexto()`, que usa el mismo mecanismo que `compartir()`.

Los tres únicos usos de localStorage son `Sellos`, `Retos` y `Persona`.
- **`Marcha.coordEnKm(puntos, km, n)`** — interpola sobre `TRAZAS[n].linea`,
  NO sobre los hitos. Pásale siempre el número de etapa; sin él cae al respaldo
  por hitos, que corta campo a través.
- **`herramientas/ajustar-puntos.js`** — lleva los puntos de `datos.js` a la
  traza. Sin argumentos solo enseña la tabla; `--aplicar` escribe. Respeta
  `kmGuia` y no mueve los `fueraDeRuta`. Tras usarlo, reincrustar `datos.js`.
- **`perfilEtapa(n)`** — combina la traza GPX con los hitos de la guía.
  Usar esta, no `Marcha.perfil()` directamente.

### Navegación

`vistaEtapa` (**-1 = portada**, 0 = índice, 1-6 = etapa, **7 = retos**) y
`seccionActual`. Las funciones son `irA(n)` e `irASeccion(id)`.

Ojo al añadir vistas: **solo las etapas 1-6** tienen traza, color, sub-pestañas
y `etapaN.html`. Portada, índice y retos comparten el mapa general, ocultan el
subnav y comparten la raíz al usar `compartir()`. Los retos se enlazan con
`?retos=1`.

La portada es la pantalla de bienvenida (`panelPortada`), lo primero que se
ve al entrar sin `?etapa=N`; con `?etapa=N` se salta directo a esa etapa. El
trazado de la portada es un SVG propio generado de `TRAZAS` (`svgPortadaMapa`),
sin imágenes externas.

Las sub-pestañas de una etapa, en orden, son `dia` (**se muestra como
"Itinerario"**), `ruta`, `perfil`, `paradas`, `sellos`, `tiempo`. **La sección
por defecto al abrir una etapa es `dia`**, no `ruta`; ese default está fijado
en la declaración de `seccionActual` y en `irA(0)`. Ojo: `abrirHito` sí fuerza
`ruta` al pulsar un marcador del mapa, y debe seguir así. El id sigue siendo
`dia`; solo cambió el texto visible y su posición.

---

## Estado actual

Funciona: portada de bienvenida, navegación completa, mapa con las trazas
reales, perfil interactivo, geolocalización, previsión meteorológica con
avisos derivados (calor, lluvia, frío de mañana, viento), sellos, teléfonos,
modo sin cobertura, compartir y vista previa propia por etapa en WhatsApp.

**Pendiente del viaje** (no del código). Estas cinco viven ahora en la
constante `DECISIONES` de `datos.js` y se ven en el apartado «Decisiones del
grupo» del índice. El `estado` se edita a mano en `datos.js` cuando algo se
cierra de verdad (no en localStorage: sería solo para quien lo marca):

- Villa Xardín, 22 de agosto: 10 plazas para 11 personas.
- La cena de Cerceda sigue sin confirmar.
- Casa Nené: dos reservas de 8 + 4 cuando ya sois 11.
- El 23: la misa de 19:30 y la cena de 20:30 no caben las dos.
- Antes del 12 de agosto: comunicar el menú a Mesón A Lareira.

**Vista previa por etapa:** las etiquetas Open Graph no se pueden generar en
el cliente (WhatsApp no ejecuta JS), así que hay una página `etapaN.html` por
etapa con sus etiquetas y una tarjeta `og/etapaN.png`. Se regeneran con
`npm run og` (ver README). `compartir(n)` enlaza a `etapaN.html`, no a
`?etapa=N`.

**Ideas que quedaron sin hacer:**

- **Identificación por nombre y ubicación compartida del grupo.** Que cada
  persona indique su nombre al entrar (sin contraseña, solo para identificarse
  dentro del grupo) y que se pueda ver en el mapa dónde está cada integrante,
  no solo la posición propia como ahora. Complejidad: `Geo` es local a cada
  móvil y Pages no tiene backend, así que exige un servicio externo en tiempo
  real (Firebase, Supabase) y decisiones de privacidad (frecuencia de
  actualización, retención, y poder desactivarlo por persona). No implementado.
- Alertas por fecha que aparezcan y desaparezcan solas.
- Selector de tamaño de letra.
