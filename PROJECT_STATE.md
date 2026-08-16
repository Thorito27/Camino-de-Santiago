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

## 2026-08-16 — El matiz: los zapatos **para caminar**

El recado pasa a decir «Pablo se ha olvidado los zapatos para caminar!!». El
matiz lo puso el grupo y cambia lo que se entiende: no son unos zapatos
cualesquiera, son los de andar el Camino.

Un cambio de una línea (`Recado.TEXTO`), pero con dos comprobaciones que sí
tocaba hacer:

- La prueba que fija la frase se actualizó **a la frase entera**, no a un
  trozo. Si alguien la reescribe, salta.
- La frase es más larga y podía descuadrar la ventana en una pantalla pequeña.
  Comprobado en Chromium a **320 px** (iPhone SE, la más estrecha que es
  probable que haya en el grupo): tres líneas, caja de 288×230 y la ventana
  entera dentro de la pantalla.

`npm test`: 461 comprobaciones, 0 fallos. `VERSION` → `camino-v34`.

---

## 2026-08-16 — «Cada vez que se entra» son tres puertas, no una

Pedido: que el recado salte **cada vez que se entra a la web**. Antes de tocar
nada se midió qué hacía ya, abriendo la página en Chromium:

| Situación | Antes |
|---|---|
| Primera entrada, recarga, `?etapa=N`, pestaña nueva, botón atrás | sale |
| Moverse por las pestañas de la web (sin recargar) | no sale (correcto) |
| **Volver desde otra app con la pestaña ya abierta** | **no salía** |

Ese último es el caso normal del móvil: la pestaña se queda abierta días y
nadie recarga; se entra volviendo de WhatsApp o desbloqueando la pantalla. Así
que ahora `Recado.vigilar()` deja puestas dos puertas más:

- **`pageshow` con `persisted`** — volver con el botón atrás. El navegador
  restaura la página tal cual y **no reejecuta el arranque**, así que sin esto
  no saldría.
- **`visibilitychange`** — volver a primer plano.

Moverse por las pestañas de la propia web sigue sin sacarlo: no se ha vuelto a
entrar, se sigue dentro.

**`MINUTOS_DESCANSO`**, en 0. Con 0 sale cada vez, que es lo que se pidió. Si
durante el Camino se hace pesado ir y venir de WhatsApp, se sube a 10 o 30 y no
hay que tocar nada más. La primera aparición nunca la frena.

`abrir()` además ya no repinta si la ventana está abierta: si no, cada vuelta a
primer plano le robaba el foco al botón.

### Comprobado

En Chromium, las ocho situaciones: primera entrada, tras «Vale», navegando,
recarga, `?etapa=2`, botón atrás, volver de otra app y pestaña nueva. La
primera vez la prueba estaba mal escrita —no cerraba la ventana entre pasos, y
el paso 7 daba «sale» porque venía abierta del 6—; repetida cerrando entre
pasos, sale bien de verdad.

`npm test`: **461 comprobaciones, 0 fallos** (eran 455; 6 nuevas, incluida que
con `TEXTO` vacío tampoco salga al volver de otra app, que si no el «quitarlo»
sería mentira). `VERSION` → `camino-v33`.

Nota para la próxima auditoría: los listeners globales ya no son cuatro, son
seis (se suman el `pageshow` y el `visibilitychange` de `Recado`).

---

## 2026-08-16 — El recado no se veía: un `id` repetido

Aviso desde el móvil: «no me salta el mensaje emergente». Y no era la caché ni
el despliegue —Pages había publicado bien el merge de la PR #40—, era un fallo
de verdad, y de los que no dan la cara.

### La causa

La ventana se añadió con `id="aviso"`. **Ese id ya existía**: es el de los
mensajitos flotantes de `avisar()`, y su CSS dice:

```css
#aviso{ … opacity:0; pointer-events:none; z-index:60 }
#aviso.visible{opacity:1}
```

Como un `#id` pesa más que una clase, esa regla ganaba a `.modal` y la ventana
salía **abierta y completamente transparente**. El DOM decía `hidden:false`,
`Aviso.abierto() === true`, y en la pantalla no había nada. De propina, el
primer `avisar()` la habría machacado con un `textContent`.

### Por qué las pruebas dijeron que todo bien

