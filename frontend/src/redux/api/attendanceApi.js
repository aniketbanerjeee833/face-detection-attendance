import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const attendanceApi = createApi({
  reducerPath: 'attendanceApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['Attendance', 'AttendanceSummary'],
  endpoints: (build) => ({

    getAttendance: build.query({
      query: ({ date, employee_id } = {}) => {
        const params = new URLSearchParams();
        if (date)        params.set('date', date);
        if (employee_id) params.set('employee_id', employee_id);
        return `/attendance?${params.toString()}`;
      },
      providesTags: ['Attendance'],
    }),

    getTodaySummary: build.query({
      query: () => '/attendance/summary/today',
      providesTags: ['AttendanceSummary'],
    }),

    markAttendance: build.mutation({
      query: (body) => ({
        url: '/attendance/mark',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance', 'AttendanceSummary'],
    }),

  }),
});

export const {
  useGetAttendanceQuery,
  useGetTodaySummaryQuery,
  useMarkAttendanceMutation,
} = attendanceApi;