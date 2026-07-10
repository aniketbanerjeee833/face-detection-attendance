

// import { useState, useRef, useCallback, useEffect } from 'react';

// export const useCamera = (defaultFacingMode = 'environment') => {
//   const videoRef = useRef(null);
//   const streamRef = useRef(null);
//   const [cameraActive, setCameraActive] = useState(false);
//   const [error, setError] = useState(null);
//   const [facingMode, setFacingMode] = useState(defaultFacingMode); // 'environment' = back, 'user' = front

//   const stopTracks = () => {
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((t) => t.stop());
//       streamRef.current = null;
//     }
//   };

//   const startCamera = useCallback(async (mode = facingMode) => {
//     try {
//       stopTracks(); // always release any existing stream before requesting a new one

//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: {
//           facingMode: { ideal: mode },
//           width: { ideal: 1280 },
//           height: { ideal: 720 },
//         },
//       });

//       streamRef.current = stream;
//       setFacingMode(mode);

//       if (videoRef.current) {
//         videoRef.current.srcObject = stream;
//         setCameraActive(true);
//         setError(null);
//       }
//     } catch (err) {
//       // Fallback: some devices/browsers reject a specific facingMode outright —
//       // retry once with no constraint at all rather than failing completely.
//       if (mode !== undefined) {
//         try {
//           const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
//           streamRef.current = fallbackStream;
//           if (videoRef.current) {
//             videoRef.current.srcObject = fallbackStream;
//             setCameraActive(true);
//             setError(null);
//           }
//           return;
//         } catch {
//           // fall through to the error below
//         }
//       }
//       setError('Camera access denied. Please allow camera permission.');
//     }
//   }, [facingMode]);

//   const stopCamera = useCallback(() => {
//     stopTracks();
//     if (videoRef.current) {
//       videoRef.current.srcObject = null;
//     }
//     setCameraActive(false);
//   }, []);

//   // Switch between front and back camera while streaming
//   const switchCamera = useCallback(async () => {
//     const nextMode = facingMode === 'environment' ? 'user' : 'environment';
//     await startCamera(nextMode);
//   }, [facingMode, startCamera]);

//   // Re-attach the live stream any time the <video> element (re)mounts
//   useEffect(() => {
//     if (cameraActive && videoRef.current && streamRef.current) {
//       videoRef.current.srcObject = streamRef.current;
//     }
//   });

//   useEffect(() => {
//     return () => stopTracks();
//   }, []);

//   return { videoRef, cameraActive, error, facingMode, startCamera, stopCamera, switchCamera };
// };


import { useState, useRef, useCallback, useEffect } from 'react';

export const useCamera = (defaultFacingMode = 'environment') => {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);
  const [facingMode, setFacingMode] = useState(defaultFacingMode);

  // ── Torch/flash state ────────────────────────────────────────────────
  const [torchOn, setTorchOn] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);

  const stopTracks = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  };

  // Checks whether the active video track actually supports a torch —
  // most front cameras and virtually all desktops/laptops don't.
  const checkTorchSupport = (stream) => {
    try {
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities?.();
      const supported = !!capabilities?.torch;
      setTorchSupported(supported);
      return supported;
    } catch {
      setTorchSupported(false);
      return false;
    }
  };

  const startCamera = useCallback(async (mode = facingMode) => {
    try {
      stopTracks();
      setTorchOn(false); // reset — new stream always starts with torch off

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      streamRef.current = stream;
      setFacingMode(mode);
      checkTorchSupport(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setCameraActive(true);
        setError(null);
      }
    } catch (err) {
      if (mode !== undefined) {
        try {
          const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = fallbackStream;
          checkTorchSupport(fallbackStream);
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
    setTorchOn(false);
    setTorchSupported(false);
  }, []);

  const switchCamera = useCallback(async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    await startCamera(nextMode);
  }, [facingMode, startCamera]);

  // Toggle the torch on the currently active track
  const toggleTorch = useCallback(async () => {
    if (!streamRef.current) return;
    const track = streamRef.current.getVideoTracks()[0];
    if (!track) return;

    const nextState = !torchOn;
    try {
      await track.applyConstraints({ advanced: [{ torch: nextState }] });
      setTorchOn(nextState);
    } catch (err) {
      console.warn('Torch toggle failed:', err.message);
      setTorchSupported(false); // device claimed support but rejected the constraint — hide the button
    }
  }, [torchOn]);

  useEffect(() => {
    if (cameraActive && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
    }
  });

  useEffect(() => {
    return () => stopTracks();
  }, []);

  return {
    videoRef,
    cameraActive,
    error,
    facingMode,
    startCamera,
    stopCamera,
    switchCamera,
    torchOn,          // ← new
    torchSupported,   // ← new
    toggleTorch,       // ← new
  };
};