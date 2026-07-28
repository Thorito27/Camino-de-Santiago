/* ============================================================
   DATOS DEL VIAJE — Camino Francés, últimos 100 km
   Sarria → Santiago de Compostela, 18–23 agosto 2026
   Grupo: 12 personas (11 desde el jueves 20 por la tarde)

   PROCEDENCIA
   - Horarios, alojamientos, comidas, cultura: PDFs de la guía familiar.
   - Coordenadas: Google Places, julio 2026.
   - Altitudes (ele): cotas escritas en los perfiles de la guía.
     Solo hay cota de los pueblos; entre uno y otro se interpola en
     línea recta, así que el desnivel real será MAYOR que el calculado.
   - Kilometrajes: de la guía. Sin verificar contra GPX.

   Cada dato dudoso lleva `fiable: false` y una `nota` visible.
   ============================================================ */
'use strict';

const ANIO_VIAJE = 2026;

const CONFIG_MARCHA = {
  V_BASE: 4.0,
  ASCENSO_M_POR_HORA: 600,
  UMBRAL_BAJADA_SUAVE: 0.05,
  UMBRAL_BAJADA_FUERTE: 0.12,
  BONIF_BAJADA_H_POR_300M: 0.166,
  PENAL_BAJADA_H_POR_300M: 0.166,
  FACTOR_FATIGA: 1.0,
  MIN_DESCANSO_POR_HORA: 0
};

const COLORES_ETAPA = ['#C1462B','#8A6D3B','#4A6B52','#3D5A73','#7B4B6B','#B8860B'];

