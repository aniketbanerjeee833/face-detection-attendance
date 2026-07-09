import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import * as faceapi from '@vladmandic/face-api';;
import toast from 'react-hot-toast'; // adjust if you use a different toast lib
import { useFaceModels } from '../hooks/useFaceModels';
import Spinner from '../components/ui/Spinner';
import Button from '@/components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useUpdateEmployeeMutation,
  useDeleteEmployeeMutation,
} from '../redux/api/employeeApi';
import { useGetPoliceStationsQuery } from '@/redux/api/policeStationApi';

export default function Employees() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = create mode, id = edit mode
  const formRef = useRef(null);
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    address: '',
    aadhar_number: '',
    police_station_id: '', // ← new field

  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [detecting, setDetecting] = useState(false);


  // ── Photo capture mode: upload a file OR take a live photo ─────────────
  const [photoMode, setPhotoMode] = useState('upload'); // 'upload' | 'camera'
  const [cameraOn, setCameraOn] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);

  // ── Search + pagination via URL params ──────────────────────────────
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page") || 1);
  const perPage = Number(searchParams.get("limit") || 10);
  const search = searchParams.get("search") || "";


  const [idProofFile, setIdProofFile] = useState(null);
  const [idProofPreview, setIdProofPreview] = useState(null);
  const [idCameraOn, setIdCameraOn] = useState(false);
  const [idFacingMode, setIdFacingMode] = useState('environment');
  const idVideoRef = useRef(null);
  const idStreamRef = useRef(null);

  const handleIdProofChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setIdProofFile(file);
    setIdProofPreview(URL.createObjectURL(file));
  };
