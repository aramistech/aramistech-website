import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, ImageIcon, Check, Timer, X } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";

interface WebsiteImage {
  id: string;
  label: string;
  description: string;
  currentUrl: string;
  filePath: string;
  lineNumber: number;
  category: string;
}

interface MediaFile {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  altText?: string;
}

export default function VisualImageManager() {
  const [selectedImage, setSelectedImage] = useState<WebsiteImage | null>(null);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  const { toast } = useToast();

  // Fetch auto-detected images with auto-refresh
  const { data: autoDetectResponse, isLoading: isLoadingAutoDetect, refetch: refetchAutoDetect } = useQuery({
    queryKey: ["/api/admin/auto-detect-images"],
    retry: false,
    refetchInterval: autoRefreshEnabled ? 30000 : false, // Auto-refresh every 30 seconds
    refetchIntervalInBackground: false,
  });

  // Update last refresh time when data changes
  useEffect(() => {
    if (autoDetectResponse) {
      setLastRefresh(new Date());
    }
  }, [autoDetectResponse]);

  // Fetch media library files
  const { data: mediaResponse } = useQuery({
    queryKey: ["/api/admin/media"],
    retry: false,
  });

  const autoDetectedImages: WebsiteImage[] = (autoDetectResponse as any)?.images || [];
  const mediaFiles: MediaFile[] = (mediaResponse as any)?.files || [];

  // Auto-refresh countdown timer
  const [refreshCountdown, setRefreshCountdown] = useState(30);

  useEffect(() => {
    if (!autoRefreshEnabled) return;

    const interval = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          return 30; // Reset countdown
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [autoRefreshEnabled]);

  // Group images by category
  const groupedImages = autoDetectedImages.reduce((groups, image) => {
    const category = image.category || 'Other Images';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(image);
    return groups;
  }, {} as Record<string, WebsiteImage[]>);

  // Handle manual scan
  const handleManualScan = async () => {
    setIsScanning(true);
    try {
      await refetchAutoDetect();
      toast({
        title: "Scan Complete",
        description: `Found ${(autoDetectResponse as any)?.totalFound || autoDetectedImages.length} images across your website`,
      });
    } catch (error) {
      toast({
        title: "Scan Failed", 
        description: "Unable to scan codebase for images",
        variant: "destructive",
      });
    } finally {
      setIsScanning(false);
    }
  };

  // Toggle auto-refresh
  const toggleAutoRefresh = () => {
    setAutoRefreshEnabled(!autoRefreshEnabled);
    if (!autoRefreshEnabled) {
      setRefreshCountdown(30);
    }
  };

  // Handle image replacement
  const updateImageMutation = useMutation({
    mutationFn: async ({ imageId, newMediaId }: { imageId: string; newMediaId: number }) => {
      const response = await apiRequest("POST", "/api/admin/update-website-image", { imageId, newMediaId });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Image Updated",
        description: "Website image has been updated successfully",
      });
      setSelectedImage(null);
      setIsImageSelectorOpen(false);
      refetchAutoDetect();
    },
    onError: (error: any) => {
      const errorMessage = error?.message || error?.details || "Failed to update website image";
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleImageReplace = (imageId: string, newMediaId: number) => {
    updateImageMutation.mutate({ imageId, newMediaId });
  };

  const openImageSelector = (image: WebsiteImage) => {
    setSelectedImage(image);
    setIsImageSelectorOpen(true);
  };

  // Category colors
  const getCategoryColor = (category: string): string => {
    const colors: Record<string, string> = {
      'Company Branding': 'bg-blue-500',
      'Team Photos': 'bg-green-500',
      'Section Images': 'bg-purple-500',
      'Page Backgrounds': 'bg-orange-500',
      'Video & Media': 'bg-red-500',
      'Other Images': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="space-y-4">
      {/* Enhanced Header with Auto-Refresh */}
      <div className="flex justify-between items-center py-2 border-b">
        <div>
          <h3 className="text-base font-medium">Website Images</h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{autoDetectedImages.length} images detected</span>
            <span>•</span>
            <span>Click to replace</span>
            {autoRefreshEnabled && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  <span>Auto-refresh in {refreshCountdown}s</span>
                </div>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            onClick={toggleAutoRefresh}
            size="sm"
            variant={autoRefreshEnabled ? "default" : "outline"}
            className="h-8 px-3"
          >
            <Timer className="h-3 w-3 mr-1" />
            <span className="text-xs">{autoRefreshEnabled ? "Auto On" : "Auto Off"}</span>
          </Button>
          <Button
            onClick={handleManualScan}
            disabled={isScanning || isLoadingAutoDetect}
            size="sm"
            variant="outline"
            className="h-8 px-3"
          >
            {isScanning || isLoadingAutoDetect ? (
              <RefreshCw className="h-3 w-3 animate-spin mr-1" />
            ) : (
              <RefreshCw className="h-3 w-3 mr-1" />
            )}
            <span className="text-xs">{isScanning ? "Scanning..." : "Refresh"}</span>
          </Button>
        </div>
      </div>

      {isLoadingAutoDetect && (
        <div className="flex items-center justify-center py-4 text-sm text-muted-foreground">
          <RefreshCw className="h-4 w-4 animate-spin mr-2" />
          <span>Scanning images...</span>
        </div>
      )}

      {/* Professional Table Layout */}
      <div className="bg-white rounded-lg border overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Preview</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image Details</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Location</th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(groupedImages).map(([category, images]) => (
              <React.Fragment key={category}>
                {/* Category Header Row */}
                <tr className="bg-gray-50">
                  <td colSpan={4} className="px-3 py-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${getCategoryColor(category)}`}></div>
                      <span className="text-sm font-medium text-gray-700">{category}</span>
                      <Badge variant="secondary" className="text-xs h-4 px-1.5">{images.length}</Badge>
                    </div>
                  </td>
                </tr>
                {/* Image Rows */}
                {images.map((image) => (
                  <tr key={image.id} className="hover:bg-gray-50 transition-colors">
                    {/* Preview */}
                    <td className="px-3 py-2">
                      <div className="w-12 h-8 bg-gray-100 rounded overflow-hidden border flex-shrink-0">
                        <img
                          src={image.currentUrl}
                          alt={image.label}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                            target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-gray-400 text-xs">N/A</div>';
                          }}
                        />
                      </div>
                    </td>
                    
                    {/* Details */}
                    <td className="px-3 py-2">
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-900 leading-tight">{image.label}</p>
                        <p className="text-xs text-gray-500 leading-tight">{image.description}</p>
                        <div className="text-xs text-gray-400 font-mono bg-gray-50 px-2 py-0.5 rounded inline-block max-w-xs truncate">
                          {image.currentUrl.length > 40 
                            ? `${image.currentUrl.substring(0, 20)}...${image.currentUrl.substring(image.currentUrl.length - 20)}`
                            : image.currentUrl
                          }
                        </div>
                      </div>
                    </td>
                    
                    {/* Location */}
                    <td className="px-3 py-2">
                      <div className="text-xs space-y-0.5">
                        <p className="text-gray-600 font-medium">{image.filePath.replace('client/src/', '')}</p>
                        <p className="text-gray-400">Line {image.lineNumber}</p>
                      </div>
                    </td>
                    
                    {/* Action */}
                    <td className="px-3 py-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openImageSelector(image)}
                        className="h-7 px-2 text-xs"
                        disabled={updateImageMutation.isPending}
                      >
                        <ImageIcon className="h-3 w-3 mr-1" />
                        Replace
                      </Button>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {/* Large Image Selection Modal */}
      <Dialog open={isImageSelectorOpen} onOpenChange={setIsImageSelectorOpen}>
        <DialogContent className="max-w-7xl w-[95vw] max-h-[95vh] overflow-hidden">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl">
              <ImageIcon className="h-6 w-6" />
              Replace: {selectedImage?.label}
            </DialogTitle>
            <p className="text-base text-muted-foreground">
              Select a replacement image from your media library - Click any image to use it
            </p>
          </DialogHeader>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-h-[80vh] overflow-y-auto p-6">
            {mediaFiles.map((file) => (
              <div
                key={file.id}
                className="cursor-pointer group relative bg-white rounded-xl border-2 border-gray-200 hover:border-blue-500 hover:shadow-xl transition-all duration-300 overflow-hidden"
                onClick={() => selectedImage && handleImageReplace(selectedImage.id, file.id)}
              >
                {/* Much Larger Image Preview with fixed height */}
                <div className="h-96 bg-gray-100 overflow-hidden flex items-center justify-center">
                  <img
                    src={`/api/media/${file.id}/file`}
                    alt={file.altText || file.originalName}
                    className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                
                {/* Image Info */}
                <div className="p-6 space-y-3">
                  <p className="text-lg font-semibold text-gray-900 truncate">{file.originalName}</p>
                  <p className="text-base text-blue-600 font-medium">ID: {file.id}</p>
                  {file.altText && (
                    <p className="text-base text-gray-500">{file.altText}</p>
                  )}
                </div>
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-70 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                  <div className="text-white text-center px-4">
                    <Check className="h-16 w-16 mx-auto mb-4 text-green-400" />
                    <p className="text-2xl font-bold mb-2">Select This Image</p>
                    <p className="text-lg opacity-90 break-words">{file.originalName}</p>
                  </div>
                </div>
                
                {/* Loading Overlay */}
                {updateImageMutation.isPending && (
                  <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center">
                    <div className="text-center">
                      <RefreshCw className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                      <p className="text-lg font-medium text-gray-700">Updating image...</p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          
          <div className="flex justify-between items-center pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              {mediaFiles.length} images available in media library
            </p>
            <Button
              onClick={() => setIsImageSelectorOpen(false)}
              variant="outline"
              disabled={updateImageMutation.isPending}
            >
              Cancel
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}