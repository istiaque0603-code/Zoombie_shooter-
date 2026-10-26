/**
 * Game constants, state definitions, and types for Not Far From Home
 */

export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;

// Asphalt road boundary limits for natural walking depth
export const FLOOR_MIN_Y = 390;
export const FLOOR_MAX_Y = 505;

export enum GameState {
  TITLE = 0,
  INTRO = 1,
  LEVEL1 = 2,
  LEVEL2_INTRO = 3,
  LEVEL2_BOSS = 4,
  LEVEL3_INTRO = 5,
  LEVEL3_BOSS = 6,
  TRANSITION = 7,
  TAJ_MAHAL = 8,
  TWIST_WAKEUP = 9,
  BIRTHDAY = 10,
  GAMEOVER = 11,
  STUDIO_INTRO = 12,
}

export interface DialogueLine {
  speaker: string;
  portrait: string; // e.g. "portrait_fardin.jpg"
  text: string;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  life: number;
  maxLife: number;
  type?: 'circle' | 'spark' | 'heart' | 'sparkle' | 'acid' | 'smoke';
}

export interface SpeechBubble {
  target: { x: number; y: number; height?: number };
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export interface GameStats {
  kills: number;
  morganaDefeated: boolean;
  viperaDefeated: boolean;
  proposalsMade: number;
  shotsFired: number;
  pickupsCollected: number;
}
