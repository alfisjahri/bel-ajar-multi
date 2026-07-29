import { supabase } from '../supabaseClient';
import { Toast, uploadImageToCloudinary } from './utils';

export const fetchProfileService = async (user, setProfile) => {
  try {
    let { data } = await supabase.from('profiles').select('*').eq('id', user.id).maybeSingle();
    if (data) {
      setProfile(data);
      if (data.full_name) localStorage.setItem('teacher_name', data.full_name);
      if (data.nip) localStorage.setItem('teacher_nip', data.nip);
      if (data.signature_url) localStorage.setItem('teacher_sig', data.signature_url);
      if (data.guru_wali_group) localStorage.setItem('guru_wali_group', data.guru_wali_group);
    } else {
      // Auto-detect nama dari email (sebelum tanda @)
      const emailName = user.email ? user.email.split('@')[0].toUpperCase() : 'GURU BARU';
      const autoProfile = { full_name: emailName, nip: '', signature_url: '', guru_wali_group: '' };
      setProfile(autoProfile);
      localStorage.setItem('teacher_name', emailName);
      localStorage.removeItem('teacher_nip');
      localStorage.removeItem('teacher_sig');
      localStorage.removeItem('guru_wali_group');
    }
  } catch (err) {
    console.error('Gagal fetch profil:', err);
  }
};

export const handleSaveProfileService = async ({ session, profile, setLoading }) => {
  if (!session) return Toast.fire({ icon: 'error', title: 'Harus login dulu!' });
  setLoading(true);

  const updates = {
    id: session.user.id,
    email: session.user.email,
    full_name: profile.full_name,
    nip: profile.nip,
    signature_url: profile.signature_url,
    guru_wali_group: profile.guru_wali_group || null,
    updated_at: new Date()
  };

  localStorage.setItem('teacher_name', profile.full_name);
  localStorage.setItem('teacher_nip', profile.nip);
  if (profile.signature_url) localStorage.setItem('teacher_sig', profile.signature_url);
  if (profile.guru_wali_group) localStorage.setItem('guru_wali_group', profile.guru_wali_group);
  else localStorage.removeItem('guru_wali_group');

  const { error } = await supabase.from('profiles').upsert(updates);
  
  let authError = null;
  if (profile.new_password && profile.new_password.trim() !== '') {
    const { error: passError } = await supabase.auth.updateUser({ password: profile.new_password });
    authError = passError;
  }

  setLoading(false);

  if (!error && !authError) {
    Toast.fire({ icon: 'success', title: 'Profil, NIP & Pengaturan Tersimpan!' });
    // Reset temporary password field
    profile.new_password = '';
  } else {
    let errMsg = '';
    if (error) errMsg += error.message + ' ';
    if (authError) {
      if (authError.message.includes('Auth session missing')) {
        errMsg += 'Demi keamanan, silakan Logout dan Login kembali untuk mengubah password.';
      } else {
        errMsg += 'Password gagal diubah: ' + authError.message;
      }
    }
    Swal.fire({ icon: 'error', title: 'Gagal simpan', text: errMsg });
  }
};

export const handleSignatureUploadService = (e, setProfile) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onloadend = async () => {
    const base64String = reader.result;
    
    Toast.fire({ icon: 'info', title: 'Mengupload TTD ke Cloudinary...' });
    try {
      const cloudinaryUrl = await uploadImageToCloudinary(base64String);
      setProfile(prev => ({ ...prev, signature_url: cloudinaryUrl }));
      localStorage.setItem('teacher_sig', cloudinaryUrl);
      Toast.fire({ icon: 'success', title: 'Gambar TTD berhasil dimuat dan diupload!' });
    } catch (err) {
      Toast.fire({ icon: 'error', title: 'Gagal mengupload TTD ke Cloudinary.' });
    }
  };
  reader.readAsDataURL(file);
};
