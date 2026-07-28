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
push → Pull Request → **fusionar**. Siempre, y hasta el final: un cambio que
se queda en una rama no lo ve nadie, porque **la web se publica desde `main`**
(GitHub Pages, carpeta raíz). No dejes trabajo terminado sin fusionar salvo
que se pida expresamente.

**Y comprueba si la PR de tu rama ya está fusionada antes de seguir
trabajando en ella.** Ya pasó: se fusionó la PR #24 y después se siguieron
subiendo commits a la misma rama, que quedaron fuera de `main` mientras
parecía que estaban entregados. Una PR fusionada está cerrada y no recoge nada
nuevo. Si la tuya lo está, rearranca la rama desde `main` conservando el
nombre, rebasa encima lo que aún no esté fusionado y abre una PR nueva:

```bash
git fetch origin main
git log --oneline origin/main..HEAD          # ¿qué falta por fusionar?
git rebase --onto origin/main <ultimo-fusionado> <rama>
git push --force-with-lease -u origin <rama>
```

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

**El service worker sirve la PÁGINA a red-primero. No lo revirtáis sin leer
esto.** Antes era caché-primero para todo, y eso hizo que durante dos días los
cambios desplegados no se vieran en el móvil: la web seguía sirviendo la copia
guardada y parecía que el código estaba mal. Los tiles y las librerías sí siguen
a caché-primero (son fijos y pesados); solo las navegaciones van a la red
primero, con la copia guardada como respaldo sin cobertura.

**En móvil el mapa va a pantalla completa con `position:fixed`, no dentro del
grid.** La fila `1fr` del grid se colapsaba en iOS cuando la barra de
geolocalización ocupaba mucho, y el contenedor del mapa se quedaba en una franja
de cuatro píxeles. Se intentó arreglar tres veces tocando el lienzo
(`resize()`, `ResizeObserver`, apilado con z-index) y ninguna funcionó, porque
el problema era el **contenedor**, no el lienzo. Si alguien devuelve el mapa al
flujo del grid, volverá el fallo.

**`ajustar-puntos.js` y los nombres repetidos.** Seis puntos se llaman igual
en dos etapas, porque el destino de una es el origen de la siguiente:
Portomarín (1 y 2), Palas de Rei (2 y 3), Melide (3 y 4), Arzúa (4 y 5),
O Pedrouzo (5 y 6) y **A Brea (2 y 5, dos pueblos distintos que se llaman
igual)**. La herramienta buscaba el punto con `src.match(nombre)` y escribía
con `src.replace`, y **las dos cosas van a la primera coincidencia del archivo
entero**: la fila de la segunda etapa machacaba la de la primera. Así el
Portomarín de la etapa 1 acabó con el km 0 de la traza de la etapa 2, y «A
Brea» de la etapa 2 acabó con las coordenadas de la de la etapa 5. La etapa 2
enseñó **10 h de marcha** para 27,6 km durante meses. Ya está arreglado: el
archivo se recorre hacia delante y se va consumiendo, así que cada fila solo
escribe en la coincidencia que le toca. **Si tocas esa herramienta, no vuelvas
a buscar por nombre sobre el archivo entero.**

**El service worker no puede ir dentro del HTML.** El navegador exige un
`.js` servido desde el mismo origen. Por eso `sw.js` va suelto. Y solo
funciona publicado en Pages, no abriendo el archivo local.

**Hay DOS versiones que subir, y no son lo mismo.**

- **`VERSION` en `sw.js`** (ahora `camino-v19`): súbela **siempre que cambies
  `index.html`**. Nombra los cachés; si no la subes, los móviles que ya tengan
  la web guardada pueden seguir con la vieja.
- **`APP_VERSION` en `index.html`** (ahora `map-9`): súbela **al tocar el
  mapa**. No afecta al caché: es la etiqueta que enseña el diagnóstico `?debug`
  para saber, desde el propio móvil y sin Mac, qué versión ha cargado de
  verdad. Sirvió para descubrir que el problema del mapa era caché y no código.

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
Un cambio en el enrutado puede dejar una en blanco sin que salte ningún error.

