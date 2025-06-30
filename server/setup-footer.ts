import { db } from "./db";
import { footerLinks } from "@shared/schema";

export async function createDefaultFooterLinks() {
  try {
    // Check if footer links already exist
    const existingLinks = await db.select().from(footerLinks).limit(1);
    if (existingLinks.length > 0) {
      console.log('Footer links already exist');
      return;
    }

    const defaultLinks = [
      { section: 'Services', label: 'IT Support & Maintenance', url: '/services', orderIndex: 1, isActive: true, target: '_self' },
      { section: 'Services', label: 'AI Development', url: '/ai-development', orderIndex: 2, isActive: true, target: '_self' },
      { section: 'Services', label: 'Windows 10 Upgrade', url: '/windows-10-upgrade', orderIndex: 3, isActive: true, target: '_self' },
      { section: 'Services', label: 'Service Calculator', url: '/service-calculator', orderIndex: 4, isActive: true, target: '_self' },
      
      { section: 'Support', label: 'Customer Portal', url: '/customer-portal', orderIndex: 1, isActive: true, target: '_self' },
      { section: 'Support', label: 'Knowledge Base', url: '/knowledge-base', orderIndex: 2, isActive: true, target: '_self' },
      { section: 'Support', label: 'IP Lookup Tool', url: '/ip-lookup', orderIndex: 3, isActive: true, target: '_self' },
      
      { section: 'Company', label: 'About Us', url: '/#about', orderIndex: 1, isActive: true, target: '_self' },
      { section: 'Company', label: 'Our Team', url: '/#team', orderIndex: 2, isActive: true, target: '_self' },
      { section: 'Company', label: 'Contact', url: '/#contact', orderIndex: 3, isActive: true, target: '_self' },
      
      { section: 'Resources', label: 'Free Consultation', url: '/#contact', orderIndex: 1, isActive: true, target: '_self' },
      { section: 'Resources', label: 'Quick Quote', url: '/#hero', orderIndex: 2, isActive: true, target: '_self' },
    ];
    
    await db.insert(footerLinks).values(defaultLinks);
    console.log('Default footer links created successfully');
  } catch (error) {
    console.error('Error creating default footer links:', error);
  }
}