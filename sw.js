/* ============================================================
   Service worker del visor del Camino.

   Objetivo: que la web siga funcionando entre Ferreiros y
   Portomarín, o cruzando la Sierra de Ligonde, donde no hay
   cobertura.

   Estrategia por tipo de recurso:
   - La propia página y sus librerías: cache primero. Son fijas.
   - Tiles del mapa: cache primero, y lo que se descargue se
     guarda. Al mirar una etapa con wifi quedan cacheados sus
     tiles para el día siguiente.
   - Open-Meteo: red primero, con la última respuesta como
     reserva. Una previsión de ayer es mejor que nada, pero
     siempre se prefiere la fresca.

   El caché de tiles se limita a 1200 entradas para no llenar
   el móvil: unos 60-80 MB según la zona.
   ============================================================ */

const VERSION      = 'camino-v10';
const CACHE_APP    = VERSION + '-app';
const CACHE_TILES  = VERSION + '-tiles';
const CACHE_METEO  = VERSION + '-meteo';
const MAX_TILES    = 1200;

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

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(nombres){
      return Promise.all(nombres.map(function(n){
        if(n.indexOf(VERSION) !== 0) return caches.delete(n);
      }));
    }).then(function(){ return self.clients.claim(); })
  );
});

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
  const esTile = url.hostname.indexOf('arcgisonline.com') >= 0
              || url.hostname.indexOf('elevation-tiles-prod') >= 0
              || url.hostname.indexOf('amazonaws.com') >= 0;

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
        /* Si es una navegación, servir la página cacheada */
        if(req.mode === 'navigate') return caches.match('./index.html');
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
