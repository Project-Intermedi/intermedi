import { useNav } from '../context/NavigationContext';
import BottomNav from '../components/BottomNav';
import StatusBar from '../components/StatusBar';
import {
  CameraIcon, ShieldCheckIcon, ChevronRightIcon,
  SearchIcon, PillIcon, LeafIcon, CalendarIcon,
} from '../components/Icons';

const meds = [
  { name: '아목시실린캡슐 500mg', dose: '1캡슐 · 하루 3회 · 식후 30분' },
  { name: '록소프로펜정 60mg',    dose: '1정 · 하루 3회 · 식후 30분' },
  { name: '레바미피드정 100mg',   dose: '1정 · 하루 3회 · 식후 30분' },
];

export default function HomeScreen() {
  const { navigate } = useNav();
  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white">
        <StatusBar />
        <div className="px-5 pb-4">
          <h1 className="text-[30px] font-black text-[#47795E] tracking-tight leading-tight">인터메디</h1>
          <p className="text-[13px] text-[#6B7280] mt-0.5">오늘도 건강하게 관리해요</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 space-y-4 pt-4">
        {/* Camera banner */}
        <button
          onClick={() => navigate('camera')}
          className="w-full rounded-3xl bg-[#E07A5F] p-5 text-left shadow-md active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
              <CameraIcon size={22} className="text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-[17px] leading-tight">처방전 / 약봉투 사진 촬영</p>
            </div>
          </div>
          <p className="text-white/85 text-[13px] leading-snug">사진 한 장으로 처방 정보를 간편하게 확인하세요</p>
          <div className="mt-3 inline-flex items-center gap-1 bg-white/20 rounded-full px-3 py-1.5">
            <span className="text-white text-[12px] font-semibold">지금 촬영하기</span>
            <ChevronRightIcon size={14} className="text-white" />
          </div>
        </button>

        {/* Safety status */}
        <div className="rounded-3xl bg-[#47795E] p-5 shadow-md">
          <div className="flex items-start gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <ShieldCheckIcon size={22} className="text-white" />
            </div>
            <div className="flex-1">
              <p className="text-white/75 text-[12px] font-medium mb-0.5">약 안전 상태</p>
              <p className="text-white font-bold text-[16px] leading-snug">복용 중인 약의 안전성 확인</p>
            </div>
          </div>
          <button
            onClick={() => navigate('safety-detail')}
            className="mt-4 w-full rounded-2xl bg-white/20 py-2.5 text-white text-[14px] font-semibold flex items-center justify-center gap-1"
          >
            자세히 보기 <ChevronRightIcon size={14} className="text-white" />
          </button>
        </div>

        {/* Current medications */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-bold text-[#222222]">현재 복용 중인 약</h2>
            <button
              onClick={() => navigate('integrated-management')}
              className="text-[12px] text-[#47795E] font-semibold"
            >
              전체 보기
            </button>
          </div>
          <div className="flex gap-3 mb-4">
            <div className="flex-1 rounded-2xl bg-[#F4F7F6] p-3 text-center">
              <p className="text-[22px] font-black text-[#47795E]">3</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">등록된 처방</p>
            </div>
            <div className="flex-1 rounded-2xl bg-[#F4F7F6] p-3 text-center">
              <p className="text-[22px] font-black text-[#E07A5F]">5</p>
              <p className="text-[11px] text-[#6B7280] mt-0.5">복용 중인 약</p>
            </div>
          </div>
          <div className="space-y-2.5">
            {meds.map((m) => (
              <button
                key={m.name}
                onClick={() => navigate('medication-detail', { medicationName: m.name })}
                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-[#F4F7F6] active:bg-[#EBF0EE] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-[#47795E]/10 flex items-center justify-center flex-shrink-0">
                  <PillIcon size={16} className="text-[#47795E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#222222] truncate">{m.name}</p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">{m.dose}</p>
                </div>
                <ChevronRightIcon size={16} className="text-[#AEBFB7] flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Quick menu */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="text-[16px] font-bold text-[#222222] mb-4">빠른 메뉴</h2>
          <div className="grid grid-cols-4 gap-2">
            {[
              { label: '처방전 확인', icon: CalendarIcon, color: '#47795E', screen: 'integrated-management' as const },
              { label: '약 안전 확인', icon: ShieldCheckIcon, color: '#47795E', screen: 'safety-detail' as const },
              { label: '약 검색', icon: SearchIcon, color: '#E07A5F', screen: 'medication-search' as const },
              { label: '식별 검색', icon: PillIcon, color: '#47795E', screen: 'pill-appearance-search' as const },
              { label: '영양제 관리', icon: LeafIcon, color: '#E07A5F', screen: 'supplement-management' as const },
            ].map(({ label, icon: Icon, color, screen }) => (
              <button
                key={label}
                onClick={() => navigate(screen)}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center"
                  style={{ backgroundColor: color + '15' }}
                >
                  <Icon size={22} className={color === '#47795E' ? 'text-[#47795E]' : 'text-[#E07A5F]'} />
                </div>
                <span className="text-[11px] font-medium text-[#222222] text-center leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Recent prescription */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[16px] font-bold text-[#222222]">최근 처방</h2>
            <button onClick={() => navigate('integrated-management')} className="text-[12px] text-[#47795E] font-semibold">전체 보기</button>
          </div>
          <button
            onClick={() => navigate('integrated-management')}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-[#F4F7F6] active:bg-[#EBF0EE] transition-colors text-left"
          >
            <div className="w-10 h-10 rounded-xl bg-[#47795E]/10 flex items-center justify-center flex-shrink-0">
              <CalendarIcon size={18} className="text-[#47795E]" />
            </div>
            <div className="flex-1">
              <p className="text-[14px] font-bold text-[#222222]">서울병원</p>
              <p className="text-[12px] text-[#6B7280] mt-0.5">2026년 9월 25일 · 처방약 3개</p>
            </div>
            <ChevronRightIcon size={16} className="text-[#AEBFB7]" />
          </button>
        </div>
      </div>

      <BottomNav active="home" />
    </div>
  );
}
