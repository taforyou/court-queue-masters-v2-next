'use client'
import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [priceMode, setPriceMode] = useState(null);
  const [americanMode, setAmericanMode] = useState(null);
  const [regularMode, setRegularMode] = useState(null);
  const [groupMode, setGroupMode] = useState(false);
  const [advancedHistory, setAdvancedHistory] = useState(false);

  useEffect(() => {
    const storedPriceMode = localStorage.getItem('priceMode');
    const storedAmericanMode = JSON.parse(localStorage.getItem('americanMode'));
    const storedRegularMode = JSON.parse(localStorage.getItem('regularMode'));
    const storedGroupMode = JSON.parse(localStorage.getItem('groupMode'));
    const storedAdvancedHistory = JSON.parse(localStorage.getItem('advancedHistory'));

    setPriceMode(storedPriceMode);
    setAmericanMode(storedAmericanMode);
    setRegularMode(storedRegularMode);
    setGroupMode(storedGroupMode || false);
    setAdvancedHistory(storedAdvancedHistory || false);
  }, []);

  const updateSettings = (newPriceMode, newAmericanMode, newRegularMode, newGroupMode, newAdvancedHistory) => {
    setPriceMode(newPriceMode);
    setAmericanMode(newAmericanMode);
    setRegularMode(newRegularMode);
    setGroupMode(newGroupMode);
    setAdvancedHistory(newAdvancedHistory);

    localStorage.setItem('priceMode', newPriceMode);
    localStorage.setItem('americanMode', JSON.stringify(newAmericanMode));
    localStorage.setItem('regularMode', JSON.stringify(newRegularMode));
    localStorage.setItem('groupMode', JSON.stringify(newGroupMode));
    localStorage.setItem('advancedHistory', JSON.stringify(newAdvancedHistory));
  };

  return (
    <SettingsContext.Provider value={{ priceMode, americanMode, regularMode, groupMode, advancedHistory, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);