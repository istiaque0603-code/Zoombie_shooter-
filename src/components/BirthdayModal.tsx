import React, { useEffect, useState } from 'react';
import { RotateCcw, Heart, Trophy, Zap, Gift } from 'lucide-react';

interface BirthdayModalProps {
  kills: number;
  onReplay: () => void;
}

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  rot: number;
}

export const BirthdayModal: React.FC<BirthdayModalProps> = ({ kills, onReplay }) => {
  const [confetti, setConfetti] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    // Generate initial confetti shower
    const colors = ['#ff4757', '#ffd32a', '#2ed573', '#00d2d3', '#a55eea', '#ffffff'];
    const initial: ConfettiPiece[] = [];
    for (let i = 0; i < 40; i++) {
      initial.push({
        id: Math.random(),
        x: Math.random() * 100,
        y: Math.random() * -30,
        vx: (Math.random() - 0.5) * 2,
        vy: 2 + Math.random() * 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 6 + Math.random() * 6,
        rot: Math.random() * 360
      });
    }
    setConfetti(initial);

    const interval = setInterval(() => {
      setConfetti(prev =>
        prev.map(c => {
          let ny = c.y + c.vy;
          let nx = c.x + c.vx;
          if (ny > 110) {
            ny = -10;
            nx = Math.random() * 100;
          }
          return { ...c, x: nx, y: ny, rot: (c.rot + 4) % 360 };
        })
      );
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="absolute inset-0 bg-black/85 z-40 flex flex-col items-center justify-center p-4 sm:p-6 select-none font-['Press_Start_2P'] text-center overflow-hidden">
      {/* Falling Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map(c => (
          <div
            key={c.id}
            className="absolute rounded-xs shadow-sm"
            style={{
              left: `${c.x}%`,
              top: `${c.y}%`,
              width: `${c.size}px`,
              height: `${c.size * 1.5}px`,
              backgroundColor: c.color,
              transform: `rotate(${c.rot}deg)`
            }}
          />
        ))}
      </div>

      <div className="bg-[#100c1e]/95 border-3 border-[#ffd32a] rounded-2xl p-6 sm:p-8 max-w-xl w-full shadow-[0_0_60px_rgba(255,211,42,0.5)] flex flex-col items-center gap-4 relative z-10 backdrop-blur-md">
        <div className="flex items-center gap-2 text-[#ff4757] text-[15px] sm:text-[20px] font-bold tracking-wider animate-bounce">
          <span>🎉</span>
          <span>CONGRATULATIONS TANVIR!</span>
          <span>🏆</span>
        </div>

        <div className="text-[9px] sm:text-[11px] text-[#f1c40f] tracking-widest uppercase">
          SECTORS LIBERATED & CELEBRATION ❤️
        </div>

        {/* Stat Chips */}
        <div className="grid grid-cols-2 gap-2.5 w-full my-2 text-[8px] sm:text-[9.5px]">
          <div className="p-3 bg-[#1e1022] border border-[#ff4757]/60 rounded-xl flex items-center gap-2 shadow-sm">
            <span className="text-base">💀</span>
            <div className="text-left">
              <div className="text-[#a4b0be] text-[7px]">ZOMBIES BLASTED</div>
              <div className="text-[#ff4757] font-bold mt-0.5">{kills} KILLS</div>
            </div>
          </div>

          <div className="p-3 bg-[#1e1022] border border-[#a55eea]/60 rounded-xl flex items-center gap-2 shadow-sm">
            <span className="text-base">💔</span>
            <div className="text-left">
              <div className="text-[#a4b0be] text-[7px]">WARLORDS TOPPLED</div>
              <div className="text-[#a55eea] font-bold mt-0.5">2 / 2 DEFEATED</div>
            </div>
          </div>

          <div className="p-3 bg-[#1e1022] border border-[#2ed573]/60 rounded-xl flex items-center gap-2 shadow-sm">
            <Heart className="w-4 h-4 text-[#2ed573] fill-[#2ed573]" />
            <div className="text-left">
              <div className="text-[#a4b0be] text-[7px]">FARHANA PROPOSAL</div>
              <div className="text-[#2ed573] font-bold mt-0.5">100% SUCCESS</div>
            </div>
          </div>

          <div className="p-3 bg-[#1e1022] border border-[#dc052d]/60 rounded-xl flex items-center gap-2 shadow-sm">
            <Trophy className="w-4 h-4 text-[#ffd32a]" />
            <div className="text-left">
              <div className="text-[#a4b0be] text-[7px]">FC BAYERN PRIDE</div>
              <div className="text-[#ffd32a] font-bold mt-0.5">MIA SAN MIA</div>
            </div>
          </div>
        </div>

        {/* Birthday message */}
        <div className="text-[9px] sm:text-[10px] text-[#dfe4ea] leading-relaxed bg-black/40 border border-white/10 p-3.5 rounded-xl text-center">
          "Congratulations Tanvir! May your year ahead be blessed with unforgettable goals, genuine joy, continuous success, and zero evil warlords! Have the absolute best journey ahead! ❤️"
        </div>

        <button
          onClick={onReplay}
          className="mt-2 py-3.5 px-8 bg-gradient-to-r from-[#dc052d] to-[#ff4757] hover:from-[#ff4757] hover:to-[#ff6b81] text-white text-[11px] sm:text-[12px] font-bold rounded-xl border-2 border-[#ffd32a] shadow-[0_0_25px_rgba(255,71,87,0.7)] transition-all cursor-pointer flex items-center gap-2.5 transform hover:scale-105 active:scale-95"
        >
          <RotateCcw className="w-4 h-4" />
          <span>RELIVE THE DREAM</span>
        </button>
      </div>
    </div>
  );
};
