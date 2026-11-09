import React, { useEffect, useState } from 'react';
import { resolveDisplayUrl } from '../services/utils';

// Gambar yang memahami sumber file PocketBase:
// - value URL http/blob:/data: -> dipakai langsung
// - value nama file PocketBase -> di-resolve ke URL file bertoken via record
//   (record = objek record PocketBase pemilik file, punya id + collectionName)
// - value kosong / gagal resolve -> tidak merender apa-apa (bukan ikon rusak)
// onClick menerima src yang sudah ter-resolve (untuk lightbox).
const ResolvedImage = ({ value, record, onClick, ...imgProps }) => {
  const [src, setSrc] = useState('');

  useEffect(() => {
    let cancelled = false;
    setSrc('');
    if (!value) return;
    resolveDisplayUrl(value, record).then((url) => {
      if (!cancelled) setSrc(url);
    });
    return () => { cancelled = true; };
  }, [value, record]);

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
