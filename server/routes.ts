import type { Express } from "express";
import express from "express";
import { createServer, type Server } from "http";
import cookieParser from "cookie-parser";
import { storage } from "./storage";
import { insertContactSchema, insertQuickQuoteSchema, insertReviewSchema, insertUserSchema, updateUserSchema, insertMenuItemSchema, insertExitIntentPopupSchema, insertMediaFileSchema } from "@shared/schema";
import multer from "multer";
import path from "path";
import fs from "fs";
import { hashPassword, verifyPassword, createAdminSession, requireAdminAuth } from "./auth";
import { z } from "zod";
import { whmcsConfig, validateWHMCSConfig, validateWHMCSWebhook } from "./whmcs-config";

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

  const httpServer = createServer(app);
  return httpServer;
}
