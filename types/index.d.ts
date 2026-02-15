// types/student.ts

// Enums for fields with limited options
export enum Gender {
  Male = "Male",
  Female = "Female",
  Other = "Other",
  PreferNotToSay = "Prefer not to say",
}

export enum Level {
  Level100 = "100L",
  Level200 = "200L",
  Level300 = "300L",
  Level400 = "400L",
  Level500 = "500L",
  Level600 = "600L",
}

// Main Student interface with more specific types
export interface Student {
  id: string;
  name: string;
  email: string;
  matriculationNumber: string;
  department: string;
  level: Level | string; // Can use enum or string for flexibility
  faculty: string;
  gender: Gender | string;
  dateOfBirth: string; // ISO date string format: YYYY-MM-DD
  phoneNumber: string;
  address: string;
  profilePicture: string; // URL or path to image
  faceData: string; // Base64 encoded face data
  attendanceScore: number; // 0-100 percentage maybe
}

// For creating a new student (without id)
export type CreateStudentInput = Omit<Student, "id">;

// For updating a student (partial data)
export type UpdateStudentInput = Partial<Student>;

// For student attendance records
export interface Attendance {
  id: string;
  studentId: string;
  date: string;
  timeIn: string;
  timeOut?: string;
  present: boolean;
}

export interface SessionStudent {
  id: string;
  name: string;
  matricNumber: string;
  timeJoined: string | null;
  status: "present" | "absent";
}

export interface AttendanceSession {
  id: string;
  courseCode: string;
  courseName: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  duration: number;
  totalStudents: number;
  presentStudents: number;
  absentStudents: number;
  students: SessionStudent[];
  sessionCode: string;
  status: "active" | "ended";
  latitude?: number | null;
  longitude?: number | null;
}
