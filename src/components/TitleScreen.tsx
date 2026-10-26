import React from 'react';
import { Play, Map, Music, HelpCircle, Shield, Zap } from 'lucide-react';

interface TitleScreenProps {
  onStart: () => void;
  onOpenStageSelect: () => void;
  onOpenSoundboard: () => void;
  onOpenControls: () => void;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStart,
  onOpenStageSelect,
  onOpenSoundboard,
  onOpenControls
}) => {
  return (
    <div className="absolute inset-0 bg-[#0d0e15]/95 z-30 flex flex-col items-center justify-between p-6 select-none font-['Press_Start_2P'] overflow-y-auto">
      {/* Top Birthday Ribbon */}
      <div className="mt-2 bg-gradient-to-r from-[#dc052d] via-[#f1c40f] to-[#dc052d] text-white text-[9px] sm:text-[11px] px-4 py-2 rounded-full tracking-wider shadow-[0_0_20px_rgba(241,196,15,0.6)] animate-pulse">
        🏆 SPECIAL ARCADE EDITION 🏆
      </div>

      {/* Main Title Banner */}
      <div className="flex flex-col items-center gap-3 text-center my-auto py-4">
        <div className="text-[20px] sm:text-[34px] text-transparent bg-clip-text bg-gradient-to-b from-[#ffd32a] to-[#ff4757] tracking-wider drop-shadow-[0_4px_12px_rgba(255,71,87,0.8)] font-bold">
          NOT FAR FROM HOME
        </div>
        <div className="text-[10px] sm:text-[13px] text-[#00d2d3] tracking-widest drop-shadow-[0_2px_6px_rgba(0,210,211,0.6)]">
          TANVIR'S ZOMBIE SHOOTER
        </div>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[9px] text-[#ff6b81]">MIA SAN MIA</span>
          <span className="text-white/40">•</span>
          <span className="text-[9px] text-[#2ed573]">FARHANA AT TAJ MAHAL</span>
          <span className="text-white/40">•</span>
          <span className="text-[9px] text-[#a55eea]">WARLORDS TOPPLED</span>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-3.5 mt-8 w-full max-w-sm">
          <button
            onClick={onStart}
            className="w-full py-4 px-6 bg-gradient-to-r from-[#dc052d] to-[#ff4757] hover:from-[#ff4757] hover:to-[#ff6b81] text-white text-[12px] sm:text-[14px] rounded-xl border-3 border-[#ffd32a] shadow-[0_0_25px_rgba(255,71,87,0.7)] transition-all transform hover:scale-105 active:scale-95 cursor-pointer flex items-center justify-center gap-3 animate-pulse"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>PRESS START / PLAY</span>
          </button>

          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              onClick={onOpenStageSelect}
              className="py-2.5 px-2 bg-[#1e1022] hover:bg-[#2e1834] text-[#f1c40f] text-[8px] rounded-lg border border-[#f1c40f]/60 shadow-md transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
            >
              <Map className="w-3.5 h-3.5" />
              <span>STAGES</span>
            </button>

            <button
              onClick={onOpenSoundboard}
              className="py-2.5 px-2 bg-[#1e1022] hover:bg-[#2e1834] text-[#00d2d3] text-[8px] rounded-lg border border-[#00d2d3]/60 shadow-md transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
            >
              <Music className="w-3.5 h-3.5" />
              <span>JUKEBOX</span>
            </button>

            <button
              onClick={onOpenControls}
              className="py-2.5 px-2 bg-[#1e1022] hover:bg-[#2e1834] text-[#2ed573] text-[8px] rounded-lg border border-[#2ed573]/60 shadow-md transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              <span>HELP</span>
            </button>
          </div>
        </div>
      </div>

      {/* Controls Hint footer */}
      <div className="mt-auto text-center text-[7.5px] sm:text-[9px] text-[#a4b0be] bg-black/50 border border-white/10 px-4 py-2.5 rounded-lg max-w-xl">
        <span className="text-[#f1c40f]">[WASD/Arrows]</span> Move &bull;{' '}
        <span className="text-[#ffd32a]">[Mouse/Touch]</span> Aim & Shoot &bull;{' '}
        <span className="text-[#2ed573]">[Space]</span> Dodge Roll &bull;{' '}
        <span className="text-[#00d2d3]">[R]</span> Reload
      </div>
    </div>
  );
};
