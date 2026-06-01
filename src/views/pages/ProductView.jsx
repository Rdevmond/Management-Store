import { useState, useMemo } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';
import ProductModal from '../components/ProductModal';
const formatRupiah = (num) => {
  return 'Rp ' + Number(num).toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
};
const ProductMedia = ({ media, name, className = "w-12 h-12" }) => {
  const isUrl = media && (media.startsWith('http') || media.startsWith('/') || media.startsWith('data:image'));
  return (
    <div className={`${className} bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden`}
    >
      {isUrl ? (
        <img src={media} alt={name} className="w-full h-full object-cover" />
      ) : (
        <FaUtensils className="text-2xl" />
      )}
    </div>
  );
};
export default function ProductView({ controller }) {
  const { products, activeUser, handleSaveProduct, handleDeleteProduct } = controller;
  const isAdmin = activeUser.role === 'admin';
  const [showModal, setShowModal] = useState(false);
  const [mediaType, setMediaType] = useState('emoji');
    const [form, setForm] = useState({ id: '', name: '', category: '', price: '', image: '' });
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
  const existingCategories = useMemo(() => 
    Array.from(new Set(products.map(p => p.category))).sort()
  , [products]);
  const onOpenAdd = () => {
    setForm({ id: '', name: '', category: '', price: '', image: '' });
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
        image: prod.image || ''
    });
    setMediaType(isUrl ? 'url' : 'emoji');
    setShowModal(true);
  };
  const onSubmit = async (e) => {
    e.preventDefault();
    const success = await handleSaveProduct(form);
    if (success) {
      setShowModal(false);
      const cacheKey = 'productImage_' + (form.id || 'new');
      localStorage.removeItem(cacheKey);
    }
  };
  return (
    <div className="space-y-6 animate-fade-in-slow text-slate-800">
      <div className="flex flex-col">
        <div className="sticky top-0 z-10 bg-white p-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5 gap-3">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Katalog Menu Dessert</h2>
              <p className="text-slate-400 text-xs font-medium">Daftar produk aktif yang dijual pada kasir POS.</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 items-center w-full sm:w-auto">
              <div className="relative w-full sm:w-64">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Cari menu..."
                  className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {isAdmin && (
                <button
                  onClick={onOpenAdd}
                  className="w-full sm:w-auto px-4 py-2 bg-green-600 hover:bg-brand-green text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
                >
                  <FiPlus className="text-base" />
                  <span>TAMBAH MENU</span>
                </button>
              )}
            </div>
          </div>
        </div>
        <div className="pt-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredProducts.map(prod => (
              <div 
                key={prod.id} 
                className="bg-white p-5 rounded-2xl border border-slate-100 shadow flex flex-col justify-between min-h-44 hover:shadow-md transition-shadow"
              >
                <div>
                  <div className="flex items-center justify-between mb-3.5">
                    <span className="px-2 py-0.5 bg-blue-100/40 text-slate-900 rounded-lg text-xs font-bold border border-blue-100">
                      {prod.category}
                    </span>
                    <ProductMedia media={prod.image} name={prod.name} className="w-11 h-11" />
                  </div>
                  <h3 className="font-bold text-slate-850 text-xs leading-snug line-clamp-2">{prod.name}</h3>
                  <p className="text-sm font-bold text-green-600 mt-2">{formatRupiah(prod.price)}</p>
                </div>
                {isAdmin && (
                  <div className="mt-4 pt-2.5 border-t border-slate-100 flex items-center justify-end space-x-2 text-xs">
                    <button
                      onClick={() => onOpenEdit(prod)}
                      className="px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-900 font-bold rounded-lg transition-colors flex items-center gap-1"
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
        </div>
      </div>
      <ProductModal
        showModal={showModal}
        setShowModal={setShowModal}
        form={form}
        setForm={setForm}
        onSubmit={onSubmit}
        mediaType={mediaType}
        setMediaType={setMediaType}
        existingCategories={existingCategories}
      />
    </div>
  );
}
