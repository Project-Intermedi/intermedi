import type { PillShape } from '../types/pill';

const SHAPES: PillShape[] = ['전체', '원형', '타원형', '장방형', '캡슐형', '반원형', '삼각형', '사각형', '마름모형', '오각형', '육각형', '팔각형', '기타'];

function ShapeIcon({ shape }: { shape: PillShape }) {
  if (shape === '전체' || shape === '기타') return <span className="text-[11px] font-semibold">{shape}</span>;
  const common = { fill: '#F8FAF9', stroke: 'currentColor', strokeWidth: 1.7 } as const;
  return (
    <svg viewBox="0 0 42 30" className="h-7 w-10" aria-hidden="true">
      {shape === '원형' && <circle cx="21" cy="15" r="10" {...common} />}
      {shape === '타원형' && <ellipse cx="21" cy="15" rx="15" ry="8" {...common} />}
      {shape === '장방형' && <rect x="5" y="10" width="32" height="10" rx="5" {...common} />}
      {shape === '캡슐형' && <><rect x="5" y="8" width="32" height="14" rx="7" {...common} /><path d="M21 8v14" fill="none" stroke="currentColor" strokeWidth="1.4" /></>}
      {shape === '반원형' && <path d="M7 21a14 14 0 0 1 28 0Z" {...common} />}
      {shape === '삼각형' && <path d="m21 4 15 23H6Z" {...common} />}
      {shape === '사각형' && <rect x="10" y="4" width="22" height="22" rx="3" {...common} />}
      {shape === '마름모형' && <path d="M21 3 36 15 21 27 6 15Z" {...common} />}
      {shape === '오각형' && <path d="m21 3 15 11-6 13H12L6 14Z" {...common} />}
      {shape === '육각형' && <path d="m12 4 18 0 8 11-8 11H12L4 15Z" {...common} />}
      {shape === '팔각형' && <path d="m13 3 16 0 9 9v7l-9 8H13l-9-8v-7Z" {...common} />}
    </svg>
  );
}

export default function ShapeSelector({ value, onChange }: { value: PillShape; onChange: (value: PillShape) => void }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {SHAPES.map((shape) => {
        const selected = value === shape;
        return (
          <button type="button" key={shape} onClick={() => onChange(shape)} className={`flex min-h-17 flex-col items-center justify-center gap-1 rounded-2xl border text-[11px] font-medium transition ${selected ? 'border-[#47795E] bg-[#EAF3EE] text-[#47795E] shadow-sm' : 'border-transparent bg-[#F4F6F5] text-[#68766F]'}`}>
            <ShapeIcon shape={shape} />
            {shape !== '전체' && shape !== '기타' && <span>{shape}</span>}
          </button>
        );
      })}
    </div>
  );
}
