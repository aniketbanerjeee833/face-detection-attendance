// import { useState, useRef, useEffect, useCallback } from 'react';
// import * as faceapi from 'face-api.js';
// import { useFaceModels } from '../hooks/useFaceModels';
// import { useCamera } from '../hooks/useCamera';
// import { findBestMatch } from '../utils/faceUtils';
// import CameraFeed from '../components/face/CameraFeed';
// import ResultOverlay from '../components/face/ResultOverlay';
// import Spinner from '../components/ui/Spinner';
// import api from '../api/axiosInstance';

// export default function ScanAttendance() {
//   const { modelsLoaded, error: modelError } = useFaceModels();

//   const { videoRef, cameraActive, error: camError, startCamera, stopCamera } = useCamera();
//   const canvasRef = useRef(null);
//   const intervalRef = useRef(null);

//   const [employees, setEmployees] = useState([]);
//   const [scanning, setScanning] = useState(false);
//   const [result, setResult] = useState(null); // { type: 'success'|'fail', employee, confidence, status }
//   const [statusMsg, setStatusMsg] = useState('');
//   useEffect(() => {
//   window.faceapi = faceapi;
//   window.videoRef = videoRef;
// }, []);
//   // Load all employees with descriptors once
// //   useEffect(() => {
// //     api.get('/employees').then(({ data }) => {
// //       const withDesc = data.employees.filter((e) => e.face_descriptor);
// //       setEmployees(withDesc);
// //     });
// //   }, []);
// // Load all employees with descriptors once
// useEffect(() => {
//   api.get('/employees')
//     .then(({ data }) => {
//       const withDesc = data.employees.filter((e) => e.face_descriptor);
//       setEmployees(withDesc);
//     })
//     .catch((err) => {
//       console.error('Failed to fetch employees:', err);
//       setEmployees([]);
//     });
// }, []);
//   // Draw detections on canvas overlay
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
//   .detectSingleFace(videoRef.current,
//      new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.1 }))
//   .withFaceLandmarks()
//   .withFaceDescriptor();
//         // const detection = await faceapi
//         //   .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions())
//         //   .withFaceLandmarks()
//         //   .withFaceDescriptor();

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

//         // Mark attendance via API
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

//   if (modelError) return <div className="alert alert--error">{modelError}</div>;

//   return (
//     <div className="scan-page">
//       {!modelsLoaded && <Spinner size="lg" text="Loading face recognition models..." />}

//       {modelsLoaded && !result && (
//         <div className="scan-layout">
//           <div className="scan-camera-section">
//             <CameraFeed
//               videoRef={videoRef}
//               canvasRef={canvasRef}
//               cameraActive={cameraActive}
//               onStart={startCamera}
//             />
//             {camError && <div className="alert alert--error">{camError}</div>}
//             {statusMsg && <div className="scan-status">{statusMsg}</div>}
//           </div>

//           <div className="scan-controls">
//             <div className="scan-info-card">
//               <h3>How to scan</h3>
//               <ol>
//                 <li>Click <strong>Open Camera</strong></li>
//                 <li>Position face in front of camera</li>
//                 <li>Click <strong>Scan Now</strong></li>
//                 <li>Hold still for 2–3 seconds</li>
//               </ol>
//             </div>

//             <div className="scan-info-card">
//               <p>Registered employees: <strong>{employees.length}</strong></p>
//               <p>Models: <strong style={{ color: 'green' }}>Ready ✓</strong></p>
//             </div>

//             {cameraActive && !scanning && (
//               <button className="btn btn--primary btn--full btn--lg" onClick={startScanning}>
//                 📷 Scan Now
//               </button>
//             )}
//             {scanning && (
//               <button className="btn btn--outline btn--full" disabled>
//                 🔄 Scanning...
//               </button>
//             )}
//             {cameraActive && (
//               <button className="btn btn--danger btn--full" onClick={stopCamera}>
//                 Stop Camera
//               </button>
//             )}
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
import api from '../api/axiosInstance';

