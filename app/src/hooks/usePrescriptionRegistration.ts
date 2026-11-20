import { useRef, useState } from 'react';
import type { AnalysisDraft } from '../api/analyze';
import { registerPrescription } from '../api/registerPrescription';
import { useNav } from '../context/NavigationContext';

const savedRecords = new WeakMap<AnalysisDraft, number>();

export function getSavedPrescriptionId(draft: AnalysisDraft | undefined) {
  return draft && savedRecords.get(draft);
}

export function usePrescriptionRegistration(draft: AnalysisDraft | undefined) {
  const { navigate } = useNav();
  const pending = useRef(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(values = draft) {
    if (!draft || !values || pending.current) return;
    const existingId = savedRecords.get(draft);
    if (existingId !== undefined) {
      navigate('prescription-detail', { recordId: existingId });
      return;
    }

    pending.current = true;
    setSaving(true);
    setError('');
    try {
      const recordId = await registerPrescription(values);
      savedRecords.set(draft, recordId);
      Object.assign(draft, values);
      navigate('registration-complete', { draft, recordId });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : '처방을 저장하지 못했어요.');
    } finally {
      pending.current = false;
      setSaving(false);
    }
  }

  return { save, saving, error };
}
