import React from 'react';
import { Plus, Search, Filter, Save, X, Star, AlertCircle, Eye, Edit, Trash } from 'lucide-react';

const TabStudents = ({
  allStudents, searchStudentQuery, setSearchStudentQuery, attendanceFilter, setAttendanceFilter,
  attendanceRecordsAll, isAddingStudent, setIsAddingStudent, newStudent, setNewStudent,
  handleAddStudent, editingStudent, setEditingStudent, handleUpdateStudent, handleToggleKelompok5,
  handleShowAbsenceDetails, handleExportIndividualPDF, handleDeleteStudent
}) => {
  const filteredAllStudents = allStudents.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(searchStudentQuery.toLowerCase()) ||
                          s.class_name.toLowerCase().includes(searchStudentQuery.toLowerCase());

    if (attendanceFilter === 'ALL') return matchesSearch;

    const hasStatus = attendanceRecordsAll.some(a => a.student_id === s.id && a.status === attendanceFilter);
    return matchesSearch && hasStatus;
  });

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-slate-800 dark:text-slate-100 text-[10.5pt]">Kelola Siswa</h3>
          <button 
            onClick={() => setIsAddingStudent(!isAddingStudent)}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl text-[10.5pt] font-bold flex items-center space-x-1"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Siswa</span>
          </button>
        </div>

        {isAddingStudent && (
          <form onSubmit={handleAddStudent} className="p-3 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl space-y-2">
            <p className="text-[10.5pt] font-semibold text-slate-700 dark:text-slate-200">Tambah Siswa</p>
            <input 
              type="text" placeholder="Nama Siswa"
              className="w-full p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-[10.5pt] font-medium"
              value={newStudent.name} onChange={e => setNewStudent({...newStudent, name: e.target.value})}
              required
            />
            <div className="flex gap-2">
              <select 
                className="p-2 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-lg text-[10.5pt] font-bold flex-1"
                value={newStudent.class_name} onChange={e => setNewStudent({...newStudent, class_name: e.target.value})}
              >
                <option value="7">Kelas 7</option>
                <option value="8A">Kelas 8A</option>
                <option value="8B">Kelas 8B</option>
                <option value="9A">Kelas 9A</option>
                <option value="9B">Kelas 9B</option>
              </select>
              <button type="submit" className="bg-emerald-600 text-white px-4 text-[10.5pt] font-bold rounded-lg">Simpan</button>
              <button type="button" onClick={() => setIsAddingStudent(false)} className="bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200 px-3 text-[10.5pt] font-bold rounded-lg">Batal</button>
            </div>
          </form>
        )}

        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400 dark:text-slate-500" />
          <input 
            type="text" placeholder="Cari Siswa..." 
            className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-700 rounded-xl text-[10.5pt] font-medium"
            value={searchStudentQuery} onChange={e => setSearchStudentQuery(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-1.5 pt-1 overflow-x-auto">
          <span className="text-[10.5pt] font-bold text-slate-400 dark:text-slate-500 mr-1 flex items-center gap-0.5">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {[
            { key: 'ALL', label: 'Semua' },
            { key: 'Sakit', label: 'S' },
            { key: 'Izin', label: 'I' },
            { key: 'Alfa', label: 'A' }
          ].map(chip => (
            <button 
              key={chip.key}
              onClick={() => setAttendanceFilter(chip.key)}
              className={`px-3 py-1.5 rounded-xl text-[10.5pt] font-medium transition-all ${
                attendanceFilter === chip.key 
                  ? 'bg-blue-600 text-white shadow' 
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:bg-slate-700'
              }`}
            >
              {chip.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-[10.5pt] text-slate-500 dark:text-slate-400 dark:text-slate-500 font-bold px-1">Total Siswa: {filteredAllStudents.length}</p>
        {filteredAllStudents.length === 0 ? (
          <p className="text-[10.5pt] text-center text-slate-400 dark:text-slate-500 py-6 bg-white dark:bg-slate-800 rounded-xl border">Tidak Ditemukan.</p>
        ) : (
          filteredAllStudents.map(student => {
            const isK5 = student.group_name === 'Kelompok 5';

            return (
              <div key={student.id} className="bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm flex items-center justify-between gap-2">
                {editingStudent?.id === student.id ? (
                  <div className="flex-1 flex gap-2">
                    <input 
                      type="text" 
                      className="p-1.5 border rounded-lg text-[10.5pt] font-medium flex-1"
                      value={editingStudent.name} onChange={e => setEditingStudent({...editingStudent, name: e.target.value})}
                    />
                    <select 
                      className="p-1.5 border rounded-lg text-[10.5pt] font-bold"
                      value={editingStudent.class_name} onChange={e => setEditingStudent({...editingStudent, class_name: e.target.value})}
                    >
                      <option value="7">7</option>
                      <option value="8A">8A</option>
                      <option value="8B">8B</option>
                      <option value="9A">9A</option>
                      <option value="9B">9B</option>
                    </select>
                    <button onClick={() => handleUpdateStudent(student.id)} className="text-emerald-600 p-1"><Save className="w-4 h-4" /></button>
                    <button onClick={() => setEditingStudent(null)} className="text-slate-400 dark:text-slate-500 p-1"><X className="w-4 h-4" /></button>
                  </div>
                ) : (
                  <>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[10.5pt] text-slate-800 dark:text-slate-100 truncate">{student.name}</p>
                      <div className="flex items-center space-x-2 mt-1.5">
                        <span className="text-[10.5pt] font-bold bg-blue-50 text-blue-600 px-2.5 py-1 rounded-lg">
                          Kelas {student.class_name}
                        </span>

                        <button 
                          onClick={() => handleToggleKelompok5(student)}
                          className={`text-[10.5pt] font-bold px-2.5 py-1 rounded-lg flex items-center space-x-1 transition-all ${
                            isK5 
                              ? 'bg-amber-500 text-white shadow' 
                              : 'bg-slate-100 dark:bg-slate-900 text-slate-400 dark:text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700'
                          }`}
                          title="Klik untuk tambah/lepas dari Binaan Kelompok 5"
                        >
                          <Star className="w-3 h-3 fill-current" />
                          <span>{isK5 ? 'Kelompok 5' : '+ K5'}</span>
                        </button>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => handleShowAbsenceDetails(student)}
                        title="Materi Tertinggal / Riwayat Absen"
                        className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-xl transition-all"
                      >
                        <AlertCircle className="w-5 h-5" />
                      </button>

                      <button 
                        onClick={() => handleExportIndividualPDF(student)} 
                        title="Preview PDF Siswa"
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                      >
                        <Eye className="w-5 h-5" />
                      </button>

                      <button onClick={() => setEditingStudent(student)} className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 transition-all">
                        <Edit className="w-5 h-5" />
                      </button>

                      <button onClick={() => handleDeleteStudent(student.id, student.name)} className="p-1.5 rounded-xl text-slate-400 dark:text-slate-500 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-600 transition-all">
                        <Trash className="w-5 h-5" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TabStudents;
