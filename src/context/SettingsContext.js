'use client'
import React, { createContext, useState, useContext, useEffect } from 'react';

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
  const [priceMode, setPriceMode] = useState(null);
  const [americanMode, setAmericanMode] = useState(null);
  const [regularMode, setRegularMode] = useState(null);

  useEffect(() => {
    const storedPriceMode = localStorage.getItem('priceMode');
    const storedAmericanMode = JSON.parse(localStorage.getItem('americanMode'));
    const storedRegularMode = JSON.parse(localStorage.getItem('regularMode'));

    setPriceMode(storedPriceMode);
    setAmericanMode(storedAmericanMode);
    setRegularMode(storedRegularMode);
  }, []);

  const updateSettings = (newPriceMode, newAmericanMode, newRegularMode) => {
    setPriceMode(newPriceMode);
    setAmericanMode(newAmericanMode);
    setRegularMode(newRegularMode);

    localStorage.setItem('priceMode', newPriceMode);
    localStorage.setItem('americanMode', JSON.stringify(newAmericanMode));
    localStorage.setItem('regularMode', JSON.stringify(newRegularMode));
  };

  return (
    <SettingsContext.Provider value={{ priceMode, americanMode, regularMode, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);