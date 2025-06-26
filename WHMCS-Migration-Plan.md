# WHMCS Migration Plan for AramisTech

## Current Situation
- **WHMCS**: Currently hosted on GoDaddy at `aramistech.com/abilling`
- **New Website**: Being deployed to Replit for `aramistech.com`
- **Goal**: Keep WHMCS on GoDaddy, integrate with new Replit website

## Recommended Migration Strategy

### Option 1: Subdomain Migration (Recommended)
**Move WHMCS to: `billing.aramistech.com`**

**Advantages:**
- Clean separation of billing and main website
- Professional appearance for customers
- Easier SSL certificate management
- Better SEO isolation
- Simpler DNS configuration

**Steps:**
1. Create subdomain `billing.aramistech.com` in GoDaddy DNS
2. Point subdomain to your GoDaddy hosting
3. Move WHMCS from `/abilling` to subdomain root
4. Update WHMCS configuration for new URL
5. Set up SSL certificate for subdomain
6. Update customer communications with new billing URL

### Option 2: Keep Current Path (Alternative)
**Keep WHMCS at: `aramistech.com/abilling`**

**Considerations:**
- Requires careful DNS and hosting configuration
- Main domain points to Replit, but `/abilling` stays on GoDaddy
- More complex setup but preserves existing customer links
- Need to configure domain forwarding rules

## Implementation Plan

### Phase 1: DNS Configuration (Option 1 - Subdomain)

1. **In GoDaddy DNS Manager:**
   ```
   Type: CNAME
   Name: billing
   Value: your-godaddy-hosting-server.com
   TTL: 1 Hour
   ```

2. **Update Main Domain:**
   ```
   Type: A Record
   Name: @
   Value: [Replit IP Address]
   TTL: 1 Hour
   ```

### Phase 2: WHMCS Migration

1. **Backup Current WHMCS:**
   - Download all WHMCS files
   - Export database
   - Save configuration files

2. **Move to Subdomain:**
   - Upload WHMCS to subdomain root directory
   - Update database connection settings
   - Update WHMCS configuration.php with new URL

3. **Update WHMCS Settings:**
   ```php
   // In configuration.php
   $whmcs_url = "https://billing.aramistech.com";
   ```

### Phase 3: Integration Configuration

**Required Environment Variables for Replit:**
```
WHMCS_URL=https://billing.aramistech.com
WHMCS_API_IDENTIFIER=your_api_username
WHMCS_API_SECRET=your_api_password
WHMCS_WEBHOOK_SECRET=generate_new_secret
```

**WHMCS API Setup:**
1. Login to WHMCS Admin
2. Go to Setup > General Settings > Security
3. Enable API Access
4. Create API credentials
5. Set API IP restrictions to include Replit servers

### Phase 4: Customer Communication

**Email Template for Customers:**
```
Subject: Important: New Billing Portal Location

Dear [Customer Name],

We're excited to announce the launch of our new website at aramistech.com! 

Your billing portal has moved to a new, more secure location:
NEW: https://billing.aramistech.com
OLD: https://aramistech.com/abilling (will redirect)

All your account information, invoices, and services remain unchanged. 
You can also access billing through our new customer portal at:
https://aramistech.com/customer-portal

Thank you for your continued business!

AramisTech Team
(305) 814-4461
```

## Technical Considerations

### SSL Certificates
- Main site: Handled by Replit automatically
- Billing subdomain: Configure SSL in GoDaddy cPanel
- Ensure both sites have valid certificates

### DNS Propagation
- Allow 24-48 hours for DNS changes
- Test from multiple locations
- Monitor for any customer access issues

### Backup Strategy
- Keep current WHMCS as backup during transition
- Test all functionality before removing old version
- Have rollback plan ready

## Testing Checklist

- [ ] Subdomain resolves correctly
- [ ] WHMCS loads on new URL
- [ ] Customer login works
- [ ] Payment processing functions
- [ ] API integration with main site works
- [ ] Email notifications use correct URLs
- [ ] Mobile responsiveness maintained

## Timeline

**Day 1-2:** DNS configuration and subdomain setup
**Day 3-4:** WHMCS migration and testing
**Day 5:** API integration testing
**Day 6:** Customer communication and soft launch
**Day 7:** Full deployment and monitoring

## Support During Migration

- Monitor customer support tickets for access issues
- Have temporary direct links ready for urgent customers
- Prepare staff with new URLs and procedures
- Update all marketing materials and documentation

## Post-Migration

1. **Update all references:**
   - Email signatures
   - Business cards
   - Website links
   - Documentation

2. **Monitor for 30 days:**
   - Customer feedback
   - System performance
   - Integration stability

3. **Remove old paths:**
   - After 30 days, remove `/abilling` redirects
   - Clean up old DNS records
   - Update any remaining references