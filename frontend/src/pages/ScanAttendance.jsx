
// import { useState, useRef, useEffect, useCallback } from 'react';
// import * as faceapi from 'face-api.js';
// import { motion } from 'framer-motion';
// import { useFaceModels } from '../hooks/useFaceModels';
// import { useCamera } from '../hooks/useCamera';
// import { findBestMatch } from '../utils/faceUtils';
// import CameraFeed from '../components/face/CameraFeed';
// import ResultOverlay from '../components/face/ResultOverlay';
// import Spinner from '../components/ui/Spinner';
// import Button from '../components/ui/Button';
// import api from '../api/axiosInstance';

// export default function ScanAttendance() {
//   const { modelsLoaded, error: modelError } = useFaceModels();
//   const { videoRef, cameraActive, error: camError, startCamera, stopCamera } = useCamera();
//   const canvasRef = useRef(null);
//   const intervalRef = useRef(null);

//   const [employees, setEmployees] = useState([]);
//   const [scanning, setScanning] = useState(false);
//   const [result, setResult] = useState(null);
//   const [statusMsg, setStatusMsg] = useState('');

//   useEffect(() => {
//     window.faceapi = faceapi;
//     window.videoRef = videoRef;
//   }, []);

//   useEffect(() => {
//     api.get('/employees')
//       .then(({ data }) => {
//         const withDesc = data.employees.filter((e) => e.face_descriptor);
//         setEmployees(withDesc);
//       })
//       .catch((err) => {
//         console.error('Failed to fetch employees:', err);
//         setEmployees([]);
//       });
//   }, []);

//   const drawDetections = useCallback((detections) => {
//     if (!canvasRef.current || !videoRef.current) return;
//     const dims = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
//     const resized = faceapi.resizeResults(detections, dims);
//     const ctx = canvasRef.current.getContext('2d');
//     ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     faceapi.draw.drawDetections(canvasRef.current, resized);
//   }, []);

//   const startScanning = useCallback(() => {
//     if (!modelsLoaded || !cameraActive) return;
//     setScanning(true);
//     setStatusMsg('Looking for face...');

//     intervalRef.current = setInterval(async () => {
//       if (!videoRef.current) return;
//       try {
//         const detection = await faceapi
//           .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.1 }))
//           .withFaceLandmarks()
//           .withFaceDescriptor();

//         if (!detection) {
//           setStatusMsg('No face detected — hold still');
//           return;
//         }

//         drawDetections([detection]);
//         setStatusMsg('Face detected — matching...');

//         const match = findBestMatch(detection.descriptor, employees);
//         clearInterval(intervalRef.current);
//         setScanning(false);

//         if (!match) {
//           setResult({ type: 'fail' });
//           return;
//         }

//         try {
//           const { data } = await api.post('/attendance/mark', {
//             employee_id: match.employee.id,
//             confidence: match.confidence,
//           });
//           setResult({
//             type: 'success',
//             employee: match.employee,
//             confidence: match.confidence,
//             status: data.status,
//           });
//         } catch (err) {
//           const msg = err.response?.data?.message || '';
//           if (msg.includes('already marked')) {
//             setResult({
//               type: 'success',
//               employee: match.employee,
//               confidence: match.confidence,
//               status: 'already_marked',
//               alreadyMarked: true,
//             });
//           } else {
//             setResult({ type: 'fail' });
//           }
//         }
//       } catch (err) {
//         console.error('Detection error:', err);
//       }
//     }, 800);
//   }, [modelsLoaded, cameraActive, employees, drawDetections]);

//   const handleReset = () => {
//     setResult(null);
//     setStatusMsg('');
//     if (canvasRef.current) {
//       const ctx = canvasRef.current.getContext('2d');
//       ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
//     }
//   };

//   useEffect(() => () => clearInterval(intervalRef.current), []);

//   if (modelError) {
//     return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{modelError}</div>;
//   }

//   return (
//     <div>
//       {!modelsLoaded && <Spinner size="lg" text="Loading face recognition models..." />}

//       {modelsLoaded && !result && (
//         <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
//           <div className="space-y-3">
//             <CameraFeed
//               videoRef={videoRef}
//               canvasRef={canvasRef}
//               cameraActive={cameraActive}
//               onStart={startCamera}
//             />
//             {camError && (
//               <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{camError}</div>
//             )}
//             {statusMsg && (
//               <motion.div
//                 key={statusMsg}
//                 initial={{ opacity: 0 }}
//                 animate={{ opacity: 1 }}
//                 className="rounded-xl bg-indigo-50 px-4 py-2.5 text-center text-sm font-medium text-indigo-700"
//               >
//                 {statusMsg}
//               </motion.div>
//             )}
//           </div>

