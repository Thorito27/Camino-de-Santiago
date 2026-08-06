# Estado del proyecto — Las Lolitas al Camino

Registro de qué se ha hecho en cada sesión de trabajo. Se actualiza AL FINAL
de cada sesión, nunca al principio, y las entradas nuevas van arriba del todo
(orden descendente).

Antes de empezar una sesión nueva, lee al menos las 2-3 entradas más recientes
para saber en qué punto está el proyecto.

Arriba del todo, antes del diario, está la sección **Auditoría**: el estado
conocido del visor (lo roto, lo frágil y lo mejorable) y lo que falta por probar
a mano. Esa sección se sustituye cuando se hace una auditoría nueva; el diario,
en cambio, solo crece.

> Sobre las fechas: el historial de git de este repo está muy condensado (todo
> el visor se subió en un único commit). Donde no se puede reconstruir una
> sesión con certeza desde git, se dice explícitamente y se usa la fecha del
> commit correspondiente en vez de inventarla.

---

## Auditoría

Estado del visor tras el repaso completo del **24 de julio de 2026**, a un mes
de salir. Esta sección no es un diario: se actualiza y se sustituye cuando se
haga otra auditoría. Las entradas cronológicas van más abajo.

### ROTO

**Nada.** Buscado en serio, no por cortesía:

- Las **26 funciones** invocadas desde el HTML existen todas (inventario de
  botones, pestañas, tarjetas, slider, marcadores, enlaces `tel:` y compartir).
- **187 comprobaciones automatizadas** en `npm test`, 0 fallos.
- Coherencia de datos: los km de la traza cuadran con el último vértice en las
  seis etapas; el grupo sale correcto (12/12, 12/12, **12 caminan y 11 duermen
  el 20**, 11/11, 11/11, 11/11); los 34 retos tienen ids únicos, cuatro
  opciones y una sola correcta; los teléfonos son válidos para `tel:`; ninguna
  coordenada se sale de Galicia.

Por eso no se subieron `VERSION` ni `APP_VERSION`: no se tocó código de la web,
solo la herramienta de pruebas.

### FRÁGIL

Funciona, pero conviene saberlo. **Ninguna de las tres se arregló**, y aquí
está el porqué:

1. **Dependencia de `unpkg.com` para MapLibre, sin copia local.** Es la única
   de las tres dependencias externas sin red de seguridad: el IGN cae solo a
   ESRI y Open-Meteo degrada con aviso, pero **si unpkg no responde no hay
   mapa** (sale el aviso de librería no cargada). No se arregló porque bajar
   MapLibre al repositorio son ~800 KB y cambiaría la estrategia de caché a un
   mes de salir. Decisión pendiente.
2. **`npm test` no ve nada visual.** jsdom detecta errores de JavaScript,
   vistas vacías y estados incoherentes, pero **no pinta**: no puede decir si un
   botón es pequeño o si un texto no se lee al sol.
3. **La cuenta atrás y el desbloqueo de Retos usan la hora del dispositivo.**
   Si alguien tiene mal la fecha del móvil, verá los retos abiertos antes de
   tiempo. No es arreglable sin servidor y el daño es cosmético.

### MEJORABLE

Propuesto, **no hecho**:

- `pintarPanel()` reconstruye todo el HTML en cada cambio. **Se midió y no
  compensa tocarlo**: 20 movimientos de slider tardan **1 ms**, porque el
  slider no repinta el panel, solo sustituye el SVG del perfil. Optimizarlo
  sería refactorizar por gusto.
- Peso: `index.html` son 226 KB en crudo pero **73 KB comprimidos**, que es lo
  que viaja de verdad. De ellos, 31 KB son las seis polilíneas GPX.
- Cuatro listeners globales (`keydown`, `online`, `offline`,
  `visibilitychange`), registrados una sola vez. Marcadores: 88 creados y 81
  destruidos al recorrer las seis etapas; sin fuga.

### Lo que hay que probar en el móvil

Cinco cosas que ninguna prueba automática puede cubrir, con el criterio de qué
sería un fallo:

| Qué probar | Sería un fallo si… |
|---|---|
| Guardar mapas con wifi, modo avión, cerrar y reabrir | el mapa sale negro o la web no carga |
| El mapa **en vertical** (es lo que más costó) | no ocupa toda la pantalla o se queda en una franja |
| La traza roja sobre bosque oscuro (etapas 2-3) | no se distingue por dónde va el camino |
| El 3D en la bajada a Portomarín y la Sierra de Ligonde | el relieve parece una caricatura, o no se aprecia |
| Darle el móvil a la abuela Lola sin explicarle nada | no sabe qué pulsar en los primeros 30 segundos |

**Duda que queda abierta:** no se ha podido comprobar que los tiles del PNOA se
sirvan de verdad desde el caché sin red. Se verificó que el service worker los
reconoce como cacheables, pero eso es leer el código, no probarlo con el móvil
en modo avión. Es justo la primera fila de la tabla.

---

## 2026-08-06 — Portada: los que no vienen, la autoría y el baile de los coches

Tres correcciones pedidas sobre la portada.

### Daniel, Pepe y Fidel

Se añade, al final de «Quiénes van»: «Y en el camino habrá un recuerdo para
Daniel, Pepe y Fidel, que esta vez no vienen».

**Está escrito en tono neutro a propósito.** El encargo decía «nos acordaremos
de Daniel, Pepe y Fidel que no vienen», y esa frase admite dos lecturas —que
no han podido venir a este viaje, o algo más definitivo—. No se preguntó
porque una redacción sosegada vale para las dos y no afirma nada que no se
sepa; queda dicho aquí para que, si hace falta otro tono, se cambie a
conciencia y no por descuido.

### La autoría de los datos

«Los preparó la tita Lucila en su guía» pasa a «salen de la guía de la tita
Lucila, **con aportes de Juan Martínez**». Es una atribución, no un adorno.

### Cómo se mueven los coches

Apartado nuevo. Sois doce y hay tres coches; el movimiento de cada día, en
cuatro pasos numerados (numerados porque es un orden: hecho de otra forma, no
sale):

1. A primera hora los tres coches van al **destino** de la etapa. Tres
   conductores.
2. Se **dejan dos** y todos vuelven en el tercero al **punto de partida**.
3. Se camina la etapa.
4. Al llegar andando esperan esos dos coches. Se coge uno para volver al origen
   a por el que quedó allí: **van dos personas y vuelven con los dos coches**.

Los conductores que hacen falta en cada paso (tres por la mañana, dos por la
tarde) no venían en el encargo: se deducen del propio movimiento y se dicen
porque es lo que se calcula mal.

El apartado cierra con que al final del día los tres coches quedan en el
destino, que es el punto de partida del día siguiente. **Se comprobó antes de
afirmarlo**: las seis etapas encadenan (Portomarín, Palas de Rei, Melide,
Arzúa, O Pedrouzo), y se dice explícitamente que el último día no hace falta
porque en Santiago se acaba. Hay una prueba que vigila ese encadenamiento.

Y un aviso al pie: **en un taxi normal caben cuatro personas**, así que para
los doce harían falta tres. Enlaza a los puntos de escape, que llevan los
teléfonos.

### Comprobado

`npm test`: **383 comprobaciones, 0 fallos** (eran 374). `npm run validar` y
`node --check` OK.

El texto de la portada está a mano y no sale de ningún dato, así que se le
pusieron pruebas: los tres nombres, la atribución y los cuatro pasos. Probadas
**en negativo**: quitando a Fidel, la mención a Juan Martínez y un paso de la
lista, saltan cuatro fallos.

`VERSION` a `camino-v23`. `APP_VERSION` sigue en `map-9`.

**Sin comprobar en navegador real.** Se leyó el texto plano de la portada
entera y se lee bien, pero el estilo de la lista numerada (el `::marker` en
dorado) no lo ha visto nadie.

---

## 2026-08-06 — Repaso de los apartados de etapa: se repetían y mentían

Encargo: revisar los apartados dentro de cada etapa, que no sean repetitivos y
se ajusten a la realidad, y dejar los rótulos simples. El ejemplo que se dio
—no se puede decir «en el destino» y meter ahí cosas de todo el trayecto— era
la punta del ovillo. Había cinco fallos.

### 1. La misma lista, pintada dos veces

