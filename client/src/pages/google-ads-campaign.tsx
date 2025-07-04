import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Target, 
  DollarSign, 
  TrendingUp, 
  Users, 
  MapPin, 
  Calendar,
  Search,
  Monitor,
  Smartphone,
  Clock,
  CheckCircle,
  AlertTriangle,
  Copy,
  ExternalLink
} from "lucide-react";
import DynamicHeader from "@/components/dynamic-header";
import Footer from "@/components/footer";
import { SEO, SEOConfigs } from "@/components/seo";

const campaignData = {
  objectives: [
    {
      id: "leads",
      title: "Generate Qualified Leads",
      description: "Drive contact form submissions and consultation requests",
      icon: Target,
      recommended: true,
      bidStrategy: "Target CPA",
      expectedCPA: "$25-45"
    },
    {
      id: "calls",
      title: "Increase Phone Calls",
      description: "Direct calls to (305) 814-4461 for immediate service",
      icon: Users,
      recommended: true,
      bidStrategy: "Maximize Calls",
      expectedCPA: "$15-30"
    },
    {
      id: "awareness",
      title: "Brand Awareness",
      description: "Increase AramisTech visibility in South Florida",
      icon: TrendingUp,
      recommended: false,
      bidStrategy: "Target Impressions",
      expectedCPA: "$8-15"
    }
  ],
  
  keywords: {
    primary: [
      { keyword: "IT support Miami", volume: "1.2K", competition: "Medium", cpc: "$8.50" },
      { keyword: "computer repair South Florida", volume: "890", competition: "High", cpc: "$12.30" },
      { keyword: "network maintenance Miami", volume: "450", competition: "Low", cpc: "$6.80" },
      { keyword: "managed IT services Florida", volume: "2.1K", competition: "High", cpc: "$15.20" },
      { keyword: "cybersecurity consulting Miami", volume: "320", competition: "Medium", cpc: "$18.40" }
    ],
    longTail: [
      { keyword: "24/7 IT support Miami Dade", volume: "140", competition: "Low", cpc: "$5.20" },
      { keyword: "small business IT solutions Florida", volume: "280", competition: "Medium", cpc: "$9.60" },
      { keyword: "Windows 10 upgrade service Miami", volume: "95", competition: "Low", cpc: "$7.30" },
      { keyword: "cloud migration services South Florida", volume: "110", competition: "Low", cpc: "$11.80" },
      { keyword: "family owned IT company Miami", volume: "50", competition: "Low", cpc: "$4.90" }
    ],
    negative: [
      "free", "DIY", "tutorial", "jobs", "career", "resume", "salary", "remote", "offshore"
    ]
  },

  targeting: {
    location: {
      primary: ["Miami-Dade County, FL", "Broward County, FL", "Palm Beach County, FL"],
      radius: "25 miles from Miami, FL",
      exclude: ["International", "Outside Florida"]
    },
    demographics: {
      age: "25-65+",
      income: "Top 30%",
      businessOwners: "Yes",
      interests: ["Business Technology", "Small Business", "IT Services"]
    },
    schedule: {
      weekdays: "8:00 AM - 6:00 PM",
      weekends: "9:00 AM - 4:00 PM",
      timezone: "EST"
    }
  },

  adCopy: {
    responsive: [
      {
        headlines: [
          "Expert IT Support Miami | 27+ Years",
          "Professional Computer Repair",
          "Trusted Family IT Business",
          "Fast Network Solutions",
          "AramisTech - IT Experts",
          "Same-Day Service Available",
          "Cybersecurity Specialists",
          "Custom Server Solutions"
        ],
        descriptions: [
          "Family-owned IT company serving South Florida for 27+ years. Expert repairs, network maintenance & cybersecurity.",
          "Get professional IT support from Miami's trusted family business. Free consultation. Call (305) 814-4461 today!",
          "Custom servers, cloud solutions & 24/7 support. Serving businesses across Miami-Dade, Broward & Palm Beach."
        ]
      }
    ],
    callouts: [
      "27+ Years Experience",
      "Family-Owned Business",
      "Same-Day Service",
      "Free Consultation",
      "24/7 Support Available",
      "Licensed & Insured"
    ],
    sitelinks: [
      { title: "Free Consultation", url: "/", description: "Schedule your free IT assessment" },
      { title: "Windows 10 Upgrade", url: "/windows10-upgrade", description: "Urgent security updates needed" },
      { title: "Contact Us", url: "/#contact", description: "Call (305) 814-4461 today" },
      { title: "Service Calculator", url: "/service-calculator", description: "Get instant pricing estimates" }
    ]
  },

  budget: {
    recommendations: [
      { type: "Conservative", daily: 50, monthly: 1500, expectedLeads: "8-12", expectedCalls: "15-25" },
      { type: "Moderate", daily: 100, monthly: 3000, expectedLeads: "18-28", expectedCalls: "35-50" },
      { type: "Aggressive", daily: 200, monthly: 6000, expectedLeads: "40-60", expectedCalls: "75-110" }
    ]
  }
};

