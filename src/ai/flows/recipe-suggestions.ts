'use server';

/**
 * @fileOverview Recipe suggestion AI agent.
 *
 * - suggestRecipes - A function that suggests vegan-friendly recipes based on user preferences and available ingredients.
 * - RecipeSuggestionsInput - The input type for the suggestRecipes function.
 * - RecipeSuggestionsOutput - The return type for the suggestRecipes function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecipeSuggestionsInputSchema = z.object({
  preferences: z
    .string()
    .describe('User dietary preferences, such as preferred cuisines or specific ingredients to include or exclude.'),
  availableIngredients: z
    .string()
    .describe('A list of ingredients the user has available, separated by commas.'),
  nutritionalGoals:
    z.string().describe('The users nutritional goals, such as daily caloric or macro targets.'),
});
export type RecipeSuggestionsInput = z.infer<typeof RecipeSuggestionsInputSchema>;

const RecipeSuggestionsOutputSchema = z.object({
  recipes: z
    .array(z.string())
    .describe('A list of vegan-friendly recipe suggestions based on the user input.'),
});
export type RecipeSuggestionsOutput = z.infer<typeof RecipeSuggestionsOutputSchema>;

export async function suggestRecipes(input: RecipeSuggestionsInput): Promise<RecipeSuggestionsOutput> {
  return suggestRecipesFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recipeSuggestionsPrompt',
  input: {schema: RecipeSuggestionsInputSchema},
  output: {schema: RecipeSuggestionsOutputSchema},
  prompt: `You are a vegan recipe suggestion expert. Based on the user's preferences, available ingredients, and nutritional goals, suggest some recipes.

User Preferences: {{{preferences}}}
Available Ingredients: {{{availableIngredients}}}
Nutritional Goals: {{{nutritionalGoals}}}

Suggest recipes that are vegan-friendly and match the given criteria.`,
});

const suggestRecipesFlow = ai.defineFlow(
  {
    name: 'suggestRecipesFlow',
    inputSchema: RecipeSuggestionsInputSchema,
    outputSchema: RecipeSuggestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
