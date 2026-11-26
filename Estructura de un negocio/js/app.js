/**
 * GLOWTEX S.A.S. | Master Web Application & E-Commerce Platform
 * Inspirado en la experiencia de usuario de Victoria's Secret, Finatextil y Textil San Pedro
 * 100% Comercial y Profesional (Sin referencias académicas en la tienda)
 */

const AppState = {
  currentView: "inicio",
  currentDivision: "all",
  searchQuery: "",
  isB2BMode: true,
  cart: [],
  wishlist: [],
  activeScenario: "target",
  chartInstance: null
};

document.addEventListener("DOMContentLoaded", () => {
  initNavigation();
  initPricingToggle();
  initCatalogFilters();
  initCart();
  initWishlist();
  initUserModal();
  initEnterpriseForm();
  initDigitalTwinUI();
  initSuppliersUI();
  initModals();

  // Renders de inicio
  renderHomeSections();
  renderCatalog();
  renderPromotions();
  renderBlogPosts();
  renderShowroomVisuals();
});

// ==================== NAVEGACIÓN PRINCIPAL (11 SECCIONES) ====================
function initNavigation() {
  const navButtons = document.querySelectorAll(".nav-link-btn");
  navButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetView = btn.getAttribute("data-view");
      switchView(targetView);
    });
  });
}

function switchView(viewName) {
  AppState.currentView = viewName;

  document.querySelectorAll(".nav-link-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-view") === viewName);
  });

  document.querySelectorAll(".view-section").forEach(sec => {
    if (sec.id === `view-${viewName}`) {
      sec.classList.remove("hidden-view");
    } else {
      sec.classList.add("hidden-view");
    }
  });

  const heroSection = document.getElementById("hero-luxury-banner");
  if (heroSection) {
    heroSection.style.display = (viewName === "inicio") ? "block" : "none";
  }

  window.scrollTo({ top: 0, behavior: "smooth" });

  if (viewName === "gemelo-digital") {
    setTimeout(() => {
      updateFinancialChart();
    }, 150);
  }

}

// ==================== SWITCH B2B / B2C ====================
function initPricingToggle() {
  const b2bBtn = document.getElementById("btn-mode-b2b");
  const b2cBtn = document.getElementById("btn-mode-b2c");
  const modeLabel = document.getElementById("mode-active-label");

  if (b2bBtn && b2cBtn) {
    b2bBtn.addEventListener("click", () => {
      AppState.isB2BMode = true;
      b2bBtn.classList.add("active");
      b2cBtn.classList.remove("active");
      if (modeLabel) modeLabel.textContent = "Modalidad B2B Mayorista (Precios de Rollo / Paquete)";
      renderCatalog();
      renderHomeSections();
    });

    b2cBtn.addEventListener("click", () => {
      AppState.isB2BMode = false;
      b2cBtn.classList.add("active");
      b2bBtn.classList.remove("active");
      if (modeLabel) modeLabel.textContent = "Modalidad B2C Detalle (Precios por Metro / Unidad)";
      renderCatalog();
      renderHomeSections();
    });
  }
}

// ==================== RENDER DE PORTADA / HOME ====================
function renderHomeSections() {
  // 1. Categorías destacadas estilo Victoria's Secret / Textil San Pedro
  const catGrid = document.getElementById("home-categories-grid");
  if (catGrid) {
    const mainDivs = GLOWTEX_DIVISIONS.filter(d => d.id !== "all");
    catGrid.innerHTML = mainDivs.map(div => `
      <div class="category-luxury-card" onclick="filterByDivisionAndOpenStore('${div.id}')">
        <img src="${div.image}" alt="${div.name}" class="category-card-bg-img" loading="lazy">
        <div class="category-luxury-overlay"></div>
        <div class="category-luxury-info">
          <div class="category-tag-sub">${div.count} REFERENCIAS DISPONIBLES</div>
          <h3 class="category-luxury-title">${div.name}</h3>
          <p class="category-luxury-desc">${div.desc}</p>
          <span class="category-luxury-action">
            Explorar Colección <i class="fas fa-arrow-right"></i>
          </span>
        </div>
      </div>
    `).join("");
  }

  // 2. Productos destacados
  const featuredGrid = document.getElementById("home-featured-products-grid");
  if (featuredGrid) {
    const featuredProds = GLOWTEX_PRODUCTS.slice(0, 4);
    featuredGrid.innerHTML = featuredProds.map(prod => renderProductCardHTML(prod)).join("");
  }
}

function filterByDivisionAndOpenStore(divisionId) {
  AppState.currentDivision = divisionId;
  switchView("tienda");
  
  const pills = document.querySelectorAll(".division-pill");
  pills.forEach(p => {
    p.classList.toggle("active", p.getAttribute("data-division") === divisionId);
  });
  renderCatalog();
}

// ==================== CATÁLOGO Y TIENDA ====================
function initCatalogFilters() {
  const pillsContainer = document.getElementById("divisions-pills-container");
  if (pillsContainer) {
    pillsContainer.innerHTML = GLOWTEX_DIVISIONS.map(div => `
      <button class="division-pill ${div.id === AppState.currentDivision ? 'active' : ''}" data-division="${div.id}">
        <i class="fas ${div.icon}"></i>
        <span>${div.name}</span>
        <span class="pill-count">${div.count}</span>
      </button>
    `).join("");

    pillsContainer.querySelectorAll(".division-pill").forEach(btn => {
      btn.addEventListener("click", () => {
        pillsContainer.querySelectorAll(".division-pill").forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        AppState.currentDivision = btn.getAttribute("data-division");
        renderCatalog();
      });
    });
  }

  const searchInput = document.getElementById("catalog-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.searchQuery = e.target.value.toLowerCase().trim();
      renderCatalog();
    });
  }
}