export default function GoogleAdsCampaign() {
  const [selectedObjective, setSelectedObjective] = useState("leads");
  const [selectedBudget, setSelectedBudget] = useState("Moderate");
  const [copiedText, setCopiedText] = useState("");

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(""), 2000);
  };

  return (
    <div className="min-h-screen bg-white">
      <SEO {...SEOConfigs.googleAds} />
      <DynamicHeader />
      
      <main>
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-primary-blue to-blue-600 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                Google Ads Campaign Builder
              </h1>
              <p className="text-xl mb-8 text-blue-100">
                Complete Google Ads setup for AramisTech - targeting South Florida IT service leads
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg" 
                  className="bg-aramis-orange hover:bg-orange-600"
                  onClick={() => window.open('https://ads.google.com/aw/campaigns/new', '_blank')}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Start Campaign in Google Ads
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-primary-blue"
                  onClick={() => document.getElementById('campaign-setup')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  View Campaign Setup
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Campaign Setup */}
        <section id="campaign-setup" className="py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <Tabs defaultValue="objectives" className="w-full">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="objectives">Objectives</TabsTrigger>
                  <TabsTrigger value="keywords">Keywords</TabsTrigger>
                  <TabsTrigger value="targeting">Targeting</TabsTrigger>
                  <TabsTrigger value="ads">Ad Copy</TabsTrigger>
                  <TabsTrigger value="budget">Budget</TabsTrigger>
                  <TabsTrigger value="tracking">Tracking</TabsTrigger>
                </TabsList>

                {/* Campaign Objectives */}
                <TabsContent value="objectives" className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Campaign Objectives</h2>
                    <p className="text-gray-600">Choose your primary marketing goals for AramisTech</p>
                  </div>
                  
                  <div className="grid md:grid-cols-3 gap-6">
                    {campaignData.objectives.map((objective) => {
                      const IconComponent = objective.icon;
                      const isSelected = selectedObjective === objective.id;
                      
                      return (
                        <Card 
                          key={objective.id}
                          className={`cursor-pointer transition-all ${
                            isSelected ? 'border-aramis-orange shadow-lg' : 'hover:shadow-md'
                          }`}
                          onClick={() => setSelectedObjective(objective.id)}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <IconComponent className={`w-8 h-8 ${isSelected ? 'text-aramis-orange' : 'text-gray-600'}`} />
                              {objective.recommended && (
                                <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl">{objective.title}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-gray-600 mb-4">{objective.description}</p>
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">Bid Strategy:</span>
                                <span>{objective.bidStrategy}</span>
                              </div>
                              <div className="flex justify-between text-sm">
                                <span className="font-medium">Expected CPA:</span>
                                <span className="text-green-600">{objective.expectedCPA}</span>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* Keywords */}
                <TabsContent value="keywords" className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Keyword Strategy</h2>
                    <p className="text-gray-600">Optimized keywords for South Florida IT services</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Primary Keywords */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Target className="w-5 h-5 mr-2 text-aramis-orange" />
                          Primary Keywords
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {campaignData.keywords.primary.map((kw, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium">{kw.keyword}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(kw.keyword, kw.keyword)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                                <div>Volume: {kw.volume}</div>
                                <div>Competition: {kw.competition}</div>
                                <div className="text-green-600">CPC: {kw.cpc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Long-tail Keywords */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Search className="w-5 h-5 mr-2 text-blue-600" />
                          Long-tail Keywords
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {campaignData.keywords.longTail.map((kw, index) => (
                            <div key={index} className="border rounded-lg p-3">
                              <div className="flex justify-between items-start mb-2">
                                <span className="font-medium text-sm">{kw.keyword}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(kw.keyword, kw.keyword)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                              <div className="grid grid-cols-3 gap-2 text-sm text-gray-600">
                                <div>Volume: {kw.volume}</div>
                                <div>Competition: {kw.competition}</div>
                                <div className="text-green-600">CPC: {kw.cpc}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>

                  {/* Negative Keywords */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
                        Negative Keywords
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">Exclude these terms to avoid irrelevant clicks:</p>
                      <div className="flex flex-wrap gap-2">
                        {campaignData.keywords.negative.map((keyword, index) => (
                          <Badge key={index} variant="outline" className="cursor-pointer"
                            onClick={() => copyToClipboard(keyword, `Negative: ${keyword}`)}>
                            -{keyword}
                          </Badge>
                        ))}
                      </div>
                      <Button 
                        className="mt-4"
                        onClick={() => copyToClipboard(campaignData.keywords.negative.map(k => `-${k}`).join('\n'), 'All negative keywords')}
                      >
                        Copy All Negative Keywords
                      </Button>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Targeting */}
                <TabsContent value="targeting" className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Audience Targeting</h2>
                    <p className="text-gray-600">Reach the right customers in South Florida</p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Location Targeting */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <MapPin className="w-5 h-5 mr-2 text-aramis-orange" />
                          Location Targeting
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="font-medium">Primary Areas:</Label>
                          <div className="mt-2 space-y-1">
                            {campaignData.targeting.location.primary.map((loc, index) => (
                              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                <span>{loc}</span>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(loc, loc)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Label className="font-medium">Radius:</Label>
                          <p className="text-gray-600">{campaignData.targeting.location.radius}</p>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Demographics */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Users className="w-5 h-5 mr-2 text-blue-600" />
                          Demographics
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label className="font-medium">Age Range:</Label>
                            <p className="text-gray-600">{campaignData.targeting.demographics.age}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Income:</Label>
                            <p className="text-gray-600">{campaignData.targeting.demographics.income}</p>
                          </div>
                          <div>
                            <Label className="font-medium">Business Owners:</Label>
                            <p className="text-gray-600">{campaignData.targeting.demographics.businessOwners}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Schedule */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center">
                          <Clock className="w-5 h-5 mr-2 text-green-600" />
                          Ad Schedule
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div>
                          <Label className="font-medium">Weekdays:</Label>
                          <p className="text-gray-600">{campaignData.targeting.schedule.weekdays}</p>
                        </div>
                        <div>
                          <Label className="font-medium">Weekends:</Label>
                          <p className="text-gray-600">{campaignData.targeting.schedule.weekends}</p>
                        </div>
                        <div>
                          <Label className="font-medium">Timezone:</Label>
                          <p className="text-gray-600">{campaignData.targeting.schedule.timezone}</p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Ad Copy */}
                <TabsContent value="ads" className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Ad Copy & Extensions</h2>
                    <p className="text-gray-600">High-converting ad copy for AramisTech</p>
                  </div>

                  <div className="grid gap-8">
                    {/* Headlines */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Responsive Search Ad Headlines</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {campaignData.adCopy.responsive[0].headlines.map((headline, index) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                              <span>{headline}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(headline, `Headline ${index + 1}`)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                        <Button 
                          className="mt-4"
                          onClick={() => copyToClipboard(campaignData.adCopy.responsive[0].headlines.join('\n'), 'All headlines')}
                        >
                          Copy All Headlines
                        </Button>
                      </CardContent>
                    </Card>

                    {/* Descriptions */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Ad Descriptions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {campaignData.adCopy.responsive[0].descriptions.map((desc, index) => (
                            <div key={index} className="flex items-start justify-between p-3 border rounded">
                              <span className="flex-1">{desc}</span>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => copyToClipboard(desc, `Description ${index + 1}`)}
                              >
                                <Copy className="w-4 h-4" />
                              </Button>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Sitelinks */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Sitelink Extensions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          {campaignData.adCopy.sitelinks.map((sitelink, index) => (
                            <div key={index} className="border rounded p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-medium">{sitelink.title}</h4>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => copyToClipboard(`${sitelink.title}: ${sitelink.url}`, sitelink.title)}
                                >
                                  <Copy className="w-4 h-4" />
                                </Button>
                              </div>
                              <p className="text-sm text-gray-600 mb-1">{sitelink.description}</p>
                              <p className="text-sm text-blue-600">aramistech.com{sitelink.url}</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                {/* Budget */}
                <TabsContent value="budget" className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Budget Recommendations</h2>
                    <p className="text-gray-600">Choose the right budget for your marketing goals</p>
                  </div>

                  <div className="grid md:grid-cols-3 gap-6">
                    {campaignData.budget.recommendations.map((budget, index) => {
                      const isSelected = selectedBudget === budget.type;
                      
                      return (
                        <Card 
                          key={index}
                          className={`cursor-pointer transition-all ${
                            isSelected ? 'border-aramis-orange shadow-lg' : 'hover:shadow-md'
                          }`}
                          onClick={() => setSelectedBudget(budget.type)}
                        >
                          <CardHeader>
                            <div className="flex items-center justify-between">
                              <DollarSign className={`w-8 h-8 ${isSelected ? 'text-aramis-orange' : 'text-gray-600'}`} />
                              {budget.type === 'Moderate' && (
                                <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                              )}
                            </div>
                            <CardTitle className="text-xl">{budget.type}</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-3">
                              <div className="text-center p-4 bg-gray-50 rounded">
                                <div className="text-2xl font-bold text-aramis-orange">${budget.daily}</div>
                                <div className="text-sm text-gray-600">per day</div>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                  <span>Monthly Budget:</span>
                                  <span className="font-medium">${budget.monthly.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Expected Leads:</span>
                                  <span className="text-green-600">{budget.expectedLeads}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Expected Calls:</span>
                                  <span className="text-blue-600">{budget.expectedCalls}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </TabsContent>

                {/* Tracking */}
                <TabsContent value="tracking" className="space-y-6">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-bold mb-4">Conversion Tracking</h2>
                    <p className="text-gray-600">Set up tracking to measure campaign success</p>
                  </div>

                  <div className="grid gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Conversion Actions to Track</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="border rounded p-4">
                            <div className="flex items-center mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                              <h4 className="font-medium">Contact Form Submissions</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">Track submissions from contact forms</p>
                            <Badge variant="outline">High Value: $50</Badge>
                          </div>
                          
                          <div className="border rounded p-4">
                            <div className="flex items-center mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                              <h4 className="font-medium">Phone Calls</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">Track calls to (305) 814-4461</p>
                            <Badge variant="outline">High Value: $40</Badge>
                          </div>
                          
                          <div className="border rounded p-4">
                            <div className="flex items-center mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                              <h4 className="font-medium">Service Calculator</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">Track pricing calculator usage</p>
                            <Badge variant="outline">Medium Value: $25</Badge>
                          </div>
                          
                          <div className="border rounded p-4">
                            <div className="flex items-center mb-2">
                              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                              <h4 className="font-medium">Consultation Bookings</h4>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">Track consultation requests</p>
                            <Badge variant="outline">High Value: $75</Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Google Analytics Integration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="bg-gray-50 p-4 rounded">
                          <p className="text-sm mb-4">
                            Your website already has Google Analytics configured. Link it to Google Ads for enhanced tracking:
                          </p>
                          <ol className="text-sm space-y-2 list-decimal list-inside">
                            <li>Go to Google Ads → Tools & Settings → Linked Accounts</li>
                            <li>Click on Google Analytics</li>
                            <li>Link your Analytics property</li>
                            <li>Import Analytics goals as conversions</li>
                          </ol>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </section>

        {/* Quick Start Guide */}
        <section className="bg-gray-50 py-16">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-8">Quick Start Guide</h2>
              <div className="grid md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="w-12 h-12 bg-aramis-orange rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-white font-bold text-xl">1</span>
                  </div>
                  <h3 className="font-medium mb-2">Set Up Account</h3>
                  <p className="text-sm text-gray-600">Create Google Ads account and billing</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="w-12 h-12 bg-aramis-orange rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-white font-bold text-xl">2</span>
                  </div>
                  <h3 className="font-medium mb-2">Create Campaign</h3>
                  <p className="text-sm text-gray-600">Use the objectives and settings above</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="w-12 h-12 bg-aramis-orange rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-white font-bold text-xl">3</span>
                  </div>
                  <h3 className="font-medium mb-2">Add Keywords</h3>
                  <p className="text-sm text-gray-600">Copy keywords from the strategy tab</p>
                </div>
                
                <div className="bg-white p-6 rounded-lg shadow-sm">
                  <div className="w-12 h-12 bg-aramis-orange rounded-lg flex items-center justify-center mb-4 mx-auto">
                    <span className="text-white font-bold text-xl">4</span>
                  </div>
                  <h3 className="font-medium mb-2">Launch & Monitor</h3>
                  <p className="text-sm text-gray-600">Start with moderate budget and optimize</p>
                </div>
              </div>
              
              <div className="mt-8">
                <Button 
                  size="lg" 
                  className="bg-aramis-orange hover:bg-orange-600"
                  onClick={() => window.open('https://ads.google.com/aw/campaigns/new', '_blank')}
                >
                  <ExternalLink className="w-5 h-5 mr-2" />
                  Create Campaign Now
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Copy Feedback */}
        {copiedText && (
          <div className="fixed bottom-4 right-4 bg-green-600 text-white px-4 py-2 rounded shadow-lg">
            Copied: {copiedText}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}