# PROJECT: HER LITTLE SPACE
## An Immersive 3D Personal Website and Interactive Digital Gift

# 1. ROLE AND RESPONSIBILITY

Act as a senior frontend developer, creative developer, 3D web developer, UI/UX designer, and motion designer.

Your responsibility is to design and fully develop **Her Little Space**, a personalized, immersive, interactive website created as a gift for the recipient.

This is not a conventional portfolio, landing page, or dashboard.

I want to create a small digital world that she can enter, explore, interact with, and revisit whenever she wants.

The experience should combine:

- Immersive 3D environments.
- Interactive objects and meaningful discoveries.
- Cinematic animations.
- Personal messages and letters.
- Shared memories.
- Encouraging reminders.
- A carefully designed user experience.

The website should feel affectionate, peaceful, imaginative, and personal.

Do not reduce her identity to being a nursing student or someone's girlfriend. Celebrate her as an individual while incorporating the personal details and experiences provided.

**This is an implementation task. Do not stop at planning, recommendations, wireframes, or mockups. Build the complete working experience.**

---

# 2. PERSONAL INFORMATION AND GEOGRAPHIC CONTEXT

Keep all personal information in one centralized, typed, easy-to-edit configuration file.

Use the following initial configuration:

```ts
export const personalContent = {
  name: "[ADD NAME OR NICKNAME]",
  occasion: "[OPTIONAL OCCASION]",
  personalMessage: "[ADD BOYFRIEND'S MESSAGE]",

  currentLocation: "La Union",
  studyLocation: "Baguio",
  fieldOfStudy: "Nursing",

  favorites: [],
  interests: [],
  flowers: [],
  dreams: [],
  memories: [],
  reminders: [],
  photos: [],

  surpriseMessage: "[ADD SURPRISE MESSAGE]",
};
```

You may expand the data structure when needed.

### Critical geographic distinction

She is currently in **La Union**, while **Baguio is where she studies nursing**.

Represent these accurately throughout the website.

- La Union represents her present location and familiar coastal surroundings.
- Baguio represents her academic journey and the mountain environment associated with her studies.
- Their Little Space represents a separate personal world created for their shared memories and relationship.

Do not portray Baguio as her current location.

Do not invent her school, campus, daily routine, favorite beach, personal achievements, or specific experiences.

Use supplied content only. Missing details must remain editable placeholders or tasteful empty states.

---

# 3. PRODUCT VISION

Build a website she will enjoy more than once.

It should provide five things:

1. A beautiful environment she can explore.
2. A personal space where she feels welcomed.
3. A collection of gentle reminders and encouragement.
4. An interactive place to revisit shared memories.
5. A special surprise she can discover and replay.

The experience should feel like a combination of:

- An interactive 3D storybook.
- A miniature explorable world.
- A personalized virtual environment.
- A collection of digital keepsakes.
- A heartfelt interactive gift.

Avoid making the website feel like a collection of unrelated sections.

Every environment, object, animation, and interaction should contribute to one cohesive experience.

---

# 4. PRIMARY CREATIVE DIRECTION: AN IMMERSIVE 3D WORLD

**This is one of the most important requirements of the project.**

I want the website to use actual 3D environments and interactive objects.

Do not limit the 3D implementation to a floating object, a decorative background, or a simple 3D model inside the hero section.

The recipient should feel like she is entering a small world.

Use the repository's Three.js and React Three Fiber skills extensively.

Prioritize:
- Actual 3D geometry.
- Realistic or carefully stylized materials.
- Environmental lighting.
- Depth and perspective.
- Natural environmental animation.
- Interactive objects.
- Smooth camera movement.
- Cinematic scene transitions.
- Meaningful spatial interactions.

A stylized, beautifully art-directed 3D world is preferable to an overly realistic but poorly optimized environment.

## 4.1 Visual Style

Explore a premium stylized 3D aesthetic.

The visual direction should combine:

- Soft natural lighting.
- Beautiful atmospheric depth.
- Carefully crafted environments.
- Warm coastal colors.
- Cool mountain colors.
- Natural materials.
- Detailed environmental objects.
- Gentle cinematic composition.
- Subtle magical elements.

Avoid:
- Generic low-poly environments without visual polish.
- Primitive placeholder geometry.
- Excessive hearts and pink decorations.
- Random floating objects.
- Overly childish illustrations.
- Excessive gradients.
- Flat images pretending to be interactive 3D environments.

The world should feel beautiful, intentional, and immersive.

---

# 5. THE THREE MAIN ENVIRONMENTS

