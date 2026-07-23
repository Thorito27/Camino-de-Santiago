#!/usr/bin/env node
/* Recorre las 37 vistas del visor con jsdom y comprueba que ninguna
   queda vacía ni lanza errores.  Uso: npm test                        */
const fs = require('fs');
const path = require('path');
const {JSDOM, VirtualConsole} = require('jsdom');

const raiz = path.join(__dirname, '..');

const stub = `window.maplibregl={
  Map:function(){this._h={};this._s={};this._l={};
    this.addControl=()=>{};this.on=(e,f)=>{this._h[e]=f};this.loaded=()=>true;
    this.setTerrain=()=>{};this.fitBounds=()=>{};this.flyTo=()=>{};this.resize=()=>{};
    this.addSource=(i,d)=>{this._s[i]=d};this.addLayer=l=>{this._l[l.id]=l};
    this.getSource=i=>this._s[i];this.getLayer=i=>this._l[i];
    this.removeLayer=i=>{delete this._l[i]};this.removeSource=i=>{delete this._s[i]};
    this._fire=e=>{if(this._h[e])this._h[e]()};window.__m=this},
  Marker:function(){this.setLngLat=function(){return this};
    this.addTo=function(){window.__mk=(window.__mk||0)+1;return this};this.remove=()=>{}},
  NavigationControl:function(){},ScaleControl:function(){},
  LngLatBounds:function(){this.extend=function(){return this}}};
window.fetch=()=>Promise.reject(new Error('sin red en la prueba'));`;

const html = fs.readFileSync(path.join(raiz,'index.html'),'utf8')
  .replace(/<script src="https:\/\/unpkg[^"]*"><\/script>/, `<script>${stub}</script>`);

const errores = [];
const dom = new JSDOM(html, {
  runScripts:'dangerously', pretendToBeVisual:true, url:'https://ejemplo.org/',
  virtualConsole: new VirtualConsole()
    .on('jsdomError', e => errores.push('ERROR: '+e.message))
    .on('error', (...a) => errores.push('console.error: '+a.join(' ')))
});
const w = dom.window, d = w.document;
if(w.__m) w.__m._fire('load');

let vacias = 0, vistas = 0;
const SECS = ['ruta','perfil','paradas','sellos','tiempo','dia'];

console.log('Recorriendo las vistas:\n');
w.irA(0);
const li = d.getElementById('panel').innerHTML.length;
vistas++;
console.log(`  Índice           ${String(li).padStart(6)} car`
  + `  ${d.querySelectorAll('.tel').length} teléfonos`);
if(li < 1000){ vacias++; console.error('   ¡El índice sale casi vacío!'); }

for(let n=1; n<=6; n++){
  w.irA(n);
  const et = w.eval(`ETAPAS[${n-1}]`);
  const partes = [];
  for(const s of SECS){
    w.irASeccion(s);
    const l = d.getElementById('panel').innerHTML.length;
    vistas++;
    if(l < 400){ vacias++; partes.push(`${s}:VACÍA`); }
    else partes.push(`${s}:${l}`);
  }
  console.log(`  Etapa ${n} ${(et.origen+'→'+et.destino).slice(0,22).padEnd(24)} ${partes.join(' ')}`);
}

console.log(`\n${vistas} vistas, ${vacias} vacías, ${errores.length} errores.`);
if(errores.length) errores.forEach(e => console.error('  '+e));
if(vacias || errores.length) process.exit(1);
console.log('Todo correcto.');
