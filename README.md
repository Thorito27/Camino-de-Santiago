# Las Lolitas al Camino

Visor interactivo del Camino de Santiago Francés, últimos 100 km.
Sarria → Santiago de Compostela, del 18 al 23 de agosto de 2026.

Doce personas, de todas las edades. Once desde el jueves 20 por la tarde.

Los horarios, alojamientos, comidas y puntos de interés vienen de la guía
que preparó **la tita Lucila**. Los trazados y desniveles, de seis GPX de
Wikiloc.

---

## Cómo se publica

GitHub Pages, rama `main`, carpeta raíz. El archivo `.nojekyll` vacío es
imprescindible: sin él GitHub intenta procesar el sitio con Jekyll y el
despliegue falla.

**La rama `main` está protegida.** Nunca hagas push directo: crea una rama,
haz commit, súbela y abre una Pull Request.

---

## Archivos

| Archivo | Qué es |
|---|---|
| `index.html` | El visor entero: datos, trazas, lógica y estilos. Autónomo. |
| `sw.js` | Service worker. Va suelto por obligación del navegador. |
| `datos.js` | Copia editable de los datos. **No lo carga la web.** |
| `trazas.js` | Copia editable de las trazas. **No la carga la web.** |
| `.nojekyll` | Vacío. Necesario para GitHub Pages. |
| `gpx/` | Los seis GPX originales de Wikiloc. |
| `etapa1.html`…`etapa6.html` | Páginas mínimas con las etiquetas Open Graph propias de cada etapa. Redirigen al visor. **Generadas, no se editan a mano.** |
| `og/etapa1.png`…`og/etapa6.png` | Las tarjetas de vista previa de WhatsApp. **Generadas.** |
| `herramientas/og.js` | Genera las dos cosas de arriba a partir de los datos del visor. |

`datos.js` y `trazas.js` están duplicados dentro de `index.html`. Se
mantienen sueltos porque son más cómodos de editar y de revisar en una PR.
**Si cambias uno, hay que volver a incrustarlo** (ver más abajo).

---

## Decisiones técnicas ya tomadas

No hace falta reevaluarlas:

- **Un solo archivo HTML autónomo.** Sin build, sin dependencias que
  instalar. Se abre y funciona.
- **MapLibre GL JS** para el mapa. Gratis, sin API key.
- **PNOA del IGN** como capa satélite (WMTS, `GoogleMapsCompatible`). Mejor
  resolución que ESRI en la Galicia rural. **La atribución «PNOA cedido por ©
  Instituto Geográfico Nacional de España» es obligatoria por licencia.** Cubre
  solo España; si el servicio falla, la web cambia sola a ESRI de respaldo.
- **OpenTopoMap** como segunda capa: curvas de nivel y senderos, para el bosque
  donde el satélite no ve el camino. Se alterna con los botones de arriba a la
  izquierda y la elección se recuerda.
- **Tiles DEM terrarium de AWS** para el relieve 3D (exageración 1.6, y botón
  «3D» que alterna pitch 0 / 60).
- **Marcadores DOM, nunca symbol layers.** Las etiquetas de texto de
  MapLibre dependen de una fuente de glyphs externa que puede no cargar, y
  entonces los textos desaparecen sin dar error. Todos los marcadores son
  `maplibregl.Marker` con un `div` HTML.
- **localStorage solo para lo personal de cada móvil:** los sellos
  (`lolitas2026-sellos`), las respuestas de los retos (`lolitas2026-retos`) y
  quién juega (`lolitas2026-persona`). Son marcas de cada peregrino; si se
  pierden no se pierde nada del viaje. Todo lo demás vive en memoria o en el
  propio HTML. **No hay servidor ni sincronización**: el ranking de los retos
  se lleva a mano, pegando mensajes en el chat de WhatsApp.
- **`history.replaceState` va dentro de try/catch.** Con protocolo `file://`
  algunos navegadores lo rechazan y sin la protección se rompe la navegación
  entera.

---

