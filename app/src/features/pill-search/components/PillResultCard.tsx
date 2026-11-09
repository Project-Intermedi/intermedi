import type { PillSearchResult } from '../types/pill';

function PillFace({ color, imprint }: { color: string; imprint: string | null }) {
  return (
    <div className="relative grid h-18 flex-1 place-items-center overflow-hidden rounded-xl bg-[#EAF1EE]">
      <span className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(#C8D6D0 1px,transparent 1px),linear-gradient(90deg,#C8D6D0 1px,transparent 1px)', backgroundSize: '16px 16px' }} />
      <span className="relative grid h-9 w-12 place-items-center rounded-[50%] border border-black/10 text-[10px] font-bold text-black/35 shadow-md" style={{ background: color }}>{imprint || '—'}</span>
    </div>
  );
}

export default function PillResultCard({ pill, onSelect }: { pill: PillSearchResult; onSelect: (pill: PillSearchResult) => void }) {
  return (
    <article className="rounded-[22px] bg-white p-4 shadow-[0_5px_24px_rgba(44,67,56,0.07)]">
      <button type="button" onClick={() => onSelect(pill)} className="w-full text-left">
        <p className="mb-2 text-[10px] text-[#8B9691]">목업 예시 그림 · 실제 약품 사진 아님</p><div className="flex gap-2"><PillFace color={pill.pillColor} imprint={pill.frontImprint} /><PillFace color={pill.pillColor} imprint={pill.backImprint} /></div>
        <div className="mt-4 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="text-[14px] font-bold leading-5 text-[#1F2924]">{pill.name}</h3>
            <p className="mt-1 text-[12px] text-[#66746D]">{pill.ingredient}</p>
            <p className="mt-0.5 text-[11px] text-[#8B9691]">{pill.manufacturer || '제조사 정보 미연동'}</p>
          </div>
          {pill.category && <span className="shrink-0 rounded-full bg-[#EAF3EE] px-2.5 py-1 text-[10px] font-bold text-[#47795E]">{pill.category}</span>}
        </div>
      </button>
      <button type="button" onClick={() => onSelect(pill)} className="mt-3 h-10 w-full rounded-xl border border-[#DDE6E2] text-[12px] font-bold text-[#47795E]">약품 상세정보</button>
    </article>
  );
}
