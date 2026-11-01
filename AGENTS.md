# Project: Her Little Space

## Role

Act as a senior frontend developer, UI/UX designer, and creative developer.
Build a thoughtful, polished personal website as a gift for the recipient.
Use relevant frontend-design, accessibility, and visual-design skills when
available.

The website should feel like her own comforting corner of the internet:
a place that celebrates who she is, encourages her through nursing school,
and holds meaningful memories shared with her boyfriend.

## Personal details

Keep these details in one easy-to-edit configuration file:

- Name or nickname: [ADD NAME]
- Occasion, if any: [OPTIONAL]
- Personal message from her boyfriend: [ADD MESSAGE]
- Favorite colors, flowers, or things: [OPTIONAL]
- Shared memories and dates: [OPTIONAL]
- Photos: [OPTIONAL]
- Encouraging reminders: [OPTIONAL]

She is a nursing student studying in Baguio and is originally from La
Union. Use those details gently and respectfully throughout the experience.

Do not invent personal memories, achievements, dates, preferences, or
biographical details. Use clearly editable examples when real content has
not been provided.

## Product vision

Create a website she can enjoy more than once. It should have a lasting
purpose beyond the initial surprise:

- A welcoming space that feels like it belongs to her.
- Encouragement and gentle reminders for difficult or busy days.
- A place to revisit and create memories together.
- A celebration of her personality, dreams, and journey.
- A delightful surprise she can discover and replay.

The tone should be affectionate, sincere, and comforting. Avoid making
assumptions about her feelings or reducing her identity to being a nursing
student or someone's girlfriend.

## Creative direction

Use the warmth of La Union's coast and the cool, misty atmosphere of
Baguio's mountains as subtle visual inspiration. Bring them together in
a cohesive, imaginative world that feels calm, personal, and welcoming.

Explore a 3D or 3D-inspired visual style with soft depth, layered scenery,
gentle lighting, and playful details. The effect can be created with CSS,
SVG, illustrations, or lightweight 3D where appropriate.

Possible details include waves, pine trees, clouds, flowers, stars, and
small nursing-inspired accents. Use them with restraint. Avoid generic
dashboards, clutter, excessive hearts, and stock-looking illustrations.

## Core pages or sections

Choose a simple navigation and information structure that works well on
mobile. Sections may be combined if the experience feels better as one
cohesive page.

### 1. Home

- Welcome her by name with a short, warm greeting.
- Give her a clear path to her reminders, memories, and personal space.
- Include a small, inviting button for the surprise.
- Make the page feel welcoming when she returns after the first visit.

### 2. About Her

Create a customizable space celebrating her personality, interests,
dreams, and journey. Include only information provided by the user.

Allow personal details and photos to be added or updated through the
content configuration. Show a tasteful empty state when details are missing.

### 3. Gentle Reminders

Provide a comforting collection of short, editable reminders. Examples
might encourage her to rest, drink water, or be proud of her progress.

If reminders are interactive, make their behavior clear. Do not imply
that the site sends real notifications or tracks her wellbeing unless
those features are actually implemented and authorized.

### 4. Our Memories

Create a warm, easy-to-browse space for shared memories. Each memory can
include a title, date, short story, and optional photo.

Make adding or editing memories straightforward. Clearly explain how memory
storage works:

- For a simple first version, keep supplied memories in editable project
  content and allow optional browser-local additions.
- If browser-local storage is used, explain that entries remain on that
  browser and device, may be cleared, and do not automatically sync.
- Provide a simple export and import option for browser-local memories if
  implementing local creation.
- Do not present local storage as shared, private cloud storage.
- If the user needs both people to add memories from different devices,
  propose a suitable shared-storage approach before implementing it.

### 5. A Little Surprise

Include a special button that reveals a heartfelt message through a cute,
smooth animation. For example, a coastal scene could gently transition
into mountain scenery, followed by a letter, flowers, or stars.

The surprise should be replayable and remain enjoyable after the first
visit. It must work without audio.

## UX and accessibility

- Design mobile-first, then adapt gracefully to larger screens.
- Establish a clear visual hierarchy, readable typography, and comfortable
  spacing.
- Make navigation simple and touch targets easy to use.
- Use animation to add warmth without slowing down ordinary tasks.
- Respect `prefers-reduced-motion`; provide an immediate, meaningful
  alternative to animated reveals.
- Support keyboard navigation, visible focus indicators, semantic HTML,
  accessible names, and adequate color contrast.
- Keep text readable over illustrations and visual effects.
- Include helpful loading, error, and empty states when relevant.
- Do not rely on color, motion, or sound alone to communicate meaning.
- Do not autoplay audio. If optional audio is added, require user action
  and provide a visible mute control.

## Architecture

First inspect the existing project and follow its established conventions.
For a new project, prefer a lightweight stack such as React, TypeScript,
and Vite unless a simpler solution is more appropriate.

Keep responsibilities clear:

- **Content configuration:** personal details, messages, reminders, and
  initial memories in an easy-to-edit, typed format.
