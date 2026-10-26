export type PickupType = 'bayern' | 'health' | 'ammo';

export class Pickup {
  public x: number;
  public y: number;
  public type: PickupType;
  public life: number = 18.0;
  public hoverTimer: number = Math.random() * 10;
  public bobAmount: number = 0;

  constructor(x: number, y: number, type: PickupType) {
    this.x = x;
    this.y = y;
    this.type = type;
  }

  public update(dt: number): boolean {
    this.life -= dt;
    this.hoverTimer += dt * 4;
    this.bobAmount = Math.sin(this.hoverTimer) * 4;
    return this.life > 0;
  }

  public draw(ctx: CanvasRenderingContext2D, images: Record<string, HTMLImageElement>) {
    ctx.save();
    const dy = this.bobAmount;

    // Soft ground shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.ellipse(this.x, this.y + 12, 12, 4, 0, 0, Math.PI * 2);
    ctx.fill();

    // Aura glow
    if (this.type === 'bayern') {
      ctx.shadowColor = '#dc052d';
      ctx.shadowBlur = 14;
    } else if (this.type === 'health') {
      ctx.shadowColor = '#ff4757';
      ctx.shadowBlur = 12;
    } else {
      ctx.shadowColor = '#00d2d3';
      ctx.shadowBlur = 12;
    }

    const spr = images['pickup_' + this.type];
    if (spr && spr.complete && spr.naturalWidth > 0) {
      const sw = this.type === 'bayern' ? 26 : 28;
      const sh = this.type === 'bayern' ? 34 : 28;
      ctx.drawImage(spr, this.x - sw / 2, this.y - sh / 2 + dy, sw, sh);
    } else {
      ctx.fillStyle = this.type === 'bayern' ? '#dc052d' : this.type === 'health' ? '#ff4757' : '#00d2d3';
      ctx.fillRect(this.x - 10, this.y - 12 + dy, 20, 24);
    }

    ctx.restore();
  }
}
