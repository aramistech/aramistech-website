import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ExternalLink, CreditCard, FileText, Settings, User } from "lucide-react";
import { getWHMCS, type WHMCSService, type WHMCSInvoice } from "@/lib/whmcs-integration";
import { useToast } from "@/hooks/use-toast";

interface BillingPortalProps {
  customerEmail: string;
  customerId?: number;
}

export default function BillingPortal({ customerEmail, customerId }: BillingPortalProps) {
  const [services, setServices] = useState<WHMCSService[]>([]);
  const [invoices, setInvoices] = useState<WHMCSInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBillingData();
  }, [customerId]);

  const loadBillingData = async () => {
    if (!customerId) return;
    
    try {
      const [servicesResponse, invoicesResponse] = await Promise.all([
        fetch(`/api/whmcs/customer/${customerId}/services`),
        fetch(`/api/whmcs/customer/${customerId}/invoices`)
      ]);
      
      if (servicesResponse.ok && invoicesResponse.ok) {
        const servicesData = await servicesResponse.json();
        const invoicesData = await invoicesResponse.json();
        
        setServices(servicesData.success ? servicesData.services : []);
        setInvoices(invoicesData.success ? invoicesData.invoices.slice(0, 5) : []); // Show last 5 invoices
      } else {
        toast({
          title: "Billing System Configuration",
          description: "WHMCS billing system is being configured. Please contact support for assistance accessing your billing information.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Error Loading Billing Data",
        description: "Unable to load your billing information. Please try again or contact support.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'unpaid': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const openBillingPortal = () => {
    const whmcs = getWHMCS();
    const portalUrl = whmcs.generateBillingPortalLink(customerEmail);
    window.open(portalUrl, '_blank');
  };

  const openInvoice = (invoiceId: number) => {
    const whmcs = getWHMCS();
    const paymentUrl = whmcs.generatePaymentLink(invoiceId);
    window.open(paymentUrl, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={openBillingPortal} className="flex items-center gap-2">
          <ExternalLink className="w-4 h-4" />
          Open Billing Portal
        </Button>
        <Button variant="outline" onClick={openBillingPortal}>
          <User className="w-4 h-4 mr-2" />
          Manage Account
        </Button>
        <Button variant="outline" onClick={openBillingPortal}>
          <CreditCard className="w-4 h-4 mr-2" />
          Payment Methods
        </Button>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Active Services */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Active Services
            </CardTitle>
            <CardDescription>
              Your current IT services and subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {services.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No active services found</p>
            ) : (
              <div className="space-y-3">
                {services.slice(0, 3).map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">{service.productname}</h4>
                      {service.domain && (
                        <p className="text-sm text-gray-600">{service.domain}</p>
                      )}
                      <p className="text-sm text-gray-500">
                        Next due: {new Date(service.nextduedate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(service.status)}>
                        {service.status}
                      </Badge>
                      <span className="text-sm font-medium">${service.amount}</span>
                    </div>
                  </div>
                ))}
                {services.length > 3 && (
                  <Button variant="ghost" onClick={openBillingPortal} className="w-full">
                    View All Services ({services.length})
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Invoices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Recent Invoices
            </CardTitle>
            <CardDescription>
              Your latest billing statements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {invoices.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No invoices found</p>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium">Invoice #{invoice.invoicenum}</h4>
                      <p className="text-sm text-gray-600">
                        {new Date(invoice.date).toLocaleDateString()}
                      </p>
                      <p className="text-sm text-gray-500">
                        Due: {new Date(invoice.duedate).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <Badge className={getStatusColor(invoice.status)}>
                        {invoice.status}
                      </Badge>
                      <span className="text-sm font-medium">${invoice.total}</span>
                      {invoice.status.toLowerCase() === 'unpaid' && (
                        <Button 
                          size="sm" 
                          onClick={() => openInvoice(invoice.id)}
                          className="bg-aramis-orange hover:bg-aramis-orange/90"
                        >
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                <Button variant="ghost" onClick={openBillingPortal} className="w-full">
                  <FileText className="w-4 h-4 mr-2" />
                  View All Invoices
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Support Information */}
      <Card>
        <CardHeader>
          <CardTitle>Need Help?</CardTitle>
          <CardDescription>
            Contact our billing support team for assistance
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => window.open('tel:+13058144461', '_self')}>
              Call: (305) 814-4461
            </Button>
            <Button variant="outline" onClick={() => window.open('mailto:billing@aramistech.com', '_self')}>
              Email Billing Support
            </Button>
            <Button variant="outline" onClick={openBillingPortal}>
              Submit Support Ticket
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}