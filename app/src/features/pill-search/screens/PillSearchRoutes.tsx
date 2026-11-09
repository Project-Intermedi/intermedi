import { useState } from 'react';
import { useNav } from '../../../context/NavigationContext';
import StatusBar from '../../../components/StatusBar';
import type { ReactNode } from 'react';
import { INITIAL_PILL_SEARCH_PARAMS, type PillSearchParams } from '../types/pill';
import PillSearchScreen from './PillSearchScreen';
import PillSearchResultScreen from './PillSearchResultScreen';
import PillDetailScreen from './PillDetailScreen';

function Frame({ children }: { children: ReactNode }) {
  return <div className="flex h-full flex-col bg-[#F2F5F4]"><div className="shrink-0 bg-white"><StatusBar /></div><div className="min-h-0 flex-1 overflow-hidden">{children}</div></div>;
}
export function PillSearchRoute() {
  const { params, navigate, goBack } = useNav();
  // The navigation entry survives screen remounts, so edits and Back retain conditions.
  const [initial] = useState(() => ({ ...(params.pillSearch ?? INITIAL_PILL_SEARCH_PARAMS) }));
  const retain = (next: PillSearchParams) => { params.pillSearch = { ...next }; };
  return <Frame><PillSearchScreen initialParams={initial} onParamsChange={retain} onBack={goBack} onSearch={next => { retain(next); navigate('pill-search-results', { pillSearch: { ...next } }); }} /></Frame>;
}
export function PillResultsRoute() {
  const { params, navigate, goBack } = useNav();
  return <Frame><PillSearchResultScreen params={params.pillSearch ?? INITIAL_PILL_SEARCH_PARAMS} onBack={goBack} onEditConditions={goBack} onSelectPill={pill => navigate('pill-search-detail', { pill, pillSearch: params.pillSearch })} /></Frame>;
}
export function PillDetailRoute() {
  const { params, goBack } = useNav();
  return <Frame>{params.pill ? <PillDetailScreen pill={params.pill} onBack={goBack} /> : <div className="p-5"><p>선택한 목업 약품이 없습니다.</p><button onClick={goBack}>뒤로가기</button></div>}</Frame>;
}
