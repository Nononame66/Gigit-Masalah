/* ==========================================================
   Gigitan Kadal (Fish It Style) - Main Game Engine
   Minigame Rebalanced: Super Easy, Smooth & Satisfying
   ========================================================== */

import * as THREE from 'three';
import { audio } from './audio.js';
import { storage } from './storage.js';
import { FISH_SPECIES } from './voxelModels.js';

export const GAME_STATE = {
  IDLE: 'IDLE',
  AIMING: 'AIMING',
  CASTING: 'CASTING',
  WAITING: 'WAITING',
  SHAKING: 'SHAKING',
  BITING: 'BITING',
  REELING: 'REELING',
  CAUGHT: 'CAUGHT'
};

export class GameEngine {
  constructor(env, uiCallbacks) {
    this.env = env;
    this.ui = uiCallbacks;
    this.state = GAME_STATE.IDLE;

    // Cast Power physics
    this.castPower = 0;
    this.castPowerDirection = 1;
    this.castQuality = 'Meh..';

    // Bait & Bite timing
    this.waitTimer = 0;
    this.biteTimer = 0;
    this.targetBobberPos = new THREE.Vector3();

    // Shake button mechanic
    this.shakeCount = 0;
    this.maxShakes = 5;

    // Auto cast feature
    this.autoCastEnabled = false;
    this.autoCastDelay = 0;

    // Reeling Minigame parameters
    this.reelProgress = 0;
    this.reelTension = 0;
    this.playerBarPos = 30;
    this.playerBarVel = 0;
    this.targetZonePos = 30;
    this.targetZoneVel = 0.25;

    this.caughtFish = null;
  }

  startAiming() {
    if (this.state !== GAME_STATE.IDLE) return;

    if (!storage.useBait()) {
      this.ui.showAlert('UMPAN HABIS! Beli di Toko.', '⚠️');
      audio.playButtonClick();
      return;
    }

    this.state = GAME_STATE.AIMING;
    this.castPower = 0;
    this.castPowerDirection = 1;
    this.ui.onAimingStart();
  }

  cancelAiming() {
    if (this.state === GAME_STATE.AIMING) {
      this.state = GAME_STATE.IDLE;
      this.ui.onAimingEnd();
    }
  }

  releaseCast() {
    if (this.state !== GAME_STATE.AIMING) return;

    // Determine cast quality based on power
    if (this.castPower >= 99 && this.castPower <= 100) {
      this.castQuality = 'PERFECT!';
    } else if (this.castPower >= 86) {
      this.castQuality = 'Amazing!!';
    } else if (this.castPower >= 61) {
      this.castQuality = 'Great!';
    } else if (this.castPower >= 41) {
      this.castQuality = 'Good.';
    } else if (this.castPower >= 21) {
      this.castQuality = 'Fine.';
    } else {
      this.castQuality = 'Meh..';
    }

    this.state = GAME_STATE.CASTING;
    this.ui.onAimingEnd();
    this.ui.showCastQuality(this.castQuality);
    audio.playCast();

    const distance = 6 + (this.castPower / 100) * 18;
    const forwardX = Math.sin(this.env.player.rotation.y);
    const forwardZ = Math.cos(this.env.player.rotation.y);

    this.targetBobberPos.set(
      this.env.player.position.x + forwardX * distance,
      0,
      this.env.player.position.z + forwardZ * distance
    );

    this.castProgress = 0;
    this.castStartPos = this.env.getRodTipWorldPosition();
    this.env.bobber.position.copy(this.castStartPos);
    this.env.bobber.visible = true;
  }

