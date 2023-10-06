import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  input: [],
  currentStep: "initialStep",
  currentStepData: {},
  output: [],
  isLoading: false,
};

const url = "http://localhost:5000";
export const loadStepData = createAsyncThunk("load Step Data", async (step) => {
  try {
    const response = await fetch(`${url}/input?step=${step}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error(error);
  }
});

const dataCollectorSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    changeCurrentStep: (state, { payload }) => {
      return {
        ...state,
        currentStep: payload,
      };
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadStepData.pending, (state) => {
        return {
          ...state,
          isLoading: true,
        };
      })
      .addCase(loadStepData.fulfilled, (state, action) => {
        return {
          ...state,
          isLoading: false,
          currentStepData: action.payload[0],
        };
      })
      .addCase(loadStepData.rejected, (state) => {
        return {
          ...state,
          isLoading: false,
        };
      });
  },
});

export const { changeCurrentStep } = dataCollectorSlice.actions;

export default dataCollectorSlice.reducer;
