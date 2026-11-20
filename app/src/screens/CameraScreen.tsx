import { useEffect, useRef, useState } from 'react';
import type { ChangeEvent } from 'react';
import { useCamera } from '../hooks/useCamera';
import type { CapturedImage } from '../types';
import { useNav } from '../context/NavigationContext';
import { ArrowLeftIcon, CameraIcon, FlashIcon, HelpCircleIcon, ImageIcon } from '../components/Icons';

export default function CameraScreen() {
  const { goBack, navigate } = useNav();
  const [image, setImage] = useState<CapturedImage | null>(null);
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  const alive = useRef(true);
  const camera = useCamera(!!image);
  useEffect(() => { alive.current = true; return () => { alive.current = false; }; }, []);
  useEffect(() => {
    if (!image) return;
    const next = URL.createObjectURL(image.file);
    setUrl(next);
    return () => URL.revokeObjectURL(next);
  }, [image]);
  async function prepare(file: File, source: CapturedImage['source']) {
    const temporary = URL.createObjectURL(file);
    try {
      if (!file.type.startsWith('image/') || !file.size) throw new Error('사진 파일을 선택해주세요.');
      if (file.size > 20 * 1024 * 1024) throw new Error('20MB 이하의 사진을 선택해주세요.');
      const decoded = new Image();
      decoded.src = temporary;
      await decoded.decode();
      if (alive.current) setImage({ file, source, width: decoded.naturalWidth, height: decoded.naturalHeight, createdAt: new Date().toISOString() });
    } catch (cause) {
      if (alive.current) setError(cause instanceof Error && !(cause instanceof DOMException) ? cause.message : '사진을 열 수 없어요. JPG, PNG 등 지원되는 사진을 선택해주세요.');
    } finally { URL.revokeObjectURL(temporary); if (alive.current) setBusy(false); }
  }
  function select(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (file) { setBusy(true); setError(''); void prepare(file, 'gallery'); }
  }
  async function capture() {
    const video = camera.video.current;
    if (busy || !camera.ready || !video?.videoWidth || !video.videoHeight) return;
    setBusy(true); setError('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth; canvas.height = video.videoHeight;
      const context = canvas.getContext('2d');
      if (!context) throw new Error();
      context.drawImage(video, 0, 0);
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      if (!blob) throw new Error();
      if (alive.current) await prepare(new File([blob], 'intermedi-' + Date.now() + '.jpg', { type: 'image/jpeg' }), 'camera');
    } catch { if (alive.current) { setError('촬영하지 못했어요. 다시 시도해주세요.'); setBusy(false); } }
  }
  return (
    <div className="h-full flex flex-col bg-black">
      {/* Dark status bar area */}
      <div className="flex items-center justify-between px-5 h-11 flex-shrink-0">
        <span className="text-white text-[15px] font-semibold">9:41</span>
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-white"/>
          <div className="w-1.5 h-1.5 rounded-full bg-white"/>
          <div className="w-1.5 h-1.5 rounded-full bg-white"/>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0">
        <button aria-label="뒤로 가기" onClick={goBack} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <ArrowLeftIcon size={20} className="text-white" />
        </button>
        <span className="text-white text-[16px] font-bold">처방전 및 약봉투 촬영</span>
        <button aria-label="촬영 도움말" onClick={() => window.alert("처방전 전체가 가이드 안에 들어오도록 촬영해주세요.")} className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center">
          <HelpCircleIcon size={20} className="text-white" />
        </button>
      </div>

      {/* Instruction */}
      <div className="px-6 py-2 flex-shrink-0">
        <p className="text-white/80 text-[13px] text-center leading-snug">
          처방전 또는 약봉투가 화면 안에 모두 보이도록 맞춰서 촬영해주세요.
        </p>
      </div>

      {/* Camera viewfinder */}
      <div className="flex-1 min-h-0 relative flex items-center justify-center mx-4">
        <div className="absolute inset-0 rounded-3xl overflow-hidden bg-gray-900">
          {image ? <img src={url} alt="사진 미리보기" className="w-full h-full object-contain" /> : <video ref={camera.video} autoPlay playsInline muted onCanPlay={camera.onReady} className="w-full h-full object-contain" />}
        </div>
        {!image && (!camera.ready || camera.error) && <div role="status" className="absolute z-10 inset-6 rounded-2xl bg-black/80 flex flex-col items-center justify-center gap-3 px-4 text-center text-white text-sm">
          <p>{camera.error || '카메라를 준비하고 있어요. 권한 요청을 확인해주세요.'}</p>
          {camera.error && <><p>갤러리에서 사진을 선택할 수도 있어요.</p><button onClick={camera.retry} className="bg-[#E07A5F] rounded-xl px-4 py-2">다시 시도</button></>}
        </div>}

        {/* Document guide corners */}
        <div className={`relative w-5/6 h-2/3 pointer-events-none ${image ? "invisible" : ""}`}>
          {/* Top-left */}
          <div className="absolute top-0 left-0 w-10 h-10">
            <div className="absolute top-0 left-0 w-full h-1 bg-[#E07A5F] rounded-full" />
            <div className="absolute top-0 left-0 w-1 h-full bg-[#E07A5F] rounded-full" />
          </div>
          {/* Top-right */}
          <div className="absolute top-0 right-0 w-10 h-10">
            <div className="absolute top-0 right-0 w-full h-1 bg-[#E07A5F] rounded-full" />
            <div className="absolute top-0 right-0 w-1 h-full bg-[#E07A5F] rounded-full" />
          </div>
          {/* Bottom-left */}
          <div className="absolute bottom-0 left-0 w-10 h-10">
            <div className="absolute bottom-0 left-0 w-full h-1 bg-[#E07A5F] rounded-full" />
            <div className="absolute bottom-0 left-0 w-1 h-full bg-[#E07A5F] rounded-full" />
          </div>
          {/* Bottom-right */}
          <div className="absolute bottom-0 right-0 w-10 h-10">
            <div className="absolute bottom-0 right-0 w-full h-1 bg-[#E07A5F] rounded-full" />
            <div className="absolute bottom-0 right-0 w-1 h-full bg-[#E07A5F] rounded-full" />
          </div>


        </div>
      </div>

      {/* Tip */}
      <div className="px-6 py-3 flex-shrink-0">
        <div className="bg-white/10 rounded-2xl px-4 py-3">
          <p className="text-white/80 text-[12px] text-center leading-snug">
            빛 반사 없이 글자가 선명하게 보이도록 촬영해주세요.<br/>
            처방전과 약봉투 모두 촬영할 수 있어요.
          </p>
        </div>
      </div>

      <input ref={input} type="file" accept="image/*" onChange={select} className="hidden" aria-label="사진 선택" />
      {error && <p role="alert" className="px-6 pb-2 text-center text-red-300 text-xs">{error}</p>}
      {busy && <p role="status" className="text-center text-white text-xs pb-2">사진을 준비하고 있어요.</p>}
      {image && <div className="px-6 pb-3 flex flex-col gap-2">
        <p className="text-white/70 text-xs text-center">사진을 확인해주세요.</p>
        <button disabled={busy} onClick={() => navigate('ai-analysis', { capturedImage: image })} className="rounded-xl bg-[#E07A5F] text-white py-3 font-bold disabled:opacity-40">이 사진 사용</button>
      </div>}
      {/* Bottom controls */}
      <div className="flex-shrink-0 px-6 pb-8">
        <div className="flex items-center justify-between">
          {/* Gallery */}
          <button
            onClick={() => input.current?.click()} disabled={busy}
            className="flex flex-col items-center gap-1.5"
          >
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <ImageIcon size={22} className="text-white" />
            </div>
            <span className="text-white/70 text-[11px]">갤러리에서<br/>불러오기</span>
          </button>

          {/* Capture button */}
          <button
            onClick={() => { if (image) { setImage(null); setUrl(''); setError(''); } else void capture(); }} disabled={busy || (!image && (!camera.ready || !!camera.error))} aria-label={image ? "재촬영" : "사진 촬영"}
            className="relative active:scale-95 transition-transform disabled:opacity-40"
          >
            <div className="w-[76px] h-[76px] rounded-full bg-[#E07A5F] flex items-center justify-center shadow-lg shadow-[#E07A5F]/40">
              <div className="w-[64px] h-[64px] rounded-full border-[3px] border-white/40 flex items-center justify-center">
                {image ? <span className="text-white text-xs font-bold">재촬영</span> : <CameraIcon size={26} className="text-white" />}
              </div>
            </div>
          </button>

          {/* Flash */}
          <button disabled title="플래시는 현재 지원하지 않아요" className="flex flex-col items-center gap-1.5 opacity-40">
            <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center border border-white/20">
              <FlashIcon size={22} className="text-white" />
            </div>
            <span className="text-white/70 text-[11px]">플래시</span>
          </button>
        </div>
      </div>
    </div>
  );
}
