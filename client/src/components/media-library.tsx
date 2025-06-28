import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Upload, Trash2, Edit3, CloudDownload, Link, Plus, Search } from "lucide-react";

interface MediaFile {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  url: string;
  altText?: string;
  caption?: string;
  uploadedAt: string;
  updatedAt: string;
}

interface MediaLibraryProps {
  onSelectImage?: (imageUrl: string) => void;
  selectionMode?: boolean;
}

export default function MediaLibrary({ onSelectImage, selectionMode = false }: MediaLibraryProps) {
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [editAltText, setEditAltText] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: mediaData, isLoading } = useQuery<{ success: boolean; files: MediaFile[] }>({
    queryKey: ["/api/admin/media"],
  });

  const files = mediaData?.files || [];

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/admin/media/upload', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image uploaded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
    },
  });

  const urlImportMutation = useMutation({
    mutationFn: async (url: string) => {
      return await apiRequest('/api/admin/media/import-url', 'POST', { url });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image imported from URL successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      setImageUrl('');
      setIsUploadDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to import image from URL",
        variant: "destructive",
      });
    },
  });

  const websiteScanMutation = useMutation({
    mutationFn: async (url: string) => {
      return await apiRequest('/api/admin/media/scan-website', 'POST', { url });
    },
    onSuccess: (data) => {
      const count = data.importedCount || 0;
      toast({
        title: "Success",
        description: `Scanned website and imported ${count} image(s)`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      setImageUrl('');
      setIsUploadDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to scan website for images",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, altText, caption }: { id: number; altText: string; caption: string }) => {
      return await apiRequest(`/api/admin/media/${id}`, "PUT", { altText, caption });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image details updated",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      setEditingFile(null);
      setEditAltText("");
      setEditCaption("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update image details",
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest(`/api/admin/media/${id}`, "DELETE");
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x >= rect.right || y < rect.top || y >= rect.bottom) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (files.length > 0 && imageFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please drop only image files (JPG, PNG, GIF, WebP)",
        variant: "destructive",
      });
      return;
    }

    if (imageFiles.length > 0) {
      toast({
        title: "Success",
        description: `Uploading ${imageFiles.length} image(s)...`,
      });
      
      imageFiles.forEach(file => {
        uploadMutation.mutate(file);
      });
    }
  }, [toast, uploadMutation]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: `${file.name}: File size must be less than 10MB`,
          variant: "destructive",
        });
        continue;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: `${file.name}: Only image files are allowed`,
          variant: "destructive",
        });
        continue;
      }
      
      uploadMutation.mutate(file);
    }
  };

  const handleEdit = (file: MediaFile) => {
    setEditingFile(file);
    setEditAltText(file.altText || "");
    setEditCaption(file.caption || "");
  };

  const handleDelete = (file: MediaFile) => {
    if (confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      deleteMutation.mutate(file.id);
    }
  };

  const handleUpdate = () => {
    if (editingFile) {
      updateMutation.mutate({
        id: editingFile.id,
        altText: editAltText,
        caption: editCaption,
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">Loading media library...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Media Library</CardTitle>
        <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-aramis-orange hover:bg-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Add Images
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Add Images to Library</DialogTitle>
            </DialogHeader>
            
            <Tabs defaultValue="upload" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Files</TabsTrigger>
                <TabsTrigger value="url">Import from URL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4 mt-4">
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all duration-200 ${
                    isDragOver 
                      ? 'border-aramis-orange bg-orange-50 scale-[1.02]' 
                      : 'border-gray-300 hover:border-aramis-orange hover:bg-gray-50'
                  }`}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors ${isDragOver ? 'text-aramis-orange' : 'text-gray-400'}`} />
                  <p className="text-lg font-medium mb-2">
                    {isDragOver ? 'Drop images here!' : 'Drag & drop images'}
                  </p>
                  <p className="text-sm text-gray-500 mb-4">
                    or click to browse files
                  </p>
                  <p className="text-xs text-gray-400">
                    Supports JPG, PNG, GIF, WebP (max 10MB each)
                  </p>
                </div>
                
                {uploadMutation.isPending && (
                  <div className="text-center">
                    <div className="text-sm text-aramis-orange font-medium">Uploading image...</div>
                  </div>
                )}
              </TabsContent>
              
              <TabsContent value="url" className="space-y-4 mt-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="image-url">Image URL or Website URL</Label>
                    <Input
                      id="image-url"
                      placeholder="https://example.com/image.jpg or https://example.com"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                      disabled={urlImportMutation.isPending || websiteScanMutation.isPending}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      onClick={() => {
                        if (imageUrl.trim()) {
                          urlImportMutation.mutate(imageUrl.trim());
                        }
                      }}
                      disabled={!imageUrl.trim() || urlImportMutation.isPending || websiteScanMutation.isPending}
                      className="bg-aramis-orange hover:bg-orange-600 disabled:opacity-50"
                    >
                      <CloudDownload className="w-4 h-4 mr-2" />
                      {urlImportMutation.isPending ? "Importing..." : "Import Image"}
                    </Button>
                    
                    <Button 
                      onClick={() => {
                        if (imageUrl.trim()) {
                          websiteScanMutation.mutate(imageUrl.trim());
                        }
                      }}
                      disabled={!imageUrl.trim() || urlImportMutation.isPending || websiteScanMutation.isPending}
                      variant="outline"
                      className="border-aramis-orange text-aramis-orange hover:bg-orange-50 disabled:opacity-50"
                    >
                      <Search className="w-4 h-4 mr-2" />
                      {websiteScanMutation.isPending ? "Scanning..." : "Scan Website"}
                    </Button>
                  </div>

                  {(urlImportMutation.isPending || websiteScanMutation.isPending) && (
                    <div className="text-center">
                      <div className="text-sm text-aramis-orange font-medium">
                        {urlImportMutation.isPending ? "Downloading image from URL..." : "Scanning website for images..."}
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="flex items-start gap-2">
                    <Link className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800">
                      <p className="font-medium mb-1">Import Options</p>
                      <p className="mb-2"><strong>Import Image:</strong> Direct image URL (JPG, PNG, GIF, WebP)</p>
                      <p><strong>Scan Website:</strong> Find and import all images from any webpage</p>
                      <p className="mt-1 text-xs">Examples: https://example.com/image.jpg or https://example.com</p>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </CardHeader>
      
      <CardContent>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
        
        {files.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No images in library</p>
            <p className="text-sm">Upload your first image to get started</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <div key={file.id} className="group relative">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={file.url}
                    alt={file.altText || file.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    {selectionMode && onSelectImage ? (
                      <Button
                        size="sm"
                        onClick={() => onSelectImage(file.url)}
                        className="bg-aramis-orange hover:bg-orange-600"
                      >
                        Select
                      </Button>
                    ) : (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleEdit(file)}
                        >
                          <Edit3 className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDelete(file)}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="mt-2">
                  <p className="text-xs text-gray-600 truncate">{file.originalName}</p>
                  <p className="text-xs text-gray-400">
                    {(file.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {editingFile && (
          <Dialog open={!!editingFile} onOpenChange={() => setEditingFile(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Image Details</DialogTitle>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <img
                    src={editingFile.url}
                    alt={editingFile.originalName}
                    className="w-full max-h-64 object-cover rounded-lg"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="alt-text">Alt Text</Label>
                  <Input
                    id="alt-text"
                    value={editAltText}
                    onChange={(e) => setEditAltText(e.target.value)}
                    placeholder="Describe the image for accessibility"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="caption">Caption</Label>
                  <Input
                    id="caption"
                    value={editCaption}
                    onChange={(e) => setEditCaption(e.target.value)}
                    placeholder="Optional caption"
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleUpdate} disabled={updateMutation.isPending}>
                    {updateMutation.isPending ? "Updating..." : "Update"}
                  </Button>
                  <Button variant="outline" onClick={() => setEditingFile(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </CardContent>
    </Card>
  );
}