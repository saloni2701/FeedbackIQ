import type { InputHTMLAttributes } from 'react';

type Props = { label: string; hint?: string } & InputHTMLAttributes<HTMLInputElement>;

export default function Field({ label, hint, ...props }: Props) {
  return (
    <label className="mb-4 flex flex-col gap-1.5 text-[15px] font-medium">
      {label}
      <input {...props} className="h-[46px] rounded-lg border border-line bg-card px-3 text-[15px] font-normal text-ink" />
      {hint && <span className="text-[13px] font-normal text-mut">{hint}</span>}
    </label>
  );
}
