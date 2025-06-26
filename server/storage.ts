import { users, contacts, quickQuotes, reviews, menuItems, adminSessions, type User, type InsertUser, type Contact, type InsertContact, type QuickQuote, type InsertQuickQuote, type Review, type InsertReview, type MenuItem, type InsertMenuItem, type AdminSession } from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, isNull, gt } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContact): Promise<Contact>;
  createQuickQuote(quote: InsertQuickQuote): Promise<QuickQuote>;
  getContacts(): Promise<Contact[]>;
  getQuickQuotes(): Promise<QuickQuote[]>;
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
    const [updatedMenuItem] = await db
      .update(menuItems)
      .set({
        ...menuItemData,
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
}

export const storage = new DatabaseStorage();
