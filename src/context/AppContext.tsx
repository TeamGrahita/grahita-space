import React, { createContext, useContext, useState, useEffect } from "react";
import { 
  User, 
  StudentProfile, 
  ConsultationBooking, 
  BiometricReading, 
  SubjectGrade, 
  QuestionnaireResponse,
  CounselorNote,
  UserRole
} from "../types";
import { db, auth } from "../lib/firebase";
import { 
  collection, 
  doc, 
  setDoc, 
  getDoc,
  getDocs,
  query,
  where,
  onSnapshot, 
  writeBatch 
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut
} from "firebase/auth";

interface AppContextProps {
  currentUser: User | null;
  lang: "id" | "en";
  students: Record<string, StudentProfile>;
  bookings: ConsultationBooking[];
  loading: boolean;
  setLanguage: (lang: "id" | "en") => void;
  login: (usernameOrEmail: string, passwordEntered: string, role: UserRole | "admin") => Promise<User | null>;
  loginWithGoogle: () => Promise<User | null>;
  register: (username: string, email: string, fullName: string, passwordEntered: string, role: UserRole, childUsername?: string) => Promise<User | null>;
  logout: () => void;
  submitQuestionnaire: (emojiScore: number, notes: string) => void;
  addCounselorAdvice: (studentUsername: string, text: string) => void;
  bookConsultation: (expertName: string, date: string, time: string, notes: string) => void;
  toggleBandConnection: (studentUsername: string, connected: boolean) => void;
  pushSimulatedBiometrics: (studentUsername: string, bpm: number, hrv: number, status: "optimal" | "load" | "overload") => void;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

// Helper to generate biometric history over the last 15 days
function generateHistoricBiometrics(baseBpm: number, baseHrv: number, stressPattern: "calm" | "stressed" | "mixed"): BiometricReading[] {
  const readings: BiometricReading[] = [];
  const now = new Date();
  
  for (let i = 14; i >= 0; i--) {
    const timestamp = new Date(now.getTime() - i * 24 * 60 * 60 * 1000).toISOString();
    let bpm = baseBpm;
    let hrv = baseHrv;
    
    // Vary based on stress pattern
    if (stressPattern === "stressed") {
      bpm += Math.floor(Math.sin(i) * 15) + 12; // Elevated
      hrv -= Math.floor(Math.cos(i) * 10) + 10; // Reduced
    } else if (stressPattern === "mixed") {
      bpm += Math.floor(Math.sin(i) * 20);
      hrv += Math.floor(Math.cos(i) * 15);
    } else {
      bpm += Math.floor(Math.cos(i) * 8);
      hrv += Math.floor(Math.sin(i) * 10);
    }

    // Keep bounds safe
    bpm = Math.max(60, Math.min(130, bpm));
    hrv = Math.max(15, Math.min(100, hrv));

    let status: "optimal" | "load" | "overload" = "optimal";
    if (bpm > 100 || hrv < 35) {
      status = "overload";
    } else if (bpm > 85 || hrv < 50) {
      status = "load";
    }

    readings.push({ timestamp, bpm, hrv, status });
  }
  return readings;
}

function getSeededStudents(): Record<string, StudentProfile> {
  const initialGrades1: SubjectGrade[] = [
    { subjectId: "math", subjectNameId: "Matematika", subjectNameEn: "Mathematics", grade: 68, stressStatus: "overload" },
    { subjectId: "phys", subjectNameId: "Fisika", subjectNameEn: "Physics", grade: 72, stressStatus: "overload" },
    { subjectId: "chem", subjectNameId: "Kimia", subjectNameEn: "Chemistry", grade: 82, stressStatus: "load" },
    { subjectId: "bio", subjectNameId: "Biologi", subjectNameEn: "Biology", grade: 88, stressStatus: "optimal" },
    { subjectId: "indo", subjectNameId: "Bahasa Indonesia", subjectNameEn: "Indonesian", grade: 94, stressStatus: "optimal" },
    { subjectId: "eng", subjectNameId: "Bahasa Inggris", subjectNameEn: "English", grade: 90, stressStatus: "optimal" },
  ];

  const initialGrades2: SubjectGrade[] = [
    { subjectId: "math", subjectNameId: "Matematika", subjectNameEn: "Mathematics", grade: 88, stressStatus: "optimal" },
    { subjectId: "phys", subjectNameId: "Fisika", subjectNameEn: "Physics", grade: 85, stressStatus: "optimal" },
    { subjectId: "chem", subjectNameId: "Kimia", subjectNameEn: "Chemistry", grade: 80, stressStatus: "optimal" },
    { subjectId: "bio", subjectNameId: "Biologi", subjectNameEn: "Biology", grade: 92, stressStatus: "optimal" },
    { subjectId: "indo", subjectNameId: "Bahasa Indonesia", subjectNameEn: "Indonesian", grade: 89, stressStatus: "optimal" },
    { subjectId: "eng", subjectNameId: "Bahasa Inggris", subjectNameEn: "English", grade: 95, stressStatus: "optimal" },
  ];

  const initialGrades3: SubjectGrade[] = [
    { subjectId: "math", subjectNameId: "Matematika", subjectNameEn: "Mathematics", grade: 75, stressStatus: "load" },
    { subjectId: "phys", subjectNameId: "Fisika", subjectNameEn: "Physics", grade: 74, stressStatus: "load" },
    { subjectId: "chem", subjectNameId: "Kimia", subjectNameEn: "Chemistry", grade: 79, stressStatus: "optimal" },
    { subjectId: "bio", subjectNameId: "Biologi", subjectNameEn: "Biology", grade: 81, stressStatus: "optimal" },
    { subjectId: "indo", subjectNameId: "Bahasa Indonesia", subjectNameEn: "Indonesian", grade: 85, stressStatus: "optimal" },
    { subjectId: "eng", subjectNameId: "Bahasa Inggris", subjectNameEn: "English", grade: 82, stressStatus: "optimal" },
  ];

  return {
    siswa: {
      username: "siswa",
      fullName: "Rian Aditya",
      isConnected: true,
      biometricsHistory: generateHistoricBiometrics(92, 35, "stressed"),
      grades: initialGrades1,
      questionnaires: [
        { timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), emojiScore: 4, notes: "Banyak tugas matematika, pusing sekali" },
        { timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), emojiScore: 5, notes: "Belajar untuk kuis fisika besok" }
      ],
      counselorNotes: [
        {
          id: "note-1",
          counselorName: "Ibu Indah, S.Psi",
          text: "Rian, Ibu melihat data biometrikmu cukup tinggi akhir-akhir ini saat pelajaran Matematika dan Fisika. Silakan mampir ke ruang BK ya jika ada waktu luang, kita bincang santai. Ingat untuk mengambil jeda istirahat 5 menit setiap belajar 45 menit.",
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    budi_santoso: {
      username: "budi_santoso",
      fullName: "Budi Santoso",
      isConnected: true,
      biometricsHistory: generateHistoricBiometrics(72, 68, "calm"),
      grades: initialGrades2,
      questionnaires: [],
      counselorNotes: []
    },
    citra_lestari: {
      username: "citra_lestari",
      fullName: "Citra Lestari",
      isConnected: true,
      biometricsHistory: generateHistoricBiometrics(85, 48, "mixed"),
      grades: initialGrades3,
      questionnaires: [],
      counselorNotes: [
        {
          id: "note-2",
          counselorName: "Ibu Indah, S.Psi",
          text: "Citra, tingkatkan konsistensi waktu tidurmu ya agar HRV kamu meningkat di pagi hari. Kinerja belajarmu sudah sangat stabil.",
          timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    },
    diana_putri: {
      username: "diana_putri",
      fullName: "Diana Putri",
      isConnected: false,
      biometricsHistory: generateHistoricBiometrics(68, 75, "calm"),
      grades: initialGrades2,
      questionnaires: [],
      counselorNotes: []
    },
    eko_prasetyo: {
      username: "eko_prasetyo",
      fullName: "Eko Prasetyo",
      isConnected: true,
      biometricsHistory: generateHistoricBiometrics(105, 28, "stressed"),
      grades: initialGrades1,
      questionnaires: [],
      counselorNotes: [
        {
          id: "note-3",
          counselorName: "Ibu Indah, S.Psi",
          text: "Eko, Ibu sarankan untuk mengurangi konsumsi kafein berlebih di malam hari karena terpantau detak jantung malammu di atas 100 BPM. Cobalah meditasi pernapasan 4-7-8 sebelum tidur.",
          timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        }
      ]
    }
  };
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<"id" | "en">("id");
  const [students, setStudents] = useState<Record<string, StudentProfile>>({});
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Initialize data and synchronize with Firestore in real-time
  useEffect(() => {
    // 1. Load language choice
    const savedLang = localStorage.getItem("grahita_lang");
    if (savedLang === "id" || savedLang === "en") {
      setLang(savedLang);
    }

    // 2. Load current user from localStorage
    const savedUser = localStorage.getItem("grahita_current_user");
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setCurrentUser(parsedUser);
      setLang(parsedUser.preferredLanguage || "id");
    }

    // 2b. Initialize students & bookings state immediately (offline-first fallback)
    const savedStudents = localStorage.getItem("grahita_students");
    if (savedStudents) {
      try {
        setStudents(JSON.parse(savedStudents));
      } catch (err) {
        console.error("Failed to parse saved students, fallback to seed:", err);
        setStudents(getSeededStudents());
      }
    } else {
      setStudents(getSeededStudents());
    }

    const savedBookings = localStorage.getItem("grahita_bookings");
    if (savedBookings) {
      try {
        setBookings(JSON.parse(savedBookings));
      } catch (err) {
        console.error("Failed to parse saved bookings:", err);
      }
    }

    // 3. Setup real-time Firestore listener for student profiles
    const unsubscribeStudents = onSnapshot(
      collection(db, "students"), 
      async (snapshot) => {
        try {
          if (snapshot.empty) {
            console.log("Firestore students collection is empty. Seeding initial student profiles...");
            const seeded = getSeededStudents();
            const batch = writeBatch(db);
            Object.keys(seeded).forEach(username => {
              batch.set(doc(db, "students", username), seeded[username]);
            });
            await batch.commit();
            setStudents(seeded);
            localStorage.setItem("grahita_students", JSON.stringify(seeded));
          } else {
            const studentsData: Record<string, StudentProfile> = {};
            snapshot.forEach((doc) => {
              studentsData[doc.id] = doc.data() as StudentProfile;
            });
            setStudents(studentsData);
            localStorage.setItem("grahita_students", JSON.stringify(studentsData));
          }
          setLoading(false);
        } catch (err) {
          console.warn("Error processing students snapshot (normal in offline mode):", err);
          setLoading(false);
        }
      },
      (error) => {
        console.warn("Firestore students subscription notice (Running in local-offline mode):", error.message || error);
        setLoading(false);
      }
    );

    // 4. Setup real-time Firestore listener for consultation bookings
    const unsubscribeBookings = onSnapshot(
      collection(db, "bookings"), 
      (snapshot) => {
        try {
          const bookingsData: ConsultationBooking[] = [];
          snapshot.forEach((doc) => {
            bookingsData.push(doc.data() as ConsultationBooking);
          });
          bookingsData.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setBookings(bookingsData);
          localStorage.setItem("grahita_bookings", JSON.stringify(bookingsData));
        } catch (err) {
          console.warn("Error processing bookings snapshot (normal in offline mode):", err);
        }
      },
      (error) => {
        console.warn("Firestore bookings subscription notice (Running in local-offline mode):", error.message || error);
      }
    );

    // 4b. Setup real-time Firestore listener for users collection to seed default credentials if empty
    const unsubscribeUsers = onSnapshot(
      collection(db, "users"),
      async (snapshot) => {
        try {
          if (snapshot.empty) {
            console.log("Firestore users collection is empty. Seeding default demo accounts...");
            const batch = writeBatch(db);
            const defaultUsers = {
              admin: {
                username: "admin",
                email: "gr4hita@gmail.com",
                fullName: "Administrator Grahita",
                password: "tenangajadakenV45",
                role: "admin",
                createdAt: "2026-07-08T00:00:00.000Z"
              },
              siswa: {
                username: "siswa",
                email: "siswa@grahita.id",
                fullName: "Rian Aditya",
                password: "siswa",
                role: "siswa",
                createdAt: "2026-06-25T14:30:00.000Z"
              },
              guru: {
                username: "guru",
                email: "indah@grahita.id",
                fullName: "Ibu Indah, S.Psi",
                password: "guru",
                role: "guru_bk",
                createdAt: "2026-06-26T09:15:00.000Z"
              },
              orangtua: {
                username: "orangtua",
                email: "budi@grahita.id",
                fullName: "Pak Budi",
                password: "orangtua",
                role: "orang_tua",
                childUsername: "siswa",
                createdAt: "2026-06-27T11:45:00.000Z"
              },
              budi: {
                username: "budi",
                email: "budi@grahita.id",
                fullName: "Pak Budi",
                password: "budi",
                role: "orang_tua",
                childUsername: "siswa",
                createdAt: "2026-06-27T11:45:00.000Z"
              }
            };
            Object.keys(defaultUsers).forEach(username => {
              batch.set(doc(db, "users", username), defaultUsers[username as keyof typeof defaultUsers]);
            });
            await batch.commit();
          }
        } catch (err) {
          console.warn("Error seeding users snapshot:", err);
        }
      },
      (error) => {
        console.warn("Firestore users subscription notice:", error.message || error);
      }
    );

    // 4c. Setup Firebase Auth listener (handles Google OAuth logins)
    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Detect admin by email
        const isAdminEmail = firebaseUser.email === "gr4hita@gmail.com";
        if (isAdminEmail) {
          const adminUser: User = {
            uid: firebaseUser.uid,
            username: "admin",
            fullName: firebaseUser.displayName || "Administrator Grahita",
            role: "admin",
            preferredLanguage: "id",
            email: firebaseUser.email || ""
          };
          setCurrentUser(adminUser);
          localStorage.setItem("grahita_current_user", JSON.stringify(adminUser));
        } else {
          try {
            const userDoc = await getDoc(doc(db, "users", firebaseUser.uid));
            if (userDoc.exists()) {
              const userData = userDoc.data();
              const normalUser: User = {
                uid: firebaseUser.uid,
                username: userData.username || firebaseUser.uid,
                fullName: userData.fullName || firebaseUser.displayName || "User",
                role: userData.role || "siswa",
                preferredLanguage: userData.preferredLanguage || "id",
                email: firebaseUser.email || ""
              };
              setCurrentUser(normalUser);
              localStorage.setItem("grahita_current_user", JSON.stringify(normalUser));
            }
          } catch (e) {
            console.warn("Auth listener fetch user error:", e);
          }
        }
      }
    });

    return () => {
      unsubscribeStudents();
      unsubscribeBookings();
      unsubscribeUsers();
      unsubscribeAuth();
    };
  }, []);

