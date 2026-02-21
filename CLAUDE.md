# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- `pnpm dev` — Start Vite dev server (accessible on LAN via `host: true`)
- `pnpm build` — Build to `dist/`
- `pnpm preview` — Preview production build

No test runner or linter is configured.

## Architecture

This is a Three.js starter/boilerplate using Vite with GLSL shader support.

**Vite config** (`vite.config.js`): Root is `src/`, static assets served from `static/`, build outputs to `dist/`. The `vite-plugin-glsl` plugin enables importing `.glsl` files directly.

**Entry point** (`src/main.js`): A single `Sketch` class that sets up the full Three.js pipeline — renderer, scene, camera, OrbitControls, a ShaderMaterial mesh, tweakpane debug panel (with renderer info monitoring), stats-gl overlay, resize handling, WebGL context loss recovery, and a `renderer.setAnimationLoop` render loop. The class includes a `destroy()` method for proper GPU resource cleanup. The render loop uses `clock.getDelta()` for frame-rate independent animation. The class is instantiated at module level.

**Shaders** (`src/shaders/`): GLSL vertex and fragment shaders imported as strings into ShaderMaterial. Use `precision mediump float;` for better mobile performance. Add new shaders here and import them in `main.js`.

**Styling**: `src/style.scss` — Sass is processed natively by Vite.

## Key Libraries

- **three** — 3D rendering
- **gsap** — Animation (available but not yet used in starter)
- **tweakpane** — Debug UI panel
- **stats-gl** — Performance monitoring overlay (FPS, CPU)
- **vite-plugin-glsl** — GLSL shader imports
