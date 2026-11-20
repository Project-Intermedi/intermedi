import { useEffect, useState } from 'react';
import { previewPrescription } from '../api/safetyPreview';
import { ArrowLeftIcon, AlertTriangleIcon } from '../components/Icons';
import QueryStatus from '../components/QueryStatus';
import SafetyResultSections from '../components/SafetyResultSections';
import StatusBar from '../components/StatusBar';
import { useNav } from '../context/NavigationContext';
import { usePrescriptionRegistration } from '../hooks/usePrescriptionRegistration';

type Preview = Awaited<ReturnType<typeof previewPrescription>>;
type Check = { status: 'loading' } | { status: 'error'; message: string } | { status: 'success'; preview: Preview };

export default function SafetyPreviewScreen() {
  const { goBack, params } = useNav();
  const { draft } = params;
  const [snapshot] = useState(() => draft && { ...draft, medicines: draft.medicines.map(m => ({ ...m })) });
  const [attempt, setAttempt] = useState(0);
  const [check, setCheck] = useState<Check>({ status: 'loading' });
  const { save, saving, error: saveError } = usePrescriptionRegistration(draft);

  useEffect(() => {
    if (!snapshot) return;
    const controller = new AbortController();
    void previewPrescription(snapshot, controller.signal).then(preview => {
      if (!controller.signal.aborted) setCheck({ status: 'success', preview });
    }).catch(error => {
      if (!controller.signal.aborted) {
        setCheck({ status: 'error', message: error instanceof Error ? error.message : '안전성 검사 요청에 실패했어요.' });
      }
    });
    return () => controller.abort();
  }, [snapshot, attempt]);

  function retry() {
    setCheck({ status: 'loading' });
    setAttempt(value => value + 1);
  }

  const preview = check.status === 'success' ? check.preview : undefined;
  const result = preview?.result;
  const hasWarnings = result && (result.combo.length > 0 || result.duplicate.length > 0
    || result.alerts.some(alert => alert.drugs.length > 0));

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-4">
          <button onClick={goBack} disabled={saving} aria-label="이전 화면으로 돌아가기" className="w-9 h-9 rounded-full bg-[#F4F7F6] flex items-center justify-center">
            <ArrowLeftIcon size={20} className="text-[#222222]" />
          </button>
          <h1 className="text-[18px] font-bold text-[#222222]">등록 전 안전성 확인</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-5 pt-4">
        <div className="bg-white rounded-3xl p-4 shadow-sm text-[13px] text-[#6B7280] space-y-2">
          <p>기존에 복용 중인 약과 이번에 등록할 약을 함께 검사해요. 검사만으로 처방이 저장되지는 않아요.</p>
          {preview && <p className="font-bold text-[#222222]">기존 복용 약 {preview.existingCount}개 · 신규 처방 약 {preview.incomingCount}개</p>}
          <p>같은 약이 서로 다른 처방에 있으면 중복으로 표시되지 않을 수 있어요.</p>
        </div>

        {!snapshot ? <QueryStatus message="검사할 처방 정보가 없어요." />
          : check.status === 'loading' ? <QueryStatus message="복용 중인 약을 확인하고 안전성을 검사하고 있어요." />
          : check.status === 'error' ? <QueryStatus message={`안전성 검사를 완료하지 못했어요. ${check.message}`} retry={retry} />
          : hasWarnings ? (
            <div role="status" className="bg-[#E07A5F] text-white rounded-3xl p-5 shadow-md flex items-start gap-3">
              <AlertTriangleIcon size={22} className="flex-shrink-0" />
              <div>
                <p className="font-bold text-[16px]">주의가 필요한 항목이 있어요</p>
                <p className="text-[13px] text-white/85 mt-1">항목별 안내를 확인하고 의사 또는 약사와 상담해 주세요.</p>
              </div>
            </div>
          ) : (
            <div role="status" className="bg-white rounded-3xl p-5 shadow-sm">
              <p className="font-bold text-[#222222]">검사에서 반환된 주의 항목이 없어요</p>
              <p className="mt-1 text-[13px] text-[#6B7280]">의약품 정보에 연결되지 않은 약이나 검사 범위 밖의 주의 사항이 있을 수 있어요.</p>
            </div>
          )}

        <SafetyResultSections result={result} showTogether />

        {saveError && <p role="alert" className="text-center text-[13px] text-[#9C503C]">{saveError}</p>}
        <button
          disabled={!preview || saving}
          aria-busy={saving}
          onClick={() => { if (preview && snapshot) void save(snapshot); }}
          className="w-full bg-[#47795E] rounded-2xl py-4 text-white text-[16px] font-bold shadow-md disabled:opacity-60"
        >
          {saving ? '저장 중…' : saveError ? '다시 저장하기' : '처방 등록 확정'}
        </button>
        <button onClick={goBack} disabled={saving} className="w-full rounded-2xl py-3 text-[14px] font-semibold text-[#47795E] disabled:opacity-60">
          이전 화면으로 돌아가기
        </button>
      </div>
    </div>
  );
}
