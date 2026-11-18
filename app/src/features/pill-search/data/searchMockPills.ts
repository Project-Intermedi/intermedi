import type { PillDetail, PillSearchParams } from '../types/pill';
function includes(source: string | null, query: string) {
  return !query.trim() || (source || '').toLocaleLowerCase().includes(query.trim().toLocaleLowerCase());
}
export function unsupportedMockConditions(params: PillSearchParams): string[] {
  return [params.dosageForm !== '전체' ? '제형' : '', params.imprintSymbol ? '식별 그림' : '', params.scoreLine !== '전체' ? '분할선' : ''].filter(Boolean);
}
export function searchMockPills(results: PillDetail[], params: PillSearchParams): PillDetail[] {
  return results.filter(pill => includes(pill.name, params.drugName)
    && includes(pill.frontImprint, params.imprintFront)
    && (params.noBackImprint ? pill.backImprint === '' : includes(pill.backImprint, params.imprintBack))
    && includes(pill.ingredient, params.ingredient) && includes(pill.manufacturer, params.manufacturer)
    && (params.shape.length === 0 || params.shape.some(shape => shape === pill.shape))
    // 백엔드 규칙과 동일하게, 선택한 색상을 모두 가진 약만 통과합니다.
    && params.color.every(color => (pill.color || '').includes(color)));
}
