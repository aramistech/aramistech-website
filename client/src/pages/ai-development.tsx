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
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-blue-800 to-slate-900 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-orange-500 hover:bg-orange-600 text-white mb-6">
                AI & Machine Learning Solutions
              </Badge>
              <h1 className="text-4xl lg:text-6xl font-bold leading-tight mb-6">
                Intelligent AI Development
                <span className="text-orange-400 block">For Your Business</span>
              </h1>
              <p className="text-xl text-blue-100 mb-8 leading-relaxed">
                Transform your business operations with custom AI solutions. From intelligent automation 
                to predictive analytics, we develop cutting-edge artificial intelligence systems that 
                drive efficiency and innovation for South Florida businesses.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button 
                  size="lg" 
                  className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
                  onClick={() => setIsConsultationFormOpen(true)}
                >
                  Start Your AI Project
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
                <Link href="/ai-services">
                  <Button size="lg" variant="outline" className="border-blue-400 text-blue-400 hover:bg-blue-400 hover:text-white px-8 py-3">
                    Explore AI Services
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-lg shadow-2xl overflow-hidden h-96 flex items-center justify-center">
                <svg viewBox="0 0 500 350" className="w-full h-full">
                  <defs>
                    {/* Glowing Effects */}
                    <filter id="glow">
                      <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                      <feMerge> 
                        <feMergeNode in="coloredBlur"/>
                        <feMergeNode in="SourceGraphic"/>
                      </feMerge>
                    </filter>
                    
                    {/* Gradients */}
                    <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
                      <stop offset="0%" stopColor="#F97316" stopOpacity="1" />
                      <stop offset="70%" stopColor="#3B82F6" stopOpacity="0.8" />
                      <stop offset="100%" stopColor="#1E293B" stopOpacity="0.3" />
                    </radialGradient>
                    
                    <linearGradient id="pulseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="50%" stopColor="#3B82F6" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                    
                    <linearGradient id="dataStream" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="transparent" />
                      <stop offset="50%" stopColor="#F97316" />
                      <stop offset="100%" stopColor="transparent" />
                    </linearGradient>
                  </defs>
                  
                  {/* Background Grid */}
                  <g opacity="0.1">
                    {Array.from({length: 25}, (_, i) => (
                      <line key={`v${i}`} x1={i * 20} y1="0" x2={i * 20} y2="350" stroke="#3B82F6" strokeWidth="0.5" />
                    ))}
                    {Array.from({length: 18}, (_, i) => (
                      <line key={`h${i}`} x1="0" y1={i * 20} x2="500" y2={i * 20} stroke="#3B82F6" strokeWidth="0.5" />
                    ))}
                  </g>
                  
                  {/* Central AI Core */}
                  <g transform="translate(250, 175)">
                    <circle r="60" fill="url(#coreGradient)" filter="url(#glow)">
                      <animate attributeName="r" values="60;65;60" dur="3s" repeatCount="indefinite" />
                    </circle>
                    
                    {/* Rotating Rings */}
                    <circle r="80" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.6" strokeDasharray="5,5">
                      <animateTransform attributeName="transform" type="rotate" values="0;360" dur="8s" repeatCount="indefinite" />
                    </circle>
                    <circle r="100" fill="none" stroke="#8B5CF6" strokeWidth="1" opacity="0.4" strokeDasharray="3,7">
                      <animateTransform attributeName="transform" type="rotate" values="360;0" dur="12s" repeatCount="indefinite" />
                    </circle>
                    
                    {/* Central Brain */}
                    <g transform="scale(1.5)">
                      <path d="M-15 -5 C-15 -15, -8 -20, 0 -20 C8 -20, 15 -15, 15 -5 C15 5, 10 10, 5 10 L-5 10 C-10 10, -15 5, -15 -5 Z" 
                            fill="#FFFFFF" opacity="0.9" />
                      <circle cx="-5" cy="-2" r="1.5" fill="#3B82F6" />
                      <circle cx="5" cy="-2" r="1.5" fill="#3B82F6" />
                      <path d="M-3 3 Q0 6 3 3" stroke="#3B82F6" strokeWidth="1" fill="none" />
                      
                      {/* Neural pathways */}
                      <path d="M-10 -8 Q-5 -10 0 -8 Q5 -10 10 -8" stroke="#F97316" strokeWidth="1" fill="none" opacity="0.8">
                        <animate attributeName="opacity" values="0.3;0.8;0.3" dur="2s" repeatCount="indefinite" />
                      </path>
                    </g>
                  </g>
                  
                  {/* Data Streams */}
                  <g>
                    {/* Left to Center */}
                    <path d="M50 100 Q150 120 200 140" stroke="url(#dataStream)" strokeWidth="3" fill="none">
                      <animate attributeName="stroke-dasharray" values="0,200;100,100;0,200" dur="3s" repeatCount="indefinite" />
                    </path>
                    <path d="M50 200 Q150 180 200 160" stroke="url(#dataStream)" strokeWidth="3" fill="none">
                      <animate attributeName="stroke-dasharray" values="0,200;100,100;0,200" dur="3.5s" repeatCount="indefinite" />
                    </path>
                    
                    {/* Right to Center */}
                    <path d="M450 120 Q350 140 300 160" stroke="url(#dataStream)" strokeWidth="3" fill="none">
                      <animate attributeName="stroke-dasharray" values="0,200;100,100;0,200" dur="2.8s" repeatCount="indefinite" />
                    </path>
                    <path d="M450 220 Q350 200 300 180" stroke="url(#dataStream)" strokeWidth="3" fill="none">
                      <animate attributeName="stroke-dasharray" values="0,200;100,100;0,200" dur="3.2s" repeatCount="indefinite" />
                    </path>
                  </g>
                  
                  {/* Floating Data Nodes */}
                  <g>
                    <circle cx="80" cy="80" r="8" fill="#3B82F6" filter="url(#glow)">
                      <animate attributeName="cy" values="80;70;80" dur="4s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;1;0.6" dur="2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="420" cy="100" r="6" fill="#8B5CF6" filter="url(#glow)">
                      <animate attributeName="cy" values="100;90;100" dur="3.5s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;1;0.6" dur="2.5s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="100" cy="250" r="7" fill="#F97316" filter="url(#glow)">
                      <animate attributeName="cy" values="250;240;250" dur="3.8s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;1;0.6" dur="2.2s" repeatCount="indefinite" />
                    </circle>
                    <circle cx="400" cy="270" r="5" fill="#06B6D4" filter="url(#glow)">
                      <animate attributeName="cy" values="270;260;270" dur="4.2s" repeatCount="indefinite" />
                      <animate attributeName="opacity" values="0.6;1;0.6" dur="1.8s" repeatCount="indefinite" />
                    </circle>
                  </g>
                  
                  {/* AI Code Elements */}
                  <g transform="translate(50, 300)" opacity="0.8">
                    <text x="0" y="0" fontFamily="'Courier New', monospace" fontSize="14" fill="#3B82F6" filter="url(#glow)">
                      &lt;neural_network&gt;
                    </text>
                    <text x="180" y="0" fontFamily="'Courier New', monospace" fontSize="14" fill="#8B5CF6" filter="url(#glow)">
                      deep_learning()
                    </text>
                    <text x="350" y="0" fontFamily="'Courier New', monospace" fontSize="14" fill="#F97316" filter="url(#glow)">
                      AI.evolve()
                    </text>
                  </g>
                  
                  {/* Particle Effects */}
                  <g opacity="0.6">
                    {Array.from({length: 15}, (_, i) => (
                      <circle key={i} 
                        cx={50 + i * 30} 
                        cy={50 + (i % 3) * 100} 
                        r="1" 
                        fill="#FFFFFF">
                        <animate 
                          attributeName="opacity" 
                          values="0;1;0" 
                          dur={`${2 + i * 0.3}s`} 
                          repeatCount="indefinite" 
                        />
                        <animate 
                          attributeName="cy" 
                          values={`${50 + (i % 3) * 100};${40 + (i % 3) * 100};${50 + (i % 3) * 100}`} 
                          dur={`${3 + i * 0.2}s`} 
                          repeatCount="indefinite" 
                        />
                      </circle>
                    ))}
                  </g>
                </svg>
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/30 to-transparent rounded-lg"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-12 bg-gray-50 border-b">
        <div className="container mx-auto px-6">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trusted AI Solutions Provider</h2>
            <p className="text-gray-600">Serving South Florida businesses with 27+ years of technology expertise</p>
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
      <section id="services" className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <Badge className="bg-blue-100 text-blue-800 mb-4">Our AI Expertise</Badge>
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Comprehensive AI Development Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From intelligent chatbots to predictive analytics, we deliver AI solutions 
              that transform how your business operates and serves customers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Machine Learning */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg mr-4 group-hover:bg-blue-200 transition-colors">
                    <Brain className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Machine Learning</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Custom ML models for pattern recognition, predictive analytics, and automated decision-making 
                  to optimize your business processes.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Predictive Analytics
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Data Pattern Recognition
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Automated Classification
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Intelligent Chatbots */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-green-100 rounded-lg mr-4 group-hover:bg-green-200 transition-colors">
                    <Bot className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">AI Chatbots</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Intelligent conversational AI that handles customer inquiries, provides support, 
                  and generates leads 24/7 with natural language understanding.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Natural Language Processing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    24/7 Customer Support
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Lead Generation
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Data Analytics */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg mr-4 group-hover:bg-purple-200 transition-colors">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">AI Analytics</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Transform raw data into actionable insights with AI-powered analytics platforms 
                  that reveal trends, opportunities, and optimization strategies.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Business Intelligence
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Real-time Dashboards
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Predictive Modeling
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Process Automation */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-orange-100 rounded-lg mr-4 group-hover:bg-orange-200 transition-colors">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">AI Automation</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Intelligent process automation that learns and adapts, reducing manual work 
                  while improving accuracy and efficiency across your operations.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Workflow Optimization
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Document Processing
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Task Automation
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Computer Vision */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-red-100 rounded-lg mr-4 group-hover:bg-red-200 transition-colors">
                    <Target className="w-6 h-6 text-red-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Computer Vision</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  AI-powered image and video analysis for quality control, security monitoring, 
                  and automated visual inspection systems.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Image Recognition
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Quality Control
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Security Monitoring
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* Custom AI Solutions */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-indigo-500">
              <CardContent className="p-6">
                <div className="flex items-center mb-4">
                  <div className="p-3 bg-indigo-100 rounded-lg mr-4 group-hover:bg-indigo-200 transition-colors">
                    <Code2 className="w-6 h-6 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900">Custom AI Solutions</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  Tailored AI applications designed specifically for your industry and business needs, 
                  from concept to deployment and ongoing optimization.
                </p>
                <ul className="space-y-2 text-sm text-gray-600">
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Industry-Specific Solutions
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    API Integration
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    Scalable Architecture
                  </li>
                </ul>
              </CardContent>
            </Card>

            {/* AI-Powered Promo Videos - Wide Layout */}
            <Card className="group hover:shadow-lg transition-all duration-300 border-l-4 border-l-orange-500 md:col-span-2 lg:col-span-3">
              <CardContent className="p-8">
                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8">
                  {/* Content Section */}
                  <div className="flex-1">
                    <div className="flex items-center mb-4">
                      <div className="p-3 bg-orange-100 rounded-lg mr-4 group-hover:bg-orange-200 transition-colors">
                        <Video className="w-6 h-6 text-orange-600" />
                      </div>
                      <h3 className="text-2xl font-semibold text-gray-900">AI-Powered Promo Videos</h3>
                    </div>
                    <p className="text-gray-600 mb-6 text-lg">
                      Professional promotional videos created with cutting-edge AI tools, including intelligent 
                      editing, custom prompts, and automated post-production for maximum marketing impact.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700 font-medium">AI-Enhanced Editing</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700 font-medium">Custom Script Generation</span>
                      </div>
                      <div className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-700 font-medium">Automated Visual Effects</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Animation Section */}
                  <div className="w-full lg:w-80 h-48 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <svg 
                      width="200" 
                      height="120" 
                      viewBox="0 0 200 120" 
                      className="text-orange-600"
                    >
                      {/* Video Frame */}
                      <rect 
                        x="20" 
                        y="20" 
                        width="160" 
                        height="80" 
                        rx="8" 
                        fill="currentColor" 
                        fillOpacity="0.1" 
                        stroke="currentColor" 
                        strokeWidth="2"
                      />
                      
                      {/* Play Button */}
                      <circle 
                        cx="100" 
                        cy="60" 
                        r="15" 
                        fill="currentColor" 
                        fillOpacity="0.8"
                      >
                        <animate 
                          attributeName="r" 
                          values="15;18;15" 
                          dur="2s" 
                          repeatCount="indefinite"
                        />
                      </circle>
                      <polygon 
                        points="95,55 95,65 105,60" 
                        fill="white"
                      />
                      
                      {/* AI Enhancement Particles */}
                      {Array.from({ length: 8 }).map((_, i) => (
                        <circle 
                          key={i}
                          cx={30 + (i * 20)} 
                          cy={30 + (i % 2) * 60} 
                          r="2" 
                          fill="currentColor" 
                          fillOpacity="0.6"
                        >
                          <animate 
                            attributeName="opacity" 
                            values="0.2;1;0.2" 
                            dur={`${1.5 + i * 0.2}s`} 
                            repeatCount="indefinite"
                          />
                          <animate 
                            attributeName="cy" 
                            values={`${30 + (i % 2) * 60};${25 + (i % 2) * 60};${30 + (i % 2) * 60}`} 
                            dur={`${2 + i * 0.1}s`} 
                            repeatCount="indefinite"
                          />
                        </circle>
                      ))}
                      
                      {/* Timeline */}
                      <rect 
                        x="25" 
                        y="105" 
                        width="150" 
                        height="4" 
                        rx="2" 
                        fill="currentColor" 
                        fillOpacity="0.2"
                      />
                      <rect 
                        x="25" 
                        y="105" 
                        width="60" 
                        height="4" 
                        rx="2" 
                        fill="currentColor" 
                        fillOpacity="0.8"
                      >
                        <animate 
                          attributeName="width" 
                          values="0;150;0" 
                          dur="4s" 
                          repeatCount="indefinite"
                        />
                      </rect>
                    </svg>
                    
                    {/* Floating Elements */}
                    <div className="absolute top-4 right-4 w-3 h-3 bg-orange-400 rounded-full animate-pulse"></div>
                    <div className="absolute bottom-6 left-6 w-2 h-2 bg-orange-500 rounded-full animate-bounce"></div>
                    <div className="absolute top-8 left-8 w-2 h-2 bg-orange-300 rounded-full animate-ping"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
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
                Seamless integration with your existing systems, followed by comprehensive 
                testing to ensure reliability and accuracy.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">4. Deployment & Optimization</h3>
              <p className="text-gray-600">
                Launch your AI solution with ongoing monitoring, performance optimization, 
                and continuous learning capabilities.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose AramisTech */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-blue-100 text-blue-800 mb-4">Why Choose AramisTech</Badge>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Your Trusted AI Development Partner
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                With over 27 years of technology expertise, AramisTech combines deep industry knowledge 
                with cutting-edge AI capabilities to deliver solutions that drive real business value.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start">
                  <div className="p-2 bg-blue-100 rounded-lg mr-4 mt-1">
                    <Shield className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Proven Expertise</h4>
                    <p className="text-gray-600">
                      27+ years of technology leadership with a track record of successful 
                      AI implementations across various industries.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2 bg-green-100 rounded-lg mr-4 mt-1">
                    <Database className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Data Security Focus</h4>
                    <p className="text-gray-600">
                      Enterprise-grade security protocols ensure your sensitive data remains 
                      protected throughout the AI development process.
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <div className="p-2 bg-orange-100 rounded-lg mr-4 mt-1">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Local South Florida Team</h4>
                    <p className="text-gray-600">
                      Family-owned business with deep roots in South Florida, providing 
                      personalized service and ongoing support.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg p-8">
                <div className="grid grid-cols-2 gap-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">98%</div>
                    <div className="text-gray-600">Model Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">40%</div>
                    <div className="text-gray-600">Cost Reduction</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 mb-2">3x</div>
                    <div className="text-gray-600">Faster Processing</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-600 mb-2">24/7</div>
                    <div className="text-gray-600">AI Monitoring</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact CTA */}
      <section id="contact" className="py-20 bg-gradient-to-br from-blue-900 to-blue-800 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Business with AI?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Let's discuss how artificial intelligence can streamline your operations, 
            improve customer experiences, and drive growth for your business.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3"
              onClick={() => setIsConsultationFormOpen(true)}
            >
              Schedule Free AI Consultation
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Link href="tel:+1-305-807-7015">
              <Button size="lg" variant="outline" className="border-white text-orange-400 hover:bg-white hover:text-blue-900 px-8 py-3">
                Call Now: (305) 807-7015
              </Button>
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-2">Quick Response</h4>
              <p className="text-blue-100">Get AI consultation within 24 hours</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Local Expertise</h4>
              <p className="text-blue-100">South Florida AI development specialists</p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-2">Proven Results</h4>
              <p className="text-blue-100">Measurable ROI from AI implementations</p>
            </div>
          </div>
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