import { useState, useEffect } from 'react';
import { appStore } from '../models/appStore';
import {
  apiLogin, apiPost,
  apiAddUser, apiUpdateUser, apiDeleteUser
} from '../services/api';

export default function useUserSubController(navigate, triggerAlert) {
  const [users, setUsers] = useState([]);
  const [activeUser, setActiveUser] = useState(() => appStore.getActiveUser());
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    appStore.setActiveUser(activeUser);
  }, [activeUser]);

  const handleLogin = async (username, password) => {
    setAuthError('');
    try {
      const user = await apiLogin(username, password);
      setActiveUser(user);
      triggerAlert(`Selamat datang kembali, ${user.username}!`, 'success');
      navigate(user.role === 'pemilik' ? '/' : '/pos');
      return true;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  const handleLogout = () => {
    setActiveUser(null);
    triggerAlert('Anda telah keluar dari sistem.', 'info');
    navigate('/login');
  };

  const requestPasswordReset = async (username, email) => {
    if (!username || !email) {
      triggerAlert('Username dan email wajib diisi.', 'error');
      return false;
    }
    try {
      const res = await apiPost('/users/forgot-password', { username, email });
      if (res.success || res.message) {
        if (res.testUrl) {
          triggerAlert('Kode verifikasi dikirim! Klik tombol Virtual Inbox yang muncul.', 'success');
          return { success: true, testUrl: res.testUrl };
        }
        triggerAlert('Kode verifikasi telah dikirim ke email Anda.', 'success');
        return { success: true };
      }
      triggerAlert('Gagal mengirim kode verifikasi.', 'error');
      return false;
    } catch (err) {
      triggerAlert(err.message || 'Error mengirim kode.', 'error');
      return false;
    }
  };

  const confirmPasswordReset = async (username, email, code, newPassword) => {
    if (!username || !email || !code || !newPassword) {
      triggerAlert('Semua bidang wajib diisi.', 'error');
      return false;
    }
    try {
      const res = await apiPost('/users/confirm-forgot', { username, email, code, newPassword });
      if (res.success) {
        triggerAlert('Password berhasil direset. Silakan login.', 'success');
        return true;
      }
      triggerAlert(res.error || 'Verifikasi gagal.', 'error');
      return false;
    } catch (err) {
      triggerAlert(err.message || 'Error verifikasi.', 'error');
      return false;
    }
  };

  const verifyPasswordResetCode = async (username, email, code) => {
    if (!username || !email || !code) {
      triggerAlert('Kode verifikasi wajib diisi.', 'error');
      return false;
    }
    try {
      const res = await apiPost('/users/verify-code', { username, email, code });
      if (res.success) {
        triggerAlert('Kode verifikasi berhasil diverifikasi.', 'success');
        return true;
      }
      triggerAlert(res.error || 'Kode verifikasi salah.', 'error');
      return false;
    } catch (err) {
      triggerAlert(err.message || 'Error verifikasi kode.', 'error');
      return false;
    }
  };

  const handleForgotPassword = async (username, email, newPassword) => {
    // Legacy support for direct forgot password
    try {
      const res = await apiPost('/users/forgot-password', { username, email });
      if (res.success) {
        // Since old flow resets immediately, we simulate it
        const res2 = await apiPost('/users/confirm-forgot', { username, email, code: '000000', newPassword });
        return res2.success;
      }
      return false;
    } catch (err) {
      setAuthError(err.message);
      return false;
    }
  };

  const addUser = async (newUser) => {
    if (!newUser.username || !newUser.email || !newUser.password || !newUser.role) {
      triggerAlert('Harap isi semua bidang pengguna.', 'error');
      return false;
    }
    try {
      const created = await apiAddUser(newUser);
      setUsers(prev => [...prev, created]);
      triggerAlert('Pengguna baru berhasil ditambahkan.', 'success');
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  const updateUser = async (updatedUser) => {
    try {
      await apiUpdateUser(updatedUser.id, updatedUser);
      setUsers(prev => prev.map(u => u.id === updatedUser.id ? { ...u, ...updatedUser } : u));
      triggerAlert('Data pengguna berhasil diperbarui.', 'success');
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  const deleteUser = async (userId) => {
    if (!window.confirm('Anda yakin ingin menghapus pengguna ini?')) return false;
    try {
      await apiDeleteUser(userId);
      setUsers(prev => prev.filter(u => u.id !== userId));
      triggerAlert('Pengguna berhasil dihapus.', 'info');
      return true;
    } catch (err) {
      triggerAlert(err.message, 'error');
      return false;
    }
  };

  return {
    users, setUsers, activeUser, setActiveUser, authError, setAuthError,
    handleLogin, handleLogout, requestPasswordReset, verifyPasswordResetCode, confirmPasswordReset,
    handleForgotPassword, addUser, updateUser, deleteUser
  };
}
