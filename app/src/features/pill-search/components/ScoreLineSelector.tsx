import type { PillScoreLine } from '../types/pill';

const LINES: PillScoreLine[] = ['전체', '양면 없음', '앞면 가로', '양면 가로', '앞면 세로', '양면 세로', '앞면 십자', '양면 십자', '가로·십자', '기타'];

function LineIcon({ type }: { type: PillScoreLine }) {
  const frontHorizontal = type === '앞면 가로' || type === '양면 가로' || type === '가로·십자';
  const backHorizontal = type === '양면 가로' || type === '가로·십자';
  const frontVertical = type === '앞면 세로' || type === '양면 세로' || type === '앞면 십자' || type === '양면 십자';
  const backVertical = type === '양면 세로' || type === '양면 십자' || type === '가로·십자';
  const frontCrossHorizontal = type === '앞면 십자' || type === '양면 십자';
  const backCrossHorizontal = type === '양면 십자';
  return (
    <svg viewBox="0 0 64 28" className="h-7 w-16" fill="none" stroke="currentColor" strokeWidth="1.3">
      <ellipse cx="17" cy="14" rx="13" ry="10" />
      <ellipse cx="47" cy="14" rx="13" ry="10" />
      {frontHorizontal && <path d="M5 14h24" />}
      {backHorizontal && <path d="M35 14h24" />}
      {frontVertical && <path d="M17 5v18" />}
      {backVertical && <path d="M47 5v18" />}
      {frontCrossHorizontal && <path d="M5 14h24" />}
      {backCrossHorizontal && <path d="M35 14h24" />}
    </svg>
  );
}

export default function ScoreLineSelector({ value, onChange }: { value: PillScoreLine; onChange: (value: PillScoreLine) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {LINES.map((item) => (
        <button type="button" key={item} onClick={() => onChange(item)} className={`flex min-h-16 flex-col items-center justify-center rounded-2xl border text-[10px] font-medium ${value === item ? 'border-[#47795E] bg-[#EAF3EE] text-[#47795E]' : 'border-transparent bg-[#F4F6F5] text-[#68766F]'}`}>
          {item !== '전체' && item !== '기타' && <LineIcon type={item} />}
          <span>{item}</span>
        </button>
      ))}
    </div>
  );
}
