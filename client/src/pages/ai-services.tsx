import React, { useState } from 'react';
import DynamicHeader from '@/components/dynamic-header';
import Footer from '@/components/footer';
import AIConsultationForm from '@/components/ai-consultation-form';
import { SEO } from '@/components/seo';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Brain, 
  Bot, 
  BarChart3, 
  Zap, 
  Eye, 
  Code2,
  Video,
  Users,
  CheckCircle,
  ArrowRight,
  Sparkles,
  MessageCircle,
  TrendingUp,
  Shield,
  Monitor,
  Workflow,
  FileText,
  Target,
  Cpu,
  Database,
  Network
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
    id: 'computer-vision',
    title: 'Computer Vision',
    icon: Eye,
    color: 'from-red-500 to-pink-600',
    borderColor: 'border-red-500',
    description: 'AI-powered image and video analysis for quality control, security monitoring, and automated visual inspection systems.',
    features: [
      'Image Recognition',
      'Quality Control',
      'Security Monitoring',
      'Object Detection',
      'Facial Recognition',
      'Anomaly Detection'
    ],
    useCases: [
      'Manufacturing quality assurance',
      'Security and surveillance systems',
      'Retail inventory tracking',
      'Medical image analysis',
      'Vehicle and traffic monitoring'
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
  }
];

export default function AIServices() {
  const [isConsultationFormOpen, setIsConsultationFormOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white">
      <SEO 
        title="AI Services - Advanced Machine Learning & AI Solutions | AramisTech"
        description="Comprehensive AI services including machine learning, chatbots, computer vision, automation, analytics, and custom AI agents. Transform your business with cutting-edge artificial intelligence."
      />
      <DynamicHeader />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 text-white py-20 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          {/* Animated Background Elements */}
          <div className="absolute top-20 left-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl animate-pulse delay-500"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <Badge className="bg-orange-500 hover:bg-orange-600 text-white mb-6 text-lg px-6 py-2">
              <Sparkles className="w-5 h-5 mr-2" />
              Advanced AI Solutions
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold leading-tight mb-6">
              Comprehensive
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-400 block">
                AI Services
              </span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 leading-relaxed max-w-3xl mx-auto">
              Discover our full suite of artificial intelligence solutions designed to transform your business. 
              From machine learning and automation to custom AI agents and computer vision, we deliver 
              cutting-edge technology tailored to your industry needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
                onClick={() => setIsConsultationFormOpen(true)}
              >
                Start Your AI Project
                <ArrowRight className="ml-2 w-6 h-6" />
              </Button>
              <Link href="/it-consultation">
                <Button size="lg" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-4 text-lg">
                  Free Consultation
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Our AI Service Portfolio
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Explore our comprehensive range of AI services designed to revolutionize your business operations
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {aiServices.map((service) => {
              const IconComponent = service.icon;
              const isSelected = selectedService === service.id;
              
              return (
                <Card 
                  key={service.id}
                  className={`group relative overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 cursor-pointer border-2 ${
                    isSelected ? service.borderColor : 'border-gray-200'
                  }`}
                  onClick={() => setSelectedService(isSelected ? null : service.id)}
                >
                  <div className={`absolute inset-0 bg-gradient-to-br ${service.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-center space-x-4 mb-4">
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${service.color} text-white shadow-lg`}>
                        <IconComponent className="w-6 h-6" />
                      </div>
                      <CardTitle className="text-xl font-bold text-gray-900 group-hover:text-blue-900 transition-colors">
                        {service.title}
                      </CardTitle>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {service.description}
                    </p>
                  </CardHeader>

                  <CardContent className="relative z-10">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                          <Target className="w-4 h-4 mr-2 text-orange-500" />
                          Key Features
                        </h4>
                        <div className="grid grid-cols-1 gap-2">
                          {service.features.slice(0, isSelected ? service.features.length : 3).map((feature, idx) => (
                            <div key={idx} className="flex items-center text-sm text-gray-600">
                              <CheckCircle className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                              {feature}
                            </div>
                          ))}
                          {!isSelected && service.features.length > 3 && (
                            <div className="text-sm text-blue-600 font-medium">
                              +{service.features.length - 3} more features
                            </div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-6 pt-4 border-t border-gray-200 animate-fade-in">
                          <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                            <TrendingUp className="w-4 h-4 mr-2 text-orange-500" />
                            Use Cases
                          </h4>
                          <div className="space-y-2">
                            {service.useCases.map((useCase, idx) => (
                              <div key={idx} className="flex items-start text-sm text-gray-600">
                                <ArrowRight className="w-4 h-4 mr-2 text-blue-500 flex-shrink-0 mt-0.5" />
                                {useCase}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <Button 
                        className="w-full mt-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsConsultationFormOpen(true);
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
        </div>
      </section>

      {/* Technology Stack Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Cutting-Edge AI Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We leverage the latest AI frameworks and technologies to deliver robust, scalable solutions
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
            {[
              { name: 'TensorFlow', icon: Cpu },
              { name: 'PyTorch', icon: Brain },
              { name: 'OpenAI API', icon: Bot },
              { name: 'Google AI', icon: Database },
              { name: 'Azure ML', icon: Network },
              { name: 'Custom Models', icon: Code2 }
            ].map((tech) => {
              const IconComponent = tech.icon;
              return (
                <div key={tech.name} className="text-center group">
                  <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="font-medium text-gray-900">{tech.name}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-br from-blue-900 to-purple-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Business with AI?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Let's discuss how our AI solutions can solve your specific challenges and drive growth. 
            Our 27+ years of technical expertise ensures successful implementation.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-4 text-lg"
              onClick={() => setIsConsultationFormOpen(true)}
            >
              Schedule AI Consultation
              <ArrowRight className="ml-2 w-6 h-6" />
            </Button>
            <Link href="/it-consultation">
              <Button size="lg" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-4 text-lg">
                View All Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* AI Consultation Form Modal */}
      {isConsultationFormOpen && (
        <AIConsultationForm 
          isOpen={isConsultationFormOpen}
          onClose={() => setIsConsultationFormOpen(false)}
        />
      )}
    </div>
  );
}