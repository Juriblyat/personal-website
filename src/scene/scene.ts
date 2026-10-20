import {
  BufferAttribute,
  BufferGeometry,
  Color,
  PerspectiveCamera,
  Points,
  PointsMaterial,
  Scene,
} from 'three/webgpu';
import { onThemeChange, readColor } from './tokens';

/**
 * Placeholder scene: a slowly turning point cloud in the accent colour.
 * P4.3 replaces this with the Mesh; the contract (camera, update, resize, dispose) stays.
 */
export interface MeshScene {
  scene: Scene;
  camera: PerspectiveCamera;
  update(seconds: number): void;
  resize(width: number, height: number): void;
  dispose(): void;
}

export function createScene(): MeshScene {
  const scene = new Scene();
  const camera = new PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 6;

  const count = 600;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    // Uniform points in a sphere shell.
    const u = Math.random() * 2 - 1;
    const a = Math.random() * Math.PI * 2;
    const r = 2 + Math.random() * 1.5;
    const s = Math.sqrt(1 - u * u);
    positions.set([r * s * Math.cos(a), r * u, r * s * Math.sin(a)], i * 3);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  const material = new PointsMaterial({ size: 0.04, transparent: true, opacity: 0.9 });
  const points = new Points(geometry, material);
  scene.add(points);

  const applyTheme = () => material.color.set(new Color(readColor('--color-accent')));
  applyTheme();
  const stopThemeWatch = onThemeChange(applyTheme);

  return {
    scene,
    camera,
    update(seconds) {
      points.rotation.y = seconds * 0.05;
      points.rotation.x = seconds * 0.02;
    },
    resize(width, height) {
      camera.aspect = width / Math.max(height, 1);
      camera.updateProjectionMatrix();
    },
    dispose() {
      stopThemeWatch();
      geometry.dispose();
      material.dispose();
    },
  };
}
