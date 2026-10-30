import React, { useEffect, useState } from 'react';
import { resolveDisplayUrl } from '../services/utils';

// Gambar yang memahami format ganda selama transisi Cloudinary -> Storage:
// - value URL Cloudinary lama (http + 'cloudinary') -> dipakai langsung
// - value path Storage baru -> di-resolve ke signed URL 1 jam
// - value kosong / gagal resolve -> tidak merender apa-apa (bukan ikon rusak)
// onClick menerima src yang sudah ter-resolve (untuk lightbox).
const ResolvedImage = ({ value, onClick, ...imgProps }) => {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSrc('');
    if (!value) return;
    resolveDisplayUrl(value).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => { cancelled = true; };
  }, [value]);

  if (!src) return null;
  return (
    <img
      src={src}
      onClick={onClick ? () => onClick(src) : undefined}
      {...imgProps}
    />
  );
};

export default ResolvedImage;
