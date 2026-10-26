import { soundManager } from '../../audio/SoundManager';
import { Bullet } from './Bullet';
import { ShellCasing } from './ShellCasing';
import { Pickup } from './Pickup';
import { FLOOR_MIN_Y, FLOOR_MAX_Y, GAME_WIDTH } from '../types';

export class Player {
  public x: number = 220;
  public y: number = 440;
  public speed: number = 220;
  public maxHp: number = 100;
  public hp: number = 100;
  public ammo: number = 12;
  public maxAmmo: number = 12;
  public isReloading: boolean = false;
  public reloadTimer: number = 0;
  public dodgeTimer: number = 0;
  public isDodging: boolean = false;
  public invincibleTimer: number = 0;
  public facingRight: boolean = true;
  public state: 'idle' | 'walk' | 'run' | 'shoot' | 'crouch' | 'hit' | 'death' | 'propose' = 'idle';
  public animFrame: number = 0;
  public animTimer: number = 0;
  public shootCooldown: number = 0;
  public shootAnimTimer: number = 0;
  public shootFrame: number = 0;
  public bayernBoostTimer: number = 0;
  public gunRecoil: number = 0;

  constructor() {
    this.hp = 100;
    this.ammo = 12;
  }

  public update(
    dt: number,
    keys: Record<string, boolean>,
    touchStick: { x: number; y: number },
    targetAim: { x: number; y: number },
    pickups: Pickup[],
    bullets: Bullet[],
    shellCasings: ShellCasing[],
    onShake: (amount: number) => void,
    onBlood: (x: number, y: number, color: string) => void,
    onFloatingText: (x: number, y: number, text: string, color: string) => void,
    onMuzzleFlash: (x: number, y: number, angle: number) => void,
    onGameOver: () => void
  ) {
    if (this.hp <= 0) return;

    if (this.bayernBoostTimer > 0) {
      this.bayernBoostTimer -= dt;
      this.speed = 310;
    } else {
      this.speed = 220;
    }

    if (this.invincibleTimer > 0) this.invincibleTimer -= dt;
    if (this.shootCooldown > 0) this.shootCooldown -= dt;
    if (this.gunRecoil > 0) this.gunRecoil = Math.max(0, this.gunRecoil - dt * 25);

    // Shooting recoil animation timer
    if (this.shootAnimTimer > 0) {
      this.shootAnimTimer -= dt;
      if (this.shootAnimTimer > 0.25) {
        this.shootFrame = 1;
      } else if (this.shootAnimTimer > 0.16) {
        this.shootFrame = 2;
      } else if (this.shootAnimTimer > 0.08) {
        this.shootFrame = 3;
      } else {
        this.shootFrame = 0;
      }
    }

    // Reloading
    if (this.isReloading) {
      this.reloadTimer -= dt;
      if (this.reloadTimer <= 0) {
        this.isReloading = false;
        this.ammo = this.maxAmmo;
      }
    }

    // Dodging roll
    if (this.isDodging) {
      this.dodgeTimer -= dt;
      this.x += (this.facingRight ? 1 : -1) * 400 * dt;
      if (this.dodgeTimer <= 0) {
        this.isDodging = false;
      }
    } else {
      // Movement
      let mx = 0;
      let my = 0;
      if (keys['a'] || keys['arrowleft']) mx -= 1;
      if (keys['d'] || keys['arrowright']) mx += 1;
      if (keys['w'] || keys['arrowup']) my -= 1;
      if (keys['s'] || keys['arrowdown']) my += 1;

      if (touchStick.x !== 0 || touchStick.y !== 0) {
        mx += touchStick.x;
        my += touchStick.y;
      }

      const len = Math.hypot(mx, my);
      if (len > 0.05) {
        const normX = mx / (len > 1 ? len : 1);
        const normY = my / (len > 1 ? len : 1);
        this.x += normX * this.speed * dt;
        this.y += normY * this.speed * dt;

        this.state = len > 0.7 ? 'run' : 'walk';
        this.animTimer += dt * (this.bayernBoostTimer > 0 ? 1.4 : 1.0);
        if (this.animTimer >= 0.12) {
          this.animTimer = 0;
          this.animFrame = (this.animFrame + 1) % 4;
        }
      } else {
        this.state = 'idle';
        this.animTimer += dt;
        if (this.animTimer >= 0.22) {
          this.animTimer = 0;
          this.animFrame = (this.animFrame + 1) % 4;
        }
      }

      // Aim direction
      if (targetAim.x !== 0 || targetAim.y !== 0) {
        this.facingRight = targetAim.x >= this.x;
      }
    }

    // Clamp inside play area and asphalt boundaries
    this.x = Math.max(45, Math.min(GAME_WIDTH - 45, this.x));
    this.y = Math.max(FLOOR_MIN_Y, Math.min(FLOOR_MAX_Y, this.y));

    // Pickup checks
    for (let i = pickups.length - 1; i >= 0; i--) {
      const p = pickups[i];
      if (Math.hypot(this.x - p.x, this.y - p.y) < 32) {
        soundManager.playPickup();
        if (p.type === 'health') {
          this.hp = Math.min(this.maxHp, this.hp + 35);
          onFloatingText(this.x, this.y - 60, '+35 HP ❤️', '#2ed573');
        } else if (p.type === 'ammo') {
          this.ammo = this.maxAmmo;
          this.isReloading = false;
          onFloatingText(this.x, this.y - 60, 'MAX AMMO ⚡', '#00d2d3');
        } else if (p.type === 'bayern') {
          this.bayernBoostTimer = 6;
          this.hp = Math.min(this.maxHp, this.hp + 20);
          onFloatingText(this.x, this.y - 60, 'MIA SAN MIA SPEED! ⚽', '#dc052d');
        }
        pickups.splice(i, 1);
      }
    }
  }

