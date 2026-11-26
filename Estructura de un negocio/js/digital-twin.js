/**
 * GLOWTEX | Motor de Gemelo Digital (Digital Twin Engine)
 * Modelación y Simulación en Tiempo Real para Comercio Electrónico y Exterior
 * Desarrollado para el Proyecto UPEC: "Proyecto de negocios y gemelos digitales"
 */

const DigitalTwinEngine = {
  // Parámetros y constantes oficiales para Ecuador
  TRIBUTOS_EC: {
    FODINFA_RATE: 0.005, // 0.5% del valor CIF
    IVA_RATE: 0.15,      // 15% vigente en Ecuador
    GASTOS_PORTUARIOS_ESTIMADOS: 650.00,  // THC, handling en puerto Posorja/Guayaquil
    AGENTE_ADUANA_TASA: 0.015,            // 1.5% del CIF (min $400)
    FLETE_TERRESTRE_GYE_UIO: 450.00       // Flete terrestre contenedor o carga consolidada Guayaquil a Quito
  },

  /**
   * 1. SIMULADOR ADUANERO SENAE / ECUAPASS
   * Calcula con precisión matemática la liquidación de tributos y costo puesto en Quito
   */
  calculateSenaeDuties: function (params) {
    const fob = parseFloat(params.fob) || 0;
    const freight = parseFloat(params.freight) || 0;
    const insurance = parseFloat(params.insurance) || (fob * 0.01); // 1% referencial si no se ingresa
    const cif = fob + freight + insurance;

    let adValoremRate = parseFloat(params.adValoremRate) || 0;
    const origin = params.origin || 'China';
    const isCapitalGood = params.isCapitalGood || false; // Maquinaria HS 8452
    const hasTlcCertificate = params.hasTlcCertificate !== undefined ? params.hasTlcCertificate : true;

    // Lógica arancelaria según acuerdos internacionales vigentes
    let appliedRule = "Régimen General SENAE";
    if (isCapitalGood) {
      adValoremRate = 0.0;
      appliedRule = "Bienes de Capital (Arancel 0% según Política Arancelaria Nacional)";
    } else if ((origin.includes('Colombia') || origin.includes('Perú')) && hasTlcCertificate) {
      adValoremRate = 0.0;
      appliedRule = "Preferencia Andina (CAN - Decisión 414: 0% Arancel Ad Valorem)";
    } else if (origin.includes('China') && hasTlcCertificate) {
      // TLC Ecuador-China (En vigor desde mayo 2024): desgravaciones según partida
      adValoremRate = Math.max(0, adValoremRate * 0.80); // Reducción arancelaria año 2 del TLC
      appliedRule = "TLC Ecuador-China (Desgravación preferencial categoría B)";
    }

    const adValorem = cif * (adValoremRate / 100);
    const fodinfa = cif * this.TRIBUTOS_EC.FODINFA_RATE;
    const specificDuty = parseFloat(params.specificDuty) || 0; // Salvaguardia o arancel mixto $/kg
    
    // Base imponible del IVA según Código Orgánico de la Producción, Comercio e Inversiones (COPCI)
    const baseIva = cif + adValorem + fodinfa + specificDuty;
    const iva = baseIva * this.TRIBUTOS_EC.IVA_RATE;

    const totalDuties = adValorem + fodinfa + specificDuty + iva;

    // Gastos complementarios de internación y traslado a bodega Quito
    const customsAgentFee = Math.max(400, cif * this.TRIBUTOS_EC.AGENTE_ADUANA_TASA);
    const portAndLogistics = this.TRIBUTOS_EC.GASTOS_PORTUARIOS_ESTIMADOS + this.TRIBUTOS_EC.FLETE_TERRESTRE_GYE_UIO;
    const localExpenses = customsAgentFee + portAndLogistics;

    const totalLandedCostQuito = cif + adValorem + fodinfa + specificDuty + localExpenses;
    const factorNacionalizacion = fob > 0 ? (totalLandedCostQuito / fob) : 1;

    // Cálculo unitario si se ingresaron cantidades
    const units = parseFloat(params.units) || 1;
    const unitLandedCost = totalLandedCostQuito / units;

    return {
      fob,
      freight,
      insurance,
      cif,
      adValoremRate,
      appliedRule,
      adValorem,
      fodinfa,
      specificDuty,
      baseIva,
      iva,
      totalDuties,
      localExpenses,
      customsAgentFee,
      portAndLogistics,
      totalLandedCostQuito,
      factorNacionalizacion,
      units,
      unitLandedCost
    };
  },

  /**
   * 2. GEMELO DIGITAL DE CADENA DE SUMINISTRO Y REORDEN (INVENTORY TWIN)
   * Modela el comportamiento de rotación, días de cobertura y punto de reorden
   */
  simulateInventoryTwin: function (product, dailySales = 5) {
    const stock = product.stock || 0;
    const leadTime = product.leadTimeDays || 35; // días desde colocación hasta recepción en Quito
    const safetyStockDays = Math.ceil(leadTime * 0.3); // 30% del lead time como colchon de seguridad
    const safetyStock = Math.ceil(dailySales * safetyStockDays);
    const reorderPoint = (dailySales * leadTime) + safetyStock;
    const daysOfInventory = dailySales > 0 ? Math.floor(stock / dailySales) : 999;

    let status = "OPTIMAL";
    let statusMessage = "Inventario en niveles óptimos";
    let statusColor = "green";

    if (stock <= 0) {
      status = "OUT_OF_STOCK";
      statusMessage = "QUIEBRE DE STOCK - Detención de ventas B2B/B2C";
      statusColor = "red";
    } else if (stock <= safetyStock) {
      status = "CRITICAL";
      statusMessage = "NIVEL CRÍTICO - Utilizando stock de seguridad";
      statusColor = "orange";
    } else if (stock <= reorderPoint) {
      status = "REORDER";
      statusMessage = "PUNTO DE REORDEN ALCANZADO - Emitir orden de compra internacional";
      statusColor = "yellow";
    }

    return {
      sku: product.sku,
      name: product.name,
      currentStock: stock,
      dailySales,
      leadTimeDays: leadTime,
      safetyStock,
      reorderPoint,
      daysOfInventory,
      status,
      statusMessage,
      statusColor
    };
  },

  /**
   * 3. MODELADOR DE ESCENARIOS FINANCIEROS Y CASH FLOW A 12 MESES
   * Integra los 3 escenarios proyectados para GLOWTEX
   */
  getFinancialScenarios: function () {
    return {
      conservative: {
        id: "conservative",
        name: "Escenario Conservador",
        monthlySales: 18000,
        grossMarginRate: 0.28,
        monthlyOpEx: 6000,
        initialCapex: 100000,
        description: "Arranque gradual enfocado en talleres pequeños y diseñadores locales."
      },
      target: {
        id: "target",
        name: "Escenario Objetivo (Plan Base)",
        monthlySales: 30000,
        grossMarginRate: 0.32,
        monthlyOpEx: 7000,
        initialCapex: 100000,
        description: "Penetración equilibrada en confeccionistas deportivos y dotación hotelera."
      },
      expansion: {
        id: "expansion",
        name: "Escenario de Expansión",
        monthlySales: 45000,
        grossMarginRate: 0.35,
        monthlyOpEx: 9000,
        initialCapex: 100000,
        description: "Contratos corporativos cerrados y canal e-commerce a escala nacional."
      }
    };
  },

  generate12MonthProjection: function (scenarioKey = "target") {
    const scenarios = this.getFinancialScenarios();
    const sc = scenarios[scenarioKey] || scenarios.target;

    const months = ["Mes 1", "Mes 2", "Mes 3", "Mes 4", "Mes 5", "Mes 6", "Mes 7", "Mes 8", "Mes 9", "Mes 10", "Mes 11", "Mes 12"];
    const salesCurve = [0.4, 0.6, 0.8, 0.9, 1.0, 1.05, 1.1, 1.15, 1.2, 1.25, 1.3, 1.35]; // Curva de maduración y ventas estacionales

    let accumulatedCash = 15000; // Capital de trabajo inicial líquido disponible
    const monthlyData = [];

    for (let i = 0; i < 12; i++) {
      const sales = Math.round(sc.monthlySales * salesCurve[i]);
      const cogs = Math.round(sales * (1 - sc.grossMarginRate));
      const grossProfit = sales - cogs;
      const opEx = sc.monthlyOpEx;
      const netProfit = grossProfit - opEx;
      accumulatedCash += netProfit;

      monthlyData.push({
        month: months[i],
        sales,
        cogs,
        grossProfit,
        opEx,
        netProfit,
        accumulatedCash
      });
    }

    return {
      scenario: sc,
      monthlyData,
      totalAnnualSales: monthlyData.reduce((acc, m) => acc + m.sales, 0),
      totalAnnualNetProfit: monthlyData.reduce((acc, m) => acc + m.netProfit, 0),
      roiAnnual: (monthlyData.reduce((acc, m) => acc + m.netProfit, 0) / sc.initialCapex) * 100
    };
  },

  /**
   * 4. SIMULADOR FÍSICO DEL SHOWROOM DE QUITO (120 m²)
   */
  getShowroomLayout: function () {
    return [
      { area: "Recepción y Módulo de Pago", m2: 10, share: "8.3%", icon: "fa-cash-register", color: "#172B3A" },
      { area: "Línea GLOWTEX Sport (Lycras y Técnicos)", m2: 22, share: "18.3%", icon: "fa-running", color: "#2B506E" },
      { area: "Línea GLOWTEX Hospitality (Hoteles y Restaurantes)", m2: 18, share: "15.0%", icon: "fa-hotel", color: "#3B6978" },
      { area: "Línea GLOWTEX Premium (Pima, Lino y Sedas)", m2: 12, share: "10.0%", icon: "fa-gem", color: "#B7A078" },
      { area: "Línea Supplies (Insumos, Cierres e Hilos)", m2: 18, share: "15.0%", icon: "fa-cut", color: "#546E7A" },
      { area: "Línea Machinery (Máquinas Industriales Jack/JUKI)", m2: 15, share: "12.5%", icon: "fa-cogs", color: "#37474F" },
      { area: "Mesa de Asesoría Técnica y Muestrarios", m2: 10, share: "8.3%", icon: "fa-comments", color: "#78909C" },
      { area: "Zona de Despacho y Circulación", m2: 15, share: "12.5%", icon: "fa-boxes", color: "#263238" }
    ];
  }
};
