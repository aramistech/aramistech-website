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

  const { data: mediaResponse } = useQuery({
    queryKey: ['/api/admin/media'],
  });

  const mediaFiles: MediaFile[] = mediaResponse?.files || [];

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="w-5 h-5" />
            How to Replace Website Images with Media Library
          </CardTitle>
          <CardDescription>
            This demo shows how to integrate your media library images throughout your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Hero Section Example */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Hero Section Image</h3>
              <Badge variant="outline">Example 1</Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Before */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Before (Static Image):</p>
                <div className="bg-gray-100 rounded-lg p-4 text-center">
                  <img 
                    src="/placeholder-hero.jpg" 
                    alt="Static hero"
                    className="w-full h-32 object-cover rounded bg-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling!.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none' }} className="w-full h-32 bg-gray-200 rounded flex items-center justify-center">
                    <span className="text-gray-500">Static Image</span>
                  </div>
                  <code className="text-xs">src="/static-hero.jpg"</code>
                </div>
              </div>

              {/* After */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600">After (Media Library):</p>
                <div className="space-y-2">
                  <ImagePicker
                    value={heroImageId}
                    onChange={setHeroImageId}
                    label="Select Hero Image"
                  />
                  {heroImageId && (
                    <div className="bg-green-50 rounded-lg p-4">
                      <img 
                        src={`/api/admin/media/${heroImageId}/file`}
                        alt="Selected hero"
                        className="w-full h-32 object-cover rounded"
                      />
                      <code className="text-xs">src="/api/admin/media/{heroImageId}/file"</code>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Service Card Example */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Service Card Image</h3>
              <Badge variant="outline">Example 2</Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Before */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Before:</p>
                <Card className="bg-gray-100">
                  <div className="w-full h-24 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-500 text-sm">Static Service Image</span>
                  </div>
                  <CardContent className="p-3">
                    <h4 className="font-medium">IT Support Service</h4>
                    <p className="text-sm text-gray-600">24/7 technical support</p>
                  </CardContent>
                </Card>
              </div>

              {/* After */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600">After:</p>
                <div className="space-y-2">
                  <ImagePicker
                    value={serviceImageId}
                    onChange={setServiceImageId}
                    label="Select Service Image"
                  />
                  {serviceImageId ? (
                    <Card className="bg-green-50">
                      <img 
                        src={`/api/admin/media/${serviceImageId}/file`}
                        alt="Service"
                        className="w-full h-24 object-cover rounded-t-lg"
                      />
                      <CardContent className="p-3">
                        <h4 className="font-medium">IT Support Service</h4>
                        <p className="text-sm text-gray-600">24/7 technical support</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border-dashed border-2 border-gray-300">
                      <CardContent className="p-6 text-center">
                        <p className="text-gray-500">Select an image to see preview</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Team Member Example */}
          <div className="border rounded-lg p-4 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Team Member Photo</h3>
              <Badge variant="outline">Example 3</Badge>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              {/* Before */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-600">Before:</p>
                <div className="text-center space-y-2">
                  <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto flex items-center justify-center">
                    <span className="text-gray-500 text-xs">Photo</span>
                  </div>
                  <div>
                    <h4 className="font-medium">John Doe</h4>
                    <p className="text-sm text-gray-600">Senior Technician</p>
                  </div>
                </div>
              </div>

              {/* After */}
              <div className="space-y-2">
                <p className="text-sm font-medium text-green-600">After:</p>
                <div className="space-y-2">
                  <ImagePicker
                    value={teamImageId}
                    onChange={setTeamImageId}
                    label="Select Team Photo"
                  />
                  {teamImageId && (
                    <div className="text-center space-y-2 bg-green-50 p-4 rounded-lg">
                      <img 
                        src={`/api/admin/media/${teamImageId}/file`}
                        alt="Team member"
                        className="w-20 h-20 rounded-full mx-auto object-cover"
                      />
                      <div>
                        <h4 className="font-medium">John Doe</h4>
                        <p className="text-sm text-gray-600">Senior Technician</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Code Example */}
          <div className="border rounded-lg p-4 space-y-4 bg-gray-50">
            <h3 className="text-lg font-semibold">Implementation Code</h3>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">1. Add ImagePicker to your admin forms:</p>
                <pre className="bg-black text-green-400 p-3 rounded text-xs overflow-x-auto">
{`<ImagePicker
  value={selectedImageId}
  onChange={setSelectedImageId}
  label="Select Image"
/>`}
                </pre>
              </div>
              
              <div>
                <p className="text-sm font-medium mb-2">2. Display the selected image:</p>
                <pre className="bg-black text-green-400 p-3 rounded text-xs overflow-x-auto">
{`<img 
  src={\`/api/admin/media/\${imageId}/file\`}
  alt="Description"
  className="w-full h-auto rounded-lg"
/>`}
                </pre>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">3. Save image ID to database and use throughout site</p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center pt-4">
            <Button 
              onClick={handleSaveChanges}
              className="bg-aramis-orange hover:bg-orange-600 text-white"
              disabled={!heroImageId && !serviceImageId && !teamImageId}
            >
              <Save className="w-4 h-4 mr-2" />
              Save Image Changes
            </Button>
          </div>

        </CardContent>
      </Card>

      {/* Summary Card */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">Quick Steps Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Upload/Scan Images:</strong> Use Media Library tab to add images</li>
            <li><strong>Select Images:</strong> Use ImagePicker component in admin forms</li>
            <li><strong>Save Configuration:</strong> Store image IDs in your database</li>
            <li><strong>Display Images:</strong> Use `/api/admin/media/{id}/file` URL format</li>
            <li><strong>View Results:</strong> Check Gallery tab to see all your images</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}