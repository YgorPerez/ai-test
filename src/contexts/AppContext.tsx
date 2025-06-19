
"use client";

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { LoggedEntry, UserGoals, MealType } from '@/types';
import type { NutritionLookupOutput, NutritionLookupInput } from '@/ai/flows/nutrition-lookup';
import { nutritionLookup } from '@/ai/flows/nutrition-lookup';
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

interface AppContextType {
  loggedEntries: LoggedEntry[];
  goals: UserGoals;
  addEntry: (data: Omit<NutritionLookupInput, 'mealName'> & { name: string, date: string; mealType: MealType }) => Promise<void>;
  updateGoals: (newGoals: UserGoals) => void;
  getEntriesByDate: (date: string) => LoggedEntry[];
  isLoading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const initialGoals: UserGoals = {
  calories: 2000,
  protein: 75,
  fat: 60,
  carbs: 250,
};

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [loggedEntries, setLoggedEntries] = useState<LoggedEntry[]>([]);
  const [goals, setGoals] = useState<UserGoals>(initialGoals);
  const [isLoading, setIsLoading] = useState<boolean>(true); // For initial load
  const [isProcessingEntry, setIsProcessingEntry] = useState<boolean>(false); // For addEntry
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedEntries = localStorage.getItem('veggiePalEntries');
      if (storedEntries) {
        setLoggedEntries(JSON.parse(storedEntries));
      }
      const storedGoals = localStorage.getItem('veggiePalGoals');
      if (storedGoals) {
        setGoals(JSON.parse(storedGoals));
      }
    } catch (e) {
      console.error("Failed to load data from localStorage", e);
      setError("Failed to load saved data.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) { // Only save after initial load
      try {
        localStorage.setItem('veggiePalEntries', JSON.stringify(loggedEntries));
      } catch (e) {
        console.error("Failed to save entries to localStorage", e);
        setError("Failed to save meal entries. Your data might not persist.");
      }
    }
  }, [loggedEntries, isLoading]);

  useEffect(() => {
    if (!isLoading) { // Only save after initial load
      try {
        localStorage.setItem('veggiePalGoals', JSON.stringify(goals));
      } catch (e) {
        console.error("Failed to save goals to localStorage", e);
        setError("Failed to save goals. Your data might not persist.");
      }
    }
  }, [goals, isLoading]);

  const addEntry = useCallback(async (data: Omit<NutritionLookupInput, 'mealName'> & { name: string, date: string; mealType: MealType }) => {
    setIsProcessingEntry(true);
    setError(null);
    try {
      const nutritionInput: NutritionLookupInput = {
        mealName: data.name,
        ingredients: data.ingredients,
        portion: data.portion,
      };
      const nutritionInfo = await nutritionLookup(nutritionInput);
      
      const newEntry: LoggedEntry = {
        id: uuidv4(),
        date: data.date,
        mealType: data.mealType,
        name: data.name,
        description: data.ingredients, // Using ingredients as description for now
        portion: data.portion,
        nutrition: nutritionInfo,
      };
      setLoggedEntries(prevEntries => [...prevEntries, newEntry].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime() || a.mealType.localeCompare(b.mealType)));
    } catch (e) {
      console.error("Failed to add entry or lookup nutrition", e);
      setError(e instanceof Error ? e.message : "Failed to add entry. Please try again.");
      throw e; // Re-throw to allow component-level error handling
    } finally {
      setIsProcessingEntry(false);
    }
  }, []);

  const updateGoals = useCallback((newGoals: UserGoals) => {
    setGoals(newGoals);
  }, []);

  const getEntriesByDate = useCallback((date: string) => {
    return loggedEntries.filter(entry => entry.date === date);
  }, [loggedEntries]);
  
  const contextValue = {
    loggedEntries,
    goals,
    addEntry,
    updateGoals,
    getEntriesByDate,
    isLoading: isLoading || isProcessingEntry, // Combined loading state
    error
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useAppContext must be used within an AppContextProvider');
  }
  return context;
};