function renderCatalog() {
  const grid = document.getElementById("products-catalog-grid");
  const resultsCounter = document.getElementById("results-counter");
  if (!grid) return;

  const filtered = GLOWTEX_PRODUCTS.filter(prod => {
    const matchesDivision = AppState.currentDivision === "all" || prod.division === AppState.currentDivision;
    const matchesSearch = !AppState.searchQuery || 
      prod.name.toLowerCase().includes(AppState.searchQuery) ||
      prod.sku.toLowerCase().includes(AppState.searchQuery) ||
      prod.composition.toLowerCase().includes(AppState.searchQuery) ||
      prod.hsCode.toLowerCase().includes(AppState.searchQuery);
    return matchesDivision && matchesSearch;
  });

  if (resultsCounter) {
    resultsCounter.textContent = `Mostrando ${filtered.length} referencias de 150 SKUs oficiales`;
  }

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; background: #fff; border-radius: 8px; border: 1px dashed #CBD5E1;">
        <i class="fas fa-search" style="font-size: 2.5rem; color: #94A3B8; margin-bottom: 12px;"></i>
        <h3 style="color: #111111; font-family: var(--font-serif);">No se encontraron referencias</h3>
        <p style="color: #6B7280; font-size: 0.9rem;">Prueba con otro término de búsqueda o selecciona otra categoría.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(prod => renderProductCardHTML(prod)).join("");
}

function renderProductCardHTML(prod) {
  const price = AppState.isB2BMode ? prod.b2bPrice : prod.b2cPrice;
  const priceUnit = AppState.isB2BMode ? 
    (prod.division === 'machinery' || prod.division === 'tools' ? 'ud' : `rollo (~${prod.rollSize}m)`) : 
    prod.unit;

  const isWishlisted = AppState.wishlist.some(w => w.sku === prod.sku);
  const fallbackImg = "https://images.unsplash.com/photo-1558769132-cb1aea458c5e?auto=format&fit=crop&w=600&q=80";

  return `
    <div class="product-card" data-sku="${prod.sku}">
      <button class="btn-wishlist-heart ${isWishlisted ? 'active' : ''}" onclick="toggleWishlist('${prod.sku}')" title="Guardar en favoritos">
        <i class="${isWishlisted ? 'fas' : 'far'} fa-heart"></i>
      </button>

      <div class="card-top-badges">
        <span class="badge-sku">${prod.sku}</span>
        <span class="badge-feature">${prod.badge}</span>
      </div>

      <div class="card-image-box">
        <img src="${prod.imageUrl || fallbackImg}" alt="${prod.name}" class="product-photo-img" loading="lazy" onerror="this.src='${fallbackImg}'">
      </div>

      <div class="card-body">
        <span class="division-label">${prod.divisionName}</span>
        <h3 class="product-title">${prod.name}</h3>
        <p class="product-desc">${prod.description}</p>
        
        <div class="tech-spec-pills">
          <div class="spec-line">
            <span>Composición:</span>
            <strong>${prod.composition.length > 25 ? prod.composition.slice(0, 25) + '...' : prod.composition}</strong>
          </div>
          <div class="spec-line">
            <span>Gramaje / Ancho:</span>
            <strong>${prod.weight} · ${prod.width}</strong>
          </div>
          <div class="spec-line">
            <span>Subpartida SENAE:</span>
            <strong style="color: #0284C7;">${prod.hsCode}</strong>
          </div>
          <div class="spec-line">
            <span>Origen:</span>
            <strong>${prod.origin}</strong>
          </div>
        </div>

        <div class="card-pricing-block">
          <div class="price-main">
            <span class="price-amount">$${price.toFixed(2)}</span>
            <span class="price-unit">/ ${priceUnit} + IVA</span>
          </div>
          <div class="price-subinfo">
            <span>FOB Orig: $${prod.fobPrice.toFixed(2)}</span>
            <span>Stock Bodega: <strong>${prod.stock} ${prod.unit}s</strong></span>
          </div>
          <div class="card-actions">
            <button class="btn-spec" onclick="openProductModal('${prod.sku}')">
              <i class="fas fa-file-invoice"></i> Ficha
            </button>
            <button class="btn-add-cart" onclick="addToCart('${prod.sku}')">
              <i class="fas fa-shopping-bag"></i> Agregar
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ==================== LISTA DE FAVORITOS (WISHLIST) ====================
function initWishlist() {
  const trigger = document.getElementById("wishlist-toggle-btn");
  if (trigger) {
    trigger.addEventListener("click", openWishlistModal);
  }
}

function toggleWishlist(sku) {
  const prod = GLOWTEX_PRODUCTS.find(p => p.sku === sku);
  if (!prod) return;

  const index = AppState.wishlist.findIndex(w => w.sku === sku);
  if (index >= 0) {
    AppState.wishlist.splice(index, 1);
  } else {
    AppState.wishlist.push(prod);
  }

  updateWishlistBadge();
  renderCatalog();
}

function updateWishlistBadge() {
  const badge = document.getElementById("wishlist-badge-count");
  if (badge) {
    badge.textContent = AppState.wishlist.length;
  }
}

function openWishlistModal() {
  const modal = document.getElementById("wishlist-modal");
  const body = document.getElementById("wishlist-items-body");
  if (!modal || !body) return;

  if (AppState.wishlist.length === 0) {
    body.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #9CA3AF;">
        <i class="far fa-heart" style="font-size: 3rem; margin-bottom: 12px; color: #CBD5E1;"></i>
        <h4 style="color: #111111; font-family: var(--font-serif);">Tu lista de favoritos está vacía</h4>
        <p style="font-size: 0.85rem; margin-top: 4px;">Guarda tus textiles y maquinaria favoritos haciendo clic en el corazón de cualquier tarjeta.</p>
      </div>
    `;
  } else {
    body.innerHTML = AppState.wishlist.map(prod => `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px 0; border-bottom: 1px solid #E8E8E8;">
        <div>
          <span style="font-size: 0.72rem; background: #111111; color: #fff; padding: 2px 6px; border-radius: 2px; font-weight: 700;">${prod.sku}</span>
          <h5 style="margin: 4px 0 2px; color: #111111; font-family: var(--font-serif); font-size: 1rem;">${prod.name}</h5>
          <span style="font-size: 0.8rem; color: #6B7280;">$${prod.b2bPrice.toFixed(2)} USD (B2B) / $${prod.b2cPrice.toFixed(2)} USD (B2C)</span>
        </div>
        <div style="display: flex; gap: 8px;">
          <button class="btn-spec" onclick="addToCart('${prod.sku}'); closeWishlistModal();" style="padding: 6px 12px;">
            <i class="fas fa-shopping-bag"></i> Al Carrito
          </button>
          <button style="background: none; border: none; color: #E11D48; cursor: pointer; font-size: 1.1rem;" onclick="toggleWishlist('${prod.sku}'); openWishlistModal();">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      </div>
    `).join("");
  }

  modal.classList.add("active");
}

