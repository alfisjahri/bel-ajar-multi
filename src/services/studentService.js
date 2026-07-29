import { supabase } from '../supabaseClient';
import { Toast, Swal } from './utils';

export const fetchStudentsByModeService = async ({ isDemo, jurnalMode, selectedClass, waliClass, setFetchingStudents, setStudents, initAttendance }) => {
  setFetchingStudents(true);
  if (isDemo) {
    const mockData = [
      { id: '1', name: 'AFIFATUL AZIZAH', class_name: '8A', group_name: 'Kelompok 5' },
      { id: '2', name: 'ENDO PRATAMA', class_name: '8B', group_name: 'Kelompok 5' },
      { id: '3', name: 'FRISKA NUSI', class_name: '7', group_name: 'Kelompok 5' }
    ];
    setStudents(mockData);
    initAttendance(mockData);
    setFetchingStudents(false);
    return;
  }

  let query = supabase.from('students').select('*').order('name', { ascending: true });

  if (jurnalMode === 'mapel') {
    query = query.eq('class_name', selectedClass);
  } else if (jurnalMode === 'wali_kelas') {
    query = query.eq('class_name', waliClass);
  } else if (jurnalMode === 'guru_wali') {
    query = query.eq('group_name', 'Kelompok 5');
  }

  const { data, error } = await query;

  if (!error && data) {
    setStudents(data);
    initAttendance(data);
  } else {
    setStudents([]);
  }
  setFetchingStudents(false);
};

export const fetchAllStudentsService = async ({ isDemo, setAllStudents, setAttendanceRecordsAll }) => {
  if (isDemo) return;
  const { data: stData } = await supabase.from('students').select('*').order('name', { ascending: true });
  if (stData) setAllStudents(stData);

  const { data: attData } = await supabase.from('attendance').select('student_id, status, date');
  if (attData) setAttendanceRecordsAll(attData);
};

export const handleToggleKelompok5Service = async ({ student, fetchAllStudents, fetchStudentsByMode }) => {
  const isCurrentlyK5 = student.group_name === 'Kelompok 5';
  const newGroup = isCurrentlyK5 ? null : 'Kelompok 5';

  const { error } = await supabase
    .from('students')
    .update({ group_name: newGroup })
    .eq('id', student.id);

  if (!error) {
    Toast.fire({ 
      icon: 'success', 
      title: isCurrentlyK5 ? `${student.name} dilepas dari Kelompok 5` : `${student.name} ditandai Kelompok 5` 
    });
    fetchAllStudents();
    fetchStudentsByMode();
  } else {
    Toast.fire({ icon: 'error', title: 'Gagal update kelompok' });
  }
};

export const handleAddStudentService = async ({ e, newStudent, setNewStudent, setIsAddingStudent, fetchAllStudents, fetchStudentsByMode }) => {
  e.preventDefault();
  if (!newStudent.name.trim()) return;

  const { error } = await supabase.from('students').insert([
    { name: newStudent.name.toUpperCase(), class_name: newStudent.class_name }
  ]);

  if (!error) {
    Toast.fire({ icon: 'success', title: 'Siswa berhasil ditambahkan!' });
    setNewStudent({ name: '', class_name: '7' });
    setIsAddingStudent(false);
    fetchAllStudents();
    fetchStudentsByMode();
  } else {
    Toast.fire({ icon: 'error', title: 'Gagal tambah siswa' });
  }
};

export const handleUpdateStudentService = async ({ id, editingStudent, setEditingStudent, fetchAllStudents, fetchStudentsByMode }) => {
  const { error } = await supabase.from('students').update({
    name: editingStudent.name.toUpperCase(),
    class_name: editingStudent.class_name
  }).eq('id', id);

  if (!error) {
    Toast.fire({ icon: 'success', title: 'Siswa diperbarui!' });
    setEditingStudent(null);
    fetchAllStudents();
    fetchStudentsByMode();
  } else {
    Toast.fire({ icon: 'error', title: 'Gagal update siswa' });
  }
};

export const handleDeleteStudentService = ({ id, name, fetchAllStudents, fetchStudentsByMode }) => {
  Swal.fire({
    title: `Hapus ${name}?`,
    text: 'Data siswa ini akan dihapus dari sistem.',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#ef4444',
    cancelButtonColor: '#64748b',
    confirmButtonText: 'Ya, Hapus'
  }).then(async (result) => {
    if (result.isConfirmed) {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (!error) {
        Toast.fire({ icon: 'success', title: 'Siswa terhapus' });
        fetchAllStudents();
        fetchStudentsByMode();
      }
    }
  });
};

export const handleShowAbsenceDetailsService = async ({ student, setFetchingStudents, setStudentAbsenceDetails }) => {
  setFetchingStudents(true);
  const { data: absList } = await supabase
    .from('attendance')
    .select('journal_id, status, date')
    .eq('student_id', student.id)
    .neq('status', 'Hadir')
    .order('date', { ascending: false });

  if (!absList || absList.length === 0) {
    Toast.fire({ icon: 'info', title: `${student.name} tidak memiliki riwayat ketidakhadiran.` });
    setFetchingStudents(false);
    return;
  }

  const details = [];
  for (const item of absList) {
    const { data: jData } = await supabase.from('journals').select('*').eq('id', item.journal_id).maybeSingle();
    if (jData) {
      let parsedPhotos = jData.photos || [];
      if (typeof parsedPhotos === 'string') {
        try { parsedPhotos = JSON.parse(parsedPhotos); } catch(e) { parsedPhotos = [parsedPhotos]; }
      }

      details.push({
        date: item.date,
        status: item.status,
        subject: jData.subject,
        material: jData.material,
        photos: Array.isArray(parsedPhotos) ? parsedPhotos : []
      });
    }
  }

  setStudentAbsenceDetails({ student, details });
  setFetchingStudents(false);
};
