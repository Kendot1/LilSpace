# Her Little Space — Website Development Skills

The specialized, repository-local skills live in `.agents/skills/`. They are portable Agent Skills packages intended for Codex discovery when working inside this repository. No app code, dependencies, or deployment settings were changed for this setup.

## Responsibilities and when to load

- `design-taste-frontend` — visual identity, distinctive art direction, layout/type choices, anti-template review, and visual critique. Use for new or redesigned public-facing pages. Source: [Leonxlnx/taste-skill](https://github.com/Leonxlnx/taste-skill).
- `ui-ux-pro-max` — UI/UX, responsive patterns, accessibility, design systems, and searchable design intelligence. Use for interface design, UX audits, token systems, or targeted usability decisions. Includes local data and Python search script. Source: [nextlevelbuilder/ui-ux-pro-max-skill](https://github.com/nextlevelbuilder/ui-ux-pro-max-skill).
- `three-best-practices` — Three.js rendering, WebGL/WebGPU, shaders, assets, performance, lifecycle. `r3f-best-practices` — React Three Fiber/Drei guidance. Use only when 3D materially serves the experience. Selected alternative: [emalorenzo/three-agent-skills](https://github.com/emalorenzo/three-agent-skills).
- `gsap-*` — official GSAP instructions: core, timelines, ScrollTrigger, React, frameworks, plugins, utilities, and performance. Load only the narrow relevant skill(s), not GSAP by default. Source: [greensock/gsap-skills](https://github.com/greensock/gsap-skills).
- Frontend engineering — `01-frontend-architecture`, `02-react`, `03-nextjs`, `07-responsive-design`, `11-accessibility`, `17-frontend-performance`, and `55-frontend-testing`. Use the relevant subset for implementation and verification. Source: [JustineBijuPaul/frontend-ai-skills](https://github.com/JustineBijuPaul/frontend-ai-skills).

## Coordination

1. Start with the brief and existing code conventions. For substantial visual work, let Taste own concept, identity, typography, composition, and visual critique.
2. Use UI/UX Pro Max for flows, responsive/accessibility behavior, design-system consistency, and specific searchable recommendations. It informs usability without overriding approved art direction or project instructions.
3. Load Three.js/R3F only for purposeful 3D. Keep semantic content usable if WebGL fails; consider device performance and reduced motion.
4. Load only relevant GSAP specialties. GSAP owns GSAP implementation details; it does not require animation everywhere. Avoid competing engines on the same elements.
5. Frontend skills own architecture, stack-specific implementation, responsiveness, accessibility, and test strategy. Verify the rendered experience; compilation alone is not visual verification.
6. Resolve conflicts in this order: user/project instructions, verified requirements, accessible and performant behavior, chosen art direction, then optional skill suggestions. Do not force every skill into simple pages.

## Installed skill folders

All locations are repository-relative under `.agents/skills/`:

| Folder | Upstream | Responsibility |
|---|---|---|
| `design-taste-frontend/` | Leonxlnx/taste-skill | Art direction |
| `ui-ux-pro-max/` | nextlevelbuilder/ui-ux-pro-max-skill | UX and design intelligence |
| `three-best-practices/`, `r3f-best-practices/` | emalorenzo/three-agent-skills | Three.js and R3F |
| `gsap-core/`, `gsap-timeline/`, `gsap-scrolltrigger/`, `gsap-react/`, `gsap-frameworks/`, `gsap-plugins/`, `gsap-utils/`, `gsap-performance/` | greensock/gsap-skills | Motion |
| `01-frontend-architecture/`, `02-react/`, `03-nextjs/`, `07-responsive-design/`, `11-accessibility/`, `17-frontend-performance/`, `55-frontend-testing/` | JustineBijuPaul/frontend-ai-skills | Frontend implementation |

The installed directories include actual upstream `SKILL.md` files and their corresponding supporting files/references. Original upstream numbering and frontmatter names are retained for frontend skills. Source Git metadata and unrelated upstream repository contents are not included.

## Requirements and limitations

- The skill instructions add no app runtime packages. Add dependencies only if a later website task requires them and project policy permits.
- UI/UX Pro Max search requires Python 3.x and no extra Python packages. Run from the repository root, for example: `python .agents/skills/ui-ux-pro-max/ui-ux-pro-max/scripts/search.py "portfolio mobile typography" --domain typography` (Windows), or `python3` on Unix. `--persist` writes design-system files; inspect existing files before invoking it.
- Taste v2 is marked experimental upstream. Its optional browser workflow requires Node.js 22+ and Chrome/Edge/Chromium. Optional asset workflows may require network. No dependencies were installed here.
- GSAP, R3F, Drei, and Lenis are not installed by these skills. The current application already has `three`; use project dependency/version checks before adding anything.
- Codex CLI/IDE must support Agent Skills and be launched with this repository as its working project. The expected project path is `.agents/skills/<folder>/SKILL.md`. This Hermes session cannot prove Codex-runtime discovery; test it in a fresh Codex session here.
- The requested `SoftwareInFocus/threejs-skills` exists, but inspected content was chiefly broad prompt/workflow, web-design, and game material rather than focused Three.js/R3F engineering. It was not installed; the selected alternative has substantive Three.js/R3F optimization rules and references.
- Frontend AI Skills has a broad catalogue; selected distinct architecture, React/Next, responsive, accessibility, performance, and testing modules to reduce overlap. These are vendored snapshots and should be updated deliberately against upstream.

## Verification

- Verified selected upstream repositories were accessible and their actual skill directories cloned before copying.
- Confirmed the installed set consists of non-empty skill files; UI/UX's search script/data and Three.js/R3F rule trees are included.
- Checked skill frontmatter for name collisions and preserved source names. Some upstream skills reference optional sibling modules outside this curated subset; consult upstream when such a link is needed.
- Repository-local paths were used; no global or user-level Codex directories were written.
- Remaining verification: Codex-specific automatic discovery requires opening/reloading the repository in Codex. This could not be tested from the current Hermes runtime.

## Invocation

In Codex, work inside this repository and request relevant skills by `$skill-name`, such as `$design-taste-frontend`, `$ui-ux-pro-max`, `$three-best-practices`, `$gsap-scrolltrigger`, or `$02-react`. Codex may also select a skill automatically by description. If unavailable, check support for repository-local `.agents/skills/` and reload repository context; do not copy skills globally.
