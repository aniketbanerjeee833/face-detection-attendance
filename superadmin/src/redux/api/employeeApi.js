import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['Employee'],
  endpoints: (build) => ({

//     getEmployees: build.query({
//   query: ({ page = 1, limit = 10, search = '' } = {}) => {
//     const params = new URLSearchParams({
//       page: String(page),
//       limit: String(limit),
//     });
//     if (search) params.set('search', search);
//     return `/employees?${params.toString()}`;
//   },
//   providesTags: (result) =>
//     result?.employees
//       ? [
//           ...result.employees.map(({ id }) => ({ type: 'Employee', id })),
//           { type: 'Employee', id: 'LIST' },
//         ]
//       : [{ type: 'Employee', id: 'LIST' }],
// }),
    // getEmployees: build.query({
    //   query: ({ page ,limit,search } = {}) =>
    //     `/employees?page=${page}&limit=${limit}&search=${search}`,
    //   providesTags: (result) =>
    //     result?.employees
    //       ? [
    //           ...result.employees.map(({ id }) => ({ type: 'Employee', id })),
    //           { type: 'Employee', id: 'LIST' },
    //         ]
    //       : [{ type: 'Employee', id: 'LIST' }],
    // }),

    getEmployee: build.query({
      query: (id) => `/employees/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Employee', id }],
    }),

    // createEmployee: build.mutation({
    //   query: (formData) => ({
    //     url: '/employees',
    //     method: 'POST',
    //     body: formData,
    //     // no Content-Type header — browser sets multipart boundary automatically
    //   }),
    //   invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    // }),

    // saveDescriptor: build.mutation({
    //   query: ({ id, descriptor }) => ({
    //     url: `/employees/${id}/descriptor`,
    //     method: 'PATCH',
    //     body: { descriptor },
    //   }),
    //   invalidatesTags: (_result, _err, { id }) => [{ type: 'Employee', id }],
    // }),

//  updateEmployee: build.mutation({
//   query: ({ id, formData }) => ({
//     url: `/employees/${id}`,
//     method: 'PUT',
//     body: formData,
//   }),
//   invalidatesTags: (_result, _error, { id }) => [
//     { type: "Employee", id },
//     { type: "Employee", id: "LIST" },
//   ],
// }),
//     deleteEmployee: build.mutation({
//       query: (id) => ({ url: `/employees/${id}`, method: 'DELETE' }),
//       invalidatesTags: (_result, _err, id) => [
//         { type: 'Employee', id },
//         { type: 'Employee', id: 'LIST' },
//       ],
//     }),

       // redux/api/employeeApi.js — add alongside existing endpoints
// getEmployeesSuperAdmin: build.query({
//   query: ({ page, limit, search, admin_id }) => {
//     const params = new URLSearchParams({ page, limit });
//     if (search) params.set('search', search);
//     if (admin_id) params.set('admin_id', admin_id);
//     return `/employees/superadmin/all?${params.toString()}`;
//   },
// }),
getEmployeesSuperAdmin: build.query({
      query: ({ page = 1, limit = 10, search = '', police_station_id = '',admin_id='' } = {}) => {
        const p = new URLSearchParams({ page, limit });
        if (search)            p.set('search', search);
        if (police_station_id) p.set('police_station_id', police_station_id);
        if(admin_id)           p.set('admin_id',admin_id)
        return `/employees/superadmin/all?${p.toString()}`;
      },
      providesTags: [{ type: 'Employee', id: 'LIST' }],
    }),

getAdminsList: build.query({
  query: () => `/employees/superadmin/admins`,
}),

  }),
});

export const {

  useGetEmployeeQuery,
 
  useGetEmployeesSuperAdminQuery,
  useGetAdminsListQuery

} = employeeApi;