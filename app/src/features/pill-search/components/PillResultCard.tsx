import { useState } from 'react';
import type { PillSearchResult } from '../types/pill';
import { formatImprint } from '../utils/formatImprint';

function PillFace({ color, imprint }: { color: string; imprint: string }) {
  return (
    <div className="relative grid h-18 min-w-0 flex-1 place-items-center overflow-hidden rounded-xl bg-[#EAF1EE]">
      <span className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(#C8D6D0 1px,transparent 1px),linear-gradient(90deg,#C8D6D0 1px,transparent 1px)', backgroundSize: '16px 16px' }} />
      <span className="relative grid h-9 w-12 place-items-center overflow-hidden rounded-[50%] border border-black/10 px-1 text-[10px] font-bold text-black/35 shadow-md" style={{ background: color }}>
        <span className="truncate">{imprint || '—'}</span>
      </span>
    </div>
  );
}

/** 이미지 URL이 있으면 실제 사진, 없거나 로딩에 실패하면 기존 알약 그림을 표시합니다. */
function PillPhoto({ pill, front, back }: { pill: PillSearchResult; front: string; back: string }) {
  const [failed, setFailed] = useState(false);
  if (pill.imageUrl && !failed) {
    return (
      // 식약처 낱알 사진은 약 11:6(1.83:1) 비율이라 컨테이너도 같은 비율로 맞춥니다.
      // 높이가 확정된 컨테이너에서 object-contain으로 그려 사진 전체(앞·뒷면)가 잘리지 않습니다.
      <div className="aspect-[11/6] w-full overflow-hidden rounded-xl bg-[#EAF1EE]">
        <img src={pill.imageUrl} alt={`${pill.name} 낱알 사진`} loading="lazy" onError={() => setFailed(true)} className="block h-full w-full object-contain object-center" />
      </div>
    );
  }
  return (
    <>
      <p className="mb-2 text-[10px] text-[#8B9691]">{pill.imageUrl ? '사진을 불러오지 못해 예시 그림으로 표시해요' : '사진 없음 · 예시 그림'}</p>
      <div className="flex gap-2"><PillFace color={pill.pillColor ?? '#F8FAF9'} imprint={front} /><PillFace color={pill.pillColor ?? '#F8FAF9'} imprint={back} /></div>
    </>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0">
      <dt className="text-[10px] font-semibold text-[#8B9691]">{label}</dt>
      <dd className={`mt-0.5 break-words text-[12px] ${value ? 'font-medium text-[#33433B]' : 'text-[#A2ACA7]'}`}>{value || '정보 없음'}</dd>
    </div>
  );
}

export default function PillResultCard({ pill, onSelect }: { pill: PillSearchResult; onSelect: (pill: PillSearchResult) => void }) {
  const front = formatImprint(pill.frontImprint);
  const back = formatImprint(pill.backImprint);
  const shapeColor = [pill.shape, pill.color].filter(Boolean).join(' · ');
  return (
    <article className="rounded-[22px] bg-white p-4 shadow-[0_5px_24px_rgba(44,67,56,0.07)]">
      <button type="button" onClick={() => onSelect(pill)} className="w-full text-left">
        {/* key: URL이 바뀌면 로딩 실패 상태를 초기화 */}
        <PillPhoto key={pill.imageUrl ?? 'none'} pill={pill} front={front} back={back} />
        <div className="mt-4 flex items-start gap-2">
          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 break-words text-[14px] font-bold leading-5 text-[#1F2924]">{pill.name}</h3>
            {pill.ingredient && <p className="mt-1 truncate text-[12px] text-[#66746D]">{pill.ingredient}</p>}
            <p className="mt-0.5 truncate text-[11px] text-[#8B9691]">{pill.manufacturer || '제조사 정보 없음'}</p>
          </div>
          {pill.category && <span className="shrink-0 rounded-full bg-[#EAF3EE] px-2.5 py-1 text-[10px] font-bold text-[#47795E]">{pill.category}</span>}
        </div>
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2.5 rounded-xl bg-[#F6F8F7] p-3">
          <InfoItem label="모양 · 색상" value={shapeColor} />
          <InfoItem label="제형" value={pill.dosageForm ?? ''} />
          <InfoItem label="앞면 각인" value={front} />
          <InfoItem label="뒷면 각인" value={back} />
        </dl>
      </button>
      <button type="button" onClick={() => onSelect(pill)} className="mt-3 h-10 w-full rounded-xl border border-[#DDE6E2] text-[12px] font-bold text-[#47795E]">약품 상세정보</button>
    </article>
  );
}
