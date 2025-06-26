import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, Move, Link, ChevronRight } from 'lucide-react';

const menuItemSchema = z.object({
  label: z.string().min(1, 'Label is required'),
  href: z.string().optional(),
  parentId: z.number().optional(),
  orderIndex: z.number().default(0),
  isVisible: z.boolean().default(true),
});

type MenuItemFormData = z.infer<typeof menuItemSchema>;

interface MenuItem {
  id: number;
  label: string;
  href?: string;
  parentId?: number;
  orderIndex: number;
  isVisible: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function MenuManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MenuItemFormData>({
    resolver: zodResolver(menuItemSchema),
    defaultValues: {
      label: '',
      href: '',
      parentId: undefined,
      orderIndex: 0,
      isVisible: true,
    },
  });

  // Fetch menu items
  const { data: menuData, isLoading } = useQuery({
    queryKey: ['/api/admin/menu-items'],
    staleTime: 1000 * 60 * 5,
  });

  const menuItems: MenuItem[] = menuData?.menuItems || [];

  // Get parent menu items (top-level items)
  const parentItems = menuItems.filter(item => !item.parentId);

  // Create menu item mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      return apiRequest('/api/admin/menu-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/menu-items'] });
      setShowForm(false);
      setEditingItem(null);
      form.reset();
      toast({
        title: "Menu item created",
        description: "The menu item has been added successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create menu item",
        variant: "destructive",
      });
    },
  });

  // Update menu item mutation
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MenuItemFormData }) => {
      return apiRequest(`/api/admin/menu-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/menu-items'] });
      setShowForm(false);
      setEditingItem(null);
      form.reset();
      toast({
        title: "Menu item updated",
        description: "The menu item has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update menu item",
        variant: "destructive",
      });
    },
  });

  // Delete menu item mutation
  const deleteItemMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/admin/menu-items/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/menu-items'] });
      toast({
        title: "Menu item deleted",
        description: "The menu item has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete menu item",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MenuItemFormData) => {
    if (editingItem) {
      updateItemMutation.mutate({ id: editingItem.id, data });
    } else {
      createItemMutation.mutate(data);
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    form.reset({
      label: item.label,
      href: item.href || '',
      parentId: item.parentId,
      orderIndex: item.orderIndex,
      isVisible: item.isVisible,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this menu item?')) {
      deleteItemMutation.mutate(id);
    }
  };

  const renderMenuItem = (item: MenuItem, isSubItem = false) => {
    const subItems = menuItems.filter(subItem => subItem.parentId === item.id);
    
    return (
      <div key={item.id} className={`border rounded-lg p-4 ${isSubItem ? 'ml-6 border-gray-200' : 'border-gray-300'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isSubItem && <ChevronRight className="w-4 h-4 text-gray-400" />}
            <div>
              <h4 className="font-medium text-gray-900">{item.label}</h4>
              {item.href && (
                <p className="text-sm text-gray-500 flex items-center">
                  <Link className="w-3 h-3 mr-1" />
                  {item.href}
                </p>
              )}
              <p className="text-xs text-gray-400">
                Order: {item.orderIndex} | {item.isVisible ? 'Visible' : 'Hidden'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleEdit(item)}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDelete(item.id)}
              disabled={deleteItemMutation.isPending}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Render sub-items */}
        {subItems.length > 0 && (
          <div className="mt-4 space-y-2">
            {subItems.map(subItem => renderMenuItem(subItem, true))}
          </div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading menu items...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add/Edit Form */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Menu Items</h3>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? 'Edit Menu Item' : 'Add New Menu Item'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="label"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Label</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Menu item label" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="href"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Link URL (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="/about or https://example.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="parentId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Parent Item (for sub-menu)</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(value ? parseInt(value) : undefined)}
                        value={field.value?.toString()}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent item (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="">None (Top-level item)</SelectItem>
                          {parentItems.map((item) => (
                            <SelectItem key={item.id} value={item.id.toString()}>
                              {item.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="orderIndex"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Order Index</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          placeholder="0"
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isVisible"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Visible</FormLabel>
                        <div className="text-sm text-muted-foreground">
                          Show this menu item on the website
                        </div>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <div className="flex gap-2">
                  <Button
                    type="submit"
                    disabled={createItemMutation.isPending || updateItemMutation.isPending}
                  >
                    {editingItem ? 'Update' : 'Create'} Menu Item
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setShowForm(false);
                      setEditingItem(null);
                      form.reset();
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      )}

      {/* Menu Items List */}
      <div className="space-y-4">
        {parentItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No menu items yet. Add your first menu item to get started.
          </div>
        ) : (
          parentItems
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map(item => renderMenuItem(item))
        )}
      </div>
    </div>
  );
}