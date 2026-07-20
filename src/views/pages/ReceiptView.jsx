import { useParams, useNavigate } from 'react-router-dom';
import { FiPrinter, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import useAppController from '../../controllers/useAppController';

export default function ReceiptView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const controller = useAppController(navigate);
  const fmt = (n) => 'Rp ' + Number(n).toLocaleString('id-ID');

  // Dalam aplikasi nyata, kita akan fetch detail transaksi dari backend by ID
  // Di sini kita simulasikan untuk memenuhi syarat Dynamic Route
  
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="h-screen w-full bg-slate-100 flex flex-col items-center py-10 px-4 overflow-y-auto print:bg-white print:p-0 animate-fade-in">
      <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-sm border border-slate-200 print:shadow-none print:border-none print:rounded-none">
        
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
            <FiCheckCircle className="text-2xl text-brand-green" />
          </div>
          <h1 className="text-lg font-black text-slate-900 uppercase tracking-widest">Es Salju Kietna</h1>
          <p className="text-xs text-slate-500 mt-1">Jl. Paus Ujung, Pekanbaru</p>
          <p className="text-[10px] text-slate-400 mt-2 font-mono">ID TRX: {id}</p>
        </div>

        <div className="border-t border-dashed border-slate-300 py-4 my-4 space-y-3">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Item (Contoh)</span>
            <span>{fmt(25000)}</span>
          </div>
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>Topping Messes</span>
            <span>{fmt(0)}</span>
          </div>
        </div>

        <div className="border-t border-dashed border-slate-300 pt-4 space-y-1.5">
          <div className="flex justify-between text-xs font-bold text-slate-500">
            <span>Subtotal</span>
            <span>{fmt(25000)}</span>
          </div>
          <div className="flex justify-between text-sm font-black text-slate-900 pt-2">
            <span>TOTAL</span>
            <span>{fmt(25000)}</span>
          </div>
        </div>

        <div className="mt-8 text-center print:hidden space-y-3">
          <button 
            onClick={handlePrint}
            className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <FiPrinter /> Cetak Struk Fisik
          </button>
          <button 
            onClick={() => navigate(-1)}
            className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
          >
            <FiArrowLeft /> Kembali
          </button>
        </div>
      </div>
    </div>
  );
}
