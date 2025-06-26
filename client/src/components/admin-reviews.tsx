import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, Plus, Trash2 } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: number;
  customerName: string;
  rating: number;
  reviewText: string;
  businessName?: string;
  location?: string;
  datePosted: string;
  source: string;
  isVisible: boolean;
}

interface ReviewFormData {
  customerName: string;
  rating: number;
  reviewText: string;
  businessName: string;
  location: string;
  source: string;
}

export default function AdminReviews() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<ReviewFormData>({
    customerName: "",
    rating: 5,
    reviewText: "",
    businessName: "AramisTech",
    location: "South Florida",
    source: "manual"
  });

  const { data: reviewsData, isLoading } = useQuery({
    queryKey: ['/api/reviews/database'],
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: ReviewFormData) => {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/database'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({
        title: "Review Added",
        description: "Customer review has been successfully added."
      });
      setFormData({
        customerName: "",
        rating: 5,
        reviewText: "",
        businessName: "AramisTech",
        location: "South Florida",
        source: "manual"
      });
      setShowForm(false);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add review. Please try again.",
        variant: "destructive"
      });
    }
  });

  const addSampleReviewsMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/reviews/seed", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/database'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({
        title: "Sample Reviews Added",
        description: "AramisTech sample reviews have been added successfully."
      });
    }
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/reviews/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" }
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/reviews/database'] });
      queryClient.invalidateQueries({ queryKey: ['/api/reviews'] });
      toast({
        title: "Review Deleted",
        description: "Customer review has been successfully removed."
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete review. Please try again.",
        variant: "destructive"
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createReviewMutation.mutate(formData);
  };

  const handleDeleteReview = (id: number, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete the review from ${customerName}?`)) {
      deleteReviewMutation.mutate(id);
    }
  };

  const reviews = reviewsData?.reviews || [];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
      />
    ));
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-gray-900">Review Management</h1>
        <div className="space-x-2">
          <Button 
            onClick={() => addSampleReviewsMutation.mutate()}
            disabled={addSampleReviewsMutation.isPending}
            variant="outline"
          >
            Add Sample Reviews
          </Button>
          <Button onClick={() => setShowForm(!showForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Review
          </Button>
        </div>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Add New Customer Review</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="rating">Rating</Label>
                <select
                  id="rating"
                  value={formData.rating}
                  onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {[5, 4, 3, 2, 1].map(num => (
                    <option key={num} value={num}>
                      {num} Star{num !== 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <Label htmlFor="reviewText">Review Text</Label>
                <Textarea
                  id="reviewText"
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  rows={4}
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button 
                  type="submit" 
                  disabled={createReviewMutation.isPending}
                >
                  {createReviewMutation.isPending ? "Adding..." : "Add Review"}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Current Reviews ({reviews.length})
        </h2>
        
        {isLoading ? (
          <div className="text-center py-8">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 mb-4">No reviews yet. Add your first customer review!</p>
              <Button onClick={() => addSampleReviewsMutation.mutate()}>
                Add Sample AramisTech Reviews
              </Button>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review: Review) => (
            <Card key={review.id}>
              <CardContent className="pt-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{review.customerName}</h3>
                    <p className="text-sm text-gray-500">{review.location}</p>
                    <div className="flex items-center mt-1">
                      {renderStars(review.rating)}
                      <span className="ml-2 text-sm text-gray-600">
                        ({review.rating}/5)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 capitalize bg-gray-100 px-2 py-1 rounded">
                      {review.source}
                    </span>
                    <Button
                      onClick={() => handleDeleteReview(review.id, review.customerName)}
                      disabled={deleteReviewMutation.isPending}
                      variant="outline"
                      size="sm"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-gray-700 leading-relaxed">{review.reviewText}</p>
                <p className="text-xs text-gray-500 mt-3">
                  {new Date(review.datePosted).toLocaleDateString()}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}