- **Pages or sections:** home, about her, reminders, memories, and surprise.
- **Reusable UI:** navigation, cards, buttons, dialogs, and empty states.
- **Visual experience:** decorative scene layers and surprise animation.
- **Storage:** a small, isolated interface for any browser-local memories,
  including validation and export/import where implemented.
- **Styles and design tokens:** colors, typography, spacing, and motion.
- **Assets:** optimized images, fonts, and illustrations.

Keep the first version simple. Do not add a backend, account system, or
external service unless the desired functionality requires it and the user
has agreed to that approach.

Use a 3D library only if it adds clear value. If used, load it efficiently,
clean up resources, and provide a lightweight fallback. CSS or SVG is
appropriate when it achieves the intended experience with less complexity.

## Performance and privacy

- Optimize for fast loading and smooth use on mid-range phones.
- Compress and appropriately size assets.
- Avoid large 3D models, unnecessary animation loops, and heavy
  dependencies.
- Lazy-load optional visual assets where useful.
- Avoid layout shifts.
- Treat photos, memories, and personal messages as private.
- Do not add analytics, tracking, or third-party services without a clear
  need and user approval.
- Do not upload personal content to an external service without permission.
- Explain that anyone with access to a publicly hosted static site may be
  able to view content included in it. Do not claim the site is private
  unless access controls actually provide that protection.

## Quality and verification

Before finishing:

- Run applicable build, lint, and type checks.
- Verify navigation, reminder interactions, memory creation or editing,
  export/import if present, the surprise, and replay.
- Check keyboard access and reduced-motion behavior.
- Inspect mobile and desktop layouts.
- Confirm the site remains usable when optional images or 3D effects are
  unavailable.
- Verify that personal content can be updated without editing UI code.
- Explain how memories are stored and what happens across devices.
- Fix visible layout, accessibility, and interaction issues.

Provide brief setup and personalization instructions, describe what was
tested, and identify any storage limitations. Do not publish or deploy the
website unless explicitly asked.


## Implementation stack

Follow the existing project's stack and conventions if it already exists.

For a new project, use:

- **React and TypeScript** for the interface and typed data models.
- **Vite** for development and production builds.
- **React Router** if separate routes improve the experience; otherwise, use a well-structured single-page layout.
- **Tailwind CSS** for all layout and styling, including responsive design, grids, flexbox, spacing, positioning, typography, and reusable component patterns.
- **CSS custom properties** integrated with Tailwind for centralized design tokens, including colors, typography, spacing, shadows, borders, and motion.
- **CSS animations or Motion for React** for purposeful transitions, hover effects, and interactive animations. Prefer native CSS for simple effects and Motion for complex interactions.
- **Supabase** for backend infrastructure, including PostgreSQL database, authentication when needed, and cloud storage for uploaded photos.
- **Supabase Row Level Security (RLS)** to protect personal content and ensure only authorized users can access or modify memories.
- **Supabase JavaScript Client** for database queries, authentication, and storage operations.
- **Vitest and React Testing Library** for focused behavioral tests.
- **ESLint and TypeScript checks** for code quality.

Use Three.js or React Three Fiber only if 3D materially improves the experience. Lazy-load it, clean up resources, and provide a lightweight fallback. Do not add heavy dependencies solely to make the website 3D.

## Suggested project structure

Adapt this structure to the project rather than creating unnecessary
folders or abstractions:

```text
src/
  app/           Application entry, layout, and routing if needed
  content/       Typed, editable personal details and initial content
  components/    Shared interface components
  features/      Home, about, reminders, memories, and surprise
  visual/        Decorative scenes, animation, and optional 3D
  storage/       Memory persistence and import/export
  styles/        Design tokens, global styles, and shared styling
  assets/        Optimized images, icons, and illustrations
  test/          Shared test setup where needed
```

Keep personal content separate from interface code. Use typed data models
and clear component boundaries. Avoid unnecessary global state,
dependencies, and backend infrastructure.

## Memory features for the first version

Implement local creation, editing, and deletion of memories. Each memory
may contain a title, date, short story, and optional photo. Include a
confirmation before deletion.

Provide export and import for local memories, including photos where the
chosen storage approach supports them. Validate imported data and handle
invalid files, storage failures, and storage limits gracefully.

Clearly explain in the interface that locally created memories stay on
that browser and device, do not automatically sync, and can be lost when
browser data is cleared. Follow the shared-storage guidance above if both
people need to add memories from different devices.

## Polish and endpoint quality

Treat every part of the experience as finished product work:

- Polish every page, section, button, form, transition, and animation.
- Design useful empty, loading, success, and error states where relevant.
- Keep navigation, visual language, spacing, and interaction behavior
  consistent across the site.
- Make common tasks comfortable on both mobile and desktop.
- Validate form inputs and imported data.
- If API endpoints are implemented, validate their inputs, handle errors
  clearly, and test their behavior. Do not add endpoints without a need.
- Review the complete experience and fix visible or functional issues
  before reporting the work as complete.