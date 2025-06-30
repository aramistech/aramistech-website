import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, Shield, Bell, Zap, AlertCircle, Info, Monitor, Smartphone, Settings2, Palette } from "lucide-react";
import ColorPickerWithPalette from "@/components/color-picker-with-palette";

interface SecurityAlert {
  id: number;
  isEnabled: boolean;
  isDesktopEnabled: boolean;
  isMobileEnabled: boolean;
  
  // Desktop Settings
  desktopTitle: string;
  desktopMessage: string;
  desktopButtonText: string;
  desktopButtonLink: string;
  desktopBackgroundColor: string;
  desktopTextColor: string;
  desktopButtonBackgroundColor: string;
  desktopButtonTextColor: string;
  desktopIconType: string;
  
  // Mobile Settings
  mobileTitle: string;
  mobileSubtitle: string;
  mobileDescription: string;
  mobileButtonText: string;
  mobileButtonLink: string;
  mobileBackgroundColor: string;
  mobileTextColor: string;
  mobileButtonBackgroundColor: string;
  mobileButtonTextColor: string;
  mobileIconType: string;
  
  // Legacy fields
  title: string;
  message: string;
  buttonText: string;
  buttonLink: string;
  backgroundColor: string;
  textColor: string;
  buttonBackgroundColor: string;
  buttonTextColor: string;
  iconType: string;
}

const iconOptions = [
  { value: "AlertTriangle", label: "Alert Triangle", icon: AlertTriangle },
  { value: "Shield", label: "Shield", icon: Shield },
  { value: "Bell", label: "Bell", icon: Bell },
  { value: "Zap", label: "Zap", icon: Zap },
  { value: "AlertCircle", label: "Alert Circle", icon: AlertCircle },
  { value: "Info", label: "Info", icon: Info },
];

