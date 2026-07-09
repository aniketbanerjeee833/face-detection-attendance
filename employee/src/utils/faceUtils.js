// import * as faceapi from '@vladmandic/face-api';;

// export const getDistance = (d1, d2) => faceapi.euclideanDistance(d1, d2);

// // Normalizes stored face_descriptor into an array of Float32Array descriptors,
// // handling both old (single flat array) and new (array of arrays) formats.
// const normalizeDescriptors = (raw) => {
//   const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
//   if (!Array.isArray(parsed) || parsed.length === 0) return [];

//   // New format: array of arrays, e.g. [[...128], [...128], ...]
//   if (Array.isArray(parsed[0])) {
//     return parsed.map((d) => new Float32Array(d));
//   }
//   // Legacy format: single flat array of 128 numbers
//   return [new Float32Array(parsed)];
// };

// // Distance from a live descriptor to an employee = MIN distance across all
// // their stored descriptors (nearest neighbor, not average — more robust).
// const employeeDistance = (liveDescriptor, empDescriptors) => {
//   let min = Infinity;
//   for (const stored of empDescriptors) {
//     const d = getDistance(liveDescriptor, stored);
//     if (d < min) min = d;
//   }
//   return min;
// };

// export const findBestMatch = (liveDescriptor, employees, threshold = 0.65, minMargin = 0.06) => {
//   let bestDistance = Infinity;
//   let secondBestDistance = Infinity;
//   let closestEmployee = null;

//   for (const emp of employees) {
//     if (!emp.face_descriptor) continue;
//     const descriptors = normalizeDescriptors(emp.face_descriptor);
//     if (descriptors.length === 0) continue;

//     const distance = employeeDistance(liveDescriptor, descriptors);
//     if (distance < bestDistance) {
//       secondBestDistance = bestDistance;
//       bestDistance = distance;
//       closestEmployee = emp;
//     } else if (distance < secondBestDistance) {
//       secondBestDistance = distance;
//     }
//   }

//   const withinThreshold = closestEmployee !== null && bestDistance <= threshold;
//   const marginOk = secondBestDistance === Infinity || (secondBestDistance - bestDistance) >= minMargin;
//   const isMatch = withinThreshold && marginOk;

//   console.log(
//     `Best: ${closestEmployee?.name} @ ${bestDistance.toFixed(3)} | ` +
//     `2nd best @ ${secondBestDistance === Infinity ? 'N/A' : secondBestDistance.toFixed(3)} | match: ${isMatch}`
//   );

//   if (!isMatch) return null;

//   const confidence = Math.round((1 - bestDistance) * 100);
//   return { employee: closestEmployee, distance: bestDistance, confidence };
// };

// export const findClosestForDebug = (liveDescriptor, employees) => {
//   let closestEmployee = null;
//   let bestDistance = Infinity;
//   let secondBestDistance = Infinity;

//   for (const emp of employees) {
//     if (!emp.face_descriptor) continue;
//     const descriptors = normalizeDescriptors(emp.face_descriptor);
//     if (descriptors.length === 0) continue;

//     const distance = employeeDistance(liveDescriptor, descriptors);
//     if (distance < bestDistance) {
//       secondBestDistance = bestDistance;
//       bestDistance = distance;
//       closestEmployee = emp;
//     } else if (distance < secondBestDistance) {
//       secondBestDistance = distance;
//     }
//   }

//   return { closestEmployee, distance: bestDistance, secondBestDistance };
// };


import * as faceapi from '@vladmandic/face-api';;

export const getDistance = (d1, d2) => faceapi.euclideanDistance(d1, d2);

const normalizeDescriptors = (raw) => {
  const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!Array.isArray(parsed) || parsed.length === 0) return [];
  if (Array.isArray(parsed[0])) return parsed.map((d) => new Float32Array(d));
  return [new Float32Array(parsed)];
};

// ✅ Use AVERAGE distance, not MIN
// MIN is dangerous — one good stored descriptor can match the wrong person
// AVERAGE across all descriptors is more stable and less prone to false matches
const employeeDistance = (liveDescriptor, empDescriptors) => {
  if (empDescriptors.length === 0) return Infinity;
  const sum = empDescriptors.reduce((acc, stored) => acc + getDistance(liveDescriptor, stored), 0);
  return sum / empDescriptors.length;
};

export const findBestMatch = (
  liveDescriptor,
  employees,
  threshold = 0.45,   // ✅ was 0.65 — much stricter, no wrong matches
  minMargin = 0.10    // ✅ was 0.06 — bigger gap required between 1st and 2nd
) => {
  let bestDistance = Infinity;
  let secondBestDistance = Infinity;
  let closestEmployee = null;

  for (const emp of employees) {
    if (!emp.face_descriptor) continue;
    const descriptors = normalizeDescriptors(emp.face_descriptor);
    if (descriptors.length === 0) continue;
    const distance = employeeDistance(liveDescriptor, descriptors);

    if (distance < bestDistance) {
      secondBestDistance = bestDistance;
      bestDistance = distance;
      closestEmployee = emp;
    } else if (distance < secondBestDistance) {
      secondBestDistance = distance;
    }
  }

  const withinThreshold = closestEmployee !== null && bestDistance <= threshold;
  const marginOk =
    secondBestDistance === Infinity ||
    (secondBestDistance - bestDistance) >= minMargin;

  // ✅ Extra guard: if 1st and 2nd are both close, it's ambiguous — reject
  const notAmbiguous = secondBestDistance > 0.40;

  const isMatch = withinThreshold && marginOk && notAmbiguous;

  console.log(
    `Best: ${closestEmployee?.name} @ ${bestDistance.toFixed(3)} | ` +
    `2nd: ${secondBestDistance === Infinity ? 'N/A' : secondBestDistance.toFixed(3)} | ` +
    `margin: ${(secondBestDistance - bestDistance).toFixed(3)} | ` +
    `ambiguous: ${!notAmbiguous} | match: ${isMatch}`
  );

  if (!isMatch) return null;

  const confidence = Math.round((1 - bestDistance) * 100);
  return { employee: closestEmployee, distance: bestDistance, confidence };
};

export const findClosestForDebug = (liveDescriptor, employees) => {
  let closestEmployee = null;
  let bestDistance = Infinity;
  let secondBestDistance = Infinity;

  for (const emp of employees) {
    if (!emp.face_descriptor) continue;
    const descriptors = normalizeDescriptors(emp.face_descriptor);
    if (descriptors.length === 0) continue;
    const distance = employeeDistance(liveDescriptor, descriptors);

    if (distance < bestDistance) {
      secondBestDistance = bestDistance;
      bestDistance = distance;
      closestEmployee = emp;
    } else if (distance < secondBestDistance) {
      secondBestDistance = distance;
    }
  }

  return { closestEmployee, distance: bestDistance, secondBestDistance };
};