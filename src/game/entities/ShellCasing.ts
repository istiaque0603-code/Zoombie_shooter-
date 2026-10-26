export class ShellCasing {
  public x: number;
  public y: number;
  public vx: number;
  public vy: number;
  public rotation: number;
  public vRot: number;
  public floorY: number;
  public life: number = 3.0;
  public alpha: number = 1.0;
  public bounces: number = 0;

  constructor(x: number, y: number, facingRight: boolean) {
    this.x = x;
    this.y = y;
    // Eject up and backward
    const dir = facingRight ? -1 : 1;
    this.vx = (dir * (40 + Math.random() * 60));
    this.vy = -(90 + Math.random() * 60);
    this.rotation = Math.random() * Math.PI * 2;
    this.vRot = (Math.random() - 0.5) * 20;
    this.floorY = y + 25 + Math.random() * 8;
  }

  public update(dt: number): boolean {
    this.life -= dt;
    if (this.life <= 0.8) {
      this.alpha = Math.max(0, this.life / 0.8);
    }
    if (this.life <= 0) return false;

    if (this.y < this.floorY) {
      this.vy += 450 * dt; // Gravity
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      this.rotation += this.vRot * dt;

      if (this.y >= this.floorY) {
        this.y = this.floorY;
        if (this.bounces < 2) {
          this.vy = -this.vy * 0.45;
          this.vx *= 0.6;
          this.vRot *= 0.5;
          this.bounces++;
        } else {
          this.vy = 0;
          this.vx = 0;
          this.vRot = 0;
        }
      }
    }

    return true;
  }

  public draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.alpha;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.rotation);

    // Brass cartridge
    ctx.fillStyle = '#f1c40f';
    ctx.fillRect(-2, -1, 4, 2);
    ctx.fillStyle = '#d4ac0d';
    ctx.fillRect(-3, -1.2, 1.2, 2.4);

    ctx.restore();
  }
}
