export type PillDosageForm = string;
export type PillShape = string;
export type PillColor = string;
export type PillScoreLine = string;

/** 색상은 최대 2개까지 선택할 수 있습니다. 빈 배열은 '전체'를 의미합니다. */
export const MAX_PILL_COLORS = 2;

export interface PillSearchParams {
  drugName: string;
  imprintFront: string;
  imprintBack: string;
  noBackImprint: boolean;
  imprintSymbol: string;
  dosageForm: PillDosageForm;
  /** 복수 선택. 빈 배열 = 전체 */
  shape: PillShape[];
  /**
   * UI 전용: shape 중 현재 제형에 의해 자동 선택된 모양.
   * 제형 변경 시 이 모양만 해제하고 사용자가 직접 고른 모양은 유지합니다. API 요청에는 포함하지 않습니다.
   */
  autoShapes: PillShape[];
  /** 최대 2개 선택. 빈 배열 = 전체 */
  color: PillColor[];
  scoreLine: PillScoreLine;
  ingredient: string;
  manufacturer: string;
  category: string;
}

/**
 * 낱알 검색 결과 항목. 주석은 백엔드 GET /pills/search 응답 필드와의 대응입니다.
 * 각인 문자열은 원본 그대로 보관하며, 화면 표시는 formatImprint()로 변환합니다.
 */
export interface PillSearchResult {
  id: string;                                    // item_seq
  name: string;                                  // name
  ingredient: string | null;
  manufacturer: string | null;                   // entp
  category: string | null;     // etc_otc
  imageUrl: string | null;                       // image (없으면 기본 알약 그림 표시)
  shape: string | null;                          // shape
  color: string | null;                          // colors (배열은 ' · '로 이어 표시)
  dosageForm: string | null;                     // form
  frontImprint: string | null;                   // print_front
  backImprint: string | null;                    // print_back
  /** 사진이 없을 때 쓰는 목업 알약 그림 색 */
  pillColor?: string;
  isMock?: true;
  scoreLine?: string | null;
}

export interface PillDetail extends PillSearchResult {
  classification: string | null;                 // class_name
  atcCode: string | null;
  equivalence: string | null;
}


export const INITIAL_PILL_SEARCH_PARAMS: PillSearchParams = {
  drugName: '',
  imprintFront: '',
  imprintBack: '',
  noBackImprint: false,
  imprintSymbol: '',
  dosageForm: '전체',
  shape: [],
  autoShapes: [],
  color: [],
  scoreLine: '전체',
  ingredient: '',
  manufacturer: '',
  category: '전체',
};
