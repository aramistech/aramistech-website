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

        {/* Step 2: View Your Images */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">2</Badge>
              View Your Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">
              All your uploaded images are available right here in the Media Library tab.
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

        {/* Step 3: Simple Image Picker */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">3</Badge>
              Quick Image Picker
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              Click any image below to get its URL ready to copy and paste:
            </p>
            
            {mediaFiles.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {mediaFiles.map((file) => (
                  <div key={file.id} className="group cursor-pointer">
                    <div 
                      className={`relative border-2 rounded-lg overflow-hidden transition-all ${
                        selectedImageId === file.id 
                          ? 'border-aramis-orange ring-2 ring-aramis-orange ring-opacity-30' 
                          : 'border-gray-200 hover:border-aramis-orange'
                      }`}
                      onClick={() => setSelectedImageId(file.id)}
                    >
                      <img 
                        src={`/api/admin/media/${file.id}/file`}
                        alt={file.altText || file.originalName}
                        className="w-full h-24 object-cover"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all" />
                      {selectedImageId === file.id && (
                        <div className="absolute top-1 right-1 bg-aramis-orange text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                          ✓
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 mt-1 truncate">{file.originalName}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Image className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No images uploaded yet</p>
                <p className="text-xs">Go to Media Library tab to add images</p>
              </div>
            )}

            {selectedImageId && (
              <div className="border rounded-lg p-4 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm font-medium text-green-700">Ready to Copy!</p>
                  <Button
                    size="sm"
                    className="bg-aramis-orange hover:bg-orange-600 text-white"
                    onClick={() => {
                      copyToClipboard(`/api/media/${selectedImageId}/file`);
                      // Show visual feedback
                      const button = document.activeElement as HTMLButtonElement;
                      if (button) {
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        setTimeout(() => {
                          button.textContent = originalText;
                        }, 1000);
                      }
                    }}
                  >
                    <Copy className="w-3 h-3 mr-1" />
                    Copy URL
                  </Button>
                </div>
                <div className="bg-white p-3 rounded border">
                  <code className="text-sm break-all font-mono text-blue-700">
                    /api/admin/media/{selectedImageId}/file
                  </code>
                </div>
                <p className="text-xs text-gray-600 mt-2">
                  Paste this URL anywhere you want to use this image on your website
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Step 4: How to Use */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Badge variant="outline" className="w-8 h-8 flex items-center justify-center">4</Badge>
              How to Replace Images
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm font-medium text-blue-800 mb-2">Simple 3-Step Process:</p>
                <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
                  <li>Click an image above to select it</li>
                  <li>Click "Copy URL" to copy the image link</li>
                  <li>Paste the URL wherever you want to use the image</li>
                </ol>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">For HTML files:</p>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
                  &lt;img src="/api/admin/media/YOUR_IMAGE_ID/file" alt="Description" /&gt;
                </div>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">For CSS backgrounds:</p>
                <div className="bg-gray-900 text-green-400 p-3 rounded text-xs font-mono">
                  background-image: url('/api/admin/media/YOUR_IMAGE_ID/file');
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>Pro Tip:</strong> The image URL works immediately after copying - no need to save or reload anything!
                </p>
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