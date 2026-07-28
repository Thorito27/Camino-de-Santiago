#!/usr/bin/env node
/* Lleva los puntos de las etapas a la traza GPX real.
   ============================================================
   Cuando se integraron los GPX solo se movieron las coordenadas que estaban a
   más de 350 m de la traza. Las que quedaban más cerca conservaron su
   coordenada de Google Places, que apunta al CENTRO DEL PUEBLO, no al sitio
   por donde el Camino lo cruza. Para un visor de ruta interesa lo segundo.

   Para cada punto busca el vértice más cercano de TRAZAS[etapa].linea y
   sustituye lat, lon, km y ele por los de ese vértice. `kmGuia` NO se toca:
   es el dato de la tita Lucila. Se anota `desviacion_m` con lo que se movió.

   Excepciones: los puntos que están de verdad fuera del Camino (desvíos
   señalizados) NO se mueven; se marcan con `fueraDeRuta:true` y su distancia
   real a la traza, para que el mapa los dibuje distinto.

   Uso:
     node herramientas/ajustar-puntos.js           → solo enseña la tabla
     node herramientas/ajustar-puntos.js --aplicar → escribe datos.js
   ============================================================ */
const fs = require('fs');
const path = require('path');

const raiz = path.join(__dirname, '..');
const APLICAR = process.argv.indexOf('--aplicar') >= 0;

/* Cargar TRAZAS y ETAPAS sin navegador (son `const`: hace falta new Function) */
const limpia = f => fs.readFileSync(path.join(raiz, f), 'utf8').replace(/^'use strict';/m, '');
const {TRAZAS, ETAPAS} = new Function(
  limpia('trazas.js') + limpia('datos.js') + '; return {TRAZAS, ETAPAS};')();

/* Distancia en metros (Haversine) */
function metros(lat1, lon1, lat2, lon2){
  const R = 6371000, r = Math.PI/180;
  const dLat = (lat2-lat1)*r, dLon = (lon2-lon1)*r;
  const a = Math.sin(dLat/2)**2
          + Math.cos(lat1*r)*Math.cos(lat2*r)*Math.sin(dLon/2)**2;
  return 2*R*Math.asin(Math.sqrt(a));
}

/* Vértice más cercano de la traza de esa etapa */
function masCercano(n, lat, lon){
  const linea = TRAZAS[n] && TRAZAS[n].linea;
  if(!linea) return null;
  let mejor = null;
  for(let i=0; i<linea.length; i++){
    const q = linea[i];                    // [lon, lat, ele, km]
    const d = metros(lat, lon, q[1], q[0]);
    if(!mejor || d < mejor.d) mejor = {d:d, lon:q[0], lat:q[1], ele:q[2], km:q[3], i:i};
  }
  return mejor;
}

/* ¿Este punto está de verdad fuera del Camino? Se detecta por lo que dice su
   propia ficha, no por una lista de nombres a mano. */
const SENAL_DESVIO = /desv[ií]o|a \d+\s*[-–]?\s*\d*\s*min|minutos? (?:a pie|andando|en coche)|fuera del camino|apartado del camino/i;

/* Dos condiciones, no una: que la ficha hable de desvío Y que el punto esté
   de verdad separado de la traza. Si no, se cuelan falsos positivos como
   Portos, cuya ficha dice que "entre Portos y Lestedo sale el desvío a Vilar
   de Donas": el desvío arranca cerca, pero Portos está sobre el Camino. */
const MIN_DESVIO_M = 25;

function fueraDeRuta(p, dist){
  if(p.tipo === 'albergue') return true;              // alojamientos, si los hubiera
  const t = (p.ficha || '') + ' ' + (p.nota || '');
  return SENAL_DESVIO.test(t) && dist > MIN_DESVIO_M;
}

/* ---------- Analizar ---------- */
const filas = [];
ETAPAS.forEach(function(et){
  et.puntos.forEach(function(p){
    const c = masCercano(et.num, p.lat, p.lon);
    if(!c) return;
    filas.push({
      etapa: et.num,
      nombre: p.nombre,
      dist: c.d,
      excluir: fueraDeRuta(p, c.d),
      motivo: p.tipo === 'albergue' ? 'alojamiento'
            : (fueraDeRuta(p, c.d) ? 'desvío señalizado en su ficha' : ''),
      nuevo: c
    });
  });
});

/* ---------- Tabla ---------- */
const ANCHO = 46;
console.log('\nPUNTOS DE LAS ETAPAS FRENTE A LA TRAZA GPX\n');
console.log('  et  ' + 'punto'.padEnd(ANCHO) + '  se movería  estado');
console.log('  ' + '-'.repeat(ANCHO + 34));

let movidos = 0, excluidos = 0, sospechosos = [];
filas.forEach(function(f){
  const d = f.dist;
  let estado;
  if(f.excluir){ estado = 'FUERA DE RUTA — ' + f.motivo; excluidos++; }
  else if(d < 1){ estado = 'ya está en la traza'; }
  else { estado = 'se mueve'; movidos++; }
  if(!f.excluir && d > 500) sospechosos.push(f);
  console.log('  ' + String(f.etapa).padEnd(4)
    + f.nombre.slice(0, ANCHO).padEnd(ANCHO)
    + '  ' + (d.toFixed(0) + ' m').padStart(9) + '   ' + estado);
});

