/* ==========================================================
   Gigit Masalah – Player Controller
   Movement, collision, camera orbit, limb animation
   ========================================================== */

import * as THREE from 'three';

export class PlayerController {
  constructor(env) {
    this.env    = env;
    this.player = env.player;
    this.camera = env.camera;

    this.speed         = 8.5;
    this.rotationSpeed = 12.0;

    this.camDistance = 10.5;
    this.camHeight   = 5.0;
    this.camAngleY   = 0;
    this.camAngleX   = 0.25;

    this.keys = { w:false, a:false, s:false, d:false, space:false };
    this.joystickInput = { x:0, y:0 };

    this.velocityY  = 0;
    this.gravity    = -24;
    this.isGrounded = true;

    this.walkCycle = 0;
    this.isMoving  = false;

    this.isMouseDown = false;
    this.prevMouseX  = 0;
    this.prevMouseY  = 0;

    this.setupInputListeners();
  }

  setupInputListeners() {
    window.addEventListener('keydown', e => this.onKeyDown(e));
    window.addEventListener('keyup',   e => this.onKeyUp(e));

    const c = document.getElementById('canvas-container');

    c.addEventListener('mousedown', e => {
      if (e.button === 0 || e.button === 2) {
        this.isMouseDown = true;
        this.prevMouseX  = e.clientX;
        this.prevMouseY  = e.clientY;
      }
    });
    window.addEventListener('mouseup',   () => { this.isMouseDown = false; });
    window.addEventListener('mousemove', e => {
      if (!this.isMouseDown) return;
      this.camAngleY -= (e.clientX - this.prevMouseX) * 0.005;
      this.camAngleX  = THREE.MathUtils.clamp(
        this.camAngleX + (e.clientY - this.prevMouseY) * 0.003, -0.1, 0.8
      );
      this.prevMouseX = e.clientX;
      this.prevMouseY = e.clientY;
    });

    c.addEventListener('touchstart', e => {
      if (e.touches.length === 1 &&
          !e.target.closest('#ui-overlay button,.modal-box,.fishit-hotbar,#joystick-container')) {
        this.isMouseDown = true;
        this.prevMouseX  = e.touches[0].clientX;
        this.prevMouseY  = e.touches[0].clientY;
      }
    });
    c.addEventListener('touchmove', e => {
      if (!this.isMouseDown || e.touches.length !== 1) return;
      if (e.target.closest('#joystick-container')) return; // joystick finger must never rotate camera
      this.camAngleY -= (e.touches[0].clientX - this.prevMouseX) * 0.006;
      this.camAngleX  = THREE.MathUtils.clamp(
        this.camAngleX + (e.touches[0].clientY - this.prevMouseY) * 0.004, -0.1, 0.8
      );
      this.prevMouseX = e.touches[0].clientX;
      this.prevMouseY = e.touches[0].clientY;
    });
    c.addEventListener('touchend', () => { this.isMouseDown = false; });

    this.setupVirtualJoystick();
  }

  setupVirtualJoystick() {
    const base  = document.getElementById('joystick-base');
    const stick = document.getElementById('joystick-stick');
    if (!base || !stick) return;

    let touchId = null, baseRect = null;

    const update = touch => {
      const cx = baseRect.left + baseRect.width  / 2;
      const cy = baseRect.top  + baseRect.height / 2;
      const r  = baseRect.width / 2;
      let dx = touch.clientX - cx, dy = touch.clientY - cy;
      const dist = Math.hypot(dx, dy);
      if (dist > r) { dx = dx/dist*r; dy = dy/dist*r; }
      stick.style.transform = `translate(${dx}px,${dy}px)`;
      this.joystickInput.x = dx / r;
      this.joystickInput.y = dy / r;
    };

    window.addEventListener('touchstart', e => {
      for (const t of e.changedTouches) {
        if (touchId === null && t.clientX < window.innerWidth * 0.5) {
          touchId = t.identifier;
          baseRect = base.getBoundingClientRect();
          update(t);
        }
      }
    }, { passive: false });

    window.addEventListener('touchmove', e => {
      for (const t of e.changedTouches)
        if (t.identifier === touchId) update(t);
    }, { passive: false });

    window.addEventListener('touchend', e => {
      for (const t of e.changedTouches) {
        if (t.identifier === touchId) {
          touchId = null;
          stick.style.transform = 'translate(0,0)';
          this.joystickInput.x = this.joystickInput.y = 0;
        }
      }
    }, { passive: false });
  }

  onKeyDown(e) {
    if (e.code==='KeyW'||e.code==='ArrowUp')    this.keys.w=true;
    if (e.code==='KeyS'||e.code==='ArrowDown')  this.keys.s=true;
    if (e.code==='KeyA'||e.code==='ArrowLeft')  this.keys.a=true;
    if (e.code==='KeyD'||e.code==='ArrowRight') this.keys.d=true;
    if (e.code==='Space') this.keys.space=true;
  }
  onKeyUp(e) {
    if (e.code==='KeyW'||e.code==='ArrowUp')    this.keys.w=false;
    if (e.code==='KeyS'||e.code==='ArrowDown')  this.keys.s=false;
    if (e.code==='KeyA'||e.code==='ArrowLeft')  this.keys.a=false;
    if (e.code==='KeyD'||e.code==='ArrowRight') this.keys.d=false;
    if (e.code==='Space') this.keys.space=false;
  }

