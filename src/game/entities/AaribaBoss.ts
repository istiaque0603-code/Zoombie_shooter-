import { soundManager } from '../../audio/SoundManager';
import { Bullet } from './Bullet';
import { ShockwaveRing } from './ShockwaveRing';
import { AcidPuddle } from './AcidPuddle';
import { FLOOR_MIN_Y, FLOOR_MAX_Y, GAME_WIDTH } from '../types';

export class AaribaBoss {
  public x: number = GAME_WIDTH + 80;
  public y: number = 450;
  public maxHp: number = 450;
  public hp: number = 450;
  public speed: number = 120;
  public state: 'walk' | 'attack' | 'hit' | 'death' = 'walk';
  public facingRight: boolean = false;
  public animFrame: number = 0;
  public animTimer: number = 0;
  public actionTimer: number = 2.0;
  public isDead: boolean = false;
  public deathTimer: number = 0;
  public abilityBanner: string | null = null;
  public abilityTimer: number = 0;
  public spiralTimer: number = 0;
  public spiralBulletsLeft: number = 0;
  public spiralAngle: number = 0;

  constructor() {
    this.hp = 450;
    this.maxHp = 450;
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    playerFacingRight: boolean,
    onPlayerDamage: (damage: number) => void,
    bullets: Bullet[],
    shockwaves: ShockwaveRing[],
    acidPuddles: AcidPuddle[],
    onShake: (amount: number) => void,
    onSpeechBubble: (text: string, color: string) => void,
    onParticle: (x: number, y: number, vx: number, vy: number, color: string, size: number, life: number) => void,
    onDefeated: () => void
  ) {
    if (this.isDead) {
      this.deathTimer += dt;
      this.state = 'death';
      this.animFrame = Math.min(3, Math.floor(this.deathTimer * 3));
      return;
    }

    if (this.abilityBanner) {
      this.abilityTimer -= dt;
      if (this.abilityTimer <= 0) this.abilityBanner = null;
    }

    // Active Spiral Bullet Barrage
    if (this.spiralBulletsLeft > 0) {
      this.spiralTimer -= dt;
      if (this.spiralTimer <= 0) {
        this.spiralTimer = 0.09;
        this.spiralBulletsLeft--;
        this.spiralAngle += 0.42;

        const a1 = this.spiralAngle;
        const a2 = this.spiralAngle + Math.PI;
        const tx1 = this.x + Math.cos(a1) * 200;
        const ty1 = this.y - 45 + Math.sin(a1) * 200;
        const tx2 = this.x + Math.cos(a2) * 200;
        const ty2 = this.y - 45 + Math.sin(a2) * 200;

        bullets.push(new Bullet(this.x, this.y - 45, tx1, ty1, true, '#a55eea'));
        bullets.push(new Bullet(this.x, this.y - 45, tx2, ty2, true, '#9b59b6'));
        soundManager.playBossAttack();
      }
    }

    this.animTimer += dt;
    if (this.animTimer >= 0.14) {
      this.animTimer = 0;
      this.animFrame = (this.animFrame + 1) % 4;
    }

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);
    this.facingRight = dx > 0;

