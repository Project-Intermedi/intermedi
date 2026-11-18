import { useEffect, useState } from 'react';
import { countPills, dropPillFilter, searchPills, toPillDetail, type PillRelaxedCondition } from '../../../api/pills';
import type { PillDetail, PillSearchParams } from '../types/pill';
import PillResultCard from '../components/PillResultCard';
import { ScreenHeader, SearchIcon } from '../components/PillSearchUI';

export interface PillSearchResultScreenProps {
  params: PillSearchParams;
  onBack?: () => void;
  onEditConditions: () => void;
  onParamsChange: (params: PillSearchParams) => void;
  onSelectPill: (pill: PillDetail) => void;
}

function activeConditions(params: PillSearchParams) {
  const chips: string[] = [];
  if (params.drugName.trim()) chips.push(`약품명 ${params.drugName}`);
  if (params.imprintFront.trim()) chips.push(`앞면 ${params.imprintFront}`);
  if (!params.noBackImprint && params.imprintBack.trim()) chips.push(`뒷면 ${params.imprintBack}`);
  if (params.dosageForm !== '전체') chips.push(params.dosageForm);
  if (params.shape.length) chips.push(params.shape.join(' · '));
  if (params.color.length) chips.push(params.color.join(' · '));
  if (params.scoreLine !== '전체') chips.push(params.scoreLine);
  if (params.category !== '전체') chips.push(params.category);
  if (params.manufacturer.trim()) chips.push(`제조사 ${params.manufacturer}`);
  return chips;
}

type SearchState =
  | { status: 'loading' }
  | { status: 'error' }
  | { status: 'ready'; total: number; items: PillDetail[]; suggestion?: PillRelaxedCondition };

export default function PillSearchResultScreen({ params: initialParams, onBack, onEditConditions, onSelectPill, onParamsChange }: PillSearchResultScreenProps) {
  const [params, setParams] = useState(initialParams);
  const [state, setState] = useState<SearchState>({ status: 'loading' });
  const [attempt, setAttempt] = useState(0);
  const chips = activeConditions(params);
  const unsupported = [
    params.ingredient.trim() && '성분명',
    params.imprintSymbol && '식별 그림',
    params.noBackImprint && '반대면 각인 없음',
  ].filter(Boolean);

  useEffect(() => {
    const controller = new AbortController();
    const { signal } = controller;
    async function load() {
      try {
        const result = await searchPills(params, signal);
        const items = result.items.map(toPillDetail);
        if (signal.aborted) return;
        setState({ status: 'ready', total: result.total, items });
        if (result.total === 0) {
          const { relaxed } = await countPills(params, signal);
          if (!signal.aborted) setState({ status: 'ready', total: result.total, items, suggestion: relaxed[0] });
        }
      } catch {
        if (!signal.aborted) setState(current => current.status === 'ready' ? current : { status: 'error' });
      }
    }
    void load();
    return () => controller.abort();
  }, [params, attempt]);

  function relax(condition: PillRelaxedCondition) {
    const next = dropPillFilter(params, condition.drop);
    setState({ status: 'loading' });
    setParams(next);
    onParamsChange(next);
  }

  const suggestion = state.status === 'ready' ? state.suggestion : undefined;

  return (
    <div className="flex h-full min-h-full flex-col bg-[#F2F5F4]">
      <ScreenHeader title="검색 결과" onBack={onBack} action={<button type="button" onClick={onEditConditions} className="h-9 rounded-full bg-[#EAF3EE] px-3 text-[11px] font-bold text-[#47795E]">조건 수정</button>} />
      <main className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8">
        <div className="pb-4 pt-5">
          {unsupported.length > 0 && <p role="status" className="mb-3 rounded-2xl bg-[#FFF3F0] p-3 text-[12px] text-[#9C503C]">{unsupported.join(' · ')} 조건은 현재 검색에 적용되지 않아요.</p>}
          {state.status === 'ready' && (
            <div>
              <p className="text-[12px] text-[#718078]">전체 검색 결과</p>
              <h2 className="mt-0.5 text-[24px] font-black text-[#1F2924]">{state.total.toLocaleString()}개</h2>
              {state.items.length < state.total && <p className="text-[12px] text-[#718078]">이 중 {state.items.length.toLocaleString()}개를 표시해요.</p>}
            </div>
          )}
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {(chips.length ? chips : ['전체 조건']).map((chip) => <span key={chip} className="shrink-0 rounded-full border border-[#DDE6E2] bg-white px-3 py-1.5 text-[11px] font-medium text-[#56645D]">{chip}</span>)}
          </div>
        </div>

        {state.status === 'loading' ? (
          <p role="status" className="py-8 text-center text-sm text-[#68766F]">약을 검색하고 있어요.</p>
        ) : state.status === 'error' ? (
          <section className="rounded-[24px] bg-white p-6 text-center">
            <p role="alert" className="text-sm">검색 결과를 불러오지 못했어요.</p>
            <button type="button" onClick={() => { setState({ status: 'loading' }); setAttempt(n => n + 1); }} className="mt-4 rounded-xl bg-[#47795E] px-4 py-2 text-sm text-white">다시 시도</button>
          </section>
        ) : state.total > 0 ? (
          <div className="space-y-3">{state.items.map((pill) => <PillResultCard key={pill.id} pill={pill} onSelect={() => onSelectPill(pill)} />)}</div>
        ) : (
          <section className="mt-10 rounded-[24px] bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto grid size-15 place-items-center rounded-full bg-[#EDF3F0] text-[#47795E]"><SearchIcon /></div>
            <h2 className="mt-5 text-[16px] font-bold text-[#26342D]">조건에 맞는 약이 없어요</h2>
            <p className="mt-2 text-[12px] leading-5 text-[#7D8983]">검색 조건을 바꿔 다시 찾아보세요.</p>
            {suggestion && (
              <div className="mt-5 rounded-2xl bg-[#EAF3EE] p-4">
                <p className="text-[13px] font-semibold text-[#2B3932]">{suggestion.label} 조건을 빼면 <span className="text-[#47795E]">{suggestion.total.toLocaleString()}건</span>이 나와요</p>
                <button type="button" onClick={() => relax(suggestion)} className="mt-3 h-11 w-full rounded-xl bg-white text-[13px] font-bold text-[#47795E] shadow-sm active:scale-[.98]">{suggestion.label} 빼고 보기</button>
              </div>
            )}
            <button type="button" onClick={onEditConditions} className="mt-6 h-12 rounded-2xl bg-[#47795E] px-6 text-[13px] font-bold text-white">조건 수정</button>
          </section>
        )}
        <p className="mt-5 text-center text-[10px] leading-4 text-[#9AA49F]">복약 전 의사·약사와 상담해주세요.</p>
      </main>
    </div>
  );
}
