import { uniform, uv, vec3, vec4, sin, time, mix, positionLocal } from 'three/tsl';

/**
 * TSL shader graph for the plane mesh.
 * Exposes uniforms so they can be tweaked from the debug panel.
 */
export const uProgress = uniform(1.0);

// Vertex: pass local position through (default transform is applied by the material)
export const positionNode = positionLocal;

// Fragment: orange base tinted by a slow animated gradient driven by uProgress
const base = vec3(1.0, 0.5, 0.0);
const wave = sin(uv().x.mul(uProgress).add(time)).mul(0.5).add(0.5);
export const colorNode = vec4(mix(base, base.mul(0.4), wave), 1.0);
