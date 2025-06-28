import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Upload, Check, Edit3, Save, X, Scan, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MediaFile {
  id: number;
  fileName: string;
  originalName: string;
  filePath: string;
  altText?: string;
  uploadedAt: string;
}

interface AutoDetectedImage {
  id: string;
  label: string;
  description: string;
  currentUrl: string;
  filePath: string;
  lineNumber: number;
  category: string;
  detectionType: string;
}

export default function VisualImageManager() {
  const [selectedImageId, setSelectedImageId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: mediaResponse } = useQuery<{success: boolean, files: MediaFile[]}>({
    queryKey: ["/api/admin/media"],
  });

  const mediaFiles = mediaResponse?.files || [];

  // Auto-detect images from codebase
  const { data: autoDetectResponse, isLoading: isLoadingAutoDetect, refetch: refetchAutoDetect } = useQuery<{
    success: boolean;
    images: AutoDetectedImage[];
    totalFound: number;
  }>({
    queryKey: ["/api/admin/auto-detect-images"],
    staleTime: 30000, // Cache for 30 seconds
  });

  const detectedImages = autoDetectResponse?.images || [];

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

  const updateImageMutation = useMutation({
    mutationFn: async ({ imageId, newMediaId }: { imageId: string; newMediaId: number }) => {
      return apiRequest("/api/admin/update-website-image", "POST", { imageId, newMediaId });
    },
    onSuccess: () => {
      toast({
        title: "Image Updated",
        description: "Website image has been updated successfully",
      });
      setSelectedImageId(null);
      // Refresh auto-detection to show updated URLs
      refetchAutoDetect();
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error?.message || "Failed to update website image",
        variant: "destructive",
      });
    },
  });

  const handleImageReplace = (imageId: string, mediaId: number) => {
    updateImageMutation.mutate({ imageId, newMediaId: mediaId });
  };

  const copyImageUrl = async (mediaId: number) => {
    const url = `/api/media/${mediaId}/file`;
    await navigator.clipboard.writeText(url);
    setCopiedId(mediaId.toString());
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "URL Copied",
      description: "Image URL copied to clipboard",
    });
  };

  // Group images by category
  const groupedImages = detectedImages.reduce((groups, image) => {
    const category = image.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(image);
    return groups;
  }, {} as Record<string, AutoDetectedImage[]>);

  const getCategoryColor = (category: string) => {
    const colors = {
      'Company Branding': 'bg-blue-500',
      'Team Photos': 'bg-green-500',
      'Section Images': 'bg-purple-500',
      'Page Backgrounds': 'bg-orange-500',
      'Video & Media': 'bg-red-500',
      'Other Images': 'bg-gray-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      {/* Header with scan controls */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Visual Image Manager</h3>
          <p className="text-sm text-muted-foreground">
            Auto-detected {detectedImages.length} images across your website
          </p>
        </div>
        <Button
          onClick={handleManualScan}
          disabled={isScanning || isLoadingAutoDetect}
          className="flex items-center gap-2"
        >
          {isScanning || isLoadingAutoDetect ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Scan className="h-4 w-4" />
          )}
          {isScanning ? "Scanning..." : "Scan for Images"}
        </Button>
      </div>

      {isLoadingAutoDetect && (
        <div className="flex items-center justify-center py-8">
          <RefreshCw className="h-6 w-6 animate-spin mr-2" />
          <span>Scanning codebase for images...</span>
        </div>
      )}

      {/* Display detected images by category */}
      {Object.entries(groupedImages).map(([category, images]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
            <h4 className="font-medium">{category}</h4>
            <Badge variant="secondary">{images.length}</Badge>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="relative">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-sm font-medium">{image.label}</CardTitle>
                      <CardDescription className="text-xs mt-1">
                        {image.description}
                        <br />
                        <span className="text-muted-foreground">
                          {image.filePath.replace('client/src/', '')} (line {image.lineNumber})
                        </span>
                      </CardDescription>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {image.detectionType}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Current Image Preview */}
                  <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
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
                    <div className="hidden flex items-center justify-center h-full text-gray-500">
                      <ExternalLink className="h-8 w-8" />
                    </div>
                  </div>

                  {/* Current URL */}
                  <div className="text-xs text-muted-foreground break-all bg-gray-50 p-2 rounded">
                    {image.currentUrl}
                  </div>

                  {/* Media Library Selection */}
                  {selectedImageId === image.id ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Select replacement image:</p>
                      <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto">
                        {mediaFiles.map((file) => (
                          <div
                            key={file.id}
                            className="cursor-pointer group relative aspect-square bg-gray-100 rounded overflow-hidden hover:ring-2 hover:ring-blue-500"
                            onClick={() => handleImageReplace(image.id, file.id)}
                          >
                            <img
                              src={`/api/media/${file.id}/file`}
                              alt={file.altText || file.originalName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Check className="h-4 w-4 text-white" />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedImageId(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedImageId(image.id)}
                        disabled={updateImageMutation.isPending}
                      >
                        Replace Image
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      {detectedImages.length === 0 && !isLoadingAutoDetect && (
        <Card>
          <CardContent className="py-8 text-center">
            <Scan className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No images detected in your codebase</p>
            <Button onClick={handleManualScan}>
              <Scan className="h-4 w-4 mr-2" />
              Scan for Images
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Media Library Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Media Library Quick Access</CardTitle>
          <CardDescription>
            Copy image URLs for manual use
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2">
            {mediaFiles.slice(0, 16).map((file) => (
              <div
                key={file.id}
                className="relative group cursor-pointer aspect-square bg-gray-100 rounded overflow-hidden hover:ring-2 hover:ring-blue-500"
                onClick={() => copyImageUrl(file.id)}
              >
                <img
                  src={`/api/media/${file.id}/file`}
                  alt={file.altText || file.originalName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  {copiedId === file.id.toString() ? (
                    <Check className="h-4 w-4 text-white" />
                  ) : (
                    <Copy className="h-4 w-4 text-white" />
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  ID: {file.id}
                </div>
              </div>
            ))}
          </div>
          {mediaFiles.length > 16 && (
            <p className="text-sm text-muted-foreground mt-2">
              Showing first 16 images. View all in Media Library tab.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}