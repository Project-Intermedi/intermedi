import type { PillScoreLine } from '../types/pill';


// 기존 앞면·뒷면 두 알약 아이콘을 재사용합니다. 왼쪽 = 한쪽 면, 오른쪽 = 반대쪽 면.
function LineIcon({ type }: { type: PillScoreLine }) {
  const oneSide = type === '한쪽 한 줄' || type === '한쪽 십자';
  const bothSides = type === '양쪽 한 줄' || type === '양쪽 십자';
  const cross = type === '한쪽 십자' || type === '양쪽 십자';
  const front = oneSide || bothSides;
  const back = bothSides;
  return (
    // viewBox(64x28)와 h-7 w-16(28x64px)의 비율이 같아 아이콘이 찌그러지지 않습니다.
    <svg viewBox="0 0 64 28" className="h-7 w-16 shrink-0" preserveAspectRatio="xMidYMid meet" fill="none" stroke="currentColor" strokeWidth="1.3" aria-hidden="true">
      <ellipse cx="17" cy="14" rx="13" ry="10" />
      <ellipse cx="47" cy="14" rx="13" ry="10" />
      {front && <path d="M5 14h24" />}
      {back && <path d="M35 14h24" />}
      {front && cross && <path d="M17 5v18" />}
      {back && cross && <path d="M47 5v18" />}
    </svg>
  );
}

export default function ScoreLineSelector({ options, value, onChange }: { options: string[]; value: PillScoreLine; onChange: (value: PillScoreLine) => void }) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {['전체', ...options].map((item) => (
        <button type="button" key={item} onClick={() => onChange(item)} aria-pressed={value === item} className={`flex min-h-16 flex-col items-center justify-center gap-1 rounded-2xl border text-[11px] font-medium ${value === item ? 'border-[#47795E] bg-[#EAF3EE] font-semibold text-[#47795E]' : 'border-transparent bg-[#F4F6F5] text-[#68766F]'}`}>
          {item !== '전체' && <LineIcon type={item} />}
          <span>{item}</span>
        </button>
      ))}
    </div>
  );
}
