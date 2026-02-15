"use client";

import { useState, useRef, useCallback, useEffect } from "react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Camera, User, AlertCircle, CheckCircle, User2 } from "lucide-react";
import { useRouter } from "next/navigation";
import * as faceapi from "face-api.js";
import React from "react";

const labels = ["CS202101", "CS202102", "CS202103"];

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

export default function AuthPage() {
  const [matricNo, setMatricNo] = useState("");
  const [step, setStep] = useState<"matric" | "face" | "verifying">("matric");
  const [error, setError] = useState("");
  const [isCapturing, setIsCapturing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();

  const handleMatricSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!matricNo.trim()) {
      setError("Please enter your matric number");
      return;
    }
    if (matricNo.length < 6) {
      setError("Invalid matric number format");
      return;
    }
    setError("");
    setStep("face");
  };

  const handleBack = () => {
    if (step === "face") {
      setStep("matric");
    } else {
      router.push("/");
    }
  };

  const [detectionInfo, setDetectionInfo] = useState({
    label: "",
    confidence: 0,
  });

  useEffect(() => {
    async function setup() {
      await Promise.all([
        faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
        faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
        faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
      ]);

      navigator.mediaDevices
        .getUserMedia({ video: true, audio: false })
        .then((stream) => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(console.error);
    }
    setup();
  }, []);

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
  }, []);

  useEffect(() => {
    let timer;
    if (
      step === "face" &&
      detectionInfo.label &&
      detectionInfo.label === matricNo
    ) {
      setStep("verifying");
      setTimeout(() => {
        router.push("/exam");
      }, 300);
    }
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [detectionInfo.label, matricNo, step]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center space-x-10 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-2">
            <User className="h-6 w-6" />
            Student Authentication
          </CardTitle>
          <CardDescription>
            {step === "matric" && "Enter your matric number to begin"}
            {step === "face" &&
              "Position your face in the camera for verification"}
            {step === "verifying" && "Verifying your identity..."}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && <div>Error</div>}

          {step === "matric" && (
            <form onSubmit={handleMatricSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="matric">Matric Number</Label>
                <Input
                  id="matric"
                  type="text"
                  placeholder="e.g., 2021/CS/001"
                  value={matricNo}
                  onChange={(e) => setMatricNo(e.target.value)}
                  className="text-center"
                />
              </div>
              <Button type="submit" className="w-full">
                Continue to Face Verification
              </Button>
            </form>
          )}

          {step === "verifying" && (
            <div className="text-center space-y-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-sm text-gray-600">
                Verifying your identity using facial recognition...
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-center gap-2 text-blue-700">
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-sm">Face captured successfully</span>
                </div>
              </div>
            </div>
          )}

          <Button
            variant="outline"
            onClick={handleBack}
            className="w-full bg-transparent"
          >
            Back
          </Button>
        </CardContent>
      </Card>

      <div className={`space-y-4 ${step === "face" ? "block" : "hidden"}`}>
        <div style={{ position: "relative", width: 600, height: 450 }}>
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

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            Position your face clearly in the camera frame
          </p>
          <Button disabled={!isCapturing} className="w-full">
            <User2 className="h-4 w-4 mr-2" />
            Recognizing Identity
          </Button>
        </div>
      </div>
    </div>
  );
}
