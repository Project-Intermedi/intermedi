import { useState } from 'react';
import { ChevronRightIcon, ArrowLeftIcon, CheckIcon } from './Icons';

interface Props {
  value: string; // "2026년 9월 25일"
  onConfirm: (date: string) => void;
  onClose: () => void;
}

const MONTHS = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];
const WEEKDAYS = ['일','월','화','수','목','금','토'];

function parseKorean(s: string): { year: number; month: number; day: number } {
  const m = s.match(/(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일/);
  if (m) return { year: +m[1], month: +m[2], day: +m[3] };
  const today = new Date();
  return { year: today.getFullYear(), month: today.getMonth() + 1, day: today.getDate() };
}

function toKorean(year: number, month: number, day: number) {
  return `${year}년 ${month}월 ${day}일`;
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate();
}

function firstDayOfWeek(year: number, month: number) {
  return new Date(year, month - 1, 1).getDay();
}

export default function DatePickerModal({ value, onConfirm, onClose }: Props) {
  const parsed = parseKorean(value);
  const [year, setYear] = useState(parsed.year);
  const [month, setMonth] = useState(parsed.month);
  const [selected, setSelected] = useState(parsed.day);

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12); }
    else setMonth(m => m - 1);
    setSelected(1);
  };

  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1); }
    else setMonth(m => m + 1);
    setSelected(1);
  };

  const totalDays = daysInMonth(year, month);
  const startOffset = firstDayOfWeek(year, month);
  const cells: (number | null)[] = [
    ...Array(startOffset).fill(null),
    ...Array.from({ length: totalDays }, (_, i) => i + 1),
  ];
  // pad to full rows
  while (cells.length % 7 !== 0) cells.push(null);

  const today = new Date();
  const isToday = (d: number) =>
    d === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();

  return (
    /* Overlay */
    <div
      className="absolute inset-0 z-50 flex flex-col justify-end"
      style={{ background: 'rgba(0,0,0,0.45)' }}
      onClick={onClose}
    >
      {/* Sheet */}
      <div
        className="bg-white rounded-t-[28px] px-5 pt-5 pb-8 scale-in"
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-[#E8EDEB] rounded-full mx-auto mb-5" />

        {/* Title */}
        <p className="text-[17px] font-bold text-[#222222] mb-5 text-center">처방일 변경</p>

        {/* Month nav */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={prevMonth}
            className="w-9 h-9 rounded-full bg-[#F4F7F6] flex items-center justify-center"
          >
            <ArrowLeftIcon size={18} className="text-[#222222]" />
          </button>
          <span className="text-[16px] font-bold text-[#222222]">
            {year}년 {MONTHS[month - 1]}
          </span>
          <button
            onClick={nextMonth}
            className="w-9 h-9 rounded-full bg-[#F4F7F6] flex items-center justify-center"
          >
            <ChevronRightIcon size={18} className="text-[#222222]" />
          </button>
        </div>

        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {WEEKDAYS.map((d, i) => (
            <div
              key={d}
              className={`text-center text-[12px] font-semibold py-1 ${
                i === 0 ? 'text-[#E07A5F]' : i === 6 ? 'text-[#4B87CC]' : 'text-[#AEBFB7]'
              }`}
            >
              {d}
            </div>
          ))}
        </div>

        {/* Day grid */}
        <div className="grid grid-cols-7 gap-y-1 mb-6">
          {cells.map((d, i) => {
            if (!d) return <div key={`e-${i}`} />;
            const colIdx = i % 7;
            const isSelected = d === selected;
            const isTod = isToday(d);
            return (
              <button
                key={d}
                onClick={() => setSelected(d)}
                className={`aspect-square flex items-center justify-center rounded-full text-[14px] font-medium mx-auto w-9 h-9 transition-all ${
                  isSelected
                    ? 'bg-[#47795E] text-white font-bold shadow-sm'
                    : isTod
                    ? 'bg-[#47795E]/10 text-[#47795E] font-bold'
                    : colIdx === 0
                    ? 'text-[#E07A5F]'
                    : colIdx === 6
                    ? 'text-[#4B87CC]'
                    : 'text-[#222222]'
                }`}
              >
                {d}
              </button>
            );
          })}
        </div>

        {/* Selected display */}
        <div className="bg-[#F4F7F6] rounded-2xl px-4 py-3 flex items-center justify-between mb-5">
          <span className="text-[13px] text-[#6B7280]">선택한 날짜</span>
          <span className="text-[14px] font-bold text-[#222222]">
            {toKorean(year, month, selected)}
          </span>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3.5 rounded-2xl bg-[#F4F7F6] text-[14px] font-semibold text-[#6B7280]"
          >
            취소
          </button>
          <button
            onClick={() => { onConfirm(toKorean(year, month, selected)); onClose(); }}
            className="flex-1 py-3.5 rounded-2xl bg-[#47795E] text-[14px] font-bold text-white flex items-center justify-center gap-1.5 shadow-sm"
          >
            <CheckIcon size={16} className="text-white" strokeWidth={3} />
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
