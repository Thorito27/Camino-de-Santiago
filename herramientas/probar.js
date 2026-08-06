#!/usr/bin/env node
/* Recorrido completo del visor con jsdom.  Uso: npm test
   ============================================================
   Comprueba, en cada paso, que no hay errores en consola, que el panel no
   queda vacío y que la pestaña activa es la que toca.

   Cubre: portada, índice, las 6 etapas × 6 secciones, Retos (elegir persona,
   responder, no poder responder dos veces), Equipaje (marcar, desmarcar,
   contadores, texto), decisiones, teléfonos, el slider del perfil, las flechas
   del teclado y la entrada por ?etapa=N (válidos e inválidos).

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

  const hp = html(s);
  /* Los tres que no vienen. Están puestos a mano y no salen de ningún dato,
     así que si alguien reescribe la portada es fácil que se los lleve por
     delante sin darse cuenta. */
  ['Daniel','Pepe','Fidel'].forEach(nom =>
    comprobar('la portada recuerda a ' + nom, hp.indexOf(nom) >= 0));

  /* La procedencia de los datos: la guía es de la tita Lucila y hay aportes
     de Juan Martínez. Es una atribución, no adorno. */
  comprobar('la portada dice de quién es la guía', hp.indexOf('tita Lucila') >= 0);
  comprobar('la portada reconoce los aportes de Juan Martínez',
    /aportes de <strong>Juan Mart/.test(hp));

  /* Los coches NO están decididos. Se llegó a escribir en la portada como si
     lo estuvieran («la idea, cada día») y no era cierto: hay varias opciones
     sobre la mesa. Estas comprobaciones evitan que vuelva a darse por hecho. */
  const opciones = s.d.querySelectorAll('.portada ul.coches li');
  comprobar('la portada da las opciones de los coches', opciones.length === 3);
  comprobar('la portada dice que los coches están sin decidir',
    /sin decidir/i.test(hp));
  comprobar('las opciones NO se pintan como pasos numerados',
    s.d.querySelectorAll('.portada ol.coches li').length === 0);
  comprobar('está la opción de dejar dos coches en el destino',
    [...opciones].some(li => /dejan dos/.test(li.textContent)
      && /punto de partida/.test(li.textContent)));
  comprobar('está la opción de volver en taxi',
    [...opciones].some(li => /taxi/.test(li.textContent) && /cuatro personas/.test(li.textContent)));
  comprobar('está lo de la abuela, y que depende de la primera opción',
    [...opciones].some(li => /abuela/.test(li.textContent)
      && /primera opci/.test(li.textContent)));
  /* Y tiene que estar en las decisiones del grupo, no solo contado en la
     portada: es lo que hay que cerrar. */
  comprobar('los coches están en las decisiones del grupo, sin cerrar',
    s.w.eval("DECISIONES.some(d=>d.id==='coches' && d.estado!=='resuelto')"));

  /* La primera opción se apoya en que el destino de cada etapa es la salida
     de la siguiente. Si algún día deja de encadenar, deja de valer. */
  const ETS = s.w.eval('ETAPAS');
  comprobar('el destino de cada etapa es la salida de la siguiente',
    ETS.slice(0,-1).every((e,i) => e.destino === ETS[i+1].origen));

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
  /* Ojo: la clase lleva el estado detrás ("decision encurso"), así que
     buscar class="decision" a secas solo contaba las que no lo tenían. */
  comprobar('hay una tarjeta por decisión',
    (h.match(/class="decision [a-z]+"/g)||[]).length === s.w.eval('DECISIONES.length'));
  comprobar('todos los estados son válidos',
    s.w.eval("DECISIONES.every(d=>['pendiente','encurso','resuelto'].includes(d.estado))"));
  comprobar('cada decisión sale con su etiqueta de estado',
    s.w.eval('DECISIONES').every(d => h.indexOf(
      {pendiente:'Pendiente', encurso:'En curso', resuelto:'Resuelto'}[d.estado]) >= 0));
  /* El botón de WhatsApp solo en lo que sigue abierto: en lo cerrado
     sobra, y peor, invita a remover algo ya decidido. */
  const abiertas = s.w.eval("DECISIONES.filter(d=>d.estado!=='resuelto').length");
  comprobar('solo las decisiones abiertas llevan botón de WhatsApp',
    (h.match(/wa\.me/g)||[]).length === abiertas);
  /* Lo que dijo el grupo se enseña literal, y lo que hemos deducido va
     aparte. Si se mezclaran, la web le atribuiría a alguien algo que no dijo. */
  const escP = t => s.w.eval('esc(' + JSON.stringify(t) + ')');
  s.w.eval('DECISIONES.filter(d=>d.respuesta)').forEach(d => {
    comprobar('la respuesta de «'+d.id+'» sale literal', h.indexOf(escP(d.respuesta.texto)) >= 0);
    if(d.respuesta.aclara)
      comprobar('la aclaración de «'+d.id+'» va separada de la cita',
        h.indexOf('class="aclara"') >= 0 && h.indexOf(escP(d.respuesta.aclara)) >= 0);
  });
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