const ETAPAS = [
{
  num:1, fecha:'2026-08-18', diaSemana:'martes',
  origen:'Sarria', destino:'Portomarín', salida:'08:00',
  km:{guia:22.4, sumaTramos:22.0, gpx:23.51,
      nota:'El perfil dice 22,4 km; los tramos del timing suman 22,0 (4,2 + 9,1 + 8,7).'},
  perfilNota:'El gráfico de la guía va de Portomarín a Sarria, al revés del sentido de marcha.',
  puntos:[
    {nombre:"Sarria", lat:42.772750, lon:-7.431120, km:1.99, ele:451, kmGuia:0, tipo:'inicio', fiable:false, ajustado:1850, desviacion_m:0},
    {nombre:"As Paredes", lat:42.769790, lon:-7.439580, km:2.97, ele:497, kmGuia:2.9, tipo:'paso', fiable:false, ajustado:943, desviacion_m:0},
    {nombre:"Iglesia de Santiago de Barbadelo", lat:42.765180, lon:-7.450550, km:4.36, ele:543, kmGuia:4.2, tipo:'iglesia', sellar:true, horario:"8:30-12:30", fiable:true, ficha:"Románica del s. XII. Primer punto de interés. Google recoge 8:00-12:00; la guía dice 8:30-12:30. Sin verificar.", desviacion_m:0},
    {nombre:"Barbadelo", lat:42.765180, lon:-7.450550, km:4.36, ele:543, kmGuia:4.4, tipo:'taxi', fiable:true, ficha:"Punto de escape. Taxis: Alberto 649850117, David 669087722. Tramo Sarria-Barbadelo: dificultad ALTA según la guía.", desviacion_m:0},
    {nombre:"Rente", lat:42.769370, lon:-7.462590, km:5.88, ele:590, kmGuia:5.6, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Mercado da Serra", lat:42.773060, lon:-7.468920, km:6.69, ele:617, kmGuia:6.4, tipo:'comida', fiable:true, ficha:"Taberna da Serra. Punto de desayuno propuesto en la guía.", desviacion_m:0},
    {nombre:"Peruscallo", lat:42.777050, lon:-7.481640, km:8.39, ele:599, kmGuia:8.6, tipo:'comida', fiable:false, ajustado:453, ficha:"Rest in Peruscallo. Desayuno alternativo.", desviacion_m:0},
    {nombre:"Cortiñas", lat:42.778910, lon:-7.499460, km:10.49, ele:630, kmGuia:9.6, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Brea", lat:42.778840, lon:-7.508440, km:11.44, ele:605, kmGuia:11.1, tipo:'cultura', fiable:true, ficha:"Entre Brea y Morgade está el mojón clásico del km 100.", desviacion_m:0},
    {nombre:"Morgade", lat:42.782190, lon:-7.521230, km:12.72, ele:633, kmGuia:11.9, tipo:'comida', fiable:true, ficha:"Bar Casa Morgade. Abre 7:30-21:30.", desviacion_m:0},
    {nombre:"Ferreiros", lat:42.783610, lon:-7.533360, km:14.14, ele:643, kmGuia:13.3, tipo:'taxi', fiable:true, ficha:"Punto de escape principal. Desde Casa Cruceiro (LU-633) o Iglesia de San Salvador (LU-P-5707). Veña Café Bar: miles de botellines firmados.", desviacion_m:0},
    {nombre:"Mirallos", lat:42.784190, lon:-7.538790, km:14.61, ele:620, kmGuia:13.9, tipo:'iglesia', fiable:true, ficha:"Iglesia de Santa María, románica s. XII-XIII. Suele estar cerrada, a 300 m de la salida del pueblo.", desviacion_m:0},
    {nombre:"A Pena", lat:42.784930, lon:-7.546870, km:15.41, ele:624, kmGuia:14.5, tipo:'cultura', fiable:true, ficha:"Cerca está el mojón del km 100 oficial actual.", desviacion_m:0},
    {nombre:"Couto", lat:42.783970, lon:-7.553660, km:16.03, ele:619, kmGuia:15, tipo:'paso', fiable:false, ajustado:560, desviacion_m:0},
    {nombre:"Rozas", lat:42.786950, lon:-7.562970, km:17.11, ele:585, kmGuia:15.5, tipo:'paso', fiable:false, ajustado:375, desviacion_m:0},
    {nombre:"Moimentos", lat:42.790390, lon:-7.571610, km:18.00, ele:509, kmGuia:16.6, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Mercadoiro", lat:42.791070, lon:-7.576230, km:18.43, ele:528, kmGuia:17.3, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Moutras", lat:42.794360, lon:-7.590000, km:19.77, ele:455, kmGuia:19, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Parrocha", lat:42.795180, lon:-7.596970, km:20.38, ele:424, kmGuia:19.7, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Vilachá", lat:42.795580, lon:-7.603500, km:20.95, ele:396, kmGuia:21, tipo:'comida', fiable:true, ficha:"Los Andantes. Última parada antes de la bajada final.", desviacion_m:0},
    {nombre:"Iglesia-fortaleza de San Nicolás", lat:42.807320, lon:-7.615850, km:23.46, ele:344, kmGuia:22.3, tipo:'iglesia', sellar:true, horario:"10:00-20:00", fiable:true, ficha:"S. XII, orden de San Juan de Jerusalén. Trasladada piedra a piedra al construirse el embalse.", desviacion_m:0},
    {nombre:"Portomarín", lat:42.807320, lon:-7.615850, km:23.46, ele:344, kmGuia:22.4, tipo:'fin', fiable:true, desviacion_m:12}
  ],
  timing:[
    {hora:'7:00', texto:'Coche a Portomarín. Dos personas llevan los dos coches y regresan con uno.'},
    {hora:'8:00', texto:'Salida tras café. El hotel en Sarria (Baixo a Lua) está junto al camino.'},
    {hora:'9:00', texto:'Llegada a Barbadelo (4,2 km). Dificultad ALTA.'},
    {hora:'9:00-9:30', texto:'Desayuno en Mercado da Serra, o más adelante en Peruscallo.'},
    {hora:'9:30-12:00', texto:'Barbadelo-Ferreiros (9,1 km). Dificultad BAJA. El mejor tramo: sombreado, pendientes moderadas, incluye el km 100.', destacado:true},
    {hora:'12:00-12:30', texto:'Parada en Ferreiros. Buen punto para taxi a Portomarín.'},
    {hora:'13:30 / 14:30', texto:'Llegada a Mercadeiro / Vilachá.', dudoso:'Dos horas sin criterio claro: ¿dos hitos o una horquilla?'},
    {hora:'15:00', texto:'Llegada a Portomarín. Los 3 últimos km son bajada MUY IMPORTANTE. Ojo con las rodillas.'}
  ],
  alojamiento:{nombre:'Casa Grande do Costureiro', direccion:'Rúa Sánchez Carro, 8',
    checkin:'15:00', telefono:'678503693', reserva:'Directa', plazas:21,
    nota:'El desglose de la guía suma hasta 21 plazas (8 dobles + 4 individuales + sofá cama). Muy por encima del grupo.',
    extra:'Sin piscina, pero hay embalse y piscina municipal en el pueblo.'},
  comidas:{
    comida:['Cervecería El Origen — ambiente peregrino, no cocina gallega',
            'Restaurante Pérez — menú 17 € / 20 € con pulpo. Reservar: 982 54 50 40',
            'Xoanes Raciones — reservar'],
    cena:['O Mirador — RESERVADO 20:30. Lorena López, omiradorportomarin@gmail.com, 982 545323'],
    nota:'El mapa de la guía marca Restaurante Pérez y Dgusta como "cerrado temporalmente", pero el texto lo recomienda. Capturas de fechas distintas. Sin verificar.',
    otros:'Supermercado Claudio cierra a las 14:00. Covirán no cierra. Hay italiano con pizzas para llevar.'},
  cultura:['Ponte da Aspera — se ve al salir de Sarria.',
    'Iglesia de Santa María en Mirallos (s. XII-XIII). Suele estar cerrada, a 300 m de la salida del pueblo.',
    'Mojón km 100 — el clásico entre Brea y Morgade; el oficial actual cerca de A Pena, después de Ferreiros.',
    'Escalinata y capilla de la Virgen de las Nieves, Portomarín.',
    'Palacio de Berbetoros (s. XVII), Crucero de la Casa del Conde de la Maza, Iglesia de San Pedro (1182).'],
  avisos:['La guía deja anotado: "Falta incluir los puntos de interés cultural de la DIAPO 4".',
    'Distancia de Mirallos a Sarria: el PDF dice "a __ km", falta el número.',
    'La bajada final a Portomarín pierde unos 130 m en 3 km. Es lo más exigente para las rodillas de todo el viaje.']
},
{
  num:2, fecha:'2026-08-19', diaSemana:'miércoles',
  origen:'Portomarín', destino:'Palas de Rei', salida:'07:30',
  km:{guia:25.0, sumaTramos:25.2, gpx:27.58,
      nota:'El título dice 25 km; las dos ramas del timing (vía Gonzar o vía Castromaior) suman 25,2 ambas.'},
  perfilNota:'El gráfico va de Palas de Rei a Portomarín, al revés del sentido de marcha.',
  puntos:[
    {nombre:"Portomarín", lat:42.806670, lon:-7.616670, km:0.00, ele:381, kmGuia:0, tipo:'inicio', fiable:true, desviacion_m:109},
    {nombre:"Fábrica de ladrillos", lat:42.811120, lon:-7.644710, km:3.45, ele:443, kmGuia:3, tipo:'paso', fiable:false, ajustado:437, desviacion_m:0},
    {nombre:"Toxibo", lat:42.812560, lon:-7.661020, km:4.93, ele:493, kmGuia:4.8, tipo:'paso', fiable:false, ajustado:611, desviacion_m:0},
    {nombre:"Gonzar", lat:42.826060, lon:-7.695830, km:8.81, ele:532, kmGuia:8.2, tipo:'taxi', fiable:true, ficha:"Iglesia de Santa María. Punto de escape. Bar/Albergue de Gonzar, Hostería de Gonzar. Fin del tramo más duro del día.", desviacion_m:0},
    {nombre:"Castro de Castromaior", lat:42.833336, lon:-7.719796, km:11.33, ele:666, kmGuia:9.5, tipo:'cultura', fiable:true, ficha:"Restos prerromanos celtas, más de 2400 años. Desvío de 5-10 min. Abierto 24 h, gratuito. Centro de interpretación al aire libre.", fueraDeRuta:true, desvio_m:131},
    {nombre:"Hospital da Cruz", lat:42.840540, lon:-7.733860, km:12.97, ele:656, kmGuia:12, tipo:'comida', fiable:true, ficha:"Taberna do Camiño — tortillas de patata famosas.", desviacion_m:0},
    {nombre:"Ventas de Narón", lat:42.844240, lon:-7.748800, km:14.62, ele:688, kmGuia:13.5, tipo:'iglesia', sellar:true, fiable:true, ficha:"Ermita de la Magdalena. SELLAR si está abierta, pero abre poco tiempo. Albergue.", desviacion_m:0},
    {nombre:"Sierra de Ligonde", lat:42.850060, lon:-7.762060, km:16.17, ele:691, kmGuia:15, tipo:'mirador', fiable:true, ficha:"Punto más alto de toda la ruta: 722 m.", desviacion_m:0},
    {nombre:"Cruceiro de Lameiros", lat:42.855300, lon:-7.777380, km:17.76, ele:616, kmGuia:16, tipo:'cultura', fiable:true, ficha:"Uno de los más famosos del camino, doble cara, mucha simbología. FECHA EN DISPUTA: la guía dice 1674 en una diapositiva y 1670 en otra. Google recoge 1670.", desviacion_m:0},
    {nombre:"Ligonde", lat:42.858850, lon:-7.779650, km:18.24, ele:614, kmGuia:16.5, tipo:'taxi', fiable:true, ficha:"Punto de escape. Bar Restaurante Ligonde, Casa Mariluz, Trisquel. Cementerio de peregrinos.", desviacion_m:0},
    {nombre:"Airexe", lat:42.865620, lon:-7.790760, km:19.66, ele:613, kmGuia:17.4, tipo:'iglesia', fiable:false, ajustado:407, ficha:"Iglesia de Santiago de Airexe. Bares y albergue público.", desviacion_m:0},
    {nombre:"Portos", lat:42.868340, lon:-7.797770, km:20.36, ele:629, kmGuia:18.9, tipo:'paso', fiable:false, ajustado:767, ficha:"Entre Portos y Lestedo sale el desvío a Vilar de Donas: 2,5 km de ida y otros tantos de vuelta.", desviacion_m:0},
    {nombre:"Lestedo", lat:42.872170, lon:-7.814280, km:22.19, ele:578, kmGuia:20, tipo:'paso', fiable:false, ajustado:554, desviacion_m:0},
    {nombre:"Os Valos", lat:42.873770, lon:-7.827360, km:23.51, ele:622, kmGuia:21.1, tipo:'paso', fiable:false, ajustado:471, desviacion_m:0},
    {nombre:"A Brea", lat:42.874260, lon:-7.843000, km:25.15, ele:617, kmGuia:22.2, tipo:'paso', fiable:false, ajustado:397, desviacion_m:0},
    {nombre:"Avenostre", lat:42.873420, lon:-7.857590, km:26.47, ele:595, kmGuia:23.4, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Palas de Rei", lat:42.873250, lon:-7.868800, km:27.52, ele:557, kmGuia:25, tipo:'fin', fiable:true, desviacion_m:24}
  ],
  timing:[
    {hora:'6:30', texto:'Coche a Palas de Rei.'},
    {hora:'7:30', texto:'Salida tras desayuno importante. Cruzar el puente sobre el Miño al amanecer es bonito.'},
    {hora:'9:30', texto:'Llegada a Gonzar / Castromaior (8,2 / 9,5 km). Dificultad MEDIA-ALTA, lo más duro del día.'},
    {hora:'9:15-13:00', texto:'Gonzar/Castromaior-Ligonde (8,5 / 7,2 km). El tramo más interesante del día.',
     dudoso:'La hora de inicio (9:15) es anterior a la de llegada a Gonzar (9:30). Probable errata.'},
    {hora:'13:00-13:30', texto:'Parada en Ligonde. Taxi para quien quiera. Lo malo ya ha pasado.'},
    {hora:'13:30-15:30', texto:'Ligonde-Palas de Rei (8,5 km).'}
  ],
  alojamiento:{nombre:'A Casa de Chelo', direccion:'Rúa do Cruceiro, 2',
    checkin:null, telefono:null, plazas:null,
    nota:'6 habitaciones, solo dos baños para el grupo. Lavadora/secadora gratuita. Sin datos de check-in ni teléfono en la guía.'},
  comidas:{
    comida:['Casa Curro — a 1 min del alojamiento, menú 16 €, 982 38 00 44. No cierra cocina',
            'Pulpería A Nosa Terra — sin reservas, buenos comentarios',
            'Restaurante Ultreya — menú 15 €','Restaurante Castro','Albergue Mesón de Benito','Quinto Carallo'],
    cena:['Mesón A Lareira — RESERVADO 21:00. Menús de 16 € y 22 €, o a la carta. Vanesa Vilela, vanesavilelacastro@gmail.com'],
    nota:'FECHA LÍMITE: hay que comunicar a A Lareira qué va a cenar cada uno una semana antes, es decir antes del 12 de agosto de 2026.'},
  cultura:['Iglesia de Santa María, en Gonzar.','Iglesia de Santiago de Airexe, después de Portos.',
    'Cementerio de Ligonde — anexo a un desaparecido hospital de la Orden de Santiago.',
    'Iglesia de San Tirso, Palas de Rei. SELLAR.',
    'Iglesia de Vilar de Donas — fuera del camino, a 7 km de Palas de Rei. Abierta 16:00-20:00.',
    'Castillo de Pambre — a 10 km de Palas de Rei, fuera del camino.'],
  avisos:['Vilar de Donas: la guía dice "10 min en coche" tanto desde Palas de Rei como desde Melide (etapa 3). Ambas no pueden ser ciertas.',
    'Castillo de Pambre aparece también como "Pombre" y con tres distancias distintas: 10 km, 15 min, 20 min desde Melide.',
    'Es la etapa más larga y con más desnivel del viaje. La Sierra de Ligonde (722 m) es el punto más alto de toda la ruta.']
},
{
  num:3, fecha:'2026-08-20', diaSemana:'jueves',
  origen:'Palas de Rei', destino:'Melide', salida:'09:30',
  km:{guia:14.5, guiaAlt:14.8, sumaTramos:14.7, gpx:15.63,
      nota:'TRES cifras distintas en el mismo PDF: 14,8 (perfil), 14,5 (timing) y 14,7 (suma de tramos: 3,5 + 5,7 + 4 + 1,5).'},
  perfilNota:'La guía usa aquí el perfil de Arzúa-Palas de Rei (28,8 km), que cubre las etapas 3 y 4 juntas. No es el perfil de esta etapa.',
  puntos:[
    {nombre:"Palas de Rei", lat:42.873330, lon:-7.868930, km:0.25, ele:569, kmGuia:0, tipo:'inicio', fiable:true, desviacion_m:21},
    {nombre:"Carballal", lat:42.872680, lon:-7.882090, km:1.49, ele:509, kmGuia:2.1, tipo:'paso', fiable:false, ajustado:439, desviacion_m:0},
    {nombre:"San Xulián do Camiño", lat:42.875510, lon:-7.907980, km:4.27, ele:454, kmGuia:3.5, tipo:'comida', fiable:true, ficha:"The Essential Coffee Home — muchas tostadas, tarta de Santiago. Iglesia románica s. XII y cementerio. Coordenada aproximada.", desviacion_m:0},
    {nombre:"Pontecampaña", lat:42.879820, lon:-7.918430, km:5.31, ele:435, kmGuia:4.7, tipo:'comida', fiable:true, ficha:"Mesón A Pontecampaña.", desviacion_m:0},
    {nombre:"Casanova", lat:42.880790, lon:-7.934540, km:6.75, ele:491, kmGuia:6, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Límite Lugo / A Coruña", lat:42.881790, lon:-7.948470, km:8.03, ele:446, kmGuia:7.2, tipo:'cultura', fiable:false, ajustado:378, ficha:"Se entra en la provincia de A Coruña, la última del Camino.", desviacion_m:0},
    {nombre:"O Leboreiro", lat:42.890130, lon:-7.968940, km:10.21, ele:439, kmGuia:9.2, tipo:'taxi', fiable:true, ficha:"Aldea medieval. Cabazo (granero-canasta para maíz). Iglesia de Santa María, románico de transición. Punto de escape: taxi desde la iglesia. Taberna de Leboreiro.", desviacion_m:0},
    {nombre:"Parque empresarial", lat:42.900280, lon:-7.986080, km:12.15, ele:460, kmGuia:11.2, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Furelos", lat:42.909050, lon:-7.999120, km:13.81, ele:408, kmGuia:13, tipo:'cultura', fiable:true, ficha:"Puente medieval. Sitio agradable junto al río.", desviacion_m:0},
    {nombre:"Melide", lat:42.914640, lon:-8.017500, km:15.63, ele:453, kmGuia:14.5, tipo:'fin', fiable:false, ajustado:620, desviacion_m:0}
  ],
  timing:[
    {hora:'8:30', texto:'Coche a Melide.'},
    {hora:'9:30', texto:'Salida de Palas de Rei.'},
    {hora:'10:15-10:45', texto:'Desayuno en San Julián de Camiño (3,5 km).'},
    {hora:'12:30', texto:'Llegada a Leboreiro (5,7 km más). Acumulado: 9,2 km.'},
    {hora:'12:30-13:00', texto:'Parada en Leboreiro. Merece la pena dar una vuelta. Se puede volver en taxi desde la Iglesia de Santa María.',
     destacado:true, dudoso:'Llegada y comienzo de la parada a la misma hora: sin margen.'},
    {hora:'14:30', texto:'Llegada a Melide (1,5 km más). Etapa corta: tarde libre para visita turística.'}
  ],
  alojamiento:{nombre:'Albergue y pensión San Antón', direccion:'Rúa San Anton',
    checkin:'13:00 albergue / 13:30 pensión', reserva:'33630', plazas:11,
    web:['https://albergueanton.com','https://pensionsananton.com'],
    nota:'Albergue: habitación de 6. Pensión: una doble y una triple. Total 11 plazas — justo para las 11 personas desde esta tarde. Las dos URLs difieren (anton vs sananton): posible errata en la primera. Sin verificar.'},
  comidas:{
    comida:['Pulpería Ezequiel — la más famosa, algo más económica','Pulpería A Garnacha — 605833268'],
    cena:['Restaurante O Codeseira — RESERVADO 20:30. Pedro Ultrich, 691605015'],
    nota:'CONFLICTO: la misa de Sancti Spiritus es a las 20:00 y la cena a las 20:30. Además A Garnacha aparece bajo "comida" pero el texto dice que está reservada para cenar: dos cenas el mismo día. El nombre baila entre O Codeseira y A Codeseira (la URL).',
    otros:'El pulpo a feira es la especialidad. Pedir cachelos. Repostería: ricos y melindres.'},
  cultura:['San Xulián do Camiño — iglesia románica s. XII y cementerio.',
    'Leboreiro — aldea medieval, cabazo, puente del s. XIV sobre el río Seco.',
    'Furelos — puente medieval.',
    'Melide: Iglesia de Sancti Spiritus / San Pedro (misa 20:00), Museo da Terra de Melide, Capilla de San Antonio — todo en la Plaza del Convento.',
    'Capilla de San Roque (s. XX) con portada románica del s. XII de la antigua San Pedro.',
    'Iglesia de Santa María — Monumento Nacional s. XII, a las afueras. SELLAR.',
    'Cruceiro del s. XIV — el más antiguo de Galicia, Rúa Cantón San Roque 38.'],
  avisos:['La guía se contradice sobre Melide: en un sitio equipara Sancti Spiritus con San Pedro, en otro dice que San Pedro es hoy la capilla de San Roque. Son edificios distintos.',
    'Alternativa apuntada en la guía: hay quien hace Palas de Rei-Arzúa directamente.',
    'Plan B por la tarde: Iglesia de Vilar de Donas, 10 min en coche, abierta 16:00-20:00.',
    'Alejandro vuela hoy desde Santiago a las 18:00. La llegada a Melide está prevista sobre las 14:30, y del centro al aeropuerto hay unos 55 km, cerca de una hora en coche. El margen es justo pero sale: conviene salir de Melide hacia las 15:15 o 15:30 para ir sin agobios.']
},
{
  num:4, fecha:'2026-08-21', diaSemana:'viernes',
  origen:'Melide', destino:'Arzúa', salida:'09:00',
  km:{guia:14.5, sumaTramos:14.1, gpx:15.44,
      nota:'El título dice 14,5 km; los tramos suman 14,1 (5,8 + 5,3 + 3).'},
  perfilNota:'Mismo problema que la etapa 3: la guía reutiliza el perfil de Arzúa-Palas de Rei (28,8 km). Las etapas 3 y 4 comparten gráfico.',
  puntos:[
    {nombre:"Melide", lat:42.911170, lon:-8.024410, km:0.89, ele:434, kmGuia:0, tipo:'inicio', fiable:true, desviacion_m:187},
    {nombre:"Santa María de Melide", lat:42.914850, lon:-8.040630, km:2.38, ele:428, kmGuia:1.8, tipo:'iglesia', fiable:true, ficha:"Monumento Nacional s. XII, a las afueras de Melide. SELLAR.", desviacion_m:0},
    {nombre:"Raido", lat:42.915800, lon:-8.055060, km:3.88, ele:463, kmGuia:3.2, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Parabispo", lat:42.917050, lon:-8.064210, km:4.70, ele:427, kmGuia:4, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Boente", lat:42.916290, lon:-8.078020, km:5.99, ele:396, kmGuia:5.8, tipo:'iglesia', horario:"7:30-14:30", fiable:true, ficha:"Iglesia de Santiago. Cafetería El Alemán, Panadería A Castellana, Albergue Boente enfrente de la iglesia.", desviacion_m:0},
    {nombre:"Castañeda", lat:42.923230, lon:-8.100650, km:8.60, ele:413, kmGuia:8, tipo:'cultura', fiable:false, ajustado:351, ficha:"Aquí hubo un horno de cal para la catedral de Santiago. Tradición: llevar una piedra desde Triacastela. Bar No Camino. COORDENADA APROXIMADA: la búsqueda devolvió A Fraga Alta, localidad vecina.", desviacion_m:0},
    {nombre:"Ribadiso da Baixo", lat:42.929920, lon:-8.153070, km:13.97, ele:388, kmGuia:11.1, tipo:'taxi', fiable:false, ajustado:933, ficha:"Puente medieval sobre el río Iso. Hospital de San Antón (s. XV) hoy albergue. Playa fluvial. Punto de escape junto al Albergue Público, a la entrada.", desviacion_m:0},
    {nombre:"Arzúa", lat:42.927770, lon:-8.159420, km:14.73, ele:390, kmGuia:14.1, tipo:'fin', fiable:true, desviacion_m:240}
  ],
  timing:[
    {hora:'8:00', texto:'Coche a Arzúa. Carretera paralela al camino, 16 minutos.'},
    {hora:'9:00', texto:'Salida de Melide.'},
    {hora:'10:30', texto:'Llegada a Boente (5,8 km).'},
    {hora:'10:30-11:00', texto:'Desayuno. Iglesia de Santiago.'},
    {hora:'12:00', texto:'Llegada a Ribadiso da Baixo (5,3 km). Buen punto para taxi: los 3 km que faltan son en subida.'},
    {hora:'12:00-13:00', texto:'Parada en Ribadiso. Desvío a la playa fluvial: a la salida del pueblo, a la derecha, unos 9 min.',
     destacado:true, dudoso:'La guía dice "creo que" y advierte de que NO está señalizado.'},
    {hora:'14:00', texto:'Llegada a Arzúa (3 km). Tarde libre. Posible misa del peregrino.'}
  ],
  alojamiento:{nombre:'Albergue San Francisco', direccion:'Rúa do Carme 7',
    checkin:'13:30', telefono:'881979304', plazas:13, web:['https://alberguesanfrancisco.com'],
    nota:'Habitación de 12 + una individual = 13 plazas para 11 personas. Sobra sitio. El correo de la guía (29 sept 2025) confirma cambio a entrada el 21 y salida el 22 de agosto.'},
  comidas:{
    comida:['El Pequeño Oasis — a 4 km de Melide, frutas, smoothies, tarta de frambuesa y de Santiago',
            'Mesón Ribadiso — junto al río, después del puente','Chiringuito de la Playa Fluvial'],
    cena:['Casa Nené — RESERVADO 20:30 para 8 pax + reserva adicional de 4 pax a las 20:00. 981 508107, https://casanene.es/',
          'Restaurante Casa Chelo — 981 50 82 48, por si queréis reservar'],
    nota:'Las dos reservas de Casa Nené suman 12, pero desde el jueves sois 11. Probablemente se hizo antes de saberlo. Conviene ajustar y unificar la hora.',
    otros:'Hay que probar el queso DO Arzúa-Ulloa.'},
  cultura:['Melide — Iglesia de Santa María.','Boente — Iglesia de Santiago, 7:30-14:30.',
    'Castañeda — hórreo.','Ribadiso — puente medieval sobre el río Iso, playa fluvial.',
    'Arzúa — convento de la Magdalena (s. XIV, en ruinas), iglesia parroquial de Santiago con Apóstol Peregrino y Matamoros. SELLAR.',
    'Fiesta del queso desde 1975.'],
  avisos:['El desvío a la playa fluvial de Ribadiso NO está señalizado y la propia guía duda de dónde está.',
    'Los últimos 3 km son en subida: +80 m desde Ribadiso. Poco según el modelo, pero se notan al final.']
},
{
  num:5, fecha:'2026-08-22', diaSemana:'sábado',
  origen:'Arzúa', destino:'O Pedrouzo', salida:'08:30',
  km:{guia:19.1, sumaTramos:19.1, gpx:19.55,
      nota:'El total y la suma de tramos del gráfico coinciden (19,1). Pero el timing solo detalla 10 + 3 km: no cierra la etapa.'},
  perfilNota:'El gráfico va de O Pedrouzo a Arzúa, al revés del sentido de marcha.',
  puntos:[
    {nombre:"Arzúa", lat:42.926240, lon:-8.163430, km:0.00, ele:385, kmGuia:0, tipo:'inicio', fiable:false, ajustado:440, desviacion_m:0},
    {nombre:"As Barrosas", lat:42.926990, lon:-8.171690, km:0.72, ele:347, kmGuia:0.9, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Preguntoño", lat:42.924120, lon:-8.184350, km:1.98, ele:334, kmGuia:2.2, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"A Peroxa", lat:42.927030, lon:-8.199490, km:3.70, ele:360, kmGuia:3.3, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Taberna Vella", lat:42.925900, lon:-8.221760, km:5.73, ele:385, kmGuia:5.2, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"A Calzada", lat:42.920190, lon:-8.237130, km:7.20, ele:379, kmGuia:5.8, tipo:'taxi', fiable:false, ajustado:445, ficha:"Bar Casa Calzada. Punto de escape: aquí se puede quedar con el taxi desde Arzúa. COORDENADA ESTIMADA: la búsqueda devolvió un bar homónimo en Santiago. El timing de la guía la sitúa a 10 km, el perfil hacia el 5,8.", desviacion_m:0},
    {nombre:"A Calle", lat:42.922220, lon:-8.256910, km:9.30, ele:377, kmGuia:7.8, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Boavista", lat:42.923410, lon:-8.266980, km:10.17, ele:367, kmGuia:9.3, tipo:'comida', fiable:true, ficha:"Café Bar Veña, el de los botellines, está entre A Calle y Boavista. OJO: la guía menciona un Veña Café Bar con la misma descripción en Ferreiros (etapa 1), a 60 km. O son dos locales homónimos, o uno está mal situado.", desviacion_m:0},
    {nombre:"Salceda", lat:42.925750, lon:-8.273780, km:10.81, ele:372, kmGuia:11.1, tipo:'comida', fiable:false, ajustado:435, ficha:"Casa Tía Teresa (más para descansar) u O Curro. Después de Salceda está el monumento al peregrino Guillermo Watt.", desviacion_m:0},
    {nombre:"O Xen", lat:42.923360, lon:-8.291300, km:12.38, ele:395, kmGuia:12.5, tipo:'paso', fiable:false, ajustado:388, desviacion_m:0},
    {nombre:"Ras", lat:42.918860, lon:-8.301090, km:13.36, ele:376, kmGuia:13.1, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"A Brea", lat:42.918500, lon:-8.307950, km:13.98, ele:366, kmGuia:13.7, tipo:'paso', fiable:true, desviacion_m:4},
    {nombre:"Rabiña", lat:42.917010, lon:-8.315430, km:14.71, ele:380, kmGuia:15, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Santa Irene", lat:42.916964, lon:-8.331945, km:16.38, ele:374, kmGuia:16, tipo:'iglesia', sellar:true, fiable:true, ficha:"Ermita de Santa Irene (SELLAR, normalmente cerrada) y fuente barroca, llamada de la eterna juventud. Desvío señalizado de 1-2 min a la izquierda, antes del núcleo. Restaurante O Ceadoiro: tortilla de patatas.", fueraDeRuta:true, desvio_m:41},
    {nombre:"O Empalme", lat:42.914610, lon:-8.347700, km:17.94, ele:309, kmGuia:17, tipo:'mirador', fiable:false, ajustado:418, ficha:"Desde aquí se atisba el horizonte hacia las costas gallegas.", desviacion_m:0},
    {nombre:"A Rúa", lat:42.909010, lon:-8.358460, km:19.22, ele:268, kmGuia:17.9, tipo:'paso', fiable:false, ajustado:380, desviacion_m:0},
    {nombre:"O Pedrouzo", lat:42.909180, lon:-8.359000, km:19.30, ele:270, kmGuia:19.1, tipo:'fin', fiable:false, ajustado:589, desviacion_m:0}
  ],
  timing:[
    {hora:'7:30', texto:'Coche a O Pedrouzo. 19 minutos.'},
    {hora:'8:30', texto:'Salida de Arzúa.'},
    {hora:'10:45', texto:'Llegada a A Calzada (10 km).'},
    {hora:'10:45-11:15', texto:'Descanso en Bar Casa Calzada. Punto de encuentro con el taxi desde Arzúa.'},
    {hora:'11:15-13:30', texto:'Café Bar Veña (el de los botellines) y monumento al peregrino Guillermo Watt tras Salceda.'},
    {hora:'13:30-14:00', texto:'Parada en Santa Irene. Ver la fuente barroca. Desvío señalizado de 1-2 min.', destacado:true},
    {hora:'14:45', texto:'Llegada a O Pedrouzo (3 km).'}
  ],
  alojamiento:{nombre:'Villa Xardín', direccion:'Rúa Nova 26', checkin:null,
    telefono:'600427167', plazas:10,
    nota:'PROBLEMA SIN RESOLVER: 5 dormitorios dobles = 10 plazas, pero sois 11. Falta una cama. Tampoco consta hora de check-in.'},
  comidas:{
    comida:['Trebol Arca — mucho ambiente de peregrino',
            'Km19 — comida rápida, mucho ambiente; por la noche bar de copas',
            'Buenas pizzerías en el pueblo; también se puede cocinar en la casa'],
    cena:['Restaurante O Ceadoiro (Cerceda) — RESERVA SOLICITADA 20:00, 981313354, rafatrasmallo@gmail.com'],
    nota:'Única cena del viaje SIN CONFIRMAR. Además la guía sitúa O Ceadoiro en Santa Irene y en Cerceda: ¿mismo restaurante o dos distintos?'},
  cultura:['Santa Irene — ermita y fuente barroca de aguas curativas.',
    'Piedra del camino con mensajes, después de Santa Irene.',
    'O Pedrouzo — Iglesia de Santa Eulalia de Arca. SELLAR. Misa 19:00.'],
  avisos:['Conflicto de horas: misa a las 19:00 en Santa Eulalia y cena a las 20:00 en Cerceda. Ajustado.',
    'O Pedrouzo tiene todos los servicios: albergues, pensiones, cajero, restaurantes, farmacia, centro de salud.',
    'El timing sitúa A Calzada a 10 km, pero el perfil de la guía la coloca hacia el km 5,8. Discrepancia sin resolver.']
},
{
  num:6, fecha:'2026-08-23', diaSemana:'domingo',
  origen:'O Pedrouzo', destino:'Santiago de Compostela', salida:'07:15',
  km:{guia:20.0, sumaTramos:20.0, sumaGrafico:19.3, gpx:20.55,
      nota:'El timing suma 20 km (10 + 5 + 5), coherente con el título. Pero los tramos del gráfico del perfil suman 19,3.'},
  perfilNota:'El gráfico va de Santiago a O Pedrouzo, al revés del sentido de marcha.',
  puntos:[
    {nombre:"O Pedrouzo", lat:42.904600, lon:-8.362400, km:0.00, ele:295, kmGuia:0, tipo:'inicio', fiable:true, desviacion_m:11},
    {nombre:"San Antón", lat:42.904020, lon:-8.376340, km:1.60, ele:286, kmGuia:1.3, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Amenal", lat:42.904520, lon:-8.391090, km:3.02, ele:260, kmGuia:3.7, tipo:'paso', fiable:false, ajustado:595, desviacion_m:0},
    {nombre:"Cimadevila", lat:42.905740, lon:-8.403670, km:4.20, ele:319, kmGuia:4, tipo:'paso', fiable:false, ajustado:757, desviacion_m:0},
    {nombre:"San Paio", lat:42.904360, lon:-8.433730, km:8.20, ele:332, kmGuia:6.7, tipo:'comida', fiable:false, ajustado:802, ficha:"La guía lista San Paio bajo \"comidas\" pero sin ningún establecimiento concreto.", desviacion_m:0},
    {nombre:"Balizas del aeropuerto", lat:42.901960, lon:-8.438460, km:8.69, ele:316, kmGuia:7.7, tipo:'paso', fiable:false, ajustado:433, desviacion_m:0},
    {nombre:"Lavacolla", lat:42.899240, lon:-8.444820, km:9.65, ele:299, kmGuia:10, tipo:'taxi', fiable:true, ficha:"Lugar donde los peregrinos se despojaban de sus ropas sucias. Punto de encuentro para hacer juntos los últimos km. También se puede venir en taxi directamente hasta aquí.", desviacion_m:0},
    {nombre:"Villamaior", lat:42.890580, lon:-8.460070, km:11.74, ele:382, kmGuia:11.5, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"TV Galicia", lat:42.890620, lon:-8.476180, km:13.30, ele:378, kmGuia:13.3, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"RTVE", lat:42.890750, lon:-8.485910, km:14.10, ele:372, kmGuia:14.1, tipo:'paso', fiable:false, ajustado:442, desviacion_m:0},
    {nombre:"Monte do Gozo", lat:42.887730, lon:-8.499980, km:16.25, ele:326, kmGuia:15.4, tipo:'mirador', fiable:true, ficha:"El mirador más importante de la ruta: primera vista de las torres de la catedral. Cafetería en el complejo. Grupo escultórico de los dos peregrinos.", desviacion_m:0},
    {nombre:"San Marcos", lat:42.886170, lon:-8.510460, km:17.19, ele:281, kmGuia:15.8, tipo:'paso', fiable:true, desviacion_m:0},
    {nombre:"Rúa de San Lázaro", lat:42.886170, lon:-8.527840, km:18.68, ele:279, kmGuia:17.3, tipo:'paso', fiable:false, ajustado:422, desviacion_m:0},
    {nombre:"Catedral de Santiago", lat:42.881140, lon:-8.544480, km:20.43, ele:275, kmGuia:20, tipo:'fin', fiable:true, ficha:"Entrada por la Puerta del Camino, Plaza de Cervantes, Plaza del Obradoiro. Misa del peregrino 19:30. Abierta 7:00-21:00.", desviacion_m:0}
  ],
  timing:[
    {hora:'6:30', texto:'Coche a Santiago. 19 minutos.'},
    {hora:'7:15', texto:'Salida de O Pedrouzo. Conviene salir temprano: se ve amanecer y no se llega tarde.'},
    {hora:'9:45', texto:'Llegada a Lavacolla (10 km). Punto de encuentro, más o menos la mitad.'},
    {hora:'9:45-10:15', texto:'Descanso y desayuno.'},
    {hora:'11:30', texto:'Llegada a Monte do Gozo (5 km). Primera vista de las torres de la catedral.', destacado:true},
    {hora:'11:30-12:00', texto:'Descanso.'},
    {hora:'13:30', texto:'Llegada a Santiago (5 km). Comer juntos y entrar juntos. Recoger la Compostela en la Oficina del Peregrino (cierra 19:00).'},
    {hora:'19:30', texto:'Misa del peregrino en la catedral. Llegar pronto: hay mucha gente.',
     dudoso:'Si la misa dura una hora, sale a las 20:30, que es la hora de la cena reservada. Sin margen.'}
  ],
  alojamiento:{nombre:'Pensión da Sela', direccion:'Rúa das Fontiñas 82',
    checkin:null, telefono:null, plazas:12,
    nota:'6 habitaciones dobles = 12 plazas para 11 personas. Sin teléfono ni hora de check-in en la guía.'},
  comidas:{
    comida:['Mesón Cestaños — junto al parque, buen punto de espera. Aprovechar para ver el Mirador de la catedral'],
    cena:['Parrillada Galaico Argentina Milongas — RESERVADO 20:30, 881 820 820, https://milongasparrilada.com. Junto al Parque de la Alameda',
          'Restaurante Anoiesa — hay que llamar, sin disponibilidad online. 981565081'],
    nota:'Choca con la misa de 19:30. Hay que decidir: misa completa o cena puntual.'},
  cultura:['Lavacolla — donde los peregrinos se lavaban antes de entrar en Santiago.',
    'Monte do Gozo — colina desde donde se intuye la catedral.',
    'Catedral de Santiago — Praza do Obradoiro. Abierta 7:00-21:00.'],
  avisos:['La sección "Pueblos" de esta etapa está vacía en la guía: solo pone "Concello de O Pino" sin texto.',
    'Las comidas de San Paio, Lavacolla y Monte do Gozo aparecen sin ningún establecimiento asociado.',
    'Los dos coches quedan en Santiago. Confirmar si hace falta traslado de vuelta a Sarria.']
}
];

const GRUPO = {total:12, desde:{fecha:'2026-08-20', momento:'tarde', total:11}};
/* Cuántos DUERMEN la noche de esa fecha (para plazas de alojamiento). */
function tamanoGrupo(f){ return f >= GRUPO.desde.fecha ? GRUPO.desde.total : GRUPO.total; }

/* Cuántos CAMINAN esa etapa. El grupo mengua por la tarde del 20 (Alejandro
   vuela tras llegar a Melide), así que ese día todavía caminan todos: la
   reducción de día empieza al día siguiente. Con 'mañana' empezaría el mismo
   día. Por eso las etapas 1-3 son de 12 y las 4-6 de 11, aunque la noche del
   20 ya duerman 11. */
function grupoCamina(f){
  const yaMenos = GRUPO.desde.momento === 'tarde'
    ? f > GRUPO.desde.fecha
    : f >= GRUPO.desde.fecha;
  return yaMenos ? GRUPO.desde.total : GRUPO.total;
}

/* ============================================================
   DECISIONES PENDIENTES DEL GRUPO
   Cosas del viaje sin cerrar. El `estado` es la única verdad
   compartida: se edita AQUÍ (a mano, en el repo) cuando algo se
   resuelve de verdad. No se guarda en localStorage a propósito:
   si cada móvil guardara lo suyo, alguien marcaría "resuelto" y
   creería que los demás lo ven, y no. Aquí todos ven lo mismo.
   Valores de `estado`: 'pendiente' | 'resuelto'.
   `fecha` es la fecha ISO a la que afecta (para ordenar); `cuando`
   es el texto que se muestra.
   ============================================================ */
const DECISIONES = [
  {
    id:'villa-xardin', titulo:'Villa Xardín: falta una cama',
    lugar:'O Pedrouzo', fecha:'2026-08-22', cuando:'Noche del sábado 22 de agosto',
    que:'La reserva de Villa Xardín es de 10 plazas y sois 11 personas. Falta una cama.',
    estado:'pendiente',
    wa:'Villa Xardín (O Pedrouzo, noche del 22 ago): la reserva es de 10 plazas y somos 11. Falta una cama, ¿cómo lo resolvemos?'
  },
  {
    id:'ceadoiro', titulo:'Cena en O Ceadoiro sin confirmar',
    lugar:'Cerceda', fecha:'2026-08-22', cuando:'Cena del sábado 22 de agosto',
    que:'La cena en O Ceadoiro (Cerceda) está solicitada pero sin confirmar. Es la única cena del viaje que sigue sin cerrar.',
    estado:'pendiente',
    wa:'Cena en O Ceadoiro (Cerceda, 22 ago): está solicitada pero sin confirmar, es la única que queda. ¿Alguien puede llamar para cerrarla?'
  },
  {
    id:'casa-nene', titulo:'Casa Nené: dos reservas que no cuadran',
    lugar:'Arzúa', fecha:'2026-08-21', cuando:'Cena del viernes 21 de agosto',
    que:'Casa Nené tiene dos reservas, de 8 y de 4 personas (12 en total), a horas distintas: 20:00 y 20:30. Desde el jueves sois 11. Hay que unificarlas en una sola hora para 11.',
    estado:'pendiente',
    wa:'Casa Nené (Arzúa, 21 ago): hay dos reservas (8 + 4 = 12) a las 20:00 y 20:30, pero somos 11. ¿Las unificamos en una sola hora para 11?'
  },
  {
    id:'santiago-misa-cena', titulo:'Santiago: la misa y la cena se solapan',
    lugar:'Santiago', fecha:'2026-08-23', cuando:'Noche del domingo 23 de agosto',
    que:'La misa del peregrino es a las 19:30 y la cena en Milongas a las 20:30. No caben las dos: hay que elegir o mover una.',
    estado:'pendiente',
    wa:'Santiago (23 ago): la misa del peregrino es a las 19:30 y la cena en Milongas a las 20:30, no caben las dos. ¿Qué preferís, o movemos alguna?'
  },
  {
    id:'a-lareira', titulo:'Mesón A Lareira: falta comunicar el menú',
    lugar:'Palas de Rei', fecha:'2026-08-12', cuando:'Fecha límite: antes del 12 de agosto de 2026',
    que:'Hay que comunicar a Mesón A Lareira qué va a cenar cada uno. Lo piden con una semana de antelación.',
    estado:'pendiente',
    wa:'Mesón A Lareira (Palas de Rei): hay que decirles antes del 12 de agosto qué cena cada uno. ¿Vamos apuntando los platos?'
  }
];

/* ============================================================
   EQUIPAJE — qué meter en la mochila
   Transcripción del checklist de la tita Lucila (PDF «Checklist
   maleta»). Los textos son los suyos; aquí solo se han separado en
   items marcables.

   Qué se ha cambiado respecto al papel, y por qué (que quede dicho):
   - La guía trae TRES apartados: «Ropa», «Calzado» y «Otras cosas».
     «Otras cosas» se ha partido en dos —«Equipo» y «Botiquín y
     aseo»— porque de una tacada eran diecinueve líneas y repasarlas
     en el móvil se hacía largo. Ningún item se ha quitado ni añadido.
   - Las líneas que juntaban varias cosas con comas se han separado
     en items sueltos, para poder marcarlos uno a uno: el botiquín
     («vaselina, apósitos, compeed, antiinflamatorios, gel, tiritas»),
     «pijama, ropita interior», «crema solar, bálsamo labial»,
     «tapones, antifaz» y la línea de la bolsa de calcetines con las
     pinzas de tender.
   - Lo que NO está en su papel va en un grupo aparte, marcado
     `extra:true` («Además de la guía»). Se comprobó buscando en el
     texto del PDF: «cargador», «batería», «DNI» y «documentación»
     no aparecen ni una vez. Ese grupo se ve claramente separado
     para que nunca se le atribuya a la tita Lucila algo que no
     escribió. Los cuatro primeros grupos son suyos y solo suyos.

   Campos: `uds` es la cantidad que dice la guía; `nota` es su
   aclaración. `extra:true` en un grupo = no viene de la guía.
   Los `id` se guardan en localStorage, así que cambiarlos borra
   las marcas de quien ya haya hecho la maleta.
   ============================================================ */
const EQUIPAJE = [
  {
    id:'ropa', titulo:'Ropa', items:[
      {id:'ropa-camisetas',  texto:'Camisetas de deporte o camisas para caminar', uds:'2-3'},
      {id:'ropa-calcetines', texto:'Calcetines sin costura', uds:'2-3 pares', nota:'Marcados'},
      {id:'ropa-pantalones', texto:'Pantalones que no rocen', uds:'1-2 cortos y uno medio o largo',
         nota:'Los cortos, más culotes'},
      {id:'ropa-sudadera',   texto:'Sudadera con cremallera o cortaviento', nota:'Mejor con capucha'},
      {id:'ropa-banador',    texto:'Bañador'},
      {id:'ropa-pijama',     texto:'Pijama'},
      {id:'ropa-interior',   texto:'Ropa interior'},
      {id:'ropa-tardes',     texto:'Ropa para las tardes', nota:'Incluye rebeca, chaleco o chaquetita'},
      {id:'ropa-panuelo',    texto:'Pañuelito para el cuello', nota:'Por si hace frío'}
    ]
  },
  {
    id:'calzado', titulo:'Calzado', items:[
      {id:'calz-senderismo', texto:'Zapatos de senderismo', nota:'Ya usados'},
      {id:'calz-chanclas',   texto:'Chanclas de plástico para la ducha'},
      {id:'calz-deporte',    texto:'Zapatillas de deporte', nota:'Por si acaso'},
      {id:'calz-sandalias',  texto:'Sandalias para las tardes', nota:'Calzado abierto y plano'},
      {id:'calz-casa',       texto:'Zapatillas de estar en casa'}
    ]
  },
  {
    id:'equipo', titulo:'Equipo', de:'Otras cosas', items:[
      {id:'eq-mochilita',  texto:'Mochilita pequeña', nota:'Para el agua y lo de cada día'},
      {id:'eq-rinonera',   texto:'Riñonera', nota:'Para el móvil, las gafas de sol, el dinero y demás'},
      {id:'eq-gorra',      texto:'Gorra o sombrero'},
      {id:'eq-impermeable',texto:'Impermeable', nota:'De los chinos o del Decathlon'},
      {id:'eq-tapones',    texto:'Tapones'},
      {id:'eq-antifaz',    texto:'Antifaz'},
      {id:'eq-bastones',   texto:'Bastones para caminar'},
      {id:'eq-cascos',     texto:'Cascos para oír música'},
      {id:'eq-saco',       texto:'Saco de dormir'},
      {id:'eq-bolsa',      texto:'Bolsa para meter los calcetines en la lavadora o secadora',
         nota:'Avisa la tita Lucila: al final no se usa'},
      {id:'eq-pinzas',     texto:'Pinzas de tender', uds:'2-3', nota:'Aunque suele haber'},
      {id:'eq-dinero',     texto:'Dinero en efectivo'}
    ]
  },
  {
    id:'botiquin', titulo:'Botiquín y aseo', de:'Otras cosas', items:[
      {id:'bot-vaselina', texto:'Vaselina', nota:'Con guantes para ponérnosla'},
      {id:'bot-aposito',  texto:'Apósitos cuadrados'},
      {id:'bot-compeed',  texto:'Barrita Compeed'},
      {id:'bot-antiinf',  texto:'Antiinflamatorios'},
      {id:'bot-gel',      texto:'Gel hidroalcohólico'},
      {id:'bot-tiritas',  texto:'Tiritas'},
      {id:'bot-solar',    texto:'Crema solar'},
      {id:'bot-labial',   texto:'Bálsamo labial'},
      {id:'bot-aseo',     texto:'Aseo personal'},
      {id:'bot-toalla',   texto:'Toalla de microfibra', nota:'Una grande y otra de la cara'},
      {id:'bot-tarjeta',  texto:'Tarjeta sanitaria'}
    ]
  },
  {
    /* ESTE GRUPO NO ES DE LA GUÍA. Lo pidió el grupo al repasar la lista:
       hacen falta y en el PDF no están. Va aparte y marcado para que se
       vea de un vistazo qué escribió la tita Lucila y qué no. */
    id:'extra', titulo:'Además de la guía', extra:true, items:[
      {id:'ex-credencial', texto:'Credencial del peregrino',
         nota:'Sin ella no hay sellos ni Compostela'},
      {id:'ex-dni',        texto:'DNI o pasaporte'},
      {id:'ex-cargador',   texto:'Cargador del móvil'},
      {id:'ex-bateria',    texto:'Batería portátil', nota:'Un power bank, que el móvil hace de mapa todo el día'},
      {id:'ex-gafas',      texto:'Gafas de sol',
         nota:'La guía las nombra dentro de la riñonera, no como cosa aparte'},
      {id:'ex-banco',      texto:'Tarjeta bancaria'}
    ]
  }
];

/* Cuántas cosas hay en total en la lista. */
function totalEquipaje(){
  return EQUIPAJE.reduce(function(n, g){ return n + g.items.length; }, 0);
}

/* ============================================================
   PERSONAS — quién juega a los Retos
   Lista fija del grupo. Sin contraseña: solo sirve para saber de quién
   es la puntuación en este móvil. Se guarda en 'lolitas2026-persona'.
   ============================================================ */
const PERSONAS = ['Lola','Elena','Juan Martínez','Alejandro','Juanje','Julio',
  'Lucila','Juan Luque','Lucilita','Sofía','Rocío','Pablo'];

/* ============================================================
   RETOS — cuestionario del Camino
   `etapa: 0` es "Prepara el Camino", siempre disponible. `etapa: 1..6` son
   las tandas de cada etapa (cuatro preguntas cada una), que se desbloquean
   el día de la etapa a partir de las 16:00 (ver `retoDesbloqueado`).
   Mientras están bloqueadas se muestra solo la `pista`, nunca la pregunta.

   `correcta` es el índice (0-3) dentro de `opciones`.
   Solo hay UNA oportunidad por pregunta.

   Fuentes verificadas en julio de 2026: Oficina del Peregrino,
   caminodesantiago.gal, Xacopedia, Centro Virtual Cervantes, Google Arts &
   Culture con la Xunta, y guías locales de Portomarín para la leyenda de la
   escalinata.
   ============================================================ */
const RETOS = [

  /* ---------- BLOQUE 1 · Prepara el Camino (siempre disponible) ---------- */
  {
    id:1, etapa:0,
    pregunta:'¿Qué exige la Catedral para dar la Compostela a quien hace los últimos 100 km a pie?',
    opciones:['Un sello al día','Dos sellos al día','Tres sellos al día','Un sello por localidad'],
    correcta:1,
    explicacion:'Dos sellos diarios en los últimos 100 km a pie, y en los últimos 200 en bicicleta. Valen albergues, bares, iglesias, ayuntamientos y hasta oficinas de Correos.'
  },
  {
    id:2, etapa:0,
    pregunta:'La Compostela se recoge en la Oficina del Peregrino. ¿Cuánto cuesta?',
    opciones:['3 euros','5 euros','Es gratuita','Depende de los kilómetros'],
    correcta:2,
    explicacion:'Gratuita. Lo que cuesta 3 euros es el Certificado de Distancia, opcional, que detalla los kilómetros exactos.'
  },
  {
    id:3, etapa:0,
    pregunta:'Las flechas amarillas parecen antiquísimas. ¿De cuándo son?',
    opciones:['Del siglo XII, aparecen en el Codex Calixtinus','De los años 80 del siglo XX','De la Edad Media tardía','Del Año Santo de 1965'],
    correcta:1,
    explicacion:'Las pintó Elías Valiña, párroco de O Cebreiro, a partir de 1984, cuando el Camino estaba casi olvidado. Recorrió personalmente todo el Camino Francés marcándolo. La vieira sí es medieval: aparece en el Codex del siglo XII.'
  },
  {
    id:4, etapa:0,
    pregunta:'Elías Valiña, el cura que inventó las flechas, tenía una conexión con vuestro punto de partida. ¿Cuál?',
    opciones:['Nació en Sarria','Está enterrado en Sarria','Fue párroco de Sarria antes que de O Cebreiro','Pintó su primera flecha allí'],
    correcta:0,
    explicacion:'Nació en Sarria en 1929 y murió en 1989. Empezáis el Camino en el pueblo del hombre al que le debéis poder seguirlo sin perderos.'
  },
  {
    id:5, etapa:0,
    pregunta:'¿Por qué son amarillas las flechas?',
    opciones:['Es el color litúrgico de Santiago','Valiña aprovechó pintura sobrante de señalizar carreteras','Es el color del Vaticano','Porque se ve mejor con niebla'],
    correcta:1,
    explicacion:'La versión más extendida dice que aprovechó pintura sobrante de unos operarios de carreteras. Un sobrino cuenta otra: que vio en Francia que el amarillo se usaba para rutas de montaña y lo copió. Las dos historias conviven.'
  },
  {
    id:6, etapa:0,
    pregunta:'La vieira probaba que habías llegado a Santiago. ¿Por qué?',
    opciones:['Solo se pescaban en la ría de Arousa','Su venta estaba prohibida fuera de Santiago','Las entregaba el obispo','Llevaban grabada la fecha'],
    correcta:1,
    explicacion:'Era el premio por completar la peregrinación, y venderlas en otro sitio estaba prohibido. En Santiago había un barrio, Os Concheiros, donde el gremio las vendía.'
  },
  {
    id:7, etapa:0,
    pregunta:'¿Desde dónde hay que empezar como mínimo para que la Compostela sea válida yendo a pie?',
    opciones:['Sarria o Barbadelo','Ponferrada','Portomarín','León'],
    correcta:0,
    explicacion:'La Oficina fija Sarria o Barbadelo en el Camino Francés a pie, porque son los últimos 100 km. Ponferrada es el mínimo en bicicleta, que necesita 200.'
  },
  {
    id:8, etapa:0,
    pregunta:'¿Cuánto pesa el Botafumeiro?',
    opciones:['25 kg','53 kg','80 kg','120 kg'],
    correcta:1,
    explicacion:'53 kg y metro y medio de alto. Hacen falta ocho tiraboleiros para moverlo. Cuelga a 20 metros.'
  },
  {
    id:9, etapa:0,
    pregunta:'¿Dónde se conserva el original del Codex Calixtinus?',
    opciones:['Biblioteca Nacional de Madrid','La catedral de Santiago','La abadía de Cluny','El Vaticano'],
    correcta:1,
    explicacion:'En la catedral de Santiago. Lo impulsó el arzobispo Gelmírez. Su libro V es la primera guía del peregrino de la historia.'
  },
  {
    id:10, etapa:0,
    pregunta:'¿Puede conseguir la Compostela alguien que no sea creyente?',
    opciones:['No, hace falta ser católico practicante','Sí, basta declarar motivación religiosa, espiritual o de búsqueda','Solo en Año Santo','Solo asistiendo a la misa del peregrino'],
    correcta:1,
    explicacion:'Se admite motivación religiosa, espiritual o «de búsqueda». Quien va por deporte puede pedir el Certificado de Distancia, que no exige motivación.'
  },

  /* ---------- BLOQUE 2 · Lo que has visto hoy ---------- */

  /* Etapa 1 · Sarria → Portomarín */
  {
    id:11, etapa:1,
    pista:'La iglesia de Portomarín no siempre estuvo donde está',
    pregunta:'La iglesia de San Nicolás de Portomarín tiene una historia poco corriente. ¿Cuál?',
    opciones:['Se construyó en una noche, según la leyenda','Se desmontó piedra a piedra y se trasladó','Nunca se terminó','Está sobre un castro celta'],
    correcta:1,
    explicacion:'Al construirse el embalse de Belesar en 1963, el Portomarín antiguo quedó bajo el Miño. La iglesia del siglo XII se numeró piedra a piedra y se reconstruyó arriba. Aún se ven las marcas de numeración en los sillares.'
  },
  {
    id:12, etapa:1,
    pista:'Cuidado con pararse a mitad de la escalinata',
    pregunta:'La escalinata de entrada a Portomarín tiene una leyenda. ¿Cuál?',
    opciones:['Quien la sube sin parar tendrá suerte en el amor','Quien se para a mirar atrás queda maldito en el amor','Hay que subirla descalzo','Quien cuenta mal los escalones no llega a Santiago'],
    correcta:1,
    explicacion:'Son 82 escalones y 17 metros, construidos con un arco del antiguo puente medieval rescatado antes de la inundación. La leyenda dice que quien se detiene a mitad y mira atrás sufrirá años de mala fortuna en el amor. Así que subidla del tirón.'
  },
  {
    id:13, etapa:1,
    pista:'El nombre de Ferreiros no es casual',
    pregunta:'¿A qué se dedicaban en Ferreiros, y de ahí su nombre?',
    opciones:['Eran herreros: claveteaban el calzado de los peregrinos','Fabricaban campanas','Extraían hierro de una mina','Forjaban cruces de cruceiros'],
    correcta:0,
    explicacion:'Ferreiros significa «herreros» en gallego. Aquí se claveteaba el calzado de los peregrinos y se herraban sus caballerías: un servicio de primera necesidad cuando se caminaban cientos de kilómetros.'
  },
  {
    id:14, etapa:1,
    pista:'El mojón del km 100 no es lo que parece',
    pregunta:'Entre Sarria y Portomarín pasaréis el mojón del km 100. Pero hay una trampa. ¿Cuál?',
    opciones:['Hay dos mojones distintos y el clásico ya no es el oficial','Está a 99 km reales','Se cambió de sitio en 2010','No existe, es una leyenda'],
    correcta:0,
    explicacion:'El clásico, el de las fotos, está entre Brea y Morgade. Pero el oficial actual está más adelante, cerca de A Pena, pasado Ferreiros. Podéis fotografiaros en los dos.'
  },

  /* Etapa 2 · Portomarín → Palas de Rei */
  {
    id:15, etapa:2,
    pista:'Hay un poblado muy antiguo a diez minutos del Camino',
    pregunta:'El castro de Castromaior, ¿de qué época es?',
    opciones:['Romana, siglo I','Medieval, siglo XII','Prerromana, más de 2400 años','Visigoda, siglo VII'],
    correcta:2,
    explicacion:'Poblado celta prerromano, de los mejor conservados de Galicia. Visita libre y gratuita.'
  },
  {
    id:16, etapa:2,
    pista:'Un cruceiro con cuatro símbolos en la base y una sorpresa arriba',
    pregunta:'En el cruceiro de Lameiros, la base tiene cuatro elementos esculpidos. ¿Cuáles?',
    opciones:['Los cuatro evangelistas','Martillo, clavos, espinas y calaveras','Las cuatro estaciones','Los cuatro caminos'],
    correcta:1,
    explicacion:'Los símbolos de la Pasión. En la cruz, en cambio, hay un relieve de la maternidad. Muerte abajo y vida arriba, en la misma piedra, desde 1670.'
  },
  {
    id:17, etapa:2,
    pista:'Hoy pasáis por el techo del viaje',
    pregunta:'Esta etapa cruza el punto más alto de todo vuestro Camino. ¿Dónde está?',
    opciones:['Gonzar','La Sierra de Ligonde','Portomarín','Palas de Rei'],
    correcta:1,
    explicacion:'La Sierra de Ligonde, a 722 metros. Desde ahí todo es más bajo hasta Santiago, que está a 260.'
  },
  {
    id:18, etapa:2,
    pista:'En Ligonde hay algo que no se ve en otras aldeas',
    pregunta:'En Ligonde se conserva algo poco habitual junto al Camino. ¿Qué es?',
    opciones:['Un cementerio de peregrinos','Un pozo de nieve medieval','Una muralla romana','Un mercado de ganado del siglo XV'],
    correcta:0,
    explicacion:'Un cementerio de peregrinos, anexo a un desaparecido hospital de la Orden de Santiago. Los que no llegaban a Compostela se quedaban ahí.'
  },

  /* Etapa 3 · Palas de Rei → Melide */
  {
    id:19, etapa:3,
    pista:'Hay algo en Leboreiro que parece una cesta gigante',
    pregunta:'En Leboreiro hay un cabazo. ¿Qué es?',
    opciones:['Un pozo comunal cubierto','Un granero redondo de varas entrelazadas, para el maíz','Un horno de pan de la aldea','Una capilla sin campanario'],
    correcta:1,
    explicacion:'Un hórreo primitivo de ramas entrelazadas y techo de paja, sobre base de piedra. Se considera el precursor del hórreo gallego de granito. El de Leboreiro es el más famoso del Camino.'
  },
  {
    id:20, etapa:3,
    pista:'El nombre de Leboreiro viene de un animal',
    pregunta:'El Codex llamaba a Leboreiro «Campus Leporarius». ¿Por qué?',
    opciones:['Por la abundancia de liebres','Por los campos de lino','Por una batalla','Por un antiguo leprosario'],
    correcta:0,
    explicacion:'Leporarius viene de lepus, liebre en latín.'
  },
  {
    id:21, etapa:3,
    pista:'Melide guarda un récord de Galicia',
    pregunta:'Melide es famosa por el pulpo, pero guarda un récord. ¿Cuál?',
    opciones:['El albergue más antiguo del Camino','El cruceiro más antiguo de Galicia','La iglesia románica más grande','El puente medieval más largo'],
    correcta:1,
    explicacion:'El cruceiro de Melide, del siglo XIV, está considerado el más antiguo de Galicia. Junto a la capilla de San Roque.'
  },
  {
    id:22, etapa:3,
    pista:'Un cruce de caminos, literalmente',
    pregunta:'En Melide confluyen dos Caminos. ¿Cuáles?',
    opciones:['El Francés y el Portugués','El Francés y el Primitivo','El Francés y el del Norte','El Francés y el Inglés'],
    correcta:1,
    explicacion:'Aquí se une el Camino Primitivo, el que viene de Oviedo, considerado el más antiguo de todos. A partir de Melide caminaréis con peregrinos que llevan otra ruta a las espaldas.'
  },

  /* Etapa 4 · Melide → Arzúa */
  {
    id:23, etapa:4,
    pista:'En Castañeda los peregrinos dejaban algo que traían de lejos',
    pregunta:'En Castañeda hubo hornos de cal medievales. ¿Qué tenían que ver con los peregrinos?',
    opciones:['Traían piedra caliza desde Triacastela para la catedral','Cocían su pan','Blanqueaban sus ropas','Fabricaban conchas'],
    correcta:0,
    explicacion:'Era tradición cargar una piedra caliza desde Triacastela, a más de 50 km, hasta los hornos de Castañeda. La cal se usaba en las obras de la catedral. Cada peregrino aportaba su piedra al edificio.'
  },
  {
    id:24, etapa:4,
    pista:'En Arzúa hay que probar algo, y no es el pulpo',
    pregunta:'Arzúa es capital de un queso con Denominación de Origen. ¿Cuál?',
    opciones:['Tetilla','San Simón da Costa','Arzúa-Ulloa','Cebreiro'],
    correcta:2,
    explicacion:'Leche entera de vaca, elaborado en toda la comarca. Desde 1975 se celebra allí la fiesta del queso.'
  },
  {
    id:25, etapa:4,
    pista:'El albergue de Ribadiso no siempre fue un albergue',
    pregunta:'En Ribadiso hay un edificio con una historia larga. ¿Cuál es?',
    opciones:['Fue un molino harinero','Fue un hospital de peregrinos del siglo XV','Fue una casa de postas','Fue una fábrica de lino'],
    correcta:1,
    explicacion:'El Hospital de San Antón de Ponte de Ribadiso, del siglo XV, rehabilitado como albergue público. Sigue haciendo lo mismo que hace 500 años: acoger peregrinos.'
  },
  {
    id:26, etapa:4,
    pista:'Los últimos kilómetros de hoy tienen truco',
    pregunta:'La etapa termina con tres kilómetros que la guía avisa que se notan. ¿Por qué?',
    opciones:['Son de asfalto','Son en subida','No hay sombra','Están mal señalizados'],
    correcta:1,
    explicacion:'De Ribadiso a Arzúa se suben unos 80 metros en 3 km. No es mucho sobre el papel, pero al final de la etapa se nota.'
  },

  /* Etapa 5 · Arzúa → O Pedrouzo */
  {
    id:27, etapa:5,
    pista:'Hay una fuente con fama de milagrosa antes de Santa Irene',
    pregunta:'La fuente barroca de Santa Irene tiene fama. ¿De qué?',
    opciones:['De no secarse nunca','De ser curativa: la llaman de la eterna juventud','De marcar la mitad del Camino','De tener el agua más fría de Galicia'],
    correcta:1,
    explicacion:'La guía de la tita Lucila la recoge como «fuente de la eterna juventud», junto a la ermita de Santa Irene, en un desvío corto señalizado antes del núcleo.'
  },
  /* El monumento a Guillermo Watt sale de la guía de la tita Lucila y de lo que
     se cuenta del sitio. Se marcó como sin verificar, y quien mantiene la guía
     lo dio por bueno (julio 2026), así que se deja como dato firme. */
  {
    id:28, etapa:5,
    pista:'Un monumento con unas botas, después de Salceda',
    pregunta:'Después de Salceda hay un monumento a Guillermo Watt. ¿Qué recuerda?',
    opciones:['Al ingeniero de la N-547','A un peregrino que murió ahí','Al fundador del primer albergue','A un santo local'],
    correcta:1,
    explicacion:'Memorial a un peregrino que falleció a pocos kilómetros de Santiago, con sus botas en bronce sobre la piedra. Un recordatorio de que no todo el mundo llega.'
  },
  {
    id:29, etapa:5,
    pista:'Hay un bar que hay que ver aunque no tengáis sed',
    pregunta:'Entre A Calle y Boavista hay un bar muy peculiar. ¿Por qué?',
    opciones:['Está dentro de un hórreo','Está lleno de botellines firmados por peregrinos','Solo abre para peregrinos','Lo lleva un antiguo peregrino alemán'],
    correcta:1,
    explicacion:'El Café Bar Veña, con miles de botellines firmados por peregrinos de todo el mundo. La guía de la tita Lucila lo marca con signos de exclamación.'
  },
  {
    id:30, etapa:5,
    pista:'El pueblo de esta noche tiene dos nombres',
    pregunta:'O Pedrouzo aparece en los mapas con dos nombres. ¿Cuál es el otro?',
    opciones:['Arca','Cerceda','O Pino','Amenal'],
    correcta:0,
    explicacion:'O Pedrouzo es el núcleo, Arca la parroquia, y O Pino el concello. Los tres aparecen indistintamente en señales y guías, lo que despista bastante.'
  },

  /* Etapa 6 · O Pedrouzo → Santiago */
  {
    id:31, etapa:6,
    pista:'El nombre de Lavacolla es más explícito de lo que parece',
    pregunta:'Lavacolla aparece en el Codex como «Lavamentula». ¿Qué hacían allí los peregrinos?',
    opciones:['Lavaban solo la ropa','Se lavaban el cuerpo entero, partes íntimas incluidas','Bebían el agua como rito','Dejaban una prenda de ofrenda'],
    correcta:1,
    explicacion:'El Codex es muy explícito. Dice que los peregrinos franceses se quitaban la ropa y se lavaban «no solo sus partes, sino la suciedad de todo el cuerpo», por amor al Apóstol. Lavamentula viene de ahí: era la purificación antes de entrar en la ciudad del Apóstol, y de paso llegaban presentables.'
  },
  {
    id:32, etapa:6,
    pista:'Desde Monte do Gozo pasa algo por primera vez',
    pregunta:'¿Por qué se llama Monte do Gozo?',
    opciones:['Desde allí se ven por primera vez las torres de la catedral','Ahí se celebraba con vino','Por una ermita del Gozo','Ahí acababan los peajes medievales'],
    correcta:0,
    explicacion:'Tras semanas o meses de camino, allí aparecía por fin la meta. El primero del grupo en verlas era proclamado «rey» de la peregrinación, y de ahí vienen apellidos como Leroy o King.'
  },
  {
    id:33, etapa:6,
    pista:'Vuestro nombre en la Compostela os va a sorprender',
    pregunta:'La Compostela lleva vuestro nombre, pero no como lo escribís. ¿Cómo aparece?',
    opciones:['En gallego','Latinizado','En mayúsculas','Con el nombre del santo del día'],
    correcta:1,
    explicacion:'El certificado está en latín y el nombre se latiniza. Alejandro sale como «Alexandrum», Elena como «Helenam». Lola tendrá que ver qué le ponen.'
  },
  {
    id:34, etapa:6,
    pista:'Los kilómetros nunca cuadran, y hay motivo',
    pregunta:'Habréis caminado 122 km según el GPS, pero la guía dice 115. ¿Por qué esa diferencia?',
    opciones:['El GPS se equivoca en el bosque','El GPS sigue cada curva y la guía redondea en línea más recta','La guía cuenta solo caminos oficiales','Los mojones están mal colocados'],
    correcta:1,
    explicacion:'Un GPS registra cada zigzag del sendero, mientras que las distancias de guía se miden de forma más esquemática. Un 6 % de diferencia es lo normal. Los dos datos son correctos: miden cosas distintas.'
  }
];
