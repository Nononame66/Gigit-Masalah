/* ==========================================================
   Gigit Masalah – Entry Point
   ========================================================== */

import { GameEnvironment }  from './environment.js';
import { PlayerController } from './playerController.js';
import { GameEngine }       from './gameEngine.js';
import { UIManager }        from './ui.js';
import { audio }            from './audio.js';
import { storage }          from './storage.js';

let env, playerController, engine, ui;
let lastTime = 0;
let gamePaused = true; // starts true — Main Menu is shown first

function init() {
  console.log('🎮 Gigit Masalah – Starting…');

  const container = document.getElementById('canvas-container');
  if (!container) { console.error('canvas-container not found'); return; }

  // 1. 3D Environment (voxel world) — builds & renders immediately so it's
  //    visible animating behind the Main Menu ("Display pra Game")
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

  // 8. Menus (Main Menu, Pause Menu, shared Settings/Credits)
  setupMenus();
}

/* -------- Post-menu game start sequence (profile setup, popups) -------- */
function startGameFlow() {
  const challengeModal = document.getElementById('modal-challenge');
  const showChallenge = () => {
    if (!challengeModal) return;
    setTimeout(() => challengeModal.classList.remove('hidden'), 500);
  };

  if (!storage.hasProfile()) {
    setTimeout(() => {
      ui.openProfileSetup();
      document.getElementById('btn-save-profile')?.addEventListener('click', showChallenge, { once: true });
    }, 500);
  } else {
    ui.showAlert(`Selamat datang lagi, ${storage.state.playerName}! 🎣`, '👋');
    showChallenge();
  }
}

/* -------- Main Menu / Pause Menu / Settings / Credits wiring -------- */
function setupMenus() {
  const mainMenu  = document.getElementById('screen-mainmenu');
  const pauseMenu = document.getElementById('screen-pausemenu');
  const challengeModal = document.getElementById('modal-challenge');

  // Challenge popup close handlers (independent of menu state)
  if (challengeModal) {
    const closeChallenge = () => challengeModal.classList.add('hidden');
    document.getElementById('btn-close-challenge')?.addEventListener('click', closeChallenge);
    document.getElementById('btn-challenge-ok')?.addEventListener('click', closeChallenge);
    challengeModal.addEventListener('click', (e) => {
      if (e.target === challengeModal) closeChallenge();
    });
  }

  // "MULAI" vs "LANJUTKAN" depending on whether a profile already exists
  const startLabel = document.getElementById('btn-menu-start-label');
  if (startLabel) startLabel.textContent = storage.hasProfile() ? 'LANJUTKAN' : 'MULAI';

  const enterGame = () => {
    mainMenu.classList.add('hidden');
    gamePaused = false;
    startGameFlow();
  };
  document.getElementById('btn-menu-start')?.addEventListener('click', enterGame);

  document.getElementById('btn-menu-quit')?.addEventListener('click', () => {
    window.close();
    setTimeout(() => {
      ui.showAlert('Silakan tutup tab browser untuk keluar 👋', '🚪');
    }, 200);
  });

  // Pause button (in-game HUD)
  document.getElementById('btn-pause')?.addEventListener('click', () => {
    if (mainMenu && !mainMenu.classList.contains('hidden')) return; // menu already open
    gamePaused = true;
    pauseMenu.classList.remove('hidden');
    audio.playButtonClick();
  });

  document.getElementById('btn-pause-resume')?.addEventListener('click', () => {
    pauseMenu.classList.add('hidden');
    gamePaused = false;
    audio.playButtonClick();
  });

  document.getElementById('btn-pause-restart')?.addEventListener('click', () => {
    if (window.confirm('Restart game? Progress tersimpan tetap aman, hanya memuat ulang halaman.')) {
      window.location.reload();
    }
  });

  document.getElementById('btn-pause-mainmenu')?.addEventListener('click', () => {
    pauseMenu.classList.add('hidden');
    mainMenu.classList.remove('hidden');
    gamePaused = true;
    audio.playButtonClick();
  });

  // Shared Settings panel (openable from either menu)
  const syncSettingsUI = () => {
    const soundBtn = document.getElementById('settings-toggle-sound');
    if (soundBtn) {
      soundBtn.textContent = storage.state.soundEnabled ? 'ON' : 'OFF';
      soundBtn.classList.toggle('off', !storage.state.soundEnabled);
    }
    const isLow = storage.state.graphicsQuality === 'low';
    document.getElementById('settings-quality-high')?.classList.toggle('active', !isLow);
    document.getElementById('settings-quality-low')?.classList.toggle('active', isLow);
  };

  const openSettings = () => {
    audio.playButtonClick();
    syncSettingsUI();
    document.getElementById('modal-settings')?.classList.remove('hidden');
  };
  document.getElementById('btn-menu-settings')?.addEventListener('click', openSettings);
  document.getElementById('btn-pause-settings')?.addEventListener('click', openSettings);
  document.getElementById('btn-close-settings')?.addEventListener('click', () => {
    document.getElementById('modal-settings')?.classList.add('hidden');
    audio.playButtonClick();
  });

  document.getElementById('settings-toggle-sound')?.addEventListener('click', () => {
    storage.toggleSound();
    audio.updateSoundState();
    audio.playButtonClick();
    syncSettingsUI();
  });
  document.getElementById('settings-quality-high')?.addEventListener('click', () => {
    storage.setGraphicsQuality('high');
    env.setGraphicsQuality('high');
    audio.playButtonClick();
    syncSettingsUI();
  });
  document.getElementById('settings-quality-low')?.addEventListener('click', () => {
    storage.setGraphicsQuality('low');
    env.setGraphicsQuality('low');
    audio.playButtonClick();
    syncSettingsUI();
  });

  // Shared Credits panel
  const openCredits = () => {
    audio.playButtonClick();
    document.getElementById('modal-credits')?.classList.remove('hidden');
  };
  document.getElementById('btn-menu-credits')?.addEventListener('click', openCredits);
  document.getElementById('btn-pause-credits')?.addEventListener('click', openCredits);
  document.getElementById('btn-close-credits')?.addEventListener('click', () => {
    document.getElementById('modal-credits')?.classList.add('hidden');
    audio.playButtonClick();
  });

  // Apply the saved graphics setting immediately (renderer already exists)
  if (storage.state.graphicsQuality === 'low') env.setGraphicsQuality('low');
}

function animate(now) {
  requestAnimationFrame(animate);
  const t  = now * 0.001;
  const dt = Math.min(t - lastTime, 0.1);
  lastTime = t;

  if (!gamePaused) {
    if (playerController && engine)
      playerController.update(dt, engine.state === 'IDLE');
    engine?.update(dt);
  }

  // The world (day/night, water, weather) keeps animating even while paused
  // so the Main/Pause menu has a living background.
  env?.update(t, dt);
  env?.render();
}

if (document.readyState === 'loading')
  document.addEventListener('DOMContentLoaded', init);
else
  init();
