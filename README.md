# Yehia Tech — Merch (concept store)

A concept merch store for the Yehia Tech YouTube channel (software engineering and AI). Arabic, right-to-left.

This is a design concept: the cart works, but there is no payment and nothing is for sale yet. Prices and size tables are placeholders.

## What's inside

- **Hero:** a live design canvas. Product layers float, follow the pointer, and can be grabbed and thrown.
- **Hoodie:** the logo "selected in a design tool", with a draggable selection box and a 360° turn.
- **T-shirt:** an Arabic git diff that types itself.
- **Mug:** a 3D mug whose "context window" bar fills as you scroll.
- **Stickers:** drag them onto a laptop lid; ⌘Z, Esc and Enter work.
- Sizes, about, an FAQ chat, and a cart drawer.

## Run it

```bash
npm install
npm run dev
```

Then open http://localhost:5173. `npm run build` writes the production site to `dist/`.

## Stack

React, Vite, GSAP (ScrollTrigger), Lenis and Three.js.

## Project layout

- `src/components` — one file per section
- `src/lib/data.js` — products, prices, sizes, FAQ and the YouTube link
- `assets/brand`, `assets/print` — the logo and print artwork as vectors
- `assets/products`, `assets/details`, `assets/lifestyle`, `assets/cutouts`, `assets/video` — product imagery (AI-generated mockups)
- `tools` — scripts that trace the logo and draw the print artwork

## Credits

Fonts: IBM Plex Sans Arabic and Cascadia Code, both under the SIL Open Font License (see `assets/fonts`).
