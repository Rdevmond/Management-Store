import { useState, useMemo } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiTag, FiX, FiImage, FiSearch } from 'react-icons/fi';

const formatRupiah = (num) => {
  return 'Rp ' + Number(num).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};

// Helper component to render product media adaptively (URL image or Emoji)
const ProductMedia = ({ media, name, className = "w-12 h-12" }) => {
  const isUrl = media && (media.startsWith('http') || media.startsWith('/') || media.startsWith('data:image'));
  
  return (
    <div className={`${className} bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden`}>
      {isUrl ? (
        <img src={media} alt={name} className="w-full h-full object-cover" />
      ) : (
        <span className="text-3xl select-none">{media || '🍧'}</span>
      )}
    </div>
  );
};

export default function ProductView({ controller }) {
  const { products, activeUser, handleSaveProduct, handleDeleteProduct } = controller;
  const isAdmin = activeUser.role === 'admin';

  // Local state for Product Modal
  const [showModal, setShowModal] = useState(false);
  const [mediaType, setMediaType] = useState('emoji'); // 'emoji' | 'url'
  const [form, setForm] = useState({ id: '', name: '', category: '', price: '', image: '🍧' });
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = useMemo(() => {
    if (!searchQuery) return products;
    const lower = searchQuery.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower) ||
      (p.price && p.price.toString().includes(lower))
    );
  }, [products, searchQuery]);

  // Get unique categories from existing products
  const existingCategories = Array.from(new Set(products.map(p => p.category))).sort();

  const onOpenAdd = () => {
    setForm({ id: '', name: '', category: '', price: '', image: '🍧' });
    setMediaType('emoji');
    setShowModal(true);
  };

  const onOpenEdit = (prod) => {
    const isUrl = prod.image && (prod.image.startsWith('http') || prod.image.startsWith('/') || prod.image.startsWith('data:image'));
    setForm({
      id: prod.id,
      name: prod.name,
      category: prod.category,
      price: prod.price.toString(),
      image: prod.image || '🍧'
    });
    setMediaType(isUrl ? 'url' : 'emoji');
    setShowModal(true);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const success = handleSaveProduct(form);
    if (success) {
      setShowModal(false);
    }
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out] text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1b305b] uppercase tracking-tight">Katalog Menu Dessert</h2>
          <p className="text-slate-400 text-xs font-medium">Daftar produk aktif yang dijual pada kasir POS.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Cari menu..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          {isAdmin && (
            <button
              onClick={onOpenAdd}
              className="w-full sm:w-auto px-4 py-2 bg-[#108e50] hover:bg-[#0c6c3d] text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
            >
              <FiPlus className="text-base" />
              <span>TAMBAH MENU</span>
            </button>
          )}
        </div>
      </div>

      {/* Menu Catalog Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {filteredProducts.map(prod => (
          <div 
            key={prod.id} 
            className="bg-white p-5 rounded-2xl border border-slate-100 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col justify-between min-h-[180px] hover:shadow-md transition-shadow"
          >
            <div>
              <div className="flex items-center justify-between mb-3.5">
                <span className="px-2 py-0.5 bg-[#e0f2fe]/40 text-[#1b305b] rounded-lg text-[10px] font-bold border border-[#e0f2fe]">
                  {prod.category}
                </span>
                
                {/* Product Image or Emoji representation */}
                <ProductMedia media={prod.image} name={prod.name} className="w-11 h-11" />
              </div>
              <h3 className="font-bold text-slate-850 text-xs leading-snug line-clamp-2">{prod.name}</h3>
              <p className="text-sm font-bold text-[#108e50] mt-2">{formatRupiah(prod.price)}</p>
            </div>

            {isAdmin && (
              <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-end space-x-2 text-[10px]">
                <button
                  onClick={() => onOpenEdit(prod)}
                  className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-[#1b305b] font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <FiEdit />
                  <span>Ubah</span>
                </button>
                <button
                  onClick={() => handleDeleteProduct(prod.id)}
                  className="px-2.5 py-1.5 bg-rose-50/60 hover:bg-rose-100 border border-rose-100 text-rose-600 font-bold rounded-lg transition-colors flex items-center gap-1"
                >
                  <FiTrash2 />
                  <span>Hapus</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* PRODUCTS CRUD ADD/EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full border border-slate-100 shadow-xl relative animate-[fadeIn_0.3s_ease-out] text-slate-800">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-650 font-bold text-lg"
            >
              <FiX />
            </button>
            <h3 className="text-base font-bold text-[#1b305b] mb-4 uppercase tracking-wide flex items-center gap-1.5">
              <FiTag className="text-[#108e50]" />
              <span>{form.id ? 'Ubah Informasi Menu' : 'Tambah Menu Baru'}</span>
            </h3>
            
            <form onSubmit={onSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1">Nama Menu</label>
                <input
                  type="text"
                  required
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50]"
                  placeholder="Contoh: Es Salju Mangga Madu"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1">Kategori Menu</label>
                <input
                  type="text"
                  list="category-options"
                  required
                  className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-xs font-bold bg-white focus:outline-none focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50]"
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

              {/* MEDIA TYPE CHOOSER (Emoji or URL) */}
              <div className="space-y-2">
                <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider">Tipe Gambar Menu</label>
                <div className="grid grid-cols-2 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setMediaType('emoji');
                      setForm(prev => ({ ...prev, image: '🍧' }));
                    }}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      mediaType === 'emoji' ? 'bg-white text-[#1b305b] shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    🎨 Gunakan Emoji
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaType('url');
                      setForm(prev => ({ ...prev, image: '' }));
                    }}
                    className={`py-1.5 rounded-lg text-[10px] font-bold transition-all ${
                      mediaType === 'url' ? 'bg-white text-[#1b305b] shadow-sm' : 'text-slate-500'
                    }`}
                  >
                    🔗 Gunakan Link URL
                  </button>
                </div>

                <div>
                  {mediaType === 'emoji' ? (
                    <input
                      type="text"
                      required
                      maxLength="2"
                      className="block w-full px-3 py-2 border border-slate-200 rounded-xl text-center text-xl focus:outline-none focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50]"
                      placeholder="🍧"
                      value={form.image}
                      onChange={(e) => setForm({ ...form, image: e.target.value })}
                    />
                  ) : (
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                        <FiImage className="w-3.5 h-3.5" />
                      </span>
                      <input
                        type="url"
                        required
                        className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50]"
                        placeholder="https://example.com/gambar-bingsoo.jpg"
                        value={form.image}
                        onChange={(e) => setForm({ ...form, image: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-semibold text-slate-450 uppercase tracking-wider mb-1">Harga Jual (Rp)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-slate-400">Rp</span>
                  <input
                    type="number"
                    required
                    className="block w-full pl-8 pr-3 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50]"
                    placeholder="15000"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-grow py-2.5 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 uppercase transition-colors"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="flex-grow py-2.5 bg-[#108e50] hover:bg-[#0c6c3d] text-white font-bold rounded-xl uppercase transition-all shadow-sm"
                >
                  Simpan Menu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
