// Utility functions for handling session storage

// Default fallback icon
const FALLBACK_ICON = '/icons/default-icon.svg';

// Get data from session storage
export const getFromSession = (key, defaultValue = null) => {
  try {
    const item = sessionStorage.getItem(key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (error) {
    console.error('Error getting data from session storage:', error);
    return defaultValue;
  }
};

// Save data to session storage
export const saveToSession = (key, value) => {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error('Error saving data to session storage:', error);
  }
};

// Clear specific data from session storage
export const removeFromSession = (key) => {
  try {
    sessionStorage.removeItem(key);
  } catch (error) {
    console.error('Error removing data from session storage:', error);
  }
};

// Clear all data from session storage
export const clearSession = () => {
  try {
    sessionStorage.clear();
  } catch (error) {
    console.error('Error clearing session storage:', error);
  }
};

// Process quiz data to ensure all required properties exist
export const processQuizData = (data) => {
  if (!data?.quiz) return data;
  
  const processedQuiz = { ...data.quiz };
  
  // Process each question in the quiz
  Object.keys(processedQuiz).forEach(key => {
    const item = processedQuiz[key];
    
    // Skip if item is not an object or doesn't have options
    if (!item || typeof item !== 'object' || !item.options) return;
    
    // Process each option to ensure it has an icon if it should
    if (['multiSelect', 'singleSelect'].includes(item.type)) {
      item.options = item.options.map(option => {
        // If option already has an icon path, use it
        if (option.icon) {
          return option;
        }
        
        // Try to generate an icon path based on the value
        if (option.value) {
          const generatedIcon = `/icons/${option.value}.svg`;
          return {
            ...option,
            icon: generatedIcon,
            // Store original value for potential fallback needs
            iconFallback: FALLBACK_ICON
          };
        }
        
        // If no value or icon, add fallback
        return {
          ...option,
          icon: FALLBACK_ICON
        };
      });
    }
  });
  
  return { ...data, quiz: processedQuiz };
};

// Get quiz data from source
export const getQuizData = async () => {
  try {
    const response = await fetch('/db.json');
    const data = await response.json();
    
    // Process data to ensure all required properties exist
    const processedData = processQuizData(data);
    
    return processedData;
  } catch (error) {
    console.error('Error loading quiz data:', error);
    return null;
  }
};

// Reset user's quiz answers
export const resetQuizAnswers = () => {
  removeFromSession('quizAnswers');
  removeFromSession('quizCurrentStep');
  removeFromSession('quizHistory');
};

// Get user's quiz answers
export const getQuizAnswers = () => {
  return getFromSession('quizAnswers', {});
};

// Save user's quiz answers
export const saveQuizAnswers = (answers) => {
  saveToSession('quizAnswers', answers);
};

// Get current step
export const getCurrentStep = () => {
  return getFromSession('quizCurrentStep', 'start');
};

// Save current step
export const saveCurrentStep = (step) => {
  saveToSession('quizCurrentStep', step);
};

// Get step history
export const getStepHistory = () => {
  return getFromSession('quizHistory', []);
};

// Save step history
export const saveStepHistory = (history) => {
  saveToSession('quizHistory', history);
};

// Format answers for submission
export const formatAnswersForSubmission = () => {
  const answers = getQuizAnswers();
  const formData = getFromSession('formData', {});
  
  if (Object.keys(answers).length === 0) {
    return null;
  }
  
  // Add form data if available
  if (formData && Object.keys(formData).length > 0) {
    return { ...answers, contactInfo: formData };
  }
  
  return answers;
};