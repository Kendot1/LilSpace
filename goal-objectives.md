# HER LITTLE SPACE
## Cinematic 3D Hero, Immersive Environments, and Interactive Storytelling

### PROJECT OBJECTIVE

Transform the existing Her Little Space website into a premium, cinematic, interactive 3D experience.

**Primary visual reference:** https://daikifujita.com/

Study the reference's 3D quality, environmental composition, camera movement, transitions, interactions, animation techniques, and integration between the 3D world and website interface.

I want to achieve a similar level of visual sophistication while creating an original experience centered around a personal digital sanctuary.

This is not an architectural studio website. It is a personal, immersive world created for my girlfriend.

The experience should connect three important concepts:

- **La Union:** Her current location, represented by a beautiful coastal environment.
- **Baguio:** Her study destination, represented by a peaceful mountain environment.
- **Their Little Space:** An imaginative personal world representing a place of comfort, memories, and affection.

The website should feel like entering a beautifully crafted 3D storybook.

The primary priorities are:

1. Exceptional 3D modeling and asset quality.
2. Beautiful, detailed environmental composition.
3. Cinematic camera movement and transitions.
4. Meaningful 3D object interactions.
5. A polished editorial website interface.
6. A cohesive personal experience across all sections.

Do not settle for basic Three.js primitive geometry or an unfinished low-poly diorama.

---

# PART 1. CINEMATIC INTERACTIVE 3D HERO

## 1. Inspect and prepare the existing 3D assets

Find the existing 3D models in the project folder.

Inspect all available:

- `.glb` and `.gltf` models.
- `.blend` files.
- Textures and material files.
- Environmental assets.
- Character models.
- Existing animations.
- Existing scene implementations.

Identify the central house, environment, and other important models.

If an existing model is worth preserving, retain its original architecture, geometry, materials, textures, and existing details while improving its presentation.

Do not unnecessarily replace good existing assets.

However, do not preserve poorly modeled or unfinished assets just because they already exist.

### Blender modeling workflow

Use Blender for creating or refining important 3D assets where available.

The preferred workflow is:

1. Create or source suitable models.
2. Refine their geometry, proportions, and silhouettes in Blender.
3. Add architectural and environmental details.
4. Apply high-quality materials and textures.
5. Configure UV maps and PBR materials.
6. Prepare models for real-time rendering.
7. Export optimized GLB/GLTF files.
8. Integrate them into the existing Three.js or React Three Fiber architecture.

Keep editable `.blend` source files organized in the project.

Use properly licensed external assets when they improve quality. Maintain a consistent visual style across every model.

Do not introduce paid assets or services without approval.

If Blender is unavailable, use the best available alternative and accurately report the limitation.

**Important:** The finished models must look substantially more detailed than the existing implementation. Do not construct the entire environment using cubes, spheres, cones, and cylinders.

## 2. Main 3D environment

Create a visually impressive, detailed environment centered around a beautifully modeled personal house or cottage.

The house should be the main visual centerpiece.

Its architecture should feel intentional, charming, and carefully crafted.

Include:

- Detailed roof geometry and roofing materials.
- Refined windows and window frames.
- Doors, handles, trims, and architectural decorations.
- Detailed exterior walls.
- Wooden structures and surface details.
- Interior lighting visible through windows.
- Balconies, stairs, railings, or other appropriate architectural elements.
- Carefully modeled surrounding vegetation.
- Natural terrain and pathways.
- Flowers, rocks, and environmental props.
- Distant landscape layers.
- Atmospheric depth.

Do not make the environment look like a flat rectangular platform with objects scattered across it.

Build natural terrain with meaningful elevation and spatial relationships.

## 3. Visual direction

Use a premium, stylized 3D art direction.

The environment should be dreamlike, peaceful, romantic, detailed, and visually rich.

It should feel like a world someone would genuinely want to explore.

### Color palette

Use a cohesive palette combining:

- Midnight and slate blues.
- Soft coastal blues.
- Ocean teal.
- Botanical and forest greens.
- Warm cream and ivory.
- Natural wood and earthy tones.
- Soft golden window lighting.
- Delicate icy-cyan highlights.
- Muted floral accents.

Adapt the lighting and palette according to each environment.

**La Union:** Warm coastal sunlight, ocean blues, soft golden highlights, sandy earth tones.

**Baguio:** Cool mountain atmosphere, deep pine greens, misty blue tones, warm interior lighting.

**Their Little Space:** A beautiful balance of warm lighting, natural greens, soft nighttime blues, and subtle magical accents.

