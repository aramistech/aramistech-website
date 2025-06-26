import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, RefreshCw, Globe, Wifi, MapPin, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DynamicHeader from '@/components/dynamic-header';
import Footer from '@/components/footer';

interface IPInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  org?: string;
  timezone?: string;
}

interface LocalIPInfo {
  ipv4: string[];
  ipv6: string[];
  interface: string;
}

export default function IPLookup() {
  const [publicIP, setPublicIP] = useState<IPInfo | null>(null);
  const [localIPs, setLocalIPs] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const { toast } = useToast();

  const fetchPublicIP = async () => {
    try {
      // Try multiple services for reliability
      const services = [
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://ipinfo.io/json'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          if (response.ok) {
            const data = await response.json();
            
            // Normalize response format
            const ipInfo: IPInfo = {
              ip: data.ip || data.query,
              city: data.city,
              region: data.region || data.regionName,
              country: data.country || data.country_name,
              org: data.org || data.isp,
              timezone: data.timezone
            };
            
            setPublicIP(ipInfo);
            return;
          }
        } catch (error) {
          console.warn(`Service ${service} failed:`, error);
          continue;
        }
      }
      
      throw new Error('All IP services failed');
    } catch (error) {
      console.error('Failed to fetch public IP:', error);
      toast({
        title: "Error",
        description: "Failed to fetch public IP address",
        variant: "destructive"
      });
    }
  };

  const getLocalIPs = () => {
    return new Promise<string[]>((resolve) => {
      const ips: string[] = [];
      
      // Create RTCPeerConnection to discover local IPs
      const pc = new RTCPeerConnection({
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
      });

      pc.createDataChannel('');
      
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          const candidate = event.candidate.candidate;
          const ipMatch = candidate.match(/(\d+\.\d+\.\d+\.\d+)/);
          
          if (ipMatch && ipMatch[1]) {
            const ip = ipMatch[1];
            // Filter out public IPs and duplicates
            if (!ips.includes(ip) && 
                (ip.startsWith('192.168.') || 
                 ip.startsWith('10.') || 
                 ip.startsWith('172.') ||
                 ip.startsWith('169.254.'))) {
              ips.push(ip);
            }
          }
        }
      };

      pc.createOffer()
        .then(offer => pc.setLocalDescription(offer))
        .catch(console.error);

      // Resolve after a short timeout
      setTimeout(() => {
        pc.close();
        resolve(ips);
      }, 2000);
    });
  };

  const loadIPData = async () => {
    setLoading(true);
    try {
      const [localIPsResult] = await Promise.all([
        getLocalIPs(),
        fetchPublicIP()
      ]);
      setLocalIPs(localIPsResult);
    } catch (error) {
      console.error('Error loading IP data:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    setRefreshing(true);
    await loadIPData();
    setRefreshing(false);
    toast({
      title: "Refreshed",
      description: "IP addresses have been updated"
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      toast({
        title: "Copied",
        description: `${label} copied to clipboard`
      });
    }).catch(() => {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive"
      });
    });
  };

  useEffect(() => {
    loadIPData();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50">
      <DynamicHeader />
      <div className="py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              IP Address Lookup Tool
            </h1>
            <p className="text-xl text-gray-600 mb-6">
              Find your public internet IP and local network addresses
            </p>
            <Button 
              onClick={refreshData} 
              disabled={refreshing}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {refreshing ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Refreshing...
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </>
              )}
            </Button>
          </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Public IP Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-blue-600" />
                Public IP Address
              </CardTitle>
              <CardDescription>
                Your internet-facing IP address visible to websites
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                </div>
              ) : publicIP ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-mono font-bold text-blue-600">
                      {publicIP.ip}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(publicIP.ip, 'Public IP')}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    {publicIP.city && publicIP.region && (
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {publicIP.city}, {publicIP.region}, {publicIP.country}
                        </span>
                      </div>
                    )}
                    
                    {publicIP.org && (
                      <div className="flex items-center gap-2">
                        <Wifi className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {publicIP.org}
                        </span>
                      </div>
                    )}
                    
                    {publicIP.timezone && (
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-gray-500" />
                        <span className="text-sm text-gray-700">
                          {publicIP.timezone}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">Failed to load public IP</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Local IP Card */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wifi className="w-5 h-5 text-orange-600" />
                Local IP Addresses
              </CardTitle>
              <CardDescription>
                Your private network IP addresses
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                </div>
              ) : localIPs.length > 0 ? (
                <div className="space-y-3">
                  {localIPs.map((ip, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-mono font-bold text-orange-600">
                          {ip}
                        </span>
                        <div className="flex gap-2 mt-1">
                          {ip.startsWith('192.168.') && (
                            <Badge variant="secondary" className="text-xs">
                              Home Network
                            </Badge>
                          )}
                          {ip.startsWith('10.') && (
                            <Badge variant="secondary" className="text-xs">
                              Private Network
                            </Badge>
                          )}
                          {ip.startsWith('172.') && (
                            <Badge variant="secondary" className="text-xs">
                              Corporate Network
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(ip, 'Local IP')}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500">No local IP addresses detected</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Some browsers may block local IP detection
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Information Section */}
        <Card className="mt-8 shadow-lg">
          <CardHeader>
            <CardTitle>Understanding IP Addresses</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-blue-600 mb-2">Public IP Address</h4>
              <p className="text-sm text-gray-600">
                Your public IP is assigned by your internet service provider (ISP) and is visible to websites you visit. 
                This is the address websites see when you connect to them.
              </p>
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-semibold text-orange-600 mb-2">Local IP Address</h4>
              <p className="text-sm text-gray-600">
                Your local IP is assigned by your router for your home or office network. Devices on the same network 
                use these addresses to communicate with each other. Common ranges include 192.168.x.x and 10.x.x.x.
              </p>
            </div>

            <Separator />

            <div className="text-center">
              <p className="text-sm text-gray-500">
                Need help with your network setup? 
                <a href="/contact" className="text-blue-600 hover:underline ml-1">
                  Contact AramisTech for professional IT support
                </a>
              </p>
            </div>
          </CardContent>
        </Card>
        </div>
      </div>
      <Footer />
    </div>
  );
}