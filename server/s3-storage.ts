import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
// Remove unused import for now
import fs from 'fs';
import path from 'path';

// Initialize S3 client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

// Clean bucket name - remove s3:// prefix and paths  
const getBucketName = (): string => {
  let bucketName = process.env.AWS_S3_BUCKET!;
  // Remove s3:// prefix if present
  bucketName = bucketName.replace(/^s3:\/\//, '');
  // Remove trailing slashes and paths - just get the bucket name
  bucketName = bucketName.split('/')[0];
  return bucketName;
};

const BUCKET_NAME = getBucketName();

export class S3StorageService {
  /**
   * Upload a file to S3 and return the S3 URL
   */
  static async uploadToS3(filePath: string, fileName: string): Promise<string> {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
      }

      const fileStream = fs.createReadStream(filePath);
      const key = `media/${fileName}`;

      const upload = new Upload({
        client: s3Client,
        params: {
          Bucket: BUCKET_NAME,
          Key: key,
          Body: fileStream,
          ContentType: S3StorageService.getContentType(fileName),
        },
      });

      const result = await upload.done();
      
      // Return the S3 URL
      return `https://${BUCKET_NAME}.s3.${process.env.AWS_REGION || 'us-east-1'}.amazonaws.com/${key}`;
    } catch (error) {
      console.error('S3 upload error:', error);
      throw error;
    }
  }

  /**
   * Download a file from S3 to local storage
   */
  static async downloadFromS3(s3Url: string, localPath: string): Promise<void> {
    try {
      // Extract key from S3 URL
      const url = new URL(s3Url);
      const key = url.pathname.substring(1); // Remove leading slash

      const command = new GetObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      const response = await s3Client.send(command);
      
      if (response.Body) {
        const chunks: Uint8Array[] = [];
        const stream = response.Body as any;
        
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        
        const buffer = Buffer.concat(chunks);
        
        // Ensure directory exists
        const dir = path.dirname(localPath);
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        
        fs.writeFileSync(localPath, buffer);
        console.log(`File restored from S3 to: ${localPath}`);
      }
    } catch (error) {
      console.error('S3 download error:', error);
      throw error;
    }
  }

  /**
   * Delete a file from S3
   */
  static async deleteFromS3(s3Url: string): Promise<void> {
    try {
      const url = new URL(s3Url);
      const key = url.pathname.substring(1);

      const command = new DeleteObjectCommand({
        Bucket: BUCKET_NAME,
        Key: key,
      });

      await s3Client.send(command);
      console.log(`File deleted from S3: ${key}`);
    } catch (error) {
      console.error('S3 delete error:', error);
      throw error;
    }
  }

  /**
   * Get content type based on file extension
   */
  private static getContentType(fileName: string): string {
    const ext = path.extname(fileName).toLowerCase();
    switch (ext) {
      case '.jpg':
      case '.jpeg':
        return 'image/jpeg';
      case '.png':
        return 'image/png';
      case '.gif':
        return 'image/gif';
      case '.webp':
        return 'image/webp';
      case '.svg':
        return 'image/svg+xml';
      default:
        return 'application/octet-stream';
    }
  }

  /**
   * Backup existing files to S3
   */
  static async backupExistingFiles(): Promise<void> {
    console.log('Starting backup of existing files to S3...');
    
    try {
      const uploadsDir = path.resolve('uploads');
      if (!fs.existsSync(uploadsDir)) {
        console.log('No uploads directory found, skipping backup.');
        return;
      }

      const files = fs.readdirSync(uploadsDir);
      const imageFiles = files.filter(file => 
        /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file)
      );

      console.log(`Found ${imageFiles.length} image files to backup`);

      for (const file of imageFiles) {
        try {
          const filePath = path.join(uploadsDir, file);
          const s3Url = await S3StorageService.uploadToS3(filePath, file);
          console.log(`Backed up: ${file} -> ${s3Url}`);
        } catch (error) {
          console.error(`Failed to backup ${file}:`, error);
        }
      }

      console.log('Backup completed successfully');
    } catch (error) {
      console.error('Backup process failed:', error);
    }
  }

  /**
   * Restore files from S3 if they're missing locally
   */
  static async restoreFromS3(s3Url: string, fileName: string): Promise<boolean> {
    try {
      const localPath = path.resolve('uploads', fileName);
      
      // Only restore if file doesn't exist locally
      if (fs.existsSync(localPath)) {
        return true;
      }

      await S3StorageService.downloadFromS3(s3Url, localPath);
      return true;
    } catch (error) {
      console.error(`Failed to restore file from S3: ${fileName}`, error);
      return false;
    }
  }
}