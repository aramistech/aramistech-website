import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import crypto from 'crypto';

interface TwoFactorSetup {
  secret: string;
  qrCodeUrl: string;
  backupCodes: string[];
}

export class TwoFactorAuthService {
  private static readonly APP_NAME = 'AramisTech Admin';
  private static readonly ISSUER = 'AramisTech';

  /**
   * Generate a new 2FA secret and QR code for user setup
   */
  static async generateSetup(username: string): Promise<TwoFactorSetup> {
    // Generate a secret key
    const secret = authenticator.generateSecret();
    
    // Create the service name for the authenticator app
    const serviceName = `${this.APP_NAME} (${username})`;
    
    // Generate the otpauth URL
    const otpAuthUrl = authenticator.keyuri(username, this.ISSUER, secret);
    
    // Generate QR code
    const qrCodeUrl = await QRCode.toDataURL(otpAuthUrl);
    
    // Generate backup codes
    const backupCodes = this.generateBackupCodes();
    
    return {
      secret,
      qrCodeUrl,
      backupCodes
    };
  }

  /**
   * Verify a TOTP token
   */
  static verifyToken(token: string, secret: string): boolean {
    try {
      return authenticator.verify({ token, secret });
    } catch (error) {
      console.error('2FA token verification error:', error);
      return false;
    }
  }

  /**
   * Verify a backup code
   */
  static verifyBackupCode(code: string, backupCodes: string[]): boolean {
    return backupCodes.includes(code);
  }

  /**
   * Remove a used backup code from the array
   */
  static removeBackupCode(code: string, backupCodes: string[]): string[] {
    return backupCodes.filter(backupCode => backupCode !== code);
  }

  /**
   * Generate 10 backup codes
   */
  private static generateBackupCodes(): string[] {
    const codes: string[] = [];
    
    for (let i = 0; i < 10; i++) {
      // Generate 8-character alphanumeric codes
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(code);
    }
    
    return codes;
  }

  /**
   * Generate new backup codes (for regeneration)
   */
  static generateNewBackupCodes(): string[] {
    return this.generateBackupCodes();
  }

  /**
   * Check if a code format is valid (6 digits for TOTP, 8 chars for backup)
   */
  static isValidCodeFormat(code: string): { isTotp: boolean; isBackup: boolean } {
    const totpPattern = /^\d{6}$/;
    const backupPattern = /^[A-F0-9]{8}$/i;
    
    return {
      isTotp: totpPattern.test(code),
      isBackup: backupPattern.test(code)
    };
  }
}