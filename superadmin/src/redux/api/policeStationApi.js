// redux/api/policeStationApi.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const policeStationApi = createApi({
  reducerPath: 'policeStationApi',
  baseQuery: fetchBaseQuery({
     baseUrl: 'http://localhost:5000/api',
     credentials: 'include' 
    }),
  endpoints: (build) => ({
    getPoliceStations: build.query({ query: () => '/police-stations' }),
  }),
});

export const { useGetPoliceStationsQuery } = policeStationApi;