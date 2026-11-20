import { useState } from 'react';
import type { PillOptionsResponse } from '../../../api/pills';
import type { PillDosageForm, PillSearchParams, PillShape } from '../types/pill';
import { Field, inputClass, SearchIcon } from './PillSearchUI';
import ImprintSymbolModal from './ImprintSymbolModal';
import DosageFormSelector from './DosageFormSelector';
import ShapeSelector from './ShapeSelector';
import ColorSelector from './ColorSelector';
import ScoreLineSelector from './ScoreLineSelector';

// 제형 선택 시 자동 선택되는 모양. 사용자가 직접 해제할 수 있습니다.
const AUTO_SHAPES_BY_FORM: Partial<Record<PillDosageForm, PillShape[]>> = {
  경질캡슐: ['장방형'],
  연질캡슐: ['타원형', '장방형'],
};

// 영문 각인 입력용: 자동 대문자·자동 수정·맞춤법 검사를 끕니다.
const imprintInputProps = {
  lang: 'en',
  inputMode: 'text',
  autoCapitalize: 'none',
  autoCorrect: 'off',
  autoComplete: 'off',
  spellCheck: false,
} as const;

export default function PillSearchForm({ options, value, onChange, onSearch, onReset }: {
  options: PillOptionsResponse;
  value: PillSearchParams;
  onChange: (next: PillSearchParams) => void;
  onSearch: (params: PillSearchParams) => void;
  onReset: () => void;
}) {
  const [symbolOpen, setSymbolOpen] = useState(false);
  const set = <K extends keyof PillSearchParams>(key: K, next: PillSearchParams[K]) => onChange({ ...value, [key]: next });
  const changeDosageForm = (dosageForm: PillDosageForm) => {
    // 같은 제형을 다시 누른 경우: 사용자가 해제한 자동 선택 모양을 다시 선택하지 않습니다.
    if (dosageForm === value.dosageForm) return;
    // 1) 이전 제형이 자동 선택한 모양만 해제 (사용자가 직접 고른 모양은 유지)
    const kept = value.shape.filter(s => !value.autoShapes.includes(s));
    // 2) 새 제형의 모양 중 아직 선택되지 않은 것만 추가하고 자동 선택으로 기록
    const added = (AUTO_SHAPES_BY_FORM[dosageForm] ?? []).filter(s => !kept.includes(s) && options.shapes.some(option => option.value === s));
    onChange({ ...value, dosageForm, shape: [...kept, ...added], autoShapes: added });
  };
  const changeShape = (shape: PillShape[]) => {
    // 사용자가 해제한 자동 선택 모양은 자동 선택 기록에서도 제외합니다.
    onChange({ ...value, shape, autoShapes: value.autoShapes.filter(s => shape.includes(s)) });
  };
  return (
    <>
      <div className="space-y-4 px-4 py-4">
        <p className="rounded-2xl bg-[#FFF3F0] p-3 text-[12px] leading-5 text-[#9C503C]">성분명, 식별 그림, 반대면 각인 없음은 현재 검색에 적용되지 않아요. 복약 전 의사·약사와 상담해주세요.</p>
        <section className="space-y-5 rounded-[24px] bg-white p-5 shadow-[0_5px_24px_rgba(44,67,56,0.06)]">
          <Field label="약품명">
            <input value={value.drugName} onChange={(e) => set('drugName', e.target.value)} className={inputClass} placeholder="예: 트리람정, 타이레놀" />
          </Field>
          <Field label="식별 문자(각인)">
            <div className="grid grid-cols-2 gap-2">
              <input {...imprintInputProps} value={value.imprintFront} onChange={(e) => set('imprintFront', e.target.value)} className={inputClass} placeholder="앞면 각인" />
              <input {...imprintInputProps} disabled={value.noBackImprint} value={value.imprintBack} onChange={(e) => set('imprintBack', e.target.value)} className={`${inputClass} disabled:opacity-40`} placeholder="뒷면 각인" />
            </div>
            <p className="mt-2 pl-1 text-[11px] leading-4 text-[#8B9691]">앞뒤 순서는 상관없으며, 영문 대소문자는 구분하지 않아요.</p>
            <label className="mt-2 flex min-h-8 items-center gap-2 text-[12px] text-[#68766F]">
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
          <Field label="제형"><DosageFormSelector options={options.forms.map(option => option.value)} value={value.dosageForm} onChange={changeDosageForm} /></Field>
          <Field label="모양"><ShapeSelector options={options.shapes.map(option => option.value)} value={value.shape} onChange={changeShape} /></Field>
          <Field label="색상"><ColorSelector options={options.colors.map(option => option.value)} value={value.color} onChange={(next) => set('color', next)} /></Field>
          <Field label="분할선"><ScoreLineSelector options={options.lines.map(option => option.value)} value={value.scoreLine} onChange={(next) => set('scoreLine', next)} /></Field>
        </section>

        <section className="space-y-4 rounded-[24px] bg-white p-5 shadow-[0_5px_24px_rgba(44,67,56,0.06)]">
          <div><h2 className="text-[14px] font-bold text-[#2B3932]">추가 검색 조건</h2><p className="mt-1 text-[11px] text-[#8B9691]">알고 있는 정보가 있다면 입력해주세요.</p></div>
          <Field label="성분명"><input value={value.ingredient} onChange={(e) => set('ingredient', e.target.value)} className={inputClass} placeholder="예: 아세트아미노펜" /></Field>
          <Field label="카테고리">
            <div className="flex flex-wrap gap-2">
              {['전체', ...options.categories.map(option => option.value)].map(category => (
                <button type="button" key={category} onClick={() => set('category', category)} aria-pressed={value.category === category} className={`min-h-11 rounded-full border px-4 text-[12px] font-semibold ${value.category === category ? 'border-[#47795E] bg-[#EAF3EE] text-[#47795E]' : 'border-transparent bg-[#F4F6F5] text-[#68766F]'}`}>
                  {category}
                </button>
              ))}
            </div>
          </Field>
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
