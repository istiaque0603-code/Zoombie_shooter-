import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameEngine } from './game/GameEngine';
import { GameState, GAME_WIDTH, GAME_HEIGHT } from './game/types';
import { soundManager } from './audio/SoundManager';
import { HUD } from './components/HUD';
import { DialogueModal } from './components/DialogueModal';
import { TitleScreen } from './components/TitleScreen';
import { GameOverModal } from './components/GameOverModal';
import { TwistWakeupModal } from './components/TwistWakeupModal';
import { BirthdayModal } from './components/BirthdayModal';
import { MobileControls } from './components/MobileControls';
import { SoundboardModal } from './components/SoundboardModal';
import { StageSelectModal } from './components/StageSelectModal';
import { ControlsGuideModal } from './components/ControlsGuideModal';

interface HudState {
  playerHp: number;
  playerMaxHp: number;
  ammo: number;
  maxAmmo: number;
  kills: number;
  stageName: string;
  isReloading: boolean;
  boss?: { name: string; hp: number; maxHp: number; color?: string };
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);

  const [gameState, setGameState] = useState<GameState>(GameState.TITLE);
  const [hudState, setHudState] = useState<HudState>({
    playerHp: 100,
    playerMaxHp: 100,
    ammo: 12,
    maxAmmo: 12,
    kills: 0,
    stageName: 'STAGE 1: CITY OUTBREAK',
    isReloading: false,
    boss: undefined
  });

  const [dialogueState, setDialogueState] = useState({
    active: false,
    speaker: '',
    text: '',
    portrait: ''
  });

  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSoundboardOpen, setIsSoundboardOpen] = useState<boolean>(false);
  const [isStageSelectOpen, setIsStageSelectOpen] = useState<boolean>(false);
  const [isControlsOpen, setIsControlsOpen] = useState<boolean>(false);
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [isTouchDevice, setIsTouchDevice] = useState<boolean>(false);
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  // Initialize engine
  useEffect(() => {
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    setIsTouchDevice(isTouch);

    const checkOrientation = () => {
      setIsPortrait(window.innerHeight > window.innerWidth && window.innerWidth < 768);
    };
    checkOrientation();
    window.addEventListener('resize', checkOrientation);

    const engine = new GameEngine();
    engineRef.current = engine;

    engine.onStateChange = state => {
      setGameState(state);
    };

    engine.onHudUpdate = hud => {
      setHudState(hud);
    };

    engine.onDialogueUpdate = dlg => {
      setDialogueState(dlg);
    };

    if (canvasRef.current) {
      engine.init(canvasRef.current);
    }

    return () => {
      engine.destroy();
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      soundManager.init();
      const key = e.key.toLowerCase();
      if (engineRef.current) {
        engineRef.current.keys[key] = true;

        if (key === 'r') {
          engineRef.current.player.reload();
        }
        if (key === ' ' || key === 'space') {
          if (engineRef.current.dialogueActive) {
            engineRef.current.advanceDialogue();
          } else {
            engineRef.current.player.dodge();
          }
        }
        if (key === 'm') {
          const m = soundManager.toggleMute();
          setIsMuted(m);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (engineRef.current) {
        engineRef.current.keys[key] = false;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse aim & shooting coordinates mapped to internal 960x540 canvas resolution
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!canvasRef.current || !engineRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = GAME_WIDTH / rect.width;
    const scaleY = GAME_HEIGHT / rect.height;

    engineRef.current.mouse = {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY
    };
  }, []);

  const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    soundManager.init();
    if (engineRef.current) {
      if (engineRef.current.dialogueActive) {
        engineRef.current.advanceDialogue();
      } else {
        engineRef.current.isMouseDown = true;
      }
    }
  }, []);

  const handleMouseUp = useCallback(() => {
    if (engineRef.current) {
      engineRef.current.isMouseDown = false;
    }
  }, []);

  // Sound toggle
  const toggleSound = () => {
    soundManager.init();
    const m = soundManager.toggleMute();
    setIsMuted(m);
  };

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  // Game control methods
  const handleStartGame = () => {
    soundManager.init();
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleSelectStage = (stage: GameState) => {
    soundManager.init();
    if (engineRef.current) {
      if (stage === GameState.LEVEL1) {
        engineRef.current.startGame();
      } else {
        engineRef.current.setGameState(stage);
      }
    }
  };

  const handleRestart = () => {
    soundManager.init();
    if (engineRef.current) {
      engineRef.current.startGame();
    }
  };

  const handleTwistContinue = () => {
    soundManager.init();
    if (engineRef.current) {
      engineRef.current.setGameState(GameState.BIRTHDAY);
    }
  };

  const isCombatState =
    gameState === GameState.LEVEL1 ||
    gameState === GameState.LEVEL2_BOSS ||
    gameState === GameState.LEVEL3_BOSS;

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      className="relative w-screen h-screen bg-[#080811] flex items-center justify-center overflow-hidden select-none"
    >
      {/* 16:9 Aspect Ratio Game Container */}
      <div className="relative w-full max-w-[1280px] aspect-video max-h-screen bg-black flex items-center justify-center shadow-2xl overflow-hidden">
        {/* Main 960x540 Canvas */}
        <canvas
          ref={canvasRef}
          width={GAME_WIDTH}
          height={GAME_HEIGHT}
          className="w-full h-full object-contain block bg-[#0a0a14]"
        />

        {/* CRT Scanline & Vignette Effect */}
        {crtEnabled && (
          <>
            <div className="scanlines-overlay" />
            <div className="crt-vignette" />
          </>
        )}

        {/* HUD (shown during gameplay and transitions) */}
        {isCombatState && (
          <HUD
            playerHp={hudState.playerHp}
            playerMaxHp={hudState.playerMaxHp}
            ammo={hudState.ammo}
            maxAmmo={hudState.maxAmmo}
            kills={hudState.kills}
            stageName={hudState.stageName}
            isReloading={hudState.isReloading}
            boss={hudState.boss}
            isMuted={isMuted}
            onToggleSound={toggleSound}
            onToggleFullscreen={toggleFullscreen}
            onReloadClick={() => engineRef.current?.player.reload()}
          />
        )}

        {/* Dialogue Modal */}
        {dialogueState.active && (
          <DialogueModal
            speaker={dialogueState.speaker}
            portrait={dialogueState.portrait}
            text={dialogueState.text}
            onAdvance={() => engineRef.current?.advanceDialogue()}
          />
        )}

        {/* Title Screen */}
        {gameState === GameState.TITLE && (
          <TitleScreen
            onStart={handleStartGame}
            onOpenStageSelect={() => setIsStageSelectOpen(true)}
            onOpenSoundboard={() => setIsSoundboardOpen(true)}
            onOpenControls={() => setIsControlsOpen(true)}
          />
        )}

        {/* Game Over Screen */}
        {gameState === GameState.GAMEOVER && (
          <GameOverModal onRestart={handleRestart} />
        )}

        {/* Comedic Twist Wakeup */}
        {gameState === GameState.TWIST_WAKEUP && (
          <TwistWakeupModal onContinue={handleTwistContinue} />
        )}

        {/* Birthday Climax Screen */}
        {gameState === GameState.BIRTHDAY && (
          <BirthdayModal kills={hudState.kills} onReplay={handleRestart} />
        )}

        {/* Mobile Touch Virtual Controls */}
        {isTouchDevice && isCombatState && !dialogueState.active && (
          <MobileControls
            onStickMove={(x, y) => {
              if (engineRef.current) {
                engineRef.current.touchStick = { x, y };
              }
            }}
            onFireDown={() => {
              if (engineRef.current) {
                engineRef.current.isVirtualFirePressed = true;
              }
            }}
            onFireUp={() => {
              if (engineRef.current) {
                engineRef.current.isVirtualFirePressed = false;
              }
            }}
            onReload={() => engineRef.current?.player.reload()}
            onDodge={() => engineRef.current?.player.dodge()}
          />
        )}

        {/* Floating Settings Tool in Title or Pause */}
        <div className="absolute top-3 right-3 z-30 flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity">
          <button
            onClick={() => setCrtEnabled(prev => !prev)}
            title="Toggle CRT Scanline Effect"
            className="text-[7.5px] px-2 py-1 bg-black/60 border border-white/20 hover:border-[#f1c40f] text-white/80 rounded cursor-pointer"
          >
            CRT: {crtEnabled ? 'ON' : 'OFF'}
          </button>
        </div>
      </div>

      {/* Stage Select Modal */}
      {isStageSelectOpen && (
        <StageSelectModal
          onClose={() => setIsStageSelectOpen(false)}
          onSelectStage={handleSelectStage}
        />
      )}

      {/* Retro Soundboard / Jukebox Modal */}
      {isSoundboardOpen && (
        <SoundboardModal
          onClose={() => setIsSoundboardOpen(false)}
          isMuted={isMuted}
          onToggleSound={toggleSound}
        />
      )}

      {/* Controls Guide Modal */}
      {isControlsOpen && (
        <ControlsGuideModal onClose={() => setIsControlsOpen(false)} />
      )}

      {/* Mobile Portrait Warning Overlay */}
      {isPortrait && (
        <div className="fixed inset-0 z-50 bg-[#120d20] flex flex-col items-center justify-center p-6 text-center select-none font-['Press_Start_2P']">
          <div className="w-16 h-16 rounded-2xl border-3 border-[#ff4757] flex items-center justify-center text-2xl mb-4 animate-bounce">
            📱
          </div>
          <div className="text-[12px] text-[#ff4757] font-bold mb-2">
            PLEASE ROTATE YOUR PHONE
          </div>
          <div className="text-[8.5px] text-[#a4b0be] leading-relaxed max-w-xs mb-4">
            NOT FAR FROM HOME is crafted for landscape mode. Rotate your device horizontally for the full arcade experience!
          </div>
          <div className="text-[7.5px] text-[#f1c40f]">
            ⚡ TIP: Disable orientation lock if needed.
          </div>
        </div>
      )}
    </div>
  );
}
