import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import { CheckCircleIcon, PillIcon } from '../components/Icons';

export default function RegistrationCompleteScreen() {
  const { navigate, params } = useNav();
  const draft = params.draft;
  const meds = draft?.medicines ?? [];
  const { recordId } = params;
  if (recordId === undefined) return null;
  return (
    <div className="h-full flex flex-col bg-white">
      <StatusBar />
      <div className="flex-1 overflow-y-auto scrollbar-hide px-6 pb-8">
        {/* Success icon */}
        <div className="flex flex-col items-center pt-10 pb-8">
          <div className="w-24 h-24 rounded-full bg-[#47795E]/10 flex items-center justify-center mb-6 scale-in">
            <CheckCircleIcon size={52} className="text-[#47795E]" />
          </div>
          <h1 className="text-[26px] font-black text-[#222222] mb-2 text-center fade-in">처방을 등록했어요!</h1>
          <p className="text-[14px] text-[#6B7280] text-center leading-relaxed fade-in">
            저장한 처방은 통합 관리에서 확인할 수 있어요.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3 mb-8">
          <button
            onClick={() => navigate('prescription-detail', { recordId })}
            className="w-full bg-[#47795E] rounded-2xl py-4 text-white text-[16px] font-bold shadow-md shadow-[#47795E]/25 active:scale-[0.98] transition-transform"
          >
            저장한 처방 보기
          </button>
          <button
            onClick={() => navigate('integrated-management', { showAllRecords: true })}
            className="w-full bg-[#F4F7F6] rounded-2xl py-4 text-[#47795E] text-[16px] font-semibold active:bg-[#EBF0EE] transition-colors"
          >
            통합 관리에서 보기
          </button>
          <button
            onClick={() => navigate('home')}
            className="w-full bg-[#F4F7F6] rounded-2xl py-4 text-[#222222] text-[16px] font-semibold active:bg-[#EBF0EE] transition-colors"
          >
            홈으로 돌아가기
          </button>
        </div>

        {/* Registered info */}
        <div className="bg-[#F4F7F6] rounded-3xl p-5">
          <h2 className="text-[15px] font-bold text-[#222222] mb-4">등록한 처방 정보</h2>
          <div className="space-y-2.5 mb-4">
            {[
              { label: '병원', value: draft?.hospital || '정보 없음' },
              { label: '의사', value: draft?.doctor || '정보 없음' },
              { label: '처방일', value: draft?.date || '정보 없음' },
              { label: '진단명', value: draft?.diagnosis || '정보 없음' },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between">
                <span className="text-[13px] text-[#6B7280]">{label}</span>
                <span className="text-[13px] font-semibold text-[#222222]">{value}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-[#E8EDEB] pt-4">
            <p className="text-[13px] font-semibold text-[#222222] mb-3">확인한 약</p>
            <div className="space-y-2">
              {meds.map((m, index) => (
                <div key={index} className="flex items-center gap-2.5 bg-white rounded-2xl p-3">
                  <div className="w-8 h-8 rounded-xl bg-[#47795E]/10 flex items-center justify-center flex-shrink-0">
                    <PillIcon size={14} className="text-[#47795E]" />
                  </div>
                  <span className="text-[13px] font-medium text-[#222222]">{m.name || '이름 확인 필요'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
