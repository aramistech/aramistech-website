import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import type { Request, Response, NextFunction } from 'express';
import { storage } from './storage';

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateSessionId(): string {
  return crypto.randomBytes(32).toString('hex');
}

export async function createAdminSession(userId: number): Promise<string> {
  const sessionId = generateSessionId();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  
  await storage.createAdminSession(userId, sessionId, expiresAt);
  return sessionId;
}

export async function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const sessionId = req.cookies?.admin_session;
  
  if (!sessionId) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    const session = await storage.getAdminSession(sessionId);
    if (!session) {
      return res.status(401).json({ error: 'Invalid or expired session' });
    }

    // Add user info to request
    const user = await storage.getUser(session.userId);
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    (req as any).adminUser = user;
    (req as any).adminSession = session;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
}