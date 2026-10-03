# Mielle Wellness: restored editorial design

Anti-Slop DURING is the explicit session choice. ENERGY 2 / RHYTHM 3 / MOTION 2 reflect the user's calm, warm editorial wellness direction. This revision restores the page before the rejected content/layout cleanup; it introduces no new copy or design direction. The requested continuously sliding insurance strip remains.

## Restoration scope

Restore treatment descriptions and details, photographic booking panels, the full About composition, room caption, existing review, contact details and form, newsletter, footer, and dialog instructions. Restore visible Menu/Close labels and Skip to content. These are previous page elements restored at the user's request, not newly researched content. No additional copy is imported from the original website.

Keep the earlier requested home video, raised and reduced logo, three booking actions, scroll-over offer card, exact Direct Billing announcement, and olive/lavender backgrounds. Do not restore the introductory paragraph and first-visit offer link that the user explicitly replaced with Direct Billing.

## Composition and hierarchy

The full-width hero follows the supplied reference: centered gold emblem and three booking choices. A uniform 68% ivory veil and five-pixel background blur protect contrast without blurring foreground content. The logo is capped at 300px on desktop, 240px at intermediate widths, and 180px on phones, with height-sensitive sizing to keep all three actions in view.

Book In-Clinic is filled olive; Book Mobile and Skin Treatment use ivory with olive outlines. Two-pixel corners, restrained plum hover, and clear focus outlines distinguish states. Arrow movement indicates continuation into booking or navigation. Menu/close/play/pause glyphs identify actual controls; they are not feature decoration.

The first-appointment offer is a real ivory section that scrolls above the sticky hero within the Home group. Its serif heading, gold logo, and outlined action follow the supplied offer reference. Following sections scroll normally. Home navigation and focus on covered hero controls return to the group's start. Reduced motion presents ordinary sequential sections.

The introduction pairs a narrow editorial heading with the supplied Direct Billing announcement. Two photographic booking settings follow, with text over darkened photo bases. Numbered treatment rows alternate image positions and unequal crops; fine dividers, descriptions, and treatment details replace card containers. Billing uses a quiet text introduction and insurer marks. About offsets its emblem photograph and editorial text. The room panorama separates About from the existing review. Contact pairs arrival information with a usable form; the olive footer balances a newsletter, compact navigation, and contact details.

Fraunces supplies the expressive serif voice; restrained Avenir carries body text and navigation. Warm ivory, olive, sage, subtle gold, and occasional plum preserve the supplied identity. Hierarchy uses scale, italics, indentation, whitespace, and placement. Proximity groups related actions and information; consistent action styling supports similarity; dividers and the insurance track establish continuity; controlled contrast preserves figure/ground separation. Asymmetric image placements balance dense and quiet sections.

## Motion and botanicals

The supplied 38.6-second MP4 stays unchanged. A still from the clip serves as loading poster and failure fallback. Muted inline autoplay loops with a 44px play/pause control; reduced motion displays the poster, including live preference changes.

Olive and lavender fulfill the user's explicit requests. Four decorated sections alternate the main branch edge; the treatment menu receives extra olive clusters. Main outlines use 10% opacity, companions 8%, extra menu clusters 7% and 6%, and lavender 6.5%, with lighter fills. Artwork remains behind content, non-interactive, and clipped only at decorative edges.

Each section's plants fade together over 1600ms when the section reaches the central 10% of the viewport, then remain visible. Resizing preserves reveals. Reduced motion and missing IntersectionObserver immediately expose content and artwork. Hero and content entrances run once. There are no drawing effects, floating elements, glows, or component shadows.

The user requested an uninterrupted sliding insurer strip without arrows. Two matching 31-logo groups translate linearly; equal widths and trailing gaps make the loop seamless. Hover and focus do not pause it. The duplicate is hidden from assistive technology. The movement is contained locally; reduced motion displays a static grid of all original marks. This explicit request is the reason for the continuous loop.

The subsequent speed/spacing request doubles the strip's speed to approximately 84px per second: 70-second phone, 95-second intermediate, and 120-second desktop cycles. The strip reaches both viewport edges without horizontal padding. The billing introduction retains its reading alignment independently of the strip.

## Responsive behavior and controls

The client-review section now uses the three unique full quotations supplied in the latest screenshots, with their original wording and punctuation. The repeated fourth screenshot supplies no additional review. Previous/next arrows cycle through those three quotations in both directions; the former excerpt mode and excerpt label are removed. The five olive stars are centered across the section and enlarged to 32–48px. A larger italic Fraunces quotation follows the reference's editorial treatment. Three quotes share one CSS grid cell, with inactive quotes visually hidden and excluded from accessibility, so the longest supplied text reserves enough space and arrow use does not shift the next section. The active quote is announced politely; controls retain 44px targets and visible keyboard focus. No author names, review counts, or automatic carousel movement are added.

The new reference section sits immediately before the treatment menu. Its only visible wording is the supplied Mielle Wellness label, exact renewal paragraph, and See Services action. Deep olive-black and ivory follow this specific reference, rather than imposing a dark theme on the whole site. The existing reception, facial, and leaf-shadow photographs match the supplied image details. Three portrait crops rise along an uneven desktop skyline; phones use two columns and place the leaf image below on the right. The copy stays above the images to preserve contrast and reading order.

Image movement follows the user's corrected overlapping sequence, led by the right-hand leaf image, then the middle facial, then the left reception. At successive scroll checkpoints their completion percentages are 50/25/0, 100/50/25, 100/75/50, 100/100/75, and finally 100/100/100. The facial moves at half the leader's rate; reception starts when the leader reaches 50%, then follows at the facial's rate. Each image stops at its final position when it reaches 100%. Movement remains tied to scroll position, with no timer or serial wait for another image to finish. On phones the same photo order is preserved in the two-column composition. Travel is 64px on phones, 120px at intermediate widths, and 160px on desktop. Only transforms change, keeping layout space stable. A passive scroll listener batches updates into animation frames; resizing recalculates progress. Upward scrolling reverses the sequence. Reduced motion displays all images in their final positions and removes the scroll listener. See Services navigates to the existing treatment menu; keyboard focus follows document order.

Phone, intermediate, and wide screens use considered reflows. Home actions stack on phones; booking images and treatment compositions adapt at intermediate widths; complete desktop navigation appears only when it fits. The labeled mobile menu has a 44px target. Opening it makes the main/footer inert; Escape and outside click close it with focus restoration. Desktop resize closes the menu.

Booking, offer, and insurer dialogs retain focus management and Escape. Review arrows cycle through the three supplied full quotations. Contact validates required inputs and prepares an email draft with clipboard success/error feedback. Newsletter requires consent and prepares an email subscription request. Neither form claims to send automatically; submission is completed in the visitor's email app. Outgoing links retain existing destinations. Verification records build, responsive geometry, interactions, contrast, motion, video fallback, and the scroll stack.
