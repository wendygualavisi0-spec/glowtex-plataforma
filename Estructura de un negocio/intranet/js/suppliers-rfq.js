/**
 * GLOWTEX | Directorio Internacional de Proveedores Verificados & Generador RFQ
 * Con Contactos Reales Institucionales y Plantillas Formales de Cotización
 */

const GLOWTEX_SUPPLIERS = [
  {
    id: "lafayette",
    name: "Lafayette S.A.S.",
    country: "Colombia",
    flag: "🇨🇴",
    category: "Textiles Deportivos, Técnicos y Moda",
    status: "Verificado / Preferencial CAN",
    contacts: {
      phone: "+57 601 294 8880",
      whatsapp: "+57 322 767 7848",
      email: "servicioalcliente@lafayette.com",
      address: "Calle 15 # 72-95, Bogotá, Colombia",
      website: "https://www.lafayette.com"
    },
    tradeAgreement: "Comunidad Andina (CAN) - 0% Arancel Ad Valorem con Certificado de Origen",
    leadTimeDays: 7,
    moq: "300 metros por color / base",
    strengths: "Telas deportivas de alta tecnología, microfibras, antifluidos con repelencia certificada y uniformes institucionales."
  },
  {
    id: "fabricato",
    name: "Fabricato S.A.",
    country: "Colombia",
    flag: "🇨🇴",
    category: "Driles, Denim, Popelinas y Dotación Corporativa",
    status: "Verificado / CAN",
    contacts: {
      phone: "+57 604 448 3500",
      email: "servicioalcliente@fabricato.com",
      address: "Carrera 50 # 38-320, Bello, Antioquia, Colombia",
      website: "https://www.fabricato.com"
    },
    tradeAgreement: "Comunidad Andina (CAN) - 0% Arancel Ad Valorem",
    leadTimeDays: 7,
    moq: "500 metros",
    strengths: "Líder regional en algodón, sarga para trabajo pesado, uniformes corporativos y denim premium."
  },
  {
    id: "creditex",
    name: "Creditex S.A.A. (Algodón Pima)",
    country: "Perú",
    flag: "🇵🇪",
    category: "Algodón Pima y Tangüis Extra-Larga Fibra",
    status: "Verificado / CAN",
    contacts: {
      phone: "+51 1 715 7500",
      email: "postmaster@creditex.com.pe",
      address: "Calle Los Hornos 185 Urb. Vulcano, Ate, Lima, Perú",
      website: "https://www.creditex.com.pe"
    },
    tradeAgreement: "Comunidad Andina (CAN) - 0% Arancel Ad Valorem",
    leadTimeDays: 8,
    moq: "300 kg / 600 metros",
    strengths: "Mayor hilandería y tejeduría de algodón Pima en Sudamérica. Hilos de títulos finos 50/1 a 100/2."
  },
  {
    id: "jack",
    name: "Jack Technology Co., Ltd.",
    country: "China",
    flag: "🇨🇳",
    category: "Maquinaria de Confección Industrial e Inteligente",
    status: "Fabricante OEM Verificado",
    contacts: {
      phone: "+86 576 8817 7782",
      email: "info@jack-sewing.com",
      address: "No. 1 Jack Road, Taizhou, Zhejiang, China",
      website: "https://www.jack-sewing.com"
    },
    tradeAgreement: "TLC Ecuador-China / Bienes de Capital 0% Ad Valorem",
    leadTimeDays: 35,
    moq: "Contenedor LCL o FCL consolidado (desde 5 unidades)",
    strengths: "Líder mundial en ventas de máquinas de coser rectas direct drive, overlocks inteligentes y cortadoras."
  },
  {
    id: "sbs",
    name: "Fujian Xunxing Zipper (SBS Zipper)",
    country: "China",
    flag: "🇨🇳",
    category: "Cierres, Cremalleras y Deslizadores Industriales",
    status: "Fabricante OEM Verificado",
    contacts: {
      phone: "+86 595 8529 1111",
      email: "export@sbszipper.com",
      address: "Xunxing Bldg, Shenhu, Jinjiang, Fujian, China",
      website: "https://www.sbs-zipper.com"
    },
    tradeAgreement: "TLC Ecuador-China",
    leadTimeDays: 30,
    moq: "2.000 unidades surtidas",
    strengths: "Segundo mayor fabricante de cremalleras del mundo. Calidad certificada OEKO-TEX Standard 100 y cierres waterproof."
  },
  {
    id: "coats",
    name: "Coats Cadena Andina S.A.",
    country: "Colombia / Global",
    flag: "🇨🇴",
    category: "Hilos Industriales para Coser y Bordar",
    status: "Distribuidor Oficial Autorizado",
    contacts: {
      phone: "+57 606 313 8000",
      email: "sac@coats.com",
      address: "Carrera 9 # 10-61, Pereira, Risaralda, Colombia",
      website: "https://www.coats.com"
    },
    tradeAgreement: "Comunidad Andina (CAN) - 0% Arancel Ad Valorem",
    leadTimeDays: 7,
    moq: "Caja de 12 conos por color",
    strengths: "Líder mundial en hilos de filamento y fibra cortada (Astra, Epic, Gramax) para costura a alta velocidad."
  },
  {
    id: "arvind",
    name: "Arvind Limited",
    country: "India",
    flag: "🇮🇳",
    category: "Telas de Sábana Gran Ancho, Algodón y Lino",
    status: "Fabricante Textil Integrado",
    contacts: {
      phone: "+91 79 682 68000",
      email: "info@arvind.in",
      address: "Naroda Road, Ahmedabad, Gujarat 380025, India",
      website: "https://www.arvind.com"
    },
    tradeAgreement: "Régimen Arancelario General Ecuador (Certificado de Origen obligatorio)",
    leadTimeDays: 45,
    moq: "1.000 metros por partida",
    strengths: "Gigante textil de la India, especialista en telas hoteleras de gran ancho (2.80m y 3.00m) hasta 500 hilos."
  },
  {
    id: "juki-ec",
    name: "Yukitex C.A. / Macoser S.A. (Representantes JUKI Ecuador)",
    country: "Ecuador / Japón",
    flag: "🇪🇨",
    category: "Maquinaria Japonesa JUKI y Repuestos Originales",
    status: "Distribuidor Autorizado en Ecuador",
    contacts: {
      phone: "+593 99 990 4363 (Quito) / +593 4 231 3915 (Gye)",
      email: "juki@yukitex.net",
      address: "Quito: Sector El Inca / Guayaquil: Centro Comercial Plaza Mayor",
      website: "https://www.juki.co.jp"
    },
    tradeAgreement: "Disponibilidad Local Inmediata con Garantía de Fábrica",
    leadTimeDays: 2,
    moq: "1 unidad",
    strengths: "Servicio técnico oficial certificado, repuestos originales y soporte para talleres de confección en Quito."
  }
];

