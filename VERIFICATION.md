# Verification

Completed 3 October 2026. Anti-Slop DURING, explicit session override. Delivery gate: **PASS**.

Latest review update: all three unique quotations match the supplied client-review screenshots exactly, including capitalization and punctuation. The duplicate fourth screenshot is not repeated as a separate review. Five olive stars are enlarged to 32–48px and centered across the section; the full quotation uses italic display typography. Previous/next arrows cycle through all reviews and wrap in both directions, replacing the old excerpt toggle. Production build, full browser check, and `node scripts/check-reviews.mjs` passed. Eight widths verify exact wording, star size/centering, a single accessible active quotation, stable section height, 44px controls, keyboard Enter/Space/focus, wraparound, no overflow, reduced-motion operation, and zero browser errors. Section text/stars measure at least 9.48:1 contrast. Desktop and phone screenshots were visually inspected. Evidence: [reviews-check.json](test-results/reviews-check.json).

Latest motion correction: the right leaf image leads an overlapping rise, followed by the middle facial and left reception. Production build and `node scripts/check-renewal.mjs` passed. At eight widths, six scroll samples verify the requested right/middle/left progress: 0/0/0, 50/25/0, 100/50/25, 100/75/50, 100/100/75, and 100/100/100. Pixel positions are checked with a two-pixel allowance for browser scroll rounding. Reverse scrolling, paused scrolling, initial/live reduced motion, return to normal motion, image loading, page bounds, keyboard navigation, and zero browser errors also pass. The desktop result was visually inspected. Evidence: [renewal-check.json](test-results/renewal-check.json).

Section addition: the supplied renewal reference becomes a section before the treatment menu, using only its exact Mielle Wellness label, paragraph, and See Services wording. Existing reception, facial, and leaf-shadow images match the reference. `npm run build`, `npm run check`, and `node scripts/check-motion.mjs` passed after the addition. Text contrast is 17.94:1; See Services has visible keyboard focus and Enter navigates to the treatment menu. Desktop and phone images were visually inspected.

Earlier slider adjustment: the insurer strip moves twice as fast and reaches both page edges with no horizontal padding or inset. Production build and the targeted marquee check passed again. Seven widths (320 through 1900px) measure 83.7–85.0px/s, exact viewport-width strip bounds, equal loop groups, uninterrupted hover motion, a seamless boundary, and no document overflow. Reduced motion retains the static original-logo grid. The desktop result was visually inspected. Evidence: [marquee-check.json](test-results/marquee-check.json).

`npm run build` passed TypeScript and the Vite production build. `npm run check` passed in Chrome: eight widths (320, 375, 600, 768, 1024, 1240, 1440, 1900), nine short-height hero layouts, 11 booking actions, offers, navigation, insurer gallery, both review controls, contact validation/draft/copy success and failure, newsletter consent/draft, phone menu, backdrop dismissal, Escape/focus restoration, inert menu background, desktop resize, and keyboard access. Fourteen outgoing links were exercised with navigation intercepted, so testing sent no messages. There were no console errors or uncaught exceptions. Evidence: [browser-check.json](test-results/browser-check.json).

The user's latest request undoes the rejected content/layout cleanup. The previous booking panels, service descriptions/details, About, panorama caption, existing review, contact form, newsletter, footer, and dialog instructions are restored. No new copy or original-site research was added. The earlier explicit Direct Billing replacement, video, raised logo, offer stack, and olive/lavender requests remain. The continuously sliding insurance strip is retained. The rejected cleanup's content inventory has been removed. This is a restoration, not a claim that every previously existing sentence appears in the screenshots.

`node scripts/check-marquee.mjs` passed at 320, 375, 600, 768, 1024, 1440, and 1900px. All 31 brands load in two matching groups. The track moves continuously left with linear infinite animation; hovering does not stop it. There are no arrow or pause buttons in the strip. Identical group widths and a boundary test confirm a seamless loop; no document overflow occurs. The duplicate is hidden from assistive technology. Reduced motion uses a static grid of the 31 original marks. Evidence: [marquee-check.json](test-results/marquee-check.json).

`node scripts/check-contrast.mjs` passed 417 regions at eight widths. The 305 normal-text regions measure at least 4.72:1 against a 4.5:1 requirement; larger text measures at least 3.75:1 against a 3:1 requirement. Sampling hides foreground text and checks the background across each rectangle, inset two pixels to exclude borders. Olive/ivory footer and button colours retain 10.38:1 contrast. Logotypes are excluded from text contrast requirements. Evidence: [contrast-check.json](test-results/contrast-check.json).

