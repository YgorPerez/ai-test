
"use client";

import React, { useState, useMemo } from 'react';
import { useForm, type SubmitHandler, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAppContext } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from '@/hooks/use-toast';
import type { MealType, LoggedEntry } from '@/types';
import { NutritionCard } from '@/components/NutritionCard';
import { format } from 'date-fns';
import { Utensils, PlusCircle, Trash2, CalendarIcon, Loader2, Info } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const mealTypes: MealType[] = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];

const logEntrySchema = z.object({
  name: z.string().min(1, "Meal name is required"),
  ingredients: z.string().min(1, "Ingredients are required"),
  portion: z.string().min(1, "Portion size is required"),
  mealType: z.enum(mealTypes, { required_error: "Meal type is required" }),
  date: z.date({ required_error: "Date is required" }),
});

type LogEntryFormData = z.infer<typeof logEntrySchema>;

export default function TrackerPage() {
  const { addEntry, loggedEntries, isLoading, error: contextError } = useAppContext();
  const [formError, setFormError] = useState<string | null>(null);

  const { register, handleSubmit, reset, control, formState: { errors, isSubmitting } } = useForm<LogEntryFormData>({
    resolver: zodResolver(logEntrySchema),
    defaultValues: {
      date: new Date(),
      mealType: 'Breakfast',
    }
  });

  const onSubmit: SubmitHandler<LogEntryFormData> = async (data) => {
    setFormError(null);
    try {
      await addEntry({
        name: data.name,
        ingredients: data.ingredients,
        portion: data.portion,
        date: format(data.date, 'yyyy-MM-dd'),
        mealType: data.mealType,
      });
      toast({ title: "Meal Logged!", description: `${data.name} has been added to your log.` });
      reset({ ...data, name: "", ingredients: "", portion: "" }); // Keep date and meal type for next entry
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : "Failed to log meal. Please try again.";
      setFormError(errorMessage);
      toast({ variant: "destructive", title: "Error", description: errorMessage });
    }
  };

  const today = format(new Date(), 'yyyy-MM-dd');
  const todaysEntries = useMemo(() => loggedEntries.filter(entry => entry.date === today), [loggedEntries, today]);

  return (
    <div className="space-y-8">
      <Card className="shadow-xl">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <PlusCircle className="h-7 w-7 text-primary" /> Log New Meal
          </CardTitle>
          <CardDescription>Enter details of the meal you consumed.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Meal/Food Name</Label>
                <Input id="name" {...register('name')} placeholder="e.g., Lentil Soup" />
                {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <Label htmlFor="portion">Portion Size</Label>
                <Input id="portion" {...register('portion')} placeholder="e.g., 1 bowl (approx 250g)" />
                {errors.portion && <p className="text-sm text-destructive mt-1">{errors.portion.message}</p>}
              </div>
            </div>
            
            <div>
              <Label htmlFor="ingredients">Ingredients / Description</Label>
              <Textarea id="ingredients" {...register('ingredients')} placeholder="e.g., Red lentils, vegetable broth, carrots, celery, onion, spices" />
              {errors.ingredients && <p className="text-sm text-destructive mt-1">{errors.ingredients.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mealType">Meal Type</Label>
                <Controller
                  name="mealType"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <SelectTrigger id="mealType">
                        <SelectValue placeholder="Select meal type" />
                      </SelectTrigger>
                      <SelectContent>
                        {mealTypes.map(type => (
                          <SelectItem key={type} value={type}>{type}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.mealType && <p className="text-sm text-destructive mt-1">{errors.mealType.message}</p>}
              </div>
              <div>
                <Label htmlFor="date">Date</Label>
                <Controller
                    name="date"
                    control={control}
                    render={({ field }) => (
                        <Popover>
                        <PopoverTrigger asChild>
                            <Button
                            variant={"outline"}
                            className={cn(
                                "w-full justify-start text-left font-normal",
                                !field.value && "text-muted-foreground"
                            )}
                            >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                            />
                        </PopoverContent>
                        </Popover>
                    )}
                />
                {errors.date && <p className="text-sm text-destructive mt-1">{errors.date.message}</p>}
              </div>
            </div>

            {formError && <Alert variant="destructive"><Info className="h-4 w-4" /><AlertDescription>{formError}</AlertDescription></Alert>}
            {contextError && <Alert variant="destructive"><Info className="h-4 w-4" /><AlertDescription>{contextError}</AlertDescription></Alert>}
            
            <Button type="submit" className="w-full md:w-auto" disabled={isSubmitting || isLoading}>
              {isSubmitting || isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlusCircle className="mr-2 h-4 w-4" />}
              Log Meal
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="text-2xl font-headline mb-4">Today's Logged Meals ({format(new Date(), "PPP")})</h2>
        {todaysEntries.length > 0 ? (
          <div className="space-y-4">
            {todaysEntries.map(entry => (
              <NutritionCard 
                key={entry.id}
                nutrition={entry.nutrition}
                title={`${entry.mealType}: ${entry.name}`}
                description={`Portion: ${entry.portion}. Ingredients: ${entry.description}`}
              />
            ))}
          </div>
        ) : (
          <Alert>
            <Utensils className="h-4 w-4" />
            <AlertTitle>No meals logged for today yet.</AlertTitle>
            <AlertDescription>Use the form above to add your first meal for today.</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
