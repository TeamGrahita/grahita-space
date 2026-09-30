export type UserRole = "siswa" | "guru_bk" | "orang_tua" | "admin";

export interface User {
  uid?: string;
  username: string;
  fullName: string;
  role: UserRole;
  preferredLanguage: "id" | "en";
  linkedChildUsername?: string; // used for parents
  assignedCounselor?: string;   // used for students
  email?: string;               // used for email-based login option
}

export interface BiometricReading {
  timestamp: string; // ISO String
  bpm: number;
  hrv: number;
  status: "optimal" | "load" | "overload";
}

export interface SubjectGrade {
  subjectId: string;
  subjectNameId: string;
  subjectNameEn: string;
  grade: number;
  stressStatus: "optimal" | "load" | "overload";
}

export interface QuestionnaireResponse {
  timestamp: string;
  emojiScore: number;
  notes: string;
}

export interface CounselorNote {
  id: string;
  counselorName: string;
  text: string;
  timestamp: string;
}

export interface ConsultationBooking {
  id: string;
  studentUsername?: string;
  expertName: string;
  date: string;
  time: string;
  notes: string;
  timestamp: string;
}

export interface Article {
  id: string;
  titleId: string;
  titleEn: string;
  categoryId: string;
  categoryEn: string;
  excerptId: string;
  excerptEn: string;
  contentId: string;
  contentEn: string;
  readTime: string;
  imageUrl: string;
}

export interface StudentProfile {
  username: string;
  fullName: string;
  isConnected: boolean;
  biometricsHistory: BiometricReading[];
  grades: SubjectGrade[];
  questionnaires: QuestionnaireResponse[];
  counselorNotes: CounselorNote[];
}
