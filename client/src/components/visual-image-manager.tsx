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
  uploadedAt: string;
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
      description: "Company logo in website footer",
      currentUrl: "https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png",
      filePath: "client/src/components/footer.tsx",
      lineNumber: 42,
      category: "Company Branding"
    },
    {
      id: "company-logo-dynamic-header",
      label: "AramisTech Logo (Dynamic Header)",
      description: "Company logo in dynamic header component",
      currentUrl: "https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png",
      filePath: "client/src/components/dynamic-header.tsx",
      lineNumber: 42,
      category: "Company Branding"
    },
    {
      id: "company-logo-exit-popup",
      label: "AramisTech Logo (Exit Popup)",
      description: "Company logo in exit intent popup",
      currentUrl: "https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png",
      filePath: "client/src/components/exit-intent-popup.tsx",
      lineNumber: 118,
      category: "Company Branding"
    },
    // Team Photos
    {
      id: "team-aramis",
      label: "Aramis Figueroa",
      description: "CEO and founder photo in team section",
      currentUrl: "/api/media/15/file",
      filePath: "client/src/components/team.tsx",
      lineNumber: 21,
      category: "Team Photos"
    },
    {
      id: "team-gabriel",
      label: "Gabriel Figueroa",
      description: "CTO photo in team section",
      currentUrl: "/api/media/21/file",
      filePath: "client/src/components/team.tsx",
      lineNumber: 30,
      category: "Team Photos"
    },
    {
      id: "team-aramis-m",
      label: "Aramis M. Figueroa",
      description: "IT/Software Developer photo in team section",
      currentUrl: "https://aramistech.com/wp-content/uploads/2024/09/Grayprofile-pic2-600x600-1.png",
      filePath: "client/src/components/team.tsx",
      lineNumber: 14,
      category: "Team Photos"
    },
    // Section Images
    {
      id: "hero-it-team",
      label: "IT Team Collaboration",
      description: "Professional IT team image in hero section",
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
    {
      id: "contact-skyline",
      label: "South Florida Skyline",
      description: "South Florida skyline image in Contact section",
      currentUrl: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=400",
      filePath: "client/src/components/contact.tsx",
      lineNumber: 217,
      category: "Section Images"
    },
    // Page Backgrounds
    {
      id: "windows10-background",
      label: "Windows 10 Background",
      description: "Clean Windows 10 desktop background image",
      currentUrl: "/attached_assets/cleanwin10image_1750946635072.png",
      filePath: "client/src/pages/windows10-upgrade.tsx",
      lineNumber: 201,
      category: "Page Backgrounds"
    },
    // Video & Media
    {
      id: "testimonial-video-poster",
      label: "Customer Testimonial Poster",
      description: "Video poster image for customer testimonial",
      currentUrl: "https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png",
      filePath: "client/src/pages/windows10-upgrade.tsx",
      lineNumber: 301,
      category: "Video & Media"
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

  const updateImageMutation = useMutation({
    mutationFn: async ({ imageId, newMediaId }: { imageId: string; newMediaId: number }) => {
      return apiRequest("/api/admin/update-website-image", "POST", { imageId, newMediaId });
    },
    onSuccess: () => {
      toast({
        title: "Image Updated",
        description: "Website image has been updated successfully",
      });
      setSelectedImage(null);
      window.location.reload(); // Refresh to show changes
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Company Branding': 'bg-blue-500',
      'Team Photos': 'bg-green-500',
      'Section Images': 'bg-purple-500',
      'Page Backgrounds': 'bg-orange-500',
      'Video & Media': 'bg-red-500',
    };
    return colors[category] || 'bg-gray-500';
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">Visual Image Manager</h3>
        <p className="text-sm text-muted-foreground">
          Click to replace any image across your website with media library assets
        </p>
      </div>

      {Object.entries(groupedImages).map(([category, images]) => (
        <div key={category} className="space-y-4">
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${getCategoryColor(category)}`} />
            <h4 className="font-medium">{category}</h4>
            <Badge variant="secondary">{images.length}</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="relative">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium leading-tight">{image.label}</CardTitle>
                  <p className="text-xs text-muted-foreground leading-tight">
                    {image.description}
                  </p>
                  <p className="text-xs text-gray-500 leading-tight">
                    {image.filePath.replace('client/src/', '')} (line {image.lineNumber})
                  </p>
                </CardHeader>

                <CardContent className="space-y-2">
                  {/* Current Image Preview */}
                  <div className="aspect-[4/3] bg-gray-100 rounded overflow-hidden border">
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
                    <div className="hidden flex items-center justify-center h-full text-gray-500 text-sm">
                      Image not available
                    </div>
                  </div>

                  {/* Current URL - truncated */}
                  <div className="text-xs text-muted-foreground bg-gray-50 p-1.5 rounded font-mono">
                    {image.currentUrl.length > 60 
                      ? `${image.currentUrl.substring(0, 30)}...${image.currentUrl.substring(image.currentUrl.length - 30)}`
                      : image.currentUrl
                    }
                  </div>

                  {/* Media Library Selection */}
                  {selectedImage?.id === image.id ? (
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Select replacement:</p>
                      <div className="grid grid-cols-4 gap-1.5 max-h-32 overflow-y-auto bg-gray-50 p-2 rounded">
                        {mediaFiles.map((file) => (
                          <div
                            key={file.id}
                            className="cursor-pointer group relative aspect-square bg-white rounded overflow-hidden hover:ring-2 hover:ring-blue-500 shadow-sm"
                            onClick={() => handleImageReplace(image.id, file.id)}
                            title={`ID: ${file.id} - ${file.originalName}`}
                          >
                            <img
                              src={`/api/media/${file.id}/file`}
                              alt={file.altText || file.originalName}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                              <Check className="h-3 w-3 text-white" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white text-xs px-1 py-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {file.id}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedImage(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={() => setSelectedImage(image)}
                        disabled={updateImageMutation.isPending}
                        className="bg-blue-600 hover:bg-blue-700"
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
    </div>
  );
}