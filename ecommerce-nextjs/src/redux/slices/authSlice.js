import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
  isAuthenticated: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // Login actions
    loginStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    loginSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.isAuthenticated = !!action.payload.token;
      state.error = null;
    },
    loginFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    // Register actions
    registerStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    registerSuccess: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.loading = false;
      state.isAuthenticated = !!action.payload.token;
      state.error = null;
    },
    registerFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
      state.isAuthenticated = false;
    },

    // Verify email actions
    verifyEmailStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    verifyEmailSuccess: (state, action) => {
      if (state.user) {
        state.user.isVerified = true;
      }
      state.loading = false;
      state.error = null;
    },
    verifyEmailFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Forgot password actions
    forgotPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    forgotPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    forgotPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Reset password actions
    resetPasswordStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    resetPasswordSuccess: (state) => {
      state.loading = false;
      state.error = null;
    },
    resetPasswordFailure: (state, action) => {
      state.loading = false;
      state.error = action.payload;
    },

    // Logout
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.loading = false;
      state.isAuthenticated = false;
      state.error = null;
    },

    // Update user
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
    },

    // Clear error
    clearError: (state) => {
      state.error = null;
    },

    // Initialize auth from localStorage
    initializeAuth: (state, action) => {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.isAuthenticated = !!action.payload.token;
    },
  },
});

export const {
  loginStart,
  loginSuccess,
  loginFailure,
  registerStart,
  registerSuccess,
  registerFailure,
  verifyEmailStart,
  verifyEmailSuccess,
  verifyEmailFailure,
  forgotPasswordStart,
  forgotPasswordSuccess,
  forgotPasswordFailure,
  resetPasswordStart,
  resetPasswordSuccess,
  resetPasswordFailure,
  logout,
  updateUser,
  clearError,
  initializeAuth,
} = authSlice.actions;

export default authSlice.reducer;