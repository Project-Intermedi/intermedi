import React from 'react';
import { HomeIcon, GridIcon, ChatIcon, SearchIcon } from './Icons';
import { useNav } from '../context/NavigationContext';
import type { ScreenName } from '../types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Tab = { label: string; screen: ScreenName; Icon: React.FC<any> };

const tabs: Tab[] = [
  { label: '홈',     screen: 'home',                  Icon: HomeIcon },
  { label: '통합 관리', screen: 'integrated-management', Icon: GridIcon },
  { label: '약 챗봇',  screen: 'chatbot',               Icon: ChatIcon },
  { label: '약 검색',  screen: 'medication-search',      Icon: SearchIcon },
];

export default function BottomNav({ active }: { active: ScreenName }) {
  const { navigate } = useNav();
  return (
    <div className="flex-shrink-0 border-t border-[#E8EDEB] bg-white pb-safe" style={{ paddingBottom: 'env(safe-area-inset-bottom, 8px)' }}>
      <div className="flex items-center h-[62px]">
        {tabs.map(({ label, screen, Icon }) => {
          const isActive = active === screen;
          return (
            <button
              key={screen}
              onClick={() => navigate(screen)}
              className="flex-1 flex flex-col items-center justify-center gap-0.5 h-full transition-colors"
            >
              <Icon
                size={22}
                className={isActive ? 'text-[#47795E]' : 'text-[#AEBFB7]'}
              />
              <span
                className={`text-[10px] font-medium leading-none ${
                  isActive ? 'text-[#47795E]' : 'text-[#AEBFB7]'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
