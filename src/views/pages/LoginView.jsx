import { useState } from 'react';
import { FiUser, FiLock, FiMail, FiLogIn, FiAlertCircle, FiKey } from 'react-icons/fi';

const inputBase = "block w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1b305b]/15 focus:border-[#1b305b] text-sm font-medium transition-all placeholder:text-slate-300";

export default function LoginView({ controller }) {
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [forgotForm, setForgotForm] = useState({ username: '', email: '', newPassword: '', confirmPassword: '' });
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const onSubmitLogin = (e) => {
    e.preventDefault();
    controller.handleLogin(loginForm.username, loginForm.password);
  };

  const onSubmitForgot = (e) => {
    e.preventDefault();
    controller.setAuthError('');
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      controller.setAuthError('Konfirmasi password tidak cocok.');
      return;
    }
    const ok = controller.handleForgotPassword(forgotForm.username, forgotForm.email, forgotForm.newPassword);
    if (ok) {
      setForgotSuccess(true);
      setForgotForm({ username: '', email: '', newPassword: '', confirmPassword: '' });
    }
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setForgotSuccess(false);
    controller.setAuthError('');
  };

  return (
    <div className="space-y-5">
      {/* Error Banner */}
      {controller.authError && (
        <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200/80 p-3.5 rounded-xl text-xs text-rose-700 font-semibold">
          <FiAlertCircle className="shrink-0 mt-0.5 text-rose-500 text-sm" />
          <span>{controller.authError}</span>
        </div>
      )}

      {/* TAB SWITCHER */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
        <button
          type="button"
          onClick={() => switchMode('login')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'login' ? 'bg-white text-[#1b305b] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Masuk
        </button>
        <button
          type="button"
          onClick={() => switchMode('forgot')}
          className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'forgot' ? 'bg-white text-[#1b305b] shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
        >
          Lupa Password
        </button>
      </div>

      {/* LOGIN FORM */}
      {authMode === 'login' ? (
        <form onSubmit={onSubmitLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none">
                <FiUser className="w-4 h-4" />
              </span>
              <input type="text" required className={inputBase} placeholder="admin atau kasir"
                value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none">
                <FiLock className="w-4 h-4" />
              </span>
              <input type="password" required className={inputBase} placeholder="••••••••"
                value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
            </div>
          </div>

          <button type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-sm mt-2"
            style={{ background: 'linear-gradient(135deg, #1b305b 0%, #224075 100%)' }}
          >
            <FiLogIn className="w-4 h-4" />
            <span>MASUK</span>
          </button>
        </form>
      ) : (
        /* FORGOT PASSWORD FORM */
        <div className="space-y-4">
          {forgotSuccess ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center animate-[fadeIn_0.3s_easy-out]">
                <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center">
                  <FiKey className="text-2xl text-[#108e50]" />
                </div>
                <p className="text-sm font-bold text-[#1b305b]">Permintaan Reset Terkirim</p>
                <p className="text-xs text-slate-400 font-medium">Admin akan memproses permintaan Anda.</p>
                <button
                  onClick={() => switchMode('login')}
                  className="mt-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #1b305b 0%, #224075 100%)' }}
                >
                  Kembali ke Login
                </button>
              </div>
          ) : (
            <form onSubmit={onSubmitForgot} className="space-y-3.5">
              <p className="text-[11px] text-slate-400 font-medium text-center leading-relaxed">
                Masukkan username dan email terdaftar untuk mereset password Anda.
              </p>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none"><FiUser className="w-4 h-4" /></span>
                  <input type="text" required className={inputBase} placeholder="Username akun Anda"
                    value={forgotForm.username} onChange={e => setForgotForm({ ...forgotForm, username: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Terdaftar</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none"><FiMail className="w-4 h-4" /></span>
                  <input type="email" required className={inputBase} placeholder="nama@essalju.com"
                    value={forgotForm.email} onChange={e => setForgotForm({ ...forgotForm, email: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password Baru</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none"><FiLock className="w-4 h-4" /></span>
                  <input type="password" required className={inputBase} placeholder="Minimal 6 karakter"
                    value={forgotForm.newPassword} onChange={e => setForgotForm({ ...forgotForm, newPassword: e.target.value })} />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Konfirmasi Password Baru</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none"><FiLock className="w-4 h-4" /></span>
                  <input type="password" required className={inputBase} placeholder="Ulangi password baru"
                    value={forgotForm.confirmPassword} onChange={e => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })} />
                </div>
              </div>

              <button type="submit"
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-sm mt-2"
                style={{ background: 'linear-gradient(135deg, #108e50 0%, #13a85f 100%)' }}
              >
                <FiKey className="w-4 h-4" />
                <span>RESET PASSWORD</span>
              </button>
            </form>
          )}
        </div>
      )}

      {/* Demo credentials hint */}
      <div className="bg-[#f8fafc] border border-slate-100 rounded-xl px-4 py-3 text-center">
        <p className="text-[11px] text-slate-400 font-medium leading-relaxed">
          Demo — Admin: <strong className="text-[#1b305b]">admin</strong> / <strong className="text-[#1b305b]">admin123</strong>
          <span className="mx-2 text-slate-300">·</span>
          Kasir: <strong className="text-[#108e50]">kasir</strong> / <strong className="text-[#108e50]">kasir123</strong>
        </p>
      </div>
    </div>
  );
}
