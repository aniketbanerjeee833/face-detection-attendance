// redux/slices/uiSlice.js
import { createSlice } from '@reduxjs/toolkit';

const todayISO = () => new Date().toISOString().split('T')[0];

const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    dashboardDate: todayISO(), // yyyy-mm-dd, defaults to today
  },
  reducers: {
    setDashboardDate: (state, action) => {
      state.dashboardDate = action.payload;
    },
    resetDashboardDate: (state) => {
      state.dashboardDate = todayISO();
    },
  },
});

export const { setDashboardDate, resetDashboardDate } = uiSlice.actions;
export default uiSlice.reducer;