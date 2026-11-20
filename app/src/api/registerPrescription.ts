import type { AnalysisDraft } from './analyze';

export function normalizePrescriptionDate(value: string): string | null {
  const text = value.trim();
  if (!text) return null;
  const parts = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(text)
    ?? /^(\d{4})년\s*(\d{1,2})월\s*(\d{1,2})일$/.exec(text);
  if (parts && parts[1] !== '0000') {
    const iso = `${parts[1]}-${parts[2].padStart(2, '0')}-${parts[3].padStart(2, '0')}`;
    const date = new Date(`${iso}T00:00:00Z`);
    if (Number.isFinite(date.getTime()) && date.toISOString().slice(0, 10) === iso) return iso;
  }
  throw new Error('처방일을 확인해 주세요. 날짜가 없다면 처방일을 비워 주세요.');
}

const uncertainSave = '저장 결과를 확인하지 못했어요. 중복 등록을 피하려면 통합 관리에서 저장 여부를 확인한 뒤 다시 시도해 주세요.';

export function buildPrescriptionPayload(draft: AnalysisDraft) {
  if (!draft.medicines.length) throw new Error('등록할 약을 한 개 이상 입력해 주세요.');
  if (draft.medicines.some(m => !m.name.trim() || m.name.trim() === '이름 확인 필요')) {
    throw new Error('모든 약의 이름을 확인해 주세요.');
  }
  const optional = (value: string | null) => value?.trim() || null;
  return {
    source: draft.source,
    image_path: draft.imagePath,
    hospital: optional(draft.hospital),
    doctor: optional(draft.doctor),
    issued_at: normalizePrescriptionDate(draft.date),
    diagnosis: optional(draft.diagnosis),
    medicines: draft.medicines.map(m => ({
      name: m.name.trim(),
      product_code: optional(m.product_code),
      dose_once: optional(m.dose),
      times_per_day: optional(m.freq),
      total_days: optional(m.days),
      usage: optional(m.usage),
      matched: m.matched === true,
      match_stage: m.match_stage,
      raw_text: m.raw_text,
    })),
  };
}

export async function registerPrescription(draft: AnalysisDraft): Promise<number> {
  const body = buildPrescriptionPayload(draft);
  let response: Response;
  try {
    response = await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  } catch {
    throw new Error(uncertainSave);
  }
  if (!response.ok) {
    throw new Error(response.status >= 500
      ? uncertainSave
      : `처방을 저장하지 못했어요 (HTTP ${response.status}). 입력을 확인한 뒤 다시 시도해 주세요.`);
  }
  const result: unknown = await response.json().catch(() => null);
  const id = result && typeof result === 'object' && 'id' in result ? result.id : null;
  if (typeof id !== 'number' || !Number.isSafeInteger(id) || id <= 0) throw new Error(uncertainSave);
  return id;
}
