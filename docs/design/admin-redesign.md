# Admin Portal Redesign: audit, evaluation and plan

**Store:** Honey by Abdul Sami Enterprises (honey only, Pakistan, PKR, cash on delivery)
**Scope:** `src/app/admin/**` and `src/features/admin/**`, presentation layer only
**Author:** Lead Product Designer · **Date:** 2026-10-31 · **Status:** Phase 1 (plan). Implementation is owned by the engineer.

---

## 0. Verdict

**Overall score: 5.5 / 10.** The engineering underneath is solid. The admin uses Server Actions with redirects, works without JavaScript, has atomic order transitions and careful destructive-action guards. The presentation and mobile experience are well below that standard.

| Dimension | Score | One-line reason |
|---|---|---|
| Functional correctness and safety | 7.5 | Atomic status SQL, confirm checkboxes, media-usage warnings, lockout. |
| Information architecture | 4 | 11 flat nav items, no current-page state, dashboard shows four numbers and a paragraph. |
| Mobile (the owner's main device) | 3.5 | 7-column tables that scroll sideways, account block pushed above the content, small inline links. |
| Forms | 5 | Labels are good. No required or optional logic, errors at page level only, typed input lost on error, image picking by alt text. |
| Visual craft and consistency | 4 | 29 hard-coded hex values, 9 ad-hoc font sizes, 35 inline styles, Inter, and every panel has the same weight. |
| Accessibility | 6 | Skip link, labels, live regions and focus-visible are present. Input borders fail 3:1, the focus ring fails 3:1 on the canvas, there is no `aria-current`, and targets are small. |

I verified this by reading every admin page, editor, client component and `admin.css`. I also checked contrast ratios with the WCAG relative-luminance formula. The dev server answered `200` on `/admin/login`, but I did not sign in or take screenshots. The mobile findings come from the CSS and markup and should be confirmed on a real phone in Phase 7.

---

## 1. Audit: mistakes and problems

Severity: **P0** blocks a task, creates a real risk of missed work or data loss, or has legal or ethical exposure. **P1** is significant friction on a core flow. **P2** is noticeable friction or inconsistency. **P3** is polish.

### 1.1 Findings ranked

| # | Sev | Finding | Where | Why it matters |
|---|---|---|---|---|
| A1 | **P0** | **Older pending orders are hidden by default.** `/admin/orders` defaults to `status=pending` **and** `date=today`. A pending order placed yesterday at 23:50 does not appear until the owner changes the date filter. The dashboard tile counts *all* pending orders but links to `?status=pending`, which shows only *today's*. The two numbers disagree. | `src/features/orders/date-filter.ts:21` (`params.date \|\| "today"`), `src/app/admin/(protected)/page.tsx:24` | Missed COD orders mean lost revenue and angry customers. This is the most important fix and costs almost nothing. Optional behaviour change O1. |
| A2 | **P0** | **Product rating and review count are free-text admin inputs**, and the PDP displays them. The owner can type "4.9 ★ (312 reviews)" for a product with no reviews. | `src/features/admin/product-editor.tsx:23`, used in `src/app/(site)/shop/[slug]/page.tsx` | This is fabricated social proof. The US FTC Consumer Reviews rule (2024) bans fake review counts, and Pakistani consumer-protection law also prohibits misleading claims. It also damages trust if a customer notices. **Needs a user decision** (see Open Questions Q1). |
| A3 | **P1** | **Validation errors lose everything the owner typed.** Every action redirects to `?error=…` and the editors use `defaultValue` from the database. On *Add product*, about 20 fields reset to empty after one mistake, such as a duplicate slug. | `src/features/admin/actions.ts:22`, all `*-editor.tsx` | On a phone this is the most frustrating failure in the admin. Fix later with `useActionState` (O10). In this redesign, reduce the chance with clear hints, `pattern` and `title` attributes, and slug help. |
| A4 | **P1** | **Tables on mobile scroll sideways.** Orders has 7 columns and Blog has 8 inside `overflow-x:auto`. Nothing hints that more columns exist, and the Copy and View actions sit off-screen on the far right. | `admin.css:33`, `orders/page.tsx:66`, `blog/page.tsx:26` | Orders is the task the owner does on a phone. They need a card layout below 768px. |
| A5 | **P1** | **No current-page indication in the nav.** No `aria-current`, no active style. On mobile the 11-item nav is a horizontal scroller with no scroll hint, and the email, sign-out and view-store block takes about 120px above every page. | `(protected)/layout.tsx:12-23`, `admin.css:85` | Users can't tell where they are (Nielsen #1). On a phone the content starts about 260px down the screen. |
| A6 | **P1** | **11 flat nav items, ordered by build history rather than by job.** Daily work (Orders, Messages) sits next to rare setup (Categories, Settings) with equal weight. | `(protected)/layout.tsx:12` | Hick's law and recognition. Grouping is in §3.4. |
| A7 | **P1** | **The image picker is a `<select>` of alt-text strings.** The owner has to recognise photos by their descriptions. The product editor shows 5 to 20 of these dropdowns ("Image 1 (primary)" … "Image 20"). | `src/features/admin/image-select.tsx:67`, `product-editor.tsx:28` | This forces recall instead of recognition (Nielsen #6). Wrong images get picked, and it is very slow on a phone. |
| A8 | **P1** | **The order status change takes three controls and is ambiguous.** A select defaults to the first next status, a "Confirm if cancelling" checkbox is always visible even when the choice is *Confirmed*, and a generic "Update status" button sits below. | `orders/[id]/page.tsx:67-73` | This is the most frequent action in the admin. It should be one tap, "Mark as confirmed", with cancellation as a separate guarded destructive action (O3). The `changeOrderStatus` action and its fields stay the same. |
| A9 | **P1** | **Site Content has one form per slot, about 15 Save buttons in total.** Changing two slots and saving one reloads the page and **silently discards** the other change. | `content/page.tsx:15-18` | Silent data loss. Mitigate with a dirty-state marker per slot plus a `beforeunload` guard (O8). The action stays the same. |
| A10 | **P1** | **No error boundary or not-found page for the admin.** There is no `error.tsx` anywhere in `src/app`. If the database fails, the owner sees Next's generic "Application error". | `src/app/admin/**` | The owner can't recover and there is no "Try again". It also looks broken. |
| A11 | **P1** | **Input and control borders fail WCAG 1.4.11.** Input border `#cdbfac` on white is **1.80:1**, the secondary button border `#cdbba5` on the canvas is **1.72:1**, and the order-tab border is **1.53:1** (3:1 is required). | `admin.css:24,27,61,69` | Low-vision users can't find the fields. In bright sunlight on a phone, nobody can. |
| A12 | **P1** | **The focus ring fails 3:1 on the page canvas.** `#c9842d` on `#f8f5ef` is **2.83:1**. It passes only on panels (3.03) and the sidebar (4.85). | `admin.css:59` | Keyboard users lose their place (WCAG 1.4.11 / 2.4.7). |
| A13 | **P1** | **The order list has no tappable phone and no WhatsApp link**, although calling or WhatsApp-ing to confirm COD orders is the core Pakistani workflow. The phone is a link only on the detail page. | `orders/page.tsx:69` | The owner copies numbers by hand on a phone. Optional O4. |
| A14 | **P2** | **Destructive buttons look like secondary buttons.** Delete product, category, post, testimonial, banner, message and image all use `.admin-button.secondary`. The `<details>` summary is unstyled browser text. | all editors, `media/page.tsx:20`, `messages/[id]/page.tsx:48-56` | Nothing tells the eye "this is dangerous". The checkbox-confirm logic is good; only the styling is wrong. |
| A15 | **P2** | **Success feedback is generic and sticky.** "Changes saved." appears for every save, including order status ("Changes saved." after marking an order shipped). The `?saved=1` stays in the URL, so a refresh or Back shows it again. A `role=status` that is present on first render is often **not announced** after a soft navigation. | `src/features/admin/ui.tsx:9-13` | The feedback is weak and unreliable for screen readers. Fixes: specific messages where the page already knows the context, and focus moved to the notice with the URL cleaned up (O6). |
| A16 | **P2** | **No pending state on submit buttons.** Save, Update status, Delete and Upload stay clickable while the action runs, so a slow 3G connection invites double taps. | all `<form action={serverAction}>` | The server guards most cases (the status change is idempotent), but the owner gets no feedback for 1 to 5 seconds. Add a `useFormStatus` SubmitButton (O7). |
| A17 | **P2** | **Dashboard usefulness is low.** It has four numbers, one of them inconsistent (A1), and a paragraph of generic advice. "Today's order value" is not a link while the other three tiles are. It doesn't show *which* orders are waiting or *which* products are low. Low stock counts active products only, but its link `?stock=low` lists every status, so the count and the list differ. | `(protected)/page.tsx` | The dashboard should answer "what needs me right now?" (§3.6). |
| A18 | **P2** | **Required and optional fields are unmarked.** Most fields are required, but only two say "(optional)". Banner subtitle, button label and link are optional without saying so. Display order fields have no explanation on Products. | all editors | Users guess and errors follow. Mark the optional fields (the GOV.UK pattern) because they are the minority. |
| A19 | **P2** | **Long editors are flat walls of fields.** The product form is about 25 controls in `admin-columns` pairs, with no sections, and the Save button is at the very bottom. | `product-editor.tsx:17-29` | Hard to scan, and on a phone Save is about 4 screens down. Use sectioned fieldsets and a sticky save bar. |
| A20 | **P2** | **Empty states are bare grey sentences under empty table headers.** There is no difference between "no data yet" and "no results for these filters", and no action. | every list page | Missed guidance on first use, and a "clear filters" dead end. |
| A21 | **P2** | **Loading states are the text "Loading…".** No skeleton, no `role="status"`, and the protected layout fallback replaces the whole shell. | `(protected)/loading.tsx`, `(protected)/layout.tsx:30` | The layout jumps (CLS) and the app feels slow. |
| A22 | **P2** | **The product visibility toggle autosaves while everything else needs Save.** The editor has the *same* checkbox but needs Save. The list shows "Saving…" and then nothing on success. | `product-visibility.tsx`, `product-editor.tsx:20` | Two mental models for one setting. Keep the autosave, but make it look like a switch and confirm "Saved". |
| A23 | **P2** | **Visual system drift.** 29 unique hex values, 9 font sizes (10 to 30px) and 35 inline `style={{}}` (mostly `marginTop: 16`). The storefront tokens in `globals.css` are not used. | `admin.css`, 22 files | Inconsistency, and every future change costs more. |
| A24 | **P2** | **Typography.** Everything is Inter, set by `--font-sans`, with a single weight jump. Numbers aren't tabular in tables, so prices and stock don't line up. The eyebrow text "STORE MANAGEMENT" repeats on every page and is typed in capitals in the source. | `admin.css:1,15`, `ui.tsx:6` | The admin looks generic, numbers are hard to compare, and screen readers may spell out the capitals. |
| A25 | **P2** | **Raw `?error=` text is rendered from the URL.** React escapes it, so it isn't XSS, but anyone can craft `/admin/products?error=Your session expired, call 03xx…` and the admin shows it as a system message. | `ui.tsx:10`, every page using `AdminNotice` | Content spoofing aimed at a non-technical owner. Engineering follow-up: map error codes to messages (O11). |
| A26 | **P2** | **Touch targets under 44px.** The Copy button is 36px, table actions are inline text links of about 20px ("Edit", "Delete", "View details"), sign-out is a 12px unstyled button, and the pager is 42px. | `admin.css:12,74`, list pages | They pass WCAG 2.5.8 (24px) in most places, but they are too small for a phone user working one-handed. |
| A27 | **P2** | **Performance: the media list is duplicated into every ImageSelect.** On Content, every slot (about 15) and every honey variety gets the *full* media array serialised to the client. Product new/edit sends it 5 to 20 times. All media queries are unbounded. | `content/page.tsx:13-18`, `product-editor.tsx:28` | The RSC payload grows as O(slots × media) and slows the phone. Pass the list once (picker context) and bound or paginate it later. |
| A28 | **P3** | Order status tabs are ordered Pending, Confirmed, Shipped, **Cancelled**, Delivered instead of following the lifecycle. | `orders/page.tsx:18` | A small mismatch with the user's mental model. |
| A29 | **P3** | Brand naming is inconsistent: "Admin \| Abdul Sami Honey", the "AS" monogram, "STORE ADMIN" and the blog author default "Abdul Sami Honey", against the brand "Honey by Abdul Sami". | `admin/layout.tsx:4`, `(protected)/layout.tsx:21`, `blog-editor.tsx:17` | It looks unfinished. |
| A30 | **P3** | Landmarks: brand, nav and account are all wrapped in `<aside>` (complementary), and tables have no caption or accessible name. On Content, slot titles are `<strong>`, not headings. | `(protected)/layout.tsx:20`, `content/page.tsx:17` | Screen-reader navigation by headings and landmarks is weaker. |
| A31 | **P3** | The Copy button stays "Copied" for good, so a second copy gives no fresh feedback. The "View store ↗" arrow is read aloud. | `copy-shipping-button.tsx`, `(protected)/layout.tsx:23` | Polish. |
| A32 | **P3** | The pager says only "Page N", with no "Showing 21–40" and no `<nav>` landmark. | `ui.tsx:15-21` | Minor orientation problem. |
| A33 | **P3** | The print sheet is a reflowed screen page. It does not put the COD amount to collect or the "From" store address first. | `orders/[id]/page.tsx:44`, `admin.css:86-97` | The courier slip should lead with *To*, *Phone*, and *Collect Rs X*. |
| A34 | **P3** | Inter and Parisienne are **preloaded** by the root layout on admin routes even though the admin never uses Parisienne. | `src/app/layout.tsx` | Wasted bytes on mobile data. This is a low-priority restructure (move fonts into route-group layouts); don't do it in this project. |

### 1.2 Accessibility snapshot (current)

| Check | Status |
|---|---|
| Skip link to `#main` | Pass. The root layout provides it, and the admin `<main id="main">` exists on both shell and login. |
| `lang`, page `<title>` | Partial. The language is set, but every admin page shares one title ("Admin \| Abdul Sami Honey"), so browser tabs and history are not distinguishable. |
| Labels | Pass. Inputs are wrapped in `<label>` and filters use `aria-label`. |
| Live regions | Partial. Client components use `role=status` and `role=alert` well. Server notices may not announce (A15). |
| Focus visible | Fail on the canvas (A12). |
| Non-text contrast | Fail on inputs and borders (A11). |
| Text contrast | Pass. Muted text is 4.89:1 on the canvas and 5.23:1 on panels, and button text is 6.18:1. |
| Current page | Fail (A5). |
| Targets | Pass at 24px, short of the recommended 44px (A26). |
| Color-only meaning | Pass. Statuses are text. |
| Reduced motion | N/A because there is no motion yet. The new motion must respect it. |

---

## 2. Evaluation: what is good and must be kept

Keep these. The redesign builds on them.

1. **Server Actions with POST, redirect and GET** for every mutation. They work without JavaScript, survive flaky 3G, and keep the URL as the state. Do not convert them to client fetches.
2. **Atomic order transitions** (`changeOrderStatus` in one SQL statement, with a guard on the previous status, a restock and an audit event) and a **forward-only lifecycle** (`nextStatuses`). The UI should show only valid next steps, which it already does.
3. **In-page confirmations through `<details>`, a required checkbox and a submit button.** They need no JavaScript, are accessible, and are not modal. Keep the mechanism and restyle it (§3.5.11).
4. **Media usage before delete** ("Used in: Products: …") with a stronger warning when the image is in use. This is excellent and rarely done.
5. **Plain-language help text** written for this owner: "Customers must tap Send in WhatsApp", "The publication date… does not schedule a post", the retention-policy notice on Messages, and "Dates use Pakistan time (PKT)".
6. **PKT everywhere.** Dates are formatted and filtered in Pakistan time, independently of the server.
7. **URL-driven filters and tabs** (`returnTo` preserves the list state when going back from order detail, safely limited to local query strings).
8. **Upload inline without losing the form** (`ImageSelect` uploads on its own and blocks submit while uploading), and the uploaded image is shared across all selects through a window event.
9. **Copy shipping details** to the clipboard, with error handling and an accessible status.
10. **Print shipping details**, gated to orders that can actually be printed.
11. **Messages marked read after mount, not on prefetch.** This is correct and subtle.
12. **Lockout messaging on login**, and the order-number search that accepts "AS-1001", "#1001" or "1001".
13. **`noindex`** on the admin, `instant = false`, and request-time data for sessions.
14. **The archive-or-delete distinction** with "Archive instead if you may need it later" guidance.

---

## 3. Redesign plan

### 3.1 Concept: "The Hive Ledger"

The admin is the **back room of the apiary**. It is a calm, warm, beeswax-paper ledger where the work gets done, framed by a dark comb-brown sidebar that holds a faint honeycomb. The storefront shows the honey; the admin shows the *record keeping*. That gives editorial Fraunces headings, a precise IBM Plex Sans for everything you read and tap, tabular numbers that line up like a ledger column, and order IDs set in Plex Mono like a printed label. **The memorable element is the "filling cell".** Each order status is marked by a small hexagon that fills as the order moves forward: empty when *Pending*, one third full when *Confirmed*, two thirds when *Shipped*, full honey when *Delivered*, and struck through when *Cancelled*. The owner reads progress at a glance, the brand appears in the place they look most, and colour is never the only signal because the label, the fill level and the glyph shape all carry the meaning. Honey yellow is used sparingly. It marks *where you are* (active nav), *what to do* (the primary button) and *what's waiting* (pending), so it always means "attention" and never decoration.

**Experience principles**

1. **Today's work first.** Orders and messages are one tap away on a phone, and older pending work is never hidden.
2. **One obvious next step.** Each screen has one primary action, written as a verb ("Mark as shipped", not "Update").
3. **Ledger clarity.** Numbers are tabular and right-aligned, IDs are in mono, and content is dense without being cramped.
4. **Safe by design.** Destructive actions are separated, explained and confirmed. Reversible alternatives come first.
5. **Warm, not decorative.** Brand texture lives in the chrome (sidebar, login, empty states), never behind data.

### 3.2 Design tokens

Scope **every** token under `.admin-app` so the storefront is unaffected. The prefix is `--ad-`. Class names keep the existing `admin-` prefix.

#### 3.2.1 Colour (light theme)

| Token | Value | Use | Contrast (WCAG 2.x) |
|---|---|---|---|
| `--ad-canvas` | `#f7f2e8` | page background ("wax paper") | n/a |
| `--ad-surface` | `#fffcf6` | panels, cards, inputs | n/a |
| `--ad-surface-sunken` | `#f1e9da` | table header row, image tiles, disabled fields | n/a |
| `--ad-line` | `#e4d8c4` | decorative dividers only, never a control boundary | 1.37 (decorative) |
| `--ad-line-strong` | `#8c7760` | input, select and checkbox borders, secondary button border | **4.17** on surface, **3.82** on canvas |
| `--ad-ink` | `#24180b` | primary text, headings | **16.94** surface / **15.55** canvas |
| `--ad-ink-2` | `#4f3f2e` | secondary text, table cells | **9.85** / **9.04** |
| `--ad-muted` | `#6b5a46` | help text, meta, labels in caps | **6.46** surface / **5.93** canvas / **5.48** sunken |
| `--ad-link` | `#8a5a00` | inline links (same as storefront `--color-primary-ink`) | **5.79** surface / **5.31** canvas |
| `--ad-honey` | `#ffb800` | primary button fill, active nav bar, pending emphasis | ink on honey **10.00** |
| `--ad-honey-hover` | `#f2a900` | primary hover | ink 8.6 |
| `--ad-honey-press` | `#e39e00` | primary active | ink ≥ 7.5 |
| `--ad-honey-edge` | `#a87700` | 1px border on honey buttons | **3.55** on canvas |
| `--ad-honey-soft` | `#fff1cc` | selected rows, highlight, nav badge on light | ink **15.45** |
| `--ad-comb` | `#22170c` | sidebar, mobile bars, primary dark surfaces | n/a |
| `--ad-comb-2` | `#36261a` | sidebar hover and active background | n/a |
| `--ad-on-comb` | `#f6ead6` | sidebar text | **14.77** on comb / **12.19** on comb-2 |
| `--ad-on-comb-muted` | `#c9b38f` | sidebar group labels, email | **8.64** on comb |
| `--ad-focus` | `#24180b` | focus ring on light surfaces | **15.55** on canvas |
| `--ad-focus-on-comb` | `#ffb800` | focus ring on the sidebar and bars | **10.12** on comb |
| `--ad-danger` | `#b42318` | danger button fill, danger text | white on it **6.57**; on surface **6.42** |
| `--ad-danger-hover` | `#931c13` | danger hover | white ≥ 8.5 |
| `--ad-danger-soft` | `#fdecea` | error notice background | `#8f1f14` text **7.73** |
| `--ad-danger-ink` | `#8f1f14` | error notice text | 7.73 |
| `--ad-success-soft` | `#e8f3e5` | success notice background | `#245c29` text **6.97** |
| `--ad-success-ink` | `#245c29` | success text | 6.97 |

**Order status pills** (text uses the fg colour, the glyph uses `currentColor`):

| Status | bg | fg (text and glyph) | Ratio | Glyph |
|---|---|---|---|---|
| Pending | `#fff0c2` | `#6a4300` | **7.66** | empty hexagon (outline) |
| Confirmed | `#e2f1ee` | `#135e55` | **6.54** | hexagon one-third filled (bottom) |
| Shipped | `#e9ecf8` | `#33408f` | **7.85** | two-thirds filled |
| Delivered | `#e6f2e3` | `#2b5e27` | **6.65** | full |
| Cancelled | `#f5e6e2` | `#7d2e22` | **7.57** | outline plus a diagonal slash |

**Other status pills** reuse these recipes:

- Product: *Active* uses the delivered recipe. *Inactive* uses a neutral recipe (`#efe7dc` / `#5e4b39`, 6.74). *Archived* uses neutral with a dashed border.
- Message: *Unread* uses the pending recipe plus bold sender text. *Read* uses neutral.
- Blog: *Published* uses delivered and *Draft* uses neutral.
- Testimonial: *Visible* uses delivered and *Hidden* uses neutral.
- Banner: *Live* uses delivered, *Scheduled* uses shipped, *Ended* uses neutral and *Off* uses neutral. The banner status is **derived** from `isActive`, `startsAt`, `endsAt` and now. That is presentation only, but genuinely useful.

**Dark theme:** not in v1 (see Q4). Every colour goes through tokens, so a later `.admin-app[data-theme="dark"]` block can redefine them.

#### 3.2.2 Typography

Load fonts with `next/font/google` **in `src/app/admin/layout.tsx`** and apply the variables to the `.admin-app` div. Check the API against `node_modules/next/dist/docs/` first, as AGENTS.md requires.

| Role | Family | Load | Notes |
|---|---|---|---|
| Display (h1, h2, stat labels on the login screen, empty-state titles) | **Fraunces**, already declared in the root layout as `--font-fraunces` with `SOFT` and `opsz` axes, `preload:false` | reuse it, **no new download** | `font-variation-settings: "SOFT" 50; font-optical-sizing: auto;` Use weight 600 for h1 and 560 for h2. Do not use `WONK`, which is not loaded. |
| UI and body (everything else) | **IBM Plex Sans**, variable (`wght`, `wdth`) | `IBM_Plex_Sans({ subsets:["latin"], axes:["wdth"], variable:"--font-admin-ui", display:"swap" })` | Very legible at 13–16px, true tabular figures, a slightly mechanical "ledger" voice. Use 400, 500 and 600 only. |
| Mono (order numbers, slugs, phone numbers in tables) | **IBM Plex Mono** 500 | `IBM_Plex_Mono({ subsets:["latin"], weight:"500", variable:"--font-admin-mono", display:"swap", preload:false })` | One file. Used only for identifiers. |

```css
--ad-font-display: var(--font-fraunces), "Iowan Old Style", Georgia, serif;
--ad-font-ui: var(--font-admin-ui), "Segoe UI", system-ui, sans-serif;
--ad-font-mono: var(--font-admin-mono), ui-monospace, Menlo, Consolas, monospace;
```

**Type scale** (rem assumes a 16px root. Inputs stay at 16px or more so iOS does not zoom.)

| Token | Size / line-height | Family / weight | Use |
|---|---|---|---|
| `--ad-text-2xs` | 12px / 16px, tracking .08em, uppercase via CSS | UI 600 | group labels, table headers, eyebrow |
| `--ad-text-xs` | 13px / 18px | UI 400–500 | meta, help text, pill labels |
| `--ad-text-sm` | 14px / 20px | UI 400–500 | table secondary lines, notices |
| `--ad-text-md` | 15px / 22px | UI 400–500 | table body, nav items, buttons |
| `--ad-text-base` | 16px / 24px | UI 400 | body copy, inputs, textareas |
| `--ad-text-lg` | 19px / 26px | Display 560 | panel titles (h2) |
| `--ad-text-xl` | 24px / 30px | Display 600 | h1 below 768px |
| `--ad-text-2xl` | 32px / 38px, tracking −0.01em | Display 600 | h1 at 768px and above |
| `--ad-text-stat` | 32px / 36px, tracking −0.01em | UI 600 tabular | stat card numbers |

Rules:

- Add `font-variant-numeric: tabular-nums lining-nums` to `.admin-num`, every price, quantity and count cell, and stat numbers.
- Right-align numeric table columns.
- Use `text-wrap: balance` on h1 and h2 and `text-wrap: pretty` on help paragraphs.
- Body measure is at most 68ch for help text.

#### 3.2.3 Spacing, radii, elevation, layout

```css
/* 4px base */
--ad-space-1: 4px;  --ad-space-2: 8px;  --ad-space-3: 12px; --ad-space-4: 16px;
--ad-space-5: 20px; --ad-space-6: 24px; --ad-space-8: 32px; --ad-space-10: 40px;
--ad-space-12: 48px; --ad-space-16: 64px;

--ad-radius-sm: 6px;    /* inputs, buttons, pills-in-tables */
--ad-radius-md: 10px;   /* panels, cards */
--ad-radius-lg: 14px;   /* login card, More sheet, dialogs */
--ad-radius-pill: 999px;
/* Nested radius rule: inner = outer − padding (e.g. thumbnail in a 10px card with 4px inset = 6px). */

--ad-shadow-0: none;                                         /* panels: border only, no shadow */
--ad-shadow-1: 0 1px 2px rgb(36 24 11 / .06);                /* hoverable cards (stat, media) on hover */
--ad-shadow-2: 0 10px 28px rgb(36 24 11 / .14), 0 2px 6px rgb(36 24 11 / .08); /* sheets, dialog, sticky save bar */
--ad-shadow-bar: 0 -1px 0 rgb(36 24 11 / .25), 0 -8px 24px rgb(36 24 11 / .12); /* mobile bottom bar */

--ad-sidebar-w: 248px;
--ad-content-max: 1240px;
--ad-topbar-h: 56px;
--ad-bottombar-h: 64px;          /* plus env(safe-area-inset-bottom) */
--ad-control-h: 44px;            /* 48px under (pointer: coarse) */
--ad-control-h-sm: 36px;         /* desktop dense tables only, never on coarse pointers */
```

Breakpoints are based on the content: **< 768px** is the phone (cards, top bar, bottom bar). **768–1023px** is the tablet (tables, bottom bar). **≥ 1024px** is the desktop (sidebar, no bottom bar).

#### 3.2.4 Motion

```css
--ad-dur-fast: 120ms;    /* hover, press, colour */
--ad-dur-base: 200ms;    /* disclosure open, sheet, toast-in */
--ad-dur-slow: 320ms;    /* page-load reveal items */
--ad-ease-out: cubic-bezier(0.22, 1, 0.36, 1);   /* = storefront --ease-out-soft */
--ad-ease-in: cubic-bezier(0.4, 0, 1, 1);
--ad-stagger: 40ms;
```

**The one orchestrated reveal** happens on the first load of the shell. The layout persists across soft navigations, so it plays once:

1. The sidebar comb texture fades from 0 to 1 over 480ms with `--ad-ease-out`.
2. Nav items go from `opacity 0, translateX(-6px)` to their resting state over 320ms, staggered by `calc(var(--i) * 40ms)` (set `style={{"--i": n}}`; this one custom property is allowed, see §4.5).
3. In the main area, the page header and the first row of cards go from `opacity 0, translateY(6px)` to rest over 320ms, staggered by 40ms, with a maximum of 6 items.

The page content on later soft navigations settles with opacity only, from 0 to 1 over 160ms. Never animate tables row by row. Animate only `opacity` and `transform`.

```css
@media (prefers-reduced-motion: reduce) {
  .admin-app *, .admin-app *::before, .admin-app *::after {
    animation-duration: 1ms !important; animation-delay: 0ms !important;
    transition-duration: 1ms !important; scroll-behavior: auto !important;
  }
}
```

### 3.3 Layout

#### Desktop (≥ 1024px)

```
┌──────────────┬──────────────────────────────────────────────────────────┐
│ ⬡ Honey by   │  ORDERS                                   [ + … ]        │ ← page header
│   Abdul Sami │  Orders                                                  │   (eyebrow = nav group)
│   Admin      │  Review orders, print slips and update status.           │
│              │                                                          │
│ TODAY        │  ┌ Notice (success / error) ───────────────────────────┐ │
│ ▌ Overview   │  └─────────────────────────────────────────────────────┘ │
│   Orders  12 │  [⬡ Pending 4][⬡ Confirmed 2][⬡ Shipped 5][⬡ Delivered][⬡ Cancelled]
│   Messages 3 │  ┌ Filters: [Search…………] [Dates ▾] [Apply] Reset ──────┐ │
│              │  │ Order  Customer      Address        Placed  Items  Total │
│ CATALOGUE    │  │ AS-1024 Ayesha Khan  House 12, …    2h ago   3  Rs 4,850 │
│   Products   │  │ …                                                    │ │
│   Categories │  └─────────────────────────────────────────────────────┘ │
│              │  ‹ Previous   Page 2   Next ›                            │
│ WEBSITE      │                                                          │
│   Banners    │                                                          │
│   Site content                                                           │
│   Blog       │                                                          │
│   Testimonials                                                           │
│   Media      │                                                          │
│ ░░honeycomb░░│                                                          │
│ ⚙ Settings   │                                                          │
│ ↗ View store │                                                          │
│ owner@…  ⎋   │                                                          │
└──────────────┴──────────────────────────────────────────────────────────┘
```

- The sidebar is `position: sticky; top: 0; height: 100dvh; overflow-y: auto`, with a width of `--ad-sidebar-w`.
- The honeycomb comes from the existing `--mask-honeycomb` in `globals.css`, applied to a `::before` filled with `--ad-on-comb` at **opacity .06**. It is masked with `linear-gradient(to top, #000 0%, transparent 55%)` so the comb gathers in the lower half, behind the account area and not behind nav labels. Text contrast over it stays at 12:1 or more.
- The main area is `max-width: var(--ad-content-max)`, with padding of `40px clamp(24px, 4vw, 56px) 64px`.

#### Phone (< 768px; the bottom bar also shows on tablets below 1024px)

```
┌─────────────────────────────────┐
│ ⬡ Honey · Admin        ↗ Store  │ ← top bar 56px (comb), not sticky
├─────────────────────────────────┤
│ ORDERS                          │
│ Orders                          │
│ ┌─────────────────────────────┐ │
│ │ [⬡ Pending 4] [⬡ Confirmed 2]→ │ ← scroll-snap chips, edge fade
│ └─────────────────────────────┘ │
│ [Search orders……………………]  [⚙]  │ ← filters; dates in a disclosure
│ ┌─────────────────────────────┐ │
│ │ AS-1024         ⬡ Pending   │ │
│ │ Ayesha Khan · 2 hours ago   │ │
│ │ ☎ 0300 1234567   WhatsApp   │ │
│ │ House 12, Street 4,         │ │
│ │ Hayatabad, Peshawar         │ │
│ │ 3 items            Rs 4,850 │ │
│ │ [ Open order ] [ Copy ]     │ │
│ └─────────────────────────────┘ │
│ …                               │
├─────────────────────────────────┤
│  ⌂     🧾 4    ✉ 3    📦    ☰   │ ← bottom bar 64px + safe area (sticky)
│ Home  Orders  Messages Products More │
└─────────────────────────────────┘
```

The glyphs in the sketch stand in for lucide icons. Do not use emoji.

- **Bottom bar** (`<nav aria-label="Primary">`): Home (`House`), Orders (`ReceiptText`, with the pending count), Messages (`Mail`, with the unread count), Products (`Package`), More (`Menu`). Each item is at least 48px tall with an icon and a 12px label. The active item gets a honey 3px top bar, `--ad-on-comb` text and `aria-current="page"`.
- **More** opens a **sheet built on the Popover API** (`<button popovertarget="admin-more">` plus `<div id="admin-more" popover>`). It needs no JavaScript and gives Esc and light dismiss for free. It contains the remaining nav grouped exactly like the sidebar, then Settings, View store and Sign out. The sheet is anchored to the bottom, has `--ad-radius-lg` top corners and `--ad-shadow-2`, and slides up over `--ad-dur-base`. A popover does not trap focus. That is acceptable for a non-modal menu, but the first item must be reachable with Tab immediately after the trigger.
- **Focus must not be obscured** (WCAG 2.4.11). Add `html:has(.admin-shell) { scroll-padding-bottom: calc(var(--ad-bottombar-h) + env(safe-area-inset-bottom) + 16px); }` and matching `padding-bottom` on main.
- The top bar is not sticky, which saves vertical space. Only the bottom bar is sticky.
- Hide the top bar, bottom bar and sidebar in print.

### 3.4 Navigation groups

| Group (eyebrow) | Items | Icon (lucide) |
|---|---|---|
| **Today** | Overview · Orders (pending badge) · Messages (unread badge) | `House`, `ReceiptText`, `Mail` |
| **Catalogue** | Products · Categories | `Package`, `Tags` |
| **Website** | Banners · Site content · Blog · Testimonials · Media | `Megaphone`, `PanelsTopLeft`, `NotebookPen`, `Quote`, `Images` |
| *(footer)* | Settings · View store · Sign out · admin email | `Settings`, `Store`, `LogOut` |

- **Active state:** use a small client component, `AdminNavLink`, that calls `usePathname()`. An item is active when the pathname equals the href, or starts with `href + "/"` for every item except `/admin`. Set `aria-current="page"`, use `--ad-comb-2` as the background, add `box-shadow: inset 3px 0 0 var(--ad-honey)`, and colour the text `--ad-on-comb`.
- Group labels are `<h2 class="admin-nav-group">` with visible text styled `--ad-text-2xs`, `--ad-on-comb-muted`. Each group is a `<ul>` inside one `<nav aria-label="Admin">`.
- Items are 40px tall (44px under `pointer: coarse`), with 12px horizontal padding, an 18px icon and an 8px gap.
- Badges: the honey pill (`--ad-honey` background, ink text, 12px 600 tabular, minimum 22px) is used **only** for counts that need action (unread, pending). Keep the existing `navBadge()` aria-label approach ("Messages, 3 unread"). Add the pending-orders count as optional O5, using the same helper with "pending".
- Replace the `<aside>` wrapper with `<header class="admin-sidebar">` containing the brand, followed by the `<nav>`, which fixes A30. Add `aria-hidden="true"` to the `↗` glyph.
- Brand lockup: a hexagon mark (an inline SVG honey cell) plus "Honey by Abdul Sami" in Fraunces 560 at 17px, with "Admin" in `--ad-text-2xs` muted. Drop "STORE ADMIN" in capitals.
- Page `<title>`: use `title: { template: "%s · Admin · Honey by Abdul Sami", default: "Admin · Honey by Abdul Sami" }` in the admin layout metadata, and give each page `export const metadata = { title: "Orders" }`. For dynamic pages, use `generateMetadata` and check the docs, because `instant=false` and cacheComponents interplay.

### 3.5 Component inventory and specs

All components are server components unless marked **(client)**. Where possible they live in `src/features/admin/ui.tsx` (or `src/features/admin/ui/*.tsx` if the file grows).

#### 3.5.1 Page header: `AdminHeading` (extended, backwards compatible)

```
[← Back to orders]                          (optional back link, 44px target)
CATALOGUE                                   (eyebrow = nav group, --ad-text-2xs muted)
Products                                     (h1 display, text-wrap: balance)
Manage prices, stock and product details.    (description, --ad-text-sm muted, max 68ch)
                                [Secondary]  [+ Add product]   (actions, right; full-width stack < 480px)
```

Props: `title`, `description?`, `eyebrow?` (default derived per section, but passing it explicitly is fine), `back?: {href,label}`, `actions?: ReactNode` (keep `href/action` working as a shortcut). Use a bottom margin of `--ad-space-6`. Remove the hard-coded "STORE MANAGEMENT".

#### 3.5.2 Stat card

- `<a class="admin-stat">` (or `<div>` when there is no destination). It has the label (`--ad-text-sm` 500 ink-2), the number (`--ad-text-stat` tabular), a context line (`--ad-text-xs` muted, for example "Oldest: 2 days ago") and an `ArrowUpRight` 16px icon in the top right when it is a link.
- States: hover (border `--ad-line-strong`, `--ad-shadow-1`, 120ms); focus-visible ring; an *attention* variant when the value is greater than 0 for Pending or Unread (a 4px left bar in `--ad-honey`, and a hexagon glyph beside the label). A zero value shows as "0" plus "All clear" in the context line. It is never empty.
- Grid: `repeat(auto-fit, minmax(min(100%, 200px), 1fr))` with a 12px gap. On phones, use 2 columns.

#### 3.5.3 Data table with a responsive card fallback

Use one markup with two presentations:

```html
<div class="admin-table-wrap" data-cards="md">       <!-- cards below 768px -->
  <table class="admin-table" aria-label="Pending orders">
    <thead>…<th scope="col" class="num">Total</th>…</thead>
    <tbody><tr>
      <td data-label="Order" data-slot="title">…</td>
      <td data-label="Status" data-slot="badge">…</td>
      <td data-label="Customer" data-slot="meta">…</td>
      <td data-label="Total" class="num">…</td>
      <td data-slot="actions">…</td>
    </tr></tbody>
  </table>
</div>
```

**Table mode (≥ 768px)**

- Header row: background `--ad-surface-sunken`, `--ad-text-2xs` muted caps, sticky (`position: sticky; top: 0`) when inside a panel taller than the viewport.
- Row height is at least 52px, with cell padding of `12px 12px` and a bottom border of `1px solid var(--ad-line)`.
- Row hover uses `--ad-honey-soft` at 40% (`color-mix(in oklab, var(--ad-honey-soft) 40%, transparent)`).
- Use `.num` to right-align with tabular figures. Identifiers use `--ad-font-mono` at 14px.
- The first cell holds the primary link (ink 600, underline on hover). The whole row is **not** clickable, because nested controls would conflict.
- Row actions are `admin-button quiet sm` (36px, icon plus text, `aria-label` includes the item name, as today).

**Card mode (< 768px)**

- `table, thead, tbody, tr, td { display:block }`, and `thead` becomes `sr-only`.
- Each `tr` is a card: surface background, 1px `--ad-line-strong` at 40% border, `--ad-radius-md`, 16px padding, 12px gap.
- `[data-slot=title]` uses 16px 600. `[data-slot=badge]` floats top-right through a CSS grid (`grid-template-areas: "title badge" "meta meta" "body body" "actions actions"`).
- Other cells render `td::before { content: attr(data-label) }` as a 12px muted label when `data-label` is set and the cell is not a slot.
- Actions become full-width 44px buttons in a 2-column grid.
- **Restore semantics:** setting `display` on table elements removes table semantics in WebKit. Add explicit `role="table" | "rowgroup" | "row" | "columnheader" | "cell"` on these elements (the Adrian Roselli pattern), or accept list-like reading in card mode. The recommended choice is to add the roles. They are static attributes and cost nothing.

Per-page card mappings are in §3.6. Use `data-cards="never"` for the order-items table on the detail page, which stays a small table that scrolls on narrow screens, and for the print view.

#### 3.5.4 Filters bar

- `<form role="search" class="admin-filters">` with the search field (the label is visible on desktop; on mobile use `aria-label` plus a leading `Search` icon with a 16px input font), selects, then **Apply** (secondary) and **Reset** (quiet, shown only when filters differ from the defaults).
- On mobile, the search and the Apply button sit on one row and the other filters go behind a `<details>` "Filters (2)" disclosure, with the count of active filters in the summary.
- Active filters appear as removable chips under the bar, for example "Dates: 1–15 Oct ×". Each chip is a link to the same URL without that parameter. They are server-rendered.
- Order status tabs keep `<nav aria-label="Orders by status">` and become **segmented chips**: 40px tall, a hexagon glyph, the label and a count. The active chip uses the status pill colours plus a 2px ink outline and `aria-current="page"`. On mobile they scroll horizontally with `scroll-snap-type: x mandatory` and a 24px edge-fade mask. Order them by lifecycle: Pending, Confirmed, Shipped, Delivered, Cancelled.

#### 3.5.5 Status pill: `StatusPill` (new)

- `<span class="admin-pill" data-tone="pending">`, with the glyph `<svg aria-hidden>` (14×16 hexagon) and the label.
- Size: 24px tall, `0 8px` padding, `--ad-text-xs` 600, `--ad-radius-pill`, no border except *Archived*, which uses a dashed `currentColor` border at 40%.
- The hexagon glyph: an outline path with a `stroke-width` of 1.5 in `currentColor`. A filled path is clipped by a `<rect>` whose `y` and `height` encode the fill: 0, 1/3, 2/3 or 1. Cancelled adds a slash. Build it as one `HexGlyph({ level: 0|1|2|3, struck?: boolean })` component. Pending, Unread and Live states may use a small 1.6s **once-only** pulse on the dashboard attention tile only, and never under reduced motion.
- The text label is always present. The glyph is decorative, so meaning is never carried by colour or fill alone (WCAG 1.4.1).

#### 3.5.6 Forms and fields

The field anatomy, top to bottom, is: **label** (14px 600 ink), then an optional "(optional)" marker (muted, 400), then a **hint** (13px muted, `id` wired through `aria-describedby`), then the **control**, then an optional **inline error** (when available in future; see O10).

- **Controls:** at least 44px tall (48px on coarse pointers), 16px text, `--ad-surface` background, `1px solid var(--ad-line-strong)`, `--ad-radius-sm`, `10px 12px` padding.
  - Hover: border `--ad-ink-2`.
  - Focus: border `--ad-ink` plus the ring (see focus below).
  - Disabled: `--ad-surface-sunken` background, `--ad-muted` text, `cursor:not-allowed`.
  - Invalid (`:user-invalid`, which is supported by modern browsers): border `--ad-danger`, a 2px left inset and a native message.
- **Selects:** use a custom chevron through `appearance:none` plus a background SVG, with 40px right padding.
- **Checkbox and radio:** a 20px box, `accent-color: var(--ad-ink)`, and a whole-label hit area of at least 44px tall. Visibility checkboxes that act like a switch (product Active in the list) get the `.admin-switch` styling: a 40×24 track, `--ad-line-strong` when off, `#2b5e27` when on, and the text "Shown on website" or "Hidden".
- **Slug fields:** a prefix adornment showing `/shop/` or `/blog/` in mono muted, the field in mono, and the hint "Lowercase letters, numbers and dashes. Changing it breaks old links." Add `title=` to `pattern` inputs so the browser's message is understandable.
- **Money:** a "Rs" prefix adornment, `inputmode="decimal"`, and right-aligned tabular figures.
- **Stock:** `inputmode="numeric"`.
- **Required and optional:** most fields are required, so mark only the optional ones with "(optional)" and keep the `required` attribute. Add a sentence at the top of long forms: "All fields are required unless marked optional."
- **Section layout:** each logical group is a `<fieldset class="admin-section">` with a `<legend>` (h2 style), inside one panel. Use 2 columns at 768px and above, 1 below. Fields that belong together sit in the same row (Price and Compare-at; Stock and Listed on).
- **Sticky save bar** for long editors (product, blog, banner): `position: sticky; bottom: 0` (above the bottom bar on mobile: `bottom: calc(var(--ad-bottombar-h) + env(safe-area-inset-bottom))`), with a `--ad-surface` background, `--ad-shadow-2`, 12px padding, and the primary Save plus a quiet Cancel link back to the list. On mobile, Save is full width.
- **Error summary:** until field-level errors exist, show the page-level error notice at the top, focused on load (O6). Its text stays the server message.

#### 3.5.7 Buttons: `.admin-button` variants

| Variant | Fill / text / border | Hover / active | Use |
|---|---|---|---|
| `primary` (default) | `--ad-honey` / `--ad-ink` / `1px --ad-honey-edge` | `--ad-honey-hover` / `--ad-honey-press` and `translateY(1px)` | one per view: Save, Mark as shipped, Sign in, Add |
| `secondary` | `--ad-surface` / `--ad-ink` / `1px --ad-line-strong` | border `--ad-ink-2`, background `--ad-canvas` | Apply, Print, Copy, Upload and select |
| `quiet` | transparent / `--ad-link` / none, underline on hover | background `--ad-honey-soft` | Reset, Cancel, row actions |
| `danger` | `--ad-danger` / `#fff` / none | `--ad-danger-hover` | the final Delete or Cancel order button inside a confirmation panel |
| `danger-quiet` | transparent / `--ad-danger` / `1px currentColor` at 50% | `--ad-danger-soft` | list-row "Delete…" that opens the editor's danger zone |

- Sizes: `md` is 44px tall (48px coarse) with `0 16px` padding and 15px 600 text. `sm` is 36px with `0 12px` padding and 14px text, for desktop table rows only. An icon is 18px with an 8px gap.
- A loading state applies to every server-action submit through **`SubmitButton` (client)** using `useFormStatus()`. It sets `aria-disabled="true"` (not `disabled`, so the label is still read), shows a 14px spinner ring and pending text ("Saving…", "Updating…", "Deleting…"), and blocks repeat clicks with a guard. The action contract does not change.
- Focus ring: `outline: 2px solid var(--ad-focus); outline-offset: 2px`. On the comb surfaces use `--ad-focus-on-comb`. On honey buttons the ink ring on the canvas is 15.5:1.

#### 3.5.8 Notices (inline)

Toasts are rejected for this admin because they disappear, are easy to miss and fight the redirect model. Notices are inline, at the top of the content, under the header.

- Anatomy: a 4px left bar (success `--ad-success-ink`, error `--ad-danger`, info `--ad-link`), an icon (`CircleCheck` or `TriangleAlert`, 20px), the message (14px; the title in 600 when one is provided), and an optional dismiss button `X` (quiet, 44px). Dismissing is client-side and hides the notice.
- `AdminNotice` gains `message?: string` so pages can say "Order AS-1024 marked as Shipped." or "Product saved." The default stays "Changes saved."
- Accessibility: error notices use `role="alert"` and success notices `role="status"`. **Optional O6:** a tiny client wrapper that, on mount, focuses the notice (`tabIndex={-1}`) and calls `history.replaceState` to remove `saved` and `error` from the URL so a refresh doesn't repeat it.

#### 3.5.9 Confirmation panel ("danger zone"): restyle the existing `<details>`

```
┌ ⚠ Delete this product ─────────────────────────────── ▾ ┐   summary: 48px, danger text, chevron rotates
│ This permanently removes the product and its gallery.    │
│ Better option: [Archive instead]  (quiet button/link)    │
│ ☐ I understand this product will be permanently deleted │   required checkbox (kept)
│ [ Delete product ]  (danger)                             │
└──────────────────────────────────────────────────────────┘
```

- Use the `.admin-danger-zone` panel: border `1px solid color-mix(in oklab, var(--ad-danger) 35%, transparent)`, summary text `--ad-danger` 600, a `TriangleAlert` icon, and the body on `--ad-surface`.
- Always place it **last** on the page, separated by `--ad-space-10`.
- Keep the `id="delete-product"` and `open={showDelete}` deep link.
- The order cancel option is a danger zone too (see §3.6 Orders detail).

#### 3.5.10 Empty state

- A centred block inside the panel: a 48px hexagon tile (`--ad-surface-sunken`) with a lucide icon (`Inbox`, `Package`, `Images`…), a title (Display 560 at 19px), one sentence, and one action.
- Two variants:
  - **first-use**, for example "No products yet. Add your first honey to start selling." with [Add product].
  - **no-results**, for example "No pending orders match these filters." with [Clear filters] plus "Try All dates".
- When rows are empty, **do not render** the `<table>` and `thead` at all.

#### 3.5.11 Pager

- `<nav aria-label="Pagination" class="admin-pager">` containing ‹ Previous (secondary, 44px), "Page 2" (or "Showing 21–40" where row counts are known from `page` and `rows.length`), and Next › (secondary).
- Disabled ends render as `<span aria-disabled="true">` styled muted, so the layout doesn't jump.

#### 3.5.12 Media grid (Media page)

- Grid: `repeat(auto-fill, minmax(min(100%, 200px), 1fr))` with a 16px gap.
- Card:
  - a 4:3 thumbnail tile on `--ad-surface-sunken` with a subtle checkerboard for transparent PNG and WebP (CSS `conic-gradient`), `next/image` with `fill`, `sizes="(max-width:768px) 50vw, 220px"` and `object-fit: contain`;
  - the alt text (14px, clamped to 2 lines with `title` for the full text);
  - meta (KB, uploaded date) in muted;
  - "Used in" as chips grouped by type. When unused, show a neutral pill "Not used", which helps cleanup.
  - The danger zone sits at the bottom of the card ("Delete image…"), keeping the current warnings and checkbox wording.
- Upload panel: a large dashed drop area that is a **styled `<label>` wrapping the native file input**, so it stays keyboard and screen-reader friendly. The text reads "Choose an image or drop it here · JPEG, PNG, WebP, AVIF · up to 4 MB". The alt field hint is "Describe what's in the photo, e.g. 'Sidr honey 500 g jar on a wooden table'". Drag and drop is an enhancement only; the click path always works (WCAG 2.5.7).

#### 3.5.13 Image picker: `ImageSelect` v2 (client; same form contract)

- **Collapsed:** a 64×48 thumbnail (or a placeholder hexagon) with the alt text, then a [Change] (secondary sm) and [Remove] (quiet) pair. It carries a hidden `<input name={name} value={selected}>`, **the same name and value as today**.
- **Open:** a native `<dialog>` opened with `showModal()`. It provides a focus trap, Esc and an inert background. The dialog contains a header ("Choose image", with a close `X`), a search field that filters by alt text on the client, and a grid of thumbnails as **radio inputs** (`<label>` wrapping `<input type=radio>` and the image, 96px tiles, with a 3px ink selected ring and a check badge). The footer has [Use this image] (primary) and [Cancel], and an "Upload new image" section that reuses the current upload logic, the 4 MB check and the submit-blocking behaviour.
- Thumbnails are rendered only while the dialog is open, using `next/image` with `sizes="96px"` and `loading="lazy"`.
- **Data:** options need the `url` (add it to `images.map(({ id, alt, url }) => …)`). To fix A27, provide options once per page through a `MediaOptionsProvider` (client context) instead of passing them to every instance.
- **Product gallery** (`GalleryPicker`, client): an ordered list of selected thumbnails. Each has Move up, Move down and Remove buttons (all 44px), and the first is labelled "Primary". Below it is [+ Add images], which opens the same dialog in multi-select (checkbox) mode. It renders hidden `<input name="imageId">` elements **in order**, the same contract as today's repeated selects, so `saveProduct` is unchanged, including the duplicate check. Drag reordering is optional and only an addition to the buttons.
- Announce changes through a polite live region ("Image moved to position 2").

#### 3.5.14 Login screen

```
Desktop: two panes                         Phone: stacked
┌───────────────┬─────────────────────┐    ┌───────────────────────┐
│ comb panel    │  Welcome back       │    │ comb band 120px + ⬡   │
│ ⬡ honeycomb   │  Sign in to manage  │    │ Welcome back          │
│ "Honey by     │  your store.        │    │ [Email…………………]       │
│  Abdul Sami"  │  [Email…………………]     │    │ [Password……… 👁]      │
│  (Fraunces)   │  [Password……… Show] │    │ [ Sign in ] (full)    │
│               │  [ Sign in ]        │    │ ← Back to store       │
└───────────────┴─────────────────────┘    └───────────────────────┘
```

- Use the same tokens. The comb panel is 40% wide at 1024px and above, `--ad-comb` with a honeycomb texture at opacity .08 and the wordmark in Fraunces 600 at 40px with `--ad-on-comb`. The form card is 400px wide and the full-width primary button is 48px tall.
- Keep the error and lockout copy. Add an optional client "Show" password toggle: a `type` swap with `aria-pressed`, labelled "Show password".
- Change the eyebrow to "Honey by Abdul Sami · Admin" and set the `<title>` to "Sign in · Admin".

#### 3.5.15 Loading skeletons and error pages

- `(protected)/loading.tsx`: render a skeleton of the page header plus 6 rows or cards on `--ad-surface-sunken` blocks, with a 1.2s shimmer through a `background-position` animation (or no shimmer under reduced motion), and `role="status"` with sr-only text "Loading…".
- The `Suspense` fallback in `(protected)/layout.tsx` renders a **shell skeleton** (a sidebar block plus the main skeleton) so the layout doesn't jump.
- **New** `src/app/admin/(protected)/error.tsx` (client): a panel with "Something went wrong loading this page.", the hint "Your changes may not have been saved. Check your connection and try again.", [Try again] (calls `reset()`/`unstable_retry` per the docs) and [Go to Overview]. Never show the stack trace.
- **New** `src/app/admin/(protected)/not-found.tsx`: "We couldn't find that item. It may have been deleted." with [Back to Overview].

### 3.6 Page-by-page plan

Priority: **H** means the owner does it often or on a phone, so do it first. **M** is weekly. **L** is rare setup.

| Page | Pri | Plan |
|---|---|---|
| **Shell / nav** | H | Grouped sidebar with active state (§3.4), mobile top and bottom bars with the More popover sheet, honeycomb texture, reveal, skeleton, error and not-found pages, per-page titles. |
| **Overview** (`(protected)/page.tsx`) | H | **"Today at the hive."** **Row 1, attention stats:** Pending orders (all dates; links to `?status=pending&date=all`), Ready to ship (confirmed count; links to `?status=confirmed&date=all`; new count query, O9), Unread messages, Low stock (active products only; links to `?stock=low&status=active`, O2). **Row 2, two panels:** "Waiting for you": the 5 oldest pending orders (number in mono, name, city, total, relative age "2 days ago"), [Open] each, footer link "All pending orders". "Running low": 5 lowest-stock active products with the stock number (red text when 0), [Edit]. Both are new read-only queries (O9). **Row 3:** today's order value as a quiet stat plus quick actions ([Add product], [Upload image], [View store ↗]). Remove the generic paragraph. Move "Confirm actual stock quantities before accepting orders" into the "Waiting for you" hint. Without O9, ship Row 1 and the quick actions only. |
| **Orders list** | H | Lifecycle-ordered status chips with hexagon glyphs. Filters bar (search plus a dates disclosure on mobile). Table columns: Order (mono link), Customer (name plus phone in mono), Ship to (address, clamped to 2 lines with the full text in a `title`), Placed (relative plus absolute PKT in a `title`, e.g. "2 h ago"), Items (num), Total (num), and actions (Copy as secondary sm, plus Open). **Cards < 768px** as wireframed in §3.3, with `tel:` and optional WhatsApp (`https://wa.me/92…`, O4) as 44px quiet buttons. Empty state uses the no-results variant with "Show all dates". **O1:** the default date is "All dates" for open statuses (pending, confirmed, shipped) and "Today" for delivered and cancelled, or at minimum the dashboard links pass `date=all`. |
| **Order detail** | H | **Header:** back link, "AS-1024" in mono at h1 size, StatusPill, "Placed 31 Oct, 14:05 PKT". **Status progress strip:** four hexagon cells (Pending, Confirmed, Shipped, Delivered) joined by a line; reached cells are filled, the current one is labelled "Now", and a cancelled order replaces the strip with a cancelled banner. This uses the existing history timestamps under each cell. **Primary action panel** (top on mobile, right column on desktop): a single big primary button **"Mark as confirmed"**, "Mark as shipped" or "Mark as delivered", which is a `<form action={changeOrderStatus}>` with hidden `id`, `status` (the forward next status) and `returnTo`. Under it, the stage-specific helper text already in the code, plus [Print slip] and [Copy shipping] as secondaries. **Cancel order** is a separate danger zone with a `<form>` that has hidden `status=cancelled`, the **required** checkbox `name="confirm" value="yes"` ("Cancel this order and return 3 items to stock") and a danger button. This is the same action and the same fields (O3). **Customer and delivery:** a description list in 2 columns at 768px and above, with the phone as `tel:` (44px) plus WhatsApp (O4) and the address as one block, preserving line breaks. **Items:** a compact table (no cards; scrolls if needed), with totals right-aligned and tabular, and "Cash on delivery: collect Rs 4,850" emphasised in a honey-soft box. **History:** a vertical timeline (hexagon glyph per event, label, PKT time, actor). |
| **Print slip** | H | Print-only layout (`@media print`) on A5 or A4 portrait, black ink. The order number is large (mono 28pt). Then a **To** block (name, phone, full address at 14pt), a **Collect on delivery: Rs X** box with a 2px border, the items table, and a **From** block (store name, phone and address from `siteConfig`, if available). Hide all chrome, notices and buttons. Use `break-inside: avoid`. Test in Chrome print preview at 100%. |
| **Messages list** | H | Table: Received (relative and absolute), Sender (bold plus an honey dot when unread; email muted), Service, a 1-line preview (clamped), StatusPill (Unread or Read), and the action. Cards < 768px: sender plus pill, preview over 2 lines, time, [Open]. The retention notice becomes an info notice with a clear count. Specific success notices ("Message deleted.", "Marked as unread.") use the new Notice. |
| **Message detail** | H | Header "Message from {name}" with the pill. Then a message body card (16px, `white-space: pre-wrap`, max 68ch). Contact actions: [Reply by email] (`mailto`), [Call] (`tel`) and optionally [WhatsApp]. Details as a description list. "Mark as unread" is quiet. Delete goes in a danger zone. |
| **Products list** | M | Columns: product (a 40px thumbnail if the first image URL is available, which is optional; the name; the slug in mono muted), category (with an inactive warning pill "Category hidden"), visibility switch (autosave, keep it), stock (num; danger text and a "Low" pill when 5 or less, "Out" when 0), price (num), and actions (Edit as quiet, Delete… as danger-quiet). Cards < 768px: name, pill, a stock and price row, the switch, then the actions. Filters: search, status and stock. The `ProductVisibility` switch shows "Saved" for 2 seconds after success (`role=status`). |
| **Product editor** | M | Sections in order: **Basics** (name, slug with the `/shop/` prefix, category plus the "Manage categories" link, visibility switch), **Price and stock** (price Rs, compare-at Rs (optional), stock, listed on), **Images** (GalleryPicker, §3.5.13), **Honey details** (unit or pack size, origin, harvest, floral source, taste notes), **Description** (short summary, plus the description with a character count), **Tags** (checkbox chips), **Display** (display order, with the hint "Lower numbers appear first in the shop"), **Ratings** (see Q1, A2), then the sticky save bar and the danger zones for Archive and Delete. |
| **Categories** | L | Table: name plus slug, a status pill, products (num), order (num), and Edit. The editor gets sections plus a danger zone. When the category has products, the danger zone explains why it can't be deleted and offers [Hide category instead]. |
| **Blog list / editor** | L | Table: post (title plus slug), category, a Published/Draft pill, date, views, average reading time, total reading time (num), Edit. Cards keep the title, pill and date, with a "Views / Avg. read" row. Editor sections: **Post** (title, slug, short description), **Article** (the body textarea at a monospace-friendly 16px Plex Sans with 16 rows, with the formatting hint moved *above* it as a compact cheat-sheet: `## Heading`, `- List`, `> Quote`), **Details** (category, author, date, cover image picker, tags), **Publishing** (switch plus hint), sticky save, danger zone. |
| **Testimonials** | L | Table: customer, quote (2-line clamp), rating (stars as text "4.5 / 5" plus a decorative star icon), a Visible/Hidden pill, order, actions. Editor: add the hint "Only publish real customer words, with their permission." (ethics). |
| **Banners** | M | Table: title, placement, a **derived status pill** (Live, Scheduled, Ended, Off), window (starts → ends, PKT), and **Edit** (currently missing as an explicit action). Editor sections: **Placement and order**, **Message** (title, subtitle with optional marker, button label and link (optional)), **Image and product**, **Schedule** (with the hint "Leave both empty to show any time"), **Active** switch, sticky save, danger zone. |
| **Site content** | M | A left mini-index of groups at 1024px and above (sticky in-page anchor list; on mobile a `<details>` jump list). Each slot is a card with an h3 label, the hint, an ImageSelect v2 thumbnail, the YouTube field when it is a video slot (with a live thumbnail preview from `i.ytimg.com`, which is optional), and its own Save (secondary sm). **Dirty-state marker (O8):** when a slot's inputs change, show a honey "Unsaved" pill on that card and arm `beforeunload`. Honey variety images use the same card pattern. |
| **Media** | M | §3.5.12. Add an optional client filter "Show unused only" (filters the 20 visible cards). |
| **Settings** | L | Two panels. **Account:** the email in mono plus the password explanation; the env-var instruction goes in a `<details>` "How to change the password". **Order WhatsApp number:** a `tel` field with a `+92` hint, a [Save] primary, and when saved a [Test on WhatsApp ↗] quiet link to `https://wa.me/<number>` (optional). |
| **Login** | M | §3.5.14. |

### 3.7 Optional UX behaviour changes (flagged; each needs approval)

Server Actions stay unchanged in every case unless the item says otherwise.

| ID | Change | Risk | Recommendation |
|---|---|---|---|
| **O1** | Open order statuses default to **All dates**. As a minimum, dashboard links pass `date=all`. | Low. Touches `parseOrderDateFilter` default and its tests. | **Strongly recommended** (fixes A1). |
| **O2** | The dashboard Low-stock link adds `status=active` to match its count. | None | Yes |
| **O3** | Order detail uses one button per forward transition plus a separate Cancel danger zone instead of the select, checkbox and Update button. | None. It is the same action with the same fields (`id`, `status`, `confirm`, `returnTo`). | Yes |
| **O4** | `tel:` and WhatsApp `wa.me` links for the customer phone on order cards and detail. | Low. Normalise `03xx` to `92…`. | Yes |
| **O5** | A pending-orders badge on Orders in the nav (one `count()` query in the layout, `.catch(() => 0)` like unread). | Low | Yes |
| **O6** | Focus the notice on mount and strip `saved`/`error` from the URL with `history.replaceState`. | Low | Yes |
| **O7** | `SubmitButton` with `useFormStatus` pending state on every server-action form. | None | Yes |
| **O8** | Site Content dirty-state "Unsaved" marker plus a `beforeunload` guard. | Low | Yes |
| **O9** | New read-only dashboard queries (confirmed count, 5 oldest pending, 5 lowest stock). | Low | Yes, in Phase 4. |
| **O10** | *Later:* `useActionState` so validation errors keep the typed values and show inline field errors. This **changes the action return shape**, so it is out of scope for this redesign and should be a separate ticket. | Medium | Plan next. |
| **O11** | *Later:* error **codes** in redirects mapped to known messages, instead of raw text (A25). This changes the actions, so it is a separate ticket. | Low | Plan next. |
| **O12** | The Copy button reverts to "Copy" after 2.5 seconds. | None | Yes |

---

## 4. Implementation guidance for the engineer

### 4.1 Files and structure

```
src/app/admin/
  layout.tsx            ← load IBM Plex Sans + Plex Mono via next/font; apply variables on .admin-app; metadata template
  admin.css             ← becomes an index of @imports (or keep one file with clear sections)
  styles/
    tokens.css          ← every --ad-* token, scoped: .admin-app { … }
    base.css            ← .admin-app typography, links, focus, reduced-motion, selection, print base
    shell.css           ← sidebar, top bar, bottom bar, More sheet, main, reveal keyframes
    components.css      ← button, field, pill, hex, notice, table/cards, filters, pager, empty, danger-zone, stat, media, picker, skeleton
    pages.css           ← order detail/progress, print slip, login, content index
src/features/admin/
  ui.tsx                ← AdminHeading(+), AdminNotice(+message), Pager(nav), EmptyState, StatusPill, HexGlyph, StatCard, DangerZone
  nav-link.tsx          ← (client) AdminNavLink with usePathname + aria-current
  submit-button.tsx     ← (client) SubmitButton (useFormStatus)
  notice-focus.tsx      ← (client, O6)
  image-select.tsx      ← v2 (client), same name/value contract
  gallery-picker.tsx    ← (client) ordered imageId inputs
  media-options.tsx     ← (client) context provider for image options (fixes A27)
```

- **Keep CSS unlayered**, as it is today, with every selector prefixed by `.admin-app` (or `.admin-*` classes that only exist inside it). Do not add `@layer` unless you have checked how `globals.css` and Tailwind v4 layers interact. Unlayered storefront rules would beat layered admin rules.
- **Tokens:** define them only inside `.admin-app { … }`. Never redefine storefront `--color-*` tokens. You may *reference* `--mask-honeycomb` and `--font-fraunces` from `:root`.
- **Fonts:** the admin layout is a server component, so declaring `next/font` there is fine. Check against `node_modules/next/dist/docs/` (fonts section) for this Next version before writing. Add `className={\`admin-app ${plexSans.variable} ${plexMono.variable}\`}`.
- **Inline styles:** remove all 35. Replace them with layout classes: `.admin-stack` (vertical gap `--ad-space-4`), `.admin-stack-lg`, `.admin-page` (vertical rhythm between header, notice and panels). The only allowed inline `style` is the `--i` stagger index (and `next/image`'s required props).
- **No Tailwind utilities in admin markup.** The admin uses its own CSS. Mixing the two systems is how the current drift happened. The exception is `sr-only`, which already exists.
- **Server components stay server components.** New client components are leaf-level only (nav link, submit button, picker, switch, notice focus, copy, print, password toggle).

### 4.2 Phases (PR-sized), with acceptance criteria

**Phase 1: Foundations (tokens, type, base controls)**
- *Scope:* `tokens.css`, `base.css`; fonts in the admin layout; restyle buttons, inputs, selects, checkboxes, links, focus and notices; remove inline styles using the new layout classes; per-page `<title>`.
- *Acceptance:*
  - `grep -r "style={{" src/app/admin src/features/admin` returns only the allowed cases.
  - `admin.css` and `styles/*` contain **no hex values outside `tokens.css`**.
  - Inputs and secondary buttons have borders of 3:1 or more, and the focus ring is 3:1 or more on canvas, surface and comb (spot-check with DevTools).
  - Admin text renders in Plex Sans and headings in Fraunces. Inter is no longer *used* in the admin.
  - The storefront home, shop and PDP pages are pixel-identical before and after (compare screenshots).
  - All existing tests pass.

**Phase 2: Shell and navigation**
- *Scope:* grouped sidebar with `AdminNavLink` (`aria-current`); `<header>` and `<nav>` landmarks; mobile top bar, bottom bar and More popover sheet; honeycomb texture; page-load reveal plus reduced motion; shell and page skeletons; `error.tsx` and `not-found.tsx`; print hides chrome; scroll-padding for the bottom bar; optional O5 badge.
- *Acceptance:*
  - At 375px the first content (the page h1) starts 120px or less from the top.
  - The bottom bar is 48px or taller per item, honours the safe area, and covers no focused element when tabbing through a long form (check 2.4.11).
  - More opens and closes with tap, Enter and Esc, and Tab reaches its items.
  - The active item is announced as "current page".
  - With reduced motion there is no movement.
  - A forced error in a page shows the admin error panel with Try again.
  - Print preview of order detail shows no nav chrome.

**Phase 3: Shared components**
- *Scope:* `AdminHeading` v2 (backwards compatible), `StatusPill` and `HexGlyph`, `StatCard`, the responsive data table (card mode, ARIA roles), the filters bar with chips, `Pager` as a nav, `EmptyState`, `DangerZone` restyle, `SubmitButton` (O7), `AdminNotice` with `message`, plus O6 and O12.
- *Acceptance:*
  - Every list page renders cards below 768px with no horizontal page scroll at 320px (WCAG 1.4.10).
  - VoiceOver on iOS reads card cells with their labels.
  - Every server-action submit shows pending text and ignores a second tap.
  - Empty lists show the right variant and no empty table headers.
  - Every status in the app uses `StatusPill` with a text label.

**Phase 4: Orders, messages and dashboard (phone-critical)**
- *Scope:* orders list (chips in lifecycle order, cards, O1, O4); order detail (progress strip, single-tap transitions and Cancel danger zone (O3), timeline, COD emphasis); print slip; messages list and detail; dashboard (Row 1 plus quick actions, and O2; Rows 2 and 3 with O9).
- *Acceptance:*
  - From the dashboard, one tap reaches *all* pending orders, and the tile count equals the list count.
  - At 375px, confirming a pending order takes at most 2 taps from the order list (Open, then Mark as confirmed).
  - Cancelling still requires the checkbox and the server still rejects it without one (an existing test covers this).
  - The print slip fits one A4 page for an order with up to 8 items.
  - `returnTo` still returns to the same filtered list.

**Phase 5: Catalogue, website content, settings, login**
- *Scope:* products list (switch with "Saved" feedback, stock emphasis) and the sectioned product editor with the sticky save bar; categories; blog; testimonials; banners (derived status pill, Edit action); site content (cards, mini-index, O8); settings; login.
- *Acceptance:*
  - The product editor shows Save within reach at all times (the sticky bar) at 375px and 1280px.
  - Optional fields are marked, and required fields keep `required`.
  - The slug field shows the URL prefix and an understandable invalid message.
  - Site content warns before leaving with unsaved slot changes.
  - Login meets the same contrast and focus rules, and the password manager still autofills (`autocomplete` stays the same).

**Phase 6: Media library and image picker**
- *Scope:* media grid and upload area; `ImageSelect` v2 (dialog, thumbnails, search, upload inside); `GalleryPicker` for products; `MediaOptionsProvider` (A27).
- *Acceptance:*
  - The submitted form data is **byte-identical in shape** to today's (`imageId` repeated in order; slot `mediaId`; `coverId`; and so on). Verify with existing action tests plus a manual save.
  - The dialog traps focus, closes on Esc and returns focus to the trigger.
  - Reordering works with buttons only (no drag needed) and is announced.
  - Uploading inside the picker selects the new image and still blocks the parent submit while uploading.
  - The content page's RSC payload no longer grows with slots × media (check the Network tab: the media list is sent once).

**Phase 7: QA and polish**
- *Scope:* full accessibility checklist (§4.3); screenshots at 375, 768, 1280 and 1440px for every page; keyboard pass; 200% and 400% zoom; Windows High Contrast (forced-colors: make sure pills and buttons keep their borders, using `outline: 1px solid transparent` patterns); Lighthouse a11y of 100 on the login and dashboard; slow 3G test of a status change.
- *Acceptance:* no P0 or P1 issues remain from §1; axe reports 0 serious or critical issues on every page.

Rough sizing: Phases 1–3 are about 1 to 1.5 days each, Phase 4 about 2 days, Phase 5 about 2 days, Phase 6 about 2 days and Phase 7 about 1 day. This is my estimate; the engineer should re-estimate.

### 4.3 Accessibility checklist (WCAG 2.2 AA plus mobile)

- [ ] One `h1` per page, and h2 for panels and sections. Content slots use h3.
- [ ] Landmarks: `header` (brand), `nav[aria-label="Admin"]`, `main#main`, `nav[aria-label="Primary"]` (bottom bar), `nav[aria-label="Pagination"]`, `form[role="search"]`.
- [ ] The skip link (from the root layout) lands on `main#main` on every admin page, including login.
- [ ] `aria-current="page"` on active nav items (sidebar, bottom bar, More sheet) and on active status chips.
- [ ] Focus ring of 2px or more with 3:1 or more against adjacent colours everywhere (ink on light, honey on comb). Never `outline: none` without a replacement.
- [ ] Focus not obscured by the sticky bottom bar or sticky save bar (`scroll-padding-bottom`).
- [ ] Targets of 44×44px or more on coarse pointers (buttons, nav, chips, row actions, checkbox labels, pager). Desktop dense `sm` buttons are 36px or more with 8px or more spacing.
- [ ] Every control has a visible label. Hints are linked with `aria-describedby`. Optional fields are marked in text.
- [ ] Text contrast is 4.5:1 or more (all token pairs in §3.2.1 pass), and non-text contrast (borders, glyph outlines, switch track) is 3:1 or more.
- [ ] Status is never conveyed by colour alone: the pill text label is always present and the hexagon is `aria-hidden`.
- [ ] Notices: errors use `role="alert"` and success uses `role="status"`. With O6, focus moves to the notice.
- [ ] Live regions for client-side async (switch saved, upload, copy, gallery reorder).
- [ ] Dialog (image picker): native `<dialog>` with `showModal`, a labelled title (`aria-labelledby`), Esc, and focus returned to the trigger.
- [ ] Drag (if added) always has button alternatives (2.5.7).
- [ ] Tables have `aria-label` or a caption and `th scope="col"`. Card mode adds explicit ARIA roles.
- [ ] Reflow at 320px CSS width with no horizontal scroll except the order-items table inside its own scroller (which has `tabindex="0"` and an `aria-label`, so keyboard users can scroll it).
- [ ] `prefers-reduced-motion` removes all transforms and animations. `forced-colors: active` keeps borders visible.
- [ ] Inputs are 16px or more (no iOS zoom). `inputmode` is set for money, stock and phone. `autocomplete` is kept on login and tel.
- [ ] Decorative glyphs (`↗`, hexagons, comb texture) use `aria-hidden`. Icon-only buttons have `aria-label` and a `title`.
- [ ] Every admin page has a unique `<title>`.

### 4.4 Testing notes

- Keep all existing `*.test.ts` passing. Action contracts are unchanged, so failures mean a regression.
- Add unit tests for pure helpers you introduce: `bannerScheduleStatus(banner, now)`, `waLink(phone)`, and `hexLevel(status)`.
- Visual check before merging each phase: 375×812 and 1280×800, with the keyboard Tab path on Orders → Order detail → Mark as confirmed.

### 4.5 Things to avoid

- Don't change Server Action signatures, form field names or redirect URLs in this redesign (except for the items listed in O1/O2, which are links and defaults, not actions).
- Don't add a UI library (shadcn, Radix and so on). Native `<details>`, `<dialog>`, `popover` and CSS cover everything here.
- Don't use Inter, Roboto, Arial or the system UI as the *intended* face (system fonts only as fallbacks), and no purple or blue gradients.
- Don't use honey yellow for text or icons on light surfaces (1.7:1). Honey is a *fill* with ink on it, or an accent on comb.
- Don't put honeycomb texture behind tables, forms or body text.
- Don't use toasts as the only success feedback, or modals for confirmations (keep the in-page danger zone).
- Don't make whole table rows clickable, don't hide actions behind hover only (there is no hover on phones), and don't use icon-only row actions without labels.
- Don't animate layout properties (width, height, top) or rows of data. The only page-wide motion is the one reveal.
- Don't use placeholder text as a label (today's filters rely on `aria-label` with a placeholder; give them visible labels on desktop).
- Don't use `disabled` on submit buttons while pending (it removes them from the a11y tree in some screen readers). Use `aria-disabled` plus a guard.
- Don't introduce a dark theme half-way. It is either a complete token set or nothing (Q4).
- Don't let Tailwind utility classes creep into admin markup (except `sr-only`).

---

## 5. Open questions (with recommended defaults)

| # | Question | Why it matters | Default if unanswered |
|---|---|---|---|
| **Q1** | **Product "Rating" and "Review count" are typed in by hand and shown on the PDP. Are there real reviews behind these numbers?** | Fabricated ratings are deceptive (A2) and carry legal and trust risk. | **Hide both fields in the editor and stop showing them on the PDP until a real review system exists.** If the owner has genuine reviews from WhatsApp or Daraz, keep the fields but add the hint "Enter only real customer ratings you can show if asked." |
| Q2 | Should a WhatsApp action appear next to customer phones (O4)? | It matches how Pakistani COD orders are confirmed. | Yes, show both Call and WhatsApp. |
| Q3 | Is the store's sender address (for the "From" block on the print slip) the Peshawar address in `siteConfig`? | It makes the slip courier-ready. | Use the `siteConfig` address and phone. |
| Q4 | Is dark mode needed? | It adds a full second token set and its QA. | Not in v1. Tokens are ready for it later. |
| Q5 | Is Urdu (RTL) planned for the admin? | It affects logical properties and font choice. Plex Sans has no Urdu; Noto Nastaliq Urdu would be needed. | English only. Still use logical CSS properties (`margin-inline`, `inset-inline`) so RTL stays possible. |
| Q6 | Approve the optional behaviour changes O1–O9, O12? | Each is small, but each changes behaviour. | Approve all of them. O1 is strongly recommended. |

---

## 6. Validation after launch

- **Task test with the owner, on their own phone (30 minutes, 5 tasks):** find all pending orders; confirm one; copy the shipping details and send them to the courier; mark an order shipped; change a product's stock and main photo. Measure completion, taps and hesitations. Target: all tasks done without help, and confirming an order takes 2 taps or fewer from the list.
- **Signals to watch:** the age of the oldest pending order (it should fall once A1 is fixed), the number of `?error=` redirects per week (a proxy for form friction), and support requests from the owner.
- **Limitations:** this is an expert review of the code. I did not watch the owner use the admin, and the mobile layout was not checked on a device. Phase 7 and the task test close that gap.
