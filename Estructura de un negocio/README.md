# GLOWTEX S.A.S. | Plataforma Integral de Comercio Electrónico & Gemelo Digital
### Proyecto de Negocios y Gemelos Digitales · Universidad Politécnica Estatal del Carchi (UPEC)

**Carrera:** Comercio Exterior  
**Asignatura:** Comercio Electrónico  
**Docente:** MSc. Gustavo Terán  
**Estudiante:** Wendy Gualavisi  

---

## 🚀 Cómo abrir y ejecutar este proyecto en Visual Studio / VS Code

El proyecto está diseñado para ejecutarse sin requerir compilación ni instalaciones complejas:

### Método 1: Apertura Directa en el Navegador (Instantánea)
1. Abre el explorador de archivos de Windows en esta carpeta:
   `c:\Users\PC\Documents\Comercio Electronico\Estructura de un negocio`
2. Haz **doble clic en el archivo [index.html](file:///c:/Users/PC/Documents/Comercio%20Electronico/Estructura%20de%20un%20negocio/index.html)**.
3. Se abrirá de inmediato en tu navegador con todas las funciones visuales, texturas e interactividad listas.

---

### Método 2: Con Visual Studio Code (Live Server o F5)
1. Abre **Visual Studio Code**.
2. Ve al menú superior: **Archivo (File) > Abrir carpeta... (Open Folder...)** y selecciona la carpeta:
   `c:\Users\PC\Documents\Comercio Electronico\Estructura de un negocio`
3. Si tienes instalada la extensión **Live Server**:
   - Haz clic derecho sobre [index.html](file:///c:/Users/PC/Documents/Comercio%20Electronico/Estructura%20de%20un%20negocio/index.html) y presiona **"Open with Live Server"**.
4. O simplemente presiona la tecla **F5** (la configuración ya está creada en `.vscode/launch.json` para Chrome y Edge).

---

### Método 3: Con la Terminal Integrada de VS Code (Node.js)
1. Abre la terminal en Visual Studio Code presionando `Ctrl + ñ` (o `Ctrl + ` `).
2. Escribe el comando:
   ```bash
   node server.js
   ```
   *(o también `npm start`)*
3. Abre en tu navegador la dirección:
   **`http://localhost:3000`**

---

### Método 4: Con Python (sin instalar dependencias)
1. En la terminal de VS Code escribe:
   ```bash
   python python_server.py
   ```
2. Abre **`http://localhost:8000`** (tienda) o **`http://localhost:8000/intranet/index.html`** (portal interno).
3. El puerto se puede cambiar con la variable de entorno `PORT`.

> `python_server.py` usa solo la biblioteca estándar de Python, por lo que funciona sin `pip install`.

---

## 🔐 Canal Digital Interno (Intranet) — ERP + CRM

El **ERP** y el **CRM** son sistemas internos de la empresa, por lo que **no están dentro del sitio comercial**. Funcionan en un canal digital independiente (`intranet/index.html`) que mantiene integración con la plataforma pública mediante un acceso discreto en el pie de página (**Acceso interno · Intranet**).

Abre `intranet/index.html` con doble clic o con **Live Server** en Visual Studio / VS Code. Si usas `node server.js`, la dirección es **`http://localhost:3000/intranet/index.html`**. Ingresa con:

- Usuario `glowtex` · Clave `Glowtex2026!`
- Usuario `admin` · Clave `admin123`

Dentro del portal puedes alternar entre ambos sistemas desde el menú lateral:

### ERP · Operaciones

| Módulo | Qué simula |
| :--- | :--- |
| **1. Panel de Control** | KPIs de efectivo, ventas, utilidad bruta, inventario valorizado, CxC/CxP, alertas ROP y gráfico de facturación vs. importaciones. |
| **2. Inventario / Bodega** | Los 150 SKUs con stock, ROP dinámico `(D × L) + SS`, cobertura en días, costo unitario nacionalizado y valorización FIFO. Genera RFQ con un clic. |
| **3. Compras e Importaciones** | RFQ/OC a proveedores homologados: CIF → Arancel (CAN 0% / TLC China / bienes de capital 0%) → FODINFA 0.5% → IVA 15% → factor K. Flujo Borrador → Aprobada → En tránsito → Desaduanada → Recibida → Pagada. |
| **4. Ventas y Facturación** | Facturas SRI `001-001-XXXXXXXXX` B2B/B2C, descuento de stock, cálculo de IVA, costo de ventas, despacho y cobro de cartera. |
| **5. Finanzas y Contabilidad** | Libro diario con **partida doble**, balance (activos = pasivos + patrimonio), declaración de IVA (débito menos crédito fiscal) y verificación automática del cuadre contable. |
| **6. Recursos Humanos** | Organigrama de 7 cargos, IESS personal 9.45%, patronal 12.15%, provisiones 25% y procesamiento de nómina con impacto en tesorería. |
| **7. Configuración** | Datos de la compañía, cumplimiento (RUC, token SRI, ECUAPASS, COMEX 401, RTE INEN 1875, SENADI), escenarios del gemelo digital, exportación JSON y reinicio. |

### CRM · Clientes

| Módulo | Qué simula |
| :--- | :--- |
| **1. Panel** | Clientes, leads, pipeline, conversión, valor de vida del cliente, casos abiertos y actividades pendientes. |
| **2. Clientes** | Cartera B2B/B2C con RUC, sector, ciudad, contacto, histórico de facturación y búsqueda. |
| **3. Leads** | Embudo Nuevo → Contactado → Calificado → Propuesta → Cerrado, con origen (showroom, web, WhatsApp) y responsable. |
| **4. Oportunidades** | Pipeline con valor, probabilidad, ponderación y conversión a factura SRI del ERP al marcar **Ganada**. |
| **5. Actividades** | Agenda comercial de llamadas, reuniones, visitas y envíos de muestrarios. |
| **6. Postventa** | Casos de garantía de maquinaria, logística, facturación y consultas técnicas con prioridad y estado. |
| **7. Campañas** | Inversión, leads generados, ingresos atribuidos y ROI por canal. |
| **8. Integración ERP** | Sincronización de clientes ERP → CRM y trazabilidad Oportunidad → Factura → CxC → Cartera del cliente. |

### Prueba rápida de integración

1. En **CRM → Oportunidades**, presiona **Ganar** en una oportunidad: se crea una factura en el ERP, baja el stock y se genera una cuenta por cobrar.
2. En **ERP → Finanzas**, revisa el libro diario y el cuadre `Activos − Pasivos = Patrimonio`.
3. En **CRM → Integración**, sincroniza los clientes desde el ERP y verifica el histórico del cliente.

> Archivos del canal: `intranet/index.html` (acceso y portal), `intranet/css/portal.css` (diseño), `intranet/js/erp.js`, `intranet/js/crm.js` y `intranet/js/portal.js` (motores).

---

## 🌐 Publicar y Obtener un Link Público (GitHub + Python)

El proyecto ya está preparado para subirse a GitHub y generar un link que cualquier persona pueda abrir. Hay dos formas:

### Opción A — GitHub Pages (recomendada, gratis y permanente)

No necesita servidor Python en producción: GitHub publica los archivos estáticos y te da un link tipo `https://TU_USUARIO.github.io/NOMBRE_REPOSITORIO/`.

1. Crea un repositorio en **github.com** (por ejemplo `glowtex-plataforma`). Puede ser público.
2. En la carpeta del proyecto ejecuta:
   ```bash
   git init
   git add .
   git commit -m "Publicar plataforma GLOWTEX con ERP y CRM"
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/glowtex-plataforma.git
   git push -u origin main
   ```
3. En GitHub entra a **Settings → Pages → Build and deployment**.
4. En **Source** elige **GitHub Actions**.
5. El workflow `.github/workflows/deploy-pages.yml` se ejecutará solo y publicará el sitio.
6. En **Actions** verás el despliegue terminado; el link aparece en **Settings → Pages** y también en el resumen del workflow.

**Links finales:**
- Tienda: `https://TU_USUARIO.github.io/glowtex-plataforma/`
- Portal interno: `https://TU_USUARIO.github.io/glowtex-plataforma/intranet/index.html`

> Cada cambio que hagas y subas con `git push` actualiza automáticamente el link.

### Opción B — Python en la nube (Render, con `app.py`)

Si quieres que el link sea servido por una aplicación Python real:

1. Sube el proyecto a GitHub igual que en la Opción A.
2. En **render.com** haz clic en **New → Web Service** y conecta el repositorio.
3. Render detecta `render.yaml` automáticamente:
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `python app.py`
   - **Plan:** Free
4. Haz clic en **Create Web Service**. En unos minutos tendrás un link `https://glowtex-platform.onrender.com`.

También puedes probar la misma app en tu PC:
```bash
pip install -r requirements.txt
python app.py
```
y abrir `http://localhost:5000`.

### Consideraciones importantes

- El acceso al portal interno es una **demostración**: las credenciales están en el navegador y los datos se guardan en `localStorage` de cada visitante. Cualquier persona con el link puede usar el simulador, pero **cada visitante tiene su propia simulación** y no comparte información con otros.
- Para un sistema ERP/CRM real se necesitaría autenticación en servidor y base de datos; este proyecto es un simulador académico.
- El archivo `.nojekyll` evita que GitHub ignore carpetas especiales, y `.gitignore` excluye archivos temporales de Windows/Python.

---

## 🎨 Innovaciones de Diseño, Branding y Texturas Implementadas

1. **Logotipo Vectorial Innovador GLOWTEX:**
   - Emblema abstracto geométrico inspirado en el entrelazado de filamentos y urdimbre textil sobre un telar de precisión.
   - Tipografía dual de alto contraste: **GLOW** en blanco nítido con sombra suave y **TEX** en degradado metalizado dorado (`#D4AF37` a `#B7A078`), con el eslogan *"Textiles · Tecnología · Soluciones"*.
2. **Sistema Tipográfico Oficial:**
   - **Títulos y Display:** `Poppins` y `Montserrat` (pesos 600, 700 y 800) para transmitir contundencia institucional y modernidad internacional.
   - **Cuerpo y Fichas Técnicas:** `Open Sans` y `Lato` para lectura clara y descansada en pantallas de alta densidad.
3. **Texturas Textiles CSS Realistas:**
   - Texturas diseñadas para cada tipo de tejido: micro-malla transpirable para Dry-Fit, efecto compresión para Lycra, acabado satinado para seda, tejido cruzado para percal de algodón, textura de lino orgánico y apariencia mecatrónica para maquinaria Jack/JUKI.
   - Banner Hero con urdimbre textil oscura en azul profundo (`#172B3A`) y destellos dorados sutiles.
4. **Navegación Completa en 11 Módulos:**
   - **Inicio (Home):** Hero banner, categorías destacadas, productos populares, beneficios institucionales y CTA comercial.
   - **Tienda:** Catálogo completo de 150 SKUs con filtros por división, buscador y modo B2B/B2C.
   - **Categorías:** Vitrina visual interactiva de las 6 divisiones de negocio.
   - **Marcas:** Marcas representadas (Jack, JUKI, Coats, SBS, Lafayette, Creditex) y acuerdos verificados.
   - **Promociones:** Paquetes para talleres, combos de inicio y descuentos por volumen.
   - **Nosotros:** Misión, Visión 2030, 5 Valores corporativos y propuesta integral.
   - **Branding y Management:** Bloque A (identidad visual, logotipo, paleta, tipografías, manifiesto) y Bloque B (organigrama, 8 objetivos estratégicos, 5 políticas empresariales y KPIs).
   - **Soluciones Empresariales (B2B):** Segmentos industriales y formulario de cotización mayorista.
   - **Gemelo Digital:** Simulador tributario SENAE/ECUAPASS, modelación de Lead Time y gráfico de flujo financiero a 12 meses.
   - **Blog:** Artículos técnicos educativos (Norma RTE INEN 1875, TLC Ecuador-China, selección de fibras).
   - **Contacto:** Formulario, mapa, showroom en Quito (120 m²) y botón flotante de WhatsApp.
5. **Funcionalidades E-Commerce Ecuatoriano:**
   - Carrito desplegable (Side Drawer) con cálculo automático del 15% de IVA.
   - Simulación de pasarelas locales: **PayPhone Ecuador**, **Kushki / Placetopay**, y transferencias a **Banco Pichincha**.
   - Lista de favoritos (Wishlist) interactiva con guardado en tiempo real.
   - Modal de cuenta de usuario para compradores minoristas y empresas mayoristas con RUC.
#   g l o w t e x  
 #   g l o w t e x  
 