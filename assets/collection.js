/* FITRA SHOP — collection filters & sorting */
(function () {
  'use strict';

  function init() {
    const form = document.querySelector('[data-filter-form]');
    if (!form) return;

    // Auto-submit on checkbox change
    form.querySelectorAll('[data-filter-input]').forEach((input) => {
      input.addEventListener('change', () => form.submit());
    });

    // Auto-submit on sort change
    const sortSelect = form.querySelector('[data-sort-select]');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => form.submit());
    });

    // Close other dropdowns when one opens
    const allDetails = form.querySelectorAll('details.filter-dropdown');
    allDetails.forEach((d) => {
      d.addEventListener('toggle', () => {
        if (d.open) {
          allDetails.forEach((other) => { if (other !== d) other.open = false; });
        }
      });
    });

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (!e.target.closest('.filter-dropdown')) {
        allDetails.forEach((d) => { d.open = false; });
      }
    });

    // Load more (progressive enhancement — appends next page)
    const loadMore = document.querySelector('[data-load-more]');
    if (loadMore) {
      loadMore.addEventListener('click', (e) => {
        e.preventDefault();
        const url = loadMore.href;
        loadMore.setAttribute('aria-busy', 'true');
        fetch(url, { headers: { 'X-Requested-With': 'XMLHttpRequest' } })
          .then((r) => r.text())
          .then((html) => {
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const newItems = doc.querySelectorAll('#CollectionGrid .product-card');
            const grid = document.getElementById('CollectionGrid');
            newItems.forEach((item) => grid.appendChild(item));
            const newLoadMore = doc.querySelector('[data-load-more]');
            if (newLoadMore) { loadMore.href = newLoadMore.href; loadMore.removeAttribute('aria-busy'); }
            else { loadMore.remove(); }
          })
          .catch(() => loadMore.removeAttribute('aria-busy'));
      });
    }
  }

  if (document.readyState !== 'loading') init();
  else document.addEventListener('DOMContentLoaded', init);
})();
