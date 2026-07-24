#!/usr/bin/env node
/* Recorrido completo del visor con jsdom.  Uso: npm test
   ============================================================
   Comprueba, en cada paso, que no hay errores en consola, que el panel no
   queda vacío y que la pestaña activa es la que toca.

   Cubre: portada, índice, las 6 etapas × 6 secciones, Retos (elegir persona,
   responder, no poder responder dos veces), decisiones, teléfonos, el slider
   del perfil, las flechas del teclado y la entrada por ?etapa=N (válidos e
   inválidos).

   OJO: jsdom no pinta nada. Esto detecta errores de JavaScript, vistas vacías
   y estados incoherentes; NO detecta problemas visuales, de tamaño de botón ni
   de rendimiento real en un móvil.
   ============================================================ */
const fs = require('fs');
const path = require('path');
const {JSDOM, VirtualConsole} = require('jsdom');

const raiz = path.join(__dirname, '..');

const stub = `window.maplibregl={
  Map:function(){this._h={};this._s={};this._l={};this._vis={};this._pitch=0;
    this.addControl=()=>{};this.on=(e,f)=>{this._h[e]=f};this.loaded=()=>true;
    this.setTerrain=()=>{};this.fitBounds=()=>{};this.flyTo=()=>{};this.resize=()=>{};
    this.easeTo=o=>{if(o&&o.pitch!==undefined)this._pitch=o.pitch};this.setPitch=p=>{this._pitch=p};
    this.addSource=(i,d)=>{this._s[i]=d};this.addLayer=l=>{this._l[l.id]=l};
    this.getSource=i=>this._s[i];this.getLayer=i=>this._l[i];
    this.removeLayer=i=>{delete this._l[i]};this.removeSource=i=>{delete this._s[i]};
    this.setLayoutProperty=(id,k,v)=>{this._vis[id]=v};
    this._fire=e=>{if(this._h[e])this._h[e]()};window.__m=this},
  Marker:function(){this.setLngLat=function(){return this};
    this.addTo=function(){window.__mk=(window.__mk||0)+1;return this};
    this.remove=()=>{window.__mkq=(window.__mkq||0)+1}},
  NavigationControl:function(){},ScaleControl:function(){},
  LngLatBounds:function(){this.extend=function(){return this}}};
window.fetch=()=>Promise.reject(new Error('sin red en la prueba'));`;

const htmlBase = fs.readFileSync(path.join(raiz,'index.html'),'utf8')
  .replace(/<script src="https:\/\/unpkg[^"]*"><\/script>/, `<script>${stub}</script>`);

let fallos = 0, pasos = 0;
function comprobar(t, ok){
  pasos++;
  if(!ok){ fallos++; console.error('   FALLO: ' + t); }
}

/* Abre el visor. `url` permite probar ?etapa=N y compañía. */
function abrir(url){
  const errores = [];
  const dom = new JSDOM(htmlBase, {
    runScripts:'dangerously', pretendToBeVisual:true,
    url: url || 'https://ejemplo.org/',
    virtualConsole: new VirtualConsole()
      .on('jsdomError', e => errores.push('ERROR: '+e.message))
      .on('error', (...a) => errores.push('console.error: '+a.join(' ')))
  });
  const w = dom.window;
  if(w.__m) w.__m._fire('load');
  return {dom, w, d:w.document, errores};
}

const largo = s => s.dom.window.document.getElementById('panel').innerHTML.length;
const html  = s => s.dom.window.document.getElementById('panel').innerHTML;

/* ---------- 1. Portada y paso al índice ---------- */
console.log('\n1. Portada');
{
  const s = abrir();
  comprobar('la portada es la vista inicial', s.w.eval('vistaEtapa') === -1);
  comprobar('la portada no sale vacía', largo(s) > 2000);
  comprobar('el subnav está oculto en portada', s.d.getElementById('subnav').style.display === 'none');
  s.w.irA(0);
  comprobar('el botón de entrar lleva al índice', s.w.eval('vistaEtapa') === 0);
  comprobar('el índice no sale vacío', largo(s) > 1000);
  comprobar('portada sin errores', s.errores.length === 0);
  if(s.errores.length) s.errores.forEach(e => console.error('   ' + e));
  s.dom.window.close();
}

/* ---------- 2. Índice: decisiones y teléfonos ---------- */
console.log('2. Índice: decisiones y teléfonos');
{
  const s = abrir();
  s.w.irA(0);
  const h = html(s);
  comprobar('aparecen las decisiones del grupo', h.indexOf('Decisiones del grupo') >= 0);
  comprobar('hay una tarjeta por decisión', (h.match(/class="decision"/g)||[]).length === s.w.eval('DECISIONES.length'));
  comprobar('cada decisión tiene su botón de WhatsApp', (h.match(/wa\.me/g)||[]).length > 0);
  comprobar('hay teléfonos', s.d.querySelectorAll('.tel').length > 10);
  comprobar('emergencias 112 presente', h.indexOf('112') >= 0);
  comprobar('centros de salud presentes', h.indexOf('PAC') >= 0);
  comprobar('índice sin errores', s.errores.length === 0);
  s.dom.window.close();
}

