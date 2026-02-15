import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  X,
  Calendar,
  Clock,
  Users,
  Hash,
  Copy,
  QrCode,
  BookOpen,
  CheckCircle,
} from "lucide-react";
import { createSession } from "@/lib/apis";

// Zod validation schema
const attendanceSessionSchema = z.object({
  courseName: z.string().min(1, "Course name is required"),
  courseCode: z.string().min(1, "Course code is required"),
  date: z.string().min(1, "Date is required"),
  startTime: z.string().min(1, "Start time is required"),
  expectedStudents: z.number().min(1),
  attendanceDuration: z
    .number()
    .min(5)
    .max(180, "Duration cannot exceed 3 hours"),
});

type AttendanceSessionFormData = z.infer<typeof attendanceSessionSchema>;

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateAttendanceModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const [step, setStep] = useState<"form" | "success">("form");
  const [generatedData, setGeneratedData] = useState({
    sessionId: "",
    sessionCode: "",
    qrCodeUrl: "",
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AttendanceSessionFormData>({
    resolver: zodResolver(attendanceSessionSchema),
    defaultValues: {
      courseName: "",
      courseCode: "",
      date: new Date().toISOString().split("T")[0],
      startTime: new Date().toTimeString().slice(0, 5),
      expectedStudents: 50,
      attendanceDuration: 60,
    },
  });

  const generateSessionCode = () => {
    return Math.floor(10000000 + Math.random() * 90000000).toString();
  };

  const onSubmit = async (data: AttendanceSessionFormData) => {
    try {
      const sessionCode = generateSessionCode();
      const id = `sess_${Date.now()}`;

      // Get geolocation
      const getPosition = () => {
        return new Promise<GeolocationPosition>((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      };

      let latitude: number | null = null;
      let longitude: number | null = null;

      try {
        const position = await getPosition();
        latitude = position.coords.latitude;
        longitude = position.coords.longitude;
      } catch (geoError) {
        console.warn("Could not get location:", geoError);
        // We could block creation if location is required,
        // but for now let's just warn as per request to get it.
      }

      // Calculate end time
      const [hours, minutes] = data.startTime.split(":").map(Number);
      const startTimeObj = new Date();
      startTimeObj.setHours(hours, minutes, 0, 0);
      const endTimeObj = new Date(
        startTimeObj.getTime() + data.attendanceDuration * 60000,
      );
      const timeEnd = `${endTimeObj.getHours().toString().padStart(2, "0")}:${endTimeObj.getMinutes().toString().padStart(2, "0")}`;

      const newSession = {
        id,
        ...data,
        timeStart: data.startTime,
        timeEnd,
        sessionCode,
        duration: data.attendanceDuration / 60, // hours
        totalStudents: data.expectedStudents,
        presentStudents: 0,
        lateStudents: 0,
        absentStudents: data.expectedStudents,
        status: "active",
        students: [],
        latitude,
        longitude,
      };

      const result = await createSession(newSession);

      const attendanceUrl = `${window.location.origin}/attend/${result.id}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(attendanceUrl)}`;

      setGeneratedData({
        sessionId: result.id,
        sessionCode: result.sessionCode,
        qrCodeUrl,
      });
      setStep("success");
    } catch (error) {
      console.error("Failed to create session:", error);
      alert("Failed to create session. Please try again.");
    }
  };

  const handleClose = () => {
    reset();
    setStep("form");
    onClose();
  };

  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={handleClose}
      />

      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden animate-in zoom-in-95 duration-200">
          <div className="px-8 pt-8 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">
                  {step === "form" ? "New Attendance" : "Session Live!"}
                </h2>
                <p className="text-gray-500 font-medium">
                  {step === "form"
                    ? "Set up your class attendance tracking"
                    : "Your session is ready for students to join"}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-gray-400" />
              </button>
            </div>
          </div>

          <div className="p-8">
            {step === "form" ? (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Course Name
                    </label>
                    <div className="relative">
                      <BookOpen className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        {...register("courseName")}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all"
                        placeholder="e.g., Computer Science"
                      />
                    </div>
                    {errors.courseName && (
                      <p className="text-xs text-red-500 font-bold ml-1">
                        {errors.courseName.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Course Code
                    </label>
                    <div className="relative">
                      <Hash className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        {...register("courseCode")}
                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all"
                        placeholder="e.g., CSC 101"
                      />
                    </div>
                    {errors.courseCode && (
                      <p className="text-xs text-red-500 font-bold ml-1">
                        {errors.courseCode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Date
                    </label>
                    <input
                      type="date"
                      {...register("date")}
                      className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Start Time
                    </label>
                    <input
                      type="time"
                      {...register("startTime")}
                      className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all font-medium"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700 ml-1">
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      {...register("attendanceDuration", {
                        valueAsNumber: true,
                      })}
                      className="w-full px-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700 ml-1">
                    Expected Students
                  </label>
                  <div className="relative">
                    <Users className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      {...register("expectedStudents", { valueAsNumber: true })}
                      className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border-2 border-transparent focus:border-blue-500 focus:bg-white rounded-2xl transition-all font-medium"
                      placeholder="50"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 py-4 border-2 border-gray-100 text-gray-600 rounded-2xl hover:bg-gray-50 transition-colors font-bold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-2 py-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100 disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? "Creating..." : "Start Session"}
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-center">
                  <div className="bg-green-50 p-6 rounded-full">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-gray-50 p-6 rounded-3xl border-2 border-gray-100 flex flex-col items-center">
                    <h4 className="font-bold text-gray-900 mb-4 uppercase tracking-widest text-xs">
                      QR Access
                    </h4>
                    <div className="bg-white p-3 rounded-2xl shadow-sm mb-4">
                      <img
                        src={generatedData.qrCodeUrl}
                        alt="QR"
                        className="h-44 w-44"
                      />
                    </div>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(
                          `${window.location.origin}/attend/${generatedData.sessionId}`,
                        )
                      }
                      className="w-full py-3 bg-white border-2 border-gray-100 text-gray-700 rounded-xl hover:bg-gray-50 font-bold text-sm transition-all"
                    >
                      Copy Link
                    </button>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-3xl border-2 border-blue-100 flex flex-col items-center justify-between">
                    <h4 className="font-bold text-blue-900 mb-4 uppercase tracking-widest text-xs">
                      Manual Entry Code
                    </h4>
                    <div className="bg-white px-6 py-8 rounded-2xl w-full text-center shadow-sm">
                      <p className="text-4xl font-black text-blue-600 tracking-tighter">
                        {generatedData.sessionCode}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        handleCopyToClipboard(generatedData.sessionCode)
                      }
                      className="w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm shadow-md transition-all mt-4"
                    >
                      Copy Code
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleClose}
                  className="w-full py-5 bg-gray-900 text-white rounded-2xl font-black uppercase tracking-widest text-sm hover:bg-black transition-all shadow-xl"
                >
                  Go to Dashboard
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateAttendanceModal;
