

// import { useState, useRef, useCallback, useEffect } from 'react';

// export const useCamera = () => {
//   const videoRef = useRef(null);
//   const streamRef = useRef(null); // <-- persists across remounts
//   const [cameraActive, setCameraActive] = useState(false);
//   const [error, setError] = useState(null);

//   const startCamera = useCallback(async () => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: { facingMode: 'user', width: 640, height: 480 },
//       });
//       streamRef.current = stream;
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
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((t) => t.stop());
//       streamRef.current = null;
//     }
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//     setCameraActive(false);
//   }, []);

//   // Re-attach the live stream any time the <video> element (re)mounts,
//   // e.g. after ResultOverlay unmounts CameraFeed and it comes back
//   useEffect(() => {
//     if (cameraActive && videoRef.current && streamRef.current) {
//       videoRef.current.srcObject = streamRef.current;
//     }
//   });

//   // Stop tracks when the hook's owner unmounts entirely
//   useEffect(() => {
//     return () => {
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((t) => t.stop());
//       }
//     };
//   }, []);

//   return { videoRef, cameraActive, error, startCamera, stopCamera };
// };

import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = (defaultFacingMode = 'environment') => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState(defaultFacingMode); // 'environment' = back, 'user' = front

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  const startCamera = useCallback(async (mode = facingMode) => {
    try {
      stopTracks(); // always release any existing stream before requesting a new one

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      setFacingMode(mode);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      // Fallback: some devices/browsers reject a specific facingMode outright —
      // retry once with no constraint at all rather than failing completely.
      if (mode !== undefined) {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = fallbackStream;
          if (videoRef.current) {
            videoRef.current.srcObject = fallbackStream;
            setCameraActive(true);
            setError(null);
          }
          return;
        } catch {
          // fall through to the error below
        }
      }
      setError('Camera access denied. Please allow camera permission.');
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    stopTracks();
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  }, []);

  // Switch between front and back camera while streaming
  const switchCamera = useCallback(async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    await startCamera(nextMode);
  }, [facingMode, startCamera]);

  // Re-attach the live stream any time the <video> element (re)mounts
  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  });

  useEffect(() => {
    return () => stopTracks();
  }, []);

  return { videoRef, cameraActive, error, facingMode, startCamera, stopCamera, switchCamera };
};