`et.cultura` se renderizaba **entera en Itinerario** (`<h2>Qué ver</h2>`) **y
otra vez en Paradas** («Además, en el destino»). El mismo contenido, palabra
por palabra, en dos pestañas. Ahora vive **solo en Paradas**.

### 2. «Además, en el destino» era falso

La lista recorre la etapa entera. Ejemplos: la etapa 1 empieza con «Ponte da
Aspera — se ve al salir de Sarria», que es el **punto de salida**; la etapa 4
abría con «Melide — Iglesia de Santa María», que es **de donde se sale**; y la
etapa 2 metía ahí la Iglesia de Vilar de Donas y el Castillo de Pambre, que
están **a 7 y 10 km fuera del Camino**.

`cultura` pasa de cadenas sueltas a `{donde, texto}`, con `donde` ∈ `salida` /
`camino` / `destino` / `desvio`, y Paradas agrupa bajo rótulos que dicen la
verdad: «Al salir de Sarria», «Por el camino», «Al llegar a Portomarín»,
«Fuera del Camino, hay que desviarse».

### 3. Diez entradas repetían una tarjeta que estaba justo encima

Y **la tarjeta siempre decía más**, porque lleva km, horario, ficha y distancia
desde donde estás. Se quitaron de la lista después de comprobar una por una que
no se perdía nada; los dos detalles que solo estaban ahí se pasaron a la ficha
de su punto:

| Detalle | Se pasó a |
|---|---|
| el hórreo de Castañeda | ficha de Castañeda (etapa 4) |
| el puente del s. XIV sobre el río Seco | ficha de O Leboreiro (etapa 3) |
| el hospital de la Orden de Santiago | ficha de Ligonde (etapa 2) |

La regla que queda: en `cultura` no va nada que ya se vea en Paradas. Los tipos
`taxi`, `comida`, `cultura`, `iglesia` y `mirador` salen ahí como tarjeta; los
de `inicio`, `fin` y `paso` no, y por eso la catedral de Santiago sí sigue en
la lista.

### 4. «La tita Lucila propone parar aquí» mentía en dos de cinco

Ese bloque resumía las entradas `destacado` del horario. En la etapa 1 la
entrada es la descripción de un tramo («Barbadelo-Ferreiros, dificultad BAJA,
el mejor tramo») y en la 6 es una llegada («Llegada a Monte do Gozo»). Ninguna
de las dos es una parada. Además ya salían enteras en el horario del
Itinerario. Se quitó el bloque.

### 5. Un rótulo obsoleto

La nota de Ruta remitía a «El día», pestaña que se llama **«Itinerario»** desde
hace tiempo.

### Los rótulos, más cortos

| Antes | Ahora |
|---|---|
| Si alguien quiere parar | Puntos de escape |
| Dónde descansar | Bares y comida |
| Qué merece la pena ver | Qué ver |

«Bares y comida» son los del recorrido; los restaurantes reservados siguen en
Itinerario, bajo «Comer y cenar». Estaban mezclándose en la cabeza de
cualquiera que leyera «Dónde descansar».

### De paso: los datos de etapa contradecían las decisiones cerradas hoy

Al cerrar las decisiones esta misma mañana quedaron descolgadas tres fichas:

- Villa Xardín seguía diciendo «PROBLEMA SIN RESOLVER: falta una cama», y salía
  **en rojo**, cuando la cama supletoria ya está reservada. Se añadió
  `supletorias` al alojamiento; el rojo ahora solo salta si de verdad faltan
  camas contando las supletorias.
- La etapa 5 seguía con la cena en O Ceadoiro y «Única cena del viaje SIN
  CONFIRMAR». Ahora dice que se cena en el alojamiento, **y por qué**.
- La etapa 6 seguía preguntando «misa completa o cena puntual». Ahora recoge lo
  decidido y **lo que falta**: confirmar con Milongas la hora nueva. No se
  inventó la hora, que no se sabe.

Hay tres comprobaciones nuevas que atan las fichas de etapa al estado de
`DECISIONES`, para que no vuelvan a divergir.

### Comprobado

`npm test`: **374 comprobaciones, 0 fallos** (eran 324; 50 nuevas, casi todas
del apartado «3 bis. Paradas»). `npm run validar` y `node --check` OK.

Las tres guardas nuevas se probaron **en negativo**: metiendo a propósito un
duplicado de ficha, una entrada sin `donde` y la nota vieja de Villa Xardín,
saltan cuatro fallos. Después se restauró.

`VERSION` a `camino-v22`. `APP_VERSION` sigue en `map-9`: no se tocó el mapa.

**Sin comprobar en navegador real**, como siempre: jsdom no pinta. Sí se leyó
el texto plano de las seis Paradas, y los rótulos salen correctos en las seis.

---

## 2026-08-06 — Dos cosas al equipaje y las respuestas del grupo a las decisiones

A doce días de salir. Dos encargos: añadir tres cosas al checklist de la maleta
y recoger en la web las respuestas que dio la tita Lucila por WhatsApp a las
preguntas del apartado «Decisiones del grupo».

### Equipaje: se añadieron dos de las tres

Pedidas: crema de masaje para pies, botella de agua y crema de sol.

**La crema de sol NO se añadió, porque ya estaba.** Es `bot-solar`, «Crema
solar», en el botiquín, y viene de la guía. Duplicarla habría dejado dos
casillas para lo mismo y descuadrado la cuenta de la maleta para siempre. Se
dijo en vez de meterla callando.

Las otras dos van al grupo `extra` («Además de la guía»), que es donde va lo
que no escribió la tita Lucila:

- `ex-crema-pies` — Crema de masaje para los pies. La guía trae vaselina, pero
  es para prevenir rozaduras **antes** de andar; esto es el masaje de después.
  Son cosas distintas y la nota lo dice.
- `ex-botella` — Botella de agua. El agua se nombra en la guía, pero dentro de
  la nota de la mochilita («para el agua y lo de cada día»), no como cosa que
  meter. La nota lo aclara.

**Y una prueba nueva que habría cazado esto solo:** ahora `npm test` comprueba
que no hay dos items con el mismo nombre (comparando en minúsculas y sin
tildes) ni dos con el mismo `id`. Se verificó que **falla de verdad**: metiendo
«Crema solar» duplicada a propósito, salta `FALLO: no hay dos cosas con el
mismo nombre`. Después se restauró.

### Decisiones: cuatro respuestas de las cinco

De la captura del chat, del 28 de julio. Estado nuevo de las cinco:

| Decisión | Respuesta | Estado |
|---|---|---|
| Villa Xardín, cama que falta | «Reservada una cama supletoria» | **Resuelto** |
| Cena en O Ceadoiro | «Esta noche cenamos en casa. Encargamos pizza o algo» | **Resuelto** |
| Casa Nené, dos reservas | «Quedó tu padre en llamar» | **En curso** |
| Santiago, misa y cena | «Le dije a tu padre que retrasara la cena» | **En curso** |
| Mesón A Lareira, el menú | (sin respuesta) | Pendiente |

**La de O Ceadoiro era ambigua y no se resolvió a solas.** «Esta noche cenamos
en casa» podía ser la respuesta a la cena del 22 en Cerceda o un mensaje
suelto sobre esa misma noche del 28 de julio, sin relación con el viaje. Se
preguntó, y la lectura buena es la primera: se cae O Ceadoiro y esa noche se
cena en el alojamiento.

**A Lareira sigue pendiente y es la urgente**: la fecha límite para comunicar
el menú es el **12 de agosto**, dentro de seis días.

### Lo que se tocó en el código

- **Estado nuevo `encurso`** («En curso»), para lo que tiene a alguien detrás
  pero no está confirmado. Antes solo había `pendiente` y `resuelto`, y las dos
  mentían aquí: «pendiente» daba a entender que nadie se había movido, y
  «resuelto» habría dado por cerrado lo que no lo está. El borde de la tarjeta
  hace de semáforo: rojo sin empezar, dorado en curso, verde cerrado.
- **Campo `respuesta`** en `DECISIONES`, con `texto` / `quien` / `cuando` y un
  `aclara` opcional. **La frase literal y lo que hemos entendido de ella van en
  campos distintos y se pintan distinto** (`<q>` con cita, y `.aclara` debajo).
  No es cosmético: si se mezclaran, la web le estaría atribuyendo a la tita
  Lucila una interpretación nuestra.
