import { useState } from 'react';
import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';
import { ChevronRightIcon, AlertTriangleIcon, PillIcon } from '../components/Icons';

// 탭별 실제 필터링과 '복용 중 0건 → 전체 자동 선택'은 /records API 연동 단계에서 구현합니다.
type Tab = '복용 중' | '복용 완료' | '전체';
const TABS: Tab[] = ['복용 중', '복용 완료', '전체'];

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
  const [tab, setTab] = useState<Tab>('복용 중');

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="px-5 pb-4 border-b border-[#E8EDEB]">
          <h1 className="text-[22px] font-black text-[#222222]">통합 관리</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 space-y-4 pt-4">
        {/* Summary */}
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
          <span className="text-[13px] text-[#6B7280] font-medium">현재 복용 중인 약</span>
          <span className="text-[16px] font-black text-[#47795E]">5개</span>
        </div>

        {/* Safety summary */}
        <div className="bg-[#FFF3F0] rounded-3xl px-4 py-4 border border-[#E07A5F]/20 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-2xl bg-[#E07A5F]/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangleIcon size={18} className="text-[#E07A5F]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[15px] font-bold text-[#222222]">약 안전 확인</p>
                <span className="text-[10px] font-bold text-[#E07A5F] bg-white border border-[#E07A5F]/30 px-2 py-0.5 rounded-full">검사 전</span>
              </div>
              <p className="text-[12px] text-[#6B7280] mt-0.5">실제 안전성 검사는 아직 연결되지 않았어요.</p>
            </div>
          </div>
          {/* DUR API 연동 전: 검사 결과가 없으므로 건수 대신 '—' 표시 */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            {['중복 성분', '병용 주의', '약 자체 주의'].map(label => (
              <div key={label} className="bg-white/70 rounded-2xl px-2 py-2 text-center border border-dashed border-[#E07A5F]/25">
                <p className="text-[15px] font-black text-[#AEBFB7]" aria-label="검사 전">—</p>
                <p className="text-[10px] text-[#6B7280] mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('safety-detail')}
            className="w-full bg-[#E07A5F] rounded-2xl py-2.5 text-white text-[14px] font-bold shadow-sm shadow-[#E07A5F]/30 active:scale-[0.98] transition-transform"
          >
            안전성 자세히 확인
          </button>
        </div>

        {/* Tabs (스크롤 시 목록 위에 고정) */}
        <div className="sticky top-0 z-10 -mx-4 flex px-5 gap-1 border-b border-[#E8EDEB] bg-[#F4F7F6]">
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

      </div>

      <BottomNav active="integrated-management" />
    </div>
  );
}
