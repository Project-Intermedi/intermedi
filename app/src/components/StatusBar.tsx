export default function StatusBar({ dark = false }: { dark?: boolean }) {
  const color = dark ? 'text-white' : 'text-[#222222]';
  return (
    <div className={`flex items-center justify-between px-6 h-11 flex-shrink-0 ${color}`}>
      <span className="text-[15px] font-semibold">9:41</span>
      <div className="flex items-center gap-1.5">
        {/* Signal */}
        <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
          <rect x="0"  y="6"  width="3" height="6" rx="0.5"/>
          <rect x="4"  y="4"  width="3" height="8" rx="0.5"/>
          <rect x="8"  y="2"  width="3" height="10" rx="0.5"/>
          <rect x="12" y="0"  width="3" height="12" rx="0.5"/>
        </svg>
        {/* WiFi */}
        <svg width="16" height="12" viewBox="0 0 16 12" fill="currentColor">
          <path d="M8 9.5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3z"/>
          <path d="M3.8 6.7a6 6 0 0 1 8.4 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
          <path d="M1 3.8a10 10 0 0 1 14 0" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
        </svg>
        {/* Battery */}
        <svg width="25" height="12" viewBox="0 0 25 12" fill="currentColor">
          <rect x="0" y="1" width="21" height="10" rx="2.5" stroke="currentColor" strokeWidth="1.2" fill="none"/>
          <rect x="1.5" y="2.5" width="16" height="7" rx="1.5"/>
          <path d="M22 4v4a2 2 0 0 0 0-4z"/>
        </svg>
      </div>
    </div>
  );
}