Porque **jsdom no calcula estilos**. Las nueve comprobaciones del recado
pasaban: el elemento existía, no estaba `hidden`, tenía el texto correcto. Todas
ciertas, y aun así en el móvil no se veía nada.

Se encontró abriendo la página **en un Chromium de verdad** (Playwright, que ya
está instalado en el entorno) contra un `python3 -m http.server`: el DOM decía
que la ventana estaba abierta y la captura de pantalla no la enseñaba. Ahí se
vio `opacity: 0` y `z-index: 60` donde tenía que haber `1` y `2000`, y la caja
midiendo 160 px en vez de 358.

**Lección:** cuando algo «no se ve» pero las pruebas pasan, sospechar del CSS
antes que del JavaScript; y para lo visual, un navegador de verdad, aunque sea
una vez.

### Arreglado

- La ventana pasa a llamarse **`Recado`** y su elemento a `#recado`
  (`recadoCuerpo`, `recadoX`, `.recado-ico/-t/-ok`). `avisar()` se queda con
  `#aviso`, que era suyo desde el principio.
- Comprobado en Chromium a 390×844: la caja mide 358 px, sale centrada sobre el
  velo oscuro, con el emoji, el texto y el botón «Vale».
- Apartado nuevo **6 ter, «Ids sin chocar»**: que ninguna vista tenga dos
  elementos con el mismo id, y que los ids que el código asigna a mano
  (`el.id = '…'`) no choquen con los del HTML. Verificado que caza la
  regresión: volviendo a poner `id="aviso"` saltan **3** comprobaciones.

`npm test`: **455 comprobaciones, 0 fallos** (eran 447). `VERSION` →
`camino-v32`.

---

## 2026-08-15 — El aviso del grupo: Pablo y los zapatos

**Rama:** `claude/mapas-no-guardan-7dwumy`.

Pedido tal cual: una ventana emergente **cada vez que alguien abre la web** con
«Pablo se ha olvidado los zapatos!! 🤦🏼‍♂️». Hecho así, literal: no se recuerda
que ya la viste, sale en cada carga. Sale también entrando por `?etapa=N`,
`?retos=1` o `?equipaje=1`, no solo en la portada.

Módulo **`Aviso`**, con la misma mecánica que las otras dos ventanas
(`Queda` y `Persona`): `Esc` cierra, el fondo cierra, el foco vuelve donde
estaba y **las flechas no navegan por detrás**. Ese último detalle rompió cinco
comprobaciones del apartado 6 en cuanto se añadió —las flechas dejaron de
responder porque había un diálogo abierto—, que es exactamente lo que tenía que
pasar; la prueba ahora cierra el aviso antes de probar el teclado. El `keydown`
intercepta ya **tres** diálogos.

Para cambiarlo o quitarlo solo se toca el módulo: `TEXTO` es el recado e
`ICONO` el emoji, y **con `TEXTO` vacío no sale nada** — no hay que borrar el
HTML ni la llamada del arranque. Hay prueba de las dos cosas. El texto pasa por
`esc()`, así que puede llevar comillas sin romper la página.

Apartado nuevo **6 bis** en `probar.js`: que sale solo, que dice lo de Pablo,
que lo pintado es lo que hay en `Aviso.TEXTO`, que con el aviso abierto las
flechas no cambian de vista, que `Esc` lo cierra y después sí navegan, que sale
también con `?etapa=3` y que con `TEXTO` vacío no aparece.

De paso, la prueba del service worker leía `'camino-v30-app'` a mano y se
habría roto en esta misma subida de versión. Ahora lee la `VERSION` del propio
`sw.js`.

`npm test`: **447 comprobaciones, 0 fallos** (eran 435). `VERSION` →
`camino-v31`; `APP_VERSION` se queda en `map-10`, que el mapa no se ha tocado.

---

## 2026-08-13 — Los mapas guardados se borraban en cada despliegue

**Rama:** `claude/mapas-no-guardan-7dwumy`.

Aviso desde el móvil: «no consigo que se me queden guardados los mapas, cada
vez que entro tengo que volver a descargarlos». No era impresión suya ni un
problema de espacio del teléfono: era un fallo nuestro, y llevaba ahí desde el
principio.

### La causa

En `sw.js` los tres cachés se nombraban con la `VERSION` dentro:

```js
const CACHE_TILES = VERSION + '-tiles';   // ← el fallo
```