Build three interconnected environments.

## WORLD 01: LA UNION, HER PRESENT PLACE

<Visual direction: A beautiful immersive coastal environment inspired by La Union.>

This is the opening environment.

Create an explorable coastal setting featuring:

- A detailed sandy shoreline.
- Animated ocean waves.
- Natural water movement.
- Shoreline foam and reflections.
- Coastal vegetation.
- Palm trees or other appropriate tropical plants.
- Moving clouds.
- Warm sunlight.
- Beautiful atmospheric lighting.
- Subtle flowers and environmental details.

The environment should feel peaceful and welcoming.

### Interactions

Allow her to interact with selected objects.

Examples:
- Click a flower to inspect it.
- Interact with a seashell to reveal a small message.
- Discover a hidden letter.
- Open a gift box.
- Interact with a photo frame.

The objects should feel integrated into the environment, not randomly placed.

### Camera

Use a cinematic starting camera position.

Allow controlled exploration through:
- Mouse movement.
- Touch gestures.
- Object selection.
- Gentle camera transitions.

Do not make the environment difficult to navigate.

The opening scene should immediately communicate that this is a special place made for her.

## WORLD 02: THE JOURNEY TO BAGUIO

<Visual direction: An immersive transition from the coastal environment into a mountain environment.>

Create a cinematic transition representing the journey from La Union to Baguio.

The transition should gradually change:

- Terrain.
- Vegetation.
- Lighting.
- Atmosphere.
- Temperature-inspired color palette.
- Environmental sounds, only if optional audio is implemented.

Explore a mountain road, distant hills, passing clouds, and gradually appearing pine forests.

The transition should feel like traveling from the coast toward the mountains.

Use controlled camera movement and environmental animation.

Do not make this a literal travel simulator. It is a visual storytelling experience.

## WORLD 03: BAGUIO, HER STUDY JOURNEY

<Visual direction: A peaceful, atmospheric mountain environment.>

Create a beautiful mountain-inspired environment representing where she studies nursing.

Include:
- Layered mountain scenery.
- Pine trees.
- Rolling mist.
- Moving clouds.
- Natural vegetation.
- Soft sunlight.
- A cozy study cabin or reading space.
- Books and stationery.
- Subtle nursing-inspired objects.

Create an inviting atmosphere that represents rest, perseverance, learning, and personal growth.

The nursing references should remain tasteful and secondary to her identity.

### Interactive study space

Allow her to interact with objects such as:

- A book containing encouraging messages.
- A desk with a letter.
- A flower.
- A small keepsake.
- A reminder board.

These objects should lead to useful website features.

Do not invent specific academic accomplishments or personal experiences.

---

# 6. THEIR LITTLE SPACE: A PERSONAL INTERACTIVE WORLD

Create a separate destination that represents their shared memories and relationship.

This should feel different from the coastal and mountain environments.

It can be a beautiful garden, a floating island, a peaceful clearing, or another imaginative environment that fits the overall art direction.

This world contains the personal features of the website.

## Interactive keepsakes

Represent selected features through actual 3D objects.

Examples:

| Object | Interaction |
|---|---|
| Photo frame | Opens a supplied photograph |
| Memory book | Opens the memories collection |
| Flower | Reveals a personal message |
| Letter | Unfolds and reveals a heartfelt letter |
| Gift box | Opens the special surprise |
| Star | Reveals a gentle reminder |

These objects must have meaningful behavior.

Do not create decorative interactions that have no purpose.

---

# 7. WEBSITE FEATURES AND FUNCTIONALITY

The 3D world must support the actual website features.

Do not hide important functionality behind complicated exploration.

Provide accessible navigation that allows her to reach every feature directly.

## 7.1 Home and Welcome

Create a welcoming introduction.

Include:
- Her name or nickname.
- A sincere welcome message.
- A brief explanation of her personal space.
- Navigation to the main environments.
- A visible way to explore.
- A special surprise entry point.

The home experience should remain welcoming on repeat visits.

## 7.2 About Her

Create a customizable personal space celebrating her:

- Personality.
- Interests.
- Favorite things.
- Dreams.
- Goals.
- Personal journey.

Use only information supplied through the configuration file.

Represent the information through thoughtful visual elements and interactive objects where appropriate.

Provide graceful empty states when information is missing.

## 7.3 Gentle Reminders

Create a beautiful interactive reminder experience.

Include editable messages such as:

- Take a moment to rest.
- You don't have to accomplish everything today.
- Remember to take care of yourself.
- Be proud of the progress you've made.
- It's okay to take things one step at a time.

