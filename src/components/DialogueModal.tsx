import React from 'react';

interface DialogueModalProps {
  speaker: string;
  portrait: string;
  text: string;
  onAdvance: () => void;
}

export const DialogueModal: React.FC<DialogueModalProps> = ({
  speaker,
  portrait,
  text,
  onAdvance
}) => {
  return (
    <div
      onClick={onAdvance}
      className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-3xl bg-[#0f0c1c]/95 border-3 border-[#f1c40f] rounded-xl p-3 sm:p-4 shadow-[0_0_35px_rgba(241,196,15,0.45)] z-40 flex items-center gap-3 sm:gap-4 select-none cursor-pointer font-['Press_Start_2P']"
    >
      {/* Portrait Avatar */}
      <div className="shrink-0 w-16 h-16 sm:w-20 sm:h-20 border-2 border-[#f1c40f] rounded-lg overflow-hidden bg-black/60 shadow-md">
        <img
          src={`/assets/${portrait}`}
          alt={speaker}
          className="w-full h-full object-cover object-top"
          onError={e => {
            (e.target as HTMLElement).style.display = 'none';
          }}
        />
      </div>

      {/* Speech Content */}
      <div className="flex-1 flex flex-col gap-2 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[11px] sm:text-[13px] text-[#f1c40f] tracking-wide font-bold drop-shadow-[1px_1px_#000]">
            {speaker}
          </span>
          <span className="text-[7px] sm:text-[8px] text-[#2ed573] animate-pulse">
            CLICK / TAP TO CONTINUE ▶
          </span>
        </div>

        <div className="text-[9px] sm:text-[11px] text-white leading-relaxed tracking-wide min-h-[38px] break-words">
          {text}
          <span className="inline-block w-2 h-3.5 ml-1 bg-[#f1c40f] animate-ping" />
        </div>
      </div>
    </div>
  );
};
