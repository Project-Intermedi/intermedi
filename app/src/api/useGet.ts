import { useEffect, useState } from 'react';

type GetResult<T> =
  | { status: 'idle' | 'loading' }
  | { status: 'error'; httpStatus?: number }
  | { status: 'success'; data: T };

export function useGet<T>(url: string | null) {
  const [attempt, setAttempt] = useState(0);
  const [response, setResponse] = useState<{
    url: string;
    attempt: number;
    result: GetResult<T>;
  }>();

  useEffect(() => {
    if (!url) {
      setResponse(undefined);
      return;
    }
    const controller = new AbortController();
    const finish = (result: GetResult<T>) => {
      if (!controller.signal.aborted) setResponse({ url, attempt, result });
    };

    async function load(path: string) {
      try {
        const res = await fetch(path, { signal: controller.signal });
        if (!res.ok) {
          finish({ status: 'error', httpStatus: res.status });
          return;
        }
        finish({ status: 'success', data: await res.json() as T });
      } catch {
        finish({ status: 'error' });
      }
    }

    finish({ status: 'loading' });
    void load(url);
    return () => controller.abort();
  }, [url, attempt]);

  // Clear the previous result as soon as the endpoint or retry attempt changes.
  const result: GetResult<T> = response && response.url === url && response.attempt === attempt
    ? response.result
    : { status: url ? 'loading' : 'idle' };
  return { result, retry: () => setAttempt(value => value + 1) };
}
