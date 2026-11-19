export type RecordsStatus = 'taking' | 'done' | 'all';

export interface RecordMedicine {
  id: number;
  name: string;
  spec: string | null;
  taking: boolean;
}

export interface PrescriptionRecord {
  id: number;
  hospital: string | null;
  doctor: string | null;
  issued_at: string | null;
  diagnosis: string | null;
  ends_on: string | null;
  taking_count: number;
  medicines: RecordMedicine[];
}

export interface SafetyWho { name: string; spec: string; hospital: string }
interface SafetyCombo { a: SafetyWho; b: SafetyWho; plain: string }
interface SafetyDuplicate { effect: string; same_drug: boolean; drugs: SafetyWho[] }
interface SafetyFlagDrug extends SafetyWho { note: string }
export interface SafetyAlert { type: string; guide: string; drugs: SafetyFlagDrug[] }
export interface SafetyResult { combo: SafetyCombo[]; duplicate: SafetyDuplicate[]; alerts: SafetyAlert[] }

export const recordsPath = (status: RecordsStatus) => `/api/records?status=${status}`;
export const safetyPath = '/api/safety';

export function countTaking(records: PrescriptionRecord[]): number {
  return records.reduce((count, record) => count + record.taking_count, 0);
}

export function formatRecordDate(iso: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso);
  return match ? `${match[1]}년 ${Number(match[2])}월 ${Number(match[3])}일` : iso;
}
