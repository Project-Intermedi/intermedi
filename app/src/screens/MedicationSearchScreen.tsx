import { useState } from 'react';
import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';
import { SearchIcon, XIcon, ChevronRightIcon, PillIcon } from '../components/Icons';

type SearchMode = 'name' | 'appearance';

const recent = ['아목시실린', '타이레놀', '세티리진', '레바미피드'];
const categories = ['감기약', '소화제', '진통제', '알레르기약', '항생제', '혈압약'];
const popular = [
  { name: '아목시실린캡슐 500mg', category: '항생제', color: '#E07A5F' },
  { name: '타이레놀정 500mg', category: '진통제', color: '#47795E' },
  { name: '세티리진정 10mg', category: '알레르기약', color: '#6B7280' },
  { name: '판콜에이내복액', category: '감기약', color: '#47795E' },
];

export default function MedicationSearchScreen() {
  const { navigate } = useNav();
  const [mode, setMode] = useState<SearchMode>('name');
  const [query, setQuery] = useState('');

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="px-5 pb-4">
          <h1 className="text-[22px] font-black text-[#222222] mb-4">약 검색</h1>
          {/* Search bar */}
          <div className="relative mb-3">
            <SearchIcon size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#AEBFB7]" />
            <input
              type="text"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="약 이름을 입력하세요"
              className="w-full bg-[#F4F7F6] rounded-2xl pl-11 pr-10 py-3.5 text-[14px] text-[#222222] placeholder:text-[#AEBFB7] outline-none font-medium"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-4 top-1/2 -translate-y-1/2">
                <XIcon size={16} className="text-[#AEBFB7]" />
              </button>
            )}
          </div>
          <p className="text-[11px] text-[#AEBFB7] pl-1">예: 아목시실린, 타이레놀</p>
        </div>

        {/* Mode tabs */}
        <div className="flex px-5 gap-1 border-b border-[#E8EDEB]">
          {([['name', '이름으로 검색'], ['appearance', '약 모양으로 검색']] as const).map(([m, label]) => (
            <button
              key={m}
              onClick={() => {
                setMode(m);
                if (m === 'appearance') navigate('pill-appearance-search');
              }}
              className={`px-4 py-2.5 text-[13px] font-semibold border-b-2 transition-colors ${
                mode === m ? 'border-[#47795E] text-[#47795E]' : 'border-transparent text-[#AEBFB7]'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 space-y-5 pt-4">
        {/* Recent searches */}
        <div>
          <h2 className="text-[14px] font-bold text-[#222222] mb-3">최근 검색어</h2>
          <div className="flex flex-wrap gap-2">
            {recent.map(r => (
              <button
                key={r}
                onClick={() => setQuery(r)}
                className="bg-white rounded-full px-4 py-2 text-[13px] font-medium text-[#222222] shadow-sm active:bg-[#F4F7F6] transition-colors"
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
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

        {/* Popular */}
        <div>
          <h2 className="text-[14px] font-bold text-[#222222] mb-3">인기 검색</h2>
          <div className="space-y-2">
            {popular.map((m, i) => (
              <button
                key={m.name}
                onClick={() => navigate('medication-detail', { medicationName: m.name })}
                className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm active:bg-[#F4F7F6] transition-colors text-left"
              >
                <span className="text-[13px] font-black text-[#AEBFB7] w-5 text-center">{i + 1}</span>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: m.color + '15' }}>
                  <PillIcon size={16} style={{ color: m.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-semibold text-[#222222]">{m.name}</p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">{m.category}</p>
                </div>
                <ChevronRightIcon size={14} className="text-[#AEBFB7]" />
              </button>
            ))}
          </div>
        </div>
      </div>

      <BottomNav active="medication-search" />
    </div>
  );
}
