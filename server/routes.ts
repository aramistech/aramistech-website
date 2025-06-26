import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertQuickQuoteSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
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
      const placeId = req.query.place_id || "ChIJwdS0isO52YgRMkrde8V_XKI"; // Default to found business
      const apiKey = process.env.GOOGLE_PLACES_API_KEY;
      
      if (!apiKey) {
        return res.status(500).json({
          success: false,
          message: "Google Places API key not configured"
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

  const httpServer = createServer(app);
  return httpServer;
}
