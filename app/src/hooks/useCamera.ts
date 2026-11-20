import { useEffect, useRef, useState } from 'react';

export function useCamera(paused: boolean) {
  const video = useRef<HTMLVideoElement>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (paused) return;
    let disposed = false;
    let stream: MediaStream | undefined;
    const element = video.current;
    setReady(false);
    setError('');
    async function start() {
      try {
        if (!window.isSecureContext) throw new Error('HTTPS 또는 localhost에서 카메라를 사용할 수 있어요.');
        if (!navigator.mediaDevices?.getUserMedia) throw new Error('이 브라우저는 카메라를 지원하지 않아요.');
        stream = await navigator.mediaDevices.getUserMedia({ audio: false, video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } } });
        if (disposed) { stream.getTracks().forEach(track => track.stop()); return; }
        stream.getVideoTracks().forEach(track => track.addEventListener('ended', () => {
          if (!disposed) { setReady(false); setError('카메라 연결이 끊어졌어요. 다시 시도해주세요.'); }
        }));
        if (element) { element.srcObject = stream; await element.play(); }
      } catch (cause) {
        if (disposed) return;
        stream?.getTracks().forEach(track => track.stop());
        const name = cause instanceof DOMException ? cause.name : '';
        setError(name === 'NotAllowedError' || name === 'SecurityError'
          ? '카메라 권한을 허용해주세요. 브라우저 설정과 미리보기 권한을 확인해주세요.'
          : name === 'NotFoundError' ? '연결된 카메라가 없어요.'
          : name === 'NotReadableError' ? '카메라를 사용할 수 없어요. 다른 앱에서 사용 중인지 확인해주세요.'
          : cause instanceof Error && !(cause instanceof DOMException) ? cause.message : '카메라를 시작하지 못했어요. 다시 시도해주세요.');
      }
    }
    void start();
    return () => { disposed = true; stream?.getTracks().forEach(track => track.stop()); if (element) element.srcObject = null; };
  }, [paused, attempt]);
  return { video, ready, error, onReady: () => setReady(true), retry: () => setAttempt(n => n + 1) };
}
