import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { insertContactSchema, insertQuickQuoteSchema, insertAIConsultationSchema, insertITConsultationSchema, insertReviewSchema, insertUserSchema, updateUserSchema, insertMenuItemSchema, insertExitIntentPopupSchema, insertMediaFileSchema, insertKnowledgeBaseCategorySchema, insertKnowledgeBaseArticleSchema, insertSecurityAlertSchema, insertColorPaletteSchema, insertPricingCalculationSchema, insertServiceCategorySchema, insertServiceOptionSchema, insertStaticServiceSchema, insertFooterLinkSchema, insertCountryBlockingSchema, footerLinks, reviews, contacts, quickQuotes } from "@shared/schema";
import { db } from "./db";
import { eq, asc, gte, sql } from "drizzle-orm";
import multer from "multer";
import path from "path";
import fs from "fs";
import { glob } from "glob";
import { hashPassword, verifyPassword, createAdminSession, requireAdminAuth } from "./auth";
import { TwoFactorAuthService } from './two-factor-auth';
import crypto from 'crypto';
import { z } from "zod";
import { whmcsConfig, validateWHMCSConfig, validateWHMCSWebhook } from "./whmcs-config";
import { sendQuickQuoteEmail, sendContactEmail, sendAIConsultationEmail, sendITConsultationEmail, sendTechnicianTransferNotification, sendServiceCalculatorEmail } from "./email-service";
import { testAWSConnection } from "./test-aws";
import { aramisTechMaintenanceServices, getWHMCSProducts, getWHMCSProductDetails } from "./whmcs-services";
import { processAuthorizeNetPayment, validateCreditCard } from "./authorize-net";

