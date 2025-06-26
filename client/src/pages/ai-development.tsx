import React from 'react';
import DynamicHeader from '@/components/dynamic-header';
import Footer from '@/components/footer';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
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
  Code,
  BarChart3,
  Shield
} from 'lucide-react';
import { Link } from 'wouter';
import cleanWin10Image from '@assets/cleanwin10image_1750946635072.png';

export default function AIDevelopment() {
  return (
    <div className="min-h-screen bg-white">
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
                <Link href="#contact">
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
                    Start Your AI Project
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link href="#services">
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3">
                    Explore AI Services
                  </Button>
                </Link>
              </div>
            </div>
            <div className="relative">
              <img 
                src={cleanWin10Image} 
                alt="AI Development Technology" 
                className="rounded-lg shadow-2xl w-full h-auto"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/50 to-transparent rounded-lg"></div>
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
              <div className="text-3xl font-bold text-blue-600 mb-2">27+</div>
              <div className="text-gray-600">Years Experience</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">500+</div>
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
                    <Code className="w-6 h-6 text-indigo-600" />
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
            <Link href="/">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3">
                Schedule Free AI Consultation
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
            <Link href="tel:+1-954-XXX-XXXX">
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-3">
                Call Now: (954) XXX-XXXX
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
    </div>
  );
}