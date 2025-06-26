import { users, contacts, quickQuotes, type User, type InsertUser, type Contact, type InsertContact, type QuickQuote, type InsertQuickQuote } from "@shared/schema";
import { db } from "./db";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  createContact(contact: InsertContact): Promise<Contact>;
  createQuickQuote(quote: InsertQuickQuote): Promise<QuickQuote>;
  getContacts(): Promise<Contact[]>;
  getQuickQuotes(): Promise<QuickQuote[]>;
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
}

export const storage = new DatabaseStorage();