// Configure multer for file uploads
const uploadDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage_multer = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage: storage_multer,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow only image files
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  }
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Add cookie parser middleware
  app.use(cookieParser());
  
  // Serve uploaded files statically
  app.use('/uploads', express.static(uploadDir));
  
  // Serve client public files (including Windows 10 background)
  const clientPublicDir = path.join(process.cwd(), 'client/public');
  app.use(express.static(clientPublicDir));

  // Admin authentication routes
  app.post("/api/admin/login", async (req, res) => {
    try {
      const { username, password, twoFactorCode } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if user has 2FA enabled
      if (user.twoFactorEnabled) {
        if (!twoFactorCode) {
          return res.json({
            success: false,
            requires2FA: true,
            message: 'Two-factor authentication required'
          });
        }

        // Verify 2FA code
        const codeFormat = TwoFactorAuthService.isValidCodeFormat(twoFactorCode);
        let isValid2FA = false;

        if (codeFormat.isTotp && user.twoFactorSecret) {
          // Verify TOTP code
          isValid2FA = TwoFactorAuthService.verifyToken(twoFactorCode, user.twoFactorSecret);
        } else if (codeFormat.isBackup && user.backupCodes) {
          // Verify backup code
          isValid2FA = TwoFactorAuthService.verifyBackupCode(twoFactorCode, user.backupCodes);
          
          if (isValid2FA) {
            // Remove used backup code
            const updatedBackupCodes = TwoFactorAuthService.removeBackupCode(twoFactorCode, user.backupCodes);
            await storage.updateBackupCodes(user.id, updatedBackupCodes);
          }
        }

        if (!isValid2FA) {
          return res.status(401).json({ error: 'Invalid two-factor authentication code' });
        }
      }

      const sessionId = await createAdminSession(user.id);
      
      res.cookie('admin_session', sessionId, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
      });

      res.json({ 
        success: true, 
        user: { 
          id: user.id, 
          username: user.username,
          twoFactorEnabled: user.twoFactorEnabled
        } 
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ error: "Login failed" });
    }
  });

  app.post("/api/admin/logout", requireAdminAuth, async (req, res) => {
    try {
      const sessionId = req.cookies?.admin_session;
      if (sessionId) {
        await storage.deleteAdminSession(sessionId);
      }
      res.clearCookie('admin_session');
      res.json({ success: true });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ error: "Logout failed" });
    }
  });

  app.get("/api/admin/me", requireAdminAuth, async (req, res) => {
    const user = (req as any).adminUser;
    res.json({ user: { id: user.id, username: user.username } });
  });

  // Admin menu management routes
  app.get("/api/admin/menu-items", requireAdminAuth, async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      res.json({ success: true, menuItems });
    } catch (error) {
      console.error("Get menu items error:", error);
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  app.post("/api/admin/menu-items", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertMenuItemSchema.parse(req.body);
      const menuItem = await storage.createMenuItem(validatedData);
      res.json({ success: true, menuItem });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Create menu item error:", error);
      res.status(500).json({ error: "Failed to create menu item" });
    }
  });

  // Reorder menu items - MUST be before the /:id route
  app.put("/api/admin/menu-items/reorder", requireAdminAuth, async (req, res) => {
    try {
      const { updates } = req.body;
      
      if (!Array.isArray(updates)) {
        return res.status(400).json({ error: "Updates must be an array" });
      }

      for (const update of updates) {
        // Validate the update data to prevent NaN values
        const id = parseInt(update.id);
        const orderIndex = parseInt(update.orderIndex);
        
        if (isNaN(id) || isNaN(orderIndex)) {
          console.error("Invalid data in reorder:", update);
          continue; // Skip invalid entries
        }
        
        await storage.updateMenuItem(id, { orderIndex });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Reorder menu items error:", error);
      res.status(500).json({ error: "Failed to reorder menu items" });
    }
  });

  app.put("/api/admin/menu-items/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      // Clean the request data before validation
      const cleanedBody = { ...req.body };
      
      // Handle parentId specially to prevent NaN
      if (cleanedBody.parentId !== undefined) {
        const parentIdValue = cleanedBody.parentId;
        if (parentIdValue === null || parentIdValue === "" || parentIdValue === "null" || isNaN(parentIdValue)) {
          cleanedBody.parentId = null;
        } else {
          cleanedBody.parentId = parseInt(parentIdValue);
        }
      }
      
      // Handle orderIndex
      if (cleanedBody.orderIndex !== undefined && isNaN(cleanedBody.orderIndex)) {
        cleanedBody.orderIndex = 0;
      }
      
      // Remove any fields with NaN values
      Object.keys(cleanedBody).forEach(key => {
        if (typeof cleanedBody[key] === 'number' && isNaN(cleanedBody[key])) {
          console.log(`Removing NaN field: ${key}`);
          delete cleanedBody[key];
        }
      });
      
      const validatedData = insertMenuItemSchema.partial().parse(cleanedBody);
      const menuItem = await storage.updateMenuItem(id, validatedData);
      res.json({ success: true, menuItem });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Update menu item error:", error);
      res.status(500).json({ error: "Failed to update menu item" });
    }
  });

  app.delete("/api/admin/menu-items/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteMenuItem(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete menu item error:", error);
      res.status(500).json({ error: "Failed to delete menu item" });
    }
  });

  // Reset menu items to default structure
  app.post("/api/admin/menu-items/reset", requireAdminAuth, async (req, res) => {
    try {
      // Delete all existing menu items
      const existingItems = await storage.getMenuItems();
      for (const item of existingItems) {
        await storage.deleteMenuItem(item.id);
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

      res.json({ success: true, message: "Menu items reset to default structure" });
    } catch (error) {
      console.error("Reset menu items error:", error);
      res.status(500).json({ error: "Failed to reset menu items" });
    }
  });

  // Exit intent popup routes
  app.get("/api/exit-intent-popup", async (req, res) => {
    try {
      const popup = await storage.getExitIntentPopup();
      res.json({ success: true, popup });
    } catch (error) {
      console.error("Error fetching exit intent popup:", error);
      res.status(500).json({ error: "Failed to fetch exit intent popup" });
    }
  });

  app.put("/api/admin/exit-intent-popup", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertExitIntentPopupSchema.parse(req.body);
      const popup = await storage.updateExitIntentPopup(validatedData);
      res.json({ success: true, popup });
    } catch (error) {
      console.error("Error updating exit intent popup:", error);
      res.status(500).json({ error: "Failed to update exit intent popup" });
    }
  });

  // Security alerts management routes
  app.get('/api/security-alert', async (req, res) => {
    try {
      const alert = await storage.getSecurityAlert();
      res.json({ success: true, alert });
    } catch (error) {
      console.error("Error fetching security alert:", error);
      res.status(500).json({ success: false, message: "Failed to fetch security alert" });
    }
  });

  app.put('/api/admin/security-alert', requireAdminAuth, async (req, res) => {
    try {
      // Manually filter out problematic timestamp fields and validate
      const allowedFields = {
        isEnabled: req.body.isEnabled,
        isDesktopEnabled: req.body.isDesktopEnabled,
        isMobileEnabled: req.body.isMobileEnabled,
        
        // Desktop fields
        desktopTitle: req.body.desktopTitle,
        desktopMessage: req.body.desktopMessage,
        desktopButtonText: req.body.desktopButtonText,
        desktopButtonLink: req.body.desktopButtonLink,
        desktopBackgroundColor: req.body.desktopBackgroundColor,
        desktopTextColor: req.body.desktopTextColor,
        desktopButtonBackgroundColor: req.body.desktopButtonBackgroundColor,
        desktopButtonTextColor: req.body.desktopButtonTextColor,
        desktopIconType: req.body.desktopIconType,
        
        // Mobile fields
        mobileTitle: req.body.mobileTitle,
        mobileSubtitle: req.body.mobileSubtitle,
        mobileDescription: req.body.mobileDescription,
        mobileButtonText: req.body.mobileButtonText,
        mobileButtonLink: req.body.mobileButtonLink,
        mobileBackgroundColor: req.body.mobileBackgroundColor,
        mobileTextColor: req.body.mobileTextColor,
        mobileButtonBackgroundColor: req.body.mobileButtonBackgroundColor,
        mobileButtonTextColor: req.body.mobileButtonTextColor,
        mobileIconType: req.body.mobileIconType,
        
        // Legacy fields (for backward compatibility)
        title: req.body.title,
        message: req.body.message,
        buttonText: req.body.buttonText,
        buttonLink: req.body.buttonLink,
        backgroundColor: req.body.backgroundColor,
        textColor: req.body.textColor,
        buttonBackgroundColor: req.body.buttonBackgroundColor,
        buttonTextColor: req.body.buttonTextColor,
        iconType: req.body.iconType,
      };
      
      // Remove undefined fields
      const cleanData = Object.fromEntries(
        Object.entries(allowedFields).filter(([_, value]) => value !== undefined)
      );
      
      console.log("Clean security alert data:", cleanData);
      const alert = await storage.updateSecurityAlert(cleanData);
      res.json({ success: true, alert });
    } catch (error) {
      console.error("Error updating security alert:", error);
      res.status(500).json({ success: false, message: "Failed to update security alert" });
    }
  });

  // Color Palette API endpoints
  app.get('/api/admin/color-palette', requireAdminAuth, async (req, res) => {
    try {
      const colors = await storage.getColorPalette();
      res.json({ success: true, colors });
    } catch (error) {
      console.error("Error fetching color palette:", error);
      res.status(500).json({ success: false, error: "Failed to fetch color palette" });
    }
  });

  app.post('/api/admin/color-palette', requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertColorPaletteSchema.parse(req.body);
      const color = await storage.createColorPaletteItem(validatedData);
      res.json({ success: true, color });
    } catch (error) {
      console.error("Error creating color palette item:", error);
      res.status(500).json({ success: false, error: "Failed to create color palette item" });
    }
  });

  app.put('/api/admin/color-palette/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const color = await storage.updateColorPaletteItem(id, req.body);
      res.json({ success: true, color });
    } catch (error) {
      console.error("Error updating color palette item:", error);
      res.status(500).json({ success: false, error: "Failed to update color palette item" });
    }
  });

  app.delete('/api/admin/color-palette/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteColorPaletteItem(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting color palette item:", error);
      res.status(500).json({ success: false, error: "Failed to delete color palette item" });
    }
  });

  // Auto-detect images endpoint
  app.get("/api/admin/auto-detect-images", requireAdminAuth, (req, res) => {
    try {
      // Function to automatically scan all files for images
      const scanForImages = () => {
        const detectedImages: any[] = [];
        const searchPatterns = [
          'client/src/components/*.tsx',
          'client/src/pages/*.tsx',
          'client/src/*.tsx'
        ];

        searchPatterns.forEach(pattern => {
          const files = glob.sync(pattern);
          
          files.forEach(filePath => {
            try {
              const content = fs.readFileSync(filePath, 'utf-8');
              const lines = content.split('\n');
              
              lines.forEach((line, index) => {
                // Look for src= attributes
                const srcMatches = line.match(/src=["']([^"']+)["']/g);
                if (srcMatches) {
                  srcMatches.forEach(match => {
                    const urlMatch = match.match(/src=["']([^"']+)["']/);
                    if (urlMatch && urlMatch[1]) {
                      const url = urlMatch[1];
                      // Filter out placeholder URLs and only include valid image URLs
                      if (url && 
                          !url.includes('YOUR_IMAGE_ID') && 
                          !url.includes('placeholder') && 
                          !url.includes('example') &&
                          !url.includes('REPLACE_WITH') &&
                          (url.includes('/api/media/') || 
                           url.includes('images.unsplash.com') || 
                           url.includes('aramistech.com') || 
                           url.includes('.png') || 
                           url.includes('.jpg') || 
                           url.includes('.svg') || 
                           url.includes('.jpeg') ||
                           url.startsWith('/') && (url.includes('.png') || url.includes('.jpg') || url.includes('.svg')))) {
                        
                        // Generate ID from file path and line number
                        const fileName = path.basename(filePath, '.tsx');
                        const id = `${fileName}-line-${index + 1}`;
                        
                        // Categorize images intelligently
                        let category = "Other Images";
                        if (url.includes('/api/media/')) category = "Media Library";
                        else if (filePath.includes('team') || url.includes('profile') || url.includes('Figueroa')) category = "Team Photos";
                        else if (filePath.includes('header') || filePath.includes('footer') || filePath.includes('logo') || url.includes('Logo')) category = "Company Branding";
                        else if (filePath.includes('hero') || filePath.includes('about') || filePath.includes('contact')) category = "Section Images";
                        else if (filePath.includes('pages/')) category = "Page Backgrounds";
                        
                        // Generate smart description
                        let description = `Image in ${fileName} component`;
                        if (url.includes('Logo')) description = `Logo in ${fileName} component`;
                        else if (url.includes('profile')) description = `Profile photo in ${fileName} component`;
                        else if (filePath.includes('windows10')) description = `Windows 10 related image in ${fileName} page`;
                        
                        detectedImages.push({
                          id,
                          label: `${fileName.charAt(0).toUpperCase() + fileName.slice(1)} Image`,
                          description,
                          currentUrl: url,
                          filePath,
                          lineNumber: index + 1,
                          category
                        });
                      }
                    }
                  });
                }
                
                // Look for backgroundImage styles
                const bgMatches = line.match(/backgroundImage:\s*["']?url\(["']?([^"')]+)["']?\)["']?/g);
                if (bgMatches) {
                  bgMatches.forEach(match => {
                    const urlMatch = match.match(/url\(["']?([^"')]+)["']?\)/);
                    if (urlMatch && urlMatch[1]) {
                      const url = urlMatch[1];
                      
                      // Filter out placeholder URLs for background images too
                      if (url && 
                          !url.includes('YOUR_IMAGE_ID') && 
                          !url.includes('placeholder') && 
                          !url.includes('example') &&
                          !url.includes('REPLACE_WITH')) {
                        
                        const fileName = path.basename(filePath, '.tsx');
                        const id = `${fileName}-bg-line-${index + 1}`;
                        
                        detectedImages.push({
                          id,
                          label: `${fileName.charAt(0).toUpperCase() + fileName.slice(1)} Background`,
                          description: `Background image in ${fileName} component`,
                          currentUrl: url,
                          filePath,
                          lineNumber: index + 1,
                          category: "Page Backgrounds"
                        });
                      }
                    }
                  });
                }
                
                // Look for poster= attributes (video posters)
                const posterMatches = line.match(/poster=["']([^"']+)["']/g);
                if (posterMatches) {
                  posterMatches.forEach(match => {
                    const urlMatch = match.match(/poster=["']([^"']+)["']/);
                    if (urlMatch && urlMatch[1]) {
                      const url = urlMatch[1];
                      
                      // Filter out placeholder URLs for poster images too
                      if (url && 
                          !url.includes('YOUR_IMAGE_ID') && 
                          !url.includes('placeholder') && 
                          !url.includes('example') &&
                          !url.includes('REPLACE_WITH')) {
                        
                        const fileName = path.basename(filePath, '.tsx');
                        const id = `${fileName}-poster-line-${index + 1}`;
                        
                        detectedImages.push({
                          id,
                          label: `${fileName.charAt(0).toUpperCase() + fileName.slice(1)} Video Poster`,
                          description: `Video poster image in ${fileName} component`,
                          currentUrl: url,
                          filePath,
                          lineNumber: index + 1,
                          category: "Video & Media"
                        });
                      }
                    }
                  });
                }
              });
            } catch (error) {
              console.error(`Error scanning file ${filePath}:`, error);
            }
          });
        });

        // Remove duplicates and sort by category
        const uniqueImages = detectedImages.filter((image, index, self) => 
          index === self.findIndex(t => t.currentUrl === image.currentUrl && t.filePath === image.filePath)
        );

        return uniqueImages.sort((a, b) => {
          if (a.category !== b.category) {
            return a.category.localeCompare(b.category);
          }
          return a.label.localeCompare(b.label);
        });
      };

      // Use dynamic image scanning instead of hardcoded list
      const detectedImages = scanForImages();
      
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.json({ 
        success: true, 
        images: detectedImages,
        totalFound: detectedImages.length,
        timestamp: Date.now()
      });
      
    } catch (error: any) {
      console.error("Auto-detect images error:", error);
      res.status(500).json({ 
        error: "Failed to auto-detect images", 
        details: error?.message || "Unknown error"
      });
    }
  });

  // Service Calculator API endpoints
  app.post('/api/service-calculator/submit', async (req, res) => {
    try {
      const validatedData = insertPricingCalculationSchema.parse(req.body);
      const calculation = await storage.createPricingCalculation(validatedData);
      
      // Send email notification (integrate with existing email service)
      try {
        await sendServiceCalculatorEmail({
          customerName: validatedData.customerName || '',
          customerEmail: validatedData.customerEmail || '',
          customerPhone: validatedData.customerPhone || '',
          companyName: validatedData.companyName || '',
          totalEstimate: validatedData.totalEstimate || '0',
          selectedServices: Array.isArray(validatedData.selectedServices) ? validatedData.selectedServices : [],
          projectDescription: validatedData.projectDescription || '',
          urgencyLevel: validatedData.urgencyLevel || 'normal',
        });
      } catch (emailError) {
        console.error("Email sending failed:", emailError);
        // Continue even if email fails
      }

      res.json({ success: true, calculation });
    } catch (error) {
      console.error("Error submitting service calculation:", error);
      res.status(500).json({ success: false, error: "Failed to submit calculation" });
    }
  });

  app.get('/api/admin/service-calculations', requireAdminAuth, async (req, res) => {
    try {
      const calculations = await storage.getPricingCalculations();
      res.json({ success: true, calculations });
    } catch (error) {
      console.error("Error fetching service calculations:", error);
      res.status(500).json({ success: false, error: "Failed to fetch calculations" });
    }
  });

  // Service Categories Management
  app.get('/api/admin/service-categories', requireAdminAuth, async (req, res) => {
    try {
      const categories = await storage.getServiceCategories();
      res.json({ success: true, categories });
    } catch (error) {
      console.error("Error fetching service categories:", error);
      res.status(500).json({ success: false, error: "Failed to fetch categories" });
    }
  });

  app.post('/api/admin/service-categories', requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertServiceCategorySchema.parse(req.body);
      const category = await storage.createServiceCategory(validatedData);
      res.json({ success: true, category });
    } catch (error) {
      console.error("Error creating service category:", error);
      res.status(500).json({ success: false, error: "Failed to create category" });
    }
  });

  app.put('/api/admin/service-categories/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertServiceCategorySchema.partial().parse(req.body);
      const category = await storage.updateServiceCategory(id, validatedData);
      res.json({ success: true, category });
    } catch (error) {
      console.error("Error updating service category:", error);
      res.status(500).json({ success: false, error: "Failed to update category" });
    }
  });

  app.delete('/api/admin/service-categories/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServiceCategory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service category:", error);
      res.status(500).json({ success: false, error: "Failed to delete category" });
    }
  });

  // Service Options Management
  app.get('/api/admin/service-options', requireAdminAuth, async (req, res) => {
    try {
      const options = await storage.getServiceOptions();
      res.json({ success: true, options });
    } catch (error) {
      console.error("Error fetching service options:", error);
      res.status(500).json({ success: false, error: "Failed to fetch options" });
    }
  });

  app.post('/api/admin/service-options', requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertServiceOptionSchema.parse(req.body);
      const option = await storage.createServiceOption(validatedData);
      res.json({ success: true, option });
    } catch (error) {
      console.error("Error creating service option:", error);
      res.status(500).json({ success: false, error: "Failed to create option" });
    }
  });

  app.put('/api/admin/service-options/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertServiceOptionSchema.partial().parse(req.body);
      const option = await storage.updateServiceOption(id, validatedData);
      res.json({ success: true, option });
    } catch (error) {
      console.error("Error updating service option:", error);
      res.status(500).json({ success: false, error: "Failed to update option" });
    }
  });

  app.delete('/api/admin/service-options/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteServiceOption(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting service option:", error);
      res.status(500).json({ success: false, error: "Failed to delete option" });
    }
  });

  // Media management routes
  app.post("/api/admin/media/upload", requireAdminAuth, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const mediaData = {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: req.file.path,
        url: `/api/media/{id}/file`, // Will be updated with actual ID after insertion
        altText: req.body.altText || '',
        caption: req.body.caption || '',
      };

      const validatedData = insertMediaFileSchema.parse(mediaData);
      const file = await storage.uploadMediaFile(validatedData);
      
      // Update the URL with the actual file ID
      const updatedFile = await storage.updateMediaFile(file.id, {
        url: `/api/media/${file.id}/file`
      });
      
      res.json({ success: true, file: updatedFile || file });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.get("/api/admin/media", requireAdminAuth, async (req, res) => {
    try {
      const files = await storage.getMediaFiles();
      
      // Check for missing files and mark them
      const filesWithStatus = files.map(file => ({
        ...file,
        fileExists: fs.existsSync(file.filePath)
      }));
      
      res.json({ success: true, files: filesWithStatus });
    } catch (error) {
      console.error("Error fetching media files:", error);
      res.status(500).json({ error: "Failed to fetch media files" });
    }
  });

  // Public route for serving media files (for frontend use)
  app.get("/api/media/:id/file", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getMediaFileById(id);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      // Check if file exists on filesystem
      if (!fs.existsSync(file.filePath)) {
        console.warn(`File missing from disk: ${file.filePath} (ID: ${id})`);
        return res.status(404).json({ 
          error: "File not found on disk",
          fileId: id,
          fileName: file.originalName,
          message: "File was uploaded but has been removed from storage. This can happen on Replit due to container restarts or deployments."
        });
      }

      // Set appropriate content type
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      // Send the file
      res.sendFile(path.resolve(file.filePath));
    } catch (error) {
      console.error("Error serving media file:", error);
      res.status(500).json({ error: "Failed to serve file" });
    }
  });

  // Admin-only route for serving media files (for dashboard use)
  app.get("/api/admin/media/:id/file", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getMediaFileById(id);
      
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }

      // Check if file exists on filesystem
      if (!fs.existsSync(file.filePath)) {
        return res.status(404).json({ error: "File not found on disk" });
      }

      // Set appropriate content type
      res.setHeader('Content-Type', file.mimeType);
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      
      // Send the file
      res.sendFile(path.resolve(file.filePath));
    } catch (error) {
      console.error("Error serving media file:", error);
      res.status(500).json({ error: "Failed to serve file" });
    }
  });

  app.put("/api/admin/media/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { altText, caption } = req.body;
      const file = await storage.updateMediaFile(id, { altText, caption });
      res.json({ success: true, file });
    } catch (error) {
      console.error("Error updating media file:", error);
      res.status(500).json({ error: "Failed to update media file" });
    }
  });

  app.delete("/api/admin/media/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const file = await storage.getMediaFileById(id);
      
      if (file) {
        // Delete file from filesystem
        if (fs.existsSync(file.filePath)) {
          fs.unlinkSync(file.filePath);
        }
        
        // Delete record from database
        await storage.deleteMediaFile(id);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting media file:", error);
      res.status(500).json({ error: "Failed to delete media file" });
    }
  });

  app.post("/api/admin/media/import-url", requireAdminAuth, async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Validate URL format
      let imageUrl;
      try {
        imageUrl = new URL(url);
      } catch (error) {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      // Download image from URL
      const response = await fetch(imageUrl.toString());
      
      if (!response.ok) {
        return res.status(400).json({ error: "Failed to download image from URL" });
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        return res.status(400).json({ error: "URL does not point to an image" });
      }

      // Generate filename
      const urlPath = imageUrl.pathname;
      const originalName = path.basename(urlPath) || 'imported-image';
      const ext = path.extname(originalName) || '.jpg';
      const baseName = path.basename(originalName, ext);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = `imported-${baseName}-${uniqueSuffix}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      // Save image to filesystem
      const buffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      fs.writeFileSync(filePath, uint8Array);

      // Get file stats
      const stats = fs.statSync(filePath);
      const fileUrl = `/uploads/${fileName}`;

      const mediaData = {
        fileName: fileName,
        originalName: originalName,
        mimeType: contentType,
        fileSize: stats.size,
        filePath: filePath,
        url: fileUrl,
        altText: '',
        caption: '',
      };

      const validatedData = insertMediaFileSchema.parse(mediaData);
      const file = await storage.uploadMediaFile(validatedData);
      
      res.json({ success: true, file });
    } catch (error) {
      console.error("Error importing image from URL:", error);
      res.status(500).json({ error: "Failed to import image from URL" });
    }
  });

  // Direct file serving (for backward compatibility)
  app.get("/uploads/:filename", (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, "../uploads", filename);
    
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: "File not found" });
    }
    
    res.sendFile(path.resolve(filePath));
  });

  // Website scanning endpoint
  // Cleanup missing files endpoint
  app.post("/api/admin/media/cleanup", requireAdminAuth, async (req, res) => {
    try {
      const files = await storage.getMediaFiles();
      const missingFiles = [];
      const validFiles = [];
      
      for (const file of files) {
        if (!fs.existsSync(file.filePath)) {
          missingFiles.push(file);
          // Remove from database
          await storage.deleteMediaFile(file.id);
        } else {
          validFiles.push(file);
        }
      }
      
      res.json({ 
        success: true, 
        message: `Cleanup completed. Removed ${missingFiles.length} missing files.`,
        missingFiles: missingFiles.length,
        validFiles: validFiles.length,
        removedFiles: missingFiles.map(f => ({ id: f.id, name: f.originalName }))
      });
    } catch (error) {
      console.error("Error during cleanup:", error);
      res.status(500).json({ error: "Failed to cleanup missing files" });
    }
  });

  app.post("/api/admin/media/scan-website", requireAdminAuth, async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Validate URL format
      let websiteUrl;
      try {
        websiteUrl = new URL(url);
      } catch (error) {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      // Fetch the webpage
      const response = await fetch(websiteUrl.toString());
      if (!response.ok) {
        return res.status(400).json({ error: "Failed to fetch webpage" });
      }

      const html = await response.text();
      const baseUrl = websiteUrl.origin;
      
      // Extract image URLs from HTML using regex
      const imageUrls = new Set<string>();
      
      // Find img tags
      const imgRegex = /<img[^>]+src=["']([^"']+)["'][^>]*>/gi;
      let match;
      while ((match = imgRegex.exec(html)) !== null) {
        let imageUrl = match[1];
        
        // Convert relative URLs to absolute URLs
        if (imageUrl.startsWith('/')) {
          imageUrl = baseUrl + imageUrl;
        } else if (!imageUrl.startsWith('http')) {
          imageUrl = new URL(imageUrl, websiteUrl.toString()).href;
        }
        
        // Filter for actual image URLs
        if (imageUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
          imageUrls.add(imageUrl);
        }
      }

      // Find CSS background images
      const cssImageRegex = /background(?:-image)?:\s*url\(['"]?([^'")\s]+)['"]?\)/gi;
      while ((match = cssImageRegex.exec(html)) !== null) {
        let imageUrl = match[1];
        
        if (imageUrl.startsWith('/')) {
          imageUrl = baseUrl + imageUrl;
        } else if (!imageUrl.startsWith('http')) {
          imageUrl = new URL(imageUrl, websiteUrl.toString()).href;
        }
        
        if (imageUrl.match(/\.(jpg|jpeg|png|gif|webp)(\?.*)?$/i)) {
          imageUrls.add(imageUrl);
        }
      }

      const importedFiles = [];
      let importedCount = 0;

      // Import each image (limit to 15 to prevent abuse)
      const urlArray = Array.from(imageUrls).slice(0, 15);
      
      for (const imageUrl of urlArray) {
        try {
          const imageResponse = await fetch(imageUrl);
          if (!imageResponse.ok) continue;

          const contentType = imageResponse.headers.get('content-type');
          if (!contentType || !contentType.startsWith('image/')) continue;

          const buffer = await imageResponse.arrayBuffer();
          const uint8Array = new Uint8Array(buffer);

          // Skip very small images (likely icons/placeholders)
          if (uint8Array.length < 2048) continue;

          // Generate filename
          const urlPath = new URL(imageUrl).pathname;
          const originalName = path.basename(urlPath) || `scanned-image-${importedCount + 1}`;
          const ext = path.extname(originalName) || '.jpg';
          const baseName = path.basename(originalName, ext);
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          const fileName = `scanned-${baseName}-${uniqueSuffix}${ext}`;
          const filePath = path.join(uploadDir, fileName);

          // Save the file
          fs.writeFileSync(filePath, uint8Array);

          // Get file stats
          const stats = fs.statSync(filePath);
          const fileUrl = `/uploads/${fileName}`;

          const mediaData = {
            fileName: fileName,
            originalName: `${originalName} (from ${websiteUrl.hostname})`,
            mimeType: contentType,
            fileSize: stats.size,
            filePath: filePath,
            url: fileUrl,
            altText: '',
            caption: '',
          };

          const validatedData = insertMediaFileSchema.parse(mediaData);
          const file = await storage.uploadMediaFile(validatedData);
          
          importedFiles.push(file);
          importedCount++;
        } catch (error) {
          console.error('Error importing image:', imageUrl, error);
          // Continue with next image
        }
      }

      res.json({ 
        success: true, 
        importedCount,
        files: importedFiles,
        totalFound: imageUrls.size
      });
    } catch (error: any) {
      console.error("Error scanning website:", error);
      console.error("Error details:", error?.message, error?.stack);
      res.status(500).json({ 
        error: "Failed to scan website for images", 
        details: error?.message || "Unknown error"
      });
    }
  });

  // Download image from URL endpoint
  app.post("/api/download-image", async (req, res) => {
    try {
      const { url } = req.body;
      
      if (!url) {
        return res.status(400).json({ error: "URL is required" });
      }

      // Validate URL format
      let imageUrl;
      try {
        imageUrl = new URL(url);
      } catch (error) {
        return res.status(400).json({ error: "Invalid URL format" });
      }

      // Download image from URL
      const response = await fetch(imageUrl.toString());
      
      if (!response.ok) {
        return res.status(400).json({ error: "Failed to download image from URL" });
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        return res.status(400).json({ error: "URL does not point to an image" });
      }

      // Generate filename
      const urlPath = imageUrl.pathname;
      const originalName = path.basename(urlPath) || 'unsplash-image';
      const ext = path.extname(originalName) || '.jpg';
      const baseName = path.basename(originalName, ext);
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const fileName = `downloaded-${baseName}-${uniqueSuffix}${ext}`;
      const filePath = path.join(uploadDir, fileName);

      // Save image to filesystem
      const buffer = await response.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      fs.writeFileSync(filePath, uint8Array);

      // Get file stats
      const stats = fs.statSync(filePath);
      const fileUrl = `/api/media/${fileName}/file`;

      // Save to database
      const mediaData = {
        fileName: fileName,
        originalName: `${originalName} (from ${imageUrl.hostname})`,
        mimeType: contentType,
        fileSize: stats.size,
        filePath: filePath,
        url: fileUrl,
        altText: '',
        caption: '',
      };

      const validatedData = insertMediaFileSchema.parse(mediaData);
      const file = await storage.uploadMediaFile(validatedData);

      res.json({ 
        success: true, 
        file: file,
        message: "Image downloaded successfully"
      });
    } catch (error: any) {
      console.error("Error downloading image:", error);
      res.status(500).json({ 
        error: "Failed to download image", 
        details: error?.message || "Unknown error"
      });
    }
  });

  // Admin user management routes
  app.get("/api/admin/users", requireAdminAuth, async (req, res) => {
    try {
      const users = await storage.getAllAdminUsers();
      res.json({ success: true, users });
    } catch (error) {
      console.error("Get admin users error:", error);
      res.status(500).json({ error: "Failed to fetch admin users" });
    }
  });

  app.post("/api/admin/users", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertUserSchema.parse(req.body);
      const user = await storage.createAdminUser(validatedData);
      res.json({ success: true, user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Create admin user error:", error);
      res.status(500).json({ error: "Failed to create admin user" });
    }
  });

  app.put("/api/admin/users/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = updateUserSchema.parse(req.body);
      const user = await storage.updateAdminUser(id, validatedData);
      res.json({ success: true, user });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Update admin user error:", error);
      res.status(500).json({ error: "Failed to update admin user" });
    }
  });

  app.delete("/api/admin/users/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteAdminUser(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete admin user error:", error);
      res.status(500).json({ error: "Failed to delete admin user" });
    }
  });

  // 2FA API Routes
  // Generate 2FA setup (QR code and backup codes)
  app.post("/api/admin/2fa/setup", requireAdminAuth, async (req, res) => {
    try {
      const user = (req as any).adminUser;
      const userId = user.id;
      
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (user.twoFactorEnabled) {
        return res.status(400).json({ error: "2FA is already enabled for this user" });
      }

      const setup = await TwoFactorAuthService.generateSetup(user.username);
      
      res.json({
        success: true,
        qrCode: setup.qrCodeUrl,
        backupCodes: setup.backupCodes,
        secret: setup.secret // Don't store in DB yet, wait for verification
      });
    } catch (error) {
      console.error("2FA setup error:", error);
      res.status(500).json({ error: "Failed to generate 2FA setup" });
    }
  });

  // Enable 2FA after verifying setup
  app.post("/api/admin/2fa/enable", requireAdminAuth, async (req, res) => {
    try {
      const { token, secret, backupCodes } = req.body;
      const user = (req as any).adminUser;
      const userId = user.id;

      if (!token || !secret || !backupCodes) {
        return res.status(400).json({ error: "Token, secret, and backup codes are required" });
      }

      // Verify the token with the secret
      const isValid = TwoFactorAuthService.verifyToken(token, secret);
      
      if (!isValid) {
        return res.status(400).json({ error: "Invalid 2FA token" });
      }

      // Enable 2FA for the user
      const updatedUser = await storage.enable2FA(userId, secret, backupCodes);
      
      res.json({
        success: true,
        message: "2FA enabled successfully",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          twoFactorEnabled: updatedUser.twoFactorEnabled
        }
      });
    } catch (error) {
      console.error("2FA enable error:", error);
      res.status(500).json({ error: "Failed to enable 2FA" });
    }
  });

  // Disable 2FA
  app.post("/api/admin/2fa/disable", requireAdminAuth, async (req, res) => {
    try {
      const { password } = req.body;
      const user = (req as any).adminUser;
      const userId = user.id;

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.twoFactorEnabled) {
        return res.status(400).json({ error: "2FA is not enabled for this user" });
      }

      // Verify password before disabling 2FA
      const isPasswordValid = await verifyPassword(password, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({ error: "Invalid password" });
      }

      // Disable 2FA
      const updatedUser = await storage.disable2FA(userId);
      
      res.json({
        success: true,
        message: "2FA disabled successfully",
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          twoFactorEnabled: updatedUser.twoFactorEnabled
        }
      });
    } catch (error) {
      console.error("2FA disable error:", error);
      res.status(500).json({ error: "Failed to disable 2FA" });
    }
  });

  // Generate new backup codes
  app.post("/api/admin/2fa/backup-codes", requireAdminAuth, async (req, res) => {
    try {
      const user = (req as any).adminUser;
      const userId = user.id;

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!user.twoFactorEnabled) {
        return res.status(400).json({ error: "2FA is not enabled for this user" });
      }

      // Generate new backup codes
      const newBackupCodes = TwoFactorAuthService.generateNewBackupCodes();
      await storage.updateBackupCodes(userId, newBackupCodes);
      
      res.json({
        success: true,
        backupCodes: newBackupCodes
      });
    } catch (error) {
      console.error("Generate backup codes error:", error);
      res.status(500).json({ error: "Failed to generate backup codes" });
    }
  });

  // Admin-controlled 2FA management endpoints
  // Force enable 2FA for a user (admin only)
  app.post("/api/admin/users/:userId/2fa/force-enable", requireAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const adminUser = (req as any).adminUser;
      
      // Prevent admins from enabling 2FA on their own account through this endpoint
      if (parseInt(userId) === adminUser.id) {
        return res.status(400).json({ error: "Use the regular 2FA setup for your own account" });
      }

      const targetUser = await storage.getUser(parseInt(userId));
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      if (targetUser.twoFactorEnabled) {
        return res.status(400).json({ error: "Two-factor authentication is already enabled for this user" });
      }

      // Generate a temporary secret and backup codes for the user
      const { secret, backupCodes } = await TwoFactorAuthService.generateSetup(targetUser.username);
      const hashedBackupCodes = backupCodes.map(code => {
  const hash = crypto.createHash('sha256');
  hash.update(code);
  return hash.digest('hex');
});

      // Enable 2FA for the target user
      const updatedUser = await storage.enable2FA(parseInt(userId), secret, hashedBackupCodes);

      res.json({
        success: true,
        message: `2FA enabled for user ${targetUser.username}`,
        secret: secret, // Admin will need to share this with user
        backupCodes: backupCodes,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          twoFactorEnabled: updatedUser.twoFactorEnabled
        }
      });
    } catch (error) {
      console.error("Force enable 2FA error:", error);
      res.status(500).json({ error: "Failed to enable 2FA" });
    }
  });

  // Force disable 2FA for a user (admin only)
  app.post("/api/admin/users/:userId/2fa/force-disable", requireAdminAuth, async (req, res) => {
    try {
      const { userId } = req.params;
      const adminUser = (req as any).adminUser;
      
      // Prevent admins from disabling 2FA on their own account through this endpoint
      if (parseInt(userId) === adminUser.id) {
        return res.status(400).json({ error: "Use the regular 2FA disable for your own account" });
      }

      const targetUser = await storage.getUser(parseInt(userId));
      if (!targetUser) {
        return res.status(404).json({ error: "User not found" });
      }

      if (!targetUser.twoFactorEnabled) {
        return res.status(400).json({ error: "Two-factor authentication is not enabled for this user" });
      }

      // Disable 2FA for the target user
      const updatedUser = await storage.disable2FA(parseInt(userId));

      res.json({
        success: true,
        message: `2FA disabled for user ${targetUser.username}`,
        user: {
          id: updatedUser.id,
          username: updatedUser.username,
          twoFactorEnabled: updatedUser.twoFactorEnabled
        }
      });
    } catch (error) {
      console.error("Force disable 2FA error:", error);
      res.status(500).json({ error: "Failed to disable 2FA" });
    }
  });

  // Protected admin reviews routes
  app.get("/api/admin/reviews", requireAdminAuth, async (req, res) => {
    try {
      const reviews = await storage.getReviews();
      res.json({ success: true, reviews });
    } catch (error) {
      console.error("Get reviews error:", error);
      res.status(500).json({ error: "Failed to fetch reviews" });
    }
  });

  app.post("/api/admin/reviews", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(validatedData);
      res.json({ success: true, review });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Create review error:", error);
      res.status(500).json({ error: "Failed to create review" });
    }
  });

  app.put("/api/admin/reviews/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertReviewSchema.partial().parse(req.body);
      const review = await storage.updateReview(id, validatedData);
      res.json({ success: true, review });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ error: "Invalid data", details: error.errors });
      }
      console.error("Update review error:", error);
      res.status(500).json({ error: "Failed to update review" });
    }
  });

  app.delete("/api/admin/reviews/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteReview(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Delete review error:", error);
      res.status(500).json({ error: "Failed to delete review" });
    }
  });

  // Download proxy to bypass client router issues
  app.get("/api/download/rustdesk/:platform", async (req, res) => {
    const { platform } = req.params;
    
    const downloadUrls: Record<string, string> = {
      'windows-64': 'https://github.com/rustdesk/rustdesk/releases/download/1.4.0/rustdesk-1.4.0-x86_64.exe',
      'windows-32': 'https://github.com/rustdesk/rustdesk/releases/download/1.4.0/rustdesk-1.4.0-x86.exe',
      'macos-intel': 'https://github.com/rustdesk/rustdesk/releases/download/1.4.0/rustdesk-1.4.0-x86_64.dmg',
      'macos-arm': 'https://github.com/rustdesk/rustdesk/releases/download/1.4.0/rustdesk-1.4.0-aarch64.dmg',
      'linux-deb': 'https://github.com/rustdesk/rustdesk/releases/download/1.4.0/rustdesk_1.4.0_amd64.deb'
    };

    const downloadUrl = downloadUrls[platform];
    if (!downloadUrl) {
      return res.status(404).json({ error: 'Platform not found' });
    }

    // Redirect to GitHub download
    res.redirect(302, downloadUrl);
  });

  // Microsoft Quick Assist proxy
  app.get("/api/download/microsoft-quick-assist", async (req, res) => {
    res.redirect(302, 'https://apps.microsoft.com/store/detail/9p7bp5vnwkx5');
  });

  // Serve debug media page
  app.get("/debug-media", (req, res) => {
    res.sendFile(path.resolve("debug-media.html"));
  });

  // Enhanced fallback responses for when Gemini is unavailable
  const getFallbackResponse = (message: string): string => {
    const lowerMessage = message.toLowerCase();
    
    // Greeting responses
    if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! We're AramisTech, a family-owned IT company that's been helping South Florida businesses for over 27 years. What technical challenge can we help you solve today? Call us at (305) 814-4461!";
    }
    
    // Printer issues
    if (lowerMessage.includes('printer') || lowerMessage.includes('print')) {
      return "Printer problems can be so frustrating! We've been fixing printer issues for businesses across Miami and Broward County for 27+ years. Our team can help with connectivity, driver issues, paper jams, or complete printer setup. Call us at (305) 814-4461 and we'll get your printing back on track quickly!";
    }
    
    // Computer/hardware issues
    if (lowerMessage.includes('computer') || lowerMessage.includes('laptop') || lowerMessage.includes('desktop') || lowerMessage.includes('hardware')) {
      return "Computer troubles? We understand how disruptive that can be to your business! Our experienced technicians have been solving hardware issues for South Florida companies since 1998. We provide both remote and on-site support. Call us at (305) 814-4461 for immediate help!";
    }
    
    // Network issues
    if (lowerMessage.includes('network') || lowerMessage.includes('internet') || lowerMessage.includes('wifi') || lowerMessage.includes('connection')) {
      return "Network connectivity issues can shut down your entire operation! Our team specializes in network troubleshooting and has kept South Florida businesses connected for over 27 years. We can diagnose and fix your network problems quickly. Call us at (305) 814-4461 for immediate network support!";
    }
    
    // Slow performance
    if (lowerMessage.includes('slow') || lowerMessage.includes('freezing') || lowerMessage.includes('running slow')) {
      return "A slow computer can kill productivity! We've been speeding up business computers in Miami and Broward County for 27+ years. Our team can diagnose what's slowing you down and get your system running like new. Call us at (305) 814-4461 for fast performance solutions!";
    }
    
    // Security/virus issues
    if (lowerMessage.includes('virus') || lowerMessage.includes('malware') || lowerMessage.includes('security') || lowerMessage.includes('hacked')) {
      return "Security threats are serious business! We've been protecting South Florida companies from cyber threats for over 27 years. Our cybersecurity experts can clean infections and strengthen your defenses. Don't wait - call us immediately at (305) 814-4461 for security assistance!";
    }
    
    // Email issues
    if (lowerMessage.includes('email') || lowerMessage.includes('outlook') || lowerMessage.includes('mail')) {
      return "Email problems can disrupt your entire workflow! Our team has been solving email issues for South Florida businesses for 27+ years. Whether it's setup, syncing, or connectivity problems, we can get your email working perfectly. Call us at (305) 814-4461!";
    }
    
    // Server issues
    if (lowerMessage.includes('server') || lowerMessage.includes('backup')) {
      return "Server problems need immediate attention! We've been managing business servers across Miami and Broward County for over 27 years. Our experienced team can handle everything from server crashes to backup failures. Call us now at (305) 814-4461 for emergency server support!";
    }
    
    // Windows 10 specific
    if (lowerMessage.includes('windows') || lowerMessage.includes('upgrade') || lowerMessage.includes('windows 10')) {
      return "Windows 10 support ends October 14, 2025! Don't get caught with unsecured systems. We've been helping South Florida businesses with Windows upgrades for decades. Our team makes the transition smooth and secure. Call us at (305) 814-4461 to schedule your upgrade consultation!";
    }
    
    // Pricing inquiries
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('quote')) {
      return "Every business has unique IT needs, so we provide customized pricing. As a family-owned company with 27+ years of experience, we offer competitive rates and personalized service you won't find with big corporations. Call us at (305) 814-4461 for a free consultation and honest quote!";
    }
    
    // General service inquiries
    if (lowerMessage.includes('service') || lowerMessage.includes('help') || lowerMessage.includes('support')) {
      return "We're here to solve your IT challenges! With 27+ years serving South Florida businesses, we handle everything from network setup to cybersecurity to emergency repairs. Our family-owned approach means you get personal attention and reliable solutions. Call us at (305) 814-4461!";
    }
    
    // Default response
    return "We're AramisTech, your local IT experts! Whatever technical challenge you're facing, our family-owned team has been solving similar problems for South Florida businesses for over 27 years. Let's talk about how we can help you specifically - call us at (305) 814-4461!";
  };

  // ChatGPT Assistant API endpoint for intelligent chatbot
  app.post("/api/chatgpt", async (req, res) => {
    try {
      const { message, threadId } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      const assistantId = 'asst_kOnaeaUjcLezWfBXoDuI7vVl';

      // Use OpenAI Assistants API
      try {
        let currentThreadId = threadId;

        // Create a new thread if none provided
        if (!currentThreadId) {
          const threadResponse = await fetch('https://api.openai.com/v1/threads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'OpenAI-Beta': 'assistants=v2'
            },
            body: JSON.stringify({})
          });

          if (!threadResponse.ok) {
            throw new Error(`Thread creation failed: ${threadResponse.status} ${threadResponse.statusText}`);
          }

          const threadData = await threadResponse.json();
          currentThreadId = threadData.id;
        }

        // Add message to thread
        const messageResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          },
          body: JSON.stringify({
            role: 'user',
            content: message
          })
        });

        if (!messageResponse.ok) {
          throw new Error(`Message creation failed: ${messageResponse.status} ${messageResponse.statusText}`);
        }

        // Run the assistant
        const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          },
          body: JSON.stringify({
            assistant_id: assistantId
          })
        });

        if (!runResponse.ok) {
          throw new Error(`Run creation failed: ${runResponse.status} ${runResponse.statusText}`);
        }

        const runData = await runResponse.json();
        const runId = runData.id;

        // Poll for completion
        let runStatus = 'queued';
        let attempts = 0;
        const maxAttempts = 30;

        while (runStatus !== 'completed' && runStatus !== 'failed' && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          const statusResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
            headers: {
              'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
              'OpenAI-Beta': 'assistants=v2'
            }
          });

          if (statusResponse.ok) {
            const statusData = await statusResponse.json();
            runStatus = statusData.status;
          }
          attempts++;
        }

        if (runStatus !== 'completed') {
          throw new Error('Assistant run did not complete in time');
        }

        // Get the assistant's response
        const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });

        if (!messagesResponse.ok) {
          throw new Error(`Messages retrieval failed: ${messagesResponse.status} ${messagesResponse.statusText}`);
        }

        const messagesData = await messagesResponse.json();
        const assistantMessage = messagesData.data[0];
        const botResponse = assistantMessage?.content?.[0]?.text?.value || "I'm having trouble processing your request right now. Please call us at (305) 814-4461 for immediate assistance.";
        
        res.json({ 
          response: botResponse,
          threadId: currentThreadId
        });
      } catch (openaiError) {
        console.error('OpenAI Assistant API Error:', openaiError);
        
        // Provide helpful fallback response
        const fallbackResponse = "I'm experiencing technical difficulties at the moment. For immediate IT support, please call AramisTech at (305) 814-4461 or email sales@aramistech.com. Our experienced technicians are here to help with all your technology needs.";
        res.json({ response: fallbackResponse });
      }
    } catch (error) {
      console.error('ChatGPT Assistant Endpoint Error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Legacy Gemini chatbot endpoint (keeping for compatibility)
  app.post("/api/chatbot", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required' });
      }

      // Try Google Gemini first, but fallback gracefully if it fails
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${process.env.GEMINI_API_KEY}`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert IT support representative for AramisTech, a family-owned IT company with 27+ years of experience helping South Florida businesses.

About AramisTech:
- Family-owned since 1998 serving Miami & Broward County
- Phone: (305) 814-4461
- Email: sales@aramistech.com
- Hours: Monday-Friday 9am-6pm

Our services include IT support, network management, cybersecurity, server management, hardware repair, software training, emergency support, backup solutions, Windows 10 upgrades, and AI development.

TECHNICAL ISSUE RESPONSES:
When users describe technical problems, provide specific helpful guidance:

Blue Screen Errors (BSOD):
- Ask what error code they see (SYSTEM_THREAD_EXCEPTION_NOT_HANDLED, etc.)
- Suggest restarting in Safe Mode
- Recommend checking for recent hardware/software changes
- Mention possible RAM, driver, or overheating issues
- Offer immediate phone support: "This sounds like a hardware issue that needs immediate attention. Call us at (305) 814-4461 for emergency support."

Network Issues:
- Ask if it's WiFi or ethernet connection
- Suggest checking cable connections and router restart
- Recommend running network troubleshooter
- Ask about recent network changes

Slow Computer:
- Ask about startup programs and recent software installs
- Suggest checking available disk space
- Recommend malware scan
- Mention possible hardware upgrades

Printer Problems:
- Ask about error messages or specific symptoms
- Suggest checking connections and paper/ink
- Recommend driver updates
- Offer remote support setup

Always end technical responses with: "If this doesn't resolve the issue, call us immediately at (305) 814-4461. Our technicians can provide remote assistance or schedule an on-site visit."

Response Guidelines:
- Be warm, friendly, and personal like a family business
- Never use markdown formatting (no ** or ## or bullets)
- Use "we" and "our team" instead of "AramisTech can"
- Say "call us at (305) 814-4461" or "email us at sales@aramistech.com"
- Share how our 27+ years of experience helps solve their specific problem
- Mention relevant services naturally in conversation
- Keep responses conversational and helpful
- Always encourage them to contact us for personalized help

User message: ${message}`
                  }
                ]
              }
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 300,
            }
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (aiResponse) {
            return res.json({ response: aiResponse });
          }
        }
        
        // If we get here, Gemini didn't work properly
        throw new Error('Gemini response failed');
        
      } catch (aiError) {
        console.log('Gemini unavailable, using fallback response for:', message.substring(0, 50));
        
        // Use intelligent fallback response
        const fallbackResponse = getFallbackResponse(message);
        return res.json({ response: fallbackResponse });
      }

    } catch (error) {
      console.error('Chatbot Error:', error);
      
      // Final fallback if everything fails
      const finalFallback = "Hi! I'm here to help with your IT needs. AramisTech provides professional IT services to South Florida businesses. Call us at (305) 814-4461 or email sales@aramistech.com for immediate assistance.";
      res.json({ response: finalFallback });
    }
  });

  // Public menu items endpoint for frontend navigation
  app.get("/api/menu-items", async (req, res) => {
    try {
      const menuItems = await storage.getMenuItems();
      res.json({ success: true, menuItems });
    } catch (error) {
      console.error("Error fetching menu items:", error);
      res.status(500).json({ error: "Failed to fetch menu items" });
    }
  });

  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const contact = await storage.createContact(validatedData);
      
      // Send email notification to sales team
      try {
        await sendContactEmail({
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          company: validatedData.company || undefined,
          service: validatedData.service || undefined,
          employees: validatedData.employees || undefined,
          challenges: validatedData.challenges || undefined,
          contactTime: validatedData.contactTime || undefined,
        });
        console.log("Contact form email sent successfully");
      } catch (emailError) {
        console.error("Failed to send contact email:", emailError);
        // Don't fail the request if email fails, just log the error
      }
      
      res.json({ success: true, contact });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Failed to submit contact form" 
        });
      }
    }
  });

  // Quick quote form submission
  app.post("/api/quick-quote", async (req, res) => {
    try {
      const validatedData = insertQuickQuoteSchema.parse(req.body);
      const quote = await storage.createQuickQuote(validatedData);
      
      // Send email notification to sales team
      try {
        await sendQuickQuoteEmail({
          name: validatedData.name,
          email: validatedData.email,
          phone: validatedData.phone,
        });
        console.log("Quick quote email sent successfully");
      } catch (emailError) {
        console.error("Failed to send quick quote email:", emailError);
        // Don't fail the request if email fails, just log the error
      }
      
      res.json({ success: true, quote });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        res.status(500).json({ 
          success: false, 
          message: "Failed to submit quick quote form" 
        });
      }
    }
  });

  // Service-specific consultation form submission
  app.post("/api/service-consultation", async (req, res) => {
    try {
      const {
        firstName,
        lastName,
        email,
        phone,
        company,
        serviceType,
        projectDescription,
        specificAnswer,
        specificNeeds,
        timeline,
        budget,
        submittedAt
      } = req.body;

      // Store in database using existing contact schema with modifications for service consultation
      const consultationData = {
        firstName,
        lastName,
        email,
        phone,
        company: company || null,
        service: serviceType,
        challenges: `${projectDescription}\n\nSpecific Details: ${specificAnswer || 'Not provided'}\n\nInterested Features: ${specificNeeds?.join(', ') || 'None specified'}\n\nTimeline: ${timeline || 'Not specified'}\n\nBudget: ${budget || 'Not specified'}`,
        contactTime: timeline || null,
        employees: null
      };

      const contact = await storage.createContact(consultationData);
      
      // Send specialized email notification
      try {
        await sendContactEmail({
          firstName,
          lastName,
          email,
          phone,
          company: company || undefined,
          service: serviceType,
          challenges: consultationData.challenges,
          contactTime: timeline || undefined,
        });
        console.log("Service consultation email sent successfully");
      } catch (emailError) {
        console.error("Failed to send service consultation email:", emailError);
      }
      
      res.json({ success: true, consultation: contact });
    } catch (error) {
      console.error("Service consultation submission error:", error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to submit consultation request" 
      });
    }
  });

  // AI consultation form submission
  app.post("/api/ai-consultation", async (req, res) => {
    try {
      const validatedData = insertAIConsultationSchema.parse(req.body);
      const consultation = await storage.createAIConsultation(validatedData);
      
      // Send email notification to sales team
      try {
        await sendAIConsultationEmail({
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          company: validatedData.company || undefined,
          industry: validatedData.industry || undefined,
          businessSize: validatedData.businessSize || undefined,
          currentAIUsage: validatedData.currentAIUsage || undefined,
          aiInterests: validatedData.aiInterests || [],
          projectTimeline: validatedData.projectTimeline || undefined,
          budget: validatedData.budget || undefined,
          projectDescription: validatedData.projectDescription,
          preferredContactTime: validatedData.preferredContactTime || undefined,
        });
        console.log("AI consultation email sent successfully");
      } catch (emailError) {
        console.error("Failed to send AI consultation email:", emailError);
        // Don't fail the request if email fails, just log the error
      }
      
      res.json({ success: true, consultation });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        console.error("AI consultation submission error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Failed to submit AI consultation request" 
        });
      }
    }
  });

  // IT consultation form submission
  app.post("/api/it-consultation", async (req, res) => {
    try {
      const validatedData = insertITConsultationSchema.parse(req.body);
      const consultation = await storage.createITConsultation(validatedData);
      
      // Send email notification to sales team
      try {
        await sendITConsultationEmail({
          firstName: validatedData.firstName,
          lastName: validatedData.lastName,
          email: validatedData.email,
          phone: validatedData.phone,
          company: validatedData.company || undefined,
          employees: validatedData.employees || undefined,
          services: validatedData.services,
          urgency: validatedData.urgency || undefined,
          budget: validatedData.budget || undefined,
          challenges: validatedData.challenges,
          preferredContactTime: validatedData.preferredContactTime || undefined,
        });
        console.log("IT consultation email sent successfully");
      } catch (emailError) {
        console.error("Failed to send IT consultation email:", emailError);
        // Don't fail the request if email fails, just log the error
      }
      
      res.json({ success: true, consultation });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ 
          success: false, 
          message: "Validation error", 
          errors: error.errors 
        });
      } else {
        console.error("IT consultation submission error:", error);
        res.status(500).json({ 
          success: false, 
          message: "Failed to submit IT consultation request" 
        });
      }
    }
  });

  // Get all contacts (for admin purposes)
  app.get("/api/contacts", async (req, res) => {
    try {
      const contacts = await storage.getContacts();
      res.json({ success: true, contacts });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch contacts" 
      });
    }
  });

  // Get all quick quotes (for admin purposes)
  app.get("/api/quick-quotes", async (req, res) => {
    try {
      const quotes = await storage.getQuickQuotes();
      res.json({ success: true, quotes });
    } catch (error) {
      res.status(500).json({ 
        success: false, 
        message: "Failed to fetch quick quotes" 
      });
    }
  });

  // Get Google reviews
  app.get("/api/reviews", async (req, res) => {
    try {
      // Use AramisTech Place ID from query parameter or environment
      const placeId = req.query.place_id || process.env.ARAMISTECH_PLACE_ID;
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          message: "Google Places API key not configured"
        });
      }

      if (!placeId) {
        return res.json({
          success: false,
          message: "AramisTech Place ID not configured. Visit business.google.com to get your Place ID."
        });
      }

      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=reviews,rating,user_ratings_total&key=${apiKey}`
      );
      
      const data = await response.json();
      
      if (data.status === "OK" && data.result) {
        // Filter and format reviews
        const reviews = (data.result.reviews || [])
          .filter((review: any) => review.rating >= 4) // Only show 4+ star reviews
          .slice(0, 6) // Limit to 6 reviews
          .map((review: any) => ({
            text: review.text,
            author: review.author_name,
            rating: review.rating,
            time: review.time,
            profile_photo: review.profile_photo_url
          }));

        res.json({
          success: true,
          reviews,
          business: {
            rating: data.result.rating,
            user_ratings_total: data.result.user_ratings_total
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: "Business reviews not found"
        });
      }
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch reviews"
      });
    }
  });


  // Test Place ID endpoint for AramisTech configuration
  app.get("/api/test-place-id/:placeId", async (req, res) => {
    try {
      const placeId = req.params.placeId;
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      
      const response = await fetch(
        `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,rating,user_ratings_total,reviews&key=${apiKey}`
      );
      
      const data = await response.json();
      
      res.json({
        success: data.status === "OK",
        business_name: data.result?.name,
        address: data.result?.formatted_address,
        rating: data.result?.rating,
        total_reviews: data.result?.user_ratings_total,
        status: data.status,
        error: data.error_message
      });
    } catch (error) {
      res.status(500).json({ success: false, error: "Failed to test Place ID" });
    }
  });

  // Review management endpoints
  app.post("/api/reviews", async (req, res) => {
    try {
      const data = insertReviewSchema.parse(req.body);
      const review = await storage.createReview(data);
      res.json({ success: true, review });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  app.get("/api/reviews/database", async (req, res) => {
    try {
      const reviews = await storage.getVisibleReviews();
      res.json({ success: true, reviews });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Add sample AramisTech reviews
  app.post("/api/reviews/seed", async (req, res) => {
    try {
      const sampleReviews = [
        {
          customerName: "Maria Rodriguez",
          rating: 5,
          reviewText: "AramisTech saved our business! When our server crashed, they had us back online within hours. Their 27+ years of experience really shows - professional, reliable, and fair pricing.",
          businessName: "AramisTech",
          location: "Miami, FL",
          source: "manual"
        },
        {
          customerName: "David Chen",
          rating: 5,
          reviewText: "Outstanding IT support for our small business. They set up our network perfectly and their ongoing maintenance keeps everything running smooth. Family-owned business you can trust.",
          businessName: "AramisTech",
          location: "Broward County, FL",
          source: "manual"
        },
        {
          customerName: "Jennifer Williams",
          rating: 5,
          reviewText: "Best computer repair in South Florida! Fixed my laptop in one day and explained everything clearly. Their customer service is exceptional - you can tell they genuinely care.",
          businessName: "AramisTech",
          location: "Doral, FL",
          source: "manual"
        }
      ];

      const createdReviews = [];
      for (const review of sampleReviews) {
        const created = await storage.createReview(review);
        createdReviews.push(created);
      }

      res.json({ success: true, reviews: createdReviews });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Delete review endpoint
  app.delete("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid review ID" });
      }
      
      await storage.deleteReview(id);
      res.json({ success: true, message: "Review deleted successfully" });
    } catch (error: any) {
      res.status(500).json({ success: false, message: error.message });
    }
  });

  // Update review endpoint
  app.put("/api/reviews/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ success: false, message: "Invalid review ID" });
      }
      
      const data = insertReviewSchema.partial().parse(req.body);
      const updatedReview = await storage.updateReview(id, data);
      res.json({ success: true, review: updatedReview });
    } catch (error: any) {
      res.status(400).json({ success: false, message: error.message });
    }
  });

  // WHMCS Integration Endpoints
  
  // Get WHMCS configuration status
  app.get("/api/whmcs/status", (req, res) => {
    res.json({
      success: true,
      configured: validateWHMCSConfig(),
      baseUrl: whmcsConfig.baseUrl
    });
  });

  // Proxy WHMCS API calls (with validation)
  app.post("/api/whmcs/customer/:email", async (req, res) => {
    if (!validateWHMCSConfig()) {
      return res.status(500).json({
        success: false,
        message: "WHMCS not configured properly"
      });
    }

    try {
      const email = req.params.email;
      
      // Make API call to WHMCS
      const requestData = new URLSearchParams({
        action: 'GetClientsDetails',
        username: whmcsConfig.apiIdentifier,
        password: whmcsConfig.apiSecret,
        responsetype: 'json',
        email: email
      });

      const response = await fetch(`${whmcsConfig.baseUrl}/includes/api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestData.toString()
      });

      const data = await response.json();
      
      if (data.result === 'error') {
        return res.status(404).json({
          success: false,
          message: data.message || 'Customer not found'
        });
      }

      res.json({
        success: true,
        customer: data.client
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch customer data"
      });
    }
  });

  // Get customer services
  app.get("/api/whmcs/customer/:id/services", async (req, res) => {
    if (!validateWHMCSConfig()) {
      return res.status(500).json({
        success: false,
        message: "WHMCS not configured properly"
      });
    }

    try {
      const clientId = req.params.id;
      
      const requestData = new URLSearchParams({
        action: 'GetClientsProducts',
        username: whmcsConfig.apiIdentifier,
        password: whmcsConfig.apiSecret,
        responsetype: 'json',
        clientid: clientId
      });

      const response = await fetch(`${whmcsConfig.baseUrl}/includes/api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestData.toString()
      });

      const data = await response.json();
      
      if (data.result === 'error') {
        return res.status(400).json({
          success: false,
          message: data.message
        });
      }

      res.json({
        success: true,
        services: data.products?.product || []
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch services"
      });
    }
  });

  // Get customer invoices
  app.get("/api/whmcs/customer/:id/invoices", async (req, res) => {
    if (!validateWHMCSConfig()) {
      return res.status(500).json({
        success: false,
        message: "WHMCS not configured properly"
      });
    }

    try {
      const clientId = req.params.id;
      
      const requestData = new URLSearchParams({
        action: 'GetInvoices',
        username: whmcsConfig.apiIdentifier,
        password: whmcsConfig.apiSecret,
        responsetype: 'json',
        userid: clientId,
        limitnum: '10'
      });

      const response = await fetch(`${whmcsConfig.baseUrl}/includes/api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: requestData.toString()
      });

      const data = await response.json();
      
      if (data.result === 'error') {
        return res.status(400).json({
          success: false,
          message: data.message
        });
      }

      res.json({
        success: true,
        invoices: data.invoices?.invoice || []
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to fetch invoices"
      });
    }
  });

  // WHMCS Webhook handler for real-time updates
  app.post("/api/whmcs/webhook", express.raw({ type: 'application/json' }), (req, res) => {
    try {
      const signature = req.headers['x-whmcs-signature'] as string;
      const payload = req.body.toString();
      
      if (!validateWHMCSWebhook(signature, payload)) {
        return res.status(401).json({ success: false, message: 'Invalid signature' });
      }

      const data = JSON.parse(payload);
      
      // Handle different webhook events
      switch (data.event) {
        case 'InvoiceCreated':
          // Handle new invoice creation
          console.log('New invoice created:', data.invoice_id);
          break;
        case 'InvoicePaid':
          // Handle invoice payment
          console.log('Invoice paid:', data.invoice_id);
          break;
        case 'ClientAdd':
          // Handle new client registration
          console.log('New client added:', data.client_id);
          break;
        default:
          console.log('Unhandled webhook event:', data.event);
      }

      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ success: false, message: 'Invalid webhook data' });
    }
  });

  // Live Chat API Routes
  
  // Public live chat routes
  app.post("/api/chat/session", async (req, res) => {
    try {
      const { customerName, customerEmail, customerPhone } = req.body;
      const sessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const session = await storage.createChatSession({
        sessionId,
        customerName,
        customerEmail,
        customerPhone,
        status: "active",
        isHumanTransfer: false,
      });
      
      res.json({ success: true, session });
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ success: false, message: "Failed to create chat session" });
    }
  });

  app.get("/api/chat/session/:sessionId", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getChatSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ success: false, message: "Session not found" });
      }
      
      res.json({ success: true, session });
    } catch (error) {
      console.error("Error fetching chat session:", error);
      res.status(500).json({ success: false, message: "Failed to fetch session" });
    }
  });

  app.get("/api/chat/session/:sessionId/messages", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getChatSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ success: false, message: "Session not found" });
      }
      
      const messages = await storage.getChatMessages(session.id);
      res.json({ success: true, messages });
    } catch (error) {
      console.error("Error fetching chat messages:", error);
      res.status(500).json({ success: false, message: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat/session/:sessionId/transfer", async (req, res) => {
    try {
      const { sessionId } = req.params;
      const session = await storage.getChatSession(sessionId);
      
      if (!session) {
        return res.status(404).json({ success: false, message: "Session not found" });
      }

      // Get the most recent message from the session for context
      const messages = await storage.getChatMessages(session.id);
      const lastMessage = messages.length > 0 ? messages[messages.length - 1].message : undefined;
      
      const updatedSession = await storage.updateChatSession(session.id, {
        isHumanTransfer: true,
        transferredAt: new Date(),
        status: "transferred"
      });
      
      // Add system message about transfer
      await storage.addChatMessage({
        sessionId: session.id,
        sender: "system",
        senderName: "System",
        message: "This conversation has been transferred to a human agent. Please wait while we connect you.",
        messageType: "system",
      });

      // Send urgent email notification to admins
      try {
        await sendTechnicianTransferNotification({
          customerName: session.customerName || "Unknown Customer",
          customerEmail: session.customerEmail || undefined,
          customerPhone: session.customerPhone || undefined,
          sessionId: session.sessionId,
          transferTime: new Date(),
          lastMessage: lastMessage
        });
        console.log("Technician transfer notification sent for session:", sessionId);
      } catch (emailError) {
        console.error("Failed to send technician transfer notification:", emailError);
        // Don't fail the transfer if email fails
      }
      
      res.json({ success: true, session: updatedSession });
    } catch (error) {
      console.error("Error transferring chat:", error);
      res.status(500).json({ success: false, message: "Failed to transfer chat" });
    }
  });

  // Admin chat routes
  app.get("/api/admin/chat/sessions", requireAdminAuth, async (req, res) => {
    try {
      const sessions = await storage.getActiveChatSessions();
      res.json({ success: true, sessions });
    } catch (error) {
      console.error("Error fetching admin chat sessions:", error);
      res.status(500).json({ success: false, message: "Failed to fetch sessions" });
    }
  });

  app.put("/api/admin/chat/session/:id/assign", requireAdminAuth, async (req, res) => {
    try {
      const { id } = req.params;
      const adminUserId = (req as any).adminUser.id;
      
      const session = await storage.updateChatSession(parseInt(id), {
        adminUserId,
        status: "active"
      });
      
      res.json({ success: true, session });
    } catch (error) {
      console.error("Error assigning chat session:", error);
      res.status(500).json({ success: false, message: "Failed to assign session" });
    }
  });

  app.get("/api/admin/chat/settings", requireAdminAuth, async (req, res) => {
    try {
      const adminUserId = (req as any).adminUser.id;
      const settings = await storage.getAdminChatSettings(adminUserId);
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error fetching chat settings:", error);
      res.status(500).json({ success: false, message: "Failed to fetch settings" });
    }
  });

  app.put("/api/admin/chat/settings", requireAdminAuth, async (req, res) => {
    try {
      const adminUserId = (req as any).adminUser.id;
      const settings = await storage.updateAdminChatSettings(adminUserId, req.body);
      res.json({ success: true, settings });
    } catch (error) {
      console.error("Error updating chat settings:", error);
      res.status(500).json({ success: false, message: "Failed to update settings" });
    }
  });

  // Knowledge Base API Routes
  
  // Public knowledge base routes
  app.get("/api/knowledge-base/categories", async (req, res) => {
    try {
      const categories = await storage.getKnowledgeBaseCategories();
      const visibleCategories = categories.filter(cat => cat.isVisible);
      res.json({ success: true, categories: visibleCategories });
    } catch (error) {
      console.error("Error fetching knowledge base categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.get("/api/knowledge-base/articles", async (req, res) => {
    try {
      const categoryId = req.query.category ? parseInt(req.query.category as string) : undefined;
      let articles;
      
      if (categoryId) {
        articles = await storage.getKnowledgeBaseArticlesByCategory(categoryId);
      } else {
        articles = await storage.getKnowledgeBaseArticles();
      }
      
      const publishedArticles = articles.filter(article => article.isPublished);
      res.json({ success: true, articles: publishedArticles });
    } catch (error) {
      console.error("Error fetching knowledge base articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.get("/api/knowledge-base/article/:slug", async (req, res) => {
    try {
      const { slug } = req.params;
      const article = await storage.getKnowledgeBaseArticleBySlug(slug);
      
      if (!article || !article.isPublished) {
        return res.status(404).json({ error: "Article not found" });
      }
      
      // Increment view count
      await storage.incrementKnowledgeBaseArticleViews(article.id);
      
      res.json({ success: true, article });
    } catch (error) {
      console.error("Error fetching knowledge base article:", error);
      res.status(500).json({ error: "Failed to fetch article" });
    }
  });

  // Admin knowledge base routes (protected)
  app.get("/api/admin/knowledge-base/categories", requireAdminAuth, async (req, res) => {
    try {
      const categories = await storage.getKnowledgeBaseCategories();
      res.json({ success: true, categories });
    } catch (error) {
      console.error("Error fetching admin knowledge base categories:", error);
      res.status(500).json({ error: "Failed to fetch categories" });
    }
  });

  app.post("/api/admin/knowledge-base/categories", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertKnowledgeBaseCategorySchema.parse(req.body);
      const category = await storage.createKnowledgeBaseCategory(validatedData);
      res.json({ success: true, category });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error creating knowledge base category:", error);
        res.status(500).json({ error: "Failed to create category" });
      }
    }
  });

  app.put("/api/admin/knowledge-base/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertKnowledgeBaseCategorySchema.partial().parse(req.body);
      const category = await storage.updateKnowledgeBaseCategory(id, validatedData);
      res.json({ success: true, category });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error updating knowledge base category:", error);
        res.status(500).json({ error: "Failed to update category" });
      }
    }
  });

  app.delete("/api/admin/knowledge-base/categories/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteKnowledgeBaseCategory(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting knowledge base category:", error);
      res.status(500).json({ error: "Failed to delete category" });
    }
  });

  app.get("/api/admin/knowledge-base/articles", requireAdminAuth, async (req, res) => {
    try {
      const articles = await storage.getKnowledgeBaseArticles();
      res.json({ success: true, articles });
    } catch (error) {
      console.error("Error fetching admin knowledge base articles:", error);
      res.status(500).json({ error: "Failed to fetch articles" });
    }
  });

  app.post("/api/admin/knowledge-base/articles", requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertKnowledgeBaseArticleSchema.parse(req.body);
      const article = await storage.createKnowledgeBaseArticle(validatedData);
      res.json({ success: true, article });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error creating knowledge base article:", error);
        res.status(500).json({ error: "Failed to create article" });
      }
    }
  });

  app.put("/api/admin/knowledge-base/articles/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertKnowledgeBaseArticleSchema.partial().parse(req.body);
      const article = await storage.updateKnowledgeBaseArticle(id, validatedData);
      res.json({ success: true, article });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, message: "Validation error", errors: error.errors });
      } else {
        console.error("Error updating knowledge base article:", error);
        res.status(500).json({ error: "Failed to update article" });
      }
    }
  });

  app.delete("/api/admin/knowledge-base/articles/:id", requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteKnowledgeBaseArticle(id);
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting knowledge base article:", error);
      res.status(500).json({ error: "Failed to delete article" });
    }
  });

  const httpServer = createServer(app);
  
  // Setup WebSocket server for live chat - only in production or when not in dev mode
  let wss: any = null;
  
  if (process.env.NODE_ENV !== 'development') {
    wss = new WebSocketServer({ server: httpServer });
  } else {
    // In development, create a simple API endpoint for testing
    console.log('WebSocket server disabled in development mode');
  }
  
  if (wss) {
    wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection');
    
    ws.on('message', async (message: string) => {
      try {
        const data = JSON.parse(message);
        
        switch (data.type) {
          case 'join_session':
            // Join a chat session
            (ws as any).sessionId = data.sessionId;
            (ws as any).userType = data.userType; // 'customer' or 'admin'
            (ws as any).userId = data.userId;
            break;
            
          case 'send_message':
            // Send a message in the chat
            const session = await storage.getChatSession(data.sessionId);
            if (session) {
              const chatMessage = await storage.addChatMessage({
                sessionId: session.id,
                sender: data.sender,
                senderName: data.senderName,
                message: data.message,
                messageType: 'text',
              });
              
              // Broadcast message to all clients in this session
              wss.clients.forEach((client: any) => {
                if (client !== ws && 
                    client.readyState === WebSocket.OPEN && 
                    client.sessionId === data.sessionId) {
                  client.send(JSON.stringify({
                    type: 'new_message',
                    message: chatMessage
                  }));
                }
              });
              
              // Send confirmation back to sender
              ws.send(JSON.stringify({
                type: 'message_sent',
                message: chatMessage
              }));
            }
            break;
            
          case 'bot_response':
            // Handle AI bot responses
            const botSession = await storage.getChatSession(data.sessionId);
            if (botSession) {
              const botMessage = await storage.addChatMessage({
                sessionId: botSession.id,
                sender: 'bot',
                senderName: 'AramisTech Assistant',
                message: data.message,
                messageType: 'text',
              });
              
              // Send bot message to customer
              wss.clients.forEach((client: any) => {
                if (client.readyState === WebSocket.OPEN && 
                    client.sessionId === data.sessionId) {
                  client.send(JSON.stringify({
                    type: 'new_message',
                    message: botMessage
                  }));
                }
              });
            }
            break;
            
          case 'transfer_to_human':
            // Transfer chat to human agent
            const transferSession = await storage.getChatSession(data.sessionId);
            if (transferSession) {
              // Get the most recent message for context
              const messages = await storage.getChatMessages(transferSession.id);
              const lastMessage = messages.length > 0 ? messages[messages.length - 1].message : undefined;

              await storage.updateChatSession(transferSession.id, {
                isHumanTransfer: true,
                transferredAt: new Date(),
                status: "transferred"
              });
              
              const systemMessage = await storage.addChatMessage({
                sessionId: transferSession.id,
                sender: 'system',
                senderName: 'System',
                message: 'This conversation has been transferred to a human agent. Please wait while we connect you.',
                messageType: 'system',
              });

              // Send urgent email notification to admins
              try {
                await sendTechnicianTransferNotification({
                  customerName: transferSession.customerName || "Unknown Customer",
                  customerEmail: transferSession.customerEmail || undefined,
                  customerPhone: transferSession.customerPhone || undefined,
                  sessionId: transferSession.sessionId,
                  transferTime: new Date(),
                  lastMessage: lastMessage
                });
                console.log("Technician transfer notification sent for WebSocket session:", data.sessionId);
              } catch (emailError) {
                console.error("Failed to send technician transfer notification via WebSocket:", emailError);
              }
              
              // Notify all clients in session about transfer
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && 
                    (client as any).sessionId === data.sessionId) {
                  client.send(JSON.stringify({
                    type: 'chat_transferred',
                    message: systemMessage
                  }));
                }
              });
              
              // Notify admin clients about new transfer
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && 
                    (client as any).userType === 'admin') {
                  client.send(JSON.stringify({
                    type: 'new_transfer',
                    session: transferSession
                  }));
                }
              });
            }
            break;
            
          case 'admin_online':
            // Admin went online
            if (data.userId) {
              await storage.updateAdminChatSettings(data.userId, {
                isOnline: true
              });
            }
            break;
            
          case 'admin_offline':
            // Admin went offline
            if (data.userId) {
              await storage.updateAdminChatSettings(data.userId, {
                isOnline: false
              });
            }
            break;
        }
      } catch (error) {
        console.error('WebSocket message error:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Failed to process message'
        }));
      }
    });
    
      ws.on('close', () => {
        console.log('WebSocket connection closed');
      });
    });
  }
  
  // Static Services Management
  app.get('/api/admin/static-services', requireAdminAuth, async (req, res) => {
    try {
      const services = await storage.getStaticServices();
      res.json({ success: true, services });
    } catch (error) {
      console.error('Error fetching static services:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch services' });
    }
  });

  app.post('/api/admin/static-services', requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertStaticServiceSchema.parse(req.body);
      const service = await storage.createStaticService(validatedData);
      res.json({ success: true, service });
    } catch (error) {
      console.error('Error creating static service:', error);
      res.status(500).json({ success: false, error: 'Failed to create service' });
    }
  });

  app.put('/api/admin/static-services/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStaticServiceSchema.partial().parse(req.body);
      const service = await storage.updateStaticService(id, validatedData);
      res.json({ success: true, service });
    } catch (error) {
      console.error('Error updating static service:', error);
      res.status(500).json({ success: false, error: 'Failed to update service' });
    }
  });

  app.delete('/api/admin/static-services/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      await storage.deleteStaticService(id);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting static service:', error);
      res.status(500).json({ success: false, error: 'Failed to delete service' });
    }
  });

  app.post('/api/admin/static-services/reorder', requireAdminAuth, async (req, res) => {
    try {
      const { serviceIds } = req.body;
      await storage.reorderStaticServices(serviceIds);
      res.json({ success: true });
    } catch (error) {
      console.error('Error reordering static services:', error);
      res.status(500).json({ success: false, error: 'Failed to reorder services' });
    }
  });

  // Public endpoint for services page
  app.get('/api/static-services', async (req, res) => {
    try {
      const services = await storage.getStaticServices();
      res.json({ success: true, services });
    } catch (error) {
      console.error('Error fetching static services:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch services' });
    }
  });

  // Footer Links Management Routes
  app.get('/api/admin/footer-links', requireAdminAuth, async (req, res) => {
    try {
      const links = await db.select().from(footerLinks).orderBy(asc(footerLinks.section), asc(footerLinks.orderIndex));
      res.json({ success: true, links });
    } catch (error) {
      console.error('Error fetching footer links:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch footer links' });
    }
  });

  app.get('/api/footer-links', async (req, res) => {
    try {
      const links = await db.select().from(footerLinks)
        .where(eq(footerLinks.isActive, true))
        .orderBy(asc(footerLinks.section), asc(footerLinks.orderIndex));
      res.json({ success: true, links });
    } catch (error) {
      console.error('Error fetching footer links:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch footer links' });
    }
  });

  app.post('/api/admin/footer-links', requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertFooterLinkSchema.parse(req.body);
      const [newLink] = await db.insert(footerLinks).values(validatedData).returning();
      res.json({ success: true, link: newLink });
    } catch (error) {
      console.error('Error creating footer link:', error);
      res.status(500).json({ success: false, error: 'Failed to create footer link' });
    }
  });

  app.put('/api/admin/footer-links/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertFooterLinkSchema.parse(req.body);
      
      const [updatedLink] = await db
        .update(footerLinks)
        .set({ ...validatedData, updatedAt: new Date() })
        .where(eq(footerLinks.id, id))
        .returning();
      
      if (!updatedLink) {
        return res.status(404).json({ success: false, error: 'Footer link not found' });
      }
      
      res.json({ success: true, link: updatedLink });
    } catch (error) {
      console.error('Error updating footer link:', error);
      res.status(500).json({ success: false, error: 'Failed to update footer link' });
    }
  });

  app.delete('/api/admin/footer-links/:id', requireAdminAuth, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      const [deletedLink] = await db
        .delete(footerLinks)
        .where(eq(footerLinks.id, id))
        .returning();
      
      if (!deletedLink) {
        return res.status(404).json({ success: false, error: 'Footer link not found' });
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting footer link:', error);
      res.status(500).json({ success: false, error: 'Failed to delete footer link' });
    }
  });

  app.put('/api/admin/footer-links/reorder', requireAdminAuth, async (req, res) => {
    try {
      const { links } = req.body;
      
      // Update each link with new order index
      for (const link of links) {
        await db.update(footerLinks)
          .set({ orderIndex: link.orderIndex })
          .where(eq(footerLinks.id, link.id));
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error reordering footer links:', error);
      res.status(500).json({ success: false, error: 'Failed to reorder footer links' });
    }
  });

  // Image scanning endpoint to get current URLs
  app.get('/api/admin/scan-images', requireAdminAuth, async (req, res) => {
    try {
      const images = [];
      
      // Windows 10 background detection
      const windows10Path = path.resolve('client/src/pages/windows10-upgrade.tsx');
      if (fs.existsSync(windows10Path)) {
        const content = fs.readFileSync(windows10Path, 'utf8');
        const bgMatch = content.match(/backgroundImage: `[^`]*url\(([^)]+)\)`/);
        if (bgMatch) {
          images.push({
            id: 'windows10-bg',
            currentUrl: bgMatch[1],
            filePath: 'client/src/pages/windows10-upgrade.tsx'
          });
        }
      }
      
      // Testimonial poster detection
      if (fs.existsSync(windows10Path)) {
        const content = fs.readFileSync(windows10Path, 'utf8');
        const posterMatch = content.match(/poster="([^"]+)"/);
        if (posterMatch) {
          images.push({
            id: 'testimonial-poster',
            currentUrl: posterMatch[1],
            filePath: 'client/src/pages/windows10-upgrade.tsx'
          });
        }
      }
      
      res.json({ success: true, images });
    } catch (error) {
      console.error('Image scanning error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to scan images" 
      });
    }
  });

  // Image replacement API endpoint
  app.put('/api/admin/replace-image', requireAdminAuth, async (req, res) => {
    try {
      const { imageId, newUrl } = req.body;
      
      if (!imageId || !newUrl) {
        return res.status(400).json({ 
          success: false, 
          message: "imageId and newUrl are required" 
        });
      }

      // Define image mappings
      const imageMap: Record<string, { filePath: string; replaceType: string; }> = {
        'header-logo': {
          filePath: 'client/src/components/header.tsx',
          replaceType: 'src'
        },
        'footer-logo': {
          filePath: 'client/src/components/footer.tsx', 
          replaceType: 'src'
        },
        'dynamic-header-logo': {
          filePath: 'client/src/components/dynamic-header.tsx',
          replaceType: 'src'
        },
        'exit-popup-logo': {
          filePath: 'client/src/components/exit-intent-popup.tsx',
          replaceType: 'src'
        },
        'aramis-photo': {
          filePath: 'client/src/components/team.tsx',
          replaceType: 'image'
        },
        'aramis-m-photo': {
          filePath: 'client/src/components/team.tsx',
          replaceType: 'image'
        },
        'gabriel-photo': {
          filePath: 'client/src/components/team.tsx',
          replaceType: 'image'
        },
        'hero-image': {
          filePath: 'client/src/components/hero.tsx',
          replaceType: 'src'
        },
        'about-image': {
          filePath: 'client/src/components/about.tsx',
          replaceType: 'src'
        },
        'contact-image': {
          filePath: 'client/src/components/contact.tsx',
          replaceType: 'src'
        },
        'windows10-bg': {
          filePath: 'client/src/pages/windows10-upgrade.tsx',
          replaceType: 'background'
        },
        'testimonial-poster': {
          filePath: 'client/src/pages/windows10-upgrade.tsx',
          replaceType: 'poster'
        }
      };

      const imageInfo = imageMap[imageId];
      if (!imageInfo) {
        return res.status(400).json({ 
          success: false, 
          message: "Invalid image ID" 
        });
      }

      const fullPath = path.resolve(imageInfo.filePath);
      
      if (!fs.existsSync(fullPath)) {
        return res.status(404).json({ 
          success: false, 
          message: "File not found" 
        });
      }

      let fileContent = fs.readFileSync(fullPath, 'utf8');
      
      // Replace based on replace type
      switch (imageInfo.replaceType) {
        case 'src':
          // Replace src attribute
          fileContent = fileContent.replace(/src="[^"]*"/, `src="${newUrl}"`);
          break;
        case 'image':
          // For team photos, replace by specific team member positions
          if (imageId === 'aramis-photo') {
            // Replace the first image (Aramis Figueroa - position 1)
            fileContent = fileContent.replace(/image: "\/api\/media\/\d+\/file"/, `image: "${newUrl}"`);
          } else if (imageId === 'aramis-m-photo') {
            // Replace second occurrence for Aramis M Figueroa (position 2)
            const lines = fileContent.split('\n');
            let imageCount = 0;
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes('image: "/api/media/') && lines[i].includes('/file"')) {
                imageCount++;
                if (imageCount === 2) {
                  lines[i] = lines[i].replace(/image: "\/api\/media\/\d+\/file"/, `image: "${newUrl}"`);
                  break;
                }
              }
            }
            fileContent = lines.join('\n');
          } else if (imageId === 'gabriel-photo') {
            // Replace third occurrence for Gabriel (position 3)
            const lines = fileContent.split('\n');
            let imageCount = 0;
            for (let i = 0; i < lines.length; i++) {
              if (lines[i].includes('image: "/api/media/') && lines[i].includes('/file"')) {
                imageCount++;
                if (imageCount === 3) {
                  lines[i] = lines[i].replace(/image: "\/api\/media\/\d+\/file"/, `image: "${newUrl}"`);
                  break;
                }
              }
            }
            fileContent = lines.join('\n');
          }
          break;
        case 'background':
          // For background image - handle template literal format
          fileContent = fileContent.replace(
            /backgroundImage: `linear-gradient\([^)]+\), url\([^)]+\)`/,
            `backgroundImage: \`linear-gradient(rgba(37, 99, 235, 0.75), rgba(67, 56, 202, 0.75)), url(${newUrl})\``
          );
          break;
        case 'poster':
          // For video poster
          fileContent = fileContent.replace(/poster="[^"]*"/, `poster="${newUrl}"`);
          break;
        default:
          throw new Error(`Unknown replace type: ${imageInfo.replaceType}`);
      }

      fs.writeFileSync(fullPath, fileContent, 'utf8');

      res.json({ 
        success: true, 
        message: "Image updated successfully" 
      });
    } catch (error) {
      console.error('Image replacement error:', error);
      res.status(500).json({ 
        success: false, 
        message: "Failed to update image" 
      });
    }
  });

  // WHMCS API Proxy Routes for billing.aramistech.com integration
  app.post('/api/whmcs/customer/:email', async (req, res) => {
    try {
      const { email } = req.params;
      
      if (!whmcsConfig.apiIdentifier || !whmcsConfig.apiSecret) {
        return res.status(500).json({
          success: false,
          message: 'WHMCS API credentials not configured'
        });
      }

      const postData = new URLSearchParams({
        action: 'GetClientsDetails',
        username: whmcsConfig.apiIdentifier,
        password: whmcsConfig.apiSecret,
        email: email,
        responsetype: 'json'
      });

      const response = await fetch(`${whmcsConfig.baseUrl}/includes/api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postData
      });

      const data = await response.json();
      
      if (data.result === 'success') {
        res.json({
          success: true,
          customer: {
            id: data.client.id,
            firstname: data.client.firstname,
            lastname: data.client.lastname,
            email: data.client.email,
            phonenumber: data.client.phonenumber,
            companyname: data.client.companyname,
            address1: data.client.address1,
            city: data.client.city,
            state: data.client.state,
            postcode: data.client.postcode,
            country: data.client.country
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Customer not found'
        });
      }
    } catch (error) {
      console.error('WHMCS API Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve customer data'
      });
    }
  });

  app.get('/api/whmcs/customer/:clientId/services', async (req, res) => {
    try {
      const { clientId } = req.params;

      const postData = new URLSearchParams({
        action: 'GetClientsProducts',
        username: whmcsConfig.apiIdentifier,
        password: whmcsConfig.apiSecret,
        clientid: clientId,
        responsetype: 'json'
      });

      const response = await fetch(`${whmcsConfig.baseUrl}/includes/api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postData
      });

      const data = await response.json();
      
      if (data.result === 'success') {
        const services = data.products?.product || [];
        res.json({
          success: true,
          services: Array.isArray(services) ? services : [services]
        });
      } else {
        res.json({
          success: true,
          services: []
        });
      }
    } catch (error) {
      console.error('WHMCS Services API Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve services'
      });
    }
  });

  app.get('/api/whmcs/customer/:clientId/invoices', async (req, res) => {
    try {
      const { clientId } = req.params;

      const postData = new URLSearchParams({
        action: 'GetInvoices',
        username: whmcsConfig.apiIdentifier,
        password: whmcsConfig.apiSecret,
        userid: clientId,
        limitnum: '25',
        responsetype: 'json'
      });

      const response = await fetch(`${whmcsConfig.baseUrl}/includes/api.php`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: postData
      });

      const data = await response.json();
      
      if (data.result === 'success') {
        const invoices = data.invoices?.invoice || [];
        res.json({
          success: true,
          invoices: Array.isArray(invoices) ? invoices : [invoices]
        });
      } else {
        res.json({
          success: true,
          invoices: []
        });
      }
    } catch (error) {
      console.error('WHMCS Invoices API Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve invoices'
      });
    }
  });

  // WHMCS webhook endpoint for real-time updates
  app.post('/api/whmcs/webhook', async (req, res) => {
    try {
      const signature = req.headers['x-whmcs-signature'] as string;
      const rawBody = JSON.stringify(req.body);
      
      // validateWHMCSWebhook already imported
      
      if (!validateWHMCSWebhook(signature, rawBody)) {
        return res.status(401).json({ success: false, message: 'Invalid signature' });
      }

      // Process webhook events (invoice created, payment received, etc.)
      console.log('WHMCS Webhook received:', req.body);
      
      res.json({ success: true });
    } catch (error) {
      console.error('WHMCS Webhook Error:', error);
      res.status(500).json({ success: false, message: 'Webhook processing failed' });
    }
  });

  // WHMCS Services API endpoints
  app.get('/api/whmcs/services', async (req, res) => {
    try {
      // getWHMCSProducts and aramisTechMaintenanceServices already imported
      
      // Try to fetch live services from WHMCS, fallback to predefined services
      let services = await getWHMCSProducts();
      
      if (!services || services.length === 0) {
        services = aramisTechMaintenanceServices;
      }
      
      res.json({
        success: true,
        services: services
      });
    } catch (error) {
      console.error('WHMCS Services API Error:', error);
      res.json({
        success: true,
        services: aramisTechMaintenanceServices
      });
    }
  });

  app.get('/api/whmcs/services/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      // Try to fetch live service details from WHMCS
      let service = await getWHMCSProductDetails(parseInt(id));
      
      if (!service) {
        // Fallback to predefined services
        for (const group of aramisTechMaintenanceServices) {
          const foundService = group.products.find(p => p.id === parseInt(id));
          if (foundService) {
            service = foundService;
            break;
          }
        }
      }
      
      if (service) {
        res.json({
          success: true,
          service: service
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }
    } catch (error) {
      console.error('WHMCS Service Details API Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve service details'
      });
    }
  });

  // Order initiation endpoint
  app.post('/api/whmcs/order', async (req, res) => {
    try {
      const { serviceId, billingCycle, customerInfo } = req.body;
      
      // Validate required fields
      if (!serviceId || !billingCycle || !customerInfo) {
        return res.status(400).json({
          success: false,
          message: 'Missing required order information'
        });
      }

      // Get service details for pricing
      let service = await getWHMCSProductDetails(parseInt(serviceId));
      
      if (!service) {
        // Fallback to predefined services
        for (const group of aramisTechMaintenanceServices) {
          const foundService = group.products.find(p => p.id === parseInt(serviceId));
          if (foundService) {
            service = foundService;
            break;
          }
        }
      }

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      // Store order information in database for tracking
      const orderData = {
        service_id: serviceId,
        service_name: service.name,
        billing_cycle: billingCycle,
        customer_info: customerInfo,
        order_date: new Date(),
        status: 'pending',
        order_url: service.order_url
      };

      // In a real implementation, you would store this in the database
      // For now, we'll return the order information with redirect URL
      
      res.json({
        success: true,
        message: 'Order prepared successfully',
        order: orderData,
        redirect_url: `${service.order_url}&billingcycle=${billingCycle}`,
        billing_portal_url: 'https://billing.aramistech.com'
      });
    } catch (error) {
      console.error('WHMCS Order API Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to process order'
      });
    }
  });

  // Authorize.Net Payment Processing
  app.post('/api/authorize-net/process-payment', async (req, res) => {
    try {
      // processAuthorizeNetPayment and validateCreditCard already imported
      
      // Validate card number
      if (!validateCreditCard(req.body.cardNumber)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid credit card number'
        });
      }

      // Process payment
      const result = await processAuthorizeNetPayment(req.body);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      res.status(500).json({
        success: false,
        message: 'Payment processing failed. Please try again.'
      });
    }
  });

  // Order status lookup
  app.get('/api/orders/:orderId', async (req, res) => {
    try {
      const { orderId } = req.params;
      
      // In a real implementation, you would look up the order in your database
      // For now, return a success message for valid order IDs
      if (orderId.startsWith('ORD_')) {
        res.json({
          success: true,
          order: {
            id: orderId,
            status: 'completed',
            message: 'Your service order has been processed successfully.'
          }
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    } catch (error) {
      console.error('Order lookup error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve order information'
      });
    }
  });

  // Country Blocking Management API endpoints
  app.get('/api/admin/country-blocking', requireAdminAuth, async (req, res) => {
    try {
      const settings = await storage.getCountryBlockingSettings();
      const blockedCountries = await storage.getBlockedCountries();
      res.json({ 
        success: true, 
        settings: settings || {
          isEnabled: false,
          blockMessage: "This service is not available in your region.",
          messageTitle: "Service Not Available",
          fontSize: "text-lg",
          fontColor: "#374151",
          backgroundColor: "#f9fafb",
          borderColor: "#e5e7eb",
          showContactInfo: true,
          contactMessage: "If you believe this is an error, please contact us."
        },
        blockedCountries: blockedCountries || []
      });
    } catch (error) {
      console.error('Error fetching country blocking data:', error);
      res.status(500).json({ error: 'Failed to fetch country blocking data' });
    }
  });

  app.put('/api/admin/country-blocking', requireAdminAuth, async (req, res) => {
    try {
      const validatedData = insertCountryBlockingSchema.parse(req.body);
      const updated = await storage.updateCountryBlockingSettings(validatedData);
      res.json({ success: true, settings: updated });
    } catch (error) {
      console.error('Error updating country blocking settings:', error);
      res.status(400).json({ error: 'Failed to update country blocking settings' });
    }
  });

  app.post('/api/admin/country-blocking/countries', requireAdminAuth, async (req, res) => {
    try {
      const { countryCode, countryName } = req.body;
      if (!countryCode || !countryName) {
        return res.status(400).json({ error: 'Country code and name are required' });
      }
      
      const country = await storage.addBlockedCountry({ countryCode, countryName });
      res.json({ success: true, country });
    } catch (error) {
      console.error('Error adding blocked country:', error);
      res.status(400).json({ error: 'Failed to add blocked country' });
    }
  });

  app.delete('/api/admin/country-blocking/countries/:id', requireAdminAuth, async (req, res) => {
    try {
      const countryId = parseInt(req.params.id);
      await storage.removeBlockedCountry(countryId);
      res.json({ success: true, message: 'Country removed from block list' });
    } catch (error) {
      console.error('Error removing blocked country:', error);
      res.status(500).json({ error: 'Failed to remove blocked country' });
    }
  });

  // Public endpoint to check visitor's country
  app.get('/api/visitor-country', async (req, res) => {
    try {
      const clientIP = req.headers['x-forwarded-for'] || 
                      req.headers['x-real-ip'] || 
                      req.connection.remoteAddress || 
                      req.socket.remoteAddress ||
                      '127.0.0.1';
      
      // Extract IP if it's in the format "ip, ip"
      const ip = Array.isArray(clientIP) ? clientIP[0] : clientIP.split(',')[0].trim();
      
      // Skip blocking for local development
      if (ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return res.json({ 
          success: true, 
          country: { code: 'US', name: 'United States' },
          blocked: false 
        });
      }

      // Free IP geolocation service - ip-api.com (1000 requests/month free)
      const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,message,country,countryCode`);
      const data = await response.json();
      
      if (data.status === 'fail') {
        // If geolocation fails, allow access by default
        return res.json({ 
          success: true, 
          country: { code: 'UNKNOWN', name: 'Unknown' },
          blocked: false 
        });
      }

      // Check if country is blocked
      const settings = await storage.getCountryBlockingSettings();
      const blockedCountries = await storage.getBlockedCountries();
      const isBlocked = settings?.isEnabled && blockedCountries.some(bc => bc.countryCode === data.countryCode);
      
      res.json({ 
        success: true, 
        country: { code: data.countryCode, name: data.country },
        blocked: isBlocked,
        settings: isBlocked ? settings : null
      });
    } catch (error) {
      console.error('Error checking visitor country:', error);
      // If service fails, allow access by default
      res.json({ 
        success: true, 
        country: { code: 'UNKNOWN', name: 'Unknown' },
        blocked: false 
      });
    }
  });

  // Dashboard Statistics API
  app.get('/api/dashboard/stats', async (req, res) => {
    try {
      // Get counts from database
      const [contactsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(contacts);
      const [quotesResult] = await db.select({ count: sql<number>`count(*)::int` }).from(quickQuotes);
      
      // Get recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const [recentContactsResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(contacts)
        .where(gte(contacts.createdAt, thirtyDaysAgo));
      
      const [recentQuotesResult] = await db
        .select({ count: sql<number>`count(*)::int` })
        .from(quickQuotes)
        .where(gte(quickQuotes.createdAt, thirtyDaysAgo));

      // Get Google Reviews count if Place ID is configured
      let googleReviewsCount = 0;
      let reviewSource = 'database';
      const placeId = process.env.ARAMISTECH_PLACE_ID;
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      
      if (placeId && apiKey) {
        try {
          const response = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=user_ratings_total&key=${apiKey}`
          );
          const data = await response.json();
          if (data.status === 'OK' && data.result?.user_ratings_total) {
            googleReviewsCount = data.result.user_ratings_total;
            reviewSource = 'google';
          } else {
            console.log('Google Places API response:', data);
          }
        } catch (error) {
          console.error('Error fetching Google Reviews:', error);
        }
      }

      // Fallback to database reviews if Google API fails
      const [reviewsResult] = await db.select({ count: sql<number>`count(*)::int` }).from(reviews);
      const fallbackReviewCount = reviewsResult?.count || 0;

      const stats = {
        totalReviews: googleReviewsCount > 0 ? googleReviewsCount : fallbackReviewCount,
        reviewSource: googleReviewsCount > 0 ? 'google' : 'database',
        totalContacts: contactsResult?.count || 0,
        totalQuotes: quotesResult?.count || 0,
        recentContacts: recentContactsResult?.count || 0,
        recentQuotes: recentQuotesResult?.count || 0,
        googleReviewsEnabled: !!(placeId && apiKey),
        lastUpdated: new Date().toISOString()
      };

      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({ success: false, error: 'Failed to fetch dashboard statistics' });
    }
  });

  // SEO Sitemap Generation
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = 'https://aramistech.com';
    const currentDate = new Date().toISOString();
    
    const urls = [
      // Main pages
      { loc: `${baseUrl}/`, priority: '1.0', changefreq: 'weekly' },
      { loc: `${baseUrl}/windows10-upgrade`, priority: '0.9', changefreq: 'weekly' },
      { loc: `${baseUrl}/ai-development`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${baseUrl}/ip-lookup`, priority: '0.7', changefreq: 'monthly' },
      { loc: `${baseUrl}/knowledge-base`, priority: '0.8', changefreq: 'weekly' },
      { loc: `${baseUrl}/services-order`, priority: '0.8', changefreq: 'monthly' },
      { loc: `${baseUrl}/service-calculator`, priority: '0.7', changefreq: 'monthly' }
    ];

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
                            http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

    res.set('Content-Type', 'application/xml');
    res.send(sitemap);
  });

  // Robots.txt for SEO
  app.get('/robots.txt', (req, res) => {
    const robotsTxt = `User-agent: *
Allow: /

# Allow crawling of all content
Allow: /windows10-upgrade
Allow: /ai-development
Allow: /ip-lookup
Allow: /knowledge-base
Allow: /services-order
Allow: /service-calculator

# Disallow admin areas
Disallow: /admin/

# Sitemap location
Sitemap: https://aramistech.com/sitemap.xml`;

    res.set('Content-Type', 'text/plain');
    res.send(robotsTxt);
  });

  return httpServer;
}
