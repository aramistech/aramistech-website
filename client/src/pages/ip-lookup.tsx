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

  // Helper function to check if an IP is IPv4
  const isIPv4 = (ip: string): boolean => {
    const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
    return ipv4Regex.test(ip);
  };

  const fetchPublicIP = async () => {
    try {
      // Try multiple services for reliability - prioritize IPv4-only services
      const services = [
        'https://api.ipify.org?format=json', // IPv4 only
        'https://ipapi.co/json/',
        'https://ip-api.com/json/',
        'https://ipinfo.io/json'
      ];

      for (const service of services) {
        try {
          const response = await fetch(service);
          if (response.ok) {
            const data = await response.json();
            
            const detectedIP = data.ip || data.query;
            
            // Only accept IPv4 addresses
            if (detectedIP && isIPv4(detectedIP)) {
              // Normalize response format
              const ipInfo: IPInfo = {
                ip: detectedIP,
                city: data.city,
                region: data.region || data.regionName,
                country: data.country || data.country_name,
                org: data.org || data.isp,
                timezone: data.timezone
              };
              
              setPublicIP(ipInfo);
              return;
            } else {
              console.log(`Skipping IPv6 address: ${detectedIP}`);
              continue; // Try next service for IPv4
            }
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

  const getLocalIPs = async (): Promise<string[]> => {
    // Method 1: Try WebRTC approach
    const webrtcIPs = await tryWebRTCDetection();
    if (webrtcIPs.length > 0 && !webrtcIPs[0].includes('Unable')) {
      return webrtcIPs;
    }

    // Method 2: Try to guess network type based on public IP
    let networkHint = '';
    if (publicIP?.ip) {
      // Check if we can infer anything from the public IP
      const ipParts = publicIP.ip.split('.');
      if (ipParts.length === 4) {
        networkHint = 'Likely using NAT/Router - Check router admin panel for device list';
      }
    }

    // Method 3: Return helpful guidance for finding local IP
    const guidance = [
      'Browser privacy protection prevents automatic detection',
      '',
      'Quick ways to find your local IP:',
      '• Windows: Press Win+R → type "cmd" → type "ipconfig"',
      '• Mac: System Preferences → Network → Select connection',
      '• Router: Check connected devices in router admin panel',
      ''
    ];

    if (networkHint) {
      guidance.push(networkHint, '');
    }

    guidance.push(
      'Most common IP ranges:',
      '• 192.168.1.x (Typical home setup)',
      '• 192.168.0.x (Default router config)',
      '• 10.0.0.x (Some routers/corporate)',
      '• 172.16-31.x.x (Enterprise networks)'
    );

    return guidance;
  };

  const tryWebRTCDetection = (): Promise<string[]> => {
    return new Promise((resolve) => {
      const ips: string[] = [];
      let completed = false;
      
      try {
        // Create RTCPeerConnection with no STUN servers to get local candidates only
        const pc1 = new RTCPeerConnection({
          iceServers: []
        });

        // Create another with STUN servers for comparison
        const pc2 = new RTCPeerConnection({
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' }
          ]
        });

        let candidatesReceived = 0;
        const maxCandidates = 10;

        const handleCandidate = (ice: RTCPeerConnectionIceEvent, source: string) => {
          if (!ice || !ice.candidate) return;
          
          candidatesReceived++;
          const candidate = ice.candidate.candidate;
          console.log(`${source} candidate:`, candidate);
          
          // Look for IPv4 addresses in various parts of the candidate string
          const ipMatches = candidate.match(/(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})/g);
          
          if (ipMatches) {
            ipMatches.forEach(ip => {
              if (isValidPrivateIP(ip) && !ips.includes(ip)) {
                console.log('Found valid local IP:', ip);
                ips.push(ip);
              } else if (ip !== '0.0.0.0' && !ip.startsWith('127.') && !ips.includes(ip)) {
                // Also capture other non-loopback IPs for debugging
                console.log('Found other IP:', ip);
              }
            });
          }

          // Complete if we have enough candidates or found IPs
          if (candidatesReceived >= maxCandidates || ips.length > 0) {
            completeDetection();
          }
        };

        const completeDetection = () => {
          if (!completed) {
            completed = true;
            pc1.close();
            pc2.close();
            
            if (ips.length > 0) {
              resolve(ips);
            } else {
              resolve(['Unable to detect - Browser privacy protection enabled']);
            }
          }
        };

        pc1.onicecandidate = (ice) => handleCandidate(ice, 'Local');
        pc2.onicecandidate = (ice) => handleCandidate(ice, 'STUN');

        // Create data channels and offers
        pc1.createDataChannel('local');
        pc2.createDataChannel('stun');

        Promise.all([
          pc1.createOffer().then(offer => pc1.setLocalDescription(offer)),
          pc2.createOffer().then(offer => pc2.setLocalDescription(offer))
        ]).catch(err => {
          console.error('Error creating offers:', err);
          completeDetection();
        });

        // Shorter timeout since we're being more aggressive
        setTimeout(completeDetection, 3000);

      } catch (error) {
        console.error('WebRTC detection failed:', error);
        resolve(['WebRTC not supported in this browser']);
      }
    });
  };

  const isValidPrivateIP = (ip: string): boolean => {
    const parts = ip.split('.').map(Number);
    if (parts.length !== 4 || parts.some(part => isNaN(part) || part < 0 || part > 255)) {
      return false;
    }

    // Check for private IP ranges
    const [a, b] = parts;
    
    // Exclude loopback and invalid ranges first
    if (a === 0 || a === 127) return false;
    
    return (
      // 192.168.x.x
      (a === 192 && b === 168) ||
      // 10.x.x.x
      (a === 10) ||
      // 172.16.x.x - 172.31.x.x
      (a === 172 && b >= 16 && b <= 31) ||
      // 169.254.x.x (link-local)
      (a === 169 && b === 254)
    );
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
                        <span className={`font-mono font-bold ${ip.startsWith('Unable') || ip.startsWith('Common') ? 'text-gray-500 text-sm' : 'text-orange-600'}`}>
                          {ip}
                        </span>
                        {!ip.startsWith('Unable') && !ip.startsWith('Common') && (
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
                        )}
                      </div>
                      {!ip.startsWith('Unable') && !ip.startsWith('Common') && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(ip, 'Local IP')}
                        >
                          <Copy className="w-4 h-4" />
                        </Button>
                      )}
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