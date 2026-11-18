import type { PillDosageForm } from '../types/pill';



export default function DosageFormSelector({ options, value, onChange }: { options: string[]; value: PillDosageForm; onChange: (value: PillDosageForm) => void }) {
  return (
    <div className="flex flex-wrap gap-2">
      {['전체', ...options].map((item) => (
        <button type="button" key={item} onClick={() => onChange(item)} aria-pressed={value === item} className={`min-h-11 rounded-full border px-4 text-[12px] font-semibold transition ${value === item ? 'border-[#47795E] bg-[#EAF3EE] text-[#47795E]' : 'border-transparent bg-[#F4F6F5] text-[#68766F]'}`}>
          {item}
        </button>
      ))}
    </div>
  );
}
