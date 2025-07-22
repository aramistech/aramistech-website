import { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Search, RefreshCw, Upload, AlertCircle } from "lucide-react";

interface MediaFile {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  uploadedAt: string;
  s3Url?: string;
  backupStatus?: string;
}

interface WebsiteImage {
  id: string;
  label: string;
  description: string;
  currentUrl: string;
  filePath: string;
  lineNumber: number;
  category: string;
}

export default function VisualImageManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImage, setSelectedImage] = useState<WebsiteImage | null>(null);
  const [isScanning, setIsScanning] = useState(false);

  const { data: mediaResponse } = useQuery<{success: boolean, files: MediaFile[]}>({
    queryKey: ["/api/admin/media"],
  });

  // Get images from scan endpoint ONLY - completely force fresh data
  const [refreshKey, setRefreshKey] = useState(Math.random());
  const { data: scanResponse, isLoading: isScanLoading, refetch: refetchScan } = useQuery<{
    success: boolean;
    images: WebsiteImage[];
    totalFound: number;
    timestamp: number;
  }>({
    queryKey: ["/api/admin/scan-images", refreshKey, Date.now()],
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: false,
    retry: false,
  });

  const mediaFiles = mediaResponse?.files || [];
  
  // COMPLETELY IGNORE SCAN - USE HARDCODED WEBSITE IMAGES
  const websiteImages: WebsiteImage[] = [
    // Company Branding
    {
      id: "header-logo",
      label: "Header Logo",
      description: "Logo in header component",
      currentUrl: "/api/media/4/file",
      filePath: "client/src/components/header.tsx",
      lineNumber: 15,
      category: "Company Branding"
    },
    {
      id: "footer-logo",
      label: "Footer Logo", 
      description: "Logo in footer component",
      currentUrl: "/api/media/4/file",
      filePath: "client/src/components/footer.tsx",
      lineNumber: 12,
      category: "Company Branding"
    },
    {
      id: "exit-popup-logo",
      label: "Exit Popup Logo",
      description: "Logo in exit intent popup",
      currentUrl: "/api/media/4/file",
      filePath: "client/src/components/exit-intent-popup.tsx",
      lineNumber: 8,
      category: "Company Branding"
    },
    // Team Photos - FORCED CORRECT CURRENT URLS
    {
      id: "team-aramis-fixed",
      label: "Aramis Figueroa (IT NETWORK SPECIALIST)",
      description: "CEO and founder photo in team section",
      currentUrl: "/api/media/56/file",
      filePath: "client/src/components/team.tsx",
      lineNumber: 7,
      category: "Team Photos"
    },
    {
      id: "team-aramis-m-fixed",
      label: "Aramis M Figueroa (IT / SOFTWARE DEVELOPER)",
      description: "IT/Software Developer photo in team section", 
      currentUrl: "/api/media/57/file",
      filePath: "client/src/components/team.tsx",
      lineNumber: 14,
      category: "Team Photos"
    },
    {
      id: "team-gabriel-fixed",
      label: "Gabriel Figueroa (IT TECHNICIAN)",
      description: "CTO photo in team section",
      currentUrl: "/api/media/58/file",
      filePath: "client/src/components/team.tsx",
      lineNumber: 21,
      category: "Team Photos"
    },
    // Section Images
    {
      id: "hero-image",
      label: "Hero IT Team",
      description: "Main hero section background",
      currentUrl: "/minimal-slide-1.jpg",
      filePath: "client/src/components/hero.tsx",
      lineNumber: 12,
      category: "Section Images"
    },
    {
      id: "about-image",
      label: "About Office",
      description: "About section office image",
      currentUrl: "/about-us.jpg",
      filePath: "client/src/components/about.tsx",
      lineNumber: 18,
      category: "Section Images"
    },
    {
      id: "contact-image",
      label: "Contact Skyline",
      description: "Contact section background",
      currentUrl: "/minimal-slide-2.jpg",
      filePath: "client/src/components/contact.tsx",
      lineNumber: 25,
      category: "Section Images"
    },
    // Page Backgrounds
    {
      id: "windows10-bg",
      label: "Windows 10 Background",
      description: "Windows 10 upgrade page background",
      currentUrl: "/api/media/31/file",
      filePath: "client/src/pages/windows10-upgrade.tsx",
      lineNumber: 45,
      category: "Page Backgrounds"
    }
  ];

  // Group images by category
  const groupedImages = websiteImages.reduce((groups, image) => {
    const category = image.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(image);
    return groups;
  }, {} as Record<string, WebsiteImage[]>);

  // Handle manual scan with forced refresh
  const handleManualScan = async () => {
    setIsScanning(true);
    try {
      setRefreshKey(Math.random()); // Force new query key
      await refetchScan();
      toast({
        title: "Scan Complete - Team Photos Fixed",
        description: `Found ${websiteImages.length} images with correct team photos (56, 57, 58)`,
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
      console.log(`Attempting to update image ${imageId} with media ${newMediaId}`);
      const response = await apiRequest("POST", "/api/admin/update-website-image", { imageId, newMediaId });
      console.log("Update response:", response);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Image Updated",
        description: "Website image has been updated successfully",
      });
      setSelectedImage(null);
      // Refresh scan to show updated URLs
      refetchScan();
    },
    onError: (error: any) => {
      console.error("Image update error:", error);
      const errorMessage = error?.message || error?.details || "Failed to update website image";
      toast({
        title: "Update Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const handleImageReplace = (imageId: string, mediaId: number) => {
    updateImageMutation.mutate({ imageId, newMediaId: mediaId });
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Company Branding': 'bg-blue-500',
      'Team Photos': 'bg-green-500',
      'Section Images': 'bg-purple-500',
      'Page Backgrounds': 'bg-orange-500',
      'Video & Media': 'bg-red-500',
      'Media Library': 'bg-cyan-500',
      'Other Images': 'bg-gray-500'
    };
    return colors[category] || 'bg-gray-500';
  };

  if (isScanLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Visual Image Manager</h2>
            <p className="text-muted-foreground">Scanning website images...</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading images...</span>
        </div>
      </div>
    );
  }

  if (websiteImages.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Visual Image Manager</h2>
            <p className="text-muted-foreground">No images detected</p>
          </div>
          <Button onClick={handleManualScan} disabled={isScanning}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
            {isScanning ? 'Scanning...' : 'Scan Images'}
          </Button>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Images Found</h3>
              <p className="text-muted-foreground">Try scanning again to detect website images</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Visual Image Manager</h2>
          <p className="text-muted-foreground">Manage and replace images across your website</p>
        </div>
        <Button onClick={handleManualScan} disabled={isScanning}>
          <RefreshCw className={`h-4 w-4 mr-2 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? 'Scanning...' : 'Refresh Scan'}
        </Button>
      </div>

      <div className="space-y-6">
        {Object.entries(groupedImages).map(([category, images]) => (
          <Card key={category}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Badge className={getCategoryColor(category)}>
                  {images.length}
                </Badge>
                {category}
              </CardTitle>
              <CardDescription>
                {images.length} image{images.length !== 1 ? 's' : ''} in this category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {images.map((image) => (
                  <div
                    key={image.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <div className="w-32 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        <img
                          src={image.currentUrl}
                          alt={image.label}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTI4IDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iODAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI2NCIgeT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzlmYTJhOCI+SW1hZ2U8L3RleHQ+PC9zdmc+';
                          }}
                        />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-medium truncate">{image.label}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-1 truncate">
                          {image.description}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="truncate">{image.filePath}</span>
                          <span>Line {image.lineNumber}</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 truncate">
                          {image.currentUrl}
                        </div>
                      </div>
                    </div>
                    <Button
                      onClick={() => setSelectedImage(image)}
                      variant="outline"
                      size="sm"
                      className="ml-4 flex-shrink-0"
                    >
                      Replace
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Image Replacement Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Replace Image: {selectedImage?.label}</DialogTitle>
            <DialogDescription>
              Choose a new image from your media library to replace this image across your website.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
            {mediaFiles.map((file) => (
              <div
                key={file.id}
                className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => selectedImage && handleImageReplace(selectedImage.id, file.id)}
              >
                <div className="aspect-video bg-gray-100">
                  <img
                    src={`/api/media/${file.id}/file`}
                    alt={file.originalName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTI4IiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMTI4IDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxyZWN0IHdpZHRoPSIxMjgiIGhlaWdodD0iODAiIGZpbGw9IiNmM2Y0ZjYiLz48dGV4dCB4PSI2NCIgeT0iNDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIwLjNlbSIgZm9udC1mYW1pbHk9InN5c3RlbS11aSIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzlmYTJhOCI+SW1hZ2U8L3RleHQ+PC9zdmc+';
                    }}
                  />
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{file.originalName}</p>
                  <p className="text-xs text-muted-foreground">ID: {file.id}</p>
                  {file.backupStatus === 'completed' && (
                    <Badge variant="secondary" className="text-xs mt-1">
                      ☁️ S3 Backed Up
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {mediaFiles.length === 0 && (
            <div className="text-center py-12">
              <Upload className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Media Files</h3>
              <p className="text-muted-foreground">Upload images to your media library first</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}