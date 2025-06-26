// WHMCS Integration Library
// This handles communication between your main website and WHMCS billing system

export interface WHMCSConfig {
  baseUrl: string; // e.g., 'https://billing.aramistech.com'
  apiIdentifier: string;
  apiSecret: string;
}

export interface WHMCSCustomer {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  companyname?: string;
  address1: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export interface WHMCSService {
  id: number;
  productname: string;
  domain: string;
  status: string;
  nextduedate: string;
  amount: string;
}

export interface WHMCSInvoice {
  id: number;
  invoicenum: string;
  date: string;
  duedate: string;
  total: string;
  status: string;
}

class WHMCSIntegration {
  private config: WHMCSConfig;

  constructor(config: WHMCSConfig) {
    this.config = config;
  }

  private async makeAPICall(endpoint: string, method: 'GET' | 'POST' = 'GET', data?: any) {
    try {
      const url = `/api/whmcs${endpoint}`;
      const options: RequestInit = {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
      };

      if (method === 'POST' && data) {
        options.body = JSON.stringify(data);
      }

      const response = await fetch(url, options);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'API call failed');
      }

      return result;
    } catch (error) {
      console.error('WHMCS API Call Failed:', error);
      throw error;
    }
  }

  // Customer Management
  async getCustomer(email: string): Promise<WHMCSCustomer | null> {
    try {
      const response = await this.makeAPICall(`/customer/${encodeURIComponent(email)}`, 'POST');
      return response.customer;
    } catch (error) {
      return null;
    }
  }

  // Service Management
  async getCustomerServices(clientId: number): Promise<WHMCSService[]> {
    try {
      const response = await this.makeAPICall(`/customer/${clientId}/services`, 'GET');
      return response.services || [];
    } catch (error) {
      return [];
    }
  }

  // Invoice Management
  async getCustomerInvoices(clientId: number): Promise<WHMCSInvoice[]> {
    try {
      const response = await this.makeAPICall(`/customer/${clientId}/invoices`, 'GET');
      return response.invoices || [];
    } catch (error) {
      return [];
    }
  }

  // Generate billing portal link
  generateBillingPortalLink(email?: string): string {
    const baseUrl = `${this.config.baseUrl}/clientarea.php`;
    return email ? `${baseUrl}?email=${encodeURIComponent(email)}` : baseUrl;
  }

  // Generate payment link for specific invoice
  generatePaymentLink(invoiceId: number): string {
    return `${this.config.baseUrl}/viewinvoice.php?id=${invoiceId}`;
  }
}

// Singleton instance
let whmcsInstance: WHMCSIntegration | null = null;

export function initializeWHMCS(config: WHMCSConfig): WHMCSIntegration {
  whmcsInstance = new WHMCSIntegration(config);
  return whmcsInstance;
}

export function getWHMCS(): WHMCSIntegration {
  if (!whmcsInstance) {
    throw new Error('WHMCS not initialized. Call initializeWHMCS first.');
  }
  return whmcsInstance;
}

export default WHMCSIntegration;