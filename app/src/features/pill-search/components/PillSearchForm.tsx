import { useState } from 'react';
import type { PillSearchParams } from '../types/pill';
import { Field, inputClass, SearchIcon } from './PillSearchUI';
import ImprintSymbolModal from './ImprintSymbolModal';
import DosageFormSelector from './DosageFormSelector';
import ShapeSelector from './ShapeSelector';
import ColorSelector from './ColorSelector';
import ScoreLineSelector from './ScoreLineSelector';

export default function PillSearchForm({ value, onChange, onSearch, onReset }: {
  value: PillSearchParams;
  onChange: (next: PillSearchParams) => void;
  onSearch: (params: PillSearchParams) => void;
  onReset: () => void;
}) {
  const [symbolOpen, setSymbolOpen] = useState(false);
  const set = <K extends keyof PillSearchParams>(key: K, next: PillSearchParams[K]) => onChange({ ...value, [key]: next });
  return (
    <>
      <div className="space-y-4 px-4 py-4">
        <p className="rounded-2xl bg-[#FFF3F0] p-3 text-[12px] leading-5 text-[#9C503C]">UI 확인용 목업 검색입니다. 실제 의약품 검색이나 복약 판단에 사용하지 마세요. 제형·식별 그림·분할선은 선택할 수 있지만 현재 목업 검색에 반영되지 않습니다. 사진은 제공하지 않으며 그림은 예시입니다.</p>
        <section className="space-y-5 rounded-[24px] bg-white p-5 shadow-[0_5px_24px_rgba(44,67,56,0.06)]">
          <Field label="약품명">
            <input value={value.drugName} onChange={(e) => set('drugName', e.target.value)} className={inputClass} placeholder="예: 트리람정, 타이레놀" />
          </Field>
          <Field label="식별 문자(각인)">
            <div className="grid grid-cols-2 gap-2">
              <input value={value.imprintFront} onChange={(e) => set('imprintFront', e.target.value)} className={inputClass} placeholder="앞면 각인" />
              <input disabled={value.noBackImprint} value={value.imprintBack} onChange={(e) => set('imprintBack', e.target.value)} className={`${inputClass} disabled:opacity-40`} placeholder="뒷면 각인" />
            </div>
            <label className="mt-3 flex min-h-8 items-center gap-2 text-[12px] text-[#68766F]">
              <input type="checkbox" checked={value.noBackImprint} onChange={(e) => onChange({ ...value, noBackImprint: e.target.checked, imprintBack: e.target.checked ? '' : value.imprintBack })} className="size-4 accent-[#47795E]" />
              반대면에는 각인이 없어요
            </label>
          </Field>
          <Field label="식별 그림">
            <button type="button" onClick={() => setSymbolOpen(true)} className={`flex h-12 w-full items-center justify-between rounded-2xl border px-4 text-[13px] font-semibold ${value.imprintSymbol ? 'border-[#47795E] bg-[#EAF3EE] text-[#47795E]' : 'border-[#DDE6E2] bg-white text-[#526159]'}`}>
              <span>{value.imprintSymbol || '그림 선택'}</span><span className="text-lg">⌄</span>
            </button>
          </Field>
        </section>

        <section className="space-y-6 rounded-[24px] bg-white p-5 shadow-[0_5px_24px_rgba(44,67,56,0.06)]">
          <Field label="제형"><DosageFormSelector value={value.dosageForm} onChange={(next) => set('dosageForm', next)} /></Field>
          <Field label="모양"><ShapeSelector value={value.shape} onChange={(next) => set('shape', next)} /></Field>
          <Field label="색상"><ColorSelector value={value.color} onChange={(next) => set('color', next)} /></Field>
          <Field label="분할선"><ScoreLineSelector value={value.scoreLine} onChange={(next) => set('scoreLine', next)} /></Field>
        </section>

        <section className="space-y-4 rounded-[24px] bg-white p-5 shadow-[0_5px_24px_rgba(44,67,56,0.06)]">
          <div><h2 className="text-[14px] font-bold text-[#2B3932]">추가 검색 조건</h2><p className="mt-1 text-[11px] text-[#8B9691]">알고 있는 정보가 있다면 입력해주세요.</p></div>
          <Field label="성분명"><input value={value.ingredient} onChange={(e) => set('ingredient', e.target.value)} className={inputClass} placeholder="예: 아세트아미노펜" /></Field>
          <Field label="제조사"><input value={value.manufacturer} onChange={(e) => set('manufacturer', e.target.value)} className={inputClass} placeholder="제조사 이름" /></Field>
        </section>

        <div className="sticky bottom-0 z-10 -mx-1 flex gap-2 bg-[#F2F5F4]/95 px-1 pb-3 pt-2 backdrop-blur">
          <button type="button" onClick={() => onSearch(value)} className="flex h-14 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#47795E] text-[15px] font-bold text-white shadow-lg shadow-[#47795E]/20 active:scale-[.98]"><SearchIcon />약 찾기</button>
          <button type="button" onClick={onReset} className="h-14 w-24 rounded-2xl bg-white text-[13px] font-bold text-[#59675F] shadow-sm active:scale-[.98]">초기화</button>
        </div>
      </div>
      <ImprintSymbolModal open={symbolOpen} value={value.imprintSymbol} onClose={() => setSymbolOpen(false)} onSelect={(next) => set('imprintSymbol', next)} />
    </>
  );
}
