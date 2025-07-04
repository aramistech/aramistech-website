import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import DynamicHeader from '@/components/dynamic-header';
import Footer from '@/components/footer';
import { SEO } from '@/components/seo';
import { 
  Server, 
  Shield, 
  Cloud, 
  Smartphone, 
  Cpu, 
  Mail,
  Network,
  Bot,
  Video,
  Wrench,
  Monitor,
  Database,
  Zap,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

// Form schema
const consultationSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(10, 'Please enter a valid phone number'),
  company: z.string().optional(),
  services: z.array(z.string()).min(1, 'Please select at least one service'),
  challenges: z.string().min(10, 'Please describe your IT challenges'),
  urgency: z.string().min(1, 'Please select an urgency level'),
  preferredContactTime: z.string().optional()
});

type ConsultationFormData = z.infer<typeof consultationSchema>;

const services = [
  { id: 'network-support', label: 'Network Support', icon: Network },
  { id: 'computer-maintenance', label: 'Computer Maintenance', icon: Monitor },
  { id: 'it-support', label: 'IT Support', icon: Wrench },
  { id: 'custom-server', label: 'Custom Server', icon: Server },
  { id: 'nas-cloud', label: 'NAS - Cloud Services', icon: Cloud },
  { id: 'server-management', label: 'Server Management', icon: Database },
  { id: 'email-google', label: 'Email Setup - Google Workspace', icon: Mail },
  { id: 'email-office365', label: 'Office365 Exchange', icon: Mail },
  { id: 'remote-work', label: 'Remote Work Setup', icon: Smartphone },
  { id: 'cloud-migration', label: 'Cloud Migration', icon: Cloud },
  { id: 'ai-automation', label: 'AI Automation', icon: Zap },
  { id: 'ai-chatbots', label: 'AI Chatbots', icon: Bot },
  { id: 'ai-videos', label: 'AI-Powered Promo Videos', icon: Video },
  { id: 'custom-ai', label: 'Custom AI Solutions', icon: Cpu }
];

const urgencyLevels = [
  { value: 'immediate', label: 'Immediate (Within 24 hours)' },
  { value: 'urgent', label: 'Urgent (Within 1 week)' },
  { value: 'moderate', label: 'Moderate (Within 1 month)' },
  { value: 'planning', label: 'Planning (More than 1 month)' }
];

