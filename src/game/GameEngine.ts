import { soundManager } from '../audio/SoundManager';
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  GameState,
  DialogueLine,
  Particle,
  SpeechBubble,
  FLOOR_MIN_Y,
  FLOOR_MAX_Y
} from './types';
import { Player } from './entities/Player';
import { ZombieMinion } from './entities/ZombieMinion';
import { MoumitaBoss } from './entities/MoumitaBoss';
import { AaribaBoss } from './entities/AaribaBoss';
import { Bullet } from './entities/Bullet';
import { ShellCasing } from './entities/ShellCasing';
import { ShockwaveRing } from './entities/ShockwaveRing';
import { AcidPuddle } from './entities/AcidPuddle';
import { Pickup } from './entities/Pickup';

export interface FloatingText {
  x: number;
  y: number;
  text: string;
  color: string;
  life: number;
  maxLife: number;
}

export class GameEngine {
  public canvas: HTMLCanvasElement | null = null;
  public ctx: CanvasRenderingContext2D | null = null;

  public state: GameState = GameState.TITLE;
  public stateTimer: number = 0;
  public totalKills: number = 0;
  public screenShake: number = 0;

  // Assets
  public images: Record<string, HTMLImageElement> = {};
  public assetsLoaded: number = 0;
  public assetsTotal: number = 0;

  // Entities
  public player: Player = new Player();
  public enemies: ZombieMinion[] = [];
  public currentBoss: MoumitaBoss | AaribaBoss | null = null;
  public bullets: Bullet[] = [];
  public pickups: Pickup[] = [];
  public shellCasings: ShellCasing[] = [];
  public shockwaves: ShockwaveRing[] = [];
  public acidPuddles: AcidPuddle[] = [];
  public particles: Particle[] = [];
  public speechBubbles: SpeechBubble[] = [];
  public floatingTexts: FloatingText[] = [];

  // Stage 1 Wave Spawning
  public waveSpawnTimer: number = 0;
  public waveQuota: number = 14;

  // Inputs
  public keys: Record<string, boolean> = {};
  public mouse: { x: number; y: number } = { x: 480, y: 270 };
  public isMouseDown: boolean = false;
  public isVirtualFirePressed: boolean = false;
  public touchStick: { x: number; y: number } = { x: 0, y: 0 };
  public autoAimEnabled: boolean = true;

  // Dialogue
  public dialogueActive: boolean = false;
  public dialogueQueue: DialogueLine[] = [];
  public dialogueIndex: number = 0;
  public dialogueDisplayedText: string = '';
  public dialogueFullText: string = '';
  public dialogueSpeaker: string = '';
  public dialoguePortrait: string = '';
  public dialogueCharIndex: number = 0;
  public dialogueTypeTimer: number = 0;
  public dialogueOnComplete: (() => void) | null = null;

  // Taj Mahal Cinematic
  public cinematicStage: number = 0;
  public cinematicTimer: number = 0;
  public cinematicLetterbox: number = 0;
  public cinematicRingSparkle: number = 0;
  public cinematicBannerAlpha: number = 0;
  public proposalFadeAlpha: number = 0;
  public cinematicFardin: { x: number; y: number; frame: number; state: string } = {
    x: 120,
    y: 475,
    frame: 0,
    state: 'walk'
  };
  public cinematicFarhana: { x: number; y: number; frame: number; state: string } = {
    x: 620,
    y: 475,
    frame: 0,
    state: 'idle'
  };

  // Studio Intro
  public studioIntroTimer: number = 0;
  public studioSparkPlayed: boolean = false;
  public studioGlitchPlayed: boolean = false;
  public studioImpactPlayed: boolean = false;
  public studioShimmerPlayed: boolean = false;
  public studioIntroParticles: Array<{
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    alpha: number;
  }> = [];

  // Animation Frame Loop
  private animFrameId: number | null = null;
  private lastTime: number = 0;

  // State change notification listeners
  public onStateChange?: (state: GameState) => void;
  public onHudUpdate?: (hud: {
    playerHp: number;
    playerMaxHp: number;
    ammo: number;
    maxAmmo: number;
    kills: number;
    stageName: string;
    isReloading: boolean;
    boss?: { name: string; hp: number; maxHp: number; color?: string };
  }) => void;
  public onDialogueUpdate?: (dialogue: {
    active: boolean;
    speaker: string;
    text: string;
    portrait: string;
  }) => void;

  constructor() {
    this.preloadAssets();
  }

