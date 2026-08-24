# custom-theme

A custom Shopify Online Store 2.0 theme built from the design references — a minimalist outdoor T-shirt brand aesthetic with editorial typography, hairline borders, and a high-key light-mode interface.

## Design language

- **Typography**: EB Garamond (display/headlines), Geist (body/UI), Geist Mono (technical/price)
- **Icons**: Material Symbols Outlined
- **Surfaces**: `#f9f9f9` background, `#ffffff` surface, `#f7f5f4` interface
- **Accents**: `#000000` primary, `#444748` muted, `#4a3028` coffee
- **Hairlines**: `#e5e5e5` borders, 1px cell dividers on product grids
- **Layout**: 20px mobile / 64px desktop margins, ~120px section gap, 72px header height

## Structure

```
.
├── assets/            Theme CSS, JS, and static assets
├── config/            settings_schema.json + settings_data.json
├── layout/            theme.liquid (global) + password.liquid
├── locales/           en.default.json
├── sections/          Section files (header, footer, hero, main-*, etc.)
├── snippets/          Reusable snippets (product-card, icon, pagination, drawers)
└── templates/         Page templates (index, product, collection, cart, search, ...)
```

## Templates

| Template | File | Description |
|---|---|---|
| Homepage | `templates/index.liquid` | Hero, new arrivals grid, editorial sections |
| Product | `templates/product.json` | Media gallery, variants, add-to-cart, accordions |
| Collection | `templates/collection.liquid` | Filterable product grid with bordered cells |
| Cart | `templates/cart.json` | AJAX cart drawer + full `/cart` page |
| Search | `templates/search.json` | Native Shopify search with product results |
| Page | `templates/page.json` | Default page |
| About | `templates/page.about.json` | About/FAQ/contact form |
| Blog | `templates/blog.liquid` | Article listing |
| Article | `templates/article.liquid` | Single article |
| List collections | `templates/list-collections.liquid` | All collections index |
| 404 | `templates/404.liquid` | Not found fallback |
| Password | `templates/password.liquid` | Password page |

## Sections

- `header.liquid` + `header-group.json` — sticky header with desktop nav, mobile drawer, cart/search controls
- `footer.liquid` + `footer-group.json` — footer with brand, links, newsletter
- `announcement-bar.liquid` — top announcement strip
- `hero.liquid` — campaign hero with image + CTAs
- `featured-products.liquid` — new arrivals grid
- `collection-showcase.liquid` — collection highlight cards
- `brand-story.liquid` — editorial brand story block
- `newsletter-banner.liquid` — email capture banner
- `main-product.liquid` — product detail layout
- `main-collection.liquid` — collection page layout (used by JSON template variant)
- `main-cart.liquid` — cart page layout
- `main-search.liquid` — search page layout
- `main-page.liquid` / `main-page-about.liquid` — page layouts

## Snippets

- `product-card.liquid` — reusable product card with crossfade hover, swatches, badges
- `collection-grid.liquid` — collection header + filters + grid + pagination
- `cart-drawer.liquid` — slide-out cart with AJAX updates
- `search-drawer.liquid` — slide-out search
- `icon.liquid` — Material Symbols icon renderer
- `pagination.liquid` — numbered pagination
- `meta-tags.liquid` — Open Graph / Twitter meta

## Theme settings

Configured in `config/settings_schema.json`:

- **Colors**: primary, text, surface, interface, hairline, coffee, muted
- **Typography**: heading / body / mono font pickers
- **Layout**: desktop margin, section gap
- **Cart**: drawer toggle, free shipping threshold
- **Product cards**: hover behavior (crossfade / zoom / none)
- **Homepage**: hero image picker
- **Social**: Instagram, Twitter, Pinterest, email

The store name is rendered dynamically via `{{ shop.name }}` — it automatically picks up the Shopify admin store name.

## Install

### Option A — GitHub integration (recommended)

1. In Shopify Admin go to **Online Store → Themes → Add theme → Connect from GitHub**
2. Connect the `irawan19/shopify-shirt` repository, branch `main`
3. Shopify pulls the theme and adds it to your theme library
4. Click **Preview** to test, then **Publish** when ready

### Option B — ZIP upload

```bash
cd path/to/template
zip -r ../custom-theme.zip . -x ".*" "*.bak"
```

Then in Shopify Admin: **Online Store → Themes → Add theme → Upload zip file** → select `custom-theme.zip`.

## Development notes

- Templates that need theme-editor section management use JSON (`product.json`, `cart.json`, `search.json`, `page.json`, `page.about.json`).
- Templates that render directly without section settings use Liquid (`index.liquid`, `collection.liquid`, `blog.liquid`, `article.liquid`, `list-collections.liquid`, `404.liquid`, `password.liquid`).
- Do **not** put `{% schema %}` blocks inside template files (`templates/*.liquid`) — only inside section files (`sections/*.liquid`). Schema blocks in template files cause Shopify to reject the template and fall through to 404.
- Font picker defaults use Shopify Library handles (`eb_garamond_n4`, `assistant_n4`, `roboto_mono_n4`). Google Fonts (EB Garamond, Geist, Geist Mono) are loaded via `<link>` in `theme.liquid` for visual fidelity to the reference design.
- Product/collection imagery uses Shopify-managed media (`product.featured_media`, `collection.image`) — assign real images in the admin for accurate previews.

## Reference

This theme is an implementation of the design system documented in `reference/aura_earth/DESIGN.md` and the per-page references under `reference/`. The reference directory is the design source of truth and is not part of the theme itself.

## License

Custom theme for the storefront.
