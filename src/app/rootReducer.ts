import { combineReducers } from "@reduxjs/toolkit";
import uiSlice from "../features/ui/uiSlice";
import authReducer from "../features/auth/authSlice";

const rootReducer = combineReducers({
  ui: uiSlice,
  auth: authReducer,
});

export default rootReducer;
