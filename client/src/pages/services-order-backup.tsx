import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { 
  CheckCircle, 
  Star, 
  Shield, 
  Zap, 
  Clock, 
  ExternalLink,
  ShoppingCart,
  CreditCard,
  Phone,
  Mail,
  Building2
} from "lucide-react";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface WHMCSService {
  id: number;
  name: string;
  description: string;
  pricing: {
    monthly?: number;
    quarterly?: number;
    semiannually?: number;
    annually?: number;
    biennially?: number;
    triennially?: number;
  };
  features: string[];
  category: string;
  order_url: string;
  is_featured?: boolean;
}

interface WHMCSServiceGroup {
  id: number;
  name: string;
  description: string;
  products: WHMCSService[];
}

const orderFormSchema = z.object({
  serviceId: z.number(),
  billingCycle: z.string().min(1, "Please select a billing cycle"),
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(10, "Please enter a valid phone number"),
  company: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderFormSchema>;

export default function ServicesOrder() {
  const [selectedService, setSelectedService] = useState<WHMCSService | null>(null);
  const [selectedBilling, setSelectedBilling] = useState<string>("");
  const { toast } = useToast();

  const { data: servicesData, isLoading } = useQuery({
    queryKey: ['/api/whmcs/services'],
  });

  const form = useForm<OrderFormData>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      company: "",
      billingCycle: "",
    },
  });

  const orderMutation = useMutation({
    mutationFn: async (data: OrderFormData) => {
      const response = await fetch('/api/whmcs/order', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          serviceId: data.serviceId,
          billingCycle: data.billingCycle,
          customerInfo: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            company: data.company,
          }
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process order');
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Order Prepared Successfully!",
        description: "Redirecting to secure billing portal to complete your order.",
      });
      
      // Redirect to WHMCS billing portal with pre-filled order
      setTimeout(() => {
        window.open(data.redirect_url, '_blank');
      }, 2000);
    },
    onError: (error) => {
      toast({
        title: "Order Failed",
        description: "Unable to process your order. Please try again or contact support.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OrderFormData) => {
    if (!selectedService) {
      toast({
        title: "No Service Selected",
        description: "Please select a service to continue with your order.",
        variant: "destructive",
      });
      return;
    }

    data.serviceId = selectedService.id;
    orderMutation.mutate(data);
  };

  const formatPrice = (price: number | undefined) => {
    if (!price || price === 0) return "Contact for Pricing";
    return `$${price.toFixed(2)}`;
  };

  const getBillingCyclePrice = (service: WHMCSService, cycle: string) => {
    switch (cycle) {
      case 'monthly': return service.pricing.monthly;
      case 'quarterly': return service.pricing.quarterly;
      case 'semiannually': return service.pricing.semiannually;
      case 'annually': return service.pricing.annually;
      case 'biennially': return service.pricing.biennially;
      case 'triennially': return service.pricing.triennially;
      default: return undefined;
    }
  };

  const getBillingCycleLabel = (cycle: string) => {
    switch (cycle) {
      case 'monthly': return 'Monthly';
      case 'quarterly': return 'Quarterly (3 months)';
      case 'semiannually': return 'Semi-Annually (6 months)';
      case 'annually': return 'Annually (12 months)';
      case 'biennially': return 'Biennially (24 months)';
      case 'triennially': return 'Triennially (36 months)';
      default: return cycle;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="animate-spin w-8 h-8 border-4 border-aramis-orange border-t-transparent rounded-full mx-auto" />
            <p className="mt-4 text-gray-600">Loading services...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const services: WHMCSServiceGroup[] = (servicesData as any)?.services || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Header */}
        <div className="text-center mb-20">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-aramis-orange to-orange-500 rounded-full mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-6">
            Professional IT Maintenance
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Protect your business with our comprehensive maintenance services. From servers to workstations, 
            we keep your technology running at peak performance with proactive monitoring and expert support.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 mb-16">
          {services.map((serviceGroup) => (
            serviceGroup.products.map((service) => (
              <div key={service.id} className="group relative">
                {/* Service Card */}
                <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
                  {/* Card Header */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white">
                    <div className="flex items-center justify-between mb-2">
                      <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                        {service.name.includes('Workstation') && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
                          </svg>
                        )}
                        {service.name.includes('Server') && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm14 1a1 1 0 11-2 0 1 1 0 012 0zM2 13a2 2 0 012-2h12a2 2 0 012 2v2a2 2 0 01-2 2H4a2 2 0 01-2-2v-2zm14 1a1 1 0 11-2 0 1 1 0 012 0z" clipRule="evenodd" />
                          </svg>
                        )}
                        {service.name.includes('Exchange') && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                          </svg>
                        )}
                        {service.name.includes('Synology') && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M3 4a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 14.846 4.632 16 6.414 16H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 6H6.28l-.31-1.243A1 1 0 005 4H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                          </svg>
                        )}
                        {service.name.includes('Hourly') && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                          </svg>
                        )}
                        {service.name.includes('Active Directory') && (
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                          </svg>
                        )}
                      </div>
                      <div className="text-right">
                        {service.billing_cycles.map((cycle) => {
                          const price = getBillingCyclePrice(service, cycle);
                          if (!price || price === -1) return null;
                          
                          return (
                            <div key={cycle} className="text-right">
                              <div className="text-2xl font-bold">{formatPrice(price)}</div>
                              <div className="text-sm opacity-90">
                                {cycle === 'monthly' ? '/month' : cycle === 'onetime' ? 'per hour' : `/${cycle}`}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    <h3 className="text-xl font-bold">
                      {service.name}
                    </h3>
                  </div>

                  {/* Card Body */}
                  <div className="p-6">
                    <div className="text-gray-600 mb-6 leading-relaxed line-clamp-4" 
                         dangerouslySetInnerHTML={{ __html: service.description }} />
                    
                    {/* Custom Fields */}
                    {service.custom_fields && service.custom_fields.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                          <svg className="w-4 h-4 mr-2 text-aramis-orange" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a.75.75 0 000 1.5h.253a.25.25 0 01.244.304l-.459 2.066A1.75 1.75 0 0010.747 15H11a.75.75 0 000-1.5h-.253a.25.25 0 01-.244-.304l.459-2.066A1.75 1.75 0 009.253 9H9z" clipRule="evenodd" />
                          </svg>
                          Required Information
                        </h4>
                        <div className="space-y-2">
                          {service.custom_fields.map((field, index) => (
                            <div key={index} className="flex items-center text-sm text-gray-600">
                              <div className="w-1.5 h-1.5 bg-aramis-orange rounded-full mr-3"></div>
                              {field.name}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <button
                      onClick={() => handleOrderService(service)}
                      className="w-full bg-gradient-to-r from-aramis-orange to-orange-500 text-white py-3 px-4 rounded-xl hover:from-orange-500 hover:to-orange-600 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center group"
                    >
                      <span>Order Service</span>
                      <svg className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          ))}
        </div>

        {/* Contact Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl opacity-95"></div>
          <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl border border-white/20 p-12 text-center">
            <div className="max-w-3xl mx-auto">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-white/20 rounded-full mb-6">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-4">
                Need Help Choosing the Right Service?
              </h2>
              <p className="text-blue-100 mb-8 text-lg leading-relaxed">
                Our IT experts are here to help you select the perfect maintenance service for your business needs. 
                Get personalized recommendations based on your infrastructure and requirements.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="tel:+13058144461"
                  className="bg-white text-blue-600 px-8 py-4 rounded-xl hover:bg-blue-50 transition-all duration-200 font-semibold shadow-lg hover:shadow-xl flex items-center justify-center group"
                >
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  Call (305) 814-4461
                </a>
                <Link
                  href="/contact"
                  className="bg-white/20 text-white border-2 border-white/30 px-8 py-4 rounded-xl hover:bg-white/30 transition-all duration-200 font-semibold flex items-center justify-center group"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Get Free Consultation
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <Footer />
    </div>
  );

}

const handleOrderService = (service: any) => {
  window.open(service.product_url, '_blank');
};
                                  </SelectItem>
                                );
                              }
                              return null;
                            })}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {selectedBilling && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 text-green-800">
                        <CheckCircle className="h-4 w-4" />
                        <span className="font-medium">
                          Total: {formatPrice(getBillingCyclePrice(selectedService, selectedBilling))} 
                          {selectedBilling === 'monthly' ? '/month' : ` per ${getBillingCycleLabel(selectedBilling).toLowerCase()}`}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Customer Information */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="firstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>First Name</FormLabel>
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
                          <FormLabel>Last Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              type="email" 
                              placeholder="john@example.com"
                              className="pl-10"
                              {...field} 
                            />
                          </div>
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
                        <FormLabel>Phone Number</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              type="tel" 
                              placeholder="(555) 123-4567"
                              className="pl-10"
                              {...field} 
                            />
                          </div>
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
                        <FormLabel>Company (Optional)</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input 
                              placeholder="Your Company Name"
                              className="pl-10"
                              {...field} 
                            />
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <Separator />

                  <div className="flex flex-col sm:flex-row gap-4">
                    <Button 
                      type="button"
                      variant="outline"
                      onClick={() => setSelectedService(null)}
                      className="flex-1"
                    >
                      Change Service
                    </Button>
                    
                    <Button 
                      type="submit" 
                      disabled={orderMutation.isPending}
                      className="flex-1 bg-aramis-orange hover:bg-aramis-orange/90"
                    >
                      {orderMutation.isPending ? (
                        <>
                          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <ExternalLink className="h-4 w-4 mr-2" />
                          Proceed to Billing Portal
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="text-center text-sm text-gray-600">
                    <Shield className="h-4 w-4 mx-auto mb-2" />
                    Secure checkout powered by WHMCS billing system
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}

        {/* Contact Section */}
        <div className="text-center mt-16">
          <Card className="max-w-md mx-auto">
            <CardContent className="pt-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Need Help Choosing?</h3>
              <p className="text-gray-600 mb-4">
                Our IT specialists are here to help you select the perfect service package.
              </p>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => window.location.href = 'tel:+13058144461'}
                  className="flex-1"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  (305) 814-4461
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => window.location.href = 'mailto:sales@aramistech.com'}
                  className="flex-1"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Email Us
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Footer />
    </div>
  );
}