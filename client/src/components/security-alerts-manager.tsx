import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
        <h2 className="text-2xl font-bold">Security Alerts Management</h2>
        <div className="flex items-center space-x-2">
          <Label htmlFor="alert-enabled">Alert Enabled</Label>
          <Switch
            id="alert-enabled"
            checked={formData.isEnabled}
            onCheckedChange={(checked) => handleChange('isEnabled', checked)}
          />
        </div>
      </div>

      {/* Preview Section */}
      <Card>
        <CardHeader>
          <CardTitle>Live Preview</CardTitle>
        </CardHeader>
        <CardContent>
          {formData.isEnabled && (
            <>
              {/* Desktop Preview */}
              <div className="mb-4">
                <h4 className="font-semibold mb-2">Desktop Warning Banner</h4>
                <div 
                  className="py-1 relative overflow-hidden rounded"
                  style={{ backgroundColor: formData.backgroundColor, color: formData.textColor }}
                >
                  <div className="max-w-4xl mx-auto px-4">
                    <div className="flex items-center justify-center text-center">
                      <div className="flex items-center space-x-3">
                        <span 
                          className="px-2 py-1 rounded-full text-xs font-bold flex items-center"
                          style={{ backgroundColor: formData.backgroundColor, color: formData.textColor }}
                        >
                          <IconComponent className="w-3 h-3 mr-1" />
                          {formData.title}
                        </span>
                        <span className="font-semibold text-sm">
                          {formData.message}
                        </span>
                        <button 
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border-2 border-white"
                          style={{ 
                            backgroundColor: formData.buttonBackgroundColor, 
                            color: formData.buttonTextColor 
                          }}
                        >
                          <span className="mr-1">►</span>
                          {formData.buttonText}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Mobile Preview */}
              <div>
                <h4 className="font-semibold mb-2">Mobile Warning Button</h4>
                <div className="flex items-center space-x-4">
                  <div 
                    className="text-white p-3 rounded-l-lg shadow-lg"
                    style={{ backgroundColor: formData.backgroundColor }}
                  >
                    <div className="flex flex-col items-center space-y-1">
                      <IconComponent className="w-6 h-6" />
                      <span className="font-bold text-xs">{formData.title}</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Tapping opens popup with: "{formData.mobileTitle}"
                  </div>
                </div>
              </div>
            </>
          )}
          {!formData.isEnabled && (
            <div className="text-gray-500 text-center py-8">
              Security alerts are currently disabled
            </div>
          )}
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