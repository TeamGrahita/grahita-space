import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
import { db, auth, isFirebaseConfigured, ADMIN_EMAIL } from "../lib/firebase";
import {
  collection,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  writeBatch,
  DocumentData,
  QuerySnapshot
} from "firebase/firestore";
import {
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signOut,
  User as FirebaseUser
} from "firebase/auth";

export type DemoAccount = "siswa" | "guru" | "orangtua" | "admin";

interface AppContextProps {
  currentUser: User | null;
  lang: "id" | "en";
  students: Record<string, StudentProfile>;
  bookings: ConsultationBooking[];
  loading: boolean;
  setLanguage: (lang: "id" | "en") => void;
  login: (usernameOrEmail: string, passwordEntered: string, role: UserRole | "admin") => Promise<User | null>;
  loginDemo: (account: DemoAccount) => Promise<User | null>;
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


function createDefaultStudentProfile(username: string, fullName: string): StudentProfile {
  return {
    username,
    fullName,
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
}

const DEFAULT_COUNSELOR = "Ibu Indah, S.Psi";
const CURRENT_USER_KEY = "grahita_current_user";

interface ProfileInput {
  username: string;
  fullName: string;
  role: UserRole;
  childUsername?: string;
}

// Demo accounts behind the quick-login buttons (booth presentations).
// These credentials ship in the client bundle, so treat them as public.
const DEMO_ACCOUNTS: Record<Exclude<DemoAccount, "admin">, ProfileInput & { email: string; password: string }> = {
  siswa: { username: "siswa", email: "siswa@grahita.id", password: "siswa-demo", fullName: "Rian Aditya", role: "siswa" },
  guru: { username: "guru", email: "indah@grahita.id", password: "guru-demo", fullName: "Ibu Indah, S.Psi", role: "guru_bk" },
  orangtua: { username: "orangtua", email: "budi@grahita.id", password: "orangtua-demo", fullName: "Pak Budi", role: "orang_tua", childUsername: "siswa" }
};

// With email-enumeration protection Firebase reports every bad login as invalid-credential
const WRONG_CREDENTIAL_CODES = ["auth/invalid-credential", "auth/invalid-login-credentials", "auth/user-not-found", "auth/wrong-password"];

function authErrorMessage(err: any, lang: "id" | "en"): string {
  const id = lang === "id";
  switch (err?.code) {
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
    case "auth/user-not-found":
    case "auth/wrong-password":
      return id ? "Username/email atau password salah!" : "Incorrect username/email or password!";
    case "auth/email-already-in-use":
      return id ? "Email ini sudah terdaftar pada akun lain." : "This email is already registered to another account.";
    case "auth/weak-password":
      return id ? "Password minimal 6 karakter." : "Password must be at least 6 characters.";
    case "auth/invalid-email":
      return id ? "Format email tidak valid!" : "Invalid email format!";
    case "auth/too-many-requests":
      return id ? "Terlalu banyak percobaan. Coba lagi beberapa saat." : "Too many attempts. Please try again later.";
    case "auth/network-request-failed":
      return id ? "Tidak ada koneksi ke server." : "Cannot reach the server.";
    case "auth/popup-closed-by-user":
    case "auth/cancelled-popup-request":
      return id ? "Login Google dibatalkan." : "Google sign-in was cancelled.";
    case "auth/operation-not-allowed":
      return id ? "Metode login ini belum diaktifkan di Firebase Console." : "This sign-in method is not enabled in the Firebase Console.";
    case "permission-denied":
      return id ? "Akses ditolak oleh aturan keamanan database." : "Access denied by the database security rules.";
    default:
      return err?.message || (id ? "Terjadi kesalahan autentikasi" : "Authentication error occurred");
  }
}

function isAdminAccount(firebaseUser: FirebaseUser): boolean {
  return firebaseUser.email === ADMIN_EMAIL && firebaseUser.emailVerified;
}

function profileToUser(uid: string, data: DocumentData, lang: "id" | "en"): User {
  return {
    uid,
    username: data.username,
    fullName: data.fullName || data.username || "User",
    role: data.role,
    email: data.email,
    preferredLanguage: data.preferredLanguage || lang,
    linkedChildUsername: data.childUsername || (data.role === "orang_tua" ? "siswa" : undefined),
    assignedCounselor: DEFAULT_COUNSELOR
  };
}

async function loadProfile(firebaseUser: FirebaseUser, lang: "id" | "en"): Promise<User | null> {
  if (isAdminAccount(firebaseUser)) {
    return {
      uid: firebaseUser.uid,
      username: "admin",
      fullName: firebaseUser.displayName || "Administrator Grahita",
      role: "admin",
      preferredLanguage: lang,
      email: firebaseUser.email || ""
    };
  }
  const snap = await getDoc(doc(db, "users", firebaseUser.uid));
  return snap.exists() ? profileToUser(firebaseUser.uid, snap.data(), lang) : null;
}

// Profile (users/{uid}) and username claim (usernames/{username}) are written together;
// firestore.rules only accept a profile whose username is claimed in the same batch.
function profileBatch(uid: string, email: string, input: ProfileInput) {
  const batch = writeBatch(db);
  const data: Record<string, string> = {
    username: input.username,
    email,
    fullName: input.fullName,
    role: input.role,
    createdAt: new Date().toISOString()
  };
  if (input.role === "orang_tua") {
    data.childUsername = input.childUsername || "siswa";
  }
  batch.set(doc(db, "users", uid), data);
  batch.set(doc(db, "usernames", input.username), { uid, email });
  return { batch, data };
}

async function ensureStudentProfile(username: string, fullName: string, useDemoSeed = false) {
  const ref = doc(db, "students", username);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    const seeded = getSeededStudents();
    await setDoc(ref, useDemoSeed && seeded[username] ? seeded[username] : createDefaultStudentProfile(username, fullName));
  }
}

function offlineDemoUser(account: DemoAccount, lang: "id" | "en"): User {
  if (account === "admin") {
    return { username: "admin", fullName: "Administrator Grahita", role: "admin", preferredLanguage: lang };
  }
  const demo = DEMO_ACCOUNTS[account];
  return {
    username: demo.username,
    fullName: demo.fullName,
    role: demo.role,
    preferredLanguage: lang,
    linkedChildUsername: demo.childUsername,
    assignedCounselor: demo.role === "siswa" ? DEFAULT_COUNSELOR : undefined
  };
}

// Browser cache of the data is only used in offline mode; with Firebase, data stays out of
// localStorage so it does not leak between people sharing a device (e.g. a booth laptop).
function cacheLocally(key: string, value: unknown) {
  if (!isFirebaseConfigured) {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

function sortBookings(list: ConsultationBooking[]) {
  return list.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [lang, setLang] = useState<"id" | "en">("id");
  const [students, setStudents] = useState<Record<string, StudentProfile>>({});
  const [bookings, setBookings] = useState<ConsultationBooking[]>([]);
  const [loading, setLoading] = useState(true);

  // Login/register flows set the user themselves; the auth listener must not race them
  const authFlowActive = useRef(false);

  const msg = (idText: string, enText: string) => (lang === "id" ? idText : enText);

  const rememberUser = (user: User | null) => {
    setCurrentUser(user);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      if (user.preferredLanguage) setLang(user.preferredLanguage);
    } else {
      localStorage.removeItem(CURRENT_USER_KEY);
    }
  };

  // Initialize session: Firebase Auth when configured, otherwise the offline local session
  useEffect(() => {
    const savedLang = localStorage.getItem("grahita_lang");
    const initialLang: "id" | "en" = savedLang === "en" ? "en" : "id";
    setLang(initialLang);

    if (!isFirebaseConfigured) {
      const savedUser = localStorage.getItem(CURRENT_USER_KEY);
      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setCurrentUser(parsedUser);
          setLang(parsedUser.preferredLanguage || initialLang);
        } catch (err) {
          console.error("Failed to parse saved user, clearing session:", err);
          localStorage.removeItem(CURRENT_USER_KEY);
        }
      }

      const savedStudents = localStorage.getItem("grahita_students");
      try {
        setStudents(savedStudents ? JSON.parse(savedStudents) : getSeededStudents());
      } catch (err) {
        console.error("Failed to parse saved students, fallback to seed:", err);
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

      setLoading(false);
      return;
    }

    // Data from an older (pre-Firebase-Auth) version must not survive in this browser
    localStorage.removeItem("grahita_students");
    localStorage.removeItem("grahita_bookings");

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (authFlowActive.current) return;
      try {
        if (!firebaseUser) {
          rememberUser(null);
          return;
        }
        const user = await loadProfile(firebaseUser, initialLang);
        if (user) {
          rememberUser(user);
        } else {
          // Signed in to Firebase but without a profile (e.g. deleted by admin)
          rememberUser(null);
          await signOut(auth);
        }
      } catch (err) {
        console.warn("Auth listener failed to load the user profile:", err);
        rememberUser(null);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Real-time Firestore subscriptions, scoped to what the signed-in role may read
  useEffect(() => {
    if (!isFirebaseConfigured || !currentUser) return;
    const { role, username, linkedChildUsername } = currentUser;
    const unsubscribers: Array<() => void> = [];

    const onBookings = (snapshot: QuerySnapshot<DocumentData>) => {
      const bookingsData: ConsultationBooking[] = [];
      snapshot.forEach((d) => bookingsData.push(d.data() as ConsultationBooking));
      setBookings(sortBookings(bookingsData));
    };

    if (role === "admin" || role === "guru_bk") {
      unsubscribers.push(onSnapshot(
        collection(db, "students"),
        async (snapshot) => {
          if (snapshot.empty) {
            // An empty snapshot from the offline cache says nothing about the server
            if (snapshot.metadata.fromCache) return;
            console.log("Firestore students collection is empty. Seeding the demo student roster...");
            const seeded = getSeededStudents();
            setStudents(seeded);
            try {
              const batch = writeBatch(db);
              Object.keys(seeded).forEach(u => batch.set(doc(db, "students", u), seeded[u]));
              await batch.commit();
            } catch (err) {
              console.warn("Failed to seed student roster:", err);
            }
            return;
          }
          const studentsData: Record<string, StudentProfile> = {};
          snapshot.forEach((d) => {
            studentsData[d.id] = d.data() as StudentProfile;
          });
          setStudents(studentsData);
        },
        (error) => console.warn("Firestore students subscription error:", error.message || error)
      ));
      unsubscribers.push(onSnapshot(
        collection(db, "bookings"),
        onBookings,
        (error) => console.warn("Firestore bookings subscription error:", error.message || error)
      ));
    } else {
      const target = role === "orang_tua" ? (linkedChildUsername || "siswa") : username;
      unsubscribers.push(onSnapshot(
        doc(db, "students", target),
        (snap) => {
          if (!snap.exists()) return;
          setStudents(prev => ({ ...prev, [target]: snap.data() as StudentProfile }));
        },
        (error) => console.warn("Firestore student subscription error:", error.message || error)
      ));
      if (role === "siswa") {
        unsubscribers.push(onSnapshot(
          query(collection(db, "bookings"), where("studentUsername", "==", username)),
          onBookings,
          (error) => console.warn("Firestore bookings subscription error:", error.message || error)
        ));
      }
    }

    return () => unsubscribers.forEach(unsubscribe => unsubscribe());
  }, [currentUser?.uid, currentUser?.role, currentUser?.username, currentUser?.linkedChildUsername]);

  // Update a student locally right away, then persist only the changed fields
  const saveStudentFields = async (studentUsername: string, fields: Partial<StudentProfile>) => {
    setStudents(prev => {
      if (!prev[studentUsername]) return prev;
      const updated = { ...prev, [studentUsername]: { ...prev[studentUsername], ...fields } };
      cacheLocally("grahita_students", updated);
      return updated;
    });
    if (!isFirebaseConfigured) return;
    try {
      await updateDoc(doc(db, "students", studentUsername), fields);
    } catch (err) {
      console.error(`Failed to update student "${studentUsername}" in Firestore:`, err);
    }
  };

  // Periodic real-time updates for the logged-in student's connected band
  useEffect(() => {
    if (loading || !currentUser || currentUser.role !== "siswa") return;

    const interval = setInterval(() => {
      const targetUsername = currentUser.username;
      const s = students[targetUsername];
      if (!s || !s.isConnected) return;

      const history = [...(s.biometricsHistory || [])];
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

      saveStudentFields(targetUsername, { biometricsHistory: history });
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
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(updatedUser));
      if (isFirebaseConfigured && currentUser.uid && currentUser.role !== "admin") {
        updateDoc(doc(db, "users", currentUser.uid), { preferredLanguage: newLang })
          .catch(err => console.warn("Failed to save language preference:", err));
      }
    }
  };

  const runAuthFlow = async <T,>(flow: () => Promise<T>): Promise<T> => {
    authFlowActive.current = true;
    try {
      return await flow();
    } catch (err: any) {
      console.error("Auth flow error:", err);
      throw new Error(authErrorMessage(err, lang));
    } finally {
      authFlowActive.current = false;
    }
  };

  const adminUsesGoogleError = () =>
    new Error(msg("Admin masuk menggunakan tombol Google.", "The admin signs in with the Google button."));

  // One-time move of a legacy account (plaintext password in Firestore) to Firebase Auth
  const migrateLegacyAccount = async (legacyId: string, legacyData: DocumentData, email: string, pwd: string): Promise<User> => {
    if (pwd.length < 6) {
      throw new Error(msg(
        "Password lama kurang dari 6 karakter sehingga akun tidak bisa dipindahkan otomatis. Minta admin membuat ulang akun Anda.",
        "Your old password is shorter than 6 characters, so the account cannot be migrated automatically. Ask the admin to recreate it."
      ));
    }
    const credential = await createUserWithEmailAndPassword(auth, email, pwd);
    try {
      const username = legacyData.username || legacyId;
      const { batch, data } = profileBatch(credential.user.uid, credential.user.email || email, {
        username,
        fullName: legacyData.fullName || username,
        role: legacyData.role,
        childUsername: legacyData.childUsername
      });
      // Remove the plaintext-password document in the same write
      batch.delete(doc(db, "users", legacyId));
      await batch.commit();
      if (data.role === "siswa") {
        await ensureStudentProfile(username, data.fullName);
      }
      const user = profileToUser(credential.user.uid, data, lang);
      rememberUser(user);
      return user;
    } catch (err) {
      // Roll back so the migration can be retried
      await credential.user.delete().catch(() => signOut(auth));
      throw err;
    }
  };

  // Login with username or email + password
  const login = async (usernameOrEmail: string, passwordEntered: string, role: UserRole | "admin"): Promise<User | null> => {
    const input = usernameOrEmail.trim().toLowerCase();
    const pwd = passwordEntered.trim();

    if (!isFirebaseConfigured) {
      // Offline mode: only the local demo accounts exist
      const demoKey = (Object.keys(DEMO_ACCOUNTS) as Array<keyof typeof DEMO_ACCOUNTS>)
        .find(k => DEMO_ACCOUNTS[k].username === input);
      if (demoKey && DEMO_ACCOUNTS[demoKey].role === role) {
        const user = offlineDemoUser(demoKey, lang);
        rememberUser(user);
        return user;
      }
      throw new Error(msg(
        "Mode offline (Firebase belum dikonfigurasi): hanya akun demo yang tersedia.",
        "Offline mode (Firebase not configured): only the demo accounts are available."
      ));
    }

    return runAuthFlow(async () => {
      let email = input.includes("@") ? input : "";
      let legacy: { id: string; data: DocumentData } | null = null;

      if (!email) {
        const mapping = await getDoc(doc(db, "usernames", input));
        if (mapping.exists()) {
          email = mapping.data().email;
        } else {
          const legacySnap = await getDoc(doc(db, "users", input));
          if (legacySnap.exists() && "password" in legacySnap.data()) {
            legacy = { id: input, data: legacySnap.data() };
            email = String(legacy.data.email || "").toLowerCase();
          }
        }
      }

      if (!email) {
        throw new Error(msg("Pengguna tidak ditemukan!", "User not found!"));
      }
      if (email === ADMIN_EMAIL) {
        throw adminUsesGoogleError();
      }

      let firebaseUser: FirebaseUser | null = null;
      try {
        firebaseUser = (await signInWithEmailAndPassword(auth, email, pwd)).user;
      } catch (err: any) {
        if (!legacy || !WRONG_CREDENTIAL_CODES.includes(err?.code)) throw err;
      }

      if (!firebaseUser) {
        // First login of a legacy account: check the old password, then move it to Firebase Auth
        if (!legacy || legacy.data.password !== pwd) {
          throw new Error(msg("Password salah!", "Incorrect password!"));
        }
        if (legacy.data.role !== role) {
          throw new Error(msg(
            `Peran tidak cocok. Pengguna ini terdaftar sebagai ${legacy.data.role}`,
            `Role mismatch. This user is registered as ${legacy.data.role}`
          ));
        }
        return migrateLegacyAccount(legacy.id, legacy.data, email, pwd);
      }

      const user = await loadProfile(firebaseUser, lang);
      if (!user) {
        await signOut(auth);
        throw new Error(msg("Profil pengguna tidak ditemukan. Hubungi admin.", "User profile not found. Contact the admin."));
      }
      if (user.role !== role && user.role !== "admin") {
        await signOut(auth);
        throw new Error(msg(
          `Peran tidak cocok. Pengguna ini terdaftar sebagai ${user.role}`,
          `Role mismatch. This user is registered as ${user.role}`
        ));
      }
      rememberUser(user);
      return user;
    });
  };

  // Register a new account in Firebase Auth + its Firestore profile
  const register = async (username: string, email: string, fullName: string, passwordEntered: string, role: UserRole, childUsername?: string): Promise<User | null> => {
    const uName = username.trim().toLowerCase();
    const mail = email.trim().toLowerCase();
    const pwd = passwordEntered.trim();
    const name = fullName.trim();

    if (!isFirebaseConfigured) {
      throw new Error(msg(
        "Pendaftaran membutuhkan Firebase. Mode offline hanya mendukung akun demo.",
        "Registration requires Firebase. Offline mode only supports the demo accounts."
      ));
    }

    return runAuthFlow(async () => {
      if (!/^[a-z0-9_.-]{3,30}$/.test(uName)) {
        throw new Error(msg(
          "Username 3-30 karakter: huruf kecil, angka, titik, garis bawah, atau strip.",
          "Username must be 3-30 characters: lowercase letters, digits, dots, underscores or dashes."
        ));
      }
      if (role === "admin" || mail === ADMIN_EMAIL) {
        throw adminUsesGoogleError();
      }
      if (pwd.length < 6) {
        throw new Error(msg("Password minimal 6 karakter.", "Password must be at least 6 characters."));
      }

      const [mapping, legacy] = await Promise.all([
        getDoc(doc(db, "usernames", uName)),
        getDoc(doc(db, "users", uName))
      ]);
      if (mapping.exists() || legacy.exists()) {
        throw new Error(msg("Username sudah dipakai!", "Username is already taken!"));
      }

      const credential = await createUserWithEmailAndPassword(auth, mail, pwd);
      try {
        const { batch, data } = profileBatch(credential.user.uid, credential.user.email || mail, {
          username: uName,
          fullName: name,
          role,
          childUsername: childUsername?.trim().toLowerCase()
        });
        await batch.commit();
        if (role === "siswa") {
          await ensureStudentProfile(uName, name);
        }
        const user = profileToUser(credential.user.uid, data, lang);
        rememberUser(user);
        return user;
      } catch (err) {
        // Roll back so the same email can register again
        await credential.user.delete().catch(() => signOut(auth));
        throw err;
      }
    });
  };

  // Login with Google (the admin account signs in this way)
  const loginWithGoogle = async (): Promise<User | null> => {
    if (!isFirebaseConfigured) {
      throw new Error(msg("Login Google membutuhkan Firebase.", "Google sign-in requires Firebase."));
    }
    return runAuthFlow(async () => {
      const { user: firebaseUser } = await signInWithPopup(auth, new GoogleAuthProvider());
      let user = await loadProfile(firebaseUser, lang);
      if (!user) {
        // First Google login: create a student profile keyed by the Firebase uid
        const { batch, data } = profileBatch(firebaseUser.uid, firebaseUser.email || "", {
          username: firebaseUser.uid,
          fullName: firebaseUser.displayName || "New Student",
          role: "siswa"
        });
        await batch.commit();
        await ensureStudentProfile(firebaseUser.uid, data.fullName);
        user = profileToUser(firebaseUser.uid, data, lang);
      }
      rememberUser(user);
      return user;
    });
  };

  // Quick-login buttons for demos
  const loginDemo = async (account: DemoAccount): Promise<User | null> => {
    if (!isFirebaseConfigured) {
      const user = offlineDemoUser(account, lang);
      rememberUser(user);
      return user;
    }
    // Never ship the admin password in the client: the admin demo uses Google sign-in
    if (account === "admin") {
      return loginWithGoogle();
    }

    const demo = DEMO_ACCOUNTS[account];
    return runAuthFlow(async () => {
      let firebaseUser: FirebaseUser;
      try {
        firebaseUser = (await signInWithEmailAndPassword(auth, demo.email, demo.password)).user;
      } catch (err: any) {
        if (!WRONG_CREDENTIAL_CODES.includes(err?.code)) throw err;
        // First use on this Firebase project: create the demo account
        firebaseUser = (await createUserWithEmailAndPassword(auth, demo.email, demo.password)).user;
      }

      let user = await loadProfile(firebaseUser, lang);
      if (!user) {
        const { batch, data } = profileBatch(firebaseUser.uid, firebaseUser.email || demo.email, demo);
        // Take over (and remove) the old plaintext-password demo document, if any
        const legacy = await getDoc(doc(db, "users", demo.username));
        if (legacy.exists() && legacy.data().email === demo.email) {
          batch.delete(legacy.ref);
        }
        await batch.commit();
        user = profileToUser(firebaseUser.uid, data, lang);
      }
      if (user.role === "siswa") {
        await ensureStudentProfile(user.username, user.fullName, true);
      }
      rememberUser(user);
      return user;
    });
  };

  // Logout
  const logout = () => {
    rememberUser(null);
    if (isFirebaseConfigured) {
      setStudents({});
      setBookings([]);
      signOut(auth).catch(err => console.warn("Firebase signout warning:", err));
    }
  };

  // Submit emotional questionnaire
  const submitQuestionnaire = async (emojiScore: number, notes: string) => {
    if (!currentUser || currentUser.role !== "siswa") return;
    const target = students[currentUser.username];
    if (!target) return;

    const newQ: QuestionnaireResponse = {
      timestamp: new Date().toISOString(),
      emojiScore,
      notes
    };
    await saveStudentFields(currentUser.username, {
      questionnaires: [newQ, ...(target.questionnaires || [])]
    });
  };

  // Add Counselor Note/Solution Advice
  const addCounselorAdvice = async (studentUsername: string, text: string) => {
    const target = students[studentUsername];
    if (!target) return;

    const newNote: CounselorNote = {
      id: `note-${Date.now()}`,
      counselorName: currentUser?.fullName || DEFAULT_COUNSELOR,
      text,
      timestamp: new Date().toISOString()
    };
    await saveStudentFields(studentUsername, {
      counselorNotes: [newNote, ...(target.counselorNotes || [])]
    });
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
    // Firestore rejects undefined fields, so only attach the owner when known
    if (currentUser?.username) {
      newBooking.studentUsername = currentUser.username;
    }

    // Optimistically update local state immediately
    setBookings(prev => {
      const updated = [newBooking, ...prev];
      cacheLocally("grahita_bookings", updated);
      return updated;
    });

    if (!isFirebaseConfigured) return;
    try {
      await setDoc(doc(db, "bookings", newBooking.id), newBooking);
    } catch (err) {
      console.error("Failed to book consultation in Firestore:", err);
    }
  };

  // Toggle Band connection status
  const toggleBandConnection = async (studentUsername: string, connected: boolean) => {
    if (!students[studentUsername]) return;
    await saveStudentFields(studentUsername, { isConnected: connected });
  };

  // Manually push biometrics (simulated Grahita Band controls)
  const pushSimulatedBiometrics = async (studentUsername: string, bpm: number, hrv: number, status: "optimal" | "load" | "overload") => {
    const target = students[studentUsername];
    if (!target) return;

    const history = [...(target.biometricsHistory || [])];
    if (history.length > 30) {
      history.shift();
    }
    history.push({
      timestamp: new Date().toISOString(),
      bpm,
      hrv,
      status
    });

    // auto connect on push
    await saveStudentFields(studentUsername, { biometricsHistory: history, isConnected: true });
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
        loginDemo,
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