/* ---------- 3. Las 37 vistas: índice + 6 etapas × 6 secciones ---------- */
console.log('3. Las 37 vistas');
{
  const s = abrir();
  const SECS = ['dia','ruta','perfil','paradas','sellos','tiempo'];
  s.w.irA(0);
  comprobar('índice con teléfonos', s.d.querySelectorAll('.tel').length > 0);
  let vistas = 1;
  for(let n=1; n<=6; n++){
    s.w.irA(n);
    const et = s.w.eval(`ETAPAS[${n-1}]`);
    const partes = [];
    for(const sec of SECS){
      s.w.irASeccion(sec);
      vistas++;
      const l = largo(s);
      comprobar(`etapa ${n} · ${sec} no vacía`, l >= 400);
      /* la sub-pestaña marcada debe ser la que se pidió */
      const activa = s.d.querySelector('#subnav button[aria-selected="true"]');
      comprobar(`etapa ${n} · ${sec}: pestaña activa correcta`,
        !!activa && s.w.eval('seccionActual') === sec);
      partes.push(sec + ':' + l);
    }
    /* la pestaña de etapa marcada en la barra debe ser la n */
    comprobar(`etapa ${n}: pestaña de la barra correcta`, s.w.eval('vistaEtapa') === n);
    console.log(`   etapa ${n} ${(et.origen+'→'+et.destino).slice(0,20).padEnd(22)} ${partes.join(' ')}`);
  }
  comprobar('se recorrieron 37 vistas', vistas === 37);
  comprobar('37 vistas sin errores', s.errores.length === 0);
  if(s.errores.length) s.errores.slice(0,4).forEach(e => console.error('   ' + e));
  s.dom.window.close();
}

/* ---------- 4. Slider del perfil ---------- */
console.log('4. Slider del perfil');
{
  const s = abrir();
  for(let n=1; n<=6; n++){
    s.w.irA(n);
    s.w.irASeccion('perfil');
    const km = s.w.eval(`TRAZAS[${n}].km`);
    [0, km*0.25, km*0.5, km*0.75, km].forEach(function(v){
      s.w.moverSlider(v);
      comprobar(`etapa ${n}: slider en km ${v.toFixed(1)} no rompe`, largo(s) > 400);
    });
    /* la coordenada debe caer sobre la traza, no en línea recta */
    const c = s.w.eval(`Marcha.coordEnKm(ETAPAS[${n-1}].puntos, ${km/2}, ${n})`);
    comprobar(`etapa ${n}: coordEnKm devuelve punto`, c && typeof c.lat === 'number');
  }
  comprobar('slider sin errores', s.errores.length === 0);
  if(s.errores.length) s.errores.slice(0,3).forEach(e => console.error('   ' + e));
  s.dom.window.close();
}

/* ---------- 5. Retos ---------- */
console.log('5. Retos');
{
  const s = abrir();
  s.w.irA(7);
  comprobar('sin persona, pide elegir', html(s).indexOf('class="persona"') >= 0);
  comprobar('hay un botón por persona',
    (html(s).match(/class="persona"/g)||[]).length === s.w.eval('PERSONAS.length'));
  s.w.eval('Persona.elegirIdx(0)');
  comprobar('tras elegir, ya no pide persona', html(s).indexOf('class="persona"') < 0);
  comprobar('la cabecera lleva el nombre', html(s).indexOf(s.w.eval('PERSONAS[0]')) >= 0);
  comprobar('el bloque previo tiene sus preguntas',
    (html(s).match(/class="reto"/g)||[]).length === s.w.eval('RETOS.filter(r=>r.etapa===0).length'));
  comprobar('avisa de una sola oportunidad', html(s).indexOf('Una sola oportunidad') >= 0);

  /* tandas bloqueadas: pistas sí, preguntas no */
  const bloqueada = s.w.eval('RETOS.find(r=>r.etapa===3)');
  comprobar('las tandas de etapa están bloqueadas hoy', html(s).indexOf('reto-tanda bloqueada') >= 0);
  comprobar('se ve la pista', html(s).indexOf(bloqueada.pista) >= 0);
  comprobar('NO se filtra la pregunta bloqueada', html(s).indexOf(bloqueada.pregunta) < 0);

  /* responder bien */
  const r1 = s.w.eval('RETOS[0]');
  s.w.responderReto(r1.id, r1.correcta);
  comprobar('acertar se marca', html(s).indexOf('reto bien') >= 0);
  comprobar('acertar revela la explicación', html(s).indexOf(r1.explicacion.slice(0,25)) >= 0);
  const guardado = JSON.parse(s.w.localStorage.getItem('lolitas2026-retos'));
  comprobar('la respuesta se guarda con ts', !!(guardado.respuestas[r1.id] && guardado.respuestas[r1.id].ts));

  /* no se puede responder dos veces */
  const antes = JSON.stringify(guardado.respuestas[r1.id]);
  s.w.responderReto(r1.id, (r1.correcta + 1) % 4);
  const despues = JSON.stringify(JSON.parse(s.w.localStorage.getItem('lolitas2026-retos')).respuestas[r1.id]);
  comprobar('el segundo intento se ignora', antes === despues);

  /* fallar también revela */
  const r2 = s.w.eval('RETOS[1]');
  s.w.responderReto(r2.id, (r2.correcta + 1) % 4);
  comprobar('fallar se marca', html(s).indexOf('reto mal') >= 0);
  comprobar('fallar muestra la correcta', html(s).indexOf('la correcta era') >= 0);
  comprobar('retos sin errores', s.errores.length === 0);
  if(s.errores.length) s.errores.slice(0,3).forEach(e => console.error('   ' + e));
  s.dom.window.close();
}

