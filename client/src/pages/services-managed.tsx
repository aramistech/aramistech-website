import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowRight, CheckCircle, Server, Shield, Cloud, Headphones, Code, Globe, Archive, BarChart3, Wrench, Users, Wifi, Router, HardDrive, Cpu, Database, Network, Zap, Settings, Lock, CloudDownload, CloudUpload, Smartphone, Laptop, Monitor, Printer, Scan, FileText, Folder, Search, Bell, AlertTriangle, CheckCircle2, Activity, Gauge, TrendingUp, Building, Home, MapPin } from 'lucide-react';
import DynamicHeader from '@/components/dynamic-header';

interface StaticService {
  id: number;
  name: string;
  description: string;
  price: string;
  setupFee?: string;
  icon: string;
  buttonText: string;
  buttonUrl: string;
  buttonColor: string;
  isActive: boolean;
  orderIndex: number;
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  // Infrastructure & Servers
  server: Server,
  database: Database,
  hardDrive: HardDrive,
  cpu: Cpu,
  
  // Security & Protection
  shield: Shield,
  lock: Lock,
  
  // Networking & Connectivity
  network: Network,
  globe: Globe,
  wifi: Wifi,
  router: Router,
  
  // Cloud Services
  cloud: Cloud,
  cloudDownload: CloudDownload,
  cloudUpload: CloudUpload,
  
  // Support & Maintenance
  support: Headphones,
  maintenance: Wrench,
  settings: Settings,
  
  // Business & Analytics
  consulting: Users,
  analytics: BarChart3,
  activity: Activity,
  gauge: Gauge,
  trendingUp: TrendingUp,
  building: Building,
  
  // Development & Code
  code: Code,
  
  // Devices & Hardware
  laptop: Laptop,
  monitor: Monitor,
  smartphone: Smartphone,
  printer: Printer,
  
  // Data & Files
  backup: Archive,
  folder: Folder,
  fileText: FileText,
  scan: Scan,
  
  // Monitoring & Alerts
  bell: Bell,
  alertTriangle: AlertTriangle,
  checkCircle: CheckCircle2,
  search: Search,
  
  // Power & Performance
  zap: Zap,
  
  // Location & Office
  home: Home,
  mapPin: MapPin,
};

function ServiceCard({ service }: { service: StaticService }) {
  const IconComponent = iconMap[service.icon] || Server;

  return (
    <Card className="h-full transition-all duration-300 hover:shadow-xl hover:scale-105 border-gray-200">
      <CardContent className="p-8">
        <div className="flex flex-col h-full">
          {/* Service Icon and Title */}
          <div className="flex items-center gap-4 mb-6">
            <div className="p-3 bg-blue-50 rounded-xl">
              <IconComponent className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">{service.name}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-2xl font-bold text-blue-600">{service.price}</span>
                {service.setupFee && (
                  <span className="text-sm text-gray-500">+ {service.setupFee} setup</span>
                )}
              </div>
            </div>
          </div>

          {/* Service Description */}
          <div className="flex-1 mb-6">
            <p className="text-gray-600 leading-relaxed">{service.description}</p>
          </div>

          {/* Order Button */}
          <div className="mt-auto">
            <Button 
              asChild 
              className="w-full text-white font-semibold py-3 rounded-lg transition-colors"
              style={{ 
                backgroundColor: service.buttonColor || '#2563eb',
                ':hover': { backgroundColor: service.buttonColor ? `${service.buttonColor}dd` : '#1d4ed8' }
              }}
            >
              <a href={service.buttonUrl} target="_blank" rel="noopener noreferrer">
                {service.buttonText}
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      <div className="container mx-auto px-4 py-16">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-blue-600" />
          <p className="mt-4 text-gray-600">Loading services...</p>
        </div>
      </div>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Professional IT Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive IT solutions for South Florida businesses with 27+ years of experience
            </p>
          </div>

          {/* Error Message with Contact Info */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardContent className="p-8 text-center">
              <div className="text-yellow-600 mb-4">
                <CheckCircle className="w-12 h-12 mx-auto" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Services Currently Being Updated
              </h3>
              <p className="text-gray-600 mb-6">
                We're updating our service offerings. Contact us directly for immediate assistance and custom pricing.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild className="bg-blue-600 hover:bg-blue-700">
                  <a href="tel:+13058144461">
                    Call (305) 814-4461
                  </a>
                </Button>
                <Button asChild variant="outline">
                  <a href="mailto:sales@aramistech.com">
                    Email sales@aramistech.com
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8 mt-16">
            <div className="text-center">
              <div className="p-3 bg-blue-50 rounded-xl w-fit mx-auto mb-4">
                <Shield className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Cybersecurity</h4>
              <p className="text-gray-600">Advanced security solutions to protect your business</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-blue-50 rounded-xl w-fit mx-auto mb-4">
                <Cloud className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Cloud Services</h4>
              <p className="text-gray-600">Scalable cloud infrastructure and migration</p>
            </div>
            <div className="text-center">
              <div className="p-3 bg-blue-50 rounded-xl w-fit mx-auto mb-4">
                <Headphones className="w-8 h-8 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">24/7 Support</h4>
              <p className="text-gray-600">Round-the-clock technical support</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ServicesManagedPage() {
  const { data: servicesData, isLoading, error } = useQuery({
    queryKey: ['/api/static-services'],
    retry: 2,
  });

  const services = (servicesData as any)?.services || [];

  if (isLoading) {
    return <LoadingState />;
  }

  if (error || services.length === 0) {
    return <ErrorState />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DynamicHeader />
      
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
              Professional IT Solutions
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Maintenance Services
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose from our comprehensive maintenance packages designed to keep your business running smoothly with 27+ years of trusted expertise.
            </p>
          </div>

          {/* Services Grid */}
          <div className="grid lg:grid-cols-3 md:grid-cols-2 gap-8 mb-16">
            {services.map((service: StaticService) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>

          {/* Trust Indicators */}
          <div className="bg-white rounded-2xl p-8 shadow-sm border">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">27+</div>
                <div className="text-gray-600">Years Experience</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
                <div className="text-gray-600">Businesses Served</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
                <div className="text-gray-600">Support Available</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
                <div className="text-gray-600">Satisfaction Rate</div>
              </div>
            </div>
          </div>

          {/* Contact CTA */}
          <div className="text-center mt-16">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              Need a Custom Solution?
            </h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our experts can design a tailored maintenance package for your specific business needs. Contact us for a free consultation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <a href="tel:+13058144461">
                  Call (305) 814-4461
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <a href="mailto:sales@aramistech.com">
                  Get Free Quote
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}