  onBobberLanded() {
    this.state = GAME_STATE.SHAKING;
    this.env.bobberTargetY = 0;
    audio.playSplash();
    this.env.triggerSplash(this.targetBobberPos);

    // Initialize shake mechanic
    this.shakeCount = 0;
    this.maxShakes = 5 + Math.floor(Math.random() * 3); // 5-7 shakes
    this.ui.showShakeButton();

    const forwardX = Math.sin(this.env.player.rotation.y);
    const forwardZ = Math.cos(this.env.player.rotation.y);
    this.env.fishShadow.position.set(
      this.targetBobberPos.x + forwardX * 3,
      0.05,
      this.targetBobberPos.z + forwardZ * 3
    );
    this.env.fishShadow.visible = true;
  }

  onShakeClick() {
    if (this.state !== GAME_STATE.SHAKING) return;
    
    this.shakeCount++;
    audio.playButtonClick();
    
    if (this.shakeCount >= this.maxShakes) {
      // Shaking complete, start waiting for bite
      this.state = GAME_STATE.WAITING;
      this.ui.hideShakeButton();
      
      const baitType = storage.state.equippedBait;
      let biteDelay = 1.5 + Math.random() * 2.0;
      if (baitType === 'glowing') biteDelay *= 0.6;
      if (baitType === 'golden') biteDelay *= 0.4;
      
      this.waitTimer = biteDelay;
    } else {
      // Move shake button to new position
      this.ui.repositionShakeButton();
    }
  }

  triggerBite() {
    this.state = GAME_STATE.BITING;
    this.biteTimer = 2.5; // Generous 2.5 seconds hook window
    audio.playBiteAlert();
    this.env.triggerSplash(this.env.bobber.position);
    this.ui.showBiteAlert();
  }

  attemptHook() {
    if (this.state === GAME_STATE.BITING) {
      this.startReeling();
    } else if (this.state === GAME_STATE.WAITING) {
      this.resetToIdle('Tarik terlalu cepat!');
    }
  }

  startReeling() {
    this.state = GAME_STATE.REELING;
    this.ui.hideBiteAlert();
    this.ui.showReelingMinigame();

    this.caughtFish = this.rollFish();

    // Get current rod stats
    const rodData = this.ui.getCurrentRodStats();
    const control = rodData.control || 30;
    const resilience = rodData.resilience || 20;

    // EXTREME DIFFICULTY - Much harder than before!
    const rarityDifficulty = {
      Common: 1.8,      // Was 1.2
      Rare: 2.4,        // Was 1.6
      Epic: 3.2,        // Was 2.0
      Legendary: 4.5,   // Was 2.8
      Mythic: 6.0       // Was 3.5
    };
    
    const difficulty = rarityDifficulty[this.caughtFish.rarity] || 1.8;

    // Start with VERY LOW progress
    this.reelProgress = 8 + (control / 12); // Was 15 + control/8
    this.reelTension = 35; // Start with HIGH tension (was 20)
    this.playerBarPos = 40;
    this.playerBarVel = 0;
    this.targetZonePos = 35;
    
    // Fish moves MUCH FASTER
    this.targetZoneVel = 1.0 * difficulty; // Was 0.6 * difficulty
    this.fishDifficulty = difficulty;
    this.fishErraticTimer = 0;
    
    // Store rod stats for minigame calculations
    this.currentControl = control;
    this.currentResilience = resilience;
  }

  rollFish() {
    const bait = storage.state.equippedBait;
    let weights = { Common: 50, Rare: 30, Epic: 14, Legendary: 5, Mythic: 1 };

    if (bait === 'glowing') {
      weights = { Common: 30, Rare: 45, Epic: 18, Legendary: 6, Mythic: 1 };
    } else if (bait === 'golden') {
      weights = { Common: 10, Rare: 30, Epic: 38, Legendary: 18, Mythic: 4 };
    } else if (bait === 'magnet') {
      weights = { Common: 5, Rare: 15, Epic: 30, Legendary: 35, Mythic: 15 };
    }

    const totalWeight = Object.values(weights).reduce((a, b) => a + b, 0);
    let rand = Math.random() * totalWeight;
    let selectedRarity = 'Common';

    for (const [rarity, val] of Object.entries(weights)) {
      if (rand <= val) {
        selectedRarity = rarity;
        break;
      }
      rand -= val;
    }

    const pool = FISH_SPECIES.filter(f => f.rarity === selectedRarity);
    const species = pool[Math.floor(Math.random() * pool.length)] || FISH_SPECIES[0];

    const weight = parseFloat((species.minWeight + Math.random() * (species.maxWeight - species.minWeight)).toFixed(1));
    const price = Math.round(species.basePrice * (weight / species.minWeight));

    return {
      ...species,
      weight,
      price
    };
  }

