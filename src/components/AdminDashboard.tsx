import React, { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import { db } from "../lib/firebase";
import { 
  collection, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  setDoc,
  writeBatch
} from "firebase/firestore";
import { 
  Users, 
  Mail, 
  Calendar, 
  ShieldCheck, 
  Search, 
  FileText, 
  HeartPulse, 
  Activity, 
  GraduationCap, 
  Trash2, 
  PlusCircle, 
  Database, 
  Sparkles, 
  RefreshCw, 
  Layers, 
  Lock, 
  AlertCircle, 
  X,
  CheckCircle,
  Clock,
  ChevronRight,
  UserCheck
} from "lucide-react";
import { StudentProfile, UserRole } from "../types";

export const AdminDashboard: React.FC = () => {
  const { lang, logout, students } = useApp();
  const [users, setUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  
  // Selected user for details
  const [selectedUser, setSelectedUser] = useState<any | null>(null);
  
  // New user registration modal/form within admin panel
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUsername, setNewUsername] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newRole, setNewRole] = useState<UserRole>("siswa");
  const [newChildUsername, setNewChildUsername] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");

  // Counselor Notes editor for selected student
  const [newNoteText, setNewNoteText] = useState("");
  const [noteSuccess, setNoteSuccess] = useState("");

  // Load all users from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "users"),
      (snapshot) => {
        const usersList: any[] = [];
        snapshot.forEach((doc) => {
          const data = doc.data();
          usersList.push({
            id: doc.id,
            ...data,
            // Older or hand-made docs may lack a username; fall back to the doc id so sorting/search don't crash
            username: data.username || doc.id
          });
        });
        // Sort by createdAt or username
        usersList.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA || a.username.localeCompare(b.username);
        });
        setUsers(usersList);
        setLoadingUsers(false);
      },
      (error) => {
        console.error("Error reading users in Admin view:", error);
        setLoadingUsers(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Sync selected user when users or students update
  useEffect(() => {
    if (selectedUser) {
      const updated = users.find(u => u.username === selectedUser.username);
      if (updated) {
        setSelectedUser(updated);
      }
    }
  }, [users]);

  // Handle deleting a user from database
  const handleDeleteUser = async (username: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm(lang === "id" 
      ? `Apakah Anda yakin ingin menghapus pengguna "${username}"?` 
      : `Are you sure you want to delete user "${username}"?`)) {
      return;
    }

    try {
      await deleteDoc(doc(db, "users", username));
      if (selectedUser?.username === username) {
        setSelectedUser(null);
      }
    } catch (err: any) {
      alert("Error deleting user: " + err.message);
    }
  };

  // Handle adding a new user
  const handleAddUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    const usernameClean = newUsername.trim().toLowerCase();
    const emailClean = newEmail.trim().toLowerCase();
    const nameClean = newFullName.trim();
    const pwdClean = newPassword.trim();

    if (!usernameClean || !emailClean || !nameClean || !pwdClean) {
      setFormError(lang === "id" ? "Semua kolom harus diisi!" : "All fields are required!");
      return;
    }

    // Check if username already exists
    if (users.some(u => u.username === usernameClean)) {
      setFormError(lang === "id" ? "Username sudah terdaftar!" : "Username already exists!");
      return;
    }

    try {
      // Seed a default student profile if the role is student
      if (newRole === "siswa") {
        const studentProfile: StudentProfile = {
          username: usernameClean,
          fullName: nameClean,
          isConnected: true,
          biometricsHistory: [
            { timestamp: new Date().toISOString(), bpm: 75, hrv: 60, status: "optimal" }
          ],
          grades: [
            { subjectId: "math", subjectNameId: "Matematika", subjectNameEn: "Mathematics", grade: 80, stressStatus: "optimal" },
            { subjectId: "phys", subjectNameId: "Fisika", subjectNameEn: "Physics", grade: 78, stressStatus: "load" },
            { subjectId: "chem", subjectNameId: "Kimia", subjectNameEn: "Chemistry", grade: 82, stressStatus: "optimal" }
          ],
          questionnaires: [],
          counselorNotes: []
        };
        await setDoc(doc(db, "students", usernameClean), studentProfile);
      }

      // Save user record
      const userData: any = {
        username: usernameClean,
        email: emailClean,
        fullName: nameClean,
        password: pwdClean,
        role: newRole,
        createdAt: new Date().toISOString()
      };

      if (newRole === "orang_tua") {
        userData.childUsername = newChildUsername.trim().toLowerCase() || "siswa";
      }

      await setDoc(doc(db, "users", usernameClean), userData);
      
      setFormSuccess(lang === "id" ? "Pengguna berhasil ditambahkan!" : "User successfully registered!");
      
      // Reset form
      setNewUsername("");
      setNewEmail("");
      setNewFullName("");
      setNewPassword("");
      setNewRole("siswa");
      setNewChildUsername("");
      
      setTimeout(() => setShowAddUser(false), 1500);
    } catch (err: any) {
      setFormError("Error registering user: " + err.message);
    }
  };

  // Add counselor notes from Admin interface
  const handleAddCounselorNote = async () => {
    if (!newNoteText.trim() || !selectedUser) return;
    setNoteSuccess("");

    const studentUsername = selectedUser.username;
    const studentProfile = students[studentUsername];

    if (!studentProfile) {
      alert(lang === "id" ? "Profil siswa tidak ditemukan!" : "Student profile not found!");
      return;
    }

    const note = {
      id: `note-${Date.now()}`,
      counselorName: "Administrator Grahita",
      text: newNoteText.trim(),
      timestamp: new Date().toISOString()
    };

    const updatedProfile = {
      ...studentProfile,
      counselorNotes: [note, ...(studentProfile.counselorNotes || [])]
    };

    try {
      await setDoc(doc(db, "students", studentUsername), updatedProfile);
      setNoteSuccess(lang === "id" ? "Catatan bimbingan berhasil disimpan!" : "Counselor advice saved successfully!");
      setNewNoteText("");
      setTimeout(() => setNoteSuccess(""), 3000);
    } catch (err: any) {
      alert("Error adding counselor note: " + err.message);
    }
  };

  // Seed sample database for stress triage
  const handleResetAndSeedDatabase = async () => {
    if (!window.confirm(lang === "id" 
      ? "Apakah Anda yakin ingin memulihkan database ke profil demo bawaan?" 
      : "Are you sure you want to reset and seed the database with default demo accounts?")) {
      return;
    }

    try {
      const batch = writeBatch(db);
      
      // Default users
      const defaultUsers: Record<string, any> = {
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
        }
      };

      Object.keys(defaultUsers).forEach(username => {
        batch.set(doc(db, "users", username), defaultUsers[username]);
      });

      // Default Student Profiles
      const seededStudents: Record<string, StudentProfile> = {
        siswa: {
          username: "siswa",
          fullName: "Rian Aditya",
          isConnected: true,
          biometricsHistory: [
            { timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), bpm: 82, hrv: 55, status: "optimal" },
            { timestamp: new Date(Date.now() - 3600000).toISOString(), bpm: 104, hrv: 32, status: "overload" },
            { timestamp: new Date().toISOString(), bpm: 92, hrv: 44, status: "load" }
          ],
          grades: [
            { subjectId: "math", subjectNameId: "Matematika", subjectNameEn: "Mathematics", grade: 68, stressStatus: "overload" },
            { subjectId: "phys", subjectNameId: "Fisika", subjectNameEn: "Physics", grade: 72, stressStatus: "overload" },
            { subjectId: "chem", subjectNameId: "Kimia", subjectNameEn: "Chemistry", grade: 82, stressStatus: "load" },
            { subjectId: "bio", subjectNameId: "Biologi", subjectNameEn: "Biology", grade: 88, stressStatus: "optimal" },
            { subjectId: "indo", subjectNameId: "Bahasa Indonesia", subjectNameEn: "Indonesian", grade: 94, stressStatus: "optimal" },
            { subjectId: "eng", subjectNameId: "Bahasa Inggris", subjectNameEn: "English", grade: 90, stressStatus: "optimal" }
          ],
          questionnaires: [
            { timestamp: new Date(Date.now() - 86400000).toISOString(), emojiScore: 2, notes: "Feeling overwhelmed by the physics exam tomorrow." }
          ],
          counselorNotes: [
            { id: "note-1", counselorName: "Ibu Indah, S.Psi", text: "Encouraged 4-7-8 deep breathing sequences before exams.", timestamp: new Date(Date.now() - 86400000).toISOString() }
          ]
        }
      };

      Object.keys(seededStudents).forEach(username => {
        batch.set(doc(db, "students", username), seededStudents[username]);
      });

      await batch.commit();
      alert(lang === "id" ? "Seeder berhasil dijalankan!" : "Demo database seeded successfully!");
    } catch (err: any) {
      alert("Error seeding: " + err.message);
    }
  };

  // Filtered users
  const filteredUsers = users.filter((u) => {
    const matchesSearch = 
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email && u.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (u.fullName && u.fullName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesRole = roleFilter === "all" || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  // Calculate system-wide statistics
  const stats = {
    totalUsers: users.length,
    studentsCount: users.filter(u => u.role === "siswa").length,
    parentsCount: users.filter(u => u.role === "orang_tua").length,
    counselorsCount: users.filter(u => u.role === "guru_bk").length,
    activeStressLoad: (Object.values(students) as StudentProfile[]).filter(s => {
      const history = s.biometricsHistory;
      if (!history || history.length === 0) return false;
      const lastStatus = history[history.length - 1].status;
      return lastStatus === "overload" || lastStatus === "load";
    }).length
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "siswa":
        return "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20";
      case "guru_bk":
        return "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20";
      case "orang_tua":
        return "bg-amber-500/10 text-amber-400 border border-amber-500/20";
      case "admin":
        return "bg-rose-500/10 text-rose-400 border border-rose-500/20";
      default:
        return "bg-slate-500/10 text-slate-400 border border-slate-500/20";
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return "-";
    try {
      const date = new Date(isoString);
      return date.toLocaleDateString(lang === "id" ? "id-ID" : "en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch {
      return isoString;
    }
  };

  const selectedStudentProfile = selectedUser?.role === "siswa" ? students[selectedUser.username] : null;

  return (
    <div className="space-y-8" id="admin-dashboard-root">
      
      {/* 1. TOP HEADER WITH ADMIN INDICATOR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#33374F]/40 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold font-sans text-white tracking-tight">
              {lang === "id" ? "Panel Kontrol Administrator" : "Administrator Control Panel"}
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-0.5 rounded-full animate-pulse uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin Mode
            </span>
          </div>
          <p className="text-sm text-[#8C90AC] mt-1">
            {lang === "id" 
              ? "Kelola semua data pengguna, status biometrik bimbingan siswa Grahita, serta hak akses." 
              : "Manage all users, student Grahita biosensors, counseling statuses, and credentials."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleResetAndSeedDatabase}
            className="px-3.5 py-2 bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 hover:border-slate-600 rounded-xl text-xs text-[#8C90AC] hover:text-white font-bold flex items-center gap-2 transition-all cursor-pointer"
            title="Seed Default Demo Accounts"
          >
            <Database className="w-4 h-4 text-cyan-400" />
            {lang === "id" ? "Reset & Seeder" : "Reset & Seeder"}
          </button>

          <button
            onClick={() => setShowAddUser(true)}
            className="px-3.5 py-2 bg-[#00D9A0] hover:bg-[#00B887] text-[#0B0D1F] rounded-xl text-xs font-bold flex items-center gap-2 shadow-[0_0_15px_rgba(0,217,160,0.15)] transition-all cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            {lang === "id" ? "Tambah Pengguna" : "Add User"}
          </button>
        </div>
      </div>

      {/* 2. ADMIN RECOMMENDATION: SYSTEM ANALYTICS & TRIAGE GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric 1 */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-[#3FA9E0]/30 transition-all">
          <div className="flex items-center justify-between text-[#8C90AC]">
            <span className="text-xs font-medium">{lang === "id" ? "Total Pengguna" : "Total Users"}</span>
            <Users className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-sans text-white">{stats.totalUsers}</span>
            <span className="text-[10px] block text-[#8C90AC] mt-1">
              {stats.studentsCount} {lang === "id" ? "Siswa" : "Students"}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="flex items-center justify-between text-[#8C90AC]">
            <span className="text-xs font-medium">{lang === "id" ? "Konselor (Guru BK)" : "School Counselors"}</span>
            <UserCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-sans text-white">{stats.counselorsCount}</span>
            <span className="text-[10px] block text-[#8C90AC] mt-1">
              Active BK Teachers
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="flex items-center justify-between text-[#8C90AC]">
            <span className="text-xs font-medium">{lang === "id" ? "Orang Tua" : "Parents Registered"}</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-sans text-white">{stats.parentsCount}</span>
            <span className="text-[10px] block text-[#8C90AC] mt-1">
              Linked Parents
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="glass-panel rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-rose-500/30 transition-all border border-rose-500/10 bg-rose-500/[0.02]">
          <div className="flex items-center justify-between text-[#8C90AC]">
            <span className="text-xs font-medium">{lang === "id" ? "Siswa Overload / Stres" : "Triage: Stress Load"}</span>
            <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-sans text-rose-400">{stats.activeStressLoad}</span>
            <span className="text-[10px] block text-[#8C90AC] mt-1">
              {lang === "id" ? "Butuh bimbingan segera" : "Require counseling attention"}
            </span>
          </div>
        </div>

        {/* Metric 5 */}
        <div className="glass-panel col-span-2 lg:col-span-1 rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group hover:border-purple-500/30 transition-all">
          <div className="flex items-center justify-between text-[#8C90AC]">
            <span className="text-xs font-medium">{lang === "id" ? "Total Konsultasi" : "Consultation Bookings"}</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold font-sans text-white">
              {Object.keys(students).reduce((acc, k) => acc + (students[k]?.counselorNotes?.length || 0), 0)}
            </span>
            <span className="text-[10px] block text-[#8C90AC] mt-1">
              {lang === "id" ? "Konseling Tersimpan" : "Saved counseling notes"}
            </span>
          </div>
        </div>

      </div>

      {/* 3. CORE USERS GRID & FILTER SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Users List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="glass-panel rounded-2xl p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00D9A0]" />
                {lang === "id" ? "Daftar Akun Pengguna" : "User Database Registry"}
                <span className="text-xs font-mono font-medium px-2 py-0.5 bg-[#282C4E] text-[#00D9A0] rounded-md">
                  {filteredUsers.length} {lang === "id" ? "Akun" : "Users"}
                </span>
              </h2>

              <div className="flex items-center gap-2">
                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="bg-[#161A33]/80 border border-[#33374F] text-xs text-white rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-[#00D9A0] transition-all cursor-pointer"
                >
                  <option value="all">{lang === "id" ? "Semua Peran" : "All Roles"}</option>
                  <option value="siswa">{lang === "id" ? "Siswa (Student)" : "Student (Siswa)"}</option>
                  <option value="guru_bk">{lang === "id" ? "Konselor (Counselor)" : "Counselor (Guru BK)"}</option>
                  <option value="orang_tua">{lang === "id" ? "Orang Tua (Parent)" : "Parent (Orang Tua)"}</option>
                  <option value="admin">{lang === "id" ? "Admin" : "Admin"}</option>
                </select>
              </div>
            </div>

            {/* Search Input */}
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-[#8C90AC]">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={lang === "id" ? "Cari berdasarkan nama, email, atau username..." : "Search by name, email, or username..."}
                className="w-full bg-[#161A33]/40 border border-[#33374F] focus:border-[#00D9A0] focus:ring-1 focus:ring-[#00D9A0]/20 rounded-xl py-2 pl-10 pr-4 text-xs text-white placeholder-[#8C90AC]/60 focus:outline-none transition-all"
              />
            </div>

            {/* User List Table / Cards */}
            {loadingUsers ? (
              <div className="text-center py-12 space-y-3">
                <RefreshCw className="w-6 h-6 animate-spin text-[#00D9A0] mx-auto" />
                <span className="text-xs text-[#8C90AC] block">{lang === "id" ? "Mengambil database pengguna..." : "Loading user database..."}</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-12 bg-[#161A33]/20 border border-dashed border-[#33374F]/50 rounded-xl text-[#8C90AC]">
                <AlertCircle className="w-8 h-8 text-[#8C90AC]/60 mx-auto mb-2" />
                <span className="text-xs">{lang === "id" ? "Tidak ada pengguna ditemukan." : "No users matched your criteria."}</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                {filteredUsers.map((user) => {
                  const isSelected = selectedUser?.username === user.username;
                  return (
                    <div
                      key={user.username}
                      onClick={() => setSelectedUser(user)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between group ${
                        isSelected 
                          ? "bg-[#282C4E]/60 border-[#00D9A0] shadow-[0_0_15px_rgba(0,217,160,0.04)]" 
                          : "bg-[#161A33]/40 border-[#33374F]/40 hover:bg-[#161A33]/80 hover:border-[#33374F]/80"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-white font-mono font-bold text-xs uppercase flex-shrink-0">
                          {user.username.slice(0, 2)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white truncate max-w-[140px] sm:max-w-xs">{user.fullName}</span>
                            <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getRoleBadgeColor(user.role)}`}>
                              {user.role}
                            </span>
                          </div>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-[10px] text-[#8C90AC] mt-1">
                            <span className="flex items-center gap-1 truncate">
                              <Mail className="w-3 h-3 text-[#8C90AC]/70" />
                              {user.email || "-"}
                            </span>
                            <span className="hidden sm:inline-block text-[#33374F]">•</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-[#8C90AC]/70" />
                              {formatDate(user.createdAt)}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={(e) => handleDeleteUser(user.username, e)}
                          disabled={user.username === "admin"}
                          className="p-1.5 text-[#8C90AC] hover:text-[#F2545B] hover:bg-[#F2545B]/10 rounded-lg transition-all disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className={`w-4 h-4 text-[#8C90AC]/40 group-hover:text-white transition-all ${isSelected ? "rotate-90 text-[#00D9A0]/70" : ""}`} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Detailed Profile Viewer & Counseling Triage */}
        <div className="lg:col-span-1">
          {selectedUser ? (
            <div className="glass-panel rounded-2xl p-6 space-y-6 sticky top-24 border border-slate-700/50">
              
              {/* Header Details */}
              <div className="flex items-start justify-between border-b border-[#33374F]/40 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                    {lang === "id" ? "Detil Akun Pengguna" : "User Profile Insight"}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-lg font-bold text-white">{selectedUser.fullName}</span>
                    <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${getRoleBadgeColor(selectedUser.role)}`}>
                      {selectedUser.role}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedUser(null)}
                  className="p-1 hover:bg-[#282C4E] rounded-lg text-[#8C90AC] hover:text-white transition-all cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* General Metadata */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-1.5 border-b border-[#33374F]/20">
                  <span className="text-[#8C90AC]">{lang === "id" ? "Username" : "Username"}</span>
                  <span className="font-mono text-white font-bold">{selectedUser.username}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#33374F]/20">
                  <span className="text-[#8C90AC]">{lang === "id" ? "Alamat Email" : "Email Address"}</span>
                  <span className="text-white truncate max-w-[180px]">{selectedUser.email || "-"}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-[#33374F]/20">
                  <span className="text-[#8C90AC]">{lang === "id" ? "Tanggal Daftar" : "Joined On"}</span>
                  <span className="text-white">{formatDate(selectedUser.createdAt)}</span>
                </div>
                {selectedUser.role === "orang_tua" && (
                  <div className="flex justify-between py-1.5 border-b border-[#33374F]/20">
                    <span className="text-[#8C90AC]">{lang === "id" ? "Siswa Tertaut" : "Linked Child"}</span>
                    <span className="text-cyan-400 font-bold font-mono">@{selectedUser.childUsername || "siswa"}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5 border-b border-[#33374F]/20">
                  <span className="text-[#8C90AC]">{lang === "id" ? "Kredensial" : "Demo Password"}</span>
                  <span className="text-emerald-400 font-mono">"{selectedUser.password || "N/A"}"</span>
                </div>
              </div>

              {/* Special View: STUDENT LIVE BIO-TRIAGE */}
              {selectedUser.role === "siswa" && (
                <div className="space-y-4 pt-2 border-t border-[#33374F]/40">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <HeartPulse className="w-4 h-4 text-rose-500" />
                    {lang === "id" ? "Live Biosensor Grahita" : "Live Biosensor Diagnostics"}
                  </h4>

                  {selectedStudentProfile ? (
                    <div className="space-y-4">
                      {/* Live heart metrics */}
                      {selectedStudentProfile.biometricsHistory && selectedStudentProfile.biometricsHistory.length > 0 ? (
                        (() => {
                          const history = selectedStudentProfile.biometricsHistory;
                          const lastReading = history[history.length - 1];
                          const stressLevel = lastReading.status;
                          
                          let stressColor = "text-emerald-400";
                          let stressBg = "bg-emerald-500/10 border-emerald-500/20";
                          let stressDesc = lang === "id" ? "Kondisi Mental Kondusif" : "Cognitive State: Optimal";

                          if (stressLevel === "overload") {
                            stressColor = "text-rose-500";
                            stressBg = "bg-rose-500/10 border-rose-500/20";
                            stressDesc = lang === "id" ? "Deteksi Overload / Stres Berat!" : "Stress Alert: Overload State!";
                          } else if (stressLevel === "load") {
                            stressColor = "text-amber-500";
                            stressBg = "bg-amber-500/10 border-amber-500/20";
                            stressDesc = lang === "id" ? "Beban Kognitif Sedang" : "Cognitive State: Alert Load";
                          }

                          return (
                            <div className="space-y-3">
                              <div className={`p-3 rounded-xl border ${stressBg} flex items-center justify-between`}>
                                <div className="space-y-0.5">
                                  <span className={`text-xs font-bold ${stressColor} flex items-center gap-1`}>
                                    <Activity className="w-3.5 h-3.5 animate-pulse" />
                                    {stressLevel.toUpperCase()}
                                  </span>
                                  <span className="text-[10px] text-[#8C90AC] block">{stressDesc}</span>
                                </div>
                                <div className="text-right">
                                  <span className="text-2xl font-bold font-mono text-white leading-none">{lastReading.bpm}</span>
                                  <span className="text-[9px] text-[#8C90AC] ml-1">BPM</span>
                                </div>
                              </div>

                              {/* HRV Metrics card */}
                              <div className="grid grid-cols-2 gap-2">
                                <div className="p-2.5 bg-[#161A33]/50 border border-[#33374F]/40 rounded-xl text-center">
                                  <span className="text-[9px] text-[#8C90AC] block uppercase">{lang === "id" ? "Variabilitas Jantung" : "Heart Rate Var."}</span>
                                  <span className="text-sm font-bold font-mono text-cyan-400 mt-1 block">{lastReading.hrv} ms</span>
                                </div>
                                <div className="p-2.5 bg-[#161A33]/50 border border-[#33374F]/40 rounded-xl text-center">
                                  <span className="text-[9px] text-[#8C90AC] block uppercase">{lang === "id" ? "Koneksi Band" : "Band Connection"}</span>
                                  <span className={`text-xs font-bold mt-1.5 block ${selectedStudentProfile.isConnected ? "text-[#00D9A0]" : "text-rose-500"}`}>
                                    {selectedStudentProfile.isConnected ? "CONNECTED" : "OFFLINE"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })()
                      ) : (
                        <div className="text-center p-3 text-[10px] text-[#8C90AC]/60 bg-[#161A33]/30 border border-[#33374F]/30 rounded-xl">
                          {lang === "id" ? "Belum ada transmisi data Grahita Band." : "No Grahita Band telemetry received yet."}
                        </div>
                      )}

                      {/* Grades Summary */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C90AC] block">
                          {lang === "id" ? "Status Akademis (Rata-rata Kelas)" : "Academic Stress Indicators"}
                        </span>
                        <div className="grid grid-cols-3 gap-1 text-[10px]">
                          {(selectedStudentProfile.grades || []).slice(0, 3).map(g => (
                            <div key={g.subjectId} className="p-1.5 bg-[#161A33]/30 border border-[#33374F]/20 rounded-lg text-center">
                              <span className="text-[#8C90AC] block truncate">{lang === "id" ? g.subjectNameId : g.subjectNameEn}</span>
                              <span className="text-white font-bold block mt-0.5">{g.grade}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Counselor/Admin Advice Log */}
                      <div className="space-y-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-[#8C90AC] block">
                          {lang === "id" ? "Formulir Rekomendasi Bimbingan" : "Direct Advisor Action Room"}
                        </span>
                        
                        {/* Note Entry Field */}
                        <div className="space-y-1.5">
                          <textarea
                            value={newNoteText}
                            onChange={(e) => setNewNoteText(e.target.value)}
                            placeholder={lang === "id" ? "Tulis saran pembimbing atau instruksi intervensi stres di sini..." : "Type intervention counseling notes or advice here..."}
                            className="w-full h-16 bg-[#161A33]/40 border border-[#33374F] focus:border-[#00D9A0] focus:ring-1 focus:ring-[#00D9A0]/20 rounded-xl p-2 text-[11px] text-white placeholder-[#8C90AC]/60 focus:outline-none resize-none transition-all"
                          />
                          {noteSuccess && (
                            <div className="text-[10px] text-[#00D9A0] font-bold flex items-center gap-1">
                              <CheckCircle className="w-3.5 h-3.5" />
                              {noteSuccess}
                            </div>
                          )}
                          <button
                            onClick={handleAddCounselorNote}
                            disabled={!newNoteText.trim()}
                            className="w-full py-1.5 bg-[#00D9A0] hover:bg-[#00B887] text-[#0B0D1F] disabled:opacity-50 disabled:cursor-not-allowed text-xs font-bold rounded-xl transition-all cursor-pointer"
                          >
                            {lang === "id" ? "Kirim Rekomendasi" : "Submit Advice Note"}
                          </button>
                        </div>
                      </div>

                    </div>
                  ) : (
                    <div className="text-center p-3 text-[10px] text-[#8C90AC]/60 bg-[#161A33]/30 border border-[#33374F]/30 rounded-xl">
                      {lang === "id" ? "Profil terdaftar di pengguna tetapi tidak ada data biometrik." : "User profile is registered but has no student record."}
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="glass-panel rounded-2xl p-6 text-center py-16 text-[#8C90AC] border border-dashed border-[#33374F]/50 flex flex-col justify-center items-center space-y-3 sticky top-24">
              <Database className="w-10 h-10 text-[#8C90AC]/40" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-white">
                  {lang === "id" ? "Buka Wawasan Detil" : "Interactive Insight Hub"}
                </p>
                <p className="text-[10px] leading-relaxed max-w-[180px] mx-auto">
                  {lang === "id" 
                    ? "Klik salah satu baris pengguna di tabel untuk memeriksa riwayat bimbingan & biosensor secara lengkap." 
                    : "Click any user row to view details, Grahita Band telemetry diagnostics, and direct intervention tools."}
                </p>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 4. DIALOG / MODAL FORM: ADD NEW USER */}
      {showAddUser && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="glass-panel w-full max-w-md rounded-2xl p-6 border border-[#33374F] relative shadow-2xl space-y-4">
            
            <div className="flex items-center justify-between border-b border-[#33374F]/40 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Users className="w-4 h-4 text-[#00D9A0]" />
                {lang === "id" ? "Tambahkan Akun Pengguna Baru" : "Register New Account"}
              </h3>
              <button
                onClick={() => setShowAddUser(false)}
                className="p-1 hover:bg-[#282C4E] rounded-lg text-[#8C90AC] hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddUserSubmit} className="space-y-3.5 text-xs">
              
              <div className="space-y-1">
                <label className="text-[#8C90AC] block font-medium">{lang === "id" ? "Username" : "Username"}</label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="e.g. adit"
                  className="w-full bg-[#161A33]/60 border border-[#33374F] focus:border-[#00D9A0] focus:ring-1 focus:ring-[#00D9A0]/20 rounded-xl py-1.5 px-3 text-white focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8C90AC] block font-medium">{lang === "id" ? "Nama Lengkap" : "Full Name"}</label>
                <input
                  type="text"
                  required
                  value={newFullName}
                  onChange={(e) => setNewFullName(e.target.value)}
                  placeholder="e.g. Aditya Wardhana"
                  className="w-full bg-[#161A33]/60 border border-[#33374F] focus:border-[#00D9A0] focus:ring-1 focus:ring-[#00D9A0]/20 rounded-xl py-1.5 px-3 text-white focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8C90AC] block font-medium">{lang === "id" ? "Alamat Email" : "Email Address"}</label>
                <input
                  type="email"
                  required
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder="e.g. aditya@grahita.id"
                  className="w-full bg-[#161A33]/60 border border-[#33374F] focus:border-[#00D9A0] focus:ring-1 focus:ring-[#00D9A0]/20 rounded-xl py-1.5 px-3 text-white focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8C90AC] block font-medium">{lang === "id" ? "Kata Sandi" : "Password"}</label>
                <input
                  type="text"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="e.g. password123"
                  className="w-full bg-[#161A33]/60 border border-[#33374F] focus:border-[#00D9A0] focus:ring-1 focus:ring-[#00D9A0]/20 rounded-xl py-1.5 px-3 text-white focus:outline-none transition-all"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#8C90AC] block font-medium">{lang === "id" ? "Peran Pengguna" : "User Role"}</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as UserRole)}
                  className="w-full bg-[#161A33]/60 border border-[#33374F] focus:border-[#00D9A0] focus:ring-1 focus:ring-[#00D9A0]/20 rounded-xl py-1.5 px-3 text-white focus:outline-none transition-all cursor-pointer"
                >
                  <option value="siswa">{lang === "id" ? "Siswa (Student)" : "Student (Siswa)"}</option>
                  <option value="guru_bk">{lang === "id" ? "Konselor BK (Counselor)" : "Counselor (Guru BK)"}</option>
                  <option value="orang_tua">{lang === "id" ? "Orang Tua (Parent)" : "Parent (Orang Tua)"}</option>
                  <option value="admin">{lang === "id" ? "Admin" : "Admin"}</option>
                </select>
              </div>

              {newRole === "orang_tua" && (
                <div className="space-y-1">
                  <label className="text-[#8C90AC] block font-medium">{lang === "id" ? "Username Anak Tertaut" : "Linked Child Username"}</label>
                  <input
                    type="text"
                    value={newChildUsername}
                    onChange={(e) => setNewChildUsername(e.target.value)}
                    placeholder="e.g. siswa"
                    className="w-full bg-[#161A33]/60 border border-[#33374F] focus:border-[#00D9A0] focus:ring-1 focus:ring-[#00D9A0]/20 rounded-xl py-1.5 px-3 text-white focus:outline-none transition-all"
                  />
                </div>
              )}

              {formError && (
                <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {formSuccess && (
                <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{formSuccess}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#33374F]/40">
                <button
                  type="button"
                  onClick={() => setShowAddUser(false)}
                  className="px-4 py-2 bg-[#282C4E]/40 hover:bg-[#282C4E]/80 border border-[#33374F] rounded-xl text-white font-bold cursor-pointer"
                >
                  {lang === "id" ? "Batal" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#00D9A0] hover:bg-[#00B887] text-[#0B0D1F] rounded-xl font-bold shadow-[0_0_15px_rgba(0,217,160,0.1)] cursor-pointer"
                >
                  {lang === "id" ? "Simpan Akun" : "Save Account"}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};
