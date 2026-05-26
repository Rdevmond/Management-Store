import ReactLogo from './ReactLogo';

export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-cream/80 backdrop-blur-md">
      <div className="relative flex items-center justify-center p-8 bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex-col max-w-xs w-full text-center gap-4 animate-[fadeIn_0.3s_ease-out]">
        {/* Subtle ice flake decorations */}
        <div className="absolute top-3 right-5 text-2xl animate-bounce opacity-25 select-none pointer-events-none">❄️</div>
        <div className="absolute bottom-5 left-5 text-xl animate-pulse opacity-15 select-none pointer-events-none">❄️</div>

        {/* Spinning React Logo */}
        <div className="p-3.5 bg-[#1b305b] rounded-full shadow-md">
          <ReactLogo className="w-12 h-12" color="#e0f2fe" />
        </div>

        <div>
          <h3 className="text-base font-bold text-[#1b305b] tracking-wide uppercase">
            Memuat Halaman
          </h3>
          <span className="block text-[10px] font-semibold text-slate-400 tracking-widest uppercase mt-0.5">
            Es Susu Salju Korea
          </span>
        </div>

        {/* Animated progress bar */}
        <div className="w-full h-1 bg-sky-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#1b305b] via-[#108e50] to-[#1b305b] rounded-full"
            style={{
              width: '45%',
              animation: 'shimmer 1.4s ease-in-out infinite',
            }}
          />
        </div>
      </div>
    </div>
  );
}
