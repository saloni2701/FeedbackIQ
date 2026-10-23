import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggle } = useTheme();
  const dark = theme === 'dark';
  return (
    <button
      type="button"
      role="switch"
      aria-checked={dark}
      onClick={toggle}
      className="inline-flex min-h-[44px] items-center gap-3 text-sm text-white"
    >
      <span className={`relative inline-block h-6 w-11 rounded-full transition-colors ${dark ? 'bg-[#7ab2f0]' : 'bg-[#5a6a94]'}`}>
        <span className={`absolute top-[3px] h-[18px] w-[18px] rounded-full bg-white transition-all ${dark ? 'left-[23px]' : 'left-[3px]'}`} />
      </span>
      Dark theme
    </button>
  );
}
