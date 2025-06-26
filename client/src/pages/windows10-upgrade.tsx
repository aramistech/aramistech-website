import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Clock, Shield, Zap, AlertTriangle, Phone, Mail, MapPin } from "lucide-react";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { trackBusinessEvent } from "@/lib/analytics";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Windows10Upgrade() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      service: "Windows 10 Upgrade",
      employees: null,
      challenges: "",
      contactTime: null,
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      return await apiRequest("/api/contact", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Request Submitted!",
        description: "We'll contact you within 24 hours about your Windows 10 upgrade needs.",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/contacts"] });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Something went wrong. Please try again or call us directly.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    trackBusinessEvent('service_inquiry', { service: 'Windows 10 Upgrade', source: 'Windows 10 page' });
    contactMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      {/* Hero Section */}
      <div 
        className="relative text-white py-20 min-h-[600px] flex items-center"
        style={{ 
          backgroundImage: `linear-gradient(rgba(37, 99, 235, 0.75), rgba(67, 56, 202, 0.75)), url(/windows10-bg.png?v=${Date.now()})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat'
        }}
      >
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <Badge className="mb-4 bg-red-500 hover:bg-red-600 text-white">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Critical: Windows 10 Support Ending
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Windows 10 Upgrade Services
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
              Don't get left behind! Professional Windows 11 migration and system upgrades to keep your business secure and running smoothly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-aramis-orange hover:bg-aramis-orange/90 text-white px-8 py-4 text-lg"
                onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Get Free Assessment
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-primary-blue px-8 py-4 text-lg"
                onClick={() => window.open('tel:+15613682196', '_self')}
              >
                <Phone className="w-5 h-5 mr-2" />
                Call Now: (305) 814-4461
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Urgency Banner */}
      <div className="bg-red-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center text-center">
            <Clock className="w-6 h-6 mr-3 animate-pulse" />
            <p className="text-lg font-semibold">
              Windows 10 support ends October 14, 2025 - Only 4 months left to upgrade!
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-2 gap-12">
          {/* Left Column - Information */}
          <div className="space-y-8">
            {/* What This Means */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary-blue flex items-center">
                  <AlertTriangle className="w-6 h-6 mr-3 text-red-500" />
                  What This Means for Your Business
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <p><strong>No more security updates</strong> - Your systems become vulnerable to new threats</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <p><strong>Compliance issues</strong> - Many industry standards require supported operating systems</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <p><strong>Software compatibility problems</strong> - New applications may not work on unsupported systems</p>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-2 h-2 bg-red-500 rounded-full mt-2"></div>
                    <p><strong>Insurance and liability risks</strong> - Using unsupported software can void coverage</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Our Services */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary-blue flex items-center">
                  <Zap className="w-6 h-6 mr-3 text-aramis-orange" />
                  Our Windows Upgrade Services
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6">
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg">Hardware Assessment</h4>
                      <p className="text-gray-600">Complete evaluation of your current systems to determine Windows 11 compatibility</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg">Data Migration & Backup</h4>
                      <p className="text-gray-600">Secure transfer of all your important files, settings, and applications</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg">Windows 11 Installation</h4>
                      <p className="text-gray-600">Professional installation and configuration optimized for your business needs</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg">Software Reinstallation</h4>
                      <p className="text-gray-600">Reinstall and reconfigure all your essential business applications</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg">Security Setup</h4>
                      <p className="text-gray-600">Configure Windows 11 security features and install enterprise-grade protection</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-4">
                    <CheckCircle className="w-6 h-6 text-green-500 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-lg">Training & Support</h4>
                      <p className="text-gray-600">Staff training on new features and ongoing support to ensure smooth transition</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Benefits */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-primary-blue flex items-center">
                  <Shield className="w-6 h-6 mr-3 text-green-500" />
                  Benefits of Upgrading Now
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Enhanced security with latest protection features</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Improved performance and faster boot times</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Better compatibility with modern software</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Continued Microsoft support and updates</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Compliance with industry security standards</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Contact Form */}
          <div className="space-y-8">
            <Card id="contact-form">
              <CardHeader>
                <CardTitle className="text-2xl text-primary-blue">Get Your Free Assessment</CardTitle>
                <p className="text-gray-600">
                  Our experts will evaluate your current systems and provide a customized upgrade plan.
                </p>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name *</FormLabel>
                          <FormControl>
                            <Input placeholder="Your first name" {...field} value={field.value || ""} />
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
                            <Input placeholder="Your last name" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email Address *</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="Your @ Email" {...field} value={field.value || ""} />
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
                            <Input placeholder="(000) 000-0000" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="company"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Company Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your company" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="challenges"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tell us about your current setup</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="How many computers need upgrading? Any specific concerns or requirements?"
                              rows={4}
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <Button 
                      type="submit" 
                      className="w-full bg-aramis-orange hover:bg-aramis-orange/90"
                      disabled={contactMutation.isPending}
                    >
                      {contactMutation.isPending ? "Submitting..." : "Get Free Assessment"}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary-blue">Need Immediate Help?</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Phone className="w-5 h-5 text-aramis-orange" />
                  <div>
                    <p className="font-semibold">Call Us Now</p>
                    <p className="text-primary-blue">(305) 814-4461</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-aramis-orange" />
                  <div>
                    <p className="font-semibold">Email Us</p>
                    <p className="text-primary-blue">support@aramistech.com</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-aramis-orange" />
                  <div>
                    <p className="font-semibold">Service Area</p>
                    <p className="text-gray-600">South Florida & Remote Support</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Pricing Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl text-primary-blue">Transparent Pricing</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-gray-600">
                    <strong>Assessment:</strong> FREE (includes compatibility check and upgrade plan)
                  </p>
                
                  <p className="text-gray-600">
                    <strong>Complete Migration:</strong> $180 per computer this includes the license
                  </p>
                  <Separator />
                  <p className="text-sm text-gray-500">
                    * Pricing can vary based on data complexity and software requirements. 
                    All quotes provided after free assessment.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-primary-blue to-indigo-700 text-white py-16">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Don't Wait Until It's Too Late
          </h2>
          <p className="text-xl mb-8 opacity-90">
            With only 9 months left until Windows 10 support ends, now is the time to plan your upgrade. 
            Let AramisTech handle the technical details while you focus on running your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-aramis-orange hover:bg-aramis-orange/90 text-white px-8 py-4 text-lg"
              onClick={() => document.getElementById('contact-form')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Start Your Upgrade Today
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary-blue px-8 py-4 text-lg"
              onClick={() => window.open('tel:+15613682196', '_self')}
            >
              <Phone className="w-5 h-5 mr-2" />
              (561) 368-2196
            </Button>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );
}