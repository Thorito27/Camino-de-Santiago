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
| `herramientas/validar.js` | `npm run validar`: comprueba la sintaxis del JS incrustado. |
| `herramientas/probar.js` | `npm test`: recorre las 37 vistas de etapa con jsdom, más portada, retos y equipaje. |
| `herramientas/ajustar-puntos.js` | Lleva los puntos de `datos.js` a la traza GPX. |
| `CLAUDE.md` | Reglas fijas del proyecto, para trabajar con Claude. |
| `PROJECT_STATE.md` | Diario de sesiones: qué se hizo y cuándo. |
| `package.json` | Los tres scripts de npm y la única dependencia (jsdom, y `@resvg/resvg-js` para las tarjetas). |

`datos.js` y `trazas.js` están duplicados dentro de `index.html`. Se
mantienen sueltos porque son más cómodos de editar y de revisar en una PR.
**Si cambias uno, hay que volver a incrustarlo** (ver más abajo).

---

## Qué hace la web

**Portada.** Lo primero al entrar: quiénes van, qué es el Camino Francés y por
qué se sale de Sarria, qué es la Compostela, los dos sellos al día y cómo usar
la web. El trazado se dibuja como SVG propio, sin imágenes externas. Con
`?etapa=N` se salta directo a esa etapa.

**Índice.** Tabla de las seis etapas con km, desnivel y tiempo estimado, la
previsión de los días que quedan, el apartado «Decisiones del grupo», los
teléfonos y el botón de guardar mapas para zonas sin cobertura.

**Cada etapa** tiene seis pestañas, en este orden:

| Pestaña | Qué muestra |
|---|---|
| **Itinerario** | El horario de la tita Lucila, dónde se duerme, comidas, qué ver y avisos. Es la que se abre por defecto. |
| **Ruta** | Los puntos del recorrido con su km y hora de paso estimada. |
| **Perfil** | Perfil de altitud interactivo; al mover el punto, el marcador recorre la traza en el mapa. |
| **Paradas** | Dónde se puede parar o coger un taxi, y dónde comer. |
| **Sellos** | Checklist de los dos sellos diarios que exige la Compostela. |
| **Tiempo** | Previsión hora a hora, con avisos derivados (calor por tramo, lluvia, frío de mañana, viento). |

**Retos.** Séptima pestaña: cuestionario de 34 preguntas sobre el Camino, en
dos bloques. Primero eliges quién eres. El bloque previo está siempre abierto;
las tandas de cada etapa se abren el día de la etapa a las 16:00 y hasta
entonces solo enseñan pistas. Una sola oportunidad por pregunta. El ranking del
grupo **no es automático**: se comparte por WhatsApp pegando el mensaje.

**Equipaje.** Octava pestaña: el checklist de la maleta, **43 cosas en cinco
grupos**, con barra de progreso y contador por grupo. Los cuatro primeros
(ropa, calzado, equipo, botiquín y aseo) son las **37** de la lista de la tita
Lucila, entera. El quinto, «Además de la guía», son **6** que añadió el grupo y
que en su papel no están (credencial, DNI, cargador, batería portátil, gafas de
sol y tarjeta bancaria): va aparte y marcado, para no atribuirle nada que no
escribiera. Se marca en el móvil de cada una y no se comparte con nadie, igual
que los sellos. Se llega también con `?equipaje=1`.

**¿Cuánto queda?** Botón de la cabecera que abre una ventana con lo que falta
hasta el final de la etapa: kilómetros, subida y bajada pendientes, tiempo de
marcha estimado y una cuenta atrás hasta la hora de llegada que marca la guía.
Elige la etapa sola por este orden: **dónde estás** (si la ubicación está
activa y sobre la traza) → **la etapa de hoy** → **la que tengas abierta** →
**la primera**. Con ubicación cuenta desde tu kilómetro y añade a qué hora
llegarías al ritmo estimado; sin ella enseña la etapa entera y ofrece activarla.

