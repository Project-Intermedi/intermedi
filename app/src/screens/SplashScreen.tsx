import { useEffect, useState } from 'react';

interface Props {
  onDone: () => void;
}

export default function SplashScreen({ onDone }: Props) {
  const [phase, setPhase] = useState<'enter' | 'hold' | 'exit'>('enter');

  useEffect(() => {
    // enter → hold after 400ms
    const t1 = setTimeout(() => setPhase('hold'), 400);
    // hold → exit after 2000ms
    const t2 = setTimeout(() => setPhase('exit'), 2000);
    // exit → done after 2400ms (400ms fade out)
    const t3 = setTimeout(() => onDone(), 2400);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); };
  }, [onDone]);

  return (
    <div
      className="h-full flex flex-col items-center justify-center bg-[#47795E] relative overflow-hidden"
      style={{
        transition: 'opacity 0.4s ease-out',
        opacity: phase === 'exit' ? 0 : 1,
      }}
    >
      {/* Background decorative circles */}
      <div
        className="absolute w-80 h-80 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.05)',
          top: '-60px', right: '-60px',
        }}
      />
      <div
        className="absolute w-56 h-56 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.05)',
          bottom: '-20px', left: '-40px',
        }}
      />
      <div
        className="absolute w-32 h-32 rounded-full"
        style={{
          background: 'rgba(255,255,255,0.06)',
          bottom: '120px', right: '30px',
        }}
      />

      {/* Scattered small pills background decoration */}
      <SmallPill x={40}  y={110} rotate={35}  color="rgba(255,255,255,0.12)" />
      <SmallPill x={310} y={160} rotate={-20} color="rgba(255,255,255,0.10)" />
      <SmallPill x={55}  y={620} rotate={55}  color="rgba(255,255,255,0.10)" />
      <SmallPill x={300} y={580} rotate={-45} color="rgba(255,255,255,0.12)" />
      <SmallPill x={160} y={80}  rotate={10}  color="rgba(224,122,95,0.25)" />
      <SmallPill x={240} y={670} rotate={-30} color="rgba(224,122,95,0.20)" />

      {/* Main content */}
      <div
        style={{
          transition: 'opacity 0.5s ease-out, transform 0.5s ease-out',
          opacity: phase === 'enter' ? 0 : 1,
          transform: phase === 'enter' ? 'translateY(16px)' : 'translateY(0)',
        }}
        className="flex flex-col items-center gap-0"
      >
        {/* Pill illustration */}
        <div className="mb-8 relative">
          {/* Glow */}
          <div
            className="absolute inset-0 rounded-full"
            style={{ filter: 'blur(28px)', background: 'rgba(224,122,95,0.45)', transform: 'scale(1.1)' }}
          />

          {/* Large pill capsule SVG */}
          <svg
            width="120" height="56" viewBox="0 0 120 56"
            style={{ position: 'relative', zIndex: 1, filter: 'drop-shadow(0 8px 20px rgba(0,0,0,0.25))' }}
          >
            {/* Left half — coral */}
            <path
              d="M28 4 H60 V52 H28 A24 24 0 0 1 28 4 Z"
              fill="#E07A5F"
            />
            {/* Right half — white */}
            <path
              d="M60 4 H92 A24 24 0 0 1 92 52 H60 V4 Z"
              fill="white"
            />
            {/* Dividing line */}
            <line x1="60" y1="4" x2="60" y2="52" stroke="rgba(0,0,0,0.08)" strokeWidth="1.5" />
            {/* Highlight sheen on left */}
            <path
              d="M36 10 Q44 8 52 10"
              stroke="rgba(255,255,255,0.35)" strokeWidth="3"
              strokeLinecap="round" fill="none"
            />
            {/* Highlight sheen on right */}
            <path
              d="M68 10 Q76 8 84 10"
              stroke="rgba(255,255,255,0.55)" strokeWidth="3"
              strokeLinecap="round" fill="none"
            />
          </svg>

          {/* Small orbiting pill */}
          <svg
            width="48" height="22" viewBox="0 0 48 22"
            style={{
              position: 'absolute',
              bottom: '-14px',
              right: '-28px',
              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.2))',
              transform: 'rotate(30deg)',
            }}
          >
            <path d="M11 2 H37 A9 9 0 0 1 37 20 H11 A9 9 0 0 1 11 2 Z" fill="rgba(255,255,255,0.25)" />
            <path d="M11 2 H24 V20 H11 A9 9 0 0 1 11 2 Z" fill="rgba(255,255,255,0.15)" />
            <line x1="24" y1="2" x2="24" y2="20" stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          </svg>

          {/* Tiny pill top-left */}
          <svg
            width="32" height="15" viewBox="0 0 32 15"
            style={{
              position: 'absolute',
              top: '-10px',
              left: '-22px',
              filter: 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))',
              transform: 'rotate(-25deg)',
            }}
          >
            <path d="M7.5 1.5 H24.5 A6 6 0 0 1 24.5 13.5 H7.5 A6 6 0 0 1 7.5 1.5 Z" fill="rgba(224,122,95,0.5)" />
            <line x1="16" y1="1.5" x2="16" y2="13.5" stroke="rgba(255,255,255,0.3)" strokeWidth="0.8" />
          </svg>
        </div>

        {/* App name */}
        <h1
          className="text-[42px] font-black text-white tracking-tight leading-none"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.15)' }}
        >
          인터메디
        </h1>

        {/* Tagline */}
        <p className="text-white/70 text-[15px] font-medium mt-3 text-center leading-relaxed px-8">
          처방전을 쉽게 이해하고<br/>안전하게 복약하세요
        </p>

        {/* Loading dots */}
        <div className="flex gap-2 mt-10">
          {[0, 1, 2].map(i => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-white/40"
              style={{
                animation: 'pulse 1.2s ease-in-out infinite',
                animationDelay: `${i * 0.2}s`,
              }}
            />
          ))}
        </div>
      </div>

      {/* Bottom label */}
      <p
        className="absolute bottom-10 text-white/40 text-[11px] font-medium"
        style={{
          transition: 'opacity 0.5s ease-out 0.3s',
          opacity: phase === 'enter' ? 0 : 1,
        }}
      >
        AI 기반 처방전 해석 서비스
      </p>
    </div>
  );
}

/* ── helpers ── */
function SmallPill({
  x, y, rotate, color,
}: {
  x: number; y: number; rotate: number; color: string;
}) {
  return (
    <svg
      width="36" height="16" viewBox="0 0 36 16"
      style={{ position: 'absolute', left: x, top: y, transform: `rotate(${rotate}deg)` }}
    >
      <path d="M8 1.5 H28 A6.5 6.5 0 0 1 28 14.5 H8 A6.5 6.5 0 0 1 8 1.5 Z" fill={color} />
      <line x1="18" y1="1.5" x2="18" y2="14.5" stroke="rgba(255,255,255,0.15)" strokeWidth="0.8" />
    </svg>
  );
}
