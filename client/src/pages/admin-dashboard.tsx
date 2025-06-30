import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { LogOut, Settings, Star, Menu, Users, BarChart3, ExternalLink, Image as ImageIcon, Shield, Palette, Calculator, ChevronLeft, ChevronRight, Book, GripVertical, Link } from 'lucide-react';
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
import {
  CSS,
} from '@dnd-kit/utilities';
import AdminReviews from '@/components/admin-reviews';
import MenuManager from '@/components/menu-manager';
import AdminUserManager from '@/components/admin-user-manager';
import ExitIntentManager from '@/components/exit-intent-manager';
import MediaLibrary from '@/components/media-library';


import VisualImageManager from '@/components/visual-image-manager-working';
import AnalyticsDashboard from '@/components/analytics-dashboard';
import KnowledgeBaseManager from '@/components/knowledge-base-manager';
import SecurityAlertsManager from '@/components/security-alerts-manager';
import ColorPaletteManager from '@/components/color-palette-manager';
import ServiceCalculatorManager from '@/components/service-calculator-manager';
import FooterManager from '@/components/footer-manager';
import StaticServicesManagement from '@/components/admin/static-services-management';
import TwoFactorAuthManager from '@/components/two-factor-auth-manager';

// Sortable Menu Item Component
interface SortableMenuItemProps {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  isCollapsed: boolean;
  onClick: () => void;
}

