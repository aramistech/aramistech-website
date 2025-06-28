# Media Library Integration Guide

## How to Use Media Library Images on Your Website

Your media library system provides several ways to use uploaded and scanned images throughout your AramisTech website:

### 1. Image Picker Component (For Admin Forms)

Use the `ImagePicker` component in any admin form to select images from your media library:

```tsx
import ImagePicker from '@/components/image-picker';

// In your component
const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

<ImagePicker
  value={selectedImageId}
  onChange={setSelectedImageId}
  label="Select Image"
/>
```

### 2. Media Gallery Component (For Displaying Images)

Use the `MediaGallery` component to display all your media library images:

```tsx
import MediaGallery from '@/components/media-gallery';

// Display all images in a grid
<MediaGallery />
```

### 3. Individual Image Display

To display a specific image from your media library, use the image URL:

```tsx
// Using image ID from media library
const imageUrl = `/api/admin/media/${imageId}/file`;

<img 
  src={imageUrl} 
  alt="Description"
  className="w-full h-auto rounded-lg"
/>
```

### 4. Background Images

Use media library images as background images:

```tsx
const backgroundStyle = {
  backgroundImage: `url(/api/admin/media/${imageId}/file)`,
  backgroundSize: 'cover',
  backgroundPosition: 'center'
};

<div style={backgroundStyle} className="h-64 w-full">
  Content here
</div>
```

## Common Integration Examples

### Exit Intent Popup
The exit intent popup already uses the ImagePicker component to select images from your media library.

### Hero Sections
Replace static images with dynamic media library images:

```tsx
// Before (static)
<img src="/static-hero.jpg" alt="Hero" />

// After (dynamic from media library)
<img src={`/api/admin/media/${heroImageId}/file`} alt="Hero" />
```

### Service Cards
Add images to service cards using media library:

```tsx
const serviceImage = `/api/admin/media/${serviceImageId}/file`;

<Card>
  <img src={serviceImage} alt="Service" className="w-full h-48 object-cover" />
  <CardContent>
    <h3>Service Title</h3>
    <p>Service description</p>
  </CardContent>
</Card>
```

### Team Member Photos
Use media library for team member photos:

```tsx
<div className="team-member">
  <img 
    src={`/api/admin/media/${memberPhotoId}/file`}
    alt={memberName}
    className="w-32 h-32 rounded-full object-cover"
  />
  <h4>{memberName}</h4>
  <p>{memberRole}</p>
</div>
```

## Best Practices

1. **Always use responsive images**: Add appropriate CSS classes for different screen sizes
2. **Include alt text**: Provide descriptive alt text for accessibility
3. **Optimize loading**: Use lazy loading for images below the fold
4. **Handle errors**: Add fallback images in case media library images fail to load

## Admin Workflow

1. **Upload/Scan Images**: Use the Media Library tab in admin dashboard
2. **Organize Images**: View and manage all images in the Gallery tab
3. **Select Images**: Use ImagePicker component in forms to choose specific images
4. **Update Website**: Images automatically appear on the website using the selected IDs

## Technical Notes

- All media library images are served through `/api/admin/media/{id}/file`
- Images are stored securely and only accessible through proper authentication
- The system supports drag-and-drop upload, URL import, and website scanning
- Images are automatically optimized and validated during upload