function closeWishlistModal() {
  document.getElementById("wishlist-modal")?.classList.remove("active");
}

// ==================== PROMOCIONES Y OFERTAS ====================
function renderPromotions() {
  const container = document.getElementById("promotions-grid-container");
  if (!container) return;

  container.innerHTML = GLOWTEX_PROMOTIONS.map(promo => `
    <div class="promo-card">
      <div class="promo-img-header">
        <img src="${promo.imageUrl}" alt="${promo.title}" loading="lazy">
        <span class="promo-badge-tag">${promo.badge}</span>
      </div>
      <div class="promo-card-body">
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 8px;">
          <i class="fas ${promo.icon}" style="font-size: 1.4rem; color: var(--color-gold);"></i>
          <h3 style="font-size: 1.2rem; color: #111111; font-family: var(--font-serif);">${promo.title}</h3>
        </div>
        <p style="font-size: 0.85rem; color: #6B7280; margin-bottom: 10px; font-weight: 600;">${promo.tagline}</p>
        
        <div style="background: var(--color-bg-stone); padding: 12px; border-radius: 4px; font-size: 0.82rem; margin-bottom: 12px; border: 1px solid var(--color-border);">
          <strong>Incluye:</strong> ${promo.items}
        </div>

        <div class="promo-pricing-row">
          <span class="promo-price-old">$${promo.regularPrice.toFixed(2)} USD</span>
          <span class="promo-price-new">$${promo.promoPrice.toFixed(2)} USD</span>
          <span style="font-size: 0.75rem; color: #6B7280;">+ IVA</span>
        </div>

        <div style="font-size: 0.75rem; color: #6B7280; margin-bottom: 16px; line-height: 1.5;">
          <p><i class="fas fa-clock" style="color: var(--color-gold);"></i> <strong>Vigencia:</strong> ${promo.validUntil}</p>
          <p><i class="fas fa-shield-alt"></i> <strong>Condición:</strong> ${promo.terms}</p>
        </div>

        <button class="btn-luxury-primary" style="width: 100%; justify-content: center; background: #111111; color: #FFFFFF;" onclick="orderPromo('${promo.id}')">
          <i class="fas fa-shopping-bag"></i> Aprovechar Oferta
        </button>
      </div>
    </div>
  `).join("");
}

function orderPromo(promoId) {
  const promo = GLOWTEX_PROMOTIONS.find(p => p.id === promoId);
  if (!promo) return;

  AppState.cart.push({
    sku: `PROMO-${promo.id.toUpperCase()}`,
    name: promo.title,
    division: "promociones",
    isB2B: true,
    unitPrice: promo.promoPrice,
    unitLabel: "paquete promocional",
    qty: 1,
    hsCode: "PAQUETE.COMBO"
  });

  updateCartBadge();
  openCart();
}

// ==================== BLOG Y CONTENIDOS EDUCATIVOS ====================
function renderBlogPosts() {
  const grid = document.getElementById("blog-posts-grid");
  if (!grid) return;

  grid.innerHTML = GLOWTEX_BLOG_POSTS.map(post => `
    <article class="blog-post-card">
      <div class="blog-visual-header">
        <img src="${post.imageUrl}" alt="${post.title}" loading="lazy">
      </div>
      <div class="blog-post-body">
        <span class="blog-meta-tag">${post.category} · ${post.readTime}</span>
        <h4 class="blog-title">${post.title}</h4>
        <p class="blog-excerpt">${post.excerpt}</p>
        <div style="margin-top: auto; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--color-border); padding-top: 12px; font-size: 0.78rem; color: #6B7280;">
          <span><i class="far fa-calendar"></i> ${post.date}</span>
          <span style="color: var(--color-black); font-weight: 700; cursor: pointer; text-transform: uppercase; font-family: var(--font-sans);" onclick="alert('Artículo completo disponible en la biblioteca técnica de GLOWTEX.')">
            Leer Más <i class="fas fa-arrow-right"></i>
          </span>
        </div>
      </div>
    </article>
  `).join("");
}

