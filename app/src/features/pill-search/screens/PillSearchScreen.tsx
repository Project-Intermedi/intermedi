import { useEffect, useState } from 'react';
import { getPillOptions, type PillOptionsResponse } from '../../../api/pills';
import PillSearchForm from '../components/PillSearchForm';
import { ScreenHeader } from '../components/PillSearchUI';
import { INITIAL_PILL_SEARCH_PARAMS, type PillSearchParams } from '../types/pill';

export interface PillSearchScreenProps {
  initialParams?: PillSearchParams;
  onBack?: () => void;
  onSearch: (params: PillSearchParams) => void;
  onParamsChange?: (params: PillSearchParams) => void;
}

export default function PillSearchScreen({ initialParams = INITIAL_PILL_SEARCH_PARAMS, onBack, onSearch, onParamsChange }: PillSearchScreenProps) {
  const [params, setParams] = useState<PillSearchParams>({ ...initialParams });
  const [options, setOptions] = useState<PillOptionsResponse>();
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    getPillOptions(controller.signal).then(result => {
      if (!controller.signal.aborted) setOptions(result);
    }).catch(() => {
      if (!controller.signal.aborted) setFailed(true);
    });
    return () => controller.abort();
  }, [attempt]);

  const change = (next: PillSearchParams) => { setParams(next); onParamsChange?.(next); };
  const reset = () => change({ ...INITIAL_PILL_SEARCH_PARAMS });
  return (
    <div className="flex h-full min-h-full flex-col bg-[#F2F5F4] text-[#1F2924]">
      <ScreenHeader title="낱알 식별 검색" subtitle="알약의 특징을 입력해 약을 찾아보세요." onBack={onBack} />
      <main className="flex-1 overflow-y-auto overscroll-contain">
        {options ? (
          <PillSearchForm options={options} value={params} onChange={change} onSearch={onSearch} onReset={reset} />
        ) : failed ? (
          <div className="p-5 text-sm">
            <p role="alert">검색 선택지를 불러오지 못했어요.</p>
            <button type="button" onClick={() => { setFailed(false); setAttempt(n => n + 1); }} className="mt-3 rounded-xl bg-[#47795E] px-4 py-2 text-white">다시 시도</button>
          </div>
        ) : <p role="status" className="p-5 text-sm">검색 선택지를 불러오는 중이에요.</p>}
      </main>
    </div>
  );
}
