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

  const services: WHMCSServiceGroup[] = servicesData?.services || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Order IT Services
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Choose from our comprehensive maintenance and support services. 
            All orders are processed through our secure billing portal.
          </p>
        </div>

        {/* Services Grid */}
        {services.map((group) => (
          <div key={group.id} className="mb-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">{group.name}</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">{group.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {group.products.map((service) => (
                <Card 
                  key={service.id} 
                  className={`relative transition-all duration-300 hover:shadow-xl ${
                    service.is_featured ? 'ring-2 ring-aramis-orange shadow-lg' : ''
                  } ${
                    selectedService?.id === service.id ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                  }`}
                >
                  {service.is_featured && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-aramis-orange text-white px-4 py-1">
                        <Star className="h-3 w-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center">
                    <CardTitle className="text-xl font-bold text-gray-900">
                      {service.name}
                    </CardTitle>
                    <CardDescription className="text-gray-600 min-h-[60px]">
                      {service.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent>
                    {/* Pricing */}
                    <div className="text-center mb-6">
                      <div className="text-3xl font-bold text-aramis-orange mb-2">
                        {formatPrice(service.pricing.monthly)}
                        {service.pricing.monthly && <span className="text-lg text-gray-600">/month</span>}
                      </div>
                      {service.pricing.annually && (
                        <div className="text-sm text-gray-600">
                          or {formatPrice(service.pricing.annually)}/year
                        </div>
                      )}
                    </div>

                    {/* Features */}
                    <div className="space-y-2 mb-6">
                      {service.features.slice(0, 6).map((feature, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      onClick={() => setSelectedService(service)}
                      className={`w-full ${
                        selectedService?.id === service.id 
                          ? 'bg-blue-600 hover:bg-blue-700' 
                          : 'bg-aramis-orange hover:bg-aramis-orange/90'
                      }`}
                    >
                      {selectedService?.id === service.id ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Selected
                        </>
                      ) : (
                        <>
                          <ShoppingCart className="h-4 w-4 mr-2" />
                          Select Service
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}

        {/* Order Form */}
        {selectedService && (
          <Card className="max-w-2xl mx-auto mt-16">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-aramis-orange" />
                Complete Your Order
              </CardTitle>
              <CardDescription>
                Selected: <strong>{selectedService.name}</strong>
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  {/* Billing Cycle */}
                  <FormField
                    control={form.control}
                    name="billingCycle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Billing Cycle</FormLabel>
                        <Select 
                          onValueChange={(value) => {
                            field.onChange(value);
                            setSelectedBilling(value);
                          }} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select billing cycle" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Object.entries(selectedService.pricing).map(([cycle, price]) => {
                              if (price && price > 0) {
                                return (
                                  <SelectItem key={cycle} value={cycle}>
                                    {getBillingCycleLabel(cycle)} - {formatPrice(price)}
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