// ==================== SOLUCIONES EMPRESARIALES (FORMULARIO B2B) ====================
function initEnterpriseForm() {
  const form = document.getElementById("enterprise-rfq-form");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const company = document.getElementById("ent-company-name")?.value;
    const contact = document.getElementById("ent-contact-name")?.value;
    const email = document.getElementById("ent-email")?.value;
    const sector = document.getElementById("ent-sector-select")?.value;
    const volume = document.getElementById("ent-volume-input")?.value;

    alert(`¡Solicitud B2B Registrada con Éxito!\n\nEmpresa: ${company}\nContacto: ${contact}\nSector: ${sector}\nVolumen Estimado: ${volume}\n\nUn ejecutivo comercial de GLOWTEX te contactará en menos de 2 horas al correo: ${email}`);
    form.reset();
  });
}

// ==================== MODAL DE USUARIO / LOGIN ====================
function initUserModal() {
  const trigger = document.getElementById("user-account-btn");
  if (trigger) {
    trigger.addEventListener("click", () => {
      document.getElementById("user-modal")?.classList.add("active");
    });
  }
}

function processUserAuth(type) {
  if (type === 'login') {
    const email = document.getElementById("login-email-input")?.value;
    alert(`Sesión iniciada correctamente como: ${email || 'cliente@glowtex.ec'}\nTipo de cuenta: Mayorista B2B verificada.`);
  } else {
    alert("Registro empresarial recibido. Documentación RUC enviada para validación de facturación electrónica SRI.");
  }
  document.getElementById("user-modal")?.classList.remove("active");
}

// ==================== GESTIÓN DEL CARRITO DE COMPRAS ====================
function initCart() {
  const cartToggleBtn = document.getElementById("cart-toggle-btn");
  const closeCartBtn = document.getElementById("close-cart-btn");
  const cartOverlay = document.getElementById("cart-overlay");
  const checkoutBtn = document.getElementById("btn-open-checkout");

  if (cartToggleBtn) cartToggleBtn.addEventListener("click", openCart);
  if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
  if (cartOverlay) cartOverlay.addEventListener("click", closeCart);
  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", () => {
      closeCart();
      openCheckoutModal();
    });
  }
}

function openCart() {
  document.getElementById("cart-drawer")?.classList.add("active");
  document.getElementById("cart-overlay")?.classList.add("active");
  renderCartItems();
}

function closeCart() {
  document.getElementById("cart-drawer")?.classList.remove("active");
  document.getElementById("cart-overlay")?.classList.remove("active");
}

function addToCart(sku) {
  const prod = GLOWTEX_PRODUCTS.find(p => p.sku === sku);
  if (!prod) return;

  const existing = AppState.cart.find(item => item.sku === sku && item.isB2B === AppState.isB2BMode);
  const minQty = AppState.isB2BMode ? (prod.moqB2B || 1) : 1;
  const unitPrice = AppState.isB2BMode ? prod.b2bPrice : prod.b2cPrice;

  if (existing) {
    existing.qty += AppState.isB2BMode ? 1 : 5;
  } else {
    AppState.cart.push({
      sku: prod.sku,
      name: prod.name,
      division: prod.division,
      isB2B: AppState.isB2BMode,
      unitPrice,
      unitLabel: AppState.isB2BMode ? (prod.division === 'machinery' || prod.division === 'tools' ? 'ud' : `rollo (~${prod.rollSize}m)`) : prod.unit,
      qty: minQty,
      hsCode: prod.hsCode
    });
  }

  updateCartBadge();
  openCart();
}

function updateCartQty(sku, isB2B, delta) {
  const item = AppState.cart.find(i => i.sku === sku && i.isB2B === isB2B);
  if (!item) return;

  item.qty += delta;
  if (item.qty <= 0) {
    AppState.cart = AppState.cart.filter(i => !(i.sku === sku && i.isB2B === isB2B));
  }
  updateCartBadge();
  renderCartItems();
}

function removeFromCart(sku, isB2B) {
  AppState.cart = AppState.cart.filter(i => !(i.sku === sku && i.isB2B === isB2B));
  updateCartBadge();
  renderCartItems();
}

function updateCartBadge() {
  const badge = document.getElementById("cart-badge-count");
  if (badge) {
    const totalCount = AppState.cart.reduce((acc, item) => acc + item.qty, 0);
    badge.textContent = totalCount;
  }
}

