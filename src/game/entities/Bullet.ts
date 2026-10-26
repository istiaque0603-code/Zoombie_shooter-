import { GAME_WIDTH, GAME_HEIGHT } from '../types';

export class Bullet {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public isEnemy: boolean;
  public color: string;
  public textMsg: string | null;
  public damage: number;
  public life: number = 3.5;
  public rotation: number = 0;
  public radius: number;

  constructor(
    x: number,
    y: number,
    targetX: number,
    targetY: number,
    isEnemy: boolean = false,
    color: string = '#ffd32a',
    textMsg: string | null = null,
    damageOverride?: number
  ) {
    this.x = x;
    this.y = y;
    this.isEnemy = isEnemy;
    this.color = color;
    this.textMsg = textMsg;
    this.radius = textMsg ? 14 : (isEnemy ? 7 : 4);
    this.damage = damageOverride ?? (isEnemy ? (textMsg ? 18 : 12) : 25);

    const dx = targetX - x;
    const dy = targetY - y;
    const dist = Math.hypot(dx, dy) || 1;
    const speed = isEnemy ? (textMsg ? 290 : 340) : 850;

    this.vx = (dx / dist) * speed;
    this.vy = (dy / dist) * speed;
    this.rotation = Math.atan2(dy, dx);
  }

  public update(dt: number): boolean {
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    this.life -= dt;

    if (this.x < -60 || this.x > GAME_WIDTH + 60 || this.y < -40 || this.y > GAME_HEIGHT + 40 || this.life <= 0) {
      return false;
    }
    return true;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();

    if (this.textMsg) {
      // Morgana's floating decree messages
      ctx.translate(this.x, this.y);
      ctx.fillStyle = 'rgba(255, 71, 87, 0.9)';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.5;

      const padX = 8;
      ctx.font = '9px "Press Start 2P", monospace';
      const w = ctx.measureText(this.textMsg).width + padX * 2;
      const h = 18;

      ctx.beginPath();
      ctx.roundRect(-w / 2, -h / 2, w, h, 4);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(this.textMsg, 0, 1);
    } else if (this.isEnemy) {
      // Enemy projectile / Toxic pulse / Vipera venom orb
      ctx.translate(this.x, this.y);
      ctx.shadowColor = this.color;
      ctx.shadowBlur = 10;
      ctx.fillStyle = this.color;

      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();

      // Inner hot core
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(0, 0, this.radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Player high-speed bullet tracer
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);
      ctx.shadowColor = '#ffeaa7';
      ctx.shadowBlur = 8;

      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-6, -2, 12, 4);

      ctx.fillStyle = '#ffd32a';
      ctx.fillRect(-14, -1.5, 10, 3);
    }

    ctx.restore();
  }
}
