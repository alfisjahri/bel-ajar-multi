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
    } else {
      // Auto-detect nama dari email (sebelum tanda @)
      const emailName = user.email ? user.email.split('@')[0].toUpperCase() : 'GURU BARU';
      const autoProfile = { full_name: emailName, nip: '', signature_url: '' };
      setProfile(autoProfile);
      localStorage.setItem('teacher_name', emailName);
      localStorage.removeItem('teacher_nip');
      localStorage.removeItem('teacher_sig');
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
    full_name: profile.full_name,
    nip: profile.nip,
    signature_url: profile.signature_url,
    updated_at: new Date()
  };

  localStorage.setItem('teacher_name', profile.full_name);
  localStorage.setItem('teacher_nip', profile.nip);
  if (profile.signature_url) localStorage.setItem('teacher_sig', profile.signature_url);

  const { error } = await supabase.from('profiles').upsert(updates);
  setLoading(false);

  if (!error) {
    Toast.fire({ icon: 'success', title: 'Profil & NIP Tersimpan!' });
  } else {
    Toast.fire({ icon: 'error', title: 'Gagal simpan: ' + error.message });
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