y `activate` borraba **todo caché cuyo nombre no empezara por la VERSION
nueva**. Eso es lo correcto para la página (se quiere tirar la copia vieja),
pero para los mapas es justo lo contrario de lo que hace falta. Y como la
regla del proyecto es subir la `VERSION` **en cada cambio de `index.html`**,
íbamos por `camino-v29`: **veintinueve borrados** de los 8,4 MB de teselas.
El bucle era exacto: guardas los mapas → se despliega cualquier cosa → al
volver a entrar, cero fragmentos.

Las teselas son fotos del terreno. No caducan cuando cambia el texto de una
pestaña.

### Lo que se ha hecho

1. **Nombres fijos para lo que no caduca**: `camino-tiles-v1` y
   `camino-meteo-v1`, sin `VERSION`. El de la página sigue versionado.
2. **Purgado por lista blanca** (`CACHES_VIVOS`) en vez de «todo lo que no
   empiece por la VERSION nueva».
3. **`migrarTilesViejos()`**: al activar esta versión, las teselas que aún
   queden en un `camino-vNN-tiles` se copian al caché permanente antes de
   borrarlo. Solo de caché a caché, sin tocar la red. Quien tuviera los mapas
   guardados ahora mismo **no tiene que volver a bajarlos**.

Y un segundo fallo que empujaba a lo mismo, este de la interfaz: el estado
(«N fragmentos ya guardados») se pedía **una sola vez, al registrar el service
worker**, y se escribía en el DOM. Como el panel del índice se repinta entero
en cada navegación, al volver al índice se leía otra vez «Sin descargar
todavía» aunque los mapas estuvieran ahí. Es decir: aunque el caché hubiese
sobrevivido, la web te decía que no. Ahora la cuenta se guarda en
`tilesGuardados`, se vuelve a pedir cada vez que se pinta el índice
(`pedirEstadoTiles`) y también en cuanto el service worker toma el control
(`controllerchange`). El botón sale ya como «Volver a guardar» cuando hay algo
guardado.

El diagnóstico `?debug` enseña además la línea `tiles N guardados`, que es la
manera de comprobar esto **desde el propio móvil**, sin ordenador: era la duda
abierta de la auditoría.

### Comprobado

`npm test`: **435 comprobaciones, 0 fallos** (eran 426; 9 nuevas). `npm run
validar` y `node --check` OK.

El apartado 9 nuevo no lee el código: **ejecuta `sw.js` de verdad** en un `vm`
con un caché de mentira, parte de un móvil que ya tenía tres teselas guardadas
con el esquema viejo, dispara `install` y `activate` **dos veces seguidas**
(dos despliegues) y comprueba que las tres siguen ahí. Se verificó que la
prueba caza la regresión: devolviendo `CACHE_TILES` a `VERSION + '-tiles'`
saltan 5 fallos.

`VERSION` → `camino-v30`; `APP_VERSION` → `map-10`.

**Lo que sigue sin comprobarse aquí** es lo de siempre: esto no se ha probado
en un móvil real en modo avión. La prueba demuestra que las teselas sobreviven
al cambio de versión, no que el PNOA se pinte sin cobertura. Al entrar la
próxima vez, mirad si la línea dice ya «N fragmentos ya guardados» sin haber
tocado el botón; eso es la señal de que el arreglo funciona.

---

## 2026-08-11 — La previsión, hasta donde llegue. Y la fecha estaba mal

### Primero, el fallo gordo: la fecha

Todas las entradas de hoy se escribieron fechadas **6 de agosto**, y hoy es
**11**. El error venía del contexto de la sesión, y no se detectó hasta mirar
por otra cosa el registro del proxy, que traía la fecha real. Corregidas las
**nueve** entradas del diario, la línea de `CLAUDE.md` y una de `datos.js`.

No es cosmético. Dos consecuencias:

- Se le dijo al grupo que para el **menú de A Lareira** quedaban seis días.
  Quedaba **uno**: la fecha límite es mañana, 12 de agosto.
- La previsión llevaba ya tres días saliendo en las etapas 1-3 sin que
  nadie lo supiera, porque se creía que faltaban doce días y faltaban siete.

**Lección:** cuando una cuenta de días importe, mirar el reloj del sistema
(`date`), no la fecha que venga en el contexto.

### La previsión, hasta donde llegue

