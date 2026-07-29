import { supabase } from '../supabaseClient';
import { Toast, Swal } from './utils';

export const handleLoginService = async ({ email, password, loginAttempts, setLoginAttempts, lockoutUntil, setLockoutUntil }) => {
  if (lockoutUntil) {
    const lockTime = new Date(lockoutUntil).getTime();
    const now = new Date().getTime();
    if (now < lockTime) {
      const remainingHours = Math.ceil((lockTime - now) / (1000 * 60 * 60));
      return Toast.fire({ icon: 'error', title: `Akses diblokir! Coba lagi ${remainingHours} jam.` });
    } else {
      localStorage.removeItem('lockout_until');
      localStorage.setItem('login_attempts', '0');
      setLockoutUntil(null);
      setLoginAttempts(0);
    }
  }

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const newAttempts = loginAttempts + 1;
    setLoginAttempts(newAttempts);
    localStorage.setItem('login_attempts', newAttempts.toString());

    if (newAttempts >= 3) {
      const lockoutTime = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
      localStorage.setItem('lockout_until', lockoutTime);
      setLockoutUntil(lockoutTime);
      Swal.fire({
        icon: 'error',
        title: 'Akses Diblokir 24 Jam',
        text: 'Login gagal 3 kali berturut-turut untuk keamanan.'
      });
    } else {
      Toast.fire({ icon: 'error', title: `Gagal Login: ${error.message} (Sisa ${3 - newAttempts}x)` });
    }
  } else {
    localStorage.removeItem('login_attempts');
    setLoginAttempts(0);
    Toast.fire({ icon: 'success', title: 'Berhasil Login!' });
  }
};

export const handleLogoutService = (setIsDemo) => {
  Swal.fire({
    title: 'Keluar Aplikasi?',
    text: 'Kamu akan keluar dari akun Bel Ajar.',
    icon: 'question',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Keluar',
    cancelButtonText: 'Batal'
  }).then((res) => {
    if (res.isConfirmed) {
      supabase.auth.signOut();
      localStorage.removeItem('teacher_name');
      localStorage.removeItem('teacher_nip');
      localStorage.removeItem('teacher_sig');
      localStorage.removeItem('guru_wali_group');
      setIsDemo(false);
      Toast.fire({ icon: 'success', title: 'Berhasil Keluar' }).then(() => {
        window.location.reload();
      });
    }
  });
};