`npm test` recorre además la portada (`vistaEtapa -1`), los Retos
(`vistaEtapa 7`) y el Equipaje (`vistaEtapa 8`), cada uno en su propio bloque.
(Esta nota decía antes que la portada y los Retos se quedaban fuera; ya no es
cierto, `probar.js` los cubre en los apartados 1 y 5.) Si añades una vista
nueva, añádele su bloque: no basta con que no salte error, hay que comprobar
que pinta algo.

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

- **`Queda`** — la ventana de «¿Cuánto queda?» (botón `#btnQueda` de la
  cabecera). Distancia, desnivel y tiempo hasta el final de la etapa, más una
  cuenta atrás hasta la hora de llegada de la guía. `objetivo()` elige etapa
  por este orden: **dónde estás** (si `Geo.ultima` está a menos de 2 km de la
  traza) → **la etapa de hoy** → **la que tengas abierta** → **la 1**.
  El tiempo sale de los hitos (mismo Naismith que el resto); el **desnivel sale
  de la traza y se ancla por proporción a `TRAZAS[n].dPos/dNeg`**, para que en
  el km 0 diga exactamente lo mismo que la ficha de la etapa. Con el diálogo
  abierto, las flechas del teclado NO navegan y `Esc` cierra.

- **`Capa`** — controles del mapa. Ya NO alterna capas (hubo una topográfica,
  se retiró): solo guarda si la vista es 3D, en `lolitas2026-3d`. `aplicar3D()`
  pone pitch 0 o 60.

- **`Equipaje`** — checklist de la maleta en localStorage
  (`lolitas2026-equipaje`). Mismo planteamiento que `Sellos`: es personal, se
  guarda solo en el navegador de cada uno y no se comparte. Los datos (grupos e
  items) están en `EQUIPAJE`, en `datos.js`; el módulo solo lleva el estado.
  `cuenta(grupo)` sin argumento devuelve el total. **Los `id` de los items son
  la clave de guardado: cambiarlos borra las marcas de quien ya haya hecho la
  maleta.**
  Los cuatro primeros grupos son la lista de la tita Lucila, entera. El quinto
  lleva **`extra:true`** y NO es suyo: lo añadió el grupo (credencial, DNI,
  cargador, batería, gafas, tarjeta). Se pinta aparte y con su aviso a
  propósito. **No muevas un item con `extra` a un grupo de la guía**: sería
  atribuirle algo que no escribió, y hay una prueba que lo caza.

**Las cinco claves de localStorage** (no hay más, y no se usa para nada más):

| Clave | Qué guarda |
|---|---|
| `lolitas2026-sellos` | sellos marcados de la credencial |
| `lolitas2026-retos` | respuestas del cuestionario (`{v, persona, respuestas}`) |
| `lolitas2026-persona` | quién juega en este móvil |
| `lolitas2026-3d` | si el mapa está en vista 3D |
| `lolitas2026-equipaje` | qué está ya metido en la maleta |

**`hitosLimpios(n)` es lo que hay que usar para calcular tiempos**, no
`et.puntos` en crudo. Lo usan `perfilEtapa`, `Marcha.horarios` y `Queda`, y por
eso los tres dicen lo mismo. Hace dos cosas:

1. **Añade un punto final en el km donde acaba la traza.** El último hito de la
   guía no siempre coincide con el final del track: en la etapa 4 quedan 0,71
   km por detrás de Arzúa (11 minutos de marcha). Esto sigue haciendo falta.
2. **Descarta los puntos que retroceden en km.** Hoy solo caen empates a mismo
   km (Barbadelo y su iglesia, los dos en el 4,36), que suman cero. Es una red
   de seguridad, no un parche: los datos ya están bien.

**Los km de `datos.js` se corrigieron el 28 de julio de 2026** (antes cinco
destinos llevaban el km de la traza siguiente y «A Brea» de la etapa 2 estaba a
38 km de su sitio). Ver la trampa de los nombres repetidos, más abajo.
- **`Marcha.coordEnKm(puntos, km, n)`** — interpola sobre `TRAZAS[n].linea`,
  NO sobre los hitos. Pásale siempre el número de etapa; sin él cae al respaldo
  por hitos, que corta campo a través.
