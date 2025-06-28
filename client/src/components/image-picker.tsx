import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Search, Image as ImageIcon } from "lucide-react";

interface MediaFile {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  filePath: string;
  url: string;
  altText?: string;
  caption?: string;
  uploadedAt: string;
  updatedAt: string;
}

interface ImagePickerProps {
  onSelect: (imageUrl: string, altText?: string) => void;
  selectedImage?: string;
  trigger?: React.ReactNode;
  placeholder?: string;
}

export default function ImagePicker({ onSelect, selectedImage, trigger, placeholder = "Select an image" }: ImagePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const { data: mediaData, isLoading } = useQuery<{ success: boolean; files: MediaFile[] }>({
    queryKey: ["/api/admin/media"],
    enabled: isOpen, // Only fetch when dialog is open
  });

  const files = mediaData?.files || [];

  // Filter files based on search term
  const filteredFiles = files.filter(file => 
    file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (file.altText && file.altText.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (file.caption && file.caption.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleSelect = (file: MediaFile) => {
    onSelect(file.url, file.altText);
    setIsOpen(false);
  };

  const defaultTrigger = (
    <Button variant="outline" className="w-full justify-start">
      <ImageIcon className="w-4 h-4 mr-2" />
      {selectedImage ? "Change Image" : placeholder}
    </Button>
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>Select Image from Media Library</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
          {/* Search */}
          <div className="space-y-2">
            <Label htmlFor="search-images">Search Images</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                id="search-images"
                placeholder="Search by filename, alt text, or caption..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Image Grid */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-12 text-gray-500">
                Loading media library...
              </div>
            ) : filteredFiles.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg font-medium mb-2">
                  {searchTerm ? "No images found" : "No images in library"}
                </p>
                <p className="text-sm">
                  {searchTerm ? "Try different search terms" : "Upload images to get started"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filteredFiles.map((file) => (
                  <div 
                    key={file.id} 
                    className={`group relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all hover:border-aramis-orange ${
                      selectedImage === file.url ? 'border-aramis-orange ring-2 ring-orange-200' : 'border-gray-200'
                    }`}
                    onClick={() => handleSelect(file)}
                  >
                    <div className="aspect-square bg-gray-100">
                      <img
                        src={file.url}
                        alt={file.altText || file.originalName}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                    </div>
                    
                    {/* Overlay with details */}
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-opacity duration-200 flex items-center justify-center">
                      <div className="text-white text-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-2">
                        <p className="text-sm font-medium truncate mb-1">{file.originalName}</p>
                        <Badge variant="secondary" className="text-xs">
                          {(file.fileSize / 1024).toFixed(1)} KB
                        </Badge>
                      </div>
                    </div>

                    {/* Selected indicator */}
                    {selectedImage === file.url && (
                      <div className="absolute top-2 right-2 w-6 h-6 bg-aramis-orange rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer Info */}
          <div className="border-t pt-4 text-sm text-gray-500">
            <p>Select an image to use on your website. Images are automatically optimized for web use.</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}