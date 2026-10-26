export class ShockwaveRing {
  public x: number;
  public y: number;
  public color: string;
  public maxRadius: number;
  public currentRadius: number = 5;
  public speed: number;
  public alpha: number = 1.0;
  public damage: number;
  public hasDamagedPlayer: boolean = false;

  constructor(x: number, y: number, color: string = '#ff4757', maxRadius: number = 150, damage: number = 15) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.maxRadius = maxRadius;
    this.speed = maxRadius / 0.55; // Complete expansion in 0.55s
    this.damage = damage;
  }

  public update(dt: number): boolean {
    this.currentRadius += this.speed * dt;
    this.alpha = Math.max(0, 1 - (this.currentRadius / this.maxRadius));

    return this.currentRadius < this.maxRadius;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3;
    ctx.shadowColor = this.color;
    ctx.shadowBlur = 12;

    // Oval flat ring for perspective on road
    ctx.beginPath();
    ctx.ellipse(this.x, this.y, this.currentRadius, this.currentRadius * 0.45, 0, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  }
}