Avoid excessive pink, hearts, purple gradients, and childish decorations.

## 4. Environmental atmosphere

Create a realistic yet stylized environment with:

- Detailed natural terrain.
- Layered foreground, middle ground, and background.
- Carefully modeled trees and vegetation.
- Soft natural lighting.
- High-quality shadows.
- Ambient occlusion where appropriate.
- Atmospheric depth.
- Subtle fog and environmental haze.
- Reflections on water.
- Moving clouds where appropriate.
- Natural environmental animation.
- Refined materials and textures.

Avoid washed-out haze, excessive darkness, heavy blur, flat lighting, and generic cloud graphics.

The main environment must remain crisp, visible, and visually impressive.

---

# PART 2. FIVE CINEMATIC CAMERA STAGES

Create five complete scroll-triggered camera transitions for the main 3D environment.

Each stage must have a distinct composition, elevation, distance, and focal point.

### Stage 1: A Little World

A cinematic three-quarter approach toward the central house and surrounding environment.

Introduce the world and establish its atmosphere.

The house should be clearly recognizable, with surrounding trees, terrain, and environmental details visible.

### Stage 2: A Peaceful View

Move toward a lower camera position that emphasizes the foreground, flowers, pathways, vegetation, and water features.

Show the depth and relationship between the environment and the house.

### Stage 3: Details All Around

Perform a diagonal camera rise across the roof layers and surrounding landscape.

Reveal the quality of the house modeling, roof materials, vegetation, pathways, terrain elevation, and small environmental objects.

This stage should showcase the actual detail of the 3D models.

### Stage 4: The Whole Picture

Move toward an elevated near-top-down perspective.

Reveal the overall layout of the environment and the relationship between its different elements.

Avoid making the scene look like a flat map.

### Stage 5: Our Little Space

Create the final hero composition.

Show most of the central environment prominently within the right 60% of the desktop viewport.

Leave sufficient space on the left for expressive editorial typography and supporting content.

The house should remain the visual centerpiece.

Avoid distant framing and excessive cropping.

### Scroll behavior

- One deliberate scroll gesture triggers one complete camera movement.
- Each movement lasts approximately 1.2 to 1.6 seconds.
- Wait for the current movement to finish before accepting another stage transition.
- Reverse scrolling reverses the camera sequence.
- Prevent trackpad momentum from skipping multiple stages.
- Vary elevation, distance, and focal points.
- Keep at least half of the central environment visible throughout.
- Blend cursor-driven camera parallax with stage transitions.
- Avoid abrupt camera jumps.
- Allow natural page scrolling after the fifth stage.

Support mouse, touch, and keyboard navigation.

Keep water, vegetation, particles, and other environmental animations running while the camera rests.

Respect reduced-motion preferences.

---

# PART 3. CAMERA PARALLAX AND 3D INSPECTION

## 5. Cursor-driven camera parallax

Add noticeable but smoothly eased cursor-driven camera parallax.

Create a sense of depth by allowing the environment to respond naturally to pointer movement.

Use different parallax strengths for foreground, middle ground, and background elements.

Requirements:

- Smooth easing.
- No camera shaking.
- No uncontrolled rotation.
- No loss of the main composition.
- No interference with scroll-triggered transitions.
- Adapt or disable parallax on touch devices.

## 6. Interactive object inspection

When the user hovers over the central house or selected environmental objects, reveal a localized inspection effect.

Use:

- A feathered, irregular wireframe mask.
- Subtle icy-cyan or warm luminous highlights.
- Delicate architectural guide lines.
- Small brackets and anchor points.
- Fine outlines aligned with actual model geometry.
- Smooth appearance and disappearance.

The effect should reveal selected portions of the model rather than covering the entire environment.

It should feel like an elegant interactive inspection feature, not a technical CAD interface.

### Interactive objects

Implement meaningful interactions for:

**Flowers**
- Natural movement.
- Hover response.
- A small message or reminder when selected.

**Letters**
- Camera focus.
- Opening animation.
- Readable personal message.

**Photo frames**
- Display supplied photographs.
- Open into a larger presentation.

**Memory book**
- Open with an animation.
- Display saved memories.
- Allow navigation between entries.

**Gift box**
- React to selection.
- Open through a coordinated animation.
- Reveal the surprise message or keepsake.

**Stars and environmental markers**
- Reveal gentle reminders or personal messages.

Objects should feel tangible and integrated into the world.

Do not make every interaction a disguised ordinary button.

Provide accessible HTML alternatives for important content.

