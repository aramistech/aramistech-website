import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ImagePicker from "@/components/image-picker";
import { Plus, Edit3, Trash2, Image as ImageIcon } from "lucide-react";

interface PageContent {
  id: number;
  page: string;
  section: string;
  title: string;
  content: string;
  imageUrl?: string;
  imageAlt?: string;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function PageContentManager() {
  const [editingContent, setEditingContent] = useState<PageContent | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    page: "",
    section: "",
    title: "",
    content: "",
    imageUrl: "",
    imageAlt: "",
    displayOrder: 1,
    isActive: true,
  });
  const { toast } = useToast();

  const { data: contentData, isLoading } = useQuery<{ success: boolean; content: PageContent[] }>({
    queryKey: ["/api/admin/page-content"],
  });

  const content = contentData?.content || [];

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/admin/page-content', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Page content created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/page-content"] });
      setIsCreating(false);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create page content",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...data }: any) => {
      const response = await apiRequest('PUT', `/api/admin/page-content/${id}`, data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Page content updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/page-content"] });
      setEditingContent(null);
      resetForm();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update page content",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await apiRequest('DELETE', `/api/admin/page-content/${id}`);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Page content deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/page-content"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete page content",
        variant: "destructive",
      });
    },
  });

  const resetForm = () => {
    setFormData({
      page: "",
      section: "",
      title: "",
      content: "",
      imageUrl: "",
      imageAlt: "",
      displayOrder: 1,
      isActive: true,
    });
  };

  const handleEdit = (item: PageContent) => {
    setEditingContent(item);
    setFormData({
      page: item.page,
      section: item.section,
      title: item.title,
      content: item.content,
      imageUrl: item.imageUrl || "",
      imageAlt: item.imageAlt || "",
      displayOrder: item.displayOrder,
      isActive: item.isActive,
    });
    setIsCreating(true);
  };

  const handleSubmit = () => {
    if (editingContent) {
      updateMutation.mutate({ id: editingContent.id, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (item: PageContent) => {
    if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
      deleteMutation.mutate(item.id);
    }
  };

  const handleImageSelect = (imageUrl: string, altText?: string) => {
    setFormData(prev => ({
      ...prev,
      imageUrl,
      imageAlt: altText || "",
    }));
  };

  const pages = ["home", "about", "services", "contact", "ai-development", "windows10-upgrade"];
  const sections = ["hero", "features", "testimonials", "cta", "content", "gallery"];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Page Content Manager</h2>
        <Button
          onClick={() => {
            setIsCreating(true);
            setEditingContent(null);
            resetForm();
          }}
          className="bg-aramis-orange hover:bg-orange-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Content
        </Button>
      </div>

      {isCreating && (
        <Card>
          <CardHeader>
            <CardTitle>{editingContent ? "Edit Content" : "Create New Content"}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="page">Page</Label>
                <Select value={formData.page} onValueChange={(value) => setFormData(prev => ({ ...prev, page: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map(page => (
                      <SelectItem key={page} value={page}>{page}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="section">Section</Label>
                <Select value={formData.section} onValueChange={(value) => setFormData(prev => ({ ...prev, section: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select section" />
                  </SelectTrigger>
                  <SelectContent>
                    {sections.map(section => (
                      <SelectItem key={section} value={section}>{section}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Content title"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Content text..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Image</Label>
              <div className="flex items-center gap-4">
                <ImagePicker
                  onSelect={handleImageSelect}
                  selectedImage={formData.imageUrl}
                  placeholder="Select image from media library"
                />
                {formData.imageUrl && (
                  <div className="flex items-center gap-2">
                    <img
                      src={formData.imageUrl}
                      alt="Selected"
                      className="w-16 h-16 object-cover rounded border"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFormData(prev => ({ ...prev, imageUrl: "", imageAlt: "" }))}
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {formData.imageUrl && (
              <div className="space-y-2">
                <Label htmlFor="imageAlt">Image Alt Text</Label>
                <Input
                  id="imageAlt"
                  value={formData.imageAlt}
                  onChange={(e) => setFormData(prev => ({ ...prev, imageAlt: e.target.value }))}
                  placeholder="Alt text for accessibility"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="displayOrder">Display Order</Label>
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) }))}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={formData.isActive ? "active" : "inactive"} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, isActive: value === "active" }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}>
                {createMutation.isPending || updateMutation.isPending ? "Saving..." : "Save"}
              </Button>
              <Button variant="outline" onClick={() => setIsCreating(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="text-center py-12">Loading page content...</div>
      ) : content.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No page content yet</p>
            <p className="text-gray-500">Create content blocks to manage images and text across your website</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {content.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">{item.page}</Badge>
                      <Badge variant="outline">{item.section}</Badge>
                      <Badge variant={item.isActive ? "default" : "secondary"}>
                        {item.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{item.content}</p>
                    {item.imageUrl && (
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <ImageIcon className="w-4 h-4" />
                        <span>Image attached</span>
                      </div>
                    )}
                  </div>
                  
                  {item.imageUrl && (
                    <img
                      src={item.imageUrl}
                      alt={item.imageAlt || item.title}
                      className="w-24 h-24 object-cover rounded ml-4"
                    />
                  )}
                  
                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit3 className="w-3 h-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDelete(item)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}