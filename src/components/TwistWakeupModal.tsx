import React from 'react';
import { AlarmClock, ArrowRight } from 'lucide-react';

interface TwistWakeupModalProps {
  onContinue: () => void;
}

export const TwistWakeupModal: React.FC<TwistWakeupModalProps> = ({ onContinue }) => {
  return (
    <div className="absolute inset-0 bg-black/90 z-40 flex flex-col items-center justify-center p-4 sm:p-6 select-none font-['Press_Start_2P'] text-center">
      <div className="bg-[#121224]/95 border-3 border-[#f1c40f] rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-[0_0_50px_rgba(241,196,15,0.5)] flex flex-col items-center gap-5 relative overflow-hidden">
        {/* Subtle bedroom background tint */}
        <div
          className="absolute inset-0 opacity-15 bg-cover bg-center pointer-events-none"
          style={{ backgroundImage: "url('/assets/bedroom_wake.jpg')" }}
        />

        <div className="flex items-center gap-2 text-[#ff4757] text-[13px] sm:text-[16px] font-bold animate-pulse">
          <AlarmClock className="w-5 h-5 animate-bounce" />
          <span>⏰ 07:15 AM — BZZZZ! BZZZZ!</span>
        </div>

        <div className="text-[10px] sm:text-[11px] text-[#dfe4ea] leading-loose max-w-lg my-1">
          Wait... what on earth was that nightmare?!<br />
          Morgana was a ruthless district warlord?!<br />
          Vipera was firing toxic neurotoxin beams?!<br />
          And I was proposing at the Taj Mahal in Agra?!
        </div>

        <div className="py-2.5 px-4 bg-[#ff4757]/20 border border-[#ff4757] rounded-xl text-[12px] sm:text-[15px] text-[#ff4757] font-bold tracking-wider animate-pulse">
          💀 BRO WAS SLEEPING THE WHOLE TIME 💀
        </div>

        <button
          onClick={onContinue}
          className="mt-2 py-3.5 px-6 bg-[#2ed573] hover:bg-[#26af5f] text-[#0f141d] font-bold text-[11px] sm:text-[12px] rounded-xl border-2 border-[#ffffff] shadow-[0_0_20px_rgba(46,213,115,0.6)] transition-all cursor-pointer flex items-center gap-2 transform hover:scale-105 active:scale-95"
        >
          <span>CONTINUE</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
