import { FiX, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';
export default function FinanceModal({
  showFinanceModal,
  setShowFinanceModal,
  financeForm,
  setFinanceForm,
  onSubmitFinance
}) {
  if (!showFinanceModal) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-2xl relative animate-fade-in text-slate-800 space-y-4">
        <button onClick={() => setShowFinanceModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition-colors">
          <FiX className="text-lg" />
        </button>
        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          {financeForm.type === 'pemasukan' ? <FiTrendingUp className="text-green-600 text-xl" /> : <FiTrendingDown className="text-rose-500 text-xl" />}
          <span>Catat {financeForm.type === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'} Baru</span>
        </h3>
        <form onSubmit={onSubmitFinance} className="space-y-4">
          <div className="flex bg-slate-100/80 p-1 rounded-xl">
            <button type="button" onClick={() => setFinanceForm({...financeForm, type: 'pemasukan'})} 
              className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase transition-all ${financeForm.type === 'pemasukan' ? 'bg-white shadow text-green-600' : 'text-slate-400 hover:text-slate-600'}`}>Pemasukan</button>
            <button type="button" onClick={() => setFinanceForm({...financeForm, type: 'pengeluaran'})} 
              className={`flex-1 py-2 text-xs font-bold rounded-lg uppercase transition-all ${financeForm.type === 'pengeluaran' ? 'bg-white shadow text-brand-red' : 'text-slate-400 hover:text-slate-600'}`}>Pengeluaran</button>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Kategori Umum</label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {(financeForm.type === 'pengeluaran' ? ['Listrik', 'Air', 'Sewa', 'Lainnya'] : ['Modal', 'Layanan Tambahan', 'Lainnya']).map(preset => (
                <button key={preset} type="button"
                  onClick={() => setFinanceForm({ ...financeForm, description: preset })}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all ${
                    financeForm.description === preset
                      ? 'bg-slate-900 text-white border-slate-900'
                      : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-900/20'
                  }`}>
                  {preset}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Jumlah Uang (Rp)</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                <span className="text-xs font-bold text-slate-400">Rp</span>
              </div>
              <input type="number" required
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                placeholder="Contoh: 150000"
                value={financeForm.amount}
                onChange={(e) => setFinanceForm({ ...financeForm, amount: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Keterangan</label>
            <textarea required rows="2"
              className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 resize-none"
              placeholder="Contoh detail..."
              value={financeForm.description}
              onChange={(e) => setFinanceForm({ ...financeForm, description: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Tanggal Transaksi</label>
            <input type="date" required
              className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              value={financeForm.date}
              onChange={(e) => setFinanceForm({ ...financeForm, date: e.target.value })}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={() => setShowFinanceModal(false)}
              className="flex-grow py-2.5 border border-slate-200 text-slate-500 font-semibold rounded-xl hover:bg-slate-50 text-xs uppercase transition-colors">
              Batal
            </button>
            <button type="submit"
              className={`flex-grow py-2.5 text-white font-semibold rounded-xl text-xs uppercase shadow-sm transition-colors ${
                financeForm.type === 'pemasukan' ? 'bg-green-600 hover:bg-brand-green' : 'bg-brand-red hover:bg-brand-red'
              }`}>
              Simpan Data
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
