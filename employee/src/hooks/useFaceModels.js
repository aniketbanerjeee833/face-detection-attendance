// import { useState, useEffect } from 'react';
// import * as faceapi from '@vladmandic/face-api';;

// export const useFaceModels = () => {
//   const [modelsLoaded, setModelsLoaded] = useState(false);
//   const [error, setError] = useState(null);

//   useEffect(() => {
//     const loadModels = async () => {
//       try {
//         const MODEL_URL = '/models'; // served from public/models
//         await Promise.all([
//           faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
//           faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
//           faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
//         ]);
//         setModelsLoaded(true);
//       } catch (err) {
//         setError('Failed to load face recognition models');
//         console.error(err);
//       }
//     };
//     loadModels();
//   }, []);

//   return { modelsLoaded, error };
// };

import { useState, useEffect } from 'react';
import * as faceapi from '@vladmandic/face-api';;
//import * as faceapi from 'face-api.js'
// Module-level state — shared across every component that calls useFaceModels(),
// persists for the lifetime of the page (not per-component-mount).
let loadPromise = null;
let isLoaded = false;
let loadError = null;

const loadModelsOnce = () => {
  if (loadPromise) return loadPromise; // already loading or loaded — reuse the same promise

  const MODEL_URL = '/attendance/employee/models';
  loadPromise = Promise.all([
    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
  ])
    .then(() => {
      isLoaded = true;
    })
    .catch((err) => {
      loadError = 'Failed to load face recognition models';
      console.error(err);
      loadPromise = null; // allow retry on next mount if it failed
      throw err;
    });

  return loadPromise;
};

export const useFaceModels = () => {
  const [modelsLoaded, setModelsLoaded] = useState(isLoaded);
  const [error, setError] = useState(loadError);

  useEffect(() => {
    if (isLoaded) {
      setModelsLoaded(true);
      return;
    }

    loadModelsOnce()
      .then(() => setModelsLoaded(true))
      .catch(() => setError('Failed to load face recognition models'));
  }, []);

  return { modelsLoaded, error };
};