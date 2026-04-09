import { combineReducers } from "@reduxjs/toolkit";
import uiSlice from "../features/ui/uiSlice";
import authReducer from "../features/auth/authSlice";
import todoReducer from "../features/todos/todoSlice";
import journalReducer from "../features/journal/journalSlice";
import notesReducer from "../features/notes/notesSlice";

const rootReducer = combineReducers({
  ui: uiSlice,
  auth: authReducer,
  todo: todoReducer,
  journal: journalReducer,
  notes: notesReducer,
});

export default rootReducer;


