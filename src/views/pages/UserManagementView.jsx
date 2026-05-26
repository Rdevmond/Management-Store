import { useState } from 'react';
import { FiPlus, FiEdit, FiTrash2, FiX, FiUser, FiMail, FiLock, FiShield } from 'react-icons/fi';

export default function UserManagementView({ controller }) {
  const { users, addUser, updateUser, deleteUser } = controller;
  
  // Local states
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'kasir' });

  const resetForm = () => {
    setFormData({ username: '', email: '', password: '', role: 'kasir' });
    setIsEditing(false);
    setShowModal(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const onOpenAdd = () => {
    setFormData({ username: '', email: '', password: '', role: 'kasir' });
    setIsEditing(false);
    setShowModal(true);
  };

  const onOpenEdit = (user) => {
    setFormData({ ...user, password: '' }); // Leave password empty by default on edit
    setIsEditing(true);
    setShowModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isEditing) {
      const success = updateUser(formData);
      if (success) resetForm();
    } else {
      const success = addUser(formData);
      if (success) resetForm();
    }
  };

  const handleDelete = (userId) => {
    deleteUser(userId);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.4s_ease-out] text-slate-800">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-[#1b305b] uppercase tracking-tight">Kelola Pengguna</h2>
          <p className="text-slate-400 text-xs font-medium">Atur hak akses akun kasir, staff, dan administrator sistem.</p>
        </div>
        <button
          onClick={onOpenAdd}
          className="px-4 py-2.5 bg-[#108e50] hover:bg-[#0c6c3d] text-white font-bold rounded-xl text-xs shadow-sm transition-all flex items-center justify-center gap-1.5"
        >
          <FiPlus className="text-base" />
          <span>TAMBAH PENGGUNA</span>
        </button>
      </div>

      {/* Users Card Table Container */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm">
            <thead className="bg-[#f8fafc] text-[#1b305b] uppercase tracking-wider text-xs font-bold">
              <tr>
                <th className="px-6 py-4">Pengguna</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Hak Akses / Role</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-400 font-semibold">
                    Belum ada data pengguna.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const initials = u.username.slice(0, 2).toUpperCase();
                  const roleCls = 
                    u.role === 'admin' 
                      ? 'bg-sky-50 text-sky-700 border-sky-100/50' 
                      : u.role === 'kasir' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' 
                      : 'bg-amber-50 text-amber-700 border-amber-100/50';

                  return (
                    <tr key={u.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-[#1b305b] font-bold flex items-center justify-center text-xs shrink-0 select-none shadow-inner">
                          {initials}
                        </div>
                        <span className="font-semibold text-slate-800 text-xs md:text-sm">{u.username}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs md:text-sm font-medium">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-bold border ${roleCls} uppercase tracking-wider`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onOpenEdit(u)}
                            className="p-2 text-[#1b305b] hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Pengguna"
                          >
                            <FiEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => handleDelete(u.id)}
                            className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Pengguna"
                          >
                            <FiTrash2 className="text-sm" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD / EDIT USER MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-2xl p-6 w-full max-w-md animate-[fadeIn_0.2s_ease-out] flex flex-col relative text-slate-800">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-150 mb-5">
              <h3 className="font-bold text-[#1b305b] text-sm uppercase tracking-wider flex items-center gap-1.5">
                <FiUser className="text-[#108e50] text-base" />
                <span>{isEditing ? 'Ubah Akun Pengguna' : 'Tambah Pengguna Baru'}</span>
              </h3>
              <button onClick={resetForm} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg transition-colors">
                <FiX className="text-base" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
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
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50] text-xs font-semibold placeholder:text-slate-300 transition-all"
                    placeholder="Masukkan username"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Email</label>
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
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50] text-xs font-semibold placeholder:text-slate-300 transition-all"
                    placeholder="nama@contoh.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Password {isEditing && <span className="text-[9px] text-slate-400 normal-case">(kosongkan jika tidak diganti)</span>}
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
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50] text-xs font-semibold placeholder:text-slate-300 transition-all"
                    placeholder={isEditing ? '••••••••' : 'Masukkan password'}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Hak Akses / Role</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-300 pointer-events-none">
                    <FiShield className="w-3.5 h-3.5" />
                  </span>
                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="block w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#108e50]/20 focus:border-[#108e50] text-xs font-semibold transition-all appearance-none"
                  >
                    <option value="admin">Administrator</option>
                    <option value="kasir">Kasir</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
              </div>

              {/* Modal Actions */}
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
                  className="px-4 py-2 bg-[#108e50] hover:bg-[#0c6c3d] text-white text-xs font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center gap-1.5"
                >
                  <span>{isEditing ? 'Perbarui' : 'Tambah'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
