
"use client";

import type { NutritionLookupOutput } from "@/ai/flows/nutrition-lookup";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Flame, Beef, Wheat, Droplets, Info } from "lucide-react"; // Using Beef for protein, Wheat for carbs, Droplets for fat

interface NutritionCardProps {
  nutrition: NutritionLookupOutput;
  title?: string;
  description?: string;
}

const NutrientDisplay: React.FC<{ icon: React.ElementType; label: string; value: number; unit: string }> = ({ icon: Icon, label, value, unit }) => (
  <div className="flex items-center space-x-2">
    <Icon className="h-5 w-5 text-primary" />
    <span className="font-medium">{label}:</span>
    <span className="font-code text-sm">{value.toFixed(1)} {unit}</span>
  </div>
);

export function NutritionCard({ nutrition, title, description }: NutritionCardProps) {
  return (
    <Card className="shadow-lg">
      {title && (
        <CardHeader>
          <CardTitle className="text-xl font-headline">{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      )}
      <CardContent className="space-y-3 pt-4">
        <NutrientDisplay icon={Flame} label="Calories" value={nutrition.calories} unit="kcal" />
        <NutrientDisplay icon={Beef} label="Protein" value={nutrition.protein} unit="g" />
        <NutrientDisplay icon={Wheat} label="Carbs" value={nutrition.carbohydrates} unit="g" />
        <NutrientDisplay icon={Droplets} label="Fat" value={nutrition.fat} unit="g" />
        {nutrition.other && nutrition.other.map((item, index) => (
          <div key={index} className="flex items-center space-x-2">
            <Info className="h-5 w-5 text-muted-foreground" />
            <span className="font-medium capitalize">{item.name.replace(/_/g, ' ')}:</span>
            <span className="font-code text-sm">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