function SortableMenuItem({ id, label, icon: Icon, isActive, isCollapsed, onClick }: SortableMenuItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative">
      <Button
        variant={isActive ? "default" : "ghost"}
        className={`w-full justify-start mb-1 ${
          isCollapsed ? 'px-2' : 'px-3'
        } ${isActive ? 'bg-aramis-orange hover:bg-orange-600 text-white' : ''} ${
          isDragging ? 'cursor-grabbing' : 'cursor-pointer'
        }`}
        onClick={onClick}
      >
        <div className="flex items-center w-full">
          <div
            {...attributes}
            {...listeners}
            className="mr-2 cursor-grab hover:cursor-grabbing opacity-50 hover:opacity-100"
            onClick={(e) => e.stopPropagation()}
          >
            <GripVertical className="w-3 h-3" />
          </div>
          <Icon className="w-4 h-4" />
          {!isCollapsed && <span className="ml-2">{label}</span>}
        </div>
      </Button>
    </div>
  );
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  // Initialize sidebar as collapsed on mobile, open on desktop
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024; // collapsed on mobile/tablet
    }
    return false;
  });
  const [activeTab, setActiveTab] = useState('reviews');
  const queryClient = useQueryClient();

  // Handle window resize for responsive sidebar
  React.useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Menu items with order state
  const [menuItems, setMenuItems] = useState([
    { id: 'reviews', label: 'Reviews', icon: Star },
    { id: 'services', label: 'Services', icon: Settings },
    { id: 'menu', label: 'Menu', icon: Menu },
    { id: 'footer', label: 'Footer', icon: Link },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'twofactor', label: '2FA', icon: Shield },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'knowledge', label: 'Knowledge', icon: Book },
    { id: 'media', label: 'Media Library', icon: ImageIcon },
    { id: 'demo', label: 'Visual Images', icon: Settings },
    { id: 'popup', label: 'Exit Popup', icon: ExternalLink },
    { id: 'calculator', label: 'Calculator', icon: Calculator },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ]);

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Handle drag end
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setMenuItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);

        const newOrder = arrayMove(items, oldIndex, newIndex);
        
        // Show success message
        toast({
          title: "Menu Reordered",
          description: "Dashboard navigation menu order has been updated",
        });

        return newOrder;
      });
    }
  };

  // Verify authentication
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['/api/admin/me'],
    retry: false,
  });

  if (userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-lg font-medium">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    setLocation('/admin/login');
    return null;
  }

  const handleLogout = async () => {
    try {
      await apiRequest('/api/admin/logout', 'POST');
      toast({
        title: "Success",
        description: "Logged out successfully",
      });
      setLocation('/admin/login');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to logout",
        variant: "destructive",
      });
    }
  };



  const renderContent = () => {
    switch (activeTab) {
      case 'reviews':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-5 h-5" />
                Customer Reviews Management
              </CardTitle>
              <CardDescription>
                Manage customer testimonials and reviews
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdminReviews />
            </CardContent>
          </Card>
        );

      case 'menu':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Menu className="w-5 h-5" />
                Website Menu Management
              </CardTitle>
              <CardDescription>
                Organize navigation menu items with drag-and-drop functionality
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MenuManager />
            </CardContent>
          </Card>
        );

      case 'footer':
        return <FooterManager />;

      case 'users':
        return (
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
        );

      case 'services':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Services Management
              </CardTitle>
              <CardDescription>
                Manage website service offerings with pricing, descriptions, and ordering links
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StaticServicesManagement />
            </CardContent>
          </Card>
        );

      case 'twofactor':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Two-Factor Authentication
              </CardTitle>
              <CardDescription>
                Manage two-factor authentication settings for enhanced account security
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TwoFactorAuthManager />
            </CardContent>
          </Card>
        );

      case 'security':
        return (
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
        );

      case 'colors':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                Color Palette Management
              </CardTitle>
              <CardDescription>
                Manage brand colors and color schemes used throughout the website
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ColorPaletteManager />
            </CardContent>
          </Card>
        );

      case 'knowledge':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Book className="w-5 h-5" />
                Knowledge Base Management
              </CardTitle>
              <CardDescription>
                Create and manage help articles, categories, and technical documentation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <KnowledgeBaseManager />
            </CardContent>
          </Card>
        );

      case 'media':
        return (
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
        );



      case 'demo':
        return <VisualImageManager />;

      case 'popup':
        return (
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
        );

      case 'calculator':
        return (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="w-5 h-5" />
                Service Calculator Management
              </CardTitle>
              <CardDescription>
                Manage service categories, pricing, and customer quote submissions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ServiceCalculatorManager />
            </CardContent>
          </Card>
        );

      case 'analytics':
        return (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Reviews</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Customer testimonials</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Contacts</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Contact form submissions</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Quick Quotes</CardTitle>
                <Calculator className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Quote requests</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Settings className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Admin accounts</p>
              </CardContent>
            </Card>
            <div className="col-span-full">
              <AnalyticsDashboard />
            </div>
          </div>
        );

      default:
        return (
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <h3 className="text-lg font-medium">Welcome to AramisTech Admin Dashboard</h3>
                <p className="text-gray-600 mt-2">Select a section from the sidebar to get started.</p>
              </div>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile Menu Overlay */}
      {!sidebarCollapsed && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarCollapsed(true)}
        />
      )}
      
      {/* Collapsible Sidebar */}
      <div className={`bg-white border-r border-gray-200 shadow-sm transition-all duration-300 ${
        sidebarCollapsed 
          ? 'w-16 lg:w-16' 
          : 'w-64 lg:w-64 fixed lg:relative z-50 lg:z-auto h-full lg:h-auto'
      } flex flex-col ${sidebarCollapsed ? '' : 'lg:translate-x-0'}`}>
        {/* Sidebar Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <h1 className="text-lg font-bold text-gray-900">AramisTech Admin</h1>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="p-2"
            >
              {sidebarCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation Menu */}
        <div className="flex-1 p-2">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={menuItems.map(item => item.id)} strategy={verticalListSortingStrategy}>
              {menuItems.map((item) => (
                <SortableMenuItem
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  icon={item.icon}
                  isActive={activeTab === item.id}
                  isCollapsed={sidebarCollapsed}
                  onClick={() => setActiveTab(item.id)}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        {/* Logout Button */}
        <div className="p-2 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={handleLogout}
            className={`w-full justify-start ${sidebarCollapsed ? 'px-2' : 'px-3'}`}
          >
            <LogOut className="w-4 h-4" />
            {!sidebarCollapsed && <span className="ml-2">Logout</span>}
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="px-4 lg:px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                {/* Mobile Menu Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                  className="lg:hidden p-2"
                >
                  <Menu className="w-5 h-5" />
                </Button>
                <h2 className="text-xl lg:text-2xl font-bold text-gray-900 truncate">
                  {menuItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
                </h2>
              </div>
              <span className="text-xs lg:text-sm text-gray-500 truncate ml-2">
                Welcome, {(user as any)?.username}
              </span>
            </div>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-6 overflow-auto">
          {renderContent()}
        </div>
      </div>
    </div>
  );
}