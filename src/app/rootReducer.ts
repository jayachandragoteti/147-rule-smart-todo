import { combineReducers } from "@reduxjs/toolkit";
import uiSlice from "../features/ui/uiSlice";

const rootReducer = combineReducers({
  ui: uiSlice,
});

export default rootReducer;
