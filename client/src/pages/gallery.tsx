import DynamicHeader from "@/components/dynamic-header";
import Footer from "@/components/footer";
import MediaGallery from "@/components/media-gallery";
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

export default function Gallery() {
  const { data: mediaData, isLoading } = useQuery<{ success: boolean; files: MediaFile[] }>({
    queryKey: ["/api/admin/media"],
  });

  const files = mediaData?.files || [];

  return (
    <div className="min-h-screen">
      <DynamicHeader />
      
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
              Media Gallery
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Explore our collection of images from our media library. 
              These images are managed through our admin system and can be used throughout the website.
            </p>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square bg-gray-200 animate-pulse rounded-lg"></div>
              ))}
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-20">
              <div className="w-24 h-24 mx-auto mb-6 bg-gray-200 rounded-lg flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">No Images Yet</h3>
              <p className="text-gray-600 mb-8">
                Images uploaded to the media library will appear here. 
                Use the admin dashboard to upload or scan images from websites.
              </p>
            </div>
          ) : (
            <div className="space-y-12">
              {/* Hero Image */}
              {files[0] && (
                <div className="relative rounded-2xl overflow-hidden">
                  <img
                    src={files[0].url}
                    alt={files[0].altText || files[0].originalName}
                    className="w-full h-96 object-cover"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                    <div className="text-center text-white">
                      <h2 className="text-3xl font-bold mb-2">Featured Image</h2>
                      <p className="text-lg">{files[0].caption || files[0].originalName}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Gallery Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {files.slice(1).map((file) => (
                  <div key={file.id} className="group cursor-pointer">
                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 mb-4">
                      <img
                        src={file.url}
                        alt={file.altText || file.originalName}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-gray-900 group-hover:text-aramis-orange transition-colors">
                        {file.originalName}
                      </h3>
                      {file.caption && (
                        <p className="text-sm text-gray-600">{file.caption}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-400">
                        <span>{(file.fileSize / 1024).toFixed(1)} KB</span>
                        <span>{new Date(file.uploadedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {files.length > 0 && (
                <div className="text-center py-8">
                  <p className="text-lg text-gray-600">
                    Showing {files.length} image{files.length !== 1 ? 's' : ''} from media library
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}