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
  User2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { AttendanceSession, SessionStudent, Student } from "@/types";
import {
  getSessionById,
  submitAttendance,
  getAllStudents,
  updateSession,
} from "@/lib/apis";
import haversine from "haversine-distance";
import { toast } from "sonner";
import * as faceapi from "face-api.js";
import { Button } from "./ui/button";

const labels = ["CEE100201", "CEE123456", "CEE123457"];

async function getLabeledFaceDescriptions() {
  return Promise.all(
    labels.map(async (label) => {
      const descriptions = [];
      for (let i = 1; i <= 2; i++) {
        const img = await faceapi.fetchImage(`/labels/${label}/${i}.jpg`);
        const detections = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();
        if (detections && detections.descriptor) {
          descriptions.push(detections.descriptor);
        }
      }
      return new faceapi.LabeledFaceDescriptors(label, descriptions);
    }),
  );
}

const AttendancePortal = ({ sessionCode }: { sessionCode: string }) => {
  const navigate = useRouter();
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const matchStartTime = useRef<number | null>(null);
  const [detectionInfo, setDetectionInfo] = useState({
    label: "",
    confidence: 0,
  });

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
  const [timer, setTimer] = useState<number | null>(null);
  const [showFaceGuide, setShowFaceGuide] = useState(false);
  const [distanceToVenue, setDistanceToVenue] = useState<number | null>(null);

  // Load models on mount
  useEffect(() => {
    async function loadModels() {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      ]);
    }
    loadModels();
  }, []);

  // Handle camera stream based on step
  useEffect(() => {
    let stream: MediaStream | null = null;
    let isActive = true;

    if (step === "biometric") {
      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((s) => {
          if (!isActive) {
            s.getTracks().forEach((track) => track.stop());
            return;
          }
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error("Camera access error:", err);
          toast.error("Camera access required", {
            description: "Please allow camera access to proceed.",
          });
        });
    }

    return () => {
      isActive = false;
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [step]);

  useEffect(() => {
    let intervalId: NodeJS.Timeout | undefined;
    async function onPlay() {
      const labeledFaceDescriptors = await getLabeledFaceDescriptions();
      const faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors);

      const video = videoRef.current;
      const canvas = canvasRef.current;
      const displaySize = { width: 600, height: 450 };
      if (canvas) {
        faceapi.matchDimensions(canvas, displaySize);
      }

      intervalId = setInterval(async () => {
        let detections: faceapi.WithFaceDescriptor<
          faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>
        >[] = [];
        if (video) {
          detections = await faceapi
            .detectAllFaces(video)
            .withFaceLandmarks()
            .withFaceDescriptors();
        }

        const resizedDetections = faceapi.resizeResults(
          detections,
          displaySize,
        );
        if (canvas) {
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
          }
        }

        const results = resizedDetections.map((d) =>
          faceMatcher.findBestMatch(d.descriptor),
        );
        results.forEach((result, i) => {
          const box = resizedDetections[i].detection.box;
          const confidence = resizedDetections[i].detection.score;
          const drawBox = new faceapi.draw.DrawBox(box, {
            label: `${result.toString()} (${(confidence * 100).toFixed(2)}%)`,
          });
          if (canvas) {
            drawBox.draw(canvas);
          }

          // Update detection info for the first detected face
          if (i === 0) {
            setDetectionInfo({
              label: result.label,
              confidence: confidence,
            });

            console.log(detections);
          }
        });

        // If no faces detected, clear info
        if (results.length === 0) {
          setDetectionInfo({ label: "", confidence: 0 });
        }
      }, 100);
    }

    if (videoRef.current) {
      videoRef.current.addEventListener("play", onPlay);
    }
    return () => {
      if (videoRef.current) {
        videoRef.current.removeEventListener("play", onPlay);
      }
      clearInterval(intervalId);
    };
  }, [step]);

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
        if (sessionData.status === "ended") {
          setError("This session has ended.");
          return;
        }
        setSession(sessionData);
        setStudents(studentsData);

        // Check proximity if session has location
        if (sessionData.latitude && sessionData.longitude) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const start = {
                latitude: sessionData.latitude as number,
                longitude: sessionData.longitude as number,
              };
              const end = {
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              };
              const distance = haversine(start, end);

              console.log("the distance is" + distance);

              if (distance > 3000) {
                toast.error("You are far from the lecture hall", {
                  description:
                    "Please go to the lecture hall to register attendance",
                  duration: 5000,
                });
                setVerificationError(
                  "Proximity check failed: You are far from the lecture hall. Please go to the lecture hall to register attendance",
                );
              }
            },
            (err) => {
              console.error("Error getting location:", err);
              toast.warning("Location access is required for attendance", {
                description: "Please enable location check to proceed",
              });
            },
          );
        }

        // Calculate remaining time
        const now = new Date();
        const endTime = new Date(`${sessionData.date}T${sessionData.timeEnd}`);

        // Handle cross-day sessions: If end time is before start time, it means it ends the next day
        const startTime = new Date(
          `${sessionData.date}T${sessionData.timeStart}`,
        );
        if (endTime < startTime) {
          endTime.setDate(endTime.getDate() + 1);
        }

        const diff = Math.floor((endTime.getTime() - now.getTime()) / 1000);
        const remaining = Math.max(0, diff);

        console.log("Session Data Loaded:", {
          sessionCode,
          status: sessionData.status,
          now: now.toISOString(),
          endTime: endTime.toISOString(),
          diffSeconds: diff,
          remainingSeconds: remaining,
        });

        setTimer(remaining);
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
    if (timer !== null && timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => (prev !== null && prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [timer]);

  useEffect(() => {
    // Only redirect if timer is explicitly 0
    if (timer === 0 && !loading && session) {
      const handleExpiry = async () => {
        if (session.status !== "ended") {
          try {
            console.log("Timer hit 0. Ending session...");
            await updateSession(session.id, { status: "ended" });
            setSession((prev) => (prev ? { ...prev, status: "ended" } : null));
            setError("This session has expired.");
          } catch (err) {
            console.error("Failed to end session:", err);
          }
        } else {
          setError("This session has ended.");
        }
      };
      handleExpiry();
    }
  }, [timer, loading, session]);

  useEffect(() => {
    if (!session?.latitude || !session?.longitude) return;

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const start = {
          latitude: session.latitude!,
          longitude: session.longitude!,
        };
        const end = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        const dist = haversine(start, end);
        setDistanceToVenue(dist);
      },
      (err) => console.error("Location watch error:", err),
      { enableHighAccuracy: true },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [session]);

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

  const processAttendanceSubmission = async (success: boolean) => {
    // Final proximity check before submission

    console.log("processing attendance");

    if (session) {
      setIsSubmitting(true);
      console.log("submitting attendance");
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
        setIsSubmitting(false);
      }
    }
  };

  const simulateFaceVerification = async (success: boolean) => {
    setIsVerifying(true);
    setVerificationStatus("idle");

    setTimeout(() => {
      processAttendanceSubmission(success);
    }, 2000);
  };

  useEffect(() => {
    if (
      step !== "biometric" ||
      isVerifying ||
      verificationStatus === "success"
    ) {
      matchStartTime.current = null;
      return;
    }

    const student = students.find((s) => s.id === selectedStudent);
    if (!student) return;

    // Use matriculationNumber as the label to match
    const targetLabel = student.matriculationNumber;

    // Check if detected face matches the student's matric number
    // We also check confidence to ensure it's a good match
    if (detectionInfo.label === targetLabel && detectionInfo.confidence > 0.4) {
      if (!matchStartTime.current) {
        matchStartTime.current = Date.now();
      } else {
        const elapsed = Date.now() - matchStartTime.current;
        if (elapsed > 2000) {
          // 3 seconds passed with continuous match
          setIsVerifying(true);
          processAttendanceSubmission(true);
          matchStartTime.current = null;
        }
      }
    } else {
      // Reset timer if face mismatch or no face
      matchStartTime.current = null;
    }
  }, [
    detectionInfo,
    step,
    selectedStudent,
    isVerifying,
    verificationStatus,
    students,
  ]);
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
                {/* Distance Indicator */}
                {distanceToVenue !== null && (
                  <div
                    className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                      distanceToVenue <= 30
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700 border border-red-200"
                    }`}
                  >
                    <MapPin className="h-4 w-4" />
                    <span className="font-semibold text-sm">
                      {Math.round(distanceToVenue)}m away
                    </span>
                  </div>
                )}
                <div className="text-right">
                  <div className="text-sm text-gray-600">Time Remaining</div>
                  <div className="text-lg font-bold text-red-600">
                    {formatTime(timer ?? 0)}
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
                      className={`font-bold ${(timer ?? 0) < 60 ? "text-red-600" : "text-green-600"}`}
                    >
                      {formatTime(timer ?? 0)}
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
                  <div className="p-8 relative">
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

                    <div className=" ">
                      {/* Camera Preview */}

                      <div
                        style={{
                          position: "relative",
                          width: 600,
                          height: 450,
                          zIndex: 99999999,
                        }}
                      >
                        <h1
                          style={{
                            position: "absolute",
                            zIndex: 2,
                            color: "red",
                            background: "rgba(255,255,255,0.7)",
                            padding: "8px",
                          }}
                        >
                          {detectionInfo.label
                            ? `Label: ${detectionInfo.label}, Confidence: ${(
                                detectionInfo.confidence * 100
                              ).toFixed(2)}%`
                            : "No face detected"}
                        </h1>
                        <video
                          ref={videoRef}
                          width="600"
                          height="450"
                          autoPlay
                          style={{ position: "absolute" }}
                        />
                        <canvas
                          ref={canvasRef}
                          width="600"
                          height="450"
                          style={{ position: "absolute" }}
                        />
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