## 7. Custom interaction cursor

Create a refined custom cursor with contextual hover feedback.

Possible states:

- Explore.
- Inspect.
- Open letter.
- View photograph.
- Interact with keepsake.

Use smooth transitions and subtle visual feedback.

Ensure the cursor does not obstruct text or interfere with touch devices.

---

# PART 4. EDITORIAL HERO INTERFACE

## 8. Typography and layout

Design a distinctive editorial interface that complements the 3D environment.

Use:

- Expressive display typography.
- Elegant serif and sans-serif combinations.
- Selective italic words.
- Carefully chosen accent colors.
- Fine decorative rules.
- Generous spacing.
- Small contextual labels.
- Precise supporting text.
- Strong content hierarchy.

Avoid generic dashboard layouts, excessive rounded cards, and conventional SaaS styling.

The interface should feel like a premium digital storybook.

## 9. Stage-specific content

Each of the five camera stages should have a short headline and description.

The text should change naturally as the camera transitions.

Use warm, meaningful, personal language.

Keep all text editable in the central content configuration.

Do not invent names, personal memories, photographs, or relationship details.

Reveal the headline and description within approximately 0.25 to 0.4 seconds alongside the camera movement.

### Headline hover animation

On headline hover only, run a detailed 1.2 to 1.6-second scan across the letterforms.

Use:

- A luminous scanning band.
- Delicate outlines.
- Fine scan lines.
- Subtle highlights.
- Smooth easing.

Keep the words readable.

Treat the headline as one coherent animation. Do not restart the effect independently for every letter.

## 10. Navigation and Views panel

Include:

- A refined Her Little Space wordmark.
- Animated navigation hover states.
- A transparent Views panel.
- All five camera stages.
- An active-stage indicator.
- Keyboard-accessible stage controls.

The Views panel must remain accessible throughout all five hero stages.

Create a compact secondary information area containing:

- Current environment label.
- Short scene description.
- An Explore the World action.
- A slowly looping strip of environmental labels.

Possible labels:

- COASTAL MEMORIES
- MOUNTAIN AIR
- LITTLE MOMENTS
- A PLACE TO REST
- OUR LITTLE WORLD

Position interface elements carefully so they do not obstruct the house or important environmental details.

---

# PART 5. TWO DISTINCTIVE WEBSITE SECTIONS

Preserve the completed hero and its five camera stages.

After the fifth hero stage, the next downward scroll should naturally flow into the following sections.

These sections must continue the same visual story.

## 11. Section One: From Here to There

Create a spacious split composition.

Place a large, detailed 3D environmental visualization on the left and editorial content on the right.

The visualization should represent the connection between La Union and Baguio.

### Environmental composition

Create an original connected landscape that transitions from coastal scenery to mountain scenery.

Include:

- Detailed coastal terrain.
- Animated water and shoreline.
- Natural elevation changes.
- A connecting road or pathway.
- Pine trees and mountain vegetation.
- Layered distant mountain ranges.
- Environmental lighting transitions.
- Atmospheric depth.

Do not invent specific places she has visited.

### Progressive top-to-bottom reveal

As the user scrolls, reveal the environment progressively from top to bottom.

Use the following sequence:

1. Fine environmental outlines appear.
2. Terrain and major structures emerge.
3. Vegetation and architectural details appear.
4. Materials and textures develop.
5. Lighting, water, and atmosphere complete the environment.

Use aligned scanning boundaries and layered masks.

The result should feel like a conceptual illustration gradually becoming a fully rendered 3D world.

The reveal must be connected to scroll progress and reversible when scrolling upward.

Do not simply fade in one complete image.

### Supporting content

Organize the editorial content around three themes:

**La Union: Where She Is**

Represent the peaceful coastal atmosphere of her current location.

**Baguio: Where She Grows**

Represent her study destination and nursing journey through mountain scenery and a cozy study environment.

**A Place Between Us**

Introduce the imaginative personal world being created for her.

Keep the descriptions concise and editable.

Do not invent her school, academic achievements, routine, or personal experiences.

## 12. Section Two: Inside Our Little Space

Create an immersive section featuring an original 3D axonometric environment or miniature world layout.

This should represent their personal sanctuary, not a commercial building floor plan.

Create a coherent environment containing:

- A central house.
- A garden.
- A pathway.
- A peaceful resting area.
- A memory corner.
- A place for letters.
- A surprise or keepsake location.
- Trees, flowers, and environmental objects.

The environment should have consistent scale, detailed modeling, and thoughtful spatial relationships.

