// WHMCS Server Configuration
import type { WHMCSConfig } from "../client/src/lib/whmcs-integration";

export const whmcsConfig: WHMCSConfig = {
  baseUrl: process.env.WHMCS_URL || 'https://billing.aramistech.com',
  apiIdentifier: process.env.WHMCS_API_IDENTIFIER || '',
  apiSecret: process.env.WHMCS_API_SECRET || ''
};

// Validate WHMCS configuration
export function validateWHMCSConfig(): boolean {
  return !!(whmcsConfig.baseUrl && whmcsConfig.apiIdentifier && whmcsConfig.apiSecret);
}

// WHMCS webhook signature validation
export function validateWHMCSWebhook(signature: string, data: string): boolean {
  const crypto = require('crypto');
  const secret = process.env.WHMCS_WEBHOOK_SECRET || '';
  
  if (!secret) return false;
  
  const hash = crypto
    .createHmac('sha256', secret)
    .update(data)
    .digest('hex');
    
  return signature === `sha256=${hash}`;
}