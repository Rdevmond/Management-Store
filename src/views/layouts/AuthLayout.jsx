import { Outlet } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-screen py-12 px-4 font-sans relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #f8fafc 0%, #eaf4fd 50%, #f0faf5 100%)' }}>
      
      {/* Subtle decorative orbs */}
      <div className="absolute top-[-15%] left-[-8%] w-[50vw] h-[50vw] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(224,242,254,0.55) 0%, transparent 70%)' }}></div>
      <div className="absolute bottom-[-10%] right-[-8%] w-[42vw] h-[42vw] rounded-full pointer-events-none" style={{ background: 'radial-gradient(circle, rgba(16,142,80,0.06) 0%, transparent 70%)' }}></div>

      <div className="max-w-sm w-full bg-white rounded-3xl border border-slate-100/80 shadow-[0_20px_60px_rgba(0,0,0,0.06)] relative overflow-hidden">
        
        {/* Top accent bar */}
        <div className="h-0.5 w-full" style={{ background: 'linear-gradient(90deg, #1b305b 0%, #108e50 100%)' }}></div>

        <div className="p-8 md:p-10">
          {/* Brand header */}
          <div className="text-center flex flex-col items-center mb-8">
            <div className="mb-5 h-20 flex items-center justify-center">
              <img 
                src="/logo.png" 
                alt="Logo Es Susu Salju Korea Bingsoo" 
                className="h-full w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300"
              />
            </div>
            
            <h1 className="text-lg font-bold text-[#1b305b] tracking-tight leading-tight">
              Es Susu Salju Korea
            </h1>
            <span className="text-[11px] font-semibold text-[#108e50] tracking-widest uppercase mt-1">
              Bingsoo &amp; Kietna Somboi
            </span>
            <p className="mt-3 text-[11px] font-medium text-slate-400 max-w-[240px] leading-relaxed text-center">
              Sistem Informasi Kasir POS &amp; Manajemen Persediaan Gudang
            </p>
          </div>

          {/* Child routes (LoginView) are rendered here */}
          <Outlet />

          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <p className="text-[10px] font-medium text-slate-350">
              Jl. Satria, Rejosari, Tenayan Raya · Pekanbaru, Riau
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