Había **un solo límite**, `LIMITE_DIAS: 9`, y todo lo que caía más allá se
escondía con un «mostrar un dato ahora sería inventarlo». Esa frase mezclaba
dos cosas distintas:

- **Inventar** un dato es fabricarlo. Eso no se hace.
- **Enseñar lo que responde Open-Meteo a doce días** no es inventarlo. Lo que
  sería deshonesto es enseñarlo *como si fuera firme*.

Así que ahora hay **dos límites**:

| | Qué es | Valor |
|---|---|---|
| `LIMITE_DIAS` | hasta dónde sirve datos la API gratuita | 16 |
| `DIAS_FIABLES` | hasta dónde merecen confianza | 9 |

Entre uno y otro, la previsión **se enseña marcada**: etiqueta «orientativa»
en la fila del índice y un aviso en la etapa diciendo cuántos días faltan y que
sirve para hacerse una idea, no para decidir qué meter en la mochila. Más allá
de 16 se sigue diciendo que no hay.

Con esto, hoy (a 7 días de salir) **las seis etapas tienen previsión**: las
tres primeras como fiables, las tres últimas marcadas.

También se afinó el mensaje de fila sin dato. Antes decía «No se ha podido
consultar», que afirmaba una causa; ahora dice «sin red, o Open-Meteo no llega
aún a ese día», porque desde el cliente no se distingue.

### Comprobado

`npm test`: **426 comprobaciones, 0 fallos** (eran 413; 13 nuevas). `npm run
validar` y `node --check` OK.

Las pruebas nuevas **no llaman a Open-Meteo** —corren sin red— y construyen las
fechas a partir de hoy, para que no caduquen. Comprueban los dos umbrales por
ambos lados y que lo fiable sea siempre un subconjunto de lo disponible.
Probado **en negativo**: devolviendo el límite único de 9, saltan tres fallos.

`VERSION` a `camino-v29`. `APP_VERSION` sigue en `map-9`.

**Lo que NO se ha podido comprobar, y es importante:** el proxy de este entorno
**bloquea `api.open-meteo.com`** (403 en el CONNECT), así que no se ha llamado
a la API ni una vez. Que devuelva 16 días es lo que documenta Open-Meteo, no
algo verificado aquí. Si a doce días respondiera con error en vez de con datos,
la fila saldría con el mensaje de «no se ha podido consultar» —degrada bien,
pero no es lo que se busca—. **Hay que mirarlo en el móvil.**

---

## 2026-08-11 — Un despliegue atascado en la cola, y qué significa «cancelado»

Aviso de que «parece que ha fallado el deploy». **No había fallado ninguno**,
pero sí había un problema real, y distinto del que parecía.

### Lo que se veía

| Commit | PR | Estado |
|---|---|---|
| `c0f28b0` | #36 los coches | **en cola**, sin arrancar |
| `3ff6a4f` | #35 la norma | cancelado |
| `d2c2e56` | #34 ¿Quién eres? | cancelado |
| `d9fcaf6` | #33 tercera opción | correcto |

### «Cancelado» no es «fallado»

Pages **despliega de uno en uno**. Si fusionas algo mientras hay un despliegue
en marcha, cancela el viejo: ya no sirve, porque el nuevo lleva ese contenido y
más. Las PR #34, #35 y #36 se fusionaron en **ocho minutos**, así que las dos
primeras se quedaron por el camino. Es el comportamiento normal, no un error.

**La consecuencia sí importaba:** como los dos cancelados eran los únicos que
llevaban ese contenido y el que quedaba vivo estaba atascado en la cola, la web
publicada seguía sirviendo lo de la **PR #33**. En el móvil no estaban ni el
«¿Quién eres?» de la portada ni las correcciones de los coches, y no por falta
de commit —estaban en `main`, se comprobó leyendo `origin/main` directamente—
sino porque el despliegue que los llevaba no había arrancado.

### Cómo se desatascó

Con este mismo commit. Un commit nuevo en `main` lanza un despliegue nuevo, que
además **sustituye al que estaba en cola** en vez de competir con él. Se eligió
esto antes que cancelar y relanzar, porque cancelar algo que puede arrancar en
cualquier momento arriesga a dejarlo peor.

### La lección, para la próxima

**Fusionar varias PR seguidas en pocos minutos deja despliegues cancelados por
el camino**, y si el último se atasca, lo publicado se queda en un punto
anterior al que dice `main`. Que un cambio esté en `main` **no** es lo mismo a
que esté publicado. Cuando algo no se vea en el móvil, mirar en este orden:

