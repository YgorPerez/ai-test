
"use client";

import React, { useMemo } from 'react';
import { useAppContext } from '@/contexts/AppContext';
import type { DailySummary, LoggedEntry } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Utensils, Target, Flame, Beef, Wheat, Droplets, Info } from 'lucide-react';

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
    if (entry.nutrition.other) {
      entry.nutrition.other.forEach(item => {
        const key = item.name;
        const valueString = item.value; 
        const match = String(valueString).match(/([\d.]+)\s*([a-zA-Z%]*)/);
        if (match) {
          const numValue = parseFloat(match[1]);
          const unit = match[2] || '';
          if (!summary.otherNutrients[key]) {
            summary.otherNutrients[key] = { value: 0, unit: unit };
          }
          summary.otherNutrients[key].value += numValue;
          if (summary.otherNutrients[key].unit === '' && unit !== '') {
            summary.otherNutrients[key].unit = unit;
          }
        }
      });
    }
  });
  return summary;
};

const NutrientProgress: React.FC<{ label: string; value: number; goal: number; unit: string; icon: React.ElementType; colorClass: string }> = ({ label, value, goal, unit, icon: Icon, colorClass }) => (
  <div>
    <div className="mb-1 flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${colorClass}`} />
        <span className="font-medium">{label}</span>
      </div>
      <span className="text-sm font-code text-muted-foreground">
        {value.toFixed(1)} / {goal.toFixed(1)} {unit}
      </span>
    </div>
    <Progress value={goal > 0 ? (value / goal) * 100 : 0} aria-label={`${label} intake`} />
  </div>
);

export default function DashboardPage() {
  const { loggedEntries, goals, isLoading, error } = useAppContext();
  const today = format(new Date(), 'yyyy-MM-dd');
  
  const todaysEntries = useMemo(() => loggedEntries.filter(entry => entry.date === today), [loggedEntries, today]);
  const dailySummary = useMemo(() => calculateDailySummary(todaysEntries), [todaysEntries]);

  const macroData = [
    { name: 'Protein', value: dailySummary.protein, fill: 'hsl(var(--chart-2))' }, // Protein - Accent color
    { name: 'Carbs', value: dailySummary.carbs, fill: 'hsl(var(--chart-4))' },   // Carbs - Another chart color
    { name: 'Fat', value: dailySummary.fat, fill: 'hsl(var(--chart-5))' },       // Fat - Another chart color
  ];
  const totalMacros = dailySummary.protein + dailySummary.carbs + dailySummary.fat;

  if (isLoading && loggedEntries.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Utensils className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-xl">Loading your nutritional data...</p>
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

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Flame className="h-7 w-7 text-primary" /> Today's Calorie Intake
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NutrientProgress 
            label="Calories" 
            value={dailySummary.calories} 
            goal={goals.calories} 
            unit="kcal" 
            icon={Flame}
            colorClass="text-red-500" 
          />
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="h-7 w-7 text-primary" /> Macronutrient Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <NutrientProgress label="Protein" value={dailySummary.protein} goal={goals.protein} unit="g" icon={Beef} colorClass="text-blue-500" />
            <NutrientProgress label="Carbohydrates" value={dailySummary.carbs} goal={goals.carbs} unit="g" icon={Wheat} colorClass="text-yellow-500" />
            <NutrientProgress label="Fat" value={dailySummary.fat} goal={goals.fat} unit="g" icon={Droplets} colorClass="text-green-500" />
          </CardContent>
        </Card>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">Macro Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {totalMacros > 0 ? (
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={macroData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                    {macroData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}g`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-muted-foreground">Log some food to see your macro distribution.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      {Object.keys(dailySummary.otherNutrients).length > 0 && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Info className="h-7 w-7 text-primary" /> Other Nutrients
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 columns-1 sm:columns-2 md:columns-3">
              {Object.entries(dailySummary.otherNutrients).map(([key, data]) => (
                <li key={key} className="text-sm">
                  <span className="font-medium capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-code ml-1">{data.value.toFixed(1)} {data.unit}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {todaysEntries.length === 0 && !isLoading && (
         <Alert>
            <Utensils className="h-4 w-4" />
            <AlertTitle>No meals logged for today!</AlertTitle>
            <AlertDescription>
              Start tracking your meals to see your nutritional summary here.
            </AlertDescription>
          </Alert>
      )}
    </div>
  );
}
