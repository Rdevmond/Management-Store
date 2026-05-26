import { useState, useMemo } from 'react';
import { 
  FiPlus, 
  FiZap, 
  FiEdit, 
  FiTrash2, 
  FiPackage, 
  FiX, 
  FiAlertTriangle, 
  FiExternalLink, 
  FiFileText,
  FiSearch
} from 'react-icons/fi';

export default function InventoryView({ controller }) {
  const { 
    inventory, 
    handleSaveInventory, 
    handleDeleteInventory, 
    handleSaveRestock 
  } = controller;

  const [searchQuery, setSearchQuery] = useState('');

  // Local state for Inventory Add/Edit Modal
  const [showInvModal, setShowInvModal] = useState(false);
  const [invForm, setInvForm] = useState({ 
    id: '', 
    name: '', 
    stock: '', 
    unit: 'Pcs', 
    minStock: '', 
    price: '',
    purchaseLink: '', 
    personalReview: '',
    image: '' 
  });

  // Local state for Restock Modal
  const [restockItem, setRestockItem] = useState(null);
  const [restockAmount, setRestockAmount] = useState('');
  const [restockUnitPrice, setRestockUnitPrice] = useState('');
  const [isRestockPaid, setIsRestockPaid] = useState(true);

  // Handlers for Add/Edit
  const onOpenAdd = () => {
    setInvForm({ 
      id: '', 
      name: '', 
      stock: '', 
      unit: 'Pcs', 
      minStock: '', 
      price: '',
      purchaseLink: '', 
      personalReview: '' 
    });
    setShowInvModal(true);
  };

  const onOpenEdit = (item) => {
    setInvForm({
      id: item.id,
      name: item.name,
      stock: item.stock.toString(),
      unit: item.unit,
      minStock: item.minStock.toString(),
      price: item.price !== undefined ? item.price.toString() : '',
      purchaseLink: item.purchaseLink || '',
      personalReview: item.personalReview || '',
      image: item.image || ''
    });
    setShowInvModal(true);
  };

  const onSubmitInventory = (e) => {
    e.preventDefault();
    const success = handleSaveInventory(invForm);
    if (success) {
      setShowInvModal(false);
    }
  };

  // Handlers for Restock
  const onOpenRestock = (item) => {
    setRestockItem(item);
    setRestockAmount('');
    setRestockUnitPrice(item.price ? item.price.toString() : '');
    setIsRestockPaid(true);
  };

  const onSubmitRestock = (e) => {
    e.preventDefault();
    const success = handleSaveRestock(restockItem.id, restockAmount, isRestockPaid, restockUnitPrice || undefined);
    if (success) {
      setRestockItem(null);
    }
  };

  const filteredInventory = useMemo(() => {
    if (!searchQuery) return inventory;
    const lower = searchQuery.trim().toLowerCase();
    
    if (lower === 'kritis') {
      return inventory.filter(item => item.stock < item.minStock);
    }

    return inventory.filter(item => 
      item.name.toLowerCase().includes(lower) ||
      item.unit.toLowerCase().includes(lower) ||
      (item.stock !== undefined && item.stock.toString().includes(lower)) ||
      (item.price !== undefined && item.price.toString().includes(lower))
    );
  }, [inventory, searchQuery]);

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out] text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1b305b] uppercase tracking-tight">Persediaan Gudang (Stok Bahan)</h2>
          <p className="text-slate-400 text-xs font-medium">Pantau stok tersisa dan kelola persediaan bahan baku toko dessert.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari bahan..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={onOpenAdd}
            className="w-full sm:w-auto px-4 py-2 bg-[#108e50] hover:bg-[#0c6c3d] text-white font-semibold rounded-xl text-xs shadow-sm hover:shadow transition-all flex items-center justify-center gap-2"
          >
            <FiPlus className="text-sm" />
            <span>TAMBAH BAHAN BARU</span>
          </button>
        </div>
      </div>

      {/* Inventory Table Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInventory.map(item => {
            const isLow = item.stock < item.minStock;
            return (
              <div key={item.id} className={`bg-white rounded-2xl border border-slate-100 shadow-[0_4px_20px_rgba(0,0,0,0.015)] overflow-hidden hover:shadow-lg transition-shadow ${isLow ? 'bg-rose-50/10' : ''}`}>
                {/* Image */}
                <div className="h-48 w-full bg-slate-100 flex items-center justify-center">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="object-cover h-full w-full" />
                  ) : (
                    <span className="text-slate-400 text-sm">No Image</span>
                  )}
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="font-semibold text-[#1b305b] text-lg truncate">{item.name}</h3>
                  <div className="flex items-center justify-between text-sm">
                    <span className={`font-bold ${isLow ? 'text-rose-600' : 'text-[#1b305b]'}`}>{item.stock} <span className="text-xs text-slate-400">{item.unit}</span></span>
                    <span className="text-xs text-slate-400">Min {item.minStock} {item.unit}</span>
                  </div>
                  {item.price !== undefined && (
                    <p className="text-[10px] text-slate-400">Harga satuan: <span className="font-semibold text-slate-600">Rp {Number(item.price).toLocaleString('id-ID')}</span></p>
                  )}
                  {/* Status badge */}
                  <div>
                    {isLow ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rose-50 text-rose-600 border border-rose-100 rounded-lg text-xs font-semibold animate-pulse">
                        <FiAlertTriangle className="text-rose-500" /> Kritis
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2 py-0.5 bg-emerald-50/50 text-[#108e50] border border-emerald-100/50 rounded-lg text-xs font-semibold">Aman</span>
                    )}
                  </div>
                  {/* Purchase Link & Notes */}
                  {(item.purchaseLink || item.personalReview) && (
                    <div className="pt-2 border-t border-slate-100 space-y-1 text-xs">
                      {item.purchaseLink && (
                        <a
                          href={item.purchaseLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-sky-600 hover:text-sky-850 hover:underline transition-all"
                        >
                          <FiExternalLink className="text-[10px]" />
                          <span>Link Pembelian</span>
                        </a>
                      )}
                      {item.personalReview && (
                        <div className="flex items-start gap-1 text-slate-500 leading-tight">
                          <FiFileText className="text-[10px] shrink-0 mt-0.5 text-slate-400" />
                          <p className="line-clamp-2 text-[10px]">{item.personalReview}</p>
                        </div>
                      )}
                    </div>
                  )}
                  {/* Action buttons */}
                  <div className="flex justify-end space-x-2 mt-2">
                    <button onClick={() => onOpenRestock(item)} className="px-2.5 py-1.5 bg-sky-50 hover:bg-sky-100 text-[#1b305b] text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 border border-sky-100/50"><FiZap className="text-sky-600" /><span>Restock</span></button>
                    <button onClick={() => onOpenEdit(item)} className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 border border-slate-200"><FiEdit /><span>Ubah</span></button>
                    <button onClick={() => handleDeleteInventory(item.id)} className="px-2.5 py-1.5 bg-rose-50/50 hover:bg-rose-100 text-rose-600 text-xs font-semibold rounded-lg transition-colors inline-flex items-center gap-1 border border-rose-100/50"><FiTrash2 /><span>Hapus</span></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      {/* INVENTORY WAREHOUSE ADD/EDIT MODAL */}
      {showInvModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-slate-100 shadow-2xl relative animate-[fadeIn_0.3s_ease-out] text-slate-800 space-y-4">
            <button
              onClick={() => setShowInvModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <FiX className="text-lg" />
            </button>
            <h3 className="text-lg font-bold text-[#1b305b] uppercase tracking-wide flex items-center gap-2">
              <FiPackage className="text-[#108e50]" />
              <span>{invForm.id ? 'Ubah Informasi Bahan' : 'Tambah Bahan Gudang Baru'}</span>
            </h3>
            
            <form onSubmit={onSubmitInventory} className="space-y-4">
               <div>
                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Barang / Bahan Baku</label>
                 <input
                   type="text"
                   required
                   className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b] placeholder:text-slate-300"
                   placeholder="Contoh: Susu Kental Manis"
                   value={invForm.name}
                   onChange={(e) => setInvForm({ ...invForm, name: e.target.value })}
                 />
               </div>
               <div className="flex items-center space-x-4">
                 <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Gambar Barang (Opsional)</label>
                 <input type="file" accept="image/*" onChange={(e) => {
                   const file = e.target.files[0];
                   if (file) {
                     const reader = new FileReader();
                     reader.onloadend = () => setInvForm({ ...invForm, image: reader.result });
                     reader.readAsDataURL(file);
                   }
                 }} className="block w-full text-xs" />
               </div>
               {invForm.image && (
                 <div className="flex justify-center">
                   <img src={invForm.image} alt="Preview" className="h-32 w-32 object-cover rounded" />
                 </div>
               )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Stok Awal</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b]"
                    placeholder="100"
                    value={invForm.stock}
                    onChange={(e) => setInvForm({ ...invForm, stock: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Satuan Ukuran</label>
                  <select
                    className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b]"
                    value={invForm.unit}
                    onChange={(e) => setInvForm({ ...invForm, unit: e.target.value })}
                  >
                    <option value="Pcs">Pcs (Biji)</option>
                    <option value="Kg">Kg (Kilo)</option>
                    <option value="Liter">Liter</option>
                    <option value="Pack">Pack</option>
                    <option value="Kaleng">Kaleng</option>
                    <option value="Botol">Botol/Kg</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Batas Minimal Stok (Batas Aman)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b]"
                  placeholder="20"
                  value={invForm.minStock}
                  onChange={(e) => setInvForm({ ...invForm, minStock: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Harga Satuan (Rp) — untuk Laporan Pengeluaran</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    step="1"
                    className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b]"
                    placeholder="Contoh: 12000"
                    value={invForm.price}
                    onChange={(e) => setInvForm({ ...invForm, price: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Link Pembelian (Shopee / Tokopedia - Opsional)</label>
                <input
                  type="url"
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b] placeholder:text-slate-300"
                  placeholder="https://shopee.co.id/..."
                  value={invForm.purchaseLink}
                  onChange={(e) => setInvForm({ ...invForm, purchaseLink: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ulasan Pribadi / Catatan Supplier (Opsional)</label>
                <textarea
                  rows="2"
                  className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b] placeholder:text-slate-300 resize-none"
                  placeholder="Kualitas bahan baku, tips penyimpanan, nama supplier, dll."
                  value={invForm.personalReview}
                  onChange={(e) => setInvForm({ ...invForm, personalReview: e.target.value })}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowInvModal(false)}
                  className="flex-grow py-2.5 border border-slate-200 text-slate-500 font-semibold rounded-xl hover:bg-slate-50 text-xs uppercase transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 bg-[#108e50] hover:bg-[#0c6c3d] text-white font-semibold rounded-xl text-xs uppercase shadow-sm transition-colors"
                >
                  Simpan Bahan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QUICK RESTOCK FORM MODAL */}
      {restockItem && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-2xl relative animate-[fadeIn_0.3s_ease-out] text-slate-800 space-y-4">
            <button
              onClick={() => setRestockItem(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <FiX className="text-lg" />
            </button>
            <div>
              <h3 className="text-lg font-bold text-[#1b305b] uppercase tracking-wide flex items-center gap-2">
                <FiZap className="text-[#108e50]" />
                <span>Restock Bahan Baku</span>
              </h3>
              <p className="text-xs text-slate-400 font-medium mt-1">Tambahkan stok baru untuk: <strong className="text-slate-700">{restockItem.name}</strong></p>
            </div>
            
            <form onSubmit={onSubmitRestock} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-wider mb-1">Jumlah Tambahan</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    step="0.01"
                    required
                    className="block flex-grow px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b]"
                    placeholder="0"
                    value={restockAmount}
                    onChange={(e) => setRestockAmount(e.target.value)}
                  />
                  <span className="text-xs font-bold text-[#1b305b] bg-slate-50 px-4 py-2.5 border border-slate-200 rounded-xl">{restockItem.unit}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 tracking-wider mb-1">Harga Beli per {restockItem.unit} (Rp)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    step="1"
                    className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1b305b]/10 focus:border-[#1b305b]"
                    placeholder={restockItem.price ? restockItem.price : 'Harga per unit'}
                    value={restockUnitPrice}
                    onChange={(e) => setRestockUnitPrice(e.target.value)}
                  />
                </div>
                {restockAmount && restockUnitPrice && (
                  <p className="text-[10px] text-slate-400 mt-1">
                    Estimasi biaya: <span className="font-bold text-slate-600">Rp {(parseFloat(restockAmount) * parseFloat(restockUnitPrice)).toLocaleString('id-ID')}</span>
                  </p>
                )}
              </div>

              <div className="flex items-start space-x-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <input
                  type="checkbox"
                  id="restock-expense"
                  className="rounded border-slate-350 text-[#108e50] focus:ring-[#108e50] mt-0.5 w-4 h-4 cursor-pointer"
                  checked={isRestockPaid}
                  onChange={(e) => setIsRestockPaid(e.target.checked)}
                />
                <label htmlFor="restock-expense" className="text-xs font-semibold text-slate-500 cursor-pointer select-none leading-relaxed">
                  Catat sebagai Biaya Pengeluaran Operasional (Otomatis potong saldo kas toko)
                </label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setRestockItem(null)}
                  className="flex-grow py-2.5 border border-slate-200 text-slate-500 font-semibold rounded-xl hover:bg-slate-50 text-xs uppercase transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 bg-[#108e50] hover:bg-[#0c6c3d] text-white font-semibold rounded-xl text-xs uppercase shadow-sm transition-colors"
                >
                  Proses Restock
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
