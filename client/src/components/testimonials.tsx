import React from 'react';
import { Star } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';

interface Review {
  text: string;
  author: string;
  rating: number;
  location: string;
}

export default function Testimonials() {
  // Fetch reviews from the admin database
  const { data: databaseData, isLoading } = useQuery({
    queryKey: ['/api/reviews/database'],
    staleTime: 1000 * 60 * 10,
  });

  // Transform database reviews to display format and limit to 6
  const reviews: Review[] = databaseData?.reviews 
    ? databaseData.reviews
        .filter((r: any) => r.isVisible) // Only show visible reviews
        .slice(0, 6) // Limit to 6 reviews
        .map((r: any) => ({
          text: r.reviewText,
          author: r.customerName,
          rating: r.rating,
          location: r.location || "South Florida"
        }))
    : [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  if (isLoading) {
    return (
      <section className="py-20 bg-light-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary-blue"></div>
          <p className="mt-4 text-gray-600">Loading customer reviews...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-professional-gray mb-4">
            What Our Clients Say
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trusted by South Florida businesses for over 27 years
          </p>
          
          {/* Business Rating Summary */}
          {reviews.length > 0 && (
            <div className="flex items-center justify-center mt-6">
              <div className="flex items-center">
                {renderStars(5)}
              </div>
              <span className="text-lg font-semibold ml-2">5.0</span>
              <span className="text-gray-600 ml-2">({reviews.length} reviews)</span>
            </div>
          )}
        </div>
        
        {/* Reviews Grid - 3x2 Layout */}
        {reviews.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-8">
            {reviews.map((review, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300">
                {/* Stars */}
                <div className="flex items-center mb-4">
                  {renderStars(review.rating)}
                </div>
                
                {/* Review Text */}
                <p className="text-gray-700 mb-4 leading-relaxed">
                  "{review.text.length > 200 ? `${review.text.substring(0, 200)}...` : review.text}"
                </p>
                
                {/* Author and Location */}
                <div className="border-t pt-4">
                  <p className="font-semibold text-professional-gray">{review.author}</p>
                  <p className="text-sm text-gray-500">{review.location}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center bg-white p-8 rounded-xl shadow-lg max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold text-professional-gray mb-4">Client Testimonials</h3>
            <p className="text-gray-600">Customer reviews are being loaded...</p>
          </div>
        )}
      </div>
    </section>
  );
}