1. ¿Está en `main`? — `git show origin/main:index.html | grep ...`
2. ¿Se ha desplegado ese commit concreto? — Actions, «pages build and
   deployment», y comprobar el `head_sha`.
3. Solo entonces, sospechar de la caché del navegador.

**Sin comprobar desde aquí:** el proxy de este entorno bloquea `github.io` y
también `api.github.com` por `curl`, así que no se ha podido abrir la web
publicada ni dejar un vigilante automático. Todo lo anterior sale de consultar
Actions por el MCP de GitHub.

---

## 2026-08-11 — Los coches: tres opciones, y lo de la abuela dentro de la primera

Repaso sobre captura del móvil, con dos correcciones.

### Fuera el párrafo de «dos cosas que faltan por atar»

Era un aviso que se había añadido por iniciativa propia, señalando dos cabos
sueltos de la tercera opción. Se pidió quitarlo y se quita, de la portada **y
de la tarjeta de `DECISIONES`**, que arrastraba el mismo texto: dejarlo en una
sola de las dos habría sido quitarlo a medias.

### Lo de la abuela no era una cuarta opción

Estaba como **viñeta suelta al final**, con el mismo formato que las tres
alternativas, así que se leía como una cuarta opción entre las que elegir. No
lo es: es una **consecuencia** de las opciones que dejan un coche en el inicio.
Tanto, que tenía que explicar en su propio texto con cuáles era compatible
(«con la primera opción o con la tercera, no con la segunda»), que es la señal
de que estaba en el sitio equivocado.

Ahora:

- va **dentro de «dejar dos coches en el destino»**, que es la que la habilita;
- **«no mover ninguno»** ya nacía de ese caso y no hace falta repetirlo;
- **«llevarlos todos y volver en taxi»** avisa de que con ella **no queda
  ningún coche en el inicio**, que es justo el precio de esa opción.

Quedan **tres viñetas**, tres alternativas de verdad, y cada una dice sola qué
pasa con la abuela. Se ha quitado la frase que enumeraba opciones por número,
que era frágil: cambiar el orden la habría dejado mintiendo.

### Comprobado

`npm test`: **413 comprobaciones, 0 fallos** (eran 412). `npm run validar` y
`node --check` OK.

Hay comprobación de que **no vuelva a aparecer una viñeta `abuela` suelta**.
Probado **en negativo**: devolviéndola y quitando el aviso de «no queda ningún
coche», saltan cuatro fallos. Después se restauró.

`VERSION` a `camino-v28`. `APP_VERSION` sigue en `map-9`.

---

## 2026-08-11 — «¿Quién eres?» en la portada, en una ventana

Hasta ahora la persona **solo se podía elegir metiéndose en Retos**, que es la
pestaña 7. Consecuencia: la portada saludaba por el nombre a quien ya hubiera
jugado, y a nadie más. Quien entrara por primera vez no tenía forma de decir
quién era sin irse a otra pantalla.

Ahora la portada lo pregunta, justo debajo del saludo y antes del texto largo
—más abajo no lo ve nadie—, y se elige en una **ventana emergente** sin salir
de la portada:

| Estado | Qué se ve |
|---|---|
| sin nombre | «¿Quién eres?» + botón **Elegir mi nombre** |
| con nombre | «Estás como **Juanje**» + botón **Cambiar** |

### La ventana

Es el mismo patrón que la de «¿Cuánto queda?», reutilizado en vez de inventar
otro: un `div.modal` que se enseña y se esconde, con el foco devuelto al
cerrar, clic fuera para cerrar y la X arriba.

- **`Esc` cierra** y, con ella abierta, **las flechas NO cambian de etapa**.
  Sin eso se navega por detrás del diálogo y al cerrarlo te has cambiado de
  pestaña sin querer. El `keydown` intercepta ahora **dos** diálogos.
- **Marca cuál eres** con fondo verde y un ✓. La lista es de doce nombres; sin
  marca no hay manera de saber cuál está puesto.
- **Elegir cierra la ventana sola.** Si no, se queda encima tapando justo el
  saludo que acabas de ganar.
- Dice de qué va: es solo para saludarte y para tu puntuación **en este
  móvil**, sin contraseña y sin compartir con nadie.

### Lo que NO se ha tocado

