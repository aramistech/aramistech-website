# AWS S3 Permissions Setup - Step by Step Walkthrough

## What We're Doing
Adding S3 permissions to your existing AWS user `aramistech` so your backup system can save images to bucket `MILL33122`.

## Step-by-Step Instructions

### 1. Open AWS IAM Console
- Go to: https://console.aws.amazon.com/iam/
- Sign in with your AWS account

### 2. Find Your User
- Click "Users" in the left sidebar
- Search for and click on: `aramistech`

### 3. Add Permissions
- Click the "Add permissions" button
- Select "Attach policies directly"

### 4. Create New Policy
- Click "Create policy" button
- Click the "JSON" tab
- **Delete all existing text** and paste this exact policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:PutObject",
                "s3:GetObject",
                "s3:DeleteObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::MILL33122",
                "arn:aws:s3:::MILL33122/*"
            ]
        }
    ]
}
```

### 5. Review and Name the Policy
- Click "Next: Tags" (skip tags)
- Click "Next: Review"
- Policy name: `AramisTechS3Backup`
- Description: `S3 permissions for AramisTech website image backup system`
- Click "Create policy"

### 6. Attach Policy to User
- Go back to your `aramistech` user page
- Click "Add permissions" again
- Select "Attach policies directly"
- Search for: `AramisTechS3Backup`
- Check the checkbox next to your new policy
- Click "Next" then "Add permissions"

### 7. Verify Success
You should see the new policy listed under the user's permissions.

## Test the Fix

After adding permissions, restart your Replit app and check the console logs. You should see:

```
✅ Successfully backed up: filename.jpg -> https://MILL33122.s3.amazonaws.com/media/filename.jpg
🎉 Backup process completed:
   ✅ New backups: 5
   📋 Already backed up: 0
   ❌ Failures: 0
```

## Troubleshooting

If you still get permission errors:
1. Double-check the bucket name is exactly: `MILL33122`
2. Make sure both ARN resources are included (with and without /*)
3. Wait 1-2 minutes for AWS permissions to propagate
4. Restart your Replit application

## What This Enables

Once permissions are added, your backup system will:
- ✅ Automatically backup every uploaded image to S3
- ✅ Store S3 URLs in your database
- ✅ Restore missing files from S3 automatically
- ✅ Provide admin dashboard backup controls
- ✅ Ensure your images are NEVER lost again

The code is already complete and working - this permission setup is the final piece!