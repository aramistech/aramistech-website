// WHMCS Services Integration
import { whmcsConfig } from './whmcs-config';

export interface WHMCSProduct {
  id: number;
  name: string;
  description: string;
  pricing: {
    monthly?: number;
    quarterly?: number;
    semiannually?: number;
    annually?: number;
    biennially?: number;
    triennially?: number;
  };
  features: string[];
  category: string;
  order_url: string;
  is_featured?: boolean;
}

export interface WHMCSProductGroup {
  id: number;
  name: string;
  description: string;
  products: WHMCSProduct[];
}

export async function getWHMCSProducts(): Promise<WHMCSProductGroup[]> {
  try {
    console.log('Attempting to fetch WHMCS products from:', whmcsConfig.baseUrl);
    console.log('Using API identifier:', whmcsConfig.apiIdentifier ? 'SET' : 'NOT SET');
    console.log('Using API secret:', whmcsConfig.apiSecret ? 'SET' : 'NOT SET');
    
    const postData = new URLSearchParams({
      action: 'GetProducts',
      username: whmcsConfig.apiIdentifier,
      password: whmcsConfig.apiSecret,
      responsetype: 'json'
    });

    const response = await fetch(`${whmcsConfig.baseUrl}/includes/api.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postData
    });

    console.log('WHMCS Response status:', response.status);
    const data = await response.json();
    console.log('WHMCS Response data:', JSON.stringify(data, null, 2));
    
    if (data.result === 'success') {
      console.log('WHMCS API Success - found products:', data.products?.products?.length || 0);
      return formatProductGroups(data.products);
    } else {
      console.error('WHMCS API Error:', data.message || 'Unknown error');
      return [];
    }
  } catch (error) {
    console.error('Failed to fetch WHMCS products:', error);
    return [];
  }
}

export async function getWHMCSProductDetails(productId: number): Promise<WHMCSProduct | null> {
  try {
    const postData = new URLSearchParams({
      action: 'GetProducts',
      username: whmcsConfig.apiIdentifier,
      password: whmcsConfig.apiSecret,
      pid: productId.toString(),
      responsetype: 'json'
    });

    const response = await fetch(`${whmcsConfig.baseUrl}/includes/api.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: postData
    });

    const data = await response.json();
    
    if (data.result === 'success' && data.products?.product) {
      return formatProduct(data.products.product[0] || data.products.product);
    }
    
    return null;
  } catch (error) {
    console.error('Failed to fetch WHMCS product details:', error);
    return null;
  }
}

function formatProductGroups(productsData: any): WHMCSProductGroup[] {
  const groups: WHMCSProductGroup[] = [];
  const productGroups = productsData?.product || [];
  
  if (!Array.isArray(productGroups)) {
    console.log('Products data is not an array:', typeof productGroups);
    return groups;
  }

  // Filter out unwanted services - only keep desired maintenance services
  const allowedServices = [
    'Workstation PC/Mac Maintenance Service',
    'File Server Maintenance Service', 
    'Exchange 365 or Google Workspace Support',
    'Active Directory Server Maintenance Service',
    'Synology NAS Maintenance Service',
    'Hourly Phone Support'
  ];

  const filteredProducts = productGroups.filter((product: any) => 
    allowedServices.includes(product.name)
  );

  console.log('Filtered products from', productGroups.length, 'to', filteredProducts.length);

  // Group products by their group/category
  const groupMap = new Map<string, WHMCSProductGroup>();

  filteredProducts.forEach((product: any) => {
    console.log('Processing filtered product:', product.name, 'GID:', product.gid);
    const groupName = 'Maintenance Services';
    const groupId = 9; // Use GID 9 for maintenance services
    
    if (!groupMap.has(groupName)) {
      groupMap.set(groupName, {
        id: groupId,
        name: groupName,
        description: `Professional ${groupName.toLowerCase()} for your business`,
        products: []
      });
    }
    
    const group = groupMap.get(groupName)!;
    group.products.push(formatProduct(product));
  });
  
  return Array.from(groupMap.values());
}

