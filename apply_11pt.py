import os
import re

files_to_process = [
    'src/components/LoginScreen.jsx',
    'src/components/TabInput.jsx',
    'src/components/TabReview.jsx',
    'src/components/TabStudents.jsx',
    'src/components/TabExport.jsx',
    'src/components/Modals.jsx',
    'src/components/BottomNavigation.jsx'
]

# Text string replacements
text_replacements = [
    ("Jurnal Mengajar Digital SMPN 1 Damai", "Jurnal Mengajar"),
    ("Sisa percobaan login:", "Sisa Login:"),
    ("Masuk Aplikasi", "Masuk"),
    ("Masuk Mode Demo (Tanpa Login)", "Mode Demo"),
    ("Tanggal Mengajar (WITA)", "Tanggal"),
    ("Tanggal Absen Pagi (WITA)", "Tanggal"),
    ("Mata Pelajaran", "Mapel"),
    ("Rombel Binaan Wali Kelas:", "Rombel:"),
    ("Kelompok Binaan Guru Wali:", "Kelompok:"),
    ("Belum ada siswa yang ditandai Kelompok 5.", "Belum Ada Siswa."),
    ("+ Tandai Siswa Kelompok 5 di Tab Siswa", "+ Tandai Siswa"),
    ("Materi / Ringkasan Mengajar", "Materi"),
    ("Catatan Pembinaan / Kasus Siswa", "Catatan"),
    ("Tuliskan materi pembelajaran hari ini...", "Ketik materi..."),
    ("Tuliskan catatan khusus, penanganan siswa, atau kejadian hari ini...", "Ketik catatan..."),
    ("Foto Dokumentasi Kegiatan / Bukti Surat", "Dokumentasi"),
    ("Foto Dokumentasi Pembelajaran", "Dokumentasi"),
    ("Ambil Foto", "Kamera"),
    ("Pilih Galeri", "Galeri"),
    ("Simpan Presensi, Catatan & Foto", "Simpan Data"),
    ("Menyimpan Data...", "Menyimpan..."),
    ("Riwayat Jurnal & Presensi Bel Ajar", "Riwayat Jurnal"),
    ("Cari materi, catatan, atau kata kunci...", "Cari..."),
    ("Ganti Urutan Tanggal", "Urutkan"),
    ("Menampilkan ", ""),
    (" data jurnal", " Jurnal"),
    ("Tidak ada jurnal yang cocok dengan filter / pencarian.", "Tidak Ditemukan."),
    ("Edit Materi Ringkasan / Catatan", "Edit Materi"),
    ("Edit Presensi & Nilai Susulan Siswa", "Edit Presensi"),
    ("Simpan Semua Perubahan", "Simpan Perubahan"),
    ("Kelola Data Siswa", "Kelola Siswa"),
    ("Tambah Siswa Baru", "Tambah Siswa"),
    ("Nama Lengkap Siswa", "Nama Siswa"),
    ("Ketik nama atau kelas siswa...", "Cari Siswa..."),
    ("Siswa tidak ditemukan untuk filter ini.", "Tidak Ditemukan."),
    ("+ Kelompok 5", "+ K5"),
    ("Kelompok 5 (Lintas Kelas)", "Kelompok 5"),
    ("Ekspor Data & Laporan", "Ekspor Laporan"),
    ("Tipe Ekspor (Wali Kelas / Guru Mapel / Personal)", "Tipe Ekspor"),
    ("Cetak Laporan Lengkap (PDF)", "Cetak PDF"),
    ("Riwayat Ketertinggalan & Absen", "Riwayat Absen"),
    ("Cetak / Save as PDF", "Cetak PDF")
]

for filepath in files_to_process:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()

    # Apply text replacements
    for old_text, new_text in text_replacements:
        content = content.replace(old_text, new_text)

    # Class replacements
    # We replace text-xs, text-sm, text-base, text-lg with text-[11pt]
    content = re.sub(r'\btext-xs\b', 'text-[11pt]', content)
    content = re.sub(r'\btext-sm\b', 'text-[11pt]', content)
    content = re.sub(r'\btext-base\b', 'text-[11pt]', content)
    content = re.sub(r'\btext-lg\b', 'text-[12pt]', content)
    content = re.sub(r'\btext-2xl\b', 'text-[14pt]', content)
    
    # Compress bulky paddings slightly because font is now uniform 11pt
    content = re.sub(r'\bp-4\b', 'p-3', content)
    content = re.sub(r'\bpy-4\b', 'py-3', content)
    content = re.sub(r'\bp-3\.5\b', 'p-2.5', content)
    content = re.sub(r'\bpy-2\.5\b', 'py-2', content)

    # Make rounded-2xl into rounded-xl and rounded-3xl into rounded-2xl for less bulky shapes
    content = re.sub(r'\brounded-3xl\b', 'rounded-2xl', content)
    content = re.sub(r'\brounded-2xl\b', 'rounded-xl', content)

    with open(filepath, 'w') as f:
        f.write(content)

print("Applied 11pt and text shortening!")
