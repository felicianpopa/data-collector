import { configureStore } from "@reduxjs/toolkit";
import dataCollectorSlice from "./features/dataCollector/dataCollectorSlice";

export const store = configureStore({
  reducer: {
    dataCollector: dataCollectorSlice,
  },
});
