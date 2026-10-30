import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import { ArrowLeftIcon, AlertTriangleIcon, InfoIcon, PillIcon } from '../components/Icons';

export default function SafetyDetailScreen() {
  const { goBack } = useNav();
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

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-4 pt-4">
        {/* Top warning */}
        <div className="bg-[#E07A5F] rounded-3xl p-5 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <AlertTriangleIcon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-[17px]">함께 복용 시 주의가 필요해요</p>
            </div>
          </div>
          <p className="text-white/85 text-[13px] leading-snug">
            현재 복용 중인 약 중 함께 복용할 때 주의가 필요한 조합이 있어요.
          </p>
        </div>

        {/* 병용 주의 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#E07A5F]" />
            <h2 className="text-[15px] font-bold text-[#222222]">병용 주의</h2>
          </div>

          {/* Pair */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-[#FFF3F0] rounded-2xl p-3.5 text-center border border-[#E07A5F]/20">
              <div className="flex justify-center mb-2">
                <PillIcon size={20} className="text-[#E07A5F]" />
              </div>
              <p className="text-[12px] font-bold text-[#222222] leading-tight">록소프로펜정<br/>60mg</p>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-8 h-8 rounded-full bg-[#E07A5F]/10 flex items-center justify-center">
                <span className="text-[#E07A5F] text-[14px] font-black">+</span>
              </div>
            </div>
            <div className="flex-1 bg-[#FFF3F0] rounded-2xl p-3.5 text-center border border-[#E07A5F]/20">
              <div className="flex justify-center mb-2">
                <PillIcon size={20} className="text-[#E07A5F]" />
              </div>
              <p className="text-[12px] font-bold text-[#222222] leading-tight">레바미피드정<br/>100mg</p>
            </div>
          </div>

          <div className="bg-[#FFF3F0] rounded-2xl p-4 mb-3">
            <p className="text-[13px] text-[#222222] font-semibold mb-1">쉽게 이해하기</p>
            <p className="text-[13px] text-[#6B7280] leading-snug">
              두 약을 함께 복용하는 경우 위장 관련 증상에 주의가 필요해요.
            </p>
          </div>

          <div className="flex gap-2 bg-[#47795E]/5 rounded-2xl p-3">
            <InfoIcon size={15} className="text-[#47795E] flex-shrink-0 mt-0.5" />
            <p className="text-[12px] text-[#47795E] leading-snug">
              임의로 약 복용을 중단하지 말고 의사 또는 약사와 상담해주세요.
            </p>
          </div>
        </div>

        {/* 중복 성분 주의 */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-2 h-2 rounded-full bg-[#E07A5F]" />
            <h2 className="text-[15px] font-bold text-[#222222]">중복 성분 주의</h2>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <div className="flex-1 bg-[#FFF3F0] rounded-2xl p-3.5 text-center border border-[#E07A5F]/20">
              <p className="text-[11px] text-[#6B7280] mb-0.5">서울병원</p>
              <p className="text-[12px] font-bold text-[#222222] leading-tight">세티리진정 10mg</p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#E07A5F]/10 flex items-center justify-center flex-shrink-0">
              <span className="text-[#E07A5F] text-[14px] font-black">=</span>
            </div>
            <div className="flex-1 bg-[#FFF3F0] rounded-2xl p-3.5 text-center border border-[#E07A5F]/20">
              <p className="text-[11px] text-[#6B7280] mb-0.5">연세병원</p>
              <p className="text-[12px] font-bold text-[#222222] leading-tight">몬테루카스트정 10mg</p>
            </div>
          </div>

          <div className="bg-[#FFF3F0] rounded-2xl p-4">
            <p className="text-[13px] text-[#6B7280] leading-snug">
              같은 계열의 성분이 포함되어 있어 중복 복용에 주의가 필요해요.
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="bg-[#F4F7F6] rounded-2xl p-4">
          <p className="text-[12px] text-[#6B7280] leading-snug text-center">
            이 결과는 의약품 정보를 바탕으로 제공되는 참고 정보입니다.<br/>
            복용 변경 전 반드시 의료 전문가와 상담해주세요.
          </p>
        </div>

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
