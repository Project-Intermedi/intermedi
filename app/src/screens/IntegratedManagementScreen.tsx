import { useState } from 'react';
import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';
import { ChevronRightIcon, AlertTriangleIcon, PillIcon } from '../components/Icons';

type Tab = '전체 처방' | '현재 복용 중' | '복용 완료';
const TABS: Tab[] = ['전체 처방', '현재 복용 중', '복용 완료'];

const hospitals = [
  {
    name: '서울병원', doctor: '김의사', date: '2026년 9월 25일', count: '3개 약 복용 중',
    meds: ['아목시실린캡슐 500mg', '록소프로펜정 60mg', '레바미피드정 100mg'],
  },
  {
    name: '연세병원', doctor: '이의사', date: '2026년 9월 20일', count: '2개 약 복용 중',
    meds: ['세티리진정 10mg', '몬테루카스트정 10mg'],
  },
];

export default function IntegratedManagementScreen() {
  const { navigate } = useNav();
  const [tab, setTab] = useState<Tab>('전체 처방');

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="px-5 pb-3">
          <h1 className="text-[22px] font-black text-[#222222]">통합 관리</h1>
        </div>
        {/* Tabs */}
        <div className="flex px-5 gap-1 border-b border-[#E8EDEB]">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-[14px] font-semibold border-b-2 transition-colors ${
                tab === t
                  ? 'border-[#47795E] text-[#47795E]'
                  : 'border-transparent text-[#AEBFB7]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 space-y-4 pt-4">
        {/* Summary */}
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
          <span className="text-[13px] text-[#6B7280] font-medium">현재 복용 중인 약</span>
          <span className="text-[16px] font-black text-[#47795E]">5개</span>
        </div>

        {/* Hospital groups */}
        {hospitals.map((h) => (
          <div key={h.name} className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[16px] font-bold text-[#222222]">{h.name}</p>
                <p className="text-[12px] text-[#6B7280] mt-0.5">{h.date} · {h.doctor}</p>
              </div>
              <span className="text-[11px] font-semibold text-[#47795E] bg-[#47795E]/10 px-2.5 py-1 rounded-full">{h.count}</span>
            </div>
            <div className="space-y-2">
              {h.meds.map(m => (
                <button
                  key={m}
                  onClick={() => navigate('medication-detail', { medicationName: m })}
                  className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#F4F7F6] active:bg-[#EBF0EE] transition-colors text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-[#47795E]/10 flex items-center justify-center flex-shrink-0">
                    <PillIcon size={14} className="text-[#47795E]" />
                  </div>
                  <span className="flex-1 text-[13px] font-medium text-[#222222]">{m}</span>
                  <ChevronRightIcon size={14} className="text-[#AEBFB7]" />
                </button>
              ))}
            </div>
            <button
              onClick={() => navigate('prescription-detail')}
              className="mt-3 w-full text-center text-[13px] text-[#47795E] font-semibold py-2 rounded-xl bg-[#47795E]/5"
            >
              처방 상세 보기
            </button>
          </div>
        ))}

        {/* Safety summary */}
        <div className="bg-[#FFF3F0] rounded-3xl p-5 border border-[#E07A5F]/20 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-[#E07A5F]/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangleIcon size={20} className="text-[#E07A5F]" />
            </div>
            <div>
              <p className="text-[15px] font-bold text-[#222222]">약 안전 확인</p>
              <p className="text-[12px] text-[#6B7280] mt-0.5">여러 병원의 처방을 함께 분석했어요.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {[
              { label: '중복 성분', count: '1건', color: '#E07A5F' },
              { label: '병용 주의', count: '1건', color: '#E07A5F' },
              { label: '복용 시간 주의', count: '0건', color: '#47795E' },
            ].map(({ label, count, color }) => (
              <div key={label} className="bg-white rounded-2xl p-3 text-center">
                <p className="text-[16px] font-black" style={{ color }}>{count}</p>
                <p className="text-[10px] text-[#6B7280] mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('safety-detail')}
            className="w-full bg-[#E07A5F] rounded-2xl py-3 text-white text-[14px] font-bold shadow-sm shadow-[#E07A5F]/30 active:scale-[0.98] transition-transform"
          >
            안전성 자세히 확인
          </button>
        </div>
      </div>

      <BottomNav active="integrated-management" />
    </div>
  );
}
