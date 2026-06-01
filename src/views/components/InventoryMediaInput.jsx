import { FiSmile, FiUpload, FiBox, FiCheck } from 'react-icons/fi';
import defaultDessert from '../../assets/default-dessert.png';
import compressImage from '../../utils/compressImage';

export default function InventoryMediaInput({ mediaType, setMediaType, invForm, setInvForm }) {
  const isImageString = typeof invForm?.image === 'string' && invForm?.image.length > 0;
  const isBase64OrAsset = isImageString && (invForm?.image?.startsWith('data:image') || invForm?.image === defaultDessert);

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Tipe Gambar Barang</label>
      <div className="grid grid-cols-3 gap-2 bg-slate-50 p-1 rounded-xl border border-slate-100">
        <button
          type="button"
          onClick={() => {
            setMediaType('emoji');
            setInvForm(prev => ({ ...prev, image: '📦' }));
          }}
          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
            mediaType === 'emoji' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          <FiSmile className="inline mr-1 -mt-0.5" /> Gunakan Emoji
        </button>
        <button
          type="button"
          onClick={() => {
            setMediaType('upload');
            setInvForm(prev => ({ ...prev, image: '' }));
          }}
          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
            mediaType === 'upload' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          <FiUpload className="inline mr-1 -mt-0.5" /> Unggah File
        </button>
        <button
          type="button"
          onClick={() => {
            setMediaType('default');
            setInvForm(prev => ({ ...prev, image: defaultDessert }));
          }}
          className={`py-1.5 rounded-lg text-xs font-bold transition-all ${
            mediaType === 'default' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
        >
          <FiBox className="inline mr-1 -mt-0.5" /> Gambar Default
        </button>
      </div>
      <div>
        {mediaType === 'emoji' ? (
          <input
            type="text"
            required
            maxLength="2"
            className="block w-full px-4 py-2.5 border border-slate-200 rounded-xl text-center text-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900"
            placeholder="📦"
            value={isImageString ? invForm.image : ''}
            onChange={(e) => setInvForm({ ...invForm, image: e.target.value })}
          />
        ) : mediaType === 'upload' ? (
          <div className="relative">
            <label className="flex items-center justify-center gap-2 w-full px-4 py-2.5 border border-slate-200 border-dashed rounded-xl text-xs font-semibold cursor-pointer hover:bg-slate-50 text-slate-500 transition-colors">
              <FiUpload className="w-4 h-4 text-green-600" />
              <span>
                {isImageString && invForm?.image?.startsWith('data:image') ? (
                  <>
                    <FiCheck className="inline mr-1" /> File Gambar Terpilih
                  </>
                ) : (
                  'Pilih file gambar...'
                )}
              </span>
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
                        setInvForm(prev => ({ ...prev, image: compressed }));
                        localStorage.setItem('inventoryImage_' + (invForm?.id || 'new'), compressed);
                      })
                      .catch(err => {
                        alert(err.message);
                      });
                  }
                }}
              />
            </label>
          </div>
        ) : (
          <div className="text-center py-2 text-xs font-medium text-slate-400 bg-slate-50 border border-slate-150 rounded-xl">
            Menggunakan gambar cetakan default toko 🏪
          </div>
        )}
      </div>
      {isImageString && (
        <div className="flex justify-center items-center max-w-full h-32 bg-slate-50 rounded-xl p-2 border border-slate-150">
          {isBase64OrAsset ? (
            <img src={invForm.image} alt="Preview" className="max-w-full h-full object-contain rounded-lg" />
          ) : (
            <span className="text-5xl select-none">{invForm.image}</span>
          )}
        </div>
      )}
    </div>
  );
}
