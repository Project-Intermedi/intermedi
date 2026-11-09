import { useMemo } from 'react';
import { MOCK_PILLS } from '../data/mockPills';
import { searchMockPills, unsupportedMockConditions } from '../data/searchMockPills';
import type { PillDetail, PillSearchParams } from '../types/pill';
import PillResultCard from '../components/PillResultCard';
import { ScreenHeader, SearchIcon } from '../components/PillSearchUI';

export interface PillSearchResultScreenProps {
  params: PillSearchParams;
  onBack?: () => void;
  onEditConditions: (params: PillSearchParams) => void;
  onSelectPill: (pill: PillDetail) => void;
  results?: PillDetail[];
}

function activeConditions(params: PillSearchParams) {
  const chips: string[] = [];
  if (params.drugName) chips.push(`약품명 ${params.drugName}`);
  if (params.imprintFront) chips.push(`앞면 ${params.imprintFront}`);
  if (params.noBackImprint) chips.push('뒷면 각인 없음');
  else if (params.imprintBack) chips.push(`뒷면 ${params.imprintBack}`);
  if (params.imprintSymbol) chips.push(`그림 ${params.imprintSymbol}`);
  if (params.dosageForm !== '전체') chips.push(params.dosageForm);
  if (params.shape !== '전체') chips.push(params.shape);
  if (params.color !== '전체') chips.push(params.color);
  if (params.scoreLine !== '전체') chips.push(params.scoreLine);
  if (params.ingredient) chips.push(`성분 ${params.ingredient}`);
  if (params.manufacturer) chips.push(`제조사 ${params.manufacturer}`);
  return chips;
}

export default function PillSearchResultScreen({ params, onBack, onEditConditions, onSelectPill, results = MOCK_PILLS }: PillSearchResultScreenProps) {
  const chips = activeConditions(params);
  const filtered = useMemo(() => searchMockPills(results, params), [params, results]);
  const unsupported = unsupportedMockConditions(params);

  return (
    <div className="flex h-full min-h-full flex-col bg-[#F2F5F4]">
      <ScreenHeader title="검색 결과" onBack={onBack} action={<button type="button" onClick={() => onEditConditions(params)} className="h-9 rounded-full bg-[#EAF3EE] px-3 text-[11px] font-bold text-[#47795E]">조건 수정</button>} />
      <main className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8">
        <div className="pb-4 pt-5">
          {unsupported.length > 0 && <p role="status" className="mb-3 rounded-2xl bg-[#FFF3F0] p-3 text-[12px] text-[#9C503C]">현재 목업 검색에 반영되지 않은 조건: {unsupported.join(' · ')}. 해당 데이터가 없어 나머지 조건만 적용했습니다.</p>}
          <div className="flex items-end justify-between">
            <div><p className="text-[12px] text-[#718078]">지원되는 조건으로 찾은 목업 약품</p><h2 className="mt-0.5 text-[24px] font-black text-[#1F2924]">{filtered.length}개</h2></div>
            <span className="rounded-full bg-[#FFF1ED] px-2.5 py-1 text-[10px] font-semibold text-[#BE624C]">목업 데이터</span>
          </div>
          <div className="mt-4 flex gap-2 overflow-x-auto pb-1">
            {(chips.length ? chips : ['전체 조건']).map((chip) => <span key={chip} className="shrink-0 rounded-full border border-[#DDE6E2] bg-white px-3 py-1.5 text-[11px] font-medium text-[#56645D]">{chip}</span>)}
          </div>
        </div>

        {filtered.length > 0 ? (
          <div className="space-y-3">{filtered.map((pill) => <PillResultCard key={pill.id} pill={pill} onSelect={() => onSelectPill(pill)} />)}</div>
        ) : (
          <section className="mt-10 rounded-[24px] bg-white px-6 py-12 text-center shadow-sm">
            <div className="mx-auto grid size-15 place-items-center rounded-full bg-[#EDF3F0] text-[#47795E]"><SearchIcon /></div>
            <h2 className="mt-5 text-[16px] font-bold text-[#26342D]">검색 결과가 없어요</h2>
            <p className="mt-2 text-[12px] leading-5 text-[#7D8983]">각인이나 색상 등 검색 조건을<br />조금 넓혀서 다시 찾아보세요.</p>
            <button type="button" onClick={() => onEditConditions(params)} className="mt-6 h-12 rounded-2xl bg-[#47795E] px-6 text-[13px] font-bold text-white">검색 조건 수정</button>
          </section>
        )}
        <p className="mt-5 text-center text-[10px] leading-4 text-[#9AA49F]">현재 결과는 UI 확인을 위한 예시이며<br />실제 의약품 정보는 API 연결 후 제공됩니다.</p>
      </main>
    </div>
  );
}
