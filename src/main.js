import * as THREE from 'three/webgpu';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Pane } from 'tweakpane';
import Stats from 'stats-gl';

import { uProgress, positionNode, colorNode } from './shaders/plane.js';

export default class Sketch {
	constructor() {
		// Sizes
		this.sizes = {
			width: window.innerWidth,
			height: window.innerHeight,
		};
		// Init Renderer (WebGPU with automatic WebGL2 fallback)
		this.canvas = document.querySelector('canvas.webgl');

		this.renderer = new THREE.WebGPURenderer({
			canvas: this.canvas,
			antialias: true,
		});
		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

		// Init scene
		this.scene = new THREE.Scene();

		this.addCamera();

		this.addControls();

		this.addMesh();

		this.addDebug();

		this.addStats();

		// Init values
		this.timer = new THREE.Timer();

		// Bind handlers once so they can be removed in destroy()
		this.onResize = this.resize.bind(this);
		this.onContextLost = this.onContextLost.bind(this);
		this.onContextRestored = this.onContextRestored.bind(this);
		this.render = this.render.bind(this);

		// Resize
		window.addEventListener('resize', this.onResize);

		// Handle context loss and restore (only fires on the WebGL2 fallback backend)
		this.canvas.addEventListener('webglcontextlost', this.onContextLost);
		this.canvas.addEventListener('webglcontextrestored', this.onContextRestored);

		this.init();
	}

	async init() {
		// WebGPU device acquisition is async; wait for it before rendering
		await this.renderer.init();

		const backend = this.renderer.backend.isWebGPUBackend ? 'WebGPU' : 'WebGL2';
		console.log(`Renderer backend: ${backend}`);

		// Use setAnimationLoop for cleaner render loop (XR-ready)
		this.renderer.setAnimationLoop(this.render);
	}

	addControls() {
		this.controls = new OrbitControls(this.camera, this.canvas);
		this.controls.enableDamping = true;
	}

	addCamera() {
		this.camera = new THREE.PerspectiveCamera(
			70,
			this.sizes.width / this.sizes.height,
			0.01,
			10
		);
		this.camera.position.z = 1;
	}

	addMesh() {
		this.geometry = new THREE.PlaneGeometry(1, 1, 1, 1);

		// Node material driven by the TSL graph in shaders/plane.js
		this.material = new THREE.MeshBasicNodeMaterial({
			side: THREE.DoubleSide,
		});
		this.material.positionNode = positionNode;
		this.material.colorNode = colorNode;

		this.mesh = new THREE.Mesh(this.geometry, this.material);
		this.scene.add(this.mesh);
	}

	addStats() {
		this.stats = new Stats({
			trackGPU: false,
			trackCPU: true,
		});
		document.body.appendChild(this.stats.dom);
	}

	addDebug() {
		this.pane = new Pane();
		this.pane.addBinding(uProgress, 'value', {
			label: 'uProgress',
			min: 0.1,
			max: 10,
			step: 0.001,
		});

		// Renderer info monitoring
		this.rendererInfo = {
			drawCalls: 0,
			triangles: 0,
			geometries: 0,
			textures: 0,
		};
		const infoFolder = this.pane.addFolder({ title: 'Renderer Info' });
		infoFolder.addBinding(this.rendererInfo, 'drawCalls', { readonly: true, label: 'Draw Calls' });
		infoFolder.addBinding(this.rendererInfo, 'triangles', { readonly: true, label: 'Triangles' });
		infoFolder.addBinding(this.rendererInfo, 'geometries', { readonly: true, label: 'Geometries' });
		infoFolder.addBinding(this.rendererInfo, 'textures', { readonly: true, label: 'Textures' });
	}

	addAnim(delta) {
		// Use delta for frame-rate independent animation
		// Example: this.mesh.rotation.x += 1.0 * delta;
	}

	resize() {
		// Update sizes
		this.sizes.width = window.innerWidth;
		this.sizes.height = window.innerHeight;

		// Update camera
		this.camera.aspect = this.sizes.width / this.sizes.height;
		this.camera.updateProjectionMatrix();

		// Update renderer
		this.renderer.setSize(this.sizes.width, this.sizes.height);
		this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	}

	onContextLost(event) {
		event.preventDefault();
		console.warn('WebGL context lost. Waiting for restore...');
		this.renderer.setAnimationLoop(null);
	}

	onContextRestored() {
		console.log('WebGL context restored.');
		this.renderer.setAnimationLoop(this.render);
	}

	render() {
		this.timer.update();
		const delta = this.timer.getDelta();

		this.stats.begin();

		this.addAnim(delta);

		// Update controls
		this.controls.update();

		this.renderer.render(this.scene, this.camera);

		// Update renderer info in debug panel
		this.rendererInfo.drawCalls = this.renderer.info.render.drawCalls;
		this.rendererInfo.triangles = this.renderer.info.render.triangles;
		this.rendererInfo.geometries = this.renderer.info.memory.geometries;
		this.rendererInfo.textures = this.renderer.info.memory.textures;

		this.stats.end();
	}

	destroy() {
		// Stop render loop
		this.renderer.setAnimationLoop(null);

		// Remove event listeners
		window.removeEventListener('resize', this.onResize);
		this.canvas.removeEventListener('webglcontextlost', this.onContextLost);
		this.canvas.removeEventListener('webglcontextrestored', this.onContextRestored);

		// Dispose GPU resources
		this.scene.traverse((child) => {
			if (child.isMesh) {
				child.geometry.dispose();
				if (child.material.isMaterial) {
					child.material.dispose();
				}
			}
		});

		// Dispose controls, renderer, debug
		this.controls.dispose();
		this.renderer.dispose();
		this.pane.dispose();

		// Remove stats DOM
		document.body.removeChild(this.stats.dom);
	}
}

new Sketch();
