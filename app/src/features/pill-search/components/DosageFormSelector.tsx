import type { PillDosageForm } from '../types/pill';

const FORMS: PillDosageForm[] = ['전체', '정제', '경질캡슐', '연질캡슐', '기타'];

export default function DosageFormSelector({ value, onChange }: { value: PillDosageForm; onChange: (value: PillDosageForm) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {FORMS.map((item) => (
        <button type="button" key={item} onClick={() => onChange(item)} className={`min-h-11 rounded-full border px-4 text-[12px] font-semibold transition ${value === item ? 'border-[#47795E] bg-[#EAF3EE] text-[#47795E]' : 'border-transparent bg-[#F4F6F5] text-[#68766F]'}`}>
          {item}
        </button>
      ))}
    </div>
  );
}
