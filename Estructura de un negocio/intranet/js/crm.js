/**
 * GLOWTEX S.A.S. | CRM Customer Relationship Management
 * Canal interno · Se integra con el ERP (intranet/js/erp.js)
 * ---------------------------------------------------------------------------
 * Clientes, leads, oportunidades, actividades, casos de postventa y campañas.
 * Una oportunidad ganada se convierte en factura del ERP automáticamente.
 */

const CRM_STORAGE_KEY = "glowtex_crm_state_v1";

const CRM = {
  state: null,
  chart: null,
  activeModule: "dashboard",

  money(v) { return "$" + Number(v || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); },
  num(v) { return Number(v || 0).toLocaleString("en-US", { maximumFractionDigits: 0 }); },
  today() { return new Date().toISOString().slice(0, 10); },
  timeNow() { return new Date().toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" }); },
  esc(str) {
    return String(str == null ? "" : str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
  },
  toast(msg, kind) {
    document.querySelectorAll(".portal-toast").forEach(t => t.remove());
    const el = document.createElement("div");
    el.className = "portal-toast";
    if (kind === "bad") el.style.borderLeftColor = "#E11D48";
    if (kind === "ok") el.style.borderLeftColor = "#059669";
    el.innerHTML = `<i class="fas ${kind === "bad" ? "fa-exclamation-triangle" : "fa-check-circle"}" style="margin-right:8px;color:var(--gold);"></i>${this.esc(msg)}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3800);
  },

  // ==================== ESTADO ====================
  load() {
    let raw = null;
    try { raw = localStorage.getItem(CRM_STORAGE_KEY); } catch (e) { raw = null; }
    if (raw) {
      try { this.state = JSON.parse(raw); this.normalize(); return; } catch (e) { /* regenera */ }
    }
    this.state = this.buildSeedState();
    this.save();
  },

  normalize() {
    const s = this.state;
    ["customers", "leads", "opportunities", "activities", "cases", "campaigns", "log"].forEach(k => { if (!Array.isArray(s[k])) s[k] = []; });
    s.sequences = s.sequences || { cli: 24, lead: 18, opp: 12, act: 30, case: 9, camp: 6 };
  },

  save() {
    try { localStorage.setItem(CRM_STORAGE_KEY, JSON.stringify(this.state)); } catch (e) { /* file:// sin storage */ }
  },

  reset() {
    if (!confirm("¿Reiniciar el CRM? Se perderán clientes, leads y oportunidades registradas.")) return;
    this.state = this.buildSeedState();
    this.save();
    this.renderAll();
    this.toast("CRM reiniciado al estado inicial.", "ok");
  },

  exportJSON() {
    const blob = new Blob([JSON.stringify(this.state, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "GLOWTEX_CRM_estado_" + this.today() + ".json";
    a.click();
    URL.revokeObjectURL(a.href);
    this.toast("Estado del CRM exportado.", "ok");
  },

  log(text, kind) {
    this.state.log.unshift({ time: this.timeNow(), text, kind: kind || "info" });
    if (this.state.log.length > 60) this.state.log.length = 60;
  },

  buildSeedState() {
    const s = {
      customers: [], leads: [], opportunities: [], activities: [], cases: [], campaigns: [], log: [],
      sequences: { cli: 24, lead: 18, opp: 12, act: 30, case: 9, camp: 6 }
    };

    // Clientes semilla: tomados de las facturas del ERP + cartera comercial real
    const erpCustomers = (typeof ERP !== "undefined" && ERP.state)
      ? ERP.state.salesOrders.map(o => ({ name: o.customer, ruc: o.ruc, channel: o.channel })) : [];
    const base = [
      ...erpCustomers,
      { name: "Confecciones Andinas S.A.S.", ruc: "0992001122001", channel: "B2B" },
      { name: "Hotel Quito Royal Suites", ruc: "0991234567001", channel: "B2B" },
      { name: "Taller Diseño Carolina", ruc: "0991456789001", channel: "B2C" },
      { name: "Textiles El Ejido Cía. Ltda.", ruc: "0991789456001", channel: "B2B" },
      { name: "Grupo Hosterías Andinas", ruc: "0991345678001", channel: "B2B" },
      { name: "Sport Line Ecuador S.A.S.", ruc: "0991901234001", channel: "B2B" },
      { name: "María José Viteri", ruc: "1712345678001", channel: "B2C" },
      { name: "Sastrería Manuel Andrade", ruc: "0991223344001", channel: "B2B" }
    ];
    const seen = new Set();
    base.forEach(c => {
      if (seen.has(c.ruc)) return;
      seen.add(c.ruc);
      s.customers.push({
        id: "CLI-" + s.sequences.cli++,
        name: c.name, ruc: c.ruc, channel: c.channel || "B2B",
        sector: c.channel === "B2C" ? "Diseñador / Taller" : "Confección y Textil",
        city: "Quito", phone: "0994450914", email: "contacto@glowtex.ec",
        status: "Activo", since: "2026-10-01",
        lifetime: (typeof ERP !== "undefined" && ERP.state)
          ? ERP.state.salesOrders.filter(o => o.customer === c.name).reduce((a, o) => a + o.total, 0) : 0
      });
    });

    s.leads = [
      { id: "LEAD-0018", name: "Ing. Roberto Cedeño", company: "Fábrica Uniformes Atuntaqui", source: "Showroom Quito", value: 4200, stage: "Calificado", owner: "Jefe Comercial", date: "2026-11-19" },
      { id: "LEAD-0017", name: "Sra. Lucía Restrepo", company: "Hotel Boutique Cuenca", source: "WhatsApp", value: 3100, stage: "Propuesta", owner: "Asesora Showroom", date: "2026-11-17" },
      { id: "LEAD-0016", name: "Carlos Mendoza", company: "Marcas Deportivas Quito", source: "Sitio Web", value: 6800, stage: "Contactado", owner: "Jefe Comercial", date: "2026-11-15" },
      { id: "LEAD-0015", name: "Diseñadora Andrea Ponce", company: "Estudio de Moda", source: "Instagram", value: 1450, stage: "Nuevo", owner: "Asesora Showroom", date: "2026-11-12" }
    ];

    s.opportunities = [
      { id: "OP-0012", customer: "Grupo Hosterías Andinas", title: "Renovación textil 4 hoteles", value: 8600, probability: 60, stage: "Propuesta", closeDate: "2026-12-15", sku: "HOT-001", qty: 200, price: 5.40, owner: "Jefe Comercial" },
      { id: "OP-0011", customer: "Sport Line Ecuador S.A.S.", title: "Lycra sublimable colección 2027", value: 5400, probability: 45, stage: "Calificada", closeDate: "2026-12-30", sku: "DEP-002", qty: 500, price: 5.50, owner: "Jefe Comercial" },
      { id: "OP-0010", customer: "Sastrería Manuel Andrade", title: "Máquina Jack A4B + insumos", value: 920, probability: 75, stage: "Negociación", closeDate: "2026-11-30", sku: "MAQ-002", qty: 1, price: 720, owner: "Asesora Showroom" }
    ];

    s.activities = [
      { id: "ACT-0030", client: "Grupo Hosterías Andinas", type: "Reunión", date: "2026-11-22", note: "Revisión de muestrarios percal 200 hilos", done: false, owner: "Jefe Comercial" },
      { id: "ACT-0029", client: "Sport Line Ecuador S.A.S.", type: "Llamada", date: "2026-11-21", note: "Confirmar volumen de lycra sublimable", done: false, owner: "Jefe Comercial" },
      { id: "ACT-0028", client: "Taller Diseño Carolina", type: "Seguimiento", date: "2026-11-18", note: "Entrega de ficha técnica Pima", done: true, owner: "Asesora Showroom" }
    ];

    s.cases = [
      { id: "CAS-0009", client: "Confecciones Andinas S.A.S.", type: "Garantía maquinaria", priority: "Alta", desc: "Revisión de tensión en Jack F5", status: "Abierto", date: "2026-11-20" },
      { id: "CAS-0008", client: "Hotel Quito Royal Suites", type: "Logística", priority: "Media", desc: "Reprogramar despacho de toallero 550g", status: "En proceso", date: "2026-11-19" },
      { id: "CAS-0007", client: "María José Viteri", type: "Consulta técnica", priority: "Baja", desc: "Dudas sobre composición de lino", status: "Resuelto", date: "2026-11-14" }
    ];

    s.campaigns = [
      { id: "CAM-0006", name: "Combo Taller Emprendedor", channel: "WhatsApp + Showroom", leads: 34, cost: 180, revenue: 1098, status: "Activa" },
      { id: "CAM-0005", name: "Descuento Dry-Fit por volumen", channel: "Email B2B", leads: 21, cost: 95, revenue: 835, status: "Activa" },
      { id: "CAM-0004", name: "Lanzamiento Jack A4B", channel: "Redes Sociales", leads: 48, cost: 260, revenue: 1440, status: "Finalizada" }
    ];

    s.log.unshift({ time: this.timeNow(), text: "CRM inicializado con cartera comercial y pipeline de oportunidades.", kind: "ok" });
    return s;
  },

  // ==================== RENDER ====================
  renderAll() {
    this.normalize();
    this.renderDashboard();
    this.renderClients();
    this.renderLeads();
    this.renderOpportunities();
    this.renderActivities();
    this.renderCases();
    this.renderCampaigns();
    this.renderIntegration();
    this.renderChart();
  },

  switchModule(module) {
    this.activeModule = module;
    document.querySelectorAll(".crm-tab-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-crm-module") === module));
    document.querySelectorAll(".crm-module").forEach(m => m.classList.toggle("hidden", m.id !== "crm-module-" + module));
    if (module === "dashboard") this.renderChart();
  },

  totals() {
    const s = this.state;
    const pipeline = s.opportunities.filter(o => o.stage !== "Ganada" && o.stage !== "Perdida");
    const weighted = pipeline.reduce((a, o) => a + o.value * o.probability / 100, 0);
    const won = s.opportunities.filter(o => o.stage === "Ganada");
    const leadsByStage = {};
    ["Nuevo", "Contactado", "Calificado", "Propuesta", "Cerrado"].forEach(st => leadsByStage[st] = s.leads.filter(l => l.stage === st).length);
    return {
      clients: s.customers.length,
      activeClients: s.customers.filter(c => c.status === "Activo").length,
      leads: s.leads.length,
      pipeline: pipeline.reduce((a, o) => a + o.value, 0),
      weighted,
      won: won.length,
      wonValue: won.reduce((a, o) => a + o.value, 0),
      conversion: (s.leads.length ? (won.length / s.leads.length * 100) : 0),
      lit: s.customers.reduce((a, c) => a + c.lifetime, 0),
      openCases: s.cases.filter(c => c.status !== "Resuelto").length,
      pendingActs: s.activities.filter(a => !a.done).length,
      leadsByStage
    };
  },

  renderDashboard() {
    const t = this.totals();
    const kpis = document.getElementById("crm-dashboard-kpis");
    if (kpis) {
      kpis.innerHTML = `
        <div class="erp-kpi-card dark"><div class="erp-kpi-label"><i class="fas fa-users"></i> Clientes registrados</div><div class="erp-kpi-value">${t.clients}</div><div class="erp-kpi-hint">${t.activeClients} activos · B2B y B2C</div></div>
        <div class="erp-kpi-card"><div class="erp-kpi-label"><i class="fas fa-user-plus"></i> Leads en cartera</div><div class="erp-kpi-value">${t.leads}</div><div class="erp-kpi-hint">Embudo de prospección</div></div>
        <div class="erp-kpi-card gold"><div class="erp-kpi-label"><i class="fas fa-handshake"></i> Pipeline abierto</div><div class="erp-kpi-value">${this.money(t.pipeline)}</div><div class="erp-kpi-hint">Ponderado: ${this.money(t.weighted)}</div></div>
        <div class="erp-kpi-card success"><div class="erp-kpi-label"><i class="fas fa-trophy"></i> Oportunidades ganadas</div><div class="erp-kpi-value">${t.won}</div><div class="erp-kpi-hint">${this.money(t.wonValue)} facturados vía ERP</div></div>
        <div class="erp-kpi-card"><div class="erp-kpi-label"><i class="fas fa-chart-pie"></i> Tasa de conversión</div><div class="erp-kpi-value">${t.conversion.toFixed(1)}%</div><div class="erp-kpi-hint">Leads → ventas cerradas</div></div>
        <div class="erp-kpi-card"><div class="erp-kpi-label"><i class="fas fa-coins"></i> Valor de vida del cliente</div><div class="erp-kpi-value">${this.money(t.lit)}</div><div class="erp-kpi-hint">Facturación histórica CRM</div></div>
        <div class="erp-kpi-card ${t.openCases ? "danger" : "success"}"><div class="erp-kpi-label"><i class="fas fa-headset"></i> Casos abiertos</div><div class="erp-kpi-value">${t.openCases}</div><div class="erp-kpi-hint">Postventa y garantías</div></div>
        <div class="erp-kpi-card"><div class="erp-kpi-label"><i class="fas fa-tasks"></i> Actividades pendientes</div><div class="erp-kpi-value">${t.pendingActs}</div><div class="erp-kpi-hint">Seguimiento comercial</div></div>
      `;
    }
    const summary = document.getElementById("crm-dashboard-summary");
    if (summary) {
      summary.innerHTML = `
        <div class="erp-section-label">Resumen comercial</div>
        <div class="erp-mini-stat"><span>Clientes B2B</span><strong>${this.state.customers.filter(c => c.channel === "B2B").length}</strong></div>
        <div class="erp-mini-stat"><span>Clientes B2C</span><strong>${this.state.customers.filter(c => c.channel === "B2C").length}</strong></div>
        <div class="erp-mini-stat"><span>Leads nuevos</span><strong>${t.leadsByStage.Nuevo}</strong></div>
        <div class="erp-mini-stat"><span>Leads calificados</span><strong>${t.leadsByStage.Calificado}</strong></div>
        <div class="erp-mini-stat"><span>Campañas activas</span><strong>${this.state.campaigns.filter(c => c.status === "Activa").length}</strong></div>
        <div class="erp-mini-stat"><span>Sistema integrado</span><strong>ERP GLOWTEX</strong></div>
      `;
    }
    const activity = document.getElementById("crm-dashboard-activity");
    if (activity) {
      activity.innerHTML = this.state.log.length ? `<ul class="erp-activity-list">${this.state.log.slice(0, 12).map(a => `
        <li><span class="erp-activity-time">${a.time}</span><span><i class="fas ${a.kind === "ok" ? "fa-check-circle" : "fa-info-circle"}" style="color:${a.kind === "ok" ? "#059669" : "#C5A880"};margin-right:6px;"></i>${this.esc(a.text)}</span></li>`).join("")}</ul>`
        : `<div class="erp-empty"><i class="fas fa-history"></i>Sin actividades registradas.</div>`;
    }
  },

  renderChart() {
    const canvas = document.getElementById("crm-dashboard-chart");
    if (!canvas || typeof Chart === "undefined") return;
    const t = this.totals();
    if (this.chart) this.chart.destroy();
    this.chart = new Chart(canvas.getContext("2d"), {
      type: "bar",
      data: {
        labels: ["Nuevo", "Contactado", "Calificado", "Propuesta", "Ganada"],
        datasets: [{
          label: "Leads / Oportunidades por etapa",
          data: [t.leadsByStage.Nuevo, t.leadsByStage.Contactado, t.leadsByStage.Calificado, t.leadsByStage.Propuesta, t.won],
          backgroundColor: ["#E5E7EB", "#C5A880", "#8F7249", "#374151", "#059669"],
          borderRadius: 2
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true, ticks: { stepSize: 1 } } }
      }
    });
  },

  renderClients() {
    const search = (document.getElementById("crm-client-search")?.value || "").toLowerCase();
    const rows = this.state.customers.filter(c => !search || c.name.toLowerCase().includes(search) || c.ruc.includes(search));
    const body = document.getElementById("crm-client-body");
    if (body) {
      body.innerHTML = rows.length ? rows.map(c => `
        <tr>
          <td><strong class="erp-code">${c.id}</strong></td>
          <td><strong style="color:#111;">${this.esc(c.name)}</strong><br><span style="font-size:0.72rem;color:#9CA3AF;">${this.esc(c.email)}</span></td>
          <td>${this.esc(c.ruc)}</td>
          <td><span class="erp-badge ${c.channel === "B2B" ? "info" : "gold"}">${c.channel}</span></td>
          <td>${this.esc(c.sector)} · ${this.esc(c.city)}</td>
          <td class="num strong">${this.money(c.lifetime)}</td>
          <td><span class="erp-badge ${c.status === "Activo" ? "ok" : "neutral"}">${c.status}</span></td>
        </tr>`).join("") : `<tr><td colspan="7" class="erp-empty">No hay clientes que coincidan.</td></tr>`;
    }
    const summary = document.getElementById("crm-client-summary");
    if (summary) {
      const t = this.totals();
      summary.innerHTML = `
        <div class="erp-mini-stat"><span>Total de clientes</span><strong>${t.clients}</strong></div>
        <div class="erp-mini-stat"><span>Cartera B2B</span><strong>${this.state.customers.filter(c => c.channel === "B2B").length}</strong></div>
        <div class="erp-mini-stat"><span>Cartera B2C</span><strong>${this.state.customers.filter(c => c.channel === "B2C").length}</strong></div>
        <div class="erp-mini-stat"><span>Facturación histórica</span><strong>${this.money(t.lit)}</strong></div>
      `;
    }
  },

  renderLeads() {
    const stages = ["Nuevo", "Contactado", "Calificado", "Propuesta", "Cerrado"];
    const body = document.getElementById("crm-lead-body");
    if (body) {
      body.innerHTML = this.state.leads.length ? this.state.leads.map(l => `
        <tr>
          <td class="erp-code">${l.id}</td>
          <td><strong style="color:#111;">${this.esc(l.name)}</strong><br><span style="font-size:0.72rem;color:#9CA3AF;">${this.esc(l.company)}</span></td>
          <td>${this.esc(l.source)}</td>
          <td class="num">${this.money(l.value)}</td>
          <td><span class="erp-badge ${l.stage === "Cerrado" ? "ok" : l.stage === "Propuesta" ? "gold" : "info"}">${l.stage}</span></td>
          <td>${this.esc(l.owner)}</td>
          <td style="white-space:nowrap;">
            ${stages.indexOf(l.stage) < stages.length - 1 ? `<button class="erp-btn erp-btn-outline erp-btn-sm" onclick="CRM.advanceLead('${l.id}')"><i class="fas fa-arrow-right"></i></button>` : ""}
            <button class="erp-btn erp-btn-gold erp-btn-sm" onclick="CRM.convertLead('${l.id}')"><i class="fas fa-user-plus"></i> Cliente</button>
          </td>
        </tr>`).join("") : `<tr><td colspan="7" class="erp-empty">No hay leads registrados.</td></tr>`;
    }
    const summary = document.getElementById("crm-lead-summary");
    if (summary) {
      const t = this.totals();
      summary.innerHTML = `
        <div class="erp-mini-stat"><span>Leads totales</span><strong>${t.leads}</strong></div>
        <div class="erp-mini-stat"><span>Valor potencial</span><strong>${this.money(this.state.leads.reduce((a, l) => a + l.value, 0))}</strong></div>
        <div class="erp-mini-stat"><span>Showroom / Web / WhatsApp</span><strong>${this.state.leads.filter(l => ["Showroom Quito", "Sitio Web", "WhatsApp"].includes(l.source)).length}</strong></div>
      `;
    }
  },

  renderOpportunities() {
    const body = document.getElementById("crm-opp-body");
    if (body) {
      body.innerHTML = this.state.opportunities.length ? this.state.opportunities.map(o => `
        <tr>
          <td class="erp-code">${o.id}</td>
          <td><strong style="color:#111;">${this.esc(o.customer)}</strong><br><span style="font-size:0.72rem;">${this.esc(o.title)}</span></td>
          <td class="num strong">${this.money(o.value)}</td>
          <td class="num">${o.probability}%</td>
          <td class="num">${this.money(o.value * o.probability / 100)}</td>
          <td>${o.closeDate}</td>
          <td><span class="erp-badge ${o.stage === "Ganada" ? "ok" : o.stage === "Perdida" ? "bad" : "info"}">${o.stage}</span></td>
          <td style="white-space:nowrap;">
            ${o.stage !== "Ganada" && o.stage !== "Perdida" ? `<button class="erp-btn erp-btn-success erp-btn-sm" onclick="CRM.winOpportunity('${o.id}')"><i class="fas fa-check"></i> Ganar</button>` : ""}
            ${o.stage !== "Ganada" && o.stage !== "Perdida" ? `<button class="erp-btn erp-btn-danger erp-btn-sm" onclick="CRM.loseOpportunity('${o.id}')" title="Perder"><i class="fas fa-times"></i></button>` : ""}
          </td>
        </tr>`).join("") : `<tr><td colspan="8" class="erp-empty">No hay oportunidades registradas.</td></tr>`;
    }
    const summary = document.getElementById("crm-opp-summary");
    if (summary) {
      const t = this.totals();
      summary.innerHTML = `
        <div class="erp-mini-stat"><span>Pipeline bruto</span><strong>${this.money(t.pipeline)}</strong></div>
        <div class="erp-mini-stat"><span>Pipeline ponderado</span><strong>${this.money(t.weighted)}</strong></div>
        <div class="erp-mini-stat"><span>Valor ganado</span><strong style="color:#059669;">${this.money(t.wonValue)}</strong></div>
        <div class="erp-mini-stat"><span>Integración ERP</span><strong>Oportunidad ganada → Factura SRI</strong></div>
      `;
    }
    const sel = document.getElementById("crm-opp-client");
    if (sel && !sel.options.length) {
      sel.innerHTML = this.state.customers.map(c => `<option value="${this.esc(c.name)}">${this.esc(c.name)}</option>`).join("");
    }
  },

  renderActivities() {
    const body = document.getElementById("crm-act-body");
    if (body) {
      body.innerHTML = this.state.activities.length ? this.state.activities.map(a => `
        <tr>
          <td class="erp-code">${a.id}</td>
          <td><strong style="color:#111;">${this.esc(a.client)}</strong></td>
          <td>${this.esc(a.type)}</td>
          <td>${a.date}</td>
          <td>${this.esc(a.note)}</td>
          <td>${this.esc(a.owner)}</td>
          <td><span class="erp-badge ${a.done ? "ok" : "warn"}">${a.done ? "Completada" : "Pendiente"}</span></td>
          <td>${a.done ? '<i class="fas fa-check-circle" style="color:#059669;"></i>' : `<button class="erp-btn erp-btn-success erp-btn-sm" onclick="CRM.completeActivity('${a.id}')"><i class="fas fa-check"></i></button>`}</td>
        </tr>`).join("") : `<tr><td colspan="8" class="erp-empty">No hay actividades registradas.</td></tr>`;
    }
    const sel = document.getElementById("crm-act-client");
    if (sel && !sel.options.length) {
      sel.innerHTML = this.state.customers.map(c => `<option value="${this.esc(c.name)}">${this.esc(c.name)}</option>`).join("");
    }
  },

  renderCases() {
    const body = document.getElementById("crm-case-body");
    if (body) {
      body.innerHTML = this.state.cases.length ? this.state.cases.map(c => `
        <tr>
          <td class="erp-code">${c.id}</td>
          <td><strong style="color:#111;">${this.esc(c.client)}</strong></td>
          <td>${this.esc(c.type)}</td>
          <td><span class="erp-badge ${c.priority === "Alta" ? "bad" : c.priority === "Media" ? "warn" : "neutral"}">${c.priority}</span></td>
          <td>${this.esc(c.desc)}</td>
          <td>${c.date}</td>
          <td><span class="erp-badge ${c.status === "Resuelto" ? "ok" : "info"}">${c.status}</span></td>
          <td>${c.status === "Resuelto" ? '<i class="fas fa-check-circle" style="color:#059669;"></i>' : `<button class="erp-btn erp-btn-success erp-btn-sm" onclick="CRM.resolveCase('${c.id}')"><i class="fas fa-check"></i> Resolver</button>`}</td>
        </tr>`).join("") : `<tr><td colspan="8" class="erp-empty">No hay casos registrados.</td></tr>`;
    }
    const summary = document.getElementById("crm-case-summary");
    if (summary) {
      summary.innerHTML = `
        <div class="erp-mini-stat"><span>Casos abiertos</span><strong>${this.state.cases.filter(c => c.status !== "Resuelto").length}</strong></div>
        <div class="erp-mini-stat"><span>Resueltos</span><strong>${this.state.cases.filter(c => c.status === "Resuelto").length}</strong></div>
        <div class="erp-mini-stat"><span>Prioridad alta</span><strong style="color:#E11D48;">${this.state.cases.filter(c => c.priority === "Alta" && c.status !== "Resuelto").length}</strong></div>
      `;
    }
    const sel = document.getElementById("crm-case-client");
    if (sel && !sel.options.length) {
      sel.innerHTML = this.state.customers.map(c => `<option value="${this.esc(c.name)}">${this.esc(c.name)}</option>`).join("");
    }
  },

  renderCampaigns() {
    const body = document.getElementById("crm-camp-body");
    if (body) {
      body.innerHTML = this.state.campaigns.length ? this.state.campaigns.map(c => `
        <tr>
          <td class="erp-code">${c.id}</td>
          <td><strong style="color:#111;">${this.esc(c.name)}</strong></td>
          <td>${this.esc(c.channel)}</td>
          <td class="num">${c.leads}</td>
          <td class="num">${this.money(c.cost)}</td>
          <td class="num strong">${this.money(c.revenue)}</td>
          <td class="num">${c.cost ? ((c.revenue - c.cost) / c.cost * 100).toFixed(0) : "0"}%</td>
          <td><span class="erp-badge ${c.status === "Activa" ? "ok" : "neutral"}">${c.status}</span></td>
        </tr>`).join("") : `<tr><td colspan="8" class="erp-empty">No hay campañas registradas.</td></tr>`;
    }
    const summary = document.getElementById("crm-camp-summary");
    if (summary) {
      const leads = this.state.campaigns.reduce((a, c) => a + c.leads, 0);
      const revenue = this.state.campaigns.reduce((a, c) => a + c.revenue, 0);
      const cost = this.state.campaigns.reduce((a, c) => a + c.cost, 0);
      if (summary) summary.innerHTML = `
        <div class="erp-mini-stat"><span>Leads generados</span><strong>${leads}</strong></div>
        <div class="erp-mini-stat"><span>Inversión en marketing</span><strong>${this.money(cost)}</strong></div>
        <div class="erp-mini-stat"><span>Ingresos atribuidos</span><strong>${this.money(revenue)}</strong></div>
        <div class="erp-mini-stat"><span>ROI de campañas</span><strong style="color:#059669;">${cost ? ((revenue - cost) / cost * 100).toFixed(0) : 0}%</strong></div>
      `;
    }
  },

  renderIntegration() {
    const box = document.getElementById("crm-integration-body");
    if (!box) return;
    const erpSales = (typeof ERP !== "undefined" && ERP.state) ? ERP.state.salesOrders.length : 0;
    const won = this.state.opportunities.filter(o => o.stage === "Ganada").length;
    box.innerHTML = `
      <div class="erp-alert ok">
        <strong>Canal conectado al ERP interno.</strong> El CRM comparte la base de clientes y convierte oportunidades ganadas en facturas del sistema ERP.
      </div>
      <div class="erp-mini-stat"><span>Facturas en el ERP</span><strong>${erpSales}</strong></div>
      <div class="erp-mini-stat"><span>Oportunidades ganadas desde CRM</span><strong>${won}</strong></div>
      <div class="erp-mini-stat"><span>Clientes sincronizados</span><strong>${this.state.customers.length}</strong></div>
      <div class="erp-mini-stat"><span>Casos postventa derivados</span><strong>${this.state.cases.length}</strong></div>
      <div class="erp-actions-bar" style="margin-top:16px;">
        <button class="erp-btn erp-btn-gold" onclick="CRM.syncFromERP()"><i class="fas fa-sync"></i> Sincronizar clientes desde ERP</button>
        <button class="erp-btn erp-btn-outline" onclick="CRM.exportJSON()"><i class="fas fa-download"></i> Exportar CRM</button>
        <button class="erp-btn erp-btn-danger" onclick="CRM.reset()"><i class="fas fa-undo"></i> Reiniciar CRM</button>
      </div>
      <div style="margin-top:18px;font-size:0.78rem;color:#6B7280;line-height:1.7;">
        <strong>Flujo de integración:</strong> Lead → Oportunidad → (Ganar) → Factura SRI en ERP → Cuenta por cobrar → Cartera del cliente en CRM.
      </div>
    `;
  },

  // ==================== OPERACIONES ====================
  val(id) { return (document.getElementById(id)?.value || "").trim(); },

  addClient() {
    const name = this.val("crm-client-name"), ruc = this.val("crm-client-ruc");
    if (!name || !ruc) { this.toast("Nombre y RUC son obligatorios.", "bad"); return; }
    if (this.state.customers.some(c => c.ruc === ruc)) { this.toast("Ya existe un cliente con ese RUC.", "bad"); return; }
    this.state.customers.unshift({
      id: "CLI-" + this.state.sequences.cli++, name, ruc,
      channel: this.val("crm-client-channel") || "B2B",
      sector: this.val("crm-client-sector") || "Comercio / Confección",
      city: this.val("crm-client-city") || "Quito",
      phone: this.val("crm-client-phone") || "-",
      email: this.val("crm-client-email") || "-",
      status: "Activo", since: this.today(), lifetime: 0
    });
    this.log(`Nuevo cliente registrado: ${name}.`, "ok");
    this.save(); this.renderAll(); this.toast("Cliente agregado a la cartera.", "ok");
    document.getElementById("crm-client-form")?.reset();
  },

  addLead() {
    const name = this.val("crm-lead-name"), company = this.val("crm-lead-company");
    if (!name || !company) { this.toast("Ingrese nombre y empresa del lead.", "bad"); return; }
    this.state.leads.unshift({
      id: "LEAD-" + String(this.state.sequences.lead++).padStart(4, "0"),
      name, company, source: this.val("crm-lead-source") || "Sitio Web",
      value: Number(this.val("crm-lead-value")) || 0,
      stage: "Nuevo", owner: this.val("crm-lead-owner") || "Jefe Comercial", date: this.today()
    });
    this.log(`Nuevo lead: ${company} (${this.money(Number(this.val("crm-lead-value")) || 0)}).`, "ok");
    this.save(); this.renderAll(); this.toast("Lead registrado en el embudo.", "ok");
    document.getElementById("crm-lead-form")?.reset();
  },

  advanceLead(id) {
    const stages = ["Nuevo", "Contactado", "Calificado", "Propuesta", "Cerrado"];
    const l = this.state.leads.find(x => x.id === id);
    if (!l) return;
    const i = stages.indexOf(l.stage);
    if (i < stages.length - 1) l.stage = stages[i + 1];
    this.log(`Lead ${l.company} avanzó a ${l.stage}.`, "info");
    this.save(); this.renderAll();
  },

  convertLead(id) {
    const l = this.state.leads.find(x => x.id === id);
    if (!l) return;
    if (!this.state.customers.some(c => c.name === l.company)) {
      this.state.customers.unshift({
        id: "CLI-" + this.state.sequences.cli++, name: l.company, ruc: "099" + Math.floor(100000000 + Math.random() * 899999999),
        channel: "B2B", sector: "Prospecto convertido", city: "Quito", phone: "-", email: "-",
        status: "Activo", since: this.today(), lifetime: 0
      });
    }
    this.state.opportunities.unshift({
      id: "OP-" + String(this.state.sequences.opp++).padStart(4, "0"),
      customer: l.company, title: "Oportunidad desde lead " + l.id, value: l.value, probability: 50,
      stage: "Calificada", closeDate: this.today(), sku: "DEP-001", qty: 50, price: 7.90, owner: l.owner
    });
    l.stage = "Cerrado";
    this.log(`Lead ${l.company} convertido en cliente y oportunidad.`, "ok");
    this.save(); this.renderAll();
    this.toast("Lead convertido en cliente + oportunidad.", "ok");
  },

  addOpportunity() {
    const customer = this.val("crm-opp-client"), title = this.val("crm-opp-title");
    if (!customer || !title) { this.toast("Seleccione cliente e ingrese el título.", "bad"); return; }
    this.state.opportunities.unshift({
      id: "OP-" + String(this.state.sequences.opp++).padStart(4, "0"),
      customer, title, value: Number(this.val("crm-opp-value")) || 0,
      probability: Number(this.val("crm-opp-prob")) || 50,
      stage: "Propuesta", closeDate: this.val("crm-opp-close") || this.today(),
      sku: this.val("crm-opp-sku") || "DEP-001",
      qty: Number(this.val("crm-opp-qty")) || 50,
      price: Number(this.val("crm-opp-price")) || 7.90,
      owner: "Jefe Comercial"
    });
    this.log(`Nueva oportunidad "${title}" por ${this.money(Number(this.val("crm-opp-value")) || 0)}.`, "ok");
    this.save(); this.renderAll(); this.toast("Oportunidad creada en el pipeline.", "ok");
    document.getElementById("crm-opp-form")?.reset();
  },

  winOpportunity(id) {
    const o = this.state.opportunities.find(x => x.id === id);
    if (!o) return;
    if (typeof ERP === "undefined" || !ERP.state) { this.toast("El ERP interno no está disponible.", "bad"); return; }
    const order = ERP.postSale(ERP.state, {
      customer: o.customer, ruc: (this.state.customers.find(c => c.name === o.customer)?.ruc) || "-",
      channel: "B2B", sku: o.sku, qty: o.qty, unitPrice: o.price, status: "Facturado"
    }, false);
    if (!order) { this.toast("No hay stock suficiente para convertir esta oportunidad.", "bad"); return; }
    o.stage = "Ganada";
    o.invoice = order.invoice;
    const client = this.state.customers.find(c => c.name === o.customer);
    if (client) client.lifetime += order.total;
    this.log(`Oportunidad ${o.id} ganada → Factura ERP ${order.invoice} (${this.money(order.total)}).`, "ok");
    this.save(); ERP.save();
    if (typeof ERP.renderAll === "function") ERP.renderAll();
    this.renderAll();
    this.toast(`Factura ${order.invoice} emitida desde el CRM por ${this.money(order.total)}.`, "ok");
  },

  loseOpportunity(id) {
    const o = this.state.opportunities.find(x => x.id === id);
    if (!o) return;
    o.stage = "Perdida";
    this.log(`Oportunidad ${o.id} marcada como perdida.`, "bad");
    this.save(); this.renderAll();
  },

  addActivity() {
    const client = this.val("crm-act-client"), note = this.val("crm-act-note");
    if (!client || !note) { this.toast("Seleccione cliente y escriba la nota.", "bad"); return; }
    this.state.activities.unshift({
      id: "ACT-" + String(this.state.sequences.act++).padStart(4, "0"),
      client, type: this.val("crm-act-type") || "Seguimiento",
      date: this.val("crm-act-date") || this.today(), note,
      done: false, owner: "Jefe Comercial"
    });
    this.log(`Actividad programada con ${client}.`, "info");
    this.save(); this.renderAll(); this.toast("Actividad registrada.", "ok");
    document.getElementById("crm-act-form")?.reset();
  },

  completeActivity(id) {
    const a = this.state.activities.find(x => x.id === id);
    if (!a) return;
    a.done = true;
    this.log(`Actividad completada: ${a.client}.`, "ok");
    this.save(); this.renderAll();
  },

  addCase() {
    const client = this.val("crm-case-client"), desc = this.val("crm-case-desc");
    if (!client || !desc) { this.toast("Seleccione cliente y describa el caso.", "bad"); return; }
    this.state.cases.unshift({
      id: "CAS-" + String(this.state.sequences.case++).padStart(4, "0"),
      client, type: this.val("crm-case-type") || "Consulta",
      priority: this.val("crm-case-priority") || "Media", desc,
      status: "Abierto", date: this.today()
    });
    this.log(`Nuevo caso postventa de ${client}.`, "info");
    this.save(); this.renderAll(); this.toast("Caso registrado.", "ok");
    document.getElementById("crm-case-form")?.reset();
  },

  resolveCase(id) {
    const c = this.state.cases.find(x => x.id === id);
    if (!c) return;
    c.status = "Resuelto";
    this.log(`Caso ${c.id} resuelto.`, "ok");
    this.save(); this.renderAll();
  },

  addCampaign() {
    const name = this.val("crm-camp-name");
    if (!name) { this.toast("Ingrese el nombre de la campaña.", "bad"); return; }
    this.state.campaigns.unshift({
      id: "CAM-" + String(this.state.sequences.camp++).padStart(4, "0"),
      name, channel: this.val("crm-camp-channel") || "Email",
      leads: Number(this.val("crm-camp-leads")) || 0,
      cost: Number(this.val("crm-camp-cost")) || 0,
      revenue: Number(this.val("crm-camp-revenue")) || 0,
      status: "Activa"
    });
    this.log(`Campaña "${name}" registrada.`, "ok");
    this.save(); this.renderAll(); this.toast("Campaña creada.", "ok");
    document.getElementById("crm-camp-form")?.reset();
  },

  syncFromERP() {
    if (typeof ERP === "undefined" || !ERP.state) { this.toast("ERP no disponible.", "bad"); return; }
    let added = 0;
    ERP.state.salesOrders.forEach(o => {
      if (!this.state.customers.some(c => c.ruc === o.ruc)) {
        this.state.customers.unshift({
          id: "CLI-" + this.state.sequences.cli++, name: o.customer, ruc: o.ruc,
          channel: o.channel, sector: "Cliente ERP", city: "Quito", phone: "-", email: "-",
          status: "Activo", since: o.date, lifetime: o.total
        });
        added++;
      }
    });
    this.log(`Sincronización ERP → CRM: ${added} clientes nuevos.`, "ok");
    this.save(); this.renderAll();
    this.toast(added ? `${added} clientes importados desde el ERP.` : "CRM ya está sincronizado con el ERP.", "ok");
  },

  // ==================== INICIO ====================
  init() {
    this.load();
    document.querySelectorAll(".crm-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => this.switchModule(btn.getAttribute("data-crm-module")));
    });
    const binds = [
      ["crm-client-form", this.addClient], ["crm-lead-form", this.addLead],
      ["crm-opp-form", this.addOpportunity], ["crm-act-form", this.addActivity],
      ["crm-case-form", this.addCase], ["crm-camp-form", this.addCampaign]
    ];
    binds.forEach(([id, fn]) => {
      const form = document.getElementById(id);
      if (form) form.addEventListener("submit", e => { e.preventDefault(); fn.call(this); });
    });
    document.getElementById("crm-client-search")?.addEventListener("input", () => this.renderClients());
    this.renderAll();
  }
};

window.CRM = CRM;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => CRM.init());
} else {
  CRM.init();
}
