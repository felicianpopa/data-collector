import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  input: [],
  stepHistory: [],
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
    loadPrevStep: (state) => {
      const prevStep = state.stepHistory.at(-1);
      const updatedStepHistory = state.stepHistory.slice(0, -1);
      const updatedOutput = state.output.slice(0, -1);
      return {
        ...state,
        currentStep: prevStep,
        stepHistory: updatedStepHistory,
        output: updatedOutput,
      };
    },
    loadNextStep: (state, { payload }) => {
      const { currentStep, nextStep, stepName, stepValue } = payload;
      return {
        ...state,
        currentStep: nextStep,
        stepHistory: [...state.stepHistory, currentStep],
        output: [...state.output, { [stepName]: stepValue }],
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

export const { loadNextStep, loadPrevStep } = dataCollectorSlice.actions;

export default dataCollectorSlice.reducer;
