import React, { useState, useCallback, useEffect, useRef } from 'react';
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

// Comprehensive countries list for blocking management
const COMMON_COUNTRIES = [
  // North America
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'MX', name: 'Mexico' },
  
  // Europe
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'BE', name: 'Belgium' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'AT', name: 'Austria' },
  { code: 'SE', name: 'Sweden' },
  { code: 'NO', name: 'Norway' },
  { code: 'DK', name: 'Denmark' },
  { code: 'FI', name: 'Finland' },
  { code: 'PL', name: 'Poland' },
  { code: 'CZ', name: 'Czech Republic' },
  { code: 'HU', name: 'Hungary' },
  { code: 'GR', name: 'Greece' },
  { code: 'PT', name: 'Portugal' },
  { code: 'IE', name: 'Ireland' },
  { code: 'RU', name: 'Russia' },
  { code: 'UA', name: 'Ukraine' },
  
  // Asia-Pacific
  { code: 'CN', name: 'China' },
  { code: 'JP', name: 'Japan' },
  { code: 'KR', name: 'South Korea' },
  { code: 'IN', name: 'India' },
  { code: 'AU', name: 'Australia' },
  { code: 'NZ', name: 'New Zealand' },
  { code: 'SG', name: 'Singapore' },
  { code: 'HK', name: 'Hong Kong' },
  { code: 'TW', name: 'Taiwan' },
  { code: 'TH', name: 'Thailand' },
  { code: 'VN', name: 'Vietnam' },
  { code: 'ID', name: 'Indonesia' },
  { code: 'PH', name: 'Philippines' },
  { code: 'MY', name: 'Malaysia' },
  { code: 'BD', name: 'Bangladesh' },
  { code: 'PK', name: 'Pakistan' },
  { code: 'LK', name: 'Sri Lanka' },
  
  // Middle East & Africa
  { code: 'IL', name: 'Israel' },
  { code: 'AE', name: 'UAE' },
  { code: 'SA', name: 'Saudi Arabia' },
  { code: 'TR', name: 'Turkey' },
  { code: 'EG', name: 'Egypt' },
  { code: 'ZA', name: 'South Africa' },
  { code: 'NG', name: 'Nigeria' },
  { code: 'KE', name: 'Kenya' },
  { code: 'GH', name: 'Ghana' },
  { code: 'MA', name: 'Morocco' },
  { code: 'TN', name: 'Tunisia' },
  { code: 'JO', name: 'Jordan' },
  { code: 'LB', name: 'Lebanon' },
  
  // South America
  { code: 'BR', name: 'Brazil' },
  { code: 'AR', name: 'Argentina' },
  { code: 'CL', name: 'Chile' },
  { code: 'PE', name: 'Peru' },
  { code: 'CO', name: 'Colombia' },
  { code: 'UY', name: 'Uruguay' },
  { code: 'EC', name: 'Ecuador' },
  { code: 'BO', name: 'Bolivia' },
  
  // High-Risk Countries (often blocked)
  { code: 'IR', name: 'Iran' },
  { code: 'KP', name: 'North Korea' },
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
  { code: 'BY', name: 'Belarus' }
].sort((a, b) => a.name.localeCompare(b.name)); // Sort alphabetically by name

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
  
  // Refs for debounce timeouts
  const timeoutRefs = useRef<{ [key: string]: NodeJS.Timeout }>({});
  
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

  // Debounced update function with proper cleanup
  const debouncedUpdate = useCallback((key: string, value: any) => {
    // Clear existing timeout for this key
    if (timeoutRefs.current[key]) {
      clearTimeout(timeoutRefs.current[key]);
    }
    
    // Set new timeout
    timeoutRefs.current[key] = setTimeout(() => {
      updateSettingsMutation.mutate({ [key]: value });
      delete timeoutRefs.current[key];
    }, 1000); // 1 second delay
  }, [updateSettingsMutation]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(timeoutRefs.current).forEach(timeout => {
        clearTimeout(timeout);
      });
    };
  }, []);

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

          {/* Country Status Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Blocked Countries */}
            <div>
              <Label className="text-sm font-medium mb-3 block text-red-700">
                🚫 Blocked Countries ({blockedCountries.length})
              </Label>
              {blockedCountries.length === 0 ? (
                <div className="text-center py-4 text-gray-500 bg-gray-50 rounded-lg text-sm">
                  No countries blocked
                </div>
              ) : (
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {blockedCountries.map((country) => (
                    <div
                      key={country.id}
                      className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded text-sm"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center text-xs font-bold text-red-600">
                          {country.countryCode}
                        </span>
                        <span className="font-medium text-red-900">{country.countryName}</span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeCountryMutation.mutate(country.id)}
                        disabled={removeCountryMutation.isPending}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100 h-6 w-6 p-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Enabled Countries */}
            <div>
              <Label className="text-sm font-medium mb-3 block text-green-700">
                ✅ Enabled Countries ({COMMON_COUNTRIES.length - blockedCountries.length})
              </Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {COMMON_COUNTRIES
                  .filter(country => !blockedCountries.some(bc => bc.countryCode === country.code))
                  .slice(0, 10)
                  .map((country) => (
                    <div
                      key={country.code}
                      className="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded text-sm"
                    >
                      <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-bold text-green-600">
                        {country.code}
                      </span>
                      <span className="font-medium text-green-900">{country.name}</span>
                    </div>
                  ))}
                {COMMON_COUNTRIES.length - blockedCountries.length > 10 && (
                  <div className="text-xs text-gray-500 text-center py-1">
                    +{COMMON_COUNTRIES.length - blockedCountries.length - 10} more enabled countries
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Detailed Management for Blocked Countries */}
          {blockedCountries.length > 0 && (
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Detailed Blocked Countries Management
              </Label>
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
            </div>
          )}
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