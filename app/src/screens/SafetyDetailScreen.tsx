import type { ReactNode } from 'react';
import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import { ArrowLeftIcon, AlertTriangleIcon, InfoIcon, PillIcon } from '../components/Icons';

/* ------------------------------------------------------------------ */
/* 백엔드 SafetyOut 응답 타입 (intermedi-backend/server/app/schemas/safety.py) */
/* reason·detail·ingr·cls 등 식약처 원문 필드는 화면에 표시하지 않으므로 타입에서도 제외합니다. */
/* ------------------------------------------------------------------ */
export interface SafetyWho { name: string; spec?: string; hospital?: string; issued_at?: string }
export interface SafetyCombo { a: SafetyWho; b: SafetyWho; plain?: string }
export interface SafetyDuplicate { effect: string; same_drug: boolean; drugs: SafetyWho[] }
export interface SafetyFlagDrug extends SafetyWho { note?: string }
export interface SafetyAlert { type: string; guide?: string; drugs: SafetyFlagDrug[] }
export interface SafetyResult { combo: SafetyCombo[]; duplicate: SafetyDuplicate[]; alerts: SafetyAlert[] }

/**
 * 화면 진입 시 navigate('safety-detail', { safety }) 로 전달할 데이터.
 * 없으면 '안전성 검사 연결 전' 상태로 표시합니다.
 */
export interface SafetyScreenData {
  result: SafetyResult;
  /** 검사 대상 약 개수. 2개 이상일 때만 '함께 복용할 때' 영역을 표시합니다. */
  medicineCount: number;
}

/* alerts[].type(백엔드 값) → 화면 표시명 */
const SELF_TYPES: Record<string, string> = { 임부금기: '임부금기', 특정연령대금기: '특정연령대금기', 고령자주의: '노인주의' };
const USAGE_TYPES: Record<string, string> = { 용량주의: '용량주의', 분할주의: '서방정분할주의' };
/** note가 원문 detail과 같은 유형: note를 표시하지 않음 */
const HIDE_NOTE_TYPES = new Set(['용량주의']);

function isSafetyScreenData(v: unknown): v is SafetyScreenData {
  if (!v || typeof v !== 'object') return false;
  const d = v as Partial<SafetyScreenData>;
  const r = d.result;
  return typeof d.medicineCount === 'number' && !!r
    && Array.isArray(r.combo) && Array.isArray(r.duplicate) && Array.isArray(r.alerts);
}

/* ------------------------------ UI 조각 ------------------------------ */

function Section({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <section className="space-y-2.5">
      <div className="px-1">
        <h2 className="text-[15px] font-bold text-[#222222]">{title}</h2>
        <p className="text-[12px] text-[#6B7280] mt-0.5">{desc}</p>
      </div>
      {children}
    </section>
  );
}

function WarningCard({ type, children }: { type: string; children: ReactNode }) {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-sm space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#E07A5F]" />
        <span className="text-[14px] font-bold text-[#222222]">{type}</span>
      </div>
      {children}
    </div>
  );
}

function DrugChip({ drug, note }: { drug: SafetyWho; note?: string }) {
  return (
    <div className="min-w-0 bg-[#FFF3F0] rounded-2xl px-3 py-2 border border-[#E07A5F]/20">
      <div className="flex items-center gap-1.5 min-w-0">
        <PillIcon size={13} className="text-[#E07A5F] flex-shrink-0" />
        <span className="text-[12px] font-bold text-[#222222] truncate">{drug.name}{drug.spec ? ` ${drug.spec}` : ''}</span>
      </div>
      {drug.hospital && <p className="text-[10px] text-[#6B7280] mt-0.5 truncate">{drug.hospital}</p>}
      {note && <p className="text-[11px] text-[#9C503C] mt-1 leading-snug break-words">{note}</p>}
    </div>
  );
}

function Guide({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <div className="bg-[#FFF3F0] rounded-2xl p-3.5">
      <p className="text-[13px] text-[#4B5563] leading-snug">{text}</p>
    </div>
  );
}

/** 검사 완료 + 해당 항목 0건 (검사 전 상태와 구분) */
function NoItems() {
  return <p className="px-1 text-[12px] text-[#6B7280]">검사 완료 · 이 영역에 해당하는 주의 항목이 없어요.</p>;
}

/** 검사 전: 각 영역이 어떤 항목을 확인하는지만 보여주고 결과는 표시하지 않음 (점선 = 아직 검사 안 함) */
function PendingItems({ labels }: { labels: string[] }) {
  return (
    <div className="bg-white rounded-2xl px-3.5 py-3 shadow-sm">
      <div className="flex flex-wrap gap-1.5">
        {labels.map(l => (
          <span key={l} className="text-[11px] font-semibold text-[#6B7280] bg-[#F4F7F6] border border-dashed border-[#AEBFB7] px-2.5 py-0.5 rounded-full">{l}</span>
        ))}
      </div>
      <p className="text-[11px] text-[#AEBFB7] mt-2">검사 결과가 여기에 표시돼요.</p>
    </div>
  );
}

function AlertCards({ alerts, labels }: { alerts: SafetyAlert[]; labels: Record<string, string> }) {
  const list = alerts.filter(a => a.type in labels && a.drugs.length > 0);
  if (list.length === 0) return <NoItems />;
  return (
    <>
      {list.map(a => (
        <WarningCard key={a.type} type={labels[a.type]}>
          <div className="grid grid-cols-1 gap-2">
            {a.drugs.map((d, i) => (
              <DrugChip key={`${d.name}-${i}`} drug={d} note={HIDE_NOTE_TYPES.has(a.type) ? undefined : d.note} />
            ))}
          </div>
          <Guide text={a.guide} />
        </WarningCard>
      ))}
    </>
  );
}