  public shoot(
    targetAim: { x: number; y: number },
    bullets: Bullet[],
    shellCasings: ShellCasing[],
    onShake: (amount: number) => void,
    onMuzzleFlash: (x: number, y: number, angle: number) => void
  ) {
    if (this.hp <= 0 || this.isDodging || this.shootCooldown > 0) return;
    if (this.isReloading) return;
    if (this.ammo <= 0) {
      this.reload();
      return;
    }

    this.ammo--;
    this.shootCooldown = this.bayernBoostTimer > 0 ? 0.09 : 0.15;
    this.shootAnimTimer = 0.35;
    this.shootFrame = 1;
    this.gunRecoil = 1.0;

    soundManager.playShoot();
    onShake(3);

    const dir = this.facingRight ? 1 : -1;
    const tipX = this.x + dir * 48;
    const tipY = this.y - 52;
    const angle = Math.atan2(targetAim.y - tipY, targetAim.x - tipX);

    bullets.push(new Bullet(tipX, tipY, targetAim.x, targetAim.y, false, '#fffa65'));
    onMuzzleFlash(tipX, tipY, angle);

    const portX = this.x + dir * 22;
    const portY = this.y - 52;
    shellCasings.push(new ShellCasing(portX, portY, this.facingRight));
  }

  public reload() {
    if (this.isReloading || this.ammo === this.maxAmmo) return;
    this.isReloading = true;
    this.reloadTimer = 1.0;
    soundManager.playPickup();
  }

  public dodge() {
    if (this.isDodging || this.hp <= 0) return;
    this.isDodging = true;
    this.dodgeTimer = 0.28;
    this.invincibleTimer = 0.35;
    soundManager.playDodge();
  }

  public takeDamage(
    amount: number,
    onShake: (amount: number) => void,
    onBlood: (x: number, y: number, color: string) => void,
    onFloatingText: (x: number, y: number, text: string, color: string) => void,
    onGameOver: () => void
  ) {
    if (this.invincibleTimer > 0 || this.hp <= 0) return;
    this.hp = Math.max(0, this.hp - amount);
    this.invincibleTimer = 0.5;
    onShake(7);
    soundManager.playPlayerHurt();
    onBlood(this.x, this.y - 40, '#ff4757');
    onFloatingText(this.x, this.y - 65, `-${Math.round(amount)}`, '#ff4757');

    if (this.hp <= 0) {
      soundManager.stopBGM();
      window.setTimeout(() => {
        onGameOver();
      }, 1200);
    }
  }

  public draw(ctx: CanvasRenderingContext2D, images: Record<string, HTMLImageElement>) {
    ctx.save();
    const posX = this.x;
    const posY = this.y;

    if (this.invincibleTimer > 0 && Math.floor(Date.now() / 80) % 2 === 0) {
      ctx.globalAlpha = 0.45;
    }

    // Shadow on asphalt
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(posX, posY, 24, 7, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bayern red fire aura when boosted
    if (this.bayernBoostTimer > 0) {
      ctx.shadowColor = '#dc052d';
      ctx.shadowBlur = 18;
      ctx.strokeStyle = 'rgba(220, 5, 45, 0.6)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(posX, posY - 40, 32, 48, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    let spriteKey: string;
    const isShooting = this.shootAnimTimer > 0;
    const isCrouch = this.isDodging;

    if (isCrouch) {
      spriteKey = `fardin_crouch_${this.animFrame}`;
    } else if (isShooting) {
      spriteKey = `fardin_shoot_${this.shootFrame}`;
    } else if (this.state === 'run') {
      spriteKey = `fardin_run_${this.animFrame}`;
    } else if (this.state === 'walk') {
      spriteKey = `fardin_walk_${this.animFrame}`;
    } else {
      spriteKey = `fardin_idle_${this.animFrame}`;
    }

    const img = images[spriteKey] || images['fardin_idle_0'];
    if (img && img.complete && img.naturalWidth > 0) {
      ctx.translate(posX, posY);
      if (!this.facingRight) ctx.scale(-1, 1);

      if (isShooting) {
        const dh = 82;
        let dw = 74;
        let offsetX = -27;
        if (this.shootFrame === 1) {
          dw = 98;
          offsetX = -27;
        } else if (this.shootFrame === 2) {
          dw = 60;
          offsetX = -25;
        } else if (this.shootFrame === 3) {
          dw = 70;
          offsetX = -26;
        }
        ctx.drawImage(img, offsetX, -dh, dw, dh);

        // FC Bayern Red Scarf Accent
        ctx.fillStyle = '#dc052d';
        ctx.fillRect(-8, -dh + 38, 18, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-4, -dh + 39, 4, 4);
      } else if (isCrouch) {
        const dw = 52;
        const dh = 66;
        ctx.drawImage(img, -dw / 2, -dh, dw, dh);
      } else {
        const dw = 54;
        const dh = 92;
        ctx.drawImage(img, -dw / 2, -dh, dw, dh);
        // FC Bayern Red Scarf Accent
        ctx.fillStyle = '#dc052d';
        ctx.fillRect(-10, -dh + 42, 20, 6);
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(-6, -dh + 43, 4, 4);
      }
    } else {
      // Fallback pixel character
      ctx.translate(posX, posY);
      if (!this.facingRight) ctx.scale(-1, 1);
      ctx.fillStyle = '#dc052d';
      ctx.fillRect(-14, -80, 28, 50);
      ctx.fillStyle = '#f5cd79';
      ctx.fillRect(-10, -102, 20, 22);
      ctx.fillStyle = '#2d3436';
      ctx.fillRect(-12, -30, 10, 30);
      ctx.fillRect(2, -30, 10, 30);
    }

    ctx.restore();
  }
}
