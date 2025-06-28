import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { RefreshCw, Upload, Check, Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface MediaFile {
  id: number;
  fileName: string;
  originalName: string;
  filePath: string;
  altText?: string;
  uploadedAt: Date;
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
  const [isEditing, setIsEditing] = useState<string | null>(null);

  const { data: mediaResponse } = useQuery<{success: boolean, files: MediaFile[]}>({
    queryKey: ["/api/admin/media"],
  });

  const mediaFiles = mediaResponse?.files || [];

  // Define all the website images that can be replaced
  const websiteImages: WebsiteImage[] = [
    // Company Logos (appears in header, footer, and various pages)
    {
      id: "company-logo-header",
      label: "AramisTech Logo (Header)",
      description: "Main company logo in website header navigation",
      currentUrl: "https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png",
      filePath: "client/src/components/header.tsx",
      lineNumber: 140,
      category: "Company Branding"
    },
    {
      id: "company-logo-footer",
      label: "AramisTech Logo (Footer)",
      description: "Company logo in website footer section",
      currentUrl: "https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png",
      filePath: "client/src/components/footer.tsx",
      lineNumber: 27,
      category: "Company Branding"
    },
    {
      id: "company-logo-dynamic-header",
      label: "AramisTech Logo (Dynamic Header)",
      description: "Company logo in dynamic page headers",
      currentUrl: "https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png",
      filePath: "client/src/components/dynamic-header.tsx",
      lineNumber: 140,
      category: "Company Branding"
    },
    {
      id: "company-logo-exit-popup",
      label: "AramisTech Logo (Exit Popup)",
      description: "Company logo in exit intent popup",
      currentUrl: "https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png",
      filePath: "client/src/components/exit-intent-popup.tsx",
      lineNumber: 50,
      category: "Company Branding"
    },
    
    // Team Photos
    {
      id: "aramis-team",
      label: "Aramis Figueroa",
      description: "CEO & IT Network Specialist team photo",
      currentUrl: "/api/media/15/file",
      filePath: "client/src/components/team.tsx",
      lineNumber: 7,
      category: "Team Photos"
    },
    {
      id: "gabriel-team",
      label: "Gabriel Figueroa", 
      description: "IT Technician team photo",
      currentUrl: "/api/media/21/file",
      filePath: "client/src/components/team.tsx",
      lineNumber: 21,
      category: "Team Photos"
    },
    {
      id: "aramism-team",
      label: "Aramis M Figueroa",
      description: "Software Developer team photo",
      currentUrl: "https://aramistech.com/wp-content/uploads/2024/09/Grayprofile-pic2-600x600-1.png",
      filePath: "client/src/components/team.tsx", 
      lineNumber: 14,
      category: "Team Photos"
    },
    
    // Section Images
    {
      id: "hero-it-team",
      label: "Professional IT Team",
      description: "Hero section image - Professional IT team working with technology",
      currentUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      filePath: "client/src/components/hero.tsx",
      lineNumber: 91,
      category: "Section Images"
    },
    {
      id: "about-office",
      label: "Office Technology Setup",
      description: "Modern office technology setup image in About section",
      currentUrl: "https://images.unsplash.com/photo-1497366216548-37526070297c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
      filePath: "client/src/components/about.tsx",
      lineNumber: 17,
      category: "Section Images"
    },
    
    // Page Backgrounds
    {
      id: "windows10-hero",
      label: "Windows 10 Hero Background",
      description: "Background image for Windows 10 upgrade page hero section",
      currentUrl: "/windows10-bg.png",
      filePath: "client/src/pages/windows10-upgrade.tsx",
      lineNumber: 151,
      category: "Page Backgrounds"
    },
    
    // Video & Media
    {
      id: "windows10-video-poster",
      label: "Customer Testimonial Video Poster",
      description: "Poster image for customer testimonial video on Windows 10 upgrade page",
      currentUrl: "/video-poster.svg",
      filePath: "client/src/pages/windows10-upgrade.tsx",
      lineNumber: 630,
      category: "Video & Media"
    }
  ];

  const updateImageMutation = useMutation({
    mutationFn: async ({ imageId, newMediaId }: { imageId: string, newMediaId: number }) => {
      return apiRequest('/api/admin/update-website-image', 'POST', {
        imageId,
        newMediaId
      });
    },
    onSuccess: () => {
      toast({
        title: "Image Updated!",
        description: "Website image has been updated successfully",
      });
      setIsEditing(null);
      // Refresh the page to show updated images
      window.location.reload();
    },
    onError: (error) => {
      toast({
        title: "Update Failed",
        description: "Failed to update image: " + error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageUpdate = (websiteImage: WebsiteImage, newMediaId: number) => {
    updateImageMutation.mutate({
      imageId: websiteImage.id,
      newMediaId
    });
  };

  const groupedImages = websiteImages.reduce((acc, image) => {
    if (!acc[image.category]) {
      acc[image.category] = [];
    }
    acc[image.category].push(image);
    return acc;
  }, {} as Record<string, WebsiteImage[]>);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Visual Image Manager</h2>
          <p className="text-gray-600">Click and replace website images without coding</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => window.location.reload()}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Current Website Images */}
      {Object.entries(groupedImages).map(([category, images]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle className="text-lg">{category}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {images.map((websiteImage) => (
                <div key={websiteImage.id} className="border rounded-lg p-4 space-y-3">
                  {/* Current Image Display */}
                  <div className="relative">
                    <img 
                      src={websiteImage.currentUrl}
                      alt={websiteImage.label}
                      className="w-full h-32 object-cover rounded border"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyOCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxMiIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9IjAuMzVlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==";
                      }}
                    />
                    <Badge className="absolute top-2 right-2 bg-blue-600">
                      Current
                    </Badge>
                  </div>

                  {/* Image Info */}
                  <div>
                    <h3 className="font-semibold">{websiteImage.label}</h3>
                    <p className="text-sm text-gray-600">{websiteImage.description}</p>
                  </div>

                  {/* Replace Button */}
                  <Button
                    variant={isEditing === websiteImage.id ? "secondary" : "outline"}
                    size="sm"
                    className="w-full"
                    onClick={() => setIsEditing(isEditing === websiteImage.id ? null : websiteImage.id)}
                    disabled={updateImageMutation.isPending}
                  >
                    {isEditing === websiteImage.id ? (
                      <>
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </>
                    ) : (
                      <>
                        <Edit3 className="w-4 h-4 mr-2" />
                        Replace Image
                      </>
                    )}
                  </Button>

                  {/* Media Selection Grid */}
                  {isEditing === websiteImage.id && (
                    <div className="mt-4 p-4 bg-gray-50 rounded border-2 border-dashed">
                      <p className="text-sm font-medium mb-3">Choose a new image:</p>
                      {mediaFiles.length > 0 ? (
                        <div className="grid grid-cols-2 gap-2">
                          {mediaFiles.map((file) => (
                            <div
                              key={file.id}
                              className="relative cursor-pointer group border rounded overflow-hidden hover:border-aramis-orange transition-colors"
                              onClick={() => handleImageUpdate(websiteImage, file.id)}
                            >
                              <img 
                                src={`/api/admin/media/${file.id}/file`}
                                alt={file.originalName}
                                className="w-full h-20 object-cover"
                              />
                              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                  <div className="bg-aramis-orange text-white px-2 py-1 rounded text-xs font-medium">
                                    Select
                                  </div>
                                </div>
                              </div>
                              <Badge className="absolute top-1 left-1 text-xs bg-blue-600">
                                ID: {file.id}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-4 text-gray-500">
                          <Upload className="w-8 h-8 mx-auto mb-2 opacity-50" />
                          <p className="text-sm">No images uploaded yet</p>
                          <p className="text-xs">Upload images in the Media Library first</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Instructions */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <h3 className="font-semibold text-blue-900 mb-2">How to Use:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Click "Replace Image" on any website image above</li>
            <li>Select a new image from your media library</li>
            <li>The website will update automatically - no code editing needed!</li>
            <li>Upload new images in the Media Library tab if you need more options</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}