function formatProduct(product: any): WHMCSProduct {
  const pricing = product.pricing?.USD || {};
  
  return {
    id: parseInt(product.pid || product.id),
    name: product.name || 'Service',
    description: stripHtml(product.description || ''),
    pricing: {
      monthly: parseFloat(pricing.monthly && pricing.monthly !== '-1.00' ? pricing.monthly : 0),
      quarterly: parseFloat(pricing.quarterly && pricing.quarterly !== '-1.00' ? pricing.quarterly : 0),
      semiannually: parseFloat(pricing.semiannually && pricing.semiannually !== '-1.00' ? pricing.semiannually : 0),
      annually: parseFloat(pricing.annually && pricing.annually !== '-1.00' ? pricing.annually : 0),
      biennially: parseFloat(pricing.biennially && pricing.biennially !== '-1.00' ? pricing.biennially : 0),
      triennially: parseFloat(pricing.triennially && pricing.triennially !== '-1.00' ? pricing.triennially : 0)
    },
    features: extractFeatures(product.description || ''),
    category: 'Maintenance Services',
    order_url: product.product_url || `${whmcsConfig.baseUrl}/cart.php?a=add&pid=${product.pid}`,
    is_featured: product.pid === 35 || product.pid === 37 // Highlight main maintenance services
  };
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function extractFeatures(description: string): string[] {
  const features: string[] = [];
  
  // Extract features from common patterns
  const patterns = [
    /<li[^>]*>(.*?)<\/li>/gi,
    /• (.*?)(?:\n|$)/gi,
    /- (.*?)(?:\n|$)/gi,
    /✓ (.*?)(?:\n|$)/gi
  ];
  
  patterns.forEach(pattern => {
    let match;
    while ((match = pattern.exec(description)) !== null) {
      const feature = stripHtml(match[1]).trim();
      if (feature && !features.includes(feature)) {
        features.push(feature);
      }
    }
  });
  
  // If no features found, extract from sentences
  if (features.length === 0) {
    const sentences = stripHtml(description).split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
    features.push(...sentences.slice(0, 3));
  }
  
  return features.slice(0, 6); // Limit to 6 features
}

// Predefined maintenance services structure for AramisTech
export const aramisTechMaintenanceServices: WHMCSProductGroup[] = [
  {
    id: 1,
    name: "Maintenance Services",
    description: "Comprehensive IT maintenance and support services to keep your business running smoothly",
    products: [
      {
        id: 1,
        name: "Basic IT Maintenance",
        description: "Essential IT maintenance services for small businesses including system monitoring, basic troubleshooting, and software updates.",
        pricing: {
          monthly: 99.00,
          quarterly: 279.00,
          annually: 990.00
        },
        features: [
          "24/7 System Monitoring",
          "Basic Troubleshooting Support",
          "Software Updates & Patches",
          "Monthly Performance Reports",
          "Email Support",
          "Remote Desktop Assistance"
        ],
        category: "Maintenance Services",
        order_url: "/checkout",
        is_featured: false
      },
      {
        id: 2,
        name: "Professional IT Maintenance",
        description: "Comprehensive IT maintenance package with priority support, advanced monitoring, and proactive system optimization.",
        pricing: {
          monthly: 199.00,
          quarterly: 549.00,
          annually: 1990.00
        },
        features: [
          "24/7 Advanced System Monitoring",
          "Priority Technical Support",
          "Proactive System Optimization",
          "Security Patch Management",
          "Weekly Performance Reports",
          "Phone & Email Support",
          "Remote & On-site Assistance",
          "Backup Monitoring"
        ],
        category: "Maintenance Services",
        order_url: "/checkout",
        is_featured: true
      },
      {
        id: 3,
        name: "Enterprise IT Maintenance",
        description: "Complete enterprise-grade IT maintenance solution with dedicated support, comprehensive monitoring, and business continuity planning.",
        pricing: {
          monthly: 399.00,
          quarterly: 1099.00,
          annually: 3990.00
        },
        features: [
          "Enterprise-Grade 24/7 Monitoring",
          "Dedicated Support Representative",
          "Business Continuity Planning",
          "Advanced Security Management",
          "Daily System Health Reports",
          "Unlimited Support Tickets",
          "On-site Support Included",
          "Disaster Recovery Planning",
          "Network Infrastructure Management",
          "Compliance Monitoring"
        ],
        category: "Maintenance Services",
        order_url: "/checkout",
        is_featured: true
      }
    ]
  }
];