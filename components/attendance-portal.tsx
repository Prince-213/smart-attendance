"use client";

// pages/AttendancePortal.tsx - Complete attendance portal with face verification
import React, { useState, useEffect, useRef } from "react";

import {
  Camera,
  CheckCircle,
  XCircle,
  User,
  BookOpen,
  Calendar,
  Clock,
  Hash,
  ChevronDown,
  AlertCircle,
  Fingerprint,
  Smile,
  Loader2,
  ArrowLeft,
  Shield,
  Users,
  MapPin,
  Download,
  LogOut,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AttendanceSession, SessionStudent, Student } from "@/types";
import { getSessionById, submitAttendance, getAllStudents } from "@/lib/apis";

const AttendancePortal = ({ sessionCode }: { sessionCode: string }) => {
  const navigate = useRouter();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [step, setStep] = useState<
    "select" | "verify" | "biometric" | "success"
  >("select");
  const [session, setSession] = useState<AttendanceSession | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(
    null,
  );

  const [selectedStudent, setSelectedStudent] = useState("");
  const [regNo, setRegNo] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<
    "idle" | "success" | "failed"
  >("idle");
  const [timer, setTimer] = useState(0);
  const [showFaceGuide, setShowFaceGuide] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionData, studentsData] = await Promise.all([
          getSessionById(sessionCode),
          getAllStudents(),
        ]);

        if (!sessionData) {
          setError("Session not found.");
          return;
        }
        setSession(sessionData);
        setStudents(studentsData);

        // Calculate remaining time
        const now = new Date();
        const endTime = new Date(`${sessionData.date}T${sessionData.timeEnd}`);
        const diff = Math.max(
          0,
          Math.floor((endTime.getTime() - now.getTime()) / 1000),
        );
        setTimer(diff);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load session or student data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [sessionCode]);

  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    if (timer === 0 && step !== "success" && !loading && session) {
      navigate.push("/attend");
    }
  }, [timer, step, navigate, loading, session]);

  const drawFaceOutline = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.ellipse(
      canvas.width / 2,
      canvas.height / 2 - 20,
      80,
      100,
      0,
      0,
      Math.PI * 2,
    );
    ctx.strokeStyle =
      verificationStatus === "idle"
        ? "#3b82f6"
        : verificationStatus === "success"
          ? "#10b981"
          : "#ef4444";
    ctx.lineWidth = 3;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(canvas.width / 2 - 30, canvas.height / 2 - 40, 10, 0, Math.PI * 2);
    ctx.fillStyle =
      verificationStatus === "idle"
        ? "#3b82f6"
        : verificationStatus === "success"
          ? "#10b981"
          : "#ef4444";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(canvas.width / 2 + 30, canvas.height / 2 - 40, 10, 0, Math.PI * 2);
    ctx.fillStyle =
      verificationStatus === "idle"
        ? "#3b82f6"
        : verificationStatus === "success"
          ? "#10b981"
          : "#ef4444";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2 + 20, 40, 0.2, 0.8 * Math.PI);
    ctx.strokeStyle =
      verificationStatus === "idle"
        ? "#3b82f6"
        : verificationStatus === "success"
          ? "#10b981"
          : "#ef4444";
    ctx.lineWidth = 2;
    ctx.stroke();

    if (verificationStatus !== "idle") {
      ctx.beginPath();
      ctx.arc(canvas.width / 2, canvas.height / 2, 5, 0, Math.PI * 2);
      ctx.fillStyle = verificationStatus === "success" ? "#10b981" : "#ef4444";
      ctx.fill();
    }
  };

  useEffect(() => {
    if (step === "biometric" && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        drawFaceOutline(ctx);
      }
    }
  }, [step, verificationStatus]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStudentSelect = () => {
    if (selectedStudent) {
      setStep("verify");
    }
  };

  const handleVerify = () => {
    setVerificationError(null);
    const student = students.find((s) => s.id === selectedStudent);
    if (!student) {
      setVerificationError("Student not found.");
      return;
    }

    // Check last 3 digits of matriculationNumber
    const lastThree = student.matriculationNumber.slice(-3);
    if (regNo === lastThree) {
      setStep("biometric");
    } else {
      setVerificationError(
        "Invalid registration number digits. Please try again.",
      );
    }
  };

  const simulateFaceVerification = async (success: boolean) => {
    setIsVerifying(true);
    setVerificationStatus("idle");

    setTimeout(async () => {
      setIsVerifying(false);
      setVerificationStatus(success ? "success" : "failed");

      if (success && session) {
        setIsSubmitting(true);
        try {
          const studentInfo = students.find((s) => s.id === selectedStudent);
          if (!studentInfo) throw new Error("Student data missing");

          const now = new Date();
          const timeJoined = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;

          const isLate = false; // Logic removed as per request

          const attendanceRecord: SessionStudent = {
            id: studentInfo.id,
            name: studentInfo.name,
            matricNumber: studentInfo.matriculationNumber,
            timeJoined,
            status: "present",
          };

          await submitAttendance(session.id, attendanceRecord);
          setStep("success");
        } catch (error) {
          console.error("Failed to submit attendance:", error);
          alert("Submission failed. Please try again.");
          setVerificationStatus("failed");
        }
      }
    }, 2000);
  };
  const getSelectedStudent = () => {
    const student = students.find((s) => s.id === selectedStudent);
    return (
      student || {
        name: "Student",
        matriculationNumber: regNo || "xxx",
      }
    );
  };

  const handleLeaveSession = () => {
    navigate.push("/attend");
  };

  const handleExportProof = () => {
    const student = getSelectedStudent() as any;
    const matric =
      student.matriculationNumber ||
      student.matricNumber ||
      student.regNo ||
      "unknown";

    const data = {
      student: student,
      session: session,
      time: new Date().toISOString(),
      sessionCode: sessionCode,
      status: "verified",
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-proof-${session?.sessionCode || sessionCode}-${matric}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-blue-600 animate-spin mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900">
            Loading Session...
          </h2>
          <p className="text-gray-500">
            Please wait while we retrieve the details.
          </p>
        </div>
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-center px-4">
        <div className="max-w-md mx-auto">
          <div className="bg-red-100 p-4 rounded-full inline-block mb-4">
            <TriangleAlert className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Error Occurred
          </h2>
          <p className="text-gray-600 mb-6">
            {error || "Session could not be loaded."}
          </p>
          <button
            onClick={() => navigate.push("/attend")}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium flex items-center mx-auto"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Entry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Fingerprint className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  EduTrack Attendance
                </h1>
                <p className="text-sm text-gray-600">
                  Session: {session?.sessionCode}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-6">
                <div className="text-right">
                  <div className="text-sm text-gray-600">Time Remaining</div>
                  <div className="text-lg font-bold text-red-600">
                    {formatTime(timer)}
                  </div>
                </div>
                <button
                  onClick={handleLeaveSession}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Course Header */}
          <div className="bg-linear-to-r from-blue-600 to-purple-600 rounded-2xl text-white p-6 mb-8 shadow-lg">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {session.courseCode}: {session.courseName}
                </h2>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>Instructor</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>{session.date}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4" />
                    <span>
                      {session.timeStart} - {session.timeEnd}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4" />
                    <span>Campus Location</span>
                  </div>
                </div>
              </div>
              <div className="bg-white/20 px-4 py-2 rounded-full">
                <span className="font-semibold">Session Active</span>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Progress & Info */}
            <div className="lg:col-span-1 space-y-6">
              {/* Progress Steps */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-lg mb-4">Attendance Steps</h3>
                <div className="space-y-6">
                  {["select", "verify", "biometric", "success"].map(
                    (s, index) => {
                      const stepIndex = [
                        "select",
                        "verify",
                        "biometric",
                        "success",
                      ].indexOf(step);
                      const isCompleted = stepIndex > index;
                      const isCurrent = step === s;

                      return (
                        <div key={s} className="flex items-start space-x-4">
                          <div
                            className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                              isCompleted
                                ? "bg-green-100 text-green-600"
                                : isCurrent
                                  ? "bg-blue-100 text-blue-600"
                                  : "bg-gray-100 text-gray-400"
                            }`}
                          >
                            {isCompleted ? (
                              <CheckCircle className="h-5 w-5" />
                            ) : (
                              <span className="font-bold">{index + 1}</span>
                            )}
                          </div>
                          <div>
                            <div
                              className={`font-medium ${
                                isCurrent
                                  ? "text-blue-600"
                                  : isCompleted
                                    ? "text-green-600"
                                    : "text-gray-400"
                              }`}
                            >
                              {s === "select"
                                ? "Select Student"
                                : s === "verify"
                                  ? "Verify Identity"
                                  : s === "biometric"
                                    ? "Face Verification"
                                    : "Complete"}
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                              {s === "select"
                                ? "Choose your name from the list"
                                : s === "verify"
                                  ? "Enter your registration number"
                                  : s === "biometric"
                                    ? "Verify with facial recognition"
                                    : "Attendance confirmed"}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}
                </div>
              </div>

              {/* Session Info */}
              <div className="bg-white rounded-xl shadow p-6">
                <h3 className="font-bold text-lg mb-4">Session Information</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Session Code</span>
                    <span className="font-mono font-bold">
                      {session?.sessionCode}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Total Students</span>
                    <span className="font-bold">{session.totalStudents}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-gray-600">Time Remaining</span>
                    <span
                      className={`font-bold ${timer < 60 ? "text-red-600" : "text-green-600"}`}
                    >
                      {formatTime(timer)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Security Info */}
              <div className="bg-white rounded-xl shadow p-6">
                <div className="flex items-start space-x-3">
                  <Shield className="h-5 w-5 text-green-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold mb-1">Secure Verification</h4>
                    <p className="text-sm text-gray-600">
                      Your attendance is protected with end-to-end encryption
                      and facial recognition.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Main Flow */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow overflow-hidden">
                {/* Step 1: Student Selection */}
                {step === "select" && (
                  <div className="p-8">
                    <div className="text-center mb-8">
                      <div className="p-3 bg-blue-100 rounded-full inline-block mb-4">
                        <Users className="h-6 w-6 text-blue-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Select Your Identity
                      </h2>
                      <p className="text-gray-600">
                        Choose your name from the registered students list
                      </p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Student Name
                      </label>
                      <div className="relative">
                        <select
                          value={selectedStudent}
                          onChange={(e) => setSelectedStudent(e.target.value)}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl appearance-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                        >
                          <option value="">Select your name...</option>
                          {students && students.length > 0 ? (
                            students.map((student: Student) => (
                              <option key={student.id} value={student.id}>
                                {student.name.toUpperCase()}
                              </option>
                            ))
                          ) : (
                            <option value="manual">
                              Enter details manually...
                            </option>
                          )}
                        </select>
                        <ChevronDown className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-3 shrink-0" />
                        <div>
                          <h4 className="font-medium text-blue-900 mb-1">
                            Important Notice
                          </h4>
                          <p className="text-blue-800 text-sm">
                            Selecting another student&apos;s name is a violation
                            of academic integrity and may result in disciplinary
                            action.
                          </p>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={handleStudentSelect}
                      disabled={!selectedStudent}
                      className="w-full py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Continue to Verification
                    </button>
                  </div>
                )}

                {/* Step 2: Registration Verification */}
                {step === "verify" && (
                  <div className="p-8">
                    <div className="text-center mb-8">
                      <div className="p-3 bg-green-100 rounded-full inline-block mb-4">
                        <Fingerprint className="h-6 w-6 text-green-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Verify Your Identity
                      </h2>
                      <p className="text-gray-600">
                        Confirm your registration number
                      </p>
                    </div>

                    <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                      <p className="text-sm text-gray-600 mb-2">
                        Selected Student:
                      </p>
                      <p className="text-lg font-semibold text-gray-900">
                        {getSelectedStudent()?.name}
                      </p>
                    </div>

                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                        Last 3 Digits of Matric Number
                      </label>
                      <input
                        type="text"
                        maxLength={3}
                        value={regNo}
                        onChange={(e) => setRegNo(e.target.value)}
                        placeholder="e.g. 456"
                        className={`w-full px-4 py-3 border-2 ${verificationError ? "border-red-500" : "border-gray-300"} rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center font-mono text-2xl tracking-widest`}
                      />
                      {verificationError && (
                        <p className="text-red-600 text-sm mt-2 text-center">
                          {verificationError}
                        </p>
                      )}
                      <p className="text-sm text-gray-500 mt-4 text-center">
                        Please enter the last three digits of your matriculation
                        number for security verification.
                      </p>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={() => setStep("select")}
                        className="flex-1 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleVerify}
                        disabled={!regNo}
                        className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Verify & Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Face Verification */}
                {step === "biometric" && (
                  <div className="p-8">
                    <div className="text-center mb-8">
                      <div className="p-3 bg-purple-100 rounded-full inline-block mb-4">
                        <Camera className="h-6 w-6 text-purple-600" />
                      </div>
                      <h2 className="text-2xl font-bold text-gray-900 mb-2">
                        Face Verification
                      </h2>
                      <p className="text-gray-600">
                        Please position your face within the frame
                      </p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      {/* Camera Preview */}
                      <div className="bg-gray-900 rounded-xl overflow-hidden">
                        <div className="aspect-video relative">
                          <canvas
                            ref={canvasRef}
                            width={400}
                            height={300}
                            className="w-full h-full"
                          />
                          {verificationStatus === "success" && (
                            <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center">
                              <CheckCircle className="h-16 w-16 text-green-500" />
                            </div>
                          )}
                          {verificationStatus === "failed" && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                              <XCircle className="h-16 w-16 text-red-500" />
                            </div>
                          )}
                        </div>
                        <div className="p-4 bg-gray-800 flex justify-between items-center">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                verificationStatus === "idle"
                                  ? "bg-yellow-500 animate-pulse"
                                  : verificationStatus === "success"
                                    ? "bg-green-500"
                                    : "bg-red-500"
                              }`}
                            />
                            <span className="text-sm text-white">
                              {verificationStatus === "idle"
                                ? "Ready for verification"
                                : verificationStatus === "success"
                                  ? "Verified"
                                  : "Verification failed"}
                            </span>
                          </div>
                          <button
                            onClick={() => setShowFaceGuide(!showFaceGuide)}
                            className="text-sm text-blue-400 hover:text-blue-300"
                          >
                            {showFaceGuide ? "Hide Guide" : "Show Guide"}
                          </button>
                        </div>
                      </div>

                      {/* Instructions & Controls */}
                      <div className="space-y-4">
                        {showFaceGuide && (
                          <div className="p-4 bg-blue-50 rounded-xl">
                            <h4 className="font-medium text-blue-900 mb-2 flex items-center">
                              <Smile className="h-5 w-5 mr-2" />
                              Face Positioning Guide
                            </h4>
                            <ul className="text-blue-800 text-sm space-y-2">
                              <li>• Ensure your face is well-lit</li>
                              <li>• Remove hats, sunglasses, or masks</li>
                              <li>• Look directly at the camera</li>
                              <li>• Keep your face centered in the oval</li>
                              <li>• Maintain a neutral expression</li>
                            </ul>
                          </div>
                        )}

                        <div className="p-4 bg-gray-50 rounded-xl">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Verification Status
                          </h4>
                          <div className="space-y-2">
                            <div className="flex items-center">
                              {verificationStatus === "idle" && (
                                <div className="flex items-center text-gray-700">
                                  <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2 animate-pulse" />
                                  <span>Waiting for verification...</span>
                                </div>
                              )}
                              {verificationStatus === "success" && (
                                <div className="flex items-center text-green-700">
                                  <CheckCircle className="h-5 w-5 mr-2" />
                                  <span>Face verified successfully!</span>
                                </div>
                              )}
                              {verificationStatus === "failed" && (
                                <div className="flex items-center text-red-700">
                                  <XCircle className="h-5 w-5 mr-2" />
                                  <span>
                                    Verification failed. Please try again.
                                  </span>
                                </div>
                              )}
                            </div>
                            {isSubmitting && (
                              <div className="flex items-center text-blue-700">
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                <span>Submitting attendance...</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="space-y-3">
                          <button
                            onClick={() => simulateFaceVerification(true)}
                            disabled={isVerifying || isSubmitting}
                            className="w-full py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                          >
                            {isVerifying ? (
                              <>
                                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                Verifying...
                              </>
                            ) : (
                              "Confirm Face Verification"
                            )}
                          </button>

                          <button
                            onClick={() => simulateFaceVerification(false)}
                            disabled={isVerifying || isSubmitting}
                            className="w-full py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            Simulate Failed Verification
                          </button>

                          <button
                            onClick={() => setStep("verify")}
                            className="w-full py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                          >
                            Back to Previous Step
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Step 4: Success */}
                {step === "success" && (
                  <div className="p-8 text-center">
                    <div className="p-4 bg-green-100 rounded-full inline-block mb-6">
                      <CheckCircle className="h-16 w-16 text-green-600" />
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      Attendance Confirmed!
                    </h2>
                    <p className="text-gray-600 mb-8">
                      Your attendance has been successfully recorded
                    </p>

                    <div className="bg-gray-50 rounded-xl p-6 mb-8 max-w-md mx-auto">
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Student</span>
                          <span className="font-semibold">
                            {getSelectedStudent()?.name}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Reg. Number</span>
                          <span className="font-semibold font-mono">
                            {(getSelectedStudent() as any).matriculationNumber}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Course</span>
                          <span className="font-semibold">
                            {session.courseCode}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Time</span>
                          <span className="font-semibold">
                            {new Date().toLocaleTimeString([], {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <button
                        onClick={handleExportProof}
                        className="w-full max-w-md mx-auto py-3 bg-linear-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all font-medium flex items-center justify-center"
                      >
                        <Download className="h-5 w-5 mr-2" />
                        Download Attendance Proof
                      </button>

                      <button
                        onClick={handleLeaveSession}
                        className="w-full max-w-md mx-auto py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                      >
                        Return to Home
                      </button>
                    </div>

                    <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-xl max-w-md mx-auto">
                      <p className="text-green-800 text-sm">
                        Your attendance has been recorded in the system. You may
                        now close this window.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendancePortal;
