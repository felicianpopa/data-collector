import { useState, useEffect } from "react";
import { getFromSession, saveToSession } from "../../utils/sessionStorageUtils";

const DataCollector = () => {
  const [quizData, setQuizData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState("start");
  const [stepHistory, setStepHistory] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [formData, setFormData] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);

  // Load quiz data from JSON
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setIsLoading(true);
        const response = await fetch("/db.json");
        const data = await response.json();
        setQuizData(data.quiz);
        
        // Load saved state from session storage
        const savedState = getFromSession('quizState');
        if (savedState) {
          setCurrentStep(savedState.currentStep || "start");
          setStepHistory(savedState.stepHistory || []);
          setUserAnswers(savedState.userAnswers || {});
          setFormData(savedState.formData || {});
        }
        
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading quiz data:", error);
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, []);

  // Save state to session storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const state = {
        currentStep,
        stepHistory,
        userAnswers,
        formData
      };
      saveToSession('quizState', state);
    }
  }, [currentStep, stepHistory, userAnswers, formData, isLoading]);

  if (isLoading || !quizData[currentStep]) {
    return (
      <div className="data-collector">
        <div className="loader">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  const currentQuestion = quizData[currentStep];

  const handlePrevStep = () => {
    if (stepHistory.length > 0) {
      const prevStep = stepHistory[stepHistory.length - 1];
      const updatedHistory = stepHistory.slice(0, -1);
      setCurrentStep(prevStep);
      setStepHistory(updatedHistory);
    }
  };

  const handleBooleanAnswer = (option) => {
    const { nextId, value } = option;
    setUserAnswers({
      ...userAnswers,
      [currentStep]: value
    });
    setStepHistory([...stepHistory, currentStep]);
    setCurrentStep(nextId);
  };

  const handleSingleSelect = (option) => {
    const { nextId, value } = option;
    setUserAnswers({
      ...userAnswers,
      [currentStep]: value
    });
    setStepHistory([...stepHistory, currentStep]);
    setCurrentStep(nextId);
  };

  const handleMultiSelect = () => {
    const checkboxes = document.querySelectorAll(`input[name="${currentStep}"]:checked`);
    const selectedValues = Array.from(checkboxes).map(checkbox => checkbox.value);
    
    if (selectedValues.length === 0) {
      alert("Selectați cel puțin o opțiune");
      return;
    }

    setUserAnswers({
      ...userAnswers,
      [currentStep]: selectedValues
    });
    
    setStepHistory([...stepHistory, currentStep]);
    setCurrentStep(currentQuestion.nextId);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    // Check if all required fields are filled
    const missingFields = currentQuestion.fields
      .filter(field => field.required)
      .filter(field => {
        if (field.type === 'checkbox') {
          return !formData[field.name];
        }
        return !formData[field.name] || formData[field.name].trim() === '';
      });
    
    if (missingFields.length > 0) {
      alert("Completați toate câmpurile obligatorii");
      return;
    }
    
    // In a real app, you would send the form data to a server here
    console.log("Form data submitted:", formData);
    
    // Set form as submitted
    setFormSubmitted(true);
    
    // Save all answers including form data
    setUserAnswers({
      ...userAnswers,
      [currentStep]: formData
    });
  };

  const handleAdditionalAction = (action) => {
    console.log("Action triggered:", action);
    // In a real app, this would handle redirects or showing components
    alert(`Acțiune: ${action.action} - Aceasta ar redirecționa către ${action.action}`);
  };

  const renderQuestion = () => {
    switch (currentQuestion.type) {
      case 'boolean':
        return (
          <div className="question boolean-question">
            <h2>{currentQuestion.question}</h2>
            <div className="options">
              {currentQuestion.options.map((option, index) => (
                <button 
                  key={index} 
                  className="option-button"
                  onClick={() => handleBooleanAnswer(option)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'singleSelect':
        return (
          <div className="question single-select">
            <h2>{currentQuestion.question}</h2>
            <div className="options">
              {currentQuestion.options.map((option, index) => (
                <button 
                  key={index} 
                  className="option-button"
                  onClick={() => handleSingleSelect(option)}
                >
                  {option.text}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'multiSelect':
        return (
          <div className="question multi-select">
            <h2>{currentQuestion.question}</h2>
            <div className="options checkbox-options">
              {currentQuestion.options.map((option, index) => (
                <div key={index} className="checkbox-option">
                  <input 
                    type="checkbox" 
                    id={`${currentStep}-${index}`} 
                    name={currentStep} 
                    value={option.value} 
                  />
                  <label htmlFor={`${currentStep}-${index}`}>{option.text}</label>
                </div>
              ))}
            </div>
            <button className="next-button" onClick={handleMultiSelect}>
              Continuă
            </button>
          </div>
        );
      
      case 'content':
        return (
          <div className="question content-display">
            <h2>{currentQuestion.title}</h2>
            <div className="content">
              <p>{currentQuestion.content}</p>
            </div>
            {currentQuestion.additionalActions && (
              <div className="additional-actions">
                {currentQuestion.additionalActions.map((action, index) => (
                  <button 
                    key={index} 
                    className="action-button"
                    onClick={() => handleAdditionalAction(action)}
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      
      case 'form':
        return formSubmitted ? (
          <div className="form-success">
            <h2>{currentQuestion.successMessage}</h2>
          </div>
        ) : (
          <div className="question form-question">
            <h2>{currentQuestion.title}</h2>
            <form onSubmit={handleFormSubmit}>
              {currentQuestion.fields.map((field, index) => (
                <div key={index} className="form-field">
                  {field.type === 'checkbox' ? (
                    <div className="checkbox-field">
                      <input 
                        type="checkbox" 
                        id={field.name} 
                        name={field.name} 
                        required={field.required}
                        checked={formData[field.name] || false}
                        onChange={handleFormChange}
                      />
                      <label htmlFor={field.name}>{field.label}</label>
                    </div>
                  ) : (
                    <>
                      <label htmlFor={field.name}>{field.label}</label>
                      <input 
                        type={field.type} 
                        id={field.name} 
                        name={field.name} 
                        required={field.required}
                        value={formData[field.name] || ''}
                        onChange={handleFormChange}
                      />
                    </>
                  )}
                </div>
              ))}
              <button type="submit" className="submit-button">
                {currentQuestion.submitText}
              </button>
            </form>
          </div>
        );
      
      default:
        return <div>Tip de întrebare necunoscut</div>;
    }
  };

  return (
    <div className="data-collector">
      {renderQuestion()}
      {stepHistory.length > 0 && !formSubmitted && (
        <button className="previous" onClick={handlePrevStep}>
          Înapoi
        </button>
      )}
    </div>
  );
};

export default DataCollector;