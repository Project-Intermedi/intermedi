import type { ReactNode } from 'react';

export function ArrowLeft() {
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2.2"><path d="m15 18-6-6 6-6" /></svg>;
}

export function SearchIcon() {
  return <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
}

export function ScreenHeader({ title, subtitle, onBack, action }: {
  title: string; subtitle?: string; onBack?: () => void; action?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#E6EDEA] bg-white/95 px-4 pb-4 pt-3 backdrop-blur">
      <div className="flex min-h-10 items-center gap-2">
        {onBack && (
          <button type="button" onClick={onBack} aria-label="뒤로가기" className="grid size-10 place-items-center rounded-full text-[#27342E] active:bg-[#EDF3F0]">
            <ArrowLeft />
          </button>
        )}
        <h1 className="min-w-0 flex-1 truncate text-[19px] font-bold text-[#1F2924]">{title}</h1>
        {action}
      </div>
      {subtitle && <p className={`${onBack ? 'pl-12' : ''} mt-0.5 text-[12px] text-[#74827B]`}>{subtitle}</p>}
    </header>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="block">
      <span className="mb-2 block text-[13px] font-semibold text-[#33433B]">{label}</span>
      {children}
    </div>
  );
}

export const inputClass = 'h-12 w-full rounded-2xl border border-transparent bg-[#F3F6F5] px-4 text-[14px] text-[#1F2924] outline-none transition placeholder:text-[#A2ACA7] focus:border-[#47795E] focus:bg-white focus:ring-4 focus:ring-[#47795E]/10';

export function EmptyValue() {
  return <span className="text-[#98A39E]">정보를 불러올 예정입니다</span>;
}
