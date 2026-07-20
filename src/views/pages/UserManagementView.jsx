import { useState } from 'react';
import { FiPlus, FiEdit, FiTrash2 } from 'react-icons/fi';
import UserModal from '../components/UserModal';
export default function UserManagementView({ controller }) {
  const { users, addUser, updateUser, deleteUser } = controller;
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
    setFormData({ ...user, password: '' });
    setIsEditing(true);
    setShowModal(true);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const success = isEditing ? updateUser(formData) : addUser(formData);
    if (success) resetForm();
  };
  return (
    <div className="space-y-6 animate-fade-in-slow text-slate-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b border-slate-200/80 pb-5 gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Kelola Pengguna</h2>
          <p className="text-slate-500 text-xs font-medium">Atur hak akses akun kasir dan pemilik (administrator).</p>
        </div>
      </div>
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto border-b border-slate-100">
          <table className="min-w-full divide-y divide-slate-100 text-left text-sm relative">
            <thead className="bg-slate-50 text-slate-900 uppercase tracking-wider text-xs font-bold sticky top-0 z-10 shadow-sm">
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
                  <td colSpan="4" className="px-6 py-12 text-center text-slate-500 font-semibold">
                    Belum ada data pengguna.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const initials = u.username.slice(0, 2).toUpperCase();
                  const roleCls = 
                    u.role === 'pemilik' 
                      ? 'bg-sky-50 text-sky-700 border-sky-100/50' 
                      : u.role === 'kasir' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100/50' 
                      : 'bg-amber-50 text-amber-700 border-amber-100/50';
                  return (
                    <tr key={u.id} className="transition-colors hover:bg-slate-50/70">
                      <td className="px-6 py-4 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-50 border border-slate-200 text-slate-900 font-bold flex items-center justify-center text-xs shrink-0 select-none shadow-inner">
                          {initials}
                        </div>
                        <span className="font-semibold text-slate-800 text-xs md:text-sm">{u.username}</span>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs md:text-sm font-medium">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold border ${roleCls} uppercase tracking-wider`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => onOpenEdit(u)}
                            className="p-2 text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                            title="Edit Pengguna"
                          >
                            <FiEdit className="text-sm" />
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
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
      <UserModal
        showModal={showModal}
        resetForm={resetForm}
        isEditing={isEditing}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