These are sample messages and must remain editable.

Possible presentation:
- A reminder book.
- A message board.
- Floating cards.
- A small collection of notes.

Allow her to select or discover reminders.

Do not imply that the website monitors her wellbeing or sends actual notifications.

## 7.4 Our Memories

Create an interactive collection of shared memories.

Each memory may contain:

- Title.
- Date.
- Description.
- Optional photograph.
- Optional location.
- Optional personal note.

Represent memories as physical-looking keepsakes, photo frames, cards, or pages inside an interactive 3D memory book.

Support:
- Creating memories.
- Editing memories.
- Deleting memories.
- Viewing photographs.
- Browsing existing memories.
- Importing memories.
- Exporting memories.

Include confirmation before deleting an entry.

### Storage behavior

For the first version, implement browser-local memory creation and editing unless the existing project already has an approved shared-storage architecture.

Clearly explain:

- Memories created locally stay on that browser and device.
- They do not automatically synchronize between devices.
- Browser data can be cleared.
- Exported backups can be imported again.
- Local storage is not private cloud storage.

If photo storage requires IndexedDB rather than localStorage, use the more appropriate solution.

If shared memories across both people's devices are required, propose a Supabase-based approach before implementing it.

Do not silently upload personal content.

## 7.5 A Little Surprise

Create the most memorable interaction in the entire website.

This should be a carefully choreographed 3D experience.

Suggested sequence:

1. She discovers a gift box or special object.
2. The camera moves closer.
3. The object reacts to interaction.
4. The gift box opens with a smooth animation.
5. Flowers, light, or small environmental particles appear.
6. A letter is revealed.
7. Her boyfriend's personal message appears.
8. The environment transitions into a beautiful final composition.

Use GSAP and Three.js where appropriate.

The experience must:
- Be replayable.
- Work without audio.
- Respect reduced-motion preferences.
- Support keyboard interaction.
- Avoid excessive movement.
- Display the full message accessibly.

Do not use generic romantic text as a substitute for the supplied personal message.

---

# 8. 3D INTERACTION AND CAMERA REQUIREMENTS

The 3D world must feel responsive and interactive.

Implement appropriate behavior for:

- Object selection.
- Hover feedback.
- Object rotation.
- Camera movement.
- Scene transitions.
- Object inspection.
- Opening and closing objects.
- Revealing hidden content.
- Navigating between environments.

### Camera behavior

Use smooth, controlled camera movement.

The camera should:
- Move naturally between locations.
- Focus on selected objects.
- Return to the main environment.
- Avoid abrupt transitions.
- Avoid disorienting rotation.
- Preserve comfortable viewing angles.

Support desktop mouse interaction and mobile touch interaction.

Do not make free camera movement mandatory if it makes navigation difficult.

Use clear visual hints to communicate interactive objects.

### Environmental animation

Where appropriate, implement:

- Ocean wave movement.
- Water reflections.
- Moving clouds.
- Tree movement.
- Floating particles.
- Gentle atmospheric fog.
- Natural lighting transitions.
- Small environmental details.

Use actual environmental animation rather than relying on repetitive floating effects.

---

# 9. UI/UX AND NAVIGATION

The website should combine immersive 3D environments with a conventional, accessible interface.

Create:
- A minimal navigation system.
- Clear section destinations.
- Contextual interaction hints.
- Accessible buttons.
- Readable text panels.
- Responsive menus.
- Smooth transitions between interface states.

Important content must remain accessible even if 3D fails to load.

Provide a direct navigation alternative to every major environment and feature.

Avoid forcing the user to explore an entire 3D world just to read a message or find a memory.

The interface should feel like part of the same visual world.

---

# 10. ANIMATION AND MOTION DESIGN

Use the repository's official GSAP skills when appropriate.

Prioritize:
- Cinematic camera transitions.
- Object opening and closing.
- Scene transitions.
- Text reveals.
- Environmental animation.
- Scroll-triggered effects where appropriate.
- Smooth interface transitions.
- Hover interactions.
- Meaningful microinteractions.

Use GSAP for coordinated timelines and complex motion.

Use CSS animations or Motion for simpler interface interactions.

Avoid animation conflicts between GSAP, React, and Three.js.

Clean up animation timelines and event listeners when components unmount.

Respect `prefers-reduced-motion`.

When reduced motion is enabled, provide meaningful immediate transitions instead of removing functionality.

---

# 11. TECHNOLOGY STACK

Inspect the existing project first and preserve its established stack where possible.

