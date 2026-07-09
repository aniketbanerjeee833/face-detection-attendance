import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: 'http://localhost:5000/api',
    credentials: 'include',
  }),
  tagTypes: ['Auth'],
  endpoints: (build) => ({

    login: build.mutation({
      query: (credentials) => ({
        url: '/auth/operator/login',
        method: 'POST',
        body: credentials,
      }),
      invalidatesTags: ['Auth'],
    }),

    getMe: build.query({
      query: () => '/auth/operator/me',
      providesTags: ['Auth'],
    }),

    logout: build.mutation({
      query: () => ({ url: '/auth/operator/logout', method: 'POST' }),
      invalidatesTags: ['Auth'],
    }),

  }),
});

export const { useLoginMutation, useGetMeQuery, useLogoutMutation } = authApi;