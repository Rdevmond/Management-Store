import { useState } from 'react';
import { FiKey, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useNavigate, useLocation } from 'react-router-dom';

const inputBase = "block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 text-sm font-medium transition-all placeholder:text-slate-300";

export default function ResetPassword({ controller }) {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, email, code } = location.state || {};
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Password dan konfirmasi tidak cocok.');
      return;
    }
    const ok = await controller.confirmPasswordReset(username, email, code, newPassword);
    if (ok) {
      navigate('/login');
    } else {
      setError(controller.authError || 'Gagal mereset password.');
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-5 mt-12">
      {error && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 p-3 rounded-xl text-sm text-rose-700">
          <FiAlertCircle className="shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Password Baru</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none">
              <FiKey className="w-4 h-4" />
            </span>
            <input
              type="password"
              required
              className={inputBase}
              placeholder="Password baru"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Konfirmasi Password</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none">
              <FiCheckCircle className="w-4 h-4" />
            </span>
            <input
              type="password"
              required
              className={inputBase}
              placeholder="Ulangi password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>
        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-slate-900 to-slate-800 transition"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
