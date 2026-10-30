import { useEffect, useState } from 'react';
import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import { SearchIcon } from '../components/Icons';

export default function AIAnalysisScreen() {
  const { navigate, goBack, params } = useNav();
  const image = params.capturedImage;
  const [attempt, setAttempt] = useState(0);
  const [error, setError] = useState('');
  const [empty, setEmpty] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!image) return;
    let active = true;
    const controller = new AbortController();
    let timeout: ReturnType<typeof setTimeout>;
    // Defer until after StrictMode's setup/cleanup cycle: only one POST is sent.
    const start = setTimeout(async () => {
      setError(''); setEmpty(false);
      if (image.analysisDraft) {
        return;
      }
      setLoading(true);
      timeout = setTimeout(() => controller.abort(), 120_000);
      try {
        const { analyze } = await import('../api/analyze');
        if (!active) return;
        const draft = await analyze(image.file, controller.signal);
        if (!active) return;
        if (!draft.medicines.length) { setEmpty(true); return; }
        image.analysisDraft = draft;
        navigate('prescription-review', { draft });
      } catch (cause) {
        if (active) setError(controller.signal.aborted
          ? '분석 대기 시간이 초과되었어요. 다시 시도해주세요.'
          : cause instanceof Error ? cause.message : '분석하지 못했어요. 다시 시도해주세요.');
      } finally {
        clearTimeout(timeout);
        if (active) setLoading(false);
      }
    }, 0);
    return () => { active = false; clearTimeout(start); clearTimeout(timeout); controller.abort(); };
  }, [image, attempt, navigate]);

  const cached = image?.analysisDraft;
  const pending = !!image && !cached && !error && !empty;
  return (
    <div className="h-full flex flex-col bg-white">
      <StatusBar />
      <div className="flex-1 flex flex-col items-center justify-center px-8 pb-12 text-center" aria-live="polite" aria-busy={loading}>
        <div className="relative mb-10">
          <div className="w-28 h-28 rounded-[32px] bg-[#47795E]/10 flex items-center justify-center">
            <div className="w-20 h-20 rounded-2xl bg-[#47795E]/15 flex items-center justify-center">
              <SearchIcon size={36} className="text-[#47795E]" />
            </div>
          </div>
          <div className="absolute -bottom-3 -right-3 w-10 h-10 rounded-full bg-[#E07A5F] flex items-center justify-center shadow-md">{pending ? <span aria-label="분석 중" role="status" className="w-5 h-5 rounded-full border-2 border-white/35 border-t-white spin-anim motion-reduce:animate-none" /> : <span className="text-white text-[18px]">✦</span>}</div>
        </div>
        <h2 className="text-[22px] font-black text-[#222222] mb-2">{cached ? '분석이 완료되었어요' : !image ? '사진을 먼저 선택해주세요' : empty ? '인식된 약이 없어요' : error ? '분석을 완료하지 못했어요' : 'AI가 약봉투를 분석하고 있어요'}</h2>
        <p className="text-[14px] text-[#6B7280] leading-relaxed mb-8" role={error ? 'alert' : undefined}>{cached ? '이전에 분석한 결과를 다시 확인할 수 있어요.' : !image ? '촬영 화면에서 사진을 선택해주세요.' : error || (empty ? '약품명이 선명하게 보이는 사진으로 다시 시도해주세요.' : <>텍스트를 인식하고 약품 정보를 확인하고 있어요.<br />잠시만 기다려주세요.</>)}</p>
        {cached && <button onClick={() => navigate('prescription-review', { draft: cached })} className="w-full rounded-2xl bg-[#E07A5F] text-white py-4 font-bold mb-3">분석 결과 보기</button>}
        {(error || empty) && <button onClick={() => { setError(''); setEmpty(false); setAttempt(n => n + 1); }} className="w-full rounded-2xl bg-[#E07A5F] text-white py-4 font-bold mb-3">다시 분석하기</button>}
        <button onClick={goBack} className="w-full rounded-2xl bg-[#F4F7F6] text-[#47795E] py-4 font-bold">{pending ? '취소하고 사진 다시 선택' : '촬영 화면으로 돌아가기'}</button>
      </div>
    </div>
  );
}
