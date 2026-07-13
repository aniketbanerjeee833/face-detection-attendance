import { useState, useRef, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as faceapi from '@vladmandic/face-api';;

import { useFaceModels } from '../hooks/useFaceModels';
import { useCamera } from '../hooks/useCamera';
import { findBestMatch, findClosestForDebug } from '../utils/faceUtils';
import { useGetAllEmployeesForMatchingQuery } from '../redux/api/employeeApi';
import { useMarkAttendanceMutation } from '../redux/api/attendanceApi';

import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import CameraFeed from '../components/face/CameraFeed';
import ResultOverlay from '../components/face/ResultOverlay';

export default function ScanAttendance() {
  const { modelsLoaded, error: modelError } = useFaceModels();
  const {
    videoRef, cameraActive, error: camError, facingMode,
    startCamera, stopCamera, switchCamera,
    torchOn, torchSupported, toggleTorch, // ← new
  } = useCamera('environment');
  // const { videoRef, cameraActive, error: camError, facingMode, startCamera, stopCamera,
  //    switchCamera } = useCamera('environment');

  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const scanningRef = useRef(false);
  const isProcessingRef = useRef(false);

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  const { data: empData } = useGetAllEmployeesForMatchingQuery();
  const employees = (empData?.employees ?? []).filter((e) => e.face_descriptor);

  const [markAttendance] = useMarkAttendanceMutation();

  const drawDetections = useCallback((detections) => {
    if (!canvasRef.current || !videoRef.current) return;
    const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
    const resized = faceapi.resizeResults(detections, dims);
    const ctx = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    faceapi.draw.drawDetections(canvasRef.current, resized);
  }, []);

  const startScanning = useCallback(() => {
    if (!modelsLoaded || !cameraActive) return;
    if (scanningRef.current) return;

    scanningRef.current = true;
    setScanning(true);
    setStatusMsg('Looking for face...');
    isProcessingRef.current = false;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.4 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          setStatusMsg('No face detected — hold still');
          isProcessingRef.current = false;
          return;
        }

        clearInterval(intervalRef.current);
        drawDetections([detection]);
        setStatusMsg('Face detected — matching...');
        scanningRef.current = false;
        setScanning(false);

        const match = findBestMatch(detection.descriptor, employees);
        const debug = findClosestForDebug(detection.descriptor, employees);

        setDebugInfo({
          closest: debug.closestEmployee?.name || 'none',
          distance: debug.distance === Infinity ? 'N/A' : debug.distance.toFixed(3),
          isMatch: !!match,
        });

        if (!match) {
          setResult({ type: 'fail', message: 'Face not recognized' });
          return;
        }

        try {
          const data = await markAttendance({
            employee_id: match.employee.id,
            confidence: match.confidence,
          }).unwrap();

          setResult({
            type: 'success',
            scanType: data.type, // 'marked'
            employee: match.employee,
            confidence: match.confidence,
          });
        } catch (err) {
          const payload = err?.data;

          // Already marked today — treat as a success-style outcome, not a failure
          if (payload?.type === 'already-marked') {
            setResult({
              type: 'already-marked',
              scanType: payload.type,
              employee: payload.employee,
              message: payload.message,
            });
            return;
          }

          setResult({ type: 'fail', message: payload?.message || 'Something went wrong' });
        }
      } catch (err) {
        console.error('Detection error:', err);
        clearInterval(intervalRef.current);
        scanningRef.current = false;
        setScanning(false);
        isProcessingRef.current = false;
      }
    }, 800);
  }, [modelsLoaded, cameraActive, employees, drawDetections, markAttendance]);

  const handleReset = () => {
    clearInterval(intervalRef.current);
    scanningRef.current = false;
    isProcessingRef.current = false;
    setScanning(false);
    setResult(null);
    setStatusMsg('');
    if (canvasRef.current) {
      canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    // Automatically resume scanning instead of requiring a manual "Scan Now"
    // click every time — continuous scan-again is much better UX for a kiosk
    // where people are queued up one after another.
    if (cameraActive && modelsLoaded) {
      startScanning();
    }
  };
  // const handleReset = () => {
  //   clearInterval(intervalRef.current);
  //   scanningRef.current = false;
  //   isProcessingRef.current = false;
  //   setScanning(false);
  //   setResult(null);
  //   setStatusMsg('');
  //   if (canvasRef.current) {
  //     canvasRef.current.getContext('2d').clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
  //   }
  // };

  const handleStopCamera = () => {
    clearInterval(intervalRef.current);
    scanningRef.current = false;
    isProcessingRef.current = false;
    setScanning(false);
    setStatusMsg('');
    stopCamera();
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  if (modelError) {
    return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{modelError}</div>;
  }

  return (
    <div>
      {/* {debugInfo && (
        <div className="fixed bottom-2 left-2 right-2 z-50 rounded-lg bg-black/80 p-2 text-center text-xs text-white">
          Closest: {debugInfo.closest} ·
          Distance: {debugInfo.distance} · {debugInfo.isMatch ? '✅ Match' : '❌ No match'}
        </div>
      )} */}

      {!modelsLoaded && <Spinner size="lg" text="Loading face recognition models..." />}

      {modelsLoaded && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3 relative">
            <CameraFeed
              videoRef={videoRef}
              canvasRef={canvasRef}
              cameraActive={cameraActive}
              facingMode={facingMode}
              onStart={() => startCamera()}
            />

            {camError && <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{camError}</div>}

            {statusMsg && !result && (
              <motion.div key={statusMsg} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="rounded-xl bg-blue-50 px-4 py-2.5 text-center text-sm font-medium text-blue-700">
                {statusMsg}
              </motion.div>
            )}

            {result && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/90 rounded-2xl">
                <ResultOverlay result={result} onReset={handleReset} />
              </div>
            )}
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
              <h3 className="mb-3 text-sm font-semibold text-slate-900">How to scan</h3>
              <ol className="space-y-2 text-sm text-slate-500">
                <li><strong className="text-slate-900">1.</strong> Click <strong className="text-slate-900">Open Camera</strong></li>
                <li><strong className="text-slate-900">2.</strong> Position face in front of camera</li>
                <li><strong className="text-slate-900">3.</strong> Click <strong className="text-slate-900">Scan Now</strong></li>
                <li><strong className="text-slate-900">4.</strong> Hold still for 2–3 seconds</li>
              </ol>
            </div>
            {/* 
            <div className="space-y-2">
              {cameraActive && !scanning && (
                <Button size="lg" full onClick={startScanning}>📷 Scan Now</Button>
              )}
              {scanning && (
                <Button size="lg" full variant="outline" disabled>🔄 Scanning...</Button>
              )}
              {cameraActive && (
                <Button full variant="outline" onClick={switchCamera}>
                  🔄 Switch to {facingMode === 'environment' ? 'Front' : 'Back'} Camera
                </Button>
              )}
              {cameraActive && (
                <Button full variant="danger" onClick={handleStopCamera}>Stop Camera</Button>
              )}
            </div> */}
            <div className="space-y-2">
              {/* {cameraActive && !scanning && (
                <Button size="lg" full onClick={startScanning}>📷 Scan Now</Button>
              )} */}
              {cameraActive && !scanning && !result && (
                <Button size="lg" full onClick={startScanning}>
                  📷 Scan Now
                </Button>
              )}
              {scanning && (
                <Button size="lg" full variant="outline" disabled>🔄 Scanning...</Button>
              )}
              {cameraActive && (
                <Button full variant="outline" onClick={switchCamera}>
                  🔄 Switch to {facingMode === 'environment' ? 'Front' : 'Back'} Camera
                </Button>
              )}

              {/* Only show the torch button when the device/browser actually supports it */}
              {cameraActive && torchSupported && (
                <Button full variant="outline" onClick={toggleTorch}>
                  {torchOn ? '🔦 Turn Off Flash' : '🔦 Turn On Flash'}
                </Button>
              )}

              {cameraActive && (
                <Button full variant="danger" onClick={handleStopCamera}>Stop Camera</Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}