import { storage } from './storage';
import { S3StorageService } from './s3-storage';
import fs from 'fs';
import path from 'path';

export class MediaBackupService {
  /**
   * Comprehensive backup service that ensures NO images are ever lost
   */
  static async backupAllExistingFiles(): Promise<void> {
    try {
      console.log("🔄 Starting comprehensive media backup process...");
      
      // Get all media files from database
      const mediaFiles = await storage.getMediaFiles();
      console.log(`📁 Found ${mediaFiles.length} media files in database`);
      
      let backupCount = 0;
      let alreadyBackedUp = 0;
      let failures = 0;
      
      for (const file of mediaFiles) {
        try {
          // Skip if already backed up
          if (file.isBackedUp && file.s3Url) {
            alreadyBackedUp++;
            continue;
          }
          
          // Check if file exists locally
          if (fs.existsSync(file.filePath)) {
            console.log(`☁️ Backing up: ${file.originalName}`);
            
            // Backup to S3
            const s3Url = await S3StorageService.uploadToS3(file.filePath, file.fileName);
            
            // Update database with S3 info
            await storage.updateMediaFile(file.id, {
              s3Url,
              isBackedUp: true
            });
            
            backupCount++;
            console.log(`✅ Successfully backed up: ${file.originalName} -> ${s3Url}`);
          } else {
            console.warn(`⚠️ File missing from disk: ${file.originalName} (${file.filePath})`);
            failures++;
          }
        } catch (error) {
          console.error(`❌ Failed to backup ${file.originalName}:`, error);
          failures++;
        }
      }
      
      console.log(`🎉 Backup process completed:`);
      console.log(`   ✅ New backups: ${backupCount}`);
      console.log(`   📋 Already backed up: ${alreadyBackedUp}`);
      console.log(`   ❌ Failures: ${failures}`);
      console.log(`   🛡️  Total protected files: ${backupCount + alreadyBackedUp}`);
      
    } catch (error) {
      console.error("💥 Backup process failed:", error);
      throw error;
    }
  }
  
  /**
   * Restore missing files from S3 backup
   */
  static async restoreMissingFiles(): Promise<void> {
    try {
      console.log("🔄 Starting file restoration process...");
      
      const mediaFiles = await storage.getMediaFiles();
      let restored = 0;
      let missing = 0;
      
      for (const file of mediaFiles) {
        if (!fs.existsSync(file.filePath) && file.s3Url && file.isBackedUp) {
          console.log(`📥 Restoring: ${file.originalName}`);
          
          try {
            const success = await S3StorageService.restoreFromS3(file.s3Url, file.fileName);
            if (success) {
              restored++;
              console.log(`✅ Restored: ${file.originalName}`);
            } else {
              missing++;
            }
          } catch (error) {
            console.error(`❌ Failed to restore ${file.originalName}:`, error);
            missing++;
          }
        }
      }
      
      console.log(`🎉 Restoration completed:`);
      console.log(`   ✅ Files restored: ${restored}`);
      console.log(`   ❌ Could not restore: ${missing}`);
      
    } catch (error) {
      console.error("💥 Restoration process failed:", error);
      throw error;
    }
  }
  
  /**
   * Health check for backup system
   */
  static async checkBackupHealth(): Promise<{
    totalFiles: number;
    backedUp: number;
    notBackedUp: number;
    missingLocal: number;
    healthScore: number;
  }> {
    const mediaFiles = await storage.getMediaFiles();
    
    let backedUp = 0;
    let missingLocal = 0;
    
    for (const file of mediaFiles) {
      if (file.isBackedUp && file.s3Url) {
        backedUp++;
      }
      if (!fs.existsSync(file.filePath)) {
        missingLocal++;
      }
    }
    
    const notBackedUp = mediaFiles.length - backedUp;
    const healthScore = Math.round((backedUp / mediaFiles.length) * 100) || 0;
    
    return {
      totalFiles: mediaFiles.length,
      backedUp,
      notBackedUp,
      missingLocal,
      healthScore
    };
  }
}