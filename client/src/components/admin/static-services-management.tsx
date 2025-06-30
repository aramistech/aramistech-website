import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Trash2, Edit, Plus, GripVertical, Save, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import ColorPickerWithPalette from '@/components/color-picker-with-palette';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface StaticService {
  id: number;
  name: string;
  description: string;
  price: string;
  setupFee?: string;
  icon: string;
  buttonText: string;
  buttonUrl: string;
  buttonColor: string;
  isActive: boolean;
  orderIndex: number;
}

const iconOptions = [
  // Infrastructure & Servers
  { value: 'server', label: '🖥️ Server' },
  { value: 'database', label: '🗄️ Database' },
  { value: 'hardDrive', label: '💾 Hard Drive' },
  { value: 'cpu', label: '🧠 CPU/Processor' },
  
  // Security & Protection
  { value: 'shield', label: '🛡️ Security' },
  { value: 'lock', label: '🔒 Lock/Privacy' },
  
  // Networking & Connectivity  
  { value: 'network', label: '🌐 Network' },
  { value: 'globe', label: '🌍 Global/Internet' },
  { value: 'wifi', label: '📶 WiFi' },
  { value: 'router', label: '📡 Router' },
  
  // Cloud Services
  { value: 'cloud', label: '☁️ Cloud' },
  { value: 'cloudDownload', label: '☁️⬇️ Cloud Download' },
  { value: 'cloudUpload', label: '☁️⬆️ Cloud Upload' },
  
  // Support & Maintenance
  { value: 'support', label: '🎧 Support' },
  { value: 'maintenance', label: '🔧 Maintenance' },
  { value: 'settings', label: '⚙️ Settings' },
  
  // Business & Analytics
  { value: 'consulting', label: '👥 Consulting' },
  { value: 'analytics', label: '📊 Analytics' },
  { value: 'activity', label: '📈 Activity' },
  { value: 'gauge', label: '⏱️ Performance' },
  { value: 'trendingUp', label: '📈 Growth' },
  { value: 'building', label: '🏢 Business' },
  
  // Development & Code
  { value: 'code', label: '💻 Development' },
  
  // Devices & Hardware
  { value: 'laptop', label: '💻 Laptop' },
  { value: 'monitor', label: '🖥️ Monitor' },
  { value: 'smartphone', label: '📱 Mobile' },
  { value: 'printer', label: '🖨️ Printer' },
  
  // Data & Files
  { value: 'backup', label: '💾 Backup' },
  { value: 'folder', label: '📁 Files' },
  { value: 'fileText', label: '📄 Documents' },
  { value: 'scan', label: '🔍 Scan' },
  
  // Monitoring & Alerts
  { value: 'bell', label: '🔔 Notifications' },
  { value: 'alertTriangle', label: '⚠️ Alerts' },
  { value: 'checkCircle', label: '✅ Success' },
  { value: 'searchTool', label: '🔍 Search' },
  
  // Power & Performance
  { value: 'zap', label: '⚡ Power/Speed' },
  
  // Location & Office
  { value: 'home', label: '🏠 Home Office' },
  { value: 'mapPin', label: '📍 Location' },
  
  // Email & Communications
  { value: 'mail', label: '📧 Email' },
  { value: 'mailOpen', label: '📬 Email Open' },
  { value: 'inbox', label: '📥 Inbox' },
  { value: 'send', label: '📤 Send Email' },
  { value: 'messageSquare', label: '💬 Messages' },
  { value: 'phone', label: '📞 Phone' },
  { value: 'phoneCall', label: '☎️ Phone Call' },
  
  // Internet & Web
  { value: 'globe', label: '🌍 Internet' },
  { value: 'wifi', label: '📶 WiFi' },
  { value: 'network', label: '🌐 Network' },
  { value: 'link', label: '🔗 Website Link' },
  { value: 'linkIcon', label: '🔗 Link' },
  { value: 'world', label: '🌎 Web Services' },
  { value: 'webIcon', label: '🌐 Web' },
  { value: 'analytics', label: '📊 Analytics' },
  { value: 'maintenance', label: '🔧 Maintenance' },
  { value: 'consulting', label: '👥 Consulting' },
];

function SortableServiceItem({ service, onEdit, onDelete }: {
  service: StaticService;
  onEdit: (service: StaticService) => void;
  onDelete: (id: number) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: service.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-4 bg-white border rounded-lg shadow-sm"
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab text-gray-400 hover:text-gray-600"
      >
        <GripVertical size={20} />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-lg">
            {iconOptions.find(opt => opt.value === service.icon)?.label || '📄'}
          </span>
          <h3 className="font-semibold text-gray-900 truncate">{service.name}</h3>
          {!service.isActive && (
            <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
              Inactive
            </span>
          )}
        </div>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{service.description}</p>
        <div className="flex items-center gap-4 text-sm">
          <span className="font-medium text-green-600">{service.price}</span>
          {service.setupFee && (
            <span className="text-gray-500">Setup: {service.setupFee}</span>
          )}
          <span className="text-blue-600">{service.buttonText}</span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(service)}
        >
          <Edit size={16} />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(service.id)}
          className="text-red-600 hover:text-red-700"
        >
          <Trash2 size={16} />
        </Button>
      </div>
    </div>
  );
}

