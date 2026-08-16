/* ============================================================
   Service worker del visor del Camino.

   Objetivo: que la web siga funcionando entre Ferreiros y
   Portomarín, o cruzando la Sierra de Ligonde, donde no hay
   cobertura.

   Estrategia por tipo de recurso:
   - La PÁGINA (navegaciones): RED primero, con la copia guardada
     como respaldo sin cobertura. Antes era caché primero y hacía
     que los cambios desplegados no se vieran en el móvil. No lo
     cambies sin leer la nota de CLAUDE.md.
   - Librerías y fuentes: caché primero. Son fijas.
   - Tiles del mapa: caché primero, y lo que se descargue se
     guarda. Al mirar una etapa con wifi quedan cacheados sus
     tiles para el día siguiente.
   - Open-Meteo: red primero, con la última respuesta como
     reserva. Una previsión de ayer es mejor que nada, pero
     siempre se prefiere la fresca.

   El caché de tiles se limita a 1200 entradas. La descarga
   completa de la ruta son ~510 teselas y unos 8,4 MB (medido);
   el resto del margen es para lo que se navegue.

   OJO CON LOS NOMBRES DE CACHÉ. El de la aplicación lleva la
   VERSION dentro a propósito: al subirla se descarta la copia
   vieja de la página. Los de TILES y METEO **no la llevan**, y no
   es un descuido. Cuando la llevaban, cada subida de VERSION (una
   por cada cambio de `index.html`, casi treinta hasta ahora)
   borraba los 8,4 MB de mapas descargados, así que había que
   volver a guardarlos después de cada despliegue. Los mapas no
   caducan con la web: son teselas del terreno.
   ============================================================ */

const VERSION      = 'camino-v31';
const CACHE_APP    = VERSION + '-app';
const CACHE_TILES  = 'camino-tiles-v1';   /* SIN VERSION: sobrevive a los despliegues */
const CACHE_METEO  = 'camino-meteo-v1';   /* SIN VERSION: es solo respaldo, no estorba */
const MAX_TILES    = 1200;

/* Los que hay que conservar en el purgado. Todo lo demás que empiece
   por 'camino' es de una versión anterior y se borra. */
const CACHES_VIVOS = [CACHE_APP, CACHE_TILES, CACHE_METEO];

/* Lo imprescindible para arrancar sin red */
const ESENCIALES = [
  './',
  './index.html',
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.js',
  'https://unpkg.com/maplibre-gl@4.7.1/dist/maplibre-gl.css'
];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE_APP).then(function(c){
      /* addAll falla entero si un recurso falla; los añado uno a uno
         para que un fallo de red no impida instalar el resto. */
      return Promise.all(ESENCIALES.map(function(url){
        return c.add(url).catch(function(){ /* se reintenta al navegar */ });
      }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

/* Rescata los tiles que quedaron en los cachés versionados de antes
   (`camino-vNN-tiles`) y los pasa al caché permanente. Así, quien ya tenía
   los mapas guardados no tiene que volver a descargarlos al actualizar a
   esta versión. Solo copia de caché a caché: no toca la red. */
function migrarTilesViejos(nombres){
  const viejos = nombres.filter(function(n){
    return n !== CACHE_TILES && /-tiles$/.test(n) && n.indexOf('camino') === 0;
  });
  if(!viejos.length) return Promise.resolve();

  return caches.open(CACHE_TILES).then(function(destino){
    return viejos.reduce(function(cadena, nombre){
      return cadena.then(function(){
        return caches.open(nombre).then(function(origen){
          return origen.keys().then(function(claves){
            return Promise.all(claves.map(function(req){
              return destino.match(req).then(function(ya){
                if(ya) return;
                return origen.match(req).then(function(res){
                  if(res) return destino.put(req, res);
                });
              });
            }));
          });
        }).catch(function(){ /* si uno falla, seguimos con el resto */ });
      });
    }, Promise.resolve());
  }).then(function(){ podar(CACHE_TILES, MAX_TILES); });
}

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(nombres){
      /* Primero se rescatan los tiles viejos y DESPUÉS se purga: al revés se
         borrarían justo lo que se quiere conservar. */
      return migrarTilesViejos(nombres).then(function(){
        return Promise.all(nombres.map(function(n){
          if(CACHES_VIVOS.indexOf(n) < 0) return caches.delete(n);
        }));
      });
    }).then(function(){
      /* Al subir de VERSION se acaban de borrar las cachés viejas. Si la
         instalación no consiguió guardar la página (móvil con mala cobertura
         justo al actualizar), el caché nuevo se queda VACÍO y la primera vez
         que falle la red no hay respaldo. Se reintenta aquí. */
      return caches.open(CACHE_APP).then(function(c){
        return Promise.all(ESENCIALES.map(function(url){
          return c.match(url).then(function(hit){
            return hit ? null : c.add(url).catch(function(){});
          });
        }));
      });
    }).then(function(){ return self.clients.claim(); })
  );
});

