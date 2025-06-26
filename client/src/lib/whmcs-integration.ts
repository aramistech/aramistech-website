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

  private async makeAPICall(action: string, postData: Record<string, any> = {}) {
    const requestData = {
      action,
      username: this.config.apiIdentifier,
      password: this.config.apiSecret,
      responsetype: 'json',
      ...postData
    };

    try {
      const response = await fetch(`${this.config.baseUrl}/includes/api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(requestData).toString()
      });

      if (!response.ok) {
        throw new Error(`WHMCS API Error: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.result === 'error') {
        throw new Error(`WHMCS Error: ${data.message}`);
      }

      return data;
    } catch (error) {
      console.error('WHMCS API Call Failed:', error);
      throw error;
    }
  }

  // Customer Management
  async createCustomer(customerData: Partial<WHMCSCustomer>): Promise<number> {
    const response = await this.makeAPICall('AddClient', customerData);
    return response.clientid;
  }

  async getCustomer(email: string): Promise<WHMCSCustomer | null> {
    try {
      const response = await this.makeAPICall('GetClientsDetails', { email });
      return response.client;
    } catch (error) {
      return null;
    }
  }

  async updateCustomer(clientId: number, customerData: Partial<WHMCSCustomer>): Promise<void> {
    await this.makeAPICall('UpdateClient', { clientid: clientId, ...customerData });
  }

  // Service Management
  async getCustomerServices(clientId: number): Promise<WHMCSService[]> {
    const response = await this.makeAPICall('GetClientsProducts', { clientid: clientId });
    return response.products.product || [];
  }

  // Invoice Management
  async getCustomerInvoices(clientId: number): Promise<WHMCSInvoice[]> {
    const response = await this.makeAPICall('GetInvoices', { userid: clientId });
    return response.invoices.invoice || [];
  }

  async createInvoice(clientId: number, items: Array<{description: string, amount: number}>): Promise<number> {
    const response = await this.makeAPICall('CreateInvoice', { 
      userid: clientId,
      itemdescription: items.map(item => item.description),
      itemamount: items.map(item => item.amount.toString())
    });
    return response.invoiceid;
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