`node scripts/check-video.mjs` passed muted inline autoplay, pause/resume, loop restart, the 44px playback control, live/initial reduced-motion posters, and a failed-request still-frame fallback. Seven frames from the 38.6-second supplied clip were checked at 320, 375, and 1440px. All 175 regions pass: 154 text regions measure at least 7.03:1 against 4.5:1, and 21 icon regions at least 4.09:1 against 3:1. The supplied MP4 remains unchanged. Evidence: [video-check.json](test-results/video-check.json).

`node scripts/check-motion.mjs` passed centered botanical fades at 1440x900 and 375x812. Four olive/lavender layers wait for the viewport center, fade through intermediate opacity, then stay visible. Booking remains usable through the artwork. Service content reveals once; active navigation identifies Services. Reduced motion immediately reveals content, and missing IntersectionObserver leaves it visible. Menu and dialog transitions settle correctly. Evidence: [motion-check.json](test-results/motion-check.json).

`node scripts/check-stack.mjs` passed at 320, 375, 768, and 1440px: the offer scrolls over a stationary hero, remains above it, fits the page, opens booking, and changes navbar contrast when it reaches the header. The logo returns to the start of Home. Focusing a covered hero action returns it to view. Reduced motion uses sequential sections. Evidence: [stack-check.json](test-results/stack-check.json).

Restored desktop treatment/contact and phone introduction screenshots were visually inspected. Full-page screenshots were regenerated. All local photographs and logos load. The contact and newsletter forms prepare email requests; they do not claim automatic delivery. Booking and external links retain their existing destinations.

## Hard gate

- R-02 PASS: source search found no em dash in UI text.
- R-03 PASS: eight page widths and seven moving-strip widths have no document overflow; nine short-height layouts keep all three home actions visible.
- R-17 PASS: no invented statistics, prices, durations, or customer counts; the 10% offer is supplied in the screenshot.
- R-18 PASS: three unique full testimonials come directly from the user's supplied screenshots, with no invented authors, avatars, review counts, or quotations.
- R-23 PASS: existing branding, supplied video/insurer marks, previously authorized photographs, and explicitly requested olive/lavender artwork are preserved; no new assets are created.
- R-24 PASS: Home, About, Services, Direct Billing, Contact, and Reviews resolve to existing sections; external routes retain their prior destinations.
- R-25 PASS: prior 417 static and 175 video-frame regions pass their text/icon thresholds; renewal copy measures 17.94:1 and updated review text/stars measure at least 9.48:1 at eight widths.
- R-26 PASS: 11 booking actions, offers, insurer gallery, reviews, forms, menu, playback, and outgoing links have verified behavior; manual insurer controls stay removed.
- R-27 PASS: local content renders without simulated loading; the video has a loading poster/failure fallback; restored forms provide validation, empty input, draft readiness, and clipboard failure states.
- R-28 PASS: no FAQ is introduced.
- R-32 PASS: keyboard focus is visible, Skip to content targets main, dialogs/menu support Escape, menu focus returns, and covered hero controls return to view.
- R-33 PASS: features are authored directly in React and CSS through source patches; no runtime source-rewriting script implements them.
- R-34 PASS: no theme toggle or unsupported theme state is present.
- R-35 PASS: production build, restored interaction checks, screenshots, marquee, contrast, motion, video, and stack checks pass.
- R-36 PASS: no fabricated security, performance, compliance, customer, or treatment claims are introduced.
- R-37 PASS: explicit DURING mode and ENERGY 2 / RHYTHM 3 / MOTION 2 are recorded in DESIGN.md.
- R-38 PASS: restoration uses prior content at the user's request; the added section's text comes verbatim from the latest supplied screenshot, with no invented additions.

## Purpose gate

