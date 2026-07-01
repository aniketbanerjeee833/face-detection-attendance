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
      query: ({ page = 1, limit = 100 } = {}) =>
        `/employees?page=${page}&limit=${limit}`,
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
  useGetEmployeeQuery,
  useCreateEmployeeMutation,
  useSaveDescriptorMutation,
  useDeleteEmployeeMutation,
} = employeeApi;