- El botón de WhatsApp ya no sale en lo cerrado, y en lo que está en curso dice
  «Preguntar cómo va».
- La nota de cabecera cuenta cuántas quedan abiertas.

### Comprobado

`npm test`: **324 comprobaciones, 0 fallos** (eran 311; 13 nuevas). `npm run
validar`: OK. `node --check` sobre los tres bloques del HTML, `sw.js` y
`probar.js`: OK.

Se arregló de paso una prueba que se habría quedado callada: contaba las
tarjetas con `class="decision"` exacto, y al añadir el estado a la clase
(`class="decision encurso"`) habría dejado de contarlas sin avisar.

`VERSION` a `camino-v21` porque cambió `index.html`. `APP_VERSION` se queda en
`map-9`: no se tocó el mapa.

**Lo que NO se ha comprobado:** nada de esto se ha visto en un navegador de
verdad, solo en jsdom, que no pinta. El semáforo de colores de las tarjetas y
el bloque de la cita están sin mirar con los ojos.

---

## 2026-07-28 — La pantalla en blanco: el service worker devolvía `undefined`

Aviso de que **la web no cargaba, pantalla en blanco**. Lo primero fue
descartar lo publicado, y estaba todo bien: `main` íntegro (el HTML cierra, los
cuatro bloques de script completos, cada constante una sola vez), las **311
comprobaciones** de `npm test` pasando **ejecutadas contra el contenido exacto
de `main`** —no contra la copia local—, `npm run validar` OK y el despliegue de
Pages en éxito para el commit de la fusión (16:55 UTC).

Faltaba un hueco en las pruebas y se tapó: **en este entorno `unpkg.com` está
bloqueado**, así que MapLibre no había cargado nunca en un navegador de verdad
y ese camino solo lo cubrían los tests con jsdom, que lo simulan. Se bajó
MapLibre **de npm** (que sí está permitido), se sirvió la página apuntando a la
copia local y cargó perfectamente: panel y navegación pintados, cero errores.
Conviene recordar el truco la próxima vez que haya que probar «con mapa».

### El fallo de verdad

Está en `sw.js`. El respaldo de navegación sin red hacía
`caches.match('./index.html')`, que devuelve **`undefined`** si esa copia no
está guardada, y con eso se resolvía `respondWith`. El navegador contesta
entonces `ERR_FAILED`, y en el móvil eso **se ve como una pantalla en blanco**:
parece la web rota cuando lo único que falta es cobertura.

Y se vuelve probable **justo al subir de `VERSION`**: al activarse se borran las
cachés viejas, y si la instalación no consiguió guardar la página —móvil con
mala cobertura en ese momento, que en el Camino es lo normal— el caché nuevo
queda vacío. A partir de ahí, cualquier fallo de red da pantalla en blanco en
vez de la copia guardada. Se acababa de subir a `camino-v19`.

Reproducido en Chromium con service worker real, caché vaciada y red cortada:
`net::ERR_FAILED` y el navegador con su página de error.

### El arreglo

- **`paginaSinRed()`**: una página de verdad, con el aviso de sin conexión y un
  botón de reintentar. **Ninguna rama del `fetch` puede devolver ya
  `undefined`.**
- El respaldo de navegación encadena `./index.html` → la raíz → la propia
  petición → `paginaSinRed()`.
- **`activate` reintenta guardar los `ESENCIALES`** tras purgar las cachés
  viejas, para no quedarse con un caché vacío después de actualizar.

| Escenario | Antes | Ahora |
|---|---|---|
| Caché vacía y sin red | `ERR_FAILED`, pantalla en blanco | Aviso «Sin conexión» con botón |
| Sin red con copia guardada | La web entera | La web entera (16.004 caracteres de panel) |
| Con red | Normal | Normal |

`VERSION` a `camino-v20`. `APP_VERSION` sin tocar: no se cambió `index.html`.

**Lo que NO se ha podido comprobar:** abrir la web publicada desde aquí, porque
el proxy del entorno bloquea `github.io`. Es un fallo real, reproducible y que
da ese síntoma exacto, pero **no está confirmado que fuera el que se estaba
viendo en el móvil**.

### Y una lección de proceso

Se descubrió de paso que **la PR #24 llevaba fusionada desde el día 27** y se
habían seguido subiendo commits a esa misma rama, que quedaron fuera de `main`
mientras parecía que estaban entregados. Se rearrancó la rama desde `main`, se
rebasaron encima y se abrió la PR #25. Queda como regla que no se negocia en
CLAUDE.md: llegar hasta fusionar, y comprobar antes si la PR de la rama ya lo
está.

---

## 2026-07-28 — Arreglados los once puntos mal puestos, y la herramienta que los rompió

Continuación de la entrada de abajo. Ahí se saneaban los km al vuelo con
`hitosLimpios` y quedaba pendiente arreglarlos de raíz. Ya está hecho, y
apareció **la causa**, que era mejor noticia que el síntoma.

### La causa: nombres repetidos

**Seis puntos se llaman igual en dos etapas**, porque el destino de una es el
origen de la siguiente: Portomarín (1 y 2), Palas de Rei (2 y 3), Melide (3 y
4), Arzúa (4 y 5), O Pedrouzo (5 y 6) y **A Brea (2 y 5, que son dos pueblos
distintos con el mismo nombre)**.

`herramientas/ajustar-puntos.js` localizaba cada punto con
`src.match('{nombre:"…"')` y escribía con `src.replace(...)`. **Las dos cosas
van a la primera coincidencia del archivo entero.** Así que, en cada par, la
fila de la segunda etapa machacaba la de la primera:

- El Portomarín de la etapa 1 se quedó con el vértice km 0 de la traza de la
  **etapa 2**. Igual con Palas de Rei, Melide, Arzúa y O Pedrouzo.
- «A Brea» de la etapa 2 se quedó con las coordenadas de la «A Brea» de la
  **etapa 5**, a 38 km. Su propia herramienta lo cantaba: el aviso de «se
  movería más de 500 m» decía **36.069 m** para ese punto.

Es decir: el fallo no estaba en los datos, estaba en el script que los
escribió, y llevaba ahí desde el commit `8e42823`.

### El arreglo, en tres pasos

1. **La herramienta.** Ahora el archivo se recorre **hacia delante y se va
   consumiendo**: cada fila solo puede escribir en la primera coincidencia que
   quede por delante. Como `filas` se construye en el mismo orden en que están
   los puntos en el archivo, cada una cae en su línea. Si una fila no se
   encuentra, no consume nada y se avisa por pantalla en vez de callar.
   De paso, `desviacion_m` ahora se actualiza si ya existía; antes solo se
   añadía cuando faltaba y al reejecutar quedaba el valor viejo.
2. **Las seis filas machacadas** se restauraron con sus coordenadas de antes
   del commit que las rompió, sacadas del histórico de git (`git show
   8e42823^:datos.js`), no inventadas ni deducidas.
3. **Reproyección** con `node herramientas/ajustar-puntos.js --aplicar`. Ya no
   salta ningún aviso: el punto que más se mueve son 240 m (Arzúa), frente a
   los 36 km de antes.

### Qué ha cambiado en los datos

**Once puntos**, exactamente los de nombre repetido. Ni uno más:

| Etapa | Punto | km antes | km ahora | Se mueve |
|---|---|---|---|---|
| 1 | Portomarín | 0 | 23,46 | 98 m |
| 2 | Portomarín | 0 | 0 | 109 m |
| 2 | **A Brea** | **13,98** | **25,15** | **38,2 km** |
| 2 | Palas de Rei | 0,25 | 27,52 | 14 m |
| 3 | Palas de Rei | 0,25 | 0,25 | 21 m |
| 3 | Melide | 0,89 | 15,63 | 682 m |
| 4 | Melide | 0,89 | 0,89 | 187 m |
| 4 | Arzúa | 0 | 14,73 | 368 m |
| 5 | A Brea | 13,98 | 13,98 | 4 m |
| 5 | O Pedrouzo | 0 | 19,30 | 580 m |
| 6 | O Pedrouzo | 0 | 0 | 11 m |

Comprobado además: **ningún `kmGuia` se ha tocado** (es el dato de la tita
Lucila) y **ningún punto `fueraDeRuta` se ha movido**.

