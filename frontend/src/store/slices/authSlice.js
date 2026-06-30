import { createSlice } from '@reduxjs/toolkit';

const token = localStorage.getItem('token');
const admin = JSON.parse(localStorage.getItem('admin') || 'null');

const authSlice = createSlice({
  name: 'auth',
  initialState: { token, admin, isAuthenticated: !!token },
  reducers: {
    setCredentials: (state, action) => {
      state.token = action.payload.token;
      state.admin = action.payload.admin;
      state.isAuthenticated = true;
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('admin', JSON.stringify(action.payload.admin));
    },
    logout: (state) => {
      state.token = null;
      state.admin = null;
      state.isAuthenticated = false;
      localStorage.removeItem('token');
      localStorage.removeItem('admin');
    },
  },
});

export const { setCredentials, logout } = authSlice.actions;
export default authSlice.reducer;