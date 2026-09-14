# Gallery fullscreen and keyboard behavior

## Design

News and Fotoreports share the same gallery. Fullscreen gives the image the remaining viewport height, with a compact footer instead of a vertically clipped thumbnail grid.

- Main image: the stage follows the loaded image's intrinsic aspect ratio and shrinks when viewport height is constrained. Anchor the photo/footer group to the viewport bottom so the filmstrip never moves when image proportions change; contain images without cropping and bottom-align any remaining letterboxing so the footer follows the photo directly. Previous/next controls stay alongside the photo and Close remains at the top right.
- Metadata: caption on the left, current/total on the right. Long captions truncate visually while remaining available to assistive technology and through a tooltip.
- Filmstrip: one horizontally scrollable row of approximately 96 × 64 px previews on desktop and 72 × 48 px on mobile, separated by 8 px. Small numbers identify previews. A gold outline marks the selection; keyboard focus is also visible.
- Selecting an image keeps its preview visible by scrolling only the filmstrip. Entering fullscreen also reveals the current selection. No vertical thumbnail scrollbar.
- Reserve thumbnail height plus padding and a classic Windows scrollbar; no thumbnail border or number may extend below the strip's client area.
- Arrow, Home and Ende hints are real navigation buttons with descriptive accessible names and the same behavior as their keyboard shortcuts.
- The inline page keeps its existing thumbnail grid. A single-image gallery still supports fullscreen but needs no navigation hint.

## Keyboard ownership

The gallery frame owns Left/Right/Home/End handling, including events from the fullscreen/Close button. Inline keyboard handling remains scoped to focused elements inside that frame. Editable fields and modified shortcuts are exempt. Escape remains owned by the shared fullscreen component/browser.

The earlier handler was on the inner gallery element. Entering fullscreen focused the shared frame's Close button, a sibling outside that handler. This was reproduced in Microsoft Edge: clicking Fullscreen and pressing Right left the counter at 1 / 91. Tests must use real keyboard input after clicking Fullscreen without first programmatically focusing the inner gallery.

## Acceptance checks

- Edge: open fullscreen and immediately press Right/Left, Home/End; repeat with Close, image, and thumbnail focus.
- Verify both `/fotos/annecy2026` (91 images) and `/news/17-01` (2 images).
- Verify native fullscreen and the in-page fallback, including closing and reopening.
- Verify the selected preview remains visible at the first and last images without moving the page.
- Verify desktop and 390 × 844 mobile layouts: contained main image, one-row previews, usable controls, no viewport overflow.

## Repeatable Edge regression check

With the local server on port 4173, run these commands from the site directory. The CLI uses the installed Microsoft Edge browser; no project dependency is needed.

```powershell
npx --yes --package @playwright/cli playwright-cli -s=galleryedge open http://127.0.0.1:4173/fotos/annecy2026 --browser msedge
npx --yes --package @playwright/cli playwright-cli -s=galleryedge run-code --filename tests/gallery-browser.js
```

The script exercises real keyboard input after fullscreen entry, both routes, inline focus boundaries, first/last preview visibility, native closing, and fallback Escape. It checks geometry in portrait and landscape and saves screenshots under `output/playwright/`. Mobile fallback is simulated by disabling the frame's native fullscreen method. Native Escape is browser-owned and is not asserted with synthetic headless key events.
