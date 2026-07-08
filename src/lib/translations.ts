export interface TranslationDictionary {
  appName: string;
  langSwitch: string;
  role: string;
  disclaimer: string;
  common: {
    back: string;
    save: string;
    submit: string;
    loading: string;
    cancel: string;
    send: string;
    logout: string;
    status: string;
    connected: string;
    disconnected: string;
    connectDevice: string;
    disconnectDevice: string;
    actionRequired: string;
    noData: string;
  };
  roles: {
    siswa: string;
    guru_bk: string;
    orang_tua: string;
  };
  status: {
    optimal: string;
    load: string;
    overload: string;
    optimalDesc: string;
    loadDesc: string;
    overloadDesc: string;
  };
  auth: {
    welcome: string;
    welcomeSubtitle: string;
    username: string;
    password: string;
    signIn: string;
    signUp: string;
    noAccount: string;
    hasAccount: string;
    createAccount: string;
    loginSuccess: string;
    registerSuccess: string;
    errorFields: string;
    errorUserExists: string;
    errorInvalid: string;
    selectRole: string;
    parentChildUsername: string;
    parentChildHelp: string;
    titleRegister: string;
    titleLogin: string;
    roleSelect: string;
    submitRegister: string;
    submitLogin: string;
    loginLink: string;
    registerLink: string;
  };
  home: {
    welcomeStudent: string;
    subtitle: string;
    aboutTitle: string;
    aboutDesc: string;
    teamTitle: string;
    teamDesc: string;
    socialConnect: string;
    quickLinks: string;
  };
  health: {
    title: string;
    subtitle: string;
    bpmCard: string;
    hrvCard: string;
    bpmDesc: string;
    hrvDesc: string;
    realTimeBiometrics: string;
    combinedTrend: string;
    bpmLabel: string;
    hrvLabel: string;
    monthlyStressTitle: string;
    monthlyStressDesc: string;
    waitingForData: string;
    waitingForDataDesc: string;
    eduGuideTitle: string;
    eduGuideSubtitle: string;
    breathingCta: string;
    stretchCta: string;
    breakCta: string;
  };
  academic: {
    title: string;
    subtitle: string;
    averageGrade: string;
    highestGrade: string;
    focusStatus: string;
    attentionNeeded: string;
    attentionNeededDesc: string;
    subjectList: string;
    gradeReport: string;
    semester: string;
  };
  advice: {
    title: string;
    subtitle: string;
    questionnaireTitle: string;
    questionnaireDesc: string;
    emojiSliderLabel: string;
    freeTextLabel: string;
    freeTextPlaceholder: string;
    submitEvaluation: string;
    evaluationSuccess: string;
    sysGenTitle: string;
    sysGenDesc: string;
    counselorTitle: string;
    counselorDesc: string;
    noCounselorAdvice: string;
    counselorLabel: string;
    dateLabel: string;
  };
  articles: {
    title: string;
    subtitle: string;
    readMore: string;
  };
  consult: {
    title: string;
    subtitle: string;
    formTitle: string;
    formDesc: string;
    expertLabel: string;
    expertHelp: string;
    dateLabel: string;
    timeLabel: string;
    notesLabel: string;
    notesPlaceholder: string;
    bookCta: string;
    bookSuccess: string;
    expertPsychologist: string;
    expertPsychiatrist: string;
  };
  chat: {
    title: string;
    subtitle: string;
    chatPlaceholder: string;
    quickChipsLabel: string;
    quickChipStress: string;
    quickChipTips: string;
    quickChipCalm: string;
    aiDisclaimer: string;
  };
  guru: {
    title: string;
    subtitle: string;
    studentRoster: string;
    searchPlaceholder: string;
    subjectStressRank: string;
    subjectStressRankDesc: string;
    studentDetail: string;
    writeAdvice: string;
    writeAdvicePlaceholder: string;
    adviceSavedSuccess: string;
    assignedStudentsCount: string;
    backToRoster: string;
    lastBpm: string;
    lastHrv: string;
    overallCondition: string;
  };
  parent: {
    title: string;
    subtitle: string;
    childSummaryTitle: string;
    childSummaryDesc: string;
    weeklyStressEvaluation: string;
    academicPerformance: string;
    counselorNotesTitle: string;
    systemSuggestionsTitle: string;
  };
}

