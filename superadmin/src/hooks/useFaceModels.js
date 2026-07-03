import { useState, useEffect } from 'react';
import * as faceapi from 'face-api.js';

export const useFaceModels = () => {
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = '/models'; // served from public/models
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        setError('Failed to load face recognition models');
        console.error(err);
      }
    };
    loadModels();
  }, []);

  return { modelsLoaded, error };
};