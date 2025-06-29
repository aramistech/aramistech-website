import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import BillingPortal from "@/components/billing-portal";
import { getWHMCS, type WHMCSCustomer } from "@/lib/whmcs-integration";
import { Loader2, User, Mail, Lock, ExternalLink, FileText } from "lucide-react";
import DynamicHeader from "@/components/dynamic-header";
import Footer from "@/components/footer";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function CustomerPortal() {
  const [customer, setCustomer] = useState<WHMCSCustomer | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/whmcs/customer/${encodeURIComponent(data.email)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.customer) {
          setCustomer(result.customer);
          setIsLoggedIn(true);
          toast({
            title: "Welcome Back!",
            description: `Hello ${result.customer.firstname}, your billing information is loading.`,
          });
        } else {
          toast({
            title: "Customer Not Found",
            description: "No billing account found with this email address. Please contact support if you need assistance.",
            variant: "destructive",
          });
        }
      } else if (response.status === 500) {
        toast({
          title: "Service Configuration",
          description: "WHMCS billing system is being configured. Please contact support for assistance.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Customer Not Found",
          description: "No billing account found with this email address. Please contact support if you need assistance.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Login Error",
        description: "Unable to access billing system. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCustomer(null);
    setIsLoggedIn(false);
    form.reset();
  };

  if (isLoggedIn && customer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <DynamicHeader />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Customer Welcome */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-primary-blue">
                  Welcome, {customer.firstname} {customer.lastname}
                </h1>
                <p className="text-gray-600 mt-2">
                  Manage your IT services and billing information
                </p>
              </div>
              <Button variant="outline" onClick={logout}>
                Sign Out
              </Button>
            </div>
          </div>

          {/* Customer Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                Account Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Contact Information</p>
                  <p className="font-medium">{customer.firstname} {customer.lastname}</p>
                  <p className="text-sm text-gray-700">{customer.email}</p>
                  <p className="text-sm text-gray-700">{customer.phonenumber}</p>
                  {customer.companyname && (
                    <p className="text-sm text-gray-700">{customer.companyname}</p>
                  )}
                </div>
                <div>
                  <p className="text-sm text-gray-600">Billing Address</p>
                  <p className="text-sm text-gray-700">{customer.address1}</p>
                  <p className="text-sm text-gray-700">
                    {customer.city}, {customer.state} {customer.postcode}
                  </p>
                  <p className="text-sm text-gray-700">{customer.country}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Access to Full Billing Portal */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ExternalLink className="h-5 w-5 text-aramis-orange" />
                Full Billing Portal Access
              </CardTitle>
              <CardDescription>
                Access your complete billing dashboard with advanced features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  onClick={() => window.open('https://billing.aramistech.com', '_blank')}
                  className="flex-1 bg-aramis-orange hover:bg-aramis-orange/90"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Full Billing Portal
                </Button>
                <Button 
                  onClick={() => window.open('https://billing.aramistech.com/submitticket.php', '_blank')}
                  variant="outline"
                  className="flex-1"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Support Ticket
                </Button>
              </div>
              <p className="text-sm text-gray-600 mt-3">
                The full billing portal provides complete account management, payment history, 
                service management, and direct support ticket submission.
              </p>
            </CardContent>
          </Card>

          {/* Billing Portal */}
          <BillingPortal 
            customerEmail={customer.email} 
            customerId={customer.id} 
          />
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <DynamicHeader />
      
      <div className="max-w-md mx-auto px-4 py-16">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-primary-blue">
              Customer Portal
            </CardTitle>
            <CardDescription>
              Access your billing information and manage your IT services
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                            placeholder="Enter your email address"
                            className="pl-10"
                            {...field} 
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full bg-primary-blue hover:bg-primary-blue/90"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Accessing Account...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Access My Account
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-6 pt-6 border-t text-center text-sm text-gray-600">
              <p>Need help accessing your account?</p>
              <div className="flex justify-center gap-4 mt-2">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open('tel:+13058144461', '_self')}
                >
                  Call (305) 814-4461
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => window.open('mailto:support@aramistech.com', '_self')}
                >
                  Email Support
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
}