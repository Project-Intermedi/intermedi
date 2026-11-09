import { useState } from 'react';
import type { PillDetail } from '../types/pill';
import { EmptyValue, ScreenHeader } from '../components/PillSearchUI';

type DetailTab = '약품정보' | '허가정보' | '건강보험' | 'DUR';
const TABS: DetailTab[] = ['약품정보', '허가정보', '건강보험', 'DUR'];

export interface PillDetailScreenProps {
  pill: PillDetail;
  onBack?: () => void;
  onSave?: (pill: PillDetail) => void;
}

function PillVisual({ pill }: { pill: PillDetail }) {
  return (
    <div className="relative grid min-h-48 grid-cols-2 place-items-center overflow-hidden rounded-[22px] bg-[#E4F0EB]">
      <span className="absolute inset-0 opacity-60" style={{ backgroundImage: 'linear-gradient(#C8DBD3 1px,transparent 1px),linear-gradient(90deg,#C8DBD3 1px,transparent 1px)', backgroundSize: '30px 30px' }} />
      {[pill.frontImprint, pill.backImprint].map((imprint, index) => (
        <div key={index} className="relative z-10 text-center">
          <span className="grid h-15 w-20 place-items-center rounded-[50%] border border-black/10 text-sm font-bold text-black/35 shadow-lg" style={{ background: pill.pillColor }}>{imprint || '—'}</span>
          <span className="mt-3 block text-[10px] font-semibold text-[#65746C]">{index === 0 ? '앞면' : '뒷면'}</span>
        </div>
      ))}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return <div className="grid grid-cols-[104px_1fr] border-b border-[#EDF1EF] py-4 text-[12px]"><dt className="font-bold text-[#47795E]">{label}</dt><dd className="break-words text-[#35433C]">{value || <EmptyValue />}</dd></div>;
}

export default function PillDetailScreen({ pill, onBack, onSave }: PillDetailScreenProps) {
  const [tab, setTab] = useState<DetailTab>('약품정보');
  const [saved, setSaved] = useState(false);
  const save = () => { setSaved((current) => !current); onSave?.(pill); };
  return (
    <div className="flex h-full min-h-full flex-col bg-[#F2F5F4]">
      <ScreenHeader title={pill.name} onBack={onBack} action={<button type="button" onClick={save} className={`grid size-10 place-items-center rounded-full text-xl ${saved ? 'bg-[#FFF0EC] text-[#E07A5F]' : 'bg-[#EDF3F0] text-[#47795E]'}`} aria-label="저장">{saved ? '★' : '☆'}</button>} />
      <main className="flex-1 overflow-y-auto overscroll-contain px-4 pb-8 pt-4">
        <section className="overflow-hidden rounded-[24px] bg-white shadow-[0_5px_24px_rgba(44,67,56,0.07)]">
          <div className="flex border-b border-[#E8EEEB] px-2 pt-2">
            {TABS.map((item) => <button type="button" key={item} onClick={() => setTab(item)} className={`relative flex-1 py-3 text-[12px] font-bold ${tab === item ? 'text-[#47795E]' : 'text-[#8A9690]'}`}>{item}{tab === item && <span className="absolute inset-x-2 bottom-0 h-0.5 rounded-full bg-[#47795E]" />}</button>)}
          </div>
          {tab === '약품정보' ? (
            <div className="p-5">
              <div className="mb-4 flex items-center justify-between">
                <span className="rounded-full bg-[#EAF3EE] px-2.5 py-1 text-[10px] font-bold text-[#47795E]">{pill.category || '구분 정보 미연동'}</span>
                <span className="text-[10px] font-medium text-[#BE624C]">목업 데이터</span>
              </div>
              <p className="mb-2 text-[11px] text-[#85918B]">앞·뒷면 목업 예시 그림 · 실제 약품 사진 아님</p>
              <PillVisual pill={pill} />
              <dl className="mt-3">
                <InfoRow label="제조사" value={pill.manufacturer} />
                <InfoRow label="분류명" value={pill.classification} />
                <InfoRow label="구분" value={pill.category} />
                <InfoRow label="주성분" value={pill.ingredient} />
                <InfoRow label="ATC 코드" value={pill.atcCode} />
                <InfoRow label="의약품동등성" value={pill.equivalence} />
                <InfoRow label="모양" value={pill.shape} />
                <InfoRow label="색상" value={pill.color} />
                <InfoRow label="제형" value={pill.dosageForm} />
                <InfoRow label="식별 문자" value={pill.frontImprint || pill.backImprint ? `앞: ${pill.frontImprint ?? '정보 없음'} / 뒤: ${pill.backImprint ?? '정보 없음'}` : null} />
              </dl>
            </div>
          ) : (
            <div className="px-7 py-18 text-center">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-[#EDF3F0] text-2xl text-[#47795E]">i</div>
              <h2 className="mt-4 text-[15px] font-bold text-[#2B3932]">{tab} 정보</h2>
              <p className="mt-2 text-[12px] leading-5 text-[#85918B]">현재 미연동 상태입니다. API 연결 후 정보를 불러올 예정입니다.</p>
            </div>
          )}
        </section>
        <p className="mt-5 text-center text-[10px] leading-4 text-[#9AA49F]">표시된 정보는 UI 확인용 목업입니다.<br />복약 전 의사·약사와 상담해주세요.</p>
      </main>
    </div>
  );
}
