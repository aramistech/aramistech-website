import { Star } from "lucide-react";

const testimonials = [
  {
    text: "Exceptional service from start to finish! AramisTech transformed our IT setup, making everything run smoother than ever. Their team is not only knowledgeable but also incredibly responsive.",
    author: "Sarah Johnson",
    title: "CEO, Johnson & Associates",
    image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    text: "Their 27 years of experience really shows. The family-owned approach means they truly care about our success. Our network has never been more reliable.",
    author: "Michael Rodriguez",
    title: "Director, Miami Legal Group",
    image: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  },
  {
    text: "Outstanding support and expertise. They've become our trusted IT partner, always available when we need them. Highly recommend for any business.",
    author: "Lisa Chen",
    title: "Practice Manager, Coral Gables Medical",
    image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"
  }
];

export default function Testimonials() {
  return (
    <section className="py-20 bg-light-gray">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <span className="text-primary-blue font-semibold text-lg">// Client Testimonials</span>
          <h2 className="text-4xl font-bold text-professional-gray mb-6 mt-4">What Our Clients Say</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Hear from businesses that trust AramisTech for their IT solutions and experience our commitment to excellence.
          </p>
        </div>
        
        <div className="grid lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white p-8 rounded-xl shadow-lg">
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-gray-600 mb-6 italic">
                "{testimonial.text}"
              </p>
              <div className="flex items-center">
                <img 
                  src={testimonial.image} 
                  alt={`${testimonial.author} testimonial`} 
                  className="w-12 h-12 rounded-full mr-4 object-cover"
                />
                <div>
                  <h4 className="font-semibold">{testimonial.author}</h4>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
