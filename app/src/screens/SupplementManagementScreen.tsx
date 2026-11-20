import { useState } from 'react';
import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import { ArrowLeftIcon, PlusIcon, LeafIcon, ChevronRightIcon, ShieldCheckIcon } from '../components/Icons';

type Tab = '현재 복용 중' | '복용 완료';

const supplements = [
  { name: '비타민D 1000IU',  dose: '1일 1정',   timing: '아침 식후', color: '#F6C942' },
  { name: '오메가3 1000mg', dose: '1일 1캡슐', timing: '저녁 식후', color: '#4B87CC' },
  { name: '프로바이오틱스',  dose: '1일 1캡슐', timing: '아침 식후', color: '#4CAF7B' },
];

const done = [
  { name: '비타민C 1000mg', dose: '1일 1정', timing: '아침 식후', color: '#F4874B' },
];

export default function SupplementManagementScreen() {
  const { goBack, navigate } = useNav();
  const [tab, setTab] = useState<Tab>('현재 복용 중');

  const list = tab === '현재 복용 중' ? supplements : done;

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-3">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-[#F4F7F6] flex items-center justify-center">
            <ArrowLeftIcon size={20} className="text-[#222222]" />
          </button>
          <h1 className="text-[18px] font-bold text-[#222222]">영양제 관리</h1>
        </div>
        {/* Tabs */}
        <div className="flex px-5 gap-1 border-b border-[#E8EDEB]">
          {(['현재 복용 중', '복용 완료'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2.5 text-[14px] font-semibold border-b-2 transition-colors ${
                tab === t ? 'border-[#47795E] text-[#47795E]' : 'border-transparent text-[#AEBFB7]'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-4 pt-4">
        {/* Description */}
        <p className="text-[13px] text-[#6B7280] text-center">
          처방약과 함께 복용 중인 영양제도 관리해보세요.
        </p>

        {/* Add button */}
        <button className="w-full flex items-center justify-center gap-2 bg-[#E07A5F] rounded-2xl py-4 shadow-md shadow-[#E07A5F]/25 active:scale-[0.98] transition-transform">
          <PlusIcon size={18} className="text-white" strokeWidth={3} />
          <span className="text-white text-[15px] font-bold">영양제 추가하기</span>
        </button>

        {/* List */}
        {list.length === 0 ? (
          <div className="flex flex-col items-center py-10 gap-3">
            <LeafIcon size={36} className="text-[#AEBFB7]" />
            <p className="text-[14px] text-[#AEBFB7]">복용 완료된 영양제가 없어요</p>
          </div>
        ) : (
          <div className="space-y-3">
            {list.map((s) => (
              <div
                key={s.name}
                className="bg-white rounded-3xl p-4 shadow-sm flex items-center gap-4"
              >
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: s.color + '20' }}
                >
                  <LeafIcon size={22} style={{ color: s.color }} />
                </div>
                <div className="flex-1">
                  <p className="text-[15px] font-bold text-[#222222]">{s.name}</p>
                  <p className="text-[12px] text-[#6B7280] mt-0.5">{s.dose} · {s.timing}</p>
                  {tab === '복용 완료' && (
                    <span className="inline-block mt-1 text-[10px] text-[#AEBFB7] bg-[#F4F7F6] px-2 py-0.5 rounded-full font-medium">
                      복용 완료
                    </span>
                  )}
                </div>
                <button
                  onClick={() => navigate('medication-detail', { medicationName: s.name })}
                  className="w-8 h-8 rounded-xl bg-[#F4F7F6] flex items-center justify-center flex-shrink-0"
                >
                  <ChevronRightIcon size={16} className="text-[#AEBFB7]" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Safety card */}
        <div className="bg-[#47795E] rounded-3xl p-5 shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center">
              <ShieldCheckIcon size={20} className="text-white" />
            </div>
            <p className="text-white font-bold text-[16px]">영양제도 함께 관리해요</p>
          </div>
          <p className="text-white/80 text-[13px] leading-snug">
            등록한 영양제와 처방약을 함께 확인하여 복용 시 주의가 필요한 정보를 안내해요.
          </p>
          <button
            onClick={() => navigate('safety-detail')}
            className="mt-4 w-full bg-white/20 rounded-2xl py-2.5 text-white text-[13px] font-semibold"
          >
            안전성 확인하기
          </button>
        </div>
      </div>
    </div>
  );
}
