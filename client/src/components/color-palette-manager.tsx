import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Edit, Palette, Copy } from "lucide-react";

interface ColorPalette {
  id: number;
  name: string;
  hexValue: string;
  description?: string;
  category: string;
  orderIndex: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const categories = [
  { value: 'primary', label: 'Primary Colors' },
  { value: 'secondary', label: 'Secondary Colors' },
  { value: 'accent', label: 'Accent Colors' },
  { value: 'background', label: 'Background Colors' },
  { value: 'text', label: 'Text Colors' },
  { value: 'button', label: 'Button Colors' },
  { value: 'alert', label: 'Alert Colors' },
  { value: 'general', label: 'General' },
];

export default function ColorPaletteManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState({
    name: '',
    hexValue: '#000000',
    description: '',
    category: 'general',
    orderIndex: 0,
  });
  
  const [editingId, setEditingId] = useState<number | null>(null);

  const { data: colorsData, isLoading } = useQuery({
    queryKey: ['/api/admin/color-palette'],
    queryFn: async () => {
      const res = await fetch('/api/admin/color-palette', {
        credentials: 'include',
      });
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const res = await fetch('/api/admin/color-palette', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to create color');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Color added to palette",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/color-palette'] });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add color",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: typeof formData }) => {
      const res = await fetch(`/api/admin/color-palette/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update color');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Color updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/color-palette'] });
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update color",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`/api/admin/color-palette/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to delete color');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Color deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/color-palette'] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete color",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      name: '',
      hexValue: '#000000',
      description: '',
      category: 'general',
      orderIndex: 0,
    });
    setEditingId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleEdit = (color: ColorPalette) => {
    setFormData({
      name: color.name,
      hexValue: color.hexValue,
      description: color.description || '',
      category: color.category,
      orderIndex: color.orderIndex,
    });
    setEditingId(color.id);
  };

  const handleCopyColor = (hexValue: string) => {
    navigator.clipboard.writeText(hexValue);
    toast({
      title: "Copied",
      description: `Color ${hexValue} copied to clipboard`,
    });
  };

  const colors: ColorPalette[] = colorsData?.colors || [];
  const groupedColors = categories.map(category => ({
    ...category,
    colors: colors.filter(color => color.category === category.value)
  }));

  if (isLoading) {
    return <div className="p-6">Loading color palette...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Palette className="w-6 h-6 text-orange-500" />
        <h2 className="text-2xl font-bold">Global Color Palette</h2>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Color Form */}
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Color' : 'Add New Color'}</CardTitle>
            <CardDescription>
              Save colors to reuse across the website
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Color Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Brand Orange"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="hexValue">Color</Label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    id="hexValue"
                    value={formData.hexValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, hexValue: e.target.value }))}
                    className="w-16 h-10 border border-gray-300 rounded cursor-pointer"
                  />
                  <Input
                    value={formData.hexValue}
                    onChange={(e) => setFormData(prev => ({ ...prev, hexValue: e.target.value }))}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Primary brand color for buttons and highlights"
                  rows={2}
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="flex-1"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {editingId ? 'Update Color' : 'Add Color'}
                </Button>
                {editingId && (
                  <Button type="button" variant="outline" onClick={resetForm}>
                    Cancel
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Color Palette Display */}
        <Card>
          <CardHeader>
            <CardTitle>Saved Colors</CardTitle>
            <CardDescription>
              Click any color to copy its hex value
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {groupedColors.map(category => (
              category.colors.length > 0 && (
                <div key={category.value}>
                  <h4 className="font-semibold text-sm text-gray-600 mb-3">{category.label}</h4>
                  <div className="grid grid-cols-1 gap-3">
                    {category.colors.map(color => (
                      <div key={color.id} className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                        <div
                          className="w-12 h-12 rounded-lg border-2 border-gray-200 cursor-pointer hover:scale-110 transition-transform"
                          style={{ backgroundColor: color.hexValue }}
                          onClick={() => handleCopyColor(color.hexValue)}
                          title="Click to copy"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium">{color.name}</span>
                            <button
                              onClick={() => handleCopyColor(color.hexValue)}
                              className="text-xs text-gray-500 hover:text-gray-700 font-mono bg-gray-100 px-2 py-1 rounded"
                            >
                              {color.hexValue}
                              <Copy className="w-3 h-3 ml-1 inline" />
                            </button>
                          </div>
                          {color.description && (
                            <p className="text-xs text-gray-500 mt-1">{color.description}</p>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(color)}
                          >
                            <Edit className="w-3 h-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteMutation.mutate(color.id)}
                            disabled={deleteMutation.isPending}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )
            ))}
            {colors.length === 0 && (
              <div className="text-center text-gray-500 py-8">
                No colors saved yet. Add your first color to get started.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}