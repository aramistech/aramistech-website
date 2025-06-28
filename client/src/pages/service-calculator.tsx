import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Calculator, Clock, Shield, Monitor, Network, Database, Zap, Phone, Mail, User, Building } from 'lucide-react';
import DynamicHeader from '@/components/dynamic-header';

interface ServiceCategory {
  id: number;
  name: string;
  description: string;
  icon: string;
  basePrice: string;
  hourlyRate: string;
  isActive: boolean;
  displayOrder: number;
}

interface ServiceOption {
  id: number;
  categoryId: number;
  name: string;
  description: string;
  priceModifier: string;
  priceType: string;
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
}

interface SelectedService {
  categoryId: number;
  categoryName: string;
  basePrice: number;
  hourlyRate: number;
  selectedOptions: number[];
  estimatedHours: number;
}

interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
  company: string;
  projectDescription: string;
  urgency: string;
  contactMethod: string;
}

const iconMap = {
  calculator: Calculator,
  monitor: Monitor,
  network: Network,
  database: Database,
  shield: Shield,
  zap: Zap,
  clock: Clock,
};

export default function ServiceCalculator() {
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    name: '',
    email: '',
    phone: '',
    company: '',
    projectDescription: '',
    urgency: 'normal',
    contactMethod: 'email',
  });
  const [currentStep, setCurrentStep] = useState(1);
  const [totalEstimate, setTotalEstimate] = useState(0);

  // Fetch service categories (mock data for now - will connect to API)
  const serviceCategories: ServiceCategory[] = [
    {
      id: 1,
      name: "Network Setup & Configuration",
      description: "Complete network infrastructure setup and configuration",
      icon: "network",
      basePrice: "199.00",
      hourlyRate: "125.00",
      isActive: true,
      displayOrder: 1,
    },
    {
      id: 2,
      name: "Cybersecurity Assessment",
      description: "Comprehensive security audit and vulnerability assessment",
      icon: "shield",
      basePrice: "299.00",
      hourlyRate: "150.00",
      isActive: true,
      displayOrder: 2,
    },
    {
      id: 3,
      name: "Server Installation & Maintenance",
      description: "Server hardware and software setup with ongoing maintenance",
      icon: "database",
      basePrice: "399.00",
      hourlyRate: "140.00",
      isActive: true,
      displayOrder: 3,
    },
    {
      id: 4,
      name: "Workstation Setup & Support",
      description: "Complete workstation configuration and user training",
      icon: "monitor",
      basePrice: "149.00",
      hourlyRate: "95.00",
      isActive: true,
      displayOrder: 4,
    },
    {
      id: 5,
      name: "Data Backup & Recovery",
      description: "Automated backup solutions and disaster recovery planning",
      icon: "database",
      basePrice: "249.00",
      hourlyRate: "120.00",
      isActive: true,
      displayOrder: 5,
    },
    {
      id: 6,
      name: "Emergency IT Support",
      description: "24/7 emergency response for critical IT issues",
      icon: "zap",
      basePrice: "499.00",
      hourlyRate: "200.00",
      isActive: true,
      displayOrder: 6,
    },
  ];

  const serviceOptions: Record<number, ServiceOption[]> = {
    1: [
      { id: 1, categoryId: 1, name: "WiFi 6 Configuration", description: "Latest WiFi 6 standard setup", priceModifier: "150.00", priceType: "fixed", isRequired: false, isActive: true, displayOrder: 1 },
      { id: 2, categoryId: 1, name: "VPN Setup", description: "Secure remote access configuration", priceModifier: "200.00", priceType: "fixed", isRequired: false, isActive: true, displayOrder: 2 },
      { id: 3, categoryId: 1, name: "Firewall Configuration", description: "Advanced firewall rules and monitoring", priceModifier: "100.00", priceType: "fixed", isRequired: false, isActive: true, displayOrder: 3 },
    ],
    2: [
      { id: 4, categoryId: 2, name: "Penetration Testing", description: "Simulated cyber attacks to test defenses", priceModifier: "500.00", priceType: "fixed", isRequired: false, isActive: true, displayOrder: 1 },
      { id: 5, categoryId: 2, name: "Compliance Audit", description: "HIPAA, PCI-DSS compliance verification", priceModifier: "300.00", priceType: "fixed", isRequired: false, isActive: true, displayOrder: 2 },
      { id: 6, categoryId: 2, name: "Security Training", description: "Employee cybersecurity awareness training", priceModifier: "75.00", priceType: "multiplier", isRequired: false, isActive: true, displayOrder: 3 },
    ],
    3: [
      { id: 7, categoryId: 3, name: "Cloud Migration", description: "Move existing systems to cloud infrastructure", priceModifier: "800.00", priceType: "fixed", isRequired: false, isActive: true, displayOrder: 1 },
      { id: 8, categoryId: 3, name: "Database Optimization", description: "Performance tuning and optimization", priceModifier: "400.00", priceType: "fixed", isRequired: false, isActive: true, displayOrder: 2 },
      { id: 9, categoryId: 3, name: "Load Balancing", description: "High availability server configuration", priceModifier: "350.00", priceType: "fixed", isRequired: false, isActive: true, displayOrder: 3 },
    ],
    4: [
      { id: 10, categoryId: 4, name: "Software Installation", description: "Business software setup and configuration", priceModifier: "50.00", priceType: "multiplier", isRequired: false, isActive: true, displayOrder: 1 },
      { id: 11, categoryId: 4, name: "Hardware Upgrade", description: "RAM, SSD, and component upgrades", priceModifier: "100.00", priceType: "multiplier", isRequired: false, isActive: true, displayOrder: 2 },
      { id: 12, categoryId: 4, name: "User Training", description: "One-on-one software training sessions", priceModifier: "85.00", priceType: "hourly", isRequired: false, isActive: true, displayOrder: 3 },
    ],
    5: [
      { id: 13, categoryId: 5, name: "Cloud Backup Setup", description: "Automated cloud backup configuration", priceModifier: "200.00", priceType: "fixed", isRequired: false, isActive: true, displayOrder: 1 },
      { id: 14, categoryId: 5, name: "Local Backup System", description: "On-site backup hardware and software", priceModifier: "300.00", priceType: "fixed", isRequired: false, isActive: true, displayOrder: 2 },
      { id: 15, categoryId: 5, name: "Disaster Recovery Testing", description: "Regular backup restoration testing", priceModifier: "150.00", priceType: "fixed", isRequired: false, isActive: true, displayOrder: 3 },
    ],
    6: [
      { id: 16, categoryId: 6, name: "After Hours Support", description: "Emergency support outside business hours", priceModifier: "1.5", priceType: "multiplier", isRequired: false, isActive: true, displayOrder: 1 },
      { id: 17, categoryId: 6, name: "Same Day Response", description: "Guaranteed same-day response time", priceModifier: "100.00", priceType: "fixed", isRequired: false, isActive: true, displayOrder: 2 },
      { id: 18, categoryId: 6, name: "Remote Diagnosis", description: "Remote troubleshooting and resolution", priceModifier: "0.8", priceType: "multiplier", isRequired: false, isActive: true, displayOrder: 3 },
    ],
  };

  const calculateServiceCost = (service: SelectedService, options: ServiceOption[]): number => {
    let totalCost = parseFloat(service.basePrice.toString());
    
    // Add hourly rate calculation
    if (service.estimatedHours > 0) {
      totalCost += service.hourlyRate * service.estimatedHours;
    }

    // Add selected options
    service.selectedOptions.forEach(optionId => {
      const option = options.find(opt => opt.id === optionId);
      if (option) {
        const modifier = parseFloat(option.priceModifier);
        switch (option.priceType) {
          case 'fixed':
            totalCost += modifier;
            break;
          case 'multiplier':
            totalCost *= modifier;
            break;
          case 'hourly':
            totalCost += modifier * service.estimatedHours;
            break;
        }
      }
    });

    return totalCost;
  };

  const calculateTotalEstimate = (): number => {
    return selectedServices.reduce((total, service) => {
      const options = serviceOptions[service.categoryId] || [];
      return total + calculateServiceCost(service, options);
    }, 0);
  };

  useEffect(() => {
    setTotalEstimate(calculateTotalEstimate());
  }, [selectedServices]);

  const addService = (category: ServiceCategory): void => {
    const existingService = selectedServices.find(s => s.categoryId === category.id);
    if (!existingService) {
      setSelectedServices(prev => [...prev, {
        categoryId: category.id,
        categoryName: category.name,
        basePrice: parseFloat(category.basePrice),
        hourlyRate: parseFloat(category.hourlyRate),
        selectedOptions: [],
        estimatedHours: 0,
      }]);
    }
  };

  const removeService = (categoryId: number): void => {
    setSelectedServices(prev => prev.filter(s => s.categoryId !== categoryId));
  };

  const updateServiceOptions = (categoryId: number, optionId: number, selected: boolean): void => {
    setSelectedServices(prev => prev.map(service => {
      if (service.categoryId === categoryId) {
        const newOptions = selected 
          ? [...service.selectedOptions, optionId]
          : service.selectedOptions.filter(id => id !== optionId);
        return { ...service, selectedOptions: newOptions };
      }
      return service;
    }));
  };

  const updateEstimatedHours = (categoryId: number, hours: number): void => {
    setSelectedServices(prev => prev.map(service => {
      if (service.categoryId === categoryId) {
        return { ...service, estimatedHours: hours };
      }
      return service;
    }));
  };

  const submitCalculation = useMutation({
    mutationFn: async () => {
      const calculation = {
        sessionId: `calc_${Date.now()}`,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        customerPhone: customerInfo.phone,
        companyName: customerInfo.company,
        selectedServices: selectedServices,
        totalEstimate: totalEstimate.toString(),
        estimateBreakdown: selectedServices.map(service => ({
          service: service.categoryName,
          cost: calculateServiceCost(service, serviceOptions[service.categoryId] || [])
        })),
        urgencyLevel: customerInfo.urgency,
        projectDescription: customerInfo.projectDescription,
        preferredContactMethod: customerInfo.contactMethod,
      };

      const res = await fetch('/api/service-calculator/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(calculation),
      });
      
      if (!res.ok) throw new Error('Failed to submit calculation');
      return res.json();
    },
    onSuccess: () => {
      toast({
        title: "Quote Submitted Successfully!",
        description: "We'll contact you within 24 hours with a detailed proposal.",
      });
      setCurrentStep(4);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to submit quote. Please try again.",
        variant: "destructive",
      });
    },
  });

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Select Your IT Services</h2>
              <p className="text-gray-600">Choose the services you need for your business</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {serviceCategories.map((category) => {
                const IconComponent = iconMap[category.icon as keyof typeof iconMap] || Calculator;
                const isSelected = selectedServices.some(s => s.categoryId === category.id);
                
                return (
                  <Card key={category.id} className={`cursor-pointer transition-all hover:shadow-lg ${isSelected ? 'ring-2 ring-orange-500 bg-orange-50' : ''}`}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-8 h-8 text-orange-500" />
                        <div>
                          <CardTitle className="text-lg">{category.name}</CardTitle>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant="secondary">From ${category.basePrice}</Badge>
                            <Badge variant="outline">${category.hourlyRate}/hr</Badge>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <CardDescription className="mb-4">{category.description}</CardDescription>
                      <Button 
                        onClick={() => isSelected ? removeService(category.id) : addService(category)}
                        variant={isSelected ? "destructive" : "default"}
                        className="w-full"
                      >
                        {isSelected ? 'Remove Service' : 'Add Service'}
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            {selectedServices.length > 0 && (
              <div className="mt-8">
                <Button onClick={() => setCurrentStep(2)} className="w-full bg-orange-600 hover:bg-orange-700">
                  Configure Selected Services ({selectedServices.length})
                </Button>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Configure Your Services</h2>
              <p className="text-gray-600">Customize each service to match your needs</p>
            </div>

            {selectedServices.map((service) => {
              const options = serviceOptions[service.categoryId] || [];
              const IconComponent = iconMap[serviceCategories.find(c => c.id === service.categoryId)?.icon as keyof typeof iconMap] || Calculator;
              const serviceCost = calculateServiceCost(service, options);

              return (
                <Card key={service.categoryId}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <IconComponent className="w-6 h-6 text-orange-500" />
                        <CardTitle>{service.categoryName}</CardTitle>
                      </div>
                      <Badge className="bg-green-100 text-green-800">${serviceCost.toFixed(2)}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor={`hours-${service.categoryId}`}>Estimated Hours Needed</Label>
                      <Input
                        id={`hours-${service.categoryId}`}
                        type="number"
                        min="0"
                        step="0.5"
                        value={service.estimatedHours}
                        onChange={(e) => updateEstimatedHours(service.categoryId, parseFloat(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    {options.length > 0 && (
                      <div>
                        <Label>Additional Options</Label>
                        <div className="space-y-2 mt-2">
                          {options.map((option) => (
                            <div key={option.id} className="flex items-start space-x-3">
                              <input
                                type="checkbox"
                                id={`option-${option.id}`}
                                checked={service.selectedOptions.includes(option.id)}
                                onChange={(e) => updateServiceOptions(service.categoryId, option.id, e.target.checked)}
                                className="mt-1"
                              />
                              <div className="flex-1">
                                <label htmlFor={`option-${option.id}`} className="text-sm font-medium cursor-pointer">
                                  {option.name}
                                </label>
                                <p className="text-xs text-gray-500">{option.description}</p>
                                <Badge variant="outline" className="text-xs mt-1">
                                  {option.priceType === 'fixed' && `+$${option.priceModifier}`}
                                  {option.priceType === 'multiplier' && `×${option.priceModifier}`}
                                  {option.priceType === 'hourly' && `+$${option.priceModifier}/hr`}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}

            <div className="flex space-x-4">
              <Button onClick={() => setCurrentStep(1)} variant="outline" className="flex-1">
                Back to Services
              </Button>
              <Button onClick={() => setCurrentStep(3)} className="flex-1 bg-orange-600 hover:bg-orange-700">
                Continue to Contact Info
              </Button>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Information</h2>
              <p className="text-gray-600">Tell us about your project to receive a detailed quote</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <User className="w-5 h-5" />
                    <span>Contact Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="Your full name"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(305) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company">Company Name</Label>
                    <Input
                      id="company"
                      value={customerInfo.company}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, company: e.target.value }))}
                      placeholder="Your company"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building className="w-5 h-5" />
                    <span>Project Details</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="description">Project Description</Label>
                    <Textarea
                      id="description"
                      value={customerInfo.projectDescription}
                      onChange={(e) => setCustomerInfo(prev => ({ ...prev, projectDescription: e.target.value }))}
                      placeholder="Describe your IT needs and goals..."
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="urgency">Project Urgency</Label>
                    <Select value={customerInfo.urgency} onValueChange={(value) => setCustomerInfo(prev => ({ ...prev, urgency: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low - Can wait 2+ weeks</SelectItem>
                        <SelectItem value="normal">Normal - Within 1-2 weeks</SelectItem>
                        <SelectItem value="high">High - Within a few days</SelectItem>
                        <SelectItem value="urgent">Urgent - ASAP</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="contact-method">Preferred Contact Method</Label>
                    <Select value={customerInfo.contactMethod} onValueChange={(value) => setCustomerInfo(prev => ({ ...prev, contactMethod: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="email">Email</SelectItem>
                        <SelectItem value="phone">Phone Call</SelectItem>
                        <SelectItem value="both">Both Email & Phone</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex space-x-4">
              <Button onClick={() => setCurrentStep(2)} variant="outline" className="flex-1">
                Back to Configuration
              </Button>
              <Button 
                onClick={() => submitCalculation.mutate()}
                disabled={!customerInfo.name || !customerInfo.email || submitCalculation.isPending}
                className="flex-1 bg-orange-600 hover:bg-orange-700"
              >
                {submitCalculation.isPending ? 'Submitting...' : 'Get Your Quote'}
              </Button>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <Calculator className="w-8 h-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Quote Submitted Successfully!</h2>
            <p className="text-gray-600 max-w-md mx-auto">
              Thank you for choosing AramisTech. We'll review your requirements and contact you within 24 hours with a detailed proposal.
            </p>
            <div className="bg-gray-50 rounded-lg p-6 max-w-md mx-auto">
              <h3 className="font-semibold mb-2">Your Quote Summary</h3>
              <div className="text-2xl font-bold text-orange-600">${totalEstimate.toFixed(2)}</div>
              <p className="text-sm text-gray-500 mt-1">Estimated total cost</p>
            </div>
            <Button onClick={() => window.location.href = '/'} className="bg-orange-600 hover:bg-orange-700">
              Return to Home
            </Button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="pt-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              IT Service Calculator
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get an instant estimate for your IT project with our comprehensive pricing tool. 
              Over 27 years of experience serving South Florida businesses.
            </p>
          </div>

          {/* Progress Indicator */}
          {currentStep < 4 && (
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                {[1, 2, 3].map((step) => (
                  <div key={step} className="flex items-center">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      currentStep >= step ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-500'
                    }`}>
                      {step}
                    </div>
                    {step < 3 && (
                      <div className={`w-16 h-1 ${
                        currentStep > step ? 'bg-orange-600' : 'bg-gray-200'
                      }`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step Labels */}
          {currentStep < 4 && (
            <div className="flex justify-center mb-8">
              <div className="flex space-x-16">
                <span className={`text-sm ${currentStep === 1 ? 'font-semibold text-orange-600' : 'text-gray-500'}`}>
                  Select Services
                </span>
                <span className={`text-sm ${currentStep === 2 ? 'font-semibold text-orange-600' : 'text-gray-500'}`}>
                  Configure
                </span>
                <span className={`text-sm ${currentStep === 3 ? 'font-semibold text-orange-600' : 'text-gray-500'}`}>
                  Contact Info
                </span>
              </div>
            </div>
          )}

          {/* Pricing Summary */}
          {selectedServices.length > 0 && currentStep < 4 && (
            <Card className="mb-8 border-orange-200 bg-orange-50">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Your Quote Summary</span>
                  <span className="text-2xl font-bold text-orange-600">${totalEstimate.toFixed(2)}</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedServices.map((service) => {
                    const options = serviceOptions[service.categoryId] || [];
                    const cost = calculateServiceCost(service, options);
                    return (
                      <div key={service.categoryId} className="flex justify-between items-center">
                        <span className="text-sm">{service.categoryName}</span>
                        <span className="font-medium">${cost.toFixed(2)}</span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          <div className="bg-white rounded-lg shadow-sm border p-8">
            {renderStepContent()}
          </div>

          {/* Contact Section */}
          <div className="mt-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Need Help or Have Questions?
            </h3>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-6">
              <a href="tel:3058144461" className="flex items-center space-x-2 text-orange-600 hover:text-orange-700">
                <Phone className="w-5 h-5" />
                <span>(305) 814-4461</span>
              </a>
              <a href="mailto:sales@aramistech.com" className="flex items-center space-x-2 text-orange-600 hover:text-orange-700">
                <Mail className="w-5 h-5" />
                <span>sales@aramistech.com</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}