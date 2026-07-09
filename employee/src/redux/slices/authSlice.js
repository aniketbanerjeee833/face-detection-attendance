import { createSlice } from '@reduxjs/toolkit';

// With cookies there's no token to store in JS memory.
// We only track the admin profile so the UI knows who is logged in.
const authSlice = createSlice({
  name: 'auth',
  initialState: {
    admin: null,
    isAuthenticated: false,
  },
  reducers: {
    setAdmin: (state, action) => {
      state.admin          = action.payload;
      state.isAuthenticated = true;
    },
    clearAdmin: (state) => {
      state.admin          = null;
      state.isAuthenticated = false;
    },
  },
});

export const { setAdmin, clearAdmin } = authSlice.actions;
export default authSlice.reducer;