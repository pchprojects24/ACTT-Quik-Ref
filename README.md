# ACTT Quick Reference

A single-file, offline-first quick reference for shipboard sick bay use:
medications, clinical algorithms, and procedure checklists for advanced care
at sea.

> ⚠️ Educational quick reference only. Always follow local protocols, your
> scope of practice, and medical control — and verify every dose against the
> linked monographs before administration.

## What's inside

| Section | Count | Contents |
|---|---|---|
| **Medications** | 182 | Indications, dosage, preparation & administration, compatibility & stability, hazards, and at-sea pro tips for every med. 73 meds link to their full BC drug monograph PDF. |
| **Clinical Algorithms** | 29 | ACLS/BLS, cardioversion, STEMI/fibrinolysis (incl. TNK dosing charts), airway/RSI, DKA, sepsis, stroke, burns, tox, and more — with inline links to every medication mentioned. |
| **Procedures** | 29 | Step-by-step checklists mapped 1:1 to the Medical Directives list (core 001–021 plus Navy, Air Force, Special Operations, and Operations directives), each with an at-sea callout. |
| **Calculators & Scores** | 8 | Vasopressor drip-rate tables (epi/norepi/dopamine at the stocked concentrations, plus an any-drug drip calculator), Parkland burn fluids, ideal-body-weight tidal volumes, a TNK weight-band picker, and GCS / Wells (PE & DVT) / HEART score cards. |
| **Inventory & Expiry** | — | Device-local stock tracker: quantities, expiry dates with expired / expires-soon flags, filtering, and CSV export. Stored in the browser's localStorage only. |

Every medication, algorithm, procedure, and calculator card also has a 🖨
button that prints it as a clean black-on-white one-pager (works from dark
mode too) — handy for the sick bay wall.

## Files

- `index.html` — the entire app (UI, all content, and the embedded
  medication database in the `med-data` JSON block). No build step, no
  external dependencies.
- `BC drug monos/` — BC drug monograph PDFs plus
  `extracted_medical_directives.pdf` (the source directives list).
- `sw.js` — service worker: caches the app on first visit and pre-downloads
  every monograph PDF, so everything works with zero connectivity.
- `manifest.webmanifest` + `icons/` — lets the app be installed to a phone
  or tablet home screen as a standalone app.

## Offline behavior

On the first visit over HTTPS (e.g. GitHub Pages), the service worker
caches the app shell immediately and then quietly downloads all monograph
PDFs (~27 MB) in the background — do the first visit on good connectivity
(in port / on Wi-Fi). After that, the app, search, and every PDF work fully
offline. Page loads are network-first, so content updates are picked up
automatically whenever there *is* connectivity.

**When updating content:** bump the `CACHE` version string at the top of
`sw.js` (e.g. `actt-quik-ref-v1` → `-v2`) so devices that installed the app
refresh their cached PDFs and app shell.

## Updating content

- **Medications:** edit the JSON inside the `<script id="med-data">` block
  in `index.html`. Each entry needs `number`, `name`, and the five
  `sections`. Search indexing, count badges, and cross-links update
  automatically.
- **Monograph PDFs:** drop the PDF into `BC drug monos/` and add a
  `number: "path"` entry to `MONO_MAP` in `index.html`. Ready-to-uncomment
  entries already exist for cefuroxime, etomidate, gentamicin,
  hydromorphone, sugammadex, and digoxin — add the PDF and uncomment.
- **Algorithms / procedures:** add a `<details class="med">` card inside
  `#algoList` or `#procList` in `index.html`, following the existing
  structure. Use `<a class="med-link" data-med="EXACT MED NAME">` to link to
  a medication card.
