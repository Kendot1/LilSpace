# Her Little Space — setup and architecture

## Run locally

Use Node.js 22.12+ and npm. Run `npm ci`, then `npm run dev` and open Vite's printed URL. `npm run build` checks TypeScript and writes production output to `dist/`; `npm run preview` serves it. Do not open `dist/index.html` directly.

A production preview is available at `http://127.0.0.1:4180` while its local process is running.

## Personalize

Edit `src/data/personal.ts`. Its `PersonalContent` interface covers name, greeting, occasion, letter, signature, biography, interests, dreams, favorite things/colors/flowers, portrait, gallery, reminders, and initial memories. Unprovided details stay blank; the fallback letter is labeled as an example.

Put supplied photos in `public/photos/` (create it as needed), reference `/photos/name.webp`, and supply descriptive alt text for portraits/gallery. For portable backups, configured memory photos must be JPEG, PNG, or WebP up to 2 MiB. See `PERSONALIZATION.md` for persistence details.

## Features

Responsive home and section navigation; about her with honest empty states; configurable gallery/lightbox; selectable gentle reminders; procedural carnation receive/replay interaction; browser-local memory creation, editing, confirmed deletion, optional photos and validated import/export; and a replayable coast → mountains → letter story. The story can be skipped, responds immediately to reduced motion, and works without audio.

## Structure

    src/
      main.tsx                  React entry
      App.tsx                   Experience entry export
      Experience.tsx            Sections and navigation
      experience.css            Responsive styles and tokens
      data/personal.ts          Typed editable personal content
      components/
        Memories.tsx            Memory editor, cards, backups
        Modal.tsx               Shared native dialog
        Scene.tsx               Lightweight fallback
        Surprise.tsx            Interruptible letter story
        surprise.css            Landscape styling
      lib/storage.ts            Persistence and backup validation
      visual/
        Island.tsx              Miniature island illustration
        Carnations.tsx          Lazy renderer and interaction
        createBouquet.ts        Procedural flower model
        useScrollStory.ts       Decorative scroll responses
        carnations.css          Bouquet styling
        gift-polish.css         Visual refinements
    tests/
      storage.test.ts            Storage unit tests
      bouquet.test.ts            Model unit tests
      e2e/                      Browser interaction, layout, Axe

## Design and technologies

The existing React 19, TypeScript, Vite, plain CSS, Lucide and lazy-loaded Three.js architecture is preserved. No Tailwind migration, animation library, backend, accounts, analytics or remote fonts were added.

Sage ground (#edf3ed), forest ink (#254d43), pine (#315f4f), sand (#e5ce9e) and paper (#fffdf3) ground the visual system. Georgia display/letter typography pairs with the system Trebuchet/Arial stack. The miniature island and flowers provide depth while ordinary semantic HTML carries the content. CSS/SVG handles the short landscape story with transform/opacity transitions and an immediate reduced-motion alternative.

## Verification commands

`npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e`.

Playwright uses installed Google Chrome and starts a fresh production preview on port 4173. Build first and keep that port free. It refuses existing servers so stale development pages cannot masquerade as production output.

Tests exercise navigation, reminders, surprise sequence/skip/replay, changing motion preferences, memory CRUD/persistence/import/export, keyboard dismissal/focus return, WebGL failure, CSS responses/computed layout, and layout at 320, 390, 768, 1440 and 1920px. Axe checks use WCAG 2/2.1 A and AA. Screenshots are saved to `test-results/`. Automated accessibility checks do not replace assistive-technology testing.

## Limits and privacy

Local memories do not sync between devices, browsers or origins. Storage can fill or be cleared. Backups contain unencrypted personal content and photos. No private-cloud storage or access controls are implemented. Anyone with access to a public static copy can read bundled content.

Three.js's optional engine chunk (~594 kB before gzip) produces a build-size warning. Artwork is procedural, not photographic. Real names, messages, photos, and memories still need to be supplied. No deployment or publishing has been performed.
