# 01 — Modelo de Negocio y Estrategia

## 1. Visión y Propósito del Negocio

**Oficios Express** nace para transformar el mercado informal e ineficiente de servicios de mantenimiento, refacción y urgencias hogareñas en la ciudad de **Rosario, Santa Fe**.

### Misión
Democratizar el acceso inmediato y transparente a trabajadores de oficios confiables y cercanos a cada vecino de Rosario, brindando a los profesionales una herramienta digital sin barreras de entrada que aumente su caudal de trabajo y rentabilidad.

### Visión
Convertirse en el estándar local y referente indiscutido en la contratación de servicios de oficio en el Gran Rosario y expandirse progresivamente hacia los principales polos urbanos del interior de Argentina (Córdoba, Santa Fe Capital, Mendoza).

---

## 2. Business Model Canvas

```
+---------------------------------------------------------------------------------------------------------+
| ASOCIACIONES CLAVE     | ACTIVIDADES CLAVE       | PROPUESTAS DE VALOR    | RELACIONES CLIENTES   | SEGMENTOS DE CLIENTES   |
|                        |                         |                        |                       |                         |
| - Ferreterías y        | - Desarrollo de software| - Para Clientes:       | - Autoservicio ágil   | 1. Familias y vecinos   |
|   corralones locales   |   y optimización UX     |   Búsqueda sin fricción| - Transparencia y     |    de Rosario con       |
| - Distribuidores de    | - Verificación de pros  |   por barrio/distrito, |   contacto humano por |    urgencias o reformas |
|   materiales (sanitarios| - Soporte a usuarios   |   diagnóstico previo   |   WhatsApp            |                         |
|   y electricidad)      | - Marketing local y SEO |   con fotos, contacto  | - Soporte directo     | 2. Trabajadores de      |
| - Colegios técnicos y  |   geolocalizado en RSO  |   directo sin comisión |                       |    oficios (plomeros,   |
|   centros de formación |                         |   en el MVP.           |                       |    electricistas, etc.) |
|   profesional          |                         |                        |                       |    independientes       |
| - Redes vecinales      |                         | - Para Profesionales:  |                       |                         |
|                        |                         |   Leads cualificados,  |                       | 3. Inmobiliarias y      |
|                        |                         |   control total de su  |                       |    administraciones     |
|                        |                         |   agenda, cero costos  |                       |    de consorcios        |
|                        |                         |   en etapa inicial.    |                       |    (Fase B2B futura)    |
|------------------------+-------------------------+------------------------+-----------------------+-------------------------|
| RECURSOS CLAVE                                   | CANALES                                                                  |
|                                                  |                                                                          |
| - Plataforma web Next.js progresiva mobile-first | - Búsqueda web móvil orgánica (SEO local de Rosario)                      |
| - Base de datos de profesionales categorizados   | - Recomendación directa / Boca a boca digital                             |
| - Integración de canal WhatsApp Business         | - QR y afiches en corralones, ferreterías y comercios barriales         |
| - Marca y confianza barrial                      | - Campañas hiperlocales en Instagram / Meta Ads segmentadas por distrito  |
+--------------------------------------------------+--------------------------------------------------------------------------+
| ESTRUCTURA DE COSTOS                             | FUENTES DE INGRESOS                                                      |
|                                                  |                                                                          |
| - Infraestructura cloud y base de datos          | - Fase 1 (MVP Actual): 100% gratuito (adquisición de masa crítica y      |
|   (Vercel, Neon Postgres, almacenamiento CDN)    |   validación de liquidez del marketplace de dos puntas).                 |
| - Costos de verificación e identidad             | - Fase 2: Suscripción freemium para profesionales (destacados en zona,   |
| - Presupuesto de marketing y adquisición digital |   insignia verificada, cupo ampliado de solicitudes prioritarias).       |
| - Soporte operativo y moderación comunitaria     | - Fase 3: Tarifa por lead cerrado o patrocinio de proveedores            |
|                                                  |   (marcas de herramientas y corralones en Rosario).                      |
+---------------------------------------------------------------------------------------------------------+
```

---

## 3. Análisis de Oportunidad de Mercado (Rosario)

