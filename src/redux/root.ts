import { combineReducers } from "@reduxjs/toolkit";
import userReducer from "./slices/user.slice";
import settingsReducer from "./slices/settings.slice";

export const rootReducer = combineReducers({
  user: userReducer,
  settings: settingsReducer,
});
