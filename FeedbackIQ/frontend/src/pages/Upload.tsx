import { useRef, useState, type DragEvent, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { authErrorMessage } from '../api/auth';
import { addComment, uploadCsv, type IngestResult } from '../api/upload';
import { Card, PageHeader, selectClass } from '../components/ui';

const MAX_BYTES = 5 * 1024 * 1024;
const SOURCES = ['Review', 'Survey', 'Support ticket', 'Feedback form', 'Other'];
const TEMPLATE =
  'text,source,date\n"The app became slow after the update",Review,2026-10-20\n"Please add an offline mode","Feedback form",2026-10-21\n';

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;
const formatSize = (b: number) => (b < 1024 * 1024 ? `${Math.max(1, Math.round(b / 1024))} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

function resultText(r: IngestResult): string {
  const skipped = r.skipped ? ` ${plural(r.skipped, 'row')} skipped because they were empty or too short.` : '';
  return `${plural(r.added, 'comment')} added.${skipped} The dashboard will update in a few seconds.`;
}

function Message({ kind, children }: { kind: 'ok' | 'error'; children: ReactNode }) {
  const tone = kind === 'ok' ? 'border-pos text-pos' : 'border-neg text-neg';
  return (
    <p role={kind === 'ok' ? 'status' : 'alert'} className={`mt-4 rounded-lg border p-3 text-sm ${tone}`}>
      {children}
    </p>
  );
}

export default function Upload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileOk, setFileOk] = useState<string | null>(null);
  const [fileErr, setFileErr] = useState<string | null>(null);

  const [text, setText] = useState('');
  const [source, setSource] = useState(SOURCES[0]);
  const [sending, setSending] = useState(false);
  const [textOk, setTextOk] = useState<string | null>(null);
  const [textErr, setTextErr] = useState<string | null>(null);

  function pick(f: File | undefined) {
    setFileOk(null);
    setFileErr(null);
    if (!f) return;
    if (!f.name.toLowerCase().endsWith('.csv')) return setFileErr('Please choose a CSV file (it should end in .csv).');
    if (f.size === 0) return setFileErr('This file is empty.');
    if (f.size > MAX_BYTES) return setFileErr('This file is larger than 5 MB. Please split it into smaller files.');
    setFile(f);
  }

  function onDrop(e: DragEvent) {
    e.preventDefault();
    setDragging(false);
    pick(e.dataTransfer.files[0]);
  }

  async function sendFile() {
    if (!file) return;
    setUploading(true);
    setFileErr(null);
    setFileOk(null);
    try {
      setFileOk(resultText(await uploadCsv(file)));
      setFile(null);
      if (inputRef.current) inputRef.current.value = '';
    } catch (err) {
      setFileErr(authErrorMessage(err));
    } finally {
      setUploading(false);
    }
  }

  async function sendComment(e: FormEvent) {
    e.preventDefault();
    setTextOk(null);
    setTextErr(null);
    if (text.trim().length < 3) return setTextErr('Please write at least a few words.');
    setSending(true);
    try {
      setTextOk(resultText(await addComment(text.trim(), source)));
      setText('');
    } catch (err) {
      setTextErr(authErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  function downloadTemplate() {
    const url = URL.createObjectURL(new Blob([TEMPLATE], { type: 'text/csv;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = 'feedback-template.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <>
      <PageHeader title="Add feedback" subtitle="Upload customer comments. We read each one and update your dashboard." />

      <div className="grid grid-cols-[repeat(auto-fit,minmax(380px,1fr))] gap-5">
        <Card title="Upload a file" subtitle="Reviews, survey answers or support messages saved as a CSV file.">
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            className={`rounded-xl border-2 border-dashed p-8 text-center ${dragging ? 'border-acc bg-soft' : 'border-line'}`}
          >
            <p className="m-0">Drag a CSV file here, or</p>
            <input ref={inputRef} id="csv-file" type="file" accept=".csv,text/csv" className="peer sr-only" onChange={(e) => pick(e.target.files?.[0])} />
            <label
              htmlFor="csv-file"
              className="mt-3 inline-flex min-h-[44px] cursor-pointer items-center rounded-lg border border-acc px-5 text-[15px] font-medium text-acc hover:bg-soft peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-acc"
            >
              Choose a file
            </label>
            {file && <p className="mb-0 mt-3 text-[15px]">Selected: <b>{file.name}</b> ({formatSize(file.size)})</p>}
          </div>

          <button
            type="button"
            onClick={sendFile}
            disabled={!file || uploading}
            className="mt-4 min-h-[46px] w-full rounded-lg bg-acc px-5 text-[15px] font-medium text-page disabled:opacity-60"
          >
            {uploading ? 'Uploading and analysing…' : 'Upload file'}
          </button>
          {fileErr && <Message kind="error">{fileErr}</Message>}
          {fileOk && (
            <Message kind="ok">
              {fileOk} <Link to="/" className="underline">View dashboard</Link>
            </Message>
          )}

          <h3 className="mb-1 mt-6 text-base font-semibold">File format</h3>
          <ul className="m-0 list-disc pl-5 text-sm text-mut">
            <li>One comment per row, in a column named <b>text</b> (required).</li>
            <li>Optional columns: <b>source</b> (for example Review or Survey) and <b>date</b> (like 2026-10-20).</li>
            <li>Maximum 5 MB. In Excel, use Save As, then &ldquo;CSV UTF-8&rdquo;.</li>
            <li>Please remove names, phone numbers and other personal details first.</li>
          </ul>
          <button type="button" onClick={downloadTemplate} className="mt-3 text-[15px] text-acc hover:underline">
            Download an example file
          </button>
        </Card>

        <Card title="Add one comment" subtitle="Paste a single piece of feedback.">
          <form onSubmit={sendComment} noValidate>
            <label className="mb-4 flex flex-col gap-1.5 text-[15px] font-medium">
              Comment
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                rows={6}
                maxLength={5000}
                className="rounded-lg border border-line bg-card p-3 text-[15px] font-normal text-ink"
              />
            </label>
            <label className="mb-5 flex flex-col gap-1.5 text-[15px] font-medium">
              Where did it come from?
              <select value={source} onChange={(e) => setSource(e.target.value)} className={selectClass}>
                {SOURCES.map((s) => <option key={s}>{s}</option>)}
              </select>
            </label>
            <button type="submit" disabled={sending} className="min-h-[46px] w-full rounded-lg bg-acc px-5 text-[15px] font-medium text-page disabled:opacity-60">
              {sending ? 'Sending…' : 'Add comment'}
            </button>
          </form>
          {textErr && <Message kind="error">{textErr}</Message>}
          {textOk && (
            <Message kind="ok">
              {textOk} <Link to="/" className="underline">View dashboard</Link>
            </Message>
          )}
        </Card>
      </div>
    </>
  );
}