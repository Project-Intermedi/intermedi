import { useState } from 'react';
import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import BottomNav from '../components/BottomNav';
import { ChevronRightIcon, AlertTriangleIcon, PillIcon } from '../components/Icons';
import QueryStatus from '../components/QueryStatus';
import { countTaking, formatRecordDate, recordsPath, safetyPath } from '../api/management';
import type { PrescriptionRecord, RecordsStatus, SafetyResult } from '../api/management';
import { useGet } from '../api/useGet';

const TABS: Record<RecordsStatus, string> = { taking: '복용 중', done: '복용 완료', all: '전체' };
const EMPTY: Record<RecordsStatus, string> = {
  taking: '복용 중인 처방이 없어요.',
  done: '복용이 완료된 처방이 없어요.',
  all: '아직 등록된 처방이 없어요.',
};

export default function IntegratedManagementScreen() {
  const { navigate, params } = useNav();
  const [selectedTab, setTab] = useState<RecordsStatus | null>(params.showAllRecords ? 'all' : null);
  const taking = useGet<PrescriptionRecord[]>(recordsPath('taking'));
  const safety = useGet<SafetyResult>(safetyPath);
  const takingRecords = taking.result.status === 'success' ? taking.result.data : undefined;
  const tab = selectedTab ?? (takingRecords?.length === 0 ? 'all' : 'taking');
  const other = useGet<PrescriptionRecord[]>(tab === 'taking' ? null : recordsPath(tab));
  const { result: records, retry } = tab === 'taking' ? taking : other;
  const checked = safety.result.status === 'success' ? safety.result.data : undefined;

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6]">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="px-5 pb-4 border-b border-[#E8EDEB]">
          <h1 className="text-[22px] font-black text-[#222222]">통합 관리</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-4 space-y-4 pt-4">
        {/* Summary */}
        <div className="bg-white rounded-2xl px-4 py-3 flex items-center justify-between shadow-sm">
          <span className="text-[13px] text-[#6B7280] font-medium">현재 복용 중인 약</span>
          {taking.result.status === 'error'
            ? <button onClick={taking.retry} className="text-[13px] font-semibold text-[#47795E]">개수 다시 조회</button>
            : <span className="text-[16px] font-black text-[#47795E]">{takingRecords ? `${countTaking(takingRecords)}개` : '—'}</span>}
        </div>

        {/* Safety summary */}
        <div className="bg-[#FFF3F0] rounded-3xl px-4 py-4 border border-[#E07A5F]/20 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-2xl bg-[#E07A5F]/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangleIcon size={18} className="text-[#E07A5F]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <p className="text-[15px] font-bold text-[#222222]">약 안전 확인</p>
                <span className="text-[10px] font-bold text-[#E07A5F] bg-white border border-[#E07A5F]/30 px-2 py-0.5 rounded-full">
                  {checked ? '조회 완료' : safety.result.status === 'error' ? '조회 실패' : '조회 중'}
                </span>
              </div>
              <p className="text-[12px] text-[#6B7280] mt-0.5">복용 중인 약의 주의 항목을 확인해요.</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            {[
              { label: '효능군 중복', value: checked?.duplicate.length ?? '—' },
              { label: '병용 주의', value: checked?.combo.length ?? '—' },
              { label: '약 자체 주의', value: '상세 보기' },
            ].map(({ label, value }) => (
              <div key={label} className="bg-white/70 rounded-2xl px-2 py-2 text-center border border-dashed border-[#E07A5F]/25">
                <p className="text-[14px] font-black text-[#9C503C]">{value}</p>
                <p className="text-[10px] text-[#6B7280] mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
          <button
            onClick={() => navigate('safety-detail')}
            className="w-full bg-[#E07A5F] rounded-2xl py-2.5 text-white text-[14px] font-bold shadow-sm shadow-[#E07A5F]/30 active:scale-[0.98] transition-transform"
          >
            안전성 자세히 확인
          </button>
        </div>

        {/* Tabs (스크롤 시 목록 위에 고정) */}
        <div className="sticky top-0 z-10 -mx-4 flex px-5 gap-1 border-b border-[#E8EDEB] bg-[#F4F7F6]">
          {(Object.keys(TABS) as RecordsStatus[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              aria-pressed={tab === t}
              className={`px-4 py-2.5 text-[14px] font-semibold border-b-2 transition-colors ${
                tab === t
                  ? 'border-[#47795E] text-[#47795E]'
                  : 'border-transparent text-[#AEBFB7]'
              }`}
            >
              {TABS[t]}
            </button>
          ))}
        </div>

        {records.status === 'loading' && <QueryStatus message="처방을 불러오는 중이에요." />}
        {records.status === 'error' && <QueryStatus message="처방을 불러오지 못했어요." retry={retry} />}
        {records.status === 'success' && records.data.length === 0 && <QueryStatus message={EMPTY[tab]} />}
        {records.status === 'success' && records.data.map(record => (
          <div key={record.id} className="bg-white rounded-3xl p-5 shadow-sm">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="text-[16px] font-bold text-[#222222]">{record.hospital || '병원명 미입력'}</p>
                <p className="text-[12px] text-[#6B7280] mt-0.5">
                  {[record.issued_at && formatRecordDate(record.issued_at), record.doctor].filter(Boolean).join(' · ')}
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#47795E] bg-[#47795E]/10 px-2.5 py-1 rounded-full">{record.taking_count}개 약 복용 중</span>
            </div>
            <div className="space-y-2">
              {record.medicines.map(m => (
                <div key={m.id} className="flex items-center gap-3 p-3 rounded-2xl bg-[#F4F7F6]">
                  <div className="w-8 h-8 rounded-xl bg-[#47795E]/10 flex items-center justify-center flex-shrink-0">
                    <PillIcon size={14} className="text-[#47795E]" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[13px] font-medium text-[#222222]">{m.name}</p>
                    {m.spec && <p className="text-[12px] text-[#6B7280]">{m.spec}</p>}
                  </div>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate('prescription-detail', { recordId: record.id })}
              className="mt-3 w-full flex items-center justify-center gap-1 text-[13px] text-[#47795E] font-semibold py-2 rounded-xl bg-[#47795E]/5"
            >
              처방 상세 보기 <ChevronRightIcon size={14} />
            </button>
          </div>
        ))}

      </div>

      <BottomNav active="integrated-management" />
    </div>
  );
}
