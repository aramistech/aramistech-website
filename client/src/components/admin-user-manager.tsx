import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Plus, Edit, Trash2, User, Key, Mail, Calendar, Activity } from 'lucide-react';

const createUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  isActive: z.boolean().default(true),
});

const updateUserSchema = z.object({
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal('')),
  isActive: z.boolean(),
});

type CreateUserFormData = z.infer<typeof createUserSchema>;
type UpdateUserFormData = z.infer<typeof updateUserSchema>;

interface AdminUser {
  id: number;
  username: string;
  email?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
  twoFactorEnabled?: boolean;
}

export default function AdminUserManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const createForm = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      username: '',
      password: '',
      email: '',
      isActive: true,
    },
  });

  const updateForm = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      isActive: true,
    },
  });

  // Fetch admin users
  const { data: usersData, isLoading } = useQuery({
    queryKey: ['/api/admin/users'],
    staleTime: 1000 * 60 * 5,
  });

  const adminUsers: AdminUser[] = Array.isArray(usersData?.users) ? usersData.users : [];

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (data: CreateUserFormData) => {
      const res = await apiRequest('/api/admin/users', 'POST', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowForm(false);
      createForm.reset();
      toast({
        title: "Admin user created",
        description: "The admin user has been created successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create admin user",
        variant: "destructive",
      });
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: UpdateUserFormData }) => {
      const res = await apiRequest(`/api/admin/users/${id}`, 'PUT', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      setShowForm(false);
      setEditingUser(null);
      updateForm.reset();
      toast({
        title: "Admin user updated",
        description: "The admin user has been updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update admin user",
        variant: "destructive",
      });
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest(`/api/admin/users/${id}`, 'DELETE');
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "Admin user deleted",
        description: "The admin user has been removed",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete admin user",
        variant: "destructive",
      });
    },
  });

  const onCreateSubmit = (data: CreateUserFormData) => {
    createUserMutation.mutate(data);
  };

  const onUpdateSubmit = (data: UpdateUserFormData) => {
    if (editingUser) {
      updateUserMutation.mutate({ id: editingUser.id, data });
    }
  };

  const handleEdit = (user: AdminUser) => {
    setEditingUser(user);
    updateForm.reset({
      username: user.username,
      email: user.email || '',
      password: '',
      isActive: user.isActive,
    });
    setShowForm(true);
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this admin user? This action cannot be undone.')) {
      deleteUserMutation.mutate(id);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-gray-500">Loading admin users...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Admin Users</h3>
          <p className="text-sm text-gray-600">
            Manage admin accounts with access to the dashboard
          </p>
        </div>
        <Button onClick={() => {
          setEditingUser(null);
          createForm.reset();
          setShowForm(!showForm);
        }}>
          <Plus className="w-4 h-4 mr-2" />
          Add Admin User
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>
              {editingUser ? `Edit Admin User: ${editingUser.username}` : 'Create New Admin User'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {editingUser ? (
              <Form {...updateForm}>
                <form onSubmit={updateForm.handleSubmit(onUpdateSubmit)} className="space-y-4">
                  <FormField
                    control={updateForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="admin" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={updateForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="admin@aramistech.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={updateForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password (leave empty to keep current)</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Enter new password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={updateForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Allow this user to log in to the admin dashboard
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
                      disabled={updateUserMutation.isPending}
                    >
                      Update Admin User
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingUser(null);
                        updateForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            ) : (
              <Form {...createForm}>
                <form onSubmit={createForm.handleSubmit(onCreateSubmit)} className="space-y-4">
                  <FormField
                    control={createForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="admin" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email (optional)</FormLabel>
                        <FormControl>
                          <Input {...field} type="email" placeholder="admin@aramistech.com" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input {...field} type="password" placeholder="Enter secure password" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={createForm.control}
                    name="isActive"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">Active</FormLabel>
                          <div className="text-sm text-muted-foreground">
                            Allow this user to log in to the admin dashboard
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
                      disabled={createUserMutation.isPending}
                    >
                      Create Admin User
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        createForm.reset();
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            )}
          </CardContent>
        </Card>
      )}

      {/* Admin Users List */}
      <div className="space-y-4">
        <h4 className="text-md font-medium">Current Admin Users</h4>
        {adminUsers.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No admin users found. Create your first admin user to get started.
          </div>
        ) : (
          <div className="grid gap-4">
            {adminUsers.map(user => (
              <Card key={user.id}>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                        <User className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h5 className="font-medium flex items-center gap-2">
                          {user.username}
                          {!user.isActive && (
                            <span className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded">
                              Inactive
                            </span>
                          )}
                        </h5>
                        <div className="text-sm text-gray-500 space-y-1">
                          {user.email && (
                            <div className="flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {user.email}
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Created: {formatDate(user.createdAt)}
                          </div>
                          {user.lastLogin && (
                            <div className="flex items-center gap-1">
                              <Activity className="w-3 h-3" />
                              Last login: {formatDate(user.lastLogin)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(user)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(user.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}