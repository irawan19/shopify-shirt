/* FITRA SHOP — Theme editor helpers (loaded only in design mode) */
(function () {
  'use strict';
  // Re-init interactions when sections reload in the theme editor
  document.addEventListener('shopify:section:load', function () {
    if (window.Fitra && window.Fitra.refreshCart) { window.Fitra.refreshCart(); }
  });
  document.addEventListener('shopify:section:select', function () {});
})();
