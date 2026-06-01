import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiKey, FiAlertCircle } from 'react-icons/fi';

const inputBase = "block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/15 focus:border-slate-900 text-sm font-medium transition-all placeholder:text-slate-300";

export default function ResetVerify({ controller }) {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { username, email } = state || {};
  const [code, setCode] = useState('');
  const [error, setError] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    console.log('ResetVerify submit', { username, email, code });
    const ok = await controller.verifyPasswordResetCode(username, email, code);
    if (ok) {
      navigate('/reset-password', { state: { username, email, code } });
    } else {
      setError(controller.authError || 'Verifikasi kode gagal.');
    }
  };

  return (
    <div className="space-y-5 max-w-md mx-auto mt-12">
      {error && (
        <div className="flex items-start gap-2 bg-rose-50 border border-rose-200 p-3 rounded-xl text-sm text-rose-700">
          <FiAlertCircle className="shrink-0 mt-0.5 text-rose-500" />
          <span>{error}</span>
        </div>
      )}
      <form onSubmit={onSubmit} className="space-y-3.5">
        <div>
          <label className="block text-xs font-semibold text-slate-400 uppercase mb-1.5">Verification Code</label>
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none"><FiKey className="w-4 h-4" /></span>
            <input
              type="text"
              required
              maxLength={4}
              pattern="\\d{4}"
              className={inputBase}
              placeholder="Enter 4‑digit code"
              value={code}
              onChange={e => setCode(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-br from-slate-900 to-slate-800 transition">
          Verify Code
        </button>
      </form>
    </div>
  );
}
