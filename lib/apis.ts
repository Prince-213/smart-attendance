import { AttendanceSession, SessionStudent } from "@/types";
import { databaseUrl } from "./utils";

export async function getAllStudents() {
  const res = await fetch(`${databaseUrl}/students`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function getStudentById(id: string) {
  const res = await fetch(`${databaseUrl}/students/${id}`, {
    cache: "no-store",
  });
  if (!res.ok) throw new Error("Failed to fetch student");
  return res.json();
}

export async function createStudent(student: any) {
  const res = await fetch(`${databaseUrl}/students`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error("Failed to create student");
  return res.json();
}

export async function updateStudent(id: string, student: any) {
  const res = await fetch(`${databaseUrl}/students/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(student),
  });
  if (!res.ok) throw new Error("Failed to update student");
  return res.json();
}

export async function deleteStudent(id: string) {
  const res = await fetch(`${databaseUrl}/students/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete student");
  return res.json();
}

export async function getAllSessions() {
  const res = await fetch(`${databaseUrl}/sessions`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch sessions");
  return res.json();
}

export async function createSession(session: any) {
  const res = await fetch(`${databaseUrl}/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(session),
  });
  if (!res.ok) throw new Error("Failed to create session");
  return res.json();
}

export const updateSession = async (
  id: string,
  data: Partial<AttendanceSession>,
) => {
  const response = await fetch(`${databaseUrl}/sessions/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return response.json();
};

export const getSessionById = async (
  id: string,
): Promise<AttendanceSession | null> => {
  try {
    const response = await fetch(`${databaseUrl}/sessions/${id}`);
    if (!response.ok) return null;
    return response.json();
  } catch (error) {
    console.error("Error fetching session:", error);
    return null;
  }
};

export const getSessionBySessionCode = async (
  code: string,
): Promise<AttendanceSession | null> => {
  try {
    const response = await fetch(`${databaseUrl}/sessions?sessionCode=${code}`);
    if (!response.ok) return null;
    const sessions = await response.json();
    return sessions.length > 0 ? sessions[0] : null;
  } catch (error) {
    console.error("Error fetching session by code:", error);
    return null;
  }
};

export const submitAttendance = async (
  sessionId: string,
  student: SessionStudent,
) => {
  const session = await getSessionById(sessionId);
  if (!session) throw new Error("Session not found");

  const updatedStudents = [...session.students, student];
  const presentCount = updatedStudents.filter(
    (s) => s.status === "present",
  ).length;
  const absentCount = session.totalStudents - presentCount;

  return updateSession(sessionId, {
    students: updatedStudents,
    presentStudents: presentCount,
    absentStudents: absentCount,
  });
};