// Waits until the video actually has a real frame ready to draw
const waitForVideoReady = (video, timeoutMs = 3000) => {
  return new Promise((resolve, reject) => {
    if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0) {
      return resolve();
    }
    const start = Date.now();
    const check = () => {
      if (video.videoWidth > 0 && video.videoHeight > 0 && video.readyState >= video.HAVE_CURRENT_DATA) {
        resolve();
      } else if (Date.now() - start > timeoutMs) {
        reject(new Error('Camera did not produce a frame in time'));
      } else {
        requestAnimationFrame(check);
      }
    };
    check();
  });
};
  const startIdCamera = async (mode = idFacingMode) => {
    try {
      if (idStreamRef.current) {
        idStreamRef.current.getTracks().forEach((track) => track.stop());
        idStreamRef.current = null;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      idStreamRef.current = stream;
      setIdFacingMode(mode);
      setIdCameraOn(true);

      if (idVideoRef.current) {
        idVideoRef.current.srcObject = stream;
        try {
          await idVideoRef.current.play();
        } catch (playErr) {
          console.warn('id video.play() warning:', playErr);
        }
      }
    } catch (err) {
      toast.error('Could not access camera: ' + err.message);
    }
  };

  const switchIdCamera = async () => {
    const nextMode = idFacingMode === 'environment' ? 'user' : 'environment';
    await startIdCamera(nextMode);
  };

  const stopIdCamera = () => {
    if (idStreamRef.current) {
      idStreamRef.current.getTracks().forEach((track) => track.stop());
      idStreamRef.current = null;
    }
    setIdCameraOn(false);
  };

  const captureIdPhoto = async() => {
    if (!idVideoRef.current) return;

    const video = idVideoRef.current;
    try {
    await waitForVideoReady(video);
  } catch {
    toast.error('Camera not ready yet — please wait a second and try again');
    return;
  }
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) {
        toast.error('Failed to capture ID proof photo, please try again');
        return;
      }
      const file = new File([blob], `idproof_capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
      setIdProofFile(file);
      setIdProofPreview(URL.createObjectURL(blob));
      stopIdCamera();
    }, 'image/jpeg', 0.9);
  };
  useEffect(() => {
    return () => {
      stopCamera();
      stopIdCamera(); // ← add this
    };
  }, []);
  const updateParams = (values) => {
    const params = new URLSearchParams(searchParams);
    Object.entries(values).forEach(([key, value]) => {
      if (value === "" || value == null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    setSearchParams(params);
  };

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    if (!params.has("page")) params.set("page", "1");
    if (!params.has("limit")) params.set("limit", "10");
    setSearchParams(params, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [searchInput, setSearchInput] = useState(search);
  useEffect(() => {
    const t = setTimeout(() => {
      updateParams({ search: searchInput.trim(), page: 1 });
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const { modelsLoaded } = useFaceModels();

  const { data, isLoading, isFetching } = useGetEmployeesQuery({ page, limit: perPage, search });
  const [createEmployee, { isLoading: creating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: updating }] = useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();
  const [capturedDescriptors, setCapturedDescriptors] = useState(null);
  const employees = data?.employees ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: perPage, total: 0, totalPages: 1 };
  const totalPages = pagination.totalPages || 1;
  const { data: stationsData } = useGetPoliceStationsQuery();
  const policeStations = stationsData?.stations ?? [];
  // Waits until the video actually has a real frame ready to draw

  // ── Camera helpers ───────────────────────────────────────────────────
  // const startCamera = async () => {
  //   try {
  //     setPhotoMode('camera'); // ensure the <video> element is mounted first
  //     const stream = await navigator.mediaDevices.getUserMedia({
  //       video: { facingMode: 'user', width: { ideal: 720 }, height: { ideal: 720 } },
  //     });
  //     streamRef.current = stream;
  //     setCameraOn(true);
  //     // videoRef.current is guaranteed to exist since the <video> tag is
  //     // always rendered (not conditionally), so this always attaches correctly.
  //     if (videoRef.current) {
  //       videoRef.current.srcObject = stream;
  //       try {
  //         await videoRef.current.play(); // some mobile browsers need an explicit play()
  //       } catch (playErr) {
  //         console.warn('video.play() warning:', playErr);
  //       }
  //     }
  //   } catch (err) {
  //     toast.error('Could not access camera: ' + err.message);
  //   }
  // };

  // const stopCamera = () => {
  //   if (streamRef.current) {
  //     streamRef.current.getTracks().forEach((track) => track.stop());
  //     streamRef.current = null;
  //   }
  //   setCameraOn(false);
  // };
  // ── Camera helpers ───────────────────────────────────────────────────
  const [facingMode, setFacingMode] = useState('environment'); // 'environment' = back, 'user' = front

  const startCamera = async (mode = facingMode) => {
    try {
      setPhotoMode('camera'); // ensure the <video> element is mounted first

      // stop any existing stream before requesting a new one
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      let stream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
      } catch {
        // fallback if the specific facingMode isn't supported on this device
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
      }

      streamRef.current = stream;
      setFacingMode(mode);
      setCameraOn(true);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch (playErr) {
          console.warn('video.play() warning:', playErr);
        }
      }
    } catch (err) {
      toast.error('Could not access camera: ' + err.message);
    }
  };

  const switchCamera = async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    await startCamera(nextMode);
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOn(false);
  };

  // const capturePhoto = () => {
  //   if (!videoRef.current || !canvasRef.current) return;

  //   const video = videoRef.current;
  //   const canvas = canvasRef.current;
  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;
  //   const ctx = canvas.getContext('2d');
  //   ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  //   canvas.toBlob((blob) => {
  //     if (!blob) {
  //       toast.error('Failed to capture photo, please try again');
  //       return;
  //     }
  //     const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });
  //     setPhotoFile(file);
  //     setPhotoPreview(URL.createObjectURL(blob));
  //     stopCamera();
  //   }, 'image/jpeg', 0.92);
  // };
  const [captureProgress, setCaptureProgress] = useState(null); // { step, total, prompt } | null
  const captureCanvasRef = useRef(document.createElement('canvas'));

  const CAPTURE_PROMPTS = [
    'Look straight at the camera',
    'Slowly turn your head slightly left',
    'Slowly turn your head slightly right',
    'Tilt your chin up slightly',
    'Look straight again, hold still',
  ];

  // const captureFrameDescriptor = async () => {
  //   if (!videoRef.current) return null;
  //   const video = videoRef.current;
  //    try {
  //   await waitForVideoReady(video);
  // } catch {
  //   return null; // treat as a failed angle, loop already handles <3 successes
  // }
  //   const canvas = captureCanvasRef.current;
  //   canvas.width = video.videoWidth;
  //   canvas.height = video.videoHeight;
  //   canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

  //   try {
  //     const detection = await faceapi
  //       .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.5 }))
  //       .withFaceLandmarks()
  //       .withFaceDescriptor();
  //     return detection ? { descriptor: Array.from(detection.descriptor), canvas: canvas.toDataURL('image/jpeg', 0.9) } : null;
  //   } catch {
  //     return null;
  //   }
  // };

  // const captureMultiAngle = async () => {
  //   if (!modelsLoaded) {
  //     toast.error('Face recognition models still loading, please wait a moment');
  //     return;
  //   }
  //   if (!videoRef.current) return;

  //   const collected = [];
  //   let representativePhoto = null;

  //   for (let i = 0; i < CAPTURE_PROMPTS.length; i++) {
  //     setCaptureProgress({
  //       step: i + 1, total: CAPTURE_PROMPTS.length,
  //       // prompt: CAPTURE_PROMPTS[i] 

  //     });
  //     await new Promise((res) => setTimeout(res, 200)); // give the person a moment to adjust pose

  //     const result = await captureFrameDescriptor();
  //     if (result) {
  //       collected.push(result.descriptor);
  //       if (i === 0) representativePhoto = result.canvas; // use the "look straight" frame as the stored photo
  //     }
  //   }

  //   setCaptureProgress(null);

  //   if (collected.length < 3) {
  //     toast.error(`Only captured ${collected.length}/5 valid angles. Please ensure good lighting and try again.`);
  //     return;
  //   }

  //   // Convert representative frame to a File for upload
  //   const blob = await (await fetch(representativePhoto)).blob();
  //   const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });

  //   setPhotoFile(file);
  //   setPhotoPreview(representativePhoto);
  //   setCapturedDescriptors(collected); // new state — holds the array of 128-number arrays
  //   stopCamera();
  //   toast.success(`Captured ${collected.length} angles successfully`);
  // };
  const captureFrameDescriptor = async () => {
  if (!videoRef.current) return null;
  const video = videoRef.current;
  try {
    await waitForVideoReady(video);
  } catch {
    return null;
  }
  const canvas = captureCanvasRef.current;
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

  try {
    const detection = await faceapi
      .detectSingleFace(canvas, new faceapi.TinyFaceDetectorOptions({ inputSize: 320, scoreThreshold: 0.4 }))
      .withFaceLandmarks()
      .withFaceDescriptor();
    return detection
      ? { descriptor: Array.from(detection.descriptor), canvas: canvas.toDataURL('image/jpeg', 0.9) }
      : null;
  } catch {
    return null;
  }
};

// Retries a single step a few times before giving up on that angle —
// this is what makes "no face detected" stop being a random failure.
const captureFrameWithRetry = async (maxAttempts = 3, retryDelayMs = 120) => {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const result = await captureFrameDescriptor();
    if (result) return result;
    if (attempt < maxAttempts - 1) {
      await new Promise((res) => setTimeout(res, retryDelayMs));
    }
  }
  return null;
};

const captureMultiAngle = async () => {
  if (!modelsLoaded) {
    toast.error('Face recognition models still loading, please wait a moment');
    return;
  }
  if (!videoRef.current) return;

  // Wait for a real frame ONCE up front, not inside every step.
  try {
    await waitForVideoReady(videoRef.current);
  } catch {
    toast.error('Camera not ready — please wait a moment and try again');
    return;
  }

  const collected = [];
  let representativePhoto = null;

  for (let i = 0; i < CAPTURE_PROMPTS.length; i++) {
    setCaptureProgress({ step: i + 1, total: CAPTURE_PROMPTS.length });

    // Only the first step needs a real settle delay (camera/model just warmed up).
    // Later steps don't need the person to actually move, so keep it short.
    await new Promise((res) => setTimeout(res, i === 0 ? 300 : 150));

    const result = await captureFrameWithRetry(3, 120);
    if (result) {
      collected.push(result.descriptor);
      if (!representativePhoto) representativePhoto = result.canvas; // first successful frame, whichever step it is
    }
  }

  setCaptureProgress(null);

  if (collected.length < 2) {
    toast.error('Could not detect your face clearly. Please check your lighting and try again.');
    return;
  }

  const blob = await (await fetch(representativePhoto)).blob();
  const file = new File([blob], `capture_${Date.now()}.jpg`, { type: 'image/jpeg' });

  setPhotoFile(file);
  setPhotoPreview(representativePhoto);
  setCapturedDescriptors(collected);
  stopCamera();
  toast.success(`Captured ${collected.length} angles successfully`);
};
  
  const switchToUpload = () => {
    stopCamera();
    setPhotoMode('upload');
  };

  const switchToCamera = () => {
    setPhotoMode('camera');
  };

  // Stop camera if component unmounts while it's still on
  useEffect(() => {
    return () => stopCamera();
  }, []);

  // const resetForm = () => {
  //   setForm({ name: '', phone_number: '', address: '', aadhar_number: '', place_of_posting: '' });
  //   setPhotoFile(null);
  //   setPhotoPreview(null);
  //   setEditingId(null);
  //   setPhotoMode('upload');
  //   setFacingMode('environment'); // reset to back camera default for next use
  //   stopCamera();
  // };
  // const resetForm = () => {
  //   setForm({ name: '', phone_number: '', address: '', aadhar_number: '', place_of_posting: '' });
  //   setPhotoFile(null);
  //   setPhotoPreview(null);
  //   setEditingId(null);
  //   setPhotoMode('upload');
  //   stopCamera();
  // };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!modelsLoaded) {
      toast.error('Face recognition models still loading, please wait a moment');
      e.target.value = ''; // reset the file input so they can retry once models are ready
      return;
    }

    const preview = URL.createObjectURL(file);
    setPhotoFile(file);
    setPhotoPreview(preview);
    setCapturedDescriptors(null); // clear any previous capture while we process this one

    setDetecting(true);
    try {
      const img = await faceapi.fetchImage(preview);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        toast.error('No face detected in the uploaded photo. Please choose a clearer, front-facing photo.');
        setPhotoFile(null);
        setPhotoPreview(null);
        return;
      }

      // Wrap in an array — backend/matching expects an array of descriptors,
      // even if upload only gives us one angle.
      setCapturedDescriptors([Array.from(detection.descriptor)]);
      toast.success('Face detected in uploaded photo');
    } catch (err) {
      toast.error('Error processing photo: ' + err.message);
      setPhotoFile(null);
      setPhotoPreview(null);
    } finally {
      setDetecting(false);
    }
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  // const openEditForm = (emp) => {
  //   setEditingId(emp.id);
  //   setForm({
  //     name: emp.name || '',
  //     phone_number: emp.phone_number || '',
  //     address: emp.address || '',
  //     aadhar_number: emp.aadhar_number || '',
  //     police_station_id: '', // ← new field

  //   });
  //   setPhotoFile(null);
  //   setPhotoPreview(emp.photo_url ? `http://localhost:5000${emp.photo_url}` : null);
  //   setPhotoMode('upload');
  //   setShowForm(true);
  // };
  const openEditForm = (emp) => {
    setEditingId(emp.id);

    setForm({
      name: emp.name || "",
      phone_number: emp.phone_number || "",
      address: emp.address || "",
      aadhar_number: emp.aadhar_number || "",
      police_station_id: emp.police_station_id || "", // ← new field
    });

    setPhotoFile(null);
    setPhotoPreview(
      emp.photo_url ? `http://localhost:5000${emp.photo_url}` : null
    );
    setIdProofFile(null);
  setIdProofPreview(
    emp.id_proof_url ? `http://localhost:5000${emp.id_proof_url}` : null
  );
    setPhotoMode("upload");
    setShowForm(true);

    setTimeout(() => {
      formRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };



  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!/^\d{10}$/.test(form.phone_number)) {
  //     return toast.error('Phone number must be exactly 10 digits');
  //   }
  //   if (!/^\d{12}$/.test(form.aadhar_number)) {
  //     return toast.error('Aadhar number must be exactly 12 digits');
  //   }

  //   const isEdit = !!editingId;

  //   // photo is required on create, optional on edit (only if they want to replace it)
  //   if (!isEdit && !photoFile) {
  //     return toast.error('Please select or capture a photo');
  //   }

  //   let descriptorJson = null;

  //   // only run face detection if a NEW photo was selected/captured
  //   if (photoFile) {
  //     if (!modelsLoaded) {
  //       return toast.error('Face recognition models still loading, please wait a moment');
  //     }
  //     setDetecting(true);
  //     try {
  //       const img = await faceapi.fetchImage(photoPreview);
  //       const detection = await faceapi
  //         .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
  //         .withFaceLandmarks()
  //         .withFaceDescriptor();

  //       if (!detection) {
  //         toast.error('No face detected in the photo. Please upload or capture a clearer, front-facing photo.');
  //         return;
  //       }
  //       descriptorJson = JSON.stringify(Array.from(detection.descriptor));
  //     } catch (err) {
  //       toast.error('Error processing photo: ' + err.message);
  //       return;
  //     } finally {
  //       setDetecting(false);
  //     }
  //   }

  //   const fd = new FormData();
  //   fd.append('name', form.name);
  //   fd.append('phone_number', form.phone_number);
  //   fd.append('address', form.address);
  //   fd.append('aadhar_number', form.aadhar_number);
  //   fd.append('place_of_posting', form.place_of_posting);
  //   if (photoFile) fd.append('photo', photoFile);
  //   if (descriptorJson) fd.append('descriptor', descriptorJson);

  //   try {
  //     if (isEdit) {
  //       await updateEmployee({ id: editingId, formData: fd }).unwrap();
  //       toast.success('Employee updated successfully');
  //     } else {
  //       await createEmployee(fd).unwrap();
  //       toast.success('Employee created and face registered successfully');
  //       updateParams({ page: 1 }); // go to first page to see the new employee
  //     }
  //     setShowForm(false);
  //     resetForm();
  //   } catch (err) {
  //     toast.error(err?.data?.message || err.message || `Failed to ${isEdit ? 'update' : 'create'} employee`);
  //   }
  // };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(form.phone_number)) return toast.error('Phone number must be exactly 10 digits');
    if (!/^\d{12}$/.test(form.aadhar_number)) return toast.error('Aadhar number must be exactly 12 digits');

    const isEdit = !!editingId;

    if (!isEdit && !form.police_station_id) {
      return toast.error('Please select a police station');
    }
    if (!isEdit && !photoFile) return toast.error('Please capture a photo');
    if (!isEdit && !capturedDescriptors) return toast.error('Please complete the multi-angle face capture');

    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('phone_number', form.phone_number);
    fd.append('address', form.address);
    fd.append('aadhar_number', form.aadhar_number);
    // if (!isEdit) {
    //   fd.append('police_station_id', form.police_station_id); // only sent on create
    // }
   
      fd.append('police_station_id', form.police_station_id); // only sent on create
    
    if (photoFile) fd.append('photo', photoFile);
    if (idProofFile) fd.append('id_proof', idProofFile);
    if (capturedDescriptors) fd.append('descriptors', JSON.stringify(capturedDescriptors));

    try {
      if (isEdit) {
        await updateEmployee({ id: editingId, formData: fd }).unwrap();
        toast.success('Employee updated successfully');
      } else {
        await createEmployee(fd).unwrap();
        toast.success('Employee created and face registered successfully');
        updateParams({ page: 1 });
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      toast.error(err?.data?.message || err.message || `Failed to ${isEdit ? 'update' : 'create'} employee`);
    }
  };
  // const handleSubmit = async (e) => {
  //   e.preventDefault();

  //   if (!/^\d{10}$/.test(form.phone_number)) return toast.error('Phone number must be exactly 10 digits');
  //   if (!/^\d{12}$/.test(form.aadhar_number)) return toast.error('Aadhar number must be exactly 12 digits');

  //   const isEdit = !!editingId;
  //   if (!isEdit && !photoFile) return toast.error('Please capture a photo');
  //   if (!isEdit && !capturedDescriptors) return toast.error('Please complete the multi-angle face capture');

  //   const fd = new FormData();
  //   fd.append('name', form.name);
  //   fd.append('phone_number', form.phone_number);
  //   fd.append('address', form.address);
  //   fd.append('aadhar_number', form.aadhar_number);
  //   // fd.append('place_of_posting', form.place_of_posting);
  //   if (photoFile) fd.append('photo', photoFile);
  //   if (capturedDescriptors) fd.append('descriptors', JSON.stringify(capturedDescriptors));

  //   try {
  //     if (isEdit) {
  //       await updateEmployee({ id: editingId, formData: fd }).unwrap();
  //       toast.success('Employee updated successfully');
  //     } else {
  //       await createEmployee(fd).unwrap();
  //       toast.success('Employee created and face registered successfully');
  //       updateParams({ page: 1 });
  //     }
  //     setShowForm(false);
  //     resetForm();
  //   } catch (err) {
  //     toast.error(err?.data?.message || err.message || `Failed to ${isEdit ? 'update' : 'create'} employee`);
  //   }
  // };
  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return;
    try {
      await deleteEmployee(id).unwrap();
      if (employees.length === 1 && page > 1) {
        updateParams({ page: page - 1 });
      }
    } catch (err) {
      alert(err?.data?.message || 'Error deleting employee');
    }
  };


  // const resetForm = () => {
  //   setForm({ name: '', phone_number: '', address: '', aadhar_number: '', police_station_id: '' });
  //   setPhotoFile(null);
  //   setPhotoPreview(null);
  //   setIdProofFile(null);
  //   setIdProofPreview(null);
  //   setCapturedDescriptors(null);
  //   setEditingId(null);
  //   setPhotoMode('upload');
  //   setFacingMode('environment');
  //   stopCamera();
  // };
  const resetForm = () => {
    setForm({ name: '', phone_number: '', address: '', aadhar_number: '', police_station_id: '' });
    setPhotoFile(null);
    setPhotoPreview(null);
    setIdProofFile(null);
    setIdProofPreview(null);
    setCapturedDescriptors(null);
    setEditingId(null);
    setPhotoMode('upload');
    setFacingMode('environment');
    setIdFacingMode('environment'); // ← add
    stopCamera();
    stopIdCamera(); // ← add
  };
  const handleCancel = () => {
    stopCamera();
    stopIdCamera(); // ← add
    setShowForm(false);
    resetForm();
  };
  if (isLoading) return <Spinner size="lg" text="Loading employees..." />;

  return (
    <div className="space-y-6">
      {/* <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Employees</h2>
        {/* <div className="flex items-center gap-2 ">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search ..."
            className="w-64 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
          <Button
            className="w-full sm:w-auto text-sm px-3 py-2 mr-2"
            onClick={showForm ? handleCancel : openCreateForm}
          >
            {showForm ? "Cancel" : "+ Add Employee"}
          </Button>
          {/* <Button onClick={showForm ? handleCancel : openCreateForm}>
            {showForm ? 'Cancel' : '+ Add Employee'}
          </Button> 
        </div> 
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search employees..."
            className="w-full sm:w-64 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />

          <Button
            className="w-full sm:w-auto px-4 py-2 text-sm"
            onClick={showForm ? handleCancel : openCreateForm}
          >
            {showForm ? "Cancel" : "+ Add Employee"}
          </Button>
        </div>
      </div> */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-lg font-bold text-slate-900">
          Employees
        </h2>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search "
            className="w-full sm:w-64 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />

          <Button
            className="w-full sm:w-auto px-4 py-2 text-sm"
            onClick={showForm ? handleCancel : openCreateForm}
          >
            {showForm ? "Cancel" : "+ Add Employee"}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            ref={formRef}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-100"
          >
            <div className="p-6">
              <h3 className="mb-4 text-base font-semibold text-slate-900">
                {editingId ? 'Edit Employee' : 'New Employee'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Full Name *</label>
                    <input
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Phone Number *</label>
                    <input
                      value={form.phone_number}
                      onChange={(e) => setForm({ ...form, phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                      required
                      maxLength={10}
                      inputMode="numeric"
                      placeholder="10-digit mobile number"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Aadhar Number *</label>
                    <input
                      value={form.aadhar_number}
                      onChange={(e) => setForm({ ...form, aadhar_number: e.target.value.replace(/\D/g, '').slice(0, 12) })}
                      required
                      maxLength={12}
                      inputMode="numeric"
                      placeholder="12-digit Aadhar number"
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-500">Police Station *</label>
                      <Select
                        value={form.police_station_id ? String(form.police_station_id) : ''}
                        onValueChange={(v) => setForm({ ...form, police_station_id: v })}
                      >
                        <SelectTrigger className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm h-auto">
                          <SelectValue placeholder="Select police station" />
                        </SelectTrigger>
                        <SelectContent>
                          {policeStations.map((station) => (
                            <SelectItem key={station.id} value={String(station.id)}>
                              {station.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  
                  {/* <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Place of Posting *</label>
                    <input
                      value={form.place_of_posting}
                      onChange={(e) => setForm({ ...form, place_of_posting: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    />
                  </div> */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Address *</label>
                    <textarea
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      required
                      rows={2}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  {/* ── Face Photo: upload OR live camera capture ────────────── */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                      Face Photo *
                    </label>

                    {/* Buttons: only show relevant action for current state */}
                    {!cameraOn && (
                      <div className="mb-3 flex gap-2">
                        <label className="cursor-pointer rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200">
                          📁 Choose File
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={(e) => { setPhotoMode('upload'); handlePhotoChange(e); }}
                            className="hidden"
                          />
                        </label>
                        <Button type="button" variant="outline" onClick={() => startCamera()}>
                          📷 Take Photo
                        </Button>
                        {/* <Button type="button" variant="outline" onClick={startCamera}>
                        📷 Take Photo
                      </Button> */}
                      </div>
                    )}

                    {/* Video preview is ALWAYS mounted so the ref exists before
                      getUserMedia resolves — fixes the black-screen bug where
                      the stream had nowhere to attach to on first click. */}
                    <div
                      className={`relative overflow-hidden rounded-xl bg-black ${cameraOn ? 'block' : 'hidden'}`}
                      style={{ maxWidth: 320 }}
                    >
                      {/* <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full scale-x-[-1]"
                    /> */}
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                      />
                    </div>

                    {/* {cameraOn && (
                    <div className="mt-2 flex gap-2">
                      <Button type="button" onClick={capturePhoto}>
                        📸 Capture Photo
                      </Button>
                      <Button type="button" variant="outline" onClick={stopCamera}>
                        Cancel
                      </Button>
                    </div>
                  )} */}
                    {/* {cameraOn && (
                    <div className="mt-3 grid grid-cols-3 gap-2">
                      {/* // <div className="mt-2 flex gap-2"> 
                      <Button
                        type="button"
                        className="text-xs px-2 py-2"
                        onClick={capturePhoto}
                      >
                        📸 Capture
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="text-xs px-2 py-2"
                        onClick={switchCamera}
                      >
                        🔄 {facingMode === "environment" ? "Front" : "Back"}
                      </Button>

                      <Button
                        type="button"
                        variant="outline"
                        className="text-xs px-2 py-2"
                        onClick={stopCamera}
                      >
                        ✕ Cancel
                      </Button>
                      {/* <Button type="button" onClick={capturePhoto}>
                        📸 Capture Photo
                      </Button>
                      <Button type="button" variant="outline" onClick={switchCamera}>
                        🔄 {facingMode === 'environment' ? 'Front' : 'Back'} Camera
                      </Button>
                      <Button type="button" variant="outline" onClick={stopCamera}>
                        Cancel
                      </Button> 
                    </div>
                  )} */}
                    {cameraOn && !captureProgress && (
                      <div className="mt-2 flex gap-2">
                        <Button type="button" onClick={captureMultiAngle}>
                          📸 Capture Photo
                        </Button>
                        <Button type="button" variant="outline" onClick={switchCamera}>
                          🔄 {facingMode === 'environment' ? 'Front' : 'Back'} Camera
                        </Button>
                        <Button type="button" variant="outline" onClick={stopCamera}>
                          Cancel
                        </Button>
                      </div>
                    )}

                    {captureProgress && (
                      <div className="mt-2 rounded-xl bg-indigo-50 px-4 py-3 text-center">
                        <p className="text-sm font-semibold text-indigo-700">{captureProgress.prompt}</p>
                        <p className="mt-1 text-xs text-indigo-500">Step {captureProgress.step} of {captureProgress.total}</p>
                        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-indigo-100">
                          <div
                            className="h-full bg-indigo-600 transition-all"
                            style={{ width: `${(captureProgress.step / captureProgress.total) * 100}%` }}
                          />
                        </div>
                      </div>
                    )}

                    <canvas ref={canvasRef} className="hidden" />

                    {photoPreview && !cameraOn && (
                      <div className="mt-3 flex items-center gap-3">
                        <img
                          src={photoPreview}
                          alt="Preview"
                          className="h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => { setPhotoFile(null); setPhotoPreview(null); }}
                          className="text-xs font-medium text-red-500 hover:underline"
                        >
                          Remove photo
                        </button>
                      </div>
                    )}
                  </div>
                  {/* ── Optional ID Proof photo — no face detection needed, just stored ── */}
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                      ID Proof Photo (optional)
                    </label>

                    {!idCameraOn && (
                      <div className="mb-3 flex gap-2">
                        <label className="cursor-pointer rounded-lg bg-slate-100 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200">
                          📁 Choose File
                          <input
                            type="file"
                            accept="image/jpeg,image/png"
                            onChange={handleIdProofChange}
                            className="hidden"
                          />
                        </label>
                        <Button type="button" variant="outline" onClick={() => startIdCamera()}>
                          📷 Take Photo
                        </Button>
                      </div>
                    )}

                    {/* Video preview always mounted while camera is on, same pattern as face photo */}
                    <div
                      className={`relative overflow-hidden rounded-xl bg-black ${idCameraOn ? 'block' : 'hidden'}`}
                      style={{ maxWidth: 320 }}
                    >
                      <video
                        ref={idVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full ${idFacingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                      />
                    </div>

                    {idCameraOn && (
                      <div className="mt-2 flex gap-2">
                        <Button type="button" onClick={captureIdPhoto}>
                          📸 Capture Photo
                        </Button>
                        <Button type="button" variant="outline" onClick={switchIdCamera}>
                          🔄 {idFacingMode === 'environment' ? 'Front' : 'Back'} Camera
                        </Button>
                        <Button type="button" variant="outline" onClick={stopIdCamera}>
                          Cancel
                        </Button>
                      </div>
                    )}

                    {idProofPreview && !idCameraOn && (
                      <div className="mt-3 flex items-center gap-3">
                        <img
                          src={idProofPreview}
                          alt="ID Proof Preview"
                          className="h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200"
                        />
                        <button
                          type="button"
                          onClick={() => { setIdProofFile(null); setIdProofPreview(null); }}
                          className="text-xs font-medium text-red-500 hover:underline"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                </div>

                <Button type="submit" disabled={creating || updating || detecting}>
                  {detecting ? 'Detecting face...' : (creating || updating) ? 'Saving...' : editingId ? 'Update Employee' : 'Save Employee'}
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
                <th className="px-6 py-3 font-medium">Sl No</th>
                <th className="px-6 py-3 font-medium">Photo</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Phone</th>
                <th className="px-6 py-3 font-medium">Admin</th>

                {/* <th className="px-6 py-3 font-medium">Place of Posting</th> */}
                {/* <th className="px-6 py-3 font-medium">Face</th> */}
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map((emp, idx) => (
                <tr key={emp.id} className="hover:bg-blue-50/40">
                  <td className="px-6 py-3 text-slate-400">{(page - 1) * perPage + idx + 1}</td>
                  <td className="px-6 py-3">
                    {emp.photo_url ? (
                      <img
                        src={`http://localhost:5000${emp.photo_url}`}
                        alt={emp.name}
                        className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-400">
                        {emp.name?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-3 font-medium text-slate-900">{emp.name}</td>
                  <td className="px-6 py-3 text-slate-500">{emp.phone_number}</td>

                  <td className="px-6 py-3 text-slate-500">{emp?.created_by_admin_name}</td>
                  {/* <td className="px-6 py-3 text-slate-500">{emp.place_of_posting}</td> */}
                  {/* <td className="px-6 py-3">
                    {emp.face_descriptor
                      ? <span className="text-xs font-semibold text-green-600">✓ Registered</span>
                      : <span className="text-xs font-semibold text-red-500">✗ Not Registered</span>}
                  </td> */}
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" variant="primary" onClick={() => openEditForm(emp)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(emp.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
                    {search ? `No employees found matching "${search}".` : 'No employees found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {employees.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Rows per page</span>
              <Select value={String(perPage)}
                onValueChange={(v) => {
                  updateParams({ limit: Number(v), page: 1 });
                }}>
                <SelectTrigger className="h-8 w-16 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {[10, 20, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <span className="text-sm text-gray-500">
              {isFetching ? 'Loading...' : `Page ${page} of ${totalPages} · ${pagination.total ?? 0} total`}
            </span>

            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={() =>
                updateParams({ page: 1 })} disabled={page === 1} className="h-8 px-2">«</Button>
              <Button variant="outline" size="sm" onClick={() =>
                updateParams({ page: Math.max(1, page - 1) })}
                disabled={page === 1} className="h-8 px-3">‹</Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
                .reduce((acc, p, i, arr) => {
                  if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`d${i}`} className="px-1 text-gray-400 text-sm">…</span>
                  ) : (
                    <Button
                      key={p}
                      variant={page === p ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => updateParams({ page: p })}
                      className={`h-8 w-8 p-0 text-sm ${page === p ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
                    >
                      {p}
                    </Button>
                  )
                )}
              <Button variant="outline" size="sm" onClick={() =>
                updateParams({ page: Math.min(totalPages, page + 1) })}
                disabled={page === totalPages} className="h-8 px-3">›</Button>
              <Button variant="outline" size="sm" onClick={() => updateParams({ page: totalPages })} disabled={page === totalPages} className="h-8 px-2">»</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}