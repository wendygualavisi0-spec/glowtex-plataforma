# PROYECTO ESTRATÉGICO: GLOWTEX S.A.S.
## E-Commerce Omnicanal y Gemelos Digitales de Importación Textil en Ecuador

**Institución:** Universidad Politécnica Estatal del Carchi (UPEC)  
**Carrera:** Comercio Exterior  
**Asignatura:** Comercio Electrónico  
**Docente:** MSc. Gustavo Terán  
**Estudiante:** Wendy Gualavisi  
**Fecha:** Noviembre 2026  

---

## 1. RESUMEN EJECUTIVO Y MODELO DE NEGOCIO

**GLOWTEX** es un modelo empresarial híbrido (B2B / B2C) concebido para transformar el abastecimiento de la industria textil en Ecuador, integrando:
1. **Showroom Comercial en Quito (120 m²):** Exhibición física de textiles, mesas de corte/patronaje y banco de pruebas de maquinaria industrial (JUKI / Jack).
2. **Plataforma E-Commerce Omnicanal:** Catálogo de 150 referencias en 6 divisiones, facturación electrónica autorizada por el SRI (15% IVA) y pasarelas de pago ecuatorianas (**PayPhone**, **Kushki / Placetopay**, transferencias directas).
3. **Gemelo Digital (Digital Twin):** Modelo predictivo que simula la liquidación aduanera en **ECUAPASS (SENAE)**, los tiempos de tránsito internacional de carga (Lead Time) y la gestión dinámica del inventario mediante Puntos de Reorden (ROP).

### Estructura del Capital Inicial ($100.000 USD)
- **Primera Importación (CIF + Nacionalización):** $55.000 (FOB $36.000, Flete/Seguro $5.400, Tributos y Gastos $13.709).
- **Adecuación Showroom Quito (120 m²):** $12.000.
- **Bodega de Almacenamiento y Logística:** $3.000.
- **Plataforma Web / E-Commerce / Gemelo Digital:** $3.500.
- **Branding, Identidad Visual y Registro SENADI:** $3.500.
- **Trámites Legales, RUC, Token y Registro COMEX 401:** $2.000.
- **Gastos Operativos y Nómina Inicial:** $6.000.
- **Capital de Trabajo y Contingencias:** $15.000.

---

## 2. PORTAFOLIO DE PRODUCTOS: 6 DIVISIONES (150 SKUs)

| División | Enfoque de Mercado | SKUs Clave | Países de Origen | Subpartidas SENAE |
| :--- | :--- | :--- | :--- | :--- |
| **GLOWTEX Sport** | Ropa deportiva, compresión, trajes de baño | Lycra Nylon Spandex, Supplex, Dry-Fit microperforado, Powernet | China, Colombia (CAN), Taiwán | 6004.10, 6006.32, 5407.52 |
| **GLOWTEX Hospitality** | Hotelería 3 a 5 estrellas, restaurantes, chefs | Percal 180-300 hilos, Toallas 550g, Blackout, Antifluidos | India, Pakistán, Colombia, China | 5208.21, 5802.11, 5407.54 |
| **GLOWTEX Premium** | Alta costura, sastrería y diseñadores | Algodón Pima 50/1, Lino puro, Seda natural Mulberry 16-19mm | Perú (CAN), China, Europa | 6006.22, 5309.11, 5007.20 |
| **GLOWTEX Supplies** | Insumos para talleres de confección | Cremalleras SBS impermeables, hilos Coats 40/2, elásticos | Colombia, China | 9607.11, 5508.10, 5806.32 |
| **GLOWTEX Machinery** | Maquinaria industrial de confección | Rectas direct drive Jack F5/A4B, overlocks, recubridoras | China (Jack), Japón (JUKI) | 8452.29.00 (Arancel 0%) |
| **GLOWTEX Tools** | Herramientas de modistería y patronaje | Curvas francesas acrílicas, tijeras de sastre 10", bases A1 | Taiwán, China | 9017.20, 8213.00, 3926.90 |

---

## 3. MARCO ADUANERO Y TRIBUTARIO ECUADOR (SENAE / ECUAPASS)

### Fórmulas Oficiales de Liquidación:
1. **Valor en Aduana:** $\text{CIF} = \text{FOB} + \text{Flete Internacional} + \text{Seguro Internacional}$.
2. **Arancel Ad Valorem:** Según subpartida arancelaria:
   - *Comunidad Andina (Colombia/Perú):* **0% Ad Valorem** con Certificado de Origen CAN.
   - *TLC Ecuador-China (mayo 2024):* Desgravaciones arancelarias preferenciales.
   - *Bienes de Capital (Maquinaria textil partida 8452):* **0% Ad Valorem**.
