# Estado del proyecto — Las Lolitas al Camino

Registro de qué se ha hecho en cada sesión de trabajo. Se actualiza AL FINAL
de cada sesión, nunca al principio, y las entradas nuevas van arriba del todo
(orden descendente).

Antes de empezar una sesión nueva, lee al menos las 2-3 entradas más recientes
para saber en qué punto está el proyecto.

> Sobre las fechas: el historial de git de este repo está muy condensado (todo
> el visor se subió en un único commit). Donde no se puede reconstruir una
> sesión con certeza desde git, se dice explícitamente y se usa la fecha del
> commit correspondiente en vez de inventarla.

---

## 2026-07-24 — Repaso de la documentación

**Rama:** `docs/actualizar`
**PR:** pendiente contra `main`.

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
