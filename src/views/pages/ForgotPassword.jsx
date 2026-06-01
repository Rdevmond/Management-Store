import { useState } from 'react';
import { FiUser, FiMail, FiKey, FiAlertCircle } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const inputBase = "block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 text-sm font-medium transition-all placeholder:text-slate-300";

export default function ForgotPassword({ controller }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '' });
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const ok = await controller.requestPasswordReset(form.username, form.email);
    if (ok) navigate('/reset-verify', { state: { username: form.username, email: form.email } });
    else setError(controller.authError || 'Gagal mengirim kode verifikasi.');
  };

  return (
    <div className="space-y-5 max-w-md mx-auto">
      {error && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 p-3 rounded-xl text-sm text-rose-700">
          <FiAlertCircle className="shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Username</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none">
              <FiUser className="w-4 h-4" />
            </span>
            <input type="text" required className={inputBase} placeholder="Username akun Anda"
              value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Email Terdaftar</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none">
              <FiMail className="w-4 h-4" />
            </span>
            <input type="email" required className={inputBase} placeholder="nama@domain.com"
              value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          </div>
        </div>
        <button type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-slate-900 to-slate-800 transition">
          <FiKey className="w-4 h-4" />
          <span>KIRIM KODE VERIFIKASI</span>
        </button>
      </form>
    </div>
  );
}
