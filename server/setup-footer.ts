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
      { section: 'services', label: 'Maintenance Services', url: '/services', orderIndex: 1, isActive: true, target: '_self' },
      { section: 'services', label: 'AI Development', url: '/ai-development', orderIndex: 2, isActive: true, target: '_self' },
      { section: 'services', label: 'Windows 10 Upgrade', url: '/windows-10-upgrade', orderIndex: 3, isActive: true, target: '_self' },
      { section: 'services', label: 'Service Calculator', url: '/service-calculator', orderIndex: 4, isActive: true, target: '_self' },
      { section: 'services', label: 'Knowledge Base', url: '/knowledge-base', orderIndex: 5, isActive: true, target: '_self' },
      { section: 'services', label: 'All IT Services', url: '/#services', orderIndex: 6, isActive: true, target: '_self' },
    ];
    
    await db.insert(footerLinks).values(defaultLinks);
    console.log('Default footer links created successfully');
  } catch (error) {
    console.error('Error creating default footer links:', error);
  }
}