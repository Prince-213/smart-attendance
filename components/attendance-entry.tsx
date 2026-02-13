"use client";

// pages/AttendanceEntry.tsx - Beautiful entry page like Zoom

import React, { useState } from "react";
import { getSessionBySessionCode } from "@/lib/apis";
import {
  Camera,
  Hash,
  Video,
  Users,
  Shield,
  CheckCircle,
  ArrowRight,
  Zap,
  Globe,
  Lock,
  Clock,
  QrCode,
  TriangleAlert,
} from "lucide-react";
import { useRouter } from "next/navigation";
import Lineicons from "@lineiconshq/react-lineicons";
import {
  CodegeexOutlined,
  GraduationCap1Outlined,
  User4Outlined,
} from "@lineiconshq/free-icons";
import Link from "next/link";

const AttendanceEntry: React.FC = () => {
  const navigate = useRouter();
  const [sessionCode, setSessionCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);
  const [showQRScanner, setShowQRScanner] = useState(false);

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (sessionCode.trim()) {
      setIsJoining(true);
      try {
        const session = await getSessionBySessionCode(sessionCode.trim());
        if (!session) {
          setError("Session not found. Please check the code.");
        } else if (session.status !== "active") {
          setError("This session has already ended.");
        } else {
          navigate.replace(`/attend/${session.id}`);
        }
      } catch (err) {
        setError("An error occurred. Please try again.");
      } finally {
        setIsJoining(false);
      }
    }
  };

  const handleQRJoin = async (mockCode?: string) => {
    setShowQRScanner(true);
    // In real implementation, this would open camera
    setTimeout(async () => {
      const code = mockCode || "10333499"; // Mock code usually refers to sessionCode
      setSessionCode(code);
      setShowQRScanner(false);

      const session = await getSessionBySessionCode(code);
      if (session && session.status === "active") {
        navigate.replace(`/attend/${session.id}`);
      } else if (session && session.status !== "active") {
        setError("This QR code is for a session that has already ended.");
      } else {
        setError("Invalid or inactive session QR.");
      }
    }, 1500);
  };

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <div className="lg:pb-32 md:pb-44 bg-[url('/images/bg-with-grid.png')] bg-cover bg-center bg-no-repeat text-slate-800 ">
      <div className="relative  mx-auto lg:px-4 ">
        {/* Header */}
        <nav className="flex items-center justify-between p-4 md:px-16 lg:px-24 xl:px-32 border-b border-white/25 w-full !bg-white">
          <a
            href="https://prebuiltui.com"
            className=" pt-3 px-3 flex items-center space-x-1.5"
          >
            <Lineicons
              icon={CodegeexOutlined}
              size={32}
              color="blue"
              strokeWidth={1.5}
            />
            <h1 className=" font-bold text-xl">Attendly</h1>
          </a>

          <ul
            id="menu"
            className={`max-md:absolute max-md:h-full max-md:z-50 max-md:w-full max-md:top-0 max-md:backdrop-blur max-md:bg-white/70 max-md:text-base flex flex-col md:flex-row items-center justify-center gap-8 font-medium transition-all duration-300 ${
              isMenuOpen ? "max-md:left-0" : "max-md:-left-full"
            }`}
          >
            <li onClick={closeMenu} className="hover:text-slate-500">
              <a href="#">Home</a>
            </li>
            <li onClick={closeMenu} className="hover:text-slate-500">
              <a href="#">Products</a>
            </li>
            <li onClick={closeMenu} className="hover:text-slate-500">
              <a href="#">Stories</a>
            </li>
            <li onClick={closeMenu} className="hover:text-slate-500">
              <a href="#">Pricing</a>
            </li>
            <li onClick={closeMenu} className="hover:text-slate-500">
              <a href="#">Docs</a>
            </li>

            <button
              id="close-menu"
              onClick={closeMenu}
              className="md:hidden bg-gray-800 hover:bg-black text-white p-2 rounded-md aspect-square font-medium transition"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
          </ul>

          <button id="open-menu" onClick={toggleMenu} className="md:hidden">
            <svg
              className="size-7"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          <Link
            href={"/login"}
            className="max-md:hidden text-base flex items-center space-x-2 font-semibold px-4 py-2 text-white bg-indigo-600 hover:bg-indigo-700 transition rounded-md"
          >
            <Lineicons
              icon={User4Outlined}
              size={24}
              color="white"
              strokeWidth={1.5}
            />
            <span>Log in</span>
          </Link>
        </nav>

        <div className=" w-[90%] lg:w-[85%] lg:h-[80vh] flex items-center justify-center mx-auto">
          <div className="lg:grid flex-col-reverse flex  lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Hero */}
            <div className="space-y-8">
              <div>
                <div className="inline-flex items-center px-4 py-2 bg-blue-900/30 border border-blue-700 rounded-full mb-6">
                  <Zap className="h-4 w-4 mr-2" />
                  <span className="text-sm font-medium">
                    Seamless Attendance Tracking
                  </span>
                </div>
                <h5 className="text-2xl text-balance md:text-6xl md:leading-[56px] font-semibold lg:max-w-[85%] bg-gradient-to-r from-slate-900 to-[#6D8FE4] text-transparent bg-clip-text">
                  Mark your atttendance in seconds
                </h5>
                <p className="text-xl text-gray-600 mb-8">
                  Join your class sessions securely with automatic face
                  verification and real-time tracking.
                </p>
              </div>

              {/* Features */}
              <div className="grid sm:grid-cols-2 gap-6">
                <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Secure Verification</h3>
                    <p className="text-sm text-gray-400">
                      Face recognition & ID matching
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Clock className="h-5 w-5 text-blue-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Real-time</h3>
                    <p className="text-sm text-gray-400">
                      Instant attendance confirmation
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl">
                  <div className="p-2 bg-purple-900/30 rounded-lg">
                    <Globe className="h-5 w-5 text-purple-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Anywhere Access</h3>
                    <p className="text-sm text-gray-400">
                      Join from any device, anywhere
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 bg-white/5 rounded-xl">
                  <div className="p-2 bg-red-900/30 rounded-lg">
                    <Lock className="h-5 w-5 text-red-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Privacy Protected</h3>
                    <p className="text-sm text-gray-400">
                      Your data stays secure
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Join Form */}
            <div className="bg-gray-100/50 backdrop-blur-xl rounded-2xl border border-gray-200 p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl mb-4">
                  <Video className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">
                  Join Attendance Session
                </h2>
                <p className="text-gray-500">
                  Enter the code provided by your instructor
                </p>
              </div>

              {/* QR Scanner Modal */}
              {showQRScanner && (
                <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
                  <div className="bg-gray-900 rounded-2xl p-8 max-w-sm w-full">
                    <div className="text-center">
                      <div className="w-64 h-64 mx-auto bg-gradient-to-br from-blue-900 to-purple-900 rounded-xl mb-6 flex items-center justify-center">
                        <Camera className="h-16 w-16 text-white/50" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">Scan QR Code</h3>
                      <p className="text-gray-400 mb-6">
                        Position QR code within frame
                      </p>
                      <div className="h-2 w-32 mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}

              <form onSubmit={handleJoinSession} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    <div className="flex items-center">
                      <Hash className="h-4 w-4 mr-2" />
                      Session Code
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={sessionCode}
                      onChange={(e) =>
                        setSessionCode(e.target.value.toUpperCase())
                      }
                      placeholder="Enter session code"
                      className="w-full px-4 py-4 pl-12 bg-gray-200/30 border border-gray-300 rounded-xl text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg font-mono"
                    />
                    <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
                      <Video className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                  {error && (
                    <div className="mt-2 p-3 bg-red-100 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-1">
                      <TriangleAlert className="h-4 w-4" />
                      {error}
                    </div>
                  )}
                  <div className="flex items-center mt-2 text-sm text-gray-400">
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Code is case-sensitive
                  </div>
                </div>

                <br />

                <span className=" flex items-center space-x-4 text-red-500">
                  <TriangleAlert size={18} />
                  <p>
                    Note you have to be in the vicinity of the lecture to
                    register attendance
                  </p>
                </span>

                <div className="space-y-3">
                  <button
                    type="submit"
                    disabled={!sessionCode.trim() || isJoining}
                    className="w-full py-4 bg-blue-600 text-white rounded-xl  transition-all duration-300 font-semibold flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    {isJoining ? (
                      <>
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Joining Session...
                      </>
                    ) : (
                      <>
                        Join Session
                        <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AttendanceEntry;
