
// import { useState, useEffect } from 'react';
// import * as faceapi from 'face-api.js';
// import { motion, AnimatePresence } from 'framer-motion';
// import api from '../api/axiosInstance';
// import { useFaceModels } from '../hooks/useFaceModels';
// import Spinner from '../components/ui/Spinner';
// import Button from '../components/ui/Button';

// export default function Employees() {
//   const [employees, setEmployees] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({ name: '', department: '', email: '' });
//   const [photoFile, setPhotoFile] = useState(null);
//   const [photoPreview, setPhotoPreview] = useState(null);
//   const [submitting, setSubmitting] = useState(false);
//   const [processingId, setProcessingId] = useState(null);
//   const { modelsLoaded } = useFaceModels();

//   const fetchEmployees = async () => {
//     setLoading(true);
//     try {
//       const { data } = await api.get('/employees');
//       setEmployees(data.employees);
//     } catch (err) {
//       console.error('Failed to fetch employees:', err);
//       setEmployees([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => { fetchEmployees(); }, []);

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setPhotoFile(file);
//     setPhotoPreview(URL.createObjectURL(file));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!photoFile) return alert('Please select a photo');
//     setSubmitting(true);
//     try {
//       const fd = new FormData();
//       fd.append('name', form.name);
//       fd.append('department', form.department);
    
//       fd.append('photo', photoFile);
//       await api.post('/employees', fd, {
//         headers: { 'Content-Type': 'multipart/form-data' },
//       });
//       setShowForm(false);
//       setForm({ name: '', department: '', email: '' });
//       setPhotoFile(null);
//       setPhotoPreview(null);
//       fetchEmployees();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error creating employee');
//     } finally {
//       setSubmitting(false);
//     }
//   };

//   const generateDescriptor = async (emp) => {
//     if (!modelsLoaded) return alert('Face models still loading...');
//     setProcessingId(emp.id);
//     try {
//       const img = await faceapi.fetchImage(`http://localhost:5000${emp.photo_url}`);
//       const detection = await faceapi
//         .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceDescriptor();

//       if (!detection) {
//         alert('No face detected in this photo. Please upload a clearer photo.');
//         return;
//       }

//       const descriptor = Array.from(detection.descriptor);
//       await api.patch(`/employees/${emp.id}/descriptor`, { descriptor });
//       fetchEmployees();
//       alert('Face registered successfully!');
//     } catch (err) {
//       alert('Error processing face: ' + err.message);
//     } finally {
//       setProcessingId(null);
//     }
//   };

//   const handleDelete = async (id) => {
//     if (!confirm('Delete this employee?')) return;
//     try {
//       await api.delete(`/employees/${id}`);
//       fetchEmployees();
//     } catch (err) {
//       alert(err.response?.data?.message || 'Error deleting employee');
//     }
//   };

//   if (loading) return <Spinner size="lg" text="Loading employees..." />;

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-lg font-bold text-slate-900">Employees ({employees.length})</h2>
//         <Button onClick={() => setShowForm(!showForm)}>
//           {showForm ? 'Cancel' : '+ Add Employee'}
//         </Button>
//       </div>

//       <AnimatePresence>
//         {showForm && (
//           <motion.div
//             initial={{ opacity: 0, height: 0 }}
//             animate={{ opacity: 1, height: 'auto' }}
//             exit={{ opacity: 0, height: 0 }}
//             className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-100"
//           >
//             <div className="p-6">
//               <h3 className="mb-4 text-base font-semibold text-slate-900">New Employee</h3>
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <div className="grid gap-4 sm:grid-cols-3">
//                   <div>
//                     <label className="mb-1.5 block text-xs font-semibold text-slate-500">Full Name *</label>
//                     <input
//                       value={form.name}
//                       onChange={(e) => setForm({ ...form, name: e.target.value })}
//                       required
//                       className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
//                     />
//                   </div>
//                   <div>
//                     <label className="mb-1.5 block text-xs font-semibold text-slate-500">Department</label>
//                     <input
//                       value={form.department}
//                       onChange={(e) => setForm({ ...form, department: e.target.value })}
//                       className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-indigo-400 focus:outline-none focus:ring-4 focus:ring-indigo-100"
//                     />
//                   </div>
                  
//                 </div>

//                 <div>
//                   <label className="mb-1.5 block text-xs font-semibold text-slate-500">Face Photo *</label>
//                   <input
//                     type="file"
//                     accept="image/jpeg,image/png"
//                     onChange={handlePhotoChange}
//                     required
//                     className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-600 hover:file:bg-indigo-100"
//                   />
//                   {photoPreview && (
//                     <img src={photoPreview} alt="Preview" className="mt-3 h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200" />
//                   )}
//                 </div>

//                 <Button type="submit" disabled={submitting}>
//                   {submitting ? 'Saving...' : 'Save Employee'}
//                 </Button>
//               </form>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       {/* Employees Table */}
//       <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-100">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm">
//             <thead>
//               <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
//                 <th className="px-6 py-3 font-medium">ID</th>
//                 <th className="px-6 py-3 font-medium">Photo</th>
//                 <th className="px-6 py-3 font-medium">Name</th>
//                 <th className="px-6 py-3 font-medium">Department</th>
                