Esto no era solo un número: en el mapa, el marcador de Portomarín de la etapa 1
se dibujaba donde arranca la etapa 2, y el de «A Brea» de la etapa 2 caía en
mitad de la etapa 5. Y en la pestaña Ruta de la etapa 2, A Brea aparecía en el
km 13,98 entre medias, con Palas de Rei listado en el 0,25. Ahora la lista va
en orden: Os Valos 23,51 → **A Brea 25,15** → Avenostre 26,47 → Palas de Rei
27,52.

### Qué NO ha cambiado

Los tiempos de marcha que se ven en pantalla **son los mismos que ya daba la
entrada anterior** (31 h 26 min en total), porque `hitosLimpios` ya los estaba
corrigiendo al vuelo. Lo que cambia es que ahora **los datos son correctos por
sí solos**: `Marcha.perfil(ETAPAS[1].puntos)` en crudo da 7 h 31 min en vez de
10 h 01 min.

`hitosLimpios` **se queda**, pero cambia de papel: ya no tapa datos rotos, sino
que (a) añade el punto final en el km donde acaba la traza —el último hito de
la guía se queda corto, 0,71 km en la etapa 4, once minutos de marcha— y (b)
hace de red de seguridad. Hoy solo descarta empates a mismo km (Barbadelo y su
iglesia, los dos en el 4,36), que suman cero.

### Pruebas

Nuevas, sobre **los datos**, no sobre el saneado: que ningún punto de
`datos.js` retroceda en km en ninguna etapa, que el punto final esté cerca del
final de su traza, que los seis nombres repetidos tengan km bien distinto en
cada etapa, que «A Brea» de la etapa 2 esté pasado el km 24 y la de la 5 antes
del 15, y que la etapa 2 en crudo ya no dé 10 h. Se cambió la prueba que daba
por bueno que «A Brea» se descartara: ahora exige lo contrario, que se
conserve, y que el saneado solo tire empates.

**311 comprobaciones, 0 fallos** (eran 289). `npm run validar`: OK. Comprobado
en Chromium, sin errores de JavaScript.

`VERSION` de `sw.js` sube a `camino-v19` (cambia `index.html` por los datos
reincrustados). `APP_VERSION` pasa a `map-9`: **los marcadores del mapa se
mueven**, y esa etiqueta sirve justo para saber desde el móvil qué versión se
ha cargado.

---

## 2026-07-28 — «¿Cuánto queda?» y dos kilómetros mal puestos

**Rama:** `claude/luggage-checklist-tab-4zqh2v` (la misma; la PR #24 sigue
abierta, así que el trabajo nuevo va encima en vez de en una rama aparte).

Botón nuevo en la cabecera, **«¿Cuánto queda?»**, que abre una ventana con lo
que falta hasta el final de la etapa: kilómetros, subida y bajada pendientes,
tiempo de marcha estimado y una **cuenta atrás** hasta la hora de llegada que
marca la guía. Módulo `Queda` en `index.html`.

**Qué etapa enseña, y por qué en ese orden** (`Queda.objetivo()`): dónde estás
(si `Geo.ultima` cae a menos de 2 km de la traza) → la etapa de hoy → la que
tengas abierta → la 1. Hoy, a tres semanas de salir, sale la 1: «20 días 22 h
34 min para la llegada prevista a Portomarín, las 15:00 del martes 18».

Con ubicación cuenta desde tu kilómetro, dibuja el progreso, dice el siguiente
hito y a qué hora llegarías al ritmo estimado. Sin ubicación enseña la etapa
entera y ofrece activarla. Es un diálogo de verdad: `Esc` cierra, el foco vuelve
al botón, y **con la ventana abierta las flechas ya no cambian de etapa por
detrás** (antes de arreglarlo, se navegaba a ciegas bajo el diálogo).

### Los dos kilómetros mal puestos

Esto salió al construir lo anterior, y es lo más importante de la sesión.
`datos.js` tiene dos km equivocados que hacían **mentir a las estimaciones de
marcha de toda la web**, no solo a la ventana nueva:

1. **El punto de destino (`tipo:'fin'`) de cinco etapas lleva el km de la traza
   de la etapa SIGUIENTE**, donde ese pueblo está casi en el km 0: Portomarín
   0, Palas de Rei 0,25, Melide 0,89, Arzúa 0, O Pedrouzo 0. Como
   `Marcha.tramo` devuelve 0 cuando la distancia es negativa, el último trozo
   de la etapa **no se contaba**: 1,8 km en la 3 y 1,5 en la 4.
2. **En la etapa 2, «A Brea» tiene km 13,98 cuando por la guía va en el 22,2.**
   Está mal proyectado sobre la traza. Eso metía un ida y vuelta de nueve
   kilómetros y daba **10 h 01 min** de marcha para una etapa de 27,6 km.

Se vio porque la ficha de la etapa 3 decía **3 h 31 min** y la ventana nueva
**4 h 03 min**, en la misma pantalla. Con dos cifras distintas para lo mismo no
se podía entregar.

**Arreglo:** `hitosLimpios(n)`, que descarta todo punto que retroceda y añade un
punto final en el km donde acaba la traza de verdad. Lo usan `perfilEtapa`,
`Marcha.horarios` y `Queda`, así que la ficha, el horario y la ventana dicen ya
lo mismo. Lo que cambia en pantalla:

| Etapa | Marcha antes | Marcha ahora |
|---|---|---|
| 1 | 5 h 42 | 5 h 43 |
| 2 | **10 h 01** | **7 h 32** |
| 3 | 3 h 31 | 4 h 03 |
| 4 | 3 h 21 | 3 h 44 |
| 5 | 4 h 56 | 5 h 01 |
| 6 | 5 h 22 | 5 h 24 |
| **Total del viaje** | **32 h 53** | **31 h 26** |

**Ojo: los datos siguen mal.** `hitosLimpios` los sanea al vuelo, no los
corrige. Arreglar los km en `datos.js` (proyectando esos puntos sobre su propia
traza con `herramientas/ajustar-puntos.js`) queda **pendiente**; hasta
entonces, quien calcule tiempos con `et.puntos` en crudo se equivocará.

### Un detalle de coherencia

El desnivel de la ventana NO se saca de los hitos aunque el tiempo sí: los
hitos daban +259/−365 para la etapa 1 y la ficha enseña +403/−535. Se cuenta
sobre la traza con umbral de 10 m y se **ancla por proporción** al total de
`TRAZAS`, así que en el km 0 sale exactamente lo de la ficha. Hay que anclar
porque los totales de `trazas.js` se calcularon sobre la traza original de 3470
puntos y aquí solo queda la simplificada a 12 m: reproducirlos tal cual no sale
(la 1 da −530 en vez de −535).

`horaLlegadaSantiago()` pasa a delegar en `horaLlegadaEtapa(6)` para no tener
dos maneras de calcular lo mismo. Sigue dando 13:30 y hay una prueba que lo
fija. La regla para sacar la hora de llegada del timing tiene truco: **no vale
coger la última línea que diga «Llegada a»**, porque en la etapa 2 esa es
«Llegada a Gonzar» a las 9:30, a mitad de camino. Se busca «Llegada a
&lt;destino&gt;» y, si no está (solo la 2), la última hora del timing: 15:30.

**Pruebas.** Bloque nuevo de 55 comprobaciones: horas de llegada de las seis
etapas, hitos saneados (que suben siempre y llegan al final de la traza), los
dos estropicios concretos, elección de etapa en los cuatro casos, cálculo con y
sin ubicación, desnivel idéntico al de la ficha en las seis, **igualdad entre
ficha y ventana**, abrir/cerrar, flechas bloqueadas, `Esc`, y el formato de la
cuenta atrás. **289 comprobaciones, 0 fallos** (eran 220). `npm run validar`: OK.

Comprobado además en Chromium a 414 px y 1280 px, sin errores de JavaScript.
**Sin probar en un móvil de verdad.**

`VERSION` de `sw.js` sube a `camino-v18`. `APP_VERSION` se queda en `map-8`: no
se tocó el mapa. De paso se actualizaron en CLAUDE.md las dos versiones, que
seguían puestas en `camino-v14` y `map-7`.

---

## 2026-07-27 — Pestaña de Equipaje: la checklist de la maleta

