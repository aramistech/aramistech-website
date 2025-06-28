import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LogOut, Settings, Star, Menu, Users, BarChart3, ExternalLink, Image as ImageIcon, Shield } from 'lucide-react';
import AdminReviews from '@/components/admin-reviews';
import MenuManager from '@/components/menu-manager';
import AdminUserManager from '@/components/admin-user-manager';
import ExitIntentManager from '@/components/exit-intent-manager';
import MediaLibrary from '@/components/media-library';
import AnalyticsDashboard from '@/components/analytics-dashboard';
import KnowledgeBaseManager from '@/components/knowledge-base-manager';
import SecurityAlertsManager from '@/components/security-alerts-manager';

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Check admin authentication
  const { data: adminUser, isLoading: authLoading } = useQuery({
    queryKey: ['/api/admin/me'],
    retry: false,
  });

  const logoutMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest('POST', '/api/admin/logout');
      return res.json();
    },
    onSuccess: () => {
      queryClient.clear();
      toast({
        title: "Logged out",
        description: "You have been logged out successfully",
      });
      setLocation('/admin/login');
    },
    onError: () => {
      // Force logout even if API fails
      queryClient.clear();
      setLocation('/admin/login');
    },
  });

  // Redirect to login if not authenticated
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (!adminUser) {
    setLocation('/admin/login');
    return null;
  }

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Settings className="w-8 h-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">AramisTech Admin</h1>
                <p className="text-sm text-gray-500">Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700">
                Welcome, {(adminUser as any)?.user?.username || 'Admin'}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <Tabs defaultValue="reviews" className="space-y-4">
            {/* Mobile Tab Navigation */}
            <div className="sm:hidden">
              <TabsList className="flex overflow-x-auto w-full gap-1 p-1 h-auto">
                <TabsTrigger value="reviews" className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap">
                  <Star className="w-4 h-4" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap">
                  <Settings className="w-4 h-4" />
                  KB
                </TabsTrigger>
                <TabsTrigger value="menu" className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap">
                  <Menu className="w-4 h-4" />
                  Menu
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap">
                  <Users className="w-4 h-4" />
                  Users
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap">
                  <ImageIcon className="w-4 h-4" />
                  Media
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap">
                  <Shield className="w-4 h-4" />
                  Alerts
                </TabsTrigger>
                <TabsTrigger value="popup" className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap">
                  <ExternalLink className="w-4 h-4" />
                  Popup
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-1 px-3 py-2 text-xs whitespace-nowrap">
                  <BarChart3 className="w-4 h-4" />
                  Stats
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Desktop Tab Navigation */}
            <div className="hidden sm:block">
              <TabsList className="grid w-full grid-cols-4 lg:grid-cols-8">
                <TabsTrigger value="reviews" className="flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Reviews
                </TabsTrigger>
                <TabsTrigger value="knowledge" className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  Knowledge Base
                </TabsTrigger>
                <TabsTrigger value="menu" className="flex items-center gap-2">
                  <Menu className="w-4 h-4" />
                  Menu Management
                </TabsTrigger>
                <TabsTrigger value="users" className="flex items-center gap-2">
                  <Users className="w-4 h-4" />
                  Admin Users
                </TabsTrigger>
                <TabsTrigger value="security" className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  Security Alerts
                </TabsTrigger>
                <TabsTrigger value="media" className="flex items-center gap-2">
                  <ImageIcon className="w-4 h-4" />
                  Media Library
                </TabsTrigger>
                <TabsTrigger value="popup" className="flex items-center gap-2">
                  <ExternalLink className="w-4 h-4" />
                  Exit Popup
                </TabsTrigger>
                <TabsTrigger value="analytics" className="flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  Analytics
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="reviews" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="w-5 h-5" />
                    Customer Reviews Management
                  </CardTitle>
                  <CardDescription>
                    Manage customer reviews that appear on your website
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminReviews />
                </CardContent>
              </Card>
            </TabsContent>



            <TabsContent value="knowledge" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5" />
                    Knowledge Base Management
                  </CardTitle>
                  <CardDescription>
                    Create and manage help articles, troubleshooting guides, and IT knowledge for your customers
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <KnowledgeBaseManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="menu" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Menu className="w-5 h-5" />
                    Website Menu Management
                  </CardTitle>
                  <CardDescription>
                    Manage your website navigation menu items and submenus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MenuManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="users" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    Admin User Management
                  </CardTitle>
                  <CardDescription>
                    Create, edit, and manage admin accounts with dashboard access
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AdminUserManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Security Alerts Management
                  </CardTitle>
                  <CardDescription>
                    Configure website security warnings with custom content, icons, colors, and visibility settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SecurityAlertsManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="media" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5" />
                    Media Library
                  </CardTitle>
                  <CardDescription>
                    Upload and manage images for your website content
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <MediaLibrary />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="popup" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5" />
                    Exit Intent Popup
                  </CardTitle>
                  <CardDescription>
                    Configure the popup that appears when visitors try to leave your site
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ExitIntentManager />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="analytics" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total Reviews
                    </CardTitle>
                    <Star className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Customer testimonials
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Menu Items
                    </CardTitle>
                    <Menu className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      Navigation links
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Contact Forms
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Quote Requests
                    </CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">
                      This month
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Card>
                <CardHeader>
                  <CardTitle>Analytics Dashboard</CardTitle>
                  <CardDescription>
                    Detailed analytics and reporting coming soon
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <AnalyticsDashboard />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}