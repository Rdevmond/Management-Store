import { useState } from 'react';
import { FiUser, FiLock, FiMail, FiLogIn, FiAlertCircle, FiKey, FiShield, FiCheckCircle, FiArrowLeft, FiExternalLink, FiEye, FiEyeOff } from 'react-icons/fi';

const inputBase = "block w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-900/10 focus:border-slate-900 text-sm font-medium transition-all placeholder:text-slate-400";

export default function LoginView({ controller }) {
  const [authMode, setAuthMode] = useState('login');
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [forgotStep, setForgotStep] = useState('request'); // 'request', 'verify', 'reset'
  const [forgotForm, setForgotForm] = useState({ username: '', email: '', code: '', newPassword: '', confirmPassword: '' });
  const [forgotSuccess, setForgotSuccess] = useState(false);
  const [testInboxUrl, setTestInboxUrl] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const onSubmitLogin = (e) => {
    e.preventDefault();
    controller.handleLogin(loginForm.username, loginForm.password);
  };

  const onSubmitRequest = async (e) => {
    e.preventDefault();
    controller.setAuthError('');
    const result = await controller.requestPasswordReset(forgotForm.username, forgotForm.email);
    if (result && result.success) {
      setTestInboxUrl(result.testUrl || '');
      setForgotStep('verify');
    }
  };

  const onSubmitVerify = async (e) => {
    e.preventDefault();
    controller.setAuthError('');
    const ok = await controller.verifyPasswordResetCode(forgotForm.username, forgotForm.email, forgotForm.code);
    if (ok) {
      setForgotStep('reset');
    }
  };

  const onSubmitReset = async (e) => {
    e.preventDefault();
    controller.setAuthError('');
    if (forgotForm.newPassword !== forgotForm.confirmPassword) {
      controller.setAuthError('Konfirmasi password tidak cocok.');
      return;
    }
    if (forgotForm.newPassword.length < 6) {
      controller.setAuthError('Password minimal 6 karakter.');
      return;
    }
    const ok = await controller.confirmPasswordReset(
      forgotForm.username,
      forgotForm.email,
      forgotForm.code,
      forgotForm.newPassword
    );
    if (ok) {
      setForgotSuccess(true);
    }
  };

  const switchMode = (mode) => {
    setAuthMode(mode);
    setForgotSuccess(false);
    setForgotStep('request');
    setForgotForm({ username: '', email: '', code: '', newPassword: '', confirmPassword: '' });
    setTestInboxUrl('');
    controller.setAuthError('');
  };

  const handleSuccessBack = () => {
    setLoginForm({ ...loginForm, username: forgotForm.username });
    switchMode('login');
  };

  return (
    <div className="space-y-5 w-full">
        {controller.authError && (
          <div className="flex items-start gap-2.5 bg-rose-50 border border-rose-200/80 p-3.5 rounded-xl text-xs text-rose-700 font-semibold animate-fade-in">
            <FiAlertCircle className="shrink-0 mt-0.5 text-rose-500 text-sm" />
            <span>{controller.authError}</span>
          </div>
        )}
        <div className="flex gap-1 p-1 bg-slate-100 rounded-xl">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'login' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Masuk
          </button>
          <button
            type="button"
            onClick={() => switchMode('forgot')}
            className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${authMode === 'forgot' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
          >
            Lupa Password
          </button>
        </div>
        {authMode === 'login' ? (
          <form onSubmit={onSubmitLogin} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none"><FiUser className="w-4 h-4" /></span>
                <input type="text" required className={inputBase} placeholder="admin atau kasir"
                  value={loginForm.username} onChange={e => setLoginForm({ ...loginForm, username: e.target.value })} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none"><FiLock className="w-4 h-4" /></span>
                <input type={showPassword ? "text" : "password"} required className={inputBase} placeholder="********"
                  value={loginForm.password} onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                <span className="absolute inset-y-0 right-0 pr-3 flex items-center cursor-pointer" onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <FiEye className="w-4 h-4 text-slate-400" /> : <FiEyeOff className="w-4 h-4 text-slate-400" />}
                </span>
              </div>
            </div>
            <button type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-sm mt-6 bg-slate-900 hover:bg-slate-800">
              <FiLogIn className="w-4 h-4" />
              <span>MASUK</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4">
            {forgotSuccess ? (
              <div className="flex flex-col items-center gap-3.5 py-6 text-center animate-fade-in">
                <div className="w-16 h-16 rounded-full bg-emerald-50 border-2 border-emerald-100 flex items-center justify-center shadow-inner animate-bounce">
                  <FiCheckCircle className="text-3xl text-emerald-600" />
                </div>
                <p className="text-base font-bold text-slate-900">Password Berhasil Diubah!</p>
                <p className="text-xs text-slate-400 font-medium max-w-[250px] leading-relaxed">Password baru Anda telah berhasil diperbarui secara otomatis. Silakan masuk kembali ke akun Anda.</p>
                <button onClick={handleSuccessBack}
                  className="mt-3 px-6 py-3 rounded-xl text-xs font-bold text-white shadow-md bg-slate-900 hover:bg-slate-800 transition-all w-full flex items-center justify-center gap-1.5">
                  <FiLogIn className="w-4 h-4" />
                  <span>MASUK SEKARANG</span>
                </button>
              </div>
            ) : (
              <>
                {forgotStep === 'request' && (
                  <form onSubmit={onSubmitRequest} className="space-y-3.5 animate-fade-in">
                    <p className="text-xs text-slate-400 font-medium text-center leading-relaxed">Masukkan username dan email terdaftar untuk meminta kode verifikasi password.</p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Username</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none"><FiUser className="w-4 h-4" /></span>
                        <input type="text" required className={inputBase} placeholder="Username akun Anda"
                          value={forgotForm.username} onChange={e => setForgotForm({ ...forgotForm, username: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Email Terdaftar</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none"><FiMail className="w-4 h-4" /></span>
                        <input type="email" required className={inputBase} placeholder="nama@essalju.com"
                          value={forgotForm.email} onChange={e => setForgotForm({ ...forgotForm, email: e.target.value })} />
                      </div>
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-sm mt-6 bg-emerald-600 hover:bg-emerald-700">
                      <FiKey className="w-4 h-4" />
                      <span>LANJUTKAN</span>
                    </button>
                  </form>
                )}
                {forgotStep === 'verify' && (
                  <form onSubmit={onSubmitVerify} className="space-y-3.5 animate-fade-in">
                    {testInboxUrl ? (
                      <a href={testInboxUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 w-full bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 hover:border-emerald-300 hover:shadow-md transition-all group">
                        <div className="shrink-0 w-9 h-9 rounded-lg bg-emerald-500 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                          <FiMail className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="text-xs font-bold text-emerald-800">Buka Virtual Inbox</p>
                          <p className="text-[10px] text-emerald-600 font-medium leading-tight">Klik untuk melihat email & kode verifikasi di browser</p>
                        </div>
                        <FiExternalLink className="w-4 h-4 text-emerald-500 group-hover:text-emerald-700 shrink-0 transition-colors" />
                      </a>
                    ) : (
                      <p className="text-xs text-slate-400 font-medium text-center leading-relaxed">
                        Kode verifikasi 4-digit telah dikirim ke email <strong className="text-slate-700">{forgotForm.email}</strong>. Harap periksa kotak masuk Anda.
                      </p>
                    )}
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 text-center">Kode Verifikasi 4-Digit</label>
                      <div className="relative max-w-[180px] mx-auto">
                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-350 pointer-events-none"><FiShield className="w-4 h-4 text-green-600" /></span>
                        <input type="text" required pattern="[0-9]{4}" maxLength={4}
                          className="block w-full pl-9 pr-4 py-3 bg-slate-50 border-2 border-green-500/20 text-slate-800 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500/15 focus:border-green-600 text-center text-lg font-bold tracking-[0.6em] transition-all placeholder:text-slate-300"
                          placeholder="0000"
                          value={forgotForm.code}
                          onChange={e => { const val = e.target.value.replace(/[^0-9]/g, ''); setForgotForm({ ...forgotForm, code: val }); }}
                        />
                      </div>
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-sm mt-6 bg-emerald-600 hover:bg-emerald-700">
                      <FiShield className="w-4 h-4" />
                      <span>VERIFIKASI KODE</span>
                    </button>
                    <div className="flex flex-col gap-2 mt-4 text-center">
                      <button type="button" onClick={async () => {
                        const result = await controller.requestPasswordReset(forgotForm.username, forgotForm.email);
                        if (result && result.testUrl) setTestInboxUrl(result.testUrl);
                      }} className="text-xs font-semibold text-green-600 hover:text-green-700 transition">
                        Kirim ulang kode verifikasi
                      </button>
                      <button type="button" onClick={() => setForgotStep('request')} className="text-xs font-medium text-slate-400 hover:text-slate-600 flex items-center justify-center gap-1 mt-1 transition">
                        <FiArrowLeft className="w-3 h-3" />
                        <span>Ubah Username / Email</span>
                      </button>
                    </div>
                  </form>
                )}
                {forgotStep === 'reset' && (
                  <form onSubmit={onSubmitReset} className="space-y-3.5 animate-fade-in">
                    <p className="text-xs text-slate-400 font-medium text-center leading-relaxed">Kode terverifikasi! Masukkan password baru Anda di bawah ini.</p>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Password Baru</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none"><FiLock className="w-4 h-4" /></span>
                        <input type="password" required className={inputBase} placeholder="Minimal 6 karakter"
                          value={forgotForm.newPassword} onChange={e => setForgotForm({ ...forgotForm, newPassword: e.target.value })} />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Konfirmasi Password Baru</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-slate-350 pointer-events-none"><FiLock className="w-4 h-4" /></span>
                        <input type="password" required className={inputBase} placeholder="Ulangi password baru"
                          value={forgotForm.confirmPassword} onChange={e => setForgotForm({ ...forgotForm, confirmPassword: e.target.value })} />
                      </div>
                    </div>
                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-bold text-white transition-all shadow-sm mt-6 bg-emerald-600 hover:bg-emerald-700">
                      <FiKey className="w-4 h-4" />
                      <span>SIMPAN PASSWORD BARU</span>
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        )}

    </div>
  );
}
