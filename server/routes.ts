import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { insertContactSchema, insertQuickQuoteSchema, insertAIConsultationSchema, insertITConsultationSchema, insertReviewSchema, insertUserSchema, updateUserSchema, insertMenuItemSchema, insertExitIntentPopupSchema, insertMediaFileSchema, insertKnowledgeBaseCategorySchema, insertKnowledgeBaseArticleSchema, insertSecurityAlertSchema, insertColorPaletteSchema, insertPricingCalculationSchema, insertServiceCategorySchema, insertServiceOptionSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { hashPassword, verifyPassword, createAdminSession, requireAdminAuth } from "./auth";
import { z } from "zod";
import { whmcsConfig, validateWHMCSConfig, validateWHMCSWebhook } from "./whmcs-config";
import { sendQuickQuoteEmail, sendContactEmail, sendAIConsultationEmail, sendITConsultationEmail, sendTechnicianTransferNotification, sendServiceCalculatorEmail } from "./email-service";
import { testAWSConnection } from "./test-aws";

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
      const { username, password } = req.body;
      
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const isValidPassword = await verifyPassword(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: "Invalid credentials" });
      }

      const sessionId = await createAdminSession(user.id);
      
      res.cookie('admin_session', sessionId, {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        sameSite: 'lax'
      });

      res.json({ success: true, user: { id: user.id, username: user.username } });
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
        title: req.body.title,
        message: req.body.message,
        buttonText: req.body.buttonText,
        buttonLink: req.body.buttonLink,
        backgroundColor: req.body.backgroundColor,
        textColor: req.body.textColor,
        buttonBackgroundColor: req.body.buttonBackgroundColor,
        buttonTextColor: req.body.buttonTextColor,
        iconType: req.body.iconType,
        mobileTitle: req.body.mobileTitle,
        mobileSubtitle: req.body.mobileSubtitle,
        mobileDescription: req.body.mobileDescription,
        mobileButtonText: req.body.mobileButtonText,
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
      // Helper function to read actual URL from file
      const readUrlFromFile = (filePath: string, fallbackUrl: string): string => {
        try {
          const fullPath = path.join(process.cwd(), filePath);
          const content = fs.readFileSync(fullPath, 'utf-8');
          
          // Look for src= attributes first (prioritize /api/media/ URLs)
          const srcMatches = content.match(/src=["']([^"']+)["']/g);
          if (srcMatches) {
            for (const match of srcMatches) {
              const urlMatch = match.match(/src=["']([^"']+)["']/);
              if (urlMatch && urlMatch[1]) {
                const url = urlMatch[1];
                // Prioritize media library URLs
                if (url.includes('/api/media/')) {
                  return url;
                }
                // Also accept other image URLs
                if (url.includes('images.unsplash.com') || url.includes('aramistech.com') || url.includes('.png') || url.includes('.jpg') || url.includes('.svg')) {
                  return url;
                }
              }
            }
          }
          
          // Look for backgroundImage styles
          const bgMatches = content.match(/backgroundImage:\s*["']?url\(["']?([^"')]+)["']?\)["']?/g);
          if (bgMatches) {
            for (const match of bgMatches) {
              const urlMatch = match.match(/url\(["']?([^"')]+)["']?\)/);
              if (urlMatch && urlMatch[1]) {
                return urlMatch[1];
              }
            }
          }
          
          // Debug logging
          console.log(`File scan for ${filePath}: No matching URL found, using fallback: ${fallbackUrl}`);
          return fallbackUrl;
        } catch (error) {
          console.error(`Error reading file ${filePath}:`, error);
          return fallbackUrl;
        }
      };

      // Complete list of all website images
      const knownImages = [
        // Company Logos
        {
          id: "company-logo-header",
          label: "AramisTech Logo (Header)", 
          description: "Main company logo in website header navigation",
          currentUrl: readUrlFromFile("client/src/components/header.tsx", "https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png"),
          filePath: "client/src/components/header.tsx",
          lineNumber: 140,
          category: "Company Branding"
        },
        {
          id: "company-logo-footer",
          label: "AramisTech Logo (Footer)",
          description: "Company logo in website footer", 
          currentUrl: readUrlFromFile("client/src/components/footer.tsx", "https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png"),
          filePath: "client/src/components/footer.tsx",
          lineNumber: 42,
          category: "Company Branding"
        },
        {
          id: "company-logo-dynamic-header",
          label: "AramisTech Logo (Dynamic Header)",
          description: "Company logo in dynamic header component",
          currentUrl: readUrlFromFile("client/src/components/dynamic-header.tsx", "https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png"), 
          filePath: "client/src/components/dynamic-header.tsx",
          lineNumber: 42,
          category: "Company Branding"
        },
        {
          id: "company-logo-exit-popup",
          label: "AramisTech Logo (Exit Popup)",
          description: "Company logo in exit intent popup",
          currentUrl: "https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png",
          filePath: "client/src/components/exit-intent-popup.tsx", 
          lineNumber: 118,
          category: "Company Branding"
        },
        // Team Photos
        {
          id: "team-aramis",
          label: "Aramis Figueroa",
          description: "CEO and founder photo in team section",
          currentUrl: "/api/media/15/file",
          filePath: "client/src/components/team.tsx",
          lineNumber: 7,
          category: "Team Photos"
        },
        {
          id: "team-gabriel", 
          label: "Gabriel Figueroa",
          description: "CTO photo in team section",
          currentUrl: "/api/media/21/file",
          filePath: "client/src/components/team.tsx",
          lineNumber: 21,
          category: "Team Photos"
        },
        {
          id: "team-aramis-m",
          label: "Aramis M. Figueroa", 
          description: "IT/Software Developer photo in team section",
          currentUrl: readUrlFromFile("client/src/components/team.tsx", "https://aramistech.com/wp-content/uploads/2024/09/Grayprofile-pic2-600x600-1.png"),
          filePath: "client/src/components/team.tsx",
          lineNumber: 14,
          category: "Team Photos"
        },
        // Section Images
        {
          id: "hero-it-team",
          label: "IT Team Collaboration",
          description: "Professional IT team image in hero section",
          currentUrl: readUrlFromFile("client/src/components/hero.tsx", "https://images.unsplash.com/photo-1551434678-e076c223a692"),
          filePath: "client/src/components/hero.tsx",
          lineNumber: 91,
          category: "Section Images"
        },
        {
          id: "about-office",
          label: "Office Technology Setup", 
          description: "Modern office technology setup image in About section",
          currentUrl: readUrlFromFile("client/src/components/about.tsx", "https://images.unsplash.com/photo-1497366216548-37526070297c"),
          filePath: "client/src/components/about.tsx",
          lineNumber: 17,
          category: "Section Images"
        },
        {
          id: "contact-skyline",
          label: "South Florida Skyline",
          description: "South Florida skyline image in Contact section", 
          currentUrl: readUrlFromFile("client/src/components/contact.tsx", "https://images.unsplash.com/photo-1506905925346-21bda4d32df4"),
          filePath: "client/src/components/contact.tsx",
          lineNumber: 217,
          category: "Section Images"
        },
        // Page Backgrounds
        {
          id: "windows10-background",
          label: "Windows 10 Background",
          description: "Clean Windows 10 desktop background image",
          currentUrl: "/windows10-bg.png",
          filePath: "client/src/pages/windows10-upgrade.tsx",
          lineNumber: 151,
          category: "Page Backgrounds"
        },
        // Video & Media
        {
          id: "testimonial-video-poster", 
          label: "Customer Testimonial Poster",
          description: "Video poster image for customer testimonial",
          currentUrl: "/video-poster.svg",
          filePath: "client/src/pages/windows10-upgrade.tsx",
          lineNumber: 253,
          category: "Video & Media"
        }
      ];
      
      res.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      res.set('Pragma', 'no-cache');
      res.set('Expires', '0');
      res.json({ 
        success: true, 
        images: knownImages,
        totalFound: knownImages.length,
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

  // Visual Image Manager API
  app.post('/api/admin/update-website-image', requireAdminAuth, async (req, res) => {
    try {
      const { imageId, newMediaId } = req.body;
      console.log(`Visual Image Manager: Updating ${imageId} with media ID ${newMediaId}`);
      
      // Define image mappings
      const imageMap: Record<string, {filePath: string, targetIndex?: number, searchPattern?: string}> = {
        // Company Logo Images
        'company-logo-header': {
          filePath: 'client/src/components/header.tsx',
          searchPattern: 'https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png'
        },
        'company-logo-footer': {
          filePath: 'client/src/components/footer.tsx',
          searchPattern: 'https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png'
        },
        'company-logo-dynamic-header': {
          filePath: 'client/src/components/dynamic-header.tsx',
          searchPattern: 'https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png'
        },
        'company-logo-exit-popup': {
          filePath: 'client/src/components/exit-intent-popup.tsx',
          searchPattern: 'https://aramistech.com/wp-content/uploads/2024/09/AramistechLogoNoLine.png'
        },
        // Team Photos
        'team-aramis': {
          filePath: 'client/src/components/team.tsx',
          targetIndex: 0
        },
        'team-gabriel': {
          filePath: 'client/src/components/team.tsx',
          targetIndex: 1
        },
        'team-aramis-m': {
          filePath: 'client/src/components/team.tsx',
          targetIndex: 2
        },
        // Section Images
        'hero-it-team': {
          filePath: 'client/src/components/hero.tsx',
          searchPattern: 'https://images.unsplash.com/photo-1551434678-e076c223a692'
        },
        'about-office': {
          filePath: 'client/src/components/about.tsx',
          searchPattern: 'https://images.unsplash.com/photo-1497366216548-37526070297c'
        },
        'contact-skyline': {
          filePath: 'client/src/components/contact.tsx',
          searchPattern: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4'
        },
        // Page Background Images
        'windows10-background': {
          filePath: 'client/src/pages/windows10-upgrade.tsx',
          searchPattern: '/windows10-bg.png'
        },
        // Video & Media
        'testimonial-video-poster': {
          filePath: 'client/src/pages/windows10-upgrade.tsx',
          searchPattern: 'poster="/video-poster.svg"'
        }
      };

      const imageConfig = imageMap[imageId];
      if (!imageConfig) {
        console.log(`Visual Image Manager: Invalid image ID ${imageId}. Available IDs:`, Object.keys(imageMap));
        return res.status(400).json({ error: 'Invalid image ID' });
      }
      
      console.log(`Visual Image Manager: Found config for ${imageId}:`, imageConfig);

      // Read the file
      const filePath = path.join(process.cwd(), imageConfig.filePath);
      let fileContent = fs.readFileSync(filePath, 'utf8');
      
      if (imageConfig.searchPattern) {
        // Handle specific pattern replacement (for non-team images)
        if (imageConfig.searchPattern.includes('poster=')) {
          // Special case for video poster
          fileContent = fileContent.replace(
            /poster="[^"]*"/g,
            `poster="/api/media/${newMediaId}/file"`
          );
        } else {
          // Handle different image contexts
          if (imageConfig.searchPattern.includes('unsplash.com')) {
            // Replace Unsplash URLs in src attributes
            const regex = new RegExp(`src="[^"]*${imageConfig.searchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"`, 'g');
            fileContent = fileContent.replace(regex, `src="/api/media/${newMediaId}/file"`);
          } else if (imageConfig.searchPattern.startsWith('/')) {
            // Replace background images in CSS style attributes
            const regex = new RegExp(`url\\([^)]*${imageConfig.searchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^)]*\\)`, 'g');
            fileContent = fileContent.replace(regex, `url(/api/media/${newMediaId}/file)`);
            
            // Also handle src attributes for the same image
            const srcRegex = new RegExp(`src="[^"]*${imageConfig.searchPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^"]*"`, 'g');
            fileContent = fileContent.replace(srcRegex, `src="/api/media/${newMediaId}/file"`);
          }
        }
      } else if (imageConfig.targetIndex !== undefined) {
        // Handle team member images with target index
        const lines = fileContent.split('\n');
        let foundImages = 0;
        
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          
          // Look for image lines
          if (line.includes('image:') && (line.includes('"/api/media/') || line.includes('"https://aramistech.com'))) {
            // Update the correct occurrence based on target index
            if (foundImages === imageConfig.targetIndex) {
              lines[i] = line.replace(/image: "[^"]*"/, `image: "/api/media/${newMediaId}/file"`);
              break;
            }
            foundImages++;
          }
        }
        fileContent = lines.join('\n');
      }

      // Write the updated content back
      fs.writeFileSync(filePath, fileContent, 'utf8');
      console.log(`Visual Image Manager: Successfully updated ${imageId} in ${imageConfig.filePath}`);

      res.json({ success: true, message: 'Image updated successfully' });
    } catch (error: any) {
      console.error('Visual Image Manager Error:', error);
      res.status(500).json({ 
        error: 'Failed to update image', 
        details: error?.message || 'Unknown error'
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

      const fileUrl = `/uploads/${req.file.filename}`;
      const mediaData = {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        fileSize: req.file.size,
        filePath: req.file.path,
        url: fileUrl,
        altText: req.body.altText || '',
        caption: req.body.caption || '',
      };

      const validatedData = insertMediaFileSchema.parse(mediaData);
      const file = await storage.uploadMediaFile(validatedData);
      res.json({ success: true, file });
    } catch (error) {
      console.error("Error uploading file:", error);
      res.status(500).json({ error: "Failed to upload file" });
    }
  });

  app.get("/api/admin/media", requireAdminAuth, async (req, res) => {
    try {
      const files = await storage.getMediaFiles();
      res.json({ success: true, files });
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

  // Website scanning endpoint
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
              wss.clients.forEach((client) => {
                if (client.readyState === WebSocket.OPEN && 
                    (client as any).sessionId === data.sessionId) {
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
  
  return httpServer;
}
