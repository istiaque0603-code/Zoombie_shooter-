import { soundManager } from '../../audio/SoundManager';
import { Pickup } from './Pickup';
import { FLOOR_MIN_Y, FLOOR_MAX_Y } from '../types';

export class ZombieMinion {
  public x: number;
  public y: number;
  public hp: number = 60;
  public maxHp: number = 60;
  public speed: number;
  public damage: number = 12;
  public attackCooldown: number = 0;
  public facingRight: boolean = false;
  public animTimer: number = Math.random() * 10;
  public isDead: boolean = false;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = Math.max(FLOOR_MIN_Y, Math.min(FLOOR_MAX_Y, y));
    this.speed = 75 + Math.random() * 45;
  }

  public update(
    dt: number,
    playerX: number,
    playerY: number,
    onPlayerDamage: (damage: number) => void
  ): boolean {
    if (this.isDead) return false;

    this.animTimer += dt * 6;
    if (this.attackCooldown > 0) this.attackCooldown -= dt;

    const dx = playerX - this.x;
    const dy = playerY - this.y;
    const dist = Math.hypot(dx, dy);
    this.facingRight = dx > 0;

    if (dist > 38) {
      this.x += (dx / dist) * this.speed * dt;
      this.y += (dy / dist) * (this.speed * 0.7) * dt;
    } else {
      if (this.attackCooldown <= 0) {
        this.attackCooldown = 1.0;
        soundManager.playZombieGroan();
        onPlayerDamage(this.damage);
      }
    }

    this.y = Math.max(FLOOR_MIN_Y, Math.min(FLOOR_MAX_Y, this.y));
    return true;
  }

  public takeDamage(
    amount: number,
    pickups: Pickup[],
    onBlood: (x: number, y: number, color: string) => void,
    onFloatingText: (x: number, y: number, text: string, color: string) => void,
    onKill: () => void
  ) {
    this.hp -= amount;
    soundManager.playZombieHurt();
    onBlood(this.x, this.y - 30, '#2ed573');
    onFloatingText(this.x, this.y - 65, `${Math.round(amount)}`, '#ffd32a');

    if (this.hp <= 0 && !this.isDead) {
      this.isDead = true;
      onKill();

      if (Math.random() < 0.35) {
        const roll = Math.random();
        const type = roll < 0.4 ? 'health' : roll < 0.75 ? 'ammo' : 'bayern';
        pickups.push(new Pickup(this.x, this.y, type));
      }
    }
  }

  public draw(ctx: CanvasRenderingContext2D, images: Record<string, HTMLImageElement>) {
    ctx.save();
    ctx.translate(this.x, this.y);
    if (!this.facingRight) ctx.scale(-1, 1);

    // Ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.beginPath();
    ctx.ellipse(0, 0, 22, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    const img = images['zombie_minion'];
    if (img && img.complete && img.naturalWidth > 0) {
      const drawW = 52;
      const drawH = 78;
      ctx.drawImage(img, -drawW / 2, -drawH, drawW, drawH);
    } else {
      ctx.fillStyle = '#2ed573';
      ctx.fillRect(-12, -70, 24, 45);
      ctx.fillStyle = '#70a1ff';
      ctx.fillRect(-10, -25, 20, 25);
    }

    // Health bar above head if wounded
    if (this.hp < this.maxHp && this.hp > 0) {
      ctx.fillStyle = '#2f3542';
      ctx.fillRect(-18, -88, 36, 5);
      ctx.fillStyle = '#2ed573';
      ctx.fillRect(-18, -88, Math.max(0, (this.hp / this.maxHp) * 36), 5);
    }

    ctx.restore();
  }
}
