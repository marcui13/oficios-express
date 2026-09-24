# 03 — Métricas y KPIs del Negocio

## 1. Métrica Estrella (North Star Metric)

> **North Star Metric**: **Contactos Aceptados Exitosos por Semana (CAS)**
> 
> *Definición*: Número de solicitudes de contacto enviadas por clientes que son aceptadas por profesionales activos en la plataforma, abriendo el canal de WhatsApp durante una semana.

### Por qué esta es la North Star:
- Refleja valor real para **ambas partes**: el cliente recibió respuesta positiva de un profesional disponible y el profesional obtuvo un cliente potencial calificado.
- A diferencia de "visitas a la web" o "solicitudes creadas", el *Contacto Aceptado* garantiza que la oferta y la demanda están sincronizadas en tiempo, lugar (distrito de Rosario) y oficio.

---

## 2. Árbol de Métricas (Metric Tree)

```
                       [ Contactos Aceptados por Semana ] (North Star)
                                      |
         +----------------------------+----------------------------+
         |                                                         |
  [ Total Solicitudes Creadas ]                             [ Tasa de Aceptación (%) ]
         |                                                         |
  +------+------+                                           +------+------+
  |             |                                           |             |
[Visitas     [Tasa Conversión                             [Tiempo de    [Liquidez Oferta
 Catálogo]   Visita -> Solicitud]                          Respuesta]    por Distrito]
```

---

## 3. Cuadro de Mando Integral (KPI Dashboard)

### A. Métricas de Oferta (Profesionales)
| Indicador | Fórmula / Medición | Meta Inicial MVP | Meta Escala (Mes 6) |
|---|---|---|---|
| **Profesionales Activos** | Profesionales con `isActive: true` que iniciaron sesión en últimos 30 días | > 30 | > 250 |
| **Densidad por Distrito** | Promedio de profesionales por distrito de Rosario | Min 3 por rubro clave en Centro/Norte | Min 10 por rubro en los 6 distritos |
| **Tasa de Respuesta** | $\frac{\text{Solicitudes respondidas (aceptadas + rechazadas)}}{\text{Total solicitudes recibidas}}$ | > 75% | > 90% |
| **Tiempo Medio de Respuesta (TMR)** | Mediana de tiempo entre creación de solicitud y acción del pro | < 4 horas | < 45 minutos |

### B. Métricas de Demanda (Clientes)
| Indicador | Fórmula / Medición | Meta Inicial MVP | Meta Escala (Mes 6) |
|---|---|---|---|
| **Solicitudes por Cliente** | Frecuencia de uso por cliente registrado | 1.2 anual | 2.5 anual |
| **Tasa de Conversión Web** | $\frac{\text{Solicitudes creadas}}{\text{Visitantes únicos en catálogo}}$ | > 8% | > 15% |
| **Uso de Fotos Adjuntas** | % de solicitudes que incluyen al menos 1 fotografía | > 40% | > 65% |
| **Net Promoter Score (NPS)** | Encuesta de satisfacción post-contacto | > 60 | > 75 |

### C. Métricas de Liquidez de Mercado (Marketplace Health)
| Indicador | Explicación | Umbral Crítico de Alerta |
|---|---|---|
| **Zero Match Rate (ZMR)** | Búsquedas por filtro de oficio + zona que devuelven 0 profesionales activos. | Si ZMR > 5% en Centro/Norte, se dispara campaña de captación urgente en ese oficio. |
| **Tasa de Rechazo no Atendido** | Solicitudes que quedan pendientes sin respuesta durante más de 24 horas. | No debe superar el 15%. |

---

## 4. Métricas Financieras y Unit Economics (Proyección Fase 2)

```
+--------------------------------------------------------------------------------+
| Proyección Unit Economics (Plan Pro para Profesionales en Rosario)            |
+--------------------------------------------------------------------------------+
| Precio suscripción mensual sugerido:           $9.900 ARS                      |
| Costo de Adquisición de Profesional (CAC):      $4.500 ARS (Meta Ads + POP)     |
| Churn mensual estimado:                         6.0%                           |
| Vida media del profesional (Lifetime):          16.6 meses                     |
| Customer Lifetime Value (LTV):                 $164.340 ARS                    |
| Relación LTV / CAC:                            36.5x (Altamente sostenible)    |
| Payback Period:                                0.45 meses (~14 días)           |
+--------------------------------------------------------------------------------+
```

---

## 5. Protocolo de Revisión y Reportes

1. **Revisión Diaria (Operaciones)**:
   - Chequeo de solicitudes pendientes con más de 12 horas sin respuesta para re-asignación o aviso por WhatsApp al profesional.
   - Detección de nuevos usuarios registrados y verificación de perfil.
2. **Revisión Semanal (Producto y Crecimiento)**:
   - Análisis de distritos con mayor y menor tracción en Rosario.
   - Evaluación de embudo de conversión (Home -> Perfil Profesional -> Envío de Formulario -> Aceptación).
3. **Revisión Mensual (Estratégica)**:
   - Comparativa de volumen mes contra mes.
   - Feedback de clientes y profesionales sobre la experiencia WhatsApp.
