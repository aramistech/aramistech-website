import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { RefreshCw, ImageIcon, Check, Timer } from "lucide-react";
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
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();

  // Fetch auto-detected images
  const { data: autoDetectResponse, isLoading: isLoadingAutoDetect, refetch: refetchAutoDetect } = useQuery({
    queryKey: ["/api/admin/auto-detect-images"],
    retry: false,
  });

  // Fetch media library files
  const { data: mediaResponse } = useQuery({
    queryKey: ["/api/admin/media"],
    retry: false,
  });

  const autoDetectedImages: WebsiteImage[] = autoDetectResponse?.images || [];
  const mediaFiles: MediaFile[] = mediaResponse?.files || [];

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
        description: `Found ${autoDetectResponse?.totalFound || 0} images across your website`,
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
      {/* Compact Header */}
      <div className="flex justify-between items-center py-2 border-b">
        <div>
          <h3 className="text-base font-medium">Website Images</h3>
          <p className="text-xs text-muted-foreground">
            {autoDetectedImages.length} images detected • Click to replace
          </p>
        </div>
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
                      {selectedImage?.id === image.id ? (
                        <div className="space-y-2">
                          <div className="text-xs text-gray-600 mb-1">Select replacement:</div>
                          <div className="grid grid-cols-5 gap-1 max-h-16 overflow-y-auto p-1 bg-gray-50 rounded border">
                            {mediaFiles.map((file) => (
                              <div
                                key={file.id}
                                className="cursor-pointer group relative aspect-square bg-white rounded overflow-hidden hover:ring-1 hover:ring-blue-500 border transition-all"
                                onClick={() => handleImageReplace(image.id, file.id)}
                                title={`ID: ${file.id} - ${file.originalName}`}
                              >
                                <img
                                  src={`/api/media/${file.id}/file`}
                                  alt={file.altText || file.originalName}
                                  className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                  <Check className="h-2 w-2 text-white" />
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedImage(null)}
                            className="h-6 px-2 text-xs"
                          >
                            Cancel
                          </Button>
                        </div>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedImage(image)}
                          className="h-7 px-2 text-xs"
                          disabled={updateImageMutation.isPending}
                        >
                          <ImageIcon className="h-3 w-3 mr-1" />
                          Replace
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}