function ServiceForm({ service, onSave, onCancel }: {
  service?: StaticService;
  onSave: (serviceData: any) => void;
  onCancel: () => void;
}) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    price: service?.price || '',
    setupFee: service?.setupFee || '',
    icon: service?.icon || 'server',
    buttonText: service?.buttonText || 'Order Service',
    buttonUrl: service?.buttonUrl || '',
    buttonColor: service?.buttonColor || '#2563eb',
    isActive: service?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Service Name *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="icon">Icon</Label>
          <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {iconOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <Label htmlFor="description">Description *</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price">Price *</Label>
          <Input
            id="price"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="$99/month"
            required
          />
        </div>
        
        <div>
          <Label htmlFor="setupFee">Setup Fee (optional)</Label>
          <Input
            id="setupFee"
            value={formData.setupFee}
            onChange={(e) => setFormData({ ...formData, setupFee: e.target.value })}
            placeholder="$50 one-time"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="buttonText">Button Text *</Label>
          <Input
            id="buttonText"
            value={formData.buttonText}
            onChange={(e) => setFormData({ ...formData, buttonText: e.target.value })}
            required
          />
        </div>
        
        <div>
          <Label htmlFor="buttonUrl">Button URL *</Label>
          <Input
            id="buttonUrl"
            value={formData.buttonUrl}
            onChange={(e) => setFormData({ ...formData, buttonUrl: e.target.value })}
            placeholder="https://billing.aramistech.com/cart.php?a=add&pid=1"
            required
          />
        </div>
      </div>

      <ColorPickerWithPalette
        id="buttonColor"
        label="Button Color"
        value={formData.buttonColor}
        onChange={(color) => setFormData({ ...formData, buttonColor: color })}
        className="col-span-full"
      />

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
        />
        <Label htmlFor="isActive">Active (visible on website)</Label>
      </div>

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X size={16} className="mr-2" />
          Cancel
        </Button>
        <Button type="submit">
          <Save size={16} className="mr-2" />
          {service ? 'Update Service' : 'Create Service'}
        </Button>
      </div>
    </form>
  );
}

export default function StaticServicesManagement() {
  const [editingService, setEditingService] = useState<StaticService | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Fetch services
  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['/api/admin/static-services'],
  });

  const services = (servicesData as any)?.services || [];

  // Create service mutation
  const createServiceMutation = useMutation({
    mutationFn: (serviceData: any) => apiRequest('/api/admin/static-services', 'POST', serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/static-services'] });
      setShowCreateForm(false);
      toast({ title: 'Service created successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to create service', variant: 'destructive' });
    },
  });

  // Update service mutation
  const updateServiceMutation = useMutation({
    mutationFn: ({ id, ...serviceData }: any) => 
      apiRequest(`/api/admin/static-services/${id}`, 'PUT', serviceData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/static-services'] });
      setEditingService(null);
      toast({ title: 'Service updated successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to update service', variant: 'destructive' });
    },
  });

  // Delete service mutation
  const deleteServiceMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/static-services/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/static-services'] });
      toast({ title: 'Service deleted successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to delete service', variant: 'destructive' });
    },
  });

  // Reorder services mutation
  const reorderServicesMutation = useMutation({
    mutationFn: (serviceIds: number[]) => 
      apiRequest('/api/admin/static-services/reorder', 'POST', { serviceIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/static-services'] });
      toast({ title: 'Services reordered successfully' });
    },
    onError: () => {
      toast({ title: 'Failed to reorder services', variant: 'destructive' });
    },
  });

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over.id) {
      const oldIndex = services.findIndex((service: any) => service.id === active.id);
      const newIndex = services.findIndex((service: any) => service.id === over.id);
      
      const newOrder = arrayMove(services, oldIndex, newIndex);
      const serviceIds = newOrder.map((service: any) => service.id);
      
      reorderServicesMutation.mutate(serviceIds);
    }
  };

  const handleCreateService = (serviceData: any) => {
    createServiceMutation.mutate(serviceData);
  };

  const handleUpdateService = (serviceData: any) => {
    if (editingService) {
      updateServiceMutation.mutate({ id: editingService.id, ...serviceData });
    }
  };

  const handleDeleteService = (id: number) => {
    if (confirm('Are you sure you want to delete this service?')) {
      deleteServiceMutation.mutate(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading services...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Static Services Management</h2>
          <p className="text-gray-600">Manage your website's service offerings</p>
        </div>
        
        <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
          <DialogTrigger asChild>
            <Button>
              <Plus size={16} className="mr-2" />
              Add New Service
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
            </DialogHeader>
            <ServiceForm
              onSave={handleCreateService}
              onCancel={() => setShowCreateForm(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      {services.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-gray-500 mb-4">No services configured yet</div>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus size={16} className="mr-2" />
              Create Your First Service
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="text-sm text-gray-600">
            Drag and drop services to reorder them. Changes are saved automatically.
          </div>
          
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={services.map((s: StaticService) => s.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-3">
                {services.map((service: StaticService) => (
                  <SortableServiceItem
                    key={service.id}
                    service={service}
                    onEdit={setEditingService}
                    onDelete={handleDeleteService}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Edit Service Dialog */}
      <Dialog open={!!editingService} onOpenChange={() => setEditingService(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
          </DialogHeader>
          {editingService && (
            <ServiceForm
              service={editingService}
              onSave={handleUpdateService}
              onCancel={() => setEditingService(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}