export default function ScanAttendance() {
  const { modelsLoaded, error: modelError } = useFaceModels();
  const { videoRef, cameraActive, error: camError, startCamera, stopCamera } = useCamera();
  const canvasRef = useRef(null);
  const intervalRef = useRef(null);

  const [employees, setEmployees] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');

  useEffect(() => {
    window.faceapi = faceapi;
    window.videoRef = videoRef;
  }, []);

  useEffect(() => {
    api.get('/employees')
      .then(({ data }) => {
        const withDesc = data.employees.filter((e) => e.face_descriptor);
        setEmployees(withDesc);
      })
      .catch((err) => {
        console.error('Failed to fetch employees:', err);
        setEmployees([]);
      });
  }, []);

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
    setScanning(true);
    setStatusMsg('Looking for face...');

    intervalRef.current = setInterval(async () => {
      if (!videoRef.current) return;
      try {
        const detection = await faceapi
          .detectSingleFace(videoRef.current, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.1 }))
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          setStatusMsg('No face detected — hold still');
          return;
        }

        drawDetections([detection]);
        setStatusMsg('Face detected — matching...');

        const match = findBestMatch(detection.descriptor, employees);
        clearInterval(intervalRef.current);
        setScanning(false);

        if (!match) {
          setResult({ type: 'fail' });
          return;
        }

        try {
          const { data } = await api.post('/attendance/mark', {
            employee_id: match.employee.id,
            confidence: match.confidence,
          });
          setResult({
            type: 'success',
            employee: match.employee,
            confidence: match.confidence,
            status: data.status,
          });
        } catch (err) {
          const msg = err.response?.data?.message || '';
          if (msg.includes('already marked')) {
            setResult({
              type: 'success',
              employee: match.employee,
              confidence: match.confidence,
              status: 'already_marked',
              alreadyMarked: true,
            });
          } else {
            setResult({ type: 'fail' });
          }
        }
      } catch (err) {
        console.error('Detection error:', err);
      }
    }, 800);
  }, [modelsLoaded, cameraActive, employees, drawDetections]);

  const handleReset = () => {
    setResult(null);
    setStatusMsg('');
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  useEffect(() => () => clearInterval(intervalRef.current), []);

  if (modelError) {
    return <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{modelError}</div>;
  }

  return (
    <div>
      {!modelsLoaded && <Spinner size="lg" text="Loading face recognition models..." />}

      {modelsLoaded && !result && (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <div className="space-y-3">
            <CameraFeed
              videoRef={videoRef}
              canvasRef={canvasRef}
              cameraActive={cameraActive}
              onStart={startCamera}
            />
            {camError && (
              <div className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-600">{camError}</div>
            )}
            {statusMsg && (
              <motion.div
                key={statusMsg}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="rounded-xl bg-indigo-50 px-4 py-2.5 text-center text-sm font-medium text-indigo-700"
              >
                {statusMsg}
              </motion.div>
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

            {/* <div className="rounded-2xl bg-white p-5 shadow-soft ring-1 ring-slate-100 text-sm">
              <p className="flex justify-between py-1 text-slate-500">
                Registered employees <strong className="text-slate-900">{employees.length}</strong>
              </p>
              <p className="flex justify-between py-1 text-slate-500">
                Models <strong className="text-success-600">Ready ✓</strong>
              </p>
            </div> */}

            <div className="space-y-2">
              {cameraActive && !scanning && (
                <Button size="lg" full onClick={startScanning}>📷 Scan Now</Button>
              )}
              {scanning && (
                <Button size="lg" full variant="outline" disabled>🔄 Scanning...</Button>
              )}
              {cameraActive && (
                <Button full variant="danger" onClick={stopCamera}>Stop Camera</Button>
              )}
            </div>
          </div>
        </div>
      )}

      {result && <ResultOverlay result={result} onReset={handleReset} />}
    </div>
  );
}