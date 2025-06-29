import React, { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Check, RefreshCw } from "lucide-react";
import { queryClient } from "@/lib/queryClient";

interface MediaFile {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  altText?: string;
}

interface ImageMapping {
  id: string;
  label: string;
  category: string;
  currentUrl: string;
  filePath: string;
  lineNumber: number;
}

const websiteImages: ImageMapping[] = [
  {
    id: "header-logo",
    label: "Header Logo",
    category: "Company Branding",
    currentUrl: "/api/media/4/file",
    filePath: "client/src/components/header.tsx",
    lineNumber: 140
  },
  {
    id: "footer-logo", 
    label: "Footer Logo",
    category: "Company Branding",
    currentUrl: "/api/media/4/file",
    filePath: "client/src/components/footer.tsx",
    lineNumber: 29
  },
  {
    id: "dynamic-header-logo",
    label: "Mobile Header Logo",
    category: "Company Branding", 
    currentUrl: "/api/media/4/file",
    filePath: "client/src/components/dynamic-header.tsx",
    lineNumber: 356
  },
  {
    id: "exit-popup-logo",
    label: "Exit Popup Logo",
    category: "Company Branding",
    currentUrl: "/api/media/4/file", 
    filePath: "client/src/components/exit-intent-popup.tsx",
    lineNumber: 235
  },
  {
    id: "aramis-photo",
    label: "Aramis Figueroa (IT NETWORK SPECIALIST)",
    category: "Team Photos",
    currentUrl: "/api/media/15/file",
    filePath: "client/src/components/team.tsx",
    lineNumber: 7
  },
  {
    id: "aramis-m-photo",
    label: "Aramis M Figueroa (IT / SOFTWARE DEVELOPER)", 
    category: "Team Photos",
    currentUrl: "/api/media/16/file",
    filePath: "client/src/components/team.tsx", 
    lineNumber: 14
  },
  {
    id: "gabriel-photo",
    label: "Gabriel Figueroa (IT TECHNICIAN)",
    category: "Team Photos",
    currentUrl: "/api/media/21/file",
    filePath: "client/src/components/team.tsx",
    lineNumber: 21
  },
  {
    id: "hero-image",
    label: "Hero IT Team",
    category: "Section Images",
    currentUrl: "https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600",
    filePath: "client/src/components/hero.tsx",
    lineNumber: 91
  },
  {
    id: "about-image",
    label: "About Office",
    category: "Section Images", 
    currentUrl: "/api/media/26/file",
    filePath: "client/src/components/about.tsx",
    lineNumber: 17
  },
  {
    id: "contact-image",
    label: "Contact Skyline",
    category: "Section Images",
    currentUrl: "/api/media/27/file",
    filePath: "client/src/components/contact.tsx",
    lineNumber: 217
  },
  {
    id: "windows10-bg",
    label: "Windows 10 Background",
    category: "Page Backgrounds",
    currentUrl: "/windows10-bg.png",
    filePath: "client/src/pages/windows10-upgrade.tsx",
    lineNumber: 151
  },
  {
    id: "testimonial-poster",
    label: "Testimonial Video Poster",
    category: "Video & Media",
    currentUrl: "/api/media/34/file",
    filePath: "client/src/pages/windows10-upgrade.tsx", 
    lineNumber: 253
  }
];

