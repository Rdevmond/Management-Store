import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';

export default function NotFoundView() {
  return (
    <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-50 p-6 animate-fade-in text-center">
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 max-w-sm w-full">
        <FiAlertTriangle className="text-6xl text-amber-500 mx-auto mb-4" />
        <h1 className="text-3xl font-black text-slate-900 mb-2">404</h1>
        <p className="text-sm font-semibold text-slate-500 mb-8">Halaman yang Anda tuju tidak ditemukan atau sudah dipindahkan.</p>
        <Link 
          to="/" 
          className="flex items-center justify-center gap-2 w-full py-3 bg-brand-green hover:bg-green-700 text-white font-bold rounded-xl transition-all shadow-sm active:scale-95"
        >
          <FiArrowLeft /> Kembali ke Beranda
        </Link>
      </div>
    </div>
  );
}
