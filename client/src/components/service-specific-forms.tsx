import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { X, ArrowRight, Brain, Bot, BarChart3, Zap, Code2, Video, Users } from 'lucide-react';

interface ServiceFormProps {
  isOpen: boolean;
  onClose: () => void;
  serviceType: string;
}

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company?: string;
  projectDescription: string;
  timeline?: string;
  budget?: string;
  specificNeeds: string[];
}

const serviceConfigs = {
  'machine-learning': {
    title: 'Machine Learning Solution',
    icon: Brain,
    color: 'from-blue-500 to-purple-600',
    description: 'Tell us about your data and prediction needs',
    needs: [
      'Predictive Analytics',
      'Pattern Recognition',
      'Automated Classification',
      'Sales Forecasting',
      'Risk Assessment',
      'Customer Behavior Analysis'
    ],
    questions: {
      projectDescription: 'What business problem are you trying to solve with machine learning?',
      specificQuestion: 'What type of data do you have? (sales, customer, operational, etc.)',
      timeline: 'When do you need this solution implemented?',
      budget: 'What\'s your budget range for this project?'
    }
  },
  'ai-chatbots': {
    title: 'AI Chatbot Development',
    icon: Bot,
    color: 'from-green-500 to-emerald-600',
    description: 'Design your intelligent customer service assistant',
    needs: [
      '24/7 Customer Support',
      'Lead Generation',
      'FAQ Automation',
      'Multi-language Support',
      'CRM Integration',
      'E-commerce Support'
    ],
    questions: {
      projectDescription: 'What should your chatbot help customers with?',
      specificQuestion: 'How many customer inquiries do you handle daily?',
      timeline: 'When would you like to launch your chatbot?',
      budget: 'What\'s your investment range for this chatbot?'
    }
  },
  'ai-analytics': {
    title: 'AI Analytics Platform',
    icon: BarChart3,
    color: 'from-purple-500 to-pink-600',
    description: 'Transform your data into actionable insights',
    needs: [
      'Business Intelligence',
      'Real-time Dashboards',
      'Performance Tracking',
      'Predictive Modeling',
      'Automated Reporting',
      'Data Visualization'
    ],
    questions: {
      projectDescription: 'What business metrics do you want to analyze and improve?',
      specificQuestion: 'What data sources do you want to connect? (website, CRM, sales, etc.)',
      timeline: 'When do you need these analytics insights?',
      budget: 'What\'s your budget for this analytics solution?'
    }
  },
  'ai-automation': {
    title: 'AI Process Automation',
    icon: Zap,
    color: 'from-orange-500 to-red-600',
    description: 'Automate repetitive tasks and workflows',
    needs: [
      'Document Processing',
      'Email Automation',
      'Data Entry',
      'Workflow Optimization',
      'Task Scheduling',
      'Quality Control'
    ],
    questions: {
      projectDescription: 'Which manual processes would you like to automate?',
      specificQuestion: 'How much time do these tasks currently take per week?',
      timeline: 'When would you like to start saving time with automation?',
      budget: 'What\'s your investment range for automation?'
    }
  },

  'custom-ai-solutions': {
    title: 'Custom AI Development',
    icon: Code2,
    color: 'from-indigo-500 to-blue-600',
    description: 'Tailored AI solution for your unique needs',
    needs: [
      'Industry-Specific AI',
      'API Integration',
      'Custom Training',
      'Scalable Architecture',
      'Performance Optimization',
      'Ongoing Support'
    ],
    questions: {
      projectDescription: 'Describe your unique AI requirements and business challenges',
      specificQuestion: 'What industry are you in and what makes your needs special?',
      timeline: 'What\'s your ideal timeline for development and deployment?',
      budget: 'What\'s your budget range for custom AI development?'
    }
  },
  'ai-promo-videos': {
    title: 'AI-Powered Video Creation',
    icon: Video,
    color: 'from-yellow-500 to-orange-600',
    description: 'Professional videos with AI enhancement',
    needs: [
      'Product Promotion',
      'Social Media Content',
      'Training Videos',
      'Marketing Campaigns',
      'Brand Storytelling',
      'Automated Editing'
    ],
    questions: {
      projectDescription: 'What type of promotional videos do you need?',
      specificQuestion: 'How many videos per month do you plan to create?',
      timeline: 'When do you need your first videos ready?',
      budget: 'What\'s your monthly video production budget?'
    }
  },
  'ai-agents': {
    title: 'AI Agent Development',
    icon: Users,
    color: 'from-cyan-500 to-blue-600',
    description: 'Autonomous AI agents for complex tasks',
    needs: [
      'Task Orchestration',
      'Multi-system Integration',
      'Decision Making',
      'Workflow Management',
      'Goal Achievement',
      'Learning & Adaptation'
    ],
    questions: {
      projectDescription: 'What complex tasks should your AI agent handle autonomously?',
      specificQuestion: 'Which systems/platforms should the agent integrate with?',
      timeline: 'When do you want your AI agent operational?',
      budget: 'What\'s your investment range for AI agent development?'
    }
  }
};

