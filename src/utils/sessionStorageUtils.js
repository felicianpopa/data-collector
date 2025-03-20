// Utility functions for handling session storage

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
  
  // Get quiz data (cached or from source)
  export const getQuizData = async () => {
    // Check if we have cached quiz data first
    const cachedQuizData = getFromSession('cachedQuizData');
    
    if (cachedQuizData) {
      return cachedQuizData;
    }
    
    // If not cached, fetch and cache it
    try {
      const response = await fetch('/db.json');
      const data = await response.json();
      
      // Cache the data for future use
      saveToSession('cachedQuizData', data);
      
      return data;
    } catch (error) {
      console.error('Error loading quiz data:', error);
      return null;
    }
  };
  
  // Reset the quiz state
  export const resetQuiz = () => {
    removeFromSession('quizState');
  };
  
  // Get summary of user's quiz answers
  export const getQuizSummary = () => {
    const quizState = getFromSession('quizState');
    
    if (!quizState) {
      return null;
    }
    
    return {
      currentStep: quizState.currentStep,
      completedSteps: quizState.stepHistory.length,
      answers: quizState.userAnswers,
      formData: quizState.formData
    };
  };