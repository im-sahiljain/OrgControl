import { configureStore } from "@reduxjs/toolkit";
import { employeeUIReducer } from "./slice";

export const store = configureStore({
  reducer: {
    employeeUI: employeeUIReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;