**En el mapa y la cabecera.** Botón «Hoy» que salta a la etapa del día,
«Dónde estoy» que sitúa al peregrino sobre la traza, cuenta atrás en horas y
minutos hasta la llegada a Santiago, botón 3D y compartir.

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
- **Tiles DEM terrarium de AWS** para el relieve 3D (exageración 1.6, y botón
  «3D» que alterna pitch 0 / 60).
- **Marcadores DOM, nunca symbol layers.** Las etiquetas de texto de
  MapLibre dependen de una fuente de glyphs externa que puede no cargar, y
  entonces los textos desaparecen sin dar error. Todos los marcadores son
  `maplibregl.Marker` con un `div` HTML.
- **localStorage solo para lo personal de cada móvil:** los sellos
  (`lolitas2026-sellos`), las respuestas de los retos (`lolitas2026-retos`),
  quién juega (`lolitas2026-persona`) y el equipaje ya metido
  (`lolitas2026-equipaje`). Son marcas de cada peregrino; si se
  pierden no se pierde nada del viaje. Todo lo demás vive en memoria o en el
  propio HTML. **No hay servidor ni sincronización**: el ranking de los retos
  se lleva a mano, pegando mensajes en el chat de WhatsApp.
- **Los tiempos de marcha se calculan con `hitosLimpios(n)`, no con
  `et.puntos` en crudo.** Añade un punto final en el km donde acaba la traza
  (el último hito de la guía se queda corto: 0,71 km en la etapa 4) y descarta
  los puntos que retrocedan. Lo usan `perfilEtapa`, `Marcha.horarios` y
  `Queda`, para que los tres digan lo mismo.
- **Cuidado al tocar `ajustar-puntos.js`: hay seis nombres de punto repetidos
  en dos etapas** (Portomarín, Palas de Rei, Melide, Arzúa, O Pedrouzo y
  A Brea, que son dos pueblos distintos con el mismo nombre). La herramienta
  buscaba por nombre sobre el archivo entero y escribía en la primera
  coincidencia, así que la fila de la segunda etapa machacaba la de la
  primera. Eso dejó cinco destinos con el km de la traza siguiente y «A Brea»
  de la etapa 2 a 38 km de su sitio, y la etapa 2 enseñando **10 h de marcha**
  para 27,6 km. Corregido el 28 de julio de 2026: el archivo se recorre hacia
  delante y se va consumiendo.
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

`V_BASE` está en 4 km/h y `FACTOR_FATIGA` en 1,0 (valores reales de
`CONFIG_MARCHA`; los umbrales de bajada son 5 % y 12 %). **Después del primer día
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

Las cinco siguen abiertas: en `DECISIONES` (`datos.js`) las cinco tienen
`estado:'pendiente'`. Se ven en el índice, y el estado se edita a mano en el
repositorio cuando algo se cierre de verdad.

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

- **«¿Cuánto queda?»** (`Queda`, botón `#btnQueda`): distancia, desnivel y
  tiempo hasta el final de la etapa, con cuenta atrás hasta la hora de llegada
  de la guía. Al construirlo salieron **once puntos mal puestos en `datos.js`**
  que hacían mentir a las estimaciones de marcha; se corrigieron reproyectando
  con `ajustar-puntos.js`, tras arreglar el fallo de la herramienta que los
  había roto.

- **Equipaje** (`vistaEtapa = 8`, `panelEquipaje`): checklist de la maleta a
  partir del PDF «Checklist maleta» de la tita Lucila, en la constante
  `EQUIPAJE` de `datos.js`. Su papel trae tres apartados (Ropa, Calzado y
  Otras cosas); aquí «Otras cosas» se partió en «Equipo» y «Botiquín y aseo»
  para que fuese más corto de repasar, y las líneas que juntaban varias cosas
  con comas se separaron en items marcables: **37 items de sus 28 viñetas**, sin
  quitar ni añadir nada. Lo que su papel no trae va en un quinto grupo con
  `extra:true` («Además de la guía»: credencial, DNI, cargador, batería, gafas y
  tarjeta bancaria), pintado aparte y con su aviso, para que nunca se le
  atribuya a ella algo que no escribió.
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
