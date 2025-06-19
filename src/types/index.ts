import type { NutritionLookupOutput } from '@/ai/flows/nutrition-lookup';

export type MealType = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface LoggedEntry {
  id: string;
  date: string; // YYYY-MM-DD
  mealType: MealType;
  name: string; // User-given name for the food/meal entry
  description: string; // Ingredients or other details provided by user
  portion: string; // Portion size provided by user
  nutrition: NutritionLookupOutput;
}

export interface UserGoals {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
}

export interface DailySummary {
  calories: number;
  protein: number;
  fat: number;
  carbs: number;
  otherNutrients: Record<string, { value: number; unit: string }>;
}

export interface RecipeSuggestion {
  name: string;
  description?: string;
  ingredients?: string[];
  instructions?: string[];
  // Potentially more fields like image URL, prep time, etc.
}
