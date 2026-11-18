import type { PillDetail, PillSearchParams } from '../features/pill-search/types/pill';

export interface PillOption {
  value: string;
  count: number;
}

export interface PillOptionsResponse {
  shapes: PillOption[];
  colors: PillOption[];
  forms: PillOption[];
  lines: PillOption[];
  categories: PillOption[];
}

export interface PillSearchItem {
  item_seq: string;
  name: string;
  entp: string;
  image: string;
  shape: string;
  colors: string[];
  line: string;
  form: string;
  print_front: string;
  print_back: string;
  class_name: string;
  etc_otc: string;
}

const filterKeys = {
  name: 'drugName',
  front: 'imprintFront',
  back: 'imprintBack',
  shapes: 'shape',
  colors: 'color',
  form: 'dosageForm',
  line: 'scoreLine',
  entp: 'manufacturer',
  category: 'category',
} as const;

type PillFilter = keyof typeof filterKeys;

export interface PillRelaxedCondition {
  drop: PillFilter;
  label: string;
  total: number;
}

export interface PillCountResponse {
  total: number;
  relaxed: PillRelaxedCondition[];
}

export interface PillSearchResponse {
  total: number;
  items: PillSearchItem[];
}

export function pillQuery(params: PillSearchParams) {
  const query = new URLSearchParams();
  for (const [key, field] of Object.entries(filterKeys)) {
    if (key === 'back' && params.noBackImprint) continue;
    const input = params[field];
    for (const value of Array.isArray(input) ? input : [input.trim()]) {
      if (value && value !== '전체') query.append(key, value);
    }
  }
  return query;
}

export function dropPillFilter(params: PillSearchParams, drop: PillFilter): PillSearchParams {
  const field = filterKeys[drop];
  const value = params[field];
  return {
    ...params,
    [field]: Array.isArray(value) ? [] : ['form', 'line', 'category'].includes(drop) ? '전체' : '',
    autoShapes: drop === 'shapes' ? [] : params.autoShapes,
  };
}

async function request<T>(endpoint: string, signal: AbortSignal, query?: URLSearchParams): Promise<T> {
  const url = '/api/pills/' + endpoint + (query?.size ? '?' + query : '');
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`낱알 정보를 불러오지 못했어요 (HTTP ${response.status}).`);
  return response.json() as Promise<T>;
}

export function getPillOptions(signal: AbortSignal) {
  return request<PillOptionsResponse>('options', signal);
}

export function countPills(params: PillSearchParams, signal: AbortSignal) {
  return request<PillCountResponse>('count', signal, pillQuery(params));
}

export function searchPills(params: PillSearchParams, signal: AbortSignal, limit?: number) {
  const query = pillQuery(params);
  if (limit !== undefined) query.set('limit', String(limit));
  return request<PillSearchResponse>('search', signal, query);
}

export function toPillDetail(item: PillSearchItem): PillDetail {
  return {
    id: item.item_seq,
    name: item.name,
    manufacturer: item.entp || null,
    imageUrl: item.image || null,
    shape: item.shape || null,
    color: item.colors.join(' · ') || null,
    dosageForm: item.form || null,
    frontImprint: item.print_front,
    backImprint: item.print_back,
    classification: item.class_name || null,
    category: item.etc_otc || null,
    scoreLine: item.line || null,
    ingredient: null,
    atcCode: null,
    equivalence: null,
  };
}
