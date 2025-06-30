import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Shield, Bell, Zap, AlertCircle, Info } from "lucide-react";
import ColorPickerWithPalette from "@/components/color-picker-with-palette";

interface SecurityAlert {
  id: number;
  isEnabled: boolean;
  isDesktopEnabled: boolean;
  isMobileEnabled: boolean;
  title: string;
  message: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  textColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  iconType: string;
  mobileTitle: string;
  mobileSubtitle: string;
  mobileDescription: string;
  mobileButtonText: string;
  createdAt: string;
  updatedAt: string;
}

const iconOptions = [
  { value: "AlertTriangle", label: "Alert Triangle", icon: AlertTriangle },
  { value: "Shield", label: "Shield", icon: Shield },
  { value: "Bell", label: "Bell", icon: Bell },
  { value: "Zap", label: "Lightning", icon: Zap },
  { value: "AlertCircle", label: "Alert Circle", icon: AlertCircle },
  { value: "Info", label: "Info", icon: Info },
];

const colorOptions = [
  { value: "#dc2626", label: "Red", preview: "bg-red-600" },
  { value: "#ea580c", label: "Orange", preview: "bg-orange-600" },
  { value: "#ca8a04", label: "Yellow", preview: "bg-yellow-600" },
  { value: "#2563eb", label: "Blue", preview: "bg-blue-600" },
  { value: "#9333ea", label: "Purple", preview: "bg-purple-600" },
  { value: "#16a34a", label: "Green", preview: "bg-green-600" },
  { value: "#4b5563", label: "Gray", preview: "bg-gray-600" },
];

