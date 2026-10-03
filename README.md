# Mielle Wellness

React + TypeScript + Vite, Tailwind CSS 4, and shadcn-style Radix UI components. Redesigned around the supplied Mielle Wellness photography and branding, with a clearer booking hierarchy, an olive/sage/ivory palette, Gestalt grouping, and accessible entrance and scroll animations.

```sh
npm install
npm run dev
```

The development site runs at http://localhost:5173. Run `npm run build` for the production build and `npm run preview` to view it.

Booking opens the original booking provider or the relevant service page. Contact and newsletter forms validate input, then prepare an email draft for the visitor to send. No backend or newsletter provider was supplied, so no delivery or subscription success is claimed.

Assets can be refreshed with `python scripts/download-assets.py`. The gallery has the 31 unique insurer brands supplied across the image batches. ClaimSecure uses its official current logo, which includes an additional subsidiary caption compared with the attachment.

With the development server running, `npm run check` verifies the controls, forms, and eight responsive widths. `node scripts/check-contrast.mjs` checks text backgrounds and navigation contrast. `node scripts/check-motion.mjs` verifies normal motion, reduced motion, active navigation, and the no-observer fallback. These scripts use installed Google Chrome through Playwright.

Visual direction is recorded in DESIGN.md; browser verification and the antislop delivery gate are recorded in VERIFICATION.md.
