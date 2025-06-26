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
import { Plus, Edit, Trash2, GripVertical, Link, ChevronRight } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

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

// Sortable Menu Item Component
function SortableMenuItem({ item, onEdit, onDelete, onToggleVisibility, children }: {
  item: MenuItem;
  onEdit: (item: MenuItem) => void;
  onDelete: (id: number) => void;
  onToggleVisibility: (id: number, isVisible: boolean) => void;
  children?: React.ReactNode;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="group">
      <div className={`flex items-center gap-3 p-3 bg-white border rounded-lg ${isDragging ? 'shadow-lg' : 'hover:shadow-sm'}`}>
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600"
        >
          <GripVertical className="w-4 h-4" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium">{item.label}</span>
            {item.href && (
              <span className="text-sm text-gray-500">→ {item.href}</span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Switch
            checked={item.isVisible}
            onCheckedChange={(checked) => onToggleVisibility(item.id, checked)}
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(item)}
          >
            <Edit className="w-4 h-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(item.id)}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
      {children}
    </div>
  );
}

export default function MenuManager() {
  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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

  const menuItems: MenuItem[] = Array.isArray(menuData?.menuItems) ? menuData.menuItems : [];

  // Get parent menu items (top-level items)
  const parentItems = menuItems.filter(item => !item.parentId);

  // Create menu item mutation
  const createItemMutation = useMutation({
    mutationFn: async (data: MenuItemFormData) => {
      const res = await apiRequest('POST', '/api/admin/menu-items', data);
      return res.json();
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
      const res = await apiRequest('PUT', `/api/admin/menu-items/${id}`, data);
      return res.json();
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
      const res = await apiRequest('DELETE', `/api/admin/menu-items/${id}`);
      return res.json();
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

  // Reorder mutation
  const reorderMutation = useMutation({
    mutationFn: async (reorderedItems: MenuItem[]) => {
      const updates = reorderedItems.map((item, index) => ({
        id: item.id,
        orderIndex: index,
      }));
      
      const res = await apiRequest('PUT', '/api/admin/menu-items/reorder', { updates });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/menu-items'] });
      toast({ title: 'Menu order updated successfully' });
    },
    onError: (error: any) => {
      toast({
        title: 'Error reordering menu items',
        description: error.message,
        variant: 'destructive',
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
      {/* Current Website Navigation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Current Website Navigation</h3>
        <p className="text-blue-700 text-sm mb-3">
          These are the menu items currently displayed on your website. Edit them below or add new links.
        </p>
        <div className="flex flex-wrap gap-2">
          {menuItems.filter(item => !item.parentId).map(item => (
            <div key={item.id} className="bg-white px-3 py-1 rounded border text-sm">
              {item.label} {item.href && `→ ${item.href}`}
            </div>
          ))}
        </div>
      </div>

      {/* Add/Edit Form */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Manage Menu Items</h3>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Menu Item
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingItem ? `Edit "${editingItem.label}"` : 'Add New Menu Item'}
            </CardTitle>
            <p className="text-sm text-gray-600">
              {editingItem ? 'Update the menu item details below' : 'Create a new navigation link or submenu parent'}
            </p>
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
                      <FormLabel>Link URL</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          placeholder="Examples: /, #services, /about, https://external-site.com" 
                        />
                      </FormControl>
                      <div className="text-sm text-gray-500 mt-1">
                        • Use "/" for home page<br/>
                        • Use "#section" for page anchors<br/>
                        • Use "/page" for internal pages<br/>
                        • Use "https://..." for external sites<br/>
                        • Leave empty for parent menu items with sublinks only
                      </div>
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
                        onValueChange={(value) => field.onChange(value === "none" ? undefined : parseInt(value))}
                        value={field.value?.toString() || "none"}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select parent item (optional)" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="none">None (Top-level item)</SelectItem>
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