For a new project, prefer:

| Purpose | Technology |
|---|---|
| Frontend | React |
| Language | TypeScript |
| Development | Vite |
| Styling | Tailwind CSS |
| Design tokens | CSS custom properties |
| 3D rendering | Three.js |
| React 3D integration | React Three Fiber |
| 3D utilities | Drei |
| Advanced animation | GSAP |
| UI animation | Motion for React |
| Icons | Lucide |
| Local photo and memory storage | IndexedDB |
| Optional shared backend | Supabase |
| Unit tests | Vitest |
| Component tests | React Testing Library |
| Code quality | ESLint and TypeScript |

Use React Three Fiber as the primary 3D integration where appropriate.

Do not install every technology simply because it appears in this list.

Select the smallest reliable stack that can deliver the intended experience.

---

# 12. REPOSITORY-LOCAL AGENT SKILLS

The repository contains specialized Codex skills under:

`.agents/skills/`

Consult:

`WEBSITE_DEVELOPMENT_SKILLS.md`

Read the relevant skill instructions before implementation.

Use the following specialists:

### Taste
Responsible for:
- Creative direction.
- Art direction.
- Composition.
- Typography.
- Visual identity.

### UI/UX Pro Max
Responsible for:
- Navigation.
- Usability.
- Design systems.
- Responsive layouts.
- Accessibility.

### Three.js Skills
Responsible for:
- 3D environments.
- React Three Fiber.
- Materials.
- Lighting.
- Camera systems.
- Environmental animation.
- WebGL optimization.

This skill is a core requirement of the project.

### GSAP Skills
Responsible for:
- Cinematic transitions.
- Animation timelines.
- ScrollTrigger.
- Object interactions.
- Coordinated motion.

### Frontend AI Skills
Responsible for:
- React architecture.
- Component implementation.
- Responsive frontend development.
- Performance.
- Code quality.
- Testing.

Use the relevant skills together without creating conflicting implementations.

If a referenced skill is missing or cannot be verified, report that fact and use reliable official documentation as a fallback.

---

# 13. ARCHITECTURE AND PROJECT ORGANIZATION

Keep responsibilities separated.

Suggested structure:

```text
src/
├── app/
│   ├── App.tsx
│   ├── routing/
│   └── providers/
│
├── content/
│   ├── personal-content.ts
│   ├── memories.ts
│   └── reminders.ts
│
├── components/
│   ├── navigation/
│   ├── interface/
│   ├── dialogs/
│   └── shared/
│
├── worlds/
│   ├── coastal/
│   ├── mountain/
│   ├── journey/
│   └── personal-space/
│
├── features/
│   ├── home/
│   ├── about/
│   ├── reminders/
│   ├── memories/
│   └── surprise/
│
├── three/
│   ├── components/
│   ├── objects/
│   ├── materials/
│   ├── lighting/
│   ├── camera/
│   └── effects/
│
├── animation/
│   ├── timelines/
│   ├── transitions/
│   └── interactions/
│
├── storage/
│   ├── memory-storage.ts
│   ├── indexed-db.ts
│   ├── import.ts
│   └── export.ts
│
├── styles/
│   ├── tokens.css
│   └── global.css
│
├── assets/
└── test/
```

Adapt this structure to the existing project.

Avoid unnecessary abstractions.

Personal content must remain separate from the UI and 3D implementation.

---

# 14. PERFORMANCE AND 3D OPTIMIZATION

Immersive visuals must not come at the expense of usability.

Optimize for mid-range mobile devices.

Requirements:

- Lazy-load 3D environments.
- Load only the active scene's expensive assets when possible.
- Use compressed GLTF/GLB assets.
- Optimize textures.
- Reuse geometry and materials.
- Avoid excessive draw calls.
- Avoid unnecessary render loops.
- Use appropriate shadow settings.
- Clean up WebGL resources.
- Dispose of unused textures, geometries, and materials.
- Use adaptive rendering quality when appropriate.
- Avoid unnecessary post-processing.
- Provide a lightweight fallback.
- Avoid large layout shifts.

Do not load every environment and asset simultaneously if doing so creates unnecessary resource consumption.

Use a sensible rendering strategy for mobile.

---

# 15. ACCESSIBILITY AND PRIVACY

### Accessibility

Support:
- Keyboard navigation.
- Semantic HTML.
- Accessible buttons and dialogs.
- Visible focus indicators.
- Screen-reader-friendly descriptions.
- Adequate color contrast.
- Readable typography.
- Reduced-motion preferences.
- Touch-friendly controls.

