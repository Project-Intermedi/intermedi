import { useNav } from '../context/NavigationContext';
import StatusBar from '../components/StatusBar';
import QueryStatus from '../components/QueryStatus';
import { ArrowLeftIcon, ChevronRightIcon, ShieldCheckIcon, PillIcon, CalendarIcon } from '../components/Icons';
import { formatRecordDate } from '../api/management';
import type { PrescriptionRecord } from '../api/management';
import { useGet } from '../api/useGet';

function TakingBadge({ taking }: { taking: boolean }) {
  return taking
    ? <span className="flex-shrink-0 text-[10px] font-semibold text-[#47795E] bg-[#47795E]/10 px-1.5 py-0.5 rounded-full">복용 중</span>
    : <span className="flex-shrink-0 text-[10px] font-semibold text-[#6B7280] bg-[#E8EDEB] px-1.5 py-0.5 rounded-full">복용 완료</span>;
}

export default function PrescriptionDetailScreen() {
  const { goBack, navigate, params } = useNav();
  const { recordId } = params;
  const { result, retry } = useGet<PrescriptionRecord>(recordId === undefined ? null : `/api/records/${recordId}`);
  const record = result.status === 'success' ? result.data : null;

  return (
    <div className="h-full flex flex-col bg-[#F4F7F6] relative">
      <div className="bg-white flex-shrink-0">
        <StatusBar />
        <div className="flex items-center gap-3 px-5 pb-4">
          <button onClick={goBack} className="w-9 h-9 rounded-full bg-[#F4F7F6] flex items-center justify-center">
            <ArrowLeftIcon size={20} className="text-[#222222]" />
          </button>
          <h1 className="text-[18px] font-bold text-[#222222]">처방 상세</h1>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide px-4 pb-6 space-y-4 pt-4">
        {result.status === 'idle' && <QueryStatus message="조회할 처방을 선택해 주세요." />}
        {result.status === 'loading' && <QueryStatus message="처방을 불러오는 중이에요." />}
        {result.status === 'error' && (result.httpStatus === 404
          ? <QueryStatus message="선택한 처방을 찾을 수 없어요." />
          : <QueryStatus message="처방을 불러오지 못했어요." retry={retry} />)}
        {record && <>
        {/* Hospital card */}
        <div className="bg-[#47795E] rounded-3xl p-5 shadow-md">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-white/75 text-[12px] font-medium mb-1">처방 병원</p>
              <h2 className="text-white text-[22px] font-black mb-1">{record.hospital || '병원명 미입력'}</h2>
              {record.doctor && <p className="text-white/80 text-[14px] font-medium">{record.doctor}</p>}
            </div>
            <div className="bg-white/20 rounded-2xl p-2.5" aria-hidden="true">
              <CalendarIcon size={22} className="text-white" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 grid grid-cols-2 gap-3">
            <div>
              <p className="text-white/60 text-[11px]">처방일</p>
              <p className="text-white text-[13px] font-semibold mt-0.5">
                {record.issued_at ? formatRecordDate(record.issued_at) : '입력된 처방일이 없어요.'}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-white/60 text-[11px]">진단명</p>
              {record.diagnosis?.trim()
                ? <p className="text-white text-[13px] font-semibold mt-0.5 break-words">{record.diagnosis}</p>
                : <p className="text-white/60 text-[12px] mt-0.5">입력된 진단명이 없어요.</p>}
            </div>
            {record.ends_on && (
              <div className="col-span-2">
                <p className="text-white/60 text-[11px]">복용 종료 예정일</p>
                <p className="text-white text-[13px] font-semibold mt-0.5">{formatRecordDate(record.ends_on)}</p>
              </div>
            )}
          </div>
        </div>

        {/* Medications */}
        <div className="bg-white rounded-3xl p-5 shadow-sm">
          <h2 className="text-[15px] font-bold text-[#222222] mb-4">처방 약 {record.medicines.length}개</h2>
          <div className="space-y-3">
            {record.medicines.map(m => (
              <div key={m.id} className="flex items-start gap-3 p-4 rounded-2xl bg-[#F4F7F6]">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center flex-shrink-0 shadow-sm">
                  <PillIcon size={24} className="text-[#47795E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <p className="text-[14px] font-bold text-[#222222] truncate min-w-0">{m.name}</p>
                    <TakingBadge taking={m.taking} />
                  </div>
                  {m.spec && <p className="text-[12px] text-[#6B7280] mt-0.5 truncate">{m.spec}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Safety CTA */}
        <button
          onClick={() => navigate('safety-detail')}
          className="w-full flex items-center gap-3 bg-white rounded-2xl p-4 shadow-sm active:bg-[#F4F7F6] transition-colors"
        >
          <div className="w-10 h-10 rounded-2xl bg-[#47795E]/10 flex items-center justify-center flex-shrink-0">
            <ShieldCheckIcon size={20} className="text-[#47795E]" />
          </div>
          <div className="flex-1 text-left">
            <p className="text-[14px] font-bold text-[#222222]">약 안전 확인</p>
            <p className="text-[12px] text-[#6B7280]">복용 중인 약의 안전성을 확인해요</p>
          </div>
          <ChevronRightIcon size={16} className="text-[#AEBFB7]" />
        </button>
        </>}
      </div>
    </div>
  );
}
