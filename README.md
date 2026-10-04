# Nomena Ramananarivo — Portfolio

Single-page portfolio for freelance work in **Odoo ERP**, **Excel VBA automation**
and **.NET** development.

**Live site:** https://nomena06.github.io/portoflio-/

## Structure

```
index.html        # all content, semantic sections, SEO meta + JSON-LD
css/style.css     # hand-written CSS, design tokens, light + dark themes
js/main.js        # theme toggle, EN/FR switch, nav, scroll reveal, contact form
assets/img/       # project screenshots
assets/favicon.ico
robots.txt, sitemap.xml, ads.txt
```

No build step and no framework: open `index.html` in a browser, or serve the
folder with `python3 -m http.server 8080`.

## Features

- Responsive, mobile-first layout (single breakpoint set, no grid framework)
- Light / dark theme, remembered in `localStorage`, follows the OS on first visit
- Full **EN / FR** translation switch (strings in `js/main.js`)
- Scroll reveal via `IntersectionObserver`, with `prefers-reduced-motion` respected
- Accessible: skip link, focus-visible styles, `aria` state on nav and language switch
- SEO: meta description, Open Graph, `Person` JSON-LD, sitemap, robots

## Editing content

- **Text:** edit `index.html`; each translatable node carries a `data-i18n="key"`
  attribute. Add the matching key to the `FR` object in `js/main.js` for the
  French version — if a key is missing, the English text is kept.
- **Projects:** duplicate an `<article class="proj">` block and drop a new image
  into `assets/img/`.
- **Colours:** change the tokens under `:root` (and `html[data-theme="dark"]`)
  at the top of `css/style.css`.
