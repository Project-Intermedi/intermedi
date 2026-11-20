/**
 * 화면 표시용 각인 문자열 변환. 원본 데이터는 변경하지 않습니다.
 * 예: 'V분할선T' → 'V | T'
 */
export function formatImprint(imprint: string | null | undefined): string {
  if (!imprint) return '';
  return imprint.replace(/분할선/g, ' | ').replace(/\s+/g, ' ').trim();
}
