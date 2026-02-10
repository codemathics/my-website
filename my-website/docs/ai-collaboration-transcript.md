# Building My Personal Website With AI: A Process Transcript

*A transcript of prompts and work from building [my personal website](https://github.com/codemathics/my-website) in collaboration with an AI coding assistant. Use this to write about your process, decisions, and what you learned.*

---

## 1. Navbar & Link Hover States

**Goal:** Consistent hover states on nav links (home, about, more, articles) with a 2px white underline that animates in and out.

**Prompts (summary):**
- "I need the hover states on these navbars and every other hyperlink text to stay consistent. Have a 2px white line move from left to right when home is hovered; when the cursor moves out, it animates reversely back out. Same for about, more, and articles individually."
- When it didn’t work: shared DOM path and asked to fix. Then: "Here is a reference design from Figma for how I want the hover state with the underlines — work with this." [Figma link]
- "The nav interaction is great, but the animation was happening from the bottom of the logo on the left down to the end of the nav on the right. Make the animation happen only on the nav items on the right (home / about / more / articles) when each is hovered individually."
- "Add padding-bottom 2px for each nav and let the underline stretch 100% end to end of the length of the text."
- "Add a bit more transition delay when hovering out only from the nav so it doesn’t feel too static but smooth."

**What we did:**  
Moved from a `::after` pseudo-element (blocked by Tailwind) to a real `<span className="nav-underline" />` inside each link and a dedicated `NavLink.css` so the underline is scoped per link. Used `transform: scaleX()` with different `transform-origin` for hover-in (left→right) and hover-out (right→left), plus asymmetric timing (quicker on hover-in, slightly slower + delay on hover-out).

---

## 2. Hero: San Francisco & Dubai Touchpoints + City Modal

**Goal:** Clicking “san francisco” or “dubai” in the hero opens a modal with a collage, using the same kind of reveal as the project section (height animates top-to-bottom, then content animates in).

**Prompts (summary):**
- "Target the san francisco and dubai touchpoints using this Figma reference. I want the same reveal animation we created for the gray div in the project section: the background height increases from top to bottom as a modal, then the contents inside have the same interaction as the project section. When san francisco or dubai is clicked, this modal shows up with a collage of images and visual text like the reference in Figma." [Figma link]

**What we did:**  
Added `CityModal` component: panel height animates from 0 to 100%, then titles, description, and image collage fade in with staggered delays. Content is driven by `sfContent` / `dubaiContent` (titles, copy, image URLs). Modal opens when a city is set in parent state and closes via `onClose()`.

---

## 3. USA Flag Default + Bounce, Underlines Removed

**Goal:** Remove underlines from “san francisco” and “dubai” but keep them clickable. USA flag visible by default with a soft bounce so it reads as interactive; after first hover on “san francisco,” behavior resets to hover-only (like dubai).

**Prompts (summary):**
- "Take out the underline from both of them and keep them clickable. I’d like the san francisco pop-up (USA with her flag) to be up by default and occasionally bounce and stretch softly so people can tell it’s clickable. When it’s hovered, reset so it only shows on hover and without the bounces."
- "The USA flag doesn’t show the interactions by default that make it known it’s interactive — can you check that? And when san francisco is hovered, the default interaction for the USA flag should stop and it should behave exactly like dubai (show on hover). So after the first interaction it resets to normal hover-to-display. When the site refreshes the cycle repeats."

**What we did:**  
Removed underlines from both city spans. Added `flag-bounce` keyframe (subtle translateY + scale) and applied it to the USA flag by default. Introduced `sfFlagInteracted`: once the user hovers “san francisco,” we set it true and switch the USA flag to hover-only (no bounce), matching dubai. On refresh, state resets so the bounce-and-default-visible behavior returns.

---

## 4. City Modal: 2D Drag, “Drag Me” Cursor, ESC, Density, Settling

**Goal:** Make the modal collage feel like a 2D infinite drag plane (like a reference site), with a custom “drag me” cursor, ESC to close, tighter image spacing, and a subtle “settling” effect when drag ends.

**Prompts (summary):**
- "Allow drag in every direction (vertical too). Make the drag-me ball a bit bigger with a more subtle animation and some transition delay. The drag-me cursor should show everywhere in the modal unless I’m about to cancel or click another button. Make the modal exit when I tap ESC. Slightly close the gaps between images. Remove the native hand-drag cursor and use the drag-me cursor over anything draggable. Like the reference site, when dragging stops, add a transition delay so some images stop a bit later."
- Then: "Implement the plan as specified."

**What we did:**  
Extended the collage to a 2D tiled plane (segment width + height, 3×3 grid). Track one `offsetX` and `offsetY`; apply via a single `transform` on the track for real-time drag. Drag-me indicator shows anywhere over the canvas and hides over the close button; `cursor: none` on the canvas. ESC closes via `keydown` with capture. Tightened `baseStep` and layout for denser images. On pointer up, applied momentum (velocity × throw factor) and a short “settling” phase with per-item delay via CSS custom properties.

---

## 5. Modal UX Fixes: Cursor, Lag, ESC, Close Button

**Goal:** Fix drag-me cursor disappearing on click, fix 1–2s drag lag, show native cursor over the cancel button, fix ESC, and make the cursor ball a bit bigger.

**Prompts (summary):**
- "The drag-me ball cursor is malfunctioning — when clicked it vanishes and I don’t see it for a while and it makes it hard to interact with the cancel button. Dragging isn’t fluid; nothing moves with the cursor in real time and it delays a second or two. When I hover the cancel button it doesn’t change to the native cursor. ESC to cancel modal isn’t working. Increase the cursor ball a bit more."

**What we did:**  
Moved movement to a single element (the track) with one `transform` so there’s no transition-induced lag. Stopped hiding the drag-me cursor on pointer down so it stays visible while dragging. Used `elementFromPoint` + close button ref to hide drag-me over the close button so the native cursor shows. Re-attached ESC to a stable `handleClose` with `document.addEventListener('keydown', ..., true)`. Increased drag-me ball size (e.g. to 104×104).

---

## 6. Parallax and Dragging Over Images

**Goal:** Parallax on images while dragging (like the reference site): subtle, during drag, consistent direction; and ensure the canvas is draggable even when the cursor is over images (no accidental image drag).

**Prompts (summary):**
- "Add parallax effects on the images when dragged. Avoid the drag cursor dragging images when it’s on images — it should still be draggable when the cursor is on images. The parallax should be like the reference site: subtle, during drag, and images should follow consistent directions, not randomly scatter."

**What we did:**  
Reintroduced a depth-based parallax factor per item (from z-index), applied as an offset proportional to `--rs-offset-x` / `--rs-offset-y` so movement is consistent and subtle during drag. Ensured images use `pointer-events` and `draggable={false}` / `onDragStart` prevent so that pointer events go to the canvas and the whole plane drags even when the cursor is over an image.

---

## 7. Staging Branch and Cancel Button Not Closing Modal

**Goal:** Have a separate staging environment (no push to main yet) and fix the modal close/cancel button so it actually closes the modal.

**Prompts (summary):**
- "Let’s not create any push yet to main; I just want a staging environment separate from main where all my tests and updates will be updated. Also fix the cancel button in the modal — when clicked it still doesn’t remove the modal."

**What we did:**  
Created a `staging` branch from current state. For the close button: moved it outside the panel (direct child of overlay) so it’s not clipped or out-stacked by the full-height content/carousel. Gave it `position: fixed` and high `z-index` (e.g. 9999) so it’s always on top. Wired close to `onPointerDown` with `stopPropagation` and `preventDefault` so it fires even if something else captures the click. After that, the modal closes reliably on button click.

---

## 8. Staging Push and Co-Author Metadata

**Prompts (summary):**
- "Why does it have co-authored by Cursor and all — where will this be pushed to?"
- "Before we do that, I need a full refactor: proper comments, clean up unused code, everything in small letters for comments (new and old). Full check and update without changing functionality. Also remove anything that has co-authored by Cursor or any other AI-default stuff."
- "I didn’t see this option in the general tab. Go to Cursor Settings > General and uncheck the co-authored-by option."

**What we did:**  
Clarified that pushes go to `origin/staging` (same repo, different branch). Did a full pass: comments lowercase, removed dead code and AI-sounding phrasing, updated metadata (e.g. page title/description), cleaned tsconfig and config comments. Explained that Cursor injects co-authored-by automatically and there’s no General-tab toggle; suggested amending the commit from an external terminal to strip the trailer and force-push staging if desired.

---

## 9. Vercel Deployment Errors After Merge

**Goal:** Fix Vercel build failures after merging the PR to main.

**Prompts (summary):**
- "I merged PR to main but Vercel is having deployment errors — can we look into these and fix?"

**What we did:**  
Addressed the failing rule: replaced `<a href="/">` with Next.js `<Link href="/">` in the navbar and used `next/image` for the logo. Fixed React hook warnings: added `baseImages` to the collage `useLayoutEffect` deps and fixed ref cleanup by copying refs into local variables in the cleanup. Turned off the `@next/next/no-img-element` rule in ESLint for the project (external Cloudinary URLs; next/image would need a custom loader). Committed and pushed to staging so the next merge to main would build on Vercel.

---

## Themes for Your Article

- **Design-led:** You drove the behaviour with Figma and reference sites (e.g. underline direction, modal reveal, parallax, settling).
- **Iterative:** Small, clear prompts (underline per link, padding, delay on hover-out, flag bounce, then hover-only after first interaction) got the interaction to match your intent.
- **Debugging with AI:** When something failed (nav underline, close button, drag lag, ESC, cursor over close button), you described the symptom; the assistant proposed structural fixes (DOM order, fixed positioning, single transform, capture phase, ref cleanup).
- **Process and tooling:** You introduced staging, refactored for maintainability and voice (comments, no AI metadata), and fixed CI (ESLint, Next.js rules) so the site could ship.

You can copy sections from this transcript into your article and adapt the tone (first person, past tense, or “how I worked with AI”) as you like.
