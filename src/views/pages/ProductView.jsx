import { useState, useMemo } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi';
import { FaUtensils } from 'react-icons/fa';
import ProductModal from '../components/ProductModal';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Card from '../components/ui/Card';

const formatRupiah = (num) => {
  return 'Rp ' + Number(num).toLocaleString('id-ID');
};

const ProductMedia = ({ media, name, className = "w-12 h-12" }) => {
  const isUrl = media && (media.startsWith('http') || media.startsWith('/') || media.startsWith('data:image'));
  return (
    <div className={`${className} bg-slate-50 border border-slate-100 rounded-xl flex items-center justify-center shrink-0 shadow-inner overflow-hidden`}>
      {isUrl ? (
        <img src={media} alt={name} className="w-full h-full object-cover" />
      ) : (
        <FaUtensils className="text-2xl text-slate-400" />
      )}
    </div>
  );
};

export default function ProductView({ controller }) {
  const { products, activeUser, handleSaveProduct, handleDeleteProduct } = controller;
  const isAdmin = activeUser.role === 'pemilik';
  
  const [showModal, setShowModal] = useState(false);
  const [mediaType, setMediaType] = useState('emoji');
  const [form, setForm] = useState({ id: '', name: '', category: '', price: '', image: '' });
  const [searchKeyword, setSearchKeyword] = useState('');
  
  const filteredProducts = useMemo(() => {
    if (!searchKeyword) return products;
    const lower = searchKeyword.toLowerCase();
    return products.filter(p => 
      p.name.toLowerCase().includes(lower) ||
      p.category.toLowerCase().includes(lower) ||
      (p.price && p.price.toString().includes(lower))
    );
  }, [products, searchKeyword]);
  
  const existingCategories = useMemo(() => 
    Array.from(new Set(products.map(p => p.category))).sort()
  , [products]);
  
  const handleOpenAdd = () => {
    setForm({ id: '', name: '', category: '', price: '', image: '' });
    setMediaType('emoji');
    setShowModal(true);
  };
  
  const handleOpenEdit = (prod) => {
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
  
  const handleSubmit = async (e) => {
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
        <div className="sticky top-0 z-10 bg-slate-50 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Katalog Menu</h2>
              <p className="text-slate-500 text-xs mt-1">Kelola daftar produk yang dijual pada kasir.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <Input
                placeholder="Cari menu..."
                icon={<FiSearch />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                containerClassName="w-full sm:w-64"
                className="h-10 text-sm rounded-xl"
              />
              {isAdmin && (
                <Button onClick={handleOpenAdd} icon={<FiPlus />} className="w-full sm:w-auto px-6">
                  Tambah Menu
                </Button>
              )}
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 pt-2">
          {filteredProducts.map(prod => (
            <Card key={prod.id} className="hover:shadow-md transition-shadow">
              <div className="flex flex-col h-full justify-between min-h-[140px]">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-semibold">
                      {prod.category}
                    </span>
                    <ProductMedia media={prod.image} name={prod.name} className="w-12 h-12" />
                  </div>
                  <h3 className="font-medium text-slate-800 text-[15px] leading-snug line-clamp-2">{prod.name}</h3>
                  <p className="text-[15px] font-medium text-slate-700 mt-2">{formatRupiah(prod.price)}</p>
                </div>
                
                {isAdmin && (
                  <div className="mt-auto pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <Button size="xs" variant="outline" onClick={() => handleOpenEdit(prod)} icon={<FiEdit />}>
                      Ubah
                    </Button>
                    <Button size="xs" variant="danger" onClick={() => handleDeleteProduct(prod.id)} icon={<FiTrash2 />}>
                      Hapus
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      </div>
      
      <ProductModal
        showModal={showModal}
        setShowModal={setShowModal}
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        mediaType={mediaType}
        setMediaType={setMediaType}
        existingCategories={existingCategories}
      />
    </div>
  );
}
