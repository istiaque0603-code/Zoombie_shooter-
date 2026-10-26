import { soundManager } from '../../audio/SoundManager';
import { Bullet } from './Bullet';
import { ShockwaveRing } from './ShockwaveRing';
import { ZombieMinion } from './ZombieMinion';
import { FLOOR_MIN_Y, FLOOR_MAX_Y, GAME_WIDTH } from '../types';

interface Afterimage {
  x: number;
  y: number;
  facingRight: boolean;
  frame: number;
  state: string;
  alpha: number;
}

export class MoumitaBoss {
  public x: number = GAME_WIDTH + 80;
  public y: number = 450;
  public maxHp: number = 340;
  public hp: number = 340;
  public speed: number = 105;
  public state: 'walk' | 'attack' | 'hit' | 'death' = 'walk';
  public facingRight: boolean = false;
  public animFrame: number = 0;
  public animTimer: number = 0;
  public actionTimer: number = 2.2;
  public isDead: boolean = false;
  public deathTimer: number = 0;
  public afterimages: Afterimage[] = [];
  public abilityBanner: string | null = null;
  public abilityTimer: number = 0;
  public isDashing: boolean = false;
  public dashTargetX: number = 0;
  public dashTimer: number = 0;

  constructor() {
    this.hp = 340;
    this.maxHp = 340;
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    onPlayerDamage: (damage: number) => void,
    bullets: Bullet[],
    shockwaves: ShockwaveRing[],
    enemies: ZombieMinion[],
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

    // Update afterimages
    for (let i = this.afterimages.length - 1; i >= 0; i--) {
      this.afterimages[i].alpha -= dt * 2.5;
      if (this.afterimages[i].alpha <= 0) this.afterimages.splice(i, 1);
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

    // Rage Dash attack active
    if (this.isDashing) {
      this.dashTimer -= dt;
      this.state = 'attack';
      const dashDir = this.dashTargetX > this.x ? 1 : -1;
      this.x += dashDir * 380 * dt;

      if (Math.random() < 0.45) {
        this.afterimages.push({
          x: this.x,
          y: this.y,
          facingRight: this.facingRight,
          frame: this.animFrame,
          state: 'attack',
          alpha: 0.75
        });
      }

      if (dist < 42) {
        onPlayerDamage(24);
      }

      if (this.dashTimer <= 0 || Math.abs(this.x - this.dashTargetX) < 20) {
        this.isDashing = false;
        onShake(9);
        soundManager.playShockwave();
        shockwaves.push(new ShockwaveRing(this.x, this.y, '#ff4757', 160, 24));
        for (let i = 0; i < 16; i++) {
          const spd = 60 + Math.random() * 120;
          const a = Math.random() * Math.PI * 2;
          onParticle(this.x, this.y, Math.cos(a) * spd, Math.sin(a) * spd - 40, '#2f3542', 4, 0.45);
        }
      }

      this.y = Math.max(FLOOR_MIN_Y, Math.min(FLOOR_MAX_Y, this.y));
      return;
    }

    this.actionTimer -= dt;
    if (this.actionTimer <= 0) {
      this.actionTimer = 3.4 + Math.random() * 1.8;
      const roll = Math.random();

      if (roll < 0.38) {
        // Ability 1: UNREAD TEXT BARRAGE
        this.state = 'attack';
        this.abilityBanner = '⚡ SONIC WARLORD BARRAGE!';
        this.abilityTimer = 2.2;
        soundManager.playBossRoar();
        soundManager.playShockwave();
        onShake(7);
        onSpeechBubble("YOU DARE TRESPASS IN MY SECTOR?! CRUSH HIM! ⚡💢", '#ff4757');
        shockwaves.push(new ShockwaveRing(this.x, this.y, '#ff6b81', 140, 20));

        const msgs = ['[SUBMIT!]', '[CRUSH!]', '[NO ESCAPE!]', '[PAY TOLL!]', '[BOW DOWN!]'];
        for (let i = 0; i < msgs.length; i++) {
          const angle = -0.6 + i * 0.3;
          const tx = playerX + Math.sin(angle) * 90;
          const ty = playerY + Math.cos(angle) * 70;
          bullets.push(new Bullet(this.x, this.y - 45, tx, ty, true, '#ff4757', msgs[i]));
        }
      } else if (roll < 0.72) {
        // Ability 2: RAGE RUSH
        this.isDashing = true;
        this.dashTargetX = playerX > this.x ? playerX + 80 : playerX - 80;
        this.dashTargetX = Math.max(60, Math.min(GAME_WIDTH - 60, this.dashTargetX));
        this.dashTimer = 0.85;
        this.abilityBanner = '🔥 WARLORD CHARGE!';
        this.abilityTimer = 1.8;
        soundManager.playBossAttack();
        onSpeechBubble("NO ONE BREAKS MY BARRICADE! 🏃‍♀️💨", '#ff9f43');
      } else {
        // Ability 3: SUMMON SIMP HORDE
        this.abilityBanner = '🧟 SUMMON ENFORCERS!';
        this.abilityTimer = 2.0;
        soundManager.playBossAttack();
        onSpeechBubble('ENFORCERS, OBLITERATE THIS INTRUDER! ⚔️', '#2ed573');
        for (let i = 0; i < 20; i++) {
          onParticle(
            this.x + (Math.random() - 0.5) * 60,
            this.y,
            (Math.random() - 0.5) * 50,
            -60 - Math.random() * 40,
            '#2ed573',
            4,
            0.6
          );
        }
        enemies.push(new ZombieMinion(-30, FLOOR_MIN_Y + 40));
        enemies.push(new ZombieMinion(GAME_WIDTH + 30, FLOOR_MAX_Y - 40));
      }
    }

    if (dist > 44) {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * (this.speed * 0.6) * dt;
      this.state = 'walk';
    } else {
      this.state = 'attack';
      onPlayerDamage(20);
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
    onBlood(this.x, this.y - 35, '#ff4757');
    onFloatingText(this.x, this.y - 65, `${Math.round(amount)}`, '#ffd32a');

    if (this.hp <= 0) {
      this.isDead = true;
      this.animFrame = 0;
      onFloatingText(this.x, this.y - 75, 'MORGANA DEFEATED! 💥', '#ff6b81');
      window.setTimeout(() => {
        onDefeated();
      }, 1800);
    }
  }

  public draw(ctx: CanvasRenderingContext2D, images: Record<string, HTMLImageElement>) {
    // Draw red ghost afterimages
    this.afterimages.forEach(ai => {
      ctx.save();
      ctx.translate(ai.x, ai.y);
      if (!ai.facingRight) ctx.scale(-1, 1);
      ctx.globalAlpha = ai.alpha * 0.45;
      const fImg = images[`moumita_${ai.state}_${ai.frame}`] || images['moumita_walk_0'];
      if (fImg && fImg.complete && fImg.naturalWidth > 0) {
        ctx.drawImage(fImg, -30, -96, 60, 96);
      }
      ctx.restore();
    });

    ctx.save();
    ctx.translate(this.x, this.y);
    if (!this.facingRight) ctx.scale(-1, 1);

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.55)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 28, 8, 0, 0, Math.PI * 2);
    ctx.fill();

    const key = `moumita_${this.state}_${this.animFrame}`;
    const img = images[key] || images['moumita_walk_0'];
    if (img && img.complete && img.naturalWidth > 0) {
      const drawW = 60;
      const drawH = 96;
      ctx.drawImage(img, -drawW / 2, -drawH, drawW, drawH);
    } else {
      ctx.fillStyle = '#ff4757';
      ctx.fillRect(-20, -90, 40, 60);
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(-15, -30, 30, 30);
    }

    // Ability banner badge above head
    if (this.abilityBanner) {
      ctx.save();
      if (!this.facingRight) ctx.scale(-1, 1);
      ctx.font = '8px "Press Start 2P", monospace';
      const tw = ctx.measureText(this.abilityBanner).width;
      ctx.fillStyle = 'rgba(235, 47, 6, 0.9)';
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
