import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Palette, Plus } from "lucide-react";

interface ColorPickerWithPaletteProps {
  value: string;
  onChange: (value: string) => void;
  label: string;
  id?: string;
  className?: string;
}

interface ColorPalette {
  id: number;
  name: string;
  hexValue: string;
  description?: string;
  category: string;
}

export default function ColorPickerWithPalette({ 
  value, 
  onChange, 
  label, 
  id, 
  className = "" 
}: ColorPickerWithPaletteProps) {
  const [showCustom, setShowCustom] = useState(false);

  const { data: colorsData } = useQuery({
    queryKey: ['/api/admin/color-palette'],
    queryFn: async () => {
      const res = await fetch('/api/admin/color-palette', {
        credentials: 'include',
      });
      return res.json();
    },
  });

  const colors: ColorPalette[] = colorsData?.colors || [];
  
  // Group colors by category for better organization
  const groupedColors = colors.reduce((acc, color) => {
    if (!acc[color.category]) {
      acc[color.category] = [];
    }
    acc[color.category].push(color);
    return acc;
  }, {} as Record<string, ColorPalette[]>);

  const handleColorSelect = (hexValue: string) => {
    onChange(hexValue);
    setShowCustom(false);
  };

  const isCustomColor = !colors.find(color => color.hexValue === value);

  return (
    <div className={`space-y-2 ${className}`}>
      <Label htmlFor={id}>{label}</Label>
      
      <div className="flex items-center space-x-2">
        {/* Color Preview */}
        <div
          className="w-10 h-10 border-2 border-gray-300 rounded cursor-pointer"
          style={{ backgroundColor: value }}
          title={value}
        />
        
        {/* Palette Selector */}
        <div className="flex-1">
          <Select
            value={isCustomColor ? "custom" : value}
            onValueChange={(selectedValue) => {
              if (selectedValue === "custom") {
                setShowCustom(true);
              } else {
                handleColorSelect(selectedValue);
              }
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a color" />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(groupedColors).map(([category, categoryColors]) => (
                <div key={category}>
                  <div className="px-2 py-1 text-xs font-semibold text-gray-500 uppercase">
                    {category.replace('_', ' ')}
                  </div>
                  {categoryColors.map((color) => (
                    <SelectItem key={color.id} value={color.hexValue}>
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-4 h-4 rounded border"
                          style={{ backgroundColor: color.hexValue }}
                        />
                        <span>{color.name}</span>
                        <span className="text-xs text-gray-500">{color.hexValue}</span>
                      </div>
                    </SelectItem>
                  ))}
                </div>
              ))}
              <SelectItem value="custom">
                <div className="flex items-center space-x-2">
                  <Plus className="w-4 h-4" />
                  <span>Custom Color</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Palette Browser */}
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              <Palette className="w-4 h-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">Color Palette</h4>
              
              {Object.entries(groupedColors).map(([category, categoryColors]) => (
                <div key={category}>
                  <div className="text-xs font-medium text-gray-600 mb-2 capitalize">
                    {category.replace('_', ' ')}
                  </div>
                  <div className="grid grid-cols-6 gap-2">
                    {categoryColors.map((color) => (
                      <button
                        key={color.id}
                        className="w-8 h-8 rounded border-2 border-gray-200 hover:scale-110 transition-transform"
                        style={{ backgroundColor: color.hexValue }}
                        onClick={() => handleColorSelect(color.hexValue)}
                        title={`${color.name} (${color.hexValue})`}
                      />
                    ))}
                  </div>
                </div>
              ))}
              
              {colors.length === 0 && (
                <div className="text-center text-gray-500 py-4 text-sm">
                  No colors in palette yet. Add colors in the Color Palette tab.
                </div>
              )}
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Custom Color Input */}
      {(showCustom || isCustomColor) && (
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-12 h-8 border border-gray-300 rounded cursor-pointer"
          />
          <Input
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="#000000"
            className="flex-1"
          />
          {showCustom && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowCustom(false)}
            >
              Cancel
            </Button>
          )}
        </div>
      )}
    </div>
  );
}