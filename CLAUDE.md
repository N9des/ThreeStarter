# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is pnpm (pinned via `packageManager` in `package.json`; the README still shows `yarn`, prefer pnpm).

- `pnpm install` — Install dependencies
- `pnpm dev` — Start Vite dev server (accessible on LAN via `host: true`)
- `pnpm build` — Build to `dist/` (sourcemaps enabled)
- `pnpm preview` — Preview production build

No test runner or linter is configured. Prettier is a dependency with `.prettierrc` (tabs, single quotes, semicolons, ES5 trailing commas) but has no npm script — run it with `pnpm exec prettier --write <file>`.

## Template usage

This repo is a Three.js starter meant to be cloned and re-pointed. The README asks to do this before starting any new project:

```
git remote rm origin
git remote add origin <URL>
```

## Architecture

Three.js boilerplate on Vite using the **WebGPU renderer** and **TSL** (Three Shading Language) instead of raw GLSL. Everything lives in a single `Sketch` class; new work is typically added as methods on it or as new TSL modules in `src/shaders/`.

**Vite config** (`vite.config.js`): `root` is `src/`, so `src/index.html` is the entry and paths in it are relative to `src/`. `publicDir` is `static/` and files there are served from the site root (e.g. `static/images/x.svg` → `/images/x.svg`). `base: './'` produces relative asset URLs so `dist/` can be hosted from any subpath.

**Entry point** (`src/main.js`): imports Three from `three/webgpu` (not `three`), which exposes `WebGPURenderer` and the node materials. `Sketch` sets up the pipeline in its constructor — renderer (pixel ratio capped at 2), scene, `PerspectiveCamera`, `OrbitControls` with damping, a `PlaneGeometry` + `MeshBasicNodeMaterial` mesh, tweakpane debug panel (uniform bindings plus a read-only "Renderer Info" folder fed from `renderer.info` each frame), a stats-gl overlay, resize handling, and context-loss handlers. Because WebGPU device acquisition is async, the constructor calls `init()`, which awaits `renderer.init()` before starting `renderer.setAnimationLoop`. The renderer falls back to WebGL2 automatically when WebGPU is unavailable; the active backend is logged on startup. Frame timing uses `THREE.Timer` (call `timer.update()` then `getDelta()`); put per-frame animation in `addAnim(delta)`. Handlers are bound once in the constructor so `destroy()` can remove them.

**Shaders** (`src/shaders/`): written in TSL, imported from `three/tsl`. `plane.js` exports the uniforms (`uProgress = uniform(...)`) and the node graph (`positionNode`, `colorNode`) that `addMesh()` assigns onto the node material. Uniforms are plain objects with a `.value`, so tweakpane binds them directly in `addDebug()`. TSL compiles to WGSL on WebGPU and GLSL on the WebGL2 fallback, so there is no per-backend shader code. Note: `renderer.info.render` uses `drawCalls` (not `calls` as in `WebGLRenderer`).

**Styling**: `src/style.scss`, linked directly from `index.html` and processed natively by Vite via the `sass` dependency.

## Key Libraries

- **three** — 3D rendering via `three/webgpu` + `three/tsl` (`OrbitControls` imported from `three/examples/jsm`)
- **gsap** — Animation (installed but not yet used in the starter)
- **tweakpane** — Debug UI panel
- **stats-gl** — Performance overlay (FPS, CPU; GPU tracking off by default)