export default function VisualImageManager() {
  const [selectedImage, setSelectedImage] = useState<ImageMapping | null>(null);
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);
  const [currentUrls, setCurrentUrls] = useState<Record<string, string>>({});
  const { toast } = useToast();

  // Fetch current URLs from actual files
  const fetchCurrentUrls = async () => {
    try {
      const response = await fetch('/api/admin/scan-images');
      if (response.ok) {
        const data = await response.json();
        const urlMap: Record<string, string> = {};
        
        data.images?.forEach((img: any) => {
          if (img.id === 'windows10-bg') {
            urlMap['windows10-bg'] = img.currentUrl;
          }
          if (img.id === 'testimonial-poster') {
            urlMap['testimonial-poster'] = img.currentUrl;
          }
        });
        
        setCurrentUrls(urlMap);
      }
    } catch (error) {
      console.error('Failed to fetch current URLs:', error);
    }
  };

  useEffect(() => {
    fetchCurrentUrls();
  }, []);

  const { data: mediaResponse, isLoading: isLoadingMedia } = useQuery({
    queryKey: ["/api/admin/media"],
    retry: false,
  });

  const mediaFiles: MediaFile[] = (mediaResponse as any)?.files || [];

  const groupedImages = websiteImages.reduce((groups, image) => {
    const category = image.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(image);
    return groups;
  }, {} as Record<string, ImageMapping[]>);

  const replaceImageMutation = useMutation({
    mutationFn: async ({ imageId, newUrl }: { imageId: string; newUrl: string }) => {
      const response = await fetch("/api/admin/replace-image", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          imageId,
          newUrl,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: (data, variables) => {
      toast({
        title: "Image Updated",
        description: "Image has been successfully replaced on your website",
      });
      setIsImageSelectorOpen(false);
      setSelectedImage(null);

      const imageIndex = websiteImages.findIndex(img => img.id === variables.imageId);
      if (imageIndex !== -1) {
        websiteImages[imageIndex].currentUrl = variables.newUrl;
      }
    },
    onError: (error: any) => {
      console.error("Image replacement error:", error);
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update image",
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = (mediaFile: MediaFile) => {
    if (!selectedImage) return;

    const newUrl = `/api/media/${mediaFile.id}/file`;
    replaceImageMutation.mutate({
      imageId: selectedImage.id,
      newUrl: newUrl,
    });
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      "Company Branding": "bg-blue-500",
      "Team Photos": "bg-green-500", 
      "Section Images": "bg-purple-500",
      "Page Backgrounds": "bg-orange-500",
      "Video & Media": "bg-pink-500",
    };
    return colors[category as keyof typeof colors] || "bg-gray-500";
  };

  if (isLoadingMedia) {
    return (
      <div className="flex items-center justify-center py-8">
        <RefreshCw className="h-6 w-6 animate-spin mr-2" />
        <span>Loading images...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Visual Image Manager</h2>
          <p className="text-gray-600 mt-1">
            Manage and replace images across your website with visual previews
          </p>
        </div>
        <Badge variant="outline" className="px-3 py-1">
          {websiteImages.length} Images
        </Badge>
      </div>

      <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Preview
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Image Details
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Location
              </th>
              <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Object.entries(groupedImages).map(([category, images]) => [
              <tr key={`category-${category}`} className="bg-gray-50">
                <td colSpan={4} className="px-3 py-1.5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${getCategoryColor(category)}`}></div>
                    <span className="text-sm font-medium text-gray-700">{category}</span>
                    <Badge variant="secondary" className="text-xs h-4 px-1.5">{images.length}</Badge>
                  </div>
                </td>
              </tr>,
              ...images.map((image) => (
                <tr key={image.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-3 py-2">
                    <div className="w-24 h-16 bg-gray-100 rounded border overflow-hidden">
                      <img
                        src={currentUrls[image.id] || image.currentUrl}
                        alt={image.label}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          target.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center text-xs text-gray-400"><svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clip-rule="evenodd"></path></svg></div>';
                        }}
                      />
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{image.label}</div>
                      <div className="text-xs text-gray-500 mt-1 truncate max-w-xs">
                        {currentUrls[image.id] || image.currentUrl}
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="text-xs text-gray-600">
                      <div>{image.filePath}</div>
                      <div className="text-gray-400">Line {image.lineNumber}</div>
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setSelectedImage(image);
                        setIsImageSelectorOpen(true);
                      }}
                      className="text-xs"
                    >
                      Replace
                    </Button>
                  </td>
                </tr>
              ))
            ]).flat()}
          </tbody>
        </table>
      </div>

      <Dialog open={isImageSelectorOpen} onOpenChange={setIsImageSelectorOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              Replace: {selectedImage?.label}
            </DialogTitle>
          </DialogHeader>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-4">
            {mediaFiles.map((file) => (
              <div
                key={file.id}
                className="group cursor-pointer bg-gray-50 rounded-lg overflow-hidden hover:bg-gray-100 transition-colors"
                onClick={() => handleImageSelect(file)}
              >
                <div className="aspect-square relative">
                  <img
                    src={`/api/media/${file.id}/file`}
                    alt={file.altText || file.originalName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <Check className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <div className="p-2">
                  <p className="text-xs text-gray-600 truncate">{file.originalName}</p>
                  <p className="text-xs text-gray-400">ID: {file.id}</p>
                </div>
              </div>
            ))}
          </div>

          {mediaFiles.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 text-gray-300" />
              <p>No media files available</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}