En **Retos** se sigue usando `panelElegirPersona()`, el panel entero. Allí es
la primera pantalla que sale si no hay nombre, y taparla con un diálogo no
aporta nada. Son dos caminos al mismo `Persona.elegir()`.

### Comprobado

`npm test`: **412 comprobaciones, 0 fallos** (eran 395; 17 nuevas). `npm run
validar` y `node --check` OK.

Se prueba el recorrido entero, no solo que el botón exista: abrir, que la
portada siga debajo, elegir, que se guarde en localStorage, que la ventana se
cierre sola, que la portada salude, que al reabrir esté marcado quién eres,
que las flechas no naveguen, que `Esc` cierre, y que al quitar el nombre se
vuelva a preguntar.

Probado **en negativo** con tres roturas a la vez (que elegir no cierre, que
el teclado no esté interceptado y que no se marque quién eres): saltan cinco
fallos. Después se restauró.

`VERSION` a `camino-v27`. `APP_VERSION` sigue en `map-9`.

**Sin comprobar en navegador real:** la ventana no la ha visto nadie en
pantalla, ni en móvil, que es donde se va a usar.

---

## 2026-08-11 — Tercera opción para los coches: no mover ninguno por la mañana

Opción nueva sobre la mesa: **no llevar ningún coche al destino a primera
hora**. Los tres se quedan en el punto de partida y no se toca nada hasta que
haga falta. Cuando la abuela se canse, **dos personas** van con ella al inicio
de la etapa, llevan dos coches al destino y luego vuelven esas dos a por el
tercero.

Con esto, lo de la abuela deja de depender solo de la primera opción: cabe con
la primera **y con la tercera** (las dos dejan algún coche en el inicio), pero
no con la segunda. La frase se corrigió.

### Dos cabos sueltos que se dicen a propósito

No venían en el encargo, pero salen solos al escribir la opción y hacen falta
para poder elegir. Van en un aviso, no escondidos:

1. **Cómo vuelven al inicio la abuela y sus dos acompañantes** desde donde
   dejen la etapa. No está dicho. Se podría suponer que en taxi, pero suponerlo
   sería inventarlo.
2. **Qué pasa si ese día la abuela no necesita parar.** Entonces los tres
   coches se quedan en el origen y al acabar hay que ir a por ellos igual.

### Las pruebas ya no se agarran a frases sueltas

Cada alternativa lleva ahora **`data-opcion`** (`dejar-dos`, `todos-taxi`,
`ninguno`, `abuela`) y las comprobaciones seleccionan por ahí. Antes buscaban
trozos de texto dentro de los `<li>`, y cada retoque de redacción obligaba a
perseguir la prueba.

### Dos fallos míos en las propias pruebas, encontrados al probarlas

Merece la pena anotarlos, porque los dos son de manual:

- Al quitar la opción a propósito para probar en negativo, `op('ninguno')`
  devolvía `null` y el proceso **reventaba** en vez de informar: se perdían
  todas las comprobaciones siguientes. Ahora `op()` devuelve un hueco.
- Y ese arreglo rompió otra: `!!op(id)` pasó a ser **siempre cierto**, así que
  «está la opción X» habría pasado aunque la opción no existiera. Esa
  comprobación pregunta ahora al DOM directamente.

Sin el negativo, las dos habrían quedado ahí pasando en verde y sin servir de
nada.

### Comprobado

`npm test`: **395 comprobaciones, 0 fallos** (eran 390). `npm run validar` y
`node --check` OK.

Probado **en negativo**: quitando la tercera opción y devolviendo la frase
vieja de la abuela, saltan cuatro fallos con nombre propio. Después se
restauró.

`VERSION` a `camino-v26`. `APP_VERSION` sigue en `map-9`.

---

## 2026-08-11 — Los coches: los mueven tres personas, no los doce

Corrección de la entrada de abajo, otra vez el mismo día. La opción de «llevar
los tres coches y volver en taxi» estaba mal entendida.

**Lo que decía la web:** «Los tres coches al destino y la vuelta al inicio de
la etapa en taxi. En un taxi normal caben cuatro personas, así que para los
doce harían falta tres.» Es decir, que se movía el grupo entero.

**Lo que es:** son **tres personas** las que llevan los tres coches, y esas
tres se vuelven en **un solo taxi** —caben cuatro, sobra sitio—. **El resto
espera en el punto de partida.** Nadie más se mueve.

