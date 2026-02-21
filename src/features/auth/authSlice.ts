import { createSlice } from "@reduxjs/toolkit";
import { registerThunk, loginThunk, logoutThunk } from "./authThunks";
import type { AuthState } from "../../types/authTypes";

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
  isAuthChecked: false,
};


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
      setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthChecked = true;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(registerThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(registerThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(registerThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Registration failed";
      })
      // Login
      .addCase(loginThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(loginThunk.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(loginThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Login failed";
      })
      // Logout
      .addCase(logoutThunk.fulfilled, (state) => {
        state.user = null;
      });
  },
  
});

export const { setUser } = authSlice.actions;
export default authSlice.reducer;
