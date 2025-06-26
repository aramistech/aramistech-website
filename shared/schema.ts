import { pgTable, text, varchar, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  isActive: boolean("is_active").default(true),
  lastLogin: timestamp("last_login"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company").notNull(),
  service: text("service"),
  employees: text("employees"),
  challenges: text("challenges"),
  contactTime: text("contact_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const quickQuotes = pgTable("quick_quotes", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  customerName: text("customer_name").notNull(),
  rating: integer("rating").notNull(), // 1-5 stars
  reviewText: text("review_text").notNull(),
  businessName: text("business_name"),
  location: text("location"),
  datePosted: timestamp("date_posted").defaultNow(),
  isVisible: boolean("is_visible").default(true).notNull(),
  source: text("source").default("manual").notNull(), // google, manual, website
});

export const menuItems = pgTable("menu_items", {
  id: serial("id").primaryKey(),
  label: text("label").notNull(),
  href: text("href"),
  parentId: integer("parent_id"),
  orderIndex: integer("order_index").default(0).notNull(),
  isVisible: boolean("is_visible").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const adminSessions = pgTable("admin_sessions", {
  id: text("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const exitIntentPopup = pgTable("exit_intent_popup", {
  id: serial("id").primaryKey(),
  title: text("title").notNull().default("Wait! Don't Leave Yet"),
  message: text("message").notNull().default("Get a free IT consultation before you go! Our experts are standing by to help with your technology needs."),
  buttonText: text("button_text").notNull().default("Get Free Consultation"),
  buttonUrl: text("button_url").notNull().default("/contact"),
  imageUrl: text("image_url"),
  isActive: boolean("is_active").notNull().default(true),
  backgroundColor: text("background_color").notNull().default("#ffffff"),
  textColor: text("text_color").notNull().default("#000000"),
  buttonColor: text("button_color").notNull().default("#2563eb"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const mediaFiles = pgTable("media_files", {
  id: serial("id").primaryKey(),
  fileName: text("file_name").notNull(),
  originalName: text("original_name").notNull(),
  mimeType: text("mime_type").notNull(),
  fileSize: integer("file_size").notNull(),
  filePath: text("file_path").notNull(),
  url: text("url").notNull(),
  altText: text("alt_text"),
  caption: text("caption"),
  uploadedAt: timestamp("uploaded_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  isActive: true,
});

export const updateUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  isActive: true,
}).extend({
  password: z.string().optional(),
});

export const insertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  parentId: z.union([z.number(), z.null()]).optional(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({
  id: true,
  createdAt: true,
});

export const insertQuickQuoteSchema = createInsertSchema(quickQuotes).omit({
  id: true,
  createdAt: true,
});

export const insertReviewSchema = createInsertSchema(reviews).omit({
  id: true,
  datePosted: true,
});

export const insertExitIntentPopupSchema = createInsertSchema(exitIntentPopup).pick({
  title: true,
  message: true,
  buttonText: true,
  buttonUrl: true,
  imageUrl: true,
  isActive: true,
  backgroundColor: true,
  textColor: true,
  buttonColor: true,
});

export const insertMediaFileSchema = createInsertSchema(mediaFiles).pick({
  fileName: true,
  originalName: true,
  mimeType: true,
  fileSize: true,
  filePath: true,
  url: true,
  altText: true,
  caption: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type QuickQuote = typeof quickQuotes.$inferSelect;
export type InsertQuickQuote = z.infer<typeof insertQuickQuoteSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;
export type ExitIntentPopup = typeof exitIntentPopup.$inferSelect;
export type InsertExitIntentPopup = z.infer<typeof insertExitIntentPopupSchema>;
export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;
