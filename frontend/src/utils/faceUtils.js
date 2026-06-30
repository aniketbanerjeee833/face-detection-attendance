import * as faceapi from 'face-api.js';

// Euclidean distance between two descriptors
export const getDistance = (d1, d2) => {
  return faceapi.euclideanDistance(d1, d2);
};

// Convert stored JSON array → Float32Array
export const toFloat32 = (arr) => new Float32Array(arr);

// Find the best match from employees list
// Returns { employee, distance, confidence } or null
export const findBestMatch = (liveDescriptor, employees, threshold = 0.5) => {
  let bestMatch = null;
  let bestDistance = Infinity;

  for (const emp of employees) {
    if (!emp.face_descriptor) continue;
    const stored = toFloat32(
      typeof emp.face_descriptor === 'string'
        ? JSON.parse(emp.face_descriptor)
        : emp.face_descriptor
    );
    const distance = getDistance(liveDescriptor, stored);
    if (distance < bestDistance) {
      bestDistance = distance;
      bestMatch = emp;
    }
  }

  if (bestDistance > threshold) return null;

  const confidence = Math.round((1 - bestDistance) * 100);
  return { employee: bestMatch, distance: bestDistance, confidence };
};