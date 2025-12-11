// authSlice.js
import { createSlice } from "@reduxjs/toolkit";
import { createAsyncThunk } from "@reduxjs/toolkit";
import { getUserFromToken } from "../services/authService";

interface User {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
}
export const fetchUserFromToken = createAsyncThunk(
  "auth/fetchUserFromToken",
  async () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No token found");

    const user = await getUserFromToken(); // firebase JWT se user fetch
    // console.log("fites refrs user data",user)
    return user;
  }
);


interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    authStart(state) {
      state.loading = true;
      state.error = null;
    },
    authSuccess(state, action) {
      state.loading = false;
      state.user = action.payload;
    },
    authFailure(state, action) {
      state.loading = false;
      state.error = action.payload;
    },
    authLogout(state) {
      state.user = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(fetchUserFromToken.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchUserFromToken.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload as User | null;
      })
      .addCase(fetchUserFromToken.rejected, (state) => {
        state.loading = false;
        state.user = null;
      });
  }

});

export const { authStart, authSuccess, authFailure, authLogout } =
  authSlice.actions;

export default authSlice.reducer;