export function ServiceSpecificForm({ isOpen, onClose, serviceType }: ServiceFormProps) {
  const config = serviceConfigs[serviceType as keyof typeof serviceConfigs];
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    projectDescription: '',
    timeline: '',
    budget: '',
    specificNeeds: []
  });

  const [specificAnswer, setSpecificAnswer] = useState('');

  const submitForm = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch('/api/service-consultation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit consultation');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Consultation Request Sent!',
        description: `We'll contact you within 24 hours about your ${config.title} project.`,
      });
      onClose();
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        projectDescription: '',
        timeline: '',
        budget: '',
        specificNeeds: []
      });
      setSpecificAnswer('');
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Something went wrong. Please try again or call us at (305) 814-4461.',
        variant: 'destructive'
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const submissionData = {
      ...formData,
      serviceType: config.title,
      specificAnswer,
      submittedAt: new Date().toISOString()
    };
    
    submitForm.mutate(submissionData);
  };

  const toggleNeed = (need: string) => {
    setFormData(prev => ({
      ...prev,
      specificNeeds: prev.specificNeeds.includes(need)
        ? prev.specificNeeds.filter(n => n !== need)
        : [...prev.specificNeeds, need]
    }));
  };

  if (!isOpen || !config) return null;

  const IconComponent = config.icon;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <Card className="border-0 shadow-none">
          <CardHeader className={`bg-gradient-to-r ${config.color} text-white relative`}>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 text-white hover:bg-white/20"
            >
              <X className="w-5 h-5" />
            </Button>
            
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 rounded-lg">
                <IconComponent className="w-8 h-8" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">{config.title}</CardTitle>
                <p className="text-white/90 mt-2">{config.description}</p>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Contact Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                    required
                    placeholder="John"
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                    required
                    placeholder="Smith"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    required
                    placeholder="john@company.com"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    required
                    placeholder="(305) 555-0123"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  value={formData.company}
                  onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))}
                  placeholder="Your Company Name"
                />
              </div>

              {/* Service-Specific Needs */}
              <div>
                <Label className="text-base font-semibold">What features interest you most? (Select all that apply)</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                  {config.needs.map((need) => (
                    <Badge
                      key={need}
                      variant={formData.specificNeeds.includes(need) ? 'default' : 'outline'}
                      className={`cursor-pointer text-center justify-center py-2 px-3 ${
                        formData.specificNeeds.includes(need)
                          ? `bg-gradient-to-r ${config.color} text-white hover:opacity-90`
                          : 'hover:bg-gray-100'
                      }`}
                      onClick={() => toggleNeed(need)}
                    >
                      {need}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Project Description */}
              <div>
                <Label htmlFor="projectDescription">{config.questions.projectDescription} *</Label>
                <Textarea
                  id="projectDescription"
                  value={formData.projectDescription}
                  onChange={(e) => setFormData(prev => ({ ...prev, projectDescription: e.target.value }))}
                  required
                  rows={3}
                  placeholder="Describe your project goals and requirements..."
                />
              </div>

              {/* Service-Specific Question */}
              <div>
                <Label htmlFor="specificAnswer">{config.questions.specificQuestion}</Label>
                <Textarea
                  id="specificAnswer"
                  value={specificAnswer}
                  onChange={(e) => setSpecificAnswer(e.target.value)}
                  rows={2}
                  placeholder="Please provide details..."
                />
              </div>

              {/* Timeline and Budget */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="timeline">{config.questions.timeline}</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, timeline: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeline" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asap">As soon as possible</SelectItem>
                      <SelectItem value="1-month">Within 1 month</SelectItem>
                      <SelectItem value="2-3-months">2-3 months</SelectItem>
                      <SelectItem value="6-months">Within 6 months</SelectItem>
                      <SelectItem value="flexible">Flexible timeline</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="budget">{config.questions.budget}</Label>
                  <Select onValueChange={(value) => setFormData(prev => ({ ...prev, budget: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select budget range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="under-5k">Under $5,000</SelectItem>
                      <SelectItem value="5k-15k">$5,000 - $15,000</SelectItem>
                      <SelectItem value="15k-50k">$15,000 - $50,000</SelectItem>
                      <SelectItem value="50k-plus">$50,000+</SelectItem>
                      <SelectItem value="discuss">Prefer to discuss</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className={`w-full bg-gradient-to-r ${config.color} hover:opacity-90 text-white py-3 text-lg`}
                disabled={submitForm.isPending}
              >
                {submitForm.isPending ? 'Sending Request...' : `Get Started with ${config.title}`}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}