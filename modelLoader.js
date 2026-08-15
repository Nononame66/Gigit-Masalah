/* ==========================================================
   Gigit Masalah – Optional Custom Model Loader
   Lets you drop in your own .glb 3D files for specific fish or
   junk items later, without touching any other game code.

   HOW TO USE LATER:
   1. Put your .glb file in a folder in the repo, e.g. models/koi.glb
   2. Add a line below in CUSTOM_MODEL_PATHS, e.g.
        koi: 'models/koi.glb'
   3. That's it — the catch preview will automatically try to load
      it, and silently falls back to the built-in low-poly model
      if the file is missing or fails to load.
   ========================================================== */

import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const loader = new GLTFLoader();
const cache = {};

/**
 * Map of species/junk id -> path to a .glb/.gltf file (relative to index.html).
 * Leave empty (or comment out) for any id that should keep using the
 * built-in procedural low-poly model.
 */
export const CUSTOM_MODEL_PATHS = {
  // "Chitin on Crab" by dini.hadiarti, CC-BY-4.0
  // https://sketchfab.com/3d-models/chitin-on-crab-ff42c79384c04271aa97b72f384b304a
  kepiting: 'models/kepiting/scene.gltf',
};

/**
 * Loads (and caches) a .glb file, returning a ready-to-add THREE.Group.
 * Rejects if the file is missing/broken so the caller can fall back.
 */
export function loadCustomModel(path) {
  if (cache[path]) return cache[path];

  cache[path] = new Promise((resolve, reject) => {
    loader.load(
      path,
      (gltf) => resolve(gltf.scene),
      undefined,
      (err) => reject(err)
    );
  });

  return cache[path];
}

/**
 * Convenience helper: tries the custom .glb for this id (if configured),
 * otherwise resolves to null so the caller uses the procedural model.
 */
export async function tryLoadCustomModelFor(id) {
  const path = CUSTOM_MODEL_PATHS[id];
  if (!path) return null;
  try {
    const scene = await loadCustomModel(path);
    return scene.clone();
  } catch (e) {
    console.warn(`Custom model for "${id}" failed to load, using built-in model instead.`, e);
    return null;
  }
}
