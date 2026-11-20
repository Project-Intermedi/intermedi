import type { PillShape } from '../types/pill';

const SHAPES: PillShape[] = ['전체', '원형', '타원형', '장방형', '반원형', '삼각형', '사각형', '마름모형', '오각형', '육각형', '팔각형', '기타'];

function ShapeIcon({ shape }: { shape: PillShape }) {
  if (!SHAPES.includes(shape) || shape === '기타') return null;
  if (shape === '전체') return <span className="text-[11px] font-semibold">{shape}</span>;
  const common = { fill: '#F8FAF9', stroke: 'currentColor', strokeWidth: 1.7 } as const;
  return (
    <svg viewBox="0 0 42 30" className="h-7 w-10" aria-hidden="true">
      {shape === '원형' && <circle cx="21" cy="15" r="10" {...common} />}
      {shape === '타원형' && <ellipse cx="21" cy="15" rx="15" ry="8" {...common} />}
      {shape === '장방형' && <rect x="5" y="10" width="32" height="10" rx="5" {...common} />}
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

export default function ShapeSelector({ options, value, onChange }: { options: string[]; value: PillShape[]; onChange: (value: PillShape[]) => void }) {
  const toggle = (shape: PillShape) => {
    if (shape === '전체') return onChange([]);
    onChange(value.includes(shape) ? value.filter(s => s !== shape) : [...value, shape]);
  };
  return (
    <div className="grid grid-cols-4 gap-2">
      {['전체', ...options].map((shape) => {
        const selected = shape === '전체' ? value.length === 0 : value.includes(shape);
        return (
          <button type="button" key={shape} onClick={() => toggle(shape)} aria-pressed={selected} className={`relative flex min-h-17 flex-col items-center justify-center gap-1 rounded-2xl border text-[11px] font-medium transition ${selected ? 'border-[#47795E] bg-[#EAF3EE] text-[#47795E] shadow-sm' : 'border-transparent bg-[#F4F6F5] text-[#68766F]'}`}>
            {selected && shape !== '전체' && (
              <span className="absolute right-1.5 top-1.5 grid size-3.5 place-items-center rounded-full bg-[#47795E]">
                <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 6.2 2 2L9 4" /></svg>
              </span>
            )}
            <ShapeIcon shape={shape} />
            {shape !== '전체' && <span>{shape}</span>}
          </button>
        );
      })}
    </div>
  );
}
