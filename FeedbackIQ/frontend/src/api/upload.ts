import { http } from './client';

export interface IngestResult {
  added: number;
  skipped: number;
}

const useMock = import.meta.env.VITE_USE_MOCK !== 'false';
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function uploadCsv(file: File): Promise<IngestResult> {
  if (useMock) {
    await wait(500);
    const lines = (await file.text()).split(/\r?\n/).filter(Boolean).length;
    return { added: Math.max(0, lines - 1), skipped: 0 };
  }
  const form = new FormData();
  form.append('file', file);
  // Large files take longer to analyse, so allow more time than the default.
  const res = await http.post<IngestResult>('/api/feedback/upload', form, { timeout: 120000 });
  return res.data;
}

export async function addComment(text: string, source: string): Promise<IngestResult> {
  if (useMock) {
    await wait(300);
    return { added: 1, skipped: 0 };
  }
  const res = await http.post<IngestResult>('/api/feedback', { text, source });
  return res.data;
}