export default function ITConsultation() {
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<string[]>([]);

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      company: '',
      services: [],
      challenges: '',
      urgency: '',
      preferredContactTime: ''
    }
  });

  const submitConsultation = useMutation({
    mutationFn: (data: ConsultationFormData) => 
      apiRequest('/api/it-consultation', 'POST', data),
    onSuccess: () => {
      toast({
        title: 'Consultation Request Sent!',
        description: 'We\'ll contact you within 24 hours to schedule your free consultation.',
      });
      form.reset();
      setSelectedServices([]);
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again or call us at (305) 814-4461.',
        variant: 'destructive'
      });
    }
  });

  const handleServiceToggle = (serviceId: string) => {
    const updatedServices = selectedServices.includes(serviceId)
      ? selectedServices.filter(s => s !== serviceId)
      : [...selectedServices, serviceId];
    
    setSelectedServices(updatedServices);
    form.setValue('services', updatedServices);
  };

  const onSubmit = (data: ConsultationFormData) => {
    submitConsultation.mutate(data);
  };

  return (
    <>
      <SEO 
        title="Free IT Consultation - AramisTech Professional IT Solutions"
        description="Get expert IT advice with our free consultation. Discuss your technology challenges with our 27+ year experienced team. Network setup, cloud migration, AI solutions & more."
      />
      
      <DynamicHeader />
      
      <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50">
        {/* Hero Section */}
        <section className="pt-32 pb-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="animate-fade-in-up">
              <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Get Your Free
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-aramis-orange"> IT Consultation</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Tell us about your technology challenges and we'll provide personalized recommendations during your free consultation. 
                <span className="font-semibold text-aramis-orange"> 27+ years of IT expertise</span> at your service.
              </p>
            </div>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mb-12 animate-fade-in-up delay-200">
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">27+ Years Experience</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
                <Shield className="w-5 h-5 text-blue-500" />
                <span className="text-sm font-medium">Licensed & Insured</span>
              </div>
              <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-lg px-4 py-2 shadow-sm">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span className="text-sm font-medium">Family-Owned Business</span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Form Section */}
        <section className="pb-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm animate-fade-in-up delay-300">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  Start Your Free IT Assessment
                </CardTitle>
                <p className="text-gray-600 mt-2">
                  Complete the form below and we'll schedule your personalized consultation
                </p>
              </CardHeader>
              
              <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                  {/* Contact Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name *</Label>
                      <Input
                        id="firstName"
                        {...form.register('firstName')}
                        placeholder="John"
                        className="transition-all duration-200 focus:ring-2 focus:ring-aramis-orange"
                      />
                      {form.formState.errors.firstName && (
                        <p className="text-sm text-red-600">{form.formState.errors.firstName.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name *</Label>
                      <Input
                        id="lastName"
                        {...form.register('lastName')}
                        placeholder="Smith"
                        className="transition-all duration-200 focus:ring-2 focus:ring-aramis-orange"
                      />
                      {form.formState.errors.lastName && (
                        <p className="text-sm text-red-600">{form.formState.errors.lastName.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        {...form.register('email')}
                        placeholder="john@company.com"
                        className="transition-all duration-200 focus:ring-2 focus:ring-aramis-orange"
                      />
                      {form.formState.errors.email && (
                        <p className="text-sm text-red-600">{form.formState.errors.email.message}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        {...form.register('phone')}
                        placeholder="(305) 555-0123"
                        className="transition-all duration-200 focus:ring-2 focus:ring-aramis-orange"
                      />
                      {form.formState.errors.phone && (
                        <p className="text-sm text-red-600">{form.formState.errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company">Company</Label>
                    <Input
                      id="company"
                      {...form.register('company')}
                      placeholder="Your Company Name"
                      className="transition-all duration-200 focus:ring-2 focus:ring-aramis-orange"
                    />
                  </div>

                  {/* IT Services Selection */}
                  <div className="space-y-4">
                    <Label className="text-lg font-semibold">What IT services do you need? (Select all that apply) *</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {services.map((service) => {
                        const IconComponent = service.icon;
                        const isSelected = selectedServices.includes(service.id);
                        
                        return (
                          <div
                            key={service.id}
                            className={`
                              relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md
                              ${isSelected 
                                ? 'border-aramis-orange bg-orange-50 shadow-sm' 
                                : 'border-gray-200 bg-white hover:border-gray-300'
                              }
                            `}
                            onClick={() => handleServiceToggle(service.id)}
                          >
                            <div className="flex items-center space-x-3">
                              <Checkbox
                                checked={isSelected}
                                onChange={() => handleServiceToggle(service.id)}
                                className="pointer-events-none"
                              />
                              <IconComponent className={`w-5 h-5 ${isSelected ? 'text-aramis-orange' : 'text-gray-500'}`} />
                              <span className={`font-medium ${isSelected ? 'text-aramis-orange' : 'text-gray-700'}`}>
                                {service.label}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    {form.formState.errors.services && (
                      <p className="text-sm text-red-600">{form.formState.errors.services.message}</p>
                    )}
                  </div>

                  {/* IT Challenges */}
                  <div className="space-y-2">
                    <Label htmlFor="challenges">Describe your current IT challenges *</Label>
                    <Textarea
                      id="challenges"
                      {...form.register('challenges')}
                      placeholder="Tell us about your technology problems, slow systems, security concerns, or other IT issues..."
                      rows={4}
                      className="transition-all duration-200 focus:ring-2 focus:ring-aramis-orange"
                    />
                    {form.formState.errors.challenges && (
                      <p className="text-sm text-red-600">{form.formState.errors.challenges.message}</p>
                    )}
                  </div>

                  {/* Urgency Level */}
                  <div className="space-y-2">
                    <Label htmlFor="urgency">How urgent is your need? *</Label>
                    <Select onValueChange={(value) => form.setValue('urgency', value)}>
                      <SelectTrigger className="transition-all duration-200 focus:ring-2 focus:ring-aramis-orange">
                        <SelectValue placeholder="Select urgency level" />
                      </SelectTrigger>
                      <SelectContent>
                        {urgencyLevels.map((level) => (
                          <SelectItem key={level.value} value={level.value}>
                            {level.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {form.formState.errors.urgency && (
                      <p className="text-sm text-red-600">{form.formState.errors.urgency.message}</p>
                    )}
                  </div>

                  {/* Preferred Contact Time */}
                  <div className="space-y-2">
                    <Label htmlFor="preferredContactTime">Preferred contact time (optional)</Label>
                    <Input
                      id="preferredContactTime"
                      {...form.register('preferredContactTime')}
                      placeholder="e.g., Weekdays 9-5, Evenings, Weekends"
                      className="transition-all duration-200 focus:ring-2 focus:ring-aramis-orange"
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={submitConsultation.isPending}
                      className="w-full bg-gradient-to-r from-aramis-orange to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-4 text-lg transition-all duration-200 hover:shadow-lg group"
                    >
                      {submitConsultation.isPending ? (
                        'Sending Request...'
                      ) : (
                        <>
                          Request Free Consultation
                          <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Contact Info */}
                  <div className="text-center pt-4 border-t">
                    <p className="text-gray-600 mb-2">
                      Need immediate assistance? Call us now:
                    </p>
                    <a
                      href="tel:3058144461"
                      className="text-xl font-bold text-aramis-orange hover:text-orange-600 transition-colors"
                    >
                      (305) 814-4461
                    </a>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Why Choose AramisTech Section */}
        <section className="py-16 px-4 bg-white/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Why Choose AramisTech for Your IT Needs?
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                With over 27 years of experience serving South Florida businesses, we understand your unique technology challenges
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center animate-fade-in-up delay-100">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Proven Experience</h3>
                <p className="text-gray-600">27+ years serving South Florida businesses with reliable IT solutions</p>
              </div>
              
              <div className="text-center animate-fade-in-up delay-200">
                <div className="w-16 h-16 bg-gradient-to-r from-aramis-orange to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Cpu className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Cutting-Edge Technology</h3>
                <p className="text-gray-600">From traditional IT to AI solutions, we stay ahead of technology trends</p>
              </div>
              
              <div className="text-center animate-fade-in-up delay-300">
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Family-Owned Service</h3>
                <p className="text-gray-600">Personal attention and commitment you won't find with large corporations</p>
              </div>
            </div>
          </div>
        </section>
      </main>
      
      <Footer />

    </>
  );
}