function renderCartItems() {
  const body = document.getElementById("cart-items-body");
  const subtotalEl = document.getElementById("cart-subtotal-val");
  const ivaEl = document.getElementById("cart-iva-val");
  const totalEl = document.getElementById("cart-total-val");
  const checkoutBtn = document.getElementById("btn-open-checkout");

  if (!body) return;

  if (AppState.cart.length === 0) {
    body.innerHTML = `
      <div style="text-align: center; padding: 50px 20px; color: #9CA3AF;">
        <i class="fas fa-shopping-bag" style="font-size: 3rem; margin-bottom: 12px; color: #CBD5E1;"></i>
        <h4 style="color: #111111; font-family: var(--font-serif);">Tu bolsa de compras está vacía</h4>
        <p style="font-size: 0.85rem; margin-top: 4px;">Explora nuestras colecciones textiles y maquinaria industrial.</p>
      </div>
    `;
    if (subtotalEl) subtotalEl.textContent = "$0.00";
    if (ivaEl) ivaEl.textContent = "$0.00";
    if (totalEl) totalEl.textContent = "$0.00";
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  if (checkoutBtn) checkoutBtn.disabled = false;

  let subtotal = 0;
  body.innerHTML = AppState.cart.map(item => {
    const lineTotal = item.unitPrice * item.qty;
    subtotal += lineTotal;

    return `
      <div class="cart-item-row">
        <div class="cart-item-info">
          <h5>${item.name}</h5>
          <div class="cart-item-sub">
            <span>SKU: ${item.sku}</span> | 
            <span>${item.isB2B ? 'B2B Mayorista' : 'B2C Menor'}</span> | 
            <span>$${item.unitPrice.toFixed(2)} / ${item.unitLabel}</span>
          </div>
          <div class="cart-item-controls">
            <button class="qty-btn" onclick="updateCartQty('${item.sku}', ${item.isB2B}, -1)">-</button>
            <span class="qty-val" style="font-size: 0.85rem; font-weight: 700; min-width: 20px; text-align: center;">${item.qty}</span>
            <button class="qty-btn" onclick="updateCartQty('${item.sku}', ${item.isB2B}, 1)">+</button>
            <button class="btn-remove-item" onclick="removeFromCart('${item.sku}', ${item.isB2B})">
              <i class="fas fa-trash-alt"></i> Eliminar
            </button>
          </div>
        </div>
        <div class="cart-item-total">
          $${lineTotal.toFixed(2)}
        </div>
      </div>
    `;
  }).join("");

  const iva = subtotal * 0.15; // 15% IVA Ecuador
  const total = subtotal + iva;

  if (subtotalEl) subtotalEl.textContent = `$${subtotal.toFixed(2)}`;
  if (ivaEl) ivaEl.textContent = `$${iva.toFixed(2)}`;
  if (totalEl) totalEl.textContent = `$${total.toFixed(2)}`;
}

// ==================== MODAL FICHA TÉCNICA DEL PRODUCTO ====================
function openProductModal(sku) {
  const prod = GLOWTEX_PRODUCTS.find(p => p.sku === sku);
  if (!prod) return;

  const modal = document.getElementById("product-detail-modal");
  const modalContent = document.getElementById("product-modal-content");
  if (!modal || !modalContent) return;

  modalContent.innerHTML = `
    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 20px;">
      <div>
        <img src="${prod.imageUrl}" alt="${prod.name}" style="width: 100%; height: 260px; object-fit: cover; border-radius: 4px; margin-bottom: 12px;">
        <span style="font-size: 0.72rem; background: #111111; color: #fff; padding: 3px 8px; border-radius: 2px; font-weight: 700; font-family: var(--font-sans);">${prod.sku}</span>
        <h3 style="color: #111111; font-family: var(--font-serif); margin: 8px 0 6px; font-size: 1.3rem;">${prod.name}</h3>
        <p style="font-size: 0.85rem; color: #6B7280; line-height: 1.5;">${prod.description}</p>
      </div>

      <div style="background: var(--color-bg-stone); padding: 20px; border-radius: 4px; border: 1px solid var(--color-border);">
        <h4 style="color: var(--color-gold); font-family: var(--font-sans); font-size: 0.8rem; letter-spacing: 1.5px; text-transform: uppercase; margin-bottom: 14px; font-weight: 800;">
          <i class="fas fa-stamp"></i> Regulación y Tributos SENAE (Ecuador)
        </h4>
        <div style="font-size: 0.82rem; line-height: 1.7;">
          <p><strong>Subpartida Arancelaria:</strong> <span style="color: #0284C7; font-weight: 800;">${prod.hsCode}</span></p>
          <p><strong>Normativa Técnica:</strong> ${prod.comex401}</p>
          <p><strong>País de Origen:</strong> ${prod.origin}</p>
          <p><strong>Precio FOB Origen:</strong> $${prod.fobPrice.toFixed(2)} USD</p>
          <p><strong>CIF Estimado:</strong> $${prod.cifEstimated.toFixed(2)} USD</p>
          <p><strong>Costo Puesto Bodega Quito:</strong> $${prod.unitCostEc.toFixed(2)} USD</p>
          <p><strong>Precio B2B Rollo:</strong> $${prod.b2bPrice.toFixed(2)} USD</p>
          <p><strong>Precio B2C Detalle:</strong> $${prod.b2cPrice.toFixed(2)} USD</p>
        </div>
      </div>
    </div>

    <div style="background: #F9F9F9; padding: 14px; border-radius: 4px; font-size: 0.82rem; margin-bottom: 20px; border: 1px solid var(--color-border);">
      <h5 style="color: #111111; font-family: var(--font-sans); margin-bottom: 6px;"><i class="fas fa-clipboard-check"></i> Especificaciones de Control de Calidad:</h5>
      <p>• Composición: ${prod.composition}</p>
      <p>• Gramaje / Ancho: ${prod.weight} · ${prod.width}</p>
      <p>• Parámetros técnicos: ${prod.technicalSpecs || 'Norma de ensayo ISO 105'}</p>
    </div>

    <div style="display: flex; justify-content: flex-end; gap: 10px;">
      <button class="btn-spec" onclick="simulateProductInTwin('${prod.sku}')">
        <i class="fas fa-microchip"></i> Simular en Gemelo Digital
      </button>
      <button class="btn-add-cart" onclick="addToCart('${prod.sku}'); closeProductModal();">
        <i class="fas fa-shopping-bag"></i> Añadir a la Bolsa
      </button>
    </div>
  `;

  modal.classList.add("active");
}

function closeProductModal() {
  document.getElementById("product-detail-modal")?.classList.remove("active");
}

function simulateProductInTwin(sku) {
  closeProductModal();
  switchView("gemelo-digital");
  const prod = GLOWTEX_PRODUCTS.find(p => p.sku === sku);
  if (!prod) return;

  const fobInput = document.getElementById("senae-fob-input");
  const freightInput = document.getElementById("senae-freight-input");
  const originSelect = document.getElementById("senae-origin-select");
  const unitsInput = document.getElementById("senae-units-input");

  if (fobInput) fobInput.value = (prod.fobPrice * 500).toFixed(2);
  if (freightInput) freightInput.value = (prod.fobPrice * 50).toFixed(2);
  if (originSelect) {
    if (prod.origin.includes("Colombia") || prod.origin.includes("Perú")) {
      originSelect.value = "CAN";
    } else if (prod.origin.includes("China")) {
      originSelect.value = "China";
    } else {
      originSelect.value = "Other";
    }
  }
  if (unitsInput) unitsInput.value = "500";

  executeSenaeCalculation();
}

// ==================== CHECKOUT Y FACTURACIÓN ELECTRÓNICA ====================
function openCheckoutModal() {
  const modal = document.getElementById("checkout-modal");
  if (!modal) return;

  let subtotal = 0;
  AppState.cart.forEach(i => subtotal += (i.unitPrice * i.qty));
  const iva = subtotal * 0.15;
  const total = subtotal + iva;

  const summaryEl = document.getElementById("checkout-order-summary");
  if (summaryEl) {
    summaryEl.innerHTML = `
      <div style="background: var(--color-bg-stone); padding: 16px; border-radius: 4px; border: 1px solid var(--color-border); margin-bottom: 16px; font-size: 0.85rem;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>Subtotal (${AppState.cart.length} líneas):</span>
          <strong>$${subtotal.toFixed(2)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
          <span>IVA 15% (Ecuador):</span>
          <strong>$${iva.toFixed(2)}</strong>
        </div>
        <div style="display: flex; justify-content: space-between; font-size: 1.15rem; color: #111111; font-family: var(--font-sans); border-top: 1px solid #CBD5E1; padding-top: 8px; margin-top: 8px; font-weight: 800;">
          <span>Total a Pagar:</span>
          <strong>$${total.toFixed(2)} USD</strong>
        </div>
      </div>
    `;
  }

  modal.classList.add("active");
}

function closeCheckoutModal() {
  document.getElementById("checkout-modal")?.classList.remove("active");
}

function selectPaymentMethod(methodName) {
  document.querySelectorAll(".payment-method-btn").forEach(btn => {
    btn.classList.toggle("active", btn.getAttribute("data-method") === methodName);
  });

  const detailsContainer = document.getElementById("payment-details-container");
  if (!detailsContainer) return;

  if (methodName === "payphone") {
    detailsContainer.innerHTML = `
      <div style="background: #EFF6FF; border: 1px solid #BFDBFE; padding: 14px; border-radius: 4px; font-size: 0.85rem; color: #1E3A8A;">
        <h5 style="margin-bottom: 6px; font-family: var(--font-sans);"><i class="fas fa-mobile-alt"></i> Pasarela PayPhone Ecuador</h5>
        <p>Ingresa tu número celular registrado en PayPhone para enviar el cobro directo a tu aplicación:</p>
        <input type="text" placeholder="09XXXXXXXX" style="width: 100%; padding: 8px 12px; margin-top: 8px; border: 1px solid #93C5FD; border-radius: 4px;" value="0994450914" />
      </div>
    `;
  } else if (methodName === "kushki") {
    detailsContainer.innerHTML = `
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; padding: 14px; border-radius: 4px; font-size: 0.85rem;">
        <h5 style="margin-bottom: 6px; color: #111111; font-family: var(--font-sans);"><i class="fas fa-credit-card"></i> Tarjeta de Crédito / Débito (Kushki / Placetopay)</h5>
        <div style="display: flex; flex-direction: column; gap: 8px; margin-top: 8px;">
          <input type="text" placeholder="Número de Tarjeta (Visa, Mastercard, Diners)" style="padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 4px;" value="•••• •••• •••• 4242" />
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
            <input type="text" placeholder="MM/AA" style="padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 4px;" value="12/28" />
            <input type="text" placeholder="CVV" style="padding: 8px 12px; border: 1px solid #CBD5E1; border-radius: 4px;" value="•••" />
          </div>
        </div>
      </div>
    `;
  } else {
    detailsContainer.innerHTML = `
      <div style="background: #FFFDF7; border: 1px solid #FDE68A; padding: 14px; border-radius: 4px; font-size: 0.85rem; color: #92400E;">
        <h5 style="margin-bottom: 6px; font-family: var(--font-sans);"><i class="fas fa-university"></i> Transferencia Bancaria Directa</h5>
        <p><strong>Banco Pichincha - Cuenta Corriente:</strong> 2100894561</p>
        <p><strong>Titular:</strong> GLOWTEX S.A.S.</p>
        <p><strong>Correo para comprobantes:</strong> pagos@glowtex.ec</p>
      </div>
    `;
  }
}

function processOrderCheckout() {
  let subtotal = 0;
  AppState.cart.forEach(i => subtotal += (i.unitPrice * i.qty));
  const iva = subtotal * 0.15;
  const total = subtotal + iva;
  const orderNumber = `GLX-EC-${Math.floor(100000 + Math.random() * 900000)}`;

  alert(`¡Pedido Confirmado con Éxito!\n\nNúmero de Proforma/Factura: ${orderNumber}\nTotal Procesado: $${total.toFixed(2)} USD (IVA 15% incluido)\n\nSe ha emitido la orden y notificado a Bodega Quito para preparación de despacho.`);

  AppState.cart = [];
  updateCartBadge();
  closeCheckoutModal();
}

// ==================== GEMELO DIGITAL (UI & CONTROLES) ====================
function initDigitalTwinUI() {
  const subnavBtns = document.querySelectorAll(".twin-subnav-btn");
  subnavBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      subnavBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const targetSubpanel = btn.getAttribute("data-subpanel");

      document.querySelectorAll(".twin-subpanel").forEach(p => {
        p.classList.toggle("hidden-view", p.id !== `subpanel-${targetSubpanel}`);
      });

      if (targetSubpanel === "financial") {
        updateFinancialChart();
      }
    });
  });

  const scBtns = document.querySelectorAll(".scenario-btn");
  scBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      scBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      AppState.activeScenario = btn.getAttribute("data-scenario");
      updateFinancialChart();
    });
  });

  const calcBtn = document.getElementById("btn-calc-senae");
  if (calcBtn) {
    calcBtn.addEventListener("click", executeSenaeCalculation);
  }

  executeSenaeCalculation();
}