/* ---------- 3 bis. Paradas: sin repetir y cada cosa en su sitio ----------
   Tres fallos reales que había aquí y que ninguna prueba veía:
   1. La lista `cultura` se pintaba ENTERA en dos pestañas, Itinerario y
      Paradas, palabra por palabra.
   2. Dentro de Paradas, diez entradas repetían una tarjeta que estaba
      justo encima (y la tarjeta siempre dice más: lleva km y horario).
   3. Todo salía bajo «Además, en el destino», y la lista incluye cosas
      del pueblo de SALIDA y desvíos a 7 y 10 km fuera del Camino.
   ------------------------------------------------------------------ */
console.log('3 bis. Paradas: sin repetir y en su sitio');
{
  const s = abrir();
  const DONDES = ['salida','camino','destino','desvio'];
  const norm = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');

  for(let n=1; n<=6; n++){
    const et = s.w.eval(`ETAPAS[${n-1}]`);
    const cultura = et.cultura || [];

    comprobar(`etapa ${n}: cada cosa que ver dice dónde está`,
      cultura.every(c => c && typeof c === 'object' && DONDES.includes(c.donde)));

    /* Nada de la lista puede repetir algo que ya se vea EN ESTA MISMA
       pestaña. Eso son los tres tipos de tarjeta que pinta Paradas:
       escapes (taxi), bares (comida) y qué ver (cultura/iglesia/mirador).
       Los puntos de tipo inicio/fin/paso NO salen aquí, así que de esos
       sí puede hablar la lista (la catedral de Santiago, por ejemplo).
       Se compara por nombre y por frases de cuatro palabras seguidas,
       que es como estaban escritos los duplicados de verdad.
       Excepción declarada a mano con `refiere`: revisado, no es repe. */
    const EN_PARADAS = ['taxi','comida','cultura','iglesia','mirador'];
    const visibles = et.puntos.filter(p => EN_PARADAS.includes(p.tipo));
    const repes = cultura.filter(c => visibles.some(function(p){
      if(norm(c.refiere || '') === norm(p.nombre)) return false;
      const enTarjeta = norm(p.nombre + ' ' + (p.ficha || ''));
      if(enTarjeta.includes(norm(p.nombre)) && norm(c.texto).includes(norm(p.nombre))) return true;
      const pal = norm(c.texto).split(' ');
      for(let i = 0; i + 4 <= pal.length; i++)
        if(enTarjeta.includes(pal.slice(i, i+4).join(' '))) return true;
      return false;
    }));
    comprobar(`etapa ${n}: la lista no repite ninguna tarjeta`, repes.length === 0);
    if(repes.length) repes.forEach(r => console.error('      repetido: ' + r.texto.slice(0,60)));

    /* La lista vive SOLO en Paradas. Si vuelve a aparecer en Itinerario,
       esto salta: se compara el texto de cada entrada contra las dos vistas. */
    s.w.irA(n);
    s.w.irASeccion('dia');
    const hDia = html(s);
    s.w.irASeccion('paradas');
    const hPar = html(s);
    const trozo = c => s.w.eval('esc(' + JSON.stringify(c.texto.slice(0,40)) + ')');
    comprobar(`etapa ${n}: lo que ver sale en Paradas`,
      cultura.every(c => hPar.indexOf(trozo(c)) >= 0));
    comprobar(`etapa ${n}: y NO se repite en Itinerario`,
      cultura.every(c => hDia.indexOf(trozo(c)) < 0));

    /* Los rótulos tienen que decir la verdad: si no hay nada de salida,
       no puede salir «Al salir de…», y lo de fuera del Camino tiene que
       estar dicho como tal. */
    const hay = d => cultura.some(c => c.donde === d);
    comprobar(`etapa ${n}: el rótulo de salida solo si hay algo a la salida`,
      hay('salida') === (hPar.indexOf('Al salir de') >= 0));
    comprobar(`etapa ${n}: los desvíos se avisan como fuera del Camino`,
      hay('desvio') === (hPar.indexOf('Fuera del Camino') >= 0));
    comprobar(`etapa ${n}: ya no se dice «Además, en el destino»`,
      hPar.indexOf('Además, en el destino') < 0);
  }
  /* La etapa 2 es la única con desvíos (Vilar de Donas y Pambre). Si esto
     falla, o se han perdido o se han colado en otra etapa. */
  comprobar('solo la etapa 2 tiene desvíos fuera del Camino',
    s.w.eval("ETAPAS.filter(e=>(e.cultura||[]).some(c=>c.donde==='desvio')).map(e=>e.num).join()") === '2');

  /* La nota de Ruta remitía a «El día», pestaña que se llama «Itinerario». */
  s.w.irA(1); s.w.irASeccion('ruta');
  comprobar('la nota de Ruta nombra la pestaña por su nombre actual',
    html(s).indexOf('«Itinerario»') >= 0 && html(s).indexOf('«El día»') < 0);

  /* Coherencia entre las decisiones y los datos de la etapa. Al cerrar una
     decisión es fácil olvidar la ficha de la etapa, y entonces el índice
     dice «resuelto» mientras la etapa sigue diciendo «SIN RESOLVER». Pasó
     con Villa Xardín y con la cena de O Ceadoiro. */
  const dec = id => s.w.eval(`DECISIONES.find(d=>d.id===${JSON.stringify(id)}).estado`);
  const et5 = s.w.eval('ETAPAS[4]'), et6 = s.w.eval('ETAPAS[5]');

  if(dec('villa-xardin') === 'resuelto'){
    comprobar('Villa Xardín resuelta: la etapa ya no dice que falte una cama',
      et5.alojamiento.nota.indexOf('SIN RESOLVER') < 0);
    comprobar('Villa Xardín resuelta: las camas cubren al grupo',
      (et5.alojamiento.plazas||0) + (et5.alojamiento.supletorias||0)
        >= s.w.eval(`tamanoGrupo('${et5.fecha}')`));
  }
  if(dec('ceadoiro') === 'resuelto'){
    comprobar('cena del 22 resuelta: la etapa ya no la da por sin confirmar',
      et5.comidas.nota.indexOf('SIN CONFIRMAR') < 0);
    comprobar('cena del 22 resuelta: ya no consta reserva en O Ceadoiro',
      et5.comidas.cena.every(c => c.indexOf('O Ceadoiro') < 0));
  }
  if(dec('santiago-misa-cena') !== 'pendiente'){
    comprobar('la etapa 6 recoge que la cena se retrasa por la misa',
      /misa/i.test(et6.comidas.nota) && /retras/i.test(et6.comidas.nota));
  }

  comprobar('Paradas sin errores', s.errores.length === 0);
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

/* ---------- 5 bis. Equipaje ---------- */
console.log('5 bis. Equipaje');
{
  const s = abrir();
  s.w.irA(8);
  const total = s.w.eval('totalEquipaje()');
  comprobar('la vista del equipaje no sale vacía', largo(s) > 1000);
  comprobar('el subnav está oculto en el equipaje',
    s.d.getElementById('subnav').style.display === 'none');
  comprobar('hay un botón por cosa de la lista',
    (html(s).match(/onclick="Equipaje\.alternar/g)||[]).length === total);
  comprobar('los grupos de la guía tienen su encabezado',
    s.w.eval('EQUIPAJE').every(g => html(s).indexOf(g.titulo) >= 0));
  comprobar('al empezar no hay nada marcado', s.w.eval('Equipaje.cuenta().hechos') === 0);
  comprobar('dice de quién es la lista', html(s).indexOf('tita Lucila') >= 0);

  /* Lo que NO es de la guía tiene que ir aparte y estar dicho. El día que
     alguien mueva un item de estos a un grupo de la guía, esto salta. */
  const extras = s.w.eval('EQUIPAJE.filter(g=>g.extra)');
  comprobar('hay un grupo marcado como ajeno a la guía', extras.length === 1);
  comprobar('el grupo añadido avisa de que no es de la guía',
    html(s).indexOf('no viene en la guía') >= 0);
  comprobar('la credencial está, y en el grupo añadido',
    s.w.eval("EQUIPAJE.find(g=>g.items.some(i=>/Credencial/.test(i.texto))).extra") === true);
  ['Cargador del móvil','Batería portátil','DNI o pasaporte',
   'Crema de masaje para los pies','Botella de agua'].forEach(function(t){
    comprobar('está «' + t + '»',
      s.w.eval(`EQUIPAJE.some(g=>g.extra && g.items.some(i=>i.texto===${JSON.stringify(t)}))`));
  });
  comprobar('ningún grupo de la guía se cuela como añadido',
    s.w.eval('EQUIPAJE.filter(g=>!g.extra).length') === 4);

  /* Nada repetido. Al añadir cosas a mano es fácil meter algo que ya
     estaba en la lista de la guía (pasó con la crema solar, que ya era
     `bot-solar`): quedarían dos casillas para lo mismo y la cuenta de la
     maleta no cuadraría nunca. Se compara en minúsculas y sin tildes,
     que es como se cuelan los duplicados de verdad. */
  const llave = t => t.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .replace(/[^a-z0-9]+/g,' ').trim();
  const textos = s.w.eval('EQUIPAJE.flatMap(g=>g.items.map(i=>i.texto))').map(llave);
  const ids = s.w.eval('EQUIPAJE.flatMap(g=>g.items.map(i=>i.id))');
  comprobar('no hay dos cosas con el mismo nombre',
    new Set(textos).size === textos.length);
  comprobar('no hay dos cosas con el mismo id', new Set(ids).size === ids.length);
  comprobar('el texto compartido marca lo añadido',
    s.w.eval('Equipaje.comoTexto()').indexOf('añadido por el grupo') >= 0);

  /* marcar y desmarcar */
  const prim = s.w.eval('EQUIPAJE[0].items[0].id');
  s.w.eval(`Equipaje.alternar('${prim}')`);
  comprobar('marcar una cosa se guarda', s.w.eval('Equipaje.cuenta().hechos') === 1);
  comprobar('marcar la pinta como hecha', (html(s).match(/sello-item hecho/g)||[]).length === 1);
  comprobar('la marca llega a localStorage',
    !!JSON.parse(s.w.localStorage.getItem('lolitas2026-equipaje'))[prim]);
  comprobar('el contador de la pestaña aparece',
    s.d.getElementById('nav').innerHTML.indexOf('nav-sellos') >= 0);
  comprobar('el contador del grupo cuenta bien', s.w.eval('Equipaje.cuenta(EQUIPAJE[0]).hechos') === 1);
  comprobar('el otro grupo sigue a cero', s.w.eval('Equipaje.cuenta(EQUIPAJE[1]).hechos') === 0);
  s.w.eval(`Equipaje.alternar('${prim}')`);
  comprobar('volver a pulsar desmarca', s.w.eval('Equipaje.cuenta().hechos') === 0);

  /* marcarlo todo */
  s.w.eval('EQUIPAJE.forEach(g=>g.items.forEach(it=>{if(!Equipaje.marcado(it.id))Equipaje.alternar(it.id)}))');
  comprobar('se pueden marcar todas', s.w.eval('Equipaje.cuenta().hechos') === total);
  comprobar('con todo marcado, la maleta sale lista', html(s).indexOf('Maleta lista') >= 0);

  /* el texto para WhatsApp */
  const txt = s.w.eval('Equipaje.comoTexto()');
  comprobar('el texto trae todas las cosas', (txt.match(/\[x\]/g)||[]).length === total);
  comprobar('el texto dice de quién es la lista', txt.indexOf('tita Lucila') >= 0);

  /* el índice enseña cómo va */
  s.w.irA(0);
  comprobar('el índice enlaza con el equipaje', html(s).indexOf('irA(8)') >= 0);

  comprobar('ids del equipaje únicos',
    s.w.eval('new Set(EQUIPAJE.flatMap(g=>g.items.map(i=>i.id))).size') === total);
  comprobar('equipaje sin errores', s.errores.length === 0);
  if(s.errores.length) s.errores.slice(0,3).forEach(e => console.error('   ' + e));
  s.dom.window.close();
}

/* ---------- 5 ter. ¿Cuánto queda? ---------- */
console.log('5 ter. ¿Cuánto queda?');
{
  const s = abrir();
  const cuerpo = () => s.d.getElementById('quedaCuerpo').innerHTML;

  comprobar('el botón está en la cabecera', !!s.d.getElementById('btnQueda'));
  comprobar('la ventana empieza cerrada', s.d.getElementById('queda').hidden === true);
  comprobar('cerrada, no hay temporizador vivo', s.w.eval('Queda._tim') === null);

  /* --- Hora de llegada de cada etapa, sacada del timing --- */
  const esperadas = {1:'15:00', 2:'15:30', 3:'14:30', 4:'14:00', 5:'14:45', 6:'13:30'};
  for(let n=1;n<=6;n++){
    comprobar(`etapa ${n}: llegada prevista ${esperadas[n]}`,
      s.w.eval(`horaLlegadaEtapa(${n})`) === esperadas[n]);
  }
  /* La cuenta atrás de la cabecera no puede cambiar al refactorizarla */
  comprobar('la llegada a Santiago sigue siendo 13:30',
    s.w.eval('horaLlegadaSantiago()') === '13:30');
  comprobar('la etapa 2 NO coge «Llegada a Gonzar» (9:30)',
    s.w.eval('horaLlegadaEtapa(2)') !== '9:30');

  /* --- Los DATOS, no el saneado: los km de datos.js tienen que estar bien ---
     Seis puntos se llaman igual en dos etapas (el destino de una es el origen
     de la siguiente) y `ajustar-puntos.js` escribía en la primera coincidencia
     del archivo, así que la fila de la segunda etapa machacaba la de la
     primera. Si alguien vuelve a romper eso, esto salta. */
  for(let n=1;n<=6;n++){
    const pts = s.w.eval(`ETAPAS[${n-1}].puntos`);
    let atras = [];
    for(let i=1;i<pts.length;i++) if(pts[i].km < pts[i-1].km) atras.push(pts[i].nombre);
    comprobar(`etapa ${n}: ningún punto de datos.js retrocede en km`, atras.length === 0);
    const ult = pts[pts.length-1];
    const kmTraza = s.w.eval(`TRAZAS[${n}].km`);
    comprobar(`etapa ${n}: el punto final está cerca del final de la traza`,
      ult.km > kmTraza - 1.2);
  }
  /* Los dos casos concretos que estuvieron rotos */
  comprobar('«A Brea» de la etapa 2 está en su sitio (km ~25), no en el 13,98',
    s.w.eval("ETAPAS[1].puntos.find(p=>p.nombre==='A Brea').km") > 24);
  comprobar('«A Brea» de la etapa 5 sigue en el suyo (km ~14)',
    s.w.eval("ETAPAS[4].puntos.find(p=>p.nombre==='A Brea').km") < 15);
  comprobar('los seis nombres repetidos tienen km distinto en cada etapa',
    ['Portomarín','Palas de Rei','Melide','Arzúa','O Pedrouzo'].every(function(nom){
      const kms = s.w.eval(`ETAPAS.map(e=>{const p=e.puntos.find(p=>p.nombre===${JSON.stringify(nom)});return p?p.km:null}).filter(k=>k!==null)`);
      return kms.length === 2 && Math.abs(kms[0] - kms[1]) > 5;
    }));
  /* Y que sin sanear ya casi no se pierde nada: la etapa 2 daba 10 h */
  comprobar('la etapa 2 en crudo ya no da 10 h',
    s.w.eval('Marcha.perfil(ETAPAS[1].puntos).horas') < 8);

  /* --- Los hitos saneados: ni retrocesos ni final corto --- */
  for(let n=1;n<=6;n++){
    const pts = s.w.eval(`Queda.hitos(${n})`);
    const kmTraza = s.w.eval(`TRAZAS[${n}].km`);
    let sube = true;
    for(let i=1;i<pts.length;i++) if(pts[i].km <= pts[i-1].km) sube = false;
    comprobar(`etapa ${n}: los hitos van siempre hacia delante`, sube);
    comprobar(`etapa ${n}: el último hito llega al final de la traza`,
      Math.abs(pts[pts.length-1].km - kmTraza) < 0.03);
  }
  /* Con los datos ya corregidos, el saneado no debe tirar nada útil: «A Brea»
     se queda (antes había que descartarla) y solo caen empates a mismo km,
     que suman cero kilómetros. */
  comprobar('la etapa 2 ya conserva «A Brea»',
    s.w.eval("Queda.hitos(2).some(p=>p.nombre==='A Brea')"));
  comprobar('el primer hito sigue siendo la salida',
    s.w.eval('Queda.hitos(1)[0].nombre') === 'Sarria');
  for(let n=1;n<=6;n++){
    const conEle = s.w.eval(`ETAPAS[${n-1}].puntos.filter(p=>typeof p.ele==='number'&&typeof p.km==='number')`);
    const limpio = s.w.eval(`Queda.hitos(${n})`);
    const fuera = conEle.filter(p => !limpio.some(q => q.nombre === p.nombre));
    const soloEmpates = fuera.every(p => conEle.some(q => q.nombre !== p.nombre && q.km === p.km));
    comprobar(`etapa ${n}: el saneado solo descarta empates a mismo km`, soloEmpates);
  }

  /* --- Sin ubicación: la etapa entera --- */
  s.w.irA(0);
  const c1 = s.w.eval('Queda.calcular(1)');
  comprobar('sin ubicación calcula desde el km 0', c1.km === 0 && c1.situado === false);
  comprobar('km que quedan = etapa entera',
    Math.abs(c1.kmQuedan - s.w.eval('TRAZAS[1].km')) < 0.01);
  comprobar('el tiempo de marcha sale positivo y razonable', c1.horas > 3 && c1.horas < 9);
  comprobar('hay desnivel de subida y de bajada', c1.dPos > 0 && c1.dNeg > 0);
  /* En el km 0 el desnivel tiene que ser EXACTAMENTE el de la ficha de la
     etapa; si no, la web se contradice de una pantalla a la siguiente. */
  for(let n=1;n<=6;n++){
    const c = s.w.eval(`Queda.calcular(${n})`);
    comprobar(`etapa ${n}: el desnivel entero coincide con el de la ficha`,
      c.dPos === s.w.eval(`TRAZAS[${n}].dPos`) && c.dNeg === s.w.eval(`TRAZAS[${n}].dNeg`));
  }
  comprobar('la etapa 2 ya no da las 10 h del dato roto',
    s.w.eval('Queda.calcular(2).horas') < 9);

  /* La ficha de la etapa y esta ventana tienen que decir EXACTAMENTE el mismo
     tiempo de marcha. Se vieron 3 h 31 min en la ficha y 4 h 03 min en la
     ventana, en la misma pantalla, por los hitos con el km mal puesto. */
  for(let n=1;n<=6;n++){
    const dif = Math.abs(s.w.eval(`perfilEtapa(${n}).horas`) - s.w.eval(`Queda.calcular(${n}).horas`));
    comprobar(`etapa ${n}: la ficha y la ventana dan la misma marcha`, dif < 1/60);
  }
  comprobar('la etapa 2 ya no da 10 h en la ficha', s.w.eval('perfilEtapa(2).horas') < 9);

  /* --- Qué etapa elige --- */
  comprobar('fuera del viaje y sin etapa abierta, elige la 1',
    s.w.eval('Queda.objetivo().n') === 1);
  s.w.irA(4);
  comprobar('con una etapa abierta, elige esa', s.w.eval('Queda.objetivo().n') === 4);
  s.w.irA(8);
  comprobar('en el equipaje vuelve a la etapa 1', s.w.eval('Queda.objetivo().n') === 1);

  /* La ubicación manda sobre todo lo demás */
  s.w.eval("Geo.ultima={lat:42.79,lon:-7.5,precision:10,km:10,desvio:0.02,ele:500,etapa:1}");
  comprobar('con ubicación, manda la etapa donde estás', s.w.eval('Queda.objetivo().n') === 1);
  const c2 = s.w.eval('Queda.calcular(1)');
  comprobar('situado, cuenta desde tu km', c2.situado === true && c2.km === 10);
  comprobar('quedan menos km que la etapa entera', c2.kmQuedan < c1.kmQuedan);
  comprobar('y menos tiempo de marcha', c2.horas < c1.horas);
  comprobar('el porcentaje cuadra', c2.pct === Math.round(10*100/c2.kmTotal));
  comprobar('propone un siguiente hito por delante', !!c2.sig && c2.sig.km > 10);
  comprobar('a mitad de etapa queda menos desnivel que entera',
    c2.dPos < c1.dPos && c2.dNeg < c1.dNeg);

  /* --- Abrir y cerrar --- */
  s.w.eval('Queda.abrir()');
  comprobar('al abrir se muestra', s.d.getElementById('queda').hidden === false);
  comprobar('pinta contenido', cuerpo().length > 500);
  comprobar('sale el destino de la etapa', cuerpo().indexOf('Portomarín') >= 0);
  comprobar('sale la hora de llegada de la guía', cuerpo().indexOf('15:00') >= 0);
  comprobar('sale el temporizador', cuerpo().indexOf('q-reloj') >= 0);
  comprobar('avisa de que no cuenta las paradas', cuerpo().indexOf('no cuenta las paradas') >= 0);
  comprobar('abierta, el temporizador está vivo', s.w.eval('Queda._tim') !== null);

  /* Con el diálogo abierto las flechas no deben mover la etapa */
  const antes = s.w.eval('vistaEtapa');
  s.d.dispatchEvent(new s.w.KeyboardEvent('keydown', {key:'ArrowRight', bubbles:true}));
  comprobar('las flechas no navegan por detrás del diálogo',
    s.w.eval('vistaEtapa') === antes);
  s.d.dispatchEvent(new s.w.KeyboardEvent('keydown', {key:'Escape', bubbles:true}));
  comprobar('Esc cierra', s.d.getElementById('queda').hidden === true);
  comprobar('al cerrar se para el temporizador', s.w.eval('Queda._tim') === null);

  /* --- La cuenta atrás en palabras --- */
  comprobar('más de un día enseña días',
    /^2 días 3 h 04 min$/.test(s.w.eval('Queda.cuentaAtras(2*86400000+3*3600000+4*60000)')));
  comprobar('un solo día va en singular',
    s.w.eval('Queda.cuentaAtras(86400000+60000)').indexOf('1 día ') === 0);
  comprobar('menos de un día, sin días',
    s.w.eval('Queda.cuentaAtras(5*3600000+9*60000)') === '5 h 09 min');
  comprobar('menos de una hora enseña segundos',
    s.w.eval('Queda.cuentaAtras(9*60000+7000)') === '9 min 07 s');

  /* --- La hora prevista ya pasada --- */
  const p = abrir();
  p.w.eval("Queda.calcular=function(){return {n:1,et:ETAPAS[0],situado:false,desvio:null,"
    + "km:0,kmTotal:23.51,kmQuedan:23.51,pct:0,horas:5,dPos:400,dNeg:530,sig:null,"
    + "meta:new Date(2020,0,1),horaGuia:'15:00'}}");
  p.w.eval('Queda.abrir()');
  comprobar('si la hora ya pasó, lo dice',
    p.d.getElementById('quedaCuerpo').innerHTML.indexOf('ya ha pasado') >= 0);
  p.w.eval('Queda.cerrar()');
  p.dom.window.close();

  comprobar('¿cuánto queda? sin errores', s.errores.length === 0);
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
  comprobar('derecha llega a Retos (7)', s.w.eval('vistaEtapa') === 7);
  flecha('ArrowRight');
  comprobar('derecha se detiene en Equipaje (8)', s.w.eval('vistaEtapa') === 8);
  flecha('ArrowRight');
  comprobar('derecha no pasa de Equipaje', s.w.eval('vistaEtapa') === 8);
  flecha('ArrowLeft');
  comprobar('izquierda desde Equipaje vuelve a Retos', s.w.eval('vistaEtapa') === 7);
  for(let i=0;i<9;i++) flecha('ArrowLeft');
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
  const q = abrir('https://ejemplo.org/?equipaje=1');
  comprobar('?equipaje=1 abre el Equipaje', q.w.eval('vistaEtapa') === 8);
  comprobar('?equipaje=1 no sale vacía', largo(q) > 1000);
  comprobar('?equipaje=1 sin errores', q.errores.length === 0);
  q.dom.window.close();
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
    s.w.eval('Equipaje.datos=null; Equipaje.cargar();');
    s.w.eval('Persona.nombre()');
    s.w.irA(7);
    s.w.irA(8);
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
    /* Recorre las nueve vistas de la barra: índice (0), etapas 1-6, retos (7)
       y equipaje (8), cambiando además de sección a lo bruto. */
    for(let i=0;i<45;i++){ r.w.irA(i%9); r.w.irASeccion(['dia','ruta','perfil','tiempo'][i%4]); }
  }catch(e){ rompeRapido = true; }
  comprobar('40 cambios rápidos de vista no rompen', !rompeRapido);
  comprobar('tras el aporreo el panel sigue pintando', largo(r) > 400);
  r.dom.window.close();
}

/* ---------- Resumen ---------- */
console.log('\n' + pasos + ' comprobaciones, ' + fallos + ' fallos.');
if(fallos){ console.error('HAY FALLOS.'); process.exit(1); }
console.log('Todo correcto.');
