
'use server';

/**
 * @fileOverview An AI agent that looks up nutrition information for a meal.
 *
 * - nutritionLookup - A function that handles the nutrition lookup process.
 * - NutritionLookupInput - The input type for the nutritionLookup function.
 * - NutritionLookupOutput - The return type for the nutritionLookup function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const NutritionLookupInputSchema = z.object({
  mealName: z.string().describe('The name of the meal.'),
  ingredients: z.string().describe('The ingredients of the meal.'),
  portion: z.string().describe('The portion size of the meal.'),
});
export type NutritionLookupInput = z.infer<typeof NutritionLookupInputSchema>;

const NutritionLookupOutputSchema = z.object({
  calories: z.number().describe('The number of calories in the meal.'),
  protein: z.number().describe('The amount of protein in the meal (in grams).'),
  fat: z.number().describe('The amount of fat in the meal (in grams).'),
  carbohydrates: z.number().describe('The amount of carbohydrates in the meal (in grams).'),
  other: z.array(
    z.object({
      name: z.string().describe("Name of the nutrient (e.g., 'Fiber', 'Vitamin C')"),
      value: z.string().describe("Value of the nutrient, including unit (e.g., '5g', '90mg')")
    })
  ).describe('A list of other relevant nutritional components, each with a name and value (including unit).'),
});
export type NutritionLookupOutput = z.infer<typeof NutritionLookupOutputSchema>;

export async function nutritionLookup(input: NutritionLookupInput): Promise<NutritionLookupOutput> {
  return nutritionLookupFlow(input);
}

const prompt = ai.definePrompt({
  name: 'nutritionLookupPrompt',
  input: {schema: NutritionLookupInputSchema},
  output: {schema: NutritionLookupOutputSchema},
  prompt: `You are a nutritionist providing nutrition information for a given meal.

  Given the meal name, ingredients, and portion size, look up the nutritional information using a third-party nutrition API.
  If the entered data yields ambiguous results, offer multiple suggestions from the nutrition API and present the results with the most likely/relevant option first.
  If some information is missing act as a tool to estimate missing information.

  Meal Name: {{{mealName}}}
  Ingredients: {{{ingredients}}}
  Portion Size: {{{portion}}}
  `,
});

const nutritionLookupFlow = ai.defineFlow(
  {
    name: 'nutritionLookupFlow',
    inputSchema: NutritionLookupInputSchema,
    outputSchema: NutritionLookupOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