function executeSenaeCalculation() {
  const fob = parseFloat(document.getElementById("senae-fob-input")?.value) || 36000;
  const freight = parseFloat(document.getElementById("senae-freight-input")?.value) || 5000;
  const insurance = parseFloat(document.getElementById("senae-insurance-input")?.value) || 400;
  const origin = document.getElementById("senae-origin-select")?.value || "China";
  const adValoremRate = parseFloat(document.getElementById("senae-advalorem-rate")?.value) || 10;
  const units = parseFloat(document.getElementById("senae-units-input")?.value) || 5000;
  const isCapitalGood = document.getElementById("senae-capital-good-check")?.checked || false;

  const result = DigitalTwinEngine.calculateSenaeDuties({
    fob,
    freight,
    insurance,
    origin,
    adValoremRate,
    units,
    isCapitalGood
  });

  const resContainer = document.getElementById("senae-calculation-output");
  if (resContainer) {
    resContainer.innerHTML = `
      <div class="result-box">
        <h4>1. Liquidación Aduanera SENAE / ECUAPASS</h4>
        <table class="table-calc">
          <tr><td>Valor FOB Declarado:</td><td>$${result.fob.toFixed(2)}</td></tr>
          <tr><td>Flete Internacional Marítimo/Aéreo:</td><td>$${result.freight.toFixed(2)}</td></tr>
          <tr><td>Seguro Internacional de Transporte:</td><td>$${result.insurance.toFixed(2)}</td></tr>
          <tr style="border-top: 1px solid #111; font-weight: 800;">
            <td><strong>Valor en Aduana (CIF):</strong></td>
            <td><strong>$${result.cif.toFixed(2)}</strong></td>
          </tr>
          <tr><td>Arancel Ad Valorem (${result.adValoremRate.toFixed(1)}%):</td><td>$${result.adValorem.toFixed(2)}</td></tr>
          <tr><td>FODINFA (0.5% sobre CIF):</td><td>$${result.fodinfa.toFixed(2)}</td></tr>
          <tr><td>Base Imponible IVA:</td><td>$${result.baseIva.toFixed(2)}</td></tr>
          <tr><td>IVA Importaciones (15%):</td><td>$${result.iva.toFixed(2)}</td></tr>
          <tr class="calc-highlight-row">
            <td><strong>Total Tributos al Fisco (SENAE):</strong></td>
            <td><strong>$${result.totalDuties.toFixed(2)}</strong></td>
          </tr>
        </table>
        <p style="font-size: 0.75rem; color: #6B7280; margin-top: 8px;">
          <strong>Tratamiento aplicado:</strong> ${result.appliedRule}
        </p>
      </div>

      <div class="result-box">
        <h4>2. Costo Puesto en Bodega Quito & Factor K</h4>
        <table class="table-calc">
          <tr><td>Valor CIF Mercadería:</td><td>$${result.cif.toFixed(2)}</td></tr>
          <tr><td>Tributos Arancelarios (Ad Valorem + FODINFA):</td><td>$${(result.adValorem + result.fodinfa).toFixed(2)}</td></tr>
          <tr><td>Gastos Portuarios & THC (Posorja/Guayaquil):</td><td>$${DigitalTwinEngine.TRIBUTOS_EC.GASTOS_PORTUARIOS_ESTIMADOS.toFixed(2)}</td></tr>
          <tr><td>Honorarios Agente de Aduana:</td><td>$${result.customsAgentFee.toFixed(2)}</td></tr>
          <tr><td>Flete Terrestre Guayaquil - Quito:</td><td>$${DigitalTwinEngine.TRIBUTOS_EC.FLETE_TERRESTRE_GYE_UIO.toFixed(2)}</td></tr>
          <tr class="calc-highlight-row">
            <td><strong>Costo Total Puesto en Quito:</strong></td>
            <td><strong>$${result.totalLandedCostQuito.toFixed(2)}</strong></td>
          </tr>
          <tr><td>Unidades / Metros del Embarque:</td><td>${result.units.toLocaleString()}</td></tr>
          <tr><td><strong>Costo Unitario Nacionalizado:</strong></td><td style="color: #0284C7; font-size: 1.1rem;"><strong>$${result.unitLandedCost.toFixed(2)} / ud</strong></td></tr>
          <tr><td><strong>Factor de Nacionalización (K = Costo/FOB):</strong></td><td style="color: var(--color-gold); font-size: 1.1rem;"><strong>${result.factorNacionalizacion.toFixed(3)}x</strong></td></tr>
        </table>
      </div>
    `;
  }
}