### Progressive assembly

As the user scrolls, assemble the world piece by piece.

Use this sequence:

1. Terrain boundaries appear.
2. Paths and landscape structures form.
3. The house and major architecture emerge.
4. Trees, flowers, and vegetation appear.
5. Furniture and environmental props appear.
6. Interactive keepsakes and memory locations appear.
7. Materials, lighting, and atmospheric effects complete the scene.

Use individually animated SVG paths, layered geometry, or actual 3D model components.

The world must genuinely assemble progressively.

Do not simply fade in a finished render.

Keep the animation reversible when scrolling upward.

### Interactive markers

Add selected markers that reveal concise descriptions when hovered or keyboard-focused.

Pair the environment with four themes:

**A Place to Rest**

The atmosphere and feeling of the environment.

**Little Details**

The flowers, objects, and things that make the world feel personal.

**Memories**

Photographs, letters, and keepsakes.

**Always Here**

Gentle reminders and personal messages.

Use delicate linework, warm highlights, and soft-white details against the environment.

Allow a brief pinned sequence if necessary, but release naturally once the drawing or environment is complete.

---

# PART 6. PERSONAL CONTENT AND INTERACTIONS

## 13. Personalization system

Keep personal information in a central editable configuration.

Reuse the existing configuration if one is already implemented.

Support:

- Name or nickname.
- Personal message.
- Favorites.
- Interests.
- Flowers.
- Dreams.
- Memories.
- Photographs.
- Gentle reminders.
- Surprise message.

Do not hardcode personal content across multiple components.

Do not fabricate personal information.

Use editable placeholders and graceful empty states.

## 14. Our Memories

Create a refined memory experience.

Each memory should support:

- Title.
- Date, if provided.
- Description.
- Optional photograph.
- Optional location.
- Personal note.

Allow users to create, edit, view, and delete memories.

Use local persistence for the first version unless an existing approved backend is already available.

Do not upload personal photographs or messages to external services without permission.

## 15. A Little Surprise

Create a cinematic, replayable 3D reveal.

Use a coordinated sequence:

1. The user discovers a gift box.
2. The camera moves closer.
3. The object responds to interaction.
4. The box opens.
5. Flowers, lighting, and particles appear.
6. A personal letter is revealed.
7. The final message appears.

The experience should feel intimate and memorable.

The message must remain accessible without audio or complex 3D interaction.

---

# PART 7. SOUND AND INTERACTION

## 16. Ambient audio

Create a subtle sound experience that matches the environments.

Possible sounds:

- Gentle coastal ambience.
- Soft ocean waves.
- Light wind.
- Quiet forest ambience.
- Subtle nighttime atmosphere.
- Soft camera transition sounds.
- Delicate interaction sounds.
- A gentle tonal cue when inspecting objects.

Use available connected audio tools if supported and authorized.

If an approved audio-generation tool is available, create original audio assets.

Otherwise, use legitimate local audio assets or implement the integration points and accurately report missing assets.

### Audio behavior

- Audio starts only after the visitor enables it.
- Include a clearly visible global sound toggle.
- Prevent overlapping hover sounds.
- Trigger transition sounds once per camera movement.
- Avoid repeated audio during continuous scrolling.
- Balance all volume levels.
- Support mute and unmute.
- Do not autoplay audio.

---

# PART 8. FOOTER AND WEBSITE INTEGRATION

## 17. Footer

Create an elegant closing section.

Include:

- A heartfelt closing headline.
- A short editable personal message.
- Her Little Space wordmark.
- Working section navigation.
- Copyright information.
- Global sound control.
- Back-to-top action.

The footer should feel like the final page of a beautifully designed digital storybook.

Do not invent contact details or unrelated business information.

## 18. Continuous scrolling experience

Integrate the hero and additional sections naturally.

Requirements:

- After the fifth hero stage, the next downward scroll enters the new sections.
- Returning upward restores the hero's stage interaction appropriately.
- Avoid conflicting scroll handlers.
- Avoid trapping the user in pinned sections.
- Keep transitions smooth and reversible.
- Extend the custom cursor and visual language throughout the page.
- Ensure every navigation link works.

---

# PART 9. TECHNICAL IMPLEMENTATION

## 19. Modeling and asset architecture

Inspect the existing project stack before making changes.

Use the existing Three.js or React Three Fiber architecture where appropriate.

Use Blender for modeling and refinement where available.

Organize assets and systems into:

