import { useState } from 'react';
import { CheckIcon, ChevronRightIcon, XIcon } from './Icons';

type MealTime = '아침' | '점심' | '저녁';
type SpecialTime = 'bedtime' | 'empty-stomach' | null;
type DoseTiming = 'before' | 'after' | 'immediately';

interface Selection {
  mealTimes: MealTime[];
  specialTime: SpecialTime;
  doseTiming: DoseTiming;
  minutes: string;
}

export interface UsageSelectorProps {
  value: string | null;
  timesPerDay: string | null;
  onChange: (usage: string) => void;
}

const MEAL_TIMES: MealTime[] = ['아침', '점심', '저녁'];

function suggestedMealTimes(timesPerDay: string | null): MealTime[] {
  const count = Number.parseInt(timesPerDay ?? '', 10);
  if (count === 1) return ['아침'];
  if (count === 2) return ['아침', '저녁'];
  if (count === 3) return ['아침', '점심', '저녁'];
  return [];
}

function defaultSelection(timesPerDay: string | null): Selection {
  return {
    mealTimes: suggestedMealTimes(timesPerDay),
    specialTime: null,
    doseTiming: 'after',
    minutes: '30',
  };
}

function parseUsage(value: string | null, timesPerDay: string | null): Selection {
  const fallback = defaultSelection(timesPerDay);
  if (!value?.trim()) return fallback;

  // Keep meal times unspecified when the OCR text does not contain them.
  fallback.mealTimes = [];
  const usage = value.trim();
  const bedtime = usage.match(/^취침\s*전(?:\s*(\d+)\s*분)?$/);
  if (bedtime) {
    return {
      ...fallback,
      mealTimes: [],
      specialTime: 'bedtime',
      minutes: bedtime[1] ?? '30',
    };
  }

  if (/^(?:식간\s*(?:\(공복\))?|공복\s*시?)$/.test(usage)) {
    return {
      ...fallback,
      mealTimes: [],
      specialTime: 'empty-stomach',
    };
  }

  const regular = usage.match(
    /^(?:((?:아침|점심|저녁)(?:\s*[·,]\s*(?:아침|점심|저녁))*)\s+)?식?(전|후|직후)(?:\s*(\d+)\s*분)?$/,
  );
  if (!regular) return fallback;

  const mealTimes = regular[1]
    ? MEAL_TIMES.filter(time => regular[1].includes(time))
    : fallback.mealTimes;
  const doseTiming: DoseTiming =
    regular[2] === '전' ? 'before' : regular[2] === '후' ? 'after' : 'immediately';

  return {
    mealTimes,
    specialTime: null,
    doseTiming,
    minutes: regular[3] ?? '30',
  };
}

function formatUsage(selection: Selection): string {
  if (selection.specialTime === 'empty-stomach') return '식간(공복)';
  if (selection.specialTime === 'bedtime') {
    return `취침 전 ${selection.minutes || '30'}분`;
  }

  const mealTimes = MEAL_TIMES.filter(time => selection.mealTimes.includes(time)).join('·');
  const timing =
    selection.doseTiming === 'before'
      ? `식전 ${selection.minutes || '30'}분`
      : selection.doseTiming === 'after'
        ? `식후 ${selection.minutes || '30'}분`
        : '식직후';
  return `${mealTimes} ${timing}`.trim();
}