function updateFinancialChart() {
  const chartCanvas = document.getElementById("financial-chart-canvas");
  if (!chartCanvas) return;

  const projection = DigitalTwinEngine.generate12MonthProjection(AppState.activeScenario);
  const labels = projection.monthlyData.map(m => m.month);
  const sales = projection.monthlyData.map(m => m.sales);
  const grossProfit = projection.monthlyData.map(m => m.grossProfit);
  const opEx = projection.monthlyData.map(m => m.opEx);
  const netProfit = projection.monthlyData.map(m => m.netProfit);

  const totSalesEl = document.getElementById("metric-annual-sales");
  const totProfitEl = document.getElementById("metric-annual-profit");
  const roiEl = document.getElementById("metric-annual-roi");

  if (totSalesEl) totSalesEl.textContent = `$${projection.totalAnnualSales.toLocaleString()} USD`;
  if (totProfitEl) totProfitEl.textContent = `$${projection.totalAnnualNetProfit.toLocaleString()} USD`;
  if (roiEl) roiEl.textContent = `${projection.roiAnnual.toFixed(1)}%`;

  if (AppState.chartInstance) {
    AppState.chartInstance.destroy();
  }

  const ctx = chartCanvas.getContext("2d");
  AppState.chartInstance = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [
        {
          label: "Ventas Proyectadas",
          data: sales,
          backgroundColor: "#111111",
          borderRadius: 2
        },
        {
          label: "Margen Bruto",
          data: grossProfit,
          backgroundColor: "#C5A880",
          borderRadius: 2
        },
        {
          label: "Gastos Operativos (OpEx)",
          data: opEx,
          backgroundColor: "#E5E7EB",
          borderRadius: 2
        },
        {
          type: "line",
          label: "Utilidad Neta Mensual",
          data: netProfit,
          borderColor: "#059669",
          borderWidth: 2.5,
          fill: false,
          tension: 0.3
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "top" }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (val) { return `$${val / 1000}k`; }
          }
        }
      }
    }
  });
}

