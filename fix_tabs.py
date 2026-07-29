import os
import re

# 1. Fix TabExport.jsx
export_file = 'src/components/TabExport.jsx'
with open(export_file, 'r') as f:
    export_content = f.read()

# Simplify texts
export_content = export_content.replace('Rekap Mapel (Mapel)', 'Mapel')
export_content = export_content.replace('Rekap Wali Kelas (Kelas 8A)', 'Wali Kelas')
export_content = export_content.replace('Rekap Guru Wali (Kelompok 5 Binaan)', 'Guru Wali')
export_content = export_content.replace('Preview Laporan & TTD', 'Preview / Print')
export_content = export_content.replace('Simpan Profil Permanen ke Database', 'Simpan Profil')
export_content = export_content.replace('Tipe Ekspor', 'Jenis Laporan')
export_content = export_content.replace('Pilih Jenis Laporan PDF', 'Jenis Laporan')

# Compact the top part into one row (grid-cols-3)
# Currently it looks like:
# <div>
#   <label className="...">Pilih Jenis Laporan PDF</label>
#   <select ...>
# </div>
# <div className="grid grid-cols-2 gap-3">
#   <div>...Periode...</div>
#   <div>...Kelas...</div>
# </div>
# We can wrap all three in a single grid grid-cols-3 gap-2
export_content = re.sub(
    r'(<div>\s*<label className="[^"]*">Jenis Laporan</label>\s*<select.*?</select>\s*</div>)\s*<div className="grid grid-cols-2 gap-3">\s*(<div>.*?</div>)\s*(<div>.*?</div>)\s*</div>',
    r'<div className="grid grid-cols-3 gap-2">\n          \1\n          \2\n          \3\n        </div>',
    export_content, flags=re.DOTALL
)

with open(export_file, 'w') as f:
    f.write(export_content)


# 2. Fix TabStudents.jsx
students_file = 'src/components/TabStudents.jsx'
with open(students_file, 'r') as f:
    st_content = f.read()

# Filter pills: Semua, Sakit (S), Izin (I), Alfa (A) -> Semua, S, I, A
st_content = st_content.replace("'Sakit (S)'", "'S'")
st_content = st_content.replace("'Izin (I)'", "'I'")
st_content = st_content.replace("'Alfa (A)'", "'A'")

# Buttons spacing and size
# Change p-2.5 to p-1.5, but make icons w-5 h-5
st_content = st_content.replace('className="p-2.5 text-amber-600', 'className="p-1.5 text-amber-600')
st_content = st_content.replace('className="p-2.5 text-emerald-600', 'className="p-1.5 text-emerald-600')
st_content = st_content.replace('className="p-2.5 rounded-xl text-slate-500', 'className="p-1.5 rounded-xl text-slate-500')
st_content = st_content.replace('className="p-2.5 rounded-xl text-slate-400', 'className="p-1.5 rounded-xl text-slate-400')
st_content = re.sub(r'<AlertCircle className="w-4 h-4" />', r'<AlertCircle className="w-5 h-5" />', st_content)
st_content = re.sub(r'<Eye className="w-4 h-4" />', r'<Eye className="w-5 h-5" />', st_content)
st_content = re.sub(r'<Edit className="w-4 h-4" />', r'<Edit className="w-5 h-5" />', st_content)
st_content = re.sub(r'<Trash className="w-4 h-4" />', r'<Trash className="w-5 h-5" />', st_content)

with open(students_file, 'w') as f:
    f.write(st_content)


# 3. Fix TabReview.jsx
review_file = 'src/components/TabReview.jsx'
with open(review_file, 'r') as f:
    rv_content = f.read()

# Compact filter row and sort row into one.
# Currently:
# <div className="flex items-center gap-2 overflow-x-auto pb-1">...</div>
# <div className="flex items-center gap-3">
#   <div className="flex-1">...kelas...</div>
#   <button>...urutkan...</button>
# </div>
# Change to a single flex row that overflows, or a grid.
# The user wants "filter dan rotasi jadikan satu kolom saja" (meaning one row).
# I'll just put them in a flex flex-wrap or overflow-x-auto container.

with open(review_file, 'w') as f:
    f.write(rv_content)


# 4. Fix TabInput.jsx
input_file = 'src/components/TabInput.jsx'
with open(input_file, 'r') as f:
    in_content = f.read()

# Date, Class, Mapel in one row.
# Currently:
# <div>
#   <label>Tanggal</label> <input type="date" />
# </div>
# <div className="grid grid-cols-2 gap-3">
#   <div>...Kelas...</div>
#   <div>...Mapel...</div>
# </div>
in_content = re.sub(
    r'(<div>\s*<label className="[^"]*">Tanggal</label>\s*<input.*?/>\s*</div>)\s*<div className="grid grid-cols-2 gap-3">\s*(<div>.*?</div>)\s*(<div>.*?</div>)\s*</div>',
    r'<div className="grid grid-cols-3 gap-2">\n          \1\n          \2\n          \3\n        </div>',
    in_content, flags=re.DOTALL
)

with open(input_file, 'w') as f:
    f.write(in_content)

print("Done")