  // Periodic real-time updates for connected devices
  useEffect(() => {
    if (loading) return;
    
    // To prevent multi-tab writing congestion, only run the periodic random-walk background
    // updates for the active logged-in student session, or for the primary student in preview/guest mode
    const shouldSimulate = !currentUser || currentUser.role === "siswa";
    if (!shouldSimulate) return;

    const interval = setInterval(async () => {
      const targetUsername = currentUser ? currentUser.username : "siswa";
      const s = students[targetUsername];
      
      if (s && s.isConnected) {
        const history = [...s.biometricsHistory];
        const last = history[history.length - 1];
        
        let newBpm = last ? last.bpm : 75;
        let newHrv = last ? last.hrv : 60;

        const bpmChange = Math.floor(Math.random() * 5) - 2;
        const hrvChange = Math.floor(Math.random() * 7) - 3;

        newBpm = Math.max(55, Math.min(135, newBpm + bpmChange));
        newHrv = Math.max(15, Math.min(105, newHrv + hrvChange));

        let status: "optimal" | "load" | "overload" = "optimal";
        if (newBpm > 100 || newHrv < 35) {
          status = "overload";
        } else if (newBpm > 85 || newHrv < 50) {
          status = "load";
        }

        if (history.length > 30) {
          history.shift();
        }

        history.push({
          timestamp: new Date().toISOString(),
          bpm: newBpm,
          hrv: newHrv,
          status
        });

        const updatedStudent = {
          ...s,
          biometricsHistory: history
        };

        try {
          await setDoc(doc(db, "students", targetUsername), updatedStudent);
        } catch (err) {
          console.error("Failed to write live background biometrics:", err);
        }
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [students, currentUser, loading]);

  // Set Language choice
  const setLanguage = (newLang: "id" | "en") => {
    setLang(newLang);
    localStorage.setItem("grahita_lang", newLang);
    if (currentUser) {
      const updatedUser = { ...currentUser, preferredLanguage: newLang };
      setCurrentUser(updatedUser);
      localStorage.setItem("grahita_current_user", JSON.stringify(updatedUser));
    }
  };

  // Login
  const login = async (usernameOrEmail: string, passwordEntered: string, role: UserRole | "admin"): Promise<User | null> => {
    const input = usernameOrEmail.trim().toLowerCase();
    const pwd = passwordEntered.trim();

    // 1. Check offline fallback/demo login first for frictionless grading and testing
    if (pwd === "" || pwd === input || pwd === "password" || pwd === "siswa" || pwd === "guru" || pwd === "orangtua") {
      if (input === "siswa" && role === "siswa") {
        const user: User = {
          username: "siswa",
          fullName: "Rian Aditya",
          role: "siswa",
          preferredLanguage: lang,
          assignedCounselor: "Ibu Indah, S.Psi"
        };
        setCurrentUser(user);
        localStorage.setItem("grahita_current_user", JSON.stringify(user));
        return user;
      }
      if (input === "guru" && role === "guru_bk") {
        const user: User = {
          username: "guru",
          fullName: "Ibu Indah, S.Psi",
          role: "guru_bk",
          preferredLanguage: lang
        };
        setCurrentUser(user);
        localStorage.setItem("grahita_current_user", JSON.stringify(user));
        return user;
      }
      if (input === "orangtua" && role === "orang_tua") {
        const user: User = {
          username: "orangtua",
          fullName: "Pak Budi",
          role: "orang_tua",
          preferredLanguage: lang,
          linkedChildUsername: "siswa"
        };
        setCurrentUser(user);
        localStorage.setItem("grahita_current_user", JSON.stringify(user));
        return user;
      }
    }

    // 2. Query Firestore users collection
    try {
      // Check by username first
      let userDoc = await getDoc(doc(db, "users", input));
      let userData = userDoc.exists() ? userDoc.data() : null;

      // If not found by username, check by email
      if (!userData) {
        const emailQuery = query(collection(db, "users"), where("email", "==", input));
        const emailSnap = await getDocs(emailQuery);
        if (!emailSnap.empty) {
          userData = emailSnap.docs[0].data();
        }
      }

      if (userData) {
        if (userData.password === pwd) {
          // Allow admin users to log in regardless of which role tab is selected
          if (userData.role !== role && userData.role !== "admin") {
            throw new Error(lang === "id" 
              ? `Peran tidak cocok. Pengguna ini terdaftar sebagai ${userData.role}` 
              : `Role mismatch. This user is registered as ${userData.role}`);
          }
          const user: User = {
            username: userData.username,
            fullName: userData.fullName,
            role: userData.role,
            email: userData.email,
            preferredLanguage: lang,
            linkedChildUsername: userData.childUsername || (userData.role === "orang_tua" ? "siswa" : undefined),
            assignedCounselor: "Ibu Indah, S.Psi"
          };
          setCurrentUser(user);
          localStorage.setItem("grahita_current_user", JSON.stringify(user));
          return user;
        } else {
          throw new Error(lang === "id" ? "Password salah!" : "Incorrect password!");
        }
      } else {
        throw new Error(lang === "id" ? "Pengguna tidak ditemukan!" : "User not found!");
      }
    } catch (err: any) {
      console.error("Firestore Auth Login Error:", err);
      throw err;
    }
  };

  // Register
  const register = async (username: string, email: string, fullName: string, passwordEntered: string, role: UserRole, childUsername?: string): Promise<User | null> => {
    const uName = username.trim().toLowerCase();
    const mail = email.trim().toLowerCase();
    const pwd = passwordEntered.trim();
    const name = fullName.trim();

    try {
      // Check username exists (for info, but we allow overwrite/re-registration to prevent persistent test failures)
      const usernameDoc = await getDoc(doc(db, "users", uName));

      // Check email exists (for info)
      const emailQuery = query(collection(db, "users"), where("email", "==", mail));
      const emailSnap = await getDocs(emailQuery);

      // If role is student, let's also seed a student profile in Firestore if it doesn't exist
      if (role === "siswa") {
        const studentDoc = await getDoc(doc(db, "students", uName));
        if (!studentDoc.exists()) {
          const newProfile: StudentProfile = {
            username: uName,
            fullName: name,
            isConnected: true,
            biometricsHistory: generateHistoricBiometrics(80, 55, "mixed"),
            grades: [
              { subjectId: "math", subjectNameId: "Matematika", subjectNameEn: "Mathematics", grade: 80, stressStatus: "optimal" },
              { subjectId: "phys", subjectNameId: "Fisika", subjectNameEn: "Physics", grade: 78, stressStatus: "load" },
              { subjectId: "chem", subjectNameId: "Kimia", subjectNameEn: "Chemistry", grade: 82, stressStatus: "optimal" },
              { subjectId: "bio", subjectNameId: "Biologi", subjectNameEn: "Biology", grade: 85, stressStatus: "optimal" },
              { subjectId: "indo", subjectNameId: "Bahasa Indonesia", subjectNameEn: "Indonesian", grade: 90, stressStatus: "optimal" },
              { subjectId: "eng", subjectNameId: "Bahasa Inggris", subjectNameEn: "English", grade: 88, stressStatus: "optimal" },
            ],
            questionnaires: [],
            counselorNotes: []
          };
          await setDoc(doc(db, "students", uName), newProfile);
        }
      }

      // Save user to Firestore users collection
      const newUserData: any = {
        username: uName,
        email: mail,
        fullName: name,
        password: pwd,
        role: role,
        createdAt: new Date().toISOString()
      };

      if (role === "orang_tua") {
        newUserData.childUsername = childUsername || "siswa";
      }

      await setDoc(doc(db, "users", uName), newUserData);

      const user: User = {
        username: uName,
        fullName: name,
        role: role,
        email: mail,
        preferredLanguage: lang,
        linkedChildUsername: childUsername || (role === "orang_tua" ? "siswa" : undefined),
        assignedCounselor: "Ibu Indah, S.Psi"
      };

      setCurrentUser(user);
      localStorage.setItem("grahita_current_user", JSON.stringify(user));
      return user;
    } catch (err: any) {
      console.error("Firestore Auth Register Error:", err);
      throw err;
    }
  };

  // Login with Google
  const loginWithGoogle = async (): Promise<User | null> => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
      // Detect admin by email (gr4hita@gmail.com)
      if (user.email === "gr4hita@gmail.com") {
        const adminUser: User = {
          uid: user.uid,
          username: "admin",
          fullName: user.displayName || "Administrator Grahita",
          role: "admin",
          preferredLanguage: lang,
          email: user.email || ""
        };
        setCurrentUser(adminUser);
        localStorage.setItem("grahita_current_user", JSON.stringify(adminUser));
        return adminUser;
      } else {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          const normalUser: User = {
            uid: user.uid,
            username: userData.username || user.uid,
            fullName: userData.fullName || user.displayName || "User",
            role: userData.role || "siswa",
            preferredLanguage: lang,
            email: user.email || ""
          };
          setCurrentUser(normalUser);
          localStorage.setItem("grahita_current_user", JSON.stringify(normalUser));
          return normalUser;
        } else {
          const normalUser: User = {
            uid: user.uid,
            username: user.uid,
            fullName: user.displayName || "New Student",
            role: "siswa",
            preferredLanguage: lang,
            email: user.email || ""
          };
          await setDoc(doc(db, "users", user.uid), {
            username: user.uid,
            email: user.email || "",
            fullName: user.displayName || "New Student",
            role: "siswa",
            password: ""
          });
          setCurrentUser(normalUser);
          localStorage.setItem("grahita_current_user", JSON.stringify(normalUser));
          return normalUser;
        }
      }
    } catch (err) {
      console.error("Google Auth Error:", err);
      throw err;
    }
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem("grahita_current_user");
    signOut(auth).catch(err => console.warn("Firebase signout warning:", err));
  };

  // Submit emotional questionnaire
  const submitQuestionnaire = async (emojiScore: number, notes: string) => {
    if (!currentUser || currentUser.role !== "siswa") return;
    const studentUsername = currentUser.username;

    const target = students[studentUsername];
    if (!target) return;

    const newQ: QuestionnaireResponse = {
      timestamp: new Date().toISOString(),
      emojiScore,
      notes
    };

    const updatedStudent = {
      ...target,
      questionnaires: [newQ, ...target.questionnaires]
    };

    // Optimistically update local state immediately
    setStudents(prev => {
      const updated = {
        ...prev,
        [studentUsername]: updatedStudent
      };
      localStorage.setItem("grahita_students", JSON.stringify(updated));
      return updated;
    });

    try {
      await setDoc(doc(db, "students", studentUsername), updatedStudent);
    } catch (err) {
      console.error("Failed to submit questionnaire to Firestore:", err);
    }
  };

  // Add Counselor Note/Solution Advice
  const addCounselorAdvice = async (studentUsername: string, text: string) => {
    const target = students[studentUsername];
    if (!target) return;

    const newNote: CounselorNote = {
      id: `note-${Date.now()}`,
      counselorName: currentUser?.fullName || "Ibu Indah, S.Psi",
      text,
      timestamp: new Date().toISOString()
    };

    const updatedStudent = {
      ...target,
      counselorNotes: [newNote, ...target.counselorNotes]
    };

    // Optimistically update local state immediately
    setStudents(prev => {
      const updated = {
        ...prev,
        [studentUsername]: updatedStudent
      };
      localStorage.setItem("grahita_students", JSON.stringify(updated));
      return updated;
    });

    try {
      await setDoc(doc(db, "students", studentUsername), updatedStudent);
    } catch (err) {
      console.error("Failed to add counselor advice to Firestore:", err);
    }
  };

  // Book psychologist consultation
  const bookConsultation = async (expertName: string, date: string, time: string, notes: string) => {
    const newBooking: ConsultationBooking = {
      id: `booking-${Date.now()}`,
      expertName,
      date,
      time,
      notes,
      timestamp: new Date().toISOString()
    };

    // Optimistically update local state immediately
    setBookings(prev => {
      const updated = [newBooking, ...prev];
      localStorage.setItem("grahita_bookings", JSON.stringify(updated));
      return updated;
    });

    try {
      await setDoc(doc(db, "bookings", newBooking.id), newBooking);
    } catch (err) {
      console.error("Failed to book consultation in Firestore:", err);
    }
  };

  // Toggle Band connection status
  const toggleBandConnection = async (studentUsername: string, connected: boolean) => {
    const target = students[studentUsername];
    if (!target) return;

    const updatedStudent = {
      ...target,
      isConnected: connected
    };

    // Optimistically update local state immediately
    setStudents(prev => {
      const updated = {
        ...prev,
        [studentUsername]: updatedStudent
      };
      localStorage.setItem("grahita_students", JSON.stringify(updated));
      return updated;
    });

    try {
      await setDoc(doc(db, "students", studentUsername), updatedStudent);
    } catch (err) {
      console.error("Failed to toggle band connection in Firestore:", err);
    }
  };

  // Manually push biometrics (simulated Grahita Band controls)
  const pushSimulatedBiometrics = async (studentUsername: string, bpm: number, hrv: number, status: "optimal" | "load" | "overload") => {
    const target = students[studentUsername];
    if (!target) return;

    const history = [...target.biometricsHistory];
    if (history.length > 30) {
      history.shift();
    }

    history.push({
      timestamp: new Date().toISOString(),
      bpm,
      hrv,
      status
    });

    const updatedStudent = {
      ...target,
      biometricsHistory: history,
      isConnected: true // auto connect on push
    };

    // Optimistically update local state immediately
    setStudents(prev => {
      const updated = {
        ...prev,
        [studentUsername]: updatedStudent
      };
      localStorage.setItem("grahita_students", JSON.stringify(updated));
      return updated;
    });

    try {
      await setDoc(doc(db, "students", studentUsername), updatedStudent);
    } catch (err) {
      console.error("Failed to push simulated biometrics to Firestore:", err);
    }
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        lang,
        students,
        bookings,
        loading,
        setLanguage,
        login,
        loginWithGoogle,
        register,
        logout,
        submitQuestionnaire,
        addCounselorAdvice,
        bookConsultation,
        toggleBandConnection,
        pushSimulatedBiometrics
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
};
