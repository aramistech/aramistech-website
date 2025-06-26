# WHMCS Integration Setup Guide

## Overview

This guide explains how to integrate your AramisTech website with WHMCS billing system using separate hosting.

## Architecture

- **Main Website**: Hosted on Replit (aramistech.com)
- **WHMCS Billing**: Currently on GoDaddy (aramistech.com/abilling)
- **Recommended**: Move to billing.aramistech.com subdomain
- **Integration**: API communication between both systems

## Required Environment Variables

Add these to your Replit Secrets:

```
WHMCS_URL=https://aramistech.com/abilling
WHMCS_API_IDENTIFIER=your_api_identifier
WHMCS_API_SECRET=your_api_secret
WHMCS_WEBHOOK_SECRET=your_webhook_secret
```

**After migration to subdomain:**
```
WHMCS_URL=https://billing.aramistech.com
```

## WHMCS Setup Steps

### 1. WHMCS Installation
1. Install WHMCS on your separate hosting provider
2. Configure your domain: `billing.aramistech.com`
3. Complete WHMCS setup wizard

### 2. API Configuration
1. Login to WHMCS Admin Area
2. Go to **Setup > General Settings > Security**
3. Enable API Access
4. Go to **Setup > Staff Management > Administrator Roles**
5. Create API role with permissions:
   - View Clients
   - View/Search Orders
   - View Invoices
   - View Products/Services

### 3. API Credentials
1. Go to **Setup > Staff Management > Administrator Users**
2. Create new API user or use existing admin
3. Note the username and password for API calls
4. Add to Replit Secrets as `WHMCS_API_IDENTIFIER` and `WHMCS_API_SECRET`

### 4. Webhook Configuration
1. Go to **Setup > General Settings > Other**
2. Add webhook URL: `https://your-replit-domain.replit.app/api/whmcs/webhook`
3. Select events to track:
   - Client Created
   - Invoice Created
   - Invoice Paid
   - Service Created
4. Generate webhook secret and add to Replit Secrets

## Features Implemented

### Customer Portal (`/customer-portal`)
- Email-based customer lookup
- Account information display
- Service management overview
- Invoice history and payment links
- Direct links to WHMCS billing portal

### API Integration
- Secure server-side API proxy
- Customer data retrieval
- Service listings
- Invoice management
- Webhook handlers for real-time updates

### Navigation Integration
- Customer Portal link in main navigation
- Mobile-responsive menu items
- Consistent branding with main site

## Customer Experience

1. **Access Portal**: Customers visit `/customer-portal`
2. **Email Login**: Enter email address to access account
3. **View Services**: See active IT services and status
4. **Manage Billing**: View invoices and payment options
5. **Full Access**: Link to complete WHMCS portal

## Security Features

- Server-side API proxy (credentials never exposed to client)
- Webhook signature validation
- Secure environment variable handling
- Error handling with user-friendly messages

## Testing

1. Configure WHMCS with test data
2. Add customer with email address
3. Test customer portal access
4. Verify service and invoice display
5. Test payment link functionality

## Maintenance

- Monitor webhook logs for successful events
- Regular API credential rotation
- Keep WHMCS updated
- Test portal functionality after WHMCS updates

## Support Integration

- Phone support: (305) 814-4461
- Email support: billing@aramistech.com
- Support ticket system via WHMCS portal

## Next Steps

1. Set up WHMCS on separate hosting
2. Configure API credentials
3. Add environment variables to Replit
4. Test integration with real customer data
5. Train staff on dual-system workflow