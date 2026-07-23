# Trazas GPX

Seis trazas descargadas de Wikiloc, de cuatro autores distintos.
Encadenan sin huecos: el final de cada una coincide con el inicio de la
siguiente, lo que da bastante confianza en que son correctas.

| Etapa | Archivo | Autor |
|---|---|---|
| 1 | `camino-de-santiago-frances-etapa-29-sarria-portomarin.gpx` | Francisco Javier Garcés Aso |
| 2 | `camino-de-santiago-frances-etapa-30-portomarin-palas-del-rey.gpx` | Francisco Javier Garcés Aso |
| 3 | `palas-de-rey-melide-camino-de-santiago-frances-.gpx` | Pájaro Kuy Kuy |
| 4 | `melide-arzua-camino-de-santiago-frances.gpx` | Pepe Patio |
| 5 | `camino-de-santiago-frances-etapa-4-ardua-o-pedrouzo.gpx` | Eleazar Chust diaz |
| 6 | `o-pedrouzo-santiago-de-compostela-etapa-5-del-camino-de-sant.gpx` | Lz1975 |

## Procesado

Estos son los originales sin tocar. Lo que usa la web está en `trazas.js`,
ya procesado:

1. **Altitud suavizada** con media móvil de 31 puntos.
2. **Desnivel con umbral de 10 m**, para no contar el temblor del GPS como
   subida.
3. **Traza simplificada** con Douglas-Peucker a 12 m de tolerancia: de unos
   3.000 puntos por etapa a unos 150, sin que se note en el dibujo.

El paso 2 es el importante. Sin filtrar, la etapa 1 daba +1.466 m de
desnivel positivo, tres veces y media lo real. Los valores filtrados
coinciden con los que publica Gronze con un 2 % de diferencia.

Si algún día se sustituye una traza por otra, hay que reprocesarla con los
mismos parámetros o los desniveles dejarán de ser comparables entre etapas.
