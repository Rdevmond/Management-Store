import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { FiX, FiPackage } from 'react-icons/fi';
import InventoryMediaInput from './InventoryMediaInput';
export default function InventoryModal({
  showInvModal,
  setShowInvModal,
  invForm,
  setInvForm,
  onSubmitInventory,
  mediaType = 'default',
  setMediaType
}) {
  useEffect(() => {
    if (showInvModal) {
      const saved = localStorage.getItem('inventoryImage_' + (invForm?.id || 'new'));
      if (saved && !invForm?.image) {
        setInvForm(prev => ({ ...prev, image: saved }));
      }
    }
  }, [showInvModal, invForm?.id, invForm?.image, setInvForm]);

  if (!showInvModal) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4 overflow-auto">
      <div className="bg-white rounded-2xl p-6 max-w-full sm:max-w-md md:max-w-lg lg:max-w-xl w-full border border-slate-100 shadow-2xl relative animate-fade-in text-slate-800 space-y-4 max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-slate-50 [&::-webkit-scrollbar-thumb]:bg-green-600 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-brand-green">
        <button
          type="button"
          onClick={() => setShowInvModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 transition-colors"
        >
          <FiX className="text-lg" />
        </button>
        <h3 className="text-lg font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
          <FiPackage className="text-green-600" />
          <span>{invForm?.id ? 'Ubah Informasi Bahan' : 'Tambah Bahan Gudang Baru'}</span>
        </h3>
        <form onSubmit={onSubmitInventory} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nama Barang / Bahan Baku</label>
            <input
              type="text"
              required
              className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 placeholder:text-slate-300"
              placeholder="Contoh: Susu Kental Manis"
              value={invForm?.name || ''}
              onChange={(e) => setInvForm({ ...invForm, name: e.target.value })}
            />
          </div>
          <InventoryMediaInput
            mediaType={mediaType}
            setMediaType={setMediaType}
            invForm={invForm}
            setInvForm={setInvForm}
          />
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Stok Awal</label>
              <input
                type="number"
                step="0.01"
                required
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                placeholder="100"
                value={invForm?.stock || ''}
                onChange={(e) => setInvForm({ ...invForm, stock: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Satuan Ukuran</label>
              <select
                className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                value={invForm?.unit || 'Pcs'}
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
              className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
              placeholder="20"
              value={invForm?.minStock || ''}
              onChange={(e) => setInvForm({ ...invForm, minStock: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Harga Satuan (Rp) - untuk Laporan Pengeluaran</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-400">Rp</span>
              <input
                type="number"
                step="1"
                className="block w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
                placeholder="Contoh: 12000"
                value={invForm?.price || ''}
                onChange={(e) => setInvForm({ ...invForm, price: e.target.value })}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Link Pembelian (Shopee / Tokopedia - Opsional)</label>
            <input
              type="url"
              className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 placeholder:text-slate-300"
              placeholder="https://shopee.co.id/..."
              value={invForm?.purchaseLink || ''}
              onChange={(e) => setInvForm({ ...invForm, purchaseLink: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Ulasan Pribadi / Catatan Supplier (Opsional)</label>
            <textarea
              rows="2"
              className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 placeholder:text-slate-300 resize-none"
              placeholder="Kualitas bahan baku, tips penyimpanan, nama supplier, dll."
              value={invForm?.personalReview || ''}
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
              className="flex-grow py-2.5 bg-green-600 hover:bg-brand-green text-white font-semibold rounded-xl text-xs uppercase shadow-sm transition-colors"
            >
              Simpan Bahan
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}