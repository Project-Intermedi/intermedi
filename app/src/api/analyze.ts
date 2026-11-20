export interface AnalysisMedicine {
  name: string;
  product_code: string | null;
  matched: boolean | null;
  raw_text: string | null;
  match_stage: string | null;
  distance: number | null;
  dose: string;
  freq: string;
  days: string;
  usage: string | null;
}
export interface AnalysisDraft {
  source: string;
  imagePath: string | null;
  medicines: AnalysisMedicine[];
  hospital: string;
  doctor: string;
  date: string;
  diagnosis: string;
}
function inputText(value: unknown): string {
  return typeof value === 'string' ? value
    : typeof value === 'number' && Number.isFinite(value) ? String(value) : '';
}

export function parseAnalysis(value: unknown): AnalysisDraft {
  if (!value || typeof value !== 'object' || !('medicines' in value) || !Array.isArray(value.medicines)) {
    throw new Error('서버 응답에 medicines 배열이 없어요. 응답 형식을 확인해주세요.');
  }
  const medicines = value.medicines.map((item: unknown) => {
    if (!item || typeof item !== 'object' || Array.isArray(item)) throw new Error('의약품 응답 형식이 올바르지 않아요.');
    const m = item as Record<string, unknown>;
    const str = (key: string) => typeof m[key] === 'string' ? m[key] as string : null;
    return {
      name: str('name')?.trim() || str('raw_text')?.trim() || '이름 확인 필요',
      product_code: str('product_code'),
      matched: typeof m.matched === 'boolean' ? m.matched : null,
      raw_text: str('raw_text'), match_stage: str('match_stage'),
      distance: typeof m.distance === 'number' ? m.distance : null,
      dose: inputText(m.dose_once), freq: inputText(m.times_per_day),
      days: inputText(m.total_days), usage: str('usage'),
    };
  });
  const metadata = value as Record<string, unknown>;
  return {
    source: inputText(metadata.source).trim() || 'bag',
    imagePath: typeof metadata.image_path === 'string' ? metadata.image_path : null,
    medicines, hospital: inputText(metadata.hospital), doctor: inputText(metadata.doctor),
    date: inputText(metadata.issued_at), diagnosis: inputText(metadata.diagnosis),
  };
}
export async function analyze(file: File, signal: AbortSignal): Promise<AnalysisDraft> {
  const body = new FormData();
  body.append('file', file);
  body.append('source', 'bag');
  let response: Response;
  try {
    response = await fetch('/api/analyze', { method: 'POST', body, signal });
  } catch (error) {
    if (signal.aborted) throw error;
    throw new Error('서버에 연결하지 못했어요. 백엔드 실행 상태를 확인해주세요.');
  }
  if (!response.ok) throw new Error(`분석에 실패했어요 (HTTP ${response.status}). 다시 시도해주세요.`);
  let value: unknown;
  try { value = await response.json(); }
  catch { throw new Error('서버가 올바른 JSON 응답을 반환하지 않았어요.'); }
  return parseAnalysis(value);
}
