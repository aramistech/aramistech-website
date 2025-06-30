import { users, contacts, quickQuotes, aiConsultations, itConsultations, reviews, menuItems, adminSessions, exitIntentPopup, mediaFiles, knowledgeBaseCategories, knowledgeBaseArticles, chatSessions, chatMessages, adminChatSettings, securityAlerts, colorPalette, serviceCategories, serviceOptions, pricingCalculations, staticServices, countryBlocking, blockedCountries, type User, type InsertUser, type UpdateUser, type Contact, type InsertContact, type QuickQuote, type InsertQuickQuote, type AIConsultation, type InsertAIConsultation, type ITConsultation, type InsertITConsultation, type Review, type InsertReview, type MenuItem, type InsertMenuItem, type AdminSession, type ExitIntentPopup, type InsertExitIntentPopup, type MediaFile, type InsertMediaFile, type KnowledgeBaseCategory, type InsertKnowledgeBaseCategory, type KnowledgeBaseArticle, type InsertKnowledgeBaseArticle, type ChatSession, type InsertChatSession, type ChatMessage, type InsertChatMessage, type AdminChatSettings, type InsertAdminChatSettings, type SecurityAlert, type InsertSecurityAlert, type ColorPalette, type InsertColorPalette, type ServiceCategory, type InsertServiceCategory, type ServiceOption, type InsertServiceOption, type PricingCalculation, type InsertPricingCalculation, type StaticService, type InsertStaticService, type CountryBlocking, type InsertCountryBlocking, type BlockedCountry, type InsertBlockedCountry } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, gt, sql, asc, ne } from "drizzle-orm";
import bcrypt from "bcryptjs";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContact): Promise<Contact>;
  createQuickQuote(quote: InsertQuickQuote): Promise<QuickQuote>;
  createAIConsultation(consultation: InsertAIConsultation): Promise<AIConsultation>;
  createITConsultation(consultation: InsertITConsultation): Promise<ITConsultation>;
  getContacts(): Promise<Contact[]>;
  getQuickQuotes(): Promise<QuickQuote[]>;
  getAIConsultations(): Promise<AIConsultation[]>;
  getITConsultations(): Promise<ITConsultation[]>;
  createReview(review: InsertReview): Promise<Review>;
  getReviews(): Promise<Review[]>;
  getVisibleReviews(): Promise<Review[]>;
  deleteReview(id: number): Promise<void>;
  updateReview(id: number, review: Partial<InsertReview>): Promise<Review>;
  // Admin authentication
  createAdminSession(userId: number, sessionId: string, expiresAt: Date): Promise<AdminSession>;
  getAdminSession(sessionId: string): Promise<AdminSession | undefined>;
  deleteAdminSession(sessionId: string): Promise<void>;
  // Menu management
  getMenuItems(): Promise<MenuItem[]>;
  createMenuItem(menuItem: InsertMenuItem): Promise<MenuItem>;
  updateMenuItem(id: number, menuItem: Partial<InsertMenuItem>): Promise<MenuItem>;
  deleteMenuItem(id: number): Promise<void>;
  // Admin user management
  getAllAdminUsers(): Promise<User[]>;
  createAdminUser(user: InsertUser): Promise<User>;
  updateAdminUser(id: number, user: Partial<UpdateUser>): Promise<User>;
  deleteAdminUser(id: number): Promise<void>;
  // 2FA Management
  enable2FA(userId: number, secret: string, backupCodes: string[]): Promise<User>;
  disable2FA(userId: number): Promise<User>;
  updateBackupCodes(userId: number, backupCodes: string[]): Promise<User>;
  // Exit intent popup management
  getExitIntentPopup(): Promise<ExitIntentPopup | undefined>;
  updateExitIntentPopup(popup: InsertExitIntentPopup): Promise<ExitIntentPopup>;
  // Media management
  uploadMediaFile(file: InsertMediaFile): Promise<MediaFile>;
  getMediaFiles(): Promise<MediaFile[]>;
  getMediaFileById(id: number): Promise<MediaFile | undefined>;
  updateMediaFile(id: number, file: Partial<InsertMediaFile>): Promise<MediaFile>;
  deleteMediaFile(id: number): Promise<void>;
  // Knowledge base management
  getKnowledgeBaseCategories(): Promise<KnowledgeBaseCategory[]>;
  createKnowledgeBaseCategory(category: InsertKnowledgeBaseCategory): Promise<KnowledgeBaseCategory>;
  updateKnowledgeBaseCategory(id: number, category: Partial<InsertKnowledgeBaseCategory>): Promise<KnowledgeBaseCategory>;
  deleteKnowledgeBaseCategory(id: number): Promise<void>;
  getKnowledgeBaseArticles(): Promise<KnowledgeBaseArticle[]>;
  getKnowledgeBaseArticlesByCategory(categoryId: number): Promise<KnowledgeBaseArticle[]>;
  getKnowledgeBaseArticleBySlug(slug: string): Promise<KnowledgeBaseArticle | undefined>;
  createKnowledgeBaseArticle(article: InsertKnowledgeBaseArticle): Promise<KnowledgeBaseArticle>;
  updateKnowledgeBaseArticle(id: number, article: Partial<InsertKnowledgeBaseArticle>): Promise<KnowledgeBaseArticle>;
  deleteKnowledgeBaseArticle(id: number): Promise<void>;
  incrementKnowledgeBaseArticleViews(id: number): Promise<void>;
  // Live chat management
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(sessionId: string): Promise<ChatSession | undefined>;
  getChatSessionById(id: number): Promise<ChatSession | undefined>;
  updateChatSession(id: number, session: Partial<InsertChatSession>): Promise<ChatSession>;
  getActiveChatSessions(): Promise<ChatSession[]>;
  getAdminChatSessions(adminUserId: number): Promise<ChatSession[]>;
  addChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: number): Promise<ChatMessage[]>;
  markMessagesAsRead(sessionId: number, sender: string): Promise<void>;
  getUnreadMessageCount(sessionId: number, sender: string): Promise<number>;
  getAdminChatSettings(userId: number): Promise<AdminChatSettings | undefined>;
  updateAdminChatSettings(userId: number, settings: Partial<InsertAdminChatSettings>): Promise<AdminChatSettings>;
  // Security alerts management
  getSecurityAlert(): Promise<SecurityAlert | undefined>;
  updateSecurityAlert(alert: Partial<InsertSecurityAlert>): Promise<SecurityAlert>;
  // Color palette management
  getColorPalette(): Promise<ColorPalette[]>;
  createColorPaletteItem(color: InsertColorPalette): Promise<ColorPalette>;
  updateColorPaletteItem(id: number, color: Partial<InsertColorPalette>): Promise<ColorPalette>;
  deleteColorPaletteItem(id: number): Promise<void>;
  // Service calculator management
  getServiceCategories(): Promise<ServiceCategory[]>;
  createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory>;
  updateServiceCategory(id: number, category: Partial<InsertServiceCategory>): Promise<ServiceCategory>;
  deleteServiceCategory(id: number): Promise<void>;
  getServiceOptions(categoryId?: number): Promise<ServiceOption[]>;
  createServiceOption(option: InsertServiceOption): Promise<ServiceOption>;
  updateServiceOption(id: number, option: Partial<InsertServiceOption>): Promise<ServiceOption>;
  deleteServiceOption(id: number): Promise<void>;
  createPricingCalculation(calculation: InsertPricingCalculation): Promise<PricingCalculation>;
  getPricingCalculations(): Promise<PricingCalculation[]>;
  updatePricingCalculation(id: number, calculation: Partial<InsertPricingCalculation>): Promise<PricingCalculation>;
  // Static services management
  getStaticServices(): Promise<StaticService[]>;
  getStaticServiceById(id: number): Promise<StaticService | undefined>;
  createStaticService(service: InsertStaticService): Promise<StaticService>;
  updateStaticService(id: number, service: Partial<InsertStaticService>): Promise<StaticService>;
  deleteStaticService(id: number): Promise<void>;
  reorderStaticServices(serviceIds: number[]): Promise<void>;
  // Country blocking management
  getCountryBlockingSettings(): Promise<CountryBlocking | undefined>;
  updateCountryBlockingSettings(settings: InsertCountryBlocking): Promise<CountryBlocking>;
  getBlockedCountries(): Promise<BlockedCountry[]>;
  addBlockedCountry(country: InsertBlockedCountry): Promise<BlockedCountry>;
  removeBlockedCountry(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async createContact(insertContact: InsertContact): Promise<Contact> {
    const [contact] = await db
      .insert(contacts)
      .values(insertContact)
      .returning();
    return contact;
  }

  async createQuickQuote(insertQuote: InsertQuickQuote): Promise<QuickQuote> {
    const [quote] = await db
      .insert(quickQuotes)
      .values(insertQuote)
      .returning();
    return quote;
  }

  async getContacts(): Promise<Contact[]> {
    return await db
      .select()
      .from(contacts)
      .orderBy(desc(contacts.createdAt));
  }

  async getQuickQuotes(): Promise<QuickQuote[]> {
    return await db
      .select()
      .from(quickQuotes)
      .orderBy(desc(quickQuotes.createdAt));
  }

  async createAIConsultation(insertConsultation: InsertAIConsultation): Promise<AIConsultation> {
    const [consultation] = await db
      .insert(aiConsultations)
      .values(insertConsultation)
      .returning();
    return consultation;
  }

  async getAIConsultations(): Promise<AIConsultation[]> {
    return await db
      .select()
      .from(aiConsultations)
      .orderBy(desc(aiConsultations.createdAt));
  }

  async createITConsultation(insertConsultation: InsertITConsultation): Promise<ITConsultation> {
    const [consultation] = await db
      .insert(itConsultations)
      .values(insertConsultation)
      .returning();
    return consultation;
  }

  async getITConsultations(): Promise<ITConsultation[]> {
    return await db
      .select()
      .from(itConsultations)
      .orderBy(desc(itConsultations.createdAt));
  }

  async createReview(insertReview: InsertReview): Promise<Review> {
    const [review] = await db
      .insert(reviews)
      .values(insertReview)
      .returning();
    return review;
  }

  async getReviews(): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .orderBy(desc(reviews.datePosted));
  }

  async getVisibleReviews(): Promise<Review[]> {
    return await db
      .select()
      .from(reviews)
      .where(eq(reviews.isVisible, true))
      .orderBy(desc(reviews.datePosted));
  }

  async deleteReview(id: number): Promise<void> {
    await db
      .delete(reviews)
      .where(eq(reviews.id, id));
  }

  async updateReview(id: number, reviewData: Partial<InsertReview>): Promise<Review> {
    const [updatedReview] = await db
      .update(reviews)
      .set(reviewData)
      .where(eq(reviews.id, id))
      .returning();
    return updatedReview;
  }

  // Admin authentication methods
  async createAdminSession(userId: number, sessionId: string, expiresAt: Date): Promise<AdminSession> {
    const [session] = await db
      .insert(adminSessions)
      .values({ id: sessionId, userId, expiresAt })
      .returning();
    return session;
  }

  async getAdminSession(sessionId: string): Promise<AdminSession | undefined> {
    const [session] = await db
      .select()
      .from(adminSessions)
      .where(and(
        eq(adminSessions.id, sessionId),
        gt(adminSessions.expiresAt, new Date())
      ));
    return session || undefined;
  }

  async deleteAdminSession(sessionId: string): Promise<void> {
    await db
      .delete(adminSessions)
      .where(eq(adminSessions.id, sessionId));
  }

  // Menu management methods
  async getMenuItems(): Promise<MenuItem[]> {
    return await db
      .select()
      .from(menuItems)
      .where(eq(menuItems.isVisible, true))
      .orderBy(menuItems.orderIndex);
  }

  async createMenuItem(menuItemData: InsertMenuItem): Promise<MenuItem> {
    const [menuItem] = await db
      .insert(menuItems)
      .values({
        ...menuItemData,
        updatedAt: new Date()
      })
      .returning();
    return menuItem;
  }

  async updateMenuItem(id: number, menuItemData: Partial<InsertMenuItem>): Promise<MenuItem> {
    // Validate and clean the data to prevent NaN values
    const cleanData: any = { ...menuItemData };
    
    // Remove or convert invalid values
    if (cleanData.parentId === undefined || cleanData.parentId === null || isNaN(cleanData.parentId)) {
      cleanData.parentId = null;
    }
    if (cleanData.orderIndex !== undefined && isNaN(cleanData.orderIndex)) {
      delete cleanData.orderIndex;
    }
    
    const [updatedMenuItem] = await db
      .update(menuItems)
      .set({
        ...cleanData,
        updatedAt: new Date()
      })
      .where(eq(menuItems.id, id))
      .returning();
    return updatedMenuItem;
  }

  async deleteMenuItem(id: number): Promise<void> {
    await db
      .delete(menuItems)
      .where(eq(menuItems.id, id));
  }

  // Admin user management
  async getAllAdminUsers(): Promise<User[]> {
    return await db.select().from(users).orderBy(users.createdAt);
  }

  async createAdminUser(userData: InsertUser): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const [user] = await db
      .insert(users)
      .values({
        ...userData,
        password: hashedPassword,
      })
      .returning();
    return user;
  }

  async updateAdminUser(id: number, userData: Partial<UpdateUser>): Promise<User> {
    const updateData: any = { ...userData };
    
    if (userData.password) {
      updateData.password = await bcrypt.hash(userData.password, 10);
    }
    
    updateData.updatedAt = new Date();
    
    const [user] = await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, id))
      .returning();
    return user;
  }

  async deleteAdminUser(id: number): Promise<void> {
    // First delete all sessions for this user to avoid foreign key constraint violation
    await db.delete(adminSessions).where(eq(adminSessions.userId, id));
    // Then delete the user
    await db.delete(users).where(eq(users.id, id));
  }

  // 2FA Management
  async enable2FA(userId: number, secret: string, backupCodes: string[]): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        twoFactorSecret: secret,
        twoFactorEnabled: true,
        backupCodes: backupCodes,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async disable2FA(userId: number): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        twoFactorSecret: null,
        twoFactorEnabled: false,
        backupCodes: null,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async updateBackupCodes(userId: number, backupCodes: string[]): Promise<User> {
    const [user] = await db
      .update(users)
      .set({
        backupCodes: backupCodes,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  async getExitIntentPopup(): Promise<ExitIntentPopup | undefined> {
    const [popup] = await db.select().from(exitIntentPopup).limit(1);
    return popup;
  }

  async updateExitIntentPopup(popupData: InsertExitIntentPopup): Promise<ExitIntentPopup> {
    // Check if popup exists
    const existing = await this.getExitIntentPopup();
    
    if (existing) {
      // Update existing popup
      const [popup] = await db
        .update(exitIntentPopup)
        .set({ ...popupData, updatedAt: new Date() })
        .where(eq(exitIntentPopup.id, existing.id))
        .returning();
      return popup;
    } else {
      // Create new popup
      const [popup] = await db
        .insert(exitIntentPopup)
        .values(popupData)
        .returning();
      return popup;
    }
  }

  async uploadMediaFile(fileData: InsertMediaFile): Promise<MediaFile> {
    const [file] = await db
      .insert(mediaFiles)
      .values(fileData)
      .returning();
    return file;
  }

  async getMediaFiles(): Promise<MediaFile[]> {
    return await db
      .select()
      .from(mediaFiles)
      .orderBy(desc(mediaFiles.uploadedAt));
  }

  async getMediaFileById(id: number): Promise<MediaFile | undefined> {
    const [file] = await db
      .select()
      .from(mediaFiles)
      .where(eq(mediaFiles.id, id));
    return file;
  }

  async updateMediaFile(id: number, fileData: Partial<InsertMediaFile>): Promise<MediaFile> {
    const [file] = await db
      .update(mediaFiles)
      .set({ ...fileData, updatedAt: new Date() })
      .where(eq(mediaFiles.id, id))
      .returning();
    return file;
  }

  async deleteMediaFile(id: number): Promise<void> {
    await db.delete(mediaFiles).where(eq(mediaFiles.id, id));
  }

  // Knowledge base category methods
  async getKnowledgeBaseCategories(): Promise<KnowledgeBaseCategory[]> {
    return await db.select().from(knowledgeBaseCategories).orderBy(knowledgeBaseCategories.orderIndex);
  }

  async createKnowledgeBaseCategory(categoryData: InsertKnowledgeBaseCategory): Promise<KnowledgeBaseCategory> {
    const [category] = await db
      .insert(knowledgeBaseCategories)
      .values(categoryData)
      .returning();
    return category;
  }

  async updateKnowledgeBaseCategory(id: number, categoryData: Partial<InsertKnowledgeBaseCategory>): Promise<KnowledgeBaseCategory> {
    const [category] = await db
      .update(knowledgeBaseCategories)
      .set({ ...categoryData, updatedAt: new Date() })
      .where(eq(knowledgeBaseCategories.id, id))
      .returning();
    return category;
  }

  async deleteKnowledgeBaseCategory(id: number): Promise<void> {
    // First delete all articles in this category
    await db.delete(knowledgeBaseArticles).where(eq(knowledgeBaseArticles.categoryId, id));
    // Then delete the category
    await db.delete(knowledgeBaseCategories).where(eq(knowledgeBaseCategories.id, id));
  }

  // Knowledge base article methods
  async getKnowledgeBaseArticles(): Promise<KnowledgeBaseArticle[]> {
    return await db.select().from(knowledgeBaseArticles).orderBy(knowledgeBaseArticles.orderIndex);
  }

  async getKnowledgeBaseArticlesByCategory(categoryId: number): Promise<KnowledgeBaseArticle[]> {
    return await db
      .select()
      .from(knowledgeBaseArticles)
      .where(eq(knowledgeBaseArticles.categoryId, categoryId))
      .orderBy(knowledgeBaseArticles.orderIndex);
  }

  async getKnowledgeBaseArticleBySlug(slug: string): Promise<KnowledgeBaseArticle | undefined> {
    const [article] = await db
      .select()
      .from(knowledgeBaseArticles)
      .where(eq(knowledgeBaseArticles.slug, slug));
    return article;
  }

  async createKnowledgeBaseArticle(articleData: InsertKnowledgeBaseArticle): Promise<KnowledgeBaseArticle> {
    const [article] = await db
      .insert(knowledgeBaseArticles)
      .values(articleData)
      .returning();
    return article;
  }

  async updateKnowledgeBaseArticle(id: number, articleData: Partial<InsertKnowledgeBaseArticle>): Promise<KnowledgeBaseArticle> {
    const [article] = await db
      .update(knowledgeBaseArticles)
      .set({ ...articleData, updatedAt: new Date() })
      .where(eq(knowledgeBaseArticles.id, id))
      .returning();
    return article;
  }

  async deleteKnowledgeBaseArticle(id: number): Promise<void> {
    await db.delete(knowledgeBaseArticles).where(eq(knowledgeBaseArticles.id, id));
  }

  async incrementKnowledgeBaseArticleViews(id: number): Promise<void> {
    await db
      .update(knowledgeBaseArticles)
      .set({ 
        viewCount: sql`view_count + 1`
      })
      .where(eq(knowledgeBaseArticles.id, id));
  }

  // Live chat management
  async createChatSession(sessionData: InsertChatSession): Promise<ChatSession> {
    const [session] = await db.insert(chatSessions).values(sessionData).returning();
    return session;
  }

  async getChatSession(sessionId: string): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.sessionId, sessionId));
    return session;
  }

  async getChatSessionById(id: number): Promise<ChatSession | undefined> {
    const [session] = await db.select().from(chatSessions).where(eq(chatSessions.id, id));
    return session;
  }

  async updateChatSession(id: number, sessionData: Partial<InsertChatSession>): Promise<ChatSession> {
    const [session] = await db.update(chatSessions)
      .set({ ...sessionData, updatedAt: new Date() })
      .where(eq(chatSessions.id, id))
      .returning();
    return session;
  }

  async getActiveChatSessions(): Promise<ChatSession[]> {
    return await db.select().from(chatSessions)
      .where(eq(chatSessions.status, "active"))
      .orderBy(desc(chatSessions.lastMessageAt));
  }

  async getAdminChatSessions(adminUserId: number): Promise<ChatSession[]> {
    return await db.select().from(chatSessions)
      .where(eq(chatSessions.adminUserId, adminUserId))
      .orderBy(desc(chatSessions.lastMessageAt));
  }

  async addChatMessage(messageData: InsertChatMessage): Promise<ChatMessage> {
    const [message] = await db.insert(chatMessages).values(messageData).returning();
    
    // Update session last message time
    await db.update(chatSessions)
      .set({ lastMessageAt: new Date() })
      .where(eq(chatSessions.id, messageData.sessionId));
    
    return message;
  }

  async getChatMessages(sessionId: number): Promise<ChatMessage[]> {
    return await db.select().from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(asc(chatMessages.createdAt));
  }

  async markMessagesAsRead(sessionId: number, sender: string): Promise<void> {
    await db.update(chatMessages)
      .set({ isRead: true })
      .where(and(
        eq(chatMessages.sessionId, sessionId),
        ne(chatMessages.sender, sender)
      ));
  }

  async getUnreadMessageCount(sessionId: number, sender: string): Promise<number> {
    const result = await db.select({ count: sql<number>`count(*)` })
      .from(chatMessages)
      .where(and(
        eq(chatMessages.sessionId, sessionId),
        ne(chatMessages.sender, sender),
        eq(chatMessages.isRead, false)
      ));
    return result[0]?.count || 0;
  }

  async getAdminChatSettings(userId: number): Promise<AdminChatSettings | undefined> {
    const [settings] = await db.select().from(adminChatSettings).where(eq(adminChatSettings.userId, userId));
    return settings;
  }

  async updateAdminChatSettings(userId: number, settingsData: Partial<InsertAdminChatSettings>): Promise<AdminChatSettings> {
    const existing = await this.getAdminChatSettings(userId);
    
    if (existing) {
      const [settings] = await db.update(adminChatSettings)
        .set({ ...settingsData, updatedAt: new Date() })
        .where(eq(adminChatSettings.userId, userId))
        .returning();
      return settings;
    } else {
      const [settings] = await db.insert(adminChatSettings)
        .values({ userId, ...settingsData })
        .returning();
      return settings;
    }
  }

  async getSecurityAlert(): Promise<SecurityAlert | undefined> {
    const [alert] = await db.select().from(securityAlerts).limit(1);
    return alert;
  }

  async updateSecurityAlert(alertData: Partial<InsertSecurityAlert>): Promise<SecurityAlert> {
    const existing = await this.getSecurityAlert();
    
    if (existing) {
      const [alert] = await db.update(securityAlerts)
        .set(alertData)
        .where(eq(securityAlerts.id, existing.id))
        .returning();
      return alert;
    } else {
      const [alert] = await db.insert(securityAlerts)
        .values(alertData)
        .returning();
      return alert;
    }
  }

  // Color palette management
  async getColorPalette(): Promise<ColorPalette[]> {
    return await db.select().from(colorPalette)
      .where(eq(colorPalette.isActive, true))
      .orderBy(asc(colorPalette.orderIndex), asc(colorPalette.name));
  }

  async createColorPaletteItem(color: InsertColorPalette): Promise<ColorPalette> {
    const [newColor] = await db.insert(colorPalette)
      .values(color)
      .returning();
    return newColor;
  }

  async updateColorPaletteItem(id: number, color: Partial<InsertColorPalette>): Promise<ColorPalette> {
    const [updatedColor] = await db.update(colorPalette)
      .set(color)
      .where(eq(colorPalette.id, id))
      .returning();
    return updatedColor;
  }

  async deleteColorPaletteItem(id: number): Promise<void> {
    await db.delete(colorPalette).where(eq(colorPalette.id, id));
  }

  // Service calculator management
  async getServiceCategories(): Promise<ServiceCategory[]> {
    return db.select().from(serviceCategories).orderBy(asc(serviceCategories.displayOrder));
  }

  async createServiceCategory(category: InsertServiceCategory): Promise<ServiceCategory> {
    const [newCategory] = await db.insert(serviceCategories).values(category).returning();
    return newCategory;
  }

  async updateServiceCategory(id: number, category: Partial<InsertServiceCategory>): Promise<ServiceCategory> {
    const [updatedCategory] = await db.update(serviceCategories)
      .set(category)
      .where(eq(serviceCategories.id, id))
      .returning();
    return updatedCategory;
  }

  async deleteServiceCategory(id: number): Promise<void> {
    await db.delete(serviceCategories).where(eq(serviceCategories.id, id));
  }

  async getServiceOptions(categoryId?: number): Promise<ServiceOption[]> {
    if (categoryId) {
      return db.select().from(serviceOptions)
        .where(eq(serviceOptions.categoryId, categoryId))
        .orderBy(asc(serviceOptions.displayOrder));
    }
    return db.select().from(serviceOptions).orderBy(asc(serviceOptions.displayOrder));
  }

  async createServiceOption(option: InsertServiceOption): Promise<ServiceOption> {
    const [newOption] = await db.insert(serviceOptions).values(option).returning();
    return newOption;
  }

  async updateServiceOption(id: number, option: Partial<InsertServiceOption>): Promise<ServiceOption> {
    const [updatedOption] = await db.update(serviceOptions)
      .set(option)
      .where(eq(serviceOptions.id, id))
      .returning();
    return updatedOption;
  }

  async deleteServiceOption(id: number): Promise<void> {
    await db.delete(serviceOptions).where(eq(serviceOptions.id, id));
  }

  async createPricingCalculation(calculation: InsertPricingCalculation): Promise<PricingCalculation> {
    const [newCalculation] = await db.insert(pricingCalculations).values(calculation).returning();
    return newCalculation;
  }

  async getPricingCalculations(): Promise<PricingCalculation[]> {
    return db.select().from(pricingCalculations).orderBy(desc(pricingCalculations.createdAt));
  }

  async updatePricingCalculation(id: number, calculation: Partial<InsertPricingCalculation>): Promise<PricingCalculation> {
    const [updatedCalculation] = await db.update(pricingCalculations)
      .set(calculation)
      .where(eq(pricingCalculations.id, id))
      .returning();
    return updatedCalculation;
  }

  // Static services management
  async getStaticServices(): Promise<StaticService[]> {
    return db.select().from(staticServices)
      .where(eq(staticServices.isActive, true))
      .orderBy(asc(staticServices.orderIndex));
  }

  async getStaticServiceById(id: number): Promise<StaticService | undefined> {
    const [service] = await db.select().from(staticServices)
      .where(eq(staticServices.id, id));
    return service;
  }

  async createStaticService(service: InsertStaticService): Promise<StaticService> {
    const [newService] = await db.insert(staticServices)
      .values(service)
      .returning();
    return newService;
  }

  async updateStaticService(id: number, service: Partial<InsertStaticService>): Promise<StaticService> {
    const [updatedService] = await db.update(staticServices)
      .set(service)
      .where(eq(staticServices.id, id))
      .returning();
    return updatedService;
  }

  async deleteStaticService(id: number): Promise<void> {
    await db.delete(staticServices).where(eq(staticServices.id, id));
  }

  async reorderStaticServices(serviceIds: number[]): Promise<void> {
    for (let i = 0; i < serviceIds.length; i++) {
      await db.update(staticServices)
        .set({ orderIndex: i })
        .where(eq(staticServices.id, serviceIds[i]));
    }
  }

  async clearStaticServices(): Promise<void> {
    await db.delete(staticServices);
  }

  // Country blocking management implementations
  async getCountryBlockingSettings(): Promise<CountryBlocking | undefined> {
    const [settings] = await db.select().from(countryBlocking).limit(1);
    return settings || undefined;
  }

  async updateCountryBlockingSettings(settings: InsertCountryBlocking): Promise<CountryBlocking> {
    // Check if settings exist
    const existing = await this.getCountryBlockingSettings();
    
    if (existing) {
      // Update existing settings
      const [updated] = await db.update(countryBlocking)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(countryBlocking.id, existing.id))
        .returning();
      return updated;
    } else {
      // Create new settings
      const [created] = await db.insert(countryBlocking)
        .values(settings)
        .returning();
      return created;
    }
  }

  async getBlockedCountries(): Promise<BlockedCountry[]> {
    return await db.select().from(blockedCountries).orderBy(asc(blockedCountries.countryName));
  }

  async addBlockedCountry(country: InsertBlockedCountry): Promise<BlockedCountry> {
    const [newCountry] = await db.insert(blockedCountries)
      .values(country)
      .returning();
    return newCountry;
  }

  async removeBlockedCountry(id: number): Promise<void> {
    await db.delete(blockedCountries).where(eq(blockedCountries.id, id));
  }
}

export const storage = new DatabaseStorage();