/* Última red de seguridad para una navegación sin red y sin copia guardada.
   NUNCA hay que dejar que `respondWith` se resuelva con `undefined`: el
   navegador responde con ERR_FAILED y en el móvil eso se ve como una PANTALLA
   EN BLANCO, que parece que la web esté rota cuando solo falta cobertura. */
function paginaSinRed(){
  return new Response(
    '<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">'
    + '<meta name="viewport" content="width=device-width,initial-scale=1">'
    + '<title>Sin conexión — Las Lolitas al Camino</title>'
    + '<style>html,body{height:100%}body{margin:0;display:flex;align-items:center;'
    + 'justify-content:center;font-family:system-ui,-apple-system,sans-serif;'
    + 'background:#1B2A23;color:#EDE8DC;text-align:center;padding:2rem;line-height:1.6}'
    + 'b{color:#D8A33C;display:block;font-size:1.1rem;margin-bottom:.5rem}'
    + 'button{margin-top:1.2rem;background:#D8A33C;color:#1B2A23;border:none;padding:.7rem 1.4rem;'
    + 'border-radius:3px;font:inherit;font-weight:600;cursor:pointer}</style></head><body><div>'
    + '<b>Sin conexión</b>No hay cobertura y todavía no había una copia guardada '
    + 'en este móvil.<br>Vuelve a intentarlo cuando tengas señal o wifi.'
    + '<button onclick="location.reload()">Reintentar</button>'
    + '</div></body></html>',
    {status:200, headers:{'Content-Type':'text/html; charset=utf-8'}}
  );
}

/* Recorta el caché de tiles cuando crece demasiado (FIFO) */
function podar(nombre, max){
  caches.open(nombre).then(function(c){
    c.keys().then(function(claves){
      if(claves.length > max){
        const sobran = claves.length - max;
        for(let i=0; i<sobran; i++) c.delete(claves[i]);
      }
    });
  });
}

