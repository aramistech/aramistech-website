import { useState, useRef, useCallback, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Upload, Trash2, Edit3, CloudDownload, Link, Plus, Search, Filter, Grid, List, Copy, Download, Eye, Calendar, FileImage, Folder, Tags } from "lucide-react";
import type { MediaFile } from "@shared/schema";

interface MediaLibraryProps {
  onSelectImage?: (imageUrl: string) => void;
  selectionMode?: boolean;
}

export default function MediaLibrary({ onSelectImage, selectionMode = false }: MediaLibraryProps) {
  const [editingFile, setEditingFile] = useState<MediaFile | null>(null);
  const [editAltText, setEditAltText] = useState("");
  const [editCaption, setEditCaption] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editTags, setEditTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isDragOver, setIsDragOver] = useState(false);
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedFiles, setSelectedFiles] = useState<Set<number>>(new Set());
  const [filterType, setFilterType] = useState<"all" | "images" | "docs">("all");
  const [sortBy, setSortBy] = useState<"date" | "name" | "size">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const { data: mediaData, isLoading } = useQuery<{ success: boolean; files: MediaFile[] }>({
    queryKey: ["/api/admin/media"],
  });

  const allFiles = mediaData?.files || [];

  // WordPress-style filtering and search
  const filteredFiles = useMemo(() => {
    let filtered = allFiles;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(file => 
        file.originalName.toLowerCase().includes(query) ||
        file.altText?.toLowerCase().includes(query) ||
        file.caption?.toLowerCase().includes(query) ||
        file.description?.toLowerCase().includes(query) ||
        file.tags?.some(tag => tag.toLowerCase().includes(query))
      );
    }

    // Type filter
    if (filterType !== "all") {
      if (filterType === "images") {
        filtered = filtered.filter(file => file.mimeType.startsWith('image/'));
      } else if (filterType === "docs") {
        filtered = filtered.filter(file => !file.mimeType.startsWith('image/'));
      }
    }

    // Sort
    filtered.sort((a, b) => {
      let comparison = 0;
      switch (sortBy) {
        case "name":
          comparison = a.originalName.localeCompare(b.originalName);
          break;
        case "size":
          comparison = a.fileSize - b.fileSize;
          break;
        case "date":
        default:
          const dateA = a.uploadedAt ? new Date(a.uploadedAt).getTime() : 0;
          const dateB = b.uploadedAt ? new Date(b.uploadedAt).getTime() : 0;
          comparison = dateA - dateB;
          break;
      }
      return sortOrder === "desc" ? -comparison : comparison;
    });

    return filtered;
  }, [allFiles, searchQuery, filterType, sortBy, sortOrder]);

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
      const response = await apiRequest('/api/admin/media/import-url', 'POST', { url });
      return await response.json();
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
      const response = await apiRequest('/api/admin/media/scan-website', 'POST', { url });
      return await response.json();
    },
    onSuccess: (data) => {
      const count = data.importedCount || 0;
      const totalFound = data.totalFound || 0;
      toast({
        title: "Success",
        description: `Scanned website and imported ${count} of ${totalFound} image(s) found`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      setImageUrl('');
      setIsUploadDialogOpen(false);
    },
    onError: (error) => {
      console.error('Website scan error:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to scan website for images",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, altText, caption, description, tags }: { 
      id: number; 
      altText: string; 
      caption: string;
      description: string;
      tags: string;
    }) => {
      const tagsArray = tags.split(',').map(t => t.trim()).filter(t => t);
      return await apiRequest(`/api/admin/media/${id}`, "PUT", { 
        altText, 
        caption, 
        description,
        tags: tagsArray 
      });
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
      setEditDescription("");
      setEditTags("");
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update image details",
        variant: "destructive",
      });
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: number[]) => {
      const promises = ids.map(id => apiRequest(`/api/admin/media/${id}`, "DELETE"));
      return Promise.all(promises);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: `Deleted ${selectedFiles.size} files`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
      setSelectedFiles(new Set());
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete files",
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

  const cleanupMutation = useMutation({
    mutationFn: async () => {
      return await apiRequest("/api/admin/media/cleanup", "POST");
    },
    onSuccess: (data: any) => {
      toast({
        title: "Cleanup Complete",
        description: `Removed ${data.missingFiles} missing files from database`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/media"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to cleanup missing files",
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
    setEditDescription(file.description || "");
    setEditTags(file.tags?.join(', ') || "");
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
        description: editDescription,
        tags: editTags,
      });
    }
  };

  const handleBulkDelete = () => {
    if (selectedFiles.size > 0 && confirm(`Delete ${selectedFiles.size} selected files?`)) {
      bulkDeleteMutation.mutate(Array.from(selectedFiles));
    }
  };

  const handleSelectFile = (fileId: number) => {
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedFiles.size === filteredFiles.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(filteredFiles.map(f => f.id)));
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied!",
        description: message,
      });
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
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
      <CardHeader>
        <div className="flex flex-row items-center justify-between mb-6">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <FileImage className="w-6 h-6 text-aramis-orange" />
              Media Library
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Upload and manage images for your website content
            </p>
          </div>
          <div className="flex gap-2">
            {selectedFiles.size > 0 && (
              <Button
                onClick={handleBulkDelete}
                disabled={bulkDeleteMutation.isPending}
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete {selectedFiles.size}
              </Button>
            )}
            <Button
              onClick={() => cleanupMutation.mutate()}
              disabled={cleanupMutation.isPending}
              variant="outline"
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              {cleanupMutation.isPending ? "Cleaning..." : "Cleanup Missing"}
            </Button>
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
          </div>
        </div>
        

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
        
        {/* WordPress-style toolbar */}
        <div className="mb-6 space-y-4">
          {/* Search and filters */}
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={filterType} onValueChange={(value) => setFilterType(value as any)}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All files</SelectItem>
                  <SelectItem value="images">Images</SelectItem>
                  <SelectItem value="docs">Documents</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
                const [sort, order] = value.split('-');
                setSortBy(sort as any);
                setSortOrder(order as any);
              }}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Newest first</SelectItem>
                  <SelectItem value="date-asc">Oldest first</SelectItem>
                  <SelectItem value="name-asc">Name A-Z</SelectItem>
                  <SelectItem value="name-desc">Name Z-A</SelectItem>
                  <SelectItem value="size-desc">Largest first</SelectItem>
                  <SelectItem value="size-asc">Smallest first</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
                className="px-3"
              >
                {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
            </div>
          </div>

          {/* Bulk actions */}
          {filteredFiles.length > 0 && (
            <div className="flex items-center gap-4 py-3 px-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={selectedFiles.size === filteredFiles.length && filteredFiles.length > 0}
                  onCheckedChange={handleSelectAll}
                />
                <span className="text-sm font-medium">
                  {selectedFiles.size > 0 ? `${selectedFiles.size} selected` : "Select all"}
                </span>
              </div>
              {selectedFiles.size > 0 && (
                <div className="flex gap-2 ml-auto">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedFiles(new Set())}
                  >
                    Clear
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        {filteredFiles.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Upload className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">
              {searchQuery ? `No images match "${searchQuery}"` : "No images in library"}
            </p>
            <p className="text-sm">
              {searchQuery ? "Try a different search term" : "Upload your first image to get started"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {filteredFiles.map((file) => (
              <div key={file.id} className="group relative">
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                  <img
                    src={`/api/media/${file.id}/file`}
                    alt={file.altText || file.originalName}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                </div>
                
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity duration-200 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="flex gap-2">
                    {selectionMode && onSelectImage ? (
                      <Button
                        size="sm"
                        onClick={() => onSelectImage(`/api/media/${file.id}/file`)}
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
        ) : (
          <div className="space-y-4">
            {filteredFiles.map((file) => (
              <div key={file.id} className="flex items-center gap-4 p-4 bg-white border rounded-lg">
                <div className="w-16 h-16 rounded overflow-hidden bg-gray-100 flex-shrink-0">
                  <img
                    src={`/api/media/${file.id}/file`}
                    alt={file.altText || file.originalName}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{file.originalName}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                    <span>{formatFileSize(file.fileSize)}</span>
                    <span>{formatDate(file.uploadedAt)}</span>
                    {file.tags && file.tags.length > 0 && (
                      <div className="flex gap-1">
                        {file.tags.slice(0, 3).map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyToClipboard(`/api/media/${file.id}/file`, "Image URL copied!")}
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  {!selectionMode && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleEdit(file)}
                      >
                        <Edit3 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(file)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </>
                  )}
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
                    src={`/api/media/${editingFile.id}/file`}
                    alt={editingFile.originalName}
                    className="w-full max-h-64 object-cover rounded-lg"
                    onError={(e) => {
                      console.error('Image failed to load:', editingFile.originalName);
                    }}
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
                    placeholder="Image caption"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="Detailed description"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (comma separated)</Label>
                  <Input
                    id="tags"
                    value={editTags}
                    onChange={(e) => setEditTags(e.target.value)}
                    placeholder="tag1, tag2, tag3"
                  />
                </div>

                <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium text-sm">File Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">File size:</span>
                      <span className="ml-2">{formatFileSize(editingFile.fileSize)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Uploaded:</span>
                      <span className="ml-2">{formatDate(editingFile.uploadedAt)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Type:</span>
                      <span className="ml-2">{editingFile.mimeType}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Backed up:</span>
                      <span className="ml-2">{editingFile.isBackedUp ? "✅ Yes" : "⏳ Processing"}</span>
                    </div>
                  </div>
                  <div className="mt-3">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => copyToClipboard(`/api/media/${editingFile.id}/file`, "Image URL copied!")}
                      className="mr-2"
                    >
                      <Copy className="w-4 h-4 mr-2" />
                      Copy URL
                    </Button>
                    {editingFile.s3Url && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(editingFile.s3Url!, "S3 URL copied!")}
                      >
                        <CloudDownload className="w-4 h-4 mr-2" />
                        Copy S3 URL
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingFile(null)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleUpdate}
                    disabled={updateMutation.isPending}
                    className="bg-aramis-orange hover:bg-orange-600"
                  >
                    {updateMutation.isPending ? "Saving..." : "Save Changes"}
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