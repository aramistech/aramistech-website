import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertQuickQuoteSchema, insertReviewSchema } from "@shared/schema";
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

  const httpServer = createServer(app);
  return httpServer;
}