export default function UsageSelector({
  value,
  timesPerDay,
  onChange,
}: UsageSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [edited, setEdited] = useState(false);
  const [draft, setDraft] = useState<Selection>(() => parseUsage(value, timesPerDay));

  const openSheet = () => {
    setEdited(false);
    setDraft(parseUsage(value, timesPerDay));
    setIsOpen(true);
  };

  const closeSheet = () => setIsOpen(false);

  const toggleMealTime = (mealTime: MealTime) => {
    setEdited(true);
    setDraft(current => ({
      ...current,
      mealTimes: current.mealTimes.includes(mealTime)
        ? current.mealTimes.filter(item => item !== mealTime)
        : [...current.mealTimes, mealTime],
      specialTime: null,
    }));
  };

  const selectSpecialTime = (specialTime: Exclude<SpecialTime, null>) => {
    setEdited(true);
    setDraft(current => ({
      ...current,
      mealTimes: [],
      specialTime,
    }));
  };


  const canApply = edited && (draft.specialTime !== null || draft.mealTimes.length > 0);
  const timingDisabled = draft.specialTime !== null;
  const minutesDisabled =
    draft.specialTime === 'empty-stomach' ||
    (draft.specialTime === null && draft.doseTiming === 'immediately');

  const applySelection = () => {
    if (!canApply) return;
    onChange(formatUsage(draft));
    setIsOpen(false);
  };

  return (
    <>
      <button
        type="button"
        onClick={openSheet}
        className="w-full flex items-center justify-between gap-2 text-left"
        aria-haspopup="dialog"
        aria-expanded={isOpen}
      >
        <span
          className={`min-w-0 text-[12px] font-semibold leading-snug ${
            value ? 'text-[#222222]' : 'text-[#AEBFB7]'
          }`}
        >
          {value || '복용 방법 선택'}
        </span>
        <ChevronRightIcon size={14} className="text-[#AEBFB7] flex-shrink-0" />
      </button>

      {isOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/45"
          onClick={closeSheet}
          role="presentation"
        >
          <div
            className="w-full max-w-[430px] max-h-[88dvh] overflow-y-auto rounded-t-[28px] bg-white px-5 pt-4 pb-7 scale-in"
            onClick={event => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-labelledby="usage-selector-title"
          >
            <div className="w-10 h-1 bg-[#E8EDEB] rounded-full mx-auto mb-4" />

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 id="usage-selector-title" className="text-[17px] font-bold text-[#222222]">
                  복용 방법 선택
                </h2>
                <p className="text-[12px] text-[#6B7280] mt-1">
                  처방전에 맞게 시간대와 복용 시점을 선택해 주세요.
                </p>
              </div>
              <button
                type="button"
                onClick={closeSheet}
                className="w-9 h-9 rounded-full bg-[#F4F7F6] flex items-center justify-center flex-shrink-0"
                aria-label="복용 방법 선택 닫기"
              >
                <XIcon size={16} className="text-[#6B7280]" />
              </button>
            </div>

            <section className="mb-5">
              <h3 className="text-[13px] font-bold text-[#222222] mb-3">시간대</h3>
              <div className="grid grid-cols-3 gap-2">
                {MEAL_TIMES.map(mealTime => {
                  const selected = draft.mealTimes.includes(mealTime);
                  return (
                    <button
                      key={mealTime}
                      type="button"
                      onClick={() => toggleMealTime(mealTime)}
                      className={`h-11 rounded-xl border flex items-center justify-center gap-2 text-[13px] font-semibold transition-colors ${
                        selected
                          ? 'border-[#47795E] bg-[#47795E]/10 text-[#47795E]'
                          : 'border-[#E8EDEB] bg-white text-[#6B7280]'
                      }`}
                      aria-pressed={selected}
                    >
                      <span
                        className={`w-4 h-4 rounded-[5px] border flex items-center justify-center ${
                          selected
                            ? 'border-[#47795E] bg-[#47795E]'
                            : 'border-[#AEBFB7] bg-white'
                        }`}
                      >
                        {selected && <CheckIcon size={11} className="text-white" strokeWidth={3} />}
                      </span>
                      {mealTime}
                    </button>
                  );
                })}
              </div>

              <div className="grid grid-cols-2 gap-2 mt-2">
                {[
                  { key: 'bedtime' as const, label: '취침전' },
                  { key: 'empty-stomach' as const, label: '식간(공복)' },
                ].map(option => {
                  const selected = draft.specialTime === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      onClick={() => selectSpecialTime(option.key)}
                      className={`h-11 rounded-xl border flex items-center justify-center gap-2 text-[13px] font-semibold transition-colors ${
                        selected
                          ? 'border-[#E07A5F] bg-[#E07A5F]/10 text-[#E07A5F]'
                          : 'border-[#E8EDEB] bg-white text-[#6B7280]'
                      }`}
                      aria-pressed={selected}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selected ? 'border-[#E07A5F]' : 'border-[#AEBFB7]'
                        }`}
                      >
                        {selected && <span className="w-2 h-2 rounded-full bg-[#E07A5F]" />}
                      </span>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className={`mb-5 ${timingDisabled ? 'opacity-40' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[13px] font-bold text-[#222222]">복용 시점</h3>
                {timingDisabled && (
                  <span className="text-[11px] text-[#6B7280]">현재 선택에서는 사용하지 않아요</span>
                )}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'before' as const, label: '전' },
                  { key: 'after' as const, label: '후' },
                  { key: 'immediately' as const, label: '직후' },
                ].map(option => {
                  const selected = draft.doseTiming === option.key;
                  return (
                    <button
                      key={option.key}
                      type="button"
                      disabled={timingDisabled}
                      onClick={() => { setEdited(true); setDraft(current => ({ ...current, doseTiming: option.key })); }}
                      className={`h-11 rounded-xl border flex items-center justify-center gap-2 text-[13px] font-semibold ${
                        selected
                          ? 'border-[#47795E] bg-[#47795E]/10 text-[#47795E]'
                          : 'border-[#E8EDEB] bg-white text-[#6B7280]'
                      } disabled:cursor-not-allowed`}
                    >
                      <span
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          selected ? 'border-[#47795E]' : 'border-[#AEBFB7]'
                        }`}
                      >
                        {selected && <span className="w-2 h-2 rounded-full bg-[#47795E]" />}
                      </span>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="mb-6">
              <h3 className="text-[13px] font-bold text-[#222222] mb-3">분 입력</h3>
              <div
                className={`rounded-2xl bg-[#F4F7F6] px-4 py-3 flex items-center gap-3 ${
                  minutesDisabled ? 'opacity-40' : ''
                }`}
              >
                <input
                  type="number"
                  inputMode="numeric"
                  min="0"
                  value={draft.minutes}
                  disabled={minutesDisabled}
                  onChange={event => {
                    setEdited(true);
                    setDraft(current => ({
                      ...current,
                      minutes: event.target.value.replace(/\D/g, ''),
                    }));
                  }}
                  className="min-w-0 flex-1 bg-transparent outline-none text-[15px] font-bold text-[#222222] disabled:cursor-not-allowed"
                  aria-label="복용 시점 분"
                />
                <span className="text-[13px] font-semibold text-[#6B7280]">분</span>
              </div>
            </section>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={closeSheet}
                className="flex-1 py-3.5 rounded-2xl bg-[#F4F7F6] text-[14px] font-semibold text-[#6B7280]"
              >
                취소
              </button>
              <button
                type="button"
                onClick={applySelection}
                disabled={!canApply}
                className="flex-1 py-3.5 rounded-2xl bg-[#47795E] text-[14px] font-bold text-white flex items-center justify-center gap-1.5 shadow-sm disabled:bg-[#AEBFB7] disabled:shadow-none"
              >
                <CheckIcon size={16} className="text-white" strokeWidth={3} />
                적용
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