export default function SecurityAlertsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<Partial<SecurityAlert>>({
    isEnabled: true,
    isDesktopEnabled: true,
    isMobileEnabled: true,
    title: "CRITICAL",
    message: "Windows 10 Support Ending - Your Systems Will Become Vulnerable to New Threats",
    buttonText: "Learn More",
    buttonLink: "/windows10-upgrade",
    backgroundColor: "#dc2626",
    textColor: "#ffffff",
    buttonBackgroundColor: "#ffffff",
    buttonTextColor: "#000000",
    iconType: "AlertTriangle",
    mobileTitle: "CRITICAL SECURITY ALERT",
    mobileSubtitle: "Windows 10 Support Ending",
    mobileDescription: "Your Systems Will Become Vulnerable to New Threats. Microsoft is ending Windows 10 support on October 14, 2025. After this date, your systems will no longer receive security updates, leaving them exposed to new cyber threats.",
    mobileButtonText: "Get Protected Now",
  });

  const { data: alertData, isLoading } = useQuery({
    queryKey: ['/api/security-alert'],
    queryFn: async () => {
      const res = await fetch('/api/security-alert');
      return res.json();
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: Partial<SecurityAlert>) => {
      const res = await fetch('/api/admin/security-alert', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        credentials: 'include',
      });
      if (!res.ok) throw new Error('Failed to update security alert');
      return res.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Success",
        description: "Security alert updated successfully",
      });
      // Update form data with the returned data to maintain consistency
      setFormData(data.alert);
      // Invalidate queries after a delay to prevent immediate form reset
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['/api/security-alert'] });
      }, 100);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update security alert",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (alertData?.alert && !updateMutation.isPending) {
      setFormData(alertData.alert);
    }
  }, [alertData, updateMutation.isPending]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const handleChange = (field: keyof SecurityAlert, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getIconComponent = (iconType: string) => {
    const iconOption = iconOptions.find(opt => opt.value === iconType);
    return iconOption ? iconOption.icon : AlertTriangle;
  };

  const IconComponent = getIconComponent(formData.iconType || "AlertTriangle");

  if (isLoading) {
    return <div className="p-6">Loading security alerts...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Alerts Management</h2>
          <p className="text-gray-600 text-sm mt-1">Separate controls for desktop banner and mobile warning button</p>
        </div>
        <div className="flex items-center space-x-6">
          {/* Desktop Toggle */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <Label htmlFor="desktop-enabled" className="font-medium">Desktop Banner</Label>
              <div className="text-xs text-gray-500 mt-1">
                {formData.isDesktopEnabled ? (
                  <span className="text-green-600 font-medium">● ACTIVE</span>
                ) : (
                  <span className="text-red-600 font-medium">● DISABLED</span>
                )}
              </div>
            </div>
            <Switch
              id="desktop-enabled"
              checked={formData.isDesktopEnabled}
              onCheckedChange={(checked) => handleChange('isDesktopEnabled', checked)}
            />
          </div>
          
          {/* Mobile Toggle */}
          <div className="flex items-center space-x-3">
            <div className="text-right">
              <Label htmlFor="mobile-enabled" className="font-medium">Mobile Button</Label>
              <div className="text-xs text-gray-500 mt-1">
                {formData.isMobileEnabled ? (
                  <span className="text-green-600 font-medium">● ACTIVE</span>
                ) : (
                  <span className="text-red-600 font-medium">● DISABLED</span>
                )}
              </div>
            </div>
            <Switch
              id="mobile-enabled"
              checked={formData.isMobileEnabled}
              onCheckedChange={(checked) => handleChange('isMobileEnabled', checked)}
            />
          </div>
        </div>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
          <CardDescription>Preview how the security alerts appear on desktop and mobile</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Desktop Preview */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-700">Desktop Warning Banner</h4>
              <span className={`text-xs font-medium px-2 py-1 rounded ${formData.isDesktopEnabled ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                {formData.isDesktopEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            {formData.isDesktopEnabled ? (
              <div 
                className="py-1 relative overflow-hidden rounded border-2 border-gray-200"
                style={{ backgroundColor: formData.backgroundColor || '#dc2626', color: formData.textColor || '#ffffff' }}
              >
                <div className="max-w-4xl mx-auto px-4">
                  <div className="flex items-center justify-center text-center">
                    <div className="flex items-center space-x-3">
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-bold flex items-center space-x-1"
                        style={{ 
                          backgroundColor: formData.backgroundColor || '#dc2626', 
                          color: formData.textColor || '#ffffff'
                        }}
                      >
                        <IconComponent className="w-3 h-3" />
                        <span>{formData.title || 'CRITICAL'}</span>
                      </span>
                      <span className="font-semibold text-sm">
                        {formData.message || 'Windows 10 Support Ending - Your Systems Will Become Vulnerable to New Threats'}
                      </span>
                      <button 
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2"
                        style={{ 
                          backgroundColor: formData.buttonBackgroundColor || '#ffffff', 
                          color: formData.buttonTextColor || '#000000',
                          borderColor: formData.textColor || '#ffffff'
                        }}
                      >
                        <span className="mr-1">►</span>
                        {formData.buttonText || 'Learn More'}
                      </button>
                    </div>
                  </div>
                </div>
                {/* Animated indicators */}
                <div className="absolute left-0 top-0 w-2 h-full bg-yellow-400 animate-ping"></div>
                <div className="absolute right-0 top-0 w-2 h-full bg-yellow-400 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="font-medium">Desktop banner is disabled</div>
                <div className="text-sm">No warning banner will appear on desktop</div>
              </div>
            )}
          </div>

          {/* Mobile Preview */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-semibold text-gray-700">Mobile Warning Button</h4>
              <span className={`text-xs font-medium px-2 py-1 rounded ${formData.isMobileEnabled ? 'text-green-700 bg-green-100' : 'text-red-700 bg-red-100'}`}>
                {formData.isMobileEnabled ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
            {formData.isMobileEnabled ? (
              <div className="flex items-center space-x-4">
                <div 
                  className="p-3 rounded-l-lg shadow-lg border-2 border-gray-200"
                  style={{ backgroundColor: formData.backgroundColor || '#dc2626', color: formData.textColor || '#ffffff' }}
                >
                  <div className="flex flex-col items-center space-y-1">
                    <IconComponent className="w-6 h-6 animate-pulse" />
                    <span className="font-bold text-xs">{formData.title || 'CRITICAL'}</span>
                  </div>
                </div>
                <div className="text-sm text-gray-600">
                  <div className="font-medium">Mobile Popup Contains:</div>
                  <div>Title: "{formData.mobileTitle || 'CRITICAL SECURITY ALERT'}"</div>
                  <div>Button: "{formData.mobileButtonText || 'Get Protected Now'}"</div>
                </div>
              </div>
            ) : (
              <div className="text-gray-500 text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="font-medium">Mobile button is disabled</div>
                <div className="text-sm">No warning button will appear on mobile</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Alert Title</Label>
                <Input
                  id="title"
                  value={formData.title || ''}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="CRITICAL"
                />
              </div>
              <div>
                <Label htmlFor="icon">Icon</Label>
                <Select value={formData.iconType} onValueChange={(value) => handleChange('iconType', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center space-x-2">
                          <option.icon className="w-4 h-4" />
                          <span>{option.label}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="message">Desktop Message</Label>
              <Textarea
                id="message"
                value={formData.message || ''}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="Your alert message for desktop users"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="buttonText">Button Text</Label>
                <Input
                  id="buttonText"
                  value={formData.buttonText || ''}
                  onChange={(e) => handleChange('buttonText', e.target.value)}
                  placeholder="Learn More"
                />
              </div>
              <div>
                <Label htmlFor="buttonLink">Button Link</Label>
                <Input
                  id="buttonLink"
                  value={formData.buttonLink || ''}
                  onChange={(e) => handleChange('buttonLink', e.target.value)}
                  placeholder="/windows10-upgrade"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Mobile Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Mobile Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="mobileTitle">Mobile Alert Title</Label>
                <Input
                  id="mobileTitle"
                  value={formData.mobileTitle || ''}
                  onChange={(e) => handleChange('mobileTitle', e.target.value)}
                  placeholder="CRITICAL SECURITY ALERT"
                />
              </div>
              <div>
                <Label htmlFor="mobileSubtitle">Mobile Subtitle</Label>
                <Input
                  id="mobileSubtitle"
                  value={formData.mobileSubtitle || ''}
                  onChange={(e) => handleChange('mobileSubtitle', e.target.value)}
                  placeholder="Windows 10 Support Ending"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="mobileDescription">Mobile Description</Label>
              <Textarea
                id="mobileDescription"
                value={formData.mobileDescription || ''}
                onChange={(e) => handleChange('mobileDescription', e.target.value)}
                placeholder="Detailed description for mobile popup"
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="mobileButtonText">Mobile Button Text</Label>
              <Input
                id="mobileButtonText"
                value={formData.mobileButtonText || ''}
                onChange={(e) => handleChange('mobileButtonText', e.target.value)}
                placeholder="Get Protected Now"
              />
            </div>
          </CardContent>
        </Card>

        {/* Appearance Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Banner Background Color */}
            <ColorPickerWithPalette
              value={formData.backgroundColor || '#dc2626'}
              onChange={(value) => handleChange('backgroundColor', value)}
              label="Banner Background Color"
              id="backgroundColor"
            />

            {/* Button Background Color */}
            <ColorPickerWithPalette
              value={formData.buttonBackgroundColor || '#dc2626'}
              onChange={(value) => handleChange('buttonBackgroundColor', value)}
              label="Button Background Color"
              id="buttonBackgroundColor"
            />

            {/* Button Text Color */}
            <ColorPickerWithPalette
              value={formData.buttonTextColor || '#ffffff'}
              onChange={(value) => handleChange('buttonTextColor', value)}
              label="Button Text Color"
              id="buttonTextColor"
            />

            {/* Banner Text Color */}
            <ColorPickerWithPalette
              value={formData.textColor || '#ffffff'}
              onChange={(value) => handleChange('textColor', value)}
              label="Banner Text Color"
              id="textColor"
            />
          </CardContent>
        </Card>

        <Button 
          type="submit" 
          className="w-full"
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending ? 'Updating...' : 'Update Security Alert'}
        </Button>
      </form>
    </div>
  );
}