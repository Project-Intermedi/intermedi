import { useState } from 'react';
import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import DatePickerModal from '../components/DatePickerModal';
import UsageSelector from '../components/UsageSelector';
import {
  ArrowLeftIcon, CalendarIcon, CheckIcon, PlusIcon, XIcon, EditIcon,
} from '../components/Icons';

import type { AnalysisMedicine as Med } from '../api/analyze';


export default function PrescriptionEditScreen() {
  const { goBack, navigate, params } = useNav();
  const draft = params.draft;

  const [hospital,   setHospital]   = useState(draft?.hospital ?? '');
  const [doctor,     setDoctor]     = useState(draft?.doctor ?? '');
  const [date,       setDate]       = useState(draft?.date ?? '');
  const [diagnosis,  setDiagnosis]  = useState(draft?.diagnosis ?? '');
  const [showDate,   setShowDate]   = useState(false);

  const [meds, setMeds] = useState<Med[]>(() => draft?.medicines.map(m => ({ ...m })) ?? []);

  const updateMed = (idx: number, field: keyof Med, val: string) =>
    setMeds(prev => prev.map((m, i) => i === idx ? { ...m, [field]: val, ...(field === 'name' ? { matched: null, product_code: null } : {}) } : m));

  const removeMed = (idx: number) =>
    setMeds(prev => prev.filter((_, i) => i !== idx));

  const addMed = () =>
    setMeds(prev => [...prev, { name: '', dose: '', freq: '', days: '', usage: null, matched: null, product_code: null, raw_text: null, match_stage: null, distance: null }]);

  const handleSave = () => {
    const updated = { medicines: meds, hospital, doctor, date, diagnosis };
    if (draft) Object.assign(draft, updated);
    navigate('registration-complete', { draft: draft ?? updated });
  };

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6] relative">
      {/* Header */}
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-4">
          <button
            onClick={goBack}
            className="w-9 h-9 rounded-full bg-[#F4F7F6] flex items-center justify-center"
          >
            <ArrowLeftIcon size={20} className="text-[#222222]" />
          </button>
          <h1 className="text-[18px] font-bold text-[#222222]">처방 정보 수정</h1>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pt-4 pb-6 space-y-4">

        {/* Hospital section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 rounded-full bg-[#47795E]" />
            <h2 className="text-[15px] font-bold text-[#222222]">병원 정보</h2>
          </div>

          <div className="space-y-3">
            {/* 병원명 */}
            <div>
              <label className="text-[12px] font-semibold text-[#6B7280] mb-1.5 block">병원명</label>
              <input
                value={hospital}
                onChange={e => setHospital(e.target.value)}
                className="w-full bg-[#F4F7F6] rounded-2xl px-4 py-3 text-[14px] font-medium text-[#222222] outline-none focus:ring-2 focus:ring-[#47795E]/30"
                placeholder="병원 이름을 입력하세요"
              />
            </div>

            {/* 의사명 */}
            <div>
              <label className="text-[12px] font-semibold text-[#6B7280] mb-1.5 block">의사명</label>
              <input
                value={doctor}
                onChange={e => setDoctor(e.target.value)}
                className="w-full bg-[#F4F7F6] rounded-2xl px-4 py-3 text-[14px] font-medium text-[#222222] outline-none focus:ring-2 focus:ring-[#47795E]/30"
                placeholder="의사 이름을 입력하세요"
              />
            </div>

            {/* 처방일 — date picker trigger */}
            <div>
              <label className="text-[12px] font-semibold text-[#6B7280] mb-1.5 block">처방일</label>
              <button
                onClick={() => setShowDate(true)}
                className="w-full bg-[#F4F7F6] rounded-2xl px-4 py-3 flex items-center justify-between focus:ring-2 focus:ring-[#47795E]/30"
              >
                <span className="text-[14px] font-medium text-[#222222]">{date || '정보 없음'}</span>
                <CalendarIcon size={18} className="text-[#47795E]" />
              </button>
            </div>

            {/* 진단명 */}
            <div>
              <label className="text-[12px] font-semibold text-[#6B7280] mb-1.5 block">진단명</label>
              <input
                value={diagnosis}
                onChange={e => setDiagnosis(e.target.value)}
                className="w-full bg-[#F4F7F6] rounded-2xl px-4 py-3 text-[14px] font-medium text-[#222222] outline-none focus:ring-2 focus:ring-[#47795E]/30"
                placeholder="진단명을 입력하세요"
              />
            </div>
          </div>
        </div>

        {/* Medications section */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-1.5 h-5 rounded-full bg-[#E07A5F]" />
            <h2 className="text-[15px] font-bold text-[#222222]">처방 약 {meds.length}개</h2>
          </div>

          <div className="space-y-4">
            {meds.map((m, idx) => (
              <div key={idx} className="rounded-2xl bg-[#F4F7F6] p-4">
                {/* Med header */}
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-6 h-6 rounded-full bg-[#47795E] flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-[11px] font-bold">{idx + 1}</span>
                  </div>
                  <div className="flex-1">
                    <input
                      value={m.name}
                      onChange={e => updateMed(idx, 'name', e.target.value)}
                      className="w-full bg-white rounded-xl px-3 py-2 text-[13px] font-bold text-[#222222] outline-none focus:ring-2 focus:ring-[#47795E]/30"
                      placeholder="약 이름 (예: 아목시실린캡슐 500mg)"
                    />
                  </div>
                  <button
                    onClick={() => removeMed(idx)}
                    className="w-7 h-7 rounded-full bg-[#E07A5F]/10 flex items-center justify-center flex-shrink-0"
                  >
                    <XIcon size={13} className="text-[#E07A5F]" />
                  </button>
                </div>

                {/* Med fields grid */}
                <div className="grid grid-cols-2 gap-2">
                  {/* 1회 투여량 */}
                  <div className="bg-white rounded-xl p-3">
                    <p className="text-[11px] text-[#6B7280] mb-1">1회 투여량</p>
                    <input
                      value={m.dose}
                      onChange={e => updateMed(idx, 'dose', e.target.value)}
                      className="w-full text-[13px] font-semibold text-[#222222] outline-none bg-transparent"
                      placeholder="예: 1정"
                    />
                  </div>

                  {/* 하루 횟수 */}
                  <div className="bg-white rounded-xl p-3">
                    <p className="text-[11px] text-[#6B7280] mb-1">하루 횟수</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateMed(idx, 'freq', String(Math.max(1, +m.freq - 1)))}
                        className="w-6 h-6 rounded-full bg-[#F4F7F6] flex items-center justify-center text-[#47795E] font-bold text-[14px]"
                      >−</button>
                      <span className="flex-1 text-center text-[13px] font-bold text-[#222222]">{m.freq ? `${m.freq}회` : '직접 확인 필요'}</span>
                      <button
                        onClick={() => updateMed(idx, 'freq', String(Math.min(10, +m.freq + 1)))}
                        className="w-6 h-6 rounded-full bg-[#F4F7F6] flex items-center justify-center text-[#47795E] font-bold text-[14px]"
                      >+</button>
                    </div>
                  </div>

                  {/* 투여 기간 */}
                  <div className="bg-white rounded-xl p-3">
                    <p className="text-[11px] text-[#6B7280] mb-1">투여 기간</p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateMed(idx, 'days', String(Math.max(1, +m.days - 1)))}
                        className="w-6 h-6 rounded-full bg-[#F4F7F6] flex items-center justify-center text-[#47795E] font-bold text-[14px]"
                      >−</button>
                      <span className="flex-1 text-center text-[13px] font-bold text-[#222222]">{m.days ? `${m.days}일` : '직접 확인 필요'}</span>
                      <button
                        onClick={() => updateMed(idx, 'days', String(Math.min(365, +m.days + 1)))}
                        className="w-6 h-6 rounded-full bg-[#F4F7F6] flex items-center justify-center text-[#47795E] font-bold text-[14px]"
                      >+</button>
                    </div>
                  </div>

                  {/* 복용 방법 */}
                  <div className="bg-white rounded-xl p-3">
                    <p className="text-[11px] text-[#6B7280] mb-2">복용 방법</p>
                    <UsageSelector
                      value={m.usage}
                      timesPerDay={m.freq}
                      onChange={usage => updateMed(idx, 'usage', usage)}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Add medication */}
          <button
            onClick={addMed}
            className="mt-3 w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-dashed border-[#AEBFB7] active:bg-[#F4F7F6] transition-colors"
          >
            <PlusIcon size={16} className="text-[#47795E]" />
            <span className="text-[13px] text-[#47795E] font-semibold">약 추가하기</span>
          </button>
        </div>

        {/* Guide */}
        <div className="bg-[#47795E]/8 rounded-2xl p-4 flex gap-3">
          <EditIcon size={15} className="text-[#47795E] flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#47795E] leading-snug">
            수정한 내용은 현재 앱에서만 유지되며 DB에는 저장되지 않습니다. 실제 처방전과 동일하게 입력해 주세요.
          </p>
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          className="w-full bg-[#47795E] rounded-2xl py-4 flex items-center justify-center gap-2 shadow-md shadow-[#47795E]/25 active:scale-[0.98] transition-transform"
        >
          <CheckIcon size={18} className="text-white" strokeWidth={3} />
          <span className="text-white text-[16px] font-bold">수정 완료 및 저장</span>
        </button>
      </div>

      {/* Date picker modal */}
      {showDate && (
        <DatePickerModal
          value={date}
          onConfirm={setDate}
          onClose={() => setShowDate(false)}
        />
      )}
    </div>
  );
}