- 3D environments.
- Models and asset loading.
- Materials and textures.
- Lighting and shadows.
- Camera and scroll stages.
- Environmental animation.
- Interactive objects.
- UI and typography.
- Scroll-triggered reveals.
- Audio management.
- Personal content.
- Storage and memory management.

Keep Blender source files and exported runtime models organized separately.

Do not put the entire experience inside one enormous component.

## 20. Performance

Optimize the experience without unnecessarily sacrificing model quality.

Implement:

- Lazy loading for environments.
- Optimized GLB/GLTF assets.
- Compressed textures where appropriate.
- Reusable geometries and materials.
- Controlled draw calls.
- Efficient animation loops.
- Adaptive rendering quality.
- Proper resource cleanup.
- Loading indicators.
- Graceful WebGL fallback.

Make sure the environment runs smoothly on ordinary desktop and mobile devices.

## 21. Accessibility and responsive behavior

Support:

- Desktop and mobile.
- Mouse and touch interactions.
- Keyboard stage navigation.
- Visible focus indicators.
- Accessible labels.
- Reduced-motion preferences.
- Readable text.
- Accessible alternatives to 3D content.
- Appropriate contrast.
- Accessible dialogs and interactions.

Do not place essential personal messages exclusively inside the 3D canvas.

---

# PART 10. IMPLEMENTATION AND VERIFICATION

## 22. Execution workflow

This is an implementation task, not a design proposal.

Do not stop after writing a plan or producing a static prototype.

### Phase 1: Audit

- Inspect the entire project.
- Identify the current 3D rendering architecture.
- Find existing models and textures.
- Evaluate model quality.
- Identify Blender availability.
- Inspect the current website layout.
- Review the reference website.
- Read relevant repository-local skills.
- Identify existing functionality that must be preserved.

### Phase 2: 3D asset development

- Establish the visual direction.
- Create or refine the central house.
- Develop detailed trees, flowers, vegetation, terrain, and props.
- Refine materials and textures.
- Prepare optimized GLB/GLTF assets.
- Organize Blender source files.

### Phase 3: Hero development

- Build the environment.
- Implement all five camera stages.
- Implement controlled scroll navigation.
- Add cursor parallax.
- Add interactive model inspection.
- Add object interactions.
- Implement typography and camera animations.
- Complete the hero interface.

### Phase 4: Additional sections

- Implement From Here to There.
- Implement Inside Our Little Space.
- Create the progressive environmental reveal.
- Integrate supporting editorial content.
- Complete the footer.

### Phase 5: Personalization and audio

- Connect the central content configuration.
- Implement memory management.
- Implement the surprise experience.
- Add audio controls and assets where available.

### Phase 6: Verification

Inspect the actual rendered website.

Test:

- All five camera stages.
- Camera transitions and reverse scrolling.
- Trackpad behavior.
- Cursor parallax.
- Model quality from multiple camera distances.
- Materials and lighting.
- Object interactions.
- Environmental animation.
- Progressive reveal sequences.
- Memory functionality.
- Surprise sequence.
- Audio controls.
- Footer navigation.
- Desktop and mobile layouts.
- Reduced-motion behavior.
- Loading and performance.

Run the available build, TypeScript, lint, and test commands.

Fix visual and functional problems before declaring the work complete.

Do not claim tests passed unless they were actually executed.

---

# FINAL QUALITY STANDARD

The finished website must feel like a premium, immersive 3D world created specifically for someone.

The highest priorities are:

1. **Detailed 3D models:** Beautifully crafted houses, trees, flowers, vegetation, terrain, and environmental objects. Use Blender-based modeling where appropriate.
2. **Environmental quality:** Natural composition, convincing depth, detailed materials, sophisticated lighting, and atmosphere.
3. **Cinematic presentation:** Five distinct camera stages, controlled scrolling, smooth transitions, and camera parallax.
4. **Meaningful interactions:** Tangible objects, inspection effects, photographs, letters, memories, and keepsakes.
5. **Professional website design:** Expressive typography, precise layouts, refined navigation, and responsive behavior.
6. **Personal storytelling:** La Union, Baguio, and Their Little Space must each feel distinct but belong to one cohesive experience.

Use https://daikifujita.com/ as the visual quality benchmark.

Do not copy its branding or content.

Do not settle for basic primitive models, unfinished low-poly assets, flat dioramas, or generic website layouts.

**The actual 3D model quality is the priority. Make the world visually impressive before adding unnecessary features.**

Implement everything in the existing project. Preserve working functionality, avoid destructive Git operations, and do not commit, push, or deploy without explicit permission.