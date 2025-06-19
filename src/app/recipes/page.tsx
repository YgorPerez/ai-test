
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { suggestRecipes, type RecipeSuggestionsInput, type RecipeSuggestionsOutput } from '@/ai/flows/recipe-suggestions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from '@/hooks/use-toast';
import { BookCopy, Lightbulb, Loader2, Info, Salad, CheckSquare } from 'lucide-react'; // Salad for recipe, CheckSquare for ingredients

const recipeRequestSchema = z.object({
  preferences: z.string().min(1, "Preferences are required (e.g., Italian, spicy, quick meals)"),
  availableIngredients: z.string().min(1, "List some available ingredients (e.g., tofu, broccoli, rice)"),
  nutritionalGoals: z.string().optional().describe("Optional nutritional goals (e.g., high protein, low carb)"),
});

type RecipeRequestFormData = z.infer<typeof recipeRequestSchema>;

export default function RecipeSuggestionsPage() {
  const [suggestedRecipes, setSuggestedRecipes] = useState<RecipeSuggestionsOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RecipeRequestFormData>({
    resolver: zodResolver(recipeRequestSchema),
  });

  const onSubmit: SubmitHandler<RecipeRequestFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setSuggestedRecipes(null);
    try {
      const input: RecipeSuggestionsInput = {
        preferences: data.preferences,
        availableIngredients: data.availableIngredients,
        nutritionalGoals: data.nutritionalGoals || "General healthy vegan meals",
      };
      const result = await suggestRecipes(input);
      setSuggestedRecipes(result);
      toast({ title: "Recipes Suggested!", description: "Check out the vegan recipe ideas below." });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to get recipe suggestions.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Suggestion Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BookCopy className="h-7 w-7 text-primary" /> AI Recipe Corner
          </CardTitle>
          <CardDescription>
            Get personalized vegan recipe suggestions based on your tastes, ingredients, and goals.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="preferences">Dietary Preferences & Cuisines</Label>
              <Input id="preferences" {...register('preferences')} placeholder="e.g., Spicy, Italian, quick meals, gluten-free" />
              {errors.preferences && <p className="text-sm text-destructive mt-1">{errors.preferences.message}</p>}
            </div>
            <div>
              <Label htmlFor="availableIngredients">Available Ingredients (comma-separated)</Label>
              <Textarea id="availableIngredients" {...register('availableIngredients')} placeholder="e.g., Tofu, broccoli, quinoa, canned tomatoes, spinach" />
              {errors.availableIngredients && <p className="text-sm text-destructive mt-1">{errors.availableIngredients.message}</p>}
            </div>
            <div>
              <Label htmlFor="nutritionalGoals">Nutritional Goals (Optional)</Label>
              <Input id="nutritionalGoals" {...register('nutritionalGoals')} placeholder="e.g., High protein, low fat, under 500 calories" />
              {errors.nutritionalGoals && <p className="text-sm text-destructive mt-1">{errors.nutritionalGoals.message}</p>}
            </div>

            {error && <Alert variant="destructive"><Info className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
            
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lightbulb className="mr-2 h-4 w-4" />}
              Suggest Recipes
            </Button>
          </form>
        </CardContent>
      </Card>

      {suggestedRecipes && suggestedRecipes.recipes.length > 0 && (
        <div className="space-y-6">
          <h2 className="text-2xl font-headline">Recipe Ideas</h2>
          {suggestedRecipes.recipes.map((recipe, index) => (
            <Card key={index} className="shadow-lg animate-in fade-in-50">
              <CardHeader>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Salad className="h-6 w-6 text-primary" /> {recipe.split(':')[0]} {/* Assuming recipe name is before first colon */}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 whitespace-pre-line">{recipe}</p>
                 {/* This could be enhanced if the AI returns structured recipe data */}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      {suggestedRecipes && suggestedRecipes.recipes.length === 0 && !isLoading && (
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>No recipes found</AlertTitle>
          <AlertDescription>Try adjusting your criteria for different suggestions.</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