**Rama:** `claude/luggage-checklist-tab-4zqh2v`
**PR:** pendiente de abrir.

Pestaña nueva al final de la barra, junto a Retos: **Equipaje** (`vistaEtapa =
8`), con la checklist de la maleta que preparó la tita Lucila (PDF «Checklist
maleta»).

**Los datos.** Constante `EQUIPAJE` en `datos.js`, reincrustada en
`index.html`. Son **43 cosas en cinco grupos**: las **37** de la tita Lucila en
los cuatro primeros y **6 añadidas por el grupo** en el quinto. Qué se cambió
respecto al papel, que quede escrito:

- Su lista trae **tres** apartados: Ropa, Calzado y «Otras cosas». Aquí «Otras
  cosas» se partió en **«Equipo»** y **«Botiquín y aseo»**, porque de una
  tacada eran diecinueve líneas y repasarlas en el móvil se hacía largo.
- Las líneas que juntaban varias cosas con comas se separaron en items sueltos
  para poder marcarlos uno a uno: el botiquín («vaselina, apósitos, compeed,
  antiinflamatorios, gel, tiritas»), «pijama, ropita interior», «crema solar,
  bálsamo labial», «tapones, antifaz» y la línea de la bolsa de calcetines con
  las pinzas de tender.
- **A sus grupos no se les añadió nada.** Sus 28 viñetas dan 37 items y ahí se
  para. Lo que hace falta pero ella no escribió va en un **quinto grupo aparte**
  (`extra:true`, «Además de la guía»): credencial del peregrino, DNI, cargador
  del móvil, batería portátil, gafas de sol y tarjeta bancaria. Se pinta con
  contador de borde discontinuo y un aviso encima de la lista, y en el texto de
  WhatsApp sale como «(añadido por el grupo)». Así nunca se le atribuye a la
  tita Lucila algo que no es suyo. Comprobado en el texto del PDF: «cargador»,
  «batería», «DNI» y «documentación» no aparecen ni una vez; «móvil» sale una
  sola vez, dentro de «Riñonera, para el móvil, gafas de sol, dinero y demás»
  (por eso las gafas llevan esa aclaración en su item).

**El módulo.** `Equipaje` en `index.html`, calcado de `Sellos`: es personal,
vive en localStorage (`lolitas2026-equipaje`, **quinta clave**) y no se
comparte. Barra de progreso, contador por grupo, contador en la propia pestaña
cuando hay algo marcado, copiar como texto, mandar por WhatsApp
(`compartirTexto`, el mismo mecanismo que los Retos) y desmarcar todo con
confirmación. **Los `id` de los items son la clave de guardado**: cambiarlos
borra la maleta de quien ya la haya hecho.

También se añadió un bloque «La maleta» en el índice, entre los teléfonos y el
modo sin cobertura, para que la lista se encuentre sin descubrir la pestaña.

**Añadir una vista fueron seis sitios, no uno**, y queda apuntado en CLAUDE.md:
`pintarNav`, `pintarSubnav`, `pintarPanel`, la URL de `irA`, el `keydown` de
las flechas y el arranque que lee los parámetros. El tope de la flecha derecha
era `vistaEtapa < 7`; sin tocarlo la pestaña existía pero no se llegaba con el
teclado, y ninguna prueba lo cantaba. Ahora sí hay caso.

**De paso, dos cosas menores.** `pintarPanel` llamaba a `cargarMeteoEtapa` con
`vistaEtapa >= 1`, así que al saltar de una etapa con la sección «tiempo»
abierta a Retos intentaba pedir el tiempo de `ETAPAS[6]`, que no existe. No
reventaba de milagro (el contenedor `#meteoEtapa` no está en esa vista y el
`if` cortaba antes), pero con el equipaje habría sido lo mismo con `ETAPAS[7]`.
Acotado a `1..6`. Y en el pie del panel el botón de WhatsApp se puso **antes**
que los discretos: en móvil el botón flotante «Ver mapa» tapa la esquina
inferior derecha.

**Pruebas.** `probar.js` gana un bloque de Equipaje (marcar, desmarcar,
contadores por grupo, el texto de WhatsApp, ids únicos, el enlace del índice),
casos de teclado hasta la vista 8, entrada por `?equipaje=1`, `Equipaje.cargar`
con localStorage bloqueado y el aporreo de vistas ampliado a las nueve. Hay
además un grupo de comprobaciones dedicado a la **procedencia**: que solo haya
un grupo `extra`, que sean cuatro los de la guía, que la credencial esté en el
añadido y no en los suyos, y que el texto compartido lo marque. Si alguien mueve
un item de sitio, salta. **220 comprobaciones, 0 fallos** (eran 187).
`npm run validar`: OK.

Comprobado además en Chromium con Playwright a 414 px y a 1280 px: sin errores
de JavaScript, la pestaña se marca, los contadores suben y la barra avanza. Lo
que **no** se ha probado es un móvil de verdad.

`VERSION` de `sw.js` sube a `camino-v17` (se tocó `index.html`). `APP_VERSION`
se queda en `map-8`: no se tocó el mapa.

Una nota de CLAUDE.md estaba desfasada de antes: decía que `npm test` no cubría
la portada ni los Retos, cuando `probar.js` los recorre en sus apartados 1 y 5.
Corregida.

---

## 2026-07-25 — Navegación flotante y botón de ubicación en el mapa móvil

**Rama:** `fix/mapa-movil-2`
**PR:** pendiente de abrir.

Dos mejoras sobre la vista de mapa a pantalla completa en móvil, sin tocar el
`position:fixed` del mapa (que es lo que arregló la franja en iOS).

- **Barra de etapas flotando sobre el mapa.** Antes, al abrir el mapa en móvil,
  la única salida era «Ver ficha» y no se podía cambiar de etapa sin salir. Ahora
  la `nav` de etapas se superpone arriba del mapa (translúcida, con desenfoque)
  cuando `body.vista-mapa` está activo. Se **oculta/reaparece tocando el mapa**
  (`mapa.on('click')` alterna `.nav-oculta`); elegí toque-para-alternar en vez del
  «deslizar hacia abajo» propuesto porque el gesto de arrastre lo consume el
  propio mapa para desplazarse, y competir con él daba tirones; el toque cubre
  ocultar y volver a mostrar con el mismo gesto, sin ambigüedad. Al **cambiar de
  etapa se sigue en vista mapa** (ya era así: `irA` no llama a `mostrarMapa`).
  Para que la barra no tape los controles, con la barra visible se empujan hacia
  abajo los controles de MapLibre (zoom/brújula, arriba a la derecha) y los
  botones de capa (arriba a la izquierda), usando `--nav-h` (alto real de la nav,
  medido en `mostrarMapa`); al ocultar la barra, vuelven arriba.
- **FAB «mi ubicación»** abajo a la derecha del mapa (`#miUbi`, sube a `5rem` en
  móvil para no chocar con «Ver ficha»). Reutiliza `Geo`: si no hay posición,
  activa la geo y centra en cuanto llega la primera lectura (`_centrarAlLlegar`);
  si ya la hay, centra con zoom 16 (cómodo para caminar); si el permiso está
  denegado, sale el aviso de siempre (`alFallar`). El estado visual
  (inactiva/buscando/siguiendo) se comparte con el botón «Dónde estoy» de la
  cabecera vía `Geo._pintarBotones`.

Subidas `VERSION` (`camino-v15` → `camino-v16`) y `APP_VERSION` (`map-7` →
`map-8`). Validada la sintaxis y `npm test` en verde (187/0). Además, prueba
jsdom aparte simulando viewport móvil vertical: 20 comprobaciones en verde
(cambiar de etapa sin salir del mapa, alternar la barra al tocar, y las tres
ramas del FAB).

**Confirmado en móvil real (25 jul 2026):** funciona correctamente tras
desplegar. La barra flotante no tapa zoom/brújula/capas, el FAB no choca con la
escala ni con «Ver ficha», y al rotar a horizontal todo sigue en su sitio. Es la
primera vez que un arreglo del mapa móvil se da por bueno en el dispositivo, no
solo en jsdom.

---

## 2026-07-24 — Auditoría antes del viaje

