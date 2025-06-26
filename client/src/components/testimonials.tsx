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
  const { data: reviewsData, isLoading, error } = useQuery<ReviewsResponse>({
    queryKey: ['/api/reviews'],
    queryFn: async () => {
      const response = await fetch('/api/reviews');
      if (!response.ok) {
        throw new Error('Failed to fetch reviews');
      }
      return response.json();
    },
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });

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

        {error && (
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <p className="text-gray-600 mb-4">We're working on connecting your Google Business reviews.</p>
            <p className="text-sm text-gray-500">Your AramisTech reviews will appear here once the Google Business connection is configured.</p>
          </div>
        )}
        
        {reviewsData?.reviews && (
          <div className="grid lg:grid-cols-3 gap-8">
            {reviewsData.reviews.slice(0, 3).map((review, index) => (
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
