import { useState } from 'react';
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
  const change = (next: PillSearchParams) => { setParams(next); onParamsChange?.(next); };
  const reset = () => change({ ...INITIAL_PILL_SEARCH_PARAMS });
  return (
    <div className="flex h-full min-h-full flex-col bg-[#F2F5F4] text-[#1F2924]">
      <ScreenHeader title="낱알 식별 검색" subtitle="알약의 특징을 입력해 약을 찾아보세요." onBack={onBack} />
      <main className="flex-1 overflow-y-auto overscroll-contain">
        <PillSearchForm value={params} onChange={change} onSearch={onSearch} onReset={reset} />
      </main>
    </div>
  );
}
