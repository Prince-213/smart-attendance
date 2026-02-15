import React, { useState, useEffect } from "react";
import {
  Clock,
  Users,
  Calendar,
  BookOpen,
  Copy,
  CheckCircle,
  XCircle,
  UserPlus,
  Download,
  Eye,
  BarChart3,
  ChevronRight,
  ChevronLeft,
  QrCode,
  ExternalLink,
} from "lucide-react";
import { AttendanceSession } from "@/types";

interface Props {
  session: AttendanceSession | null;
  onEnd: (id: string) => Promise<void>;
  onRefresh: () => void;
}

const OngoingAttendance: React.FC<Props> = ({ session, onEnd, onRefresh }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [showQRCode, setShowQRCode] = useState(false);
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [ending, setEnding] = useState(false);

  const studentsPerPage = 5;

  useEffect(() => {
    if (!session) return;

    // Calculate time remaining based on timeEnd
    const calculateTime = () => {
      const now = new Date();
      const end = new Date();
      const [hours, minutes] = session.timeEnd.split(":").map(Number);
      end.setHours(hours, minutes, 0, 0);

      const diff = Math.floor((end.getTime() - now.getTime()) / 1000);
      return diff > 0 ? diff : 0;
    };

    setTimeRemaining(calculateTime());

    const timer = setInterval(() => {
      setTimeRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);

    return () => clearInterval(timer);
  }, [session]);

  if (!session) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200 p-12 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Calendar className="h-10 w-10 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          No Active Session
        </h2>
        <p className="text-gray-600 max-w-sm mb-8">
          There are no attendance sessions currently running. Start a new
          session to begin tracking.
        </p>
      </div>
    );
  }

  const attendanceUrl = `${window.location.origin}/attend/${session.id}`;
  const totalPages = Math.ceil(session.students.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const currentStudents = session.students.slice(
    startIndex,
    startIndex + studentsPerPage,
  );

  const formatTime = (seconds: number) => {
    const min = Math.floor(seconds / 60);
    const h = Math.floor(min / 60);
    const m = min % 60;
    const s = seconds % 60;
    if (h > 0) return `${h}h ${m}m ${s}s`;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(session.sessionCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(attendanceUrl);
    setLinkCopied(true);
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const handleEndSession = async () => {
    if (confirm("Are you sure you want to end this attendance session?")) {
      try {
        setEnding(true);
        await onEnd(session.id);
      } catch (error) {
        console.error("Failed to end session:", error);
        alert("Failed to end session. Please try again.");
      } finally {
        setEnding(false);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-800 border-green-200";
      case "absent":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "present":
        return <CheckCircle className="h-4 w-4" />;
      case "absent":
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className=" min-w-full  mx-auto bg-white rounded-2xl shadow-lg p-6 space-y-6">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              <Clock className="h-4 w-4 animate-pulse" />
              <span>Session Active</span>
            </div>
            {timeRemaining > 0 && (
              <div className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
                <Clock className="h-4 w-4" />
                <span>Ends in: {formatTime(timeRemaining)}</span>
              </div>
            )}
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            {session.courseName}
          </h1>
          <p className="text-gray-600 mt-1">
            Live tracking of student attendance
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="bg-gray-50 p-4 rounded-xl border">
            <div className="flex items-center gap-3">
              <div className="">
                <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                  Session Code
                </h2>
                <div className="flex items-center gap-3">
                  <p className="text-3xl font-black tracking-tighter text-blue-900">
                    {session.sessionCode}
                  </p>
                  <button
                    onClick={handleCopyCode}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors relative"
                    title="Copy code"
                  >
                    <Copy className="h-5 w-5 text-gray-600" />
                    {copied && (
                      <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white px-2 py-1 rounded text-xs whitespace-nowrap">
                        Copied!
                      </span>
                    )}
                  </button>
                </div>
              </div>
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="p-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors shadow-lg hover:shadow-xl"
                title="Show QR Code"
              >
                <QrCode className="h-32 w-32" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* QR Code Modal */}
      {showQRCode && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-gray-900">
                Scan to Attend
              </h3>
              <button
                onClick={() => setShowQRCode(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <XCircle className="h-6 w-6 text-gray-400" />
              </button>
            </div>

            <div className="p-4 bg-white rounded-2xl border-2 border-blue-50 flex flex-col items-center">
              <div className="bg-white p-2 border shadow-sm rounded-xl mb-4">
                <img
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(attendanceUrl)}`}
                  alt="QR Code"
                  className="w-48 h-48"
                />
              </div>

              <div className="w-full space-y-3">
                <div className="p-3 bg-gray-50 rounded-xl border flex items-center justify-between overflow-hidden">
                  <p className="text-xs font-mono text-gray-500 truncate mr-2">
                    {attendanceUrl}
                  </p>
                  <button
                    onClick={handleCopyLink}
                    className="p-1.5 hover:bg-gray-200 rounded-md transition-colors text-blue-600"
                  >
                    {linkCopied ? (
                      <CheckCircle className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>

                <a
                  href={attendanceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-blue-50 text-blue-700 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  <ExternalLink className="h-4 w-4" />
                  Open in New Tab
                </a>
              </div>
            </div>

            <p className="text-center text-sm text-gray-500 font-medium mt-6">
              Students point their camera at this code to join the attendance
              session.
            </p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 border border-blue-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">
                Expected
              </p>
              <p className="text-3xl font-black text-blue-900 mt-1">
                {session.totalStudents}
              </p>
            </div>
            <div className="p-2 bg-blue-600 rounded-xl">
              <Users className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-blue-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100/50 border border-green-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest">
                Present
              </p>
              <p className="text-3xl font-black text-green-900 mt-1">
                {session.presentStudents}
              </p>
            </div>
            <div className="p-2 bg-green-600 rounded-xl">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-green-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-600 rounded-full transition-all duration-500"
              style={{
                width: `${(session.presentStudents / session.totalStudents) * 100}%`,
              }}
            />
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100/50 border border-red-200 rounded-2xl p-5 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-red-600 uppercase tracking-widest">
                Absent
              </p>
              <p className="text-3xl font-black text-red-900 mt-1">
                {session.totalStudents - session.presentStudents}
              </p>
            </div>
            <div className="p-2 bg-red-600 rounded-xl">
              <XCircle className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 h-2 bg-red-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-red-600 rounded-full transition-all duration-500"
              style={{
                width: `${((session.totalStudents - session.presentStudents) / session.totalStudents) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      {/* Session Details Badges */}
      <div className="flex flex-wrap gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border text-sm font-semibold text-gray-700">
          <BookOpen className="h-4 w-4 text-gray-500" />
          <span>{session.courseCode}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border text-sm font-semibold text-gray-700">
          <Calendar className="h-4 w-4 text-gray-500" />
          <span>{session.date}</span>
        </div>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-xl border text-sm font-semibold text-gray-700">
          <Clock className="h-4 w-4 text-gray-500" />
          <span>
            {session.timeStart} - {session.timeEnd} ({session.duration} min)
          </span>
        </div>
      </div>

      {/* Students List Table */}
      <div className="border-2 border-gray-100 rounded-3xl overflow-hidden shadow-sm bg-white">
        <div className="bg-gray-50/50 px-6 py-5 border-b flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h3 className="font-bold text-lg text-gray-900">
              Live Attendance List
            </h3>
            <p className="text-sm text-gray-500">
              {session.presentStudents} students joined so far
            </p>
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={onRefresh}
              className="px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors flex-1 md:flex-none flex items-center justify-center gap-2 shadow-sm"
            >
              <BarChart3 className="h-4 w-4" />
              Refresh
            </button>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors flex-1 md:flex-none flex items-center justify-center gap-2 shadow-lg shadow-blue-200">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto px-4 pb-4">
          <table className="w-full">
            <thead>
              <tr className="text-left border-b border-gray-100">
                <th className="py-4 px-4 font-bold text-gray-400 text-xs uppercase tracking-widest">
                  Student
                </th>
                <th className="py-4 px-4 font-bold text-gray-400 text-xs uppercase tracking-widest hidden md:table-cell">
                  Matric Number
                </th>
                <th className="py-4 px-4 font-bold text-gray-400 text-xs uppercase tracking-widest">
                  Joined
                </th>
                <th className="py-4 px-4 font-bold text-gray-400 text-xs uppercase tracking-widest text-right">
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <tr
                    key={student.id}
                    className="group hover:bg-blue-50/30 transition-colors"
                  >
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900 group-hover:text-blue-700 transition-colors">
                        {student.name}
                      </div>
                    </td>
                    <td className="py-4 px-4 hidden md:table-cell">
                      <div className="text-gray-500 font-mono text-sm">
                        {student.matricNumber}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div
                        className={`font-semibold text-sm ${
                          student.timeJoined === "Not Joined" ||
                          !student.timeJoined
                            ? "text-red-400"
                            : "text-gray-900"
                        }`}
                      >
                        {student.timeJoined || "Pending"}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div
                        className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-black uppercase tracking-tighter ${getStatusColor(student.status)}`}
                      >
                        {getStatusIcon(student.status)}
                        <span>{student.status}</span>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className="py-12 text-center text-gray-400 font-medium"
                  >
                    No students have joined yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 bg-gray-50/50 border-t flex justify-between items-center">
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 shadow-sm transition-colors"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 bg-white border border-gray-200 rounded-lg disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-50 shadow-sm transition-colors"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-4">
        <button className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-2xl hover:bg-gray-50 transition-all font-bold text-sm shadow-sm hover:shadow-md flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Analytics
        </button>
        <button
          onClick={handleEndSession}
          disabled={ending}
          className="px-8 py-3 bg-red-600 text-white rounded-2xl hover:bg-red-700 transition-all font-bold text-sm shadow-lg shadow-red-200 disabled:opacity-50"
        >
          {ending ? "Ending..." : "End Session"}
        </button>
      </div>
    </div>
  );
};

export default OngoingAttendance;
