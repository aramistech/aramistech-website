import { storage } from './storage';
import { hashPassword } from './auth';

export async function createDefaultAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await storage.getUserByUsername('admin');
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create default admin user
    const hashedPassword = await hashPassword('admin123');
    const admin = await storage.createUser({
      username: 'admin',
      password: hashedPassword,
    });

    console.log('Default admin user created:', admin.username);
    console.log('Login credentials: admin / admin123');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

export async function setupDefaultMenuItems() {
  try {
    const existingItems = await storage.getMenuItems();
    if (existingItems.length > 0) {
      console.log('Menu items already exist');
      return;
    }

    // Create main menu items first
    const homeItem = await storage.createMenuItem({ label: 'Home', href: '/', orderIndex: 0, isVisible: true });
    const servicesItem = await storage.createMenuItem({ label: 'Services', href: '#services', orderIndex: 1, isVisible: true });
    const aboutItem = await storage.createMenuItem({ label: 'About', href: '#about', orderIndex: 2, isVisible: true });
    const supportItem = await storage.createMenuItem({ label: 'Support', href: undefined, orderIndex: 3, isVisible: true });
    const contactItem = await storage.createMenuItem({ label: 'Contact', href: '#contact', orderIndex: 4, isVisible: true });

    // Create Support sub-menu items
    await storage.createMenuItem({ 
      label: 'Customer Portal', 
      href: '/customer-portal', 
      parentId: supportItem.id, 
      orderIndex: 0, 
      isVisible: true 
    });
    await storage.createMenuItem({ 
      label: 'Windows 10 Upgrade', 
      href: '/windows10-upgrade', 
      parentId: supportItem.id, 
      orderIndex: 1, 
      isVisible: true 
    });
    await storage.createMenuItem({ 
      label: 'IP Lookup', 
      href: '/ip-lookup', 
      parentId: supportItem.id, 
      orderIndex: 2, 
      isVisible: true 
    });
    await storage.createMenuItem({ 
      label: 'Service Calculator', 
      href: '/service-calculator', 
      parentId: supportItem.id, 
      orderIndex: 3, 
      isVisible: true 
    });

    console.log('Complete menu structure created');
  } catch (error) {
    console.error('Error creating default menu items:', error);
  }
}

export async function createDefaultSecurityAlert() {
  try {
    // Check if security alert already exists
    const existingAlert = await storage.getSecurityAlert();
    
    if (existingAlert) {
      console.log('Security alert already exists');
      return;
    }

    await storage.updateSecurityAlert({
      isEnabled: true,
      title: 'Windows 10 Support Ending - Your Systems Will Become Vulnerable to New Threats',
      message: 'Microsoft is ending Windows 10 support on October 14, 2025. After this date, your systems will no longer receive security updates.',
      buttonText: 'Learn More',
      buttonLink: '/windows10-upgrade',
      backgroundColor: '#dc2626',
      textColor: '#ffffff',
      buttonBackgroundColor: '#ffffff',
      buttonTextColor: '#000000',
      iconType: 'AlertTriangle',
      mobileTitle: 'Windows 10 Support Ending',
      mobileSubtitle: 'Critical Security Alert',
      mobileDescription: 'Your Systems Will Become Vulnerable to New Threats. Microsoft is ending Windows 10 support on October 14, 2025. After this date, your systems will no longer receive security updates, leaving them exposed to new cyber threats.',
      mobileButtonText: 'Get Protected Now'
    });
    console.log('Default security alert created');
  } catch (error) {
    console.error('Error creating default security alert:', error);
  }
}