import {
  loadStepData,
  changeCurrentStep,
} from "../../features/dataCollector/dataCollectorSlice";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import SelectComponent from "../SelectComponent/SelectComponent";

const DataCollector = () => {
  const { currentStepData, isLoading, currentStep } = useSelector(
    (store) => store.dataCollector
  );
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadStepData(currentStep));
  }, [currentStep]);

  const loadPrevStep = () => {
    dispatch(changeCurrentStep(currentStepData?.stepData?.prevStep));
  };

  const loadNextStep = () => {
    const stepName = currentStepData?.stepData?.dataName;
    const nextStepValue = document.getElementById(stepName).value;
    const nextStep = currentStepData?.stepData?.nextStep[nextStepValue];

    dispatch(changeCurrentStep(nextStep));
  };

  return (
    <div className="data-collector">
      <h2>{currentStepData.stepTitle}</h2>
      {currentStepData?.stepData?.dataType === "select" && (
        <SelectComponent {...currentStepData.stepData} />
      )}
      <div className="actions">
        {currentStepData?.stepData?.prevStep && (
          <button className="previous" onClick={() => loadPrevStep()}>
            Prev step
          </button>
        )}

        <button className="next" onClick={() => loadNextStep()}>
          Next step
        </button>
      </div>
    </div>
  );
};

export default DataCollector;
