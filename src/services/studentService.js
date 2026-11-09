import { pb, eq } from '../pbClient';
import { Toast, Swal } from './utils';

export const fetchStudentsByModeService = async ({ isDemo, jurnalMode, selectedClass, waliClass, guruWaliGroup, profile, setFetchingStudents, setStudents, initAttendance }) => {
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

  let filter = '';
  if (jurnalMode === 'mapel') {
    filter = eq('class_name', selectedClass);
  } else if (jurnalMode === 'wali_kelas') {
    filter = eq('class_name', waliClass);
  } else if (jurnalMode === 'guru_wali') {
    if (!profile?.full_name) {
      setStudents([]);
      setFetchingStudents(false);
      return;
    }
    filter = eq('group_name', profile.full_name);
  }

  try {
    const data = await pb.collection('students').getFullList({ filter, sort: 'name' });
    setStudents(data);
    initAttendance(data);
  } catch (err) {
    console.error('Gagal fetch siswa:', err);
    setStudents([]);
  }
  setFetchingStudents(false);
};

export const fetchAllStudentsService = async ({ isDemo, setAllStudents, setAttendanceRecordsAll }) => {
  if (isDemo) return;
  try {
    const stData = await pb.collection('students').getFullList({ sort: 'name' });
    if (stData) setAllStudents(stData);
  } catch (err) {
    console.error('Gagal fetch semua siswa:', err);
  }
  try {
    const attData = await pb.collection('attendance').getFullList({ fields: 'student,status,date' });
    if (attData) setAttendanceRecordsAll(attData);
  } catch (err) {
    console.error('Gagal fetch presensi:', err);
  }
};

export const handleToggleKelompok5Service = async ({ student, profile, guruWaliGroup, fetchAllStudents, fetchStudentsByMode }) => {
  if (!guruWaliGroup) {
    return Toast.fire({ icon: 'error', title: 'Silakan isi nama Kelompok Binaan (Guru Wali) di profil atau tab input.' });
  }

  const isFavoritedByMe = student.group_name === profile?.full_name;

  if (student.group_name && !isFavoritedByMe) {
    const result = await Swal.fire({
      title: 'Sudah Dibina Guru Lain',
      text: `${student.name} saat ini dibina oleh ${student.group_name}. Pindahkan ke binaan Anda?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Ya, Pindahkan',
      cancelButtonText: 'Batal'
    });
    if (!result.isConfirmed) return;
  }

  const newGroup = isFavoritedByMe ? null : profile?.full_name;

  try {
    await pb.collection('students').update(student.id, { group_name: newGroup });
    Toast.fire({
      icon: 'success',
      title: isFavoritedByMe ? `${student.name} dilepas dari binaan Anda` : `${student.name} ditambahkan ke binaan Anda`
    });
    fetchAllStudents();
    fetchStudentsByMode();
  } catch (err) {
    Toast.fire({ icon: 'error', title: 'Gagal mengubah status binaan' });
  }
};

export const handleAddStudentService = async ({ e, newStudent, setNewStudent, setIsAddingStudent, fetchAllStudents, fetchStudentsByMode }) => {
  e.preventDefault();
  if (!newStudent.name.trim()) return;

  try {
    await pb.collection('students').create(
      { name: newStudent.name.toUpperCase(), class_name: newStudent.class_name }
    );
    Toast.fire({ icon: 'success', title: 'Siswa berhasil ditambahkan!' });
    setNewStudent({ name: '', class_name: '7' });
    setIsAddingStudent(false);
    fetchAllStudents();
    fetchStudentsByMode();
  } catch (err) {
    Toast.fire({ icon: 'error', title: 'Gagal tambah siswa' });
  }
};

export const handleUpdateStudentService = async ({ id, editingStudent, setEditingStudent, fetchAllStudents, fetchStudentsByMode }) => {
  try {
    await pb.collection('students').update(id, {
      name: editingStudent.name.toUpperCase(),
      class_name: editingStudent.class_name
    });
    Toast.fire({ icon: 'success', title: 'Siswa diperbarui!' });
    setEditingStudent(null);
    fetchAllStudents();
    fetchStudentsByMode();
  } catch (err) {
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
      try {
        await pb.collection('students').delete(id);
        Toast.fire({ icon: 'success', title: 'Siswa terhapus' });
        fetchAllStudents();
        fetchStudentsByMode();
      } catch (err) {
        Toast.fire({ icon: 'error', title: 'Gagal menghapus siswa' });
      }
    }
  });
};

export const handleShowAbsenceDetailsService = async ({ student, setFetchingStudents, setStudentAbsenceDetails }) => {
  setFetchingStudents(true);
  let absList = [];
  try {
    absList = await pb.collection('attendance').getFullList({
      filter: `${eq('student', student.id)} && status != "Hadir"`,
      sort: '-date',
      fields: 'id,journal,status,date',
    });
  } catch (err) {
    console.error('Gagal fetch ketidakhadiran:', err);
  }

  if (!absList || absList.length === 0) {
    Toast.fire({ icon: 'info', title: `${student.name} tidak memiliki riwayat ketidakhadiran.` });
    setFetchingStudents(false);
    return;
  }

  const details = [];
  for (const item of absList) {
    let jData = null;
    try {
      jData = await pb.collection('journals').getOne(item.journal);
    } catch (err) {
      jData = null;
    }
    if (jData) {
      let parsedPhotos = jData.photos || [];
      if (typeof parsedPhotos === 'string') {
        try { parsedPhotos = JSON.parse(parsedPhotos); } catch (e) { parsedPhotos = [parsedPhotos]; }
      }

      details.push({
        journalId: jData.id,
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
