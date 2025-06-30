import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient, apiRequest } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Trash2, Edit, Plus, ExternalLink, Link as LinkIcon, Globe, Users, Building, GripVertical } from 'lucide-react';
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
} from '@dnd-kit/sortable';
import {
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface FooterLink {
  id: number;
  section: string;
  label: string;
  url: string;
  isActive: boolean;
  orderIndex: number;
  target: string;
  createdAt?: string;
  updatedAt?: string;
}

interface FooterLinkFormData {
  section: string;
  label: string;
  url: string;
  isActive: boolean;
  orderIndex: number;
  target: string;
}

// Sortable Footer Link Item Component
function SortableFooterLink({ link, onEdit, onDelete }: { 
  link: FooterLink; 
  onEdit: (link: FooterLink) => void; 
  onDelete: (id: number) => void; 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: link.id.toString() });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const getSectionIcon = (section: string) => {
    switch (section.toLowerCase()) {
      case 'services': return <Building className="w-4 h-4" />;
      case 'support': return <LinkIcon className="w-4 h-4" />;
      case 'company': return <Users className="w-4 h-4" />;
      case 'resources': return <Globe className="w-4 h-4" />;
      default: return <LinkIcon className="w-4 h-4" />;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center justify-between p-4 bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center space-x-3">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab hover:cursor-grabbing p-1 hover:bg-gray-100 rounded"
        >
          <GripVertical className="w-4 h-4 text-gray-400" />
        </div>
        <div className="flex items-center space-x-2">
          {getSectionIcon(link.section)}
          <div>
            <p className="font-medium">{link.label}</p>
            <p className="text-sm text-gray-500">{link.url}</p>
          </div>
        </div>
        <Badge variant={link.isActive ? "default" : "secondary"}>
          {link.section}
        </Badge>
        <Badge variant={link.isActive ? "default" : "outline"}>
          {link.isActive ? 'Active' : 'Inactive'}
        </Badge>
      </div>
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onEdit(link)}
        >
          <Edit className="w-4 h-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onDelete(link.id)}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}

const sectionOptions = [
  { value: 'services', label: 'Services', icon: Globe },
  { value: 'support', label: 'Support', icon: Users },
  { value: 'company', label: 'Company', icon: Building },
  { value: 'resources', label: 'Resources', icon: LinkIcon },
];

export default function FooterManager() {
  const [editingLink, setEditingLink] = useState<FooterLink | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const { toast } = useToast();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const { data: linksData, isLoading } = useQuery({
    queryKey: ['/api/admin/footer-links'],
  });

  const links = (linksData as any)?.links || [];

  const createMutation = useMutation({
    mutationFn: (data: FooterLinkFormData) => apiRequest('/api/admin/footer-links', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/footer-links'] });
      queryClient.invalidateQueries({ queryKey: ['/api/footer-links'] });
      setIsCreateDialogOpen(false);
      toast({ title: 'Footer link created successfully' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: FooterLinkFormData }) => 
      apiRequest(`/api/admin/footer-links/${id}`, 'PUT', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/footer-links'] });
      queryClient.invalidateQueries({ queryKey: ['/api/footer-links'] });
      setEditingLink(null);
      toast({ title: 'Footer link updated successfully' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/admin/footer-links/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/footer-links'] });
      queryClient.invalidateQueries({ queryKey: ['/api/footer-links'] });
      toast({ title: 'Footer link deleted successfully' });
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (reorderedLinks: FooterLink[]) => 
      apiRequest('/api/admin/footer-links/reorder', 'PUT', { links: reorderedLinks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/footer-links'] });
      queryClient.invalidateQueries({ queryKey: ['/api/footer-links'] });
      toast({ title: 'Footer links reordered successfully' });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex((link: FooterLink) => link.id.toString() === active.id);
      const newIndex = links.findIndex((link: FooterLink) => link.id.toString() === over.id);

      const reorderedLinks = arrayMove(links, oldIndex, newIndex).map((link: FooterLink, index: number) => ({
        ...link,
        orderIndex: index + 1
      }));

      reorderMutation.mutate(reorderedLinks);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    const data: FooterLinkFormData = {
      section: formData.get('section') as string,
      label: formData.get('label') as string,
      url: formData.get('url') as string,
      isActive: formData.get('isActive') === 'on',
      orderIndex: parseInt(formData.get('orderIndex') as string) || 0,
      target: formData.get('target') as string,
    };

    if (editingLink) {
      updateMutation.mutate({ id: editingLink.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const groupedLinks = links.reduce((acc: Record<string, FooterLink[]>, link: FooterLink) => {
    if (!acc[link.section]) {
      acc[link.section] = [];
    }
    acc[link.section].push(link);
    return acc;
  }, {});

  const getSectionIcon = (section: string) => {
    const option = sectionOptions.find(opt => opt.value === section);
    return option ? option.icon : LinkIcon;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Footer Links Management</h2>
          <p className="text-gray-600">Manage website footer navigation links by section</p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Footer Link
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Footer Link</DialogTitle>
            </DialogHeader>
            <FooterLinkForm onSubmit={handleSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {Object.keys(groupedLinks).length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <LinkIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Footer Links Found</h3>
            <p className="text-gray-600 mb-4">Create your first footer link to get started</p>
            <Button onClick={() => setIsCreateDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Footer Link
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {Object.entries(groupedLinks).map(([section, sectionLinks]) => {
            const SectionIcon = getSectionIcon(section);
            return (
              <Card key={section}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 capitalize">
                    <SectionIcon className="w-5 h-5 text-blue-600" />
                    {section} Links
                    <Badge variant="secondary" className="ml-2">
                      {sectionLinks.length}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={sectionLinks.map((link: FooterLink) => link.id.toString())}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-3">
                        {sectionLinks
                          .sort((a: FooterLink, b: FooterLink) => a.orderIndex - b.orderIndex)
                          .map((link: FooterLink) => (
                            <SortableFooterLink
                              key={link.id}
                              link={link}
                              onEdit={setEditingLink}
                              onDelete={(id) => deleteMutation.mutate(id)}
                            />
                          ))}
                      </div>
                    </SortableContext>
                  </DndContext>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {editingLink && (
        <Dialog open={!!editingLink} onOpenChange={() => setEditingLink(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Edit Footer Link</DialogTitle>
            </DialogHeader>
            <FooterLinkForm 
              onSubmit={handleSubmit} 
              defaultValues={editingLink}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

function FooterLinkForm({ 
  onSubmit, 
  defaultValues 
}: { 
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  defaultValues?: FooterLink;
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <Label htmlFor="section">Section</Label>
        <Select name="section" defaultValue={defaultValues?.section || 'services'}>
          <SelectTrigger>
            <SelectValue placeholder="Select section" />
          </SelectTrigger>
          <SelectContent>
            {sectionOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="label">Link Label</Label>
        <Input
          id="label"
          name="label"
          defaultValue={defaultValues?.label}
          placeholder="e.g., Maintenance Services"
          required
        />
      </div>

      <div>
        <Label htmlFor="url">URL</Label>
        <Input
          id="url"
          name="url"
          type="url"
          defaultValue={defaultValues?.url}
          placeholder="e.g., /services or https://example.com"
          required
        />
      </div>

      <div>
        <Label htmlFor="target">Link Target</Label>
        <Select name="target" defaultValue={defaultValues?.target || '_self'}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="_self">Same Window</SelectItem>
            <SelectItem value="_blank">New Window</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="orderIndex">Order Index</Label>
        <Input
          id="orderIndex"
          name="orderIndex"
          type="number"
          defaultValue={defaultValues?.orderIndex || 0}
          placeholder="0"
          min="0"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isActive"
          name="isActive"
          defaultChecked={defaultValues?.isActive !== false}
        />
        <Label htmlFor="isActive">Active</Label>
      </div>

      <div className="flex gap-2 pt-4">
        <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700">
          {defaultValues ? 'Update' : 'Create'} Link
        </Button>
      </div>
    </form>
  );
}