//           <div className="space-y-4">
//             <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100">
//               <h3 className="mb-3 text-sm font-semibold text-slate-900">How to scan</h3>
//               <ol className="space-y-2 text-sm text-slate-500">
//                 <li><strong className="text-slate-900">1.</strong> Click <strong className="text-slate-900">Open Camera</strong></li>
//                 <li><strong className="text-slate-900">2.</strong> Position face in front of camera</li>
//                 <li><strong className="text-slate-900">3.</strong> Click <strong className="text-slate-900">Scan Now</strong></li>
//                 <li><strong className="text-slate-900">4.</strong> Hold still for 2–3 seconds</li>
//               </ol>
//             </div>

//             {/* <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100 text-sm">
//               <p className="flex justify-between py-1 text-slate-500">
//                 Registered employees <strong className="text-slate-900">{employees.length}</strong>
//               </p>
//               <p className="flex justify-between py-1 text-slate-500">
//                 Models <strong className="text-success-600">Ready ✓</strong>
//               </p>
//             </div> */}

//             <div className="space-y-2">
//               {cameraActive && !scanning && (
//                 <Button size="lg" full onClick={startScanning}>📷 Scan Now</Button>
//               )}
//               {scanning && (
//                 <Button size="lg" full variant="outline" disabled>🔄 Scanning...</Button>
//               )}
//               {cameraActive && (
//                 <Button full variant="danger" onClick={stopCamera}>Stop Camera</Button>
//               )}
//             </div>
//           </div>
//         </div>
//       )}

//       {result && <ResultOverlay result={result} onReset={handleReset} />}
//     </div>
//   );
// }

import { useState, useRef, useEffect, useCallback } from 'react';
import * as faceapi from 'face-api.js';
import { motion } from 'framer-motion';
import { useFaceModels } from '../hooks/useFaceModels';
import { useCamera } from '../hooks/useCamera';
import { findBestMatch } from '../utils/faceUtils';
import CameraFeed from '../components/face/CameraFeed';
import ResultOverlay from '../components/face/ResultOverlay';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { useGetEmployeesQuery } from '../redux/api/employeeApi';
import { useMarkAttendanceMutation } from '../redux/api/attendanceApi';

