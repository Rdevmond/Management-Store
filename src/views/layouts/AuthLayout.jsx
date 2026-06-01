import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="flex-grow flex items-center justify-center min-h-screen py-12 px-4 font-sans relative overflow-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-emerald-50">
      <div className="absolute -top-16 -left-16 w-96 h-96 rounded-full pointer-events-none bg-blue-100 opacity-50 blur-3xl" />
      <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full pointer-events-none bg-green-100 opacity-50 blur-3xl" />
      <div className="max-w-sm w-full bg-white rounded-3xl border border-slate-100 shadow-xl relative overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-slate-900 to-green-600" />
        <div className="p-8 md:p-10">
          <div className="text-center flex flex-col items-center mb-8">
            <div className="mb-5 h-20 flex items-center justify-center">
              <img src="/logo.png" alt="Logo Es Susu Salju Korea" className="h-full w-auto object-contain drop-shadow-sm hover:scale-105 transition-transform duration-300" />
            </div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">Es Susu Salju Korea</h1>
            <span className="text-xs font-semibold text-green-600 tracking-widest uppercase mt-1">Bingsoo &amp; Kietna Somboi</span>
            <p className="mt-3 text-xs font-medium text-slate-400 max-w-xs leading-relaxed text-center">Sistem Informasi Kasir POS &amp; Manajemen Persediaan Gudang</p>
          </div>
          {children}
          <div className="mt-8 pt-5 border-t border-slate-100 text-center">
            <p className="text-xs font-medium text-slate-400">Jl. Satria, Rejosari, Tenayan Raya · Pekanbaru, Riau</p>
          </div>
        </div>
      </div>
    </div>
  );
}
