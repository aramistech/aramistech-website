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

    // Create default menu items
    const menuItems = [
      { label: 'Home', href: '/', orderIndex: 0, isVisible: true },
      { label: 'Services', href: '#services', orderIndex: 1, isVisible: true },
      { label: 'About', href: '#about', orderIndex: 2, isVisible: true },
      { label: 'Contact', href: '#contact', orderIndex: 3, isVisible: true },
    ];

    for (const item of menuItems) {
      await storage.createMenuItem(item);
    }

    console.log('Default menu items created');
  } catch (error) {
    console.error('Error creating default menu items:', error);
  }
}