Y lo mismo valía para la primera opción, donde ponía «todos vuelven en el
tercero»: ese «todos» son los tres conductores, no los doce. También corregido.

Así quedan las dos:

| | Quién mueve | Cómo vuelven | Al acabar la etapa |
|---|---|---|---|
| **A** | tres personas | en el tercer coche | hay que ir a por el coche del origen |
| **B** | tres personas | en un solo taxi | nada que mover, los tres ya están |

La diferencia real entre las dos no es cuánta gente se mueve —es la misma—,
sino si queda o no un coche en el punto de partida. Y de eso depende lo de la
abuela, que solo cabe con la A.

De paso, se cae el dato de «tres taxis para los doce», que no pintaba nada
aquí: nunca hizo falta mover al grupo en taxi.

### Comprobado

`npm test`: **390 comprobaciones, 0 fallos** (eran 387). `npm run validar` y
`node --check` OK.

Hay una comprobación nueva que dice explícitamente **que no vuelva a aparecer
lo de los tres taxis**, además de exigir que las dos opciones digan quién va y
que el resto espera. Probado **en negativo**: reponiendo el texto viejo saltan
cuatro fallos. Después se restauró.

`VERSION` a `camino-v25`. `APP_VERSION` sigue en `map-9`.

---

## 2026-08-11 — Los coches no estaban decididos, y la web decía que sí

Corrección de la entrada de abajo, el mismo día. Dos cosas.

### El recuerdo, más corto

«Y en el camino habrá un recuerdo para Daniel, Pepe y Fidel, que esta vez no
vienen» pasa a ser, tal cual: **«Nos acordamos de Daniel, Pepe y Fidel»**. Lo
pidió así el encargo. La versión anterior explicaba de más.

### Los coches: se dieron por decididos y no lo estaban

Esto es el fallo de verdad. El apartado se escribió como **«La idea, cada
día»**, en una **lista numerada** de cuatro pasos: la forma misma decía «esto
ya está resuelto, hazlo en este orden». No lo está. Hay más opciones sobre la
mesa:

1. **Dejar dos coches en el destino** y volver en el tercero al punto de
   partida (lo que se había escrito como si fuera el plan).
2. **Llevarlos todos al destino y volver en taxi** al inicio de la etapa. Con
   cuatro plazas por taxi, para los doce hacen falta tres.
3. Y aparte, **lo de la abuela**: si se cansa a media etapa, que alguien coja
   un taxi con ella hasta el **inicio** y sigan en el coche que se hubiera
   dejado allí. Se dice explícitamente que **esto solo cabe con la primera
   opción**, porque es la única que deja un coche en el punto de partida. Esa
   dependencia no venía en el encargo; se deduce y por eso se dice.

Cambios:

- La lista pasa de `<ol>` a `<ul>`, con viñetas en vez de números. **La forma
  importa**: numerada son pasos de un plan, sin numerar son alternativas.
- Encabeza «**Todavía sin decidir**».
- Se añade a `DECISIONES` (id `coches`, `pendiente`), que es donde vive lo que
  está sin cerrar, con su botón de WhatsApp. El índice pasa a decir «Estas 6
  cosas… Quedan 4 sin cerrar», sin tocar nada: la cuenta ya era automática.

### La lección

Un apartado puede ser correcto palabra por palabra y aun así mentir por cómo
está montado. Aquí el contenido describía bien una opción; lo falso era
presentarla como **la** opción, y buena parte de eso lo decía el `<ol>`. Hay
una prueba que comprueba que **no vuelva a ser una lista numerada**.

### Comprobado

`npm test`: **387 comprobaciones, 0 fallos** (eran 383). `npm run validar` y
`node --check` OK.

Probado **en negativo**: devolviendo el `<ol>` y quitando el «sin decidir»,
saltan **seis** fallos. Después se restauró.

`VERSION` a `camino-v24`. `APP_VERSION` sigue en `map-9`.

**Sin comprobar en navegador real:** las viñetas doradas de la lista nueva no
las ha visto nadie.

---

## 2026-08-11 — Portada: los que no vienen, la autoría y el baile de los coches

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

## 2026-08-11 — Repaso de los apartados de etapa: se repetían y mentían

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

## 2026-08-11 — Dos cosas al equipaje y las respuestas del grupo a las decisiones

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
