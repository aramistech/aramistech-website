import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Copy, Check, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

interface MediaFile {
  id: number;
  fileName: string;
  originalName: string;
  filePath: string;
  altText?: string;
  uploadedAt: Date;
}

export default function QuickImageReplacer() {
  const { toast } = useToast();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const { data: mediaFiles = [], isLoading } = useQuery<MediaFile[]>({
    queryKey: ["/api/admin/media"],
  });

  const copyImageUrl = async (id: number) => {
    const url = `/api/media/${id}/file`;
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(id);
      toast({
        title: "URL Copied!",
        description: `Image URL copied: ${url}`,
      });
      
      // Reset the copied state after 2 seconds
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy URL to clipboard",
        variant: "destructive",
      });
    }
  };

  const openCodeLocation = (searchText: string) => {
    // This will help users find where to paste the URL
    toast({
      title: "Find & Replace",
      description: `Search for "${searchText}" in your code files to replace the image URL`,
    });
  };

  if (isLoading) {
    return <div className="text-center py-8">Loading images...</div>;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ExternalLink className="w-5 h-5" />
          Quick Image Replacer
        </CardTitle>
        <p className="text-sm text-gray-600">
          Click any image to copy its URL, then paste it in your code to replace existing images.
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Common Image Locations */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">Common Image Locations:</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Team Photos:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCodeLocation("client/src/components/team.tsx")}
              >
                Open team.tsx
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">Hero Section:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCodeLocation("client/src/components/hero.tsx")}
              >
                Open hero.tsx
              </Button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-700">About Section:</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCodeLocation("client/src/components/about.tsx")}
              >
                Open about.tsx
              </Button>
            </div>
          </div>
        </div>

        {/* Image Grid */}
        <div>
          <h3 className="font-semibold mb-3">Available Images (Click to Copy URL):</h3>
          {mediaFiles.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {mediaFiles.map((file) => (
                <div key={file.id} className="group cursor-pointer">
                  <div 
                    className="relative border-2 rounded-lg overflow-hidden transition-all hover:border-aramis-orange hover:shadow-lg"
                    onClick={() => copyImageUrl(file.id)}
                  >
                    <img 
                      src={`/api/admin/media/${file.id}/file`}
                      alt={file.altText || file.originalName}
                      className="w-full h-32 object-cover"
                    />
                    
                    {/* ID Badge */}
                    <Badge className="absolute top-2 left-2 bg-blue-600 text-white">
                      ID: {file.id}
                    </Badge>
                    
                    {/* Copy Button Overlay */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        {copiedId === file.id ? (
                          <div className="bg-green-600 text-white px-3 py-2 rounded-lg flex items-center gap-2">
                            <Check className="w-4 h-4" />
                            Copied!
                          </div>
                        ) : (
                          <div className="bg-aramis-orange text-white px-3 py-2 rounded-lg flex items-center gap-2">
                            <Copy className="w-4 h-4" />
                            Click to Copy URL
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 truncate">{file.originalName}</p>
                    <p className="text-xs font-mono text-blue-600">/api/media/{file.id}/file</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No images uploaded yet. Upload some images first!
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="bg-yellow-50 p-4 rounded-lg">
          <h3 className="font-semibold text-yellow-900 mb-2">How to Replace Images:</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-yellow-800">
            <li>Click any image above to copy its URL</li>
            <li>Open the code file where you want to replace an image</li>
            <li>Find the old image URL (like "https://..." or "/api/media/20/file")</li>
            <li>Replace it with the new URL you just copied</li>
            <li>Save the file - the image will update automatically!</li>
          </ol>
        </div>
      </CardContent>
    </Card>
  );
}