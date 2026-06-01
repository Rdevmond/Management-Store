import ReactLogo from './ReactLogo';
export default function LoadingSpinner() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-brand-cream/80 ">
      <div className="relative flex items-center justify-center p-8 bg-white rounded-3xl border border-slate-100 shadow-[0_10px_30px_rgba(0,0,0,0.04)] flex-col max-w-xs w-full text-center gap-4 animate-fade-in">
        <div className="p-3.5 bg-slate-900 rounded-full shadow-md">
          <ReactLogo className="w-12 h-12" color="#e0f2fe" />
        </div>
        <div>
          <h3 className="text-base font-bold text-slate-900 tracking-wide uppercase">
            Memuat Halaman
          </h3>
          <span className="block text-xs font-semibold text-slate-400 tracking-widest uppercase mt-0.5">
            Es Susu Salju Korea
          </span>
        </div>
        <div className="w-full h-1 bg-sky-50 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-dark-blue via-brand-green to-dark-blue rounded-full"
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
