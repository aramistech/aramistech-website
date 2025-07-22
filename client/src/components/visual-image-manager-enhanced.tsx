import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  RefreshCw, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Copy, 
  ExternalLink, 
  Image as ImageIcon,
  FileImage,
  Folder,
  MapPin,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings,
  Grid,
  List,
  Monitor
} from "lucide-react";
import type { MediaFile } from "@shared/schema";

interface WebsiteImage {
  id: string;
  label: string;
  category: string;
  currentUrl: string;
  filePath: string;
  lineNumber: number;
  description?: string;
  usage?: string;
}

interface MediaPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (mediaFile: MediaFile) => void;
  currentUrl: string;
}

function MediaPicker({ isOpen, onClose, onSelect, currentUrl }: MediaPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: mediaData, isLoading } = useQuery<{ success: boolean; files: MediaFile[] }>({
    queryKey: ["/api/admin/media"],
    enabled: isOpen,
  });

  const mediaFiles = mediaData?.files || [];
  const filteredFiles = mediaFiles.filter(file => 
    file.originalName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.altText?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-aramis-orange" />
            Select Replacement Image
          </DialogTitle>
          <div className="text-sm text-gray-600">
            Current: <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">{currentUrl}</span>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search and view controls */}
          <div className="flex gap-4 items-center">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
              <Input
                placeholder="Search images by name, alt text, or tags..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
            >
              {viewMode === "grid" ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
            </Button>
          </div>

          {/* Media grid/list */}
          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-8 text-gray-500">Loading images...</div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery ? `No images match "${searchQuery}"` : "No images available"}
              </div>
            ) : viewMode === "grid" ? (
              <div className="grid grid-cols-4 gap-3">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => onSelect(file)}
                    className="group cursor-pointer border rounded-lg overflow-hidden hover:border-aramis-orange transition-colors"
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={`/api/media/${file.id}/file`}
                        alt={file.altText || file.originalName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium truncate">{file.originalName}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <span className="text-xs text-gray-500">
                          {(file.fileSize / 1024).toFixed(1)}KB
                        </span>
                        {file.isBackedUp && (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredFiles.map((file) => (
                  <div
                    key={file.id}
                    onClick={() => onSelect(file)}
                    className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:border-aramis-orange transition-colors"
                  >
                    <div className="w-12 h-12 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                      <img
                        src={`/api/media/${file.id}/file`}
                        alt={file.altText || file.originalName}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{file.originalName}</p>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{(file.fileSize / 1024).toFixed(1)}KB</span>
                        {file.altText && <span>• {file.altText}</span>}
                        {file.isBackedUp && (
                          <span className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="w-3 h-3" />
                            Backed up
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function VisualImageManagerEnhanced() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");
  const [selectedImage, setSelectedImage] = useState<WebsiteImage | null>(null);
  const [mediaPickerOpen, setMediaPickerOpen] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch website images
  const { data: imagesData, isLoading, refetch } = useQuery<{ success: boolean; images: WebsiteImage[] }>({
    queryKey: ["/api/admin/scan-images"],
    refetchInterval: autoRefresh ? 10000 : false, // Auto refresh every 10 seconds if enabled
  });

  // Fetch media library files
  const { data: mediaData } = useQuery<{ success: boolean; files: MediaFile[] }>({
    queryKey: ["/api/admin/media"],
  });

  const websiteImages = imagesData?.images || [];
  const mediaFiles = mediaData?.files || [];

  // Group images by category
  const imagesByCategory = websiteImages.reduce((acc, image) => {
    if (!acc[image.category]) {
      acc[image.category] = [];
    }
    acc[image.category].push(image);
    return acc;
  }, {} as Record<string, WebsiteImage[]>);

  const categories = Object.keys(imagesByCategory);

  // Filter images
  const filteredImages = websiteImages.filter(image => {
    const matchesSearch = searchQuery === "" || 
      image.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.filePath.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = categoryFilter === "all" || image.category === categoryFilter;
    
    return matchesSearch && matchesCategory;
  });

  // Replace image mutation
  const replaceImageMutation = useMutation({
    mutationFn: async ({ imageId, mediaFileId }: { imageId: string; mediaFileId: number }) => {
      return apiRequest(`/api/admin/replace-image/${imageId}`, "POST", { mediaFileId });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Image updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/scan-images"] });
      setMediaPickerOpen(false);
      setSelectedImage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update image",
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = (mediaFile: MediaFile) => {
    if (selectedImage) {
      replaceImageMutation.mutate({
        imageId: selectedImage.id,
        mediaFileId: mediaFile.id,
      });
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

  const getMediaFileInfo = (url: string) => {
    // Extract media ID from URL like /api/media/123/file
    const match = url.match(/\/api\/media\/(\d+)\/file/);
    if (match) {
      const mediaId = parseInt(match[1]);
      return mediaFiles.find(f => f.id === mediaId);
    }
    return null;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <Monitor className="w-6 h-6 text-aramis-orange" />
              Visual Image Manager
            </CardTitle>
            <p className="text-sm text-gray-600 mt-1">
              Manage and replace images across your website with visual previews
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? "bg-green-50 border-green-200" : ""}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? "animate-spin text-green-600" : ""}`} />
              {autoRefresh ? "Auto Refresh ON" : "Auto Refresh OFF"}
            </Button>
            <Button
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
              Refresh URLs
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Search and filter controls */}
        <div className="mb-6 space-y-4">
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
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category} ({imagesByCategory[category].length})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
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

          {/* Stats */}
          <div className="flex items-center gap-4 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-4 h-4" />
              {filteredImages.length} of {websiteImages.length} images
            </span>
            <span className="flex items-center gap-1">
              <Folder className="w-4 h-4" />
              {categories.length} categories
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="text-center py-12 text-gray-500">
            <RefreshCw className="w-8 h-8 mx-auto mb-4 animate-spin" />
            <p>Scanning website for images...</p>
          </div>
        ) : filteredImages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">
              {searchQuery || categoryFilter !== "all" ? "No images match your filters" : "No images found"}
            </p>
            <p className="text-sm">
              {searchQuery || categoryFilter !== "all" ? "Try adjusting your search or filters" : "Try refreshing to scan for images"}
            </p>
          </div>
        ) : viewMode === "grid" ? (
          <Tabs defaultValue={categories[0]} className="w-full">
            <TabsList className="grid grid-cols-4 w-full">
              {categories.slice(0, 4).map(category => (
                <TabsTrigger key={category} value={category} className="text-xs">
                  {category} ({imagesByCategory[category].length})
                </TabsTrigger>
              ))}
            </TabsList>
            
            {categories.slice(0, 4).map(category => (
              <TabsContent key={category} value={category} className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {imagesByCategory[category]
                    .filter(image => filteredImages.includes(image))
                    .map((image) => {
                      const mediaFile = getMediaFileInfo(image.currentUrl);
                      
                      return (
                        <div key={image.id} className="group border rounded-lg overflow-hidden hover:shadow-md transition-all">
                          <div className="aspect-square bg-gray-100 relative">
                            <img
                              src={image.currentUrl}
                              alt={image.label}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                            <div className="hidden absolute inset-0 flex items-center justify-center bg-gray-100">
                              <AlertCircle className="w-8 h-8 text-gray-400" />
                            </div>
                            
                            {/* Overlay with actions */}
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  onClick={() => {
                                    setSelectedImage(image);
                                    setMediaPickerOpen(true);
                                  }}
                                  className="bg-aramis-orange hover:bg-orange-600"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="secondary"
                                  onClick={() => copyToClipboard(image.currentUrl, "Image URL copied!")}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          <div className="p-3">
                            <h3 className="font-medium text-sm truncate mb-1">{image.label}</h3>
                            <div className="space-y-1 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                <span className="truncate">{image.filePath}</span>
                              </div>
                              {mediaFile && (
                                <div className="flex items-center gap-2">
                                  <span>{formatFileSize(mediaFile.fileSize)}</span>
                                  {mediaFile.isBackedUp && (
                                    <span className="flex items-center gap-1 text-green-600">
                                      <CheckCircle className="w-3 h-3" />
                                      S3
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        ) : (
          <div className="space-y-3">
            {categories.map(category => {
              const categoryImages = imagesByCategory[category].filter(image => filteredImages.includes(image));
              if (categoryImages.length === 0) return null;
              
              return (
                <div key={category} className="space-y-3">
                  <div className="flex items-center gap-2 py-2 border-b">
                    <Folder className="w-4 h-4 text-aramis-orange" />
                    <h3 className="font-medium text-sm">{category}</h3>
                    <Badge variant="outline" className="text-xs">
                      {categoryImages.length}
                    </Badge>
                  </div>
                  
                  {categoryImages.map((image) => {
                    const mediaFile = getMediaFileInfo(image.currentUrl);
                    
                    return (
                      <div key={image.id} className="flex items-center gap-4 p-4 border rounded-lg hover:border-aramis-orange transition-colors">
                        <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                          <img
                            src={image.currentUrl}
                            alt={image.label}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                              target.nextElementSibling?.classList.remove('hidden');
                            }}
                          />
                          <div className="hidden w-full h-full flex items-center justify-center">
                            <AlertCircle className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-sm mb-1">{image.label}</h3>
                          <div className="space-y-1 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{image.filePath} (Line {image.lineNumber})</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <ExternalLink className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate font-mono">{image.currentUrl}</span>
                            </div>
                            {mediaFile && (
                              <div className="flex items-center gap-3">
                                <span>{formatFileSize(mediaFile.fileSize)}</span>
                                <span>•</span>
                                <span>{mediaFile.uploadedAt ? new Date(mediaFile.uploadedAt).toLocaleDateString() : 'Unknown date'}</span>
                                {mediaFile.isBackedUp && (
                                  <span className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="w-3 h-3" />
                                    AWS S3 Backed Up
                                  </span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => copyToClipboard(image.currentUrl, "Image URL copied!")}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedImage(image);
                              setMediaPickerOpen(true);
                            }}
                            className="bg-aramis-orange hover:bg-orange-600"
                          >
                            Replace
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        <MediaPicker
          isOpen={mediaPickerOpen}
          onClose={() => {
            setMediaPickerOpen(false);
            setSelectedImage(null);
          }}
          onSelect={handleImageSelect}
          currentUrl={selectedImage?.currentUrl || ""}
        />
      </CardContent>
    </Card>
  );
}