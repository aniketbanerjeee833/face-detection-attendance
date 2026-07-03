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
  query: ({ date, page, limit, search } = {}) => {
    const params = new URLSearchParams();

    if (date) params.set("date", date);
    if (search) params.set("search", search);

    params.set("page", page);
    params.set("limit", limit);

    return `/attendance?${params.toString()}`;
  },
  providesTags: ["Attendance"],
}),
// redux/api/attendanceApi.js

   
// getAttendance: build.query({
//   query: ({ date, page , limit  } = {}) => {
//     const params = new URLSearchParams();

//     if (date) params.set("date", date);
//     // if (employee_id) params.set("employee_id", employee_id);

//     params.set("page", page);
//     params.set("limit", limit);

//     return `/attendance?${params.toString()}`;
//   },
//   providesTags: ["Attendance"],
// }),
getTodaySummary: build.query({
  query: ({ date, admin_id } = {}) => {
    const params = new URLSearchParams();
    if (date) params.set('date', date);
    if (admin_id) params.set('admin_id', admin_id);
    const qs = params.toString();
    return `/attendance/summary${qs ? `?${qs}` : ''}`;
  },
}),
   

    markAttendance: build.mutation({
      query: (body) => ({
        url: '/attendance/mark',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Attendance', 'AttendanceSummary'],
    }),
    getAttendanceSuperAdmin: build.query({
  query: ({ page, limit, search, date, admin_id }) => {
    const params = new URLSearchParams({ page, limit });
    if (search) params.set('search', search);
    if (date) params.set('date', date);
    if (admin_id) params.set('admin_id', admin_id);
    return `/attendance/superadmin/all?${params.toString()}`;
  },
}),

  }),
});

export const {
  useGetAttendanceQuery,
  useGetTodaySummaryQuery,
  useMarkAttendanceMutation,
  useGetAttendanceSuperAdminQuery,
} = attendanceApi;