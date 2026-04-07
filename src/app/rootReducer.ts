import { combineReducers } from "@reduxjs/toolkit";
import uiSlice from "../features/ui/uiSlice";
import authReducer from "../features/auth/authSlice";
import todoReducer from "../features/todos/todoSlice";
import journalReducer from "../features/journal/journalSlice";

const rootReducer = combineReducers({
  ui: uiSlice,
  auth: authReducer,
  todo: todoReducer,
  journal: journalReducer,
});

export default rootReducer;

