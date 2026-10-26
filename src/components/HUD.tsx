import React from 'react';
import { Volume2, VolumeX, Maximize2 } from 'lucide-react';

interface HUDProps {
  playerHp: number;
  playerMaxHp: number;
  ammo: number;
  maxAmmo: number;
  kills: number;
  stageName: string;
  isReloading: boolean;
  boss?: {
    name: string;
    hp: number;
    maxHp: number;
    color?: string;
  };
  isMuted: boolean;
  onToggleSound: () => void;
  onToggleFullscreen: () => void;
  onReloadClick: () => void;
}

export const HUD: React.FC<HUDProps> = ({
  playerHp,
  playerMaxHp,
  ammo,
  maxAmmo,
  kills,
  stageName,
  isReloading,
  boss,
  isMuted,
  onToggleSound,
  onToggleFullscreen,
  onReloadClick
}) => {
  const hpPct = Math.max(0, Math.min(100, (playerHp / playerMaxHp) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none z-20 flex flex-col justify-between p-3 sm:p-5 select-none font-['Press_Start_2P']">
      {/* Top Header */}
      <div className="flex justify-between items-start w-full gap-2">
        {/* Player Stats */}
        <div className="pointer-events-auto flex flex-col gap-1.5 bg-[#0f0f19]/90 border-2 border-[#dc052d] rounded-lg p-2.5 shadow-[0_4px_16px_rgba(0,0,0,0.8)] backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-[#ffcc00] tracking-wider drop-shadow-[1px_1px_#000]">TANVIR</span>
            <span className="bg-[#dc052d] text-white text-[8px] px-1.5 py-0.5 rounded font-bold tracking-tight">
              FC BAYERN
            </span>
          </div>

          {/* Health Bar */}
          <div className="flex items-center gap-2">
            <div className="w-28 sm:w-36 h-3 bg-[#1e1022] border border-[#ff4757] rounded-sm p-0.5 overflow-hidden">
              <div
                className={`h-full transition-all duration-150 rounded-xs ${
                  hpPct > 50 ? 'bg-[#2ed573]' : hpPct > 25 ? 'bg-[#ffa502]' : 'bg-[#ff4757] animate-pulse'
                }`}
                style={{ width: `${hpPct}%` }}
              />
            </div>
            <span className="text-[9px] text-[#a4b0be] font-mono">
              {Math.round(playerHp)}/{playerMaxHp}
            </span>
          </div>

          {/* Ammo Bar */}
          <div className="flex items-center gap-2 text-[9px] text-white">
            <span className="text-[#00d2d3]">⚡ AMMO:</span>
            <span className={ammo <= 3 ? 'text-[#ff4757] font-bold' : 'text-white'}>
              {ammo}/{maxAmmo}
            </span>
            {isReloading && (
              <span className="text-[#00d2d3] text-[8px] animate-pulse">RELOADING...</span>
            )}
            {!isReloading && ammo === 0 && (
              <button
                onClick={onReloadClick}
                className="text-[#ff4757] text-[8px] animate-bounce underline cursor-pointer"
              >
                [R] RELOAD!
              </button>
            )}
          </div>
        </div>

        {/* Center Stage Pill */}
        <div className="flex flex-col items-center">
          <div className="bg-[#1e1022]/90 border border-[#f1c40f] text-[#f1c40f] text-[9px] sm:text-[10px] px-3 py-1.5 rounded-full tracking-wider shadow-[0_0_12px_rgba(241,196,15,0.4)]">
            {stageName}
          </div>
        </div>

        {/* Top Right: Kills & Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0f0f19]/90 border border-[#2ed573] text-[#2ed573] text-[9px] sm:text-[10px] px-2.5 py-1.5 rounded-lg shadow-[0_2px_8px_rgba(0,0,0,0.6)]">
            <span>💀</span>
            <span className="text-[#a4b0be] hidden sm:inline">KILLS:</span>
            <span className="text-white font-bold">{kills}</span>
          </div>

          <button
            onClick={onToggleSound}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="p-2 bg-[#0f0f19]/90 border border-white/20 hover:border-[#f1c40f] text-white hover:text-[#f1c40f] rounded-lg transition-colors cursor-pointer shadow-md"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>

          <button
            onClick={onToggleFullscreen}
            title="Toggle Fullscreen"
            className="p-2 bg-[#0f0f19]/90 border border-white/20 hover:border-[#00d2d3] text-white hover:text-[#00d2d3] rounded-lg transition-colors cursor-pointer shadow-md"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Boss Health Bar (Bottom / Center HUD) */}
      {boss && (
        <div className="w-full max-w-lg mx-auto flex flex-col items-center gap-1.5 bg-[#0f0f19]/95 border-2 border-[#ff4757] rounded-lg p-2.5 shadow-[0_0_24px_rgba(255,71,87,0.5)] pointer-events-auto animate-fade-in">
          <div className="text-[10px] sm:text-[11px] text-[#ff4757] tracking-wider drop-shadow-[0_0_8px_rgba(255,71,87,0.8)] font-bold">
            {boss.name}
          </div>
          <div className="w-full h-3.5 bg-[#1e1022] border border-[#ff4757]/60 rounded-xs p-0.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#ff4757] to-[#ff6b81] transition-all duration-200"
              style={{ width: `${Math.max(0, Math.min(100, (boss.hp / boss.maxHp) * 100))}%` }}
            />
          </div>
          <div className="text-[8px] text-[#a4b0be]">
            {Math.round(boss.hp)} / {boss.maxHp} HP
          </div>
        </div>
      )}
    </div>
  );
};