## Cómo están montados los datos

### Kilometrajes

Cada punto tiene dos: `km` (medido sobre la traza GPX) y `kmGuia` (el que
dice la tita Lucila). Cuando difieren en más de 300 m se muestran los dos.
No se elige uno en silencio.

Las trazas dan **122,3 km** en total, frente a los 115,5 de la guía. Un 6 %
más, que es lo normal: el GPS sigue cada curva.

### Desnivel

El D+ crudo de los GPX es basura: la etapa 1 daba +1.466 m, imposible para
23 km en Galicia. Es ruido del GPS.

El filtro aplicado es **media móvil de 31 puntos sobre la altitud, y umbral
de 10 m para contar un cambio**. Calibrado contra las cifras que publica
Gronze:

| | Este visor | Gronze |
|---|---|---|
| Etapa 1, Sarria–Portomarín | +403 m | +398 m |
| Etapa 2, Portomarín–Palas | +503 m | +519 m |

Total: **+1.823 m de subida, −2.110 de bajada**.

### Modelo de horarios

Naismith con corrección de Langmuir, en `CONFIG_MARCHA`:

```
tiempo = distancia / V_BASE
       + subida / 600            (1 hora por cada 600 m de ascenso)
       − descenso_suave / 300 × 0,166    (bajada del 5 al 12 %: bonifica)
       + descenso_fuerte / 300 × 0,166   (bajada de más del 12 %: penaliza)
       × FACTOR_FATIGA
```

`V_BASE` está en 4 km/h y `FACTOR_FATIGA` en 1,0. **Después del primer día
real, ajustad `FACTOR_FATIGA`** dividiendo el tiempo que tardasteis entre el
que estimaba el visor.

No cuenta paradas. El horario de la tita Lucila sí las incluye, por eso es
más tardío: los dos se muestran por separado.

Descarté la corrección de Tranter porque exige medir el tiempo del grupo en
un recorrido patrón antes de salir, cosa poco práctica con doce personas.

---

## Principio de fondo

**Antes un "esto no lo he podido verificar" que un dato inventado con
aspecto de fiable.** Cuando dos fuentes discrepan se muestran ambas con su
procedencia.

En el visor esto se ve así:

- Nota roja **"Sin verificar"** — dato que no se ha podido comprobar.
- Nota roja **"Los km no cuadran"** — la guía se contradice a sí misma.
- **"situado sobre la traza"** — el punto se movió a la ruta real porque la
  coordenada original estaba a más de 350 m. Son 30 puntos.

Hay unas 45 incongruencias detectadas entre los PDFs. Están todas visibles
en la interfaz, en el apartado "Avisos" de cada etapa.

---

## Pendiente de resolver

- **Villa Xardín (O Pedrouzo, 22 de agosto):** 10 plazas para 11 personas.
  Falta una cama.
- **Cerceda (22 de agosto):** la cena en O Ceadoiro está solicitada pero sin
  confirmar. Es la única del viaje sin cerrar.
- **Arzúa (21 de agosto):** Casa Nené tiene dos reservas, 8 + 4 = 12, a horas
  distintas. Desde el jueves sois 11. Conviene unificar.
- **Santiago (23 de agosto):** la misa de 19:30 y la cena de 20:30 no caben
  las dos.
- **Antes del 12 de agosto:** hay que decirle a Mesón A Lareira (Palas de
  Rei) qué va a cenar cada uno. Lo piden con una semana de antelación.

---

## Tareas de mantenimiento

### Reincrustar datos.js o trazas.js en index.html

La web carga los datos desde dentro del HTML, no desde los archivos sueltos.
Tras editar `datos.js`:

```bash
python3 - <<'EOF'
s = open('index.html', encoding='utf-8').read()
d = open('datos.js', encoding='utf-8').read()
ini = s.find("<script>\n/* ============================================================\n   DATOS DEL VIAJE")
ini_c = ini + len("<script>\n")
fin = s.find("</script>", ini_c)
s = s[:ini_c] + d + "\n" + s[fin:]
open('index.html','w',encoding='utf-8').write(s)
print("datos.js reincrustado")
EOF
```