//                 <th className="px-6 py-3 font-medium">Face</th>
//                 <th className="px-6 py-3 font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50">
//               {employees.map((emp) => (
//                 <tr key={emp.id} className="hover:bg-indigo-50/60">
//                   <td className="px-6 py-3 text-slate-400">{emp.id}</td>
//                   <td className="px-6 py-3">
//                     {emp.photo_url ? (
//                       <img
//                         src={`http://localhost:5000${emp.photo_url}`}
//                         alt={emp.name}
//                         className="h-10 w-10 rounded-full object-cover ring-1 ring-slate-200"
//                       />
//                     ) : (
//                       <div className="grid h-10 w-10 place-items-center rounded-full bg-slate-100 text-xs font-semibold text-slate-400">
//                         {emp.name?.[0]?.toUpperCase()}
//                       </div>
//                     )}
//                   </td>
//                   <td className="px-6 py-3 font-medium text-slate-900">{emp.name}</td>
//                   <td className="px-6 py-3 text-slate-500">{emp.department || '—'}</td>
                  
//                   <td className="px-6 py-3">
//                     {emp.face_descriptor ? (
//                       <span className="inline-flex items-center gap-1 text-xs font-semibold text-success-600">
//                         ✓ Registered
//                       </span>
//                     ) : (
//                       <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600">
//                         Not Registered
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-6 py-3">
//                     <div className="flex flex-wrap gap-2">
//                       {!emp.face_descriptor ? (
//                         <Button
//                           size="sm"
//                           onClick={() => generateDescriptor(emp)}
//                           disabled={processingId === emp.id}
//                         >
//                           {processingId === emp.id ? 'Processing...' : 'Register'}
//                         </Button>
//                       ) : (
//                         <Button
//                           size="sm"
//                           variant="outline"
//                           onClick={() => generateDescriptor(emp)}
//                           disabled={processingId === emp.id}
//                         >
//                           {processingId === emp.id ? 'Processing...' : 'Re-register'}
//                         </Button>
//                       )}
//                       <Button size="sm" variant="danger" onClick={() => handleDelete(emp.id)}>
//                         Delete
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }
import { useState } from 'react';
import * as faceapi from 'face-api.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useSaveDescriptorMutation,
  useDeleteEmployeeMutation,
} from '../redux/api/employeeApi';
import { useFaceModels } from '../hooks/useFaceModels';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
export default function Employees() {
  const [showForm,     setShowForm]     = useState(false);
  const [form,         setForm]         = useState({ name: '', department: '' });
  const [photoFile,    setPhotoFile]    = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [processingId, setProcessingId] = useState(null);

  const { modelsLoaded } = useFaceModels();

  // ── RTK Query hooks ───────────────────────────────────────────────────────
  const { data, isLoading }       = useGetEmployeesQuery({ page: 1, limit: 100 });
  const [createEmployee, { isLoading: creating }] = useCreateEmployeeMutation();
  const [saveDescriptor]          = useSaveDescriptorMutation();
  const [deleteEmployee]          = useDeleteEmployeeMutation();

  const employees = data?.employees ?? [];

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!photoFile) return alert('Please select a photo');

    const fd = new FormData();
    fd.append('name',       form.name);
    fd.append('department', form.department);
    fd.append('photo',      photoFile);

    try {
      await createEmployee(fd).unwrap();
      setShowForm(false);
      setForm({ name: '', department: '' });
      setPhotoFile(null);
      setPhotoPreview(null);
    } catch (err) {
      alert(err?.data?.message || 'Error creating employee');
    }
  };

  const generateDescriptor = async (emp) => {
    if (!modelsLoaded) return alert('Face models still loading...');
    setProcessingId(emp.id);
    try {
      const img = await faceapi.fetchImage(`http://localhost:5000${emp.photo_url}`);
      const detection = await faceapi
        .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      if (!detection) {
        alert('No face detected. Please upload a clearer photo.');
        return;
      }

      await saveDescriptor({
        id: emp.id,
        descriptor: Array.from(detection.descriptor),
      }).unwrap();

      alert('Face registered successfully!');
    } catch (err) {
      alert('Error processing face: ' + err.message);
    } finally {
      setProcessingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return;
    try {
      await deleteEmployee(id).unwrap();
    } catch (err) {
      alert(err?.data?.message || 'Error deleting employee');
    }
  };

  if (isLoading) return <Spinner size="lg" text="Loading employees..." />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-slate-900">Employees ({employees.length})</h2>
        <Button onClick={() => setShowForm((v) => !v)}>
          {showForm ? 'Cancel' : '+ Add Employee'}
        </Button>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-100"
          >
            <div className="p-6">
              <h3 className="mb-4 text-base font-semibold text-slate-900">New Employee</h3>
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
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Department</label>
                    <input
                      value={form.department}
                      onChange={(e) => setForm({ ...form, department: e.target.value })}
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">Face Photo *</label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoChange}
                    required
                    className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100"
                  />
                  {photoPreview && (
                    <img src={photoPreview} alt="Preview" className="mt-3 h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200" />
                  )}
                </div>
                <Button type="submit" disabled={creating}>
                  {creating ? 'Saving...' : 'Save Employee'}
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
                <th className="px-6 py-3 font-medium">Photo</th>
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Department</th>
                <th className="px-6 py-3 font-medium">Face</th>
                <th className="px-6 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {employees.map((emp) => (
                <tr key={emp.id} className="hover:bg-blue-50/40">
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
                  <td className="px-6 py-3 text-slate-500">{emp.department || '—'}</td>
                  <td className="px-6 py-3">
                    {emp.face_descriptor
                      ? <span className="text-xs font-semibold text-green-600">✓ Registered</span>
                      : <span className="text-xs font-semibold text-red-500">✗ Not Registered</span>}
                  </td>
                  <td className="px-6 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        size="sm"
                        variant={emp.face_descriptor ? 'outline' : 'primary'}
                        onClick={() => generateDescriptor(emp)}
                        disabled={processingId === emp.id}
                      >
                        {processingId === emp.id ? 'Processing...' : emp.face_descriptor ? 'Re-register' : 'Register'}
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleDelete(emp.id)}>
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}