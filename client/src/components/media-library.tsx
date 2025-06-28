import { useState, useRef, useCallback } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Upload, Image as ImageIcon, Trash2, Edit, Check, X, Copy, Link, CloudDownload } from "lucide-react";

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

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!dropZoneRef.current?.contains(e.relatedTarget as Node)) {
      setIsDragOver(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length === 0) {
      toast({
        title: "Error",
        description: "Please drop only image files",
        variant: "destructive",
      });
      return;
    }

    imageFiles.forEach(file => {
      uploadMutation.mutate(file);
    });
  }, []);

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
    },
    onError: (error) => {
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
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete image",
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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "File size must be less than 10MB",
          variant: "destructive",
        });
        return;
      }
      
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Only image files are allowed",
          variant: "destructive",
        });
        return;
      }
      
      uploadMutation.mutate(file);
    }
  };

  const handleEdit = (file: MediaFile) => {
    setEditingFile(file);
    setEditAltText(file.altText || "");
    setEditCaption(file.caption || "");
  };

  const handleSaveEdit = () => {
    if (editingFile) {
      updateMutation.mutate({
        id: editingFile.id,
        altText: editAltText,
        caption: editCaption,
      });
    }
  };

  const handleCancelEdit = () => {
    setEditingFile(null);
    setEditAltText("");
    setEditCaption("");
  };

  const handleDelete = (file: MediaFile) => {
    if (confirm(`Are you sure you want to delete "${file.originalName}"?`)) {
      deleteMutation.mutate(file.id);
    }
  };

  const handleCopyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: "Copied",
      description: "Image URL copied to clipboard",
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (isLoading) {
    return <div className="flex justify-center p-8">Loading media library...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Media Library</h3>
          <p className="text-sm text-muted-foreground">
            Upload and manage images for your website
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Dialog open={isUploadDialogOpen} onOpenChange={setIsUploadDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2 bg-aramis-orange hover:bg-orange-600">
                <Upload className="w-4 h-4" />
                Add Images
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add Images to Media Library</DialogTitle>
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
                    className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                      isDragOver 
                        ? 'border-aramis-orange bg-orange-50' 
                        : 'border-gray-300 hover:border-aramis-orange hover:bg-gray-50'
                    }`}
                  >
                    <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragOver ? 'text-aramis-orange' : 'text-gray-400'}`} />
                    <p className="text-lg font-medium mb-2">
                      {isDragOver ? 'Drop images here' : 'Drag & drop images'}
                    </p>
                    <p className="text-sm text-gray-500 mb-4">
                      or click to browse files
                    </p>
                    <p className="text-xs text-gray-400">
                      Supports JPG, PNG, GIF, WebP
                    </p>
                  </div>
                  
                  {uploadMutation.isPending && (
                    <div className="text-center">
                      <div className="text-sm text-gray-600">Uploading...</div>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="url" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <Label htmlFor="image-url">Image URL</Label>
                    <Input
                      id="image-url"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <Button 
                      onClick={() => urlImportMutation.mutate(imageUrl)}
                      disabled={!imageUrl || urlImportMutation.isPending}
                      className="w-full bg-aramis-orange hover:bg-orange-600"
                    >
                      <CloudDownload className="w-4 h-4 mr-2" />
                      {urlImportMutation.isPending ? "Importing..." : "Import Image"}
                    </Button>
                  </div>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-start gap-2">
                      <Link className="w-4 h-4 text-blue-600 mt-0.5" />
                      <div className="text-sm text-blue-800">
                        <p className="font-medium mb-1">Import from URL</p>
                        <p>Paste any public image URL to download and store it in your media library.</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {files.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">No images uploaded yet</p>
            <p className="text-sm text-muted-foreground mb-4">
              Upload your first image to get started
            </p>
            <Button onClick={() => fileInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Upload Image
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file) => (
            <Card key={file.id} className="overflow-hidden">
              <div className="relative group">
                <img
                  src={file.url}
                  alt={file.altText || file.originalName}
                  className="w-full h-48 object-cover"
                />
                
                {/* Overlay with actions */}
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {selectionMode && onSelectImage ? (
                    <Button
                      size="sm"
                      onClick={() => onSelectImage(file.url)}
                      className="bg-primary hover:bg-primary/90"
                    >
                      <Check className="w-4 h-4 mr-1" />
                      Select
                    </Button>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => handleCopyUrl(file.url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button size="sm" variant="secondary">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent>
                          <DialogHeader>
                            <DialogTitle>Edit Image Details</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div>
                              <img
                                src={file.url}
                                alt={file.altText || file.originalName}
                                className="w-full h-32 object-cover rounded"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Alt Text</label>
                              <Input
                                value={editingFile?.id === file.id ? editAltText : file.altText || ""}
                                onChange={(e) => {
                                  if (editingFile?.id === file.id) {
                                    setEditAltText(e.target.value);
                                  } else {
                                    setEditingFile(file);
                                    setEditAltText(e.target.value);
                                    setEditCaption(file.caption || "");
                                  }
                                }}
                                placeholder="Describe the image for accessibility"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Caption</label>
                              <Textarea
                                value={editingFile?.id === file.id ? editCaption : file.caption || ""}
                                onChange={(e) => {
                                  if (editingFile?.id === file.id) {
                                    setEditCaption(e.target.value);
                                  } else {
                                    setEditingFile(file);
                                    setEditCaption(e.target.value);
                                    setEditAltText(file.altText || "");
                                  }
                                }}
                                placeholder="Optional caption for the image"
                              />
                            </div>
                            <div className="flex justify-end gap-2">
                              <Button
                                variant="outline"
                                onClick={handleCancelEdit}
                              >
                                Cancel
                              </Button>
                              <Button
                                onClick={handleSaveEdit}
                                disabled={updateMutation.isPending}
                              >
                                {updateMutation.isPending ? "Saving..." : "Save"}
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(file)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
                </div>
              </div>
              
              <CardContent className="p-3">
                <p className="text-sm font-medium truncate">{file.originalName}</p>
                <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                  <span>{formatFileSize(file.fileSize)}</span>
                  <Badge variant="secondary" className="text-xs">
                    {file.mimeType.split('/')[1].toUpperCase()}
                  </Badge>
                </div>
                {file.altText && (
                  <p className="text-xs text-muted-foreground mt-1 truncate">
                    {file.altText}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}