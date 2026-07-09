// import * as faceapi from '@vladmandic/face-api';;

// // Euclidean distance between two descriptors
// export const getDistance = (d1, d2) => {
//   return faceapi.euclideanDistance(d1, d2);
// };

// // Convert stored JSON array → Float32Array
// export const toFloat32 = (arr) => new Float32Array(arr);

// // Find the best match from employees list
// // Returns { employee, distance, confidence } or null
// // export const findBestMatch = (liveDescriptor, employees, threshold = 0.65) => {
// //   let bestMatch = null;
// //   let bestDistance = Infinity;

// //   for (const emp of employees) {
// //     if (!emp.face_descriptor) continue;
// //     const stored = toFloat32(
// //       typeof emp.face_descriptor === 'string'
// //         ? JSON.parse(emp.face_descriptor)
// //         : emp.face_descriptor
// //     );
// //     const distance = getDistance(liveDescriptor, stored);
// //     if (distance < bestDistance) {
// //       bestDistance = distance;
// //       bestMatch = emp;
// //     }
// //   }

// //   if (bestDistance > threshold) return null;

// //   const confidence = Math.round((1 - bestDistance) * 100);
// //   return { employee: bestMatch, distance: bestDistance, confidence };
// // };

// export const findBestMatch = (liveDescriptor, employees, threshold = 0.75) => {
//   let closestEmployee = null;
//   let bestDistance = Infinity;

//   for (const emp of employees) {
//     if (!emp.face_descriptor) continue;
//     const stored = toFloat32(
//       typeof emp.face_descriptor === 'string' ? JSON.parse(emp.face_descriptor) : emp.face_descriptor
//     );
//     const distance = getDistance(liveDescriptor, stored);
//     if (distance < bestDistance) {
//       bestDistance = distance;
//       closestEmployee = emp;
//     }
//   }

//   const isMatch = closestEmployee !== null && bestDistance <= threshold;

//   if (!isMatch) {
//     // Explicitly return null on failure — this restores the old, unambiguous contract
//     return null;
//   }

//   const confidence = Math.round((1 - bestDistance) * 100);
//   return { employee: closestEmployee, distance: bestDistance, confidence };
// };

// // Separate debug-only helper — use ONLY for the debug badge, never for match decisions
// export const findClosestForDebug = (liveDescriptor, employees) => {
//   let closestEmployee = null;
//   let bestDistance = Infinity;

//   for (const emp of employees) {
//     if (!emp.face_descriptor) continue;
//     const stored = toFloat32(
//       typeof emp.face_descriptor === 'string' ? JSON.parse(emp.face_descriptor) : emp.face_descriptor
//     );
//     const distance = getDistance(liveDescriptor, stored);
//     if (distance < bestDistance) {
//       bestDistance = distance;
//       closestEmployee = emp;
//     }
//   }

//   return { closestEmployee, distance: bestDistance };
// };
// // export const findBestMatch = (liveDescriptor, employees, threshold = 0.75) => {
// //   let bestMatch = null;
// //   let bestDistance = Infinity;

// //   for (const emp of employees) {
// //     if (!emp.face_descriptor) continue;
// //     const stored = toFloat32(
// //       typeof emp.face_descriptor === 'string' ? JSON.parse(emp.face_descriptor) : emp.face_descriptor
// //     );
// //     const distance = getDistance(liveDescriptor, stored);
// //     if (distance < bestDistance) {
// //       bestDistance = distance;
// //       bestMatch = emp;
// //     }
// //   }

// //   console.log(`Closest match: ${bestMatch?.name}, distance: ${bestDistance.toFixed(3)} (threshold: ${threshold})`);

// //   if (bestDistance > threshold) return null;
// //   const confidence = Math.round((1 - bestDistance) * 100);
// //   return { employee: bestMatch, distance: bestDistance, confidence };
// // };




import * as faceapi from '@vladmandic/face-api';;

// Euclidean distance between two descriptors
export const getDistance = (d1, d2) => {
  return faceapi.euclideanDistance(d1, d2);
};

// Convert stored JSON array → Float32Array
export const toFloat32 = (arr) => new Float32Array(arr);

// Find the best match from employees list
// Returns { employee, distance, confidence } or null
//
// threshold: absolute cutoff — best match must be closer than this
// minMargin: the best match must be at least this much closer than the
//            SECOND-best match. This is what actually prevents two
//            different people from being confused with each other —
//            the threshold alone cannot do this.
export const findBestMatch = (liveDescriptor, employees, threshold = 0.75, minMargin = 0.06) => {
  let bestDistance = Infinity;
  let secondBestDistance = Infinity;
  let closestEmployee = null;

  for (const emp of employees) {
    if (!emp.face_descriptor) continue;
    const stored = toFloat32(
      typeof emp.face_descriptor === 'string' ? JSON.parse(emp.face_descriptor) : emp.face_descriptor
    );
    const distance = getDistance(liveDescriptor, stored);

    if (distance < bestDistance) {
      secondBestDistance = bestDistance;
      bestDistance = distance;
      closestEmployee = emp;
    } else if (distance < secondBestDistance) {
      secondBestDistance = distance;
    }
  }

  const withinThreshold = closestEmployee !== null && bestDistance <= threshold;
  const marginOk = secondBestDistance === Infinity || (secondBestDistance - bestDistance) >= minMargin;
  const isMatch = withinThreshold && marginOk;

  console.log(
    `Best: ${closestEmployee?.name} @ ${bestDistance.toFixed(3)} | ` +
    `2nd best @ ${secondBestDistance === Infinity ? 'N/A' : secondBestDistance.toFixed(3)} | ` +
    `threshold: ${threshold} | margin: ${minMargin} | match: ${isMatch}`
  );

  if (!isMatch) {
    return null;
  }

  const confidence = Math.round((1 - bestDistance) * 100);
  return { employee: closestEmployee, distance: bestDistance, confidence };
};

// Separate debug-only helper — use ONLY for the debug badge, never for match decisions
export const findClosestForDebug = (liveDescriptor, employees) => {
  let closestEmployee = null;
  let bestDistance = Infinity;
  let secondBestDistance = Infinity;

  for (const emp of employees) {
    if (!emp.face_descriptor) continue;
    const stored = toFloat32(
      typeof emp.face_descriptor === 'string' ? JSON.parse(emp.face_descriptor) : emp.face_descriptor
    );
    const distance = getDistance(liveDescriptor, stored);
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