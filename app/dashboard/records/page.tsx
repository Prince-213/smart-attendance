"use client";

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
  Search,
} from "lucide-react";

import { getAllStudents } from "@/lib/apis";
import { Student } from "@/types";

const HistoryPage = () => {
  const [session, setSession] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        const data = await getAllStudents();
        setSession(data);
      } catch (err) {
        console.error("Error fetching students:", err);
        setError("Failed to load students. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const [currentPage, setCurrentPage] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(1200); // 20 minutes in seconds

  const filteredStudents = session.filter(
    (student) =>
      student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.matriculationNumber
        .toLowerCase()
        .includes(searchTerm.toLowerCase()),
  );

  const studentsPerPage = 5;
  const totalPages = Math.ceil(filteredStudents.length / studentsPerPage);
  const startIndex = (currentPage - 1) * studentsPerPage;
  const currentStudents = filteredStudents.slice(
    startIndex,
    startIndex + studentsPerPage,
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getStatusColor = (attendance: number) => {
    const score = (attendance / 10) * 100;

    if (score >= 0 && score < 50) {
      return "bg-red-400 text-red-800 border-red-200";
    } else if (score >= 50 && score < 70) {
      return "bg-yellow-400 text-yellow-800 border-yellow-200";
    } else if (score >= 70) {
      return "bg-green-400 text-green-800 border-green-200";
    }
  };

  return (
    <div>
      <div className=" ">
        <h1 className=" text-4xl font-semibold ">Students Records Page</h1>
      </div>
      <br />

      <div className="border-2 border-gray-200 rounded-xl overflow-hidden mt-10">
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-lg text-gray-900">
              Attendance List
            </h3>
            <p className="text-sm text-gray-600">
              Real-time student attendance tracking
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className=" w-[15rem] px-2 border rounded-md h-10 border-gray-300 shadow-sm flex items-center justify-between">
              <Search size={19} className=" text-gray-600" />
              <input
                className=" w-[85%] outline-0 border-none"
                type="text"
                placeholder="Search for student...."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">
                  #
                </th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">
                  Student Name
                </th>
                <th className="text-left py-3 px-6 font-semibold text-gray-700">
                  Matric Number
                </th>

                <th className="text-left py-3 px-6 font-semibold text-gray-700">
                  Attendance Score
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    Loading students...
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-red-500">
                    {error}
                  </td>
                </tr>
              ) : currentStudents.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-gray-500">
                    No students found.
                  </td>
                </tr>
              ) : (
                currentStudents.map((student, index) => (
                  <tr
                    key={student.id}
                    className="border-b hover:bg-gray-50 transition-colors"
                  >
                    <td className="py-4 px-6 text-gray-600">
                      {startIndex + index + 1}
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900">
                        {student.name}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-gray-600 font-mono">
                        {student.matriculationNumber}
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className=" flex items-center gap-2">
                        <p className=" font-semibold text-sm">
                          {`${(student.attendanceScore / 10) * 100}%`}
                        </p>
                        <div className=" w-[150px] h-4 rounded-full bg-gray-100">
                          <div
                            style={{
                              width: `${(student.attendanceScore * 150) / 10}px`,
                            }}
                            className={` h-4 flex items-center justify-center  rounded-full font-medium ${getStatusColor(student.attendanceScore)}`}
                          ></div>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t flex justify-between items-center">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(startIndex + studentsPerPage, filteredStudents.length)}{" "}
              of {filteredStudents.length} students
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }

                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-10 h-10 rounded-lg font-medium ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white"
                        : "border hover:bg-gray-50"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="p-2 border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryPage;
