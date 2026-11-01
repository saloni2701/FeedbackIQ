export default function Logo({ height = 36 }: { height?: number }) {
  return (
    <span className="inline-flex items-center gap-2.5 text-xl font-semibold text-white">
      <img src="/logo-mark.png" alt="" style={{ height, width: 'auto' }} />
      <span>
        Feedback <span className="text-[#2fa8ff]">IQ</span>
      </span>
    </span>
  );
}