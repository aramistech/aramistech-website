import React, { useState } from 'react';
import DynamicHeader from '@/components/dynamic-header';
import Footer from '@/components/footer';
import AIConsultationForm from '@/components/ai-consultation-form';
import { ServiceSpecificForm } from '@/components/service-specific-forms';
import { SEO, SEOConfigs } from '@/components/seo';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Bot, 
  Database, 
  Network, 
  Zap, 
  Target, 
  Users, 
  TrendingUp,
  CheckCircle,
  ArrowRight,
  Cpu,
  Code2,
  Video,
  BarChart3,
  Shield,
  MessageCircle,
  Sparkles,
  FileText,
  Workflow,
  Monitor
} from 'lucide-react';
import { Link } from 'wouter';

const aiServices = [
  {
    id: 'machine-learning',
    title: 'Machine Learning',
    icon: Brain,
    color: 'from-blue-500 to-purple-600',
    borderColor: 'border-blue-500',
    description: 'Custom ML models for pattern recognition, predictive analytics, and automated decision-making to optimize your business processes.',
    features: [
      'Predictive Analytics',
      'Data Pattern Recognition', 
      'Automated Classification',
      'Intelligent Forecasting',
      'Risk Assessment Models',
      'Customer Behavior Analysis'
    ],
    useCases: [
      'Sales forecasting and inventory optimization',
      'Customer churn prediction and retention',
      'Quality control and defect detection',
      'Financial risk assessment',
      'Dynamic pricing strategies'
    ]
  },
  {
    id: 'ai-chatbots',
    title: 'AI Chatbots',
    icon: MessageCircle,
    color: 'from-green-500 to-emerald-600',
    borderColor: 'border-green-500',
    description: 'Intelligent conversational AI that handles customer inquiries, provides support, and generates leads 24/7 with natural language understanding.',
    features: [
      'Natural Language Processing',
      '24/7 Customer Support',
      'Lead Generation',
      'Multi-language Support',
      'Integration with CRM',
      'Sentiment Analysis'
    ],
    useCases: [
      'Customer service automation',
      'Lead qualification and nurturing',
      'FAQ and support ticket reduction',
      'Sales assistance and product recommendations',
      'Appointment scheduling and booking'
    ]
  },
  {
    id: 'ai-analytics',
    title: 'AI Analytics',
    icon: BarChart3,
    color: 'from-purple-500 to-pink-600',
    borderColor: 'border-purple-500',
    description: 'Transform raw data into actionable insights with AI-powered analytics platforms that reveal trends, opportunities, and optimization strategies.',
    features: [
      'Business Intelligence',
      'Real-time Dashboards',
      'Predictive Modeling',
      'Performance Optimization',
      'Automated Reporting',
      'Data Visualization'
    ],
    useCases: [
      'Marketing campaign optimization',
      'Operational efficiency analysis',
      'Financial performance insights',
      'Website and app analytics',
      'Supply chain optimization'
    ]
  },
  {
    id: 'ai-automation',
    title: 'AI Automation',
    icon: Zap,
    color: 'from-orange-500 to-red-600',
    borderColor: 'border-orange-500',
    description: 'Intelligent process automation that learns and adapts, reducing manual work while improving accuracy and efficiency across your operations.',
    features: [
      'Workflow Optimization',
      'Document Processing',
      'Task Automation',
      'Smart Scheduling',
      'Error Reduction',
      'Cost Optimization'
    ],
    useCases: [
      'Invoice and document processing',
      'Email marketing automation',
      'Inventory management',
      'Employee scheduling optimization',
      'Data entry and validation'
    ]
  },
  {
    id: 'custom-ai-solutions',
    title: 'Custom AI Solutions',
    icon: Code2,
    color: 'from-indigo-500 to-blue-600',
    borderColor: 'border-indigo-500',
    description: 'Tailored AI applications designed specifically for your industry and business needs, from concept to deployment and ongoing optimization.',
    features: [
      'Industry-Specific Solutions',
      'API Integration',
      'Scalable Architecture',
      'Custom Training',
      'Performance Monitoring',
      'Continuous Learning'
    ],
    useCases: [
      'Healthcare diagnostic tools',
      'Legal document analysis',
      'Real estate valuation models',
      'Educational learning platforms',
      'Agriculture optimization systems'
    ]
  },
  {
    id: 'ai-agents',
    title: 'AI Agents',
    icon: Users,
    color: 'from-cyan-500 to-blue-600',
    borderColor: 'border-cyan-500',
    description: 'Intelligent autonomous agents that can perform complex tasks, make decisions, and interact with multiple systems to achieve specific business objectives.',
    features: [
      'Autonomous Decision Making',
      'Multi-system Integration',
      'Task Orchestration',
      'Learning & Adaptation',
      'Goal-oriented Behavior',
      'Real-time Monitoring'
    ],
    useCases: [
      'Automated trading and investment',
      'Smart home and IoT management',
      'Customer journey orchestration',
      'Supply chain coordination',
      'Personal assistant services'
    ]
  },
  {
    id: 'ai-promo-videos',
    title: 'AI-Powered Promo Videos',
    icon: Video,
    color: 'from-yellow-500 to-orange-600',
    borderColor: 'border-yellow-500',
    description: 'Professional promotional videos created with cutting-edge AI tools, including intelligent editing, custom prompts, and automated post-production for maximum marketing impact.',
    features: [
      'AI-Enhanced Editing',
      'Custom Script Generation',
      'Automated Visual Effects',
      'Voice Synthesis',
      'Brand Integration',
      'Multi-format Output'
    ],
    useCases: [
      'Product launch videos',
      'Social media content creation',
      'Training and educational videos',
      'Marketing campaign assets',
      'Corporate presentation videos'
    ]
  }
];

