import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const employeeApi = createApi({
  reducerPath: 'employeeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['Employee'],
  endpoints: (build) => ({

    getEmployees: build.query({
  query: ({ page = 1, limit = 10, search = '' } = {}) => {
    const params = new URLSearchParams({
      page: String(page),
      limit: String(limit),
    });
    if (search) params.set('search', search);
    return `/employees?${params.toString()}`;
  },
  providesTags: (result) =>
    result?.employees
      ? [
          ...result.employees.map(({ id }) => ({ type: 'Employee', id })),
          { type: 'Employee', id: 'LIST' },
        ]
      : [{ type: 'Employee', id: 'LIST' }],
}),

getAllEmployeesForMatching: build.query({
  query: () => '/employees/match/all',
  providesTags: (result) =>
    result?.employees
      ? [
          ...result.employees.map(({ id }) => ({ type: 'Employee', id })),
          { type: 'Employee', id: 'LIST' },
        ]
      : [{ type: 'Employee', id: 'LIST' }],
}),
  

    getEmployee: build.query({
      query: (id) => `/employees/${id}`,
      providesTags: (_result, _err, id) => [{ type: 'Employee', id }],
    }),

    createEmployee: build.mutation({
      query: (formData) => ({
        url: '/employees',
        method: 'POST',
        body: formData,
        // no Content-Type header — browser sets multipart boundary automatically
      }),
      invalidatesTags: [{ type: 'Employee', id: 'LIST' }],
    }),

    saveDescriptor: build.mutation({
      query: ({ id, descriptor }) => ({
        url: `/employees/${id}/descriptor`,
        method: 'PATCH',
        body: { descriptor },
      }),
      invalidatesTags: (_result, _err, { id }) => [{ type: 'Employee', id }],
    }),

 updateEmployee: build.mutation({
  query: ({ id, formData }) => ({
    url: `/employees/${id}`,
    method: 'PUT',
    body: formData,
  }),
  invalidatesTags: (_result, _error, { id }) => [
    { type: "Employee", id },
    { type: "Employee", id: "LIST" },
  ],
}),
    deleteEmployee: build.mutation({
      query: (id) => ({ url: `/employees/${id}`, method: 'DELETE' }),
      invalidatesTags: (_result, _err, id) => [
        { type: 'Employee', id },
        { type: 'Employee', id: 'LIST' },
      ],
    }),

 

  }),
});

export const {
  useGetEmployeesQuery,
  useGetAllEmployeesForMatchingQuery,
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useSaveDescriptorMutation,
  useDeleteEmployeeMutation,
  useUpdateEmployeeMutation,

  
} = employeeApi;