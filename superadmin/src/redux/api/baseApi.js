import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const baseApi = createApi({
  reducerPath: 'api',

  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include', // sends cookies automatically on every request
  }),

  // tag types used for cache invalidation across all injected endpoints
  tagTypes: ['Employee', 'Attendance', 'AttendanceSummary', 'Auth'],

  endpoints: () => ({}), // endpoints are injected per-feature below
});