// ==================== SHOWROOM QUITO (120 m²) ====================
function renderShowroomVisuals() {
  const showroomContainer = document.getElementById("showroom-zones-container");
  if (!showroomContainer) return;

  const layout = DigitalTwinEngine.getShowroomLayout();
  showroomContainer.innerHTML = layout.map(zone => `
    <div style="background: #FFFFFF; border: 1px solid #E8E8E8; border-radius: 4px; padding: 14px; border-left: 4px solid ${zone.color};">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
        <span style="font-size: 0.85rem; font-weight: 700; color: #111111; font-family: var(--font-sans); display: flex; align-items: center; gap: 8px;">
          <i class="fas ${zone.icon}" style="color: ${zone.color};"></i> ${zone.area}
        </span>
        <span style="font-size: 0.85rem; font-weight: 800; color: var(--color-gold);">${zone.m2} m²</span>
      </div>
      <div style="background: #F4F4F4; border-radius: 2px; height: 6px; overflow: hidden;">
        <div style="background: ${zone.color}; width: ${zone.share}; height: 100%;"></div>
      </div>
      <div style="font-size: 0.72rem; color: #6B7280; margin-top: 4px; text-align: right;">${zone.share} del total</div>
    </div>
  `).join("");
}

// ==================== PROVEEDORES & GENERADOR RFQ ====================
function initSuppliersUI() {
  const grid = document.getElementById("suppliers-grid-container");
  if (!grid) return;

  grid.innerHTML = GLOWTEX_SUPPLIERS.map(sup => `
    <div class="supplier-card">
      <div class="supplier-card-header">
        <div>
          <span class="supplier-name">${sup.name}</span>
          <div style="font-size: 0.78rem; color: #6B7280;">${sup.country}</div>
        </div>
        <span class="supplier-flag">${sup.flag}</span>
      </div>
      <span class="supplier-tag">${sup.category}</span>
      <div class="supplier-details">
        <div><strong>Contacto:</strong> ${sup.contacts.email} | ${sup.contacts.phone}</div>
        <div><strong>Tratado Comercial:</strong> ${sup.tradeAgreement}</div>
        <div><strong>Tiempo de Entrega (Lead Time):</strong> ${sup.leadTimeDays} días</div>
        <div><strong>Pedido Mínimo (MOQ):</strong> ${sup.moq}</div>
        <div style="margin-top: 6px; font-style: italic;">"${sup.strengths}"</div>
      </div>
      <button class="btn-generate-rfq" onclick="openRFQGenerator('${sup.id}')">
        <i class="fas fa-file-contract"></i> Generar Solicitud de Cotización (RFQ)
      </button>
    </div>
  `).join("");
}

function openRFQGenerator(supplierId) {
  const sup = GLOWTEX_SUPPLIERS.find(s => s.id === supplierId) || GLOWTEX_SUPPLIERS[0];
  const items = GLOWTEX_PRODUCTS.filter(p => p.origin.includes(sup.country.split(" ")[0])).slice(0, 3);
  
  const sampleItems = items.length > 0 ? items.map(i => ({
    sku: i.sku,
    name: i.name,
    qty: AppState.isB2BMode ? 500 : 100,
    unit: i.unit,
    composition: i.composition
  })) : [
    { sku: "DEP-001", name: "Lycra Nylon Spandex", qty: 1000, unit: "metro", composition: "82% Nylon, 18% Spandex" }
  ];

  const rfqText = generateRFQTemplate(sup.id, sampleItems, "FOB");
  const outputEl = document.getElementById("rfq-generated-text");
  const modal = document.getElementById("rfq-viewer-modal");

  if (outputEl) outputEl.textContent = rfqText;
  if (modal) modal.classList.add("active");
}

function copyRFQToClipboard() {
  const text = document.getElementById("rfq-generated-text")?.textContent;
  if (text) {
    navigator.clipboard.writeText(text).then(() => {
      alert("Carta formal RFQ copiada al portapapeles. Puedes pegarla en tu correo corporativo.");
    });
  }
}

// ==================== MODALES ====================
function initModals() {
  document.querySelectorAll(".modal-overlay").forEach(overlay => {
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) {
        overlay.classList.remove("active");
      }
    });
  });

  document.querySelectorAll(".modal-close").forEach(btn => {
    btn.addEventListener("click", () => {
      btn.closest(".modal-overlay")?.classList.remove("active");
    });
  });
}
