import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { motion } from 'framer-motion';
import { useFaceModels } from '../hooks/useFaceModels';
import { useCamera } from '../hooks/useCamera';
import { findBestMatch, findClosestForDebug } from '../utils/faceUtils';
import CameraFeed from '../components/face/CameraFeed';
import ResultOverlay from '../components/face/ResultOverlay';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { useGetAllEmployeesForMatchingQuery } from '../redux/api/employeeApi';
import { useMarkAttendanceMutation } from '../redux/api/attendanceApi';
import EmployeeQuickSelect from '../components/EmployeeQuickSelect';
import { useLocation, useNavigate } from 'react-router-dom';

export default function ScanAttendance() {
  const location = useLocation();
  const navigate = useNavigate();

  const checkoutMode = location.state?.checkoutMode ?? false;
  const expectedEmpId = location.state?.employeeId ?? null;
  const expectedEmpName = location.state?.employeeName ?? null;
  const returnTo = location.state?.returnTo ?? null;

  const { modelsLoaded, error: modelError } = useFaceModels();
  const { videoRef, cameraActive, error: camError, facingMode, startCamera, stopCamera, switchCamera } = useCamera('environment');

  const canvasRef = useRef(null);
  const intervalRef = useRef(null);
  const scanningRef = useRef(false);
  const isProcessingRef = useRef(false);
  const autoStartedRef = useRef(false);

  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  // ── Employee selection state (check-in only) ──────────────────────────
  const [verifiedEmployee, setVerifiedEmployee] = useState(null);
  const needsSelection = !checkoutMode && !verifiedEmployee;

  const handleEmployeeSelect = (emp) => {
    setVerifiedEmployee(emp);
  };

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
    setStatusMsg(
      checkoutMode
        ? `Scanning for ${expectedEmpName || 'employee'}'s face to check out...`
        : `Scanning for ${verifiedEmployee?.name || 'employee'}'s face to check in...`
    );
    isProcessingRef.current = false;

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current || isProcessingRef.current) return;
      isProcessingRef.current = true;

      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.1 }))
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

        // ── 1:1 verification for BOTH flows ──
        // Checkout: narrowed by expectedEmpId (known from the attendance log page).
        // Check-in: narrowed by verifiedEmployee (known from the quick-select step).
        const candidatePool = checkoutMode && expectedEmpId
          ? employees.filter((e) => e.id === expectedEmpId)
          : verifiedEmployee
            ? [verifiedEmployee]
            : []; // shouldn't be reached — selection is enforced before scanning starts

        const match = findBestMatch(detection.descriptor, candidatePool);
        const debug = findClosestForDebug(detection.descriptor, candidatePool);

        setDebugInfo({
          closest: debug.closestEmployee?.name || 'none',
          distance: debug.distance === Infinity ? 'N/A' : debug.distance.toFixed(3),
          isMatch: !!match,
        });

        if (!match) {
          setResult({
            type: 'fail',
            message: checkoutMode
              ? `Face doesn't match ${expectedEmpName}. Please make sure the correct person is scanning to check out.`
              : `Face doesn't match ${verifiedEmployee?.name}. Please try again.`,
          });
          return;
        }

        try {
          const data = await markAttendance({
            employee_id: match.employee.id,
            confidence: match.confidence,
          }).unwrap();

          setResult({
            type: 'success',
            scanType: data.type,
            employee: match.employee,
            confidence: match.confidence,
            returnTo,
          });
        } catch (err) {
          const payload = err?.data;
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
  }, [modelsLoaded, cameraActive, employees, drawDetections, markAttendance, checkoutMode, expectedEmpId, expectedEmpName, returnTo, verifiedEmployee]);

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

  //   // Check-in: require a fresh selection for a new attempt.
  //   if (!checkoutMode) {
  //     setVerifiedEmployee(null);
  //   }

  //   // Checkout mode has no manual "Scan Now" button — restart explicitly here.
  //   if (checkoutMode && cameraActive && modelsLoaded) {
  //     startScanning();
  //   }
  // };
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

    // NOTE: verifiedEmployee is intentionally NOT cleared here anymore.
    // A failed face match just means "try scanning again for the same person" —
    // the admin already selected who's checking in; that shouldn't be lost on
    // every retry. Only the explicit "Change" button clears the selection.

    // Checkout mode has no manual "Scan Now" button — restart explicitly here.
    if (checkoutMode && cameraActive && modelsLoaded) {
      startScanning();
    }

    // Check-in: also restart scanning automatically for the same selected employee,
    // instead of requiring the admin to hit "Scan Now" again after every failure.
    if (!checkoutMode && verifiedEmployee && cameraActive && modelsLoaded) {
      startScanning();
    }
  };
  const handleStopCamera = () => {
    clearInterval(intervalRef.current);
    scanningRef.current = false;
    isProcessingRef.current = false;
    setScanning(false);
    setStatusMsg('');
    stopCamera();
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  // ── Auto-start camera: checkout starts immediately; check-in waits for selection ──
  useEffect(() => {
    const readyToStartCamera = checkoutMode || !!verifiedEmployee;
    if (readyToStartCamera && modelsLoaded && !cameraActive && !autoStartedRef.current) {
      autoStartedRef.current = true;
      startCamera();
    }
  }, [checkoutMode, verifiedEmployee, modelsLoaded, cameraActive, startCamera]);

  // ── Auto-start scanning once camera is live ──
  useEffect(() => {
    const readyToScan = checkoutMode || !!verifiedEmployee;
    if (readyToScan && cameraActive && modelsLoaded && !scanningRef.current && !result) {
      startScanning();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkoutMode, verifiedEmployee, cameraActive, modelsLoaded]);

  if (modelError) {
    return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{modelError}</div>;
  }

  return (
    <>
      <div>
        {/* {debugInfo && (
          <div className="fixed bottom-2 left-2 right-2 z-50 rounded-lg bg-black/80 p-2 text-center text-xs text-white">
            Closest: {debugInfo.closest} ·
            Distance: {debugInfo.distance} · {debugInfo.isMatch ? '✅ Match' : '❌ No match'}
          </div>
        )} */}

        {checkoutMode && (
          <div className="mb-4 rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700">
            Checking out: <strong>{expectedEmpName}</strong>
          </div>
        )}

        {!modelsLoaded && <Spinner size="lg" text="Loading face recognition models..." />}

        {/* ── Inline search-select (check-in only) — sits at top, no page swap ── */}
        {modelsLoaded && !checkoutMode && needsSelection && (
          <div className="mb-6">
            <h3 className="mb-3 text-center text-sm font-semibold text-slate-700">
              Search by employee name or Aadhaar number
            </h3>
            <EmployeeQuickSelect employees={employees} onSelect={handleEmployeeSelect} />
          </div>
        )}

        {/* ── Selected employee banner ── */}
        {!checkoutMode && verifiedEmployee && (
          <div className="mb-4 flex items-center justify-between rounded-xl bg-indigo-50 px-4 py-2.5 text-sm font-medium text-indigo-700">
            <span>Checking in: <strong>{verifiedEmployee.name}</strong></span>
            <button
              onClick={() => setVerifiedEmployee(null)}
              className="text-xs font-semibold text-indigo-500 hover:text-indigo-700"
            >
              Change
            </button>
          </div>
        )}

        {/* ── Camera / face verification ── */}
        {modelsLoaded && (checkoutMode || verifiedEmployee) && (
          <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div className="space-y-3 relative">
              <CameraFeed
                videoRef={videoRef}
                canvasRef={canvasRef}
                cameraActive={cameraActive}
                facingMode={facingMode}
                onStart={() => startCamera()}
              />

              {cameraActive && !result && checkoutMode && (
                <button
                  type="button"
                  onClick={switchCamera}
                  className="absolute top-3 right-3 z-10 rounded-full bg-black/60 p-2.5 text-white hover:bg-black/80"
                  title="Switch camera"
                >
                  🔄
                </button>
              )}

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

            {!checkoutMode && (
              <div className="space-y-4">
                <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
                  <h3 className="mb-3 text-sm font-semibold text-slate-900">How to scan</h3>
                  <ol className="space-y-2 text-sm text-slate-500">
                    <li><strong className="text-slate-900">1.</strong> Position face in front of camera</li>
                    <li><strong className="text-slate-900">2.</strong> Hold still for 2–3 seconds</li>
                  </ol>
                </div>

                <div className="space-y-2">
                  {cameraActive && !scanning && !result && (
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
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}