import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Image, ArrowRight, Save, Upload, Copy } from 'lucide-react';

interface MediaFile {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  altText?: string;
  uploadedAt: string;
}

export default function ImageReplacementDemo() {
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  const { data: mediaResponse, isLoading } = useQuery<{ success: boolean; files: MediaFile[] }>({
    queryKey: ['/api/admin/media'],
  });

  const mediaFiles: MediaFile[] = mediaResponse?.files || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-aramis-orange mx-auto mb-2"></div>
          <p className="text-gray-600">Loading media files...</p>
        </div>
      </div>
    );
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Step-by-step Guide */}
      <div className="grid gap-6">
        {/* Step 1: Upload Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">1</Badge>
              Upload or Scan Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              First, add images to your media library using the "Media Library" tab. You can:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Drag and drop images directly</li>
              <li>Import from any URL</li>
              <li>Scan entire websites for images</li>
            </ul>
          </CardContent>
        </Card>

        {/* Step 2: View Gallery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">2</Badge>
              View Your Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              Use the "Gallery" tab to see all your uploaded images in one place.
            </p>
            {mediaFiles.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {mediaFiles.slice(0, 4).map((file) => (
                  <div key={file.id} className="relative group">
                    <img 
                      src={`/api/admin/media/${file.id}/file`}
                      alt={file.altText || file.originalName}
                      className="w-full h-20 object-cover rounded border cursor-pointer hover:opacity-80"
                      onClick={() => setSelectedImageId(file.id)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded transition-all" />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 3: Use Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">3</Badge>
              Use Images on Your Website
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Replace any image on your website with this simple URL format:
            </p>
            
            <div className="bg-gray-100 p-4 rounded-lg">
              <code className="text-sm font-mono">
                /api/admin/media/[IMAGE_ID]/file
              </code>
              <Button
                size="sm"
                variant="outline"
                className="ml-2"
                onClick={() => copyToClipboard('/api/admin/media/[IMAGE_ID]/file')}
              >
                <Copy className="w-3 h-3 mr-1" />
                Copy
              </Button>
            </div>

            {selectedImageId && (
              <div className="border rounded-lg p-4 bg-green-50">
                <p className="text-sm font-medium text-green-700 mb-2">Selected Image Example:</p>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <img 
                      src={`/api/admin/media/${selectedImageId}/file`}
                      alt="Selected"
                      className="w-full h-32 object-cover rounded"
                    />
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium">URL for this image:</p>
                    <div className="bg-white p-2 rounded border">
                      <code className="text-xs break-all">
                        /api/admin/media/{selectedImageId}/file
                      </code>
                      <Button
                        size="sm"
                        variant="outline"
                        className="ml-2"
                        onClick={() => copyToClipboard(`/api/admin/media/${selectedImageId}/file`)}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Code Examples */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">4</Badge>
              Code Examples
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm font-medium mb-2">HTML Image Tag:</p>
              <div className="bg-black text-green-400 p-3 rounded text-xs font-mono">
                &lt;img src="/api/admin/media/123/file" alt="Description" /&gt;
              </div>
            </div>
            
            <div>
              <p className="text-sm font-medium mb-2">React/JSX:</p>
              <div className="bg-black text-green-400 p-3 rounded text-xs font-mono">
                &lt;img src={`/api/admin/media/$&#123;imageId&#125;/file`} alt="Description" /&gt;
              </div>
            </div>

            <div>
              <p className="text-sm font-medium mb-2">CSS Background:</p>
              <div className="bg-black text-green-400 p-3 rounded text-xs font-mono">
                background-image: url('/api/admin/media/123/file');
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Use Cases */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-blue-800">Common Use Cases</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <ul className="space-y-2">
                <li><strong>Hero Images:</strong> Main page banners</li>
                <li><strong>Service Cards:</strong> Icons and illustrations</li>
                <li><strong>Team Photos:</strong> Staff member pictures</li>
                <li><strong>Testimonials:</strong> Customer photos</li>
              </ul>
              <ul className="space-y-2">
                <li><strong>Blog Posts:</strong> Article featured images</li>
                <li><strong>Portfolio:</strong> Project screenshots</li>
                <li><strong>Products:</strong> Service illustrations</li>
                <li><strong>Backgrounds:</strong> Section backgrounds</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}