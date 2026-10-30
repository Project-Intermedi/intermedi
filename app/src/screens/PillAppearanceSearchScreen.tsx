import { useState } from 'react';
import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import { ArrowLeftIcon, CameraIcon, SearchIcon, ChevronRightIcon, PillIcon } from '../components/Icons';

type Shape = '' | '원형' | '타원형' | '장방형' | '캡슐형' | '삼각형' | '기타';
type Line  = '' | '없음' | '있음';

const SHAPES: Shape[] = ['원형', '타원형', '장방형', '캡슐형', '삼각형', '기타'];
const COLORS = [
  { label: '흰색',   hex: '#FFFFFF', border: true },
  { label: '노란색', hex: '#F6C942' },
  { label: '주황색', hex: '#F4874B' },
  { label: '빨간색', hex: '#E05252' },
  { label: '분홍색', hex: '#F49FC0' },
  { label: '갈색',   hex: '#8B5C3E' },
  { label: '초록색', hex: '#4CAF7B' },
  { label: '파란색', hex: '#4B87CC' },
  { label: '회색',   hex: '#9E9E9E' },
  { label: '검정색', hex: '#333333' },
];

const results = [
  { name: '아목시실린캡슐 500mg', maker: '유한양행', match: 94 },
  { name: '세팔렉신캡슐 500mg',   maker: '한미약품', match: 78 },
  { name: '독시사이클린캡슐',     maker: '대웅제약', match: 65 },
];

export default function PillAppearanceSearchScreen() {
  const { goBack, navigate } = useNav();
  const [shape,  setShape]  = useState<Shape>('');
  const [color,  setColor]  = useState('');
  const [line,   setLine]   = useState<Line>('');
  const [searched, setSearched] = useState(false);

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-4">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-[#F4F7F6] flex items-center justify-center">
            <ArrowLeftIcon size={20} className="text-[#222222]" />
          </button>
          <h1 className="text-[18px] font-bold text-[#222222]">약 모양으로 검색</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-4 pt-4">
        {/* Instruction */}
        <p className="text-[13px] text-[#6B7280] text-center">이름을 모르는 약도 모양으로 찾아보세요.</p>

        {/* Photo upload */}
        <button className="w-full bg-[#E07A5F] rounded-3xl p-5 flex flex-col items-center gap-2 shadow-md shadow-[#E07A5F]/25 active:scale-[0.98] transition-transform">
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center">
            <CameraIcon size={28} className="text-white" />
          </div>
          <p className="text-white font-bold text-[15px]">약 사진을 찍거나 불러와주세요</p>
          <p className="text-white/70 text-[12px]">AI가 비슷한 약을 찾아드려요</p>
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[#E8EDEB]" />
          <span className="text-[12px] text-[#AEBFB7] font-medium">또는 아래 조건으로 검색</span>
          <div className="flex-1 h-px bg-[#E8EDEB]" />
        </div>

        {/* Shape */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="text-[14px] font-bold text-[#222222] mb-3">약 모양</h2>
          <div className="grid grid-cols-3 gap-2">
            {SHAPES.map(s => (
              <button
                key={s}
                onClick={() => setShape(shape === s ? '' : s)}
                className={`py-2.5 rounded-2xl text-[13px] font-semibold border-2 transition-all ${
                  shape === s
                    ? 'bg-[#47795E] border-[#47795E] text-white'
                    : 'bg-[#F4F7F6] border-transparent text-[#6B7280]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Color */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="text-[14px] font-bold text-[#222222] mb-3">약 색상</h2>
          <div className="flex flex-wrap gap-3">
            {COLORS.map(c => (
              <button
                key={c.label}
                onClick={() => setColor(color === c.label ? '' : c.label)}
                className="flex flex-col items-center gap-1"
              >
                <div
                  className={`w-9 h-9 rounded-full transition-all ${
                    color === c.label ? 'ring-2 ring-offset-2 ring-[#47795E] scale-110' : ''
                  } ${c.border ? 'border border-[#E8EDEB]' : ''}`}
                  style={{ backgroundColor: c.hex }}
                />
                <span className="text-[10px] text-[#6B7280]">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Line */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="text-[14px] font-bold text-[#222222] mb-3">분할선</h2>
          <div className="flex gap-3">
            {(['없음', '있음'] as Line[]).map(l => (
              <button
                key={l}
                onClick={() => setLine(line === l ? '' : l)}
                className={`flex-1 py-3 rounded-2xl text-[14px] font-semibold border-2 transition-all ${
                  line === l
                    ? 'bg-[#47795E] border-[#47795E] text-white'
                    : 'bg-[#F4F7F6] border-transparent text-[#6B7280]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Search CTA */}
        <button
          onClick={() => setSearched(true)}
          className="w-full bg-[#47795E] rounded-2xl py-4 flex items-center justify-center gap-2 shadow-md shadow-[#47795E]/25 active:scale-[0.98] transition-transform"
        >
          <SearchIcon size={18} className="text-white" />
          <span className="text-white text-[16px] font-bold">조건으로 검색하기</span>
        </button>

        {/* Results */}
        {searched && (
          <div className="space-y-3 fade-in">
            <h2 className="text-[14px] font-bold text-[#222222]">검색 결과 {results.length}건</h2>
            {results.map((r) => (
              <button
                key={r.name}
                onClick={() => navigate('medication-detail', { medicationName: r.name })}
                className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm text-left active:bg-[#F4F7F6] transition-colors"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#47795E]/10 flex items-center justify-center flex-shrink-0">
                  <PillIcon size={22} className="text-[#47795E]" />
                </div>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-[#222222]">{r.name}</p>
                  <p className="text-[11px] text-[#6B7280] mt-0.5">{r.maker}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    r.match >= 90 ? 'bg-[#47795E]/10 text-[#47795E]' : 'bg-[#F4F7F6] text-[#6B7280]'
                  }`}>
                    {r.match}% 일치
                  </div>
                  <ChevronRightIcon size={14} className="text-[#AEBFB7]" />
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