export default function ScanAttendance() {
  const { modelsLoaded, error: modelError } = useFaceModels();
  const { videoRef, cameraActive, error: camError, startCamera, stopCamera } = useCamera();
  const canvasRef  = useRef(null);
  const intervalRef = useRef(null);
const scanningRef = useRef(false);
  const [scanning,   setScanning]   = useState(false);
  const [result,     setResult]     = useState(null);
  const [statusMsg,  setStatusMsg]  = useState('');

  // RTK Query — employees with face descriptors (cached, no re-fetch on re-render)
  const { data: empData } = useGetEmployeesQuery({ page: 1, limit: 100 });
  const employees = (empData?.employees ?? []).filter((e) => e.face_descriptor);

  // RTK Query mutation — mark attendance
  const [markAttendance] = useMarkAttendanceMutation();

  const drawDetections = useCallback((detections) => {
    if (!canvasRef.current || !videoRef.current) return;
    const dims    = faceapi.matchDimensions(canvasRef.current, videoRef.current, true);
    const resized = faceapi.resizeResults(detections, dims);
    const ctx     = canvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    faceapi.draw.drawDetections(canvasRef.current, resized);
  }, []);

  // const startScanning = useCallback(() => {
  //   if (!modelsLoaded || !cameraActive) return;
  //   setScanning(true);
  //   setStatusMsg('Looking for face...');

  //   intervalRef.current = setInterval(async () => {
  //     if (!videoRef.current) return;
  //     try {
  //       const detection = await faceapi
  //         .detectSingleFace(
  //           videoRef.current,
  //           new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.1 })
  //         )
  //         .withFaceLandmarks()
  //         .withFaceDescriptor();

  //       if (!detection) {
  //         setStatusMsg('No face detected — hold still');
  //         return;
  //       }

  //       drawDetections([detection]);
  //       setStatusMsg('Face detected — matching...');

  //       const match = findBestMatch(detection.descriptor, employees);
  //       clearInterval(intervalRef.current);
  //       setScanning(false);

  //       if (!match) {
  //         setResult({ type: 'fail' });
  //         return;
  //       }

  //       try {
  //         const data = await markAttendance({
  //           employee_id: match.employee.id,
  //           confidence:  match.confidence,
  //         }).unwrap();

  //         setResult({
  //           type:       'success',
  //           employee:   match.employee,
  //           confidence: match.confidence,
  //           status:     data.status,
  //         });
  //       } catch (err) {
  //         const msg = err?.data?.message || '';
  //         if (msg.includes('already marked')) {
  //           setResult({
  //             type:         'success',
  //             employee:     match.employee,
  //             confidence:   match.confidence,
  //             status:       'already_marked',
  //             alreadyMarked: true,
  //           });
  //         } else {
  //           setResult({ type: 'fail' });
  //         }
  //       }
  //     } catch (err) {
  //       console.error('Detection error:', err);
  //     }
  //   }, 800);
  // }, [modelsLoaded, cameraActive, employees, drawDetections, markAttendance]);
const isProcessingRef = useRef(false);

const startScanning = useCallback(() => {
  if (!modelsLoaded || !cameraActive) return;
   if (scanningRef.current) return;

  scanningRef.current = true;
  setScanning(true);
  setStatusMsg('Looking for face...');
  isProcessingRef.current = false;

  intervalRef.current = setInterval(async () => {
    if (!videoRef.current || isProcessingRef.current) return; // guard re-entry
    isProcessingRef.current = true;

    try {
      const detection = await faceapi
        .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.1 }))
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        setStatusMsg('No face detected — hold still');
        isProcessingRef.current = false; // allow next tick
        return;
      }

      // Stop the loop immediately — nothing after this point can fire again
      clearInterval(intervalRef.current);
      drawDetections([detection]);
      setStatusMsg('Face detected — matching...');
      scanningRef.current = false;
      setScanning(false);

      const match = findBestMatch(detection.descriptor, employees);
      if (!match) {
        setResult({ type: 'fail' });
        return;
      }

      try {
        const data = await markAttendance({
          employee_id: match.employee.id,
          confidence: match.confidence,
        }).unwrap();

        setResult({ type: 'success', employee: match.employee, confidence: match.confidence, status: data.status });
      } catch (err) {
        const msg = err?.data?.message || '';
        if (msg.includes('already marked')) {
          setResult({ type: 'success', employee: match.employee, confidence: match.confidence, status: 'already_marked', alreadyMarked: true });
        } else {
          setResult({ type: 'fail' });
        }
      }
    } catch (err) {
      console.error('Detection error:', err);
        clearInterval(intervalRef.current);
  scanningRef.current = false;
  setScanning(false);

  isProcessingRef.current = false;
      // scanningRef.current = false;
      // isProcessingRef.current = false;
    }
  }, 800);
}, [modelsLoaded, cameraActive, employees, drawDetections, markAttendance]);
  // const handleReset = () => {
  //   setResult(null);
  //   setStatusMsg('');
  //   if (canvasRef.current) {
  //     canvasRef.current.getContext('2d')
  //       .clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
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
  const handleReset = () => {
  clearInterval(intervalRef.current);

  scanningRef.current = false;
  isProcessingRef.current = false;

  setScanning(false);
  setResult(null);
  setStatusMsg("");

  if (canvasRef.current) {
    canvasRef.current
      .getContext("2d")
      .clearRect(
        0,
        0,
        canvasRef.current.width,
        canvasRef.current.height
      );
  }
};

  useEffect(() => () => clearInterval(intervalRef.current), []);

  if (modelError) {
    return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{modelError}</div>;
  }

  return (
    <div>
      {!modelsLoaded && <Spinner size="lg" text="Loading face recognition models..." />}
{modelsLoaded && (
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-3 relative">
          <CameraFeed
            videoRef={videoRef}
            canvasRef={canvasRef}
            cameraActive={cameraActive}
            onStart={startCamera}
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

           

            {/* <div className="space-y-2">
              {cameraActive && !scanning && (
                <Button size="lg" full onClick={startScanning}>📷 Scan Now</Button>
              )}
              {scanning && (
                <Button size="lg" full variant="outline" disabled>🔄 Scanning...</Button>
              )}
              {cameraActive && (
                <Button full variant="danger" onClick={stopCamera}>Stop Camera</Button>
              )}
            </div> */}
              {!result && (
    <div className="space-y-2">
      {cameraActive && !scanning && (
        <Button size="lg" full onClick={startScanning}>📷 Scan Now</Button>
      )}
      {scanning && (
        <Button size="lg" full variant="outline" disabled>🔄 Scanning...</Button>
      )}
      {cameraActive && (
        <Button full variant="danger" onClick={handleStopCamera}>Stop Camera</Button>
      )}
    </div>
  )}
          </div>
        </div>
      )}
{/* 
      {result && <ResultOverlay result={result} onReset={handleReset} />} */}
    </div>
  );
}