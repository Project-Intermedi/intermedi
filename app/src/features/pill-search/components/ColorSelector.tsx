import type { PillColor } from '../types/pill';

const COLORS: { name: PillColor; hex: string; border?: boolean }[] = [
  { name: '전체', hex: 'conic-gradient(#47795E 0 25%,#E07A5F 0 50%,#F2C84B 0 75%,#6396D9 0)' },
  { name: '하양', hex: '#FFFFFF', border: true }, { name: '노랑', hex: '#F2CA3A' }, { name: '주황', hex: '#F49A3F' },
  { name: '분홍', hex: '#F0A4C8' }, { name: '빨강', hex: '#E14F4F' }, { name: '갈색', hex: '#8B572A' },
  { name: '연두', hex: '#A8D95E' }, { name: '초록', hex: '#3AA66C' }, { name: '청록', hex: '#2B9A92' },
  { name: '파랑', hex: '#4D91DC' }, { name: '남색', hex: '#31569B' }, { name: '자주', hex: '#A82B5E' },
  { name: '보라', hex: '#8B5AD9' }, { name: '회색', hex: '#9AA1A6' }, { name: '검정', hex: '#252B31' },
  { name: '투명', hex: 'repeating-linear-gradient(135deg,#fff 0 5px,#E8ECEA 5px 7px)', border: true },
];

export default function ColorSelector({ value, onChange }: { value: PillColor; onChange: (value: PillColor) => void }) {
  return (
    <div className="grid grid-cols-6 gap-x-2 gap-y-3">
      {COLORS.map(({ name, hex, border }) => (
        <button type="button" key={name} onClick={() => onChange(name)} className="flex min-w-0 flex-col items-center gap-1.5">
          <span className={`block size-9 rounded-full transition ${border ? 'border border-[#D9E0DD]' : ''} ${value === name ? 'ring-2 ring-[#47795E] ring-offset-2 scale-105' : ''}`} style={{ background: hex }} />
          <span className={`text-[10px] ${value === name ? 'font-bold text-[#47795E]' : 'text-[#68766F]'}`}>{name}</span>
        </button>
      ))}
    </div>
  );
}
