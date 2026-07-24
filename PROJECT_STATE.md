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

## 2026-07-24 — Fusión a main y segundo intento del mapa en móvil

**Rama:** `fix/mapa-movil` (y antes, reconciliación de ramas).
**PR:** #3 (`feat/portada-preview-meteo → main`) para desplegar todo lo anterior; luego esta corrección.

Se descubrió que todo el trabajo previo estaba fusionado en `feat/visor-lolitas`
pero NO en `main`, que es de donde GitHub Pages despliega: la web publicada
seguía siendo el visor base (aún «El día», `camino-v1`, mapa roto). Se abrió la
PR #3 de `feat/portada-preview-meteo` directamente a `main` y se fusionó, con lo
que por fin se desplegó todo. **Lección: las PR van contra `main`.**

Sobre el mapa en móvil: el arreglo anterior (llamar a `resize()` tras el
reflow) NO bastó en iOS Safari real; el mapa seguía en negro. Causa de fondo:
el contenedor `#mapa` arrancaba en `display:none`, así que MapLibre lo creaba
con tamaño 0 y el lienzo WebGL no se recuperaba. Nuevo enfoque: en móvil el
mapa ya no se oculta con `display:none`, sino que va apilado detrás del panel
opaco en la misma celda del grid, siempre a tamaño completo; al ver el mapa
solo se oculta el panel. `sw.js` sube a `camino-v3`.

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
