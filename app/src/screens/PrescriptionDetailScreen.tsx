import { useState } from 'react';
import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import DatePickerModal from '../components/DatePickerModal';
import { ArrowLeftIcon, ChevronRightIcon, ShieldCheckIcon, PillIcon, CalendarIcon } from '../components/Icons';

const meds = [
  { name: '아목시실린캡슐 500mg', type: '빨강/흰색 경질캡슐', info: '1회 1캡슐 · 하루 3회 · 식후 30분 · 5일' },
  { name: '록소프로펜정 60mg',    type: '흰색 원형정',       info: '1회 1정 · 하루 3회 · 식후 30분 · 5일' },
  { name: '레바미피드정 100mg',   type: '흰색 원형정',       info: '1회 1정 · 하루 3회 · 식후 30분 · 5일' },
];

export default function PrescriptionDetailScreen() {
  const { goBack, navigate } = useNav();
  const [date, setDate] = useState('2026년 9월 25일');
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6] relative">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-4">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-[#F4F7F6] flex items-center justify-center">
            <ArrowLeftIcon size={20} className="text-[#222222]" />
          </button>
          <h1 className="text-[18px] font-bold text-[#222222]">처방 상세</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-4 pt-4">
        {/* Hospital card */}
        <div className="bg-[#47795E] rounded-3xl p-5 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/75 text-[12px] font-medium mb-1">처방 병원</p>
              <h2 className="text-white text-[22px] font-black mb-1">서울병원</h2>
              <p className="text-white/80 text-[14px] font-medium">김의사</p>
            </div>
            {/* Calendar button — opens date picker */}
            <button
              onClick={() => setShowDatePicker(true)}
              className="bg-white/20 rounded-2xl p-2.5 active:bg-white/30 transition-colors"
            >
              <CalendarIcon size={22} className="text-white" />
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3">
            {/* Date — tappable to edit */}
            <button
              onClick={() => setShowDatePicker(true)}
              className="text-left active:opacity-70 transition-opacity"
            >
              <p className="text-white/60 text-[11px]">처방일</p>
              <div className="flex items-center gap-1 mt-0.5">
                <p className="text-white text-[13px] font-semibold">{date}</p>
              </div>
              <p className="text-white/50 text-[10px] mt-0.5">눌러서 변경</p>
            </button>
            <div>
              <p className="text-white/60 text-[11px]">진단명</p>
              <p className="text-white text-[13px] font-semibold mt-0.5">급성 인두염</p>
            </div>
          </div>
        </div>

        {/* Medications */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="text-[15px] font-bold text-[#222222] mb-4">처방 약 3개</h2>
          <div className="space-y-3">
            {meds.map((m) => (
              <button
                key={m.name}
                onClick={() => navigate('medication-detail', { medicationName: m.name })}
                className="w-full text-left flex items-start gap-3 p-4 rounded-2xl bg-[#F4F7F6] active:bg-[#EBF0EE] transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <PillIcon size={24} className="text-[#47795E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-bold text-[#222222]">{m.name}</p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">{m.type}</p>
                  <p className="text-[12px] text-[#47795E] font-medium mt-1.5">{m.info}</p>
                </div>
                <div className="flex flex-col items-end gap-1 flex-shrink-0">
                  <ChevronRightIcon size={16} className="text-[#AEBFB7]" />
                  <span className="text-[10px] text-[#47795E] font-semibold bg-[#47795E]/10 px-1.5 py-0.5 rounded-full">약 정보 보기</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Safety CTA */}
        <button
          onClick={() => navigate('safety-detail')}
          className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm active:bg-[#F4F7F6] transition-colors"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#47795E]/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon size={20} className="text-[#47795E]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-bold text-[#222222]">약 안전 확인</p>
            <p className="text-[12px] text-[#6B7280]">복용 중인 약의 안전성을 확인해요</p>
          </div>
          <ChevronRightIcon size={16} className="text-[#AEBFB7]" />
        </button>
      </div>

      {/* Date picker modal */}
      {showDatePicker && (
        <DatePickerModal
          value={date}
          onConfirm={setDate}
          onClose={() => setShowDatePicker(false)}
        />
      )}
    </div>
  );
}