- R-01 PASS: no gradients or glow; the uniform 68% ivory veil and requested background blur protect foreground contrast over the supplied video.
- R-04 PASS: menu/close/play/pause icons identify actual controls, and booking arrows identify continuation; purposes are recorded in DESIGN.md.
- R-06 PASS: local Fraunces/Avenir maintain the brand voice; supplied uppercase labels act as editorial indexing.
- R-07 PASS: no decorative graph, grid, dot, or blueprint texture.
- R-08 PASS: arrows indicate actual booking/navigation continuation; there are no insurance arrows.
- R-09 PASS: no capsule badges.
- R-10 PASS: no glass panels or backdrop-filter; static blur affects the background media alone.
- R-12 PASS: no component shadows.
- R-13 PASS: no glow.
- R-14 PASS: treatment rows use alternating photo positions and unequal crops rather than interchangeable service cards.
- R-19 PASS: one-time entrances and centered fades organize reading; the requested offer overlap, continuously sliding insurer strip, and sequential scroll-driven photography have written purposes; reduced motion disables movement.
- R-22 PASS: the supplied video and brand imagery remain specific to Mielle; olive and lavender drawings fulfil explicit user requests.

## Liveliness

- Dials PASS: ENERGY 2 / RHYTHM 3 / MOTION 2 are explicit.
- Dial consistency PASS: photographic cover, offer stack, announcement, offset booking imagery, numbered treatments, insurer strip, About, panorama, and footer vary the rhythm.
- Focal point PASS: the gold emblem, offer heading, treatment names, insurer marks, and About heading each lead their composition.
- Whitespace PASS: alignment, differing section lengths, image crops, and reading widths structure the page rather than fill missing content.
- Accent PASS: plum appears sparingly on interaction; gold retains the supplied brand identity.
- Identity motif PASS: the supplied monogram, Fraunces display voice, ivory/olive palette, and botanical silhouettes repeat with purpose.
- Design Read PASS: the warm editorial wellness direction was declared and remains documented in DESIGN.md.

## Craftsmanship and consistency

- C-1 PASS: each major colour, layout, type, image, icon, and motion decision has a written purpose.
- C-2 PASS: every current interactive control is exercised; provider marks remain non-interactive.
- C-3 PASS: restored sections follow the prior page; the new photographic section follows the user's explicit screenshot and motion request.
- C-4 PASS: narrow/intermediate/wide layouts, menus, dialogs, keyboard, media failure, reduced motion, and observer fallback pass.
- C-5 PASS: restored copy is identified as previous content; renewal text and all three full review quotations match supplied screenshots and are checked in the browser.
- R-05 PASS: the requested centered hero is specific to the reference; subsequent sections vary editorial alignment, image proportions, density, and motion.
- R-11 PASS: buttons have two-pixel corners; photographs remain square; there is no pill-shaped component system.
- R-15 PASS: existing action labels are restored at the user's request; no new generic CTA is written.
- R-16 PASS: prior wording is restored; the new paragraph is supplied reference copy, not generated prose.
- R-20 PASS: the supplied gold brand assets, treatment video, typefaces, and botanicals maintain Mielle's identity.
- R-21 PASS: warm light sections and olive footer retain the brand direction; the local olive-black photographic section follows its specific supplied reference without changing the whole site theme.
- R-29 PASS: olive/sage/gold form an analogous family; plum is a controlled complementary accent, with warm neutrals supporting it.
- R-30 PASS: composition follows the supplied Mielle references and explicit revisions, not another product's interface.
- R-31 PASS: DESIGN.md explains the principal visual decisions in concrete terms.

## UI and mobile supplements

- Colour/hierarchy PASS: distinct logo, display, body, indexing, navigation, and action roles preserve brand colours and measured contrast.
- Composition PASS: no bento grid, pricing template, fake terminal, badge, floating blob, unnecessary container, or status indicator.
- Motion PASS: the user's specific insurance-loop request overrides the skill's default prohibition on endless loops; no hover pause or controls are added. Reduced motion retains a static gallery. Other motion remains purposeful and restrained.
- Content PASS: restoration uses previous wording; renewal text and client reviews use exact supplied screenshot copy, with no new original-site research. The Direct Billing replacement remains verified.
- Responsive structure PASS: phone, intermediate, and wide compositions reflow deliberately; all three home choices remain visible on tested short screens.
- Sizing/overflow PASS: photographs and logo slots scale by context; clipping is limited to intentional decorative/image frames and the sliding-strip viewport.
- Touch/keyboard PASS: primary controls retain at least 44px targets; the mobile menu's visible Menu/Close labels are restored; focus and keyboard activation pass.
- Gestalt PASS: proximity, similarity, continuity, figure/ground, asymmetric balance, and structural whitespace map to the actual composition in DESIGN.md.
