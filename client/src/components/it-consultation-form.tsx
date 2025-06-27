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
import { Settings, CheckCircle, X } from 'lucide-react';

const itConsultationSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  company: z.string().optional(),
  employees: z.string().optional(),
  services: z.array(z.string()).min(1, "Please select at least one service"),
  urgency: z.string().optional(),
  budget: z.string().optional(),
  challenges: z.string().min(10, "Please describe your IT challenges (minimum 10 characters)"),
  preferredContactTime: z.string().optional(),
});

type ITConsultationFormData = z.infer<typeof itConsultationSchema>;

interface ITConsultationFormProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ITConsultationForm({ isOpen, onClose }: ITConsultationFormProps) {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm<ITConsultationFormData>({
    resolver: zodResolver(itConsultationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      employees: '',
      services: [],
      urgency: '',
      budget: '',
      challenges: '',
      preferredContactTime: '',
    },
  });

  const submitConsultation = useMutation({
    mutationFn: async (data: ITConsultationFormData) => {
      return await apiRequest('/api/it-consultation', 'POST', data);
    },
    onSuccess: () => {
      setIsSuccess(true);
      form.reset();
      toast({
        title: "Request Submitted",
        description: "We'll contact you within 2 business hours for your free IT consultation.",
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: "Please try again or call us directly at (305) 807-7015",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: ITConsultationFormData) => {
    submitConsultation.mutate(data);
  };

  const handleClose = () => {
    setIsSuccess(false);
    onClose();
  };

  const itServices = [
    "Network Setup & Management",
    "Cybersecurity Solutions",
    "Cloud Migration & Management",
    "IT Help Desk & Support",
    "Hardware Installation & Maintenance",
    "Software Installation & Updates",
    "Data Backup & Recovery",
    "VoIP Phone Systems",
    "Remote Work Solutions",
    "Server Management",
    "Email Setup & Management",
    "Printer & Scanner Support"
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
              Thank you for requesting a free IT consultation. Our team will contact you within 2 business hours to discuss your technology needs.
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
          <Button onClick={handleClose} className="w-full">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-blue-900">
            <Settings className="w-6 h-6 text-orange-500" />
            Get Your Free IT Consultation
          </DialogTitle>
          <DialogDescription>
            Tell us about your technology challenges and discover how AramisTech can improve your business operations. 
            Our IT experts will provide personalized recommendations during your free consultation.
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
                      <Input placeholder="Smith" {...field} />
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
                      <Input placeholder="(305) 555-0123" {...field} />
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
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="employees"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Number of Employees</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select company size" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1-5">1-5 employees</SelectItem>
                        <SelectItem value="6-20">6-20 employees</SelectItem>
                        <SelectItem value="21-50">21-50 employees</SelectItem>
                        <SelectItem value="51-100">51-100 employees</SelectItem>
                        <SelectItem value="100+">100+ employees</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            {/* IT Services Interest */}
            <FormField
              control={form.control}
              name="services"
              render={() => (
                <FormItem>
                  <FormLabel>IT Services You're Interested In *</FormLabel>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {itServices.map((service) => (
                      <FormField
                        key={service}
                        control={form.control}
                        name="services"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={service}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(service)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, service])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== service
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {service}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
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
                name="urgency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How Urgent Is This?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select urgency level" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency - Need help today</SelectItem>
                        <SelectItem value="urgent">Urgent - Within this week</SelectItem>
                        <SelectItem value="soon">Soon - Within this month</SelectItem>
                        <SelectItem value="planning">Planning - Within 3 months</SelectItem>
                        <SelectItem value="future">Future consideration</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estimated Budget Range</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select budget range" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="under-1k">Under $1,000</SelectItem>
                        <SelectItem value="1k-5k">$1,000 - $5,000</SelectItem>
                        <SelectItem value="5k-10k">$5,000 - $10,000</SelectItem>
                        <SelectItem value="10k-25k">$10,000 - $25,000</SelectItem>
                        <SelectItem value="25k+">$25,000+</SelectItem>
                        <SelectItem value="not-sure">Not sure yet</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="challenges"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What IT Challenges Are You Facing? *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe your current technology challenges, what's not working, or what you'd like to improve..."
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
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="When should we call you?" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="morning">Morning (9 AM - 12 PM)</SelectItem>
                      <SelectItem value="afternoon">Afternoon (12 PM - 5 PM)</SelectItem>
                      <SelectItem value="evening">Evening (5 PM - 8 PM)</SelectItem>
                      <SelectItem value="anytime">Anytime during business hours</SelectItem>
                    </SelectContent>
                  </Select>
                </FormItem>
              )}
            />

            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                className="flex-1 bg-orange-500 hover:bg-orange-600"
                disabled={submitConsultation.isPending}
              >
                {submitConsultation.isPending ? "Submitting..." : "Get Free Consultation"}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}