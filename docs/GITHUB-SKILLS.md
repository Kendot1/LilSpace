# GitHub skills used for Her Little Space

These are agent guidance documents, not animation assets or runtime libraries. The website uses the project's installed Three.js package; no GitHub skill executes in a visitor's browser.

## Three.js Animation

Source: https://github.com/CloudAI-X/threejs-skills/tree/0e181866f095b5f06d005133876e926515390d95/skills/threejs-animation
Installed with Hermes Skills Hub; security scanner verdict SAFE.

Applied in src/visual/Carnations.tsx:
- AnimationClip and AnimationMixer for the bouquet handoff.
- QuaternionKeyframeTrack for coordinated rotation.
- Timer and MathUtils.damp for frame-rate-independent timing.
- Scrub the clip using scroll/receive progress; re-enable paused actions before replay.
- Stop actions, uncache mixer bindings, dispose timer/resources on unmount.
- Pause offscreen/hidden and show an immediate reduced-motion alternative.

## Three.js Materials

Source: https://github.com/CloudAI-X/threejs-skills/tree/0e181866f095b5f06d005133876e926515390d95/skills/threejs-materials
Installed with Hermes Skills Hub; security scanner verdict SAFE.

Applied in src/visual/createBouquet.ts and Carnations.tsx:
- Physical materials with roughness and sheen distinguish petals, wrapping, and satin.
- Matte Standard material for stems and leaves rather than unnecessary Physical shaders.
- Double-sided planar leaves remain visible during the handoff rotation.
- Opaque instanced petals avoid transparency sorting artifacts.
- Shared materials/geometries and explicit disposal keep resource ownership bounded.

## UI/UX Pro Max

Source: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill/tree/3a13158ff1f32156cbe144108de48eda2ecaed9a/.claude/skills/ui-ux-pro-max
The full package was blocked by the scanner. No force override was used. Only its pinned SKILL.md and linked quick-reference/pro-rules documentation passed an independent scan and were installed. Search scripts and design database are NOT installed or used.

Applied:
- Flower receipt has a semantic aria-pressed state, textual status, keyboard access, visible focus, and a touch-sized control.
- Mobile body-copy improvements and reserved status space.
- Batch layout reads before scroll style writes (useScrollStory.ts).
- Every section remains readable; motion does not gate navigation, forms, or memory actions.
- Reduced-motion and WebGL-failure browser coverage.

## Limits

The bouquet is original procedural geometry, not a scan, purchased model, skeletal hand rig, or motion-capture animation. Installing skills does not supply those assets. No personal photos or memories were uploaded. No deployment was performed.

Run verification from the project root:

    npm run build
    npm run lint
    npm test
    npm run test:e2e