Important content must not exist exclusively inside a 3D canvas.

Provide accessible HTML alternatives for messages, memories, and interactions.

### Privacy

Treat personal messages, photographs, and memories as private.

Do not add analytics or tracking without approval.

Do not upload personal content to external services without permission.

Do not claim that content on a publicly accessible static website is private.

Never expose privileged backend credentials.

---

# 16. TESTING AND VALIDATION

Verify the actual experience.

### Functional testing

Test:
- Navigation.
- Scene transitions.
- Object selection.
- Object interactions.
- Camera movement.
- Personal configuration.
- Missing-content states.
- Reminder functionality.
- Memory creation.
- Memory editing.
- Memory deletion.
- Photo handling.
- Import and export.
- Surprise reveal.
- Surprise replay.

### 3D testing

Verify:
- All scenes load correctly.
- Models render correctly.
- Materials and lighting work.
- Camera transitions work.
- Object interactions work.
- Animation timelines do not conflict.
- Resources are properly cleaned up.
- Mobile rendering remains usable.
- Fallback behavior works.

### Accessibility testing

Verify:
- Keyboard navigation.
- Focus behavior.
- Reduced-motion behavior.
- Accessible alternatives to 3D content.
- Dialog accessibility.
- Mobile touch interactions.

### Technical testing

Run:
- Production build.
- TypeScript checks.
- ESLint.
- Vitest.
- React Testing Library tests.
- Browser-based tests when available.

Fix discovered issues before reporting completion.

Do not claim tests passed unless they were executed.

---

# 17. FINAL QUALITY REVIEW

Review the completed website from four perspectives.

### Creative Director
Does the world have a distinctive identity? Does every environment feel intentionally designed?

### 3D Developer
Are the environments immersive? Do the objects feel tangible? Are camera movements and animations smooth?

### UI/UX Designer
Can she comfortably explore the website? Are interactions understandable? Is the experience accessible?

### Senior Frontend Engineer
Is the implementation reliable, responsive, maintainable, and performant?

Identify weaknesses and improve them before finishing.

---

# 18. IMPLEMENTATION RULES

1. Build the complete website, not just a homepage.
2. Make 3D an integral part of the experience.
3. Use actual 3D objects and environments where appropriate.
4. Do not substitute static illustrations for required interactive 3D functionality.
5. Keep the geographic distinction between La Union and Baguio accurate.
6. Do not invent personal details.
7. Keep all personal content editable.
8. Preserve existing project functionality.
9. Do not install unnecessary dependencies.
10. Do not use paid APIs or unauthorized external services.
11. Do not perform destructive Git operations.
12. Do not commit or push changes without permission.
13. Do not publish or deploy the website.
14. Do not stop after planning.
15. Do not leave placeholder functionality while claiming the feature is complete.

Use sensible, reversible defaults for nonessential decisions.

If an essential decision requires my input, ask one focused question rather than making personal assumptions.

---

# 19. DEFINITION OF DONE

The project is complete when:

- The website has a cohesive, recognizable visual identity.
- La Union is represented as her current location.
- Baguio is represented as her study destination.
- The environments are actual interactive 3D experiences.
- The user can explore and interact with meaningful objects.
- The camera and scene transitions work.
- The personal space is implemented.
- The reminders are functional.
- The memories system is functional.
- The surprise is interactive and replayable.
- Personal content is centralized and editable.
- Desktop and mobile experiences are usable.
- Accessibility requirements are addressed.
- 3D performance is optimized.
- Fallbacks work when 3D is unavailable.
- Relevant tests pass.
- Storage limitations are documented.

---

# 20. FINAL DELIVERABLE

After implementation, provide:

1. Summary of the completed website.
2. Description of all implemented 3D environments.
3. List of interactive 3D objects and their behaviors.
4. Explanation of camera movement and scene transitions.
5. Website feature completion report.
6. Final project architecture.
7. Personalization instructions.
8. Memory storage and backup instructions.
9. Performance and accessibility improvements.
10. Actual testing results.
11. Remaining limitations and unfinished items.

**FINAL CREATIVE OBJECTIVE:**

I want her to open this website and feel like she has entered a beautiful little world created just for her.

She should be able to experience the coastal atmosphere of La Union, journey toward the mountains of Baguio, explore meaningful objects, discover personal messages, revisit shared memories, and receive a heartfelt surprise.

Don't build a normal website with a 3D background.

Build an interactive 3D experience that happens to be a website.

Start by inspecting the repository, reading the installed skills, and then proceed with the complete implementation.