**Rama:** `chore/auditoria`
**PR:** [#18](https://github.com/Thorito27/Camino-de-Santiago/pull/18), fusionada.

Repaso completo a un mes de salir. **No se encontró nada roto**: ni en el
inventario de interacciones, ni en la coherencia de datos, ni en el recorrido
automatizado. No se tocó código de la web (solo la herramienta de pruebas), así
que no hubo que subir `VERSION` ni `APP_VERSION`.

- **Interacciones**: las 26 funciones invocadas desde el HTML existen todas.
- **Datos**: km de traza coherentes con el último vértice en las seis etapas;
  `grupoCamina`/`tamanoGrupo` correctos (12/12, 12/12, **12 caminan y 11
  duermen el 20**, 11/11, 11/11, 11/11); los 34 retos con ids únicos, cuatro
  opciones y una sola correcta; teléfonos válidos para `tel:`; ninguna
  coordenada fuera de Galicia.
- **`herramientas/probar.js` ampliado** de 37 vistas a **187 comprobaciones**:
  portada y paso al índice, decisiones, teléfonos, las 37 vistas verificando
  además que la pestaña activa es la correcta, el slider en cinco puntos de
  cada etapa, Retos completos (elegir persona, acertar, fallar, y que el
  segundo intento se ignora), flechas del teclado, `?etapa=N` válidos e
  inválidos, y estados raros (localStorage bloqueado, geolocalización denegada,
  40 cambios de vista seguidos). Todo pasa.
- **Rendimiento medido**: `index.html` son 226 KB pero **73 KB comprimidos**,
  que es lo que viaja. 20 movimientos de slider: **1 ms** (no repinta el panel,
  solo sustituye el SVG). Cuatro listeners globales, registrados una sola vez.
  Marcadores: 88 creados y 81 destruidos al recorrer las seis etapas, sin fuga.

Queda anotado como **frágil, no roto**: el visor depende de tres servicios
externos en vivo (IGN, Open-Meteo y unpkg para MapLibre). El IGN tiene respaldo
automático a ESRI y Open-Meteo degrada con aviso, pero **si unpkg no responde no
hay mapa**; el aviso existe, pero no hay copia local de la librería.

---

## 2026-07-24 — Repaso de la documentación

**Rama:** `docs/actualizar`
**PR:** [#17](https://github.com/Thorito27/Camino-de-Santiago/pull/17), fusionada.

Auditoría de los tres documentos contra el código, no de memoria. Lo que se
encontró **mal**, que es lo que importa:

- **La cabecera de `sw.js` mentía.** Decía «la propia página y sus librerías:
  cache primero» cuando desde `camino-v6` la página va a **red primero**. Un
  futuro lector podría haber «restaurado» el comportamiento viejo creyendo que
  arreglaba una incoherencia. Corregida, y con la razón escrita.
- **`CLAUDE.md` decía que había tres usos de localStorage.** Son **cuatro**:
  faltaba `lolitas2026-3d`. También faltaba el módulo `Capa`.
- **La estimación del caché de tiles estaba obsoleta**: la cabecera del `sw.js`
  hablaba de «60-80 MB según la zona», cifra heredada de cuando la capa era
  ESRI. Medido de verdad: la descarga completa son ~510 teselas y **8,4 MB**.
- **`npm test` no cubre la portada ni los Retos** y en ningún sitio se decía.
  Recorre 37 vistas (índice + 6 etapas × 6 secciones); las vistas `-1` y `7`
  quedan fuera. Anotado como aviso.
- **La tabla de archivos del README estaba a medias**: faltaban
  `PROJECT_STATE.md`, `CLAUDE.md`, `package.json` y tres de las cuatro
  herramientas.
- **El README no describía media web**: no mencionaba portada, Retos, paradas,
  sellos, geolocalización, decisiones ni teléfonos.

Además se documentó lo que costó averiguar: por qué el service worker es
red-primero, por qué el mapa va a `position:fixed` en móvil, las dos versiones
(`VERSION` y `APP_VERSION`) y cuándo toca cada una, el PNOA con su atribución
obligatoria y su respaldo a ESRI, y los campos de datos (`kmGuia`,
`desviacion_m`, `fueraDeRuta`, `grupoCamina` frente a `tamanoGrupo`).

Se corrigió también la entrada del 24 de julio sobre el segundo intento del
mapa, que daba por buena una causa que luego resultó equivocada.

---

## 2026-07-24 — Fuera la capa topográfica

**Rama:** `fix/quitar-topo`
**PR:** [#15](https://github.com/Thorito27/Camino-de-Santiago/pull/15), fusionada.

Se retira OpenTopoMap, que se había añadido el mismo día: con el PNOA a esta
resolución no aportaba lo bastante como para duplicar la descarga del modo sin
cobertura. Fuera la fuente y la capa del estilo, el botón «Mapa», la clave
`lolitas2026-capa` y toda la lógica de alternar (`aplicarCapa`), las teselas de
`opentopomap.org` en `tilesDeLaRuta()` y ese dominio de `esTile` en `sw.js`.
El bloque `.attr` no citaba OpenTopoMap, así que no hubo que tocarlo.

«Satélite» se queda como **indicador** de lo que se está viendo (ya no hay otra
capa entre la que alternar); el único botón que actúa es el de 3D.

Intactos, como debía ser: el PNOA con su respaldo a ESRI, el botón 3D y toda la
lógica de pitch, y el relieve de AWS Terrain (exageración 1.6) que es lo que
hace funcionar el 3D.

**Descarga recalculada:** de 1008 fragmentos y ~23 MB a **510 y ~8,4 MB** (algo
menos de lo previsto, porque las teselas del PNOA pesan ~14 KB). `MAX_TILES`
vuelve de 2000 a **1200**, que da margen de sobra. El texto que ve el usuario
antes de descargar ya dice «unos 9 MB».

Comprobado que el modo sin cobertura sigue en pie: el `esTile` del service
worker reconoce las teselas del PNOA y del relieve (y ya no las de OpenTopoMap),
sigue el precacheo de `index.html` y el respaldo de navegación sin red.

`sw.js` → `camino-v14`, `APP_VERSION` → `map-7`.

---

## 2026-07-24 — El marcador y los puntos, sobre la traza de verdad

**Rama:** `fix/posicion-traza`
**PR:** [#14](https://github.com/Thorito27/Camino-de-Santiago/pull/14), fusionada.

Dos problemas con la misma causa: había código tratando los hitos de la guía
como si fueran la ruta, teniendo ya las trazas GPX.

- **`Marcha.coordEnKm` interpola ahora sobre `TRAZAS[n].linea`** (km acumulado
  en la posición 3 de cada vértice) en vez de entre los hitos. Solo tenía un
  llamador, `moverSlider()`; la geolocalización ya usaba `Geo.proyectar` sobre
  la traza. Se conserva el método viejo como respaldo si una etapa no tuviera
  traza. Medido en la etapa 1: antes el marcador se apartaba **hasta 415 m**
  de la línea (124 m de media); ahora **0,00 m** en todo el recorrido.
- **`herramientas/ajustar-puntos.js`** (nuevo): lleva cada punto al vértice más
  cercano de su traza y actualiza `lat`, `lon`, `km` y `ele`, dejando `kmGuia`
  intacto y anotando `desviacion_m`. Por defecto solo enseña la tabla; escribe
  con `--aplicar`, y se planta si algún punto se movería más de 500 m.
  Resultado: **86 puntos ajustados**, ninguno pasó de 347 m. Antes había 36 de
  88 a más de 50 m de la traza.
- **Fuera de ruta**: los puntos con desvío señalizado NO se mueven; se marcan
  `fueraDeRuta:true` con su `desvio_m`. Son **Castro de Castromaior** (131 m) y
  **Santa Irene** (41 m). La detección exige dos cosas —que la ficha hable de
  desvío **y** que el punto esté de verdad separado— porque solo con el texto se
  colaba *Portos*, cuya ficha dice que «entre Portos y Lestedo sale el desvío a
  Vilar de Donas»: el desvío arranca cerca, pero Portos está sobre el Camino.
- En el mapa esos puntos llevan **una línea fina discontinua hasta el Camino**
  (se descartó el borde discontinuo: ya significa «ubicación aproximada» y se
  confundirían), y su ficha dice cuántos metros hay que desviarse.

**Ojo para el futuro:** la traza NO está simplificada a 12 m como se creía. En
la etapa 1 la separación entre vértices es de **88 m de mediana y hasta 378 m**.
Aun así el marcador va exactamente sobre la línea, porque interpola entre esos
vértices, que es justo lo que se dibuja.

`sw.js` → `camino-v13`, `APP_VERSION` → `map-6`.

---

## 2026-07-24 — Mapas: PNOA del IGN, capa topográfica y vista 3D

**Rama:** `feat/mapas`
**PR:** [#13](https://github.com/Thorito27/Camino-de-Santiago/pull/13), fusionada.

- **Satélite: ESRI → PNOA del IGN** (WMTS, `GoogleMapsCompatible`, `image/jpeg`,
  URL en forma KVP porque el servicio no publica plantilla REST). **Verificado
  antes de cambiar**: teselas 200 OK de z12 a z19 en Portomarín, ~14 KB y ~0,3 s;
  comparadas visualmente con ESRI a z18, el PNOA se ve claramente más nítido.
  Atribución obligatoria puesta en el bloque `.attr`. Si el IGN empieza a fallar
  (8 errores de esa fuente), la web cambia sola a ESRI de respaldo y lo dice.
- **Segunda capa: OpenTopoMap** (curvas de nivel y senderos, para el bosque).
  Botones «Satélite / Mapa / 3D» arriba a la izquierda del mapa; la elección se
  recuerda (`lolitas2026-capa`). Las dos capas van declaradas en el estilo y se
  alternan con `visibility`, así la traza y los marcadores quedan siempre encima.
- **Vista 3D**: botón que alterna pitch 0 / 60 con transición de 1 s, recordado
  en `lolitas2026-3d`. Exageración del relieve de 1.35 a **1.6**.
- **Sin cobertura**: la descarga guarda **las dos capas**. Números reales
  medidos: 496 teselas únicas → **1008 fragmentos, ~23 MB** (antes 512 y ~9 MB).
  No hizo falta recortar zooms. `MAX_TILES` de 1200 a **2000** para que lo
  precargado y lo navegado no se poden entre sí, y `esTile` en `sw.js` ahora
  reconoce `ign.es` y `opentopomap.org` (sin eso, sus teselas no se cachearían).
  Se muestra la estimación en MB antes de descargar.

`sw.js` → `camino-v12`, `APP_VERSION` → `map-5`.

---

## 2026-07-24 — Cuenta atrás en horas y minutos

**Rama:** `feat/cuenta-horas`
**PR:** [#12](https://github.com/Thorito27/Camino-de-Santiago/pull/12), fusionada.

La cuenta atrás de la cabecera pasa de **días** a **horas y minutos**, y ahora
apunta a un instante concreto: la **llegada a Santiago a las 13:30 del 23 de
agosto**, hora que se saca del propio horario de la tita Lucila (se busca la
entrada «Llegada a Santiago» en el `timing` de la última etapa) en vez de
escribirla a mano. Muestra por ejemplo «714 h 11 min para Santiago», y «¡Hecho!»
pasada la hora. Se refresca cada 30 s.

Para poder tener ese temporizador hubo que arreglar antes el arnés de pruebas:
`herramientas/probar.js` no cerraba la ventana de jsdom, así que cualquier
`setInterval` de la página dejaba el proceso vivo y **colgaba `npm test`** (ya
pasó al añadir la cuenta atrás la primera vez). Ahora hace `dom.window.close()`
al terminar y el test acaba en medio segundo.

Además, la pregunta 28 (Guillermo Watt) deja de estar marcada como sin
verificar: quien mantiene la guía la dio por buena.

`sw.js` → `camino-v11`.

---

## 2026-07-24 — Retos v2: identificación, una sola oportunidad y compartir

**Rama:** `feat/retos` (recreada desde `main`; la anterior ya estaba fusionada)
**PR:** [#11](https://github.com/Thorito27/Camino-de-Santiago/pull/11), fusionada.

Ampliación grande de la pestaña Retos sobre lo que ya había:

- **34 preguntas** (antes 23): 10 del bloque previo y **cuatro por etapa**.
  Nuevas: la leyenda de la escalinata de Portomarín, la trampa del mojón del
  km 100, el punto más alto (Sierra de Ligonde), el cementerio de peregrinos de
  Ligonde, la confluencia con el Camino Primitivo en Melide, el hospital de
  Ribadiso, la subida final a Arzúa, el bar de los botellines, los dos nombres
  de O Pedrouzo, el nombre latinizado en la Compostela y por qué no cuadran los
  kilómetros.
- **Identificación**: antes de jugar hay que elegir quién eres de la lista
  `PERSONAS` (12 nombres), sin contraseña, en `lolitas2026-persona`. Botón
  discreto para cambiar de persona. La portada saluda por el nombre.
- **Almacenamiento rehecho**: `lolitas2026-retos` guarda ahora un registro por
  respuesta (`id`, `opcion`, `acierto`, `ts`) más `v` de formato y `persona`.
  Pensado para que una futura sincronización con servidor fuese un añadido y no
  una reescritura; **no hay nada de sincronización ahora**.
- **Una sola oportunidad** por pregunta, avisada antes de responder. Las
  respondidas no se vuelven a ofrecer: se muestran con lo que marcaste y la
  correcta, más la explicación (acertando o fallando).
- **Puntuación** acumulada del viaje y desglose por etapa, **menciones** (pleno
  de etapa y racha de tres o más aciertos) y **compartir por WhatsApp** con dos
  mensajes listos para pegar (uno por tanda completada y otro general), usando
  el mismo mecanismo que `compartir()`. Nota visible explicando que no hay
  ranking automático.
- Ya no hay reinicio general; solo un «empezar de cero» con confirmación.

`sw.js` → `camino-v10`.

**Nota:** la pregunta 28 (Guillermo Watt) se marcó como sin verificar; quien
mantiene la guía la dio por buena después, así que se retiró la marca.

---

## 2026-07-24 — Cuenta atrás a Santiago + desatasco del despliegue

**Rama:** `feat/cuenta-atras`
**PR:** [#10](https://github.com/Thorito27/Camino-de-Santiago/pull/10), fusionada.

El hueco de la esquina superior derecha (`.cuenta`) contaba los días **para
salir**; ahora es una **cuenta atrás para llegar a Santiago**, tomando la meta
de la fecha de la última etapa (si cambian las fechas, se ajusta sola). Muestra
«N días para Santiago», «¡Hoy! llegáis a Santiago» el día 23 y «¡Hecho!»
después. Antes estaba oculta en móvil; ahora se ve, pegada a la derecha de la
cabecera. Se recalcula al volver a la pestaña (`visibilitychange`).

Detalle que costó: el primer intento usaba `setInterval` para refrescarla, y eso
**colgaba `npm test`** (el temporizador mantiene vivo el proceso de jsdom).
Sustituido por el listener de visibilidad, que además cubre mejor el caso real.
`sw.js` → `camino-v9`.

**Despliegue:** el build de Pages del commit de Retos se quedó atascado (más de
5 min en `building` con duración 0 ms, sin error). Se desatascó pidiendo una
reconstrucción por API (`POST /pages/builds`), que completó en 27 s. Verificado
en vivo que el servidor ya sirve Retos. Si vuelve a pasar, ese es el remedio.

---

## 2026-07-24 — Retos: cuestionario del Camino

**Rama:** `feat/retos`
**PR:** [#9](https://github.com/Thorito27/Camino-de-Santiago/pull/9), fusionada.

Séptima pestaña de la barra, a la derecha de la etapa 6 (`vistaEtapa = 7`,
`panelRetos`). Cuestionario de **23 preguntas** en la constante `RETOS` de
`datos.js`: bloque «Prepara el Camino» (10, `etapa: 0`, siempre abierto) y
bloque «Lo que has visto hoy» (13 repartidas por etapa). Cada tanda de etapa se
desbloquea el día de su etapa a partir de las 16:00 (`retoDesbloqueado`, misma
lectura de fecha que el botón «Hoy»); mientras está bloqueada se muestran las
**pistas y nunca las preguntas**.

Cuatro opciones por pregunta, orden barajado en cada carga, revelación de la
correcta y la explicación tanto al acertar como al fallar, contador por bloque
y progreso en localStorage (`lolitas2026-retos`) con botón de reinicio. Una
pregunta acertada no vuelve a salir. Estilos apoyados en los de sellos.

De paso se arregló `compartir()`, que con la vista 7 habría generado un
`etapa7.html` inexistente, y las flechas del teclado llegan ya a la pestaña de
retos. `sw.js` → `camino-v8`.

**Pendiente / ojo:** la pregunta 21 (monumento a Guillermo Watt) está marcada
en `datos.js` con `sinVerificar:true` y un comentario: viene de la guía y de lo
que se cuenta habitualmente, pero no se ha confirmado en fuente sólida. Revisar.

---

## 2026-07-24 — Contactos (taxis y salud) + cierre del mapa en móvil

**Rama:** `feat/contactos-taxis-salud`
**PR:** [#8](https://github.com/Thorito27/Camino-de-Santiago/pull/8), fusionada.

**Contactos.** `TAXIS` (en `index.html`) pasa de 2 a 12, por localidad; `etapa`
admite lista para los que cubren varias, con filtro `taxiEnEtapa`. Los sacados
de búsquedas web de julio 2026 se marcan «sin verificar por teléfono»; Alberto
lleva la suya («sin confirmar en fuentes públicas»). Notas: sois 12 y un taxi de
7 plazas no basta / confirmar antes del viaje; y O Pedrouzo sin taxi propio (lo
cubren Arzúa y Santiago), tanto en el índice como en Paradas de la etapa 6.
Sección nueva «Salud y emergencias»: 112, 061 y los tres PAC (Melide, Arzúa, O
Pino) sin teléfono inventado, con enlace a Google Maps; notas de qué es un PAC y
de farmacias de guardia. `sw.js` → `camino-v7`.

**Cierre del mapa en móvil (corrige la entrada de abajo).** El apilado con
z-index (v3) NO lo arregló. La causa real: la fila `1fr` del grid se colapsaba
en iOS cuando la barra de geolocalización ocupaba mucho, y el contenedor del
mapa se quedaba sin alto. Solución: en móvil, al ver el mapa, se saca a PANTALLA
COMPLETA (`position:fixed`; `APP_VERSION=map-4`). Además `ResizeObserver` sobre
el contenedor y diagnóstico en pantalla con `?debug`. El service worker pasó a
RED-PRIMERO para la página (`camino-v6`) para acabar con la fricción de recargas.
Todo se desplegó por fin a `main` (PRs #3–#7); antes estaba solo en
`feat/visor-lolitas`. Limpieza: borradas 4 ramas locales; las 3 remotas se
conservan como respaldo.

**Pendiente:** el mapa a pantalla completa está desplegado pero falta
confirmarlo en un iOS real (usar `?debug=1&n=…` para saltar la caché). Los
teléfonos nuevos de taxi siguen sin confirmar llamando.

---

## 2026-07-24 — Fusión a main y segundo intento del mapa en móvil

**Rama:** `fix/mapa-movil` (y antes, reconciliación de ramas).
**PR:** #3 (`feat/portada-preview-meteo → main`) para desplegar todo lo anterior; luego esta corrección.

Se descubrió que todo el trabajo previo estaba fusionado en `feat/visor-lolitas`
pero NO en `main`, que es de donde GitHub Pages despliega: la web publicada
seguía siendo el visor base (aún «El día», `camino-v1`, mapa roto). Se abrió la
PR #3 de `feat/portada-preview-meteo` directamente a `main` y se fusionó, con lo
que por fin se desplegó todo. **Lección: las PR van contra `main`.**

Sobre el mapa en móvil: el arreglo anterior (llamar a `resize()` tras el
reflow) NO bastó en iOS Safari real; el mapa seguía en negro.

> **CORRECCIÓN posterior.** Lo que sigue era la hipótesis de aquel momento y
> resultó EQUIVOCADA. Se creyó que la causa era que `#mapa` arrancaba en
> `display:none` y MapLibre lo creaba con tamaño 0, y se apiló el mapa detrás
> del panel para que siempre tuviera tamaño (`camino-v3`). **No funcionó.** La
> causa real, encontrada dos intentos después, era que la fila `1fr` del grid
> se colapsaba en iOS y el CONTENEDOR se quedaba sin alto: el problema no
> estaba en el lienzo. Se resolvió sacando el mapa a pantalla completa con
> `position:fixed`. Se deja escrito el error para que no se repita el camino.

**Pendiente:** este segundo arreglo del mapa TAMPOCO se ha podido probar en un
iOS real desde el entorno de trabajo; hay que confirmarlo en el móvil tras
desplegar.

---

## 2026-07-24 — Portada, vista previa, avisos meteo y arreglos de móvil

**Rama:** `feat/portada-preview-meteo`
**PR:** [#2](https://github.com/Thorito27/Camino-de-Santiago/pull/2), abierta contra `feat/visor-lolitas`.

Sesión larga (commits `1b7c7c3` y `5cd1c02`) con varias mejoras:

- **Portada de bienvenida** (`vistaEtapa = -1`, `panelPortada`): presentación
  del grupo, guía breve del Camino y trazado dibujado como SVG propio desde
  `TRAZAS`. Es lo primero que se ve al entrar; con `?etapa=N` se salta directo
  a la etapa.
- **Vista previa por etapa para WhatsApp**: `etapaN.html` con etiquetas Open
  Graph propias que redirigen al visor, y `og/etapaN.png` generadas con
  `herramientas/og.js` (`npm run og`).
- **Avisos meteorológicos derivados** en la sección Tiempo (calor por tramo,
  lluvia, frío de mañana, viento) sobre los datos ya descargados de Open-Meteo.
- **Apartado «Decisiones del grupo»** en el índice, con el estado en la
  constante `DECISIONES` de `datos.js` y un botón de WhatsApp por decisión.
- **Sub-pestañas reordenadas**: «El día» pasó a llamarse «Itinerario» y va la
  primera; la sección por defecto al abrir una etapa es `dia`.
- **Números del grupo por etapa**: se distingue quién camina (etapas 1-3 son de
  12) de quién duerme (la noche del 20 en Melide son 11, porque Alejandro vuela
  de vuelta esa tarde); nota aclaratoria en la etapa 3.
- **Arreglos de móvil**: el mapa se quedaba dibujado en una franja al abrirlo
  (`resize` de MapLibre tras el reflow) y los botones de la cabecera se
  cortaban (`flex-wrap`).
- **Documentación**: se dejó apuntada la funcionalidad futura de ubicación
  compartida del grupo (README y CLAUDE.md) y se creó este `PROJECT_STATE.md`.

**Pendiente / a medias:** los arreglos de móvil (mapa a pantalla completa,
botones) no se han podido probar en un iOS real; hay que confirmarlos tras
desplegar. Las cinco «Decisiones del grupo» siguen abiertas, pero dependen del
grupo, no del código.

---

## 2026-07-24 — Visor completo (subida inicial del código)

**Rama:** `feat/visor-lolitas` (commit `3871e63`, madrugada del 24).
**PR:** no reconstruible desde git.

> ⚠️ Git registra TODO el visor en un único commit (`3871e63`). Estas partes
> casi con seguridad se construyeron a lo largo de varias sesiones reales, pero
> no se pueden separar ni fechar por separado desde git, así que van juntas con
> la fecha del commit.

Lo que contiene ese commit:

- **Base del visor**: `index.html` autónomo, mapa MapLibre (satélite ESRI +
  relieve 3D), motor de marcha Naismith–Langmuir, las seis etapas con los datos
  de la guía de la tita Lucila, navegación y panel.
- **Integración de los seis GPX de Wikiloc**: trazas simplificadas; suavizado
  de la altitud (media móvil de 31 puntos, umbral de 10 m) y calibración del
  desnivel contra Gronze; corrección de ~30 coordenadas proyectándolas sobre la
  traza real.
- **Funciones de viaje**: geolocalización sobre la traza, checklist de sellos
  (localStorage), paradas y puntos de escape, modo sin cobertura (service
  worker + descarga de mapas), compartir y teléfonos útiles.
- Además: `datos.js` y `trazas.js` sueltos (copias editables), `sw.js`,
  `herramientas/` (validar y probar), `CLAUDE.md`, los GPX originales en `gpx/`.

---

## 2026-07-22 — Arranque del repositorio

**Rama:** `main` (commit `23d65f3`).
**PR:** sin PR.

«Initial commit»: contenía únicamente `README.md`. Andamiaje inicial del
repositorio, antes de subir el visor.

---
