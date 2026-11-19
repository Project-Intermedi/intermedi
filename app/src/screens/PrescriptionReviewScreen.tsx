import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import { ArrowLeftIcon, EditIcon, PlusIcon, InfoIcon, CheckIcon } from '../components/Icons';
import { getSavedPrescriptionId } from '../hooks/usePrescriptionRegistration';

export default function PrescriptionReviewScreen() {
  const { goBack, navigate, params } = useNav();
  const draft = params.draft;
  const meds = draft?.medicines ?? [];
  const savedId = getSavedPrescriptionId(draft);
  const editingDisabled = savedId !== undefined;
  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-4">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-[#F4F7F6] flex items-center justify-center">
            <ArrowLeftIcon size={20} className="text-[#222222]" />
          </button>
          <h1 className="text-[18px] font-bold text-[#222222]">처방전 정보 확인</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-4 pt-4">
        {/* Instruction */}
        <div className="bg-[#47795E]/10 rounded-2xl p-4 flex gap-3">
          <InfoIcon size={18} className="text-[#47795E] flex-shrink-0 mt-0.5" />
          <p className="text-[13px] text-[#47795E] leading-snug font-medium">
            AI가 처방전에서 아래 정보를 인식했어요.<br/>
            잘못 인식된 내용이 없는지 확인해주세요.
          </p>
        </div>

        {/* Hospital info */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[#222222]">병원 정보</h2>
            {/* Edit all hospital info at once */}
            <button
              onClick={() => navigate('prescription-edit', { draft })}
              disabled={editingDisabled}
              className="flex items-center gap-1.5 bg-[#47795E]/10 rounded-full px-3 py-1.5"
            >
              <EditIcon size={13} className="text-[#47795E]" />
              <span className="text-[12px] font-semibold text-[#47795E]">수정하기</span>
            </button>
          </div>
          <div className="space-y-3">
            {[
              { label: '병원명', value: draft?.hospital || '정보 없음' },
              { label: '의사명', value: draft?.doctor || '정보 없음' },
              { label: '처방일', value: draft?.date || '정보 없음' },
              { label: '진단명', value: draft?.diagnosis || '정보 없음' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-2 border-b border-[#F4F7F6] last:border-0">
                <span className="text-[13px] text-[#6B7280] w-20 flex-shrink-0">{label}</span>
                <span className="flex-1 text-[14px] font-semibold text-[#222222] text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Medications */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[15px] font-bold text-[#222222]">인식된 약 {meds.length}개</h2>
            <button
              onClick={() => navigate('prescription-edit', { draft })}
              disabled={editingDisabled}
              className="flex items-center gap-1.5 bg-[#47795E]/10 rounded-full px-3 py-1.5"
            >
              <EditIcon size={13} className="text-[#47795E]" />
              <span className="text-[12px] font-semibold text-[#47795E]">수정하기</span>
            </button>
          </div>
          <div className="space-y-3">
            {!meds.length && <p role="status">분석 결과가 없어요. 사진을 선택해 다시 분석해주세요.</p>}
            {meds.map((m, idx) => (
              <div key={idx} className="rounded-2xl bg-[#F4F7F6] p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-[#47795E] flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[11px] font-bold">{idx + 1}</span>
                    </div>
                    <span className="text-[14px] font-bold text-[#222222]">{m.name}</span>
                  </div>
                  <button
                    onClick={() => navigate('prescription-edit', { draft })}
                    disabled={editingDisabled}
                    className="w-7 h-7 rounded-lg bg-white flex items-center justify-center"
                  >
                    <EditIcon size={13} className="text-[#6B7280]" />
                  </button>
                </div>
                <p className="text-xs text-[#6B7280] mb-3">제품 코드: {m.product_code || '정보 없음'} · {m.matched === true ? '매칭됨' : m.matched === false ? '매칭되지 않음 · 직접 확인 필요' : '매칭 여부 확인 필요'}</p>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { label: '1회 투여량', value: m.dose },
                    { label: '하루 투여횟수', value: m.freq },
                    { label: '총 투여일수', value: m.days },
                    { label: '복용방법', value: m.usage },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-white rounded-xl p-2.5">
                      <p className="text-[11px] text-[#6B7280]">{label}</p>
                      <p className="text-[13px] font-semibold text-[#222222] mt-0.5">{value || '직접 확인 필요'}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Add medication */}
          <button
            onClick={() => navigate('prescription-edit', { draft })}
            disabled={editingDisabled}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3 rounded-2xl border-2 border-dashed border-[#AEBFB7]"
          >
            <PlusIcon size={16} className="text-[#AEBFB7]" />
            <span className="text-[13px] text-[#AEBFB7] font-medium">+ 약 추가</span>
          </button>
        </div>

        {/* Warning */}
        <div className="bg-[#FFF3F0] rounded-2xl p-4 flex gap-3 border border-[#E07A5F]/20">
          <InfoIcon size={16} className="text-[#E07A5F] flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#E07A5F] leading-snug">
            AI가 인식한 결과이므로 실제 처방전과 일치하는지 반드시 확인해주세요.
          </p>
        </div>

        <button
          disabled={!meds.length}
          onClick={() => savedId === undefined
            ? navigate('safety-preview', { draft })
            : navigate('prescription-detail', { recordId: savedId })}
          className="w-full bg-[#E07A5F] rounded-2xl py-4 flex items-center justify-center gap-2 shadow-md shadow-[#E07A5F]/30 active:scale-[0.98] transition-transform disabled:opacity-60"
        >
          <CheckIcon size={18} className="text-white" strokeWidth={3} />
          <span className="text-white text-[16px] font-bold">
            {savedId !== undefined ? '저장한 처방 보기' : '안전성 확인하기'}
          </span>
        </button>
      </div>
    </div>
  );
}
