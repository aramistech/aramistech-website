import React, { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Trash2, Plus, Globe, Shield, Settings, Eye } from 'lucide-react';
import ColorPickerWithPalette from '@/components/color-picker-with-palette';

// Common countries list for the dropdown
const COMMON_COUNTRIES = [
  { code: 'CN', name: 'China' },
  { code: 'RU', name: 'Russia' },
  { code: 'IR', name: 'Iran' },
  { code: 'KP', name: 'North Korea' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'AF', name: 'Afghanistan' },
  { code: 'IQ', name: 'Iraq' },
  { code: 'SY', name: 'Syria' },
  { code: 'LY', name: 'Libya' },
  { code: 'SO', name: 'Somalia' },
  { code: 'SD', name: 'Sudan' },
  { code: 'YE', name: 'Yemen' },
  { code: 'MM', name: 'Myanmar' },
  { code: 'VE', name: 'Venezuela' },
  { code: 'CU', name: 'Cuba' },
  { code: 'BR', name: 'Brazil' },
  { code: 'IN', name: 'India' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'GH', name: 'Ghana' },
  { code: 'KE', name: 'Kenya' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'EG', name: 'Egypt' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'MY', name: 'Malaysia' }
];

// Font size options
const FONT_SIZES = [
  { value: 'text-xs', label: 'Extra Small' },
  { value: 'text-sm', label: 'Small' },
  { value: 'text-base', label: 'Medium' },
  { value: 'text-lg', label: 'Large' },
  { value: 'text-xl', label: 'Extra Large' },
  { value: 'text-2xl', label: '2X Large' },
  { value: 'text-3xl', label: '3X Large' }
];

interface CountryBlockingSettings {
  isEnabled: boolean;
  blockMessage: string;
  messageTitle: string;
  fontSize: string;
  fontColor: string;
  backgroundColor: string;
  borderColor: string;
  showContactInfo: boolean;
  contactMessage: string;
}

interface BlockedCountry {
  id: number;
  countryCode: string;
  countryName: string;
  createdAt: string;
}

