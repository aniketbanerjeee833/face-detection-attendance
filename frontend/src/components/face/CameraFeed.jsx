// // import { useEffect } from 'react';

// // export default function CameraFeed({ videoRef, canvasRef, cameraActive, onStart }) {
// //   return (
// //     <div className="camera-wrap">
// //       <video
// //         ref={videoRef}
// //         autoPlay
// //         muted
// //         playsInline
// //         className="camera-video"
// //         onPlay={() => {}} // canvas overlay updates handled by parent
// //       />
// //       <canvas ref={canvasRef} className="camera-canvas" />
// //       {!cameraActive && (
// //         <div className="camera-placeholder">
// //           <span>📷</span>
// //           <button className="btn btn--primary" onClick={onStart}>
// //             Open Camera
// //           </button>
// //         </div>
// //       )}
// //     </div>
// //   );
// // }

// import { motion } from 'framer-motion';

// export default function CameraFeed({ videoRef, canvasRef, cameraActive, onStart }) {
//   return (
//     <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-indigo-900 shadow-soft">
//       <video
//         ref={videoRef}
//         autoPlay
//         muted
//         playsInline
//         className="h-full w-full object-cover"
//       />
//       <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

//       {/* Viewfinder corners — signature element */}
//       {cameraActive && (
//         <div className="pointer-events-none absolute inset-6 lg:inset-10">
//           {[
//             'top-0 left-0 border-t-2 border-l-2 rounded-tl-xl',
//             'top-0 right-0 border-t-2 border-r-2 rounded-tr-xl',
//             'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl',
//             'bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl',
//           ].map((cls, i) => (
//             <span key={i} className={`absolute h-8 w-8 border-indigo-300/80 ${cls}`} />
//           ))}
//           <motion.div
//             className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"
//             animate={{ top: ['0%', '100%', '0%'] }}
//             transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
//           />
//         </div>
//       )}

//       {!cameraActive && (
//         <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-indigo-950/90 text-white">
//           <span className="text-4xl">📷</span>
//           <button
//             onClick={onStart}
//             className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium shadow-soft transition-colors hover:bg-indigo-700"
//           >
//             Open Camera
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }

import { motion } from 'framer-motion';

export default function CameraFeed({ videoRef, canvasRef, cameraActive, facingMode, onStart }) {
  const isMirrored = facingMode === 'user';

  return (
    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl bg-indigo-900 shadow-soft">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={`h-full w-full object-cover ${isMirrored ? 'scale-x-[-1]' : ''}`}
      />
      <canvas
        ref={canvasRef}
        className={`absolute inset-0 h-full w-full ${isMirrored ? 'scale-x-[-1]' : ''}`}
      />
      {/* Viewfinder corners — signature element */}
      {cameraActive && (
        <div className="pointer-events-none absolute inset-6 lg:inset-10">
          {[
            'top-0 left-0 border-t-2 border-l-2 rounded-tl-xl',
            'top-0 right-0 border-t-2 border-r-2 rounded-tr-xl',
            'bottom-0 left-0 border-b-2 border-l-2 rounded-bl-xl',
            'bottom-0 right-0 border-b-2 border-r-2 rounded-br-xl',
          ].map((cls, i) => (
            <span key={i} className={`absolute h-8 w-8 border-indigo-300/80 ${cls}`} />
          ))}
          <motion.div
            className="absolute left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-300 to-transparent"
            animate={{ top: ['0%', '100%', '0%'] }}
            transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
          />
        </div>
      )}
      {!cameraActive && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-indigo-950/90 text-white">
          <span className="text-4xl">📷</span>
          <button
            onClick={onStart}
            className="rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium shadow-soft transition-colors hover:bg-indigo-700"
          >
            Open Camera
          </button>
        </div>
      )}
    </div>
  );
}