import { combineReducers } from "@reduxjs/toolkit";
import uiSlice from "../features/ui/uiSlice";
import authReducer from "../features/auth/authSlice";
import todoReducer from "../features/todos/todoSlice";

const rootReducer = combineReducers({
  ui: uiSlice,
  auth: authReducer,
  todo: todoReducer,
});

export default rootReducer;
