
"use client";

import React, { useEffect, useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import type { UserGoals } from '@/types';
import { ListChecks, Save, Loader2, Flame, Beef, Wheat, Droplets } from 'lucide-react'; // Added specific icons

const goalsSchema = z.object({
  calories: z.number().min(0, "Calories must be positive").max(10000, "Calories seem too high"),
  protein: z.number().min(0, "Protein must be positive").max(500, "Protein seem too high"),
  fat: z.number().min(0, "Fat must be positive").max(500, "Fat seem too high"),
  carbs: z.number().min(0, "Carbs must be positive").max(1000, "Carbs seem too high"),
});

type GoalsFormData = z.infer<typeof goalsSchema>;

interface NutrientInputProps {
  id: keyof GoalsFormData;
  label: string;
  unit: string;
  icon: React.ElementType;
  register: any; // Simplified for brevity, normally ReturnType<typeof useForm>['register']
  error?: string;
  defaultValue?: number;
}

const NutrientInput: React.FC<NutrientInputProps> = ({ id, label, unit, icon: Icon, register, error, defaultValue }) => (
  <div>
    <Label htmlFor={id} className="flex items-center gap-2 mb-1">
      <Icon className="h-5 w-5 text-primary" /> {label} ({unit})
    </Label>
    <Input 
      id={id} 
      type="number" 
      {...register(id, { valueAsNumber: true })} 
      placeholder={`Enter ${label.toLowerCase()}`}
      defaultValue={defaultValue}
      className="font-code"
    />
    {error && <p className="text-sm text-destructive mt-1">{error}</p>}
  </div>
);


export default function GoalsPage() {
  const { goals, updateGoals, isLoading: contextIsLoading } = useAppContext();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<GoalsFormData>({
    resolver: zodResolver(goalsSchema),
    defaultValues: goals, 
  });

  useEffect(() => {
    reset(goals); // Update form default values if goals change from context (e.g., initial load)
  }, [goals, reset]);

  const onSubmit: SubmitHandler<GoalsFormData> = async (data) => {
    setIsSubmitting(true);
    try {
      updateGoals(data);
      toast({ title: "Goals Updated!", description: "Your nutritional goals have been saved." });
    } catch (e) {
      toast({ variant: "destructive", title: "Error", description: "Failed to update goals." });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const isLoading = contextIsLoading || isSubmitting;

  return (
    <Card className="max-w-2xl mx-auto shadow-xl">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <ListChecks className="h-7 w-7 text-primary" /> Set Your Daily Nutritional Goals
        </CardTitle>
        <CardDescription>
          Personalize your daily targets for calories, protein, carbohydrates, and fats.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <NutrientInput 
            id="calories" 
            label="Calories" 
            unit="kcal" 
            icon={Flame}
            register={register} 
            error={errors.calories?.message}
            defaultValue={goals.calories}
          />
          <NutrientInput 
            id="protein" 
            label="Protein" 
            unit="g" 
            icon={Beef}
            register={register} 
            error={errors.protein?.message}
            defaultValue={goals.protein}
          />
          <NutrientInput 
            id="carbs" 
            label="Carbohydrates" 
            unit="g" 
            icon={Wheat}
            register={register} 
            error={errors.carbs?.message}
            defaultValue={goals.carbs}
          />
          <NutrientInput 
            id="fat" 
            label="Fat" 
            unit="g" 
            icon={Droplets}
            register={register} 
            error={errors.fat?.message}
            defaultValue={goals.fat}
          />
          
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save Goals
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
