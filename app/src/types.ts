import type { AnalysisDraft } from './api/analyze';
import type { PillDetail, PillSearchParams } from './features/pill-search/types/pill';
export type ScreenName =
  | 'home'
  | 'camera'
  | 'ai-analysis'
  | 'prescription-review'
  | 'registration-complete'
  | 'integrated-management'
  | 'safety-detail'
  | 'prescription-detail'
  | 'medication-detail'
  | 'medication-search'
  | 'pill-appearance-search'
  | 'pill-search-results'
  | 'pill-search-detail'
  | 'chatbot'
  | 'supplement-management'
  | 'prescription-edit';

/** Original File can later be appended to FormData; no upload is performed. */
export interface CapturedImage {
  analysisDraft?: AnalysisDraft;
  file: File;
  source: 'camera' | 'gallery';
  width: number;
  height: number;
  createdAt: string;
}

export interface NavParams {
  recordId?: number;
  pillSearch?: PillSearchParams;
  pill?: PillDetail;
  capturedImage?: CapturedImage;
  draft?: AnalysisDraft;
  medicationName?: string;
  [key: string]: unknown;
}

export interface StackEntry {
  screen: ScreenName;
  params?: NavParams;
}
