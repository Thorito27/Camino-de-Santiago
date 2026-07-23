#!/usr/bin/env node
/* Valida la sintaxis del JavaScript incrustado en index.html y de sw.js.
   Uso: npm run validar                                                  */
const fs = require('fs');
const {execSync} = require('child_process');
const path = require('path');

const raiz = path.join(__dirname, '..');
const tmp = path.join(raiz, '.validar-tmp');

let fallos = 0;
fs.mkdirSync(tmp, {recursive:true});

try {
  const html = fs.readFileSync(path.join(raiz,'index.html'), 'utf8');
  const bloques = [...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].map(m => m[1]);
  console.log(`index.html: ${bloques.length} bloques de script`);

  bloques.forEach((b, i) => {
    const f = path.join(tmp, `b${i}.js`);
    fs.writeFileSync(f, b);
    try {
      execSync(`node --check "${f}"`, {stdio:'pipe'});
      console.log(`  bloque ${i}: ${String(b.split('\n').length).padStart(4)} líneas  OK`);
    } catch(e) {
      console.error(`  bloque ${i}: FALLO`);
      console.error('   ', e.stderr.toString().split('\n').slice(0,3).join('\n    '));
      fallos++;
    }
  });

  ['sw.js','datos.js','trazas.js'].forEach(f => {
    const p = path.join(raiz, f);
    if(!fs.existsSync(p)) return;
    try {
      execSync(`node --check "${p}"`, {stdio:'pipe'});
      console.log(`${f}: OK`);
    } catch(e) {
      console.error(`${f}: FALLO`);
      console.error('  ', e.stderr.toString().split('\n')[1]);
      fallos++;
    }
  });

  // Comprobar que los datos sueltos coinciden con los incrustados
  const datos = fs.readFileSync(path.join(raiz,'datos.js'),'utf8');
  const primeraLinea = datos.split('\n').find(l => l.includes('num:1, fecha:'));
  if(primeraLinea && !html.includes(primeraLinea.trim())){
    console.warn('\nAVISO: datos.js no coincide con lo incrustado en index.html.');
    console.warn('       Hay que reincrustarlo (ver README).');
  }

} finally {
  fs.rmSync(tmp, {recursive:true, force:true});
}

if(fallos){ console.error(`\n${fallos} fallo(s) de sintaxis.`); process.exit(1); }
console.log('\nTodo correcto.');
