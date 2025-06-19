
"use client";

import React, { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { nutritionLookup, type NutritionLookupInput, type NutritionLookupOutput } from '@/ai/flows/nutrition-lookup';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from '@/hooks/use-toast';
import { NutritionCard } from '@/components/NutritionCard';
import { BrainCircuit, Search, Loader2, Info } from 'lucide-react';

const lookupSchema = z.object({
  mealName: z.string().min(1, "Meal name is required"),
  ingredients: z.string().min(1, "Ingredients are required"),
  portion: z.string().min(1, "Portion size is required"),
});

type LookupFormData = z.infer<typeof lookupSchema>;

export default function NutritionLookupPage() {
  const [lookupResult, setLookupResult] = useState<NutritionLookupOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<LookupFormData>({
    resolver: zodResolver(lookupSchema),
  });

  const onSubmit: SubmitHandler<LookupFormData> = async (data) => {
    setIsLoading(true);
    setError(null);
    setLookupResult(null);
    try {
      const result = await nutritionLookup(data);
      setLookupResult(result);
      toast({ title: "Nutrition Info Found!", description: `Details for ${data.mealName} displayed below.` });
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to lookup nutrition information.";
      setError(errorMessage);
      toast({ variant: "destructive", title: "Lookup Error", description: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <BrainCircuit className="h-7 w-7 text-primary" /> AI Nutrition Lookup
          </CardTitle>
          <CardDescription>
            Enter meal details to get an AI-powered nutritional analysis. 
            The AI will estimate information if some details are missing or ambiguous.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="mealName">Meal/Food Name</Label>
              <Input id="mealName" {...register('mealName')} placeholder="e.g., Vegan Chili" />
              {errors.mealName && <p className="text-sm text-destructive mt-1">{errors.mealName.message}</p>}
            </div>
            <div>
              <Label htmlFor="ingredients">Ingredients / Description</Label>
              <Textarea id="ingredients" {...register('ingredients')} placeholder="e.g., Kidney beans, tomatoes, spices, bell peppers" />
              {errors.ingredients && <p className="text-sm text-destructive mt-1">{errors.ingredients.message}</p>}
            </div>
            <div>
              <Label htmlFor="portion">Portion Size</Label>
              <Input id="portion" {...register('portion')} placeholder="e.g., 1 large bowl, approx 300g" />
              {errors.portion && <p className="text-sm text-destructive mt-1">{errors.portion.message}</p>}
            </div>

            {error && <Alert variant="destructive"><Info className="h-4 w-4" /><AlertDescription>{error}</AlertDescription></Alert>}
            
            <Button type="submit" className="w-full md:w-auto" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Search className="mr-2 h-4 w-4" />}
              Lookup Nutrition
            </Button>
          </form>
        </CardContent>
      </Card>

      {lookupResult && (
        <Card className="shadow-lg animate-in fade-in-50">
          <CardHeader>
            <CardTitle className="text-xl">Nutritional Information for: {lookupSchema.parse(lookupResult).mealName || "Your Meal"}</CardTitle>
          </CardHeader>
          <CardContent>
            <NutritionCard nutrition={lookupResult} />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
