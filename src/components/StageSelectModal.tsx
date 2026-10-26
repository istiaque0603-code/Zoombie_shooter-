import React from 'react';
import { X, Play, MapPin, Skull, Heart, AlarmClock, Cake } from 'lucide-react';
import { GameState } from '../game/types';

interface StageSelectModalProps {
  onClose: () => void;
  onSelectStage: (stage: GameState) => void;
}

export const StageSelectModal: React.FC<StageSelectModalProps> = ({
  onClose,
  onSelectStage
}) => {
  const stages = [
    {
      state: GameState.LEVEL1,
      title: 'STAGE 1: CITY OUTBREAK',
      desc: 'Fight waves of urban zombies and gather Bayern pickups',
      badge: 'ZOMBIE SWARM',
      icon: <Skull className="w-4 h-4 text-[#ff4757]" />
    },
    {
      state: GameState.LEVEL2_BOSS,
      title: 'STAGE 2: DISTRICT WARLORD - MORGANA',
      desc: 'Dodge sonic decrees, warlord charges, and mutant enforcers',
      badge: 'WARLORD 1',
      icon: <Skull className="w-4 h-4 text-[#ff6b81]" />
    },
    {
      state: GameState.LEVEL3_BOSS,
      title: 'STAGE 3: TOXIC OVERLORD - VIPERA',
      desc: 'Evade toxic spiral projectiles, shadow teleports, and acid puddles',
      badge: 'WARLORD 2',
      icon: <Skull className="w-4 h-4 text-[#a55eea]" />
    },
    {
      state: GameState.TAJ_MAHAL,
      title: 'FINAL STAGE: TAJ MAHAL PROPOSAL',
      desc: 'Romantic sunset cutscene proposing to Farhana on marble terrace',
      badge: 'ROMANCE',
      icon: <Heart className="w-4 h-4 text-[#2ed573] fill-[#2ed573]" />
    },
    {
      state: GameState.TWIST_WAKEUP,
      title: 'COMEDIC TWIST: BEDROOM WAKEUP',
      desc: '07:15 AM alarm rings: Bro was sleeping the whole time 💀',
      badge: 'PLOT TWIST',
      icon: <AlarmClock className="w-4 h-4 text-[#f1c40f]" />
    },
    {
      state: GameState.BIRTHDAY,
      title: 'VICTORY FINALE: FROM ALL YOUR FRIENDS',
      desc: 'Victory celebration for Tanvir with stats and confetti',
      badge: 'CELEBRATION',
      icon: <Cake className="w-4 h-4 text-[#ffd32a]" />
    }
  ];

  return (
    <div className="absolute inset-0 bg-black/85 z-50 flex items-center justify-center p-4 select-none font-['Press_Start_2P']">
      <div className="bg-[#100d1c] border-2 border-[#f1c40f] rounded-2xl p-5 sm:p-6 max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(241,196,15,0.4)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#f1c40f]" />
            <span className="text-[12px] sm:text-[14px] text-[#f1c40f]">STAGE SELECT & PRACTICE</span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 bg-[#1e1022] border border-white/20 text-white rounded-lg hover:border-[#ff4757]"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List of Stages */}
        <div className="flex flex-col gap-2.5">
          {stages.map(st => (
            <button
              key={st.title}
              onClick={() => {
                onSelectStage(st.state);
                onClose();
              }}
              className="p-3 bg-[#171224] hover:bg-[#251b38] border border-white/15 hover:border-[#f1c40f] rounded-xl text-left flex items-center justify-between gap-3 transition-all cursor-pointer group"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 bg-black/40 rounded-lg shrink-0">{st.icon}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[9.5px] sm:text-[11px] text-white font-bold group-hover:text-[#f1c40f] truncate">
                      {st.title}
                    </span>
                    <span className="text-[7px] bg-[#f1c40f]/20 text-[#f1c40f] px-1.5 py-0.5 rounded shrink-0">
                      {st.badge}
                    </span>
                  </div>
                  <div className="text-[8px] text-[#a4b0be] mt-1 font-mono leading-tight">
                    {st.desc}
                  </div>
                </div>
              </div>

              <div className="shrink-0 p-2 bg-[#f1c40f]/10 group-hover:bg-[#f1c40f] text-[#f1c40f] group-hover:text-black rounded-lg transition-colors">
                <Play className="w-3.5 h-3.5 fill-current" />
              </div>
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-2 py-3 bg-[#f1c40f] hover:bg-[#e1b12c] text-black font-bold text-[10px] rounded-xl border border-white transition-all cursor-pointer text-center"
        >
          CLOSE
        </button>
      </div>
    </div>
  );
};
