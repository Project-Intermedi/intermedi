import { useState } from 'react';
import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import { ArrowLeftIcon, AlertTriangleIcon, InfoIcon, CheckIcon } from '../components/Icons';

type Tab = '기본 정보' | '복용법' | '주의사항';
const TABS: Tab[] = ['기본 정보', '복용법', '주의사항'];

export default function MedicationDetailScreen() {
  const { goBack, params } = useNav();
  const [tab, setTab] = useState<Tab>('기본 정보');
  const medName = (params?.medicationName as string) || '아목시실린캡슐 500mg';

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-3">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-[#F4F7F6] flex items-center justify-center">
            <ArrowLeftIcon size={20} className="text-[#222222]" />
          </button>
          <h1 className="text-[18px] font-bold text-[#222222]">약 상세 정보</h1>
        </div>
      </div>

      {/* Pill illustration */}
      <div className="bg-white flex-shrink-0 px-5 pb-5">
        <div className="flex items-center gap-5 mb-4">
          <div className="w-24 h-24 rounded-3xl bg-[#47795E]/10 flex items-center justify-center flex-shrink-0">
            {/* Capsule illustration */}
            <svg width="60" height="30" viewBox="0 0 60 30">
              <rect x="0" y="5" width="30" height="20" rx="10" fill="#E07A5F"/>
              <rect x="30" y="5" width="30" height="20" rx="10" fill="white" stroke="#E8EDEB" strokeWidth="1"/>
              <line x1="30" y1="5" x2="30" y2="25" stroke="#FFFFFF" strokeWidth="1.5"/>
            </svg>
          </div>
          <div>
            <p className="text-[11px] text-[#E07A5F] font-semibold mb-1">전문의약품 · 항생제</p>
            <h2 className="text-[18px] font-black text-[#222222] leading-tight">{medName}</h2>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-2.5 rounded-xl text-[13px] font-semibold transition-colors ${
                tab === t ? 'bg-[#47795E] text-white shadow-sm' : 'bg-[#F4F7F6] text-[#6B7280]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-3 pt-4">
        {tab === '기본 정보' && (
          <>
            <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
              <div>
                <p className="text-[13px] font-bold text-[#222222] mb-1.5">어떤 약인가요?</p>
                <p className="text-[14px] text-[#6B7280] leading-relaxed">
                  세균 감염을 치료하는 항생제예요. 인두염, 편도염, 중이염 등 세균에 의한 감염 질환에 사용돼요.
                </p>
              </div>
              <div className="border-t border-[#F4F7F6] pt-4">
                <p className="text-[13px] font-bold text-[#222222] mb-2">주요 성분</p>
                <div className="bg-[#F4F7F6] rounded-2xl px-4 py-3">
                  <p className="text-[14px] font-semibold text-[#222222]">아목시실린수화물 500mg</p>
                </div>
              </div>
              <div className="border-t border-[#F4F7F6] pt-4">
                <p className="text-[13px] font-bold text-[#222222] mb-2">약 모양</p>
                <div className="bg-[#F4F7F6] rounded-2xl px-4 py-3">
                  <p className="text-[14px] font-semibold text-[#222222]">빨강/흰색 경질캡슐</p>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === '복용법' && (
          <div className="bg-white rounded-3xl p-5 shadow-sm space-y-4">
            <div>
              <p className="text-[13px] font-bold text-[#222222] mb-2">복용 방법</p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { label: '1회 용량', value: '1캡슐' },
                  { label: '하루 횟수', value: '3회' },
                  { label: '복용 시간', value: '식후 30분' },
                  { label: '복용 기간', value: '5일' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-[#F4F7F6] rounded-2xl p-3">
                    <p className="text-[11px] text-[#6B7280]">{label}</p>
                    <p className="text-[15px] font-bold text-[#47795E] mt-1">{value}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[#47795E]/10 rounded-2xl p-4 flex gap-2">
              <CheckIcon size={16} className="text-[#47795E] flex-shrink-0 mt-0.5" strokeWidth={3} />
              <p className="text-[13px] text-[#47795E] leading-snug">
                증상이 좋아져도 의사가 안내한 기간 동안 복용하세요.
              </p>
            </div>
          </div>
        )}

        {tab === '주의사항' && (
          <div className="bg-white rounded-3xl p-5 shadow-sm space-y-3">
            <div className="bg-[#FFF3F0] rounded-2xl p-4 flex gap-2 border border-[#E07A5F]/20">
              <AlertTriangleIcon size={16} className="text-[#E07A5F] flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#E07A5F] leading-snug">
                페니실린 계열 항생제에 알레르기 반응이 있다면 의사에게 반드시 알려주세요.
              </p>
            </div>
            <div className="bg-[#F4F7F6] rounded-2xl p-4 flex gap-2">
              <InfoIcon size={16} className="text-[#6B7280] flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#6B7280] leading-snug">
                복용 중 피부 발진, 호흡 곤란 등이 나타나면 즉시 의료 전문가와 상담하세요.
              </p>
            </div>
            <div className="bg-[#F4F7F6] rounded-2xl p-4 flex gap-2">
              <InfoIcon size={16} className="text-[#6B7280] flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#6B7280] leading-snug">
                복용을 임의로 중단하면 내성균이 생길 수 있어요.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
