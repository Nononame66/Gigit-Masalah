/* ==========================================================
   Gigitan Kadal 3D – Entry Point
   ========================================================== */

import { GameEnvironment }  from './environment.js';
import { PlayerController } from './playerController.js';
import { GameEngine }       from './gameEngine.js';
import { UIManager }        from './ui.js';
import { audio }            from './audio.js';
import { storage }          from './storage.js';

let env, playerController, engine, ui;
let lastTime = 0;

function init() {
  console.log('🎮 Gigitan Kadal 3D – Starting…');

  const container = document.getElementById('canvas-container');
  if (!container) { console.error('canvas-container not found'); return; }

  // 1. 3D Environment (voxel world)
  env = new GameEnvironment(container);

  // 2. Player controller
  playerController = new PlayerController(env);

  // 3. UI manager
  ui = new UIManager(() => engine);

  // 4. Game engine
  engine = new GameEngine(env, ui);

  // 5. Apply saved rod
  env.updateRodModel(storage.state.equippedRod);

  // 6. Audio unlock on first gesture
  const unlockAudio = () => {
    audio.init();
    ['click', 'keydown', 'touchstart'].forEach(ev =>
      window.removeEventListener(ev, unlockAudio)
    );
  };
  ['click', 'keydown', 'touchstart'].forEach(ev =>
    window.addEventListener(ev, unlockAudio)
  );

  // 7. Start loop
  requestAnimationFrame(animate);
}

function animate(now) {
  requestAnimationFrame(animate);
  const t  = now * 0.001;
  const dt = Math.min(t - lastTime, 0.1);
  lastTime = t;

  if (playerController && engine)
    playerController.update(dt, engine.state === 'IDLE');

  engine?.update(dt);
  env?.update(t, dt);
  env?.render();
}

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', init);
else
  init();