/* ------------------------------ 화면 ------------------------------ */

export default function SafetyDetailScreen() {
  const { goBack, params } = useNav();
  // DUR API 연동 전에는 전달되는 데이터가 없으므로 항상 '연결 전' 상태입니다.
  const data = isSafetyScreenData(params.safety) ? params.safety : null;
  const r = data?.result;
  const showTogether = !data || data.medicineCount >= 2;
  const total = r
    ? (showTogether ? r.combo.length + r.duplicate.length : 0)
      + r.alerts.filter(a => (a.type in SELF_TYPES || a.type in USAGE_TYPES) && a.drugs.length > 0).length
    : 0;

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-4">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-[#F4F7F6] flex items-center justify-center">
            <ArrowLeftIcon size={20} className="text-[#222222]" />
          </button>
          <h1 className="text-[18px] font-bold text-[#222222]">안전성 상세 결과</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-5 pt-4">
        {/* Top summary */}
        {!r ? (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-dashed border-[#AEBFB7]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-[#47795E]/10 flex items-center justify-center flex-shrink-0">
                <InfoIcon size={20} className="text-[#47795E]" />
              </div>
              <p className="text-[#222222] font-bold text-[16px]">안전성 검사 연결 전</p>
            </div>
            <p className="text-[#6B7280] text-[13px] leading-snug">
              아직 실제 안전성 검사(DUR)가 연결되지 않아 결과가 없어요. 연결되면 아래 세 영역에 결과가 표시돼요.
            </p>
          </div>
        ) : total > 0 ? (
          <div className="bg-[#E07A5F] rounded-3xl p-5 shadow-md">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangleIcon size={22} className="text-white" />
              </div>
              <p className="text-white font-bold text-[17px]">주의가 필요한 항목이 {total}건 있어요</p>
            </div>
            <p className="text-white/85 text-[13px] leading-snug">항목별 안내를 확인하고 의사 또는 약사와 상담해 주세요.</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-5 shadow-sm">
            <p className="text-[#222222] font-bold text-[16px]">확인된 주의 항목이 없어요</p>
            <p className="text-[#6B7280] text-[13px] leading-snug mt-1">의약품 정보 기준의 검사 결과이며, 복용 관련 판단은 의사·약사와 상담해 주세요.</p>
          </div>
        )}

        {/* 1. 함께 복용할 때 (검사 대상 약 2개 이상) */}
        {showTogether && (
          <Section title="함께 복용할 때" desc="여러 약을 같이 먹을 때 확인해야 할 내용이에요.">
            {!r ? <PendingItems labels={['병용금기', '효능군 중복']} />
              : r.combo.length + r.duplicate.length === 0 ? <NoItems />
              : (
                <>
                  {r.combo.map((c, i) => (
                    <WarningCard key={`combo-${i}`} type="병용금기">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 min-w-0"><DrugChip drug={c.a} /></div>
                        <span className="w-7 h-7 rounded-full bg-[#E07A5F]/10 flex items-center justify-center flex-shrink-0 text-[#E07A5F] text-[14px] font-black">+</span>
                        <div className="flex-1 min-w-0"><DrugChip drug={c.b} /></div>
                      </div>
                      <Guide text={c.plain} />
                    </WarningCard>
                  ))}
                  {r.duplicate.map((d, i) => (
                    <WarningCard key={`dup-${i}`} type="효능군 중복">
                      <p className="text-[12px] text-[#6B7280]">
                        <span className="font-semibold text-[#222222]">{d.effect}</span>
                        {d.same_drug ? ' · 같은 약이 여러 번 처방되었어요' : ' · 같은 효능군의 약이 함께 있어요'}
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {d.drugs.map((w, j) => <DrugChip key={`${w.name}-${j}`} drug={w} />)}
                      </div>
                    </WarningCard>
                  ))}
                </>
              )}
          </Section>
        )}

        {/* 2. 이 약 자체의 주의 (약 1개여도 표시) */}
        <Section title="이 약 자체의 주의" desc="복용하는 사람의 상황에 따라 주의가 필요한 약이에요.">
          {!r ? <PendingItems labels={Object.values(SELF_TYPES)} /> : <AlertCards alerts={r.alerts} labels={SELF_TYPES} />}
        </Section>

        {/* 3. 복용 방법 주의 (약 1개여도 표시) */}
        <Section title="복용 방법 주의" desc="먹는 양이나 먹는 방법에 주의가 필요한 약이에요.">
          {!r ? <PendingItems labels={Object.values(USAGE_TYPES)} /> : <AlertCards alerts={r.alerts} labels={USAGE_TYPES} />}
        </Section>

        {/* 전문가 상담 안내 */}
        <div className="flex gap-2 bg-[#47795E]/5 rounded-2xl p-3">
          <InfoIcon size={15} className="text-[#47795E] flex-shrink-0 mt-0.5" />
          <p className="text-[12px] text-[#47795E] leading-snug">
            임의로 약 복용을 중단하지 말고 의사 또는 약사와 상담해주세요.
          </p>
        </div>

        {/* Disclaimer */}
        <div className="bg-[#F4F7F6] rounded-2xl p-4">
          <p className="text-[12px] text-[#6B7280] leading-snug text-center">
            이 결과는 의약품 정보를 바탕으로 제공되는 참고 정보입니다.<br/>
            복용 변경 전 반드시 의료 전문가와 상담해주세요.
          </p>
        </div>

        {/* CTA */}
        <button
          onClick={goBack}
          className="w-full bg-[#47795E] rounded-2xl py-4 text-white text-[16px] font-bold shadow-md shadow-[#47795E]/25 active:scale-[0.98] transition-transform"
        >
          이해했어요
        </button>
      </div>
    </div>
  );
}
