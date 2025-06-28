import { useQuery } from "@tanstack/react-query";

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

interface MediaGalleryProps {
  className?: string;
  maxImages?: number;
  showCaptions?: boolean;
}

export default function MediaGallery({ className = "", maxImages = 6, showCaptions = true }: MediaGalleryProps) {
  const { data: mediaData, isLoading } = useQuery<{ success: boolean; files: MediaFile[] }>({
    queryKey: ["/api/admin/media"],
  });

  const files = mediaData?.files || [];
  const displayFiles = maxImages ? files.slice(0, maxImages) : files;

  if (isLoading) {
    return (
      <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
        {Array.from({ length: maxImages }).map((_, i) => (
          <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
        ))}
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  return (
    <div className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${className}`}>
      {displayFiles.map((file) => (
        <div key={file.id} className="group">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={file.url}
              alt={file.altText || file.originalName}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          </div>
          {showCaptions && (file.caption || file.altText) && (
            <p className="mt-2 text-sm text-gray-600 text-center">
              {file.caption || file.altText}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}