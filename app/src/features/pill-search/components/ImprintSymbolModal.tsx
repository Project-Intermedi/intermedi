import { useMemo, useState } from 'react';
import { SearchIcon } from './PillSearchUI';

const SYMBOLS = [
  { id: 'curve', glyph: '))', name: '곡선' },
  { id: 'cross', glyph: '✣', name: '십자' },
  { id: 'arrow', glyph: '❮', name: '화살표' },
  { id: 'triangle', glyph: '△', name: '삼각형' },
  { id: 'circle-one', glyph: '①', name: '원 안의 숫자' },
  { id: 'heart', glyph: '♡', name: '하트' },
  { id: 'three-lines', glyph: '≡', name: '세 줄' },
  { id: 'star', glyph: '☆', name: '별' },
  { id: 'diamond', glyph: '◇', name: '마름모' },
  { id: 'moon', glyph: '☾', name: '초승달' },
  { id: 'plus', glyph: '⊕', name: '원 안의 더하기' },
  { id: 'square', glyph: '▱', name: '사각형' },
];

export default function ImprintSymbolModal({ open, value, onClose, onSelect }: {
  open: boolean; value: string; onClose: () => void; onSelect: (value: string) => void;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => SYMBOLS.filter((symbol) => symbol.name.includes(query.trim())), [query]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-[#14251D]/45 p-0 sm:items-center sm:p-6" onMouseDown={onClose}>
      <section role="dialog" aria-modal="true" aria-label="식별 그림 선택" onMouseDown={(event) => event.stopPropagation()} className="max-h-[82vh] w-full max-w-[520px] overflow-hidden rounded-t-[28px] bg-[#F4F7F6] shadow-2xl sm:rounded-[28px]">
        <div className="bg-white px-5 pb-4 pt-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[18px] font-bold text-[#1F2924]">그림 선택</h2>
              <p className="mt-1 text-[11px] text-[#7C8882]">알약에 새겨진 그림과 가장 비슷한 항목을 골라주세요.</p>
            </div>
            <button type="button" onClick={onClose} aria-label="닫기" className="grid size-10 place-items-center rounded-full bg-[#F1F4F3] text-xl text-[#68766F]">×</button>
          </div>
          <label className="mt-4 flex h-12 items-center gap-2 rounded-2xl bg-[#F3F6F5] px-4">
            <SearchIcon />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="그림 이름 검색 (예: 하트, 별)" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-[#A2ACA7]" />
          </label>
        </div>
        <div className="grid max-h-[58vh] grid-cols-3 gap-2 overflow-y-auto p-4">
          <button type="button" onClick={() => { onSelect(''); onClose(); }} className={`min-h-28 rounded-2xl border bg-white p-3 ${!value ? 'border-[#47795E] ring-2 ring-[#47795E]/10' : 'border-transparent'}`}>
            <span className="text-3xl text-[#E07A5F]">×</span><span className="mt-2 block text-[11px] text-[#68766F]">선택 안 함</span>
          </button>
          {filtered.map((symbol) => (
            <button type="button" key={symbol.id} onClick={() => { onSelect(symbol.name); onClose(); }} className={`min-h-28 rounded-2xl border bg-white p-3 ${value === symbol.name ? 'border-[#47795E] ring-2 ring-[#47795E]/10' : 'border-transparent'}`}>
              <span className="block text-4xl text-[#25332C]">{symbol.glyph}</span><span className="mt-2 block text-[11px] text-[#68766F]">{symbol.name}</span>
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}
