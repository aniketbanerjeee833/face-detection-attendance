import { useState, useRef, useCallback } from 'react';

export const useCamera = () => {
  const videoRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState(null);

  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: 640, height: 480 },
      });
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
    if (videoRef.current?.srcObject) {
      videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
      videoRef.current.srcObject = null;
      setCameraActive(false);
    }
  }, []);

  return { videoRef, cameraActive, error, startCamera, stopCamera };
};