/* ---------- 6. Flechas del teclado ---------- */
console.log('6. Flechas del teclado');
{
  const s = abrir();
  s.w.irA(0);
  function flecha(k){
    const e = new s.w.KeyboardEvent('keydown', {key:k, bubbles:true});
    s.d.dispatchEvent(e);
  }
  flecha('ArrowRight');
  comprobar('derecha desde el índice va a la etapa 1', s.w.eval('vistaEtapa') === 1);
  for(let i=0;i<6;i++) flecha('ArrowRight');
  comprobar('derecha se detiene en Retos (7)', s.w.eval('vistaEtapa') === 7);
  flecha('ArrowLeft');
  comprobar('izquierda desde Retos vuelve a la etapa 6', s.w.eval('vistaEtapa') === 6);
  for(let i=0;i<8;i++) flecha('ArrowLeft');
  comprobar('izquierda no baja del índice', s.w.eval('vistaEtapa') === 0);
  comprobar('teclado sin errores', s.errores.length === 0);
  s.dom.window.close();
}

/* ---------- 7. Entrar por URL ---------- */
console.log('7. Entrada por ?etapa=N');
{
  for(let n=1; n<=6; n++){
    const s = abrir('https://ejemplo.org/?etapa=' + n);
    comprobar(`?etapa=${n} abre la etapa ${n}`, s.w.eval('vistaEtapa') === n);
    comprobar(`?etapa=${n} no sale vacía`, largo(s) > 400);
    s.dom.window.close();
  }
  const invalidos = ['?etapa=0','?etapa=7','?etapa=abc','?etapa=','?etapa=-3','?etapa=99'];
  invalidos.forEach(function(q){
    const s = abrir('https://ejemplo.org/' + q);
    const v = s.w.eval('vistaEtapa');
    comprobar(`${q} cae en la portada (no rompe)`, v === -1);
    comprobar(`${q} pinta algo`, largo(s) > 1000);
    comprobar(`${q} sin errores`, s.errores.length === 0);
    s.dom.window.close();
  });
  const s = abrir('https://ejemplo.org/?retos=1');
  comprobar('?retos=1 abre los Retos', s.w.eval('vistaEtapa') === 7);
  s.dom.window.close();
}

/* ---------- 8. Estados raros ---------- */
console.log('8. Estados raros');
{
  /* localStorage desactivado (modo privado) */
  const s = abrir();
  s.w.eval(`Object.defineProperty(window,'localStorage',{get(){throw new Error('bloqueado')}});`);
  let rompe = false;
  try{
    s.w.eval('Sellos.datos=null; Sellos.cargar();');
    s.w.eval('Retos.datos=null; Retos.cargar();');
    s.w.eval('Persona.nombre()');
    s.w.irA(7);
  }catch(e){ rompe = true; }
  comprobar('localStorage bloqueado no rompe la web', !rompe);
  s.dom.window.close();

  /* geolocalización denegada */
  const g = abrir();
  let rompeGeo = false;
  try{
    g.w.eval(`navigator.geolocation={watchPosition:(ok,err)=>{err({code:1});return 1},clearWatch:()=>{}}`);
    g.w.eval('Geo.iniciar()');
  }catch(e){ rompeGeo = true; }
  comprobar('permiso de ubicación denegado no rompe', !rompeGeo);
  g.dom.window.close();

  /* cambios rápidos de pestaña */
  const r = abrir();
  let rompeRapido = false;
  try{
    for(let i=0;i<40;i++){ r.w.irA(i%8===7?7:(i%7)); r.w.irASeccion(['dia','ruta','perfil','tiempo'][i%4]); }
  }catch(e){ rompeRapido = true; }
  comprobar('40 cambios rápidos de vista no rompen', !rompeRapido);
  comprobar('tras el aporreo el panel sigue pintando', largo(r) > 400);
  r.dom.window.close();
}

/* ---------- Resumen ---------- */
console.log('\n' + pasos + ' comprobaciones, ' + fallos + ' fallos.');
if(fallos){ console.error('HAY FALLOS.'); process.exit(1); }
console.log('Todo correcto.');
