"use client";

import { Badge } from "@/components/ui/badge";
import { GraduationCap1Bulk } from "@lineiconshq/free-icons";
import Lineicons from "@lineiconshq/react-lineicons";
import React, { useEffect, useState } from "react";
import { getAllSessions } from "@/lib/apis";
import { AttendanceSession } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Clock,
  Users,
  Calendar,
  CheckCircle,
  XCircle,
  Clock3,
} from "lucide-react";

const HistoryPage = () => {
  const [sessions, setSessions] = useState<AttendanceSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSession, setSelectedSession] =
    useState<AttendanceSession | null>(null);

  useEffect(() => {
    const fetchSessions = async () => {
      try {
        setLoading(true);
        const data = await getAllSessions();
        // Sort sessions by date and time descending
        const sortedData = [...data].sort((a, b) => {
          const dateA = new Date(
            `${a.date}T${a.timeStart || (a as any).startTime || "00:00"}`,
          );
          const dateB = new Date(
            `${b.date}T${b.timeStart || (b as any).startTime || "00:00"}`,
          );
          return dateB.getTime() - dateA.getTime();
        });
        setSessions(sortedData);
      } catch (err) {
        console.error("Error fetching sessions:", err);
        setError("Failed to load attendance history.");
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDay = (dateStr: string) => new Date(dateStr).getDate();
  const getMonth = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", { month: "short" });

  if (loading)
    return <div className="p-10 text-center">Loading history...</div>;
  if (error)
    return <div className="p-10 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className=" w-full flex items-center justify-between">
        <div>
          <h1 className=" font-semibold text-4xl mb-2 ">Attendance History</h1>
          <p className=" font-semibold text-gray-400 text-lg">
            List of all past attendance
          </p>
        </div>
      </div>
      <br />
      <div className=" w-full gap-5 grid xl:grid-cols-2 lg:grid-cols-2">
        {sessions.map((session) => (
          <Dialog key={session.id}>
            <DialogTrigger asChild>
              <div className=" px-4 py-6 flex justify-between items-end rounded-md border-2 cursor-pointer hover:shadow-md transition-shadow">
                <div className=" flex space-x-6">
                  <div className=" w-20  rounded-md border-2 border-gray-200">
                    <div className=" text-center py-1 text-sm bg-gray-200 uppercase font-bold w-full">
                      <p>{getMonth(session.date)}</p>
                    </div>
                    <div className=" w-full text-blue-800 flex items-center justify-center font-bold text-2xl h-12">
                      <p>{getDay(session.date)}</p>
                    </div>
                  </div>

                  <div className=" flex flex-col justify-between py-1">
                    <h1 className=" font-semibold text-xl">
                      {session.courseName}
                    </h1>
                    <p className=" font-semibold text-gray-600">
                      {session.timeStart || (session as any).startTime} -{" "}
                      {session.timeEnd}
                    </p>
                  </div>
                </div>

                <div className=" flex items-center space-x-3">
                  <Badge
                    variant="outline"
                    className={`${
                      session.status === "active"
                        ? "bg-green-500/10 border-green-600 text-green-800"
                        : "bg-gray-500/10 border-gray-600 text-gray-800"
                    } font-bold text-xs uppercase`}
                  >
                    {session.status === "active" ? "Active" : "Ended"}
                  </Badge>
                  <Badge
                    className=" bg-green-500/10 space-x-1 border-green-600 text-green-800 font-semibold text-sm"
                    variant={"outline"}
                  >
                    <h1>{session.presentStudents} Students</h1>
                  </Badge>
                  <Badge
                    className=" bg-blue-500/10 space-x-1 border-blue-600 text-blue-800 font-semibold text-sm"
                    variant={"outline"}
                  >
                    <h1>{session.courseCode}</h1>
                  </Badge>
                </div>
              </div>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <div className="flex items-center justify-between pr-8">
                  <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                    <Clock className="w-6 h-6 text-blue-600" />
                    Session Details
                  </DialogTitle>
                  <Badge
                    variant="outline"
                    className={`${
                      session.status === "active"
                        ? "bg-green-500/10 border-green-600 text-green-800"
                        : "bg-gray-500/10 border-gray-600 text-gray-800"
                    } font-bold text-xs uppercase px-3 py-1`}
                  >
                    {session.status === "active" ? "Active" : "Ended"}
                  </Badge>
                </div>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border">
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 font-medium">Course</p>
                    <p className="text-lg font-semibold">
                      {session.courseName} ({session.courseCode})
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm text-gray-500 font-medium">Date</p>
                    <p className="text-lg font-semibold">
                      {formatDate(session.date)}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-gray-500 font-medium">
                      Time Window
                    </p>
                    <p className="text-lg font-semibold">
                      {session.timeStart || (session as any).startTime} -{" "}
                      {session.timeEnd}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <p className="text-sm text-gray-500 font-medium">
                      Session Code
                    </p>
                    <p className="text-lg font-mono font-bold text-blue-600">
                      {session.sessionCode}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex flex-col items-center">
                    <Users className="w-5 h-5 text-blue-600 mb-1" />
                    <p className="text-xs text-blue-600 font-bold uppercase">
                      Total
                    </p>
                    <p className="text-2xl font-bold">
                      {session.totalStudents}
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg border border-green-100 flex flex-col items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mb-1" />
                    <p className="text-xs text-green-600 font-bold uppercase">
                      Present
                    </p>
                    <p className="text-2xl font-bold">
                      {session.presentStudents}
                    </p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg border border-red-100 flex flex-col items-center">
                    <XCircle className="w-5 h-5 text-red-600 mb-1" />
                    <p className="text-xs text-red-600 font-bold uppercase">
                      Absent
                    </p>
                    <p className="text-2xl font-bold">
                      {session.absentStudents}
                    </p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-bold text-lg border-b pb-2">
                    Student Attendance List
                  </h3>
                  <div className="space-y-2">
                    {session.students.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 rounded-md border bg-white hover:bg-gray-50 transition-colors"
                      >
                        <div className="flex flex-col">
                          <p className="font-semibold text-sm">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500 font-mono">
                            {student.matricNumber}
                          </p>
                        </div>
                        <div className="flex items-center gap-4">
                          <p className="text-xs text-gray-400 font-medium">
                            {student.timeJoined || "--:--"}
                          </p>
                          <Badge
                            variant="outline"
                            className={`
                                ${
                                  student.status === "present"
                                    ? "bg-green-50 text-green-700 border-green-200"
                                    : "bg-red-50 text-red-700 border-red-200"
                                } font-bold text-[10px] uppercase px-2
                            `}
                          >
                            {student.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ))}
      </div>
    </div>
  );
};

export default HistoryPage;
