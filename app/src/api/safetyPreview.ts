import type { AnalysisDraft } from './analyze';
import { recordsPath, safetyPath } from './management';
import type { PrescriptionRecord, RecordMedicine, SafetyResult } from './management';
import { buildPrescriptionPayload } from './registerPrescription';

interface PreviewMedicine {
  name: string;
  product_code: string | null;
  hospital: string | null;
  issued_at: string | null;
}

type ActiveRecordDetail = Pick<PrescriptionRecord, 'hospital' | 'issued_at'> & {
  medicines: (RecordMedicine & { product_code: string | null })[];
};

async function loadExistingMedicines(signal: AbortSignal): Promise<PreviewMedicine[]> {
  const list = await fetch(recordsPath('taking'), { signal });
  if (!list.ok) throw new Error('복용 중인 처방 목록을 불러오지 못했어요.');
  const records: Pick<PrescriptionRecord, 'id'>[] = await list.json();
  if (!Array.isArray(records) || records.some(record => !Number.isSafeInteger(record?.id))) {
    throw new Error('복용 중인 처방 목록을 확인하지 못했어요.');
  }

  const ids = [...new Set(records.map(record => record.id))];
  const details = await Promise.all(ids.map(async id => {
    const response = await fetch(`/api/records/${id}`, { signal });
    if (!response.ok) throw new Error('복용 중인 처방의 상세 정보를 모두 불러오지 못했어요.');
    const record: ActiveRecordDetail = await response.json();
    if (!Array.isArray(record?.medicines) || record.medicines.some(m =>
      typeof m?.taking !== 'boolean' || typeof m.name !== 'string'
      || (m.product_code !== null && typeof m.product_code !== 'string')
    )) {
      throw new Error('복용 중인 처방의 상세 정보를 확인하지 못했어요.');
    }
    return record.medicines.filter(m => m.taking === true).map(m => ({
      name: m.name,
      product_code: m.product_code,
      hospital: record.hospital,
      issued_at: record.issued_at,
    }));
  }));
  return details.flat();
}

export async function previewPrescription(draft: AnalysisDraft, signal: AbortSignal) {
  const payload = buildPrescriptionPayload(draft);
  const existing = await loadExistingMedicines(signal);
  const incoming = payload.medicines.map(({ name, product_code }) => ({
    name, product_code, hospital: payload.hospital, issued_at: payload.issued_at,
  }));
  const response = await fetch(safetyPath, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ medicines: [...existing, ...incoming] }),
    signal,
  });
  if (!response.ok) throw new Error('안전성 검사 요청에 실패했어요.');
  const result: SafetyResult = await response.json();
  if (!Array.isArray(result?.combo) || !Array.isArray(result.duplicate) || !Array.isArray(result.alerts)) {
    throw new Error('안전성 검사 응답을 확인하지 못했어요.');
  }
  return { result, existingCount: existing.length, incomingCount: incoming.length };
}
