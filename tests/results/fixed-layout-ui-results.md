# Fixed-layout UI test results

**Run:** 2026-11-08  
**Fixture:** [fixed_layout_epub_dummy.epub](../resources/fixed_layout_epub_dummy.epub)  
**Environment:** Windows, VS Code integrated browser (Electron 43.8.3, Chromium 150.0.7871.250), device pixel ratio 1.5. The reader was opened as a local file and the EPUB was uploaded using the file input.

The fixture declares `rendition:layout=pre-paginated` and `rendition:spread=none`. Its three XHTML spine pages each declare a 1200 × 1600 viewport and share an external CSS stylesheet.

## Summary

**9 passed, 1 failed.** The failure is a responsive sidebar overlap at 800 × 600 CSS pixels. No source-code fixes were made during this test run.

| ID | Test case and steps | Expected | Actual | Result | Evidence |
|---|---|---|---|---|---|
| 1 | Reload the reader without a book; upload the fixture. | The toggle is hidden before loading, then visible immediately to the right of Open EPUB; the book opens in reflowable mode at 1 / 3. | Toggle initially hidden; after loading it reads “Reflowable Layout”, is not pressed, and page 1 appears. | Pass | [Reflowable page 1](fixed-layout-screenshots/01-reflowable.png) |
| 2 | Activate the layout toggle with Enter. | Page 1 switches to fixed layout; the toggle is pressed and displays “Fixed Layout”. | Fixed iframe displayed with a 1200 × 1600 internal viewport; page bounds fit the reader container. | Pass | [Fixed page 1](fixed-layout-screenshots/02-fixed-page-1.png) |
| 3 | Inspect the fixed page's heading, page, and footer styles; navigate to page 2 and inspect the metadata block. | The publication's external CSS and authored positioning are applied. | Heading font size was 58px, page width 1200px, footer bottom 55px; page 2's metadata block had the expected background and a visible border. | Pass | [Page 1](fixed-layout-screenshots/02-fixed-page-1.png), [page 2](fixed-layout-screenshots/03-fixed-page-2.png) |
| 4 | Use Next to visit pages 2 and 3. | Correct headings, page counters, and active TOC items appear; Next is disabled on page 3. | Page 2 and page 3 displayed their expected headings and counters; page 2 TOC was active; both Next controls were disabled at the end. | Pass | [Page 2](fixed-layout-screenshots/03-fixed-page-2.png), [page 3](fixed-layout-screenshots/04-fixed-page-3.png) |
| 5 | Focus the fixed page and press Left Arrow, then switch to reflowable. | Navigate from page 3 to page 2 and keep that page when switching modes. | Page 2 remained selected and the toggle changed to “Reflowable Layout” with `aria-pressed=false`. | Pass | [Reflowable page 2](fixed-layout-screenshots/05-reflowable-page-2.png) |
| 6 | Switch back to fixed mode, then resize the browser viewport to 800 × 600. | The fixed page scales down without changing its authored dimensions. | Its displayed height decreased after resizing; the internal page remains 1200 × 1600. | Pass | [Resized page with sidebar open](fixed-layout-screenshots/06-fixed-resized.png) |
| 7 | At 800 × 600, inspect the reader with the sidebar open. | The page and toolbar remain visible and usable. | The sidebar covers the Open EPUB button, part of the layout toggle, and the left edge of the fixed page. The sidebar spans x=0–280; the page begins at x≈255 and the toggle begins at x≈231. | **Fail** | [Overlap](fixed-layout-screenshots/06-fixed-resized.png) |
| 8 | At 800 × 600, focus the sidebar toggle and press Enter to collapse the sidebar. | Fixed page is unobstructed and fits its container. | Sidebar collapsed and the fixed page fit within the container. | Pass | [Sidebar collapsed](fixed-layout-screenshots/07-fixed-resized-sidebar-collapsed.png) |
| 9 | Navigate via a TOC item, the top and bottom Next/Previous controls, and click the layout toggle. | Controls navigate to the correct pages, boundary buttons disable, and both layout states can be selected. | TOC navigated to page 1; both sets of navigation buttons advanced and returned correctly; Previous buttons disabled at page 1; pointer clicks switched layouts. | Pass | [Page 1](fixed-layout-screenshots/02-fixed-page-1.png), [page 3](fixed-layout-screenshots/04-fixed-page-3.png) |
| 10 | With fixed mode enabled, clear the file input and upload the fixture again. | The reloaded book starts on page 1 in the default reflowable mode. | Counter reset to 1 / 3, toggle read “Reflowable Layout” with `aria-pressed=false`, and no fixed iframe remained. | Pass | [Reflowable page 1](fixed-layout-screenshots/01-reflowable.png) shows the equivalent initial state |

## Notes

- The resize check confirms scaling, not unobstructed visibility; the sidebar overlap is recorded separately as a failure.
- The sidebar can be collapsed using keyboard focus and Enter; at the tested narrow width its open overlay also covers the sidebar toggle, making pointer access to that control unavailable.
- A first automated pointer click at the larger viewport timed out because the browser automation reported toolbar interception. Keyboard activation succeeded, and pointer clicks were later verified at 800 × 600. This initial automation issue is not counted as an application failure.
- This fixture has no embedded images, SVG pages, links inside page content, or mixed layout overrides, so those behaviors were not tested in this run.
- Tests were executed interactively with the integrated browser's Playwright controls; the repository's standalone Playwright suite was not run.
