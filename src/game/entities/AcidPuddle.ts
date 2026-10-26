export class AcidPuddle {
  public x: number;
  public y: number;
  public radius: number;
  public life: number = 7.5;
  public maxLife: number = 7.5;
  public bubbleTimer: number = 0;
  public bubbles: Array<{ x: number; y: number; r: number; life: number }> = [];

  constructor(x: number, y: number, radius: number = 38) {
    this.x = x;
    this.y = y;
    this.radius = radius;
  }

  public update(dt: number): boolean {
    this.life -= dt;
    this.bubbleTimer += dt;

    if (this.bubbleTimer > 0.12) {
      this.bubbleTimer = 0;
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * (this.radius * 0.7);
      this.bubbles.push({
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * (dist * 0.4),
        r: 1.5 + Math.random() * 2.5,
        life: 0.35 + Math.random() * 0.3
      });
    }

    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      this.bubbles[i].life -= dt;
      if (this.bubbles[i].life <= 0) {
        this.bubbles.splice(i, 1);
      }
    }

    return this.life > 0;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    const alpha = Math.min(0.85, (this.life / this.maxLife) * 1.2);
    ctx.globalAlpha = alpha;

    ctx.translate(this.x, this.y);
    ctx.fillStyle = '#6c5ce7';
    ctx.shadowColor = '#a29bfe';
    ctx.shadowBlur = 10;

    // Oval puddle
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius, this.radius * 0.42, 0, 0, Math.PI * 2);
    ctx.fill();

    // Inner bright toxic puddle
    ctx.fillStyle = '#a8ff78';
    ctx.shadowColor = '#78ffd6';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.ellipse(0, 0, this.radius * 0.65, this.radius * 0.25, 0, 0, Math.PI * 2);
    ctx.fill();

    // Bubbles
    ctx.fillStyle = '#ffffff';
    this.bubbles.forEach(b => {
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }
}
