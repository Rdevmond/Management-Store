import { FiSearch, FiPlus, FiPrinter } from 'react-icons/fi';
export default function FinanceLogsTable({
  activeTab,
  searchQuery,
  setSearchQuery,
  handleExportCSV,
  formatRupiah,
  formatDateStr,
  pemasukanLogs,
  pengeluaranLogs,
  productTrends,
  onOpenAddFinance
}) {
  const renderTable = (logs, emptyMsg) => (
    <div className="overflow-x-auto overflow-y-auto max-h-[400px] border-b border-slate-100">
      <table className="min-w-full divide-y divide-slate-100 text-left text-xs relative">
        <thead className="bg-slate-50 text-slate-900 font-bold uppercase tracking-wider sticky top-0 z-10 shadow-sm">
          <tr>
            <th className="px-6 py-3.5">Tanggal</th>
            <th className="px-6 py-3.5">Keterangan</th>
            <th className="px-6 py-3.5 text-right">Jumlah Uang</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
          {logs.length === 0 ? (
            <tr>
              <td colSpan="3" className="px-6 py-10 text-center text-slate-400 font-semibold">{emptyMsg}</td>
            </tr>
          ) : (
            logs.map(l => (
              <tr key={l.id} className="transition-colors hover:bg-slate-50/50">
                <td className="px-6 py-3 text-slate-500 font-medium">{formatDateStr(l.date)}</td>
                <td className="px-6 py-3 text-slate-800 font-semibold">{l.description}</td>
                <td className={`px-6 py-3 text-right font-extrabold ${l.type === 'pemasukan' ? 'text-emerald-700' : 'text-rose-600'}`}>
                  {l.type === 'pemasukan' ? '+' : '-'}{formatRupiah(l.amount)}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {activeTab !== 'pemesanan' && (
        <div className="px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="relative flex-1 max-w-md">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-sm" />
            <input type="text"
              placeholder="Cari deskripsi, nominal, tanggal..."
              className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 focus:bg-white transition-all text-slate-800"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      )}
      {activeTab === 'keuangan' && (
        <div>
          <div className="px-6 py-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs text-slate-400 font-bold uppercase tracking-wider">
            <span>Riwayat Seluruh Mutasi Buku Kas</span>
            <span className="text-slate-900 font-extrabold">{pemasukanLogs.length + pengeluaranLogs.length} Entri</span>
          </div>
          {renderTable([...pemasukanLogs, ...pengeluaranLogs].sort((a,b) => b.id - a.id), 'Belum ada catatan mutasi kas di periode ini.')}
        </div>
      )}
      {activeTab === 'pemesanan' && (
        <div>
          <div className="px-6 py-3.5 bg-emerald-50/40 border-b border-emerald-100 flex items-center justify-between">
            <p className="text-xs text-green-600 font-bold uppercase tracking-wide">Analisis menu terlaris berdasarkan transaksi penjualan</p>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[400px] border-b border-slate-100">
            <table className="min-w-full divide-y divide-slate-100 text-left text-xs font-semibold text-slate-700 relative">
              <thead className="bg-slate-50 text-slate-900 font-bold uppercase tracking-wider sticky top-0 z-10 shadow-sm">
                <tr>
                  <th className="px-6 py-3.5">Peringkat</th>
                  <th className="px-6 py-3.5">Nama Menu Dessert</th>
                  <th className="px-6 py-3.5 text-right">Volume Penjualan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {productTrends.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="px-6 py-10 text-center text-slate-400 font-bold">Belum ada transaksi penjualan di periode ini.</td>
                  </tr>
                ) : (
                  productTrends.map((trend, index) => (
                    <tr key={trend.name} className="transition-colors hover:bg-slate-50/30">
                      <td className="px-6 py-3.5 text-slate-400 font-bold">
                        <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs ${
                          index === 0 ? 'bg-amber-100 text-amber-700' : index === 1 ? 'bg-slate-200 text-slate-650' : index === 2 ? 'bg-amber-50 text-amber-600' : 'bg-slate-50 text-slate-400'
                        }`}>{index + 1}</span>
                      </td>
                      <td className="px-6 py-3.5 text-slate-800 font-bold">{trend.name}</td>
                      <td className="px-6 py-3.5 text-right text-green-600 font-black text-sm">
                        {trend.qty} <span className="text-xs font-semibold text-slate-400">porsi</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {activeTab === 'pengeluaran' && (
        <div>
          <div className="px-6 py-3 bg-rose-50/40 border-b border-rose-100 flex items-center justify-between">
            <p className="text-xs text-rose-600 font-semibold">Pengeluaran operasional: listrik, restock bahan baku, dll.</p>
            <span className="text-xs font-bold text-rose-600">
              Total: {formatRupiah(pengeluaranLogs.reduce((s, l) => s + l.amount, 0))}
            </span>
          </div>
          {renderTable(pengeluaranLogs, 'Belum ada catatan pengeluaran di periode ini.')}
        </div>
      )}
    </div>
  );
}