- **`herramientas/ajustar-puntos.js`** — lleva los puntos de `datos.js` a la
  traza. Sin argumentos solo enseña la tabla; `--aplicar` escribe. Respeta
  `kmGuia` y no mueve los `fueraDeRuta`. Tras usarlo, reincrustar `datos.js`.
- **`perfilEtapa(n)`** — combina la traza GPX con los hitos de la guía.
  Usar esta, no `Marcha.perfil()` directamente.

### El mapa

- **Capa satélite: PNOA del Instituto Geográfico Nacional** (WMTS, teselas
  `GoogleMapsCompatible`, `image/jpeg`, URL en forma KVP porque el servicio no
  publica plantilla REST). Cubre **solo España**.
- **La atribución «PNOA cedido por © Instituto Geográfico Nacional de España»
  es obligatoria por licencia**, no decorativa. Está en el bloque `.attr`. No
  la quites.
- **Respaldo automático**: si esa fuente acumula 8 errores de tesela, el visor
  cambia solo a ESRI (`URL_ESRI`) y lo dice en la atribución.
- **Relieve**: DEM terrarium de AWS, exageración 1.6. Es lo que hace funcionar
  el 3D; sin él el botón 3D no tendría nada que inclinar.
- Hubo una capa topográfica (OpenTopoMap) y **se retiró**: duplicaba la
  descarga sin cobertura sin aportar bastante frente al PNOA.

### Los datos de los puntos

Cada punto de `ETAPAS[n].puntos` puede llevar:

| Campo | Qué significa |
|---|---|
| `km`, `ele`, `lat`, `lon` | tomados de la **traza GPX**, no de la guía |
| `kmGuia` | el kilómetro que dice la tita Lucila. **No se toca nunca** |
| `desviacion_m` | cuántos metros se movió el punto al llevarlo a la traza |
| `fueraDeRuta` + `desvio_m` | está fuera del Camino (desvío señalizado); no se mueve |
| `fiable: false` + `ajustado` | dato dudoso; `ajustado` son los metros que se corrigió al integrar los GPX |
| `sellar`, `horario`, `ficha`, `tipo` | información de la guía |

Y en `datos.js`: **`tamanoGrupo(fecha)`** son los que DUERMEN esa noche (manda
en las plazas de alojamiento) y **`grupoCamina(fecha)`** los que CAMINAN esa
etapa. Difieren el 20 de agosto: caminan 12 y duermen 11, porque Alejandro
vuela al terminar la etapa 3.

### Navegación

`vistaEtapa` (**-1 = portada**, 0 = índice, 1-6 = etapa, **7 = retos**,
**8 = equipaje**) y `seccionActual`. Las funciones son `irA(n)` e
`irASeccion(id)`.

Ojo al añadir vistas: **solo las etapas 1-6** tienen traza, color, sub-pestañas
y `etapaN.html`. Portada, índice, retos y equipaje comparten el mapa general,
ocultan el subnav y comparten la raíz al usar `compartir()`. Los retos se
enlazan con `?retos=1` y el equipaje con `?equipaje=1`.

**Añadir una vista al final son seis sitios, no uno.** Con el equipaje (8)
hubo que tocar: `pintarNav`, `pintarSubnav` (que la oculta), `pintarPanel` (el
despacho y el color `--et`), `irA` (la URL de `replaceState`), el `keydown` de
las flechas (**el tope de la derecha**, que era `< 7`) y el bloque de arranque
que lee los parámetros de la URL. Si te dejas el `keydown`, la pestaña existe
pero no se llega a ella con el teclado, y ninguna prueba lo cantaba hasta que
se añadió el caso.

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
avisos derivados (calor, lluvia, frío de mañana, viento), sellos, retos,
checklist del equipaje, teléfonos, modo sin cobertura, compartir y vista previa
propia por etapa en WhatsApp.

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
