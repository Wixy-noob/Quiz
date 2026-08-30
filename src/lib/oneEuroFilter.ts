/**
 * Adaptive One Euro Filter + Deadband Stabilizer
 * Eliminates micro-tremors, provides silky smooth motion while maintaining instant responsiveness.
 */
export class OneEuroFilter {
  private minCutoff: number;
  private beta: number;
  private dCutoff: number;
  private xPrev: number | null = null;
  private dxPrev: number = 0;
  private tPrev: number | null = null;
  private deadband: number;

  constructor(minCutoff: number = 0.8, beta: number = 0.04, dCutoff: number = 1.0, deadband: number = 0.001) {
    this.minCutoff = minCutoff;
    this.beta = beta;
    this.dCutoff = dCutoff;
    this.deadband = deadband;
  }

  private alpha(cutoff: number, dt: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  public filter(x: number, timestamp: number): number {
    if (this.xPrev === null || this.tPrev === null) {
      this.xPrev = x;
      this.tPrev = timestamp;
      this.dxPrev = 0;
      return x;
    }

    const dt = Math.max((timestamp - this.tPrev) / 1000, 0.001);
    this.tPrev = timestamp;

    // Apply micro deadband to ignore sensor electrical noise
    if (Math.abs(x - this.xPrev) < this.deadband) {
      x = this.xPrev;
    }

    // Filter the derivative
    const dx = (x - this.xPrev) / dt;
    const aD = this.alpha(this.dCutoff, dt);
    const dxHat = aD * dx + (1 - aD) * this.dxPrev;
    this.dxPrev = dxHat;

    // Filter the signal with adaptive cutoff based on velocity
    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
    const a = this.alpha(cutoff, dt);
    const xHat = a * x + (1 - a) * this.xPrev;
    this.xPrev = xHat;

    return xHat;
  }

  public reset(): void {
    this.xPrev = null;
    this.dxPrev = 0;
    this.tPrev = null;
  }
}

export class Point2DSmoother {
  private filterX: OneEuroFilter;
  private filterY: OneEuroFilter;

  constructor(minCutoff: number = 0.7, beta: number = 0.035, deadband: number = 0.0012) {
    this.filterX = new OneEuroFilter(minCutoff, beta, 1.0, deadband);
    this.filterY = new OneEuroFilter(minCutoff, beta, 1.0, deadband);
  }

  public filter(x: number, y: number, timestamp: number): { x: number; y: number } {
    return {
      x: this.filterX.filter(x, timestamp),
      y: this.filterY.filter(y, timestamp),
    };
  }

  public reset(): void {
    this.filterX.reset();
    this.filterY.reset();
  }
}
