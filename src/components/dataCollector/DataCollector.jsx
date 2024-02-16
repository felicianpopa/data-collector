import {
  loadStepData,
  loadNextStep,
  loadPrevStep,
} from "../../features/dataCollector/dataCollectorSlice";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import SelectComponent from "../SelectComponent/SelectComponent";

const DataCollector = () => {
  const { currentStepData, isLoading, currentStep, stepHistory, output } =
    useSelector((store) => store.dataCollector);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadStepData(currentStep));
  }, [currentStep]);

  const onLoadPrevStep = () => {
    dispatch(loadPrevStep());
  };

  const onLoadNextStep = () => {
    const nextStepData = currentStepData?.stepData?.nextStep;
    const stepName = currentStepData?.stepData?.dataName;
    let nextStep = "";
    const stepValue = document.getElementById(stepName).value;
    // check if there is a value
    if (stepValue.length === 0) {
      alert("please choose a value");
      return;
    }
    // if we only have one nextStep option
    if (typeof nextStepData === "string") {
      nextStep = nextStepData;
    }
    // If we have multiple nextStep options
    else {
      nextStep = currentStepData?.stepData?.nextStep[stepValue];
    }

    dispatch(loadNextStep({ currentStep, nextStep, stepName, stepValue }));
  };

  const submitData = () => {
    console.warn("The output is ", output);
  };

  return (
    <div className="data-collector">
      {isLoading && (
        <div className="loader">
          <h2>Loading...</h2>
        </div>
      )}

      <h2>{currentStepData.stepTitle}</h2>
      {currentStepData?.stepData?.dataType === "select" && (
        <SelectComponent {...currentStepData.stepData} />
      )}
      {currentStepData?.stepData?.dataType === "input" && (
        <input
          type="text"
          name={currentStepData?.stepData?.dataName}
          id={currentStepData?.stepData?.dataName}
        />
      )}
      <div className="actions">
        {stepHistory.length > 0 && (
          <button className="previous" onClick={() => onLoadPrevStep()}>
            Prev step
          </button>
        )}
        {currentStepData?.stepData?.nextStep && (
          <button className="next" onClick={() => onLoadNextStep()}>
            Next step
          </button>
        )}

        {currentStep === "finalStep" && (
          <button className="next" onClick={() => submitData()}>
            Submit data
          </button>
        )}
      </div>
    </div>
  );
};

export default DataCollector;