3. **FODINFA:** $0.5\%$ sobre el valor CIF ($\text{FODINFA} = \text{CIF} \times 0.005$).
4. **Base Imponible IVA:** $\text{Base} = \text{CIF} + \text{Ad Valorem} + \text{FODINFA} + \text{Aranceles Específicos/Salvaguardias}$.
5. **Impuesto al Valor Agregado (IVA):** $15\%$ sobre la Base Imponible ($\text{IVA} = \text{Base} \times 0.15$).

### Requisitos Normativos Específicos:
- **Resolución COMEX 401:** Obligación de registro previo de importadores de textiles y calzado ante el Ministerio de Producción, Comercio Exterior, Inversiones y Pesca (MPCEIP).
- **Reglamento Técnico RTE INEN 1875:** Requisitos de rotulado y etiquetado para prendas de vestir y confecciones textiles (composición porcentual, talla, país de origen, instrucciones de cuidado, RUC del fabricante o importador).

---

## 4. GEMELO DIGITAL: MODELO DE SIMULACIÓN Y CONTROL

El gemelo digital implementado en el sistema computacional modela tres capas:
1. **Capa Financiera y Aduanera:** Calcula en milisegundos el factor de nacionalización $K = \frac{\text{Costo Puesto en Quito}}{\text{FOB}}$, proyectando márgenes brutos del 30% al 35% en B2B y 50% al 60% en B2C.
2. **Capa de Cadena de Suministro:**
   - **Lead Time Marítimo China:** 35 a 45 días (embarque Ningbo/Shanghai $\rightarrow$ arribo Posorja/Guayaquil $\rightarrow$ aforo SENAE $\rightarrow$ bodega Quito).
   - **Lead Time Terrestre CAN:** 7 a 8 días (despacho Bogotá/Lima $\rightarrow$ aduana Rumichaca/Huaquillas $\rightarrow$ bodega Quito).
3. **Capa de Reposición y ROP:**
   $$\text{ROP} = (D \times L) + \text{SS}$$
   Donde $D$ es la demanda promedio diaria, $L$ es el tiempo de entrega del proveedor y $\text{SS}$ es el inventario de seguridad. Si el stock en bodega Quito desciende por debajo del ROP, el sistema genera automáticamente la solicitud de cotización (RFQ).

---

## 5. PLAN FINANCIERO A 12 MESES (3 ESCENARIOS)

| Métrica Anual | Escenario Conservador | Escenario Objetivo | Escenario Expansión |
| :--- | :--- | :--- | :--- |
| **Ventas Mensuales Promedio** | $18.000 USD | $30.000 USD | $45.000 USD |
| **Margen Bruto (%)** | 28% ($5.040/mes) | 32% ($9.600/mes) | 35% ($15.750/mes) |
| **Gastos Operativos (OpEx)** | $6.000 USD/mes | $7.000 USD/mes | $9.000 USD/mes |
| **Facturación Anual Proyectada** | $216.000 USD | $360.000 USD | $540.000 USD |
| **Utilidad Neta Anual** | -$11.520 USD (primer año) | +$31.200 USD | +$81.000 USD |
| **Retorno de Inversión (ROI)** | Retorno en año 2 | **31.2% anual** | **81.0% anual** |

---

## 6. CRONOGRAMA DE IMPLEMENTACIÓN (120 DÍAS)

- **Días 1 a 15:** Constitución jurídica (S.A.S.), emisión de RUC, token de firma electrónica, registro en ECUAPASS (SENAE) y presentación ante MPCEIP (COMEX 401).
- **Días 16 a 30:** Envío de cartas de cotización formal (RFQ) a fabricantes verificados de China, Colombia y Perú. Solicitud y validación de swatches/muestras físicas en Quito.
- **Días 31 a 45:** Selección de proveedores, validación de partidas arancelarias, contratación de Agente de Aduana y emisión de anticipos bancarios contra cartas de crédito / giros internacionales.
- **Días 46 a 75:** Periodo de tejeduría, inspección de calidad pre-embarque en origen, consolidación de contenedor LCL/FCL y zarpe hacia el puerto de Posorja / Guayaquil.
- **Días 76 a 100:** Arribo a aguas territoriales ecuatorianas, transmisión de la Declaración Aduanera de Importación (DAI), liquidación de tributos SENAE, aforo aduanero y traslado en camión precintado hacia Quito.
- **Días 101 a 120:** Descarga e inventario en Bodega Quito, montaje del Showroom (120 m²), lanzamiento de la plataforma web e-commerce y apertura comercial.
