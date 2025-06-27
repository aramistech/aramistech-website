import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Brain, CheckCircle, X } from 'lucide-react';

const aiConsultationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  company: z.string().optional(),
  industry: z.string().optional(),
  businessSize: z.string().optional(),
  currentAIUsage: z.string().optional(),
  aiInterests: z.array(z.string()).min(1, "Please select at least one AI solution"),
  projectTimeline: z.string().optional(),
  budget: z.string().optional(),
  projectDescription: z.string().min(10, "Please provide a brief description of your AI needs"),
  preferredContactTime: z.string().optional(),
});

type AIConsultationFormData = z.infer<typeof aiConsultationSchema>;

interface AIConsultationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AIConsultationForm({ isOpen, onClose }: AIConsultationFormProps) {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<AIConsultationFormData>({
    resolver: zodResolver(aiConsultationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      industry: '',
      businessSize: '',
      currentAIUsage: '',
      aiInterests: [],
      projectTimeline: '',
      budget: '',
      projectDescription: '',
      preferredContactTime: '',
    },
  });

  const submitConsultation = useMutation({
    mutationFn: async (data: AIConsultationFormData) => {
      return await apiRequest('/api/ai-consultation', 'POST', data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      form.reset();
      toast({
        title: "Consultation Request Submitted!",
        description: "We'll contact you within 2 business hours to schedule your free AI consultation.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Please try again or call us directly at (305) 807-7015.",
        variant: "destructive",
      });
      console.error('AI consultation submission error:', error);
    },
  });

  const onSubmit = (data: AIConsultationFormData) => {
    submitConsultation.mutate(data);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  const aiSolutions = [
    "Intelligent Automation & Process Optimization",
    "Predictive Analytics & Business Intelligence",
    "Natural Language Processing (NLP)",
    "Computer Vision & Image Recognition",
    "Chatbots & Virtual Assistants",
    "Machine Learning for Decision Making",
    "AI-Powered Customer Service",
    "Data Mining & Pattern Recognition",
    "Recommendation Systems",
    "Custom AI Model Development"
  ];

  if (isSuccess) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-6 h-6" />
              Request Submitted Successfully!
            </DialogTitle>
            <DialogDescription>
              Thank you for your interest in AI development services. Our team will contact you within 2 business hours to schedule your free consultation.
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-4">
              Need immediate assistance? Call us now:
            </p>
            <Button 
              variant="outline" 
              className="text-orange-500 border-orange-500 hover:bg-orange-50"
              onClick={() => window.open('tel:+1-305-807-7015')}
            >
              (305) 807-7015
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-900">
            <Brain className="w-6 h-6 text-orange-500" />
            Schedule Your Free AI Consultation
          </DialogTitle>
          <DialogDescription>
            Tell us about your business needs and discover how AI can transform your operations. 
            Our experts will provide personalized recommendations during your free consultation.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="John" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Doe" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address *</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="john@company.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl>
                      <Input placeholder="(305) 123-4567" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Business Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="company"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Company Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Your Company" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="industry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Industry</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select your industry" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="finance">Finance & Banking</SelectItem>
                        <SelectItem value="retail">Retail & E-commerce</SelectItem>
                        <SelectItem value="manufacturing">Manufacturing</SelectItem>
                        <SelectItem value="real-estate">Real Estate</SelectItem>
                        <SelectItem value="legal">Legal Services</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="hospitality">Hospitality</SelectItem>
                        <SelectItem value="logistics">Logistics & Transportation</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="businessSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Business Size</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Number of employees" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1-10">1-10 employees</SelectItem>
                        <SelectItem value="11-50">11-50 employees</SelectItem>
                        <SelectItem value="51-200">51-200 employees</SelectItem>
                        <SelectItem value="201-500">201-500 employees</SelectItem>
                        <SelectItem value="500+">500+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="currentAIUsage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Current AI Usage</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="How do you currently use AI?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No current AI usage</SelectItem>
                        <SelectItem value="basic">Basic tools (ChatGPT, etc.)</SelectItem>
                        <SelectItem value="some">Some automated processes</SelectItem>
                        <SelectItem value="advanced">Advanced AI implementations</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* AI Interests */}
            <FormField
              control={form.control}
              name="aiInterests"
              render={() => (
                <FormItem>
                  <FormLabel>AI Solutions of Interest * (Select all that apply)</FormLabel>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    {aiSolutions.map((solution) => (
                      <FormField
                        key={solution}
                        control={form.control}
                        name="aiInterests"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(solution)}
                                onCheckedChange={(checked) => {
                                  return checked
                                    ? field.onChange([...field.value, solution])
                                    : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== solution
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="text-sm font-normal leading-tight">
                              {solution}
                            </FormLabel>
                          </FormItem>
                        )}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Project Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="projectTimeline"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Timeline</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="When do you want to start?" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="asap">As soon as possible</SelectItem>
                        <SelectItem value="1-3months">1-3 months</SelectItem>
                        <SelectItem value="3-6months">3-6 months</SelectItem>
                        <SelectItem value="6-12months">6-12 months</SelectItem>
                        <SelectItem value="planning">Just planning/researching</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget Range</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Estimated project budget" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="under-10k">Under $10,000</SelectItem>
                        <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                        <SelectItem value="25k-50k">$25,000 - $50,000</SelectItem>
                        <SelectItem value="50k-100k">$50,000 - $100,000</SelectItem>
                        <SelectItem value="100k+">$100,000+</SelectItem>
                        <SelectItem value="discuss">Prefer to discuss</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="projectDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Please describe your AI needs, current challenges, and goals. What specific problems are you trying to solve with AI?"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredContactTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Preferred Contact Time</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="When is the best time to contact you?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                      <SelectItem value="evening">Evening (5 PM - 7 PM)</SelectItem>
                      <SelectItem value="anytime">Anytime during business hours</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600 text-white"
                disabled={submitConsultation.isPending}
              >
                {submitConsultation.isPending ? 'Submitting...' : 'Schedule Free Consultation'}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                className="border-gray-300"
              >
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}