/**
 * Generador interactivo de cartas de Solicitud de Cotización (RFQ)
 */
function generateRFQTemplate(supplierId, itemsList, targetIncoterm = "FOB") {
  const supplier = GLOWTEX_SUPPLIERS.find(s => s.id === supplierId) || GLOWTEX_SUPPLIERS[0];
  const dateStr = new Date().toLocaleDateString('es-EC', { year: 'numeric', month: 'long', day: 'numeric' });

  const itemsFormatted = itemsList.map((item, idx) => {
    return `${idx + 1}. SKU: ${item.sku} - ${item.name}
   - Cantidad estimada: ${item.qty} ${item.unit}s
   - Especificaciones requeridas: ${item.specs || item.composition || 'Según ficha técnica estándar'}
   - Destino final: Quito, Ecuador`;
  }).join("\n\n");

  return `================================================================================
GLOWTEX S.A.S. - DEPARTAMENTO DE IMPORTACIONES Y COMPRAS INTERNACIONALES
Quito - Ecuador | RUC: En trámite (S.A.S.) | contacto@glowtex.ec
================================================================================
Fecha: ${dateStr}

Para:
Señores ${supplier.name}
Atención: Departamento de Comercio Exterior / Ventas Internacionales
Contacto: ${supplier.contacts.email} | Tel: ${supplier.contacts.phone}
País: ${supplier.country}

ASUNTO: SOLICITUD FORMAL DE COTIZACIÓN Y FICHAS TÉCNICAS (RFQ - REF: GLX-${new Date().getFullYear()}-001)

Estimados señores:

Reciban un cordial saludo de parte de GLOWTEX S.A.S., empresa ecuatoriana con sede en la ciudad de Quito, dedicada a la importación, distribución y comercialización de textiles técnicos de alto rendimiento, insumos, accesorios y maquinaria industrial para la confección.

En el marco de nuestro programa de abastecimiento y la conformación de nuestro portafolio de proveedores internacionales homologados, nos dirigimos a ustedes con el propósito de solicitar su cotización formal bajo las siguientes condiciones:

1. REQUERIMIENTO DE PRODUCTOS:
${itemsFormatted}

2. CONDICIONES COMERCIALES SOLICITADAS:
- Término de negociación (Incoterm 2020): ${targetIncoterm} (indicar puerto o aeropuerto de salida recomendado).
- Precios unitarios escalonados según volumen (MOQ y descuentos por contenedor / rollos).
- Fichas técnicas oficiales que especifiquen: composición porcentual exacta, peso (g/m²), ancho útil (cm), rendimiento (m/kg), solidez del color al lavado y norma de ensayo.
- Requisitos aduaneros de Ecuador: Favor confirmar disponibilidad de emisión de Certificado de Origen ${supplier.country === 'Colombia' || supplier.country === 'Perú' ? '(CAN para preferencia arancelaria 0%)' : '(para aplicación de acuerdos arancelarios)'}.
- Muestrario comercial (swatches / colgadores) y tiempos estimados de despacho de muestras a Quito vía courier (DHL / FedEx).
- Tiempos de entrega (Lead Time) de producción una vez confirmada la Orden de Compra.
- Forma de pago y condiciones comerciales para compras regulares B2B.

Agradecemos de antemano su pronta atención a la presente solicitud y quedamos atentos a su respuesta formal al correo: importaciones@glowtex.ec.

Atentamente,

GERENCIA DE IMPORTACIONES Y COMERCIO EXTERIOR
GLOWTEX S.A.S.
Quito, Ecuador
https://www.glowtex.ec`;
}
