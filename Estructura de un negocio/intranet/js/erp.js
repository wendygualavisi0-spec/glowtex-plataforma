/**
 * GLOWTEX S.A.S. | ERP Enterprise Resource Planning - Simulador Operativo
 * ---------------------------------------------------------------------------
 * Módulo integral stateful (localStorage) que simula la operación real de la
 * empresa: inventario en Bodega Quito, compras/importaciones con liquidación
 * SENAE, ventas B2B/B2C con facturación SRI, contabilidad por doble entrada,
 * cuentas por cobrar/pagar, declaración de IVA y nómina IESS.
 *
 * Dependencias: catalog-data.js, suppliers-rfq.js, digital-twin.js, Chart.js
 */

const ERP_STORAGE_KEY = "glowtex_erp_state_v1";

const ERP = {
  state: null,
  chart: null,
  activeModule: "dashboard",

  // ==================== UTILIDADES ====================
  money(v) {
    return "$" + Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  },
  num(v) {
    return Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 });
  },
  today() {
    return new Date().toISOString().slice(0, 10);
  },
  timeNow() {
    return new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" });
  },
  uid(prefix) {
    return prefix + "-" + Math.floor(1000 + Math.random() * 9000);
  },
  esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  },
  toast(message, kind) {
    document.querySelectorAll(".erp-toast").forEach(t => t.remove());
    const el = document.createElement("div");
    el.className = "erp-toast";
    if (kind === "bad") el.style.borderLeftColor = "#E11D48";
    if (kind === "ok") el.style.borderLeftColor = "#059669";
    el.innerHTML = `<i class="fas ${kind === "bad" ? "fa-exclamation-triangle" : "fa-check-circle"}" style="margin-right:8px;color:var(--color-gold);"></i>${this.esc(message)}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3800);
  },

  // ==================== ESTADO Y PERSISTENCIA ====================
  load() {
    let raw = null;
    try { raw = localStorage.getItem(ERP_STORAGE_KEY); } catch (e) { raw = null; }
    if (raw) {
      try {
        this.state = JSON.parse(raw);
        this.normalize();
        return;
      } catch (e) { /* estado corrupto: se regenera */ }
    }
    this.state = this.buildSeedState();
    this.save();
  },

  normalize() {
    const s = this.state;
    s.inventory = s.inventory || {};
    (typeof GLOWTEX_PRODUCTS !== "undefined" ? GLOWTEX_PRODUCTS : []).forEach(p => {
      if (!s.inventory[p.sku]) {
        s.inventory[p.sku] = { sku: p.sku, stock: p.stock, unitCost: p.unitCostEc, dailySales: Math.max(1, Math.round(p.reorderPoint / p.leadTimeDays)) };
      }
    });
    ["salesOrders", "purchaseOrders", "journal", "activities", "payrollRuns"].forEach(k => { if (!Array.isArray(s[k])) s[k] = []; });
    s.sequences = s.sequences || { so: 1042, po: 87, inv: 12, je: 1 };
    s.cash = typeof s.cash === "number" ? s.cash : 15000;
    s.fixedAssets = typeof s.fixedAssets === "number" ? s.fixedAssets : 85000;
    s.capital = typeof s.capital === "number" ? s.capital : 100000;
    s.openingInventory = typeof s.openingInventory === "number" ? s.openingInventory : 0;
    s.retainedEarnings = typeof s.retainedEarnings === "number" ? s.retainedEarnings : 0;
    s.params = s.params || { ivaRate: 0.15, fodinfaRate: 0.005, scenario: "target" };
  },

  save() {
    try { localStorage.setItem(ERP_STORAGE_KEY, JSON.stringify(this.state)); } catch (e) { /* modo archivo sin storage */ }
  },

  reset() {
    if (!confirm("¿Reiniciar la simulación ERP? Se perderán todas las operaciones registradas y volverá al estado inicial de GLOWTEX S.A.S.")) return;
    this.state = this.buildSeedState();
    this.save();
    this.renderAll();
    this.toast("Simulación ERP reiniciada al estado inicial.", "ok");
  },

  exportJSON() {
    const data = JSON.stringify(this.state, null, 2);
    const blob = new Blob([data], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "GLOWTEX_ERP_estado_" + this.today() + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
    this.toast("Estado del ERP exportado en JSON.", "ok");
  },

  // ==================== CONTABLE: DOBLE ENTRADA ====================
  addJournal(s, concept, debitAccount, creditAccount, amount, ref) {
    const id = "AS-" + String(s.sequences.je++).padStart(4, "0");
    s.journal.unshift({
      id, date: this.today(), concept, debitAccount, creditAccount,
      amount: Number(amount || 0), ref: ref || ""
    });
  },

  log(s, text, kind) {
    s.activities.unshift({ time: this.timeNow(), date: this.today(), text, kind: kind || "info" });
    if (s.activities.length > 80) s.activities.length = 80;
  },

  // ==================== SEMILLA INICIAL ====================
  buildSeedState() {
    const s = {
      company: {
        name: "GLOWTEX S.A.S.",
        ruc: "0993456789001",
        regimen: "Régimen General - Contribuyente Autorizado SRI",
        address: "Av. 10 de Agosto y El Inca, Quito, Ecuador",
        showroom: "120 m² - Bodega Quito",
        compliance: ["RUC activo", "Token firma electrónica SRI", "Registro ECUAPASS SENAE", "COMEX 401 MPCEIP", "RTE INEN 1875", "SENADI marca registrada"]
      },
      cash: 15000,
      fixedAssets: 85000,
      capital: 100000,
      openingInventory: 0,
      retainedEarnings: 0,
      inventory: {},
      salesOrders: [],
      purchaseOrders: [],
      journal: [],
      activities: [],
      payrollRuns: [],
      sequences: { so: 1042, po: 87, inv: 12, je: 1 },
      params: { ivaRate: 0.15, fodinfaRate: 0.005, scenario: "target" }
    };

    (typeof GLOWTEX_PRODUCTS !== "undefined" ? GLOWTEX_PRODUCTS : []).forEach(p => {
      s.inventory[p.sku] = {
        sku: p.sku,
        stock: p.stock,
        unitCost: p.unitCostEc,
        dailySales: Math.max(1, Math.round(p.reorderPoint / p.leadTimeDays))
      };
    });
    s.openingInventory = Object.values(s.inventory).reduce((a, i) => a + i.stock * i.unitCost, 0);

    this.addJournal(s, "Capital inicial GLOWTEX S.A.S. (capital de trabajo)", "Efectivo", "Capital Social", 15000, "APERTURA-01");
    this.addJournal(s, "Adecuación showroom, bodega, plataforma y branding", "Activos Fijos", "Capital Social", 85000, "APERTURA-02");
    this.addJournal(s, "Inventario inicial de 150 SKUs en Bodega Quito", "Inventario", "Capital Social", s.openingInventory, "APERTURA-03");
    this.log(s, "Apertura del ejercicio: capital de $100.000 USD e inventario inicial registrados.", "ok");

    // Ventas iniciales (2 pagadas, 1 por cobrar)
    this.postSale(s, { customer: "Confecciones Andinas S.A.S.", ruc: "0992001122001", channel: "B2B", sku: "DEP-001", qty: 60, unitPrice: 7.90, status: "Pagado" }, true, "2026-11-18");
    this.postSale(s, { customer: "Hotel Quito Royal Suites", ruc: "0991234567001", channel: "B2B", sku: "HOT-001", qty: 120, unitPrice: 5.40, status: "Pagado" }, true, "2026-11-20");
    this.postSale(s, { customer: "Taller Diseño Carolina", ruc: "0991456789001", channel: "B2C", sku: "PRE-001", qty: 18, unitPrice: 15.50, status: "Facturado" }, true, "2026-11-21");

    // Orden de compra internacional ya nacionalizada y recibida (CxP abierta)
    const poSeed = {
      id: "OC-0087",
      date: "2026-10-22",
      supplierId: "jack",
      supplierName: "Jack Technology Co., Ltd.",
      sku: "MAQ-001",
      name: "Máquina Recta Industrial Jack F5 Servo Direct Drive",
      qty: 5,
      unitPriceFob: 240,
      incoterm: "FOB",
      origin: "China",
      status: "En tránsito",
      estimate: null,
      payable: 0,
      landedUnitCost: 0,
      duties: null
    };
    const landed = this.calcLanded(poSeed);
    poSeed.estimate = landed;
    poSeed.landedUnitCost = landed.unitLandedCost;
    poSeed.payable = 0;
    poSeed.duties = null; // El crédito fiscal se reconoce al recibir/desaduanar
    s.purchaseOrders.unshift(poSeed);
    this.addJournal(s, "OC-0087 Maquinaria Jack F5 en tránsito (FOB China)", "Inventario en Tránsito", "Cuentas por Pagar", landed.fob, poSeed.id);
    this.log(s, "OC-0087 de maquinaria Jack en tránsito marítimo (45 días).", "info");

    return s;
  },

  // ==================== MOTOR DE COSTEO (usa Gemelo Digital) ====================
  calcLanded(po) {
    const product = (typeof GLOWTEX_PRODUCTS !== "undefined" ? GLOWTEX_PRODUCTS : []).find(p => p.sku === po.sku);
    const fob = Number(po.qty) * Number(po.unitPriceFob);
    const freight = fob * 0.15;
    const insurance = fob * 0.01;
    const capitalGood = product && product.division === "machinery";
    if (typeof DigitalTwinEngine !== "undefined") {
      return DigitalTwinEngine.calculateSenaeDuties({
        fob, freight, insurance,
        origin: po.origin,
        adValoremRate: capitalGood ? 0 : 10,
        units: po.qty,
        isCapitalGood: capitalGood,
        hasTlcCertificate: true
      });
    }
    const cif = fob + freight + insurance;
    return { fob, freight, insurance, cif, adValorem: 0, fodinfa: cif * 0.005, iva: cif * 0.005 * 0.15, totalLandedCostQuito: cif * 1.02, unitLandedCost: cif * 1.02 / po.qty, totalDuties: cif * 0.005 * 1.15, appliedRule: "Estimación base" };
  },

  // ==================== OPERACIONES DE VENTA ====================
  postSale(s, data, silent, dateOverride) {
    const p = (typeof GLOWTEX_PRODUCTS !== "undefined" ? GLOWTEX_PRODUCTS : []).find(x => x.sku === data.sku);
    if (!p) return null;
    const qty = Math.max(1, parseInt(data.qty, 10) || 1);
    const price = Math.max(0, Number(data.unitPrice) || 0);
    const inv = s.inventory[p.sku];
    if (!inv || inv.stock < qty) return null;

    const subtotal = qty * price;
    const iva = subtotal * s.params.ivaRate;
    const total = subtotal + iva;
    const cogs = qty * inv.unitCost;
    const status = data.status || "Facturado";
    const invoice = "001-001-" + String(s.sequences.inv++).padStart(9, "0");
    const id = "SO-" + s.sequences.so++;
    const date = dateOverride || this.today();

    const order = {
      id, date, customer: data.customer || "Cliente General", ruc: data.ruc || "-",
      channel: data.channel || "B2B", sku: p.sku, name: p.name,
      qty, unitPrice: price, subtotal, iva, total, cogs,
      status, invoice, paid: status === "Pagado"
    };
    s.salesOrders.unshift(order);

    inv.stock -= qty;
    this.addJournal(s, `Factura ${invoice} · ${p.sku} (${qty} ${p.unit})`, status === "Pagado" ? "Efectivo" : "Cuentas por Cobrar", "Ventas", subtotal, id);
    this.addJournal(s, `IVA 15% factura ${invoice}`, status === "Pagado" ? "Efectivo" : "Cuentas por Cobrar", "IVA Ventas", iva, id);
    this.addJournal(s, `Costo de ventas ${p.sku}`, "Costo de Ventas", "Inventario", cogs, id);
    if (status === "Pagado") {
      s.cash += total;
    }
    this.log(s, `Venta ${id} · ${p.sku} x${qty} · Factura SRI ${invoice} (${this.money(total)})`, "ok");
    if (!silent) this.save();
    return order;
  },

  createSale() {
    const val = id => (document.getElementById(id)?.value || "").trim();
    const customer = val("erp-so-customer");
    const ruc = val("erp-so-ruc");
    const channel = val("erp-so-channel") || "B2B";
    const sku = val("erp-so-product");
    const qty = parseInt(val("erp-so-qty"), 10);
    const price = Number(val("erp-so-price"));

    if (!customer) { this.toast("Ingrese el nombre del cliente.", "bad"); return; }
    if (!sku || !qty || qty < 1 || !price || price < 0) { this.toast("Revise producto, cantidad y precio.", "bad"); return; }
    const inv = this.state.inventory[sku];
    if (!inv || inv.stock < qty) { this.toast("Stock insuficiente en Bodega Quito para " + sku + ".", "bad"); return; }

    const order = this.postSale(this.state, { customer, ruc, channel, sku, qty, unitPrice: price, status: "Facturado" }, false);
    if (order) {
      this.renderAll();
      this.toast(`Factura ${order.invoice} emitida por ${this.money(order.total)}.`, "ok");
      const form = document.getElementById("erp-so-form");
      if (form) form.reset();
      this.updateSalePreview();
    }
  },

  collectSale(id) {
    const order = this.state.salesOrders.find(o => o.id === id);
    if (!order || order.paid) return;
    order.paid = true;
    order.status = "Pagado";
    this.state.cash += order.total;
    this.addJournal(this.state, `Cobro factura ${order.invoice} · ${order.customer}`, "Efectivo", "Cuentas por Cobrar", order.total, order.id);
    this.log(this.state, `Cobro recibido de ${order.customer} por ${this.money(order.total)}.`, "ok");
    this.save();
    this.renderAll();
    this.toast("CxC cancelada. Efectivo actualizado.", "ok");
  },

  shipSale(id) {
    const order = this.state.salesOrders.find(o => o.id === id);
    if (!order || order.status !== "Facturado") return;
    order.status = "Despachado";
    this.log(this.state, `Pedido ${order.id} despachado desde Bodega Quito.`, "info");
    this.save();
    this.renderAll();
  },

  // ==================== OPERACIONES DE COMPRA / IMPORTACIÓN ====================
  createPO() {
    const val = id => (document.getElementById(id)?.value || "").trim();
    const supplierId = val("erp-po-supplier");
    const sku = val("erp-po-product");
    const qty = parseInt(val("erp-po-qty"), 10);
    const price = Number(val("erp-po-price"));
    const incoterm = val("erp-po-incoterm") || "FOB";
    const supplier = (typeof GLOWTEX_SUPPLIERS !== "undefined" ? GLOWTEX_SUPPLIERS : []).find(x => x.id === supplierId);
    const product = (typeof GLOWTEX_PRODUCTS !== "undefined" ? GLOWTEX_PRODUCTS : []).find(x => x.sku === sku);
    if (!supplier || !product || !qty || qty < 1 || !price || price <= 0) {
      this.toast("Revise proveedor, producto, cantidad y precio FOB.", "bad"); return;
    }
    const origin = supplier.country.split(" ")[0];
    const po = {
      id: "OC-" + this.state.sequences.po++,
      date: this.today(), supplierId, supplierName: supplier.name,
      sku, name: product.name, qty, unitPriceFob: price, incoterm, origin,
      status: "Borrador", estimate: null, payable: 0, landedUnitCost: 0, duties: null
    };
    po.estimate = this.calcLanded(po);
    this.state.purchaseOrders.unshift(po);
    this.log(this.state, `${po.id} creada a ${supplier.name} · ${sku} x${qty} (Incoterm ${incoterm}).`, "info");
    this.save();
    this.renderAll();
    this.toast(`${po.id} creada. Costo puesto en Quito estimado: ${this.money(po.estimate.totalLandedCostQuito)}.`, "ok");
  },

  advancePO(id) {
    const po = this.state.purchaseOrders.find(o => o.id === id);
    if (!po) return;
    const flow = ["Borrador", "Aprobada", "En tránsito", "Desaduanada", "Recibida"];
    const i = flow.indexOf(po.status);
    if (i < 0 || i >= flow.length - 1) return;
    po.estimate = this.calcLanded(po);
    po.status = flow[i + 1];
    if (po.status === "Aprobada") {
      this.log(this.state, `${po.id} aprobada. RFQ y anticipo bancario gestionados.`, "info");
    } else if (po.status === "En tránsito") {
      const supplier = (typeof GLOWTEX_SUPPLIERS !== "undefined" ? GLOWTEX_SUPPLIERS : []).find(x => x.id === po.supplierId);
      this.log(this.state, `${po.id} en tránsito · ${supplier ? supplier.leadTimeDays : 35} días estimados hasta Quito.`, "info");
    } else if (po.status === "Desaduanada") {
      this.log(this.state, `${po.id} desaduanada en ECUAPASS · tributos ${this.money(po.estimate.totalDuties)}.`, "info");
    } else if (po.status === "Recibida") {
      this.receivePO(po);
    }
    this.save();
    this.renderAll();
    this.toast(`${po.id} avanzó a: ${po.status}.`, "ok");
  },

  receivePO(po) {
    const landed = this.calcLanded(po);
    po.duties = landed;
    po.estimate = landed;
    po.landedUnitCost = landed.unitLandedCost;
    po.payable = landed.totalLandedCostQuito + landed.iva;
    const inv = this.state.inventory[po.sku];
    if (inv) {
      const totalOld = inv.stock * inv.unitCost;
      inv.stock += po.qty;
      inv.unitCost = (totalOld + landed.totalLandedCostQuito) / inv.stock;
    }
    this.addJournal(this.state, `Recepción ${po.id} · ${po.sku} x${po.qty} en Bodega Quito`, "Inventario", "Cuentas por Pagar", landed.totalLandedCostQuito, po.id);
    this.addJournal(this.state, `IVA importación ${po.id} (crédito fiscal)`, "IVA Compras", "Cuentas por Pagar", landed.iva, po.id);
    this.log(this.state, `${po.id} recibida en Bodega Quito · ${po.qty} uds · CxC proveedor ${this.money(po.payable)}.`, "ok");
  },

  payPO(id) {
    const po = this.state.purchaseOrders.find(o => o.id === id);
    if (!po || po.status !== "Recibida" || po.paid) return;
    if (this.state.cash < po.payable) { this.toast("Efectivo insuficiente para cancelar la orden de compra.", "bad"); return; }
    po.paid = true;
    po.status = "Pagada";
    this.state.cash -= po.payable;
    this.addJournal(this.state, `Pago a proveedor ${po.supplierName} · ${po.id}`, "Cuentas por Pagar", "Efectivo", po.payable, po.id);
    this.log(this.state, `Pago de ${this.money(po.payable)} a ${po.supplierName} (${po.id}).`, "ok");
    this.save();
    this.renderAll();
    this.toast("Orden de compra cancelada al proveedor.", "ok");
  },

  generateRFQFromROP(sku) {
    const p = (typeof GLOWTEX_PRODUCTS !== "undefined" ? GLOWTEX_PRODUCTS : []).find(x => x.sku === sku);
    if (!p) return;
    const inv = this.state.inventory[sku];
    const qty = Math.max(p.moqB2B || 1, (p.rollSize || 1) * 5);
    const suppliers = (typeof GLOWTEX_SUPPLIERS !== "undefined" ? GLOWTEX_SUPPLIERS : []).filter(x => p.origin.includes(x.country.split(" ")[0]));
    const supplier = suppliers[0] || GLOWTEX_SUPPLIERS[0];
    document.getElementById("erp-po-supplier").value = supplier.id;
    document.getElementById("erp-po-product").value = sku;
    document.getElementById("erp-po-qty").value = qty;
    document.getElementById("erp-po-price").value = p.fobPrice;
    this.updatePOPreview();
    this.toast(`RFQ precargada: ${sku} · ${qty} uds · ${supplier.name}.`, "ok");
    this.switchModule("compras");
    document.getElementById("erp-po-form")?.scrollIntoView({ behavior: "smooth", block: "center" });
  },

  // ==================== NÓMINA ====================
  processPayroll() {
    const s = this.state;
    const total = s.payroll.reduce((a, e) => a + e.salary, 0);
    const iessEmp = total * 0.0945;
    const iessPat = total * 0.1215;
    const provisiones = total * 0.25; // 13er, 14to sueldos, vacaciones, indemnización
    const costoTotal = total + iessPat + provisiones;
    if (s.cash < costoTotal) { this.toast("Efectivo insuficiente para procesar la nómina.", "bad"); return; }
    s.cash -= costoTotal;
    const run = { id: this.uid("NOM"), date: this.today(), gross: total, iessEmp, iessPat, provisiones, net: total - iessEmp, totalCost: costoTotal, employees: s.payroll.length };
    s.payrollRuns.unshift(run);
    this.addJournal(s, `Nómina mensual GLOWTEX · ${s.payroll.length} colaboradores`, "Gastos de Personal", "Efectivo", costoTotal, run.id);
    this.log(s, `Nómina procesada: ${this.money(costoTotal)} (incluye IESS patronal y provisiones).`, "ok");
    this.save();
    this.renderAll();
    this.toast(`Nómina de ${this.money(costoTotal)} procesada y contabilizada.`, "ok");
  },

  // ==================== CÁLCULOS FINANCIEROS ====================
  totals() {
    const s = this.state;
    const cxc = s.salesOrders.filter(o => !o.paid).reduce((a, o) => a + o.total, 0);
    const cxp = s.purchaseOrders.filter(o => o.status === "Recibida" && !o.paid).reduce((a, o) => a + o.payable, 0);
    const inventoryValue = Object.values(s.inventory).reduce((a, i) => a + i.stock * i.unitCost, 0);
    const sales = s.salesOrders.reduce((a, o) => a + o.subtotal, 0);
    const cogs = s.salesOrders.reduce((a, o) => a + o.cogs, 0);
    const ivaVentas = s.salesOrders.reduce((a, o) => a + o.iva, 0);
    const ivaCompras = s.purchaseOrders.filter(o => o.duties).reduce((a, o) => a + (o.duties.iva || 0), 0);
    const payrollCost = s.payrollRuns.reduce((a, r) => a + r.totalCost, 0);
    const activos = s.cash + cxc + inventoryValue + s.fixedAssets;
    const pasivos = cxp + Math.max(0, ivaVentas - ivaCompras);
    const patrimonio = s.capital + (s.openingInventory || 0) + s.retainedEarnings + (sales - cogs - payrollCost);
    return { cxc, cxp, inventoryValue, sales, cogs, grossProfit: sales - cogs, ivaVentas, ivaCompras, ivaAPagar: Math.max(0, ivaVentas - ivaCompras), payrollCost, activos, pasivos, patrimonio };
  },

  inventoryRows() {
    const t = this;
    return (typeof GLOWTEX_PRODUCTS !== "undefined" ? GLOWTEX_PRODUCTS : []).map(p => {
      const inv = this.state.inventory[p.sku] || { stock: 0, unitCost: 0, dailySales: 1 };
      const daily = inv.dailySales || 1;
      let status = "ok", label = "Óptimo";
      if (inv.stock <= 0) { status = "bad"; label = "Quiebre"; }
      else if (inv.stock <= p.reorderPoint) { status = "warn"; label = "Reordenar"; }
      else if (inv.stock <= p.reorderPoint * 1.5) { status = "info"; label = "Vigilar"; }
      return {
        ...p, stock: inv.stock, unitCost: inv.unitCost || p.unitCostEc,
        rop: p.reorderPoint, dailySales: daily,
        coverage: Math.floor(inv.stock / daily),
        value: inv.stock * (inv.unitCost || p.unitCostEc),
        status, label
      };
    });
  },

  // ==================== RENDER GLOBAL ====================
  renderAll() {
    this.normalize();
    this.renderDashboard();
    this.renderInventory();
    this.renderPurchases();
    this.renderSales();
    this.renderFinance();
    this.renderHR();
    this.renderConfig();
    this.updatePOPreview();
    this.updateSalePreview();
    const badge = document.getElementById("erp-header-status");
    if (badge) badge.textContent = "ERP Operativo · " + this.today();
  },

  switchModule(module) {
    this.activeModule = module;
    document.querySelectorAll(".erp-tab-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-erp-module") === module));
    document.querySelectorAll(".erp-module").forEach(m => m.classList.toggle("hidden-view", m.id !== "erp-module-" + module));
    if (module === "dashboard") this.renderChart();
  },

  // ==================== 1. DASHBOARD ====================
  renderDashboard() {
    const t = this.totals();
    const rows = this.inventoryRows();
    const alerts = rows.filter(r => r.status === "warn" || r.status === "bad");
    const activePO = this.state.purchaseOrders.filter(o => ["Borrador", "Aprobada", "En tránsito", "Desaduanada"].includes(o.status)).length;
    const kpis = document.getElementById("erp-dashboard-kpis");
    if (kpis) {
      kpis.innerHTML = `
        <div class="erp-kpi-card dark">
          <div class="erp-kpi-label"><i class="fas fa-wallet"></i> Efectivo disponible</div>
          <div class="erp-kpi-value">${this.money(this.state.cash)}</div>
          <div class="erp-kpi-hint">Capital de trabajo + operaciones</div>
        </div>
        <div class="erp-kpi-card">
          <div class="erp-kpi-label"><i class="fas fa-chart-line"></i> Ventas registradas</div>
          <div class="erp-kpi-value">${this.money(t.sales)}</div>
          <div class="erp-kpi-hint">${this.state.salesOrders.length} facturas SRI emitidas</div>
        </div>
        <div class="erp-kpi-card success">
          <div class="erp-kpi-label"><i class="fas fa-coins"></i> Utilidad bruta</div>
          <div class="erp-kpi-value">${this.money(t.grossProfit)}</div>
          <div class="erp-kpi-hint">Margen ${t.sales ? (t.grossProfit / t.sales * 100).toFixed(1) : "0.0"}%</div>
        </div>
        <div class="erp-kpi-card">
          <div class="erp-kpi-label"><i class="fas fa-boxes"></i> Inventario valorizado</div>
          <div class="erp-kpi-value">${this.money(t.inventoryValue)}</div>
          <div class="erp-kpi-hint">${this.num(Object.keys(this.state.inventory).length)} SKUs en Bodega Quito</div>
        </div>
        <div class="erp-kpi-card ${t.cxc > 0 ? "" : "success"}">
          <div class="erp-kpi-label"><i class="fas fa-hand-holding-usd"></i> Cuentas por cobrar</div>
          <div class="erp-kpi-value">${this.money(t.cxc)}</div>
          <div class="erp-kpi-hint">${this.state.salesOrders.filter(o => !o.paid).length} facturas pendientes</div>
        </div>
        <div class="erp-kpi-card ${t.cxp > 0 ? "danger" : ""}">
          <div class="erp-kpi-label"><i class="fas fa-file-invoice-dollar"></i> Cuentas por pagar</div>
          <div class="erp-kpi-value">${this.money(t.cxp)}</div>
          <div class="erp-kpi-hint">${this.state.purchaseOrders.filter(o => o.status === "Recibida" && !o.paid).length} proveedores</div>
        </div>
        <div class="erp-kpi-card">
          <div class="erp-kpi-label"><i class="fas fa-ship"></i> Importaciones activas</div>
          <div class="erp-kpi-value">${activePO}</div>
          <div class="erp-kpi-hint">Órdenes en proceso aduanero</div>
        </div>
        <div class="erp-kpi-card ${alerts.length ? "danger" : "success"}">
          <div class="erp-kpi-label"><i class="fas fa-exclamation-triangle"></i> Alertas de reorden</div>
          <div class="erp-kpi-value">${alerts.length}</div>
          <div class="erp-kpi-hint">SKUs bajo punto de reorden (ROP)</div>
        </div>
      `;
    }

    const summary = document.getElementById("erp-dashboard-summary");
    if (summary) {
      const scenario = (typeof DigitalTwinEngine !== "undefined") ? DigitalTwinEngine.getFinancialScenarios()[this.state.params.scenario] : null;
      summary.innerHTML = `
        <div class="erp-section-label">Entorno de simulación</div>
        <div class="erp-mini-stat"><span>Empresa</span><strong>${this.esc(this.state.company.name)}</strong></div>
        <div class="erp-mini-stat"><span>RUC / Régimen</span><strong>${this.esc(this.state.company.ruc)}</strong></div>
        <div class="erp-mini-stat"><span>IVA Ecuador</span><strong>${(this.state.params.ivaRate * 100).toFixed(0)}%</strong></div>
        <div class="erp-mini-stat"><span>FODINFA</span><strong>${(this.state.params.fodinfaRate * 100).toFixed(1)}%</strong></div>
        <div class="erp-mini-stat"><span>Escenario gemelo digital</span><strong>${scenario ? this.esc(scenario.name) : this.esc(this.state.params.scenario)}</strong></div>
        <div class="erp-mini-stat"><span>Ejercicio</span><strong>${this.today()}</strong></div>
        <div style="margin-top:16px;">
          <button class="erp-btn erp-btn-outline erp-btn-sm" onclick="ERP.exportJSON()"><i class="fas fa-download"></i> Exportar estado</button>
        </div>
      `;
    }

    const alertsBox = document.getElementById("erp-dashboard-alerts");
    if (alertsBox) {
      alertsBox.innerHTML = alerts.length
        ? alerts.slice(0, 6).map(r => `
            <div class="erp-alert ${r.status === "bad" ? "bad" : ""}">
              <strong>${r.sku}</strong> · ${this.esc(r.name)}<br>
              Stock ${this.num(r.stock)} ${r.unit} · ROP ${this.num(r.rop)} · Cobertura ${r.coverage} días.
              <div style="margin-top:8px;">
                <button class="erp-btn erp-btn-gold erp-btn-sm" onclick="ERP.generateRFQFromROP('${r.sku}')">
                  <i class="fas fa-file-contract"></i> Generar RFQ
                </button>
              </div>
            </div>`).join("")
        : `<div class="erp-alert ok"><strong>Sin alertas.</strong> Todos los SKUs superan su punto de reorden.</div>`;
    }

    const activity = document.getElementById("erp-dashboard-activity");
    if (activity) {
      activity.innerHTML = this.state.activities.length
        ? `<ul class="erp-activity-list">${this.state.activities.slice(0, 12).map(a => `
            <li>
              <span class="erp-activity-time">${a.time}</span>
              <span><i class="fas ${a.kind === "ok" ? "fa-check-circle" : a.kind === "bad" ? "fa-exclamation-circle" : "fa-info-circle"}" style="color:${a.kind === "ok" ? "#059669" : a.kind === "bad" ? "#E11D48" : "#C5A880"};margin-right:6px;"></i>${this.esc(a.text)}</span>
            </li>`).join("")}</ul>`
        : `<div class="erp-empty"><i class="fas fa-history"></i>Sin movimientos registrados.</div>`;
    }
    this.renderChart();
  },

  renderChart() {
    const canvas = document.getElementById("erp-dashboard-chart");
    if (!canvas || typeof Chart === "undefined") return;
    const months = ["Jun", "Jul", "Ago", "Sep", "Oct", "Nov"];
    const ventas = [0, 0, 0, 0, 0, 0];
    const compras = [0, 0, 0, 0, 0, 0];
    this.state.salesOrders.forEach(o => {
      const m = parseInt((o.date || "").slice(5, 7), 10) - 1;
      if (m >= 0 && m < 6) ventas[m] += o.total;
    });
    this.state.purchaseOrders.forEach(o => {
      const m = parseInt((o.date || "").slice(5, 7), 10) - 1;
      if (m >= 0 && m < 6) compras[m] += o.payable || o.estimate?.totalLandedCostQuito || 0;
    });
    if (this.chart) this.chart.destroy();
    this.chart = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: months,
        datasets: [
          { label: "Facturación (USD)", data: ventas, backgroundColor: "#111111", borderRadius: 2 },
          { label: "Compras / Importaciones (USD)", data: compras, backgroundColor: "#C5A880", borderRadius: 2 }
        ]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { position: "top", labels: { boxWidth: 12, font: { size: 10 } } } },
        scales: { y: { beginAtZero: true, ticks: { callback: v => "$" + (v / 1000) + "k" } } }
      }
    });
  },

  // ==================== 2. INVENTARIO ====================
  renderInventory() {
    const search = (document.getElementById("erp-inv-search")?.value || "").toLowerCase();
    const division = document.getElementById("erp-inv-division")?.value || "all";
    const rows = this.inventoryRows().filter(r =>
      (division === "all" || r.division === division) &&
      (!search || r.name.toLowerCase().includes(search) || r.sku.toLowerCase().includes(search))
    );
    const body = document.getElementById("erp-inventory-body");
    if (body) {
      body.innerHTML = rows.length ? rows.map(r => `
        <tr>
          <td><span class="erp-code">${r.sku}</span><br><strong style="color:#111111;font-size:0.78rem;">${this.esc(r.name)}</strong></td>
          <td>${this.esc(r.divisionName)}</td>
          <td class="num strong">${this.num(r.stock)} ${this.esc(r.unit)}</td>
          <td class="num">${this.num(r.rop)}</td>
          <td class="num">${r.coverage} días</td>
          <td class="num">${this.money(r.unitCost)}</td>
          <td class="num strong">${this.money(r.value)}</td>
          <td><span class="erp-badge ${r.status}">${r.label}</span></td>
          <td>
            <button class="erp-btn erp-btn-outline erp-btn-sm" onclick="ERP.generateRFQFromROP('${r.sku}')" title="Generar orden de compra">
              <i class="fas fa-shopping-cart"></i> OC
            </button>
          </td>
        </tr>`).join("") : `<tr><td colspan="9" class="erp-empty">No hay SKUs que coincidan con el filtro.</td></tr>`;
    }
    const all = this.inventoryRows();
    const totalValue = all.reduce((a, r) => a + r.value, 0);
    const critical = all.filter(r => r.status === "bad" || r.status === "warn").length;
    const summary = document.getElementById("erp-inv-summary");
    if (summary) {
      summary.innerHTML = `
        <div class="erp-mini-stat"><span>Referencias activas</span><strong>${this.num(all.length)} SKUs</strong></div>
        <div class="erp-mini-stat"><span>Valor total Bodega Quito</span><strong>${this.money(totalValue)}</strong></div>
        <div class="erp-mini-stat"><span>Unidades en stock</span><strong>${this.num(all.reduce((a, r) => a + r.stock, 0))}</strong></div>
        <div class="erp-mini-stat"><span>SKUs en reorden / quiebre</span><strong style="color:${critical ? "#E11D48" : "#059669"};">${critical}</strong></div>
        <div class="erp-mini-stat"><span>Modelo de reposición</span><strong>ROP = (D × L) + SS</strong></div>
      `;
    }
  },

  // ==================== 3. COMPRAS E IMPORTACIONES ====================
  updatePOPreview() {
    const box = document.getElementById("erp-po-preview");
    if (!box) return;
    const supplier = (typeof GLOWTEX_SUPPLIERS !== "undefined" ? GLOWTEX_SUPPLIERS : []).find(x => x.id === document.getElementById("erp-po-supplier")?.value);
    const sku = document.getElementById("erp-po-product")?.value;
    const qty = parseInt(document.getElementById("erp-po-qty")?.value, 10) || 0;
    const price = Number(document.getElementById("erp-po-price")?.value) || 0;
    if (!supplier || !sku || !qty || !price) { box.innerHTML = `<div class="erp-alert">Seleccione proveedor, SKU, cantidad y precio FOB para estimar la nacionalización.</div>`; return; }
    const origin = supplier.country.split(" ")[0];
    const r = this.calcLanded({ sku, qty, unitPriceFob: price, origin });
    box.innerHTML = `
      <div class="erp-mini-stat"><span>Valor FOB</span><strong>${this.money(r.fob)}</strong></div>
      <div class="erp-mini-stat"><span>Valor CIF (flete + seguro)</span><strong>${this.money(r.cif)}</strong></div>
      <div class="erp-mini-stat"><span>Ad Valorem + FODINFA</span><strong>${this.money(r.adValorem + r.fodinfa)}</strong></div>
      <div class="erp-mini-stat"><span>IVA importación (crédito fiscal)</span><strong>${this.money(r.iva)}</strong></div>
      <div class="erp-mini-stat"><span>Costo puesto en Quito</span><strong>${this.money(r.totalLandedCostQuito)}</strong></div>
      <div class="erp-mini-stat"><span>Factor K (Costo / FOB)</span><strong>${r.factorNacionalizacion.toFixed(3)}x</strong></div>
      <div class="erp-mini-stat"><span>Costo unitario nacionalizado</span><strong style="color:#0284C7;">${this.money(r.unitLandedCost)}</strong></div>
      <div style="font-size:0.75rem;color:#6B7280;margin-top:8px;"><i class="fas fa-info-circle"></i> ${this.esc(r.appliedRule)} · Lead time ${supplier.leadTimeDays} días</div>
    `;
  },

  renderPurchases() {
    const body = document.getElementById("erp-po-body");
    if (body) {
      body.innerHTML = this.state.purchaseOrders.length ? this.state.purchaseOrders.map(o => {
        const est = o.duties || o.estimate || {};
        return `
        <tr>
          <td><strong class="erp-code">${o.id}</strong><br><span style="font-size:0.72rem;color:#9CA3AF;">${o.date}</span></td>
          <td>${this.esc(o.supplierName)}<br><span style="font-size:0.72rem;color:#9CA3AF;">${this.esc(o.origin)} · ${o.incoterm}</span></td>
          <td><span class="erp-code">${o.sku}</span><br><span style="font-size:0.72rem;">${o.qty} uds × ${this.money(o.unitPriceFob)} FOB</span></td>
          <td class="num">${this.money(est.cif || 0)}</td>
          <td class="num strong">${this.money(est.totalLandedCostQuito || 0)}</td>
          <td class="num">${this.money(o.payable || 0)}</td>
          <td><span class="erp-badge ${o.status === "Recibida" || o.status === "Pagada" ? "ok" : o.status === "Borrador" ? "neutral" : "info"}">${o.status}</span></td>
          <td style="white-space:nowrap;">
            ${o.status !== "Recibida" && o.status !== "Pagada" ? `<button class="erp-btn erp-btn-gold erp-btn-sm" onclick="ERP.advancePO('${o.id}')"><i class="fas fa-arrow-right"></i> Avanzar</button>` : ""}
            ${o.status === "Recibida" ? `<button class="erp-btn erp-btn-success erp-btn-sm" onclick="ERP.payPO('${o.id}')"><i class="fas fa-cash-register"></i> Pagar</button>` : ""}
            ${o.status === "Pagada" ? '<i class="fas fa-check-circle" style="color:#059669;"></i>' : ""}
          </td>
        </tr>`;
      }).join("") : `<tr><td colspan="8" class="erp-empty"><i class="fas fa-ship"></i>No hay órdenes de compra registradas.</td></tr>`;
    }
    const t = this.totals();
    const summary = document.getElementById("erp-po-summary");
    if (summary) {
      summary.innerHTML = `
        <div class="erp-mini-stat"><span>Órdenes registradas</span><strong>${this.state.purchaseOrders.length}</strong></div>
        <div class="erp-mini-stat"><span>En tránsito / aduana</span><strong>${this.state.purchaseOrders.filter(o => ["En tránsito", "Desaduanada"].includes(o.status)).length}</strong></div>
        <div class="erp-mini-stat"><span>Cuentas por pagar</span><strong>${this.money(t.cxp)}</strong></div>
        <div class="erp-mini-stat"><span>IVA importaciones (crédito)</span><strong>${this.money(t.ivaCompras)}</strong></div>
        <div class="erp-mini-stat"><span>Tributos pagados a SENAE</span><strong>${this.money(this.state.purchaseOrders.filter(o => o.duties).reduce((a, o) => a + (o.duties.totalDuties || 0), 0))}</strong></div>
      `;
    }
    const selS = document.getElementById("erp-po-supplier");
    const selP = document.getElementById("erp-po-product");
    if (selS && !selS.options.length && typeof GLOWTEX_SUPPLIERS !== "undefined") {
      selS.innerHTML = GLOWTEX_SUPPLIERS.map(s => `<option value="${s.id}">${this.esc(s.name)} (${this.esc(s.country)})</option>`).join("");
    }
    if (selP && !selP.options.length && typeof GLOWTEX_PRODUCTS !== "undefined") {
      selP.innerHTML = GLOWTEX_PRODUCTS.map(p => `<option value="${p.sku}">${p.sku} · ${this.esc(p.name)}</option>`).join("");
    }
  },

  // ==================== 4. VENTAS ====================
  updateSalePreview() {
    const box = document.getElementById("erp-so-preview");
    if (!box) return;
    const sku = document.getElementById("erp-so-product")?.value;
    const qty = parseInt(document.getElementById("erp-so-qty")?.value, 10) || 0;
    const price = Number(document.getElementById("erp-so-price")?.value) || 0;
    const p = (typeof GLOWTEX_PRODUCTS !== "undefined" ? GLOWTEX_PRODUCTS : []).find(x => x.sku === sku);
    if (!p || !qty || !price) { box.innerHTML = `<div class="erp-alert">Seleccione producto, cantidad y precio para simular la factura SRI.</div>`; return; }
    const inv = this.state.inventory[sku] || { stock: 0 };
    const sub = qty * price, iva = sub * this.state.params.ivaRate;
    box.innerHTML = `
      <div class="erp-mini-stat"><span>Disponible en bodega</span><strong>${this.num(inv.stock)} ${this.esc(p.unit)}</strong></div>
      <div class="erp-mini-stat"><span>Subtotal (${qty} × ${this.money(price)})</span><strong>${this.money(sub)}</strong></div>
      <div class="erp-mini-stat"><span>IVA 15%</span><strong>${this.money(iva)}</strong></div>
      <div class="erp-mini-stat"><span>Total factura</span><strong style="color:#111111;">${this.money(sub + iva)}</strong></div>
      <div class="erp-mini-stat"><span>Costo de venta estimado</span><strong>${this.money(qty * (inv.unitCost || p.unitCostEc))}</strong></div>
      <div class="erp-mini-stat"><span>Margen bruto</span><strong style="color:#059669;">${this.money(sub - qty * (inv.unitCost || p.unitCostEc))}</strong></div>
    `;
  },

  renderSales() {
    const body = document.getElementById("erp-so-body");
    if (body) {
      body.innerHTML = this.state.salesOrders.length ? this.state.salesOrders.map(o => `
        <tr>
          <td><strong class="erp-code">${o.id}</strong><br><span style="font-size:0.72rem;color:#9CA3AF;">${o.date}</span></td>
          <td><strong style="color:#111111;">${this.esc(o.customer)}</strong><br><span style="font-size:0.72rem;color:#9CA3AF;">${this.esc(o.ruc)} · ${o.channel}</span></td>
          <td><span class="erp-code">${o.sku}</span><br><span style="font-size:0.72rem;">${o.qty} × ${this.money(o.unitPrice)}</span></td>
          <td class="num">${this.money(o.subtotal)}</td>
          <td class="num">${this.money(o.iva)}</td>
          <td class="num strong">${this.money(o.total)}</td>
          <td><span style="font-size:0.7rem;font-family:monospace;">${o.invoice}</span></td>
          <td><span class="erp-badge ${o.paid ? "ok" : o.status === "Despachado" ? "info" : "warn"}">${o.status}</span></td>
          <td style="white-space:nowrap;">
            ${o.status === "Facturado" ? `<button class="erp-btn erp-btn-outline erp-btn-sm" onclick="ERP.shipSale('${o.id}')" title="Despachar"><i class="fas fa-truck"></i></button>` : ""}
            ${!o.paid ? `<button class="erp-btn erp-btn-success erp-btn-sm" onclick="ERP.collectSale('${o.id}')"><i class="fas fa-cash-register"></i> Cobrar</button>` : '<i class="fas fa-check-circle" style="color:#059669;"></i>'}
          </td>
        </tr>`).join("") : `<tr><td colspan="9" class="erp-empty"><i class="fas fa-receipt"></i>No hay ventas registradas.</td></tr>`;
    }
    const sel = document.getElementById("erp-so-product");
    if (sel && !sel.options.length && typeof GLOWTEX_PRODUCTS !== "undefined") {
      sel.innerHTML = GLOWTEX_PRODUCTS.map(p => `<option value="${p.sku}">${p.sku} · ${this.esc(p.name)}</option>`).join("");
    }
    const t = this.totals();
    const summary = document.getElementById("erp-so-summary");
    if (summary) {
      summary.innerHTML = `
        <div class="erp-mini-stat"><span>Facturas emitidas</span><strong>${this.state.salesOrders.length}</strong></div>
        <div class="erp-mini-stat"><span>Facturación bruta</span><strong>${this.money(t.sales)}</strong></div>
        <div class="erp-mini-stat"><span>IVA ventas declarado</span><strong>${this.money(t.ivaVentas)}</strong></div>
        <div class="erp-mini-stat"><span>Cuentas por cobrar</span><strong>${this.money(t.cxc)}</strong></div>
        <div class="erp-mini-stat"><span>Utilidad bruta</span><strong style="color:#059669;">${this.money(t.grossProfit)}</strong></div>
      `;
    }
  },

  // ==================== 5. FINANZAS ====================
  renderFinance() {
    const t = this.totals();
    const kpis = document.getElementById("erp-fin-kpis");
    if (kpis) {
      kpis.innerHTML = `
        <div class="erp-kpi-card dark"><div class="erp-kpi-label"><i class="fas fa-landmark"></i> Activos totales</div><div class="erp-kpi-value">${this.money(t.activos)}</div><div class="erp-kpi-hint">Efectivo + CxC + Inventario + Activos fijos</div></div>
        <div class="erp-kpi-card danger"><div class="erp-kpi-label"><i class="fas fa-credit-card"></i> Pasivos totales</div><div class="erp-kpi-value">${this.money(t.pasivos)}</div><div class="erp-kpi-hint">CxP + IVA por pagar</div></div>
        <div class="erp-kpi-card success"><div class="erp-kpi-label"><i class="fas fa-balance-scale"></i> Patrimonio neto</div><div class="erp-kpi-value">${this.money(t.patrimonio)}</div><div class="erp-kpi-hint">Capital + resultados acumulados</div></div>
        <div class="erp-kpi-card"><div class="erp-kpi-label"><i class="fas fa-piggy-bank"></i> Efectivo</div><div class="erp-kpi-value">${this.money(this.state.cash)}</div><div class="erp-kpi-hint">Liquidez inmediata</div></div>
      `;
    }
    const journal = document.getElementById("erp-fin-journal-body");
    if (journal) {
      journal.innerHTML = this.state.journal.length ? this.state.journal.slice(0, 40).map(j => `
        <tr>
          <td class="erp-code">${j.id}</td>
          <td>${j.date}</td>
          <td>${this.esc(j.concept)}<br><span style="font-size:0.7rem;color:#9CA3AF;">${this.esc(j.ref)}</span></td>
          <td><strong>${this.esc(j.debitAccount)}</strong></td>
          <td>${this.esc(j.creditAccount)}</td>
          <td class="num strong">${this.money(j.amount)}</td>
        </tr>`).join("") : `<tr><td colspan="6" class="erp-empty">El libro diario está vacío.</td></tr>`;
    }
    const tax = document.getElementById("erp-fin-tax");
    if (tax) {
      tax.innerHTML = `
        <div class="erp-section-label">Declaración IVA · Régimen General</div>
        <div class="erp-mini-stat"><span>IVA ventas (débito fiscal)</span><strong>${this.money(t.ivaVentas)}</strong></div>
        <div class="erp-mini-stat"><span>IVA compras/importaciones (crédito fiscal)</span><strong>${this.money(t.ivaCompras)}</strong></div>
        <div class="erp-mini-stat"><span>Saldo a pagar al SRI</span><strong style="color:${t.ivaAPagar ? "#E11D48" : "#059669"};">${this.money(t.ivaAPagar)}</strong></div>
        <div class="erp-mini-stat"><span>Costo de ventas</span><strong>${this.money(t.cogs)}</strong></div>
        <div class="erp-mini-stat"><span>Gastos de nómina acumulados</span><strong>${this.money(t.payrollCost)}</strong></div>
        <div class="erp-mini-stat"><span>Utilidad bruta acumulada</span><strong>${this.money(t.grossProfit)}</strong></div>
      `;
    }
    const balances = document.getElementById("erp-fin-balances");
    if (balances) {
      const eq = t.activos - t.pasivos;
      balances.innerHTML = `
        <div class="erp-alert ${Math.abs(eq - t.patrimonio) < 1 ? "ok" : ""}">
          <strong>Verificación contable:</strong> Activos − Pasivos = ${this.money(eq)}.
          ${Math.abs(eq - t.patrimonio) < 1 ? "Cuadra con el patrimonio neto (partida doble correcta)." : "Existe una diferencia por operaciones en tránsito."}
        </div>
        <div style="font-size:0.76rem;color:#6B7280;line-height:1.6;">
          Los asientos se generan automáticamente al facturar, cobrar, recibir importaciones, pagar proveedores y procesar nómina.
        </div>
      `;
    }
  },

  // ==================== 6. RECURSOS HUMANOS ====================
  renderHR() {
    const body = document.getElementById("erp-hr-body");
    if (body) {
      body.innerHTML = this.state.payroll.map(e => `
        <tr>
          <td><strong style="color:#111111;">${this.esc(e.name)}</strong></td>
          <td>${this.esc(e.role)}</td>
          <td>${this.esc(e.area)}</td>
          <td class="num">${this.money(e.salary)}</td>
          <td class="num">${this.money(e.salary * 0.0945)}</td>
          <td class="num">${this.money(e.salary * 0.1215)}</td>
          <td class="num strong">${this.money(e.salary * 1.376)}</td>
        </tr>`).join("");
    }
    const total = this.state.payroll.reduce((a, e) => a + e.salary, 0);
    const summary = document.getElementById("erp-hr-summary");
    if (summary) {
      const last = this.state.payrollRuns[0];
      summary.innerHTML = `
        <div class="erp-mini-stat"><span>Colaboradores</span><strong>${this.state.payroll.length}</strong></div>
        <div class="erp-mini-stat"><span>Sueldo bruto mensual</span><strong>${this.money(total)}</strong></div>
        <div class="erp-mini-stat"><span>IESS personal (9.45%)</span><strong>${this.money(total * 0.0945)}</strong></div>
        <div class="erp-mini-stat"><span>IESS patronal (12.15%)</span><strong>${this.money(total * 0.1215)}</strong></div>
        <div class="erp-mini-stat"><span>Provisiones (25%)</span><strong>${this.money(total * 0.25)}</strong></div>
        <div class="erp-mini-stat"><span>Costo mensual empresa</span><strong>${this.money(total * 1.376)}</strong></div>
        <div class="erp-mini-stat"><span>Última nómina</span><strong>${last ? last.date : "Sin procesar"}</strong></div>
      `;
    }
  },

  // ==================== 7. CONFIGURACIÓN ====================
  renderConfig() {
    const box = document.getElementById("erp-config-body");
    if (!box) return;
    const c = this.state.company;
    box.innerHTML = `
      <div class="erp-form-grid">
        <div class="erp-field"><label>Empresa</label><input value="${this.esc(c.name)}" disabled></div>
        <div class="erp-field"><label>RUC</label><input value="${this.esc(c.ruc)}" disabled></div>
        <div class="erp-field"><label>Régimen tributario</label><input value="${this.esc(c.regimen)}" disabled></div>
        <div class="erp-field"><label>Showroom / Bodega</label><input value="${this.esc(c.address)}" disabled></div>
        <div class="erp-field"><label>IVA (%) - solo lectura</label><input value="${(this.state.params.ivaRate * 100).toFixed(0)}" disabled></div>
        <div class="erp-field"><label>FODINFA (%) - solo lectura</label><input value="${(this.state.params.fodinfaRate * 100).toFixed(1)}" disabled></div>
      </div>
      <div class="erp-section-label" style="margin-top:14px;">Cumplimiento normativo</div>
      <div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:18px;">
        ${c.compliance.map(x => `<span class="erp-badge ok"><i class="fas fa-check"></i> ${this.esc(x)}</span>`).join("")}
      </div>
      <hr class="erp-form-divider">
      <div class="erp-section-label">Parámetros del simulador</div>
      <div class="erp-field" style="max-width:320px;margin-bottom:14px;">
        <label>Escenario del Gemelo Digital</label>
        <select id="erp-config-scenario" onchange="ERP.changeScenario(this.value)">
          <option value="conservative" ${this.state.params.scenario === "conservative" ? "selected" : ""}>Conservador ($18k/mes)</option>
          <option value="target" ${this.state.params.scenario === "target" ? "selected" : ""}>Objetivo ($30k/mes)</option>
          <option value="expansion" ${this.state.params.scenario === "expansion" ? "selected" : ""}>Expansión ($45k/mes)</option>
        </select>
      </div>
      <div class="erp-actions-bar">
        <button class="erp-btn erp-btn-outline" onclick="ERP.exportJSON()"><i class="fas fa-download"></i> Exportar estado JSON</button>
        <button class="erp-btn erp-btn-danger" onclick="ERP.reset()"><i class="fas fa-undo"></i> Reiniciar simulación</button>
      </div>
    `;
  },

  changeScenario(scenario) {
    this.state.params.scenario = scenario;
    if (typeof AppState !== "undefined") AppState.activeScenario = scenario;
    this.save();
    this.renderAll();
    this.toast("Escenario actualizado: " + scenario + ".", "ok");
  },

  // ==================== INICIALIZACIÓN ====================
  init() {
    this.load();
    if (!this.state.payroll) {
      this.state.payroll = [
        { name: "Gerencia General", role: "Dirección Estratégica", area: "Gerencia", salary: 1800 },
        { name: "Jefe Comercial B2B", role: "Ventas y Showroom", area: "Comercial", salary: 1100 },
        { name: "Especialista Importaciones", role: "SENAE / ECUAPASS", area: "Importaciones", salary: 950 },
        { name: "Contador / Finanzas", role: "SRI y Costos", area: "Administración", salary: 900 },
        { name: "Jefe de Bodega", role: "FIFO y Despachos", area: "Operaciones", salary: 750 },
        { name: "Asesora de Showroom", role: "Atención y Muestrarios", area: "Comercial", salary: 650 },
        { name: "Soporte E-Commerce", role: "Plataforma y Digital Twin", area: "Tecnología", salary: 850 }
      ];
      this.save();
    }

    document.querySelectorAll(".erp-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => this.switchModule(btn.getAttribute("data-erp-module")));
    });

    const poForm = document.getElementById("erp-po-form");
    if (poForm) poForm.addEventListener("submit", e => { e.preventDefault(); this.createPO(); });
    ["erp-po-supplier", "erp-po-product", "erp-po-qty", "erp-po-price"].forEach(id => {
      document.getElementById(id)?.addEventListener("input", () => { this.updatePOPreview(); this.save(); });
      document.getElementById(id)?.addEventListener("change", () => this.updatePOPreview());
    });

    const soForm = document.getElementById("erp-so-form");
    if (soForm) soForm.addEventListener("submit", e => { e.preventDefault(); this.createSale(); });
    ["erp-so-product", "erp-so-qty", "erp-so-price"].forEach(id => {
      document.getElementById(id)?.addEventListener("input", () => this.updateSalePreview());
      document.getElementById(id)?.addEventListener("change", () => this.updateSalePreview());
    });

    document.getElementById("erp-inv-search")?.addEventListener("input", () => this.renderInventory());
    document.getElementById("erp-inv-division")?.addEventListener("change", () => this.renderInventory());
    document.getElementById("erp-run-payroll")?.addEventListener("click", () => this.processPayroll());

    // Carga de divisiones en el filtro de inventario
    const divSel = document.getElementById("erp-inv-division");
    if (divSel && typeof GLOWTEX_DIVISIONS !== "undefined") {
      divSel.innerHTML = `<option value="all">Todas las divisiones</option>` + GLOWTEX_DIVISIONS.filter(d => d.id !== "all")
        .map(d => `<option value="${d.id}">${this.esc(d.name)}</option>`).join("");
    }

    this.renderAll();
  }
};

window.ERP = ERP;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => ERP.init());
} else {
  ERP.init();
}