### Macroentorno y Demografía
- **Población del Gran Rosario**: Aproximadamente 1.350.000 habitantes (~400.000 hogares).
- **División distrital**: 6 distritos oficiales (Centro, Norte, Noroeste, Oeste, Sudoeste, Sur). Cada distrito tiene dinámicas sociodemográficas y tipos de vivienda diferentes (Centro/Norte: alta densidad de edificios y propiedad horizontal; Oeste/Sur: casas unifamiliares, reformas estructurales, parques y jardines).
- **Penetración de WhatsApp**: Superior al 95% en la población activa y en el 100% de los trabajadores de oficios. Cualquier solución que obligue a salir de WhatsApp genera abandono inmediato en este segmento.

### Tamaño de Mercado (TAM, SAM, SOM)
1. **TAM (Total Addressable Market - Argentina)**:
   - 14 millones de hogares en Argentina realizando en promedio 2.5 servicios de mantenimiento o refacción al año.
   - ~35 millones de contrataciones anuales.
2. **SAM (Serviceable Addressable Market - Rosario y región metropolitana)**:
   - 400.000 hogares con una media de 2 servicios al año = 800.000 transacciones anuales en el Gran Rosario.
   - Con un ticket promedio de mano de obra de \$35.000 ARS (valor referencia 2026), el mercado local supera los \$28.000 millones de pesos anuales en mano de obra.
3. **SOM (Serviceable Obtainable Market - Objetivo 12 meses MVP)**:
   - Capturar el 1.5% de las transacciones mensuales en los distritos Centro y Norte: ~1.000 transacciones/mes facilitadas a través de la plataforma.

---

## 4. Análisis Competitivo

| Competidor | Modelo | Ventajas | Desventajas / Brechas que Oficios Express aprovecha |
|---|---|---|---|
| **Boca a boca tradicional** | Informal | Alta confianza inicial. | Lento, poca disponibilidad, alcance acotado a conocidos. |
| **Grupos de Facebook / Clasificados** | Anarquía de posteos | Abundante oferta. | Spam masivo, cero verificación, perfiles no estructurados, falta de geolocalización precisa. |
| **Plataformas nacionales (Zolvers, IguanaFix)** | Comisión transaccional cerrada | Marca nacional. | Exigen pago y chat cerrado dentro de la app, alta comisión (15-20%), poca penetración en el interior del país, baja adopción de profesionales en Rosario. |
| **Google Maps / Buscador** | Fichas de negocio | Fácil acceso. | Pocos plomeros o electricistas independientes tienen ficha optimizada; no hay seguimiento ni filtrado por rubros de urgencia. |
| **Oficios Express (Nuestra ventaja)** | **Hiperlocal, mobile-first, puente a WhatsApp** | **Filtro distrital rosarino, fotos previas del problema, cero comisión inicial, adopción inmediata por usar WhatsApp.** | Dependencia del reporte del usuario para tracking final en MVP. |

---

## 5. Estrategia de Monetización Evolutiva

### Fase 1: Adquisición y Liquidez (Estado Actual del MVP)
- **Precio**: 100% gratuito tanto para el usuario como para el profesional.
- **Objetivo**: Reducir a cero el Costo de Adquisición de Profesionales (CAC) y lograr una densidad de oferta crítica en los 6 distritos de Rosario.

### Fase 2: Modelo Freemium & Visibilidad
1. **Plan Profesional Básico (Gratis)**:
   - Aparición en el catálogo de su distrito.
   - Hasta 10 solicitudes mensuales.
   - Perfil con teléfono y botón de WhatsApp.
2. **Plan Profesional Pro (Suscripción mensual \$9.900 ARS)**:
   - Destacado en primeros lugares del catálogo por distrito.
   - Insignia dorada "Profesional Verificado" (validación de DNI y matrícula en gasistas/electricistas).
   - Solicitudes ilimitadas.
   - Cobertura multizona sin restricciones.

### Fase 3: Alianzas y Monetización B2B
- **Patrocinios de marcas y corralones**: Espacios patrocinados para ferreterías industriales (ej. "Conseguí tus materiales con 10% de descuento en Ferretería X de tu distrito").
- **Canal para administraciones de consorcios**: Panel corporativo para administradores de edificios que requieren múltiples oficios recurrentes con factura fiscal.
