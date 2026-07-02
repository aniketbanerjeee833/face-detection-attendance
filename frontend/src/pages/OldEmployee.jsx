
import { useEffect, useState } from 'react';
import * as faceapi from 'face-api.js';
import { motion, AnimatePresence } from 'framer-motion';
import {
  useGetEmployeesQuery,
  useCreateEmployeeMutation,
  useSaveDescriptorMutation,
  useDeleteEmployeeMutation,
  useUpdateEmployeeMutation,
} from '../redux/api/employeeApi';
import { useFaceModels } from '../hooks/useFaceModels';
import Spinner from '../components/ui/Spinner';
import Button from '../components/ui/Button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import toast from 'react-hot-toast';
import { useSearchParams } from 'react-router-dom';

export default function Employees() {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null); // null = create mode, id = edit mode
  const [form, setForm] = useState({
    name: '',
    phone_number: '',
    address: '',
    aadhar_number: '',
    place_of_posting: '',
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  // const [page, setPage] = useState(1);
  // const [perPage, setPerPage] = useState(10);
  const [detecting, setDetecting] = useState(false);

  // ── Search with debounce ─────────────────────────────────────────────
  // const [searchInput, setSearchInput] = useState('');
  const [searchParams, setSearchParams] = useSearchParams();

const page = Number(searchParams.get("page") || 1);
const perPage = Number(searchParams.get("limit") || 10);
const search = searchParams.get("search") || "";
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
  //const [search, setSearch] = useState('');
 
useEffect(() => {
  const params = new URLSearchParams(searchParams);

  if (!params.has("page")) params.set("page", "1");
  if (!params.has("limit")) params.set("limit", "10");

  setSearchParams(params, { replace: true });
}, []);
const [searchInput, setSearchInput] = useState(search);
useEffect(() => {
  const t = setTimeout(() => {
    updateParams({ search: searchInput.trim(), page: 1 });
  }, 400);
  return () => clearTimeout(t);
}, [searchInput]);
//  useEffect(() => {
//   const t = setTimeout(() => {
//     updateParams({
//       search: searchInput.trim(),
//       page: 1,
//     });
//   }, 400);

//   return () => clearTimeout(t);
// }, [searchInput]);
  // useEffect(() => {
  //   const t = setTimeout(() => {
  //     setSearch(searchInput.trim());
  //     setPage(1);
  //   }, 400);
  //   return () => clearTimeout(t);
  // }, [searchInput]);

  const { modelsLoaded } = useFaceModels();

  const { data, isLoading, isFetching } = useGetEmployeesQuery({ page, limit: perPage, search });
  const [createEmployee, { isLoading: creating }] = useCreateEmployeeMutation();
  const [updateEmployee, { isLoading: updating }] = useUpdateEmployeeMutation();
  const [deleteEmployee] = useDeleteEmployeeMutation();

  const employees = data?.employees ?? [];
  const pagination = data?.pagination ?? { page: 1, limit: perPage, total: 0, totalPages: 1 };
  const totalPages = pagination.totalPages || 1;

  const resetForm = () => {
    setForm({ name: '', phone_number: '', address: '', aadhar_number: '', place_of_posting: '' });
    setPhotoFile(null);
    setPhotoPreview(null);
    setEditingId(null);
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const openCreateForm = () => {
    resetForm();
    setShowForm(true);
  };

  const openEditForm = (emp) => {
    setEditingId(emp.id);
    setForm({
      name: emp.name || '',
      phone_number: emp.phone_number || '',
      address: emp.address || '',
      aadhar_number: emp.aadhar_number || '',
      place_of_posting: emp.place_of_posting || '',
    });
    setPhotoFile(null);
    setPhotoPreview(emp.photo_url ? `http://localhost:5000${emp.photo_url}` : null);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    resetForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!/^\d{10}$/.test(form.phone_number)) {
      return toast.error('Phone number must be exactly 10 digits');
    }
    if (!/^\d{12}$/.test(form.aadhar_number)) {
      return toast.error('Aadhar number must be exactly 12 digits');
    }

    const isEdit = !!editingId;

    // photo is required on create, optional on edit (only if they want to replace it)
    if (!isEdit && !photoFile) {
      return toast.error('Please select a photo');
    }

    let descriptorJson = null;

    // only run face detection if a NEW photo was selected (create always has one)
    if (photoFile) {
      if (!modelsLoaded) {
        return toast.error('Face recognition models still loading, please wait a moment');
      }
      setDetecting(true);
      try {
        const img = await faceapi.fetchImage(photoPreview);
        const detection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!detection) {
          toast.error('No face detected in the photo. Please upload a clearer, front-facing photo.');
          return;
        }
        descriptorJson = JSON.stringify(Array.from(detection.descriptor));
      } catch (err) {
        toast.error('Error processing photo: ' + err.message);
        return;
      } finally {
        setDetecting(false);
      }
    }

    const fd = new FormData();
    fd.append('name', form.name);
    fd.append('phone_number', form.phone_number);
    fd.append('address', form.address);
    fd.append('aadhar_number', form.aadhar_number);
    fd.append('place_of_posting', form.place_of_posting);
    if (photoFile) fd.append('photo', photoFile);
    if (descriptorJson) fd.append('descriptor', descriptorJson);

    try {
      if (isEdit) {
        await updateEmployee({ id: editingId, formData: fd }).unwrap();
        toast.success('Employee updated successfully');
      } else {
        await createEmployee(fd).unwrap();
        toast.success('Employee created and face registered successfully');
        updateParams({ page: 1 }); // go to first page to see the new employee
      }
      setShowForm(false);
      resetForm();
    } catch (err) {
      toast.error(err?.data?.message || err.message || `Failed to ${isEdit ? 'update' : 'create'} employee`);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this employee?')) return;
    try {
      await deleteEmployee(id).unwrap();
      if (employees.length === 1 && page > 1) {
  updateParams({
    page: page - 1,
  });
}
      // if (employees.length === 1 && page > 1) setPage((p) => p - 1);
    } catch (err) {
      alert(err?.data?.message || 'Error deleting employee');
    }
  };

  if (isLoading) return <Spinner size="lg" text="Loading employees..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-bold text-slate-900">Employees</h2>
        <div className="flex items-center gap-3">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search ..."
            className="w-64 rounded-xl border border-slate-200 px-3.5 py-2 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
          />
          <Button onClick={showForm ? handleCancel : openCreateForm}>
            {showForm ? 'Cancel' : '+ Add Employee'}
          </Button>
        </div>
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
                    <label className="mb-1.5 block text-xs font-semibold text-slate-500">Place of Posting *</label>
                    <input
                      value={form.place_of_posting}
                      onChange={(e) => setForm({ ...form, place_of_posting: e.target.value })}
                      required
                      className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
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

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-500">
                    Face Photo {editingId ? '*' : '*'}
                  </label>
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    onChange={handlePhotoChange}
                    required={!editingId}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100"
                  />
                  {photoPreview && (
                    <img src={photoPreview} alt="Preview" className="mt-3 h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200" />
                  )}
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
                {/* <th className="px-6 py-3 font-medium">Aadhar</th> */}
                <th className="px-6 py-3 font-medium">Place of Posting</th>
                <th className="px-6 py-3 font-medium">Face</th>
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
                  {/* <td className="px-6 py-3 text-slate-500">{emp.aadhar_number}</td> */}
                  <td className="px-6 py-3 text-slate-500">{emp.place_of_posting}</td>
                  <td className="px-6 py-3">
                    {emp.face_descriptor
                      ? <span className="text-xs font-semibold text-green-600">✓ Registered</span>
                      : <span className="text-xs font-semibold text-red-500">✗ Not Registered</span>}
                  </td>
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
              updateParams({
  page: Math.min(totalPages, page + 1),
})} 
                
                disabled={page === totalPages} className="h-8 px-3">›</Button>
              <Button variant="outline" size="sm" onClick={() => updateParams({ page: totalPages })} disabled={page === totalPages} className="h-8 px-2">»</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
// export default function Employees() {
//   const [showForm, setShowForm] = useState(false);
//   const [form, setForm] = useState({
//     name: '',
//     phone_number: '',
//     address: '',
//     aadhar_number: '',
//     place_of_posting: '',
//   });
//   const [photoFile, setPhotoFile] = useState(null);
//   const [photoPreview, setPhotoPreview] = useState(null);
//   const [processingId, setProcessingId] = useState(null);

//   const [page, setPage] = useState(1);
//   const [perPage, setPerPage] = useState(10);
//   const [detecting, setDetecting] = useState(false);
//   const { modelsLoaded } = useFaceModels();

//   const { data, isLoading } = useGetEmployeesQuery({ page, limit: perPage });
//   const [createEmployee, { isLoading: creating }] = useCreateEmployeeMutation();
//   const [saveDescriptor] = useSaveDescriptorMutation();
//   const [deleteEmployee] = useDeleteEmployeeMutation();

//   const employees = data?.employees ?? [];
//   const pagination = data?.pagination ?? { page: 1, limit: perPage, total: 0, totalPages: 1 };
//   const totalPages = pagination.totalPages || 1;

//   const handlePhotoChange = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     setPhotoFile(file);
//     setPhotoPreview(URL.createObjectURL(file));
//   };

//   // const handleSubmit = async (e) => {
//   //   e.preventDefault();
//   //   if (!photoFile) return toast.error('Please select a photo');

//   //   if (!/^\d{10}$/.test(form.phone_number)) {
//   //     return toast.error('Phone number must be exactly 10 digits');
//   //   }
//   //   if (!/^\d{12}$/.test(form.aadhar_number)) {
//   //     return toast.error('Aadhar number must be exactly 12 digits');
//   //   }

//   //   const fd = new FormData();
//   //   fd.append('name',              form.name);
//   //   fd.append('phone_number',      form.phone_number);
//   //   fd.append('address',           form.address);
//   //   fd.append('aadhar_number',     form.aadhar_number);
//   //   fd.append('place_of_posting',  form.place_of_posting);
//   //   fd.append('photo',             photoFile);

//   //   try {
//   //     await createEmployee(fd).unwrap();
//   //     toast.success('Employee created successfully');
//   //     setShowForm(false);
//   //     setForm({ name: '', phone_number: '', address: '', aadhar_number: '', place_of_posting: '' });
//   //     setPhotoFile(null);
//   //     setPhotoPreview(null);
//   //     setPage(1);
//   //   } catch (err) {
//   //     toast.error(err?.data?.message || 'Failed to create employee');
//   //   }
//   // };
//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!photoFile) return toast.error('Please select a photo');

//     if (!/^\d{10}$/.test(form.phone_number)) {
//       return toast.error('Phone number must be exactly 10 digits');
//     }
//     if (!/^\d{12}$/.test(form.aadhar_number)) {
//       return toast.error('Aadhar number must be exactly 12 digits');
//     }
//     if (!modelsLoaded) {
//       return toast.error('Face recognition models still loading, please wait a moment');
//     }

//     setDetecting(true);
//     try {
//       // run face detection on the selected photo BEFORE submitting
//       const img = await faceapi.fetchImage(photoPreview);
//       const detection = await faceapi
//         .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions())
//         .withFaceLandmarks()
//         .withFaceDescriptor();

//       if (!detection) {
//         toast.error('No face detected in the photo. Please upload a clearer, front-facing photo.');
//         return;
//       }

//       const fd = new FormData();
//       fd.append('name', form.name);
//       fd.append('phone_number', form.phone_number);
//       fd.append('address', form.address);
//       fd.append('aadhar_number', form.aadhar_number);
//       fd.append('place_of_posting', form.place_of_posting);
//       fd.append('photo', photoFile);
//       fd.append('descriptor', JSON.stringify(Array.from(detection.descriptor)));

//       await createEmployee(fd).unwrap();
//       toast.success('Employee created and face registered successfully');
//       setShowForm(false);
//       setForm({ name: '', phone_number: '', address: '', aadhar_number: '', place_of_posting: '' });
//       setPhotoFile(null);
//       setPhotoPreview(null);
//       setPage(1);
//     } catch (err) {
//       toast.error(err?.data?.message || err.message || 'Failed to create employee');
//     } finally {
//       setDetecting(false);
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
//         alert('No face detected. Please upload a clearer photo.');
//         return;
//       }

//       await saveDescriptor({ id: emp.id, descriptor: Array.from(detection.descriptor) }).unwrap();
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
//       await deleteEmployee(id).unwrap();
//       if (employees.length === 1 && page > 1) setPage((p) => p - 1);
//     } catch (err) {
//       alert(err?.data?.message || 'Error deleting employee');
//     }
//   };

//   if (isLoading) return <Spinner size="lg" text="Loading employees..." />;

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center justify-between">
//         <h2 className="text-lg font-bold text-slate-900">Employees</h2>
//         <Button onClick={() => setShowForm((v) => !v)}>
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
//                 <div className="grid gap-4 sm:grid-cols-2">
//                   <div>
//                     <label className="mb-1.5 block text-xs font-semibold text-slate-500">Full Name *</label>
//                     <input
//                       value={form.name}
//                       onChange={(e) => setForm({ ...form, name: e.target.value })}
//                       required
//                       className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
//                     />
//                   </div>
//                   <div>
//                     <label className="mb-1.5 block text-xs font-semibold text-slate-500">Phone Number *</label>
//                     <input
//                       value={form.phone_number}
//                       onChange={(e) => setForm({ ...form, phone_number: e.target.value.replace(/\D/g, '').slice(0, 10) })}
//                       required
//                       maxLength={10}
//                       inputMode="numeric"
//                       placeholder="10-digit mobile number"
//                       className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
//                     />
//                   </div>
//                   <div>
//                     <label className="mb-1.5 block text-xs font-semibold text-slate-500">Aadhar Number *</label>
//                     <input
//                       value={form.aadhar_number}
//                       onChange={(e) => setForm({ ...form, aadhar_number: e.target.value.replace(/\D/g, '').slice(0, 12) })}
//                       required
//                       maxLength={12}
//                       inputMode="numeric"
//                       placeholder="12-digit Aadhar number"
//                       className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
//                     />
//                   </div>
//                   <div>
//                     <label className="mb-1.5 block text-xs font-semibold text-slate-500">Place of Posting *</label>
//                     <input
//                       value={form.place_of_posting}
//                       onChange={(e) => setForm({ ...form, place_of_posting: e.target.value })}
//                       required
//                       className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
//                     />
//                   </div>
//                   <div className="sm:col-span-2">
//                     <label className="mb-1.5 block text-xs font-semibold text-slate-500">Address *</label>
//                     <textarea
//                       value={form.address}
//                       onChange={(e) => setForm({ ...form, address: e.target.value })}
//                       required
//                       rows={2}
//                       className="w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm focus:border-blue-400 focus:outline-none focus:ring-4 focus:ring-blue-100"
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
//                     className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-lg file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-blue-600 hover:file:bg-blue-100"
//                   />
//                   {photoPreview && (
//                     <img src={photoPreview} alt="Preview" className="mt-3 h-20 w-20 rounded-xl object-cover ring-1 ring-slate-200" />
//                   )}
//                 </div>

//                 {/* <Button type="submit" disabled={creating}>
//                   {creating ? 'Saving...' : 'Save Employee'}
//                 </Button> */}
//                 <Button type="submit" disabled={creating || detecting}>
//                   {detecting ? 'Detecting face...' : creating ? 'Saving...' : 'Save Employee'}
//                 </Button>
//               </form>
//             </div>
//           </motion.div>
//         )}
//       </AnimatePresence>

//       <div className="overflow-hidden rounded-2xl bg-white shadow-soft ring-1 ring-slate-100">
//         <div className="overflow-x-auto">
//           <table className="w-full text-left text-sm">
//             <thead>
//               <tr className="border-b border-slate-100 text-xs uppercase tracking-wide text-slate-400">
//                 <th className="px-6 py-3 font-medium">Sl No</th>
//                 <th className="px-6 py-3 font-medium">Photo</th>
//                 <th className="px-6 py-3 font-medium">Name</th>
//                 <th className="px-6 py-3 font-medium">Phone</th>
//                 <th className="px-6 py-3 font-medium">Aadhar</th>
//                 <th className="px-6 py-3 font-medium">Place of Posting</th>
//                 <th className="px-6 py-3 font-medium">Face</th>
//                 <th className="px-6 py-3 font-medium">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-slate-50">
//               {employees.map((emp, idx) => (
//                 <tr key={emp.id} className="hover:bg-blue-50/40">
//                   <td className="px-6 py-3 text-slate-400">{(page - 1) * perPage + idx + 1}</td>
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
//                   <td className="px-6 py-3 text-slate-500">{emp.phone_number}</td>
//                   <td className="px-6 py-3 text-slate-500">{emp.aadhar_number}</td>
//                   <td className="px-6 py-3 text-slate-500">{emp.place_of_posting}</td>
//                   <td className="px-6 py-3">
//                     {emp.face_descriptor
//                       ? <span className="text-xs font-semibold text-green-600">✓ Registered</span>
//                       : <span className="text-xs font-semibold text-red-500">✗ Not Registered</span>}
//                   </td>
//                   <td className="px-6 py-3">
//                     <div className="flex flex-wrap gap-2">
//                       {/* <Button
//                         size="sm"
//                         variant={emp.face_descriptor ? 'outline' : 'primary'}
//                         onClick={() => generateDescriptor(emp)}
//                         disabled={processingId === emp.id}
//                       >
//                         {processingId === emp.id ? 'Processing...' :
//                          emp.face_descriptor ? 'Re-register' : 'Register'}
//                       </Button> */}
//                       <Button size="sm" variant="danger" onClick={() => handleDelete(emp.id)}>
//                         Delete
//                       </Button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//               {employees.length === 0 && (
//                 <tr>
//                   <td colSpan={8} className="px-6 py-10 text-center text-sm text-slate-400">
//                     No employees found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>

//         {employees.length > 0 && (
//           <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-100">
//             <div className="flex items-center gap-2 text-sm text-gray-500">
//               <span>Rows per page</span>
//               <Select value={String(perPage)} onValueChange={(v) => { setPerPage(Number(v)); setPage(1); }}>
//                 <SelectTrigger className="h-8 w-16 text-sm"><SelectValue /></SelectTrigger>
//                 <SelectContent>
//                   {[10, 20, 50].map((n) => <SelectItem key={n} value={String(n)}>{n}</SelectItem>)}
//                 </SelectContent>
//               </Select>
//             </div>

//             <span className="text-sm text-gray-500">
//               Page {page} of {totalPages} · {pagination.total ?? 0} total
//             </span>

//             <div className="flex items-center gap-1">
//               <Button variant="outline" size="sm" onClick={() => setPage(1)} disabled={page === 1} className="h-8 px-2">«</Button>
//               <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="h-8 px-3">‹</Button>
//               {Array.from({ length: totalPages }, (_, i) => i + 1)
//                 .filter((p) => p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1))
//                 .reduce((acc, p, i, arr) => {
//                   if (i > 0 && p - arr[i - 1] > 1) acc.push('...');
//                   acc.push(p);
//                   return acc;
//                 }, [])
//                 .map((p, i) =>
//                   p === '...' ? (
//                     <span key={`d${i}`} className="px-1 text-gray-400 text-sm">…</span>
//                   ) : (
//                     <Button
//                       key={p}
//                       variant={page === p ? 'default' : 'outline'}
//                       size="sm"
//                       onClick={() => setPage(p)}
//                       className={`h-8 w-8 p-0 text-sm ${page === p ? 'bg-indigo-600 hover:bg-indigo-700 text-white' : ''}`}
//                     >
//                       {p}
//                     </Button>
//                   )
//                 )}
//               <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="h-8 px-3">›</Button>
//               <Button variant="outline" size="sm" onClick={() => setPage(totalPages)} disabled={page === totalPages} className="h-8 px-2">»</Button>
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }
