import React from 'react';
import { X, Gamepad2, Shield, Zap, Sparkles } from 'lucide-react';

interface ControlsGuideModalProps {
  onClose: () => void;
}

export const ControlsGuideModal: React.FC<ControlsGuideModalProps> = ({ onClose }) => {
  return (
    <div className="absolute inset-0 bg-black/85 z-50 flex items-center justify-center p-4 select-none font-['Press_Start_2P']">
      <div className="bg-[#121022] border-2 border-[#2ed573] rounded-2xl p-5 sm:p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(46,213,115,0.4)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-[#2ed573]" />
            <span className="text-[12px] sm:text-[14px] text-[#2ed573]">CONTROLS & POWER-UPS</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-[#1e1022] border border-white/20 text-white rounded-lg hover:border-[#ff4757]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Controls Grid */}
        <div className="flex flex-col gap-3 text-[8.5px] sm:text-[9.5px]">
          <div className="bg-[#17142b] p-3 rounded-xl border border-white/10 flex items-center justify-between">
            <span className="text-[#a4b0be]">MOVE / RUN</span>
            <span className="text-[#f1c40f] font-mono">[W A S D] / [ARROWS] / JOYSTICK</span>
          </div>

          <div className="bg-[#17142b] p-3 rounded-xl border border-white/10 flex items-center justify-between">
            <span className="text-[#a4b0be]">AIM & SHOOT</span>
            <span className="text-[#ffd32a] font-mono">[MOUSE CLICK] / [HOLD FIRE]</span>
          </div>

          <div className="bg-[#17142b] p-3 rounded-xl border border-white/10 flex items-center justify-between">
            <span className="text-[#a4b0be]">DODGE ROLL</span>
            <span className="text-[#2ed573] font-mono">[SPACEBAR] / [DODGE BUTTON]</span>
          </div>

          <div className="bg-[#17142b] p-3 rounded-xl border border-white/10 flex items-center justify-between">
            <span className="text-[#a4b0be]">RELOAD AMMO</span>
            <span className="text-[#00d2d3] font-mono">[R] / [RELOAD BUTTON]</span>
          </div>
        </div>

        {/* Pickups guide */}
        <div className="border-t border-white/10 pt-3">
          <div className="text-[9.5px] text-[#ffd32a] mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>PICKUPS & BONUSES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[8px]">
            <div className="p-2.5 bg-[#1e1022] border border-[#dc052d]/60 rounded-lg text-center">
              <div className="text-[#dc052d] font-bold mb-1">⚽ BAYERN KIT</div>
              <div className="text-[#dfe4ea] leading-normal font-mono">+Speed & Rapid Fire Boost!</div>
            </div>

            <div className="p-2.5 bg-[#1e1022] border border-[#ff4757]/60 rounded-lg text-center">
              <div className="text-[#ff4757] font-bold mb-1">❤️ MEDKIT</div>
              <div className="text-[#dfe4ea] leading-normal font-mono">+35 Health Points recovery</div>
            </div>

            <div className="p-2.5 bg-[#1e1022] border border-[#00d2d3]/60 rounded-lg text-center">
              <div className="text-[#00d2d3] font-bold mb-1">⚡ AMMO BOX</div>
              <div className="text-[#dfe4ea] leading-normal font-mono">Instant full magazine refill</div>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-2 py-3 bg-[#2ed573] hover:bg-[#26af5f] text-black font-bold text-[10px] rounded-xl border border-white transition-all cursor-pointer text-center"
        >
          GOT IT, LET'S PLAY!
        </button>
      </div>
    </div>
  );
};
