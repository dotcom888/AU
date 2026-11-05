export interface GrokBallEngine {
  readonly emotionId: string | null;
  readonly touring: boolean;
  setEmotion(id: string, options?: { auto?: boolean }): boolean;
  setGaze(nx: number, ny: number): this;
  clearGaze(): this;
  setStyle(style: { sketch?: number }): this;
  setTheme?(color?: string, eyeColor?: string): this;
  spin(turns?: number, direction?: -1 | 1): this;
  burst(count?: number): this;
  bounce(): this;
  setActive(active: boolean): void;
  destroy(): void;
}

export interface GrokBallStatic {
  readonly version: string;
  create(target: string | Element, options?: any): GrokBallEngine;
}

export declare const GrokBall: GrokBallStatic;
export default GrokBall;
