import { createContext, useContext, useState, useEffect } from 'react';

const DateContext = createContext();

export function DateProvider({ children }) {
  // Try to load from sessionStorage, fallback to current date
  const loadInitialState = () => {
    const savedDate = sessionStorage.getItem('aura-selected-date');
    if (savedDate) {
      return JSON.parse(savedDate);
    }
    const now = new Date();
    return { month: now.getMonth() + 1, year: now.getFullYear() };
  };

  const [dateState, setDateState] = useState(loadInitialState);

  // Sync to sessionStorage when changed
  useEffect(() => {
    sessionStorage.setItem('aura-selected-date', JSON.stringify(dateState));
  }, [dateState]);

  const setMonthYear = (month, year) => {
    setDateState({ month, year });
  };

  return (
    <DateContext.Provider value={{ month: dateState.month, year: dateState.year, setMonthYear }}>
      {children}
    </DateContext.Provider>
  );
}

export const useDate = () => useContext(DateContext);