  public init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    if (this.ctx) {
      this.ctx.imageSmoothingEnabled = false;
    }
    this.lastTime = performance.now();
    this.startLoop();
  }

  public destroy() {
    if (this.animFrameId !== null) {
      cancelAnimationFrame(this.animFrameId);
      this.animFrameId = null;
    }
  }

  // --- ASSET PRELOADING ---

  private loadImage(key: string, src: string) {
    this.assetsTotal++;
    const img = new Image();
    img.onload = () => {
      this.assetsLoaded++;
    };
    img.onerror = () => {
      this.assetsLoaded++;
    };
    img.src = src;
    this.images[key] = img;
  }

  private preloadAssets() {
    // Backgrounds & Cutscenes
    this.loadImage('level_street', '/assets/level_street.jpg');
    this.loadImage('taj_mahal', '/assets/taj_mahal.jpg');
    this.loadImage('proposal_cinematic', '/assets/proposal_cinematic.jpg');
    this.loadImage('bedroom_wake', '/assets/bedroom_wake.jpg');
    this.loadImage('birthday_screen', '/assets/birthday_screen.jpg');
    this.loadImage('title_screen', '/assets/title_screen.jpg');
    this.loadImage('studio_logo', '/assets/studio_logo.png');
    this.loadImage('studio_logo_square', '/assets/studio_logo_square.png');
    this.loadImage('studio_logo_tinyplay', '/assets/studio_logo_tinyplay.png');
    this.loadImage('studio_logo_gamestudio', '/assets/studio_logo_gamestudio.png');

    // Character Portraits
    this.loadImage('portrait_fardin.jpg', '/assets/portrait_fardin.jpg');
    this.loadImage('portrait_moumita.jpg', '/assets/portrait_moumita.jpg');
    this.loadImage('portrait_aariba.jpg', '/assets/portrait_aariba.jpg');
    this.loadImage('portrait_zakia.jpg', '/assets/portrait_zakia.jpg');

    // Tanvir Sprites (4 frames each)
    for (let i = 0; i < 4; i++) {
      this.loadImage(`fardin_idle_${i}`, `/assets/sprites/fardin_idle_${i}.png`);
      this.loadImage(`fardin_walk_${i}`, `/assets/sprites/fardin_walk_${i}.png`);
      this.loadImage(`fardin_run_${i}`, `/assets/sprites/fardin_run_${i}.png`);
      this.loadImage(`fardin_shoot_${i}`, `/assets/sprites/fardin_shoot_${i}.png`);
      this.loadImage(`fardin_crouch_${i}`, `/assets/sprites/fardin_crouch_${i}.png`);
      this.loadImage(`fardin_hit_${i}`, `/assets/sprites/fardin_hit_${i}.png`);
      this.loadImage(`fardin_death_${i}`, `/assets/sprites/fardin_death_${i}.png`);
      this.loadImage(`fardin_propose_${i}`, `/assets/sprites/fardin_propose_${i}.png`);
    }

    // Moumita Sprites
    for (let i = 0; i < 4; i++) {
      this.loadImage(`moumita_walk_${i}`, `/assets/sprites/moumita_walk_${i}.png`);
      this.loadImage(`moumita_attack_${i}`, `/assets/sprites/moumita_attack_${i}.png`);
      this.loadImage(`moumita_hit_${i}`, `/assets/sprites/moumita_hit_${i}.png`);
      this.loadImage(`moumita_death_${i}`, `/assets/sprites/moumita_death_${i}.png`);
    }

    // Aariba Sprites
    for (let i = 0; i < 4; i++) {
      this.loadImage(`aariba_walk_${i}`, `/assets/sprites/aariba_walk_${i}.png`);
      this.loadImage(`aariba_attack_${i}`, `/assets/sprites/aariba_attack_${i}.png`);
      this.loadImage(`aariba_hit_${i}`, `/assets/sprites/aariba_hit_${i}.png`);
      this.loadImage(`aariba_death_${i}`, `/assets/sprites/aariba_death_${i}.png`);
    }

    // Minion & Farhana Sprites
    this.loadImage('zombie_minion', '/assets/sprites/zombie_minion.png');
    this.loadImage('zakia_idle', '/assets/sprites/zakia_saree_stand.png');
    this.loadImage('zakia_saree_stand', '/assets/sprites/zakia_saree_stand.png');
    this.loadImage('zakia_saree_gasp', '/assets/sprites/zakia_saree_gasp.png');
    this.loadImage('zakia_saree_kneel_1', '/assets/sprites/zakia_saree_kneel_1.png');
    this.loadImage('zakia_saree_kneel_2', '/assets/sprites/zakia_saree_kneel_2.png');
    this.loadImage('zakia_saree_happy', '/assets/sprites/zakia_saree_happy.png');
    this.loadImage('fardeen_propose_box', '/assets/sprites/fardeen_propose_box.png');

    // Pickups
    this.loadImage('pickup_bayern', '/assets/sprites/pickup_bayern.png');
    this.loadImage('pickup_health', '/assets/sprites/pickup_health.png');
    this.loadImage('pickup_ammo', '/assets/sprites/pickup_ammo.png');
  }

  // --- GAME STATE FLOW ---

  public setGameState(newState: GameState) {
    this.state = newState;
    this.stateTimer = 0;

    if (newState === GameState.TITLE) {
      soundManager.stopBGM();
    } else if (newState === GameState.STUDIO_INTRO) {
      soundManager.stopBGM();
      this.startStudioIntro();
    } else if (newState === GameState.LEVEL1) {
      soundManager.playBGM('battle');
      this.waveQuota = 14;
      this.waveSpawnTimer = 0.5;
    } else if (newState === GameState.LEVEL2_BOSS) {
      soundManager.playBGM('boss');
      this.currentBoss = new MoumitaBoss();
      this.enemies = [];
    } else if (newState === GameState.LEVEL3_BOSS) {
      soundManager.playBGM('boss');
      this.currentBoss = new AaribaBoss();
      this.enemies = [];
    } else if (newState === GameState.TRANSITION) {
      soundManager.stopBGM();
    } else if (newState === GameState.TAJ_MAHAL) {
      soundManager.playBGM('romantic');
      this.startTajMahalSequence();
    } else if (newState === GameState.TWIST_WAKEUP) {
      soundManager.stopBGM();
      soundManager.playRecordScratch();
      soundManager.playAlarm();
    } else if (newState === GameState.BIRTHDAY) {
      soundManager.playBGM('birthday');
      soundManager.playCheer();
    }

    if (this.onStateChange) {
      this.onStateChange(this.state);
    }
    this.broadcastHud();
  }

  public startGame() {
    this.player = new Player();
    this.enemies = [];
    this.bullets = [];
    this.pickups = [];
    this.shellCasings = [];
    this.shockwaves = [];
    this.acidPuddles = [];
    this.particles = [];
    this.speechBubbles = [];
    this.floatingTexts = [];
    this.totalKills = 0;
    this.currentBoss = null;

    this.setGameState(GameState.INTRO);

    const introScript: DialogueLine[] = [
      { speaker: 'TANVIR', portrait: 'portrait_fardin.jpg', text: "I'm ready for the game, let's win!" },
      {
        speaker: 'TANVIR',
        portrait: 'portrait_fardin.jpg',
        text: 'BREAKING NEWS: A zombie outbreak has swallowed the city, and Farhana is trapped at the Taj Mahal in Agra!'
      },
      {
        speaker: 'TANVIR',
        portrait: 'portrait_fardin.jpg',
        text: "I don't care how many undead stand in my way. Mia San Mia! I'm coming, Farhana!"
      }
    ];

    this.startDialogue(introScript, () => {
      this.setGameState(GameState.LEVEL1);
    });
  }

  public onLevel1Complete() {
    this.setGameState(GameState.LEVEL2_INTRO);
    const moumitaScript: DialogueLine[] = [
      { speaker: 'TANVIR', portrait: 'portrait_fardin.jpg', text: 'Halt! Who locked down the highway exits?!' },
      {
        speaker: 'MORGANA',
        portrait: 'portrait_moumita.jpg',
        text: "You're looking at her, intruder! I am Morgana, supreme warlord of this sector! Nobody passes without kneeling!"
      },
      {
        speaker: 'TANVIR',
        portrait: 'portrait_fardin.jpg',
        text: "I don't have time for your tyrannical syndicate, Morgana! Clear the path to Agra immediately!"
      },
      {
        speaker: 'MORGANA',
        portrait: 'portrait_moumita.jpg',
        text: "Hahaha! The only place you're headed is six feet underground! Enforcers, tear him apart!"
      }
    ];

    this.startDialogue(moumitaScript, () => {
      this.setGameState(GameState.LEVEL2_BOSS);
    });
  }

  public onMoumitaDefeated() {
    const postMoumitaScript: DialogueLine[] = [
      {
        speaker: 'TANVIR',
        portrait: 'portrait_fardin.jpg',
        text: "Morgana's blockade is shattered! Her syndicate won't be terrorizing this sector anymore."
      },
      {
        speaker: 'TANVIR',
        portrait: 'portrait_fardin.jpg',
        text: "The highway toward Agra is open, but toxic smoke is rising ahead. Farhana, hold on!"
      }
    ];

    this.startDialogue(postMoumitaScript, () => {
      this.startAaribaEncounter();
    });
  }

  public startAaribaEncounter() {
    this.setGameState(GameState.LEVEL3_INTRO);
    const aaribaScript: DialogueLine[] = [
      { speaker: 'TANVIR', portrait: 'portrait_fardin.jpg', text: 'Who is poisoning the atmosphere?! The entire highway is covered in acid mist!' },
      {
        speaker: 'VIPERA',
        portrait: 'portrait_aariba.jpg',
        text: 'Welcome to my testing grounds, Tanvir! I am Vipera, supreme overlord of the toxic wastes!'
      },
      {
        speaker: 'TANVIR',
        portrait: 'portrait_fardin.jpg',
        text: 'You engineered this biological horror?! Stand down or be taken down!'
      },
      {
        speaker: 'VIPERA',
        portrait: 'portrait_aariba.jpg',
        text: "You may have overthrown Morgana, but my neurotoxins will dissolve you into ash! Die!"
      }
    ];

    this.startDialogue(aaribaScript, () => {
      this.setGameState(GameState.LEVEL3_BOSS);
    });
  }

  public onAaribaDefeated() {
    const postAaribaScript: DialogueLine[] = [
      {
        speaker: 'TANVIR',
        portrait: 'portrait_fardin.jpg',
        text: "It's finished... Both regional warlords have been vanquished."
      },
      {
        speaker: 'TANVIR',
        portrait: 'portrait_fardin.jpg',
        text: 'The toxic clouds are parting. Agra is right ahead... I see the golden sunset over the Taj Mahal!'
      }
    ];

    this.startDialogue(postAaribaScript, () => {
      this.setGameState(GameState.TRANSITION);
    });
  }

  public startTajMahalSequence() {
    this.cinematicStage = 0;
    this.cinematicTimer = 0;
    this.cinematicLetterbox = 0;
    this.cinematicRingSparkle = 0;
    this.cinematicBannerAlpha = 0;
    this.proposalFadeAlpha = 0;

    this.cinematicFardin = { x: 120, y: 475, frame: 0, state: 'walk' };
    this.cinematicFarhana = { x: 620, y: 475, frame: 0, state: 'idle' };
  }

  // --- STUDIO INTRO ---

  public startStudioIntro() {
    this.studioIntroTimer = 0;
    this.studioSparkPlayed = false;
    this.studioGlitchPlayed = false;
    this.studioImpactPlayed = false;
    this.studioShimmerPlayed = false;
    this.studioIntroParticles = [];

    for (let i = 0; i < 45; i++) {
      this.studioIntroParticles.push({
        x: 480 + (Math.random() - 0.5) * 550,
        y: 270 + (Math.random() - 0.5) * 320,
        vx: (Math.random() - 0.5) * 80,
        vy: (Math.random() - 0.5) * 80,
        size: 2 + Math.random() * 3,
        color: Math.random() < 0.65 ? '#00d2d3' : Math.random() < 0.85 ? '#ffffff' : '#0984e3',
        alpha: 0.35 + Math.random() * 0.65
      });
    }
  }

  // --- DIALOGUE SYSTEM ---

  public startDialogue(script: DialogueLine[], onComplete?: () => void) {
    this.dialogueQueue = script;
    this.dialogueIndex = 0;
    this.dialogueOnComplete = onComplete || null;
    this.dialogueActive = true;
    this.showDialogueLine();
  }

  private showDialogueLine() {
    const item = this.dialogueQueue[this.dialogueIndex];
    if (!item) {
      this.closeDialogue();
      return;
    }
    this.dialogueSpeaker = item.speaker;
    this.dialoguePortrait = item.portrait;
    this.dialogueFullText = item.text;
    this.dialogueDisplayedText = '';
    this.dialogueCharIndex = 0;
    this.dialogueTypeTimer = 0;

    this.broadcastDialogue();
  }

  public advanceDialogue() {
    if (!this.dialogueActive) return;

    if (this.dialogueCharIndex < this.dialogueFullText.length) {
      this.dialogueCharIndex = this.dialogueFullText.length;
      this.dialogueDisplayedText = this.dialogueFullText;
      this.broadcastDialogue();
    } else {
      this.dialogueIndex++;
      if (this.dialogueIndex < this.dialogueQueue.length) {
        this.showDialogueLine();
      } else {
        this.closeDialogue();
      }
    }
  }

  public closeDialogue() {
    this.dialogueActive = false;
    this.broadcastDialogue();
    if (this.dialogueOnComplete) {
      const cb = this.dialogueOnComplete;
      this.dialogueOnComplete = null;
      cb();
    }
  }

  private broadcastDialogue() {
    if (this.onDialogueUpdate) {
      this.onDialogueUpdate({
        active: this.dialogueActive,
        speaker: this.dialogueSpeaker,
        text: this.dialogueDisplayedText,
        portrait: this.dialoguePortrait
      });
    }
  }

  // --- FLOATING TEXTS & SPEECH BUBBLES ---

  public spawnFloatingText(x: number, y: number, text: string, color: string) {
    this.floatingTexts.push({
      x,
      y,
      text,
      color,
      life: 1.2,
      maxLife: 1.2
    });
  }

  public spawnSpeechBubble(target: { x: number; y: number; height?: number }, text: string, color: string = '#ff4757') {
    this.speechBubbles.push({
      target,
      text,
      color,
      life: 2.5,
      maxLife: 2.5
    });
  }

  public spawnParticle(
    x: number,
    y: number,
    vx: number,
    vy: number,
    color: string,
    size: number,
    life: number,
    type: 'circle' | 'spark' | 'heart' | 'sparkle' | 'acid' | 'smoke' = 'circle'
  ) {
    this.particles.push({
      x,
      y,
      vx,
      vy,
      color,
      size,
      life,
      maxLife: life,
      type
    });
  }

  public spawnBloodSplatter(x: number, y: number, color: string = '#ff4757') {
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2;
      const spd = 40 + Math.random() * 110;
      this.spawnParticle(x, y, Math.cos(a) * spd, Math.sin(a) * spd - 30, color, 3 + Math.random() * 3, 0.45);
    }
  }

  public spawnMuzzleFlash(x: number, y: number, angle: number) {
    for (let i = 0; i < 6; i++) {
      const spd = 80 + Math.random() * 120;
      const a = angle + (Math.random() - 0.5) * 0.6;
      this.spawnParticle(x, y, Math.cos(a) * spd, Math.sin(a) * spd, '#ffeaa7', 2.5, 0.15, 'spark');
    }
  }

  // --- SMART AUTO-AIM ---

  public getEffectiveAim(): { x: number; y: number } {
    if (!this.autoAimEnabled && !this.isVirtualFirePressed) {
      return this.mouse;
    }

    // Find closest enemy or boss to player
    let closestTarget: { x: number; y: number } | null = null;
    let minDist = 480;

    if (this.currentBoss && !this.currentBoss.isDead) {
      const d = Math.hypot(this.currentBoss.x - this.player.x, this.currentBoss.y - this.player.y);
      if (d < minDist) {
        minDist = d;
        closestTarget = { x: this.currentBoss.x, y: this.currentBoss.y - 45 };
      }
    }

    for (const e of this.enemies) {
      if (e.isDead) continue;
      const d = Math.hypot(e.x - this.player.x, e.y - this.player.y);
      if (d < minDist) {
        minDist = d;
        closestTarget = { x: e.x, y: e.y - 40 };
      }
    }

    if (closestTarget) {
      return closestTarget;
    }

    return this.mouse;
  }

  // --- GAME LOOP ---

  private startLoop() {
    const loop = (now: number) => {
      const dt = Math.min(0.1, (now - this.lastTime) / 1000);
      this.lastTime = now;

      this.update(dt);
      this.render();

      this.animFrameId = requestAnimationFrame(loop);
    };

    this.animFrameId = requestAnimationFrame(loop);
  }

  public update(dt: number) {
    this.stateTimer += dt;

    // Typewriter update for dialogue
    if (this.dialogueActive) {
      if (this.dialogueCharIndex < this.dialogueFullText.length) {
        this.dialogueTypeTimer += dt;
        if (this.dialogueTypeTimer >= 0.02) {
          this.dialogueTypeTimer = 0;
          this.dialogueDisplayedText += this.dialogueFullText[this.dialogueCharIndex];
          this.dialogueCharIndex++;
          this.broadcastDialogue();
        }
      }
    }

    // Screen Shake decay
    if (this.screenShake > 0) {
      this.screenShake = Math.max(0, this.screenShake - dt * 25);
    }

    // Particle updates
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
      if (p.life <= 0) this.particles.splice(i, 1);
    }

    // Floating text updates
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const ft = this.floatingTexts[i];
      ft.y -= 25 * dt;
      ft.life -= dt;
      if (ft.life <= 0) this.floatingTexts.splice(i, 1);
    }

    // Speech Bubbles updates
    for (let i = this.speechBubbles.length - 1; i >= 0; i--) {
      const sb = this.speechBubbles[i];
      sb.life -= dt;
      if (sb.life <= 0) this.speechBubbles.splice(i, 1);
    }

    // Shell Casings updates
    for (let i = this.shellCasings.length - 1; i >= 0; i--) {
      if (!this.shellCasings[i].update(dt)) this.shellCasings.splice(i, 1);
    }

    // Shockwaves updates
    for (let i = this.shockwaves.length - 1; i >= 0; i--) {
      const sw = this.shockwaves[i];
      if (!sw.update(dt)) {
        this.shockwaves.splice(i, 1);
        continue;
      }
      // Check collision with player if not damaged yet
      if (!sw.hasDamagedPlayer && this.player.hp > 0) {
        const d = Math.hypot(this.player.x - sw.x, this.player.y - sw.y);
        if (Math.abs(d - sw.currentRadius) < 22) {
          sw.hasDamagedPlayer = true;
          this.player.takeDamage(
            sw.damage,
            amt => (this.screenShake = amt),
            (x, y, c) => this.spawnBloodSplatter(x, y, c),
            (x, y, t, c) => this.spawnFloatingText(x, y, t, c),
            () => this.setGameState(GameState.GAMEOVER)
          );
        }
      }
    }

    // Acid Puddles updates
    for (let i = this.acidPuddles.length - 1; i >= 0; i--) {
      const ap = this.acidPuddles[i];
      if (!ap.update(dt)) {
        this.acidPuddles.splice(i, 1);
        continue;
      }
      // Damage player if walking in toxic puddle
      if (this.player.hp > 0) {
        const d = Math.hypot(this.player.x - ap.x, (this.player.y - ap.y) * 2);
        if (d < ap.radius && Math.random() < 0.25) {
          this.player.takeDamage(
            6,
            amt => (this.screenShake = amt),
            (x, y, c) => this.spawnBloodSplatter(x, y, c),
            (x, y, t, c) => this.spawnFloatingText(x, y, t, c),
            () => this.setGameState(GameState.GAMEOVER)
          );
        }
      }
    }

    // Bullet updates & collisions
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const b = this.bullets[i];
      if (!b.update(dt)) {
        this.bullets.splice(i, 1);
        continue;
      }

      if (b.isEnemy && this.player.hp > 0) {
        if (Math.hypot(b.x - this.player.x, b.y - (this.player.y - 45)) < 24) {
          this.player.takeDamage(
            b.damage,
            amt => (this.screenShake = amt),
            (x, y, c) => this.spawnBloodSplatter(x, y, c),
            (x, y, t, c) => this.spawnFloatingText(x, y, t, c),
            () => this.setGameState(GameState.GAMEOVER)
          );
          this.bullets.splice(i, 1);
          continue;
        }
      }

      if (!b.isEnemy) {
        let hit = false;
        for (let j = this.enemies.length - 1; j >= 0; j--) {
          const e = this.enemies[j];
          if (Math.hypot(b.x - e.x, b.y - (e.y - 40)) < 26) {
            e.takeDamage(
              b.damage,
              this.pickups,
              (x, y, c) => this.spawnBloodSplatter(x, y, c),
              (x, y, t, c) => this.spawnFloatingText(x, y, t, c),
              () => {
                this.totalKills++;
                this.broadcastHud();
              }
            );
            this.bullets.splice(i, 1);
            hit = true;
            break;
          }
        }
        if (hit) continue;

        if (this.currentBoss && !this.currentBoss.isDead) {
          if (Math.hypot(b.x - this.currentBoss.x, b.y - (this.currentBoss.y - 50)) < 38) {
            this.currentBoss.takeDamage(
              b.damage,
              (x, y, c) => this.spawnBloodSplatter(x, y, c),
              (x, y, t, c) => this.spawnFloatingText(x, y, t, c),
              () => {
                this.totalKills++;
                this.broadcastHud();
                if (this.currentBoss instanceof MoumitaBoss) {
                  this.onMoumitaDefeated();
                } else {
                  this.onAaribaDefeated();
                }
              }
            );
            this.bullets.splice(i, 1);
            continue;
          }
        }
      }
    }

    // Pickups updates
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      if (!this.pickups[i].update(dt)) this.pickups.splice(i, 1);
    }

    // Continuous fire if mouse is held down or virtual fire button is held
    const isShootingActive =
      this.isMouseDown || this.isVirtualFirePressed || this.keys['f'] || this.keys[' '];
    if (
      isShootingActive &&
      (this.state === GameState.LEVEL1 ||
        this.state === GameState.LEVEL2_BOSS ||
        this.state === GameState.LEVEL3_BOSS)
    ) {
      const aim = this.getEffectiveAim();
      if (this.player.shootCooldown <= 0) {
        this.player.shoot(
          aim,
          this.bullets,
          this.shellCasings,
          amt => (this.screenShake = amt),
          (x, y, a) => this.spawnMuzzleFlash(x, y, a)
        );
        this.broadcastHud();
      }
    }

    // Active State Logic
    if (this.state === GameState.LEVEL1) {
      const aim = this.getEffectiveAim();
      this.player.update(
        dt,
        this.keys,
        this.touchStick,
        aim,
        this.pickups,
        this.bullets,
        this.shellCasings,
        amt => (this.screenShake = amt),
        (x, y, c) => this.spawnBloodSplatter(x, y, c),
        (x, y, t, c) => this.spawnFloatingText(x, y, t, c),
        (x, y, a) => this.spawnMuzzleFlash(x, y, a),
        () => this.setGameState(GameState.GAMEOVER)
      );

      this.waveSpawnTimer -= dt;
      if (this.waveSpawnTimer <= 0 && this.enemies.length < 8 && this.waveQuota > 0) {
        this.waveSpawnTimer = 1.6 + Math.random() * 1.2;
        const count = Math.min(2, this.waveQuota);
        for (let i = 0; i < count; i++) {
          const side = Math.random() < 0.5 ? -40 : GAME_WIDTH + 40;
          const y = FLOOR_MIN_Y + Math.random() * (FLOOR_MAX_Y - FLOOR_MIN_Y);
          this.enemies.push(new ZombieMinion(side, y));
        }
        this.waveQuota -= count;
      }

      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        e.update(dt, this.player.x, this.player.y, dmg => {
          this.player.takeDamage(
            dmg,
            amt => (this.screenShake = amt),
            (x, y, c) => this.spawnBloodSplatter(x, y, c),
            (x, y, t, c) => this.spawnFloatingText(x, y, t, c),
            () => this.setGameState(GameState.GAMEOVER)
          );
          this.broadcastHud();
        });
        if (e.isDead) this.enemies.splice(i, 1);
      }

      if (this.waveQuota <= 0 && this.enemies.length === 0) {
        this.onLevel1Complete();
      }
    } else if (this.state === GameState.LEVEL2_BOSS || this.state === GameState.LEVEL3_BOSS) {
      const aim = this.getEffectiveAim();
      this.player.update(
        dt,
        this.keys,
        this.touchStick,
        aim,
        this.pickups,
        this.bullets,
        this.shellCasings,
        amt => (this.screenShake = amt),
        (x, y, c) => this.spawnBloodSplatter(x, y, c),
        (x, y, t, c) => this.spawnFloatingText(x, y, t, c),
        (x, y, a) => this.spawnMuzzleFlash(x, y, a),
        () => this.setGameState(GameState.GAMEOVER)
      );

      if (this.currentBoss instanceof MoumitaBoss) {
        this.currentBoss.update(
          dt,
          this.player.x,
          this.player.y,
          dmg => {
            this.player.takeDamage(
              dmg,
              amt => (this.screenShake = amt),
              (x, y, c) => this.spawnBloodSplatter(x, y, c),
              (x, y, t, c) => this.spawnFloatingText(x, y, t, c),
              () => this.setGameState(GameState.GAMEOVER)
            );
            this.broadcastHud();
          },
          this.bullets,
          this.shockwaves,
          this.enemies,
          amt => (this.screenShake = amt),
          (t, c) => this.spawnSpeechBubble(this.currentBoss!, t, c),
          (x, y, vx, vy, c, s, l) => this.spawnParticle(x, y, vx, vy, c, s, l),
          () => {
            this.totalKills++;
            this.broadcastHud();
            this.onMoumitaDefeated();
          }
        );
      } else if (this.currentBoss instanceof AaribaBoss) {
        this.currentBoss.update(
          dt,
          this.player.x,
          this.player.y,
          this.player.facingRight,
          dmg => {
            this.player.takeDamage(
              dmg,
              amt => (this.screenShake = amt),
              (x, y, c) => this.spawnBloodSplatter(x, y, c),
              (x, y, t, c) => this.spawnFloatingText(x, y, t, c),
              () => this.setGameState(GameState.GAMEOVER)
            );
            this.broadcastHud();
          },
          this.bullets,
          this.shockwaves,
          this.acidPuddles,
          amt => (this.screenShake = amt),
          (t, c) => this.spawnSpeechBubble(this.currentBoss!, t, c),
          (x, y, vx, vy, c, s, l) => this.spawnParticle(x, y, vx, vy, c, s, l),
          () => {
            this.totalKills++;
            this.broadcastHud();
            this.onAaribaDefeated();
          }
        );
      }

      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const e = this.enemies[i];
        e.update(dt, this.player.x, this.player.y, dmg => {
          this.player.takeDamage(
            dmg,
            amt => (this.screenShake = amt),
            (x, y, c) => this.spawnBloodSplatter(x, y, c),
            (x, y, t, c) => this.spawnFloatingText(x, y, t, c),
            () => this.setGameState(GameState.GAMEOVER)
          );
          this.broadcastHud();
        });
        if (e.isDead) this.enemies.splice(i, 1);
      }

      this.broadcastHud();
    } else if (this.state === GameState.TRANSITION) {
      if (this.stateTimer >= 2.0) {
        this.setGameState(GameState.TAJ_MAHAL);
      }
    } else if (this.state === GameState.TAJ_MAHAL) {
      this.updateTajMahalCutscene(dt);
    } else if (this.state === GameState.STUDIO_INTRO) {
      this.updateStudioIntro(dt);
    }
  }

  // --- TAJ MAHAL CUTSCENE ---

  private updateTajMahalCutscene(dt: number) {
    this.cinematicTimer += dt;
    this.cinematicRingSparkle += dt;

    if (this.cinematicStage >= 1) {
      this.cinematicLetterbox = Math.min(42, this.cinematicLetterbox + dt * 45);
    }
    if (this.cinematicStage >= 3) {
      this.proposalFadeAlpha = Math.min(1, this.proposalFadeAlpha + dt * 2.5);
    }

    // Stage 0: Tanvir walks toward Farhana along the marble terrace
    if (this.cinematicStage === 0) {
      if (this.cinematicFardin.x < 505) {
        this.cinematicFardin.x += 100 * dt;
        this.cinematicFardin.frame = Math.floor(this.cinematicTimer * 6) % 4;
      } else {
        this.cinematicStage = 1;
        this.cinematicFardin.state = 'idle';

        const romanticScript: DialogueLine[] = [
          {
            speaker: 'TANVIR',
            portrait: 'portrait_fardin.jpg',
            text: 'Farhana! I made it... I fought through hordes of undead and toppled both district warlords...'
          },
          {
            speaker: 'FARHANA',
            portrait: 'portrait_zakia.jpg',
            text: 'Tanvir... you really fought all of those monsters and defeated both tyrannical warlords just to find me?!'
          },
          {
            speaker: 'TANVIR',
            portrait: 'portrait_fardin.jpg',
            text: 'Mia San Mia in football... but in life, no trophy compares to having you by my side.'
          },
          {
            speaker: 'TANVIR',
            portrait: 'portrait_fardin.jpg',
            text: "There's only one question I've been waiting to ask you..."
          }
        ];

        this.startDialogue(romanticScript, () => {
          // Stage 2: Heartbeat buildup!
          this.cinematicStage = 2;
          soundManager.playHeartbeat();

          window.setTimeout(() => {
            // Stage 3: The Velvet Box Presentation
            this.cinematicStage = 3;
            soundManager.playRomanticChime();

            window.setTimeout(() => {
              const proposalQuestion: DialogueLine[] = [
                {
                  speaker: 'TANVIR',
                  portrait: 'portrait_fardin.jpg',
                  text: 'Farhana... will you marry me? 💍'
                }
              ];

              this.startDialogue(proposalQuestion, () => {
                // Stage 4: Farhana's Joyful Reaction!
                this.cinematicStage = 4;
                this.cinematicFarhana.state = 'react';

                window.setTimeout(() => {
                  const proposalAnswer: DialogueLine[] = [
                    {
                      speaker: 'FARHANA',
                      portrait: 'portrait_zakia.jpg',
                      text: 'YES! A MILLION TIMES YES, TANVIR!! ❤️💍'
                    }
                  ];

                  this.startDialogue(proposalAnswer, () => {
                    // Stage 5: Grand Celebration Climax!
                    this.cinematicStage = 5;
                    soundManager.playProposalFanfare();

                    for (let i = 0; i < 70; i++) {
                      const angle = Math.random() * Math.PI * 2;
                      const speed = 70 + Math.random() * 200;
                      const colors = ['#ff4757', '#ff6b81', '#f1c40f', '#2ed573', '#a55eea', '#ffffff'];
                      const c = colors[Math.floor(Math.random() * colors.length)];
                      this.spawnParticle(
                        560,
                        420,
                        Math.cos(angle) * speed,
                        Math.sin(angle) * speed,
                        c,
                        5 + Math.random() * 4,
                        3.2,
                        'heart'
                      );
                    }

                    window.setTimeout(() => {
                      // Comedic dream reveal twist!
                      soundManager.playRecordScratch();
                      this.setGameState(GameState.TWIST_WAKEUP);
                    }, 4000);
                  });
                }, 600);
              });
            }, 800);
          }, 900);
        });
      }
    } else if (this.cinematicStage === 5) {
      this.cinematicBannerAlpha = Math.min(1, this.cinematicBannerAlpha + dt * 2.5);
      if (Math.random() < 0.6) {
        const colors = ['#ff4757', '#ffd32a', '#2ed573', '#ff6b81', '#ffffff'];
        this.spawnParticle(
          520 + Math.random() * 80,
          440,
          (Math.random() - 0.5) * 80,
          -90 - Math.random() * 120,
          colors[Math.floor(Math.random() * colors.length)],
          4 + Math.random() * 3,
          2.0,
          'sparkle'
        );
      }
    }
  }

  // --- STUDIO INTRO UPDATE ---

  private updateStudioIntro(dt: number) {
    this.studioIntroTimer += dt;

    if (this.studioIntroTimer >= 0.0 && !this.studioSparkPlayed) {
      this.studioSparkPlayed = true;
      soundManager.playStudioSpark();
    }
    if (this.studioIntroTimer >= 0.22 && !this.studioGlitchPlayed) {
      this.studioGlitchPlayed = true;
      soundManager.playStudioGlitch();
    }
    if (this.studioIntroTimer >= 0.6 && !this.studioImpactPlayed) {
      this.studioImpactPlayed = true;
      soundManager.playStudioImpact();
      this.screenShake = 16;
    }
    if (this.studioIntroTimer >= 0.9 && !this.studioShimmerPlayed) {
      this.studioShimmerPlayed = true;
      soundManager.playStudioShimmer();
    }

    for (const p of this.studioIntroParticles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    if (this.studioIntroTimer >= 1.5) {
      this.startGame();
    }
  }

  // --- RENDER PASS ---

  public render() {
    if (!this.ctx || !this.canvas) return;
    const ctx = this.ctx;

    ctx.save();

    if (this.screenShake > 0) {
      const rx = (Math.random() - 0.5) * this.screenShake * 2;
      const ry = (Math.random() - 0.5) * this.screenShake * 2;
      ctx.translate(rx, ry);
    }

    if (this.state === GameState.STUDIO_INTRO) {
      this.renderStudioIntro();
      ctx.restore();
      return;
    }

    if (
      this.state === GameState.LEVEL1 ||
      this.state === GameState.LEVEL2_INTRO ||
      this.state === GameState.LEVEL2_BOSS ||
      this.state === GameState.LEVEL3_INTRO ||
      this.state === GameState.LEVEL3_BOSS
    ) {
      this.renderStreetLevel();
    } else if (this.state === GameState.TRANSITION) {
      this.renderTransitionScene();
    } else if (this.state === GameState.TAJ_MAHAL) {
      this.renderTajMahalScene();
    } else {
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
    }

    // Render entities depth-sorted by Y so characters overlap properly
    if (
      this.state === GameState.LEVEL1 ||
      this.state === GameState.LEVEL2_BOSS ||
      this.state === GameState.LEVEL3_BOSS ||
      this.state === GameState.LEVEL2_INTRO ||
      this.state === GameState.LEVEL3_INTRO
    ) {
      // Acid puddles on floor beneath characters
      this.acidPuddles.forEach(ap => ap.draw(ctx));

      // Shell casings on floor
      this.shellCasings.forEach(sc => sc.draw(ctx));

      // Pickups on floor
      this.pickups.forEach(pk => pk.draw(ctx, this.images));

      // Entities sorted by Y
      const renderList: Array<{ y: number; draw: () => void }> = [];
      if (this.player) {
        renderList.push({ y: this.player.y, draw: () => this.player.draw(ctx, this.images) });
      }
      this.enemies.forEach(e => {
        renderList.push({ y: e.y, draw: () => e.draw(ctx, this.images) });
      });
      if (this.currentBoss) {
        renderList.push({ y: this.currentBoss.y, draw: () => this.currentBoss!.draw(ctx, this.images) });
      }

      renderList.sort((a, b) => a.y - b.y);
      renderList.forEach(item => item.draw());

      // Shockwaves
      this.shockwaves.forEach(sw => sw.draw(ctx));

      // Bullets
      this.bullets.forEach(b => b.draw(ctx));

      // Speech Bubbles over characters
      this.renderSpeechBubbles();

      // Crosshair
      this.renderCrosshair();
    }

    // Floating combat text & damage numbers
    this.renderFloatingTexts();

    // Particles
    this.renderParticles();

    ctx.restore();
  }

  private renderStreetLevel() {
    if (!this.ctx) return;
    const bg = this.images['level_street'];
    if (bg && bg.complete && bg.naturalWidth > 0) {
      this.ctx.drawImage(bg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
    } else {
      this.ctx.fillStyle = '#2d1b36';
      this.ctx.fillRect(0, 0, GAME_WIDTH, 260);
      this.ctx.fillStyle = '#1e2029';
      this.ctx.fillRect(0, 260, GAME_WIDTH, 280);
    }
  }

  private renderTransitionScene() {
    if (!this.ctx) return;
    const alpha = Math.min(1, this.stateTimer / 2.0);
    const bg1 = this.images['level_street'];
    const bg2 = this.images['taj_mahal'];

    if (bg1 && bg1.complete) this.ctx.drawImage(bg1, 0, 0, GAME_WIDTH, GAME_HEIGHT);
    if (bg2 && bg2.complete) {
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.drawImage(bg2, 0, 0, GAME_WIDTH, GAME_HEIGHT);
      this.ctx.restore();
    }

    // Drifting road dust and sunset sparkles
    if (Math.random() < 0.4) {
      this.spawnParticle(
        Math.random() * GAME_WIDTH,
        Math.random() * GAME_HEIGHT,
        0,
        -30,
        '#ff9f43',
        4,
        1.2,
        'sparkle'
      );
    }
  }

  private renderTajMahalScene() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    ctx.save();

    if (this.cinematicLetterbox > 0) {
      const zoom = 1 + 0.15 * (this.cinematicLetterbox / 42);
      ctx.translate(560, 440);
      ctx.scale(zoom, zoom);
      ctx.translate(-560, -440);
    }

    if (this.proposalFadeAlpha < 1) {
      const bg = this.images['taj_mahal'];
      if (bg && bg.complete && bg.naturalWidth > 0) {
        ctx.drawImage(bg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
      }

      // Sunset spotlight on couple
      const spotlight = ctx.createRadialGradient(560, 440, 40, 560, 440, 360);
      spotlight.addColorStop(0, 'rgba(255, 240, 200, 0.22)');
      spotlight.addColorStop(0.5, 'rgba(255, 180, 120, 0.08)');
      spotlight.addColorStop(1, 'rgba(15, 10, 25, 0.45)');
      ctx.fillStyle = spotlight;
      ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

      // Heartbeat pulse in stage 2
      if (this.cinematicStage === 2) {
        const pulse = 1 + Math.sin(this.cinematicTimer * 16) * 0.25;
        ctx.save();
        ctx.translate(560, 380);
        ctx.scale(pulse, pulse);
        ctx.font = '22px "Press Start 2P", monospace';
        ctx.textAlign = 'center';
        ctx.shadowColor = '#ff4757';
        ctx.shadowBlur = 18;
        ctx.fillText('💓', 0, 0);
        ctx.restore();
      }

      // Farhana sprite on terrace
      if (this.cinematicFarhana) {
        ctx.save();
        ctx.translate(this.cinematicFarhana.x, this.cinematicFarhana.y);
        ctx.scale(-1, 1);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 22, 6, 0, 0, Math.PI * 2);
        ctx.fill();

        const zImg =
          this.cinematicFarhana.state === 'react'
            ? this.images['zakia_saree_gasp'] || this.images['zakia_saree_happy']
            : this.images['zakia_saree_stand'] || this.images['zakia_idle'];
        if (zImg && zImg.complete && zImg.naturalWidth > 0) {
          const dh = 90;
          const dw = Math.round(dh * (zImg.naturalWidth / zImg.naturalHeight));
          ctx.drawImage(zImg, -dw / 2, -dh, dw, dh);
        }
        ctx.restore();
      }

      // Tanvir sprite walking toward Farhana
      if (this.cinematicFardin) {
        ctx.save();
        ctx.translate(this.cinematicFardin.x, this.cinematicFardin.y);
        ctx.fillStyle = 'rgba(0, 0, 0, 0.42)';
        ctx.beginPath();
        ctx.ellipse(0, 0, 26, 7, 0, 0, Math.PI * 2);
        ctx.fill();

        const fImg =
          this.cinematicFardin.state === 'walk'
            ? this.images[`fardin_walk_${this.cinematicFardin.frame}`]
            : this.images['fardin_idle_0'];
        if (fImg && fImg.complete && fImg.naturalWidth > 0) {
          const dw = 54;
          const dh = 92;
          ctx.drawImage(fImg, -dw / 2, -dh, dw, dh);
          ctx.fillStyle = '#dc052d';
          ctx.fillRect(-10, -dh + 42, 20, 6);
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(-6, -dh + 43, 4, 4);
        }
        ctx.restore();
      }
    }

    // Climax Proposal Frame
    if (this.proposalFadeAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.proposalFadeAlpha;
      const propBg = this.images['proposal_cinematic'];
      if (propBg && propBg.complete && propBg.naturalWidth > 0) {
        ctx.drawImage(propBg, 0, 0, GAME_WIDTH, GAME_HEIGHT);
      }
      ctx.restore();
    }

    // Drifting rose petals
    if (Math.random() < 0.35) {
      this.spawnParticle(
        Math.random() * GAME_WIDTH,
        -10,
        (Math.random() - 0.5) * 40,
        40 + Math.random() * 30,
        '#ff7675',
        5,
        4.0,
        'sparkle'
      );
    }

    ctx.restore();

    // Celebration Banner Plaque in Stage 5
    if (this.cinematicBannerAlpha > 0) {
      ctx.save();
      ctx.globalAlpha = this.cinematicBannerAlpha;
      const bX = 220;
      const bY = 55;
      const bW = 520;
      const bH = 80;

      ctx.fillStyle = 'rgba(15, 12, 28, 0.92)';
      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(bX, bY, bW, bH, 12);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#f39c12';
      ctx.fillRect(bX + 6, bY + 6, 6, 6);
      ctx.fillRect(bX + bW - 12, bY + 6, 6, 6);
      ctx.fillRect(bX + 6, bY + bH - 12, 6, 6);
      ctx.fillRect(bX + bW - 12, bY + bH - 12, 6, 6);

      ctx.textAlign = 'center';
      ctx.font = '16px "Press Start 2P", monospace';
      ctx.fillStyle = '#f1c40f';
      ctx.shadowColor = '#ff9f43';
      ctx.shadowBlur = 10;
      ctx.fillText('✨ SHE SAID YES! ✨', GAME_WIDTH / 2, bY + 34);

      ctx.font = '11px "Press Start 2P", monospace';
      ctx.fillStyle = '#2ed573';
      ctx.shadowBlur = 6;
      ctx.fillText('💍 TANVIR & FARHANA FOREVER 💍', GAME_WIDTH / 2, bY + 62);
      ctx.restore();
    }

    // Cinematic Letterbox Black Bars
    if (this.cinematicLetterbox > 0) {
      ctx.fillStyle = '#0a0a14';
      ctx.fillRect(0, 0, GAME_WIDTH, this.cinematicLetterbox);
      ctx.fillRect(0, GAME_HEIGHT - this.cinematicLetterbox, GAME_WIDTH, this.cinematicLetterbox);

      ctx.strokeStyle = '#f1c40f';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, this.cinematicLetterbox);
      ctx.lineTo(GAME_WIDTH, this.cinematicLetterbox);
      ctx.moveTo(0, GAME_HEIGHT - this.cinematicLetterbox);
      ctx.lineTo(GAME_WIDTH, GAME_HEIGHT - this.cinematicLetterbox);
      ctx.stroke();
    }
  }

  private renderStudioIntro() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const t = this.studioIntroTimer;
    const cx = GAME_WIDTH / 2;
    const cy = GAME_HEIGHT / 2;

    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

    if (t < 0.2) {
      const p = Math.min(1.0, t / 0.2);
      const intensity = Math.sin(p * Math.PI);
      const sparkR = 25 + 50 * intensity;
      const grad = ctx.createRadialGradient(cx, cy, 2, cx, cy, sparkR);
      grad.addColorStop(0, 'rgba(255, 255, 255, 0.98)');
      grad.addColorStop(0.25, 'rgba(0, 210, 255, 0.9)');
      grad.addColorStop(0.65, 'rgba(9, 132, 227, 0.45)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, sparkR, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Show Studio Logo
      const logo = this.images['studio_logo'];
      if (logo && logo.complete && logo.naturalWidth > 0) {
        ctx.save();
        const scale = Math.min(1.0, (t - 0.2) * 2);
        ctx.translate(cx, cy);
        ctx.scale(scale, scale);
        ctx.drawImage(logo, -110, -110, 220, 220);
        ctx.restore();
      } else {
        ctx.font = '16px "Press Start 2P", monospace';
        ctx.fillStyle = '#00d2d3';
        ctx.textAlign = 'center';
        ctx.fillText('TINY PLAY GAME STUDIO', cx, cy);
      }
    }
  }

  private renderSpeechBubbles() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    this.speechBubbles.forEach(sb => {
      ctx.save();
      const posX = sb.target.x;
      const posY = sb.target.y - 120;

      ctx.font = '8px "Press Start 2P", monospace';
      const tw = ctx.measureText(sb.text).width;
      const bw = tw + 16;
      const bh = 22;

      ctx.fillStyle = 'rgba(15, 12, 28, 0.92)';
      ctx.strokeStyle = sb.color;
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.roundRect(posX - bw / 2, posY - bh / 2, bw, bh, 5);
      ctx.fill();
      ctx.stroke();

      // Tail
      ctx.fillStyle = 'rgba(15, 12, 28, 0.92)';
      ctx.beginPath();
      ctx.moveTo(posX - 5, posY + bh / 2);
      ctx.lineTo(posX + 5, posY + bh / 2);
      ctx.lineTo(posX, posY + bh / 2 + 8);
      ctx.closePath();
      ctx.fill();

      ctx.fillStyle = sb.color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(sb.text, posX, posY);

      ctx.restore();
    });
  }

  private renderCrosshair() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const aim = this.getEffectiveAim();

    ctx.save();
    ctx.translate(aim.x, aim.y);
    ctx.strokeStyle = '#ffd32a';
    ctx.lineWidth = 1.5;

    ctx.beginPath();
    ctx.arc(0, 0, 7, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-11, 0);
    ctx.lineTo(-4, 0);
    ctx.moveTo(4, 0);
    ctx.lineTo(11, 0);
    ctx.moveTo(0, -11);
    ctx.lineTo(0, -4);
    ctx.moveTo(0, 4);
    ctx.lineTo(0, 11);
    ctx.stroke();

    ctx.restore();
  }

  private renderFloatingTexts() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    this.floatingTexts.forEach(ft => {
      ctx.save();
      const alpha = Math.min(1, ft.life / 0.4);
      ctx.globalAlpha = alpha;
      ctx.font = '10px "Press Start 2P", monospace';
      ctx.fillStyle = ft.color;
      ctx.strokeStyle = '#000000';
      ctx.lineWidth = 2;
      ctx.textAlign = 'center';
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });
  }

  private renderParticles() {
    if (!this.ctx) return;
    const ctx = this.ctx;

    this.particles.forEach(p => {
      ctx.save();
      const alpha = Math.min(1, p.life / (p.maxLife * 0.3));
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;

      if (p.type === 'heart') {
        ctx.font = `${Math.round(p.size * 2)}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('❤️', p.x, p.y);
      } else if (p.type === 'spark') {
        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size * 2, p.size);
      } else {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.restore();
    });
  }

  // --- BROADCAST TO REACT UI ---

  public broadcastHud() {
    if (!this.onHudUpdate) return;

    let stageName = 'STAGE 1: CITY OUTBREAK';
    if (this.state === GameState.LEVEL2_INTRO || this.state === GameState.LEVEL2_BOSS) {
      stageName = 'STAGE 2: BOSS - MORGANA';
    } else if (this.state === GameState.LEVEL3_INTRO || this.state === GameState.LEVEL3_BOSS) {
      stageName = 'STAGE 3: BOSS - VIPERA';
    } else if (this.state === GameState.TAJ_MAHAL) {
      stageName = 'FINAL STAGE: TAJ MAHAL';
    }

    let bossData: { name: string; hp: number; maxHp: number; color?: string } | undefined;
    if (this.currentBoss && !this.currentBoss.isDead) {
      const isMoumita = this.currentBoss instanceof MoumitaBoss;
      bossData = {
        name: isMoumita ? '☠️ MORGANA - DISTRICT WARLORD' : '☠️ VIPERA - TOXIC OVERLORD',
        hp: this.currentBoss.hp,
        maxHp: this.currentBoss.maxHp,
        color: isMoumita ? '#ff4757' : '#a55eea'
      };
    }

    this.onHudUpdate({
      playerHp: this.player ? this.player.hp : 100,
      playerMaxHp: this.player ? this.player.maxHp : 100,
      ammo: this.player ? this.player.ammo : 12,
      maxAmmo: this.player ? this.player.maxAmmo : 12,
      kills: this.totalKills,
      stageName,
      isReloading: this.player ? this.player.isReloading : false,
      boss: bossData
    });
  }
}
