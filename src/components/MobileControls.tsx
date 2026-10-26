import React, { useRef, useState, useEffect } from 'react';

interface MobileControlsProps {
  onStickMove: (x: number, y: number) => void;
  onFireDown: () => void;
  onFireUp: () => void;
  onReload: () => void;
  onDodge: () => void;
}

export const MobileControls: React.FC<MobileControlsProps> = ({
  onStickMove,
  onFireDown,
  onFireUp,
  onReload,
  onDodge
}) => {
  const joystickZoneRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isStickActive, setIsStickActive] = useState<boolean>(false);
  const touchIdRef = useRef<number | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (touchIdRef.current !== null) return;
    const touch = e.changedTouches[0];
    touchIdRef.current = touch.identifier;
    setIsStickActive(true);
    handleStick(touch.clientX, touch.clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        handleStick(touch.clientX, touch.clientY);
        break;
      }
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    for (let i = 0; i < e.changedTouches.length; i++) {
      const touch = e.changedTouches[i];
      if (touch.identifier === touchIdRef.current) {
        touchIdRef.current = null;
        setIsStickActive(false);
        setKnobPos({ x: 0, y: 0 });
        onStickMove(0, 0);
        break;
      }
    }
  };

  const handleStick = (clientX: number, clientY: number) => {
    if (!joystickZoneRef.current) return;
    const rect = joystickZoneRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const maxRadius = rect.width / 2;
    const dist = Math.hypot(dx, dy);

    if (dist <= maxRadius) {
      setKnobPos({ x: dx, y: dy });
      onStickMove(dx / maxRadius, dy / maxRadius);
    } else {
      const angle = Math.atan2(dy, dx);
      const kx = Math.cos(angle) * maxRadius;
      const ky = Math.sin(angle) * maxRadius;
      setKnobPos({ x: kx, y: ky });
      onStickMove(Math.cos(angle), Math.sin(angle));
    }
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-25 flex justify-between items-end p-4 select-none font-['Press_Start_2P']">
      {/* Virtual Analog Joystick */}
      <div
        ref={joystickZoneRef}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        className="pointer-events-auto relative w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-black/45 border-2 border-white/25 flex items-center justify-center backdrop-blur-xs touch-none shadow-lg active:border-[#00d2d3]"
      >
        <div
          className={`w-12 h-12 rounded-full border border-white/40 shadow-md transition-transform ${
            isStickActive ? 'bg-[#00d2d3]/80' : 'bg-white/30'
          }`}
          style={{
            transform: `translate(${knobPos.x}px, ${knobPos.y}px)`
          }}
        />
      </div>

      {/* Action Buttons */}
      <div className="pointer-events-auto flex flex-col items-end gap-2.5">
        <div className="flex gap-2">
          <button
            onTouchStart={e => {
              e.preventDefault();
              onReload();
            }}
            onClick={onReload}
            className="w-13 h-13 rounded-full bg-[#1e1022]/90 border-2 border-[#00d2d3] text-[#00d2d3] text-[7.5px] flex items-center justify-center shadow-lg active:scale-90"
          >
            RELOAD
          </button>

          <button
            onTouchStart={e => {
              e.preventDefault();
              onDodge();
            }}
            onClick={onDodge}
            className="w-13 h-13 rounded-full bg-[#1e1022]/90 border-2 border-[#2ed573] text-[#2ed573] text-[7.5px] flex items-center justify-center shadow-lg active:scale-90"
          >
            DODGE
          </button>
        </div>

        {/* Big Fire Button */}
        <button
          onTouchStart={e => {
            e.preventDefault();
            onFireDown();
          }}
          onTouchEnd={e => {
            e.preventDefault();
            onFireUp();
          }}
          onMouseDown={onFireDown}
          onMouseUp={onFireUp}
          className="w-18 h-18 rounded-full bg-gradient-to-r from-[#dc052d] to-[#ff4757] border-3 border-[#ffd32a] text-white text-[10px] flex items-center justify-center shadow-[0_0_20px_rgba(255,71,87,0.7)] active:scale-90 cursor-pointer font-bold"
        >
          FIRE 🔥
        </button>
      </div>
    </div>
  );
};