export default function SecurityAlertsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [formData, setFormData] = useState<SecurityAlert | null>(null);

  const { data: alert, isLoading } = useQuery<{ success: boolean; alert: SecurityAlert }>({
    queryKey: ["/api/security-alert"],
  });

  const updateAlertMutation = useMutation({
    mutationFn: async (updatedAlert: Partial<SecurityAlert>) => {
      const response = await fetch("/api/admin/security-alert", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedAlert),
      });
      
      if (!response.ok) {
        throw new Error("Failed to update security alert");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/security-alert"] });
      toast({
        title: "Success",
        description: "Security alert updated successfully",
      });
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
    if (alert?.alert) {
      setFormData(alert.alert);
    }
  }, [alert]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData) {
      updateAlertMutation.mutate(formData);
    }
  };

  const handleInputChange = (field: keyof SecurityAlert, value: any) => {
    if (formData) {
      setFormData({ ...formData, [field]: value });
    }
  };

  const handleToggle = (field: keyof SecurityAlert) => {
    if (formData) {
      setFormData({ ...formData, [field]: !formData[field] });
    }
  };

  if (isLoading || !formData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Security Alerts Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading security alerts...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Security Alerts Management
        </CardTitle>
        <CardDescription>
          Customize security alerts for desktop and mobile separately
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Master Toggles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                <Label htmlFor="desktop-enabled">Desktop Alert</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="desktop-enabled"
                  checked={formData.isDesktopEnabled}
                  onCheckedChange={() => handleToggle("isDesktopEnabled")}
                />
                <Badge variant={formData.isDesktopEnabled ? "default" : "secondary"}>
                  {formData.isDesktopEnabled ? "ACTIVE" : "DISABLED"}
                </Badge>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <Label htmlFor="mobile-enabled">Mobile Alert</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id="mobile-enabled"
                  checked={formData.isMobileEnabled}
                  onCheckedChange={() => handleToggle("isMobileEnabled")}
                />
                <Badge variant={formData.isMobileEnabled ? "default" : "secondary"}>
                  {formData.isMobileEnabled ? "ACTIVE" : "DISABLED"}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Tabbed Interface for Desktop and Mobile */}
          <Tabs defaultValue="desktop" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="desktop" className="flex items-center gap-2">
                <Monitor className="h-4 w-4" />
                Desktop Banner
              </TabsTrigger>
              <TabsTrigger value="mobile" className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Mobile Button
              </TabsTrigger>
            </TabsList>

            {/* Desktop Alert Configuration */}
            <TabsContent value="desktop" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="desktop-title">Desktop Title</Label>
                  <Input
                    id="desktop-title"
                    value={formData.desktopTitle}
                    onChange={(e) => handleInputChange("desktopTitle", e.target.value)}
                    placeholder="CRITICAL"
                  />
                </div>
                
                <div>
                  <Label htmlFor="desktop-icon">Desktop Icon</Label>
                  <Select 
                    value={formData.desktopIconType} 
                    onValueChange={(value) => handleInputChange("desktopIconType", value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {iconOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value}>
                            <div className="flex items-center gap-2">
                              <IconComponent className="h-4 w-4" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="desktop-message">Desktop Message</Label>
                <Textarea
                  id="desktop-message"
                  value={formData.desktopMessage}
                  onChange={(e) => handleInputChange("desktopMessage", e.target.value)}
                  placeholder="Your message here..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="desktop-button-text">Desktop Button Text</Label>
                  <Input
                    id="desktop-button-text"
                    value={formData.desktopButtonText}
                    onChange={(e) => handleInputChange("desktopButtonText", e.target.value)}
                    placeholder="Learn More"
                  />
                </div>
                
                <div>
                  <Label htmlFor="desktop-button-link">Desktop Button Link</Label>
                  <Input
                    id="desktop-button-link"
                    value={formData.desktopButtonLink}
                    onChange={(e) => handleInputChange("desktopButtonLink", e.target.value)}
                    placeholder="/windows10-upgrade"
                  />
                </div>
              </div>

              {/* Desktop Colors */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Desktop Colors
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Background Color</Label>
                    <ColorPickerWithPalette
                      value={formData.desktopBackgroundColor}
                      onChange={(color) => handleInputChange("desktopBackgroundColor", color)}
                      label="Desktop Background Color"
                    />
                  </div>
                  
                  <div>
                    <Label>Text Color</Label>
                    <ColorPickerWithPalette
                      value={formData.desktopTextColor}
                      onChange={(color) => handleInputChange("desktopTextColor", color)}
                      label="Desktop Text Color"
                    />
                  </div>
                  
                  <div>
                    <Label>Button Background</Label>
                    <ColorPickerWithPalette
                      value={formData.desktopButtonBackgroundColor}
                      onChange={(color) => handleInputChange("desktopButtonBackgroundColor", color)}
                      label="Desktop Button Background Color"
                    />
                  </div>
                  
                  <div>
                    <Label>Button Text</Label>
                    <ColorPickerWithPalette
                      value={formData.desktopButtonTextColor}
                      onChange={(color) => handleInputChange("desktopButtonTextColor", color)}
                      label="Desktop Button Text Color"
                    />
                  </div>
                </div>
              </div>

              {/* Desktop Preview */}
              <div className="mt-6">
                <Label className="text-sm font-medium">Desktop Preview</Label>
                <div 
                  className="mt-2 p-4 rounded-lg"
                  style={{ backgroundColor: formData.desktopBackgroundColor }}
                >
                  <div className="flex items-center justify-center text-center">
                    <div className="flex items-center space-x-3">
                      {(() => {
                        const SelectedIcon = iconOptions.find(opt => opt.value === formData.desktopIconType)?.icon || AlertTriangle;
                        return <SelectedIcon className="w-6 h-6" style={{ color: formData.desktopTextColor }} />;
                      })()}
                      <span 
                        className="font-bold text-sm px-2 py-1 rounded"
                        style={{ 
                          backgroundColor: formData.desktopBackgroundColor, 
                          color: formData.desktopTextColor 
                        }}
                      >
                        {formData.desktopTitle}
                      </span>
                      <span style={{ color: formData.desktopTextColor }}>
                        {formData.desktopMessage}
                      </span>
                      <button
                        className="px-4 py-2 rounded text-sm font-medium"
                        style={{
                          backgroundColor: formData.desktopButtonBackgroundColor,
                          color: formData.desktopButtonTextColor
                        }}
                      >
                        <span className="mr-2">►</span>
                        {formData.desktopButtonText}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Mobile Alert Configuration */}
            <TabsContent value="mobile" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobile-title">Mobile Title</Label>
                  <Input
                    id="mobile-title"
                    value={formData.mobileTitle}
                    onChange={(e) => handleInputChange("mobileTitle", e.target.value)}
                    placeholder="CRITICAL SECURITY ALERT"
                  />
                </div>
                
                <div>
                  <Label htmlFor="mobile-subtitle">Mobile Subtitle</Label>
                  <Input
                    id="mobile-subtitle"
                    value={formData.mobileSubtitle}
                    onChange={(e) => handleInputChange("mobileSubtitle", e.target.value)}
                    placeholder="Windows 10 Support Ending"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="mobile-icon">Mobile Icon</Label>
                <Select 
                  value={formData.mobileIconType} 
                  onValueChange={(value) => handleInputChange("mobileIconType", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((option) => {
                      const IconComponent = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4" />
                            {option.label}
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="mobile-description">Mobile Description</Label>
                <Textarea
                  id="mobile-description"
                  value={formData.mobileDescription}
                  onChange={(e) => handleInputChange("mobileDescription", e.target.value)}
                  placeholder="Detailed description for mobile popup..."
                  rows={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mobile-button-text">Mobile Button Text</Label>
                  <Input
                    id="mobile-button-text"
                    value={formData.mobileButtonText}
                    onChange={(e) => handleInputChange("mobileButtonText", e.target.value)}
                    placeholder="Get Protected Now"
                  />
                </div>
                
                <div>
                  <Label htmlFor="mobile-button-link">Mobile Button Link</Label>
                  <Input
                    id="mobile-button-link"
                    value={formData.mobileButtonLink}
                    onChange={(e) => handleInputChange("mobileButtonLink", e.target.value)}
                    placeholder="/windows10-upgrade"
                  />
                </div>
              </div>

              {/* Mobile Colors */}
              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <Palette className="h-4 w-4" />
                  Mobile Colors
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label>Background Color</Label>
                    <ColorPickerWithPalette
                      value={formData.mobileBackgroundColor}
                      onChange={(color) => handleInputChange("mobileBackgroundColor", color)}
                      label="Mobile Background Color"
                    />
                  </div>
                  
                  <div>
                    <Label>Text Color</Label>
                    <ColorPickerWithPalette
                      value={formData.mobileTextColor}
                      onChange={(color) => handleInputChange("mobileTextColor", color)}
                      label="Mobile Text Color"
                    />
                  </div>
                  
                  <div>
                    <Label>Button Background</Label>
                    <ColorPickerWithPalette
                      value={formData.mobileButtonBackgroundColor}
                      onChange={(color) => handleInputChange("mobileButtonBackgroundColor", color)}
                      label="Mobile Button Background Color"
                    />
                  </div>
                  
                  <div>
                    <Label>Button Text</Label>
                    <ColorPickerWithPalette
                      value={formData.mobileButtonTextColor}
                      onChange={(color) => handleInputChange("mobileButtonTextColor", color)}
                      label="Mobile Button Text Color"
                    />
                  </div>
                </div>
              </div>

              {/* Mobile Preview */}
              <div className="mt-6">
                <Label className="text-sm font-medium">Mobile Preview</Label>
                <div 
                  className="mt-2 p-6 rounded-lg max-w-sm mx-auto"
                  style={{ backgroundColor: formData.mobileBackgroundColor }}
                >
                  <div className="flex items-start mb-4">
                    {(() => {
                      const SelectedIcon = iconOptions.find(opt => opt.value === formData.mobileIconType)?.icon || AlertTriangle;
                      return <SelectedIcon className="w-8 h-8 mr-3" style={{ color: formData.mobileTextColor }} />;
                    })()}
                    <div>
                      <span 
                        className="px-2 py-1 rounded-full text-xs font-bold"
                        style={{ 
                          backgroundColor: formData.mobileBackgroundColor, 
                          color: formData.mobileTextColor 
                        }}
                      >
                        CRITICAL SECURITY ALERT
                      </span>
                      <h3 
                        className="font-bold text-lg mt-2"
                        style={{ color: formData.mobileTextColor }}
                      >
                        {formData.mobileTitle}
                      </h3>
                    </div>
                  </div>
                  
                  <p 
                    className="text-base mb-6 leading-relaxed"
                    style={{ color: formData.mobileTextColor }}
                  >
                    {formData.mobileDescription}
                  </p>
                  
                  <button
                    className="w-full px-6 py-3 rounded-full text-base font-bold border-2"
                    style={{
                      backgroundColor: formData.mobileButtonBackgroundColor,
                      color: formData.mobileButtonTextColor,
                      borderColor: formData.mobileTextColor
                    }}
                  >
                    <span className="mr-2">►</span>
                    {formData.mobileButtonText}
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <Separator />

          {/* Submit Button */}
          <div className="flex justify-end">
            <Button 
              type="submit" 
              disabled={updateAlertMutation.isPending}
              className="flex items-center gap-2"
            >
              {updateAlertMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Updating...
                </>
              ) : (
                <>
                  <Settings2 className="h-4 w-4" />
                  Update Security Alerts
                </>
              )}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}