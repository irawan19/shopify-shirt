/* FITRA SHOP — global interactions */
(function () {
  'use strict';

  const cartCountEls = () => document.querySelectorAll('[data-cart-count]');

  function fetchCart() {
    return fetch(`${window.routes.cart_url}.js`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      credentials: 'same-origin'
    }).then((r) => r.json());
  }

  function updateCartCount(count) {
    cartCountEls().forEach((el) => {
      el.textContent = count;
      el.closest('[data-cart-count-wrap]').classList.toggle('is-hidden', count === 0);
    });
  }

  function formatMoney(cents, format) {
    if (typeof window.Shopify !== 'undefined' && window.Shopify.formatMoney && window.Shopify.money_format) {
      try { return window.Shopify.formatMoney(cents, window.Shopify.money_format); } catch (e) {}
    }
    return '$' + (cents / 100).toFixed(2);
  }

  async function refreshCartDrawer() {
    const cart = await fetchCart();
    updateCartCount(cart.item_count);
    const drawerBody = document.querySelector('[data-cart-drawer-body]');
    const drawerFooter = document.querySelector('[data-cart-drawer-footer]');
    if (!drawerBody) return;
    if (cart.item_count === 0) {
      const emptyMsg = drawerBody.getAttribute('data-empty-text') || 'YOUR BAG IS EMPTY';
      drawerBody.innerHTML = `<p class="mono-ui text-muted" style="text-align:center;padding:48px 0;">${emptyMsg}</p>`;
      if (drawerFooter) drawerFooter.style.display = 'none';
      return;
    }
    if (drawerFooter) drawerFooter.style.display = '';
    const items = cart.items.map((item) => {
      const img = item.image ? item.image : '';
      return `
        <div class="cart-item" data-key="${item.key}" data-line="${item.index}">
          <div class="cart-item__media">
            ${img ? `<img src="${img}" alt="${item.title}" width="96" height="128" loading="lazy">` : ''}
          </div>
          <div class="cart-item__body">
            <div class="flex-between">
              <h3 class="cart-item__title">${item.product_title}</h3>
              <button class="cart-item__remove" data-remove aria-label="Remove item">
                <span class="material-symbols-outlined" style="font-size:18px;">delete</span>
              </button>
            </div>
            <p class="cart-item__variant mono-ui text-muted">${item.variant_title || ''}</p>
            <div class="cart-item__foot">
              <div class="qty" data-qty>
                <button data-qty-down aria-label="Decrease quantity">-</button>
                <span data-qty-val>${item.quantity}</span>
                <button data-qty-up aria-label="Increase quantity">+</button>
              </div>
              <p class="cart-item__price mono-ui">${formatMoney(item.final_line_price)}</p>
            </div>
          </div>
        </div>`;
    }).join('');
    drawerBody.innerHTML = items;

    const subtotalEl = document.querySelector('[data-cart-subtotal]');
    if (subtotalEl) subtotalEl.textContent = formatMoney(cart.total_price);
    updateFreeShipping(cart.total_price);
  }

  function updateFreeShipping(total) {
    const wrap = document.querySelector('[data-free-shipping]');
    if (!wrap) return;
    const threshold = parseInt(wrap.getAttribute('data-threshold') || '0', 10);
    const remaining = Math.max(threshold - total, 0);
    const remainingEl = wrap.querySelector('[data-remaining]');
    const barEl = wrap.querySelector('[data-bar]');
    if (remainingEl) {
      remainingEl.innerHTML = remaining > 0
        ? `You are <strong>${formatMoney(remaining)}</strong> away from free shipping.`
        : `You've unlocked free shipping.`;
    }
    if (barEl) {
      const pct = threshold > 0 ? Math.min((total / threshold) * 100, 100) : 100;
      barEl.style.width = pct + '%';
    }
  }

  async function changeLine(key, quantity) {
    const res = await fetch(`${window.routes.cart_change_url}.js`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      credentials: 'same-origin',
      body: JSON.stringify({ id: key, quantity: quantity })
    });
    if (res.ok) {
      await refreshCartDrawer();
    } else {
      console.error('Cart change failed:', await res.text().catch(() => ''));
    }
  }

  async function addToCart(form) {
    const formData = new FormData(form);
    const res = await fetch(`${window.routes.cart_add_url}.js`, {
      method: 'POST',
      headers: { 'Accept': 'application/json' },
      credentials: 'same-origin',
      body: formData
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.description || 'Unable to add to cart');
    }
    await refreshCartDrawer();
  }

  /* ---------- Drawer open/close ---------- */
  function openDrawer(selector) {
    const drawer = document.querySelector(selector);
    if (!drawer) return;
    const overlay = drawer.querySelector('.overlay') || document.querySelector('[data-overlay-for="' + selector + '"]');
    drawer.classList.add('is-open');
    if (overlay) overlay.classList.add('is-active');
    document.body.classList.add('drawer-open');
    drawer.setAttribute('aria-hidden', 'false');
    const focusable = drawer.querySelector('input, button, a');
    if (focusable) setTimeout(() => focusable.focus(), 300);
  }
  function closeDrawer(drawer) {
    if (!drawer) return;
    drawer.classList.remove('is-open');
    document.body.classList.remove('drawer-open');
    drawer.setAttribute('aria-hidden', 'true');
    // Find associated overlay (external or internal)
    var selector = null;
    if (drawer.hasAttribute('data-cart-drawer')) selector = '[data-cart-drawer]';
    else if (drawer.hasAttribute('data-mobile-menu')) selector = '[data-mobile-menu]';
    var overlay = drawer.querySelector('.overlay');
    if (!overlay && selector) overlay = document.querySelector('[data-overlay-for="' + selector + '"]');
    if (overlay) overlay.classList.remove('is-active');
  }

  window.Fitra = window.Fitra || {};
  window.Fitra.openCart = () => openDrawer('[data-cart-drawer]');
  window.Fitra.closeDrawer = closeDrawer;
  window.Fitra.addToCart = addToCart;
  window.Fitra.refreshCart = refreshCartDrawer;

  /* ---------- Inline header search toggle ---------- */
  function toggleHeaderSearch(force) {
    const wrap = document.querySelector('[data-header-search]');
    if (!wrap) return;
    const willOpen = force === undefined ? !wrap.classList.contains('is-open') : force;
    wrap.classList.toggle('is-open', willOpen);
    if (willOpen) {
      const input = wrap.querySelector('.header__search-input');
      if (input) setTimeout(() => input.focus(), 100);
    }
  }
  function toggleMobileSearch(force) {
    const bar = document.querySelector('[data-mobile-search-bar]');
    if (!bar) return;
    const willOpen = force === undefined ? bar.style.display === 'none' : force;
    bar.style.display = willOpen ? 'block' : 'none';
    if (willOpen) {
      const input = bar.querySelector('input[type="search"]');
      if (input) setTimeout(() => input.focus(), 100);
    }
  }
  window.Fitra.toggleHeaderSearch = toggleHeaderSearch;
  window.Fitra.toggleMobileSearch = toggleMobileSearch;

  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-cart-open]');
    if (opener) { e.preventDefault(); window.Fitra.openCart(); return; }
    const searchToggle = e.target.closest('[data-search-toggle]');
    if (searchToggle) {
      e.preventDefault();
      if (searchToggle.closest('.header__mobile')) {
        toggleMobileSearch();
      } else {
        toggleHeaderSearch();
      }
      return;
    }
    // Close inline search when clicking outside
    const searchWrap = e.target.closest('[data-header-search]');
    if (!searchWrap) {
      const headerSearch = document.querySelector('[data-header-search]');
      if (headerSearch) headerSearch.classList.remove('is-open');
    }
    const closer = e.target.closest('[data-drawer-close]');
    if (closer) {
      const drawer = closer.closest('.drawer') || closer.closest('[data-mobile-menu]');
      if (drawer) closeDrawer(drawer);
      else {
        // External overlay close
        const menu = document.querySelector('[data-mobile-menu]');
        if (menu && menu.classList.contains('is-open')) closeDrawer(menu);
        else { const cd = document.querySelector('[data-cart-drawer]'); if (cd) closeDrawer(cd); }
      }
      return;
    }
    const overlay = e.target.closest('.overlay');
    if (overlay) {
      const drawer = overlay.closest('.drawer') || overlay.closest('[data-mobile-menu]');
      if (drawer) closeDrawer(drawer);
      else {
        const forAttr = overlay.getAttribute('data-overlay-for');
        if (forAttr) { const target = document.querySelector(forAttr); if (target) closeDrawer(target); }
      }
      return;
    }
    const removeBtn = e.target.closest('[data-remove]');
    if (removeBtn) {
      const item = removeBtn.closest('.cart-item');
      if (item) changeLine(item.getAttribute('data-key'), 0);
      return;
    }
    const qtyUp = e.target.closest('[data-qty-up]');
    if (qtyUp) {
      const item = qtyUp.closest('.cart-item');
      const val = qtyUp.closest('[data-qty]').querySelector('[data-qty-val]');
      changeLine(item.getAttribute('data-key'), parseInt(val.textContent, 10) + 1);
      return;
    }
    const qtyDown = e.target.closest('[data-qty-down]');
    if (qtyDown) {
      const item = qtyDown.closest('.cart-item');
      const val = qtyDown.closest('[data-qty]').querySelector('[data-qty-val]');
      changeLine(item.getAttribute('data-key'), Math.max(parseInt(val.textContent, 10) - 1, 0));
      return;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.drawer.is-open').forEach(closeDrawer);
      const headerSearch = document.querySelector('[data-header-search]');
      if (headerSearch) headerSearch.classList.remove('is-open');
      const mobileBar = document.querySelector('[data-mobile-search-bar]');
      if (mobileBar) mobileBar.style.display = 'none';
    }
  });

  /* ---------- Add to cart forms ---------- */
  document.addEventListener('submit', (e) => {
    const wrap = e.target.closest('[data-product-form]');
    if (!wrap) return;
    const form = e.target;
    const submitter = e.submitter;
    const btn = submitter && submitter.hasAttribute('data-buy-now') ? submitter : form.querySelector('[data-add-button]');
    e.preventDefault();
    if (btn) { btn.setAttribute('aria-busy', 'true'); btn.disabled = true; }
    addToCart(form)
      .then(() => {
        window.Fitra.openCart();
      })
      .catch((err) => {
        const errEl = wrap.querySelector('[data-form-error]');
        if (errEl) { errEl.textContent = err.message; errEl.classList.remove('is-hidden'); }
      })
      .finally(() => {
        if (btn) { btn.removeAttribute('aria-busy'); btn.disabled = false; }
      });
  });

  /* ---------- Variant selection (product page) ---------- */
  function initVariantSelectors() {
    const wrap = document.querySelector('[data-variant-root]');
    if (!wrap) return;
    const variantsScript = document.querySelector('[data-variants-json]');
    const variants = variantsScript ? JSON.parse(variantsScript.textContent || '[]') : [];
    const selects = wrap.querySelectorAll('[data-option-selector]');
    const idInput = wrap.querySelector('[data-variant-id]');
    const priceEl = document.querySelector('[data-product-price]');
    const compareEl = document.querySelector('[data-product-compare]');
    const addBtn = wrap.querySelector('[data-add-button]');
    const addLabel = wrap.querySelector('[data-add-label]');
    const stockNote = document.querySelector('[data-stock-note]');

    function selectedOptions() {
      return Array.from(selects).map((s) => {
        const active = s.querySelector('.is-selected');
        return active ? active.getAttribute('data-option-value') : null;
      });
    }

    function findVariant() {
      const opts = selectedOptions();
      return variants.find((v) => v.options.every((o, i) => o === opts[i]));
    }

    function update() {
      const v = findVariant();
      if (!v) {
        if (addBtn) addBtn.disabled = true;
        if (addLabel) addLabel.textContent = 'UNAVAILABLE';
        if (stockNote) { stockNote.textContent = 'UNAVAILABLE'; stockNote.className = 'product__stock mono-ui text-coffee'; }
        return;
      }
      if (idInput) idInput.value = v.id;
      if (priceEl) priceEl.textContent = formatMoney(v.price);
      if (compareEl) {
        if (v.compare_at_price > v.price) {
          compareEl.textContent = formatMoney(v.compare_at_price);
          compareEl.classList.remove('is-hidden');
        } else { compareEl.classList.add('is-hidden'); }
      }
      if (addBtn) {
        addBtn.disabled = !v.available;
        if (addLabel) addLabel.textContent = v.available ? 'ADD TO BAG' : 'SOLD OUT';
      }
      if (stockNote) {
        stockNote.textContent = v.available ? 'IN STOCK' : 'SOLD OUT';
        stockNote.className = 'product__stock mono-ui ' + (v.available ? 'text-muted' : 'text-coffee');
      }
      if (v.featured_media && window.Fitra && window.Fitra.selectMedia) {
        window.Fitra.selectMedia(v.featured_media);
      }
    }

    selects.forEach((group) => {
      const buttons = group.querySelectorAll('[data-option-value]');
      buttons.forEach((btn) => {
        btn.addEventListener('click', () => {
          buttons.forEach((b) => { b.classList.remove('is-selected'); b.setAttribute('aria-pressed', 'false'); });
          btn.classList.add('is-selected');
          btn.setAttribute('aria-pressed', 'true');
          const label = group.querySelector('[data-option-label]');
          if (label) label.textContent = btn.getAttribute('data-option-value').toUpperCase();
          update();
        });
      });
    });
    update();
  }

  /* ---------- Product gallery media selection ---------- */
  function initGallery() {
    const items = document.querySelectorAll('[data-media-id]');
    const thumbs = document.querySelectorAll('[data-thumb-target]');
    window.Fitra = window.Fitra || {};
    window.Fitra.selectMedia = function (mediaId) {
      items.forEach((it) => it.classList.toggle('is-active', String(it.getAttribute('data-media-id')) === String(mediaId)));
      thumbs.forEach((t) => t.classList.toggle('is-active', t.getAttribute('data-thumb-target') === String(mediaId)));
      const active = document.querySelector('.product__media-item.is-active');
      if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    };
    thumbs.forEach((t) => {
      t.addEventListener('click', () => window.Fitra.selectMedia(t.getAttribute('data-thumb-target')));
    });
  }

  if (document.readyState !== 'loading') { initVariantSelectors(); initGallery(); }
  else document.addEventListener('DOMContentLoaded', () => { initVariantSelectors(); initGallery(); });

  /* ---------- Mobile menu ---------- */
  document.addEventListener('click', (e) => {
    const opener = e.target.closest('[data-menu-open]');
    if (opener) {
      const menu = document.querySelector('[data-mobile-menu]');
      if (menu) {
        menu.classList.add('is-open');
        document.body.classList.add('drawer-open');
        menu.setAttribute('aria-hidden','false');
        const ov = document.querySelector('[data-overlay-for="[data-mobile-menu]"]');
        if (ov) ov.classList.add('is-active');
      }
      return;
    }
    const closer = e.target.closest('[data-menu-close]');
    if (closer) {
      const menu = document.querySelector('[data-mobile-menu]');
      if (menu) {
        menu.classList.remove('is-open');
        document.body.classList.remove('drawer-open');
        menu.setAttribute('aria-hidden','true');
        const ov = document.querySelector('[data-overlay-for="[data-mobile-menu]"]');
        if (ov) ov.classList.remove('is-active');
      }
      return;
    }
  });

  /* ---------- Sticky header shadow on scroll ---------- */
  const header = document.querySelector('[data-sticky-header]');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 10) header.classList.add('is-scrolled');
      else header.classList.remove('is-scrolled');
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ---------- Expose money helper ---------- */
  window.Fitra.formatMoney = formatMoney;
})();
