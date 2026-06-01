import { FiX, FiTag, FiUpload } from 'react-icons/fi';
import { FaUtensils, FaFileUpload } from 'react-icons/fa';
import { useEffect } from 'react';
import compressImage from '../../utils/compressImage';
export default function ProductModal({
  showModal,
  setShowModal,
  form,
  setForm,
  onSubmit,
  mediaType,
  setMediaType,
  existingCategories
}) {
  useEffect(() => {
    if (showModal) {
      const saved = localStorage.getItem('productImage_' + (form.id || 'new'));
      if (saved && !form.image) {
        setForm(prev => ({ ...prev, image: saved }));
      }
    }
  }, [showModal, form.id, form.image, setForm]);
  if (!showModal) return null;
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl relative animate-fade-in text-slate-800">
        <button
          onClick={() => setShowModal(false)}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 font-bold text-lg"
        >
          <FiX />
        </button>
        <h3 className="text-base font-bold text-slate-900 mb-4 uppercase tracking-wide flex items-center gap-1.5">
          <FiTag className="text-green-600" />
          <span>{form.id ? 'Ubah Informasi Menu' : 'Tambah Menu Baru'}</span>
        </h3>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1">Nama Menu</label>
            <input
              type="text"
              required
              className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              placeholder="Contoh: Es Salju Mangga Madu"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1">Kategori Menu</label>
            <input
              type="text"
              list="category-options"
              required
              className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
              placeholder="Ketik atau pilih kategori"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
            <datalist id="category-options">
              {existingCategories.map(cat => (
                <option key={cat} value={cat} />
              ))}
            </datalist>
          </div>
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider">Tipe Gambar Menu</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setMediaType('emoji');
                  setForm(prev => ({ ...prev, image: '' }));
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mediaType === 'emoji' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                <FaUtensils /> Gunakan Ikon
              </button>
              <button
                type="button"
                onClick={() => {
                  setMediaType('upload');
                  setForm(prev => ({ ...prev, image: '' }));
                }}
                className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                  mediaType === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
                }`}
              >
                <FaFileUpload /> Upload File
              </button>
            </div>
            <div>
              {mediaType === 'emoji' ? (
                <input
                  type="text"
                  required
                  maxLength="2"
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-center text-xl focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  placeholder=""
                  value={form.image}
                  onChange={(e) => setForm({ ...form, image: e.target.value })}
                />
              ) : (
                <div className="relative">
                  <label className="flex items-center gap-2 w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50 text-slate-500">
                    <FiUpload className="w-3.5 h-3.5" />
                    {form.image ? 'File terpilih' : 'Pilih file gambar...'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            const MAX_SIZE = 1 * 1024 * 1024;
                            if (file.size > MAX_SIZE) {
                              alert('Ukuran file terlalu besar. Pilih gambar < 1 MB.');
                              return;
                            }
                            compressImage(file)
                              .then(compressed => {
                                setForm(prev => ({ ...prev, image: compressed }));
                                localStorage.setItem('productImage_' + (form.id || 'new'), compressed);
                              })
                              .catch(err => {
                                alert(err.message);
                              });
                          }
                        }}
                    />
                  </label>
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-450 uppercase tracking-wider mb-1">Harga Jual (Rp)</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-400">Rp</span>
              <input
                type="number"
                required
                className="block w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                placeholder="15000"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2 pt-2 text-xs">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="flex-grow py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 uppercase transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="flex-grow py-2.5 bg-green-600 hover:bg-brand-green text-white font-bold rounded-xl uppercase transition-all shadow-sm"
            >
              Simpan Menu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
