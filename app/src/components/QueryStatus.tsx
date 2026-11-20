export default function QueryStatus({
  message,
  retry,
}: {
  message: string;
  retry?: () => void;
}) {
  return (
    <div className="rounded-2xl bg-white px-4 py-4 text-center shadow-sm">
      <p role={retry ? 'alert' : 'status'} className="text-[13px] text-[#6B7280]">{message}</p>
      {retry && (
        <button onClick={retry} className="mt-2 text-[13px] font-semibold text-[#47795E]">
          다시 시도
        </button>
      )}
    </div>
  );
}
