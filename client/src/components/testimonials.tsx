import { Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface GoogleReview {
  text: string;
  author: string;
  rating: number;
  time: number;
  profile_photo?: string;
}

interface ReviewsResponse {
  success: boolean;
  reviews: GoogleReview[];
  business: {
    rating: number;
    user_ratings_total: number;
  };
}

export default function Testimonials() {
  // Primary: Use database reviews (authentic AramisTech customer reviews)
  const { data: databaseData, isLoading: dbLoading } = useQuery({
    queryKey: ['/api/reviews/database'],
    staleTime: 1000 * 60 * 10,
  });

  // Fallback: Google reviews only if no database reviews exist
  const urlParams = new URLSearchParams(window.location.search);
  const testPlaceId = urlParams.get('place_id');
  
  const { data: googleData, isLoading: googleLoading } = useQuery<ReviewsResponse>({
    queryKey: ['/api/reviews', testPlaceId],
    queryFn: async () => {
      const url = testPlaceId ? `/api/reviews?place_id=${testPlaceId}` : '/api/reviews';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    enabled: !databaseData?.reviews?.length,
    staleTime: 1000 * 60 * 30,
  });

  const isLoading = dbLoading || googleLoading;
  
  // Transform database reviews to match expected format
  const reviewsData = databaseData?.reviews?.length ? {
    success: true,
    reviews: databaseData.reviews.map((r: any) => ({
      text: r.reviewText,
      author: r.customerName,
      rating: r.rating,
      time: new Date(r.datePosted).getTime() / 1000,
      location: r.location
    })),
    business: {
      rating: 5.0,
      user_ratings_total: databaseData.reviews.length
    }
  } : googleData;

  return (
    <section className="py-20 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary-blue font-semibold text-lg">// Client Testimonials</span>
          <h2 className="text-4xl font-bold text-professional-gray mb-6 mt-4">What Our Clients Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Real reviews from businesses that trust AramisTech for their IT solutions and experience our commitment to excellence.
          </p>
          {reviewsData?.business && (
            <div className="flex items-center justify-center mt-4">
              <div className="flex text-yellow-400 mr-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className={`w-5 h-5 ${i < Math.floor(reviewsData.business.rating) ? 'fill-current' : ''}`} />
                ))}
              </div>
              <span className="text-lg font-semibold">{reviewsData.business.rating}</span>
              <span className="text-gray-600 ml-2">({reviewsData.business.user_ratings_total} reviews)</span>
            </div>
          )}
        </div>
        
        {isLoading && (
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
            <p className="mt-4 text-gray-600">Loading authentic customer reviews...</p>
          </div>
        )}

        {!isLoading && !reviewsData?.success && (
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-professional-gray mb-4">Client Testimonials Coming Soon</h3>
            <p className="text-gray-600 mb-4">We're connecting your authentic AramisTech Google Business reviews.</p>
            <div className="bg-blue-50 p-4 rounded-lg mb-4">
              <p className="text-sm text-blue-800">
                <strong>To display your reviews:</strong> Get your Google Business Place ID from your Business Profile dashboard at business.google.com
              </p>
            </div>
            <p className="text-sm text-gray-500">Your customer reviews will display here automatically once configured.</p>
          </div>
        )}
        
        {reviewsData?.reviews && (
          <div className="grid lg:grid-cols-3 gap-8">
            {reviewsData.reviews.slice(0, 3).map((review: any, index: number) => (
              <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
                <div className="flex items-center mb-6">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-5 h-5 ${i < review.rating ? 'fill-current' : ''}`} />
                    ))}
                  </div>
                </div>
                <p className="text-gray-600 mb-6 italic">
                  "{review.text}"
                </p>
                <div className="flex items-center">
                  <img 
                    src={review.profile_photo || `https://ui-avatars.com/api/?name=${encodeURIComponent(review.author)}&background=4F46E5&color=fff`} 
                    alt={`${review.author} review`} 
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <h4 className="font-semibold">{review.author}</h4>
                    <p className="text-sm text-gray-600">Google Review</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
