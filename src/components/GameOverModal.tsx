import React from 'react';
import { RotateCcw } from 'lucide-react';

interface GameOverModalProps {
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({ onRestart }) => {
  return (
    <div className="absolute inset-0 bg-black/85 z-40 flex flex-col items-center justify-center p-6 select-none font-['Press_Start_2P'] text-center">
      <div className="bg-[#150f1f] border-3 border-[#ff4757] rounded-2xl p-6 sm:p-8 max-w-md w-full shadow-[0_0_40px_rgba(255,71,87,0.6)] flex flex-col items-center gap-4">
        <div className="text-[20px] sm:text-[24px] text-[#ff4757] tracking-wider drop-shadow-[0_2px_8px_rgba(255,71,87,0.8)] font-bold">
          YOU WERE CORNERED!
        </div>

        <p className="text-[10px] sm:text-[11px] text-[#a4b0be] leading-relaxed my-2">
          The district warlords held the road... But Farhana is still waiting at the Taj Mahal! Don't let Bayern Munich down!
        </p>

        <button
          onClick={onRestart}
          className="mt-4 py-3.5 px-6 bg-[#ff4757] hover:bg-[#ff6b81] text-white text-[11px] rounded-xl border-2 border-[#ffd32a] shadow-[0_0_20px_rgba(255,71,87,0.6)] transition-all cursor-pointer flex items-center gap-2 transform hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>TRY AGAIN</span>
        </button>
      </div>
    </div>
  );
};
