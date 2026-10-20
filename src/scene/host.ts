import { WebGPURenderer } from 'three/webgpu';
import { createScene } from './scene';

/** Hard cap on device pixel ratio: beyond this the cost grows quadratically for no visible gain. */
const MAX_DPR = 2;

export interface MeshHost {
  pause(): void;
  resume(): void;
  dispose(): void;
}

type State = 'running' | 'paused' | 'unsupported';

/**
 * Owns the renderer and the render loop for the persistent canvas.
 * The loop runs only while the tab is visible AND the canvas is on screen. The current state is
 * mirrored to `data-mesh` on the canvas so CSS, tests and the ops overlay (P5.5) can read it.
 */
export async function startMesh(canvas: HTMLCanvasElement): Promise<MeshHost> {
  const setState = (state: State) => {
    canvas.dataset.mesh = state;
  };

  const renderer = new WebGPURenderer({ canvas, alpha: true, antialias: false });
  await renderer.init(); // WebGPU where available, otherwise its WebGL 2 backend
  const mesh = createScene();

  const resize = () => {
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    renderer.setPixelRatio(Math.min(devicePixelRatio, MAX_DPR));
    renderer.setSize(width, height, false);
    mesh.resize(width, height);
  };
  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas);

  let visible = !document.hidden;
  let onScreen = true;
  let manuallyPaused = false;

  const sync = () => {
    const shouldRun = visible && onScreen && !manuallyPaused;
    renderer.setAnimationLoop(
      shouldRun
        ? (time: number) => {
            mesh.update(time / 1000);
            renderer.render(mesh.scene, mesh.camera);
          }
        : null,
    );
    setState(shouldRun ? 'running' : 'paused');
  };

  const onVisibility = () => {
    visible = !document.hidden;
    sync();
  };
  document.addEventListener('visibilitychange', onVisibility);

  const intersection = new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    sync();
  });
  intersection.observe(canvas);

  sync();

  return {
    pause() {
      manuallyPaused = true;
      sync();
    },
    resume() {
      manuallyPaused = false;
      sync();
    },
    dispose() {
      renderer.setAnimationLoop(null);
      document.removeEventListener('visibilitychange', onVisibility);
      resizeObserver.disconnect();
      intersection.disconnect();
      mesh.dispose();
      renderer.dispose();
    },
  };
}
