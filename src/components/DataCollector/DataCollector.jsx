const handleIconError = (e) => {
  // If the icon fails to load, replace with fallback
  const fallbackIcon = e.target.getAttribute("data-fallback");
  if (fallbackIcon) {
    e.target.src = fallbackIcon;
    // Remove fallback to prevent infinite loop if fallback also fails
    e.target.removeAttribute("data-fallback");
  }
};
import { useState, useEffect } from "react";
import {
  getQuizData,
  getQuizAnswers,
  saveQuizAnswers,
  getCurrentStep,
  saveCurrentStep,
  getStepHistory,
  saveStepHistory,
  resetQuizAnswers,
} from "../../utils/sessionStorageUtils";

const DataCollector = () => {
  const [quizData, setQuizData] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState("start");
  const [stepHistory, setStepHistory] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [formData, setFormData] = useState({});
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState([]);

  // Load quiz data from JSON and user state from sessionStorage
  useEffect(() => {
    const loadQuizData = async () => {
      try {
        setIsLoading(true);

        // Get quiz data
        const data = await getQuizData();
        if (data && data.quiz) {
          setQuizData(data.quiz);
        } else {
          console.error("Quiz data not found or invalid format");
        }

        // Load saved user progress from session storage
        setCurrentStep(getCurrentStep());
        setStepHistory(getStepHistory());
        setUserAnswers(getQuizAnswers());

        setIsLoading(false);
      } catch (error) {
        console.error("Error loading quiz data:", error);
        setIsLoading(false);
      }
    };

    loadQuizData();
  }, []);

  // Save user progress whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveCurrentStep(currentStep);
      saveStepHistory(stepHistory);
      saveQuizAnswers(userAnswers);
    }
  }, [currentStep, stepHistory, userAnswers, isLoading]);

  if (isLoading || !quizData[currentStep]) {
    return (
      <div className="data-collector">
        <div className="loader">
          <h2>Se încarcă...</h2>
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

  const handleRestart = () => {
    setCurrentStep("start");
    setStepHistory([]);
    setUserAnswers({});
    setFormData({});
    setFormSubmitted(false);
    setSubmitError(false);
    setSelectedOptions([]);

    // Clear all user data from session storage
    resetQuizAnswers();
  };

  const handleBooleanAnswer = (option) => {
    if (!option || !option.nextId) {
      console.error("Invalid option or missing nextId", option);
      return;
    }

    const { nextId, value } = option;

    // Save the selected answer
    const updatedAnswers = {
      ...userAnswers,
      [currentStep]: value,
    };
    setUserAnswers(updatedAnswers);

    // Update navigation history
    const updatedHistory = [...stepHistory, currentStep];
    setStepHistory(updatedHistory);

    // Navigate to next step
    setCurrentStep(nextId);

    // Save to session storage immediately for safety
    saveQuizAnswers(updatedAnswers);
    saveStepHistory(updatedHistory);
    saveCurrentStep(nextId);
  };

  const handleSingleSelect = (option) => {
    if (!option || !option.nextId) {
      console.error("Invalid option or missing nextId", option);
      return;
    }

    const { nextId, value } = option;

    // Save the selected answer
    const updatedAnswers = {
      ...userAnswers,
      [currentStep]: value,
    };
    setUserAnswers(updatedAnswers);

    // Update navigation history
    const updatedHistory = [...stepHistory, currentStep];
    setStepHistory(updatedHistory);

    // Navigate to next step
    setCurrentStep(nextId);

    // Save to session storage immediately for safety
    saveQuizAnswers(updatedAnswers);
    saveStepHistory(updatedHistory);
    saveCurrentStep(nextId);
  };

  const toggleOption = (value) => {
    setSelectedOptions((prevOptions) => {
      if (prevOptions.includes(value)) {
        return prevOptions.filter((option) => option !== value);
      } else {
        return [...prevOptions, value];
      }
    });
  };

  const handleMultiSelect = () => {
    if (!currentQuestion || !currentQuestion.nextId) {
      console.error("Invalid question or missing nextId", currentQuestion);
      return;
    }

    if (selectedOptions.length === 0) {
      alert("Selectați cel puțin o opțiune");
      return;
    }

    // Save the selected answers
    const updatedAnswers = {
      ...userAnswers,
      [currentStep]: selectedOptions,
    };
    setUserAnswers(updatedAnswers);

    // Update navigation history
    const updatedHistory = [...stepHistory, currentStep];
    setStepHistory(updatedHistory);

    // Navigate to next step
    setCurrentStep(currentQuestion.nextId);

    // Save to session storage immediately for safety
    saveQuizAnswers(updatedAnswers);
    saveStepHistory(updatedHistory);
    saveCurrentStep(currentQuestion.nextId);

    // Reset selected options for next multi-select question
    setSelectedOptions([]);
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();

    // Check if all required fields are filled
    const missingFields = currentQuestion.fields
      .filter((field) => field.required)
      .filter((field) => {
        if (field.type === "checkbox") {
          return !formData[field.name];
        }
        return !formData[field.name] || formData[field.name].trim() === "";
      });

    if (missingFields.length > 0) {
      alert("Completați toate câmpurile obligatorii");
      return;
    }

    // Simulate form submission
    setIsLoading(true);

    // In a real app, you would send the form data to a server here
    setTimeout(() => {
      // Randomly succeed or fail for demo purposes
      const success = Math.random() > 0.2; // 80% success rate

      if (success) {
        console.log("Form data submitted:", formData);
        setFormSubmitted(true);
        setSubmitError(false);

        // Save form data to session storage
        sessionStorage.setItem("formData", JSON.stringify(formData));

        // Save all answers including form data
        setUserAnswers({
          ...userAnswers,
          [currentStep]: formData,
        });
      } else {
        setSubmitError(true);
      }

      setIsLoading(false);
    }, 1500);
  };

  const handleAdditionalAction = (action) => {
    console.warn("Action triggered:", action);
    if (action.action === "link") {
      if (action.new_tab) {
        window.open(action.url, "_blank");
      } else {
        window.location.href = action.url;
      }
    }
  };

  const renderQuestion = () => {
    if (submitError) {
      return (
        <div className="form-success">
          <div className="error-icon">
            <span>✕</span>
          </div>
          <h2>A apărut o problemă. Te rugăm reîncearcă mai târziu.</h2>
        </div>
      );
    }

    if (formSubmitted) {
      return (
        <div className="form-success">
          <div className="success-icon">
            <span>✓</span>
          </div>
          <h2>Mesajul tău a ajuns la noi. Te vom contacta în curând!</h2>
        </div>
      );
    }

    switch (currentQuestion.type) {
      case "boolean":
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

      case "singleSelect":
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
                  {option.icon && (
                    <img
                      src={option.icon}
                      alt=""
                      className="option-icon"
                      data-fallback={
                        option.iconFallback || "/icons/default-icon.svg"
                      }
                      onError={handleIconError}
                    />
                  )}
                  <span>{option.text}</span>
                </button>
              ))}
            </div>
          </div>
        );

      case "multiSelect":
        return (
          <div className="question multi-select">
            <h2>{currentQuestion.question}</h2>
            <div className="checkbox-options">
              {currentQuestion.options.map((option, index) => (
                <div
                  key={index}
                  className="checkbox-option"
                  onClick={() => toggleOption(option.value)}
                >
                  <input
                    type="checkbox"
                    id={`${currentStep}-${index}`}
                    name={currentStep}
                    value={option.value}
                    checked={selectedOptions.includes(option.value)}
                    onChange={() => {}} // Handled by the div onClick
                  />
                  {option.icon && (
                    <img
                      src={option.icon}
                      alt={option.text}
                      data-fallback={
                        option.iconFallback || "/icons/default-icon.svg"
                      }
                      onError={handleIconError}
                    />
                  )}
                  <label htmlFor={`${currentStep}-${index}`}>
                    {option.text}
                  </label>
                </div>
              ))}
            </div>
            <button className="next-button" onClick={handleMultiSelect}>
              Continuă
            </button>
          </div>
        );

      case "content":
        return (
          <div className="question content-display">
            <h2>{currentQuestion.title}</h2>
            <div className="content">
              <p>{currentQuestion.content}</p>
            </div>
            {currentQuestion.additionalActions && (
              <div className="content-links">
                {currentQuestion.additionalActions.map((action, index) => (
                  <button
                    key={index}
                    className="content-link"
                    onClick={() => handleAdditionalAction(action)}
                  >
                    {action.text}
                  </button>
                ))}
              </div>
            )}
          </div>
        );

      case "form":
        return (
          <div className="question form-question">
            <h2>{currentQuestion.title}</h2>
            {currentQuestion.content && <p>{currentQuestion.content}</p>}
            <form onSubmit={handleFormSubmit}>
              <div className="form-grid">
                {currentQuestion.fields.map((field, index) => (
                  <div key={index} className="form-field">
                    {field.type === "checkbox" ? (
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
                          placeholder={field.label}
                          required={field.required}
                          value={formData[field.name] || ""}
                          onChange={handleFormChange}
                        />
                      </>
                    )}
                  </div>
                ))}
              </div>
              <button type="submit" className="submit-button">
                {currentQuestion.submitText || "Trimite"}
              </button>
            </form>
          </div>
        );

      default:
        return <div>Tip de întrebare necunoscut</div>;
    }
  };

  // Render newsletter signup if present on the page
  const renderNewsletter = () => {
    if (currentQuestion.newsletter) {
      return (
        <div className="newsletter">
          <p>
            {currentQuestion.newsletter.text ||
              "Primește-ne în inbox-ul tău și vei fi mereu informat, și mai ales, inspirat!"}
          </p>
          <div className="newsletter-form">
            <input type="email" placeholder="your email" />
            <button>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M14 5l7 7m0 0l-7 7m7-7H3"
                />
              </svg>
            </button>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="data-collector">
      {isLoading && (
        <div className="loader">
          <h2>Se încarcă...</h2>
        </div>
      )}

      {renderQuestion()}
      {renderNewsletter()}

      <div className="navigation">
        {stepHistory.length > 0 && !formSubmitted && !submitError && (
          <button className="previous" onClick={handlePrevStep}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            înapoi
          </button>
        )}

        <button className="restart" onClick={handleRestart}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          reîncepe
        </button>
      </div>

      {/* Background decoration */}
      <div className="background-decoration">
        {/* SVG curves could be added here */}
      </div>
    </div>
  );
};

export default DataCollector;