### Validar antes de hacer commit

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

### Regenerar las vistas previas de WhatsApp

Las etiquetas Open Graph no se pueden generar en el cliente: los rastreadores
de WhatsApp no ejecutan JavaScript. Por eso hay una página estática por etapa
(`etapaN.html`) con sus etiquetas ya hechas, que redirige al visor, y una
tarjeta PNG por etapa (`og/etapaN.png`) con el nombre, los km y el desnivel.

Los km y el desnivel salen de las mismas funciones del visor, así que si
cambias una traza o una etapa, hay que regenerarlas:

```bash
npm run og
```

**La URL de publicación está fijada** en la constante `BASE` de
`herramientas/og.js` (ahora `https://thorito27.github.io/Camino-de-Santiago`),
porque `og:image` exige URL absoluta. Si el sitio se publica en otra dirección,
cambia esa línea y vuelve a lanzar `npm run og`.

La primera vez hace falta `npm install` (usa `@resvg/resvg-js` para pasar el
SVG a PNG; WhatsApp no acepta SVG en `og:image`).

### Subir el número de versión del caché

Si cambias `index.html`, sube `VERSION` en `sw.js` (`camino-v1` →
`camino-v2`). Si no, los móviles que ya lo tengan cacheado seguirán viendo
la versión antigua.

---

## Qué falta por hacer

Ideas que quedaron sobre la mesa:

- **Identificación por nombre y ubicación compartida del grupo.** Que cada
  persona, al entrar, indique su nombre (sin contraseña, solo para
  identificarse dentro del grupo). El objetivo final es que cualquiera pueda
  ver en el mapa dónde está cada integrante del viaje en cada momento, no solo
  su propia posición como ahora.
  Complejidad a tener en cuenta cuando se aborde: la geolocalización actual
  (`Geo`) es local a cada móvil y GitHub Pages no tiene backend, así que
  compartir ubicaciones entre las Lolitas exige un servicio externo con
  almacenamiento en tiempo real (tipo Firebase o Supabase) y decisiones de
  privacidad: cada cuánto se actualiza, cuánto tiempo se conserva, y si se
  puede desactivar por persona.
- Alertas por fecha que aparezcan solas y desaparezcan al pasar.
- Selector de tamaño de letra, más allá del aumento que ya hay en móvil.

Ya hechas:

- **Retos** (`vistaEtapa = 7`, `panelRetos`): cuestionario de **34 preguntas**
  en dos bloques (10 previas + 4 por etapa). Primero eliges **quién eres** de
  la lista del grupo (`PERSONAS`). El bloque previo está siempre abierto; las
  tandas de cada etapa se desbloquean el día de la etapa a las 16:00 y hasta
  entonces solo enseñan pistas. **Una sola oportunidad por pregunta.**
  Puntuación acumulada y por etapa, menciones (pleno de etapa, racha de 3 o
  más) y botón para **compartir la puntuación por WhatsApp**: el ranking del
  grupo se lleva en el chat, no hay ranking automático.
- **Portada de bienvenida** (`vistaEtapa = -1`, `panelPortada`): presentación
  del grupo y del viaje, con el trazado como SVG propio. Es lo primero que se
  ve salvo si se entra con `?etapa=N`.
- **Sub-pestañas de etapa**: «El día» pasó a llamarse «Itinerario» y va la
  primera; la sección por defecto al abrir una etapa es esa (`dia`).
- **Vista previa propia por etapa** al compartir por WhatsApp (`etapaN.html` +
  `og/etapaN.png`, `npm run og`).
- **Avisos derivados en la sección Tiempo** (calor por tramo, lluvia, frío de
  mañana, viento) sobre los datos ya descargados de Open-Meteo.
- **Apartado «Decisiones del grupo»** en el índice, con el estado en la
  constante `DECISIONES` de `datos.js` y un botón de WhatsApp por decisión.
