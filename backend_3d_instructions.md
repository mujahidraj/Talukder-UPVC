# Backend Instructions for 3D Model Support

The frontend has been successfully updated to support 3D model previews (`.glb`, `.gltf`) using `@google/model-viewer`. 

However, the backend API currently rejects these files and would crash if it attempted to process them as standard 2D images. Please implement the following changes in the NestJS backend to fully support 3D models.

## 1. Update `media.controller.ts` (File Type Validation)
The upload endpoint strictly validates against a regex for 2D images. You must update this to also allow 3D model mime types and extensions.

**Target File**: `server/src/modules/media/media.controller.ts`
**Current Regex**: `/^image\/(jpg|jpeg|png|webp|gif)$/`
**Action Required**:
Update the mime type validation to allow `model/gltf-binary`, `model/gltf+json`, and `application/octet-stream` (some browsers send GLB files as octet-stream). 
Alternatively, validate by file extension:
```typescript
const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'model/gltf-binary', 'model/gltf+json', 'application/octet-stream'];
if (!allowedMimeTypes.includes(file.mimetype) && !file.originalname.match(/\.(glb|gltf)$/i)) {
  return cb(new BadRequestException('Only images and 3D models (GLB/GLTF) are allowed'), false);
}
```

## 2. Update `media.service.ts` (Bypass Image Processing)
The service currently assumes all uploads are 2D images and passes them to `sharp()` to generate cropped variants and thumbnails. **This will crash if passed a 3D model.**

**Target File**: `server/src/modules/media/media.service.ts`
**Action Required**:
Before generating thumbnails, check if the file is a 3D model. If it is, skip all `sharp` processing and simply save the original file as the "fullPath" and "thumbPath".

```typescript
const is3DModel = file.originalname.match(/\.(glb|gltf)$/i) || file.mimetype.startsWith('model/');

if (is3DModel) {
  // 1. Just write the file buffer directly to disk (e.g. into the fullPath)
  fs.writeFileSync(fullPath, file.buffer);
  
  // 2. Return the paths directly without creating thumbnails
  return {
    fullPath: \`/uploads/products/\${fileName}\`,
    thumbPath: \`/uploads/products/\${fileName}\`, // Fallback to original path
    fileName,
    originalName: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
  };
} else {
  // Keep the existing sharp() logic here for standard images
}
```

## 3. Verify
After implementing these changes, start the backend server and ensure that uploading a `.glb` file via the admin panel successfully returns the file paths without throwing a Sharp-related error.
