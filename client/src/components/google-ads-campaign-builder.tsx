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
  Copy,
  ExternalLink,
  AlertTriangle,
  BarChart3
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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
      { keyword: "emergency computer repair Miami", volume: "230", competition: "Medium", cpc: "$9.80" },
      { keyword: "small business IT support South Florida", volume: "180", competition: "Low", cpc: "$7.90" },
      { keyword: "virus removal services Miami", volume: "320", competition: "Medium", cpc: "$11.40" }
    ],
    negative: [
      "free", "cheap", "diy", "tutorial", "download", "software", "jobs", "careers", "salary", "resume"
    ]
  },

  targeting: {
    location: {
      primary: "Miami-Dade County, FL",
      secondary: "Broward County, FL, Palm Beach County, FL",
      radius: "25 miles from Miami, FL"
    },
    demographics: {
      ageRange: "25-65",
      businessSize: "Small to medium businesses (1-500 employees)",
      industries: "Healthcare, Legal, Finance, Real Estate, Professional Services"
    },
    schedule: {
      days: "Monday-Friday",
      hours: "9:00 AM - 6:00 PM EST",
      timezone: "Eastern Time"
    }
  },

  adCopy: {
    responsive: [
      {
        headlines: [
          "Expert IT Support in Miami",
          "27+ Years IT Experience",
          "South Florida IT Solutions",
          "Professional Computer Repair",
          "Reliable Network Support",
          "Family-Owned IT Business",
          "Fast Emergency IT Help",
          "Certified IT Technicians",
          "Local Miami IT Company",
          "Trusted IT Partners"
        ],
        descriptions: [
          "Family-owned IT company serving South Florida for 27+ years. Expert computer repair, network support, and cybersecurity solutions.",
          "Get professional IT support from certified technicians. Emergency repairs, network maintenance, and business solutions available.",
          "Reliable IT services for Miami businesses. Fast response, competitive rates, and personalized service from local experts.",
          "Complete IT solutions including computer repair, network setup, cybersecurity, and ongoing support for your business."
        ]
      }
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

export default function GoogleAdsCampaignBuilder() {
  const [selectedObjective, setSelectedObjective] = useState("leads");
  const [selectedBudget, setSelectedBudget] = useState("Moderate");
  const [copiedText, setCopiedText] = useState("");
  const { toast } = useToast();

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast({
      title: "Copied to clipboard",
      description: `${label} has been copied to your clipboard.`,
    });
    setTimeout(() => setCopiedText(""), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-blue to-blue-600 text-white p-6 rounded-lg">
        <h1 className="text-3xl font-bold mb-2">Google Ads Campaign Builder</h1>
        <p className="text-blue-100 mb-4">Complete Google Ads setup for AramisTech - targeting South Florida IT service leads</p>
        
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            size="lg" 
            className="bg-aramis-orange hover:bg-orange-600"
            onClick={() => window.open('https://ads.google.com/aw/campaigns/new', '_blank')}
          >
            <ExternalLink className="w-5 h-5 mr-2" />
            Start Campaign in Google Ads
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="objectives" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="objectives">Objectives</TabsTrigger>
          <TabsTrigger value="keywords">Keywords</TabsTrigger>
          <TabsTrigger value="targeting">Targeting</TabsTrigger>
          <TabsTrigger value="ads">Ad Copy</TabsTrigger>
          <TabsTrigger value="budget">Budget</TabsTrigger>
          <TabsTrigger value="tracking">Tracking</TabsTrigger>
        </TabsList>

        {/* Objectives Tab */}
        <TabsContent value="objectives" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Objectives</CardTitle>
              <p className="text-gray-600">Choose your primary marketing goals for AramisTech</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {campaignData.objectives.map((objective) => {
                  const IconComponent = objective.icon;
                  return (
                    <Card 
                      key={objective.id}
                      className={`cursor-pointer transition-all ${
                        selectedObjective === objective.id ? 'ring-2 ring-aramis-orange' : 'hover:shadow-md'
                      }`}
                      onClick={() => setSelectedObjective(objective.id)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <IconComponent className="w-8 h-8 text-aramis-orange" />
                          {objective.recommended && (
                            <Badge className="bg-green-100 text-green-800">Recommended</Badge>
                          )}
                        </div>
                        <h3 className="font-semibold mb-2">{objective.title}</h3>
                        <p className="text-sm text-gray-600 mb-4">{objective.description}</p>
                        <div className="space-y-2 text-sm">
                          <div><strong>Bid Strategy:</strong> {objective.bidStrategy}</div>
                          <div><strong>Expected CPA:</strong> {objective.expectedCPA}</div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords" className="space-y-6">
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
                        <div>CPC: {kw.cpc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  className="mt-4 w-full"
                  onClick={() => copyToClipboard(campaignData.keywords.primary.map(k => k.keyword).join('\n'), 'All primary keywords')}
                >
                  Copy All Primary Keywords
                </Button>
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
                        <div>CPC: {kw.cpc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button 
                  className="mt-4 w-full"
                  onClick={() => copyToClipboard(campaignData.keywords.longTail.map(k => k.keyword).join('\n'), 'All long-tail keywords')}
                >
                  Copy All Long-tail Keywords
                </Button>
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

        {/* Ad Copy Tab */}
        <TabsContent value="ads" className="space-y-6">
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
          </div>
        </TabsContent>

        {/* Budget Tab */}
        <TabsContent value="budget" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Budget Recommendations</CardTitle>
              <p className="text-gray-600">Choose a budget strategy based on your lead generation goals</p>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                {campaignData.budget.recommendations.map((budget) => (
                  <Card 
                    key={budget.type}
                    className={`cursor-pointer transition-all ${
                      selectedBudget === budget.type ? 'ring-2 ring-aramis-orange' : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedBudget(budget.type)}
                  >
                    <CardContent className="p-6 text-center">
                      <h3 className="font-bold text-lg mb-2">{budget.type}</h3>
                      <div className="text-3xl font-bold text-aramis-orange mb-4">${budget.daily}/day</div>
                      <div className="space-y-2 text-sm">
                        <div><strong>Monthly:</strong> ${budget.monthly}</div>
                        <div><strong>Expected Leads:</strong> {budget.expectedLeads}</div>
                        <div><strong>Expected Calls:</strong> {budget.expectedCalls}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tracking Tab */}
        <TabsContent value="tracking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Conversion Tracking Setup</CardTitle>
              <p className="text-gray-600">Set up tracking to measure campaign success</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">1. Contact Form Conversions</h3>
                  <p className="text-sm text-gray-600 mb-3">Track when visitors submit contact forms</p>
                  <code className="bg-gray-100 p-2 rounded text-sm block">
                    {`gtag('event', 'conversion', {'send_to': 'AW-CONVERSION_ID/CONVERSION_LABEL'});`}
                  </code>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h3 className="font-semibold mb-2">2. Phone Call Tracking</h3>
                  <p className="text-sm text-gray-600 mb-3">Track calls to (305) 814-4461</p>
                  <code className="bg-gray-100 p-2 rounded text-sm block">
                    {`gtag('event', 'conversion', {'send_to': 'AW-CONVERSION_ID/PHONE_CONVERSION_LABEL'});`}
                  </code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}