export default function AIDevelopment() {
  const [isConsultationFormOpen, setIsConsultationFormOpen] = useState(false);
  const [serviceFormOpen, setServiceFormOpen] = useState(false);
  const [selectedServiceType, setSelectedServiceType] = useState<string>('');

  return (
    <div className="min-h-screen bg-white">
      <SEO {...SEOConfigs.aiDevelopment} />
      
      <DynamicHeader />

      {/* Hero Section - Futuristic Design */}
      <section className="pt-32 pb-20 relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0">
          {/* Grid Pattern */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.02)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
          
          {/* Floating Orbs */}
          <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/20 rounded-full blur-xl animate-float" style={{animationDelay: '2s'}}></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-cyan-500/20 rounded-full blur-xl animate-float" style={{animationDelay: '4s'}}></div>
          
          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 via-transparent to-purple-600/5"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/10 to-slate-900/20"></div>
        </div>

        {/* Neural Network Animation */}
        <div className="absolute inset-0 opacity-10">
          <svg className="w-full h-full" viewBox="0 0 1200 800">
            {/* Animated connection lines */}
            {Array.from({ length: 12 }).map((_, i) => (
              <g key={i}>
                <circle 
                  cx={100 + (i * 100)} 
                  cy={200 + (i % 3) * 200} 
                  r="2" 
                  fill="white"
                  opacity="0.6"
                >
                  <animate 
                    attributeName="opacity" 
                    values="0.2;1;0.2" 
                    dur={`${3 + i * 0.2}s`} 
                    repeatCount="indefinite"
                  />
                </circle>
                
                {i < 11 && (
                  <line 
                    x1={100 + (i * 100)} 
                    y1={200 + (i % 3) * 200} 
                    x2={100 + ((i + 1) * 100)} 
                    y2={200 + ((i + 1) % 3) * 200} 
                    stroke="white" 
                    strokeWidth="1"
                    opacity="0.3"
                  >
                    <animate 
                      attributeName="opacity" 
                      values="0.1;0.5;0.1" 
                      dur={`${4 + i * 0.3}s`} 
                      repeatCount="indefinite"
                    />
                  </line>
                )}
              </g>
            ))}
          </svg>
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Futuristic Badge */}
            <div className="relative inline-block mb-6">
              <Badge className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-300 backdrop-blur-sm text-lg px-6 py-3 font-medium">
                <span className="relative z-10">AI Development Solutions</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full blur-sm"></div>
              </Badge>
            </div>

            {/* Main Heading with Futuristic Effects */}
            <div className="relative mb-8">
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight relative">
                <span className="animate-gradient">
                  Transform Your Business with
                </span>
                <br />
                <span className="animate-gradient">
                  Intelligent AI Solutions
                </span>
              </h1>
              
              {/* Scan line effect */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="h-px bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-scan"></div>
              </div>
            </div>

            {/* Description with glow effect */}
            <div className="relative mb-10">
              <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
                Transform your business operations with custom AI solutions. From intelligent automation to predictive analytics, 
                we develop cutting-edge artificial intelligence systems that drive efficiency and innovation for South Florida businesses.
              </p>
            </div>

            {/* Futuristic Button */}
            <div className="flex justify-center">
              <div className="relative group">
                <Button 
                  size="lg" 
                  className="relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-4 text-lg border border-blue-500/30 backdrop-blur-sm overflow-hidden"
                  onClick={() => setIsConsultationFormOpen(true)}
                >
                  <span className="relative z-10 flex items-center">
                    Get Free AI Consultation
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </span>
                  {/* Button glow effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/50 to-purple-600/50 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  {/* Animated border */}
                  <div className="absolute inset-0 rounded-lg border border-blue-400/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </Button>
              </div>
            </div>

            {/* Floating Tech Icons */}
            <div className="absolute -left-20 top-1/4 opacity-20">
              <div className="w-16 h-16 border border-blue-400/30 rounded-lg rotate-45 animate-float">
                <Brain className="w-8 h-8 text-blue-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-45" />
              </div>
            </div>
            
            <div className="absolute -right-20 top-1/3 opacity-20">
              <div className="w-12 h-12 border border-purple-400/30 rounded-full animate-float" style={{animationDelay: '1s'}}>
                <Cpu className="w-6 h-6 text-purple-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>

            <div className="absolute left-1/4 -bottom-10 opacity-20">
              <div className="w-10 h-10 border border-cyan-400/30 rounded-lg rotate-12 animate-float" style={{animationDelay: '2s'}}>
                <Network className="w-5 h-5 text-cyan-400 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 -rotate-12" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trusted AI Solutions Provider</h2>
            <p className="text-gray-600">Serving South Florida businesses with 5+ years of technology expertise</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">5+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">100+</div>
              <div className="text-gray-600">Projects Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">100%</div>
              <div className="text-gray-600">Client Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">24/7</div>
              <div className="text-gray-600">AI Support</div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Services Section */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4">Our AI Service Portfolio</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Explore our comprehensive range of AI services designed to revolutionize your business operations
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From intelligent chatbots to predictive analytics, we deliver AI solutions that transform how your business operates and serves customers.
            </p>
          </div>

          {/* First Row - Machine Learning, AI Chatbots, AI Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {aiServices.slice(0, 3).map((service) => {
              const IconComponent = service.icon;
              
              return (
                <Card key={service.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-gray-200">
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <CardContent className="p-8 relative z-10">
                    <CardHeader className="p-0 mb-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`p-4 rounded-lg bg-gradient-to-br ${service.color} text-white shadow-lg`}>
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                          {service.title}
                        </CardTitle>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {service.description}
                      </p>
                    </CardHeader>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                          Key Features
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                              {feature}
                            </div>
                          ))}
                          {service.features.length > 3 && (
                            <div className="text-blue-600 font-medium">
                              +{service.features.length - 3} more features
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <Button 
                        className={`w-full bg-gradient-to-r ${service.color} text-white hover:shadow-lg transition-all duration-300`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServiceType(service.id);
                          setServiceFormOpen(true);
                        }}
                      >
                        Get Started with {service.title}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Second Row - AI Automation, Custom AI Solutions, AI Agents */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {aiServices.slice(3, 6).map((service) => {
              const IconComponent = service.icon;
              
              return (
                <Card key={service.id} className="group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-2 border-gray-200">
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <CardContent className="p-8 relative z-10">
                    <CardHeader className="p-0 mb-6">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className={`p-4 rounded-lg bg-gradient-to-br ${service.color} text-white shadow-lg`}>
                          <IconComponent className="w-8 h-8" />
                        </div>
                        <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                          {service.title}
                        </CardTitle>
                      </div>
                      <p className="text-gray-600 text-lg leading-relaxed">
                        {service.description}
                      </p>
                    </CardHeader>

                    <div className="space-y-6">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                          <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                          Key Features
                        </h4>
                        <div className="grid grid-cols-1 gap-3">
                          {service.features.slice(0, 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center text-gray-600">
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 flex-shrink-0"></div>
                              {feature}
                            </div>
                          ))}
                          {service.features.length > 3 && (
                            <div className="text-blue-600 font-medium">
                              +{service.features.length - 3} more features
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-8">
                      <Button 
                        className={`w-full bg-gradient-to-r ${service.color} text-white hover:shadow-lg transition-all duration-300`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedServiceType(service.id);
                          setServiceFormOpen(true);
                        }}
                      >
                        Get Started with {service.title}
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* AI-Powered Videos - Full Width Bottom */}
          <div className="max-w-6xl mx-auto">
            {aiServices.slice(6).map((service) => {
              const IconComponent = service.icon;
              
              return (
                <Card 
                  key={service.id}
                  className="group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 border-2 border-gray-200"
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <div className="grid md:grid-cols-2 gap-8 p-8">
                    <div className="relative z-10">
                      <CardHeader className="p-0 mb-6">
                        <div className="flex items-center space-x-4 mb-4">
                          <div className={`p-4 rounded-lg bg-gradient-to-br ${service.color} text-white shadow-lg`}>
                            <IconComponent className="w-8 h-8" />
                          </div>
                          <CardTitle className="text-2xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                            {service.title}
                          </CardTitle>
                        </div>
                        <p className="text-gray-600 text-lg leading-relaxed">
                          {service.description}
                        </p>
                      </CardHeader>

                      <div className="space-y-6">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                            <CheckCircle className="w-5 h-5 mr-2 text-green-500" />
                            Key Features
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {service.features.map((feature, idx) => (
                              <div key={idx} className="flex items-center text-gray-600">
                                <CheckCircle className="w-4 h-4 mr-3 text-green-500 flex-shrink-0" />
                                {feature}
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="pt-4 border-t border-gray-200">
                          <h4 className="font-semibold text-gray-900 mb-4 flex items-center text-lg">
                            <TrendingUp className="w-5 h-5 mr-2 text-orange-500" />
                            Use Cases
                          </h4>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {service.useCases.map((useCase, idx) => (
                              <div key={idx} className="flex items-start text-gray-600">
                                <ArrowRight className="w-4 h-4 mr-3 text-blue-500 flex-shrink-0 mt-0.5" />
                                {useCase}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="relative z-10 flex items-center justify-center">
                      <div className="relative w-full max-w-md mx-auto">
                        <div className="relative bg-gradient-to-br from-yellow-100 to-orange-100 rounded-2xl p-8 shadow-inner">
                          <div className="bg-gray-900 rounded-lg p-4 mb-4 relative overflow-hidden">
                            <div className="aspect-video bg-gradient-to-br from-yellow-400 to-orange-500 rounded flex items-center justify-center relative">
                              <div className="absolute inset-0 bg-black bg-opacity-20 flex items-center justify-center">
                                <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center animate-pulse">
                                  <div className="w-0 h-0 border-l-[20px] border-l-gray-900 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent ml-1"></div>
                                </div>
                              </div>
                              <div className="absolute top-2 left-2 w-2 h-2 bg-white rounded-full animate-ping"></div>
                              <div className="absolute top-4 right-3 w-1.5 h-1.5 bg-yellow-300 rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                              <div className="absolute bottom-3 left-4 w-2 h-2 bg-orange-300 rounded-full animate-ping" style={{animationDelay: '1s'}}></div>
                            </div>
                            <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full animate-pulse" style={{width: '60%'}}></div>
                            </div>
                          </div>
                          
                          <div className="flex justify-center space-x-2">
                            <div className="w-8 h-8 bg-yellow-400 rounded-lg flex items-center justify-center">
                              <Sparkles className="w-4 h-4 text-gray-900" />
                            </div>
                            <div className="w-8 h-8 bg-orange-400 rounded-lg flex items-center justify-center">
                              <Zap className="w-4 h-4 text-gray-900" />
                            </div>
                            <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                              <TrendingUp className="w-4 h-4 text-gray-900" />
                            </div>
                          </div>
                        </div>
                        
                        <div className="absolute -top-2 -right-2 w-6 h-6 bg-yellow-400 rounded-full animate-float"></div>
                        <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-orange-500 rounded-full animate-float" style={{animationDelay: '1s'}}></div>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 pt-0 relative z-20">
                    <Button 
                      className="w-full bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700 text-white text-lg py-4 relative z-30"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedServiceType(service.id);
                        setServiceFormOpen(true);
                      }}
                    >
                      Get Started with {service.title}
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Development Process */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-orange-100 text-orange-800 mb-4">Our Process</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Proven AI Development Methodology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our systematic approach ensures successful AI implementation from initial consultation 
              to deployment and ongoing optimization.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">1. Discovery & Analysis</h3>
              <p className="text-gray-600">
                We analyze your business processes, data sources, and objectives to identify 
                the best AI opportunities for maximum impact.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Cpu className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">2. Model Development</h3>
              <p className="text-gray-600">
                Our experts develop and train custom AI models using your data, 
                ensuring optimal performance for your specific use case.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Network className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">3. Integration & Testing</h3>
              <p className="text-gray-600">
                We seamlessly integrate AI solutions into your existing systems 
                with comprehensive testing to ensure reliability and performance.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Optimization & Support</h3>
              <p className="text-gray-600">
                Continuous monitoring and optimization ensure your AI solutions 
                evolve with your business needs and deliver lasting value.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Cutting-Edge AI Technology */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Cutting-Edge AI Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We leverage the latest AI frameworks and technologies to deliver robust, 
              scalable solutions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8 max-w-5xl mx-auto">
            {/* TensorFlow */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M1.292 5.856L11.54 0v24l-4.095-2.378V7.603L1.292 5.856zm21.416 5.516l-4.095-2.378V24L7.446 18.49l4.095-2.378L18.613 9.372z"/>
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">TensorFlow</h3>
            </div>

            {/* PyTorch */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-orange-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-orange-100 transition-colors">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.568 7.568c-.878-.878-2.298-.878-3.176 0-.878.878-.878 2.298 0 3.176.878.878 2.298.878 3.176 0 .878-.878.878-2.298 0-3.176z"/>
                  </svg>
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">PyTorch</h3>
            </div>

            {/* OpenAI API */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-green-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-100 transition-colors">
                <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                  <Brain className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">OpenAI API</h3>
            </div>

            {/* Google AI */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-purple-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-purple-100 transition-colors">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center">
                  <Database className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Google AI</h3>
            </div>

            {/* Azure ML */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-100 transition-colors">
                <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center">
                  <Network className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Azure ML</h3>
            </div>

            {/* Custom Models */}
            <div className="flex flex-col items-center text-center group">
              <div className="w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-gray-100 transition-colors">
                <div className="w-12 h-12 bg-gray-600 rounded-lg flex items-center justify-center">
                  <Code2 className="w-8 h-8 text-white" />
                </div>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">Custom Models</h3>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">Ready to Transform Your Business with AI?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-90">
            Join hundreds of businesses that have already revolutionized their operations with our AI solutions. 
            Start your AI journey today with a free consultation.
          </p>
          <Button 
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold"
            onClick={() => setIsConsultationFormOpen(true)}
          >
            Schedule Free AI Consultation
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>
      </section>

      <Footer />
      
      {/* AI Consultation Form */}
      {isConsultationFormOpen && (
        <AIConsultationForm
          isOpen={isConsultationFormOpen}
          onClose={() => setIsConsultationFormOpen(false)}
        />
      )}
      
      {/* Service-Specific Form Modal */}
      {serviceFormOpen && (
        <ServiceSpecificForm 
          isOpen={serviceFormOpen}
          onClose={() => setServiceFormOpen(false)}
          serviceType={selectedServiceType}
        />
      )}
    </div>
  );
}