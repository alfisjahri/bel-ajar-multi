export const TEACHER_DATA = {
  "AGUSTIN KRISTIANA": {
    "Bahasa Indonesia": ["7", "8A", "8B", "9A", "9B"]
  },
  "SEFTIA AGAFE": {
    "IPA": ["7", "8A", "8B", "9A", "9B"],
    "Koding & Kecerdasan Artifisial": ["7"]
  },
  "NURUL HUSNAWATI": {
    "Prakarya & Kewirausahaan": ["7", "8A", "8B", "9A", "9B"],
    "Matematika": ["9A", "9B"],
    "Informatika": ["7", "8A", "8B"]
  },
  "ALPINA": {
    "Bahasa Inggris": ["7", "8A", "8B", "9A", "9B"],
    "Mulok (Bahasa Daerah)": ["7", "9A", "9B"],
    "Agama Islam": ["8A", "8B"]
  },
  "VERRYDIANA BULAN": {
    "Pendidikan Pancasila": ["7", "8A", "8B", "9A", "9B"],
    "Agama Katolik": ["7", "9A", "9B"] // Wait, spreadsheet says "Agama Katolik: 7, 9A/B". So 7, 9A, 9B
  },
  "ILHAM TAUFIK": {
    "PJOK": ["7", "8A", "8B", "9A", "9B"],
    "Mulok (Olahraga Tradisional)": ["8A", "8B", "9A", "9B"],
    "Agama Islam": ["7", "9A", "9B"]
  },
  "TALIUS": {
    "Agama Kristen": ["8A", "8B", "9A", "9B"],
    "Informatika": ["9A", "9B"],
    "Mulok (Olahraga Tradisional)": ["7"]
  },
  "EMILIANA": {
    "IPS": ["7", "8A", "8B", "9A", "9B"],
    "Mulok (Bahasa Daerah)": ["8A", "8B"],
    "Agama Katolik": ["8A", "8B"]
  },
  "ALFI SYAHRI": {
    "Matematika": ["7", "8A", "8B"],
    "Koding & Kecerdasan Artifisial": ["8A", "8B", "9A", "9B"]
  }
};

export const WALI_KELAS_DATA = {
  "AGUSTIN KRISTIANA": "8B",
  "ALPINA": "9B",
  "ILHAM TAUFIK": "9A",
  "EMILIANA": "7",
  "ALFI SYAHRI": "8A"
};


export const getTeacherData = (fullName) => {
  if (!fullName) return null;
  const upperName = fullName.toUpperCase();
  for (const [key, data] of Object.entries(TEACHER_DATA)) {
    if (upperName.includes(key)) {
      return data;
    }
  }
  // Default to something if no match? 
  // We can return ALFI SYAHRI by default or just return null
  return null;
  return null;
};

export const getWaliClass = (fullName) => {
  if (!fullName) return null;
  const upperName = fullName.toUpperCase();
  for (const [key, waliClass] of Object.entries(WALI_KELAS_DATA)) {
    if (upperName.includes(key)) {
      return waliClass;
    }
  }
  return null; // Not a Wali Kelas
};
