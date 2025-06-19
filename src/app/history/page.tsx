
"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { LoggedEntry, DailySummary } from '@/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { NutritionCard } from '@/components/NutritionCard';
import { format, parseISO, startOfDay } from 'date-fns';
import { CalendarDays, Utensils, Info } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const calculateDailySummary = (entries: LoggedEntry[]): DailySummary => {
  const summary: DailySummary = {
    calories: 0, protein: 0, fat: 0, carbs: 0,
    otherNutrients: {}
  };
  entries.forEach(entry => {
    summary.calories += entry.nutrition.calories;
    summary.protein += entry.nutrition.protein;
    summary.fat += entry.nutrition.fat;
    summary.carbs += entry.nutrition.carbohydrates;
    Object.entries(entry.nutrition.other).forEach(([key, value]) => {
      const match = String(value).match(/([\d.]+)\s*([a-zA-Z%]*)/);
      if (match) {
        const numValue = parseFloat(match[1]);
        const unit = match[2] || '';
        if (!summary.otherNutrients[key]) {
          summary.otherNutrients[key] = { value: 0, unit: unit };
        }
        summary.otherNutrients[key].value += numValue;
      }
    });
  });
  return summary;
};

export default function HistoryPage() {
  const { loggedEntries, isLoading, error } = useAppContext();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(startOfDay(new Date()));

  const entriesForSelectedDate = useMemo(() => {
    if (!selectedDate) return [];
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    return loggedEntries.filter(entry => entry.date === dateStr);
  }, [loggedEntries, selectedDate]);

  const dailySummaryForSelectedDate = useMemo(() => {
    return calculateDailySummary(entriesForSelectedDate);
  }, [entriesForSelectedDate]);
  
  const loggedDates = useMemo(() => {
    const dates = new Set(loggedEntries.map(entry => entry.date));
    return Array.from(dates).map(dateStr => parseISO(dateStr));
  }, [loggedEntries]);

  // Set selected date to the most recent logged date if available
  useEffect(() => {
    if (loggedDates.length > 0) {
        const mostRecentDate = loggedDates.sort((a,b) => b.getTime() - a.getTime())[0];
        if(mostRecentDate) setSelectedDate(startOfDay(mostRecentDate));
    }
  }, [loggedDates]);


  if (isLoading && loggedEntries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Utensils className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-xl">Loading your history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <Info className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }
  
  if (loggedEntries.length === 0 && !isLoading) {
    return (
      <Alert>
        <CalendarDays className="h-4 w-4" />
        <AlertTitle>No History Yet</AlertTitle>
        <AlertDescription>
          Start tracking your meals, and your nutritional history will appear here.
        </AlertDescription>
      </Alert>
    );
  }


  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <div className="md:col-span-1">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl flex items-center gap-2">
              <CalendarDays className="h-6 w-6 text-primary" /> Select Date
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              className="rounded-md border"
              disabled={(date) => date > new Date() || date < new Date("2000-01-01")} // Example range
              modifiers={{ logged: loggedDates }}
              modifiersStyles={{ logged: { border: "2px solid hsl(var(--primary))", borderRadius: 'var(--radius)'} }}
              initialFocus
            />
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2 space-y-6">
        {selectedDate && (
          <h2 className="text-2xl font-headline">
            Details for {format(selectedDate, 'PPP')}
          </h2>
        )}

        {entriesForSelectedDate.length > 0 ? (
          <>
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">Daily Summary</CardTitle>
              </CardHeader>
              <CardContent>
                 <div className="space-y-2">
                    <p><strong className="font-medium">Total Calories:</strong> <span className="font-code">{dailySummaryForSelectedDate.calories.toFixed(1)} kcal</span></p>
                    <p><strong className="font-medium">Protein:</strong> <span className="font-code">{dailySummaryForSelectedDate.protein.toFixed(1)} g</span></p>
                    <p><strong className="font-medium">Carbs:</strong> <span className="font-code">{dailySummaryForSelectedDate.carbs.toFixed(1)} g</span></p>
                    <p><strong className="font-medium">Fat:</strong> <span className="font-code">{dailySummaryForSelectedDate.fat.toFixed(1)} g</span></p>
                    {Object.entries(dailySummaryForSelectedDate.otherNutrients).map(([key, data]) => (
                        <p key={key}><strong className="font-medium capitalize">{key.replace(/_/g, ' ')}:</strong> <span className="font-code">{data.value.toFixed(1)} {data.unit}</span></p>
                    ))}
                 </div>
              </CardContent>
            </Card>
            
            <h3 className="text-xl font-headline mt-6">Logged Meals</h3>
            <div className="space-y-4">
            {entriesForSelectedDate.map(entry => (
              <NutritionCard 
                key={entry.id}
                nutrition={entry.nutrition}
                title={`${entry.mealType}: ${entry.name}`}
                description={`Portion: ${entry.portion}. Ingredients: ${entry.description}`}
              />
            ))}
            </div>
          </>
        ) : selectedDate ? (
          <Alert>
            <Utensils className="h-4 w-4" />
            <AlertTitle>No meals logged for this date.</AlertTitle>
            <AlertDescription>Select another date to view its log, or add meals for this date via the Tracker.</AlertDescription>
          </Alert>
        ) : (
           <Alert>
            <CalendarDays className="h-4 w-4" />
            <AlertTitle>Select a Date</AlertTitle>
            <AlertDescription>Please pick a date from the calendar to view its nutritional log.</AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );
}