    this.actionTimer -= dt;
    if (this.actionTimer <= 0) {
      this.actionTimer = 3.4 + Math.random() * 1.8;
      const roll = Math.random();

      if (roll < 0.38) {
        // Ability 1: HEARTBREAK SPIRAL
        this.state = 'attack';
        this.abilityBanner = '🌀 TOXIC VENOM SPIRAL!';
        this.abilityTimer = 2.2;
        this.spiralBulletsLeft = 14;
        this.spiralTimer = 0.05;
        this.spiralAngle = Math.random() * Math.PI * 2;
        onSpeechBubble("Breathe in my venom, little hero! The wasteland bows to me! 🧪☠️", '#a55eea');
      } else if (roll < 0.72) {
        // Ability 2: SHADOW TELEPORT & 360° SLASH
        this.abilityBanner = '🔮 SHADOW AMBUSH!';
        this.abilityTimer = 1.8;
        onSpeechBubble('TOO SLOW TO SURVIVE MY CLAWS! 💜⚡', '#9b59b6');

        for (let i = 0; i < 24; i++) {
          const a = Math.random() * Math.PI * 2;
          const spd = 40 + Math.random() * 100;
          onParticle(this.x, this.y - 40, Math.cos(a) * spd, Math.sin(a) * spd, '#8e44ad', 4, 0.5);
        }
        soundManager.playTeleport();

        const offset = playerFacingRight ? -85 : 85;
        this.x = Math.max(70, Math.min(GAME_WIDTH - 70, playerX + offset));
        this.y = playerY;
        this.state = 'attack';

        window.setTimeout(() => {
          shockwaves.push(new ShockwaveRing(this.x, this.y, '#9b59b6', 150, 26));
          soundManager.playShockwave();
          onShake(8);
          for (let i = 0; i < 8; i++) {
            const sa = ((Math.PI * 2) / 8) * i;
            bullets.push(
              new Bullet(
                this.x,
                this.y - 45,
                this.x + Math.cos(sa) * 120,
                this.y - 45 + Math.sin(sa) * 120,
                true,
                '#a55eea'
              )
            );
          }
        }, 180);
      } else {
        // Ability 3: TOXIC ACID DELUGE
        this.state = 'attack';
        this.abilityBanner = '☣️ TOXIC DELUGE!';
        this.abilityTimer = 2.4;
        soundManager.playAcidSizzle();
        onSpeechBubble('THIS ENTIRE HIGHWAY IS MY TOXIC DOMAIN! 🧪☠️', '#a55eea');

        acidPuddles.push(new AcidPuddle(playerX, playerY));
        acidPuddles.push(new AcidPuddle(playerX - 90, playerY + (Math.random() - 0.5) * 40));
        acidPuddles.push(new AcidPuddle(playerX + 90, playerY + (Math.random() - 0.5) * 40));
      }
    }

    if (dist > 45) {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * (this.speed * 0.7) * dt;
      this.state = 'walk';
    } else {
      this.state = 'attack';
      onPlayerDamage(24);
      soundManager.playBossRoar();
    }

    this.y = Math.max(FLOOR_MIN_Y, Math.min(FLOOR_MAX_Y, this.y));
  }

  public takeDamage(
    amount: number,
    onBlood: (x: number, y: number, color: string) => void,
    onFloatingText: (x: number, y: number, text: string, color: string) => void,
    onDefeated: () => void
  ) {
    if (this.isDead) return;
    this.hp -= amount;
    this.state = 'hit';
    soundManager.playBossRoar();
    onBlood(this.x, this.y - 35, '#a55eea');
    onFloatingText(this.x, this.y - 65, `${Math.round(amount)}`, '#ffd32a');

    if (this.hp <= 0) {
      this.isDead = true;
      this.animFrame = 0;
      onFloatingText(this.x, this.y - 75, 'VIPERA DEFEATED! 💥', '#a55eea');
      window.setTimeout(() => {
        onDefeated();
      }, 1800);
    }
  }

  public draw(ctx: CanvasRenderingContext2D, images: Record<string, HTMLImageElement>) {
    ctx.save();
    ctx.translate(this.x, this.y);
    if (!this.facingRight) ctx.scale(-1, 1);

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const key = `aariba_${this.state}_${this.animFrame}`;
    const img = images[key] || images['aariba_walk_0'];
    if (img && img.complete && img.naturalWidth > 0) {
      const drawW = 60;
      const drawH = 96;
      ctx.drawImage(img, -drawW / 2, -drawH, drawW, drawH);
    } else {
      ctx.fillStyle = '#8e44ad';
      ctx.fillRect(-20, -90, 40, 60);
      ctx.fillStyle = '#2c3e50';
      ctx.fillRect(-15, -30, 30, 30);
    }

    // Ability banner badge above head
    if (this.abilityBanner) {
      ctx.save();
      if (!this.facingRight) ctx.scale(-1, 1);
      ctx.font = '8px "Press Start 2P", monospace';
      const tw = ctx.measureText(this.abilityBanner).width;
      ctx.fillStyle = 'rgba(142, 68, 173, 0.9)';
      ctx.fillRect(-tw / 2 - 6, -114, tw + 12, 18);
      ctx.strokeStyle = '#ffd32a';
      ctx.lineWidth = 1;
      ctx.strokeRect(-tw / 2 - 6, -114, tw + 12, 18);
      ctx.fillStyle = '#ffffff';
      ctx.fillText(this.abilityBanner, -tw / 2, -101);
      ctx.restore();
    }

    ctx.restore();
  }
}
