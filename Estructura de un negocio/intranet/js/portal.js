/**
 * GLOWTEX S.A.S. | Portal Interno - Control de acceso y cambio de sistemas
 * Canal digital independiente del sitio comercial (ERP + CRM)
 */

const Portal = {
  system: "erp",
  user: "",

  init() {
    const form = document.getElementById("portal-login-form");
    if (form) form.addEventListener("submit", e => { e.preventDefault(); this.login(); });
    document.querySelectorAll(".system-btn").forEach(btn => {
      btn.addEventListener("click", () => this.switchSystem(btn.getAttribute("data-system")));
    });
    document.getElementById("portal-logout")?.addEventListener("click", () => this.logout());
  },

  login() {
    const user = (document.getElementById("portal-user")?.value || "").trim();
    const pass = (document.getElementById("portal-pass")?.value || "").trim();
    const err = document.getElementById("portal-login-error");
    const accounts = { glowtex: "Glowtex2026!", admin: "admin123" };
    if (!user || !pass) {
      if (err) err.textContent = "Ingrese usuario y contraseña para continuar.";
      return;
    }
    if (accounts[user.toLowerCase()] !== pass) {
      if (err) err.textContent = "Credenciales incorrectas. Use las credenciales de demostración indicadas abajo.";
      return;
    }
    this.user = user;
    document.getElementById("portal-login")?.classList.add("hidden");
    document.getElementById("portal-app")?.classList.remove("hidden");
    const chip = document.getElementById("portal-user-chip");
    if (chip) chip.textContent = user;
    this.switchSystem("erp");
    this.toast("Acceso autorizado. Bienvenido al portal interno GLOWTEX.", "ok");
  },

  logout() {
    document.getElementById("portal-app")?.classList.add("hidden");
    document.getElementById("portal-login")?.classList.remove("hidden");
    const err = document.getElementById("portal-login-error");
    if (err) err.textContent = "";
    this.user = "";
  },

  switchSystem(system) {
    this.system = system;
    document.querySelectorAll(".system-btn").forEach(b => b.classList.toggle("active", b.getAttribute("data-system") === system));
    document.querySelectorAll(".system-view").forEach(v => v.classList.toggle("hidden", v.id !== "system-" + system));
    const title = document.getElementById("portal-system-title");
    const sub = document.getElementById("portal-system-subtitle");
    if (system === "erp") {
      if (title) title.textContent = "ERP · Gestión Integral de Operaciones";
      if (sub) sub.textContent = "Inventario, importaciones, ventas, contabilidad y nómina · GLOWTEX S.A.S.";
      if (typeof ERP !== "undefined") { ERP.renderAll(); ERP.switchModule(ERP.activeModule || "dashboard"); }
    } else {
      if (title) title.textContent = "CRM · Gestión de Relaciones con Clientes";
      if (sub) sub.textContent = "Clientes, leads, oportunidades, postventa y campañas · Integrado al ERP";
      if (typeof CRM !== "undefined") { CRM.renderAll(); CRM.switchModule(CRM.activeModule || "dashboard"); }
    }
  },

  toast(msg, kind) {
    document.querySelectorAll(".portal-toast").forEach(t => t.remove());
    const el = document.createElement("div");
    el.className = "portal-toast";
    if (kind === "bad") el.style.borderLeftColor = "#E11D48";
    if (kind === "ok") el.style.borderLeftColor = "#059669";
    el.innerHTML = `<i class="fas ${kind === "bad" ? "fa-exclamation-triangle" : "fa-check-circle"}" style="margin-right:8px;color:var(--gold);"></i>${msg}`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 3600);
  }
};

window.Portal = Portal;

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => Portal.init());
} else {
  Portal.init();
}
