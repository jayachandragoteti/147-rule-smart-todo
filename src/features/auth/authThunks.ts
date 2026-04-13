import { createAsyncThunk } from "@reduxjs/toolkit";
import {
  registerUser,
  loginUser,
  logoutUser,
} from "../../services/firebase/authService";
import { saveUserProfile } from "../../services/firebase/profileService";

export const registerThunk = createAsyncThunk(
  "auth/register",
  async ({ email, password }: { email: string; password: string }) => {
    const user = await registerUser(email, password);
    
    // Create an initial profile document to initialize the users collection
    await saveUserProfile({
      uid: user.uid,
      email: user.email || email,
      displayName: user.displayName || email.split('@')[0],
      notificationsEnabled: true
    });

    return { uid: user.uid, email: user.email, displayName: user.displayName };
  }
);

export const loginThunk = createAsyncThunk(
  "auth/login",
  async ({ email, password }: { email: string; password: string }) => {
    const user = await loginUser(email, password);
    return { uid: user.uid, email: user.email, displayName: user.displayName };
  }
);

export const logoutThunk = createAsyncThunk("auth/logout", async () => {
  await logoutUser();
});
