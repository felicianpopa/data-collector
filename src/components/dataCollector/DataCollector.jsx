import { loadStepData } from "../../features/dataCollector/dataCollectorSlice";
import { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

const DataCollector = () => {
  const { currentStepData, isLoading, currentStep } = useSelector(
    (store) => store.dataCollector
  );
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(loadStepData(currentStep));
  }, [currentStep]);
  return (
    <div className="data-collector">
      <h2>{currentStepData.stepTitle}</h2>
    </div>
  );
};

export default DataCollector;
