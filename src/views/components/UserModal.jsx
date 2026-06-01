import { FiX, FiUser, FiMail, FiLock, FiShield } from 'react-icons/fi';
export default function UserModal({
  showModal,
  resetForm,
  isEditing,
  formData,
  handleChange,
  handleSubmit
}) {
  if (!showModal) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 overflow-auto">
      <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 w-full max-w-full sm:max-w-md md:max-w-lg animate-fade-in-fast flex flex-col relative text-slate-800">
        <div className="flex items-center justify-between pb-4 border-b border-slate-150 mb-5">
          <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider flex items-center gap-1.5">
            <FiUser className="text-green-600 text-base" />
            <span>{isEditing ? 'Ubah Akun Pengguna' : 'Tambah Pengguna Baru'}</span>
          </h3>
          <button onClick={resetForm} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
            <FiX className="text-base" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-300 pointer-events-none">
                <FiUser className="w-3.5 h-3.5" />
              </span>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 text-xs font-semibold placeholder:text-slate-300 transition-all"
                placeholder="Masukkan username"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-300 pointer-events-none">
                <FiMail className="w-3.5 h-3.5" />
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 text-xs font-semibold placeholder:text-slate-300 transition-all"
                placeholder="nama@contoh.com"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Password {isEditing && <span className="text-xs text-slate-400 normal-case">(kosongkan jika tidak diganti)</span>}
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-300 pointer-events-none">
                <FiLock className="w-3.5 h-3.5" />
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required={!isEditing}
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 text-xs font-semibold placeholder:text-slate-300 transition-all"
                placeholder={isEditing ? '********' : 'Masukkan password'}
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Hak Akses / Role</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-300 pointer-events-none">
                <FiShield className="w-3.5 h-3.5" />
              </span>
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-600/20 focus:border-green-600 text-xs font-semibold transition-all appearance-none"
              >
                <option value="admin">Administrator</option>
                <option value="kasir">Kasir</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100 mt-5">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-500 text-xs font-bold rounded-xl transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 hover:bg-brand-green text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
            >
              <span>{isEditing ? 'Perbarui' : 'Tambah'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
