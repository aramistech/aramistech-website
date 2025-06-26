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

    console.log('Complete menu structure created');
  } catch (error) {
    console.error('Error creating default menu items:', error);
  }
}