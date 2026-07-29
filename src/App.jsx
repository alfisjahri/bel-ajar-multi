import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { getWitaDateString } from './services/utils';

// Import Services
import { handleLoginService, handleLogoutService } from './services/authService';
import { fetchProfileService, handleSaveProfileService, handleSignatureUploadService } from './services/profileService';
import { 
  fetchStudentsByModeService, fetchAllStudentsService, handleToggleKelompok5Service,
  handleAddStudentService, handleUpdateStudentService, handleDeleteStudentService,
  handleShowAbsenceDetailsService
} from './services/studentService';
import { 
  fetchJournalsHistoryService, handleStartEditJournalService, handleSaveFullJournalService,
  handleDeleteJournalService, handleSubmitJurnalService, handleTriggerExportPreviewService 
} from './services/journalService';

// Import Components
import LoginScreen from './components/LoginScreen';
import TabInput from './components/TabInput';
import TabReview from './components/TabReview';
import TabStudents from './components/TabStudents';
import TabExport from './components/TabExport';
import BottomNavigation from './components/BottomNavigation';
import { AbsenceDetailsModal, ImageLightboxModal, PrintPreviewModal } from './components/Modals';

function App() {
  const [session, setSession] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [activeTab, setActiveTab] = useState('input');

  // Mode Tab Jurnal: 'mapel' | 'wali_kelas' | 'guru_wali'
  const [jurnalMode, setJurnalMode] = useState('mapel');

  // Auth & Lockout State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginAttempts, setLoginAttempts] = useState(() => parseInt(localStorage.getItem('login_attempts') || '0'));
  const [lockoutUntil, setLockoutUntil] = useState(() => localStorage.getItem('lockout_until') || null);

  // Profil Guru
  const [profile, setProfile] = useState({ 
    full_name: localStorage.getItem('teacher_name') || 'NUR ALFI SYAHRI, S.P.', 
    nip: localStorage.getItem('teacher_nip') || '', 
    signature_url: localStorage.getItem('teacher_sig') || '' 
  });
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Form State Jurnal Input (DEFAULT GMT+8 WITA)
  const [journalDate, setStartDateJournal] = useState(getWitaDateString());
  const [selectedClass, setSelectedClass] = useState('7');
  const [selectedSubject, setSelectedSubject] = useState('Matematika');
  const [material, setMaterial] = useState('');
  const [photoFiles, setPhotos] = useState([]);
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [grades, setGrades] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetchingStudents, setFetchingStudents] = useState(false);

  // State Wali Kelas (8A) & Guru Wali (Kelompok 5)
  const [waliClass, setWaliClass] = useState('8A');
  const [waliNotes, setWaliNotes] = useState('');

  // Filter Rekap Laporan PDF
  const [reportType, setReportType] = useState('mapel'); 
  const [reportPeriod, setReportPeriod] = useState('bulanan');
  const [reportClass, setReportClass] = useState('7');
  const [reportSubject, setReportSubject] = useState('Matematika');
  const [startDate, setStartDateFilter] = useState(getWitaDateString());
  const [endDate, setEndDateFilter] = useState(getWitaDateString());

  // Modal State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [selectedImageModal, setSelectedImageModal] = useState(null);

  // Management Siswa & Filter Sortasi
  const [allStudents, setAllStudents] = useState([]);
  const [searchStudentQuery, setSearchStudentQuery] = useState('');
  const [attendanceFilter, setAttendanceFilter] = useState('ALL'); 
  const [attendanceRecordsAll, setAttendanceRecordsAll] = useState([]);
  const [isAddingStudent, setIsAddingStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', class_name: '7' });
  const [editingStudent, setEditingStudent] = useState(null);
  const [studentAbsenceDetails, setStudentAbsenceDetails] = useState(null);

  // History Jurnal (Tab Review) + FILTER / SEARCH STATE
  const [journalsHistory, setJournalsHistory] = useState([]);
  const [fetchingHistory, setFetchingHistory] = useState(false);
  const [editingJournal, setEditingJournal] = useState(null);
  const [editStudentsList, setEditStudentsList] = useState([]);
  const [savingEdit, setSavingEdit] = useState(false);

  const [reviewSearchQuery, setReviewSearchQuery] = useState('');
  const [reviewSubjectFilter, setReviewSubjectFilter] = useState('ALL'); 
  const [reviewClassFilter, setReviewClassFilter] = useState('ALL');     
  const [reviewSortOrder, setReviewSortOrder] = useState('desc');       

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });

  useEffect(() => {
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#0f172a'); // slate-900
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      if (metaThemeColor) metaThemeColor.setAttribute('content', '#f1f5f9'); // slate-100
    }
  }, [isDarkMode]);

  // LOGIKA MAPEL KETAT
  useEffect(() => {
    if (selectedClass === '7') setSelectedSubject('Matematika');
    else if (selectedClass === '9A' || selectedClass === '9B') setSelectedSubject('Koding');
    else if (selectedClass === '8A' || selectedClass === '8B') {
      if (selectedSubject !== 'Matematika' && selectedSubject !== 'Koding') setSelectedSubject('Matematika');
    }
  }, [selectedClass, selectedSubject]);

  useEffect(() => {
    if (reportClass === '7') setReportSubject('Matematika');
    else if (reportClass === '9A' || reportClass === '9B') setReportSubject('Koding');
    else if (reportClass === '8A' || reportClass === '8B') {
      if (reportSubject !== 'Matematika' && reportSubject !== 'Koding') setReportSubject('Matematika');
    }
  }, [reportClass, reportSubject]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchProfileService(session.user.id, setProfile);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchProfileService(session.user.id, setProfile);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (activeTab === 'edit') fetchJournalsHistoryService({ isDemo, setFetchingHistory, setJournalsHistory });
    if (activeTab === 'siswa') fetchAllStudentsService({ isDemo, setAllStudents, setAttendanceRecordsAll });
  }, [activeTab, isDemo]);

  const initAttendance = (studentList) => {
    const att = {};
    studentList.forEach(s => att[s.id] = 'Hadir');
    setAttendance(att);
  };

  useEffect(() => {
    fetchStudentsByModeService({ 
      isDemo, jurnalMode, selectedClass, waliClass, 
      setFetchingStudents, setStudents, initAttendance 
    });
  }, [jurnalMode, selectedClass, waliClass, isDemo]);

  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    const newFiles = [...photoFiles, ...files];
    setPhotos(newFiles);
    const newPreviews = newFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviews(newPreviews);
  };

  const handleRemovePhoto = (index) => {
    const updatedFiles = photoFiles.filter((_, i) => i !== index);
    setPhotos(updatedFiles);
    const updatedPreviews = updatedFiles.map(file => URL.createObjectURL(file));
    setPhotoPreviews(updatedPreviews);
  };

  const handleOpenPrintPreview = (title, subtitle, subjectRole, rows) => {
    setPreviewData({
      title,
      subtitle,
      subjectRole,
      isIndividual: false,
      rows,
      teacherName: profile.full_name || 'NUR ALFI SYAHRI, S.P.',
      teacherNip: profile.nip || '-------------------',
      signatureUrl: profile.signature_url
    });
    setShowPreviewModal(true);
  };

  const handleExportIndividualPDF = async (student) => {
    let studentAtt = [];
    if (!isDemo) {
      const { data } = await supabase
        .from('attendance')
        .select('status, date, notes')
        .eq('student_id', student.id)
        .order('date', { ascending: false });
      if (data) studentAtt = data;
    }

    const summary = { H: 0, S: 0, I: 0, A: 0 };
    studentAtt.forEach(a => {
      if (a.status === 'Hadir') summary.H++;
      else if (a.status === 'Sakit') summary.S++;
      else if (a.status === 'Izin') summary.I++;
      else if (a.status === 'Alfa') summary.A++;
    });

    const rows = studentAtt.map((a, idx) => ({
      no: idx + 1,
      name: new Date(a.date).toLocaleDateString('id-ID'),
      h: a.status === 'Hadir' ? 1 : 0,
      s: a.status === 'Sakit' ? 1 : 0,
      i: a.status === 'Izin' ? 1 : 0,
      a: a.status === 'Alfa' ? 1 : 0,
      grade: a.notes || '-'
    }));

    setPreviewData({
      title: `REKAP PRESENSI INDIVIDUAL SISWA`,
      subtitle: `Nama: ${student.name} | Kelas: ${student.class_name}`,
      subjectRole: `Guru / Pembimbing`,
      isIndividual: true,
      summary,
      rows,
      teacherName: profile.full_name || 'NUR ALFI SYAHRI, S.P.',
      teacherNip: profile.nip || '-------------------',
      signatureUrl: profile.signature_url
    });
    setShowPreviewModal(true);
  };


  if (!session && !isDemo) {
    return (
      <>
        <LoginScreen 
          email={email} setEmail={setEmail}
          password={password} setPassword={setPassword}
          loginAttempts={loginAttempts} lockoutUntil={lockoutUntil}
          handleLogin={(e) => {
            e.preventDefault();
            handleLoginService({ email, password, loginAttempts, setLoginAttempts, lockoutUntil, setLockoutUntil });
          }}
          setIsDemo={setIsDemo}
        />
        {/* Floating Dark Mode Toggle */}
        <button
          onClick={() => setIsDarkMode(!isDarkMode)}
          className="fixed top-4 right-4 z-50 p-2.5 rounded-full bg-slate-800 dark:bg-white text-white dark:text-slate-800 shadow-lg transition-all active:scale-95"
          title="Toggle Dark Mode"
        >
          {isDarkMode ? '☀️' : '🌙'}
        </button>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 pb-24 max-w-md mx-auto relative shadow-2xl border-x border-slate-200 dark:border-slate-700 font-sans pt-2">
      <div className="no-print p-4 space-y-4">
        {activeTab === 'input' && (
          <TabInput 
            jurnalMode={jurnalMode} setJurnalMode={setJurnalMode}
            journalDate={journalDate} setStartDateJournal={setStartDateJournal}
            selectedClass={selectedClass} setSelectedClass={setSelectedClass}
            selectedSubject={selectedSubject} setSelectedSubject={setSelectedSubject}
            waliClass={waliClass} setWaliClass={setWaliClass}
            waliNotes={waliNotes} setWaliNotes={setWaliNotes}
            material={material} setMaterial={setMaterial}
            photoFiles={photoFiles} photoPreviews={photoPreviews}
            handlePhotoSelect={handlePhotoSelect} handleRemovePhoto={handleRemovePhoto}
            students={students} fetchingStudents={fetchingStudents}
            attendance={attendance} setAttendance={setAttendance}
            grades={grades} setGrades={setGrades}
            loading={loading} setActiveTab={setActiveTab}
            handleSubmitJurnal={() => handleSubmitJurnalService({
              isDemo, jurnalMode, material, setLoading, photoFiles, journalDate, selectedClass,
              selectedSubject, waliClass, waliNotes, students, attendance, grades,
              setMaterial, setWaliNotes, setPhotos, setPhotoPreviews, setGrades, initAttendance
            })}
          />
        )}

        {activeTab === 'edit' && (
          <TabReview 
            journalsHistory={journalsHistory} fetchingHistory={fetchingHistory}
            fetchJournalsHistory={() => fetchJournalsHistoryService({ isDemo, setFetchingHistory, setJournalsHistory })}
            reviewSearchQuery={reviewSearchQuery} setReviewSearchQuery={setReviewSearchQuery}
            reviewSubjectFilter={reviewSubjectFilter} setReviewSubjectFilter={setReviewSubjectFilter}
            reviewClassFilter={reviewClassFilter} setReviewClassFilter={setReviewClassFilter}
            reviewSortOrder={reviewSortOrder} setReviewSortOrder={setReviewSortOrder}
            editingJournal={editingJournal} setEditingJournal={setEditingJournal}
            handleStartEditJournal={(journal) => handleStartEditJournalService({ journal, editingJournal, setEditingJournal, setFetchingHistory, setEditStudentsList })}
            handleDeleteJournal={(journalId) => handleDeleteJournalService({ journalId, fetchJournalsHistory: () => fetchJournalsHistoryService({ isDemo, setFetchingHistory, setJournalsHistory }) })}
            editStudentsList={editStudentsList} savingEdit={savingEdit}
            handleSaveFullJournal={() => handleSaveFullJournalService({ editingJournal, setSavingEdit, editStudentsList, setEditingJournal, fetchJournalsHistory: () => fetchJournalsHistoryService({ isDemo, setFetchingHistory, setJournalsHistory }) })}
            setSelectedImageModal={setSelectedImageModal}
          />
        )}

        {activeTab === 'siswa' && (
          <TabStudents 
            allStudents={allStudents}
            searchStudentQuery={searchStudentQuery} setSearchStudentQuery={setSearchStudentQuery}
            attendanceFilter={attendanceFilter} setAttendanceFilter={setAttendanceFilter}
            attendanceRecordsAll={attendanceRecordsAll}
            isAddingStudent={isAddingStudent} setIsAddingStudent={setIsAddingStudent}
            newStudent={newStudent} setNewStudent={setNewStudent}
            handleAddStudent={(e) => handleAddStudentService({ e, newStudent, setNewStudent, setIsAddingStudent, fetchAllStudents: () => fetchAllStudentsService({ isDemo, setAllStudents, setAttendanceRecordsAll }), fetchStudentsByMode: () => fetchStudentsByModeService({ isDemo, jurnalMode, selectedClass, waliClass, setFetchingStudents, setStudents, initAttendance }) })}
            editingStudent={editingStudent} setEditingStudent={setEditingStudent}
            handleUpdateStudent={(id) => handleUpdateStudentService({ id, editingStudent, setEditingStudent, fetchAllStudents: () => fetchAllStudentsService({ isDemo, setAllStudents, setAttendanceRecordsAll }), fetchStudentsByMode: () => fetchStudentsByModeService({ isDemo, jurnalMode, selectedClass, waliClass, setFetchingStudents, setStudents, initAttendance }) })}
            handleToggleKelompok5={(student) => handleToggleKelompok5Service({ student, fetchAllStudents: () => fetchAllStudentsService({ isDemo, setAllStudents, setAttendanceRecordsAll }), fetchStudentsByMode: () => fetchStudentsByModeService({ isDemo, jurnalMode, selectedClass, waliClass, setFetchingStudents, setStudents, initAttendance }) })}
            handleShowAbsenceDetails={(student) => handleShowAbsenceDetailsService({ student, setFetchingStudents, setStudentAbsenceDetails })}
            handleExportIndividualPDF={handleExportIndividualPDF}
            handleDeleteStudent={(id, name) => handleDeleteStudentService({ id, name, fetchAllStudents: () => fetchAllStudentsService({ isDemo, setAllStudents, setAttendanceRecordsAll }), fetchStudentsByMode: () => fetchStudentsByModeService({ isDemo, jurnalMode, selectedClass, waliClass, setFetchingStudents, setStudents, initAttendance }) })}
          />
        )}

        {activeTab === 'profile' && (
          <TabExport 
            reportType={reportType} setReportType={setReportType}
            reportPeriod={reportPeriod} setReportPeriod={setReportPeriod}
            reportClass={reportClass} setReportClass={setReportClass}
            reportSubject={reportSubject} setReportSubject={setReportSubject}
            startDate={startDate} setStartDateFilter={setStartDateFilter}
            endDate={endDate} setEndDateFilter={setEndDateFilter}
            loading={loading}
            handleTriggerExportPreview={() => handleTriggerExportPreviewService({
              setLoading, reportClass, reportSubject, reportType, isDemo, reportPeriod,
              startDate, endDate, handleOpenPrintPreview, profile
            })}
            isProfileOpen={isProfileOpen} setIsProfileOpen={setIsProfileOpen}
            profile={profile} setProfile={setProfile}
            handleSaveProfile={() => handleSaveProfileService({ session, profile, setLoading })}
            handleSignatureUpload={(e) => handleSignatureUploadService(e, setProfile)}
            isDarkMode={isDarkMode} setIsDarkMode={setIsDarkMode}
          />
        )}
      </div>

      <BottomNavigation 
        activeTab={activeTab} setActiveTab={setActiveTab} 
        handleLogout={() => handleLogoutService(setIsDemo)} 
      />

      <AbsenceDetailsModal 
        studentAbsenceDetails={studentAbsenceDetails} 
        setStudentAbsenceDetails={setStudentAbsenceDetails} 
        setSelectedImageModal={setSelectedImageModal} 
      />

      <ImageLightboxModal 
        selectedImageModal={selectedImageModal} 
        setSelectedImageModal={setSelectedImageModal} 
      />

      <PrintPreviewModal 
        showPreviewModal={showPreviewModal} 
        setShowPreviewModal={setShowPreviewModal} 
        previewData={previewData} 
      />

    </div>
  );
}

export default App;
