export type PillDosageForm = '전체' | '정제' | '경질캡슐' | '연질캡슐' | '기타';
export type PillShape =
  | '전체' | '원형' | '타원형' | '장방형' | '캡슐형' | '반원형' | '삼각형'
  | '사각형' | '마름모형' | '오각형' | '육각형' | '팔각형' | '기타';
export type PillColor =
  | '전체' | '하양' | '노랑' | '주황' | '분홍' | '빨강' | '갈색' | '연두'
  | '초록' | '청록' | '파랑' | '남색' | '자주' | '보라' | '회색' | '검정' | '투명';
export type PillScoreLine =
  | '전체' | '양면 없음' | '앞면 가로' | '양면 가로' | '앞면 세로'
  | '양면 세로' | '앞면 십자' | '양면 십자' | '가로·십자' | '기타';

export interface PillSearchParams {
  drugName: string;
  imprintFront: string;
  imprintBack: string;
  noBackImprint: boolean;
  imprintSymbol: string;
  dosageForm: PillDosageForm;
  shape: PillShape;
  color: PillColor;
  scoreLine: PillScoreLine;
  ingredient: string;
  manufacturer: string;
}

export interface PillSearchResult {
  id: string;
  name: string;
  ingredient: string;
  manufacturer: string | null;
  category: '전문의약품' | '일반의약품' | null;
  frontImprint: string | null;
  backImprint: string | null;
  pillColor: string;
  isMock: true;
}

export interface PillDetail extends PillSearchResult {
  classification: string | null;
  atcCode: string | null;
  equivalence: string | null;
  shape: string | null;
  color: string | null;
  dosageForm: string | null;
}

export const INITIAL_PILL_SEARCH_PARAMS: PillSearchParams = {
  drugName: '',
  imprintFront: '',
  imprintBack: '',
  noBackImprint: false,
  imprintSymbol: '',
  dosageForm: '전체',
  shape: '전체',
  color: '전체',
  scoreLine: '전체',
  ingredient: '',
  manufacturer: '',
};
