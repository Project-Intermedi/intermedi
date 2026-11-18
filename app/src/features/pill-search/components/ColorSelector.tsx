import { useState } from 'react';
import { MAX_PILL_COLORS, type PillColor } from '../types/pill';

const COLORS: { name: PillColor; hex: string; border?: boolean }[] = [
  { name: '전체', hex: 'conic-gradient(#47795E 0 25%,#E07A5F 0 50%,#F2C84B 0 75%,#6396D9 0)' },
  { name: '하양', hex: '#FFFFFF', border: true }, { name: '노랑', hex: '#F2CA3A' }, { name: '주황', hex: '#F49A3F' },
  { name: '분홍', hex: '#F0A4C8' }, { name: '빨강', hex: '#E14F4F' }, { name: '갈색', hex: '#8B572A' },
  { name: '연두', hex: '#A8D95E' }, { name: '초록', hex: '#3AA66C' }, { name: '청록', hex: '#2B9A92' },
  { name: '파랑', hex: '#4D91DC' }, { name: '남색', hex: '#31569B' }, { name: '자주', hex: '#A82B5E' },
  { name: '보라', hex: '#8B5AD9' }, { name: '회색', hex: '#9AA1A6' }, { name: '검정', hex: '#252B31' },
  { name: '투명', hex: 'repeating-linear-gradient(135deg,#fff 0 5px,#E8ECEA 5px 7px)', border: true },
];

export default function ColorSelector({ options, value, onChange }: { options: string[]; value: PillColor[]; onChange: (value: PillColor[]) => void }) {
  const [limitNotice, setLimitNotice] = useState(false);

  // 안내는 자동으로 사라지지 않습니다. 선택이 최대 개수 미만으로 줄면(해제·전체·초기화) 즉시 숨깁니다.
  if (limitNotice && value.length < MAX_PILL_COLORS) setLimitNotice(false);

  const toggle = (name: PillColor) => {
    if (name === '전체') { onChange([]); setLimitNotice(false); return; }
    if (value.includes(name)) { onChange(value.filter(c => c !== name)); setLimitNotice(false); return; }
    // 이미 최대 개수를 선택했다면 기존 선택을 해제하지 않고 안내만 표시합니다.
    if (value.length >= MAX_PILL_COLORS) { setLimitNotice(true); return; }
    onChange([...value, name]);
  };

  return (
    <div>
      <div className="grid grid-cols-6 gap-x-2 gap-y-3">
        {['전체', ...options].map(name => {
          const { hex, border } = COLORS.find(color => color.name === name) ?? { hex: '#E8ECEA', border: true };
          const selected = name === '전체' ? value.length === 0 : value.includes(name);
          return (
            <button type="button" key={name} onClick={() => toggle(name)} aria-pressed={selected} className="flex min-w-0 flex-col items-center gap-1.5">
              <span className="relative">
                <span className={`block size-9 rounded-full transition ${border ? 'border border-[#D9E0DD]' : ''} ${selected ? 'ring-2 ring-[#47795E] ring-offset-2 scale-105' : ''}`} style={{ background: hex }} />
                {selected && name !== '전체' && (
                  <span className="absolute -right-1 -top-1 grid size-4 place-items-center rounded-full bg-[#47795E] ring-2 ring-white">
                    <svg viewBox="0 0 12 12" className="size-2.5" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m3 6.2 2 2L9 4" /></svg>
                  </span>
                )}
              </span>
              <span className={`text-[10px] ${selected ? 'font-bold text-[#47795E]' : 'text-[#68766F]'}`}>{name}</span>
            </button>
          );
        })}
      </div>
      <p role="status" className={`mt-3 text-[11px] ${limitNotice ? 'font-semibold text-[#C0573F]' : 'text-[#8B9691]'}`}>
        {limitNotice
          ? `색상은 최대 ${MAX_PILL_COLORS}개까지 선택할 수 있어요. 다른 색을 고르려면 선택한 색을 먼저 해제해 주세요.`
          : `두 가지 색으로 된 약은 ${MAX_PILL_COLORS}개까지 선택할 수 있어요. (${value.length}/${MAX_PILL_COLORS})`}
      </p>
    </div>
  );
}