  update(delta, canMove = true) {
    let mx = 0, mz = 0;

    if (canMove) {
      if (this.keys.w) mz += 1;
      if (this.keys.s) mz -= 1;
      if (this.keys.a) mx -= 1;
      if (this.keys.d) mx += 1;
      if (Math.abs(this.joystickInput.x) > 0.1) mx += this.joystickInput.x;
      if (Math.abs(this.joystickInput.y) > 0.1) mz -= this.joystickInput.y;
    }

    const len = Math.hypot(mx, mz);
    this.isMoving = len > 0.1;

    if (this.isMoving) {
      const dx = mx / len, dz = mz / len;
      const fwX = Math.sin(this.camAngleY), fwZ = Math.cos(this.camAngleY);
      const rtX = Math.sin(this.camAngleY + Math.PI / 2);
      const rtZ = Math.cos(this.camAngleY + Math.PI / 2);

      const nx = this.player.position.x + (fwX*dz + rtX*dx) * this.speed * delta;
      const nz = this.player.position.z + (fwZ*dz + rtZ*dx) * this.speed * delta;

      const { x, z } = this.clampPosition(nx, nz);
      const moveDX = x - this.player.position.x;
      const moveDZ = z - this.player.position.z;
      this.player.position.x = x;
      this.player.position.z = z;

      if (Math.hypot(moveDX, moveDZ) > 0.001) {
        const target = Math.atan2(moveDX, moveDZ);
        let diff = target - this.player.rotation.y;
        while (diff < -Math.PI) diff += Math.PI * 2;
        while (diff >  Math.PI) diff -= Math.PI * 2;
        this.player.rotation.y += diff * Math.min(1, this.rotationSpeed * delta);
      }
    }

    // Jump
    if (canMove && this.keys.space && this.isGrounded) {
      this.velocityY  = 8.0;
      this.isGrounded = false;
    }

    // Gravity
    this.velocityY += this.gravity * delta;
    this.player.position.y += this.velocityY * delta;

    const groundY = this.getGroundY(this.player.position.x, this.player.position.z);
    if (this.player.position.y <= groundY) {
      this.player.position.y = groundY;
      this.velocityY  = 0;
      this.isGrounded = true;
    }

    this.animateLimbs(delta);
    this.updateCamera();
  }

  /* ── Collision ─────────────────────────────────────────── */
  clampPosition(x, z) {
    const areas = [
      { minX: -1.3,  maxX: 1.3,   minZ: -2,   maxZ: 24  },  // pier
      { minX: -18,   maxX: 18,    minZ: -22,  maxZ: 2   }   // island
    ];

    for (const a of areas)
      if (x >= a.minX && x <= a.maxX && z >= a.minZ && z <= a.maxZ)
        return { x, z };

    // Nearest valid point
    let bx = x, bz = z, bd = Infinity;
    for (const a of areas) {
      const cx = THREE.MathUtils.clamp(x, a.minX, a.maxX);
      const cz = THREE.MathUtils.clamp(z, a.minZ, a.maxZ);
      const d  = Math.hypot(cx - x, cz - z);
      if (d < bd) { bd = d; bx = cx; bz = cz; }
    }
    return { x: bx, z: bz };
  }

  getGroundY(x, z) {
    if (z > 2 && z < 24 && x > -1.3 && x < 1.3) return 1.8; // pier deck
    // Gentle island roll
    return 1.8 + Math.sin(x * 0.15) * Math.cos(z * 0.12) * 0.5
               + Math.sin(x * 0.28 + z * 0.2) * 0.3;
  }

  /* ── Limb animation (voxel model) ─────────────────────── */
  animateLimbs(delta) {
    const u = this.player.userData;
    if (!u || !u.leftLeg) return;

    if (this.isMoving && this.isGrounded) {
      this.walkCycle += delta * 12;
      const a = Math.sin(this.walkCycle) * 0.7;
      u.leftLeg.rotation.x  =  a;
      u.rightLeg.rotation.x = -a;
      u.leftArm.rotation.x  = -a;
      u.rightArm.rotation.x =  a * 0.4;
    } else {
      this.walkCycle = 0;
      u.leftLeg.rotation.x  *= 0.8;
      u.rightLeg.rotation.x *= 0.8;
      u.leftArm.rotation.x  *= 0.8;
      u.rightArm.rotation.x *= 0.8;
    }
  }

  /* ── Camera orbit ─────────────────────────────────────── */
  updateCamera() {
    const cosX = Math.cos(this.camAngleX);
    const sinX = Math.sin(this.camAngleX);
    const sinY = Math.sin(this.camAngleY);
    const cosY = Math.cos(this.camAngleY);

    const tx = this.player.position.x - this.camDistance * sinY * cosX;
    const ty = this.player.position.y + this.camHeight   + this.camDistance * sinX;
    const tz = this.player.position.z - this.camDistance * cosY * cosX;

    this.camera.position.lerp(new THREE.Vector3(tx, ty, tz), 0.2);
    this.camera.lookAt(
      this.player.position.x,
      this.player.position.y + 2.0,
      this.player.position.z
    );
  }
}
