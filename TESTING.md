# Manual Test Plan: S3 Upload and Gallery

## Prerequisites
- Docker and Docker Compose installed
- Node.js v24 and Bun installed
- Project dependencies installed (`bun install` or `npm install`)

## Setup

1. **Start MinIO:**
   ```bash
   docker compose up -d
   ```

2. **Verify MinIO is running:**
   - Access MinIO Console: http://localhost:9001
   - Login: minioadmin / minioadmin
   - Verify `uploads` bucket exists

3. **Configure environment:**
   ```bash
   cp .env.example .env.local
   # Ensure S3 variables are set for MinIO
   ```

4. **Start development server:**
   ```bash
   npm run dev
   ```

## Test Cases

### TC1: Upload Single Image
**Steps:**
1. Navigate to http://localhost:3000/gallery
2. Click the upload area or drag an image file
3. Select/drop a PNG, JPEG, or WebP image (<10MB)
4. Wait for upload to complete

**Expected Results:**
- ✓ Upload spinner displays during upload
- ✓ Upload completes without errors
- ✓ Image appears in "Uploaded Files" list
- ✓ Image displays with correct dimensions (e.g., "1920 × 1080")
- ✓ "View" button opens image in new tab

**Verification:**
- Check MinIO Console: http://localhost:9001
- Navigate to `uploads` bucket
- Verify image file exists with timestamp prefix
- Click file → Metadata tab
- Verify `x-amz-meta-width` and `x-amz-meta-height` are present

### TC2: Upload Multiple Images
**Steps:**
1. Navigate to gallery page
2. Select multiple images at once (2-5 images)
3. Wait for all uploads to complete

**Expected Results:**
- ✓ All images upload successfully
- ✓ Each image appears in uploaded files list
- ✓ Dimensions shown for each image
- ✓ Gallery grid displays all images

### TC3: Drag and Drop Upload
**Steps:**
1. Navigate to gallery page
2. Drag image file from file explorer
3. Drop onto upload area

**Expected Results:**
- ✓ Upload area highlights during drag-over
- ✓ Image uploads on drop
- ✓ Same behavior as click-to-upload

### TC4: File Validation - Invalid Type
**Steps:**
1. Navigate to gallery page
2. Attempt to upload a PDF or text file

**Expected Results:**
- ✓ Error message displays
- ✓ Message indicates file type not supported
- ✓ Lists allowed types: PNG, JPG, GIF, WebP

### TC5: File Validation - Size Limit
**Steps:**
1. Navigate to gallery page
2. Attempt to upload an image >10MB

**Expected Results:**
- ✓ Error message displays
- ✓ Message indicates file exceeds 10MB limit
- ✓ Upload does not proceed

### TC6: Gallery Display with Metadata
**Steps:**
1. Upload 3-5 images of different sizes
2. Refresh the gallery page
3. Observe image display

**Expected Results:**
- ✓ All uploaded images appear in gallery grid
- ✓ Each image shows correct filename
- ✓ Dimensions displayed below each image
- ✓ File size displayed in KB
- ✓ Images use next/image component (responsive)
- ✓ Images load properly from S3

### TC7: Image Preview Before Upload
**Steps:**
1. Navigate to gallery page
2. Select an image file
3. Observe preview before upload completes

**Expected Results:**
- ✓ Image preview displays in upload area
- ✓ Preview clears after upload completes

### TC8: Filename Sanitization
**Steps:**
1. Create a file with special characters: `test../../../file.png`
2. Upload the file
3. Check MinIO bucket

**Expected Results:**
- ✓ Filename sanitized to `test_____file.png`
- ✓ No directory traversal occurs
- ✓ File stored in bucket root with timestamp prefix

### TC9: Navigation
**Steps:**
1. Navigate to home page (http://localhost:3000)
2. Click "Gallery" link in header
3. From gallery, click "← Back to Home"

**Expected Results:**
- ✓ Navigation between pages works
- ✓ Gallery link visible in home page header
- ✓ Back link works from gallery

### TC10: Error Recovery
**Steps:**
1. Stop MinIO: `docker compose stop minio`
2. Attempt to upload an image
3. Restart MinIO: `docker compose start minio`
4. Upload an image again

**Expected Results:**
- ✓ Upload fails with error message when MinIO down
- ✓ Error message is user-friendly
- ✓ Upload succeeds after MinIO restart

## Cloudflare R2 Configuration Test

### Setup R2
1. Update `.env.local`:
   ```env
   S3_ENDPOINT=https://<account-id>.r2.cloudflarestorage.com
   S3_REGION=auto
   S3_ACCESS_KEY_ID=<r2-access-key>
   S3_SECRET_ACCESS_KEY=<r2-secret-key>
   S3_BUCKET_NAME=<r2-bucket-name>
   S3_PUBLIC_URL=https://<r2-public-domain>
   ```
2. Update `next.config.js` with R2 domain pattern
3. Restart dev server

### Test
- Repeat TC1, TC2, TC6
- Verify images uploaded to R2
- Verify metadata stored in R2
- Verify gallery displays R2 images

## Hetzner S3 Configuration Test

### Setup Hetzner
1. Update `.env.local`:
   ```env
   S3_ENDPOINT=https://<region>.your-objectstorage.com
   S3_REGION=<region>
   S3_ACCESS_KEY_ID=<hetzner-access-key>
   S3_SECRET_ACCESS_KEY=<hetzner-secret-key>
   S3_BUCKET_NAME=<bucket-name>
   S3_PUBLIC_URL=https://<region>.your-objectstorage.com
   ```
2. Update `next.config.js` with Hetzner domain pattern
3. Restart dev server

### Test
- Repeat TC1, TC2, TC6
- Verify images uploaded to Hetzner
- Verify metadata stored
- Verify gallery displays images

## Performance Test

### Large File Upload
1. Upload 5MB image
2. Upload 9.9MB image
3. Observe upload time

**Expected:**
- ✓ No UI freezing during upload
- ✓ Spinner shows while uploading
- ✓ Upload completes successfully

### Multiple Concurrent Uploads
1. Select 10 images at once
2. Wait for all to upload

**Expected:**
- ✓ All images upload successfully
- ✓ No race conditions
- ✓ Gallery displays all images

## Security Verification

### Credentials Not Exposed
1. Open browser DevTools → Network tab
2. Upload an image
3. Inspect request/response

**Expected:**
- ✓ S3 credentials not in client-side code
- ✓ Upload handled by server action
- ✓ No S3 secrets in browser

### Filename Sanitization
Already tested in TC8

### File Type Validation
Already tested in TC4

### File Size Validation
Already tested in TC5

## Test Report Summary

Total Test Cases: 10 core + 2 provider configs + 2 performance + 4 security
Pass Criteria: All core functionality working, no security issues

---

**Testing Notes:**
- All tests assume local MinIO setup unless testing specific providers
- For production testing, use actual R2/Hetzner accounts
- Monitor S3 API rate limits during concurrent upload tests
- Check browser console for any client-side errors
- Check server logs for any server-side errors
