import React from 'react';
import { X, Volume2, VolumeX, Play, Square } from 'lucide-react';
import { soundManager, BgmType } from '../audio/SoundManager';

interface SoundboardModalProps {
  onClose: () => void;
  isMuted: boolean;
  onToggleSound: () => void;
}

export const SoundboardModal: React.FC<SoundboardModalProps> = ({
  onClose,
  isMuted,
  onToggleSound
}) => {
  const [currentBgm, setCurrentBgm] = React.useState<BgmType>(soundManager.currentBgm);

  const bgmTracks: Array<{ id: BgmType; name: string; desc: string }> = [
    { id: 'battle', name: 'CITY BATTLE GROOVE', desc: '130 BPM 8-bit chiptune with bassline & hi-hats' },
    { id: 'boss', name: 'BOSS FIGHT CADENCE', desc: 'Fast intense 105 BPM boss battle cadence' },
    { id: 'romantic', name: 'TAJ MAHAL ROMANCE', desc: 'Slow gentle arpeggios for proposal cinematic' },
    { id: 'birthday', name: 'VICTORY RETRO ANTHEM', desc: 'Joyful 8-bit chiptune victory celebration' }
  ];

  const sfxList = [
    { name: '💥 Gunshot Crack', fn: () => soundManager.playShoot() },
    { name: '🧟 Zombie Groan', fn: () => soundManager.playZombieGroan() },
    { name: '🩸 Zombie Hurt', fn: () => soundManager.playZombieHurt() },
    { name: '👹 Boss Roar', fn: () => soundManager.playBossRoar() },
    { name: '⚡ Boss Attack', fn: () => soundManager.playBossAttack() },
    { name: '🌊 Shockwave Slam', fn: () => soundManager.playShockwave() },
    { name: '💔 Player Hurt', fn: () => soundManager.playPlayerHurt() },
    { name: '💨 Dodge Swoosh', fn: () => soundManager.playDodge() },
    { name: '⭐ Pickup Chime', fn: () => soundManager.playPickup() },
    { name: '✨ Romantic Chime', fn: () => soundManager.playRomanticChime() },
    { name: '💓 Heartbeat Thump', fn: () => soundManager.playHeartbeat() },
    { name: '💍 Proposal Fanfare', fn: () => soundManager.playProposalFanfare() },
    { name: '⏰ 07:15 AM Alarm', fn: () => soundManager.playAlarm() },
    { name: '📻 Record Scratch', fn: () => soundManager.playRecordScratch() },
    { name: '🔮 Shadow Teleport', fn: () => soundManager.playTeleport() },
    { name: '🧪 Acid Sizzle', fn: () => soundManager.playAcidSizzle() },
    { name: '👏 Friends Cheer', fn: () => soundManager.playCheer() },
    { name: '🎬 Studio Impact', fn: () => soundManager.playStudioImpact() }
  ];

  const playBgm = (type: BgmType) => {
    soundManager.init();
    if (currentBgm === type) {
      soundManager.stopBGM();
      setCurrentBgm(null);
    } else {
      soundManager.playBGM(type);
      setCurrentBgm(type);
    }
  };

  const stopBgm = () => {
    soundManager.stopBGM();
    setCurrentBgm(null);
  };

  return (
    <div className="absolute inset-0 bg-black/85 z-50 flex items-center justify-center p-4 select-none font-['Press_Start_2P']">
      <div className="bg-[#121020] border-2 border-[#00d2d3] rounded-2xl p-5 sm:p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-[0_0_40px_rgba(0,210,211,0.4)] flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-base">🎵</span>
            <span className="text-[12px] sm:text-[14px] text-[#00d2d3]">RETRO SOUND TEST & JUKEBOX</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onToggleSound}
              className="p-1.5 bg-[#1e1022] border border-white/20 text-white rounded-lg hover:border-[#f1c40f]"
            >
              {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 bg-[#1e1022] border border-white/20 text-white rounded-lg hover:border-[#ff4757]"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* BGM Tracks */}
        <div>
          <div className="text-[10px] text-[#ffd32a] mb-2 flex items-center justify-between">
            <span>PROCEDURAL CHIPTUNE TRACKS</span>
            {currentBgm && (
              <button
                onClick={stopBgm}
                className="text-[8px] text-[#ff4757] flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Square className="w-3 h-3 fill-current" /> STOP MUSIC
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {bgmTracks.map(t => (
              <button
                key={t.id}
                onClick={() => playBgm(t.id)}
                className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                  currentBgm === t.id
                    ? 'bg-[#00d2d3]/20 border-[#00d2d3] shadow-[0_0_15px_rgba(0,210,211,0.5)]'
                    : 'bg-[#1e1022]/80 border-white/15 hover:border-white/40'
                }`}
              >
                <div>
                  <div className="text-[9px] text-white font-bold">{t.name}</div>
                  <div className="text-[7.5px] text-[#a4b0be] mt-1 font-mono">{t.desc}</div>
                </div>
                <div className="shrink-0 ml-2">
                  {currentBgm === t.id ? (
                    <Square className="w-3.5 h-3.5 fill-[#00d2d3] text-[#00d2d3]" />
                  ) : (
                    <Play className="w-3.5 h-3.5 text-[#00d2d3]" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* SFX List */}
        <div>
          <div className="text-[10px] text-[#ffd32a] mb-2">SYNTHESIZED SOUND EFFECTS</div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {sfxList.map(s => (
              <button
                key={s.name}
                onClick={() => {
                  soundManager.init();
                  s.fn();
                }}
                className="p-2.5 bg-[#1e1022]/80 hover:bg-[#2b1832] border border-white/15 hover:border-[#f1c40f] rounded-lg text-left text-[8px] text-[#dfe4ea] transition-all cursor-pointer truncate"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-2 py-3 bg-[#00d2d3] hover:bg-[#00b894] text-[#0f141d] font-bold text-[10px] rounded-xl border border-white transition-all cursor-pointer text-center"
        >
          BACK TO GAME
        </button>
      </div>
    </div>
  );
};
