# Media Library File Persistence Issue - AramisTech

## Problem Description

**Issue**: Images uploaded to the media library work for a few days, then disappear while thumbnails remain visible in the admin interface. When clicking "Edit Image Details", the image shows as broken/missing.

**Root Cause**: Replit's ephemeral file system automatically deletes files from the `uploads/` directory during:
- Container restarts
- Deployments  
- Extended periods of inactivity
- Memory/storage cleanup operations

This creates a mismatch where database records exist but actual files are missing from disk.

## Technical Details

### File Storage Architecture
- **Database**: PostgreSQL stores image metadata (filename, path, size, etc.)
- **File System**: Physical files stored in `/home/runner/workspace/uploads/`
- **Issue**: Database persists but files get deleted by Replit's system

### Filename Generation
- **Regular uploads**: `file-{timestamp}-{random}.extension` (e.g., `file-1752855867901-852525657.png`)
- **URL imports**: Original filenames preserved (e.g., `google-review-qr-code.png`)

## Implemented Solution

### 1. Enhanced Error Handling
```javascript
// Better error messages when files are missing
if (!fs.existsSync(file.filePath)) {
  return res.status(404).json({ 
    error: "File not found on disk",
    fileId: id,
    fileName: file.originalName,
    message: "File was uploaded but has been removed from storage..."
  });
}
```

### 2. File Status Checking
```javascript
// Check file existence when listing media
const filesWithStatus = files.map(file => ({
  ...file,
  fileExists: fs.existsSync(file.filePath)
}));
```

### 3. Cleanup API Endpoint
**Endpoint**: `POST /api/admin/media/cleanup`
- Scans all database records
- Identifies missing files
- Removes orphaned database entries
- Returns cleanup summary

### 4. Admin Interface Enhancement
- Added "Cleanup Missing" button in Media Library
- One-click sync between database and filesystem
- Real-time status feedback

## Usage Instructions

### For Admins
1. **Access Media Library**: Admin Dashboard → Media Library
2. **Identify Issues**: Broken thumbnails indicate missing files
3. **Run Cleanup**: Click "Cleanup Missing" button to sync database
4. **Re-upload**: Upload important images again as needed

### Prevention Strategies
1. **Use URL Import**: Import from external URLs when possible (more stable)
2. **Keep Backups**: Save important images externally
3. **Regular Cleanup**: Run cleanup periodically to maintain database accuracy
4. **Monitor Uploads**: Check recent uploads work before relying on them

## Technical Implementation

### Files Modified
- `server/routes.ts`: Enhanced file serving and cleanup endpoint
- `client/src/components/media-library.tsx`: Added cleanup button and status checking
- Error handling improved across all media endpoints

### Database Impact
- No schema changes required
- Cleanup removes only orphaned records
- Original upload functionality unchanged

## Future Considerations

### Potential Solutions
1. **External Storage**: AWS S3, Cloudinary, or similar services
2. **Database Storage**: Store images as binary data (not recommended for large files)
3. **Hybrid Approach**: Critical images in external storage, temporary ones local

### Monitoring
- Server logs show file access attempts
- 404 errors indicate missing files
- Cleanup reports show how many files were removed

## User Impact

### Before Fix
- Broken image thumbnails
- Confusing "image not found" errors
- Database bloated with dead records

### After Fix
- Clear error messages explaining the issue
- Easy cleanup functionality
- Better understanding of file persistence limitations

## Conclusion

This solution provides a robust way to handle Replit's file system limitations while maintaining a clean media library. The cleanup functionality ensures database accuracy, and enhanced error messages help users understand when files go missing.

The issue is inherent to Replit's architecture and affects all file-based storage. This solution provides the best possible experience within those constraints.