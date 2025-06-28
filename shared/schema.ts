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

export const aiConsultations = pgTable("ai_consultations", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  company: text("company"),
  industry: text("industry"),
  businessSize: text("business_size"),
  currentAIUsage: text("current_ai_usage"),
  aiInterests: text("ai_interests").array(),
  projectTimeline: text("project_timeline"),
  budget: text("budget"),
  projectDescription: text("project_description").notNull(),
  preferredContactTime: text("preferred_contact_time"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const itConsultations = pgTable("it_consultations", {
  id: serial("id").primaryKey(),
  firstName: varchar("first_name", { length: 255 }).notNull(),
  lastName: varchar("last_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  phone: varchar("phone", { length: 50 }).notNull(),
  company: varchar("company", { length: 255 }),
  employees: varchar("employees", { length: 100 }),
  services: text("services").array().notNull(),
  urgency: varchar("urgency", { length: 100 }),
  budget: varchar("budget", { length: 100 }),
  challenges: text("challenges").notNull(),
  preferredContactTime: varchar("preferred_contact_time", { length: 100 }),
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

export const knowledgeBaseCategories = pgTable("knowledge_base_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  description: text("description"),
  orderIndex: integer("order_index").default(0),
  isVisible: boolean("is_visible").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const knowledgeBaseArticles = pgTable("knowledge_base_articles", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull().unique(),
  content: text("content").notNull(),
  excerpt: text("excerpt"),
  categoryId: integer("category_id").references(() => knowledgeBaseCategories.id),
  tags: text("tags").array(),
  isPublished: boolean("is_published").default(true),
  viewCount: integer("view_count").default(0),
  orderIndex: integer("order_index").default(0),
  metaTitle: text("meta_title"),
  metaDescription: text("meta_description"),
  createdAt: timestamp("created_at").defaultNow(),
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

export const insertAIConsultationSchema = createInsertSchema(aiConsultations).omit({
  id: true,
  createdAt: true,
});

export const insertITConsultationSchema = createInsertSchema(itConsultations).omit({
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

export const insertKnowledgeBaseCategorySchema = createInsertSchema(knowledgeBaseCategories).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertKnowledgeBaseArticleSchema = createInsertSchema(knowledgeBaseArticles).omit({
  id: true,
  viewCount: true,
  createdAt: true,
  updatedAt: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type UpdateUser = z.infer<typeof updateUserSchema>;
export type User = typeof users.$inferSelect;
export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type QuickQuote = typeof quickQuotes.$inferSelect;
export type InsertQuickQuote = z.infer<typeof insertQuickQuoteSchema>;
export type AIConsultation = typeof aiConsultations.$inferSelect;
export type InsertAIConsultation = z.infer<typeof insertAIConsultationSchema>;
export type ITConsultation = typeof itConsultations.$inferSelect;
export type InsertITConsultation = z.infer<typeof insertITConsultationSchema>;
export type Review = typeof reviews.$inferSelect;
export type InsertReview = z.infer<typeof insertReviewSchema>;
export type MenuItem = typeof menuItems.$inferSelect;
export type InsertMenuItem = z.infer<typeof insertMenuItemSchema>;
export type AdminSession = typeof adminSessions.$inferSelect;
export type ExitIntentPopup = typeof exitIntentPopup.$inferSelect;
export type InsertExitIntentPopup = z.infer<typeof insertExitIntentPopupSchema>;
export type MediaFile = typeof mediaFiles.$inferSelect;
export type InsertMediaFile = z.infer<typeof insertMediaFileSchema>;
export type KnowledgeBaseCategory = typeof knowledgeBaseCategories.$inferSelect;
export type InsertKnowledgeBaseCategory = z.infer<typeof insertKnowledgeBaseCategorySchema>;
export type KnowledgeBaseArticle = typeof knowledgeBaseArticles.$inferSelect;
export type InsertKnowledgeBaseArticle = z.infer<typeof insertKnowledgeBaseArticleSchema>;

// Live chat system tables
export const chatSessions = pgTable("chat_sessions", {
  id: serial("id").primaryKey(),
  sessionId: varchar("session_id", { length: 255 }).notNull().unique(),
  customerName: varchar("customer_name", { length: 255 }),
  customerEmail: varchar("customer_email", { length: 255 }),
  customerPhone: varchar("customer_phone", { length: 20 }),
  status: varchar("status", { length: 20 }).default("active"), // active, transferred, closed
  isHumanTransfer: boolean("is_human_transfer").default(false),
  transferredAt: timestamp("transferred_at"),
  closedAt: timestamp("closed_at"),
  adminUserId: integer("admin_user_id").references(() => users.id),
  lastMessageAt: timestamp("last_message_at").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const chatMessages = pgTable("chat_messages", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").references(() => chatSessions.id, { onDelete: "cascade" }).notNull(),
  sender: varchar("sender", { length: 20 }).notNull(), // customer, bot, admin
  senderName: varchar("sender_name", { length: 255 }),
  message: text("message").notNull(),
  messageType: varchar("message_type", { length: 20 }).default("text"), // text, file, system
  metadata: text("metadata"), // JSON string for additional data
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const adminChatSettings = pgTable("admin_chat_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  isOnline: boolean("is_online").default(false),
  awayMessage: text("away_message"),
  notificationsEnabled: boolean("notifications_enabled").default(true),
  autoResponseEnabled: boolean("auto_response_enabled").default(true),
  workingHoursStart: varchar("working_hours_start", { length: 5 }).default("09:00"),
  workingHoursEnd: varchar("working_hours_end", { length: 5 }).default("17:00"),
  weekendAvailable: boolean("weekend_available").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const securityAlerts = pgTable("security_alerts", {
  id: serial("id").primaryKey(),
  isEnabled: boolean("is_enabled").default(true),
  title: varchar("title", { length: 255 }).notNull().default("CRITICAL"),
  message: text("message").notNull().default("Windows 10 Support Ending - Your Systems Will Become Vulnerable to New Threats"),
  buttonText: varchar("button_text", { length: 100 }).notNull().default("Learn More"),
  buttonLink: varchar("button_link", { length: 255 }).notNull().default("/windows10-upgrade"),
  backgroundColor: varchar("background_color", { length: 50 }).notNull().default("bg-red-600"),
  textColor: varchar("text_color", { length: 50 }).notNull().default("text-white"),
  iconType: varchar("icon_type", { length: 50 }).notNull().default("AlertTriangle"),
  mobileTitle: varchar("mobile_title", { length: 255 }).notNull().default("CRITICAL SECURITY ALERT"),
  mobileSubtitle: varchar("mobile_subtitle", { length: 255 }).notNull().default("Windows 10 Support Ending"),
  mobileDescription: text("mobile_description").notNull().default("Your Systems Will Become Vulnerable to New Threats. Microsoft is ending Windows 10 support on October 14, 2025. After this date, your systems will no longer receive security updates, leaving them exposed to new cyber threats."),
  mobileButtonText: varchar("mobile_button_text", { length: 100 }).notNull().default("Get Protected Now"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Chat schemas
export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertAdminChatSettingsSchema = createInsertSchema(adminChatSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertSecurityAlertSchema = createInsertSchema(securityAlerts).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Chat types
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type AdminChatSettings = typeof adminChatSettings.$inferSelect;
export type InsertAdminChatSettings = z.infer<typeof insertAdminChatSettingsSchema>;

// Security Alert types
export type SecurityAlert = typeof securityAlerts.$inferSelect;
export type InsertSecurityAlert = z.infer<typeof insertSecurityAlertSchema>;
