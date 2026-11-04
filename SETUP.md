# Her Little Space — setup and architecture

## Run locally

Use Node.js 22.12+ and npm. Run `npm ci`, then `npm run dev` and open Vite's printed URL. `npm run build` checks TypeScript and writes production output to `dist/`; `npm run preview` serves it. Do not open `dist/index.html` directly.

A production preview is available at `http://127.0.0.1:4180` while its local process is running.

## Personalize

Edit `src/data/personal.ts`. Its `PersonalContent` interface covers name, greeting, occasion, letter, signature, biography, interests, dreams, favorite things/colors/flowers, portrait, gallery, reminders, and initial memories. Unprovided details stay blank; missing letters show a clear empty state rather than a generic romantic substitute. Location/study fields and an optional separate surpriseMessage are also centralized here.

Put supplied photos in `public/photos/` (create it as needed), reference `/photos/name.webp`, and supply descriptive alt text for portraits/gallery. For portable backups, configured memory photos must be JPEG, PNG, or WebP up to 2 MiB. See `PERSONALIZATION.md` for persistence details.

## Reference-led UI flow

The UI draws on the observed flow of https://daikifujita.com/: spacious editorial composition, persistent 3D staging, restrained navigation, and shifting focal subjects while scrolling. Its artwork, copy, sound, loading gate, and portfolio content were not copied. `src/editorial.css` refines the surrounding sections; `worlds/editorial-story.css` stages readable typography without opaque cards; `worlds/story-camera.ts` owns reversible desktop/mobile composition rails. The reference was inspected after entering its loading screen, not inferred from static extraction.

## Scroll story

The default experience opens on the interactive La Union coast. Choose Follow the story for an optional native-scroll, sticky 3D love story connecting a symbolic Quezon City cityscape and Baguio pine landscape. Nine editable passages in `personal.story` speak from the male sender to the female recipient. A luminous thread grows between two stylized figures; scrolling brings them together in an imagined central garden. These are symbolic characters, not supplied likenesses, and the landscapes are not literal addresses or a geographic route. `personal.senderLocation` and `personal.connectionLetter` centralize the sender location and editable romantic ending. La Union remains her supplied current location and Baguio her study connection. No shared memories or promises are invented.

ScrollTrigger drives a continuous camera approach, thread reveal, and reversible movement of the lovers. Reduced motion retains a stable camera. Skip, chapter shortcuts, and Explore freely remain available. Free exploration keeps the earlier coast, road, study cabin, keepsake garden, and replayable gift.

## Features

World-first home with four explorable 3D destinations (La Union coast, imagined mountain journey, Baguio reading cabin, and separate keepsake garden); animated water/clouds, bounded camera controls, object inspection, and a hinged gift revealing flowers and a letter. Keyboard/touch controls below the canvas provide equivalent keepsakes when WebGL fails. Responsive section navigation; about her with honest empty states; configurable gallery/lightbox; selectable gentle reminders; procedural carnation receive/replay interaction; browser-local memory creation, editing, confirmed deletion, optional photos and validated import/export; and a replayable coast → mountains → letter story. The story can be skipped, responds immediately to reduced motion, and works without audio.

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
      worlds/
        WorldExperience.tsx      Semantic world and keepsake interface
        world-engine.ts         Renderer, camera, GSAP timeline, lifecycle
        createWorld.ts          Batched procedural environments and objects
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

The existing React 19, TypeScript, Vite, plain CSS, Lucide and lazy-loaded Three.js architecture is preserved. GSAP coordinates camera and gift animation. No Tailwind migration, backend, accounts, analytics or remote fonts were added. The established direct Three.js integration is retained rather than introducing a second renderer through R3F.

Sage ground (#edf3ed), forest ink (#254d43), pine (#315f4f), sand (#e5ce9e) and paper (#fffdf3) ground the visual system. Georgia display/letter typography pairs with the system Trebuchet/Arial stack. The large explorable worlds and flowers provide depth while ordinary semantic HTML carries the content. CSS/SVG handles the short landscape story with transform/opacity transitions and an immediate reduced-motion alternative.

## Verification commands

`npm run lint`, `npm run test`, `npm run build`, `npm run test:e2e`.

Playwright uses installed Google Chrome and starts a fresh production preview on port 4191. Build first and keep that port free. It refuses existing servers so stale development pages cannot masquerade as production output.

Tests exercise navigation, reminders, surprise sequence/skip/replay, changing motion preferences, memory CRUD/persistence/import/export, keyboard dismissal/focus return, WebGL failure, CSS responses/computed layout, and layout at 320, 390, 768, 1440 and 1920px. Axe checks use WCAG 2/2.1 A and AA. Screenshots are saved to `test-results/`. Automated accessibility checks do not replace assistive-technology testing.

## Limits and privacy

Local memories do not sync between devices, browsers or origins. Storage can fill or be cleared. Backups contain unencrypted personal content and photos. No private-cloud storage or access controls are implemented. Anyone with access to a public static copy can read bundled content.

Three.js's optional engine chunk (~606 kB before gzip) produces a build-size warning. Artwork is procedural, not photographic. Real names, messages, photos, and memories still need to be supplied. No deployment or publishing has been performed.
