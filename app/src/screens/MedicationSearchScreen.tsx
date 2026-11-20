import { useState } from 'react';
import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';
import { SearchIcon, XIcon, ChevronRightIcon, PillIcon } from '../components/Icons';

const DEFAULT_RECENT = ['아목시실린', '타이레놀', '세티리진', '레바미피드'];
const RECENT_STORAGE_KEY = 'intermedi:recent-searches';
const categories = ['감기약', '소화제', '진통제', '알레르기약', '항생제', '혈압약'];
const frequent = [
  { name: '아목시실린캡슐 500mg', category: '항생제', color: '#E07A5F' },
  { name: '타이레놀정 500mg', category: '진통제', color: '#47795E' },
  { name: '세티리진정 10mg', category: '알레르기약', color: '#6B7280' },
  { name: '판콜에이내복액', category: '감기약', color: '#47795E' },
];

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_STORAGE_KEY);
    if (raw === null) return DEFAULT_RECENT;
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.every(v => typeof v === 'string') ? parsed : DEFAULT_RECENT;
  } catch {
    return DEFAULT_RECENT;
  }
}

function saveRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // 저장소를 사용할 수 없는 환경에서는 화면 내 상태만 유지합니다.
  }
}

export default function MedicationSearchScreen() {
  const { navigate } = useNav();
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState<string[]>(loadRecent);

  const removeRecent = (term: string) => {
    setRecent(prev => {
      const next = prev.filter(r => r !== term);
      saveRecent(next);
      return next;
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white flex-shrink-0 border-b border-[#E8EDEB]">
        <StatusBar />
        <div className="px-5 pb-5">
          <h1 className="text-[22px] font-black text-[#222222] mb-4">약 검색</h1>
          {/* Search bar */}
          <div className="relative mb-2">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AEBFB7]" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="약 이름을 입력하세요"
              className="w-full bg-[#F4F7F6] rounded-2xl pl-11 pr-10 py-3.5 text-[14px] text-[#222222] placeholder:text-[#AEBFB7] outline-none font-medium"
            />
            {query && (
              <button onClick={() => setQuery('')} aria-label="검색어 지우기" className="absolute right-4 top-1/2 -translate-y-1/2">
                <XIcon size={16} className="text-[#AEBFB7]" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-[#AEBFB7] pl-1 mb-4">예: 아목시실린, 타이레놀</p>

          {/* Pill identification entry card */}
          <button
            onClick={() => navigate('pill-appearance-search')}
            className="w-full flex items-center gap-3 bg-[#47795E]/10 border border-[#47795E]/15 rounded-2xl px-4 py-3.5 text-left active:bg-[#47795E]/15 transition-colors"
          >
            <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
              <PillIcon size={18} className="text-[#47795E]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-bold text-[#222222]">이름을 모를 때</p>
              <p className="text-[12px] text-[#6B7280] mt-0.5">모양 · 색 · 각인으로 찾기</p>
            </div>
            <ChevronRightIcon size={16} className="text-[#47795E] flex-shrink-0" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 space-y-5 pt-4">
        {/* Recent searches */}
        <div>
          <h2 className="text-[14px] font-bold text-[#222222] mb-3">최근 검색어</h2>
          {recent.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {recent.map(r => (
                <div
                  key={r}
                  className="flex items-center bg-white rounded-full shadow-sm"
                >
                  <button
                    onClick={() => setQuery(r)}
                    className="pl-4 pr-1.5 py-2 text-[13px] font-medium text-[#222222] rounded-l-full active:bg-[#F4F7F6] transition-colors"
                  >
                    {r}
                  </button>
                  <button
                    onClick={() => removeRecent(r)}
                    aria-label={`${r} 삭제`}
                    className="pl-1 pr-3 py-2 rounded-r-full active:bg-[#F4F7F6] transition-colors"
                  >
                    <XIcon size={12} className="text-[#AEBFB7]" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="bg-white rounded-2xl py-4 text-center text-[12px] text-[#AEBFB7] shadow-sm">
              최근 검색어가 없습니다
            </p>
          )}
        </div>

        {/* Categories (검색 동작 미구현: 추후 API 연동 시 onClick 추가) */}
        <div>
          <h2 className="text-[14px] font-bold text-[#222222] mb-3">카테고리</h2>
          <div className="grid grid-cols-3 gap-2">
            {categories.map(c => (
              <button
                key={c}
                className="bg-white rounded-2xl py-3 text-[13px] font-semibold text-[#222222] shadow-sm active:bg-[#F4F7F6] transition-colors"
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        {/* Frequently searched (고정 목록) */}
        <div>
          <h2 className="text-[14px] font-bold text-[#222222] mb-3">자주 찾는 약</h2>
          <div className="space-y-2">
            {frequent.map(m => (
              <button
                key={m.name}
                onClick={() => navigate('medication-detail', { medicationName: m.name })}
                className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm active:bg-[#F4F7F6] transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: m.color + '15' }}>
                  <PillIcon size={16} style={{ color: m.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[13px] font-semibold text-[#222222] truncate">{m.name}</p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">{m.category}</p>
                </div>
                <ChevronRightIcon size={14} className="text-[#AEBFB7] flex-shrink-0" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="medication-search" />
    </div>
  );
}