self.addEventListener('fetch', function(e){
  const req = e.request;
  if(req.method !== 'GET') return;
  const url = new URL(req.url);

  /* --- Tiles del mapa: satélite ESRI y relieve AWS --- */
  /* Ojo: los dominios de las capas cambiaron (IGN y OpenTopoMap). Si no están
     aquí, sus teselas dejan de cachearse y el modo sin cobertura se rompe. */
  const esTile = url.hostname.indexOf('arcgisonline.com') >= 0
              || url.hostname.indexOf('elevation-tiles-prod') >= 0
              || url.hostname.indexOf('amazonaws.com') >= 0
              || url.hostname.indexOf('ign.es') >= 0;

  if(esTile){
    e.respondWith(
      caches.open(CACHE_TILES).then(function(c){
        return c.match(req).then(function(hit){
          if(hit) return hit;
          return fetch(req).then(function(res){
            if(res && res.status === 200){
              c.put(req, res.clone());
              podar(CACHE_TILES, MAX_TILES);
            }
            return res;
          }).catch(function(){
            /* Sin red y sin caché: devolver un tile transparente
               en vez de un error, para que el mapa no se rompa. */
            return new Response(null, {status: 204});
          });
        });
      })
    );
    return;
  }

  /* --- Open-Meteo: red primero, caché como reserva --- */
  if(url.hostname.indexOf('open-meteo.com') >= 0){
    e.respondWith(
      fetch(req).then(function(res){
        if(res && res.status === 200){
          caches.open(CACHE_METEO).then(function(c){ c.put(req, res.clone()); });
        }
        return res;
      }).catch(function(){
        return caches.match(req).then(function(hit){
          return hit || new Response(
            JSON.stringify({error:'sin conexión'}),
            {status: 503, headers:{'Content-Type':'application/json'}});
        });
      })
    );
    return;
  }

  /* --- La página (navegación): RED PRIMERO. Así, con conexión, siempre se
     ve la última versión sin tener que recargar varias veces ni vaciar
     caché. Sin conexión, se cae a la copia guardada. La copia fresca se
     guarda bajo './index.html' para que el respaldo offline no se quede
     viejo. --- */
  if(req.mode === 'navigate'){
    e.respondWith(
      fetch(req).then(function(res){
        if(res && res.status === 200){
          const copia = res.clone();
          caches.open(CACHE_APP).then(function(c){ c.put('./index.html', copia); });
        }
        return res;
      }).catch(function(){
        return caches.match('./index.html').then(function(hit){
          return hit || caches.match('./');
        }).then(function(hit){
          return hit || caches.match(req).then(function(h){ return h || paginaSinRed(); });
        });
      })
    );
    return;
  }

  /* --- Todo lo demás (fuentes, librerías): caché primero --- */
  e.respondWith(
    caches.match(req).then(function(hit){
      if(hit) return hit;
      return fetch(req).then(function(res){
        if(res && res.status === 200 && (url.origin === location.origin
            || url.hostname.indexOf('unpkg.com') >= 0
            || url.hostname.indexOf('fonts.g') >= 0)){
          const copia = res.clone();
          caches.open(CACHE_APP).then(function(c){ c.put(req, copia); });
        }
        return res;
      }).catch(function(){
        /* Si es una navegación, servir la página cacheada. Y si tampoco está,
           la página de "sin conexión": aquí tampoco vale devolver undefined. */
        if(req.mode === 'navigate')
          return caches.match('./index.html').then(function(h){ return h || paginaSinRed(); });
        return new Response('', {status: 504});
      });
    })
  );
});

/* Permite que la página pida precachear los tiles de una zona */
self.addEventListener('message', function(e){
  if(!e.data) return;

  if(e.data.tipo === 'precachear' && Array.isArray(e.data.urls)){
    caches.open(CACHE_TILES).then(function(c){
      let hechos = 0;
      const total = e.data.urls.length;
      Promise.all(e.data.urls.map(function(u){
        return c.match(u).then(function(hit){
          if(hit){ hechos++; return; }
          return fetch(u).then(function(r){
            if(r && r.status === 200) return c.put(u, r);
          }).catch(function(){}).then(function(){ hechos++; });
        });
      })).then(function(){
        podar(CACHE_TILES, MAX_TILES);
        e.source && e.source.postMessage({tipo:'precacheado', hechos:hechos, total:total});
      });
    });
  }

  if(e.data.tipo === 'estado'){
    caches.open(CACHE_TILES).then(function(c){
      c.keys().then(function(k){
        e.source && e.source.postMessage({tipo:'estado', tiles:k.length});
      });
    });
  }

  if(e.data.tipo === 'limpiar'){
    caches.delete(CACHE_TILES).then(function(){
      e.source && e.source.postMessage({tipo:'limpiado'});
    });
  }
});