  toggleAutoCast() {
    this.autoCastEnabled = !this.autoCastEnabled;
    return this.autoCastEnabled;
  }

  update(delta) {
    // Auto cast logic
    if (this.autoCastEnabled && this.state === GAME_STATE.IDLE) {
      this.autoCastDelay += delta;
      if (this.autoCastDelay >= 1.0) {
        this.autoCastDelay = 0;
        this.startAiming();
        // Auto release at random power (60-90%)
        setTimeout(() => {
          if (this.state === GAME_STATE.AIMING) {
            this.castPower = 60 + Math.random() * 30;
            this.releaseCast();
          }
        }, 200 + Math.random() * 300);
      }
    }

    if (this.state === GAME_STATE.AIMING) {
      this.castPower += this.castPowerDirection * 100 * delta;
      if (this.castPower >= 100) {
        this.castPower = 100;
        this.castPowerDirection = -1;
      } else if (this.castPower <= 0) {
        this.castPower = 0;
        this.castPowerDirection = 1;
      }
      this.ui.updateCastPower(this.castPower);
    }

    else if (this.state === GAME_STATE.CASTING) {
      this.castProgress += delta * 2.0;
      if (this.castProgress >= 1.0) {
        this.castProgress = 1.0;
        this.env.bobber.position.copy(this.targetBobberPos);
        this.onBobberLanded();
      } else {
        const p = this.castProgress;
        this.env.bobber.position.lerpVectors(this.castStartPos, this.targetBobberPos, p);
        this.env.bobber.position.y += Math.sin(p * Math.PI) * 4.0;
        this.env.updateFishingLine(this.env.bobber.position);
      }
    }

    else if (this.state === GAME_STATE.SHAKING) {
      // Just waiting for player to shake
      // Button click handled by onShakeClick()
    }

    else if (this.state === GAME_STATE.WAITING) {
      this.waitTimer -= delta;

      if (this.env.fishShadow.visible) {
        this.env.fishShadow.position.lerp(this.targetBobberPos, delta * 1.5);
      }

      if (this.waitTimer <= 0) {
        this.triggerBite();
      }
    }

    else if (this.state === GAME_STATE.BITING) {
      this.biteTimer -= delta;
      if (this.biteTimer <= 0) {
        this.resetToIdle('Ikan lepas!');
      }
    }

    else if (this.state === GAME_STATE.REELING) {
      this.updateReelingMinigame(delta);
    }
  }