console.log('\n  ' + filas.length + ' puntos: ' + movidos + ' se mueven, '
  + excluidos + ' se quedan fuera de ruta.');

const max = filas.filter(f => !f.excluir).reduce((a,b) => a && a.dist > b.dist ? a : b, null);
if(max) console.log('  El que más se mueve: ' + max.nombre + ' (' + max.dist.toFixed(0) + ' m).');

if(sospechosos.length){
  console.log('\n  *** ATENCIÓN: ' + sospechosos.length + ' punto(s) se moverían MÁS DE 500 m.');
  console.log('  Eso suele ser un error de asignación, no una corrección.');
  sospechosos.forEach(f => console.log('    - etapa ' + f.etapa + ' · ' + f.nombre
    + ': ' + f.dist.toFixed(0) + ' m'));
  if(APLICAR){
    console.log('\n  No se aplica nada. Revísalos primero.\n');
    process.exit(1);
  }
}

if(!APLICAR){
  console.log('\n  (simulación: no se ha tocado datos.js. Para aplicar: --aplicar)\n');
  process.exit(0);
}

/* ---------- Aplicar sobre datos.js ----------
   OJO CON LOS NOMBRES REPETIDOS. Seis puntos se llaman igual en dos etapas,
   porque el destino de una es el origen de la siguiente: Portomarín (1 y 2),
   Palas de Rei (2 y 3), Melide (3 y 4), Arzúa (4 y 5), O Pedrouzo (5 y 6) y
   A Brea (2 y 5, dos pueblos distintos con el mismo nombre).

   La versión anterior de esto buscaba el nombre con `src.match` y escribía con
   `src.replace`, y las dos cosas van a la PRIMERA coincidencia del archivo
   entero. Resultado: la fila de la segunda etapa machacaba la de la primera.
   Así fue como el Portomarín de la etapa 1 acabó con el km 0 de la traza de
   la etapa 2, y como «A Brea» de la etapa 2 acabó con las coordenadas de la
   «A Brea» de la etapa 5, a 36 km de su sitio. Eso dejó a la etapa 2 con
   10 h de marcha estimada durante meses.

   Ahora el archivo se recorre HACIA DELANTE y se va consumiendo: cada fila
   solo puede escribir en la primera coincidencia que quede por delante. Como
   `filas` se construye en el mismo orden en que están en el archivo (etapas
   en orden, puntos en orden), cada fila cae en su propia línea. Si una fila
   no se encuentra, no se consume nada y las siguientes siguen buscando desde
   el mismo sitio. */
const src = fs.readFileSync(path.join(raiz, 'datos.js'), 'utf8');
let hecho = '', resto = src;
let cambiados = 0, marcados = 0, perdidos = [];

filas.forEach(function(f){
  const re = new RegExp('(\\{nombre:"' + f.nombre.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    + '",)([^\\n]*?)(\\}[,\\n])');
  const m = resto.match(re);
  if(!m){ perdidos.push('etapa ' + f.etapa + ' · ' + f.nombre); return; }
  let cuerpo = m[2];

  if(f.excluir){
    if(!/fueraDeRuta:/.test(cuerpo)){
      cuerpo += ', fueraDeRuta:true, desvio_m:' + Math.round(f.dist);
      marcados++;
    }
  } else {
    cuerpo = cuerpo
      .replace(/lat:\s*-?[\d.]+/, 'lat:' + f.nuevo.lat.toFixed(6))
      .replace(/lon:\s*-?[\d.]+/, 'lon:' + f.nuevo.lon.toFixed(6))
      .replace(/\bkm:\s*-?[\d.]+/, 'km:' + f.nuevo.km.toFixed(2))
      .replace(/\bele:\s*-?[\d.]+/, 'ele:' + Math.round(f.nuevo.ele));
    /* Si ya llevaba `desviacion_m` se actualiza; si no, se añade. Antes solo
       se añadía cuando faltaba, y al reejecutar quedaba el valor viejo. */
    if(/desviacion_m:\s*-?[\d.]+/.test(cuerpo))
      cuerpo = cuerpo.replace(/desviacion_m:\s*-?[\d.]+/, 'desviacion_m:' + Math.round(f.dist));
    else
      cuerpo += ', desviacion_m:' + Math.round(f.dist);
    cambiados++;
  }
  hecho += resto.slice(0, m.index) + m[1] + cuerpo + m[3];
  resto = resto.slice(m.index + m[0].length);
});

fs.writeFileSync(path.join(raiz, 'datos.js'), hecho + resto);
console.log('\n  datos.js actualizado: ' + cambiados + ' puntos llevados a la traza, '
  + marcados + ' marcados como fuera de ruta.');
if(perdidos.length){
  console.log('  *** ' + perdidos.length + ' punto(s) NO se encontraron en el archivo:');
  perdidos.forEach(p => console.log('    - ' + p));
}
console.log('  Recuerda reincrustar datos.js en index.html (ver README).\n');
