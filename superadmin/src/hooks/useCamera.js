// import { useState, useRef, useCallback } from 'react';

// export const useCamera = () => {
//   const videoRef = useRef(null);
//   const [cameraActive, setCameraActive] = useState(false);
//   const [error, setError] = useState(null);

//   const startCamera = useCallback(async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: 'user', width: 640, height: 480 },
//       });
//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         setCameraActive(true);
//         setError(null);
//       }
//     } catch (err) {
//       setError('Camera access denied. Please allow camera permission in Chrome.');
//     }
//   }, []);

//   const stopCamera = useCallback(() => {
//     if (videoRef.current?.srcObject) {
//       videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
//       videoRef.current.srcObject = null;
//       setCameraActive(false);
//     }
//   }, []);

//   return { videoRef, cameraActive, error, startCamera, stopCamera };
// };

import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = () => {
  const videoRef = useRef(null);
  const streamRef = useRef(null); // <-- persists across remounts
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      setError('Camera access denied. Please allow camera permission in Chrome.');
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Re-attach the live stream any time the <video> element (re)mounts,
  // e.g. after ResultOverlay unmounts CameraFeed and it comes back
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  });

  // Stop tracks when the hook's owner unmounts entirely
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  return { videoRef, cameraActive, error, startCamera, stopCamera };
};