  updateReelingMinigame(delta) {
    // Fish behavior - EXTREMELY ERRATIC MOVEMENT
    this.fishErraticTimer += delta;
    
    // VERY frequent direction changes
    const changeInterval = 0.4 / this.fishDifficulty; // Was 0.8
    if (this.fishErraticTimer > changeInterval) {
      this.fishErraticTimer = 0;
      this.targetZoneVel *= -1;
      
      // Rare fish jump VERY OFTEN
      if (this.fishDifficulty > 1.5 && Math.random() < 0.7) { // Was 0.5
        this.targetZonePos += (Math.random() - 0.5) * 50; // Was 35
      }
    }

    // Move target zone MUCH FASTER
    this.targetZonePos += this.targetZoneVel;
    if (this.targetZonePos > 70 || this.targetZonePos < 10) {
      this.targetZoneVel *= -1;
      this.targetZonePos = THREE.MathUtils.clamp(this.targetZonePos, 10, 70);
    }

    // Player bar physics
    const isPressing = this.ui.isReelInputActive();
    if (isPressing) {
      this.playerBarVel += 140 * delta;
      if (Math.random() < 0.2) audio.playReelTick();
    } else {
      this.playerBarVel -= 70 * delta;
    }

    this.playerBarVel *= 0.94;
    this.playerBarPos += this.playerBarVel * delta;

    if (this.playerBarPos < 0) {
      this.playerBarPos = 0;
      this.playerBarVel = 0;
    } else if (this.playerBarPos > 85) {
      this.playerBarPos = 85;
      this.playerBarVel = 0;
    }

    // Target zone MUCH SMALLER (very hard)
    const targetHeight = 12 + (this.currentControl / 5); // Was 18 + control/4
    const isInside = (
      this.playerBarPos >= (this.targetZonePos - 5) &&
      this.playerBarPos <= (this.targetZonePos + targetHeight)
    );

    if (isInside) {
      // Inside zone - progress increases VERY SLOWLY
      const progressSpeed = 18 + (this.currentControl / 8); // Was 25 + control/6
      this.reelProgress += progressSpeed * delta;
      
      // Tension decreases VERY SLOWLY
      const tensionDecay = 15 + (this.currentResilience / 5); // Was 20 + res/4
      this.reelTension = Math.max(0, this.reelTension - tensionDecay * delta);
    } else {
      // Outside zone - progress decreases MUCH FASTER
      this.reelProgress = Math.max(0, this.reelProgress - 20 * delta); // Was 12
      
      // Tension increases EXTREMELY FAST
      const tensionRate = (25 + this.fishDifficulty * 18) * (100 / (this.currentResilience + 50)); // Was 18 + diff*12
      this.reelTension += tensionRate * delta;
      
      // Visual warning when tension is high
      if (this.reelTension > 75) {
        this.ui.showTensionWarning();
      }
    }

    this.ui.updateReelHUD(this.playerBarPos, this.targetZonePos, this.reelProgress, this.reelTension);

    if (this.reelProgress >= 100) {
      this.onFishCaught();
    } else if (this.reelTension >= 100) {
      // LINE BREAK - Fish escapes!
      audio.playLineBreak();
      this.ui.showLineBreakEffect();
      this.resetToIdle('💔 TALI PANCING PUTUS! Ikan kabur!');
    }
  }

  onFishCaught() {
    this.state = GAME_STATE.CAUGHT;
    audio.playCatchFanfare();
    this.ui.hideReelingMinigame();

    // Perfect cast bonus
    let xpBonus = 0;
    let coinBonus = 0;
    
    if (this.castQuality === 'PERFECT!') {
      xpBonus = Math.round(this.caughtFish.xpReward * 0.5);
      coinBonus = 10;
      this.caughtFish.xpReward += xpBonus;
      this.caughtFish.price += coinBonus;
      this.caughtFish.isPerfectCatch = true;
    }

    const leveledUp = storage.addXp(this.caughtFish.xpReward);
    storage.recordFishCatch(this.caughtFish.id, this.caughtFish.weight);
    this.ui.updateHUD();

    if (leveledUp) {
      this.ui.showAlert(`LEVEL UP! SEKARANG LEVEL ${storage.state.level}! 🎉`, '⭐');
    }

    this.ui.showCatchModal(this.caughtFish);
  }

  resetToIdle(alertMessage = null) {
    this.state = GAME_STATE.IDLE;
    this.env.bobber.visible = false;
    this.env.fishShadow.visible = false;
    this.ui.hideBiteAlert();
    this.ui.hideReelingMinigame();
    this.ui.onAimingEnd();
    this.ui.hideShakeButton();

    if (alertMessage) {
      this.ui.showAlert(alertMessage, '❌');
    }
    
    // Continue auto cast if enabled
    if (this.autoCastEnabled) {
      this.autoCastDelay = 2.0; // Wait 2 seconds before next cast
    }
  }
}
