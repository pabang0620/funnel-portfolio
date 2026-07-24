# funnel-portfolio

**Ten internal business tools, rebuilt as one interactive demo. No login, no sign-up — open a module and use it.**

**▶ Live: https://funnel-portfolio.vercel.app/**

<!-- SCREENSHOT: WebGL landing page (the solar-system module navigator), 16:9, ~1200px wide -->

---

## Why this exists

For 2.5 years I was the only engineer at a **30-person performance marketing agency**. I built and operated everything the company ran on internally: the campaign landing page stack, the lead CRM the call team worked out of, the reporting dashboards management read every morning, and the ops tools that replaced the company's spreadsheets.

None of that code can be published — it belongs to the company. Which left the largest part of my work history with nothing anyone could actually look at.

So I rebuilt it. Same screens, same workflows, same data shapes, running entirely in the browser on generated sample data, with no authentication wall in front of it. Instead of describing the tools in bullet points on a CV, you can open one and use it: filter, sort, create, drag, upload, export.

This is a **reconstruction, not the original codebase**. No production code, no real customer data, and no employer or client names are present — identifying names were stripped from routes and demo data before publication.

---

## The ten modules

Every module is a full front-end application with its own routes, layout and seed data. Links open the live demo directly.

| Module | The problem it solved | What you can do in the demo |
|---|---|---|
| **[UTM Builder](https://funnel-portfolio.vercel.app/utm-builder)** | Campaign links were tagged by hand in spreadsheets, so channel reporting never reconciled | Guided UTM generation, a spreadsheet-style bulk sheet across **15+ ad channels** (Naver, Google, Meta, Kakao, TikTok, YouTube, Criteo…), reverse-parsing an existing tracking URL back into structured fields, saved generation history |
| **[HR Hub](https://funnel-portfolio.vercel.app/hr-hub)** | Headcount, org structure and employee records lived in one shared Excel file | **55 employee records** over a four-level org hierarchy (division → team → part), name/phone/initials search, multi-field filtering, a 13-column sortable table, an org-chart view, and Excel export |
| **[Ad Performance](https://funnel-portfolio.vercel.app/ad-performance)** | Weekly revenue reporting was assembled manually from per-channel exports | Executive and marketing reports with revenue trend charts, month-over-month deltas, revenue cross-tabbed across **4+ e-commerce sales channels**, calendar-scoped reporting periods, Excel import/export |
| **[Med Manager](https://funnel-portfolio.vercel.app/med-manager)** | Inbound leads from ad campaigns were handed to the call team as spreadsheet attachments | Lead database with search, ad-code creation, telemarketing call status tracking, pivot analysis and Excel export |
| **[Ad Content Storage](https://funnel-portfolio.vercel.app/ad-content-storage)** | Ad creatives piled up with no naming rules, so nobody could find or re-use past assets | Asset search and browse, upload into a folder tree, an analytics dashboard, and an admin area for the attribute/ad-code taxonomy |
| **[Ad Library Scraper](https://funnel-portfolio.vercel.app/ad-library-scraper)** | Competitor creative research was ad-hoc screenshotting into chat threads | Keyword sets, collected result listings, landing-URL tracking, bookmarks, and a curated reference board |
| **[File Hub](https://funnel-portfolio.vercel.app/file-hub)** | Company files were scattered across personal drives and messenger uploads | A Drive-style file browser with a folder tree, drag-and-drop, search, trash/restore, and an admin view |
| **[Meeting Room](https://funnel-portfolio.vercel.app/meeting-room)** | Room double-booking was resolved by shouting across the office | Calendar-based room reservation, an admin view for rooms and org membership, plus a separate mobile calendar and reservation list |
| **[Edu Platform](https://funnel-portfolio.vercel.app/edu-platform)** | Internal and client-facing training material had no single home or attendance record | Curriculum and lecture authoring, attendance tracking, student roster and profiles, assignments, notes, and a shared resource library |
| **[CS Manager](https://funnel-portfolio.vercel.app/cs-manager)** | Call recordings sat on individual machines with no shared index | Call-recording upload with multi-file input, a searchable file list, and user management |

Some secondary and admin screens are deliberately left as a **locked placeholder** rather than half-built — the demo tells you when a screen is not part of it instead of showing an empty page.

<!-- SCREENSHOT: HR Hub employee table (filters + sortable columns visible) -->
<!-- SCREENSHOT: Ad Performance executive report (charts + cross-tab table) -->
<!-- SCREENSHOT: UTM Builder sheet view (bulk generation grid) -->
<!-- SCREENSHOT / GIF: File Hub drag-and-drop between folders -->

---

## Scale of the original systems

> These numbers describe the **production systems at the agency**, not this demo. This repository is a front-end reconstruction with no backend and no real traffic.

- **~50,000 visitors/day (~1.5M/month)** across paid-campaign landing pages, deployed on AWS with Docker
- **200+ inbound leads/day** ingested by the internal CRM and routed to the call team
- **All 30 employees** using the internal platforms daily, replacing company-wide Excel workflows
- **10+ internal systems** owned end to end — requirements, UI, implementation, deployment, monitoring and support — by one engineer

---

## Tech stack, and why

**React 19 · TypeScript · Vite · Tailwind CSS · Radix UI**

**One SPA, ten applications.** Each module owns its own route subtree, its own layout and its own CSS theme scoped behind a wrapper class. These were separate products with separate visual identities, and merging them into one bundle should not have flattened them into one look — so styles stay namespaced per module rather than being unified.

**No backend, but a real data layer.** Every module ships JSON fixtures plus a `mockService` module that exposes the same function surface an API client would (`getDepartments`, `createDepartment`, `updateEmployee`…). State is held in memory and mutated immutably, so creates, edits and deletes persist for the session and reset on refresh. That keeps the demo hostable as static files while letting the UI code stay written the way it would be against a real API. Roughly **40 fixture files and ~23,000 lines of seed data** back the ten modules.

**Tables and charts chosen per use case.** TanStack Table + Virtual for the large sortable/filterable grids, Chart.js and Recharts for reporting views, D3 for the org chart, dnd-kit for drag interactions in the file browser and builder screens, SheetJS for the Excel import/export paths the originals were built around — Excel was the interchange format the business actually used, so removing it would have removed the point.

**A hand-written WebGL landing.** The entry page is a solar-system navigator where each planet is one module, driven by ~1,800 lines of raw WebGL (shaders, geometry, picking, interaction) rather than Three.js. The scene is a fixed set of textured billboards and a starfield, so a general-purpose 3D engine would have added bundle weight without adding capability. Keyboard (arrow keys / Enter / Escape) and touch navigation are both supported, and there is a plain card list underneath for anyone who would rather just click a name.

Repository size: **~150,000 lines across 670+ tracked source files.**

---

## Running locally

```bash
git clone https://github.com/pabang0620/funnel-portfolio.git
cd funnel-portfolio
npm install
npm run dev
```

Then open the URL Vite prints (`http://localhost:5173` by default).

```bash
npm run build     # type-check and produce a production build
npm run preview   # serve the production build locally
npm run lint      # ESLint
```

Requires Node 20+. No environment variables, no API keys, no database — the app runs entirely on bundled sample data.

---

## Disclaimer

All data in this repository is **fabricated sample data**. Employee records, leads, revenue figures, call logs, files and campaign results were generated for demonstration purposes and correspond to no real person, customer or company. No production code, database dump or proprietary asset from any employer or client is included, and no employer or client is named.

The in-app interface text is **Korean**, since the tools are reproduced as they were used. Module names, routes and navigation are in English, and the screens are structurally self-explanatory.

<!-- CONFIRM: add a LICENSE file before making the repo public. MIT is the usual choice for a portfolio repo;
     if you would rather nobody reuse the code, state "All rights reserved" here instead and skip the file. -->

<!-- CONFIRM: GitHub repo settings — set the About description to the one-liner at the top of this README,
     set the website field to https://funnel-portfolio.vercel.app/, and add topics:
     react, typescript, vite, webgl, dashboard, portfolio, demo -->

---

Built by **Wonho Lee** — full-stack engineer based in South Korea, working remotely with European teams.
📧 lwh970924@gmail.com · [GitHub](https://github.com/pabang0620)