export default function CountryBlockingManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCountry, setSelectedCountry] = useState('');
  
  // Local state for text inputs to prevent update conflicts
  const [localSettings, setLocalSettings] = useState({
    messageTitle: '',
    blockMessage: '',
    contactMessage: ''
  });
  
  // Fetch country blocking data
  const { data: countryData, isLoading } = useQuery({
    queryKey: ['/api/admin/country-blocking'],
    staleTime: 1000 * 60 * 5,
  });

  const settings: CountryBlockingSettings = countryData?.settings || {
    isEnabled: false,
    blockMessage: "This service is not available in your region.",
    messageTitle: "Service Not Available",
    fontSize: "text-lg",
    fontColor: "#374151",
    backgroundColor: "#f9fafb",
    borderColor: "#e5e7eb",
    showContactInfo: true,
    contactMessage: "If you believe this is an error, please contact us."
  };

  const blockedCountries: BlockedCountry[] = countryData?.blockedCountries || [];

  // Sync local state with fetched settings
  useEffect(() => {
    if (settings) {
      setLocalSettings({
        messageTitle: settings.messageTitle || '',
        blockMessage: settings.blockMessage || '',
        contactMessage: settings.contactMessage || ''
      });
    }
  }, [settings.messageTitle, settings.blockMessage, settings.contactMessage]);

  // Debounced update function
  const debouncedUpdate = useCallback((key: string, value: any) => {
    const timeoutId = setTimeout(() => {
      updateSettingsMutation.mutate({ [key]: value });
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, []);

  // Update settings mutation
  const updateSettingsMutation = useMutation({
    mutationFn: async (newSettings: Partial<CountryBlockingSettings>) => {
      const response = await apiRequest('/api/admin/country-blocking', 'PUT', newSettings);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Country blocking settings updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/country-blocking'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update settings",
        variant: "destructive",
      });
    },
  });

  // Add country mutation
  const addCountryMutation = useMutation({
    mutationFn: async (country: { countryCode: string; countryName: string }) => {
      const response = await apiRequest('/api/admin/country-blocking/countries', 'POST', country);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Country added to block list",
      });
      setSelectedCountry('');
      queryClient.invalidateQueries({ queryKey: ['/api/admin/country-blocking'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add country",
        variant: "destructive",
      });
    },
  });

  // Remove country mutation
  const removeCountryMutation = useMutation({
    mutationFn: async (countryId: number) => {
      const response = await apiRequest(`/api/admin/country-blocking/countries/${countryId}`, 'DELETE');
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Country removed from block list",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/country-blocking'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to remove country",
        variant: "destructive",
      });
    },
  });

  const handleSettingUpdate = (key: keyof CountryBlockingSettings, value: any) => {
    updateSettingsMutation.mutate({ [key]: value });
  };

  const handleAddCountry = () => {
    if (!selectedCountry) {
      toast({
        title: "Error",
        description: "Please select a country to block",
        variant: "destructive",
      });
      return;
    }

    const country = COMMON_COUNTRIES.find(c => c.code === selectedCountry);
    if (country) {
      addCountryMutation.mutate({
        countryCode: country.code,
        countryName: country.name
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="text-lg font-medium">Loading country blocking settings...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enable/Disable Country Blocking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Country Blocking Status
          </CardTitle>
          <CardDescription>
            Enable or disable geographic access restrictions for your website
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Switch
              checked={settings.isEnabled}
              onCheckedChange={(checked) => handleSettingUpdate('isEnabled', checked)}
              disabled={updateSettingsMutation.isPending}
            />
            <div className="flex-1">
              <Label className="text-sm font-medium">
                {settings.isEnabled ? 'Country blocking is active' : 'Country blocking is disabled'}
              </Label>
              <p className="text-xs text-gray-500 mt-1">
                {settings.isEnabled 
                  ? 'Visitors from blocked countries will see a custom message'
                  : 'All visitors can access your website regardless of location'
                }
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Blocked Countries Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Blocked Countries
          </CardTitle>
          <CardDescription>
            Manage which countries are blocked from accessing your website
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add Country Form */}
          <div className="flex gap-2">
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Select a country to block" />
              </SelectTrigger>
              <SelectContent>
                {COMMON_COUNTRIES
                  .filter(country => !blockedCountries.some(bc => bc.countryCode === country.code))
                  .map((country) => (
                    <SelectItem key={country.code} value={country.code}>
                      {country.name} ({country.code})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleAddCountry}
              disabled={!selectedCountry || addCountryMutation.isPending}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Country
            </Button>
          </div>

          {/* Current Blocked Countries */}
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Currently Blocked Countries ({blockedCountries.length})
            </Label>
            {blockedCountries.length === 0 ? (
              <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg">
                No countries are currently blocked
              </div>
            ) : (
              <div className="grid gap-2">
                {blockedCountries.map((country) => (
                  <div
                    key={country.id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <span className="text-xs font-bold text-red-600">
                          {country.countryCode}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-red-900">{country.countryName}</div>
                        <div className="text-xs text-red-600">
                          Code: {country.countryCode} • Added: {new Date(country.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeCountryMutation.mutate(country.id)}
                      disabled={removeCountryMutation.isPending}
                      className="text-red-600 hover:text-red-800 hover:bg-red-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Message Customization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Block Message Customization
          </CardTitle>
          <CardDescription>
            Customize the message shown to visitors from blocked countries
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Message Title */}
          <div className="space-y-2">
            <Label htmlFor="messageTitle">Message Title</Label>
            <Input
              id="messageTitle"
              value={localSettings.messageTitle}
              onChange={(e) => {
                setLocalSettings(prev => ({ ...prev, messageTitle: e.target.value }));
                debouncedUpdate('messageTitle', e.target.value);
              }}
              placeholder="Service Not Available"
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          {/* Block Message */}
          <div className="space-y-2">
            <Label htmlFor="blockMessage">Block Message</Label>
            <Textarea
              id="blockMessage"
              value={localSettings.blockMessage}
              onChange={(e) => {
                setLocalSettings(prev => ({ ...prev, blockMessage: e.target.value }));
                debouncedUpdate('blockMessage', e.target.value);
              }}
              placeholder="This service is not available in your region."
              rows={3}
              disabled={updateSettingsMutation.isPending}
            />
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                checked={settings.showContactInfo}
                onCheckedChange={(checked) => handleSettingUpdate('showContactInfo', checked)}
                disabled={updateSettingsMutation.isPending}
              />
              <Label>Show contact information</Label>
            </div>
            
            {settings.showContactInfo && (
              <div className="space-y-2">
                <Label htmlFor="contactMessage">Contact Message</Label>
                <Textarea
                  id="contactMessage"
                  value={localSettings.contactMessage}
                  onChange={(e) => {
                    setLocalSettings(prev => ({ ...prev, contactMessage: e.target.value }));
                    debouncedUpdate('contactMessage', e.target.value);
                  }}
                  placeholder="If you believe this is an error, please contact us."
                  rows={2}
                  disabled={updateSettingsMutation.isPending}
                />
              </div>
            )}
          </div>

          {/* Styling Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Font Size */}
            <div className="space-y-2">
              <Label>Font Size</Label>
              <Select 
                value={settings.fontSize} 
                onValueChange={(value) => handleSettingUpdate('fontSize', value)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FONT_SIZES.map((size) => (
                    <SelectItem key={size.value} value={size.value}>
                      {size.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Font Color */}
            <div className="space-y-2">
              <ColorPickerWithPalette
                label="Font Color"
                value={settings.fontColor}
                onChange={(color: string) => handleSettingUpdate('fontColor', color)}
              />
            </div>

            {/* Background Color */}
            <div className="space-y-2">
              <ColorPickerWithPalette
                label="Background Color"
                value={settings.backgroundColor}
                onChange={(color: string) => handleSettingUpdate('backgroundColor', color)}
              />
            </div>

            {/* Border Color */}
            <div className="space-y-2">
              <ColorPickerWithPalette
                label="Border Color"
                value={settings.borderColor}
                onChange={(color: string) => handleSettingUpdate('borderColor', color)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="w-5 h-5" />
            Message Preview
          </CardTitle>
          <CardDescription>
            See how the block message will appear to visitors
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className={`p-6 rounded-lg border-2 ${settings.fontSize}`}
            style={{
              color: settings.fontColor,
              backgroundColor: settings.backgroundColor,
              borderColor: settings.borderColor
            }}
          >
            <h3 className="font-bold mb-4 text-xl">{localSettings.messageTitle || settings.messageTitle}</h3>
            <p className="mb-4">{localSettings.blockMessage || settings.blockMessage}</p>
            {settings.showContactInfo && (
              <p className="text-sm opacity-80">{localSettings.contactMessage || settings.contactMessage}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}