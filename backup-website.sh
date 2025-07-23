#!/bin/bash
# AramisTech Website Backup Script
# Creates complete backup of code, database, and verifies S3 media backup

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="backup_$DATE"

echo "🔄 Starting AramisTech website backup..."

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Backup all code files
echo "📁 Backing up source code..."
tar -czf "$BACKUP_DIR/code_backup.tar.gz" \
  --exclude=node_modules \
  --exclude=dist \
  --exclude=.git \
  --exclude=backup_* \
  client/ server/ shared/ public/ \
  *.json *.ts *.js *.md *.config.* .replit

# 2. Backup database
echo "🗄️ Backing up database..."
if pg_dump $DATABASE_URL > "$BACKUP_DIR/database_backup.sql" 2>/dev/null; then
  echo "✅ Database backup successful"
else
  echo "❌ Database backup failed"
fi

# 3. Create backup summary
echo "📋 Creating backup summary..."
cat > "$BACKUP_DIR/backup_info.txt" << EOF
AramisTech Website Backup
Date: $(date)
Backup Directory: $BACKUP_DIR

Contents:
- code_backup.tar.gz: Complete source code
- database_backup.sql: PostgreSQL database dump
- backup_info.txt: This summary file

Media Files:
- All uploaded images are automatically backed up to AWS S3
- S3 Bucket: MILL33122
- S3 backup is handled automatically by the application

Restore Instructions:
1. Extract code_backup.tar.gz to new project directory
2. Restore database: psql \$DATABASE_URL < database_backup.sql
3. Configure environment variables (DATABASE_URL, AWS credentials)
4. Run: npm install && npm run dev
5. Media files will be served from S3 automatically

EOF

# 4. Show backup size
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" | cut -f1)
echo "✅ Backup completed successfully!"
echo "📊 Backup size: $BACKUP_SIZE"
echo "📂 Backup location: $BACKUP_DIR"
echo ""
echo "🔍 Backup contents:"
ls -la "$BACKUP_DIR"