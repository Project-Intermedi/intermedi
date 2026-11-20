import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import QueryStatus from '../components/QueryStatus';
import SafetyResultSections from '../components/SafetyResultSections';
import { ArrowLeftIcon, AlertTriangleIcon } from '../components/Icons';
import { countTaking, recordsPath, safetyPath } from '../api/management';
import type { PrescriptionRecord, SafetyResult } from '../api/management';
import { useGet } from '../api/useGet';

/* ------------------------------ 화면 ------------------------------ */

export default function SafetyDetailScreen() {
  const { goBack } = useNav();
  const safety = useGet<SafetyResult>(safetyPath);
  const taking = useGet<PrescriptionRecord[]>(recordsPath('taking'));
  const r = safety.result.status === 'success' ? safety.result.data : undefined;
  // Both endpoints use the backend's active-medication period.
  const medicineCount = taking.result.status === 'success' ? countTaking(taking.result.data) : undefined;
  const hasTogether = !!r && (r.combo.length > 0 || r.duplicate.length > 0);
  const hasWarnings = hasTogether || r?.alerts.some(a => a.drugs.length > 0);
  const showTogether = medicineCount === undefined || medicineCount >= 2 || hasTogether;

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-4">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-[#F4F7F6] flex items-center justify-center">
            <ArrowLeftIcon size={20} className="text-[#222222]" />
          </button>
          <h1 className="text-[18px] font-bold text-[#222222]">안전성 상세 결과</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-5 pt-4">
        {/* Top summary */}
        {taking.result.status === 'error'
          ? <QueryStatus message="검사 대상 약 개수를 불러오지 못했어요." retry={taking.retry} />
          : <p className="px-1 text-[13px] text-[#6B7280]">
              {medicineCount === undefined ? '검사 대상 약 개수 확인 중' : `검사 대상 약 ${medicineCount}개`}
            </p>}
        {!r ? (
          safety.result.status === 'error'
            ? <QueryStatus message="안전성 검사 결과를 불러오지 못했어요." retry={safety.retry} />
            : <QueryStatus message="안전성 검사 결과를 확인 중이에요." />
        ) : hasWarnings ? (
          <div className="bg-[#E07A5F] rounded-3xl p-5 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangleIcon size={22} className="text-white" />
              </div>
              <p className="text-white font-bold text-[17px]">주의가 필요한 항목이 있어요</p>
            </div>
            <p className="text-white/85 text-[13px] leading-snug">항목별 안내를 확인하고 의사 또는 약사와 상담해 주세요.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <p className="text-[#222222] font-bold text-[16px]">
              {medicineCount === 0 ? '검사할 복용 중인 약이 없어요' : '확인된 주의 항목이 없어요'}
            </p>
            <p className="text-[#6B7280] text-[13px] leading-snug mt-1">안전성 결과 조회가 완료됐어요.</p>
          </div>
        )}

        <SafetyResultSections result={r} showTogether={showTogether} />

        {/* CTA */}
        <button
          onClick={goBack}
          className="w-full bg-[#47795E] rounded-2xl py-4 text-white text-[16px] font-bold shadow-md shadow-[#47795E]/25 active:scale-[0.98] transition-transform"
        >
          이해했어요
        </button>
      </div>
    </div>
  );
}
