"use client";

import Lineicons from "@lineiconshq/react-lineicons";
import { GraduationCap1Bulk, Trash3Bulk } from "@lineiconshq/free-icons";
import React, { useEffect, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import CreateAttendanceModal from "@/components/create-session-modal";
import OngoingAttendance from "@/components/ongoing-attendance";
import { getAllSessions, updateSession } from "@/lib/apis";
import { AttendanceSession } from "@/types";

const DashboardHome = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(
    null,
  );
  const [loading, setLoading] = useState(true);

  const fetchActiveSession = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const sessions = await getAllSessions();
      const active = sessions.find(
        (s: AttendanceSession) => s.status === "active",
      );
      setActiveSession(active || null);
    } catch (error) {
      console.error("Error fetching sessions:", error);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchActiveSession();

    // Set up realtime polling every 5 seconds
    const interval = setInterval(() => {
      fetchActiveSession(true);
    }, 5000);

    return () => clearInterval(interval);
  }, [fetchActiveSession]);

  const handleEndSession = async (id: string) => {
    await updateSession(id, { status: "ended" });
    await fetchActiveSession();
  };

  return (
    <div className=" w-full flex flex-col xl:flex-row gap-10 justify-between min-h-screen">
      <CreateAttendanceModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          fetchActiveSession();
        }}
      />

      <div className=" w-full xl:w-[35%] space-y-10">
        <div className=" grid lg:grid-cols-2 gap-5">
          <button
            onClick={() => setIsModalOpen(true)}
            className=" transition-all duration-200 ease-linear cursor-pointer hover:shadow-xl hover:-translate-y-1 bg-white group w-full flex flex-col items-start justify-between h-40 text-gray-800 p-6 border-2 border-gray-100 rounded-2xl"
          >
            <div className=" w-14 h-14 bg-yellow-500 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-100 group-hover:scale-110 transition-transform">
              <Lineicons icon={GraduationCap1Bulk} size={32} color="white" />
            </div>
            <div>
              <h1 className=" font-bold text-lg text-gray-900">
                New Attendance
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Start a new session
              </p>
            </div>
          </button>

          <button
            disabled={!activeSession}
            onClick={() => activeSession && handleEndSession(activeSession.id)}
            className=" transition-all duration-200 ease-linear cursor-pointer hover:shadow-xl hover:-translate-y-1 bg-white group w-full flex flex-col items-start justify-between h-40 text-gray-800 p-6 border-2 border-gray-100 rounded-2xl disabled:opacity-50 disabled:hover:translate-y-0 disabled:hover:shadow-none"
          >
            <div className=" w-14 h-14 bg-red-500 rounded-xl flex items-center justify-center shadow-lg shadow-red-100 group-hover:scale-110 transition-transform">
              <Lineicons icon={Trash3Bulk} size={32} color="white" />
            </div>
            <div>
              <h1 className=" font-bold text-lg text-gray-900">
                End Attendance
              </h1>
              <p className="text-sm text-gray-500 font-medium">
                Stop tracking current
              </p>
            </div>
          </button>
        </div>

        <div className=" space-y-5">
          <h1 className=" font-bold text-xl text-gray-900 px-1">Quick Stats</h1>

          <div className=" w-full bg-white border-2 border-gray-100 rounded-2xl p-6 shadow-sm">
            {activeSession ? (
              <div className=" space-y-4">
                <div className="flex items-center justify-between">
                  <h1 className=" font-bold text-xl text-blue-900">
                    {activeSession.courseName}
                  </h1>
                  <Badge className="bg-green-500 text-white border-none text-[10px] uppercase font-black tracking-widest">
                    Active
                  </Badge>
                </div>

                <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                  <div className="flex items-center gap-1">
                    <Lineicons icon={GraduationCap1Bulk} size={16} />
                    <span>{activeSession.courseCode}</span>
                  </div>
                  <span>•</span>
                  <span>
                    {activeSession.timeStart} - {activeSession.timeEnd}
                  </span>
                </div>

                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      Attendance Rate
                    </span>
                    <span className="text-xs font-black text-blue-600">
                      {Math.round(
                        (activeSession.presentStudents /
                          activeSession.totalStudents) *
                          100,
                      )}
                      %
                    </span>
                  </div>
                  <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-1000"
                      style={{
                        width: `${(activeSession.presentStudents / activeSession.totalStudents) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-4 text-center">
                <p className="text-gray-400 font-bold uppercase text-xs tracking-widest">
                  No Active Class
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className=" w-full xl:w-[65%] ">
        {loading ? (
          <div className="w-full h-64 flex items-center justify-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
            <p className="text-gray-400 font-bold animate-pulse">
              Loading Attendance Data...
            </p>
          </div>
        ) : (
          <OngoingAttendance
            session={activeSession}
            onEnd={handleEndSession}
            onRefresh={fetchActiveSession}
          />
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