export const translations: Record<"id" | "en", TranslationDictionary> = {
  id: {
    appName: "Grahita Space",
    langSwitch: "ID",
    role: "Peran",
    disclaimer: "Disclaimer: Layanan ini adalah asisten AI dan pendamping biometrik, bukan pengganti diagnosis medis formal.",
    common: {
      back: "Kembali",
      save: "Simpan",
      submit: "Kirim",
      loading: "Memuat...",
      cancel: "Batal",
      send: "Kirim",
      logout: "Keluar Sesi",
      status: "Status",
      connected: "Terhubung",
      disconnected: "Terputus",
      connectDevice: "Hubungkan Grahita Band",
      disconnectDevice: "Putuskan Grahita Band",
      actionRequired: "Butuh Tindakan",
      noData: "Belum ada data tersedia.",
    },
    roles: {
      siswa: "Siswa",
      guru_bk: "Guru BK (Konselor)",
      orang_tua: "Orang Tua",
    },
    status: {
      optimal: "Optimal",
      load: "Siaga",
      overload: "Overload",
      optimalDesc: "Kondisi kognitif dan kardiovaskular stabil. Tubuh dalam keadaan rileks dan siap fokus belajar.",
      loadDesc: "Kondisi kognitif mengalami tekanan ringan. Disarankan beristirahat sejenak atau melakukan peregangan.",
      overloadDesc: "Kondisi stres kognitif berlebih terdeteksi! Segera lakukan pernapasan 4-7-8 untuk menenangkan detak jantung.",
    },
    auth: {
      welcome: "Grahita Space",
      welcomeSubtitle: "Platform Pendamping & Konektivitas Grahita Band untuk Pemantauan Stres Akademik",
      username: "Nama Pengguna (Username)",
      password: "Kata Sandi (Password)",
      signIn: "Masuk Akun",
      signUp: "Daftar Baru",
      noAccount: "Belum punya akun?",
      hasAccount: "Sudah punya akun?",
      createAccount: "Buat Akun",
      loginSuccess: "Berhasil masuk!",
      registerSuccess: "Registrasi berhasil! Silakan masuk.",
      errorFields: "Silakan isi semua bidang.",
      errorUserExists: "Nama pengguna sudah terdaftar.",
      errorInvalid: "Nama pengguna atau kata sandi salah.",
      selectRole: "Pilih Peran Anda",
      parentChildUsername: "Username Anak Binaan",
      parentChildHelp: "Masukkan username anak Anda yang terdaftar sebagai Siswa untuk menghubungkan data.",
      titleRegister: "Daftar Akun Baru",
      titleLogin: "Masuk ke Grahita Space",
      roleSelect: "Pilih Peran Anda",
      submitRegister: "Daftar Sekarang",
      submitLogin: "Masuk Sekarang",
      loginLink: "Masuk di sini",
      registerLink: "Daftar di sini",
    },
    home: {
      welcomeStudent: "Halo, Rian Aditya!",
      subtitle: "Selamat datang di ruang tenangmu. Mari pantau dan kelola tingkat stres kognitifmu secara bijak.",
      aboutTitle: "Tentang Grahita Space",
      aboutDesc: "Grahita Space adalah platform pendamping terpadu untuk perangkat wearable 'Grahita Band'. Platform ini dirancang khusus untuk memantau data fisiologis (BPM dan HRV) siswa secara real-time untuk mendeteksi stres kognitif dini, sekaligus menjadi jembatan komunikasi antara Siswa, Guru BK (Bimbingan Konseling), dan Orang Tua demi kesehatan mental akademik yang lebih baik.",
      teamTitle: "Tim Grahita Space",
      teamDesc: "Kami adalah tim yang berdedikasi untuk menciptakan solusi teknologi kesehatan mental demi mendukung ekosistem pendidikan yang sehat, suportif, dan bebas stres berlebih.",
      socialConnect: "Terhubung dengan Kami",
      quickLinks: "Tautan Navigasi",
    },
    health: {
      title: "Dasbor Kesehatan Biometrik",
      subtitle: "Data fisiologis real-time yang dideteksi oleh perangkat Grahita Band Anda.",
      bpmCard: "Detak Jantung (Heart Rate)",
      hrvCard: "Variabilitas Detak Jantung",
      bpmDesc: "Detak jantung normal saat rileks berkisar antara 60-100 BPM.",
      hrvDesc: "HRV tinggi mengindikasikan tingkat pemulihan stres kognitif yang sangat baik.",
      realTimeBiometrics: "Biometrik Grahita Band",
      combinedTrend: "Tren Gabungan BPM & HRV",
      bpmLabel: "Detak Jantung (BPM)",
      hrvLabel: "Variabilitas Jantung (HRV - ms)",
      monthlyStressTitle: "Evaluasi Tren Stres Bulanan",
      monthlyStressDesc: "Rata-rata tingkat stres kognitif per minggu berdasarkan skala variabilitas detak jantung (HRV).",
      waitingForData: "Menunggu Koneksi Perangkat...",
      waitingForDataDesc: "Grahita Band Anda belum terhubung. Silakan aktifkan simulator perangkat untuk mengirimkan data fisiologis real-time.",
      eduGuideTitle: "Panduan Intervensi Edukatif & Kesehatan",
      eduGuideSubtitle: "Rekomendasi taktis berdasarkan pembacaan data fisiologis Anda saat ini.",
      breathingCta: "Mulai Latihan Pernapasan 4-7-8",
      stretchCta: "Lakukan Peregangan 3 Menit",
      breakCta: "Pengingat Istirahat: Matikan Layar",
    },
    academic: {
      title: "Dasbor Akademik Siswa",
      subtitle: "Analisis performa akademik semesteran dan fokus kognitif per mata pelajaran.",
      averageGrade: "Rata-rata Nilai",
      highestGrade: "Nilai Tertinggi",
      focusStatus: "Fokus Kognitif",
      attentionNeeded: "Mata Pelajaran Perlu Perhatian",
      attentionNeededDesc: "Daftar mata pelajaran dengan tingkat stres kognitif tinggi saat belajar atau ujian. Mari beri perhatian khusus agar belajarmu lebih santai.",
      subjectList: "Status Kognitif & Nilai per Mata Pelajaran",
      gradeReport: "Laporan Nilai Akademik",
      semester: "Semester",
    },
    advice: {
      title: "Kuesioner & Saran Guru BK",
      subtitle: "Validasi emosi harian Anda serta masukan profesional dari konselor sekolah.",
      questionnaireTitle: "Kuesioner Validasi Emosional",
      questionnaireDesc: "Bagaimana perasaanmu hari ini? Geser slider di bawah untuk memilih tingkat kenyamanan/stres emosionalmu (1 = Sangat Tertekan, 10 = Sangat Tenang & Bahagia).",
      emojiSliderLabel: "Skala Validasi Emosi (1-10)",
      freeTextLabel: "Apa yang sedang kamu pikirkan atau rasakan saat ini? (Opsional)",
      freeTextPlaceholder: "Tuliskan unek-unekmu di sini...",
      submitEvaluation: "Kirim Hasil Evaluasi Mandiri",
      evaluationSuccess: "Hasil evaluasi mandiri berhasil dikirim! Terima kasih telah memvalidasi emosimu hari ini.",
      sysGenTitle: "Saran Berbasis AI & Biometrik",
      sysGenDesc: "Berdasarkan kombinasi HRV real-time dan kuesioner emosi Anda saat ini.",
      counselorTitle: "Catatan Solusi dari Guru BK (Konselor)",
      counselorDesc: "Saran dan solusi khusus yang ditulis oleh Guru BK untuk membantu Anda mengatasi stres belajar.",
      noCounselorAdvice: "Belum ada catatan solusi dari Guru BK saat ini. Tetap jaga kesehatan mentalmu!",
      counselorLabel: "Konselor",
      dateLabel: "Tanggal",
    },
    articles: {
      title: "Jurnal & Artikel Kesehatan Mental",
      subtitle: "Edukasi praktis untuk menjaga kesehatan pikiran, manajemen stres, dan efektivitas belajar.",
      readMore: "Baca Selengkapnya",
    },
    consult: {
      title: "Konsultasi Psikolog & Psikiater",
      subtitle: "Layanan rujukan profesional luar sekolah apabila Anda membutuhkan penanganan lebih intensif.",
      formTitle: "Formulir Booking Jadwal Konsultasi",
      formDesc: "Silakan pilih tenaga profesional dan tentukan jadwal yang Anda harapkan. Kami akan mengirimkan detail konfirmasi via email/WhatsApp.",
      expertLabel: "Pilih Tenaga Ahli",
      expertHelp: "Psikolog membantu konseling emosi & kognitif; Psikiater berfokus pada pendekatan medis.",
      dateLabel: "Pilih Tanggal",
      timeLabel: "Pilih Waktu",
      notesLabel: "Catatan Khusus atau Keluhan Utama",
      notesPlaceholder: "Tuliskan keluhan atau hal penting yang ingin Anda sampaikan...",
      bookCta: "Kirim Permohonan Booking Konsultasi",
      bookSuccess: "Booking berhasil diajukan! Tim Grahita Space akan segera menghubungi Anda untuk konfirmasi jadwal.",
      expertPsychologist: "Dra. Maria Utami, M.Psi (Psikolog Klinis Anak & Remaja)",
      expertPsychiatrist: "dr. Hendra Setiawan, Sp.KJ (Psikiater & Kesehatan Jiwa)",
    },
    chat: {
      title: "Asisten AI Graphite",
      subtitle: "Tanyakan apa saja seputar tips belajar, stres ujian, atau cara merilekskan pikiran.",
      chatPlaceholder: "Ketik pesan Anda di sini...",
      quickChipsLabel: "Saran Pertanyaan Cepat",
      quickChipStress: "Mengatasi stres ujian kognitif",
      quickChipTips: "Tips belajar fokus tanpa cemas",
      quickChipCalm: "Cara cepat menenangkan pikiran",
      aiDisclaimer: "Asisten AI ini bukan pengganti psikolog, psikiater, atau Guru BK profesional. Jika Anda tertekan, silakan hubungi profesional.",
    },
    guru: {
      title: "Dasbor Guru BK (Konselor)",
      subtitle: "Pemantauan real-time tingkat stres kognitif dan pembagian saran solusi bagi siswa binaan.",
      studentRoster: "Roster Siswa Binaan",
      searchPlaceholder: "Cari nama siswa...",
      subjectStressRank: "Peringkat Stres Kognitif per Mata Pelajaran",
      subjectStressRankDesc: "Mata pelajaran yang paling banyak memicu kondisi kognitif 'Overload' pada siswa binaan Anda minggu ini.",
      studentDetail: "Detail & Riwayat Fisiologis Siswa",
      writeAdvice: "Tulis Rekomendasi / Saran Solusi",
      writeAdvicePlaceholder: "Tuliskan langkah konkret atau solusi bimbingan untuk siswa ini agar stres akademiknya berkurang...",
      adviceSavedSuccess: "Rekomendasi solusi berhasil disimpan dan langsung diteruskan ke halaman Siswa dan Orang Tua!",
      assignedStudentsCount: "Jumlah Siswa Binaan",
      backToRoster: "Kembali ke Roster",
      lastBpm: "BPM Terakhir",
      lastHrv: "HRV Terakhir",
      overallCondition: "Kondisi Keseluruhan",
    },
    parent: {
      title: "Dasbor Orang Tua",
      subtitle: "Pemantauan khusus kesehatan kognitif dan prestasi akademik buah hati Anda.",
      childSummaryTitle: "Ringkasan Kesehatan Buah Hati Anda",
      childSummaryDesc: "Memantau data stres kognitif, catatan konselor, dan performa studi anak Anda secara terintegrasi.",
      weeklyStressEvaluation: "Tren Stres Kognitif Mingguan",
      academicPerformance: "Nilai Performa Akademik",
      counselorNotesTitle: "Saran & Solusi dari Guru BK untuk Anak Anda",
      systemSuggestionsTitle: "Saran Kesehatan Sistem (Otomatis)",
    },
  },
  en: {
    appName: "Grahita Space",
    langSwitch: "EN",
    role: "Role",
    disclaimer: "Disclaimer: This service is an AI assistant and biometric companion, not a substitute for formal medical diagnosis.",
    common: {
      back: "Back",
      save: "Save",
      submit: "Submit",
      loading: "Loading...",
      cancel: "Cancel",
      send: "Send",
      logout: "Sign Out",
      status: "Status",
      connected: "Connected",
      disconnected: "Disconnected",
      connectDevice: "Connect Grahita Band",
      disconnectDevice: "Disconnect Grahita Band",
      actionRequired: "Action Required",
      noData: "No data available yet.",
    },
    roles: {
      siswa: "Student",
      guru_bk: "Counselor (Guru BK)",
      orang_tua: "Parent",
    },
    status: {
      optimal: "Optimal",
      load: "Alert/Load",
      overload: "Overload",
      optimalDesc: "Stable cognitive and cardiovascular condition. The body is relaxed and ready for deep learning.",
      loadDesc: "Experiencing mild cognitive pressure. Taking a brief break or light stretching is recommended.",
      overloadDesc: "Excessive cognitive stress detected! Perform 4-7-8 breathing immediately to calm heart rate.",
    },
    auth: {
      welcome: "Grahita Space",
      welcomeSubtitle: "Grahita Band Companion & Connectivity Platform for Academic Stress Monitoring",
      username: "Username",
      password: "Password",
      signIn: "Sign In",
      signUp: "Register",
      noAccount: "Don't have an account?",
      hasAccount: "Already have an account?",
      createAccount: "Create Account",
      loginSuccess: "Successfully logged in!",
      registerSuccess: "Registration successful! Please sign in.",
      errorFields: "Please fill in all fields.",
      errorUserExists: "Username is already registered.",
      errorInvalid: "Invalid username or password.",
      selectRole: "Select Your Role",
      parentChildUsername: "Linked Child Username",
      parentChildHelp: "Enter your child's registered Student username to link biometrics and grades.",
      titleRegister: "Create a New Account",
      titleLogin: "Sign in to Grahita Space",
      roleSelect: "Select Your Role",
      submitRegister: "Sign Up Now",
      submitLogin: "Sign In Now",
      loginLink: "Sign in here",
      registerLink: "Register here",
    },
    home: {
      welcomeStudent: "Hello, Rian Aditya!",
      subtitle: "Welcome to your calm space. Monitor and manage your cognitive stress levels mindfully.",
      aboutTitle: "About Grahita Space",
      aboutDesc: "Grahita Space is an integrated companion platform for the 'Grahita Band' wearable device. It is designed to track physiological data (BPM and HRV) of students in real-time to detect cognitive stress early, serving as a communication bridge between Students, School Counselors (Guru BK), and Parents for a better academic mental health ecosystem.",
      teamTitle: "Grahita Space Team",
      teamDesc: "We are a dedicated team creating mental health technology solutions to support a healthy, supportive, and stress-free educational ecosystem.",
      socialConnect: "Connect with Us",
      quickLinks: "Navigation Links",
    },
    health: {
      title: "Biometric Health Dashboard",
      subtitle: "Real-time physiological data detected by your Grahita Band wearable device.",
      bpmCard: "Heart Rate (BPM)",
      hrvCard: "Heart Rate Variability (HRV)",
      bpmDesc: "A normal resting heart rate typically ranges from 60 to 100 BPM.",
      hrvDesc: "High HRV indicates excellent cognitive and autonomic stress resilience.",
      realTimeBiometrics: "Grahita Band Biometrics",
      combinedTrend: "Combined BPM & HRV Trend",
      bpmLabel: "Heart Rate (BPM)",
      hrvLabel: "Heart Variability (HRV - ms)",
      monthlyStressTitle: "Monthly Stress Trend Evaluation",
      monthlyStressDesc: "Average weekly cognitive stress level based on heart rate variability (HRV) metrics.",
      waitingForData: "Waiting for Device Connection...",
      waitingForDataDesc: "Your Grahita Band is not connected. Please enable the device simulator panel to stream physiological data.",
      eduGuideTitle: "Educational & Health Intervention Guide",
      eduGuideSubtitle: "Tactical health recommendations based on your current biometric readouts.",
      breathingCta: "Start 4-7-8 Breathing Exercise",
      stretchCta: "Do a 3-Minute Stretching Session",
      breakCta: "Rest Reminder: Turn Off Screens",
    },
    academic: {
      title: "Student Academic Dashboard",
      subtitle: "Analyze semester academic performance and cognitive focus per subject.",
      averageGrade: "Average Grade",
      highestGrade: "Highest Grade",
      focusStatus: "Cognitive Focus",
      attentionNeeded: "Subjects Needing Attention",
      attentionNeededDesc: "List of subjects triggering high cognitive stress during study or exams. Giving extra care can help you study with peace of mind.",
      subjectList: "Cognitive Status & Grades per Subject",
      gradeReport: "Academic Grade Report",
      semester: "Semester",
    },
    advice: {
      title: "Questionnaire & Counselor Advice",
      subtitle: "Validate your daily emotional state and view professional solutions from your school counselor.",
      questionnaireTitle: "Emotional Validation Questionnaire",
      questionnaireDesc: "How are you feeling today? Slide the selector below to express your emotional comfort (1 = Extremely Stressed, 10 = Calm & Happy).",
      emojiSliderLabel: "Emotional Validation Scale (1-10)",
      freeTextLabel: "What is on your mind today? (Optional)",
      freeTextPlaceholder: "Write down your thoughts here...",
      submitEvaluation: "Submit Self-Evaluation",
      evaluationSuccess: "Self-evaluation submitted! Thank you for validating your emotions today.",
      sysGenTitle: "Biometric & AI-Generated Recommendations",
      sysGenDesc: "Based on the combination of your real-time HRV and emotional questionnaire response.",
      counselorTitle: "Solution Notes from School Counselor",
      counselorDesc: "Custom guidance and professional advice written by the Guru BK to help you manage academic pressure.",
      noCounselorAdvice: "No advice notes from your Counselor at the moment. Keep taking care of your mental well-being!",
      counselorLabel: "Counselor",
      dateLabel: "Date",
    },
    articles: {
      title: "Mental Wellbeing Journals & Articles",
      subtitle: "Practical guides for maintaining mental health, stress management, and effective study.",
      readMore: "Read Full Article",
    },
    consult: {
      title: "Psychologist & Psychiatrist Consultations",
      subtitle: "Professional external clinical referrals should you need more specialized care.",
      formTitle: "Consultation Appointment Booking Form",
      formDesc: "Select an expert and request your preferred time. We will send confirmation details via email/WhatsApp.",
      expertLabel: "Select Specialist",
      expertHelp: "Psychologists help with emotional & cognitive counseling; Psychiatrists provide medical treatments.",
      dateLabel: "Select Date",
      timeLabel: "Select Time",
      notesLabel: "Special Notes or Main Complaints",
      notesPlaceholder: "Describe your symptoms or any key notes you would like to share...",
      bookCta: "Submit Consultation Booking Request",
      bookSuccess: "Booking requested! The Grahita Space team will contact you shortly to confirm the appointment.",
      expertPsychologist: "Dra. Maria Utami, M.Psi (Clinical Child & Adolescent Psychologist)",
      expertPsychiatrist: "dr. Hendra Setiawan, Sp.KJ (Adult & Adolescent Psychiatrist)",
    },
    chat: {
      title: "Graphite AI Assistant",
      subtitle: "Ask me anything about study stress, exams, or quick relaxation techniques.",
      chatPlaceholder: "Type your message here...",
      quickChipsLabel: "Quick Question Suggestions",
      quickChipStress: "Managing cognitive exam stress",
      quickChipTips: "Focussed studying without anxiety",
      quickChipCalm: "Quick ways to relax the mind",
      aiDisclaimer: "This AI Assistant is not a substitute for a psychologist, psychiatrist, or professional counselor. If you feel distressed, please seek professional help.",
    },
    guru: {
      title: "Counselor Dashboard (Guru BK)",
      subtitle: "Real-time cognitive stress tracking and solution matching for assigned students.",
      studentRoster: "Assigned Student Roster",
      searchPlaceholder: "Search student name...",
      subjectStressRank: "Cognitive Stress Ranking per Subject",
      subjectStressRankDesc: "Subjects with the highest frequency of 'Overload' states among your assigned students this week.",
      studentDetail: "Student Details & Physiological History",
      writeAdvice: "Write Guidance Recommendation",
      writeAdvicePlaceholder: "Write actionable steps or counseling solutions for this student to ease academic stress...",
      adviceSavedSuccess: "Solution note saved and immediately sent to the Student and Parent dashboards!",
      assignedStudentsCount: "Assigned Students",
      backToRoster: "Back to Roster",
      lastBpm: "Last BPM",
      lastHrv: "Last HRV",
      overallCondition: "Overall Condition",
    },
    parent: {
      title: "Parent Dashboard",
      subtitle: "Monitor your child's cognitive health and academic progress securely.",
      childSummaryTitle: "Your Child's Health & Study Summary",
      childSummaryDesc: "Monitor stress readings, counseling solutions, and grades for your child in one unified view.",
      weeklyStressEvaluation: "Weekly Cognitive Stress Trend",
      academicPerformance: "Academic Performance Grades",
      counselorNotesTitle: "Counselor Guidance Notes for Your Child",
      systemSuggestionsTitle: "System Biometric Recommendations (Automated)",
    },
  },
};
